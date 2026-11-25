/** The clean voice's estimate (src/shared/voice-speed.ts): this computer's own speed first, then its kind's, then the
 * slowest measured. */
import { expect, it } from "vitest";
import { expectedSecondsPerMinute, MEASURED_SECONDS_PER_MINUTE, voiceSeconds } from "../src/shared/voice-speed.ts";

it("has a measured speed for every system release 1 ships to", () => {
  for (const kind of ["darwin-x64", "darwin-arm64", "win32-x64", "linux-x64"]) expect(MEASURED_SECONDS_PER_MINUTE[kind]).toBeGreaterThan(0);
});

it("uses this computer's own speed once it has one", () => {
  expect(expectedSecondsPerMinute("darwin", "arm64", 12)).toBe(12);
});

it("uses its kind's measured speed until then, and the slowest for a kind not measured", () => {
  expect(expectedSecondsPerMinute("darwin", "x64", undefined)).toBe(MEASURED_SECONDS_PER_MINUTE["darwin-x64"]);
  expect(expectedSecondsPerMinute("win32", "arm64", undefined)).toBe(Math.max(...Object.values(MEASURED_SECONDS_PER_MINUTE)));
});

it("scales with the clip's length", () => {
  expect(voiceSeconds(20 * 60, 41.7)).toBeCloseTo(834);
});
