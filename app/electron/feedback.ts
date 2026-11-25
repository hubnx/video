/**
 * What the app sends to Hub Nexus, and only when the person sends it: a report they write (a problem or an idea), and
 * the day-7 check-in's three numbers after their yes (check-in.ts). Both go to hubnx.com's `/api/feedback`, which
 * keeps a report for the team to read and keeps a check-in only as each day's totals (FEEDBACK_URL). A report carries
 * what the person writes, the app's version and system, and, only if they tick it, the end of the app's log with every
 * home folder shown as ~: never a video, its file name or its words (the log is written without them: app-log.ts).
 * No Electron here, so the tests run in plain Node.
 */
import { open } from "node:fs/promises";
import { homedir, userInfo } from "node:os";
import path from "node:path";
import { APP_NAME, FEEDBACK_APP_KEY, FEEDBACK_LIMITS, FEEDBACK_URL, type CheckInCounts, type FeedbackDraft, type FeedbackResult } from "../src/shared/app-api.ts";
import { logError } from "./app-log.ts";

export interface FeedbackSystem {
  version: string;
  platform: NodeJS.Platform;
  systemVersion: string;
  arch: string;
}

/** How hubnx.com's route spells each system (its check-in refuses any other). */
const ROUTE_SYSTEMS: Partial<Record<NodeJS.Platform, string>> = { darwin: "macos", win32: "windows", linux: "linux" };
/** As a person writes them, in the text the person reads before sending. */
const SYSTEM_NAMES: Partial<Record<NodeJS.Platform, string>> = { darwin: "macOS", win32: "Windows", linux: "Linux" };

/** "macOS 15.1 · arm64" */
export function systemLine(system: FeedbackSystem): string {
  return `${SYSTEM_NAMES[system.platform] ?? system.platform} ${system.systemVersion} · ${system.arch}`;
}

/**
 * Where a report or a check-in goes. A copy run from the repo sends to the route's `?dryRun=1`, which checks a
 * check-in whole and counts nothing; the checks pass a stand-in's address (`VIDEO_FEEDBACK_URL`), so no test ever
 * reaches the live route (docs/plan.md › Keep or stop › The check-in).
 */
export function feedbackUrl(packaged: boolean, standIn: string | undefined): string {
  if (standIn) return standIn;
  return packaged ? FEEDBACK_URL : `${FEEDBACK_URL}?dryRun=1`;
}

/** What a report adds to the person's words, shown to them word for word before it's sent. */
export function reportDetails(system: FeedbackSystem, failure: string | null, log: string | null): string {
  return [
    `${APP_NAME} ${system.version} · ${systemLine(system)}`,
    ...(failure ? [`What didn't work: ${failure}`] : []),
    ...(log ? ["", "The end of the app's log:", log] : []),
  ].join("\n");
}

/** The route's body for a report (@hubnx/web-parts › feedback-report holds the same contract for the site). */
export function reportBody(draft: FeedbackDraft, system: FeedbackSystem, details: string): Record<string, unknown> {
  const message = draft.message.trim();
  const email = draft.email.trim();
  const firstLine = message.split("\n")[0]!.trim().slice(0, 80);
  return {
    source: "app",
    app: { name: FEEDBACK_APP_KEY, version: system.version, os: ROUTE_SYSTEMS[system.platform] ?? "linux", osVersion: system.systemVersion, arch: system.arch },
    kind: draft.kind,
    subject: `${draft.kind === "idea" ? "Idea" : "Problem"}: ${firstLine || APP_NAME}`,
    message,
    ...(email ? { email } : {}),
    context: { locale: draft.locale, theme: draft.theme },
    // Kept beside the report for the team, never mailed.
    log: details,
  };
}

