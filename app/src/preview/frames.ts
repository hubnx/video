/**
 * A clip's frames, read from media:// in pieces by Mediabunny and decoded by the computer's own decoder (WebCodecs):
 * the frame at a moment, by its timestamp (so a phone's varying frame rate lines up without converting it), or every
 * frame from a moment on, for playing. Each frame handed out must be closed by whoever takes it: unclosed frames stall
 * the decoder (docs/research/engine-stack.md › Traps › Memory).
 */
import { ALL_FORMATS, Input, UrlSource, VideoSampleSink, type VideoSample } from "mediabunny";

export class Frames {
  private readonly input: Input;
  private readonly sink: VideoSampleSink;

  private constructor(input: Input, sink: VideoSampleSink) {
    this.input = input;
    this.sink = sink;
  }

  static async open(address: string): Promise<Frames | null> {
    const input = new Input({ source: new UrlSource(address), formats: ALL_FORMATS });
    const track = await input.getPrimaryVideoTrack();
    if (!track || !(await track.canDecode())) {
      input.dispose();
      return null;
    }
    return new Frames(input, new VideoSampleSink(track));
  }

  /** The frame showing at `seconds`, or null past the end. A hair past the moment asked, as time.ts › frameAt, so a
   * frame's own start (k / rate, which seconds can't hold exactly) never lands on the frame before it. */
  at(seconds: number): Promise<VideoSample | null> {
    return this.sink.getSample(seconds + 1e-6);
  }

  /** Every frame from the one showing at `seconds`, in the order shown. */
  from(seconds: number): AsyncGenerator<VideoSample, void, unknown> {
    return this.sink.samples(seconds);
  }

  close(): void {
    this.input.dispose();
  }
}
