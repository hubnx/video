/**
 * Day 3's proof (docs/plan.md › Build order): the preview shows the exact frame for each moment, and the picture keeps
 * time with the sound. A test clip carries its own frame number as twelve bars across its top (white for a 1 bit), a
 * white flash at frame 150 and a beep at the same moment (5 s). The app, run behind, opens it through its own dialog
 * and preview; the check then
 *   - moves the bar to 40 random frames and reads each frame's number back from the canvas's pixels: 0 misses;
 *   - plays from 4 s and, at every screen refresh, compares the frame drawn with the sound's clock: within one frame;
 *   - opens the same clip stored sideways (a phone held upright) and reads the bars where an upright picture has them.
 * Into video/local/preview-check/, replaced each run. Needs a full FFmpeg to make the clips (TEST_FFMPEG or `ffmpeg`).
 *
 *   pnpm build && pnpm exec node scripts/check-preview.ts
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { _electron as electron, type Page } from "playwright-core";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "./start.ts";

const stillBehind = watchFrontmost();
const local = path.resolve(appFolder, "..", "local");
const folder = path.join(local, "preview-check");
const maker = process.env.TEST_FFMPEG ?? "ffmpeg";
const RATE = 30;
const FRAMES = 300;
const BITS = 12;

rmSync(folder, { recursive: true, force: true });
mkdirSync(folder, { recursive: true });
const numbered = path.join(folder, "numbered.mp4");
const sideways = path.join(folder, "numbered-sideways.mp4");
// The top quarter: bit i of the frame number as bar i, left to right. The rest: grey, white on frame 150.
const picture = `geq=lum='if(lt(Y,H/4),if(bitand(N,pow(2,floor(X*${BITS}/W))),235,16),if(eq(N,150),235,90))':cb=128:cr=128`;
execFileSync(maker, ["-hide_banner", "-loglevel", "error", "-y",
  "-f", "lavfi", "-i", `color=c=gray:size=1280x720:rate=${RATE}:duration=${FRAMES / RATE}`,
  "-f", "lavfi", "-i", `aevalsrc='if(between(t,5,5+1/${RATE}),sin(2*PI*1000*t),0)':s=48000:d=${FRAMES / RATE}`,
  "-vf", `${picture},format=yuv420p`, "-c:v", "libx264", "-g", "30", "-c:a", "aac", "-shortest", numbered]);
// Stored as it is, shown turned a quarter clockwise: the bars then run down the picture's right side.
execFileSync(maker, ["-hide_banner", "-loglevel", "error", "-y", "-display_rotation:v:0", "-90", "-i", numbered, "-c", "copy", sideways]);

/** The frame number in the bars of the picture on the canvas: read along its top (or its right side when turned). */
async function readNumber(page: Page, turned: boolean): Promise<number> {
  return page.evaluate(({ turned, bits }) => {
    const canvas = document.querySelector<HTMLCanvasElement>(".preview-canvas")!;
    const copy = new OffscreenCanvas(canvas.width, canvas.height);
    const context = copy.getContext("2d")!;
    context.drawImage(canvas, 0, 0);
    // Where the picture sits in the canvas: the columns and rows that aren't black bars.
    const row = context.getImageData(0, Math.floor(canvas.height / 2), canvas.width, 1).data;
    let left = 0;
    while (left < canvas.width && row[left * 4]! < 8) left++;
    let right = canvas.width - 1;
    while (right > left && row[right * 4]! < 8) right--;
    const width = right - left + 1;
    let number = 0;
    for (let bit = 0; bit < bits; bit++) {
      const x = turned ? left + width * (7 / 8) : left + width * ((bit + 0.5) / bits);
      const y = turned ? canvas.height * ((bit + 0.5) / bits) : canvas.height / 8;
      const pixel = context.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      if (pixel[0]! > 128) number |= 1 << bit;
    }
    return number;
  }, { turned, bits: BITS });
}

/** Moves the bar to `seconds`, as a person drags it, and waits until the app has drawn the frame showing there, by its
 * own record of the frame drawn. Waiting only for "close to the moment" passed before a seek to the next frame had
 * drawn (a frame is 0.033 s; the old tolerance was 0.04 s), so the pixels read were the last frame's: the 1-in-40
 * miss of 2026-11-21, a fault of this check, not the app. A frame never drawn times out, and says which was. */
