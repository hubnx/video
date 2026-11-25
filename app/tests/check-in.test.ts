import { describe, expect, it } from "vitest";
import { afterCheckIn, checkInCounts, checkInReady, withExport } from "../electron/check-in.ts";
import { checkInBody } from "../electron/feedback.ts";
import type { Settings } from "../electron/settings.ts";

const opened = "2026-11-29T10:00:00.000Z";
const at = (days: number) => new Date(Date.parse(opened) + days * 24 * 60 * 60 * 1000);

// docs/plan.md › Keep or stop › The check-in: sent once, a week after the first open, only after a yes.
describe("the day-7 check-in", () => {
  it("goes only after a yes, and not before a week", () => {
    const base: Settings = { firstOpenedAt: opened };
    expect(checkInReady(base, at(8))).toBe(false); // never asked
    expect(checkInReady({ ...base, checkIn: { answer: "no", answeredAt: opened } }, at(8))).toBe(false);
    const yes: Settings = { ...base, checkIn: { answer: "yes", answeredAt: opened } };
    expect(checkInReady(yes, at(6.9))).toBe(false);
    expect(checkInReady(yes, at(7))).toBe(true);
  });

  it("goes once: sent, or refused by the route, it never goes again", () => {
    const yes: Settings = { firstOpenedAt: opened, checkIn: { answer: "yes", answeredAt: opened } };
    expect(checkInReady({ ...yes, ...afterCheckIn(yes, { sent: true }, at(7)) }, at(9))).toBe(false);
    expect(checkInReady({ ...yes, ...afterCheckIn(yes, { sent: false, refused: "checkin-field" }, at(7)) }, at(9))).toBe(false);
  });

  it("tries once more a day after a busy route, then stops; a route not reached is tried at the next check", () => {
    const yes: Settings = { firstOpenedAt: opened, checkIn: { answer: "yes", answeredAt: opened } };
    const busyOnce = { ...yes, ...afterCheckIn(yes, { sent: false, busy: true }, at(7)) };
    expect(checkInReady(busyOnce, at(7.5))).toBe(false);
    expect(checkInReady(busyOnce, at(8))).toBe(true);
    expect(checkInReady({ ...busyOnce, ...afterCheckIn(busyOnce, { sent: false, busy: true }, at(8)) }, at(10))).toBe(false);
    expect(afterCheckIn(yes, { sent: false, unreachable: true }, at(7))).toEqual({});
  });

  it("counts exports and the minutes to the first, and sends exactly the three numbers the route declares", () => {
    let settings: Settings = { firstOpenedAt: opened, setupFailures: 2 };
    settings = { ...settings, ...withExport(settings, new Date(Date.parse(opened) + 12 * 60_000)) };
    settings = { ...settings, ...withExport(settings, at(3)) };
    expect(checkInCounts(settings)).toEqual({ videosExported: 2, minutesToFirstExport: 12, setupFailures: 2 });
    expect(checkInCounts({ firstOpenedAt: opened }).minutesToFirstExport).toBeNull();
    const body = checkInBody(checkInCounts(settings), { version: "1.0.0", platform: "win32", systemVersion: "10.0.26100", arch: "x64" });
    // hubnx's app-checkin.util.ts refuses any other key: no install id, name or system version.
    expect(body).toEqual({ kind: "checkin", app: "video", version: "1.0.0", os: "windows", counts: { videosExported: 2, minutesToFirstExport: 12, setupFailures: 2 } });
  });
});
