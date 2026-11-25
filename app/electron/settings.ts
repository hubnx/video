/** The person's few settings, kept in a small JSON file. */
import { readFile, rename, writeFile } from "node:fs/promises";
import { errorName, logError } from "./app-log.ts";

export interface Settings {
  // When this copy first opened: the day-7 check-in counts from it (docs/plan.md › Keep or stop › The check-in).
  firstOpenedAt?: string;
  // This computer's voice clean-up speed, seconds per minute of sound, from its last clean-up of a minute or more: the
  // estimate on the switch (src/shared/voice-speed.ts).
  voiceSecondsPerMinute?: number;
  // The day-7 check-in's counts, kept on this computer only until a yes sends them once (check-in.ts).
  exportsMade?: number;
  firstExportAt?: string;
  setupFailures?: number;
  checkIn?: { answer: "yes" | "no"; answeredAt: string };
  checkInSentAt?: string;
  // Never tried again: the route refused it (its code), or was busy twice.
  checkInEnded?: string;
  // After the route was busy (429): tried once more, a day later.
  checkInRetryAt?: string;
}

export async function readSettings(file: string): Promise<Settings> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as Settings;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") logError("settings_unreadable", file, errorName(error));
    return {};
  }
}

/** Written whole beside the file, then renamed over it: a write cut short never leaves half a file, which would read
 * as no settings at all. The caller keeps writes one after another (main.ts). */
export async function writeSettings(file: string, settings: Settings): Promise<void> {
  await writeFile(`${file}.writing`, JSON.stringify(settings, null, 2));
  await rename(`${file}.writing`, file);
}
