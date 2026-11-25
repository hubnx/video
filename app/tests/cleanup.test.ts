/**
 * The clean-up's proposals (src/edit/cleanup.ts), as the gates set them (2026-11-21): silences at three spacings;
 * possible "um"s in English only, at the strict boundary; nothing underlined when the language can't be told.
 */
import { describe, expect, it } from "vitest";
import { fillerCuts, isEnglish, isFiller, silenceProposals } from "../src/edit/cleanup.ts";
import { flicksOf, secondsOf } from "../src/shared/time.ts";
import type { SoundMap, Word } from "../src/shared/transcript.ts";

const word = (text: string, start: number, end: number): Word => ({ text, start: flicksOf(start), end: flicksOf(end) });

/** A sound map `seconds` long: speech (-20 dB) everywhere but the quiet stretches given (-60 dB), and the voice
 * detector hearing speech exactly where it's loud. */
function sound(seconds: number, quiet: [number, number][]): SoundMap {
  const levels = Float32Array.from({ length: seconds * 50 }, (_, index) => (quiet.some(([from, to]) => index / 50 >= from && index / 50 < to) ? -60 : -20));
  const voice = [];
  let at = 0;
  for (const [from, to] of quiet) {
    if (from > at) voice.push({ start: flicksOf(at), end: flicksOf(from) });
    at = to;
  }
  if (at < seconds) voice.push({ start: flicksOf(at), end: flicksOf(seconds) });
  return { levels, voice };
}

describe("silence proposals", () => {
  const map = sound(20, [[5, 8]]);
  it("leaves more quiet each side as the spacing relaxes", () => {
    const [tight, natural, relaxed] = (["tight", "natural", "relaxed"] as const).map((spacing) => silenceProposals(map, [], spacing)[0]!);
    expect(secondsOf(tight!.start)).toBeCloseTo(5.15, 1);
    expect(secondsOf(natural!.start)).toBeCloseTo(5.25, 1);
    expect(secondsOf(relaxed!.start)).toBeCloseTo(5.4, 1);
    expect(secondsOf(relaxed!.end)).toBeCloseTo(7.6, 1);
  });
});

describe("telling English", () => {
  it("knows an English talk by its commonest words", () => {
    const talk = "so today we are going to look at the way that this works and what you can do with it in the app".split(" ");
    expect(isEnglish([...talk, ...talk].map((text, index) => word(text, index, index + 0.5)))).toBe(true);
  });

  it("doesn't call German English, and won't decide on a handful of words", () => {
    const german = "also heute schauen wir uns an wie das funktioniert und was man damit in der app machen kann wenn man will".split(" ");
    expect(isEnglish([...german, ...german].map((text, index) => word(text, index, index + 0.5)))).toBe(false);
    expect(isEnglish(["so", "the", "and"].map((text, index) => word(text, index, index + 0.5)))).toBe(false);
  });
});

describe("possible ums", () => {
  it("knows um and uh in their spellings, and nothing else", () => {
    expect(["um", "Um,", "uh", "Uhh.", "umm", "erm"].every(isFiller)).toBe(true);
    expect(["umbrella", "huh", "er.", "hmm", "and"].some(isFiller)).toBe(false);
  });

  it("cuts from the filler to the next word, at the quietest point near each edge, leaving 80 ms each side", () => {
    const words = [word("So", 0, 0.4), word("um", 1.0, 1.2), word("today", 1.8, 2.2)];
    const map = sound(3, [[0.42, 0.98], [1.22, 1.78]]);
    const [{ word: marked, cut } = { word: undefined, cut: undefined }] = fillerCuts(words, map);
    expect(marked?.text).toBe("um");
    expect(cut!.kind).toBe("filler");
    expect(secondsOf(cut!.start)).toBeGreaterThan(0.95);
    expect(secondsOf(cut!.end)).toBeLessThan(1.8 - 0.08 + 0.01);
    expect(secondsOf(cut!.end)).toBeGreaterThan(secondsOf(cut!.start));
  });

  it("proposes nothing when what's left after the margins is too short to be worth a cut", () => {
    const words = [word("um", 1.0, 1.1), word("so", 1.2, 1.5)];
    expect(fillerCuts(words, sound(3, []))).toEqual([]);
  });
});
