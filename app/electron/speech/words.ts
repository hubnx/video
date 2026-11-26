/**
 * Parakeet's tokens turned into words: a token beginning with a space starts a word, the rest continue it, and a
 * punctuation mark joins the word before it ("Okay" + "." = "Okay."), so captions keep their punctuation. Digits are
 * tokens of their own with no space, so a number's start comes as a bare space token (Parakeet's lone "▁"): it starts
 * the next word, or "in 20 minutes" reads "in20 minutes" (found by the demo's talk, 2026-11-26). A token's
 * duration of 0 still takes one encoder frame, and no word runs into the next (the filler check's rule, which measured
 * well: local/filler-check/scripts/run_parakeet_vad.py).
 */
import { flicksOf } from "../../src/shared/time.ts";
import type { Word } from "../../src/shared/transcript.ts";

/** Parakeet's encoder frame: the shortest a token can be. */
const FRAME_SECONDS = 0.08;

export interface Recognized {
  tokens: string[];
  timestamps: number[]; // seconds from the stretch's start
  durations: number[];
}

/** The words of one recognized stretch that starts `offsetSeconds` into the clip. */
export function wordsOf(recognized: Recognized, offsetSeconds: number): Word[] {
  const words: { text: string; start: number; end: number }[] = [];
  let spaceBefore = false; // a bare space token came last: the next token starts a word
  recognized.tokens.forEach((token, index) => {
    const start = offsetSeconds + (recognized.timestamps[index] ?? 0);
    const end = start + Math.max(recognized.durations[index] ?? 0, FRAME_SECONDS);
    const text = token.trim();
    if (!text) {
      spaceBefore = true;
      return;
    }
    const startsWord = token.startsWith(" ") || spaceBefore;
    spaceBefore = false;
    const last = words.at(-1);
    if (last && !/[\p{L}\p{N}]/u.test(text)) {
      last.text += text; // punctuation: no time of its own
      return;
    }
    if (startsWord || !last) words.push({ text, start, end });
    else {
      last.text += text;
      last.end = Math.max(last.end, end);
    }
  });
  return words.map((word, index) => {
    const next = words[index + 1];
    return { text: word.text, start: flicksOf(word.start), end: flicksOf(next ? Math.min(word.end, next.start) : word.end) };
  });
}
