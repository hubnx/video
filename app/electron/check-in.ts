/**
 * The day-7 check-in (docs/plan.md › Keep or stop › The check-in): three numbers, counted on this computer only from
 * the first open, and sent once, a week after it, only after the person says yes. Asked once, after the first export,
 * in the export's done view; switchable in Settings. One per install by the flag kept here, since the route doesn't
 * enforce it. What it sends is exactly CheckInCounts with the version and system (feedback.ts › checkInBody). No
 * Electron here, so the tests run in plain Node.
 */
import type { CheckInCounts, CheckInState } from "../src/shared/app-api.ts";
import type { CheckInOutcome } from "./feedback.ts";
import type { Settings } from "./settings.ts";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export function checkInCounts(settings: Settings): CheckInCounts {
  const opened = settings.firstOpenedAt ? Date.parse(settings.firstOpenedAt) : NaN;
  const exported = settings.firstExportAt ? Date.parse(settings.firstExportAt) : NaN;
  return {
    videosExported: settings.exportsMade ?? 0,
    minutesToFirstExport: Number.isFinite(opened) && Number.isFinite(exported) ? Math.max(0, Math.round((exported - opened) / 60_000)) : null,
    setupFailures: settings.setupFailures ?? 0,
  };
}

export function checkInState(settings: Settings, now: Date): CheckInState {
  const opened = settings.firstOpenedAt ? Date.parse(settings.firstOpenedAt) : now.getTime();
  return {
    answer: settings.checkIn?.answer ?? null,
    sentAt: settings.checkInSentAt ?? null,
    dueAt: new Date(opened + WEEK_MS).toISOString(),
    counts: checkInCounts(settings),
  };
}

/** Whether it goes now: a yes, a week since the first open, not sent or ended, and past a busy route's retry day. */
export function checkInReady(settings: Settings, now: Date): boolean {
  if (settings.checkIn?.answer !== "yes" || settings.checkInSentAt || settings.checkInEnded) return false;
  if (now.getTime() < Date.parse(checkInState(settings, now).dueAt)) return false;
  return !settings.checkInRetryAt || now.getTime() >= Date.parse(settings.checkInRetryAt);
}

/** What to keep after a try: sent; refused (never again); busy, once more a day later, then never; or not reached,
 * which changes nothing, so the next check tries again. */
export function afterCheckIn(settings: Settings, outcome: CheckInOutcome, now: Date): Partial<Settings> {
  if (outcome.sent) return { checkInSentAt: now.toISOString() };
  if ("refused" in outcome) return { checkInEnded: outcome.refused };
  if ("busy" in outcome) return settings.checkInRetryAt ? { checkInEnded: "busy-twice" } : { checkInRetryAt: new Date(now.getTime() + DAY_MS).toISOString() };
  return {};
}

/** One more export counted, and the first one's time kept. */
export function withExport(settings: Settings, now: Date): Partial<Settings> {
  return { exportsMade: (settings.exportsMade ?? 0) + 1, ...(settings.firstExportAt ? {} : { firstExportAt: now.toISOString() }) };
}
