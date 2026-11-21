/**
 * The quiet stretches of a clip's speech sound (the 16 kHz mono WAV its speech job made), measured by loudness: the
 * clean-up proposes cutting the long ones (src/shared/cuts.ts). The threshold follows the recording's own noise floor,
 * so a room with a hum finds its pauses as well as a quiet studio does. Read in one pass, a 20 ms window at a time.
 */
import { open } from "node:fs/promises";
import { flicksOf, type Flicks } from "../src/shared/time.ts";
import type { Stretch } from "../src/shared/cuts.ts";

const RATE = 16_000;
const WINDOW = RATE / 50; // 20 ms
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

/** Reads the speech WAV's samples (16-bit, mono, 16 kHz, as ffmpeg-jobs.ts › speechArguments writes it). */
export async function speechSamples(file: string): Promise<Int16Array> {
  const handle = await open(file);
  try {
    const bytes = await handle.readFile();
    const data = bytes.indexOf("data", 12, "latin1"); // the WAV's sample chunk, after FFmpeg's header
    if (data < 0) throw new Error("SPEECH_WAV_NO_DATA");
    const start = data + 8;
    return new Int16Array(bytes.buffer.slice(bytes.byteOffset + start, bytes.byteOffset + start + ((bytes.length - start) & ~1)));
  } finally {
    await handle.close();
  }
}