/** Sends a report; a refusal or no answer is said, never thrown, so the window can tell the person. */
export async function sendReport(url: string, body: Record<string, unknown>): Promise<FeedbackResult> {
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(20_000) });
    if (response.ok) return "sent";
    logError("feedback_refused", response.status, (await response.text().catch(() => "")).slice(0, 300));
    return response.status === 429 ? "too_many" : "refused";
  } catch (error) {
    logError("feedback_unreachable", error);
    return "unreachable";
  }
}

/** The route's body for the check-in: the three numbers, the version and the system, and nothing else (no install
 * id, name, address or words: hubnx's app-checkin.util.ts refuses any other key). Each number capped as the route caps
 * it. */
export function checkInBody(counts: CheckInCounts, system: FeedbackSystem): Record<string, unknown> {
  return {
    kind: "checkin",
    app: FEEDBACK_APP_KEY,
    version: system.version,
    os: ROUTE_SYSTEMS[system.platform] ?? "linux",
    counts: {
      videosExported: Math.min(counts.videosExported, 1_000),
      minutesToFirstExport: counts.minutesToFirstExport === null ? null : Math.min(counts.minutesToFirstExport, 100_000),
      setupFailures: Math.min(counts.setupFailures, 1_000),
    },
  };
}

/** What became of a check-in: counted, refused with the route's code (logged as `checkin_refused`), the route busy
 * (429, tried once more the next day), or not reached (tried at the next check). */
export type CheckInOutcome = { sent: true } | { sent: false; refused: string } | { sent: false; busy: true } | { sent: false; unreachable: true };

export async function sendCheckIn(url: string, body: Record<string, unknown>): Promise<CheckInOutcome> {
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(20_000) });
    if (response.ok) return { sent: true };
    if (response.status === 429) {
      logError("checkin_busy");
      return { sent: false, busy: true };
    }
    const text = await response.text().catch(() => "");
    const code = /"code"\s*:\s*"([a-z-]+)"/.exec(text)?.[1] ?? `status-${response.status}`;
    logError("checkin_refused", code);
    return { sent: false, refused: code };
  } catch (error) {
    logError("checkin_unreachable", error);
    return { sent: false, unreachable: true };
  }
}

/** The newest lines of the app's log within `room` characters, each home folder as ~ (the person's name is often in
 * it), whole lines only. Null when there's no log yet. */
export async function logEnd(logsFolder: string, room = FEEDBACK_LIMITS.longestLog / 2): Promise<string | null> {
  let text: string;
  try {
    const file = await open(path.join(logsFolder, "app.log"));
    try {
      const { size } = await file.stat();
      const start = Math.max(0, size - room * 2);
      const buffer = Buffer.alloc(size - start);
      await file.read(buffer, 0, buffer.length, start);
      text = buffer.toString("utf8");
      if (start > 0) text = text.slice(text.indexOf("\n") + 1); // the first line, cut, is dropped
    } finally {
      await file.close();
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  const shown = withoutHomes(text);
  const lines = shown.trimEnd().split("\n");
  const kept: string[] = [];
  let length = 0;
  for (const line of lines.reverse()) {
    if (length + line.length + 1 > room) break;
    kept.unshift(line);
    length += line.length + 1;
  }
  return kept.length ? kept.join("\n") : null;
}

/** Any home folder as ~, however it's written: Node's, the real one where they differ, and every user's on each system
 * (/Users/name, /home/name, C:\Users\Name Surname, C:\\Users\\NAME~1). */
export function withoutHomes(text: string, homes: string[] = [homedir(), userInfo().homedir]): string {
  let shown = text;
  for (const home of [...new Set(homes)].filter(Boolean).sort((one, other) => other.length - one.length)) {
    for (const spelling of [home, home.replaceAll("\\", "\\\\"), home.replaceAll("\\", "/")]) shown = shown.split(spelling).join("~");
  }
  return shown
    .replace(/[A-Za-z]:(?:\\\\|\\|\/)Users(?:\\\\|\\|\/)[^\\/'"\n]+?(?=\\|\/|'|"|$)/gim, "~")
    .replace(/\/(?:Users|home)\/[^/\s'"]+/g, "~");
}
