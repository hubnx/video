/**
 * The job runner (electron/jobs.ts): one FFmpeg at a time, or a person's computer slows to a crawl while a 4K clip is
 * prepared (two ran at once until 2026-11-21); a file renamed into place only when made, so a stopped job never leaves
 * half a file that reads as made. Node stands in for FFmpeg here, writing its output after a short wait.
 */
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { JobRunner, writingPath, type Job } from "../electron/jobs.ts";
import type { JobKind, JobProgress } from "../src/shared/media.ts";

let folder: string;
beforeEach(async () => {
  folder = await mkdtemp(path.join(tmpdir(), "jobs-"));
});
afterEach(async () => {
  await rm(folder, { recursive: true, force: true });
});

/** A job whose "FFmpeg" (Node) waits `milliseconds`, then writes its file and ends with `code`. */
function job(kind: JobKind, milliseconds: number, code = 0): Job {
  const output = path.join(folder, `${kind}.out`);
  const writing = writingPath(output);
  const script = `setTimeout(() => { require("fs").writeFileSync(${JSON.stringify(writing)}, "made"); process.exit(${code}); }, ${milliseconds})`;
  return { clipId: "clip", kind, arguments: ["-e", script], writing, output, durationSeconds: 1 };
}

function runner(events: JobProgress[]): JobRunner {
  return new JobRunner(process.execPath, path.join(folder, "logs"), (progress) => events.push(progress));
}

function settled(events: JobProgress[], count: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      if (events.filter((event) => ["done", "failed", "cancelled"].includes(event.state)).length >= count) {
        clearInterval(timer);
        resolve();
      }
    }, 20);
  });
}

it("runs one job at a time, the next only once the last is done", async () => {
  const events: JobProgress[] = [];
  const jobs = runner(events);
  jobs.add(job("speech", 150));
  jobs.add(job("proxy", 50));
  await settled(events, 2);
  const order = events.filter((event) => event.state === "running" && event.fraction === 0 || event.state === "done").map((event) => `${event.kind} ${event.state}`);
  expect(order).toEqual(["speech running", "speech done", "proxy running", "proxy done"]);
  expect(existsSync(path.join(folder, "speech.out")) && existsSync(path.join(folder, "proxy.out"))).toBe(true);
});

it("leaves no file when FFmpeg fails, and goes on to the next job", async () => {
  const events: JobProgress[] = [];
  const jobs = runner(events);
  jobs.add(job("proxy", 20, 1));
  jobs.add(job("editCopy", 20));
  await settled(events, 2);
  expect(events.find((event) => event.kind === "proxy" && event.state === "failed")).toBeDefined();
  expect(existsSync(path.join(folder, "proxy.out")) || existsSync(writingPath(path.join(folder, "proxy.out")))).toBe(false);
  expect(events.find((event) => event.kind === "editCopy" && event.state === "done")).toBeDefined();
});

it("stops a clip's running job and leaves nothing half made", async () => {
  const events: JobProgress[] = [];
  const jobs = runner(events);
  jobs.add(job("editCopy", 5_000));
  await new Promise((resolve) => setTimeout(resolve, 100));
  jobs.cancel("clip");
  await settled(events, 1);
  expect(events.at(-1)?.state).toBe("cancelled");
  expect(existsSync(path.join(folder, "editCopy.out"))).toBe(false);
});

it("finds a file already made at once, without running anything", async () => {
  const events: JobProgress[] = [];
  const first = runner(events);
  first.add(job("speech", 10));
  await settled(events, 1);
  const again: JobProgress[] = [];
  runner(again).add(job("speech", 10));
  expect(again).toEqual([{ clipId: "clip", kind: "speech", state: "done" }]);
});
