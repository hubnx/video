/**
 * Plays a clip in the preview: the frame for each moment of the clock (the sound's), drawn by the compositor. Seeking
 * shows the exact frame at that moment; a newer seek makes an older one's frame unwanted, and it's dropped unseen.
 * Every frame taken from the decoder is closed here once it's drawn or passed over.
 */
import type { VideoSample } from "mediabunny";
import type { Clock } from "./clock.ts";
import type { Compositor, QuarterTurns, View } from "./compositor.ts";
import type { Frames } from "./frames.ts";

/** Frames decoded ahead while playing: enough to ride over a slow one, few enough to hold little memory at 4K. */
const AHEAD = 4;

/** What's laid over each frame (the captions), given the frame's time on screen in seconds and the size in pixels the
 * picture fills; null for nothing. */
export type Overlay = (shown: { start: number; end: number }, size: { width: number; height: number }) => TexImageSource | null;

/** The part of the picture shown at a moment of the clip, in seconds (a short's window, a punch-in); null shows it all. */
export type ViewAt = ((seconds: number) => View) | null;

export class Player {
  private readonly frames: Frames;
  private clock: Clock;
  private readonly compositor: Compositor;
  private readonly duration: number;
  private readonly changed: () => void;
  private seekGeneration = 0;
  private playGeneration = 0;
  private queue: VideoSample[] = [];
  /** Wakes the decoder when the queue has room again: event-driven, as a polling timer is slowed to once a second in a
   * window Chromium thinks is hidden, and playing stalled (the clean-up check, 2026-11-24). */
  private queueRoom: (() => void) | null = null;
  /** The frame on the canvas, kept so it can be drawn again under a changed overlay while paused. */
  private shown: VideoSample | null = null;
  private overlay: Overlay | null = null;
  private viewAt: ViewAt = null;
  /** Stretches of the clip taken out, in seconds, sorted: playing jumps over them (the edit, src/edit/timeline.ts). A
   * jump in the preview; export joins the pieces with a short crossfade (day 7). */
  private skips: { start: number; end: number }[] = [];
  /** The timestamp of the frame on the canvas: the checks compare it with the clock (scripts/check-preview.ts). */
  drawnTimestamp: number | null = null;
  /** The part of the picture that frame shows: the shorts check follows the speaker with it (scripts/check-shorts.ts). */
  drawnView: View | null = null;

  constructor(frames: Frames, clock: Clock, compositor: Compositor, duration: number, changed: () => void) {
    this.frames = frames;
    this.clock = clock;
    this.compositor = compositor;
    this.duration = duration;
    this.changed = changed;
  }

  /** Plays its sound from another clock (the clean voice, or the original's again), at the same moment, playing on if
   * it was. */
  replaceClock(clock: Clock): void {
    const at = this.clock.now();
    const wasPlaying = this.clock.playing;
    this.stopPlaying();
    this.clock.close();
    this.clock = clock;
    this.clock.moveTo(at);
    if (wasPlaying) this.play();
    this.changed();
  }

  setSkips(skips: { start: number; end: number }[]): void {
    this.skips = [...skips].sort((one, other) => one.start - other.start);
  }

  /** Sets the part of the picture shown at each moment, and draws the frame showing again in it. */
  setView(viewAt: ViewAt): void {
    this.viewAt = viewAt;
    if (this.shown && !this.clock.playing) {
      this.draw(this.shown);
      this.changed();
    }
  }

  /** Sets what's laid over each frame, and draws the frame showing again under it. */
  setOverlay(overlay: Overlay | null): void {
    this.overlay = overlay;
    if (this.shown && !this.clock.playing) this.draw(this.shown);
  }

  get time(): number {
    return this.clock.now();
  }

  get playing(): boolean {
    return this.clock.playing;
  }

  /** Shows the frame at `seconds`, and plays on from there if playing. */
  async seek(seconds: number): Promise<void> {
    const at = Math.min(Math.max(0, seconds), this.duration);
    const generation = ++this.seekGeneration;
    const wasPlaying = this.clock.playing;
    this.stopPlaying();
    this.clock.moveTo(at);
    const sample = await this.frames.at(at);
    if (generation !== this.seekGeneration) {
      sample?.close();
      return;
    }
    if (sample) this.show(sample);
    this.changed();
    if (wasPlaying) this.play();
  }

  play(): void {
    if (this.clock.playing) return;
    const from = this.clock.now() >= this.duration ? 0 : this.clock.now();
    const generation = ++this.playGeneration;
    this.clock.play(from);
    void this.decodeAhead(from, generation);
    const tick = () => {
      if (generation !== this.playGeneration) return;
      const now = this.clock.now();
      const skip = this.skips.find((each) => now >= each.start && now < each.end);
      if (skip) {
        void this.seek(skip.end); // keeps playing from there
        return;
      }
      this.showFrameForNow();
      if (this.clock.now() >= this.duration) {
        this.pause();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    this.changed();
  }

  pause(): void {
    this.stopPlaying();
    this.clock.pause();
    this.changed();
  }

  close(): void {
    this.pause();
    this.shown?.close();
    this.shown = null;
    this.frames.close();
    this.clock.close();
  }

  /** Draws `sample` and keeps it as the frame showing, closing the one before. */
  private show(sample: VideoSample): void {
    this.draw(sample);
    this.shown?.close();
    this.shown = sample;
  }

  /** Draws the last decoded frame whose moment has come, closing those passed over. */
  private showFrameForNow(): void {
    const now = this.clock.now();
    let due: VideoSample | null = null;
    while (this.queue.length && this.queue[0]!.timestamp <= now) {
      due?.close();
      due = this.queue.shift()!;
    }
    if (due) this.wakeDecoder();
    if (due) {
      this.show(due);
      this.changed();
    }
  }

  private async decodeAhead(from: number, generation: number): Promise<void> {
    for await (const sample of this.frames.from(from)) {
      if (generation !== this.playGeneration) {
        sample.close();
        return;
      }
      this.queue.push(sample);
      while (generation === this.playGeneration && this.queue.length >= AHEAD) await new Promise<void>((resolve) => (this.queueRoom = resolve));
    }
  }

  private stopPlaying(): void {
    this.playGeneration++;
    for (const sample of this.queue) sample.close();
    this.queue = [];
    this.wakeDecoder(); // so a decoder waiting for room sees it's been stopped
  }

  private wakeDecoder(): void {
    const wake = this.queueRoom;
    this.queueRoom = null;
    wake?.();
  }

  private draw(sample: VideoSample): void {
    const frame = sample.toVideoFrame();
    try {
      // The view at the clock's moment, kept within this frame: after a cut the clock is already in the new stretch while
      // the frame showing began before it, and the export takes the same moment (export-video.ts).
      const moment = Math.min(Math.max(this.clock.now(), sample.timestamp), sample.timestamp + sample.duration - 1e-6);
      this.drawnView = this.viewAt?.(moment) ?? null;
      this.compositor.draw(frame, sample.squarePixelWidth, sample.squarePixelHeight, (sample.rotation / 90) as QuarterTurns, this.drawnView ?? undefined);
      const over = this.overlay?.({ start: sample.timestamp, end: sample.timestamp + sample.duration }, this.compositor.pictureSize);
      if (over) this.compositor.drawOverlay(over);
      this.drawnTimestamp = sample.timestamp;
    } finally {
      frame.close();
    }
  }
}
