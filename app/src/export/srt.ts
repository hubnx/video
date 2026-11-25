/**
 * Captions as an SRT file beside the exported video: each caption timed where it plays in the edit, not in the clip, so
 * a cut before it moves it earlier; words taken out are gone (the editor gives only the words kept). The SRT format is
 * the one every player and YouTube reads: a number, "hh:mm:ss,mmm --> hh:mm:ss,mmm", the lines, a blank line.
 */
import { timelineAt } from "../edit/timeline.ts";
import type { Segment } from "../shared/project.ts";
import { secondsOf, type Flicks } from "../shared/time.ts";
import { captionLines, captionText, type Word } from "../shared/transcript.ts";

/** "00:01:02,345". */
export function srtTime(seconds: number): string {
  const milliseconds = Math.max(0, Math.round(seconds * 1000));
  const two = (value: number) => String(value).padStart(2, "0");
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const rest = Math.floor((milliseconds % 60_000) / 1000);
  return `${two(hours)}:${two(minutes)}:${two(rest)},${String(milliseconds % 1000).padStart(3, "0")}`;
}

/** The SRT of `words` (those kept, as the captions show them) played through `segments`. */
export function srt(words: readonly Word[], segments: readonly Segment[]): string {
  const cues: string[] = [];
  for (const caption of captionLines(words)) {
    // Where its first and last words play; a caption whose words are all taken out has none.
    const starts = caption.words.map((word) => timelineAt(segments, word.start)).filter((time): time is Flicks => time !== null);
    const ends = caption.words.map((word) => endOn(segments, word)).filter((time): time is Flicks => time !== null);
    if (!starts.length || !ends.length) continue;
    const start = secondsOf(Math.min(...starts) as Flicks);
    const end = secondsOf(Math.max(...ends) as Flicks);
    cues.push(`${cues.length + 1}\n${srtTime(start)} --> ${srtTime(Math.max(end, start + 0.2))}\n${captionText(caption).join("\n")}\n`);
  }
  return cues.join("\n");
}

/** Where a word stops playing: its own end, or, when a cut takes its tail (a word is kept by its middle), the end of the
 * piece of the edit it starts in; null for a word that doesn't play. */
function endOn(segments: readonly Segment[], word: Word): Flicks | null {
  const own = timelineAt(segments, (word.end - 1) as Flicks);
  if (own !== null) return own;
  const piece = segments.find((segment) => segment.from <= word.start && word.start < segment.to);
  return piece ? timelineAt(segments, (piece.to - 1) as Flicks) : null;
}
