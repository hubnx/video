/**
 * The FFmpeg the app carries (../ffmpeg/build.sh): what it is, and whether the encoders the app relies on are in it.
 * The package check asks this through the window, which proves FFmpeg runs from inside the installed app.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { FFMPEG_ENCODERS, type FfmpegEncoder, type FfmpegFound } from "../src/shared/app-api.ts";
import { logError } from "./app-log.ts";

const run = promisify(execFile);

export async function findFfmpeg(program: string): Promise<FfmpegFound | null> {
  try {
    const options = { timeout: 10_000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 };
    const version = (await run(program, ["-hide_banner", "-version"], options)).stdout.split("\n")[0]?.trim() ?? "";
    return { version, encoders: encodersIn((await run(program, ["-hide_banner", "-encoders"], options)).stdout) };
  } catch (error) {
    logError("ffmpeg_not_running", program, error);
    return null;
  }
}

/** Which of the app's encoders `ffmpeg -encoders` lists: one a line, " A..... aac   AAC (Advanced Audio Coding)". */
export function encodersIn(listing: string): Record<FfmpegEncoder, boolean> {
  const listed = new Set(listing.split("\n").map((line) => line.trim().split(/\s+/)[1]).filter(Boolean));
  return Object.fromEntries(FFMPEG_ENCODERS.map((encoder) => [encoder, listed.has(encoder)])) as Record<FfmpegEncoder, boolean>;
}
