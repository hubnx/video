/**
 * The home page's picture (site/index.html, under the hero): hubnx Video with the demo's talk (make-talk.ts) open and
 * cleaned up, paused on a caption, in the light theme and the dark, as the site shows each with the visitor's own
 * (site/public/screens/clean-up-light.webp and -dark.webp). The app runs behind, as every check does.
 *
 *   pnpm build && pnpm exec node scripts/demo/hero.ts
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { _electron as electron } from "playwright-core";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "../start.ts";

const stillBehind = watchFrontmost();
const local = path.resolve(appFolder, "..", "local");
const talk = path.join(local, "demo", "talk", "talk.mp4");
const shots = path.join(local, "demo", "hero");
const site = path.resolve(appFolder, "..", "site", "public", "screens");
const SIZE = { width: 1600, height: 900 };

rmSync(shots, { recursive: true, force: true });
mkdirSync(shots, { recursive: true });
mkdirSync(site, { recursive: true });
rmSync(path.join(local, "app-data"), { recursive: true, force: true });
const app = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment() as Record<string, string> });
try {
  const page = await app.firstWindow();
  await app.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0]?.setContentSize(size.width, size.height), SIZE);
  await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
  await app.evaluate(({ dialog }, chosen) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [chosen] });
  }, talk);
  await page.getByRole("button", { name: "Choose a video" }).click();
  const cleanUp = page.getByRole("button", { name: /^Clean up: \d+ silences?$/ });
  await cleanUp.waitFor({ timeout: 10 * 60_000 });
  await cleanUp.click();
  // Taken once the speaker search has ended, so no switch in the picture shows work in progress.
  await page.locator('.shorts-status[data-search="found"], .shorts-status[data-search="failed"]').waitFor({ state: "attached", timeout: 5 * 60_000 });
  // Paused mid-sentence on the second line, so the picture carries a caption with its word lit.
  await page.locator(".preview-bar").evaluate((bar: HTMLInputElement) => {
    bar.value = "8.6";
    bar.dispatchEvent(new Event("input"));
  });
  await page.waitForTimeout(800);
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await app.evaluate(({ nativeTheme }, chosen) => {
      nativeTheme.themeSource = chosen;
    }, theme);
    await page.waitForTimeout(600);
    const png = path.join(shots, `clean-up-${theme}.png`);
    await page.screenshot({ path: png });
    // WebP at a quality where interface text stays crisp, about a tenth of the PNG's bytes.
    execFileSync("cwebp", ["-quiet", "-q", "88", "-m", "6", png, "-o", path.join(site, `clean-up-${theme}.webp`)]);
  }
} finally {
  await app.close();
}
const front = stillBehind();
if (front) throw new Error(`the screen was taken: ${front}`);
console.log(`pictures in ${site}`);
