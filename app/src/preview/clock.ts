/**
 * The preview's clock: the sound's, when the clip has sound, so the picture follows what is heard (a picture timed by
 * its own clock drifts from the sound within minutes); a steady clock when it has none. Times are in seconds of the
 * clip, as the decoders give them.
 */
import { ALL_FORMATS, AudioBufferSink, Input, UrlSource } from "mediabunny";
import { logProblem } from "../problems.ts";

export interface Clock {
  /** Where in the clip it is now: what is being heard this moment, the speakers' delay taken off. */
  now(): number;
  play(fromSeconds: number): void;
  pause(): void;
  /** Stands still at `seconds`, stopped: where a seek leaves it. */
  moveTo(seconds: number): void;
  readonly playing: boolean;
  close(): void;
}

/** How far ahead of the speakers the sound is scheduled: enough that a busy moment never starves them. */
const SCHEDULE_AHEAD_SECONDS = 1;

export class SoundClock implements Clock {
  private readonly context = new AudioContext({ latencyHint: "playback" });
  private readonly input: Input;
  private readonly sink: AudioBufferSink;
  private startedAt = 0; // the context's time at which `from` plays
  private from = 0;
  private pausedAt = 0;
  private playingNow = false;
  private generation = 0; // a pause or a new play ends the scheduling loop of the last one
  private readonly nodes = new Set<AudioBufferSourceNode>();

  private constructor(input: Input, sink: AudioBufferSink) {
    this.input = input;
    this.sink = sink;
  }

  /** The clip's sound, or null when it has none the window can decode. */
  static async open(address: string): Promise<SoundClock | null> {
    const input = new Input({ source: new UrlSource(address), formats: ALL_FORMATS });
    const track = await input.getPrimaryAudioTrack();
    if (!track || !(await track.canDecode())) {
      input.dispose();
      return null;
    }
    return new SoundClock(input, new AudioBufferSink(track));
  }

  get playing(): boolean {
    return this.playingNow;
  }

  now(): number {
    if (!this.playingNow) return this.pausedAt;
    const heard = this.context.currentTime - (this.context.outputLatency || 0) - this.context.baseLatency;
    return Math.max(this.from, this.from + heard - this.startedAt);
  }

  play(fromSeconds: number): void {
    this.stopSound();
    const generation = ++this.generation;
    void this.context.resume();
    this.from = fromSeconds;
    this.startedAt = this.context.currentTime + 0.05; // a moment to schedule the first buffers
    this.playingNow = true;
    void this.schedule(generation);
  }

  pause(): void {
    this.moveTo(this.now());
  }

  moveTo(seconds: number): void {
    this.pausedAt = seconds;
    this.playingNow = false;
    this.generation++;
    this.stopSound();
  }

  close(): void {
    this.pause();
    void this.context.close();
    this.input.dispose();
  }

  private async schedule(generation: number): Promise<void> {
    try {
      await this.scheduleFrom(generation);
    } catch (error) {
      // A pause, a new play or closing (the clean voice swapped in) ends this loop on purpose, and its reader may then
      // throw "Input has been disposed"; anything else is a real failure.
      if (generation === this.generation) logProblem("sound_unplayed", error);
    }
  }

  private async scheduleFrom(generation: number): Promise<void> {
    for await (const { buffer, timestamp } of this.sink.buffers(this.from)) {
      if (generation !== this.generation) return;
      const node = this.context.createBufferSource();
      node.buffer = buffer;
      node.connect(this.context.destination);
      const when = this.startedAt + (timestamp - this.from);
      // A buffer that starts before `from` (the one the moment falls in) plays from that moment into it.
      const offset = Math.max(0, this.from - timestamp);
      node.start(Math.max(when + offset, this.context.currentTime), offset);
      node.onended = () => this.nodes.delete(node);
      this.nodes.add(node);
      // Never decode the whole clip ahead: wait while enough is scheduled.
      while (generation === this.generation && when - this.context.currentTime > SCHEDULE_AHEAD_SECONDS) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  private stopSound(): void {
    for (const node of this.nodes) node.stop();
    this.nodes.clear();
  }
}

/** For a clip with no sound: the time that has passed, from the moment play was pressed. */
export class SteadyClock implements Clock {
  private from = 0;
  private startedAt = 0;
  private playingNow = false;

  get playing(): boolean {
    return this.playingNow;
  }

  now(): number {
    return this.playingNow ? this.from + (performance.now() - this.startedAt) / 1000 : this.from;
  }

  play(fromSeconds: number): void {
    this.from = fromSeconds;
    this.startedAt = performance.now();
    this.playingNow = true;
  }

  pause(): void {
    this.moveTo(this.now());
  }

  moveTo(seconds: number): void {
    this.from = seconds;
    this.playingNow = false;
  }

  close(): void {
    this.pause();
  }
}
