/**
 * The clean-up's silence proposals (src/shared/cuts.ts, electron/quiet.ts). The rule that must never break: no cut
 * inside a word (docs/plan.md › Build order, day 5). And a pause found in a hum as well as in a quiet room.
 */
import { describe, expect, it } from "vitest";
import { kept, secondsSaved, silenceCuts, withoutSpeech, type Stretch } from "../src/shared/cuts.ts";
import { flicksOf, secondsOf } from "../src/shared/time.ts";
import type { Word } from "../src/shared/transcript.ts";
import { loudness, quietStretches } from "../src/shared/quiet.ts";

const at = (start: number, end: number): Stretch => ({ start: flicksOf(start), end: flicksOf(end) });
const word = (text: string, start: number, end: number): Word => ({ text, ...at(start, end) });

describe("silence proposals", () => {
  it("cuts a long pause down to a quarter second each side", () => {
    const [cut] = silenceCuts([at(2, 5)], []);
    expect(secondsOf(cut!.start)).toBeCloseTo(2.25);
    expect(secondsOf(cut!.end)).toBeCloseTo(4.75);
  });

  it("leaves a natural pause alone", () => {
    expect(silenceCuts([at(2, 2.8)], [])).toEqual([]);
  });

  it("never cuts into a word said softly inside the quiet, keeping the side with more quiet", () => {
    const soft = word("so", 4, 4.3);
    const [cut] = silenceCuts([at(1, 4.6)], [soft]);
    expect(cut!.end).toBeLessThanOrEqual(soft.start);
    expect(secondsOf(cut!.end)).toBeCloseTo(3.75);
  });

  it("drops a pause that a word leaves too little of", () => {
    expect(silenceCuts([at(1, 2.2)], [word("uh-huh", 1.3, 1.9)])).toEqual([]);
  });
});

it("takes out of the quiet whatever the voice detector hears speech in", () => {
  expect(withoutSpeech([at(1, 6)], [at(0, 1.5), at(3, 3.4), at(5.5, 9)])).toEqual([at(1.5, 3), at(3.4, 5.5)]);
});

describe("what plays after the cuts", () => {
  it("keeps everything outside the cuts, in order, and counts the time saved", () => {
    const cuts = [at(2, 3), at(6, 8)];
    expect(kept(flicksOf(10), cuts)).toEqual([at(0, 2), at(3, 6), at(8, 10)]);
    expect(secondsSaved(cuts)).toBeCloseTo(3);
  });
});

describe("finding the quiet", () => {
  /** A second of tone at `level` (0 to 1), or silence with a little noise. */
  const tone = (seconds: number, level: number, noise = 0.001) => Int16Array.from({ length: seconds * 16000 },
    (_, index) => Math.round(32767 * (level * Math.sin(index / 5) + noise * (Math.random() * 2 - 1))));
  const joined = (...parts: Int16Array[]) => Int16Array.from(parts.flatMap((part) => [...part]));

  it("finds the pause between two stretches of speech", () => {
    const [pause] = quietStretches(loudness(joined(tone(1, 0.3), tone(2, 0), tone(1, 0.3))));
    expect(secondsOf(pause!.start)).toBeCloseTo(1, 1);
    expect(secondsOf(pause!.end)).toBeCloseTo(3, 1);
  });

  it("finds it in a humming room too, by the room's own floor", () => {
    const hum = 0.02;
    const stretches = quietStretches(loudness(joined(tone(1, 0.3, hum), tone(2, 0, hum), tone(1, 0.3, hum))));
    expect(stretches.some((stretch) => secondsOf(stretch.end) - secondsOf(stretch.start) > 1.8)).toBe(true);
  });
});
