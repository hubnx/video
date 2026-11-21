/**
 * The app's main process: one window, and the programs behind it.
 */
import { app, BrowserWindow, dialog, ipcMain, nativeTheme, protocol, shell } from "electron";
import path from "node:path";
import { APP_NAME, CHANNELS, WEBSITE_PAGES, type OpenResult, type WebsitePage } from "../src/shared/app-api.ts";
import type { Clip, ClipFacts, JobKind } from "../src/shared/media.ts";
import { errorName, logError, startAppLog } from "./app-log.ts";
import { Clips } from "./clips.ts";
import { findFfmpeg } from "./ffmpeg.ts";
import { editCopyArguments, jobsFor, proxyArguments, speechArguments } from "./ffmpeg-jobs.ts";
import { JobRunner, writingPath } from "./jobs.ts";
import { mediaResponse } from "./media-response.ts";
import { setMenu } from "./menu.ts";
import { resolvePaths } from "./paths.ts";
import { probeClip } from "./probe.ts";
import { readSettings, writeSettings, type Settings } from "./settings.ts";

const paths = resolvePaths();
// The main process's errors, which a packaged copy shows nowhere else (a problem report may carry the end).
startAppLog(paths.logs);

// Set by the checks, never by a person's copy (scripts/start.ts): the app runs behind whatever the owner is doing, with
// no focus, Dock icon, app switch or sound (~/.claude/CLAUDE.md › Tests never take my screen).
const BEHIND = process.env.VIDEO_BEHIND === "1";

// Electron asks for custom schemes before the app is ready; media:// serves a clip's files to the window, in byte ranges.
// corsEnabled: the window is a file:// page, so its fetches are cross-origin, which Chromium refuses for a scheme
// without it (Songbrew's song://, 2026-11-02).
protocol.registerSchemesAsPrivileged([
  { scheme: "media", privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true, corsEnabled: true } },
]);

// One copy at a time: a second launch brings the first window forward instead.
if (!app.requestSingleInstanceLock()) app.quit();
else void start();

