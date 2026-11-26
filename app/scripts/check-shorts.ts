/**
 * 1.1's gate (docs/design/1.1-shorts.md › Proof): the app, run behind, frames 9:16 shorts that follow the speaker.
 *   - Five 12-second clips, each a face (a crop of MediaPipe's own test portrait, a US government photo in the public
 *     domain, used here only) on a plain backdrop, placed by FFmpeg where the check knows it is in every frame: still
 *     in the middle; walking left to right; beside a smaller second face; leaving the frame; and a moving test pattern
 *     with no face. Truth is that placement plus the face's offset inside the crop, read once from the still clip's
 *     own detections, so what's measured is the following, not the detector.
 *   - Each: Short on, the speaker found, then the frame drawn every half second read from the preview: the face inside
 *     the 9:16 window in at least 95% of the moments it's in the picture, and the window not moving at all where
 *     nothing in the picture moves (the still face, the face-less pattern).
 *   - A talk clip exported as a short: 1080 × 1920, the flash and the beep within a frame, captions in the lower third.
 *   - The window never reaches the web: no request got past its CSP to the main process's lock (MediaPipe's usage
 *     pings to Google, src/shorts/face-finder.ts), each refusal named in the app's log.
 * Into video/local/shorts-check/, replaced each run but for downloads/ (the model and the portrait). Needs a full
 * FFmpeg (TEST_FFMPEG or `ffmpeg`) and macOS's `say` for the talk.
 *
 *   pnpm build && pnpm exec node scripts/check-shorts.ts
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { _electron as electron, type ElectronApplication, type Page } from "playwright-core";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "./start.ts";
import { flashAndBeep, SYNC_RATE } from "./sync-clip.ts";

const stillBehind = watchFrontmost();
const local = path.resolve(appFolder, "..", "local");
const folder = path.join(local, "shorts-check");
const portrait = path.join(folder, "downloads", "portrait", "portrait.jpg");
const maker = process.env.TEST_FFMPEG ?? "ffmpeg";
const appData = path.join(local, "app-data");
const SECONDS = 12;
const failures: string[] = [];
const expect = (ok: boolean, what: string) => {
  console.log(`${ok ? "ok" : "FAIL"}: ${what}`);
  if (!ok) failures.push(what);
};
if (!existsSync(portrait)) throw new Error(`the test portrait is missing: ${portrait} (storage.googleapis.com/mediapipe-assets/portrait.jpg)`);

for (const entry of readdirSync(folder)) if (entry !== "downloads") rmSync(path.join(folder, entry), { recursive: true, force: true });
const clips = path.join(folder, "clips");
mkdirSync(clips, { recursive: true });
const run = (...args: string[]) => execFileSync(maker, ["-hide_banner", "-loglevel", "error", "-y", ...args]);

// The face and shoulders, 360 × 460 of the 820 × 1024 portrait, shown 520 high: a face about a fifth of the picture's
// height, as a webcam talk has.
const FACE_HEIGHT = 520;
const FACE_WIDTH = Math.round((360 * FACE_HEIGHT) / 460);
const face = path.join(clips, "face.png");
run("-i", portrait, "-vf", `crop=360:460:230:20,scale=${FACE_WIDTH}:${FACE_HEIGHT}`, face);

/** Where the face crop's left edge is at `t` seconds, in picture pixels; null where it isn't placed. */
type Placement = (t: number) => number | null;
interface TestClip {
  name: string;
  /** FFmpeg's overlay x for the face, as an expression of t. */
  x: string;
  place: Placement;
  /** A second, smaller face's x, or none. */
  second?: number;
  /** No face at all: the moving test pattern. */
  pattern?: boolean;
  still: boolean;
}
const middle = (1920 - FACE_WIDTH) / 2;
const TEST_CLIPS: TestClip[] = [
  { name: "still", x: String(middle), place: () => middle, still: true },
  { name: "walking", x: `150+${1920 - FACE_WIDTH - 300}*t/${SECONDS}`, place: (t) => 150 + ((1920 - FACE_WIDTH - 300) * t) / SECONDS, still: false },
  { name: "two-people", x: "200", place: () => 200, second: 1400, still: false },
  { name: "leaving", x: `${middle}+if(lt(t,2),0,(t-2)*350)`, place: (t) => middle + (t < 2 ? 0 : (t - 2) * 350), still: false },
  { name: "screen", x: "0", place: () => null, pattern: true, still: true },
];
const TOP = (1080 - FACE_HEIGHT) / 2 + 60;
for (const clip of TEST_CLIPS) {
  const out = path.join(clips, `${clip.name}.mp4`);
  const audio = ["-f", "lavfi", "-i", `anullsrc=r=48000:cl=mono:d=${SECONDS}`];
  if (clip.pattern) {
    run("-f", "lavfi", "-i", `testsrc2=s=1920x1080:r=30:d=${SECONDS}`, ...audio, "-shortest", "-c:v", "libx264", "-g", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", out);
    continue;
  }
  const second = clip.second === undefined ? "" : `;[1:v]scale=iw*0.6:ih*0.6[small];[base][small]overlay=x=${clip.second}:y=${TOP + 120}[out]`;
  run("-f", "lavfi", "-i", `color=c=0x5a6b7d:s=1920x1080:r=30:d=${SECONDS}`, "-loop", "1", "-i", face, ...audio,
    "-filter_complex", `[0:v][1:v]overlay=x='${clip.x}':y=${TOP}:shortest=1${clip.second === undefined ? "[out]" : "[base]"}${second}`,
    "-map", "[out]", "-map", "2:a", "-t", String(SECONDS), "-c:v", "libx264", "-g", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", out);
}

// The talk for the export: the flash and beep at 1 s with no face (the sync measure reads the picture's lower part),
// then the face from 2 s while a system voice talks.
const said = "Today I'm showing how a long talk becomes a short. The camera follows my face, and the captions sit low and large.";
const speech = path.join(clips, "speech.aiff");
execFileSync("say", ["-o", speech, said]);
const talk = path.join(clips, "talk.mp4");
run("-f", "lavfi", "-i", `color=c=gray:size=1280x720:rate=${SYNC_RATE}`, "-loop", "1", "-i", face,
  "-f", "lavfi", "-i", `aevalsrc='if(between(t,1,1+1/${SYNC_RATE}),sin(2*PI*1000*t),0)':s=48000:d=2.5`, "-i", speech,
  "-filter_complex", `[0:v]geq=lum='if(eq(N,${SYNC_RATE}),if(gt(Y,H/4),235,90),90)':cb=128:cr=128,format=yuv420p[grey];`
    + `[1:v]scale=-2:360[f];[grey][f]overlay=x=380:y=200:enable='gte(t,2)'[v];`
    + "[3:a]aresample=48000,aformat=channel_layouts=mono,apad=pad_dur=2[s];[2:a][s]concat=n=2:v=0:a=1[a]",
  "-map", "[v]", "-map", "[a]", "-shortest", "-c:v", "libx264", "-g", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", talk);

async function openClip(app: ElectronApplication, page: Page, file: string): Promise<void> {
  await app.evaluate(({ dialog }, chosen) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [chosen] });
  }, file);
  await page.getByRole("button", { name: "Choose a video" }).click();
  await page.locator(".preview-canvas[data-drawn]").waitFor({ timeout: 120_000 });
}

