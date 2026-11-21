/**
 * Day 2's proof (docs/plan.md › Build order): every kind of file people bring is made here, its facts are read by the
 * app's own ffprobe (electron/probe.ts) and checked against how it was made, then its jobs run through the app's own
 * runner and FFmpeg (electron/jobs.ts, ffmpeg-jobs.ts), and what they made is checked: the proxy upright, 720p at most,
 * a keyframe every frame, at a constant rate with every frame there, 48 kHz sound; the speech sound 16 kHz mono.
 *
 * The test clips are made by a full FFmpeg (TEST_FFMPEG, or `ffmpeg` on the path: Homebrew's here, apt's on GitHub's
 * Ubuntu), since the app's own has no HEVC or ProRes encoder by design. Into video/local/import-check/, replaced each run.
 *
 *   pnpm exec node scripts/check-import.ts
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { programName, targetOf } from "../electron/targets.ts";
import { probeClip } from "../electron/probe.ts";
import { editCopyArguments, jobsFor, proxyArguments, speechArguments } from "../electron/ffmpeg-jobs.ts";
import { JobRunner, writingPath } from "../electron/jobs.ts";
import type { ClipFacts, JobKind, JobProgress, VideoFacts } from "../src/shared/media.ts";
import { appFolder } from "./start.ts";

const video = path.resolve(appFolder, "..");
const folder = path.join(video, "local", "import-check");
const programs = path.join(video, "local", "ffmpeg-for-app", targetOf(process.platform, process.arch));
const ffmpeg = path.join(programs, programName(process.platform, "ffmpeg"));
const ffprobe = path.join(programs, programName(process.platform, "ffprobe"));
const maker = process.env.TEST_FFMPEG ?? "ffmpeg";
if (!existsSync(ffmpeg)) throw new Error(`NO_FFMPEG: run pnpm ffmpeg ${targetOf(process.platform, process.arch)} first`);

const SECONDS = 2;
const picture = (size: string) => ["-f", "lavfi", "-i", `testsrc2=size=${size}:rate=30:duration=${SECONDS}`];
const sound = (rate: number, channels: number) => ["-f", "lavfi", "-i", `sine=frequency=440:sample_rate=${rate}:duration=${SECONDS}`, "-ac", String(channels)];

interface TestClip {
  name: string;
  make: string[][]; // one or more FFmpeg runs, the last writing the clip
  expected: { video: Partial<VideoFacts> | null; audio: { sampleRate: number; channels: number } | null };
}

const clips: TestClip[] = [
  { name: "h264-1080p.mp4", make: [[...picture("1920x1080"), ...sound(48000, 2), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest"]],
    expected: { video: { codec: "h264", width: 1920, height: 1080, rotation: 0, variableFrameRate: false, bitDepth: 8, dynamic: "sdr" }, audio: { sampleRate: 48000, channels: 2 } } },
  // A phone held upright: stored landscape, shown turned 90° clockwise (-display_rotation is counter-clockwise).
  { name: "phone-portrait.mp4", make: [
    [...picture("1920x1080"), ...sound(48000, 1), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", "STEP:portrait-plain.mp4"],
    ["-display_rotation:v:0", "-90", "-i", "STEP:portrait-plain.mp4", "-c", "copy"]],
    expected: { video: { codec: "h264", width: 1920, height: 1080, rotation: 90 }, audio: { sampleRate: 48000, channels: 1 } } },
  // Every fifth frame 12 ms late: frames arriving unevenly, as a phone's do. A fine time base throughout (settb, the
  // encoder's, the file's), or each time is rounded back onto the 1/30 s grid and the 12 ms vanish.
  { name: "varying-rate.mp4", make: [[...picture("1280x720"), "-vf", "settb=1/90000,setpts='PTS+if(eq(mod(N,5),0),0.012/TB,0)'", "-fps_mode", "passthrough",
    "-enc_time_base:v", "1/90000", "-video_track_timescale", "90000", "-c:v", "libx264", "-pix_fmt", "yuv420p"]],
    expected: { video: { codec: "h264", variableFrameRate: true }, audio: null } },
  { name: "voice-44k.m4a", make: [[...sound(44100, 1), "-c:a", "aac"]], expected: { video: null, audio: { sampleRate: 44100, channels: 1 } } },
  // An iPhone's HDR: HEVC Main 10, HLG, BT.2020.
  // The colours go in the stream itself (x265's VUI) and in the file's colr box, as an iPhone writes both.
  { name: "iphone-hlg.mov", make: [[...picture("1920x1080"), ...sound(48000, 2), "-c:v", "libx265", "-pix_fmt", "yuv420p10le", "-tag:v", "hvc1",
    "-x265-params", "colorprim=bt2020:transfer=arib-std-b67:colormatrix=bt2020nc", "-movflags", "+write_colr",
    "-color_primaries", "bt2020", "-color_trc", "arib-std-b67", "-colorspace", "bt2020nc", "-c:a", "aac", "-shortest"]],
    expected: { video: { codec: "hevc", bitDepth: 10, dynamic: "hlg" }, audio: { sampleRate: 48000, channels: 2 } } },
  { name: "prores.mov", make: [[...picture("1280x720"), "-c:v", "prores_ks", "-profile:v", "2"]], expected: { video: { codec: "prores", width: 1280, height: 720 }, audio: null } },
  { name: "vp9.webm", make: [[...picture("1280x720"), ...sound(48000, 2), "-c:v", "libvpx-vp9", "-b:v", "1M", "-c:a", "libopus", "-shortest"]],
    expected: { video: { codec: "vp9" }, audio: { sampleRate: 48000, channels: 2 } } },
  { name: "mpeg4.avi", make: [[...picture("640x480"), ...sound(44100, 2), "-c:v", "mpeg4", "-c:a", "libmp3lame", "-shortest"]],
    expected: { video: { codec: "mpeg4", width: 640, height: 480 }, audio: { sampleRate: 44100, channels: 2 } } },
];

rmSync(folder, { recursive: true, force: true }); // each run replaces its own folder: old and new never mix
mkdirSync(path.join(folder, "clips"), { recursive: true });
const failures: string[] = [];
const fail = (clip: string, what: string) => {
  failures.push(`${clip}: ${what}`);
  console.error(`  FAIL ${what}`);
};

for (const clip of clips) {
  console.log(clip.name);
  const file = path.join(folder, "clips", clip.name);
  for (const [index, run] of clip.make.entries()) {
    const resolved = run.map((part) => part.startsWith("STEP:") ? path.join(folder, "clips", part.slice(5)) : part);
    const last = index === clip.make.length - 1;
    execFileSync(maker, ["-hide_banner", "-loglevel", "error", "-y", ...resolved, ...(last ? [file] : [])], { stdio: ["ignore", "inherit", "inherit"] });
  }
  const facts = await probeClip(ffprobe, file);
  checkFacts(clip, facts);
  await checkJobs(clip, file, facts);
}

// Not a video at all: ffprobe refuses it, which the app turns into its plain refusal (electron/main.ts › open).
const text = path.join(folder, "clips", "notes.txt");
writeFileSync(text, "not a video\n");
const refused = await probeClip(ffprobe, text).then(() => false, () => true);
console.log(`notes.txt: ${refused ? "refused, as it must be" : "FAIL: read as a video"}`);
if (!refused) failures.push("notes.txt: a text file read as a video");

if (failures.length) {
  console.error(`\nIMPORT_CHECK_FAILED: ${failures.length}\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`\nall ${clips.length} clips read as made, and every proxy and sound file checked`);

function checkFacts(clip: TestClip, facts: ClipFacts): void {
  for (const [key, value] of Object.entries(clip.expected.video ?? {})) {
    const found = facts.video?.[key as keyof VideoFacts];
    if (found !== value) fail(clip.name, `video ${key} is ${String(found)}, made ${String(value)}`);
  }
  if (clip.expected.video === null && facts.video) fail(clip.name, "has a video it was made without");
  if (clip.expected.audio === null && facts.audio) fail(clip.name, "has sound it was made without");
  if (clip.expected.audio && (facts.audio?.sampleRate !== clip.expected.audio.sampleRate || facts.audio.channels !== clip.expected.audio.channels)) {
    fail(clip.name, `sound ${facts.audio?.sampleRate} Hz × ${facts.audio?.channels}, made ${clip.expected.audio.sampleRate} × ${clip.expected.audio.channels}`);
  }
  if (Math.abs(facts.durationSeconds - SECONDS) > 0.2) fail(clip.name, `lasts ${facts.durationSeconds} s, made ${SECONDS}`);
}

/** Runs every job the clip could need (as if the window couldn't decode it) and checks each file made. */
async function checkJobs(clip: TestClip, file: string, facts: ClipFacts): Promise<void> {
  const kinds = jobsFor(facts, false);
  const out = path.join(folder, "made", clip.name.replace(/\W/g, "-"));
  const done = new Map<JobKind, JobProgress["state"]>();
  await new Promise<void>((resolve) => {
    const runner = new JobRunner(ffmpeg, path.join(out, "logs"), (progress) => {
      if (progress.state === "done" || progress.state === "failed") done.set(progress.kind, progress.state);
      if (done.size === kinds.length) resolve();
    });
    const argumentsOf: Record<JobKind, (output: string) => string[]> = {
      speech: (output) => speechArguments(file, output),
      proxy: (output) => proxyArguments(file, output, facts),
      editCopy: (output) => editCopyArguments(file, output, facts),
    };
    for (const kind of kinds) {
      const output = path.join(out, `${kind}${kind === "speech" ? ".wav" : ".mp4"}`);
      runner.add({ clipId: clip.name, kind, arguments: argumentsOf[kind](writingPath(output)), writing: writingPath(output), output, durationSeconds: facts.durationSeconds });
    }
  });
  for (const [kind, state] of done) if (state !== "done") fail(clip.name, `${kind} job ${state} (its log: ${path.join(out, "logs")})`);
  if (done.get("speech") === "done") {
    const speech = await probeClip(ffprobe, path.join(out, "speech.wav"));
    if (speech.audio?.sampleRate !== 16000 || speech.audio.channels !== 1) fail(clip.name, `speech sound is ${speech.audio?.sampleRate} Hz × ${speech.audio?.channels}`);
  }
  for (const kind of ["proxy", "editCopy"] as const) {
    if (done.get(kind) !== "done" || !facts.video) continue;
    const made = path.join(out, `${kind}.mp4`);
    const copy = await probeClip(ffprobe, made);
    const upright = facts.video.rotation % 180 === 0 ? [facts.video.width, facts.video.height] : [facts.video.height, facts.video.width];
    const wide = upright[0]! >= upright[1]!;
    if (copy.video?.rotation !== 0) fail(clip.name, `${kind} still carries a rotation of ${copy.video?.rotation}`);
    if ((copy.video!.width >= copy.video!.height) !== wide) fail(clip.name, `${kind} is ${copy.video?.width}×${copy.video?.height}, not upright`);
    if (kind === "proxy" && Math.min(copy.video!.width, copy.video!.height) > 720) fail(clip.name, `proxy is ${copy.video?.width}×${copy.video?.height}, over 720p`);
    if (copy.video?.variableFrameRate) fail(clip.name, `${kind}'s frame rate varies`);
    if (facts.audio && copy.audio?.sampleRate !== 48000) fail(clip.name, `${kind}'s sound is ${copy.audio?.sampleRate} Hz, not 48000`);
    const frames = Number(execFileSync(ffprobe, ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", made], { encoding: "utf8" }).trim());
    const expected = Math.round(SECONDS * 30);
    if (Math.abs(frames - expected) > 1) fail(clip.name, `${kind} has ${frames} frames, ${expected} expected`);
    if (kind === "proxy") {
      const keyframes = execFileSync(ffprobe, ["-v", "error", "-select_streams", "v:0", "-show_entries", "packet=flags", "-of", "csv=p=0", made], { encoding: "utf8" })
        .trim().split("\n").filter((flags) => !flags.startsWith("K")).length;
      if (keyframes > 0) fail(clip.name, `proxy has ${keyframes} frames that aren't keyframes`);
    }
  }
  console.log(`  ${kinds.join(", ")}: checked`);
}
