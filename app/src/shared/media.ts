/**
 * A video as the app knows it once opened: its facts from ffprobe (electron/probe.ts), and the files the app makes
 * from it in the background (electron/jobs.ts). Shared by the main process and the window.
 */

/** Where the colours of a video sit: SDR (BT.709 and older) plays as it is; HDR (HLG, PQ) gets a tone-mapped edit
 * copy, since release 1 is SDR only (docs/research/engine-stack.md › 2). */
export type Dynamic = "sdr" | "hlg" | "pq";

export interface VideoFacts {
  codec: string; // ffprobe's name: h264, hevc, prores…
  width: number; // as stored, before rotation
  height: number;
  /** How wide each stored pixel is shown, against its height: 1 for square pixels (phones, webcams), 4/3 for HDV's and
   * AVCHD's 1440 × 1080, which show at 16:9. */
  pixelAspect: number;
  /** Clockwise degrees to turn the stored picture upright: 0, 90, 180 or 270. ffprobe reports counter-clockwise;
   * this is converted once, here, so nothing downstream turns it twice (engine-stack.md › Traps › Rotation). */
  rotation: 0 | 90 | 180 | 270;
  /** Frames a second as the file averages them. */
  frameRate: number;
  /** Phones record frames at uneven intervals: such a clip is placed by each frame's own time, and its proxy is made
   * constant (engine-stack.md › Traps › Variable frame rate). */
  variableFrameRate: boolean;
  bitDepth: number;
  dynamic: Dynamic;
}

/** The picture's size as shown upright, in square pixels: HDV's 1440 × 1080 shows at 1920 × 1080, a phone's sideways
 * 1920 × 1080 at 1080 × 1920. Export sizes, a short's window and a punch-in are all worked out from this. */
export function uprightSize(video: VideoFacts): { width: number; height: number } {
  const shownWidth = Math.round(video.width * video.pixelAspect);
  return video.rotation % 180 === 0 ? { width: shownWidth, height: video.height } : { width: video.height, height: shownWidth };
}

export interface AudioFacts {
  codec: string;
  sampleRate: number;
  channels: number;
}

export interface ClipFacts {
  durationSeconds: number;
  container: string; // ffprobe's format name: mov,mp4,m4a,3gp,3g2,mj2 / matroska,webm / avi…
  video: VideoFacts | null;
  audio: AudioFacts | null;
}

/** A video the person opened: its id (stable for the same file, so its edit copies are found again), its name for the
 * window, and its facts. Its path stays in the main process. */
export interface Clip {
  id: string;
  name: string;
  facts: ClipFacts;
}

/** The files the app makes from a clip, each a background job:
 * - speech: the sound at 16 kHz mono, which captions read and the waveform is drawn from; made first, so captions
 *   start at once even when the picture needs an edit copy (docs/plan.md › Build order, day 2);
 * - proxy: a small copy every frame of which decodes at once (all-intra H.264, 720p, constant frame rate), for
 *   smooth playing and seeking; export still uses the original;
 * - editCopy: a full-size H.264 copy of a video this computer can't decode, or of an HDR one tone-mapped to SDR;
 * - voiceSource: the sound at 48 kHz, mono, which voice clean-up reads; made only when it's switched on. */
export const JOB_KINDS = ["speech", "proxy", "editCopy", "voiceSource"] as const;
export type JobKind = (typeof JOB_KINDS)[number];

export type JobProgress =
  | { clipId: string; kind: JobKind; state: "waiting" }
  | { clipId: string; kind: JobKind; state: "running"; fraction: number; secondsLeft: number | null }
  | { clipId: string; kind: JobKind; state: "done" }
  | { clipId: string; kind: JobKind; state: "failed"; error: string }
  | { clipId: string; kind: JobKind; state: "cancelled" };

/** How a clip's voice clean-up is coming along: its sound at 48 kHz being made, the model downloading (first use only),
 * the voice being cleaned, then ready to play (media:// › cleanVoice). */
export type VoiceProgress =
  | { clipId: string; state: "preparing" | "downloading" | "cleaning"; fraction: number }
  | { clipId: string; state: "ready" }
  | { clipId: string; state: "failed"; error: string };
