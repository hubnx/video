/** Parakeet's tokens into words (electron/speech/words.ts): wrong here, every caption and every cut is off. */
import { expect, it } from "vitest";
import { wordsOf } from "../electron/speech/words.ts";
import { secondsOf } from "../src/shared/time.ts";

const recognized = { tokens: [" Okay", ".", " F", "ir", "st", " uh", " the"], timestamps: [0.0, 0.4, 0.72, 0.96, 1.04, 1.5, 2.0], durations: [0.24, 0.32, 0.24, 0.08, 0, 0.16, 0.24] };

it("joins a word's pieces, keeps its punctuation, and places it in the clip's time", () => {
  const words = wordsOf(recognized, 2.55);
  expect(words.map((word) => word.text)).toEqual(["Okay.", "First", "uh", "the"]);
  expect(secondsOf(words[0]!.start)).toBeCloseTo(2.55);
  expect(secondsOf(words[1]!.start)).toBeCloseTo(3.27);
  expect(secondsOf(words[1]!.end)).toBeCloseTo(3.67); // its last piece, one frame long
});

it("never lets a word run into the next one", () => {
  const words = wordsOf({ tokens: [" long", " next"], timestamps: [0, 0.2], durations: [0.5, 0.2] }, 0);
  expect(words[0]!.end).toBeLessThanOrEqual(words[1]!.start);
});

it("takes punctuation at the very start as a word of its own rather than losing it", () => {
  expect(wordsOf({ tokens: ["¿", " Qué"], timestamps: [0, 0.1], durations: [0.08, 0.2] }, 0).map((word) => word.text)).toEqual(["¿", "Qué"]);
});
