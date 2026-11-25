/**
 * The sync proof's clip and its measure, shared by the export check (check-export.ts) and the fresh-install check
 * (check-fresh-install.ts): a grey picture with a white flash in its lower part at one frame, and a 1 kHz beep at the
 * same moment; after an export, the flash's frame and the beep's start must still be within a frame of each other,
 * whichever AAC encoder the system gave (AudioToolbox's on a Mac, Media Foundation's on Windows, FFmpeg's on Linux).
 */
import { execFileSync } from "node:child_process";

export const SYNC_RATE = 30;

/** The flash's frame and the second the beep starts in `file`, read with `ffmpeg`. */
export function flashAndBeep(ffmpeg: string, file: string): { flash: number; beepAt: number } {
  const grey = execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-i", file, "-vf", "scale=16:9", "-f", "rawvideo", "-pix_fmt", "gray", "-"], { maxBuffer: 64 * 1024 * 1024 });
  let flash = -1;
  for (let index = 0; index * 144 < grey.length; index++) {
    const lower = grey.subarray(index * 144 + 48, index * 144 + 144);
    if (lower.reduce((sum, value) => sum + value, 0) / lower.length > 200) {
      flash = index;
      break;
    }
  }
  const sound = execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-i", file, "-ac", "1", "-ar", "48000", "-f", "f32le", "-"], { maxBuffer: 256 * 1024 * 1024 });
  const samples = new Float32Array(sound.buffer, sound.byteOffset, Math.floor(sound.length / 4));
  return { flash, beepAt: samples.findIndex((sample) => Math.abs(sample) > 0.1) / 48000 };
}

/**
 * A talk clip for the fresh-install check: the flash and beep at 1 s, then `speech` (a WAV a system's own voice
 * spoke, at least a few seconds) from 2.5 s, with two seconds' quiet after it, so captions, a proposed silence and the
 * sync all have something to show. 1280 × 720 at 30 frames a second, H.264 and AAC, as a phone or screen recorder
 * makes.
 */
export function makeTalkClip(ffmpeg: string, speech: string, out: string): void {
  const flashFrame = SYNC_RATE; // 1 s
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", `color=c=gray:size=1280x720:rate=${SYNC_RATE}`,
    "-f", "lavfi", "-i", `aevalsrc='if(between(t,1,1+1/${SYNC_RATE}),sin(2*PI*1000*t),0)':s=48000:d=2.5`,
    "-i", speech,
    "-filter_complex", `[0:v]geq=lum='if(eq(N,${flashFrame}),if(gt(Y,H/4),235,90),90)':cb=128:cr=128,format=yuv420p[v];`
      + "[2:a]aresample=48000,aformat=channel_layouts=mono,apad=pad_dur=2[s];[1:a][s]concat=n=2:v=0:a=1[a]",
    "-map", "[v]", "-map", "[a]", "-shortest", "-c:v", "libx264", "-g", "30", "-c:a", "aac", "-b:a", "128k", out]);
}
