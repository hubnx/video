/**
 * Plays a clip in the preview: the frame for each moment of the clock (the sound's), drawn by the compositor. Seeking
 * shows the exact frame at that moment; a newer seek makes an older one's frame unwanted, and it's dropped unseen.
 * Every frame taken from the decoder is closed here once it's drawn or passed over.
 */
import type { VideoSample } from "mediabunny";
import type { Clock } from "./clock.ts";
import type { Compositor, QuarterTurns } from "./compositor.ts";
import type { Frames } from "./frames.ts";

/** Frames decoded ahead while playing: enough to ride over a slow one, few enough to hold little memory at 4K. */
const AHEAD = 4;

/** What's laid over each frame (the captions), given its moment in seconds and the size in pixels the picture fills;
 * null for nothing. */
export type Overlay = (seconds: number, size: { width: number; height: number }) => TexImageSource | null;

export class Player {
  private readonly frames: Frames;
  private readonly clock: Clock;
  private readonly compositor: Compositor;
  private readonly duration: number;
  private readonly changed: () => void;
  private seekGeneration = 0;
  private playGeneration = 0;
  private queue: VideoSample[] = [];
  /** The frame on the canvas, kept so it can be drawn again under a changed overlay while paused. */
  private shown: VideoSample | null = null;
  private overlay: Overlay | null = null;
  /** The timestamp of the frame on the canvas: the checks compare it with the clock (scripts/check-preview.ts). */
  drawnTimestamp: number | null = null;

  constructor(frames: Frames, clock: Clock, compositor: Compositor, duration: number, changed: () => void) {
    this.frames = frames;
    this.clock = clock;
    this.compositor = compositor;
    this.duration = duration;
    this.changed = changed;
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
      while (generation === this.playGeneration && this.queue.length >= AHEAD) await new Promise((resolve) => setTimeout(resolve, 5));
    }
  }

  private stopPlaying(): void {
    this.playGeneration++;
    for (const sample of this.queue) sample.close();
    this.queue = [];
  }

  private draw(sample: VideoSample): void {
    const frame = sample.toVideoFrame();
    try {
      this.compositor.draw(frame, sample.squarePixelWidth, sample.squarePixelHeight, (sample.rotation / 90) as QuarterTurns);
      // The frame's middle: a word that starts while the frame shows is the word lit on it, paused or playing.
      const over = this.overlay?.(sample.timestamp + sample.duration / 2, this.compositor.pictureSize);
      if (over) this.compositor.drawOverlay(over);
      this.drawnTimestamp = sample.timestamp;
    } finally {
      frame.close();
    }
  }
}
