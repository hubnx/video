/**
 * What the clean-up proposes for a clip, from its words and its sound map (gate on day 1's numbers, 2026-11-21):
 * - silences, cut with one press, at the spacing the person picks;
 * - possible "um"s, in English only (the only language measured), each cut by its own press at the strict boundary,
 *   never in "accept all" and never named outside the transcript until a release measures 80%.
 * Pure: the window recomputes it at once when the spacing changes, and the tests check it without a model.
 */
import { silenceCuts, withoutSpeech, type Cut } from "../shared/cuts.ts";
import { LEVEL_SECONDS, quietStretches } from "../shared/quiet.ts";
import { flicksOf, secondsOf } from "../shared/time.ts";
import type { Choices } from "../shared/project.ts";
import type { SoundMap, Word } from "../shared/transcript.ts";

/** How much quiet each silence cut leaves either side: Natural is the measured default (cuts.ts › SILENCE); creators
 * differ on pace (gate on silences, 2026-11-21). */
export const SPACINGS = { tight: 0.15, natural: 0.25, relaxed: 0.4 } as const satisfies Record<Choices["spacing"], number>;
export type Spacing = Choices["spacing"];

export function silenceProposals(sound: SoundMap, words: readonly Word[], spacing: Spacing): Cut[] {
  return silenceCuts(withoutSpeech(quietStretches(sound.levels), sound.voice), words, { shortestSeconds: 1, paddingSeconds: SPACINGS[spacing] });
}

/** English's commonest words: a transcript is English when they make up a good share of its first words. Below the
 * share, or with too few words to tell, it isn't, and nothing is underlined (gate on day 4, 2026-11-21). */
const ENGLISH = new Set(["the", "a", "and", "to", "of", "is", "it", "that", "i", "you", "in", "we", "this", "so", "for", "on", "what", "be", "are", "was"]);
const WORDS_TO_TELL = 30;
const ENGLISH_SHARE = 0.2;

export function isEnglish(words: readonly Word[]): boolean {
  const first = words.slice(0, 400).map((word) => bare(word.text)).filter(Boolean);
  if (first.length < WORDS_TO_TELL) return false;
  return first.filter((word) => ENGLISH.has(word)).length / first.length >= ENGLISH_SHARE;
}

/** The fillers Parakeet v3 writes, which the filler check measured: "um" and "uh" and their longer spellings. */
export function isFiller(text: string): boolean {
  return /^(u+m+|u+h+|e+r+m+)$/.test(bare(text));
}

function bare(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, "");
}

/** Where to look for a quieter cut point around each edge of a filler, and what's left uncut at each end: the strict
 * boundary, 78% precise with the fewest cuts into words in the filler check (local/filler-check/results.md). */
const SEARCH_SECONDS = 0.1;
const MARGIN_SECONDS = 0.08;
const SHORTEST_FILLER_CUT_SECONDS = 0.1;

/** A possible "um" and the cut it would make. */
export interface FillerCut {
  word: Word;
  cut: Cut;
}

/** The cut each possible "um" would make: from the filler to the next word's start (Parakeet gives a filler a token's
 * length; a drawn-out "uhhh" runs on), each edge moved to the quietest 20 ms nearby, then 80 ms left uncut each side.
 * Each carries its word, so the transcript marks that word, not one its padded cut happens to touch. */
export function fillerCuts(words: readonly Word[], sound: SoundMap): FillerCut[] {
  const cuts: FillerCut[] = [];
  words.forEach((word, index) => {
    if (!isFiller(word.text)) return;
    const next = words[index + 1];
    const start = quietestNear(sound.levels, secondsOf(word.start)) + MARGIN_SECONDS;
    const end = quietestNear(sound.levels, secondsOf(next ? next.start : word.end)) - MARGIN_SECONDS;
    if (end - start >= SHORTEST_FILLER_CUT_SECONDS) cuts.push({ word, cut: { kind: "filler", start: flicksOf(start), end: flicksOf(end) } });
  });
  return cuts;
}

/** The middle of the quietest 20 ms window within SEARCH_SECONDS of `seconds`. */
function quietestNear(levels: Float32Array, seconds: number): number {
  const from = Math.max(0, Math.floor((seconds - SEARCH_SECONDS) / LEVEL_SECONDS));
  const to = Math.min(levels.length - 1, Math.ceil((seconds + SEARCH_SECONDS) / LEVEL_SECONDS));
  let quietest = Math.min(Math.max(0, Math.round(seconds / LEVEL_SECONDS)), levels.length - 1);
  for (let index = from; index <= to; index++) if (levels[index]! < levels[quietest]!) quietest = index;
  return (quietest + 0.5) * LEVEL_SECONDS;
}