async function seekTo(page: Page, seconds: number): Promise<void> {
  await page.locator(".preview-bar").evaluate((bar: HTMLInputElement, value) => {
    bar.value = String(value);
    bar.dispatchEvent(new Event("input"));
  }, seconds);
  const target = Math.floor(seconds * RATE + 1e-6);
  await page.waitForFunction(({ target, rate }) => {
    const drawn = document.querySelector<HTMLCanvasElement>(".preview-canvas")?.dataset.drawn;
    return drawn !== undefined && drawn !== "" && Math.floor(Number(drawn) * rate + 1e-6) === target;
  }, { target, rate: RATE }, { timeout: 10_000 }).catch(async () => {
    const drawn = await page.locator(".preview-canvas").getAttribute("data-drawn");
    throw new Error(`a seek to frame ${target} never drew it: the app last drew ${drawn} s`);
  });
}

/** Opens `file` in a fresh copy of the app, behind, through its own dialog, and runs `check` on its window. */
async function withClip(file: string, check: (page: Page) => Promise<void>): Promise<void> {
  rmSync(path.join(local, "app-data"), { recursive: true, force: true });
  const app = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment() as Record<string, string> });
  try {
    const page = await app.firstWindow();
    // The window's own errors, printed: a preview that never appears says why here.
    page.on("pageerror", (error) => console.error(`window error: ${error.message}`));
    page.on("console", (message) => message.type() === "error" && console.error(`window console: ${message.text()}`));
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.setSize(1280, 900));
    await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
    await app.evaluate(({ dialog }, chosen) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [chosen] });
    }, file);
    await page.getByRole("button", { name: "Choose a video" }).click();
    await page.locator(".preview-canvas[data-drawn]").waitFor({ timeout: 60_000 });
    await check(page);
  } finally {
    await app.close();
  }
}

const failures: string[] = [];
try {
  await withClip(numbered, async (page) => {
    // Random seeks, read back from the pixels.
    const frames = Array.from({ length: Number(process.env.SEEKS ?? 40) }, () => Math.floor(Math.random() * (FRAMES - 1)));
    let misses = 0;
    for (const frame of frames) {
      await seekTo(page, frame / RATE);
      const shown = await readNumber(page, false);
      if (shown !== frame) {
        misses++;
        // What the app says it drew, beside what the pixels show: tells a drawing race from a timing slip.
        const drawn = await page.locator(".preview-canvas").getAttribute("data-drawn");
        failures.push(`seek to frame ${frame} showed frame ${shown} (the app says it drew ${drawn} s, frame ${Math.floor(Number(drawn) * RATE + 1e-6)})`);
      }
    }
    console.log(`seeks: ${frames.length - misses} of ${frames.length} showed the exact frame`);

    // Picture against sound while playing.
    await seekTo(page, 4);
    await page.getByRole("button", { name: "Play" }).click();
    const offsets = await page.evaluate(({ rate }) => new Promise<number[]>((resolve) => {
      const canvas = document.querySelector<HTMLCanvasElement>(".preview-canvas")!;
      const found: number[] = [];
      const started = performance.now();
      const sample = () => {
        const drawn = Number(canvas.dataset.drawn);
        const clock = Number(canvas.dataset.clock);
        // Past the first half second, once playing has settled.
        if (performance.now() - started > 500) found.push(Math.floor(drawn * rate + 1e-6) - Math.floor(clock * rate + 1e-6));
        if (performance.now() - started < 3000) requestAnimationFrame(sample);
        else resolve(found);
      };
      requestAnimationFrame(sample);
    }), { rate: RATE });
    const worst = Math.max(...offsets.map(Math.abs));
    console.log(`playing: ${offsets.length} refreshes, the drawn frame at most ${worst} frame(s) from the sound's`);
    if (!offsets.length) failures.push("playing showed no frames");
    if (worst > 1) failures.push(`the picture drifted ${worst} frames from the sound`);
    await page.getByRole("button", { name: "Pause" }).click();
  });

  // A phone held upright: stored landscape, shown upright.
  await withClip(sideways, async (page) => {
    for (const frame of [0, 77, 250]) {
      await seekTo(page, frame / RATE);
      const shown = await readNumber(page, true);
      if (shown !== frame) failures.push(`sideways clip at frame ${frame} read ${shown}: not turned upright the right way`);
    }
    console.log("sideways clip: read where an upright picture has its bars");
    await page.screenshot({ path: path.join(folder, "sideways.png") });
  });
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}
const taken = stillBehind();
if (taken) failures.push(`SCREEN_TAKEN: ${taken}`);
if (failures.length) {
  console.error(`PREVIEW_CHECK_FAILED:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("the preview shows exact frames, keeps time with the sound, and turns a phone video upright");