/** Moves the bar to `seconds` and waits until the frame there is drawn, by the preview's own record. */
async function viewAt(page: Page, seconds: number): Promise<{ left: number; width: number } | null> {
  await page.locator(".preview-bar").evaluate((bar: HTMLInputElement, value) => {
    bar.value = String(value);
    bar.dispatchEvent(new Event("input"));
  }, seconds);
  const target = Math.floor(seconds * 30 + 1e-6);
  await page.waitForFunction((frame) => {
    const drawn = document.querySelector<HTMLCanvasElement>(".preview-canvas")?.dataset.drawn;
    return drawn !== undefined && drawn !== "" && Math.floor(Number(drawn) * 30 + 1e-6) === frame;
  }, target, { timeout: 15_000 });
  const view = await page.locator(".preview-canvas").getAttribute("data-view");
  return view ? (JSON.parse(view) as { left: number; width: number }) : null;
}

/** The faces the app found and kept for the clip open now (its newest clip folder). */
function keptFaces(): { samples: { x: number; y: number; width: number; height: number }[][] } {
  const clipsFolder = path.join(appData, "clips");
  const newest = readdirSync(clipsFolder).map((id) => path.join(clipsFolder, id, "faces.json")).filter(existsSync)
    .sort((one, other) => Number(execFileSync("stat", ["-f", "%m", other])) - Number(execFileSync("stat", ["-f", "%m", one])))[0];
  if (!newest) throw new Error("no faces were kept");
  return JSON.parse(readFileSync(newest, "utf8"));
}

