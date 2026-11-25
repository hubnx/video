/**
 * Checks that an installed copy updates itself (electron/updates.ts) the whole way, on this Mac, before release 1 and
 * whenever the updater changes: a copy that can't update can never be reached again. It packages an older and a newer
 * Intel copy, both signed with HubNX's Developer ID (Squirrel, the Mac's updater, checks the newer's signature against
 * the older's; Apple's notary isn't part of that, so it's skipped here and checked on the release's own packages by
 * fresh-install.yml); installs the older from its disk image; opens it through macOS, behind, as a person opens it,
 * reading updates from a server here that serves the newer as the website does; waits for the strip saying the newer is
 * ready; presses Restart now; and checks that the newer copy opens in its place, still this user's and validly signed.
 * Lifted from Songbrew's scripts/check-update.ts. Into video/local/update-check (packages replaced each run; each run's
 * result kept in logs/).
 *
 *   pnpm build && pnpm exec node scripts/check-update.ts
 */
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { appendFile, mkdir, readdir, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { homedir } from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium, type Page } from "playwright-core";
import { APP_ID, APP_NAME } from "../src/shared/app-api.ts";
import { packageApp } from "./package.ts";
import { RELEASE_FILES } from "./release-files.ts";
import { appFolder, electronEnvironment, watchFrontmost } from "./start.ts";

const stillBehind = watchFrontmost();
const OLDER = "0.0.1"; // below every real version, so neither copy can pass for a release
const NEWER = "0.0.2";
// In video's block of ports (hubnx-apps docs/registry.md): the feed's server, and the window's DevTools.
const PORT = 4167;
const WINDOW_PORT = 4166;
const folder = path.resolve(appFolder, "..", "local", "update-check");
const installed = path.join(folder, "installed", `${APP_NAME}.app`);
const program = path.join(installed, "Contents", "MacOS", APP_NAME);
const appOutput = path.join(folder, "app-output.txt");
const log = path.join(folder, "logs", `${new Date().toISOString().replace(/[:.]/g, "-")}.log`);
// What the updater and Squirrel keep in this Mac's own caches: cleared before and after, so each run starts fresh and
// leaves nothing behind.
const CACHES = [path.join(homedir(), "Library", "Caches", "hubnx-video-updater"), path.join(homedir(), "Library", "Caches", `${APP_ID}.ShipIt`)];

async function report(line: string): Promise<void> {
  console.log(line);
  await appendFile(log, `${line}\n`);
}

async function waitFor(what: string, seconds: number, done: () => boolean): Promise<void> {
  for (const started = Date.now(); !done(); await sleep(1000)) {
    if (Date.now() - started > seconds * 1000) throw new Error(`UPDATE_CHECK_TIMED_OUT: ${what}, after ${seconds} s`);
  }
}

