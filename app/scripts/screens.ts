/**
 * Screenshots of every screen at window sizes from the smallest the app allows to a wide monitor, light and dark, into
 * video/local/screens/<screen>-<size>-<theme>.png (each run replaces the pictures it takes). Look at each before anyone
 * else does (../../docs/brand.md › Clarity check), then send them to `video assistant` (docs/plan.md › Check-ins).
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

  // The system's file dialog answers with the test clip, as if the person picked it.
  await running.evaluate(({ dialog }, file) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [file] });
  }, CLIP);
  await page.getByRole("button", { name: "Choose a video" }).click();
  await page.locator(".job progress").first().waitFor({ timeout: 60_000 });
  await shoot(running, page, "2-preparing");
} catch (error) {
  failure = error;
} finally {
  await running.close();
}
const taken = stillBehind();
if (taken) throw new Error(`SCREEN_TAKEN: ${taken}`);
if (failure) throw failure;
console.log(`pictures in ${folder}`);