const results: Record<string, unknown> = {};
let faceOffset = { x: 0, width: 0 }; // the face's box inside the crop, from the still clip's detections, in pixels
rmSync(appData, { recursive: true, force: true });
for (const clip of TEST_CLIPS) {
  const app = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment() as Record<string, string> });
  try {
    const page = await app.firstWindow();
    page.on("pageerror", (error) => failures.push(`${clip.name}: window error: ${error.message}`));
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.setSize(1280, 800));
    await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
    const started = Date.now();
    await openClip(app, page, path.join(clips, `${clip.name}.mp4`));
    await page.getByLabel("Short (9:16)").check();
    // Attached, not visible: once the speaker's found, the status says nothing, so it's empty.
    await page.locator('.shorts-status[data-search="found"], .shorts-status[data-search="failed"]').waitFor({ state: "attached", timeout: 5 * 60_000 });
    const search = await page.locator(".shorts-status").getAttribute("data-search");
    expect(search === "found", `${clip.name}: the speaker search ended as "${search}" in ${((Date.now() - started) / 1000).toFixed(1)} s`);
    if (clip.name === "still") {
      const boxes = keptFaces().samples.flatMap((sample) => sample.slice(0, 1));
      const median = (values: number[]) => values.sort((one, other) => one - other)[Math.floor(values.length / 2)]!;
      faceOffset = { x: median(boxes.map((box) => box.x * 1920)) - middle, width: median(boxes.map((box) => box.width * 1920)) };
      const samples = keptFaces().samples.length;
      expect(boxes.length >= 0.95 * samples, `the still face was found in ${boxes.length} of ${samples} samples`);
    }
    const lefts: number[] = [];
    let inside = 0;
    let counted = 0;
    for (let t = 0.25; t < SECONDS - 0.2; t += 0.5) {
      const view = await viewAt(page, t);
      if (!view) {
        expect(false, `${clip.name}: no view drawn at ${t} s with Short on`);
        break;
      }
      lefts.push(view.left);
      const placed = clip.place(t);
      if (placed === null) continue;
      const wholeLeft = (placed + faceOffset.x) / 1920;
      const wholeRight = wholeLeft + faceOffset.width / 1920;
      const centre = (wholeLeft + wholeRight) / 2;
      if (centre < 0 || centre > 1) continue; // gone from the picture: nothing to follow
      // Only the part of the face still in the picture: the window can't follow past the picture's edge.
      const [faceLeft, faceRight] = [Math.max(0, wholeLeft), Math.min(1, wholeRight)];
      counted++;
      // Inside: the whole face within the window, a hundredth of the picture's width of grace at each edge.
      if (faceLeft >= view.left - 0.01 && faceRight <= view.left + view.width + 0.01) inside++;
    }
    const steady = Math.max(...lefts) - Math.min(...lefts);
    if (counted) expect(inside / counted >= 0.95, `${clip.name}: the face inside the 9:16 window at ${inside} of ${counted} moments`);
    if (clip.still) expect(steady < 0.002, `${clip.name}: the window held still (moved ${(steady * 1920).toFixed(1)} px across the picture)`);
    results[clip.name] = { inside, counted, steadyPixels: Math.round(steady * 1920) };
    await page.screenshot({ path: path.join(folder, `${clip.name}.png`) }).catch(() => undefined); // pictures never decide (CLAUDE.md › Traps)
  } finally {
    await app.close();
  }
}

