/**
 * Runs FFmpeg's jobs for the clips, one at a time, below the computer's normal priority, so the person's editing and
 * everything else they run stay smooth. Each job writes beside its file and renames it into place only once FFmpeg
 * finishes, so a job stopped or failed never leaves half a file that would later read as made. A file already made
 * (the same clip opened again) is done at once.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { createWriteStream, existsSync } from "node:fs";
import { mkdir, rename, rm } from "node:fs/promises";
import { constants, setPriority } from "node:os";
import path from "node:path";
import readline from "node:readline";
import type { JobKind, JobProgress } from "../src/shared/media.ts";
import { errorName, logError } from "./app-log.ts";

export interface Job {
  clipId: string;
  kind: JobKind;
  /** FFmpeg's arguments, writing to `writing`; the runner renames it to `output` when FFmpeg succeeds. */
  arguments: string[];
  writing: string;
  output: string;
  /** How long the clip is, for the fraction done (FFmpeg reports the time it has reached). */
  durationSeconds: number;
}

/** `writing` for an output: beside it, keeping its extension, which FFmpeg reads the format from. */
export function writingPath(output: string): string {
  const extension = path.extname(output);
  return `${output.slice(0, -extension.length)}.writing${extension}`;
}

export class JobRunner {
  private readonly waiting: Job[] = [];
  // Set the moment a job is taken from the queue, before anything is awaited: set later, a second job added meanwhile
  // started too, and two FFmpegs ran at once (the screenshots, 2026-11-21).
  private running: { job: Job; child: ChildProcess | null; cancelled: boolean } | null = null;
  private readonly ffmpeg: string;
  private readonly logs: string;
  private readonly report: (progress: JobProgress) => void;

  constructor(ffmpeg: string, logs: string, report: (progress: JobProgress) => void) {
    this.ffmpeg = ffmpeg;
    this.logs = logs;
    this.report = report;
  }

  add(job: Job): void {
    if (existsSync(job.output)) {
      this.report({ clipId: job.clipId, kind: job.kind, state: "done" });
      return;
    }
    this.waiting.push(job);
    this.report({ clipId: job.clipId, kind: job.kind, state: "waiting" });
    this.next();
  }

  /** Stops a clip's jobs: those waiting, and the one running. */
  cancel(clipId: string): void {
    for (const job of this.waiting.filter((each) => each.clipId === clipId)) {
      this.waiting.splice(this.waiting.indexOf(job), 1);
      this.report({ clipId, kind: job.kind, state: "cancelled" });
    }
    if (this.running?.job.clipId === clipId) {
      this.running.cancelled = true;
      this.running.child?.kill(); // not started yet: it sees `cancelled` before it would
    }
  }

  /** Ends the running job at once: for quitting. */
  stopAll(): void {
    this.waiting.length = 0;
    if (this.running) {
      this.running.cancelled = true;
      this.running.child?.kill();
    }
  }

  private next(): void {
    if (this.running) return;
    const job = this.waiting.shift();
    if (!job) return;
    const running = { job, child: null, cancelled: false };
    this.running = running;
    void this.start(running);
  }

  private async start(running: NonNullable<JobRunner["running"]>): Promise<void> {
    const job = running.job;
    await mkdir(path.dirname(job.output), { recursive: true });
    await mkdir(this.logs, { recursive: true });
    if (running.cancelled) {
      this.report({ clipId: job.clipId, kind: job.kind, state: "cancelled" });
      this.running = null;
      this.next();
      return;
    }
    const log = createWriteStream(path.join(this.logs, `job-${job.kind}.log`), { flags: "w" });
    const child = spawn(this.ffmpeg, job.arguments, { windowsHide: true });
    running.child = child;
    lowerPriority(child);
    child.stderr?.pipe(log);
    const started = Date.now();
    // FFmpeg's -progress lines: out_time_us=… then progress=continue, about twice a second.
    readline.createInterface({ input: child.stdout! }).on("line", (line) => {
      const reached = /^out_time_us=(\d+)$/.exec(line);
      if (!reached || job.durationSeconds <= 0) return;
      const fraction = Math.min(1, Number(reached[1]) / 1e6 / job.durationSeconds);
      const elapsed = (Date.now() - started) / 1000;
      this.report({ clipId: job.clipId, kind: job.kind, state: "running", fraction, secondsLeft: fraction > 0.02 ? Math.round(elapsed / fraction - elapsed) : null });
    });
    this.report({ clipId: job.clipId, kind: job.kind, state: "running", fraction: 0, secondsLeft: null });
    const code = await new Promise<number | null>((resolve) => {
      child.on("error", (error) => {
        logError("job_failed_to_start", job.kind, errorName(error));
        resolve(null);
      });
      child.on("close", resolve);
    });
    log.end();
    try {
      if (running.cancelled) {
        await rm(job.writing, { force: true });
        this.report({ clipId: job.clipId, kind: job.kind, state: "cancelled" });
      } else if (code === 0) {
        await rename(job.writing, job.output);
        this.report({ clipId: job.clipId, kind: job.kind, state: "done" });
      } else {
        await rm(job.writing, { force: true });
        logError("job_failed", job.kind, `exit ${code}`);
        this.report({ clipId: job.clipId, kind: job.kind, state: "failed", error: "ffmpeg_failed" });
      }
    } catch (error) {
      logError("job_unfinished", job.kind, errorName(error));
      this.report({ clipId: job.clipId, kind: job.kind, state: "failed", error: "ffmpeg_failed" });
    } finally {
      this.running = null;
      this.next();
    }
  }
}

/** Below normal, so the person's own work comes first: the lowest on a Mac and Linux, below normal on Windows. */
function lowerPriority(child: ChildProcess): void {
  if (child.pid === undefined) return;
  try {
    setPriority(child.pid, process.platform === "win32" ? constants.priority.PRIORITY_BELOW_NORMAL : constants.priority.PRIORITY_LOW);
  } catch (error) {
    logError("job_priority_unchanged", errorName(error)); // it still runs, only at the normal priority
  }
}
