/**
 * Captions drawn on a picture: the caption showing at a moment, in a style. Drawn on a 2D canvas the picture's size,
 * which the compositor lays over the frame, so the preview and the export (day 7) draw captions the same way.
 */
import type { Choices } from "../shared/project.ts";
import { captionText, SHORTS_CAPTIONS, SUBTITLES, type CaptionLine, type CaptionShape } from "../shared/transcript.ts";
import type { Flicks } from "../shared/time.ts";

/** Release 1's styles (docs/plan.md › What each release has): plain subtitles, and the same with each word lit as
 * it's said, the look people come from CapCut for. */
export const CAPTION_STYLES = ["subtitles", "wordByWord"] as const satisfies readonly Choices["captionStyle"][];
export type CaptionStyle = Choices["captionStyle"];

/** The lit word's colour: a warm yellow that reads on any picture under the outline. */
const LIT = "#ffd84d";

/** Where captions sit and how big: a video's subtitles along the bottom, or a short's few big words in its lower third,
 * above the bottom fifth and clear of the right edge, where phones lay their buttons and descriptions (YouTube's,
 * TikTok's and Instagram's own safe-zone guides). */
export type CaptionLook = "video" | "shorts";

interface Look {
  shape: CaptionShape;
  size: (width: number, height: number) => number;
  weight: number;
  /** The share of the picture's width the widest line may take: a longer one is drawn smaller. */
  widest: number;
  /** The last line's baseline. */
  bottom: (height: number, size: number) => number;
}

const LOOKS: Record<CaptionLook, Look> = {
  video: { shape: SUBTITLES, size: (width, height) => Math.min(height * 0.055, width * 0.045), weight: 600, widest: 0.94, bottom: (height, size) => height - size * 1.2 },
  shorts: { shape: SHORTS_CAPTIONS, size: (width) => width * 0.085, weight: 800, widest: 0.8, bottom: (height) => height * 0.7 },
};

/** How a look cuts the words into captions (shared/transcript.ts › captionLines). */
export function captionShape(look: CaptionLook): CaptionShape {
  return LOOKS[look].shape;
}

/** A frame's time on screen: from its start to the next frame's. */
export interface FrameTime {
  start: Flicks;
  end: Flicks;
}

/** Draws `caption` (null: none showing) on a transparent canvas `width` × `height`, as it looks on the frame `shown`. The
 * word lit is the last one said while that frame shows, so a word clicked in the transcript, which starts partway into a
 * frame, is the word lit on it (gate on day 4: export equals preview, and paused they agree). */
export function drawCaption(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number,
  caption: CaptionLine | null, shown: FrameTime, style: CaptionStyle, lookName: CaptionLook = "video"): void {
  context.clearRect(0, 0, width, height);
  if (!caption) return;
  const look = LOOKS[lookName];
  const font = (size: number) => `${look.weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  const lines = captionText(caption, look.shape);
  let size = Math.round(look.size(width, height));
  context.font = font(size);
  // A line too wide for the picture (a tall clip's subtitles, a short's long word) is drawn smaller, never cut off.
  const widest = Math.max(...lines.map((line) => context.measureText(line).width));
  if (widest > width * look.widest) {
    size = Math.floor((size * width * look.widest) / widest);
    context.font = font(size);
  }
  context.textBaseline = "alphabetic";
  context.lineJoin = "round";
  context.lineWidth = Math.max(2, size * 0.16);
  context.strokeStyle = "rgba(0, 0, 0, 0.85)";
  const lineHeight = size * 1.3;
  const bottom = look.bottom(height, size);
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
