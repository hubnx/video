/**
 * Opens a packaged app, behind whatever is in front, and checks it works from what it carries: the window shows its
 * start screen, and the FFmpeg inside the package runs and has the encoders the app relies on (x264, and the system's
 * own AAC encoder on a Mac or Windows). A screenshot lands in video/local/screens/package-<target>.png.
 *
 *   pnpm check-package mac-x64                       the build in video/local/release
 *   pnpm check-package --program <the app's program> an installed or unpacked copy (GitHub's Windows and Linux)
 *
 * Day 1's proof (docs/plan.md › Build order): the package opens on all three systems without taking the screen,
 * and FFmpeg runs inside it. On a Mac the screen watch samples the app in front all through, and the check fails if
 * macOS never listed our app as running: a watch that found nothing measured nothing (start.ts › oursRunning).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { _electron as electron } from "playwright-core";
import { APP_NAME, type FfmpegFound } from "../src/shared/app-api.ts";
import { TARGETS, type Target } from "../electron/targets.ts";
import { INSTALLED_NAME } from "./release-files.ts";
import { appFolder, electronEnvironment, OUR_APPS, oursRunning, watchFrontmost } from "./start.ts";

const stillBehind = watchFrontmost();
const { values, positionals } = parseArgs({ allowPositionals: true, options: { program: { type: "string" } } });
const target = (positionals[0] ?? "mac-x64") as Target;
if (!values.program && !TARGETS.includes(target)) throw new Error(`pnpm check-package ${TARGETS.join(" | ")} | --program <path>`);
const video = path.resolve(appFolder, "..");
const release = path.join(video, "local", "release", target);
const program = values.program ?? (target.startsWith("mac")
  ? path.join(release, target === "mac-arm64" ? "mac-arm64" : "mac", `${APP_NAME}.app`, "Contents", "MacOS", APP_NAME)
  : target.startsWith("win") ? path.join(release, "win-unpacked", `${INSTALLED_NAME}.exe`) : path.join(release, "linux-unpacked", INSTALLED_NAME));
const name = values.program ? `installed-${process.platform}` : target;

// A Mac copy's id must be one the screen watch knows, or a check that took the screen would pass blind.
if (program.includes(".app/Contents/MacOS/")) {
  const identifier = execFileSync("plutil", ["-extract", "CFBundleIdentifier", "raw", path.join(program, "..", "..", "Info.plist")], { encoding: "utf8" }).trim();
  if (!OUR_APPS.includes(identifier)) throw new Error(`UNWATCHED_COPY: ${identifier} isn't one of ${OUR_APPS.join(", ")} (start.ts)`);
}
// Chromium refuses to run as root with its sandbox on, as some CI machines run everything.
const launchArguments = process.platform === "linux" && process.getuid?.() === 0 ? ["--no-sandbox"] : [];

const app = await electron.launch({ executablePath: program, args: launchArguments, env: electronEnvironment() as Record<string, string>, timeout: 120_000 });
let failure: string | null = null;
try {
  const page = await app.firstWindow();
  await page.getByRole("heading", { name: "Drop a video here" }).waitFor({ timeout: 60_000 });
  const ffmpeg = await page.evaluate(() => window.video.ffmpeg()) as FfmpegFound | null;
  if (!ffmpeg) throw new Error("FFMPEG_NOT_RUNNING: the app's FFmpeg didn't run (its app.log says why)");
  console.log(`FFmpeg inside the package: ${ffmpeg.version}`);
  console.log(`encoders: ${JSON.stringify(ffmpeg.encoders)}`);
  const missing = [
    !ffmpeg.encoders.libx264 && "libx264",
    process.platform === "darwin" && !ffmpeg.encoders.aac_at && "aac_at (AudioToolbox)",
    process.platform === "win32" && !ffmpeg.encoders.aac_mf && "aac_mf (Media Foundation)",
  ].filter(Boolean);
  if (missing.length) throw new Error(`FFMPEG_ENCODER_MISSING: ${missing.join(", ")}`);
  if (!oursRunning()) throw new Error("WATCHED_NOTHING: macOS never listed our app as running, so the screen watch saw nothing");
  const screens = path.join(video, "local", "screens");
  mkdirSync(screens, { recursive: true });
  await page.screenshot({ path: path.join(screens, `package-${name}.png`) });
  console.log(`opened from ${program}`);
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
} finally {
  await app.close();
}
const taken = stillBehind();
if (taken) failure = `SCREEN_TAKEN: ${taken}${failure ? `; also ${failure}` : ""}`;
if (failure) {
  console.error(`PACKAGE_CHECK_FAILED: ${failure}`);
  process.exit(1);
}
console.log("the package opened behind, and FFmpeg ran inside it");
