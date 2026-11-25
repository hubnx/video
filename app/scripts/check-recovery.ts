/**
 * Day 6's proof (docs/plan.md › Build order): a forced quit mid-edit, then a restart, brings back the exact project.
 * The app, behind, opens the talk clip (local/transcript-check/talk-60s.mp4), cuts its silences, splits and deletes a
 * piece and picks the Subtitles style; a second and a half later (the autosave's second) it's killed outright, as a
 * crash or a power cut would end it. A fresh start opens the same clip, and every cut, struck word and choice must be
 * as they were.
 *
 *   pnpm build && pnpm exec node scripts/check-recovery.ts
 */
import { rmSync } from "node:fs";
import path from "node:path";
import { _electron as electron, type ElectronApplication, type Page } from "playwright-core";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "./start.ts";

const stillBehind = watchFrontmost();
const local = path.resolve(appFolder, "..", "local");
const clip = path.join(local, "transcript-check", "talk-60s.mp4");
const failures: string[] = [];

async function openClip(): Promise<{ app: ElectronApplication; page: Page }> {
  const app = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment() as Record<string, string> });
  const page = await app.firstWindow();
  page.on("pageerror", (error) => failures.push(`window error: ${error.message}`));
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.setSize(1280, 800));
  await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
  await app.evaluate(({ dialog }, chosen) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [chosen] });
  }, clip);
  await page.getByRole("button", { name: "Choose a video" }).click();
  await page.locator(".cleanup:not([hidden])").waitFor({ timeout: 10 * 60_000 });
  await page.locator(".preview-canvas[data-drawn]").waitFor();
  return { app, page };
}

/** What the person would see of the edit: which pauses are cut, which words struck, the choices. */
async function editSeen(page: Page): Promise<string> {
  return page.evaluate(() => JSON.stringify({
    pausesCut: [...document.querySelectorAll(".pause")].map((pause) => pause.classList.contains("cut")),
    struck: [...document.querySelectorAll(".word.removed")].map((word) => word.textContent),
    checked: [...document.querySelectorAll('[role="radio"][aria-checked="true"]')].map((radio) => radio.textContent),
  }));
}

rmSync(path.join(local, "app-data"), { recursive: true, force: true }); // a fresh copy; the models (local/models) stay
let before = "";
const first = await openClip();
try {
  await first.page.getByRole("button", { name: /^Clean up: \d+ silences?$/ }).click();
  await first.page.locator(".preview-bar").evaluate((bar: HTMLInputElement) => {
    bar.value = "20";
    bar.dispatchEvent(new Event("input"));
  });
  await first.page.waitForTimeout(300);
  await first.page.locator(".timeline-canvas").focus();
  await first.page.keyboard.press("s");
  await first.page.keyboard.press("Delete");
  await first.page.getByRole("radio", { name: "Subtitles" }).click();
  before = await editSeen(first.page);
  await first.page.waitForTimeout(1500); // the autosave's second, and a half for the disk
} finally {
  first.app.process().kill("SIGKILL"); // a crash, not a quit: nothing gets to save on the way out
}
await new Promise((resolve) => setTimeout(resolve, 1000));
const second = await openClip();
try {
  const after = await editSeen(second.page);
  console.log(`before the kill: ${before}`);
  console.log(`after a restart: ${after}`);
  if (after !== before) failures.push("the project after a forced quit and a restart isn't the one before");
  if (!JSON.parse(before).struck.length) failures.push("the edit made before the kill took nothing out, so it proves nothing");
} finally {
  await second.app.close();
}
const taken = stillBehind();
if (taken) failures.push(`SCREEN_TAKEN: ${taken}`);
if (failures.length) {
  console.error(`RECOVERY_CHECK_FAILED:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("a forced quit mid-edit, then a restart, brought back the exact project");
