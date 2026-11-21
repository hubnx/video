/**
 * What the app makes from a clip, and FFmpeg's arguments for each (docs/research/engine-stack.md › 2, *Which file
 * plays*). Pure, so the tests check every choice without running FFmpeg.
 */
import type { ClipFacts, JobKind, VideoFacts } from "../src/shared/media.ts";

/** The proxy's shorter side: small enough that every frame decodes at once on any computer, sharp enough to edit by. */
const PROXY_SHORT_SIDE = 720;
/** Above this many pixels a clip plays from its proxy: 4K decodes slowly when seeking long-GOP files. */
const LARGEST_PLAYED_DIRECTLY = 1920 * 1080;

/** The jobs a clip needs, in the order they run: the sound first, so captions start at once; the proxy next, so the
 * video plays smoothly soon; the edit copy last, as only export reads it. `decodes`: whether this computer's window can
 * decode the original (Mediabunny's canDecode, asked in the window). */
export function jobsFor(facts: ClipFacts, decodes: boolean): JobKind[] {
  const jobs: JobKind[] = [];
  if (facts.audio) jobs.push("speech");
  const video = facts.video;
  if (!video) return jobs;
  const hdr = video.dynamic !== "sdr";
  if (!decodes || hdr || video.width * video.height > LARGEST_PLAYED_DIRECTLY) jobs.push("proxy");
  if (!decodes || hdr) jobs.push("editCopy");
  return jobs;
}

const COMMON = ["-hide_banner", "-nostdin", "-y", "-progress", "pipe:1", "-nostats"];
/** FFmpeg reads the file's rotation as none: the picture is turned by our own filters, once (pictureFilters), and the
 * copy carries no rotation of its own. `-noautorotate` alone isn't enough: FFmpeg then copies the original's rotation
 * into the copy, which would turn it a second time (the import check, 2026-11-21). */
const FORGET_ROTATION = ["-display_rotation:v:0", "0"];

/** The sound at 16 kHz, mono, 16-bit: what the speech models read, and what the waveform is drawn from. */
export function speechArguments(input: string, output: string): string[] {
  return [...COMMON, "-i", input, "-map", "0:a:0", "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", "-f", "wav", output];
}

/** A copy whose every frame is a keyframe (`-g 1 -bf 0`, as Kdenlive's and Shotcut's proxies), 720p, at a constant
 * frame rate, upright, SDR, with 48 kHz sound. */
export function proxyArguments(input: string, output: string, facts: ClipFacts): string[] {
  const video = requiredVideo(facts);
  return [...COMMON, ...FORGET_ROTATION, "-i", input, "-map", "0:v:0", "-map", "0:a:0?",
    "-vf", pictureFilters(video, { shortSide: Math.min(PROXY_SHORT_SIDE, Math.min(video.width, video.height)) }),
    "-fps_mode", "cfr", "-r", constantRate(video.frameRate),
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-g", "1", "-bf", "0", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-ar", "48000", "-b:a", "128k", "-movflags", "+faststart", output];
}

/** A full-size H.264 copy for a video this computer can't decode, or HDR tone-mapped to SDR: what export reads in
 * place of the original. Upright and at a constant rate, as the proxy. */
export function editCopyArguments(input: string, output: string, facts: ClipFacts): string[] {
  const video = requiredVideo(facts);
  return [...COMMON, ...FORGET_ROTATION, "-i", input, "-map", "0:v:0", "-map", "0:a:0?",
    "-vf", pictureFilters(video, { shortSide: null }),
    "-fps_mode", "cfr", "-r", constantRate(video.frameRate),
    "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-ar", "48000", "-b:a", "192k", "-movflags", "+faststart", output];
}

/** Tone-map (HDR only), turn upright, then size. FFmpeg's own turning is off (FORGET_ROTATION), so the clip's one
 * clockwise rotation (probe.ts) is applied here once and never twice. */
export function pictureFilters(video: VideoFacts, size: { shortSide: number | null }): string {
  const filters: string[] = [];
  // HLG and PQ to BT.709 with zimg (zscale), then Hable's curve: what Shotcut and Kdenlive do for phone HDR.
  if (video.dynamic !== "sdr") filters.push("zscale=t=linear:npl=100", "format=gbrpf32le", "zscale=p=bt709", "tonemap=hable:desat=0", "zscale=t=bt709:m=bt709:r=tv");
  if (video.rotation === 90) filters.push("transpose=clock");
  if (video.rotation === 180) filters.push("hflip", "vflip");
  if (video.rotation === 270) filters.push("transpose=cclock");
  if (size.shortSide !== null) {
    // Sized after turning, so the shorter side is measured on the upright picture.
    const turned = video.rotation % 180 !== 0;
    const [uprightWidth, uprightHeight] = turned ? [video.height, video.width] : [video.width, video.height];
    filters.push(uprightWidth >= uprightHeight ? `scale=-2:${size.shortSide}` : `scale=${size.shortSide}:-2`);
  }
  filters.push("format=yuv420p");
  return filters.join(",");
}

/** A phone's varying rate made constant at the nearest common rate, so 29.94 fps averaged becomes 30000/1001. */
export function constantRate(average: number): string {
  const common: [number, string][] = [[23.976, "24000/1001"], [24, "24"], [25, "25"], [29.97, "30000/1001"], [30, "30"],
    [48, "48"], [50, "50"], [59.94, "60000/1001"], [60, "60"], [120, "120"]];
  const nearest = common.reduce((best, each) => Math.abs(each[0] - average) < Math.abs(best[0] - average) ? each : best);
  return Math.abs(nearest[0] - average) / nearest[0] < 0.02 ? nearest[1] : String(Math.round(average) || 30);
}

function requiredVideo(facts: ClipFacts): VideoFacts {
  if (!facts.video) throw new Error("a clip without video has no picture to copy");
  return facts.video;
}
