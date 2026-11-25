/**
 * Captions drawn on a picture: the caption showing at a moment, in a style. Drawn on a 2D canvas the picture's size,
 * which the compositor lays over the frame, so the preview and the export (day 7) draw captions the same way.
 */
import { captionText, type CaptionLine } from "../shared/transcript.ts";
import type { Flicks } from "../shared/time.ts";

/** Release 1's styles (docs/plan.md › What each release has): plain subtitles, and the same with each word lit as
 * it's said, the look people come from CapCut for. */
export const CAPTION_STYLES = ["subtitles", "wordByWord"] as const;
export type CaptionStyle = (typeof CAPTION_STYLES)[number];

/** The lit word's colour: a warm yellow that reads on any picture under the outline. */
const LIT = "#ffd84d";

/** A frame's time on screen: from its start to the next frame's. */
export interface FrameTime {
  start: Flicks;
  end: Flicks;
}

/** Draws `caption` (null: none showing) on a transparent canvas `width` × `height`, as it looks on the frame `shown`. The
 * word lit is the last one said while that frame shows, so a word clicked in the transcript, which starts partway into a
 * frame, is the word lit on it (gate on day 4: export equals preview, and paused they agree). */
export function drawCaption(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number,
  caption: CaptionLine | null, shown: FrameTime, style: CaptionStyle): void {
  context.clearRect(0, 0, width, height);
  if (!caption) return;
  const size = Math.round(Math.min(height * 0.055, width * 0.045));
  context.font = `600 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  context.textBaseline = "alphabetic";
  context.lineJoin = "round";
  context.lineWidth = Math.max(2, size * 0.16);
  context.strokeStyle = "rgba(0, 0, 0, 0.85)";
  const lines = captionText(caption);
  const lineHeight = size * 1.3;
  const bottom = height - size * 1.2;
  const litIndex = style === "wordByWord" ? caption.words.findLastIndex((word) => word.start < shown.end && word.end > shown.start) : -1;
  // Each line's words in order, so a word can be lit where it sits.
  let wordIndex = 0;
  lines.forEach((line, lineIndex) => {
    const words = line.split(" ");
    const y = bottom - (lines.length - 1 - lineIndex) * lineHeight;
    const space = context.measureText(" ").width;
    const widths = words.map((word) => context.measureText(word).width);
    let x = (width - (widths.reduce((sum, each) => sum + each, 0) + space * (words.length - 1))) / 2;
    words.forEach((word, index) => {
      const lit = wordIndex === litIndex;
      context.strokeText(word, x, y);
      context.fillStyle = lit ? LIT : "#ffffff";
      context.fillText(word, x, y);
      x += widths[index]! + space;
      wordIndex++;
    });
  });
}

/** The caption showing at `now`, or null between captions. */
export function captionAt(captions: readonly CaptionLine[], now: Flicks): CaptionLine | null {
  let low = 0;
  let high = captions.length - 1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    const caption = captions[middle]!;
    if (now < caption.start) high = middle - 1;
    else if (now >= caption.end) low = middle + 1;
    else return caption;
  }
  return null;
}
