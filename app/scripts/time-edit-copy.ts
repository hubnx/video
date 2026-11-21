/**
 * How long the app takes to prepare a 4K HEVC video on a computer that can't decode HEVC in the window, the case where
 * the first export waits (docs/plan.md › Build order, day 2): the proxy and the edit copy, each made through the app's
 * own runner and arguments (electron/jobs.ts, ffmpeg-jobs.ts), as an SDR clip and as HDR (HLG, tone-mapped: the
 * iPhone's default). The numbers become the first-run note's "about N min". Results go to
 * video/local/edit-copy-timing/<system>-<arch>.json with the computer's processor and cores.
 *
 *   pnpm exec node scripts/time-edit-copy.ts <a 4K HEVC clip> [seconds to use]
 *
 * GitHub's Windows and Linux run it on a one-minute cut (.github/workflows/edit-copy-timing.yml); this Mac on the whole
 * ten minutes, which also shows whether a minute's time scales to ten.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import path from "node:path";
import { editCopyArguments, proxyArguments } from "../electron/ffmpeg-jobs.ts";
import { JobRunner, writingPath } from "../electron/jobs.ts";
import { probeClip } from "../electron/probe.ts";
import { programName, targetOf } from "../electron/targets.ts";
import type { ClipFacts, JobKind, JobProgress } from "../src/shared/media.ts";
import { appFolder } from "./start.ts";

const [clip, secondsArgument] = process.argv.slice(2);
if (!clip) throw new Error("pnpm exec node scripts/time-edit-copy.ts <a 4K HEVC clip> [seconds to use]");
const local = path.resolve(appFolder, "..", "local");
const programs = process.env.FFMPEG_FOLDER ?? path.join(local, "ffmpeg-for-app", targetOf(process.platform, process.arch));
const ffmpeg = path.join(programs, programName(process.platform, "ffmpeg"));
const ffprobe = path.join(programs, programName(process.platform, "ffprobe"));
const out = path.join(local, "edit-copy-timing", `made-${process.platform}`);

const probed = await probeClip(ffprobe, clip);
if (!probed.video || probed.video.codec !== "hevc") throw new Error(`not an HEVC clip: ${probed.video?.codec ?? "no video"}`);
const seconds = Math.min(Number(secondsArgument ?? probed.durationSeconds), probed.durationSeconds);
const facts = (dynamic: "sdr" | "hlg"): ClipFacts => ({ ...probed, durationSeconds: seconds, video: { ...probed.video!, dynamic } });

/** Times one job; only the first `seconds` of the clip are read (-t before the output). */
async function time(kind: Exclude<JobKind, "speech">, dynamic: "sdr" | "hlg"): Promise<{ seconds: number; fps: number }> {
  const output = path.join(out, `${kind}-${dynamic}.mp4`);
  rmSync(output, { force: true });
  const build = kind === "proxy" ? proxyArguments : editCopyArguments;
  const args = build(clip!, writingPath(output), facts(dynamic));
  args.splice(args.length - 1, 0, "-t", String(seconds));
  const started = Date.now();
  const result = await new Promise<JobProgress["state"]>((resolve) => {
    const runner = new JobRunner(ffmpeg, path.join(out, "logs"), (progress) => {
      if (progress.state === "done" || progress.state === "failed") resolve(progress.state);
    });
    runner.add({ clipId: "timing", kind, arguments: args, writing: writingPath(output), output, durationSeconds: seconds });
  });
  if (result !== "done") throw new Error(`${kind} (${dynamic}) ${result}: see ${path.join(out, "logs")}`);
  const took = (Date.now() - started) / 1000;
  const frames = seconds * probed.video!.frameRate;
  console.log(`${kind} ${dynamic}: ${took.toFixed(0)} s for ${seconds} s of 4K (${(frames / took).toFixed(1)} fps)`);
  return { seconds: Math.round(took), fps: Math.round((frames / took) * 10) / 10 };
}

mkdirSync(out, { recursive: true });
const results = {
  measured: new Date().toISOString(),
  system: `${process.platform} ${process.arch}`,
  processor: cpus()[0]?.model ?? "unknown",
  cores: cpus().length,
  clip: { file: path.basename(clip), codec: probed.video.codec, size: `${probed.video.width}x${probed.video.height}`, bitDepth: probed.video.bitDepth, secondsUsed: seconds },
  sdr: { proxy: await time("proxy", "sdr"), editCopy: await time("editCopy", "sdr") },
  hlg: { proxy: await time("proxy", "hlg"), editCopy: await time("editCopy", "hlg") },
};
const file = path.join(local, "edit-copy-timing", `${process.platform}-${process.arch}.json`);
writeFileSync(file, `${JSON.stringify(results, null, 1)}\n`);
console.log(`EDIT_COPY_TIMING ${JSON.stringify(results)}`);
rmSync(out, { recursive: true, force: true }); // the copies themselves are of no later use; the numbers are kept
