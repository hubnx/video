/**
 * The export's sound and the final file: FFmpeg takes the kept stretches of the clip's sound (the clean voice when it's
 * chosen), joins them with a 10 ms fade at each join so no cut clicks, evens the loudness to YouTube's -14 LUFS
 * (docs/plan.md › Release 1), encodes AAC with the system's own encoder where there is one (its patents are the
 * system's: docs/research/engine-stack.md › Codecs), and muxes it with the window's video, the index at the front so
 * the file plays as it downloads. Pure, so the tests check the arguments without FFmpeg.
 */

/** The fade at each join: short enough not to be heard as a dip, long enough that the join doesn't click. */
const FADE_SECONDS = 0.01;

export interface SoundPlan {
  /** The kept stretches of the clip, in seconds of the clip, in the order they play. */
  stretches: { from: number; to: number }[];
  /** Where the sound comes from: the original's first sound stream, or the clean voice (a WAV). */
  source: string;
}

/** The filter that joins the kept stretches and evens the loudness, as FFmpeg reads it from a file (an edit with
 * hundreds of cuts makes a filter too long for a command line on Windows). */
export function soundFilter(plan: SoundPlan): string {
  const pieces = plan.stretches.map((stretch, index) => {
    const length = stretch.to - stretch.from;
    const fade = Math.min(FADE_SECONDS, length / 2);
    return `[1:a:0]atrim=start=${stretch.from.toFixed(6)}:end=${stretch.to.toFixed(6)},asetpts=PTS-STARTPTS,`
      + `afade=t=in:d=${fade.toFixed(4)},afade=t=out:st=${(length - fade).toFixed(6)}:d=${fade.toFixed(4)}[p${index}]`;
  });
  const joined = `${plan.stretches.map((_, index) => `[p${index}]`).join("")}concat=n=${plan.stretches.length}:v=0:a=1[joined]`;
  return [...pieces, joined, "[joined]loudnorm=I=-14:TP=-1:LRA=11,aresample=48000[sound]"].join(";\n");
}

/** The system's AAC encoder (FFmpeg's own on Linux, where there's none). */
export function aacEncoder(platform: NodeJS.Platform): string {
  if (platform === "darwin") return "aac_at";
  if (platform === "win32") return "aac_mf";
  return "aac";
}

export function muxArguments(video: string, plan: SoundPlan, filterFile: string, output: string, platform: NodeJS.Platform): string[] {
  return ["-hide_banner", "-nostdin", "-y", "-progress", "pipe:1", "-nostats", "-i", video, "-i", plan.source,
    "-/filter_complex", filterFile, "-map", "0:v:0", "-map", "[sound]",
    "-c:v", "copy", "-c:a", aacEncoder(platform), "-b:a", "192k", "-ar", "48000", "-ac", "2",
    "-movflags", "+faststart", "-shortest", output];
}
