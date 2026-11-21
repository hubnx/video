/**
 * The clean-up's proposals: stretches of a clip the person can cut with one press, each shown on the transcript and
 * the timeline to keep or undo (docs/plan.md › Release 1). A proposal never cuts into a word, and keeps a breath of
 * quiet on each side so speech never sounds clipped. Pure: the window and the tests share it.
 */
import { FLICKS_PER_SECOND, flicksOf, type Flicks } from "./time.ts";
import type { Word } from "./transcript.ts";

export interface Stretch {
  start: Flicks;
  end: Flicks;
}

/** Why a stretch is proposed. Fillers ("um") join once the filler check measures 80% (docs/plan.md › Risks). */
export type CutKind = "silence";

export interface Cut extends Stretch {
  kind: CutKind;
}

export interface SilenceRules {
  /** Shorter quiet is a speaker's natural pause and stays. */
  shortestSeconds: number;
  /** Quiet kept at each side of a cut, so words keep their breath. */
  paddingSeconds: number;
}

/** A pause of a second or more is cut down to a breath each side: the usual setting of jump-cut tools for talking
 * heads (Descript's and Recut's defaults sit between 0.5 and 1 s). */
export const SILENCE: SilenceRules = { shortestSeconds: 1, paddingSeconds: 0.15 };

/** The silences worth cutting: each quiet stretch long enough, shrunk by the padding, and moved off any word that
 * overlaps it, since a word's own time is truer than the sound's loudness at a soft consonant. */
export function silenceCuts(quiet: readonly Stretch[], words: readonly Word[], rules: SilenceRules = SILENCE): Cut[] {
  const padding = flicksOf(rules.paddingSeconds);
  const shortest = flicksOf(rules.shortestSeconds);
  const cuts: Cut[] = [];
  for (const stretch of quiet) {
    if (stretch.end - stretch.start < shortest) continue;
    let start = (stretch.start + padding) as Flicks;
    let end = (stretch.end - padding) as Flicks;
    for (const word of words) {
      if (word.end <= start || word.start >= end) continue;
      // A word inside the quiet: keep the side of it with more quiet, never the word.
      if (word.start - start >= end - word.end) end = (word.start - padding) as Flicks;
      else start = (word.end + padding) as Flicks;
    }
    if (end - start >= flicksOf(rules.paddingSeconds * 2)) cuts.push({ kind: "silence", start, end });
  }
  return cuts;
}

/** What plays once `cuts` are taken out of a clip `duration` long: the kept stretches, in order. */
export function kept(duration: Flicks, cuts: readonly Stretch[]): Stretch[] {
  const sorted = [...cuts].sort((one, other) => one.start - other.start);
  const stretches: Stretch[] = [];
  let at = 0 as Flicks;
  for (const cut of sorted) {
    if (cut.start > at) stretches.push({ start: at, end: cut.start });
    at = Math.max(at, cut.end) as Flicks;
  }
  if (at < duration) stretches.push({ start: at, end: duration });
  return stretches;
}

/** How much shorter the cuts make it, in seconds: for "23 silences, 1 min 40 s shorter". */
export function secondsSaved(cuts: readonly Stretch[]): number {
  return cuts.reduce((sum, cut) => sum + (cut.end - cut.start), 0) / FLICKS_PER_SECOND;
}
