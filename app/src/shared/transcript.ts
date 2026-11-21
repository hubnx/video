/**
 * A clip's transcript: every word with when it's said, in flicks, as the speech model heard it, and how words group
 * into caption lines. Pure, shared by the main process (which makes the transcript) and the window (which shows it
 * and draws the captions), and checked by the tests without a model.
 */
import { FLICKS_PER_SECOND, type Flicks } from "./time.ts";

export interface Word {
  text: string; // as said, with its punctuation ("Hello," "world.")
  start: Flicks;
  end: Flicks;
}

export interface Transcript {
  language: string; // ISO 639-1, as the model detected or was told
  words: Word[];
}

/** One caption on screen: one or two lines of words, shown from its first word's start to its last word's end. */
export interface CaptionLine {
  words: Word[];
  start: Flicks;
  end: Flicks;
}

/** How captions are cut from the words: the usual subtitle limits (42 characters a line, two lines, at most 7 s
 * on screen), and a new caption at each sentence's end and at each pause long enough to be heard as one. */
export interface CaptionShape {
  charactersPerLine: number;
  lines: number;
  longestSeconds: number;
  pauseSeconds: number;
}

export const SUBTITLES: CaptionShape = { charactersPerLine: 42, lines: 2, longestSeconds: 7, pauseSeconds: 0.6 };

/** The words cut into captions, in order, each word in exactly one. */
export function captionLines(words: readonly Word[], shape: CaptionShape = SUBTITLES): CaptionLine[] {
  const captions: CaptionLine[] = [];
  const room = shape.charactersPerLine * shape.lines;
  let current: Word[] = [];
  let characters = 0;
  const close = () => {
    if (!current.length) return;
    captions.push({ words: current, start: current[0]!.start, end: current.at(-1)!.end });
    current = [];
    characters = 0;
  };
  for (const word of words) {
    const last = current.at(-1);
    const added = (characters ? 1 : 0) + word.text.length;
    const tooLong = current.length > 0 && (word.end - current[0]!.start) / FLICKS_PER_SECOND > shape.longestSeconds;
    const paused = last !== undefined && (word.start - last.end) / FLICKS_PER_SECOND >= shape.pauseSeconds;
    if (current.length && (characters + added > room || tooLong || paused)) close();
    current.push(word);
    characters += (characters ? 1 : 0) + word.text.length;
    if (/[.!?…]["”’)]?$/.test(word.text)) close(); // a sentence's end ends its caption
  }
  close();
  return captions;
}

/** A caption's text broken into at most `shape.lines` lines of about equal length, never splitting a word. */
export function captionText(caption: CaptionLine, shape: CaptionShape = SUBTITLES): string[] {
  const text = caption.words.map((word) => word.text);
  const whole = text.join(" ");
  if (whole.length <= shape.charactersPerLine || shape.lines < 2) return [whole];
  // The break that makes the two lines most even, the top line never longer than allowed.
  let best = 1;
  let bestGap = Infinity;
  for (let split = 1; split < text.length; split++) {
    const top = text.slice(0, split).join(" ").length;
    const bottom = text.slice(split).join(" ").length;
    if (top > shape.charactersPerLine) break;
    const gap = Math.abs(top - bottom);
    if (gap < bestGap) [best, bestGap] = [split, gap];
  }
  return [text.slice(0, best).join(" "), text.slice(best).join(" ")];
}
