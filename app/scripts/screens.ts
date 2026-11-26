/**
 * Screenshots of every screen at window sizes from the smallest the app allows to a wide monitor, light and dark, into
 * video/local/screens/<screen>-<size>-<theme>.png (each run replaces the pictures it takes). Look at each before anyone
 * else does (../../docs/brand.md › Clarity check), then hand them to a fresh reviewer at the feature's gate
 * (docs/product.md › Four gates).
 * The app runs behind, never taking the screen. Run after `pnpm build`:
 *
 *   pnpm exec node scripts/screens.ts
 */
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { _electron as electron, type ElectronApplication, type Page } from "playwright-core";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "./start.ts";

const stillBehind = watchFrontmost();
const local = path.resolve(appFolder, "..", "local");
const folder = path.join(local, "screens");
// A clip the import check makes (scripts/check-import.ts): a phone video, whose jobs show on the clip screen.
const CLIP = path.join(local, "import-check", "clips", "iphone-hlg.mov");

const SIZES = [
  { name: "small", width: 400, height: 640 }, // the smallest the window allows (electron/main.ts)
  { name: "half", width: 760, height: 800 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "wide", width: 1920, height: 1080 },
];

async function shoot(running: ElectronApplication, page: Page, screen: string): Promise<void> {
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await running.evaluate(({ nativeTheme }, chosen) => {
      nativeTheme.themeSource = chosen;
    }, theme);
    for (const size of SIZES) {
      await running.evaluate(({ BrowserWindow }, wanted) => {
        BrowserWindow.getAllWindows()[0]?.setSize(wanted.width, wanted.height);
      }, size);
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(folder, `${screen}-${size.name}-${theme}.png`) });
    }
  }
}

await mkdir(folder, { recursive: true });
await rm(path.join(local, "app-data"), { recursive: true, force: true }); // a first run, as a person's
const running = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment() as Record<string, string> });
let failure: unknown = null;
try {
  const page = await running.firstWindow();
  await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
  await shoot(running, page, "1-start");

  // Day 8's dialogs over the start screen: Settings, the feedback form with what it sends shown, the licenses; and
  // the update's strip, as a ready update would show it.
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.locator("dialog.settings[open]").waitFor();
  await page.locator(".check-in-numbers li").first().waitFor();
  await shoot(running, page, "8-settings");
  await page.locator("dialog.settings").getByRole("button", { name: "Open-source licenses" }).click();
  await page.locator("dialog.licenses[open] .license-list").waitFor();
  await shoot(running, page, "8-licenses");
  await page.locator("dialog.licenses").getByRole("button", { name: "Close" }).click();
  await page.locator("dialog.settings").getByRole("button", { name: "Close" }).click();
  await page.locator(".top-actions").getByRole("button", { name: "Feedback" }).click();
  const feedback = page.locator("dialog.feedback[open]");
  await feedback.locator("textarea").fill("The captions stopped halfway through a long video.");
  await feedback.getByRole("checkbox").check();
  await feedback.locator("summary").click();
  await feedback.locator(".feedback-preview").filter({ hasText: "hubnx Video" }).waitFor();
  await shoot(running, page, "8-feedback");
  await feedback.getByRole("button", { name: "Cancel" }).click();
  await running.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.webContents.send("update:found", { state: "ready", version: "1.0.1" }));
  await page.locator(".notice").filter({ hasText: "1.0.1 is ready" }).waitFor();
  await shoot(running, page, "8-update");

  // The system's file dialog answers with the test clip, as if the person picked it.
  await running.evaluate(({ dialog }, file) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [file] });
  }, CLIP);
  await page.getByRole("button", { name: "Choose a video" }).click();
  await page.locator(".clip-status progress").waitFor({ timeout: 60_000 });
  await shoot(running, page, "2-preparing");

  // The export dialog over the clip, before it starts: its size and caption choices.
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await page.locator("dialog.export[open]").waitFor();
  await shoot(running, page, "7-export");
} catch (error) {
  failure = error;
} finally {
  await running.close();
}
const taken = stillBehind();
if (taken) throw new Error(`SCREEN_TAKEN: ${taken}`);
if (failure) throw failure;
console.log(`pictures in ${folder}`);
