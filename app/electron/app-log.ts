/**
 * The app's own log, logs/app.log: the main process's errors, a line each with its time, a searchable event name
 * and what it was about. A problem report may carry its end, so no caller passes a video's file name, a transcript's
 * words or an error whose message could quote them; `errorName` gives such an error's kind alone. Also printed, for a
 * copy run from the repo. Past LONGEST it starts again, the last kept as app.previous.log.
 */
import { appendFileSync, mkdirSync, renameSync, statSync } from "node:fs";
import path from "node:path";

const LONGEST = 1024 * 1024;
let file: string | null = null;

export function startAppLog(logs: string): void {
  mkdirSync(logs, { recursive: true });
  file = path.join(logs, "app.log");
}

export function logError(event: string, ...about: unknown[]): void {
  console.error(event, ...about);
  if (!file) return;
  try {
    if ((statSync(file, { throwIfNoEntry: false })?.size ?? 0) > LONGEST) renameSync(file, file.replace(/\.log$/, ".previous.log"));
    appendFileSync(file, `${new Date().toISOString()} ${[event, ...about.map(described)].join(" ")}\n`);
  } catch (error) {
    console.error("app_log_unwritten", error); // the log is for later; the app goes on
  }
}

/** An error's kind and code, without its message: for errors whose message could quote a file name or words. */
export function errorName(error: unknown): string {
  const code = (error as NodeJS.ErrnoException | null)?.code;
  return `${error instanceof Error ? error.name : typeof error}${code ? ` ${code}` : ""}`;
}

function described(detail: unknown): string {
  if (detail instanceof Error) return `${errorName(detail)}: ${detail.message.split("\n")[0]}`;
  return typeof detail === "string" ? detail : JSON.stringify(detail) ?? String(detail);
}
