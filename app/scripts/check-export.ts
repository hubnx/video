/**
 * Day 7's proof (docs/plan.md › Build order): an export's file facts, frame numbers and sound in sync, and export equal
 * to preview. The app, behind, opens the preview check's numbered clip (each frame's number in bars across its top, a
 * white flash at frame 150 and a beep at the same moment, 5 s), takes out 2–3 s with S and Delete, and exports it
 * through its own dialog. Then the file is read with the app's own FFmpeg:
 *   - H.264 with AAC at 48 kHz, the index at the front, as long as the edit to the frame;
 *   - frames from before and after the cut show the clip's frames they should (the bars read back);
 *   - the flash and the beep, now at 4 s, still within a frame of each other.
 * Then the talk clip is exported with its captions in the picture, and the captions are found in the file; and a minute of
 * 4K HEVC, a phone's, at 4K; an HDR phone clip, whose export waits for its edit copy (SDR); a clip whose sound starts
 * late, still in sync; and one with no sound. Each export's time is recorded with this computer's processor in timings.json (docs/plan.md
 * › Risks keeps them). Into video/local/export-check/, replaced each run. The clips come from check-preview.ts,
 * check-transcript.ts, check-import.ts and time-edit-copy.ts.
 *
 *   pnpm build && pnpm exec node scripts/check-export.ts
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import path from "node:path";
import { _electron as electron, type ElectronApplication, type Page } from "playwright-core";
import { programName, targetOf } from "../electron/targets.ts";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "./start.ts";

const stillBehind = watchFrontmost();
const local = path.resolve(appFolder, "..", "local");
const folder = path.join(local, "export-check");
const programs = path.join(local, "ffmpeg-for-app", targetOf(process.platform, process.arch));
const ffmpeg = path.join(programs, programName(process.platform, "ffmpeg"));
const ffprobe = path.join(programs, programName(process.platform, "ffprobe"));
const numbered = path.join(local, "preview-check", "numbered.mp4");
const talk = path.join(local, "transcript-check", "talk-60s.mp4");
const phone4k = path.join(local, "edit-copy-timing", "hevc-4k-1min.mov");
const phoneHdr = path.join(local, "import-check", "clips", "iphone-hlg.mov");
const noSound = path.join(local, "import-check", "clips", "varying-rate.mp4");
const RATE = 30;
const BITS = 12;
const failures: string[] = [];
const timings: Record<string, number> = {};
const expect = (ok: boolean, what: string) => {
  console.log(`${ok ? "ok" : "FAIL"}: ${what}`);
  if (!ok) failures.push(what);
};

async function withClip(file: string, work: (app: ElectronApplication, page: Page) => Promise<void>): Promise<void> {
  rmSync(path.join(local, "app-data"), { recursive: true, force: true });
  const app = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment() as Record<string, string> });
  try {
    const page = await app.firstWindow();
    page.on("pageerror", (error) => failures.push(`window error: ${error.message}`));
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.setSize(1280, 800));
    await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
    await app.evaluate(({ dialog }, chosen) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [chosen] });
    }, file);
    await page.getByRole("button", { name: "Choose a video" }).click();
    await page.locator(".preview-canvas[data-drawn]").waitFor({ timeout: 10 * 60_000 });
    await work(app, page);
  } finally {
    await app.close();
  }
}

async function seekTo(page: Page, seconds: number): Promise<void> {
  await page.locator(".preview-bar").evaluate((bar: HTMLInputElement, value) => {
    bar.value = String(value);
    bar.dispatchEvent(new Event("input"));
  }, seconds);
  await page.waitForTimeout(250);
}

/** Opens the export dialog, checks where it offers to save (beside the clip, as its name plus "edited"), and changes
 * that to `file` through Change…, as a person would. */
async function openExportTo(app: ElectronApplication, page: Page, clip: string, file: string | null) {
  await page.getByRole("button", { name: "Export", exact: true }).first().click();
  const dialog = page.locator("dialog.export");
  const offered = `${path.basename(path.dirname(clip))} › ${path.basename(clip, path.extname(clip))} edited.mp4`;
  await dialog.locator(".export-place-name").filter({ hasText: offered }).waitFor({ timeout: 10_000 })
    .then(() => expect(true, `the dialog offers "${offered}" before saving`), () => expect(false, `the dialog offers "${offered}" before saving`));
  if (file) {
    await app.evaluate(({ dialog }, chosen) => {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: chosen });
    }, file);
    await dialog.getByRole("button", { name: "Change…" }).click();
    await dialog.locator(".export-place-name").filter({ hasText: path.basename(file) }).waitFor({ timeout: 10_000 });
  }
  return dialog;
}

