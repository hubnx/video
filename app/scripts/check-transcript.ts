/**
 * Day 4's check (docs/plan.md › Build order): a talk opened in the app, behind, gets its speech model (downloaded the
 * first time, checked by SHA-256), its transcript filling in while it's heard, and captions drawn on the picture. The
 * clip is a minute of the filler check's AMI speech under a plain picture (CC BY 4.0, local only):
 * local/transcript-check/talk-60s.mp4. Screenshots go to local/screens/4-transcript-*.png.
 *
 *   pnpm build && pnpm exec node scripts/check-transcript.ts
 */
import { rmSync } from "node:fs";
import path from "node:path";
import { _electron as electron } from "playwright-core";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "./start.ts";

const stillBehind = watchFrontmost();
const local = path.resolve(appFolder, "..", "local");
const clip = path.join(local, "transcript-check", "talk-60s.mp4");
const failures: string[] = [];

rmSync(path.join(local, "app-data"), { recursive: true, force: true }); // a fresh copy; the models (local/models) stay
const app = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment() as Record<string, string> });
try {
  const page = await app.firstWindow();
  page.on("pageerror", (error) => failures.push(`window error: ${error.message}`));
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.setSize(1280, 800));
  await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
  await app.evaluate(({ dialog }, chosen) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [chosen] });
  }, clip);
  const started = Date.now();
  await page.getByRole("button", { name: "Choose a video" }).click();
  // The first words, while the rest are still being heard; or the app's own word for what went wrong, at once.
  await page.locator(".transcript-line").or(page.locator(".clip-problem:not([hidden])")).first().waitFor({ timeout: 30 * 60_000 });
  if (await page.locator(".clip-problem").isVisible()) throw new Error(`the app said: ${await page.locator(".clip-problem").innerText()}`);
  const firstWordsAfter = (Date.now() - started) / 1000;
  const whileHearing = await page.locator(".clip-status").isVisible();
  await page.screenshot({ path: path.join(local, "screens", "4-transcript-hearing.png") });
  // All of it: the status line goes once nothing holds the person up.
  await page.locator(".clip-status").waitFor({ state: "hidden", timeout: 10 * 60_000 });
  const wordCount = await page.locator(".transcript .word").count();
  const text = (await page.locator(".transcript-words").innerText()).slice(0, 160);
  console.log(`first words after ${firstWordsAfter.toFixed(0)} s (still hearing: ${whileHearing}); ${wordCount} words in all`);
  console.log(`it begins: ${text.replace(/\s+/g, " ")}`);
  if (wordCount < 80) failures.push(`only ${wordCount} words heard in a minute of talk`);
  if (await page.locator(".clip-problem").isVisible()) failures.push(`the app said: ${await page.locator(".clip-problem").innerText()}`);

  // A word clicked plays from it, and its caption is drawn on the picture (white text in the picture's lower part).
  await page.locator(".transcript .word").nth(20).click();
  await page.waitForTimeout(500);
  const captionPixels = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(".preview-canvas")!;
    const copy = new OffscreenCanvas(canvas.width, canvas.height);
    const context = copy.getContext("2d")!;
    context.drawImage(canvas, 0, 0);
    const band = context.getImageData(0, Math.floor(canvas.height * 0.8), canvas.width, Math.floor(canvas.height * 0.15)).data;
    let white = 0;
    for (let index = 0; index < band.length; index += 4) if (band[index]! > 230 && band[index + 1]! > 230 && band[index + 2]! > 230) white++;
    return white;
  });
  console.log(`caption pixels in the picture's lower band: ${captionPixels}`);
  if (captionPixels < 200) failures.push("no caption drawn on the picture after a word was clicked");
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await app.evaluate(({ nativeTheme }, chosen) => {
      nativeTheme.themeSource = chosen;
    }, theme);
    for (const [name, width, height] of [["small", 400, 640], ["laptop", 1280, 800], ["wide", 1920, 1080]] as const) {
      await app.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0]?.setSize(size.width, size.height), { width, height });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(local, "screens", `4-transcript-${name}-${theme}.png`) });
    }
  }
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  await app.close();
}
const taken = stillBehind();
if (taken) failures.push(`SCREEN_TAKEN: ${taken}`);
if (failures.length) {
  console.error(`TRANSCRIPT_CHECK_FAILED:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("the talk was heard, its transcript filled in, and its captions drew on the picture");