// The talk, exported as a short with its captions in the picture.
{
  const exported = path.join(folder, "talk-short.mp4");
  const app = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment() as Record<string, string> });
  try {
    const page = await app.firstWindow();
    page.on("pageerror", (error) => failures.push(`export: window error: ${error.message}`));
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.setSize(1280, 800));
    await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
    await openClip(app, page, talk);
    await page.getByRole("button", { name: /^Clean up/ }).waitFor({ timeout: 10 * 60_000 }); // the captions are made
    await page.getByRole("button", { name: "Export", exact: true }).first().click();
    await page.getByRole("radio", { name: "Shorts" }).click();
    await app.evaluate(({ dialog }, chosen) => {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: chosen });
    }, exported);
    await page.getByRole("button", { name: "Change…" }).click();
    await page.locator("dialog.export .export-place-name").filter({ hasText: "talk-short" }).waitFor();
    await page.locator("dialog.export").getByRole("button", { name: "Export", exact: true }).click();
    await page.getByText(/^Saved as /).or(page.getByText("The export didn't finish")).first().waitFor({ timeout: 10 * 60_000 });
    expect(existsSync(exported), "the short was saved");
    await page.screenshot({ path: path.join(folder, "export.png") }).catch(() => undefined);
  } finally {
    await app.close();
  }
  if (existsSync(exported)) {
    const size = execFileSync(maker.replace(/ffmpeg$/, "ffprobe"), ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", exported]).toString().trim();
    expect(size === "1080,1920", `the short is 1080 × 1920 (${size})`);
    const sync = flashAndBeep(maker, exported);
    const gap = Math.abs(sync.flash / SYNC_RATE - sync.beepAt);
    expect(sync.flash >= 0 && gap <= 1 / SYNC_RATE + 1e-6, `the flash (frame ${sync.flash}) and the beep (${sync.beepAt.toFixed(3)} s) within a frame`);
    // The captions: the lit word's yellow (#ffd84d, preview/captions.ts), looked for in frames through the talk at a
    // quarter size, and where on the picture it sits.
    const frames = execFileSync(maker, ["-hide_banner", "-loglevel", "error", "-ss", "2.5", "-i", exported, "-vf", "fps=2,scale=270:480", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 256 * 1024 * 1024 });
    const frameBytes = 270 * 480 * 3;
    const rows: number[] = [];
    for (let start = 0; start + frameBytes <= frames.length; start += frameBytes) {
      for (let pixel = 0; pixel < 270 * 480; pixel++) {
        const [red, green, blue] = [frames[start + pixel * 3]!, frames[start + pixel * 3 + 1]!, frames[start + pixel * 3 + 2]!];
        if (red > 200 && green > 170 && blue < 130 && red - blue > 100) rows.push(Math.floor(pixel / 270) / 480);
      }
    }
    rows.sort((one, other) => one - other);
    const lowest = rows[Math.floor(rows.length * 0.02)] ?? -1;
    const highest = rows[Math.floor(rows.length * 0.98)] ?? -1;
    expect(rows.length > 50 && lowest >= 0.55 && highest <= 0.8,
      `the lit captions sit in the lower third (${rows.length} yellow pixels, from ${(lowest * 100).toFixed(0)}% to ${(highest * 100).toFixed(0)}% down)`);
    results.export = { size, sync, captionRows: [lowest, highest] };
  }
}

// The window never reached the web: the main process's lock caught nothing, as the CSP refused first.
const log = readFileSync(path.join(appData, "logs", "app.log"), "utf8");
const blocked = log.split("\n").filter((line) => line.includes("window_request_blocked"));
const refused = log.split("\n").filter((line) => line.includes("window_csp_refused"));
expect(blocked.length === 0, `no web request from the window reached the main process's lock (${blocked.length})`);
console.log(`the CSP refused ${refused.length}: ${[...new Set(refused.map((line) => line.replace(/^.*window_csp_refused\s*/, "")))].join(", ") || "nothing tried"}`);
results.privacy = { blocked: blocked.length, refused: refused.length };

console.log(JSON.stringify(results));
const front = stillBehind();
if (front) failures.push(`the screen was taken: ${front}`);
if (failures.length) {
  console.error(`shorts check FAILED:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("shorts follow the speaker, export at 1080 × 1920 in sync with captions low, and the window never reached the web");
