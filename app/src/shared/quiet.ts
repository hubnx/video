/**
 * The quiet stretches of a clip's speech sound, measured by loudness: the clean-up proposes cutting the long ones
 * (cuts.ts). The threshold follows the recording's own noise floor, so a room with a hum finds its pauses as well as a
 * quiet studio does. Pure: the main process measures the levels once (electron/quiet.ts reads the WAV), and the window
 * finds the quiet in them again whenever the person changes the spacing.
 */
import { flicksOf, type Flicks } from "./time.ts";
import type { Stretch } from "./cuts.ts";

const RATE = 16_000;
const WINDOW = RATE / 50; // 20 ms
/** The levels' step, in seconds: one loudness a 20 ms window. */
export const LEVEL_SECONDS = WINDOW / RATE;
/** Above the noise floor by this much is speech: about four times the floor's level. */
const ABOVE_FLOOR_DB = 12;
/** Never take anything louder than this for quiet, however noisy the room. */
const LOUDEST_QUIET_DB = -30;

/** Each 20 ms window's loudness in dBFS, from 16-bit samples. */
export function loudness(samples: Int16Array): Float32Array {
  const windows = Math.floor(samples.length / WINDOW);
  const levels = new Float32Array(windows);
  for (let index = 0; index < windows; index++) {
    let sum = 0;
    for (let at = index * WINDOW; at < (index + 1) * WINDOW; at++) sum += (samples[at]! / 32768) ** 2;
    levels[index] = 10 * Math.log10(sum / WINDOW + 1e-12);
  }
  return levels;
}

/** The quiet stretches in a list of 20 ms loudness levels. */
export function quietStretches(levels: Float32Array): Stretch[] {
  if (!levels.length) return [];
  const sorted = Float32Array.from(levels).sort();
  const floor = sorted[Math.floor(sorted.length * 0.1)]!; // the quietest tenth: the room itself
  const threshold = Math.min(floor + ABOVE_FLOOR_DB, LOUDEST_QUIET_DB);
  const stretches: Stretch[] = [];
  let from: number | null = null;
  const at = (index: number): Flicks => flicksOf((index * WINDOW) / RATE);
  for (let index = 0; index <= levels.length; index++) {
    const quiet = index < levels.length && levels[index]! < threshold;
    if (quiet && from === null) from = index;
    if (!quiet && from !== null) {
      stretches.push({ start: at(from), end: at(index) });
      from = null;
    }
  }
  return stretches;
}

