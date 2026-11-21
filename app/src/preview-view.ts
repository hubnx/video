/**
 * The preview: the video drawn on a canvas, play and pause, the time, and a bar to move through it. The bar gives way
 * to the timeline on day 5 (docs/plan.md › Build order). The canvas carries the drawn frame's time and the clock's as
 * data, which the preview check reads (scripts/check-preview.ts).
 */
import { element } from "./dom.ts";
import { SoundClock, SteadyClock } from "./preview/clock.ts";
import { Compositor } from "./preview/compositor.ts";
import { Frames } from "./preview/frames.ts";
import { Player } from "./preview/player.ts";
import { words } from "./words.ts";

/** "1:05" or "1:02:05". */
export function clockTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const [hours, minutes, rest] = [Math.floor(whole / 3600), Math.floor((whole % 3600) / 60), whole % 60];
  const two = (value: number) => String(value).padStart(2, "0");
  return hours ? `${hours}:${two(minutes)}:${two(rest)}` : `${minutes}:${two(rest)}`;
}

/** The preview of the file at `address`, or null when this computer can't decode its picture. */
export async function previewView(address: string, duration: number): Promise<HTMLElement | null> {
  const frames = await Frames.open(address);
  if (!frames) return null;
  const clock = (await SoundClock.open(address)) ?? new SteadyClock();
  const canvas = element("canvas", { className: "preview-canvas", attributes: { "aria-label": words.preview.label } });
  const compositor = new Compositor(canvas);
  const playButton = element("button", { type: "button", className: "play" });
  const time = element("span", { className: "preview-time" });
  const bar = element("input", { type: "range", className: "preview-bar", min: "0", max: String(duration), step: "any", value: "0",
    attributes: { "aria-label": words.preview.position } });

  const update = () => {
    playButton.textContent = player.playing ? words.preview.pause : words.preview.play;
    time.textContent = `${clockTime(player.time)} / ${clockTime(duration)}`;
    if (document.activeElement !== bar) bar.value = String(player.time);
    canvas.dataset.drawn = String(player.drawnTimestamp ?? "");
    canvas.dataset.clock = String(player.time);
  };
  const player = new Player(frames, clock, compositor, duration, update);
  playButton.addEventListener("click", () => (player.playing ? player.pause() : player.play()));
  bar.addEventListener("input", () => void player.seek(Number(bar.value)));
  await player.seek(0);

  return element("div", { className: "preview" }, canvas,
    element("div", { className: "preview-controls" }, playButton, bar, time));
}
