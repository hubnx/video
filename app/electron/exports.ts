/**
 * Exports, from the main process's side: the window encodes the picture (src/export/export-video.ts) and streams the MP4
 * here a piece at a time, each written at its place in a file beside the destination; then FFmpeg adds the sound and
 * writes the final file (export-sound.ts), and the captions file beside it when asked. Nothing appears at the
 * destination until it's whole: a cancelled or failed export leaves no half-file behind.
 */
import { spawn } from "node:child_process";
import { open, rename, rm, writeFile, type FileHandle } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import { errorName, logError } from "./app-log.ts";
import { muxArguments, soundFilter, type SoundPlan } from "./export-sound.ts";

interface Session {
  destination: string;
  video: string; // the window's MP4, picture only
  handle: FileHandle;
  cancelled: boolean;
  child: ReturnType<typeof spawn> | null;
}

export class Exports {
  private readonly sessions = new Map<number, Session>();
  private next = 1;
  private readonly ffmpeg: string;

  constructor(ffmpeg: string) {
    this.ffmpeg = ffmpeg;
  }

  /** Starts an export to `destination` (chosen by the person); returns its number. */
  async begin(destination: string): Promise<number> {
    const video = `${destination}.picture.mp4`;
    const handle = await open(video, "w");
    const id = this.next++;
    this.sessions.set(id, { destination, video, handle, cancelled: false, child: null });
    return id;
  }

  /** A piece of the window's MP4, at its place in the file (the MP4's index is written last, near the start). */
  async write(id: number, position: number, data: Uint8Array): Promise<void> {
    const session = this.session(id);
    await session.handle.write(data, 0, data.length, position);
  }

  /** Adds the sound and writes the destination; `progress` hears how far FFmpeg has got. */
  async finish(id: number, plan: SoundPlan, durationSeconds: number, captions: string | null, progress: (fraction: number) => void): Promise<void> {
    const session = this.session(id);
    await session.handle.close();
    const filter = `${session.destination}.sound-filter.txt`;
    const writing = `${session.destination.slice(0, -path.extname(session.destination).length)}.writing${path.extname(session.destination)}`;
    try {
      await writeFile(filter, soundFilter(plan));
      const code = await new Promise<number | null>((resolve) => {
        const child = spawn(this.ffmpeg, muxArguments(session.video, plan, filter, writing, process.platform), { windowsHide: true });
        session.child = child;
        const log: string[] = [];
        child.stderr.on("data", (chunk: Buffer) => log.push(chunk.toString()));
        readline.createInterface({ input: child.stdout }).on("line", (line) => {
          const reached = /^out_time_us=(\d+)$/.exec(line);
          if (reached && durationSeconds > 0) progress(Math.min(1, Number(reached[1]) / 1e6 / durationSeconds));
        });
        child.on("error", (error) => {
          logError("export_mux_failed_to_start", errorName(error));
          resolve(null);
        });
        child.on("close", (exit) => {
          if (exit !== 0 && !session.cancelled) logError("export_mux_failed", `exit ${exit}`, log.join("").split("\n").filter(Boolean).slice(-3).join(" | ").slice(0, 400));
          resolve(exit);
        });
      });
      if (session.cancelled) throw new Error("EXPORT_CANCELLED");
      if (code !== 0) throw new Error("EXPORT_MUX_FAILED");
      await rename(writing, session.destination);
      if (captions !== null) await writeFile(session.destination.replace(/\.[^.]+$/, ".srt"), captions);
    } finally {
      await rm(writing, { force: true });
      await rm(filter, { force: true });
      await rm(session.video, { force: true });
      this.sessions.delete(id);
    }
  }

  /** Stops an export and removes what it wrote so far. */
  async cancel(id: number): Promise<void> {
    const session = this.sessions.get(id);
    if (!session) return;
    session.cancelled = true;
    session.child?.kill();
    if (!session.child) {
      await session.handle.close().catch(() => undefined);
      await rm(session.video, { force: true });
      this.sessions.delete(id);
    }
  }

  private session(id: number): Session {
    const session = this.sessions.get(id);
    if (!session || session.cancelled) throw new Error(`no export ${id} under way`);
    return session;
  }
}
