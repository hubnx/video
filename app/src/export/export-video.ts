/**
 * Export's picture, made in the window: every frame of the edit at a steady rate, drawn by the preview's own compositor
 * and captions (so the export is what the preview showed), encoded to H.264 on the computer's own encoder where it has
 * one (docs/plan.md › How it's built: its patents are the system's), and written as an MP4 a piece at a time through the
 * main process, which then adds the sound (electron/exports.ts). Frames are read from the clip by timestamp, so a phone's
 * varying frame rate lands on the steady one without drift.
 */
import { ALL_FORMATS, canEncodeVideo, CanvasSource, Input, Mp4OutputFormat, Output, Quality, StreamTarget, UrlSource, VideoSampleSink, type VideoSample } from "mediabunny";
import { captionAt, drawCaption, type CaptionLook, type CaptionStyle } from "../preview/captions.ts";
import { Compositor, type QuarterTurns } from "../preview/compositor.ts";
import type { ViewAt } from "../preview/player.ts";
import type { Segment } from "../shared/project.ts";
import { flicksOf, secondsOf } from "../shared/time.ts";
import type { CaptionLine } from "../shared/transcript.ts";

export interface ExportPicture {
  address: string; // media:// of the file the picture comes from: the original, or its edit copy
  segments: Segment[];
  width: number; // the output's size, upright
  height: number;
  frameRate: number;
  bitrate: number;
  /** Captions burned into the picture, or null for none (an SRT file beside it instead, or nothing). */
  captions: { lines: readonly CaptionLine[]; style: CaptionStyle; look: CaptionLook } | null;
  /** The part of the picture shown at each moment, as the preview showed it (a short's window, a punch-in). */
  view: ViewAt;
}

/** Writes the picture; `write` takes each piece of the MP4 at its place, `progress` how far it's got. */
export async function exportPicture(plan: ExportPicture, write: (position: number, data: Uint8Array) => Promise<void>,
  progress: (fraction: number) => void, signal: AbortSignal): Promise<void> {
  const input = new Input({ source: new UrlSource(plan.address), formats: ALL_FORMATS });
  let compositor: Compositor | null = null;
  let output: Output | null = null;
  let last: VideoSample | null = null;
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) throw new Error("EXPORT_NO_PICTURE");
    const sink = new VideoSampleSink(track);
    const canvas = new OffscreenCanvas(plan.width, plan.height);
    compositor = new Compositor(canvas);
    const overlay = new OffscreenCanvas(plan.width, plan.height);
    const overlayContext = overlay.getContext("2d")!;
    // The window's writes come one after another, so the main process gets each piece in order and the queue stays short.
    output = new Output({
      format: new Mp4OutputFormat(),
      target: new StreamTarget(new WritableStream({ write: (chunk) => write(chunk.position, chunk.data) }), { chunked: true, chunkSize: 8 * 1024 * 1024 }),
    });
    // A bitrate goes in as { bitrate }: a bare number is a 0-1 quality level (CLAUDE.md › Traps).
    const quality = new Quality({ bitrate: plan.bitrate, bitrateMode: "variable" });
    const source = new CanvasSource(canvas, { codec: "avc", quality, keyFrameInterval: 2,
      hardwareAcceleration: await encoderAcceleration(plan.width, plan.height, plan.frameRate, quality) });
    output.addVideoTrack(source, { frameRate: plan.frameRate });
    await output.start();

    const frameSeconds = 1 / plan.frameRate;
    const totalSeconds = plan.segments.reduce((sum, segment) => sum + secondsOf(segment.to) - secondsOf(segment.from), 0);
    const totalFrames = Math.max(1, Math.round(totalSeconds * plan.frameRate));
    let frame = 0;
    let segmentStart = 0; // the timeline's seconds at the segment's start
    for (const segment of plan.segments) {
      const from = secondsOf(segment.from);
      const length = secondsOf(segment.to) - from;
      // This segment's frames: each output frame's start on the timeline, and the clip's moment it shows.
      const frames: number[] = [];
      while (frame + frames.length < totalFrames && (frame + frames.length) * frameSeconds < segmentStart + length - 1e-9) frames.push(frame + frames.length);
      const sourceTimes = frames.map((index) => from + (index * frameSeconds - segmentStart) + 1e-6);
      let shownAt = 0; // which of sourceTimes this sample is for
      for await (const sample of sink.samplesAtTimestamps(sourceTimes)) {
        // The view at the moment of the clip this output frame shows, never its decoded frame's middle: a cut lands
        // between frames, and the frame after it often began before the cut, so its middle would take the stretch
        // before's view (the 1.1 review: one unzoomed frame at the start of every punch-in).
        const moment = sourceTimes[shownAt++]!;
        if (signal.aborted) {
          if (sample !== last) sample?.close();
          throw new Error("EXPORT_CANCELLED");
        }
        // A moment past the clip's last frame shows that last frame again.
        if (sample) {
          last?.close();
          last = sample;
        }
        if (last) {
          const picture = last.toVideoFrame();
          try {
            compositor.draw(picture, last.squarePixelWidth, last.squarePixelHeight, (last.rotation / 90) as QuarterTurns,
              plan.view?.(moment) ?? undefined);
          } finally {
            picture.close();
          }
          if (plan.captions) {
            const shown = { start: flicksOf(last.timestamp), end: flicksOf(last.timestamp + last.duration) };
            drawCaption(overlayContext, overlay.width, overlay.height, captionAt(plan.captions.lines, flicksOf(last.timestamp + last.duration / 2)), shown, plan.captions.style, plan.captions.look);
            compositor.drawOverlay(overlay);
          }
        }
        await source.add(frame * frameSeconds, frameSeconds);
        frame++;
        progress(frame / totalFrames);
      }
      segmentStart += length;
    }
    await output.finalize();
  } catch (error) {
    await output?.cancel().catch(() => undefined);
    throw error;
  } finally {
    last?.close();
    compositor?.release(); // a context per export would otherwise wait for collection, and Chromium drops the oldest: the preview's
    input.dispose();
  }
}

/** The graphics chip's H.264 encoder where there is one, else the browser's own: asked for alone, a computer without
 * one (GitHub's Windows, a virtual machine, an older PC) refused the export outright (the fresh-install check,
 * 2026-11-25: "not supported in this environment"). */
async function encoderAcceleration(width: number, height: number, frameRate: number, quality: Quality): Promise<HardwareAcceleration> {
  for (const hardwareAcceleration of ["prefer-hardware", "no-preference", "prefer-software"] as const) {
    if (await canEncodeVideo("avc", { width, height, frameRate, quality, hardwareAcceleration })) return hardwareAcceleration;
  }
  throw new Error("EXPORT_NO_H264_ENCODER");
}