/** Exports through the app's own dialog to `file` (null: where it offers), captions as chosen; returns how long it took. */
async function exportTo(app: ElectronApplication, page: Page, clip: string, file: string | null, captions: string, pictureWhileRunning?: string): Promise<number> {
  const dialog = await openExportTo(app, page, clip, file);
  await dialog.getByRole("radio", { name: captions }).click();
  const started = Date.now();
  await dialog.getByRole("button", { name: "Export", exact: true }).click();
  if (pictureWhileRunning) {
    await dialog.locator(".export-status").filter({ hasText: /left/ }).waitFor({ timeout: 5 * 60_000 });
    await page.screenshot({ path: pictureWhileRunning });
  }
  await dialog.locator(".export-status").filter({ hasText: /Saved as|didn't finish|Stopped/ }).waitFor({ timeout: 20 * 60_000 });
  const said = await dialog.locator(".export-status").innerText();
  const name = file ? path.basename(file) : `${path.basename(clip, path.extname(clip))} edited.mp4`;
  expect(said === `Saved as ${name}.`, `the export said "${said}"`);
  return (Date.now() - started) / 1000;
}

/** The frame number in the bars of the exported frame `index`, read from a small grey copy of it. */
function barsOf(file: string, index: number): number {
  const width = 240;
  const height = 135;
  const pixels = execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-i", file, "-vf", `select=eq(n\\,${index}),scale=${width}:${height}`,
    "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "gray", "-"]);
  let number = 0;
  for (let bit = 0; bit < BITS; bit++) if (pixels[Math.floor(height / 8) * width + Math.floor(width * ((bit + 0.5) / BITS))]! > 128) number |= 1 << bit;
  return number;
}

/** The frame of the numbered clip's white flash (the picture's lower part white), and the second its beep starts. */
function flashAndBeep(file: string): { flash: number; beepAt: number } {
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

rmSync(folder, { recursive: true, force: true });
mkdirSync(folder, { recursive: true });
const cutOut = path.join(folder, "numbered-cut.mp4");
try {
  await withClip(numbered, async (app, page) => {
    // Take out 2–3 s: split at 2 and 3, then Delete with the playhead between.
    await page.locator(".timeline-canvas").focus();
    await seekTo(page, 2);
    await page.keyboard.press("s");
    await seekTo(page, 3);
    await page.keyboard.press("s");
    await seekTo(page, 2.5);
    await page.keyboard.press("Delete");
    timings.numbered = await exportTo(app, page, numbered, cutOut, "None");
  });

  const facts = JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_streams", "-show_format", "-of", "json", cutOut], { encoding: "utf8" })) as {
    streams: { codec_type: string; codec_name: string; sample_rate?: string; nb_frames?: string }[]; format: { duration: string };
  };
  const video = facts.streams.find((stream) => stream.codec_type === "video");
  const audio = facts.streams.find((stream) => stream.codec_type === "audio");
  expect(video?.codec_name === "h264" && audio?.codec_name === "aac" && audio.sample_rate === "48000", `H.264 and AAC at 48 kHz (${video?.codec_name}, ${audio?.codec_name} ${audio?.sample_rate})`);
  const frames = Number(video?.nb_frames);
  expect(Math.abs(frames - 270) <= 1, `${frames} frames for the 9 s the edit lasts (270 expected)`);
  expect(Math.abs(Number(facts.format.duration) - 9) < 0.1, `it lasts ${Number(facts.format.duration).toFixed(2)} s`);
  const head = execFileSync("head", ["-c", "65536", cutOut]);
  expect(head.indexOf("moov") >= 0 && (head.indexOf("mdat") < 0 || head.indexOf("moov") < head.indexOf("mdat")), "the index (moov) comes before the media, so it plays as it downloads");

  // Frames before and after the cut: 0→0, 59→59, 60→90 (the second after 2 s is 3 s), 150→180.
  for (const [exported, original] of [[0, 0], [59, 59], [60, 90], [150, 180], [269, 299]] as const) {
    const read = barsOf(cutOut, exported);
    expect(read === original, `exported frame ${exported} shows the clip's frame ${original} (read ${read})`);
  }

  // The flash and the beep, both at 4 s after the cut.
  const cutSync = flashAndBeep(cutOut);
  expect(cutSync.flash === 120, `the flash at exported frame ${cutSync.flash} (120 expected: frame 150 less the 30 cut)`);
  expect(Math.abs(cutSync.beepAt - cutSync.flash / RATE) <= 1 / RATE + 0.01, `the beep at ${cutSync.beepAt.toFixed(3)} s and the flash at ${(cutSync.flash / RATE).toFixed(3)} s, within a frame`);

  // Sound that starts half a second after the picture (as some cameras record): laid on the clip's time, still in sync.
  const late = path.join(folder, "late-sound.mp4");
  // Trimmed with its times kept, so the MP4 starts its sound late (an edit list); -ss with -itsoffset cancels out.
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-i", numbered, "-filter_complex", "[0:a]atrim=start=0.5[a]",
    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", late]);
  const lateStart = Number(execFileSync(ffprobe, ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=start_time", "-of", "csv=p=0", late], { encoding: "utf8" }));
  expect(lateStart > 0.4, `the late-sound clip's sound starts ${lateStart.toFixed(3)} s in`);
  const lateOut = path.join(folder, "late-sound-out.mp4");
  await withClip(late, async (app, page) => {
    timings.lateSound = await exportTo(app, page, late, lateOut, "None");
  });
  const lateSync = flashAndBeep(lateOut);
  expect(lateSync.flash === 150 && Math.abs(lateSync.beepAt - lateSync.flash / RATE) <= 1 / RATE + 0.01,
    `sound starting late: the beep at ${lateSync.beepAt.toFixed(3)} s and the flash at ${(lateSync.flash / RATE).toFixed(3)} s, within a frame`);

  // A clip with no sound: the picture alone.
  const silentOut = path.join(folder, "no-sound-out.mp4");
  await withClip(noSound, async (app, page) => {
    timings.noSound = await exportTo(app, page, noSound, silentOut, "None");
  });
  const silentStreams = execFileSync(ffprobe, ["-v", "error", "-show_entries", "stream=codec_type", "-of", "csv=p=0", silentOut], { encoding: "utf8" }).trim();
  expect(silentStreams === "video", `a clip with no sound exports as the picture alone (${silentStreams.replaceAll("\n", ", ")})`);

  // Captions in the picture, from the talk clip, saved where the dialog offers: beside the clip (a copy, here).
  const talkCopy = path.join(folder, path.basename(talk));
  copyFileSync(talk, talkCopy);
  const captioned = path.join(folder, "talk-60s edited.mp4");
  await withClip(talkCopy, async (app, page) => {
    await page.locator(".transcript-paragraph").first().waitFor({ timeout: 10 * 60_000 });
    await page.locator(".clip-status").waitFor({ state: "hidden", timeout: 10 * 60_000 });
    // Cancelled partway: it says so, and nothing is left at the destination or beside it.
    const stopped = path.join(folder, "talk-stopped.mp4");
    const dialog = await openExportTo(app, page, talkCopy, stopped);
    await dialog.getByRole("button", { name: "Export", exact: true }).click();
    await dialog.locator(".export-status").filter({ hasText: /left/ }).waitFor({ timeout: 5 * 60_000 });
    // Esc mid-export: the dialog stays, with the run, since only Cancel stops it.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    expect(await dialog.evaluate((element: HTMLDialogElement) => element.open), "Esc mid-export leaves the dialog and its run in place");
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await dialog.locator(".export-status").filter({ hasText: /Stopped/ }).waitFor({ timeout: 60_000 });
    const left = readdirSync(folder).filter((name) => name.startsWith("talk-stopped"));
    expect(left.length === 0, `a cancelled export leaves nothing behind (${left.join(", ") || "nothing"})`);
    await dialog.getByRole("button", { name: "Cancel" }).click();
    timings.talk = await exportTo(app, page, talkCopy, null, "In the video", path.join(local, "screens", "7-export-running-laptop-light.png"));
    await page.screenshot({ path: path.join(local, "screens", "7-export-done-laptop-light.png") });
  });
  const lowBand = execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-ss", "12", "-i", captioned, "-frames:v", "1", "-vf", "crop=iw:ih*0.15:0:ih*0.8,scale=320:-2",
    "-f", "rawvideo", "-pix_fmt", "gray", "-"]);
  const bright = lowBand.filter((value) => value > 230).length;
  expect(bright > 300, `captions drawn into the exported picture (${bright} bright pixels in its lower band at 12 s)`);

  // A minute of a phone's 4K HEVC, at 4K.
  const big = path.join(folder, "phone-4k.mp4");
  await withClip(phone4k, async (app, page) => {
    timings.phone4k = await exportTo(app, page, phone4k, big, "None");
  });
  const bigFacts = execFileSync(ffprobe, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,nb_frames", "-of", "csv=p=0", big], { encoding: "utf8" }).trim();
  expect(/^3840,2160,(179[7-9]|180[0-1])$/.test(bigFacts), `the 4K export is 3840 by 2160 with a minute of frames (${bigFacts})`);

  // HDR: the export waits for the edit copy (tone-mapped to SDR) and reads that.
  const hdr = path.join(folder, "phone-hdr.mp4");
  await withClip(phoneHdr, async (app, page) => {
    timings.phoneHdr = await exportTo(app, page, phoneHdr, hdr, "None");
  });
  const hdrFacts = execFileSync(ffprobe, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer,nb_frames", "-of", "csv=p=0", hdr], { encoding: "utf8" }).trim();
  expect(!/arib-std-b67|smpte2084/.test(hdrFacts) && Number(hdrFacts.split(",").at(-1)) > 0, `the HDR clip exported as SDR from its edit copy (${hdrFacts})`);
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}
const computer = { processor: cpus()[0]?.model, cores: cpus().length, system: `${process.platform}-${process.arch}` };
writeFileSync(path.join(folder, "timings.json"), `${JSON.stringify({ measured: new Date().toISOString(), computer, seconds: timings,
  clipSeconds: { numbered: 9, talk: 60, phone4k: 60 } }, null, 1)}\n`);
console.log(`export times: ${JSON.stringify(timings)}`);
const taken = stillBehind();
if (taken) failures.push(`SCREEN_TAKEN: ${taken}`);
if (failures.length) {
  console.error(`EXPORT_CHECK_FAILED:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("exports match the edit frame for frame, keep the sound in sync, and carry their captions");
