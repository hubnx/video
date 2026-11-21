/**
 * The app's main process: one window, and the programs behind it.
 */
import { app, BrowserWindow, ipcMain, nativeTheme, shell } from "electron";
import path from "node:path";
import { APP_NAME, CHANNELS, WEBSITE_PAGES, type WebsitePage } from "../src/shared/app-api.ts";
import { logError, startAppLog } from "./app-log.ts";
import { findFfmpeg } from "./ffmpeg.ts";
import { setMenu } from "./menu.ts";
import { resolvePaths } from "./paths.ts";
import { readSettings, writeSettings, type Settings } from "./settings.ts";

const paths = resolvePaths();
// The main process's errors, which a packaged copy shows nowhere else (a problem report may carry the end).
startAppLog(paths.logs);

// Set by the checks, never by a person's copy (scripts/start.ts): the app runs behind whatever the owner is doing, with
// no focus, Dock icon, app switch or sound (~/.claude/CLAUDE.md › Tests never take my screen).
const BEHIND = process.env.VIDEO_BEHIND === "1";

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

  ipcMain.handle(CHANNELS.appVersion, () => app.getVersion());
  ipcMain.handle(CHANNELS.ffmpeg, () => findFfmpeg(paths.ffmpeg));
  ipcMain.handle(CHANNELS.openWebsite, (_event, page: WebsitePage) => {
    if (!Object.hasOwn(WEBSITE_PAGES, page)) throw new Error(`not one of the app's pages: ${String(page)}`);
    return shell.openExternal(WEBSITE_PAGES[page]);
  });

  const window = new BrowserWindow({
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
  window.once("ready-to-show", () => {
    if (!BEHIND) {
      window.show();
      return;
    }
    // Shown so it paints for the checks' pictures, but unseen, click-through and silent, never given focus.
    window.setOpacity(0);
    window.setIgnoreMouseEvents(true);
    window.webContents.setAudioMuted(true);
    window.showInactive();
  });
  // The window is the app, never a browser: it opens no other page, and links go to the browser through openWebsite.
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event) => event.preventDefault());
  await window.loadFile(path.join(app.getAppPath(), "dist", "renderer", "index.html"));

  app.on("second-instance", () => {
    if (window.isMinimized()) window.restore();
    window.focus();
  });
  app.on("window-all-closed", () => app.quit());
}
