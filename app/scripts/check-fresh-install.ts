/**
 * The fresh-install check, before every release (docs/plan.md › Keep or stop: the number to watch is the minutes from
 * first launch to first export): an installed copy of the release's own package, opened with nothing on the computer
 * yet, behind whatever is in front, does what a new person does:
 *   1. opens a talk clip (a flash and a beep at 1 s, then a sentence the system's own voice spoke);
 *   2. downloads the speech model and writes the captions, which must hear most of the sentence;
 *   3. cleans up the silences it proposes;
 *   4. exports with the captions in the picture, through its own dialog;
 * then the file is read: H.264 and AAC at 48 kHz, and the flash and the beep still within a frame of each other with
 * this system's own AAC encoder. The minutes from launch to the export's end, and each step's, are printed as one
 * FRESH_INSTALL_RESULT line (GitHub's runs keep results in their logs: CLAUDE.md › Traps). Run by
 * .github/workflows/fresh-install.yml on GitHub's Windows, Ubuntu and Apple-chip Mac, and here for the Intel Mac.
 *
 *   pnpm exec node scripts/check-fresh-install.ts --program <installed app's program> --speech <wav> --said "<its words>" \
 *     [--ffmpeg <an FFmpeg to make and read the clip>] [--out <folder>]
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { _electron as electron } from "playwright-core";
import { programName } from "../electron/targets.ts";
import { appFolder, electronEnvironment, oursRunning, watchFrontmost } from "./start.ts";
import { flashAndBeep, makeTalkClip, SYNC_RATE } from "./sync-clip.ts";

const stillBehind = watchFrontmost();
const { values } = parseArgs({ options: { program: { type: "string" }, speech: { type: "string" }, said: { type: "string" }, ffmpeg: { type: "string" }, out: { type: "string" } } });
if (!values.program || !values.speech || !values.said) throw new Error("check-fresh-install --program <path> --speech <wav> --said <words> [--ffmpeg <path>] [--out <folder>]");
const program = path.resolve(values.program);
// The FFmpeg inside the installed copy, unless one is named (an AppImage's is inside its mounted image).
const resources = process.platform === "darwin" ? path.resolve(program, "..", "..", "Resources") : path.join(path.dirname(program), "resources");
const ffmpeg = values.ffmpeg ?? path.join(resources, "bin", programName(process.platform, "ffmpeg"));
if (!existsSync(ffmpeg)) throw new Error(`NO_FFMPEG: ${ffmpeg}`);
const out = path.resolve(values.out ?? path.join(appFolder, "..", "local", "fresh-install"));
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const clip = path.join(out, "talk.mp4");
const exported = path.join(out, "talk edited.mp4");
makeTalkClip(ffmpeg, path.resolve(values.speech), clip);

const failures: string[] = [];
const expect = (ok: boolean, what: string) => {
  console.log(`${ok ? "ok" : "FAIL"}: ${what}`);
  if (!ok) failures.push(what);
};
const seconds: Record<string, number> = {};
const started = Date.now();
const since = () => Math.round((Date.now() - started) / 100) / 10;

// Chromium's sandbox can't start on GitHub's Ubuntu from an AppImage or as root (check-package.ts says why).
const launchArguments = process.platform === "linux" && (process.getuid?.() === 0 || process.env.CI) ? ["--no-sandbox"] : [];
const app = await electron.launch({ executablePath: program, args: launchArguments, timeout: 180_000,
  env: electronEnvironment({ VIDEO_CHECK_DATA: path.join(out, "data") }) as Record<string, string> });
let heard = "";
try {
  const page = await app.firstWindow();
  page.on("pageerror", (error) => failures.push(`window error: ${error.message}`));
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.setSize(1280, 800));
  await page.getByRole("heading", { name: "Drop a video here" }).waitFor({ timeout: 120_000 });
  seconds.startScreen = since();

  await app.evaluate(({ dialog }, chosen) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [chosen] });
  }, clip);
  await page.getByRole("button", { name: "Choose a video" }).click();
  // The model downloads (about 670 MB), then the captions are written; every job done when the status line goes.
  await page.locator(".transcript-paragraph").or(page.locator(".clip-problem:not([hidden])")).first().waitFor({ timeout: 30 * 60_000 });
  if (await page.locator(".clip-problem").isVisible()) throw new Error(`the app said: ${await page.locator(".clip-problem").innerText()}`);
  await page.locator(".clip-status").waitFor({ state: "hidden", timeout: 30 * 60_000 });
  seconds.captions = since();
  heard = (await page.locator(".transcript-words").innerText()).toLowerCase();
  const wanted = values.said.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter((word) => word.length > 2);
  const found = wanted.filter((word) => heard.includes(word));
  expect(found.length / wanted.length >= 0.6, `the captions heard ${found.length} of the sentence's ${wanted.length} longer words ("${heard.slice(0, 120)}")`);

  // Clean up: one press cuts every proposed silence (the quiet after the sentence, at least).
  const cleanUp = page.getByRole("button", { name: /^Clean up: \d+ silences?$/ });
  if (await cleanUp.isVisible()) {
    await cleanUp.click();
    seconds.cleanedUp = since();
  }
  expect(await page.getByRole("button", { name: "Put all the silences back" }).isVisible(), "Clean up proposed and cut the silences");

  await page.getByRole("button", { name: "Export", exact: true }).first().click();
  const dialog = page.locator("dialog.export");
  await app.evaluate(({ dialog: dialogs }, chosen) => {
    dialogs.showSaveDialog = async () => ({ canceled: false, filePath: chosen });
  }, exported);
  await dialog.getByRole("button", { name: "Change…" }).click();
  await dialog.locator(".export-place-name").filter({ hasText: path.basename(exported) }).waitFor({ timeout: 10_000 });
  await dialog.getByRole("radio", { name: "In the video" }).click();
  await dialog.getByRole("button", { name: "Export", exact: true }).click();
  await dialog.locator(".dialog-status").filter({ hasText: /Saved as|didn't finish|Stopped/ }).waitFor({ timeout: 20 * 60_000 });
  const said = await dialog.locator(".dialog-status").innerText();
  expect(said.startsWith(`Saved as ${path.basename(exported)}.`), `the export said "${said.split("\n")[0]}"`);
  seconds.firstExport = since();
  await page.screenshot({ path: path.join(out, "exported.png") });
  if (process.platform === "darwin" && !oursRunning()) failures.push("WATCHED_NOTHING: macOS never listed our app as running");
} catch (error) {
  failures.push(`the flow stopped: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`);
} finally {
  await app.close();
}

let sync: { flash: number; beepAt: number } | null = null;
if (existsSync(exported)) {
  const facts = (() => {
    try {
      execFileSync(ffmpeg, ["-hide_banner", "-i", exported], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      return "";
    } catch (error) {
      return String((error as { stderr?: string }).stderr ?? ""); // -i alone exits 1, its facts on stderr
    }
  })();
  expect(/Video: h264/.test(facts) && /Audio: aac[^\n]*48000 Hz/.test(facts), "H.264 and AAC at 48 kHz");
  sync = flashAndBeep(ffmpeg, exported);
  const apart = Math.abs(sync.flash / SYNC_RATE - sync.beepAt);
  expect(sync.flash >= 0 && apart <= 1 / SYNC_RATE + 0.005, `the flash (frame ${sync.flash}) and the beep (${sync.beepAt.toFixed(3)} s) are ${(apart * 1000).toFixed(0)} ms apart, within a frame`);
}
const taken = stillBehind();
if (taken) failures.push(`SCREEN_TAKEN: ${taken}`);

const result = { measured: new Date().toISOString(), system: `${process.platform}-${process.arch}`, processor: cpus()[0]?.model, cores: cpus().length,
  seconds, minutesToFirstExport: seconds.firstExport ? Math.round((seconds.firstExport / 60) * 10) / 10 : null, sync, passed: failures.length === 0 };
writeFileSync(path.join(out, "result.json"), JSON.stringify(result, null, 1));
console.log(`FRESH_INSTALL_RESULT ${JSON.stringify(result)}`);
if (failures.length) {
  console.error(`FRESH_INSTALL_FAILED:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("fresh install to export: passed");
