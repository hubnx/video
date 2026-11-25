/**
 * The preview: the video drawn on a canvas with its captions, play and pause, the time, and a bar to move through it.
 * The bar gives way to the timeline on day 5 (docs/plan.md › Build order). The canvas carries the drawn frame's time and
 * the clock's as data, which the preview check reads (scripts/check-preview.ts).
 */
import { element } from "./dom.ts";
import { captionAt, drawCaption, type CaptionStyle } from "./preview/captions.ts";
import { SoundClock, SteadyClock } from "./preview/clock.ts";
import { Compositor } from "./preview/compositor.ts";
import { Frames } from "./preview/frames.ts";
import { Player } from "./preview/player.ts";
import type { CaptionLine } from "./shared/transcript.ts";
import { flicksOf } from "./shared/time.ts";
import { words } from "./words.ts";

/** "1:05" or "1:02:05". */
export function clockTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const [hours, minutes, rest] = [Math.floor(whole / 3600), Math.floor((whole % 3600) / 60), whole % 60];
  const two = (value: number) => String(value).padStart(2, "0");
  return hours ? `${hours}:${two(minutes)}:${two(rest)}` : `${minutes}:${two(rest)}`;
}

export interface Preview {
  element: HTMLElement;
  seek(seconds: number): void;
  /** The captions to draw, and their style; an empty list draws none. */
  setCaptions(captions: readonly CaptionLine[], style: CaptionStyle): void;
  /** Called with the clip's time at each frame drawn and each seek. */
  onTime(listener: (seconds: number) => void): void;
  /** The stretches taken out, which playing jumps over. */
  setSkips(skips: { start: number; end: number }[]): void;
  /** Plays from `seconds` to `until`, then stops: to hear a cut just made. */
  playStretch(seconds: number, until: number): void;
  /** Where in the clip the preview is, in seconds. */
  readonly time: number;
  togglePlay(): void;
}

/** The preview of the file at `address`, or null when this computer can't decode its picture. */
export async function previewView(address: string, duration: number): Promise<Preview | null> {
  const frames = await Frames.open(address);
  if (!frames) return null;
  const clock = (await SoundClock.open(address)) ?? new SteadyClock();
  const canvas = element("canvas", { className: "preview-canvas", attributes: { "aria-label": words.preview.label } });
  const compositor = new Compositor(canvas);
  const playButton = element("button", { type: "button", className: "play" });
  const time = element("span", { className: "preview-time" });
  const bar = element("input", { type: "range", className: "preview-bar", min: "0", max: String(duration), step: "any", value: "0",
    attributes: { "aria-label": words.preview.position } });
  const timeListeners: ((seconds: number) => void)[] = [];

  const update = () => {
    playButton.textContent = player.playing ? words.preview.pause : words.preview.play;
    time.textContent = `${clockTime(player.time)} / ${clockTime(duration)}`;
    if (document.activeElement !== bar) bar.value = String(player.time);
    canvas.dataset.drawn = String(player.drawnTimestamp ?? "");
    canvas.dataset.clock = String(player.time);
    for (const listener of [...timeListeners]) listener(player.time); // a copy: a listener may remove itself
  };
  const player = new Player(frames, clock, compositor, duration, update);
  playButton.addEventListener("click", () => (player.playing ? player.pause() : player.play()));
  bar.addEventListener("input", () => void player.seek(Number(bar.value)));

  // The captions' own canvas, the picture's size, laid over each frame (compositor.ts › drawOverlay).
  const overlay = new OffscreenCanvas(1, 1);
  const overlayContext = overlay.getContext("2d")!;
  const setCaptions = (captions: readonly CaptionLine[], style: CaptionStyle) => {
    player.setOverlay(captions.length ? (shown, size) => {
      if (overlay.width !== size.width || overlay.height !== size.height) [overlay.width, overlay.height] = [size.width, size.height];
      const frame = { start: flicksOf(shown.start), end: flicksOf(shown.end) };
      // The caption showing at the frame's middle; its lit word, the last said while the frame shows.
      drawCaption(overlayContext, overlay.width, overlay.height, captionAt(captions, flicksOf((shown.start + shown.end) / 2)), frame, style);
      return overlay;
    } : null);
  };
  await player.seek(0);

  return {
    element: element("div", { className: "preview" }, canvas, element("div", { className: "preview-controls" }, playButton, bar, time)),
    seek: (seconds) => void player.seek(seconds),
    setCaptions,
    onTime: (listener) => timeListeners.push(listener),
    setSkips: (skips) => player.setSkips(skips),
    get time() {
      return player.time;
    },
    togglePlay: () => (player.playing ? player.pause() : player.play()),
    playStretch: (seconds, until) => {
      void player.seek(seconds).then(() => {
        player.play();
        const stopAt = (now: number) => {
          if (now < until && player.playing) return;
          // Gone before pausing: pausing tells every listener the time, and this one would pause again, without end.
          timeListeners.splice(timeListeners.indexOf(stopAt), 1);
          player.pause();
        };
        timeListeners.push(stopAt);
      });
    },
  };
}