/** While Squirrel swaps the bundle, its Info.plist is briefly missing: no version yet. */
function installedVersion(): string {
  try {
    return execFileSync("plutil", ["-extract", "CFBundleShortVersionString", "raw", path.join(installed, "Contents", "Info.plist")], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

/** The installed copy's running main process, if any (pgrep finds none: exit 1). */
function openCopy(): number | null {
  try {
    return Number(execFileSync("pgrep", ["-f", program], { encoding: "utf8" }).split("\n")[0]);
  } catch {
    return null;
  }
}

/** The older copy's window, through its DevTools port, once it listens. */
async function appWindow(): Promise<Page> {
  let lastError: unknown = null;
  for (const started = Date.now(); Date.now() - started < 60_000; await sleep(1000)) {
    try {
      const page = (await chromium.connectOverCDP(`http://127.0.0.1:${WINDOW_PORT}`)).contexts()[0]?.pages()[0];
      if (page) return page;
    } catch (error) {
      lastError = error; // not listening yet
    }
  }
  throw new Error(`UPDATE_CHECK_TIMED_OUT: the older copy's window, after 60 s (${String(lastError)})`);
}

for (const entry of await readdir(folder).catch(() => [])) {
  if (entry !== "logs") await rm(path.join(folder, entry), { recursive: true, force: true });
}
await mkdir(path.dirname(log), { recursive: true });
const older = await packageApp("mac-x64", { signed: true, notarize: false, version: OLDER, output: path.join(folder, "older") });
const newer = await packageApp("mac-x64", { signed: true, notarize: false, version: NEWER, output: path.join(folder, "newer") });

// Installed as a person does: the app copied out of its disk image.
const mount = path.join(folder, "disk-image");
await mkdir(path.dirname(installed), { recursive: true });
execFileSync("hdiutil", ["attach", path.join(older, RELEASE_FILES["mac-x64"](OLDER)), "-nobrowse", "-readonly", "-mountpoint", mount]);
try {
  execFileSync("ditto", [path.join(mount, `${APP_NAME}.app`), installed]);
} finally {
  execFileSync("hdiutil", ["detach", mount]);
}

// The newer copy's feed and files, served by name as the website serves the downloads.
const served: string[] = [];
const server = createServer((request, response) => {
  const file = path.join(newer, path.basename(new URL(request.url ?? "/", `http://127.0.0.1:${PORT}/`).pathname));
  const found = existsSync(file) && statSync(file).isFile();
  served.push(`${request.method} ${path.basename(file)} ${found ? 200 : 404}`);
  if (!found) return void response.writeHead(404).end();
  response.writeHead(200, { "Content-Length": statSync(file).size });
  if (request.method === "HEAD") return void response.end();
  createReadStream(file).pipe(response);
});
await new Promise<void>((resolve) => server.listen(PORT, "127.0.0.1", resolve));

for (const cache of CACHES) await rm(cache, { recursive: true, force: true });
const started = Date.now();
const seconds = () => Math.round((Date.now() - started) / 1000);
try {
  // Opened by macOS, in the background, as a person opens it: started by this script instead, the app counted as part
  // of the terminal, which macOS doesn't let change apps, so Squirrel asked for an administrator's password (Songbrew's
  // first run, 2026-11-04). `open` passes this script's environment on: behind, the check's own data folder, and the
  // server here for updates; the newer copy, opened by the older the same way, gets them too.
  execFileSync("open", ["-n", "-g", "-j", "--stdout", appOutput, "--stderr", appOutput, installed, "--args", `--remote-debugging-port=${WINDOW_PORT}`],
    { env: electronEnvironment({ VIDEO_UPDATE_FEED: `http://127.0.0.1:${PORT}/`, VIDEO_CHECK_DATA: path.join(folder, "data") }) });
  await waitFor("the older copy open", 60, () => openCopy() !== null);
  const olderCopy = openCopy();
  const page = await appWindow();
  const notice = page.locator(".notice");
  const restart = notice.getByRole("button", { name: "Restart now" });
  await restart.or(notice.getByRole("button", { name: "Download it" })).waitFor({ timeout: 5 * 60_000 });
  const said = (await notice.innerText()).replace(/\s+/g, " ");
  if (!(await restart.isVisible()) || !said.includes(NEWER)) throw new Error(`UPDATE_NOTICE_WRONG: "${said}"`);
  await report(`the notice, after ${seconds()} s: ${said}`);
  await page.screenshot({ path: path.join(folder, "notice.png") });
  // The app quits as the click lands, which can close the page under it.
  await restart.click().catch((error: unknown) => {
    if (!/closed/i.test(String(error))) throw error;
  });
  await waitFor("the older copy to quit", 60, () => openCopy() !== olderCopy);
  // Squirrel puts the newer copy in place once the app has quit; the older's script then opens it.
  await waitFor(`version ${NEWER} in place`, 180, () => installedVersion() === NEWER);
  await waitFor("the newer copy open", 60, () => ![null, olderCopy].includes(openCopy()));
  if (statSync(installed).uid !== process.getuid?.()) throw new Error("UPDATE_INSTALLED_AS_ROOT: Squirrel needed an administrator's password");
  execFileSync("codesign", ["--verify", "--deep", "--strict", installed]);
  await report(`updated ${OLDER} → ${NEWER} in ${seconds()} s: the newer copy is open, still this user's, and validly signed`);
} catch (error) {
  const output = existsSync(appOutput) ? readFileSync(appOutput, "utf8").trim() : "";
  await report(`FAILED: ${String(error)}\n--- the app's output:\n${output.slice(-3000) || "(none)"}`);
  throw error;
} finally {
  await report(`served: ${served.join(", ") || "nothing"}`);
  try {
    execFileSync("pkill", ["-f", program]);
  } catch {
    // none open
  }
  server.close();
  await waitFor("the app to close", 30, () => openCopy() === null).catch((error: unknown) => report(String(error)));
  for (const cache of CACHES) await rm(cache, { recursive: true, force: true });
}

const moved = stillBehind();
if (moved) throw new Error(moved);
