/**
 * Films hubnx Video editing the demo talk (make-talk.ts), as a person would: the talk dropped in, its captions written
 * as it's heard, Clean up pressed and played over a cut, the clean voice switched on, the short, then the export. The
 * app runs behind as every check does; Playwright records its window's frames. Each step's moment goes in marks.json,
 * which the cut (compose.ts) reads to speed through the waits and lay its words over the right moments.
 *
 *   pnpm build && pnpm exec node scripts/demo/film.ts
 *
 * Into video/local/demo/film/: the recording (raw.webm), marks.json, and the exported video.
 */
import { renameSync, readdirSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { _electron as electron, type Page } from "playwright-core";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "../start.ts";

const stillBehind = watchFrontmost();
const local = path.resolve(appFolder, "..", "local");
const out = path.join(local, "demo", "film");
const talk = path.join(local, "demo", "talk", "talk.mp4");
/** 16:9 at a size the window can take on a laptop's screen; the cut scales it to 1920 × 1080. */
const SIZE = { width: 1600, height: 900 };

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
rmSync(path.join(local, "app-data"), { recursive: true, force: true }); // a first run, as a person's
const app = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment() as Record<string, string>,
  recordVideo: { dir: out, size: SIZE } });
const marks: Record<string, number> = {};
let zero = 0;
const mark = (name: string) => {
  marks[name] = (Date.now() - zero) / 1000;
  console.log(`${marks[name]!.toFixed(1)} s  ${name}`);
};
/** Plays the preview from `seconds` of the clip for `wall` seconds of the window's time. */
const playFrom = async (page: Page, seconds: number, wall: number) => {
  await page.locator(".preview-bar").evaluate((bar: HTMLInputElement, value) => {
    bar.value = String(value);
    bar.dispatchEvent(new Event("input"));
  }, seconds);
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(wall * 1000);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
};
try {
  const page = await app.firstWindow();
  zero = Date.now();
  await app.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0]?.setContentSize(size.width, size.height), SIZE);
  await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
  await page.waitForTimeout(2000);
  mark("start");
  await app.evaluate(({ dialog }, chosen) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [chosen] });
  }, talk);
  await page.getByRole("button", { name: "Choose a video" }).click();
  mark("opened");
  await page.locator(".word").first().waitFor({ timeout: 5 * 60_000 });
  mark("firstWords");
  const cleanUp = page.getByRole("button", { name: /^Clean up: \d+ silences?$/ });
  await cleanUp.waitFor({ timeout: 10 * 60_000 });
  mark("captioned");
  await page.waitForTimeout(2500);
  marks.silences = Number(/(\d+)/.exec(await cleanUp.innerText())![1]);
  mark("cleanUp");
  await cleanUp.click();
  await page.waitForTimeout(2500);
  mark("playCut");
  await playFrom(page, 4, 5);
  mark("cleanVoice");
  await page.getByLabel("Clean voice").check();
  await page.getByText("Background noise removed").waitFor({ timeout: 10 * 60_000 });
  mark("voiceReady");
  await page.waitForTimeout(2000);
  await playFrom(page, 12, 4);
  mark("short");
  await page.getByLabel("Short (9:16)").check();
  await page.locator('.shorts-status[data-search="found"], .shorts-status[data-search="failed"]').waitFor({ state: "attached", timeout: 5 * 60_000 });
  mark("shortReady");
  await playFrom(page, 18, 4);
  mark("export");
  await page.getByRole("button", { name: "Export", exact: true }).first().click();
  await page.locator("dialog.export[open]").waitFor();
  await app.evaluate(({ dialog }, chosen) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: chosen });
  }, path.join(out, "talk-edited.mp4"));
  await page.getByRole("radio", { name: "YouTube" }).click();
  await page.getByRole("button", { name: "Change…" }).click();
  await page.waitForTimeout(2500);
  mark("exporting");
  await page.locator("dialog.export").getByRole("button", { name: "Export", exact: true }).click();
  await page.getByText(/^Saved as /).waitFor({ timeout: 10 * 60_000 });
  mark("saved");
  await page.waitForTimeout(3000);
  mark("end");
} finally {
  await app.close(); // the recording is written on close
}
const recorded = readdirSync(out).find((name) => name.endsWith(".webm"));
if (recorded) renameSync(path.join(out, recorded), path.join(out, "raw.webm"));
writeFileSync(path.join(out, "marks.json"), JSON.stringify(marks, null, 1));
const front = stillBehind();
if (front) throw new Error(`the screen was taken: ${front}`);
console.log(`filmed: ${recorded ? "raw.webm" : "NO RECORDING"}, ${Object.keys(marks).length} marks`);
