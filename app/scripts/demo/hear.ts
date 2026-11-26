/**
 * What hubnx Video hears in a file: opened in the app behind, its transcript read once made, printed as one line. The
 * demo's narration is checked with it against narration.json, so a word the voice says unclearly is found before an
 * audience does.
 *
 *   pnpm exec node scripts/demo/hear.ts <file>
 */
import path from "node:path";
import { _electron as electron } from "playwright-core";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "../start.ts";

const file = path.resolve(process.argv[2] ?? "");
const stillBehind = watchFrontmost();
const app = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment() as Record<string, string> });
try {
  const page = await app.firstWindow();
  await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
  await app.evaluate(({ dialog }, chosen) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [chosen] });
  }, file);
  await page.getByRole("button", { name: "Choose a video" }).click();
  await page.locator(".cleanup:not([hidden])").waitFor({ timeout: 10 * 60_000 }); // the transcript and sound map are made
  console.log((await page.locator(".word").allInnerTexts()).join(" "));
} finally {
  await app.close();
}
const front = stillBehind();
if (front) throw new Error(`the screen was taken: ${front}`);
