/**
 * Puts the pinned FFmpeg build for a target into video/local/ffmpeg-for-app/<target>: ffmpeg, ffprobe, COPYING.GPLv3
 * and BUILD.txt, which scripts/package.ts carries into the app. A build is accepted only with the SHA-256 pinned in
 * ffmpeg/builds.json: one already built on this machine (local/ffmpeg-build/out, from ffmpeg/build.sh) or the one
 * published on this repo's release.
 *
 *   pnpm ffmpeg <mac-arm64|mac-x64|win-x64|linux-x64>
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TARGETS, type Target } from "../electron/targets.ts";
import { appFolder } from "./start.ts";

const video = path.resolve(appFolder, "..");
const REPO = "hubnx/video";

interface Builds {
  version: string;
  release: string;
  sha256: Partial<Record<Target, string>>;
}

export async function readBuilds(): Promise<Builds> {
  return JSON.parse(await readFile(path.join(video, "ffmpeg", "builds.json"), "utf8")) as Builds;
}

export function archiveName(version: string, target: Target): string {
  return `ffmpeg-${version}-${target}.tar.xz`;
}

/** The folder the target's FFmpeg is in, fetched and unpacked if it isn't there at the pinned build already. */
export async function fetchFfmpeg(target: Target): Promise<string> {
  const builds = await readBuilds();
  const pinned = builds.sha256[target];
  if (!pinned) throw new Error(`FFMPEG_UNPINNED: no ${target} build is pinned in ffmpeg/builds.json; build it with ffmpeg/build.sh and pin its SHA-256`);
  const folder = path.join(video, "local", "ffmpeg-for-app", target);
  const stamp = path.join(folder, "sha256.txt");
  if (existsSync(stamp) && (await readFile(stamp, "utf8")) === pinned) return folder;

  const name = archiveName(builds.version, target);
  const built = path.join(video, "local", "ffmpeg-build", "out", name);
  const downloads = path.join(video, "local", "ffmpeg-build", "downloads");
  let archive = built;
  if (!existsSync(built) || sha256(await readFile(built)) !== pinned) {
    // The repo's release: through gh while the repo is private (its token reads the release), as GitHub's machines do.
    await mkdir(downloads, { recursive: true });
    execFileSync("gh", ["release", "download", builds.release, "-R", REPO, "-p", name, "-D", downloads, "--clobber"], { stdio: "inherit" });
    archive = path.join(downloads, name);
  }
  const actual = sha256(await readFile(archive));
  if (actual !== pinned) throw new Error(`FFMPEG_MISMATCH: ${name} has SHA-256 ${actual}, ffmpeg/builds.json pins ${pinned}`);

  await rm(folder, { recursive: true, force: true }); // each run replaces its own folder: old and new never mix
  await mkdir(folder, { recursive: true });
  execFileSync("tar", ["-xJf", archive, "-C", folder]);
  await writeFile(stamp, pinned);
  return folder;
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const target = process.argv[2] as Target;
  if (!TARGETS.includes(target)) throw new Error(`pnpm ffmpeg ${TARGETS.join(" | ")}`);
  console.log(`FFmpeg for ${target}: ${await fetchFfmpeg(target)}`);
}
