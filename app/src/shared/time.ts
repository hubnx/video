/**
 * Time in the editor is counted in flicks: 705,600,000 a second, a whole number of flicks per frame for every common
 * frame rate (24, 25, 30, 48, 50, 60, 120, and the 1000/1001 rates: 30000/1001 is exactly 23,543,520 flicks a frame)
 * and per sample at 8, 16, 22.05, 24, 32, 44.1, 48, 88.2, 96 and 192 kHz, so a cut never lands between frames through
 * rounding (docs/plan.md › How it's built). Seconds, as decoders and players give them, are converted only at the
 * edges.
 */
export const FLICKS_PER_SECOND = 705_600_000;

/** A count of flicks, never a number of seconds: the brand keeps the two from being mixed up by mistake. */
export type Flicks = number & { readonly flicks: unique symbol };

export function flicksOf(seconds: number): Flicks {
  return Math.round(seconds * FLICKS_PER_SECOND) as Flicks;
}

export function secondsOf(time: Flicks): number {
  return time / FLICKS_PER_SECOND;
}

/** The start of frame `index` at `frameRate`. */
export function frameStart(index: number, frameRate: number): Flicks {
  return flicksOf(index / frameRate);
}

/** The frame showing at `time`: the one whose start is at or before it. A hair past a boundary still counts as the
 * frame that starts there, so a seek to a frame's own start never lands on the one before it. */
export function frameAt(time: Flicks, frameRate: number): number {
  return Math.floor(secondsOf(time) * frameRate + 1e-6);
}
