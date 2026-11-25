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
  /** Where the sound comes from: the original's first sound stream, or the clean voice (a WAV); null for a clip with
   * no sound, whose export is the picture alone. */
  source: string | null;
}

/** The filter that joins the kept stretches and evens the loudness, as FFmpeg reads it from a file (an edit with
 * hundreds of cuts makes a filter too long for a command line on Windows). The sound is first laid on the clip's own
 * time (a late start padded, gaps filled), as the preview plays it, and each piece is then exactly its stretch's
 * length, so a stretch past the sound's end or a gap can never pull what follows out of step with the picture. */
export function soundFilter(plan: SoundPlan): string {
  const count = plan.stretches.length;
  const outputs = plan.stretches.map((_, index) => `[s${index}]`).join("");
  const level = `[1:a:0]aresample=async=1:first_pts=0,asplit=${count}${outputs}`;
  const pieces = plan.stretches.map((stretch, index) => {
    const length = stretch.to - stretch.from;
    const fade = Math.min(FADE_SECONDS, length / 2);
    return `[s${index}]atrim=start=${stretch.from.toFixed(6)}:end=${stretch.to.toFixed(6)},asetpts=PTS-STARTPTS,apad=whole_dur=${length.toFixed(6)},`
      + `atrim=end=${length.toFixed(6)},afade=t=in:d=${fade.toFixed(4)},afade=t=out:st=${(length - fade).toFixed(6)}:d=${fade.toFixed(4)}[p${index}]`;
  });
  const joined = `${plan.stretches.map((_, index) => `[p${index}]`).join("")}concat=n=${count}:v=0:a=1[joined]`;
  return [level, ...pieces, joined, "[joined]loudnorm=I=-14:TP=-1:LRA=11,aresample=48000[sound]"].join(";\n");
}

/** The system's AAC encoder (FFmpeg's own on Linux, where there's none). */
export function aacEncoder(platform: NodeJS.Platform): string {
  if (platform === "darwin") return "aac_at";
  if (platform === "win32") return "aac_mf";
  return "aac";
}

/** FFmpeg's arguments for the final file; `filterFile` is soundFilter's, unused for a clip with no sound. MP4 whatever
 * the name, and the index first, so it plays as it downloads. */
export function muxArguments(video: string, plan: SoundPlan, filterFile: string, output: string, platform: NodeJS.Platform): string[] {
  const start = ["-hide_banner", "-nostdin", "-y", "-progress", "pipe:1", "-nostats", "-i", video];
  const end = ["-c:v", "copy", "-movflags", "+faststart", "-f", "mp4", output];
  if (plan.source === null) return [...start, "-map", "0:v:0", ...end];
  return [...start, "-i", plan.source, "-/filter_complex", filterFile, "-map", "0:v:0", "-map", "[sound]",
    "-c:a", aacEncoder(platform), "-b:a", "192k", "-ar", "48000", "-ac", "2", "-shortest", ...end];
}
