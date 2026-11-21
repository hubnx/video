/**
 * A video's facts, read by the ffprobe the app carries when the person opens it: its size, rotation, frame rate and
 * whether it varies, colour and bit depth, and its sound. Parsing is apart from running, so the tests check it on
 * ffprobe's own output without a file.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { AudioFacts, ClipFacts, Dynamic, VideoFacts } from "../src/shared/media.ts";

const run = promisify(execFile);
const OPTIONS = { timeout: 30_000, windowsHide: true, maxBuffer: 16 * 1024 * 1024 };
/** How many of the first frames' times are compared to tell a varying frame rate (MLT reads 20; a phone's unevenness
 * shows within the first second). */
const FRAMES_TIMED = 30;

export async function probeClip(ffprobe: string, file: string): Promise<ClipFacts> {
  const streams = (await run(ffprobe, ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], OPTIONS)).stdout;
  // Decoded frames, which come out in the order they're shown; packets come in the order stored, B-frames out of it.
  const frames = (await run(ffprobe, ["-v", "error", "-select_streams", "v:0", "-read_intervals", `%+#${FRAMES_TIMED}`,
    "-show_entries", "frame=pts_time,color_transfer", "-print_format", "json", file], OPTIONS)).stdout;
  return clipFacts(JSON.parse(streams) as ProbeOutput, JSON.parse(frames) as FramesOutput);
}

interface ProbeStream {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  avg_frame_rate?: string;
  r_frame_rate?: string;
  pix_fmt?: string;
  bits_per_raw_sample?: string;
  color_transfer?: string;
  sample_rate?: string;
  channels?: number;
  disposition?: { attached_pic?: number };
  tags?: { rotate?: string };
  side_data_list?: { side_data_type?: string; rotation?: number }[];
}
export interface ProbeOutput {
  streams?: ProbeStream[];
  format?: { duration?: string; format_name?: string };
}
export interface FramesOutput {
  frames?: { pts_time?: string; color_transfer?: string }[];
}

export function clipFacts(output: ProbeOutput, frames: FramesOutput): ClipFacts {
  const streams = output.streams ?? [];
  // A cover picture travels as a video stream too (MP3s, some phone audio): it's not the video.
  const video = streams.find((stream) => stream.codec_type === "video" && !stream.disposition?.attached_pic);
  const audio = streams.find((stream) => stream.codec_type === "audio");
  return {
    durationSeconds: Number(output.format?.duration ?? 0),
    container: output.format?.format_name ?? "",
    video: video ? videoFacts(video, frames.frames ?? []) : null,
    audio: audio ? audioFacts(audio) : null,
  };
}

function videoFacts(stream: ProbeStream, frames: NonNullable<FramesOutput["frames"]>): VideoFacts {
  return {
    codec: stream.codec_name ?? "",
    width: stream.width ?? 0,
    height: stream.height ?? 0,
    rotation: clockwise(stream),
    frameRate: ratio(stream.avg_frame_rate) || ratio(stream.r_frame_rate),
    variableFrameRate: varies(frames.map((frame) => Number(frame.pts_time)).filter(Number.isFinite)),
    bitDepth: bitDepth(stream),
    // The decoded frame's transfer first: FFmpeg 9.0's stream summary left it out for an iPhone-style HLG file whose
    // frames carry it (the import check, 2026-11-21).
    dynamic: dynamicOf(frames.find((frame) => frame.color_transfer)?.color_transfer ?? stream.color_transfer),
  };
}

function audioFacts(stream: ProbeStream): AudioFacts {
  return { codec: stream.codec_name ?? "", sampleRate: Number(stream.sample_rate ?? 0), channels: stream.channels ?? 0 };
}

/** ffprobe's display matrix gives counter-clockwise degrees (-90 for a phone held upright); an old `rotate` tag gives
 * clockwise ones. Both become clockwise quarter turns here, the one place. */
function clockwise(stream: ProbeStream): VideoFacts["rotation"] {
  const matrix = stream.side_data_list?.find((data) => data.side_data_type === "Display Matrix")?.rotation;
  const degrees = matrix !== undefined ? -matrix : Number(stream.tags?.rotate ?? 0);
  const quarter = (((Math.round(degrees / 90) * 90) % 360) + 360) % 360;
  return quarter as VideoFacts["rotation"];
}

function ratio(text: string | undefined): number {
  const [top, bottom] = (text ?? "0/1").split("/").map(Number);
  return top && bottom ? top / bottom : 0;
}

/** Frames at the end of the read that may be missing: reading stops after FRAMES_TIMED packets, and a frame shown
 * among the last ones may sit in a packet stored after them (B-frames), which would read as a long gap. */
const REORDER_TAIL = 4;

/** Varying when the gaps between frames, in the order shown, differ by more than a tenth of the usual gap: a
 * constant 29.97 fps file's gaps differ by rounding alone. */
export function varies(frameTimes: number[]): boolean {
  const times = [...frameTimes].sort((one, other) => one - other).slice(0, -REORDER_TAIL);
  const gaps = times.slice(1).map((time, index) => time - times[index]!).filter((gap) => gap > 0);
  if (gaps.length < 3) return false;
  const usual = [...gaps].sort((one, other) => one - other)[Math.floor(gaps.length / 2)]!;
  return gaps.some((gap) => Math.abs(gap - usual) > usual / 10);
}

function bitDepth(stream: ProbeStream): number {
  const raw = Number(stream.bits_per_raw_sample);
  if (raw) return raw;
  const fromFormat = /p(\d{2})(le|be)$/.exec(stream.pix_fmt ?? "")?.[1];
  return fromFormat ? Number(fromFormat) : 8;
}

function dynamicOf(transfer: string | undefined): Dynamic {
  if (transfer === "arib-std-b67") return "hlg"; // iPhones' HDR, Dolby Vision 8.4's base layer included
  if (transfer === "smpte2084") return "pq";
  return "sdr";
}