async function start(): Promise<void> {
  await app.whenReady();
  if (BEHIND && process.platform === "darwin") {
    app.setActivationPolicy("accessory"); // no Dock icon, never the app in front
    app.dock?.hide();
  }
  const settings = await readSettings(paths.settings);
  // Each change saved onto what's saved already, and each write after the last, so two never overlap.
  let saved: Promise<void> = Promise.resolve();
  const saveSettings = (change: Partial<Settings>): Promise<void> => {
    Object.assign(settings, change);
    saved = saved.catch(() => undefined).then(() => writeSettings(paths.settings, settings));
    return saved;
  };
  // Kept on the computer only, from the first open: the day-7 check-in, if the person says yes after their first
  // export, counts from it (docs/plan.md › Keep or stop › The check-in).
  if (!settings.firstOpenedAt) await saveSettings({ firstOpenedAt: new Date().toISOString() }).catch((error: unknown) => logError("settings_unsaved", error));
  setMenu();

  let window: BrowserWindow | null = null;
  const clips = new Clips(paths.clips);
  const facts = new Map<string, ClipFacts>();
  const jobs = new JobRunner(paths.ffmpeg, paths.logs, (progress) => window?.webContents.send(CHANNELS.jobProgress, progress));

  protocol.handle("media", async (request) => {
    // media://clip/<id>/<original|proxy|editCopy>: only the files of clips opened in this run.
    const [, id = "", file = ""] = new URL(request.url).pathname.split("/");
    const served = clips.served(id, file);
    if (!served) return new Response(null, { status: 404 });
    try {
      return await mediaResponse(served, request.headers.get("range"));
    } catch {
      return new Response(null, { status: 404 }); // a made file not made yet, or the original moved
    }
  });

  const open = async (file: string): Promise<OpenResult> => {
    try {
      const id = await clips.add(file);
      const found = await probeClip(paths.ffprobe, file);
      if (!found.video && !found.audio) return { refused: "not_a_video" };
      facts.set(id, found);
      const clip: Clip = { id, name: path.basename(file), facts: found };
      return { clip };
    } catch (error) {
      // The file system refuses what can't be read, with a code such as EACCES; ffprobe refuses what isn't a media
      // file, exiting with a number.
      logError("clip_unopened", errorName(error));
      return { refused: typeof (error as { code?: unknown }).code === "string" ? "unreadable" : "not_a_video" };
    }
  };

  ipcMain.handle(CHANNELS.openVideo, (_event, file: unknown) => {
    if (typeof file !== "string" || !path.isAbsolute(file)) throw new Error("not a file's path");
    return open(file);
  });
  ipcMain.handle(CHANNELS.chooseVideo, async () => {
    const choice = await dialog.showOpenDialog({ properties: ["openFile"], filters: [{ name: "Videos", extensions: ["mp4", "mov", "m4v", "mkv", "webm", "avi", "mts", "m2ts", "3gp"] }] });
    const file = choice.filePaths[0];
    return choice.canceled || !file ? null : open(file);
  });
  ipcMain.handle(CHANNELS.planClip, (_event, id: unknown, decodes: unknown) => {
    const found = typeof id === "string" ? facts.get(id) : undefined;
    if (!found || typeof id !== "string" || typeof decodes !== "boolean") throw new Error("not a clip opened in this run");
    const original = clips.original(id);
    const argumentsOf: Record<JobKind, (output: string) => string[]> = {
      speech: (output) => speechArguments(original, output),
      proxy: (output) => proxyArguments(original, output, found),
      editCopy: (output) => editCopyArguments(original, output, found),
    };
    for (const kind of jobsFor(found, decodes)) {
      const output = clips.made(id, kind);
      jobs.add({ clipId: id, kind, arguments: argumentsOf[kind](writingPath(output)), writing: writingPath(output), output, durationSeconds: found.durationSeconds });
    }
  });
  ipcMain.handle(CHANNELS.cancelClip, (_event, id: unknown) => {
    if (typeof id === "string") jobs.cancel(id);
  });

  ipcMain.handle(CHANNELS.appVersion, () => app.getVersion());
  ipcMain.handle(CHANNELS.ffmpeg, () => findFfmpeg(paths.ffmpeg));
  ipcMain.handle(CHANNELS.openWebsite, (_event, page: WebsitePage) => {
    if (!Object.hasOwn(WEBSITE_PAGES, page)) throw new Error(`not one of the app's pages: ${String(page)}`);
    return shell.openExternal(WEBSITE_PAGES[page]);
  });

  window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 400,
    minHeight: 560,
    title: APP_NAME,
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#17171b" : "#ffffff",
    webPreferences: {
      preload: path.join(app.getAppPath(), "dist", "electron", "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  const shown = window;
  shown.once("ready-to-show", () => {
    if (!BEHIND) {
      shown.show();
      return;
    }
    // Shown so it paints for the checks' pictures, but unseen, click-through and silent, never given focus.
    shown.setOpacity(0);
    shown.setIgnoreMouseEvents(true);
    shown.webContents.setAudioMuted(true);
    shown.showInactive();
  });
  // The window is the app, never a browser: it opens no other page, and links go to the browser through openWebsite.
  // A video dropped outside the drop area would otherwise open as a page.
  shown.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  shown.webContents.on("will-navigate", (event) => event.preventDefault());
  shown.on("closed", () => {
    window = null;
  });
  await shown.loadFile(path.join(app.getAppPath(), "dist", "renderer", "index.html"));

  app.on("second-instance", () => {
    if (shown.isMinimized()) shown.restore();
    shown.focus();
  });
  app.on("window-all-closed", () => app.quit());
  // However the app quits (Cmd+Q skips window-all-closed), FFmpeg's running job goes with it.
  app.on("will-quit", () => jobs.stopAll());
}
