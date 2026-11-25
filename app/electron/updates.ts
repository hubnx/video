/**
 * The app updates itself from its website (scripts/release-files.ts › RELEASE_URL): it checks when it opens and every
 * six hours, downloads a newer version in the background, and installs it when the app quits, or at once when the
 * person restarts from the notice. The person can also check when they like (Settings; on a Mac, the app menu). Only
 * a packaged copy from the website updates. On a Mac only a copy that can replace itself does: for one still in its
 * disk image, moved aside by macOS or in a folder the person can't write to, Squirrel (the Mac's updater) would ask
 * for an administrator's password at every check, so such a copy is told of the new version and where to get it. On
 * Linux an AppImage replaces its own file; a .deb's copy is the package manager's, so it's told instead. A Microsoft
 * Store copy is the Store's to update. Lifted from Songbrew's electron/updates.ts (its fixes kept, with their dates).
 * The one module that knows electron-updater.
 */
import { spawn } from "node:child_process";
import { accessSync, constants } from "node:fs";
import path from "node:path";
import { app, autoUpdater as squirrel } from "electron";
import electronUpdater, { type UpdateInfo } from "electron-updater";
import type { Update, UpdateCheck } from "../src/shared/app-api.ts";
import { logError } from "./app-log.ts";

const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;

/** Whether this copy updates itself: a packaged copy from the website, never the Store's or one run from the repo. */
export function updatesItself(): boolean {
  return app.isPackaged && !process.windowsStore && !process.mas;
}

export interface Updates {
  /** The newer version found, or null. */
  found(): Update | null;
  /** A check the person asked for: the version already found, without asking the website again (on a Mac,
   * electron-updater would hand Squirrel the same update twice), else what the website says now. */
  check(): Promise<UpdateCheck>;
}

/** `feed`: the update check's stand-in feed (scripts/check-update.ts), never set in a person's copy, which reads the
 * website's (the package's app-update.yml). */
export function startUpdates(onUpdate: (update: Update | null) => void, feed?: string): Updates {
  if (!updatesItself()) return { found: () => null, check: () => Promise.resolve({ found: "not_updating" }) };
  const { autoUpdater } = electronUpdater;
  if (feed) autoUpdater.setFeedURL({ provider: "generic", url: feed });
  // Without this, each check carries an id of this copy, electron-updater's own (for staged releases): the app sends
  // no id of anyone's copy, ever (docs/plan.md › The promise › Private).
  autoUpdater.requestHeaders = { "x-user-staging-id": "none" };
  const installable = canReplaceItself();
  autoUpdater.autoDownload = installable;
  autoUpdater.autoInstallOnAppQuit = installable;
  let found: Update | null = null;
  const announce = (update: Update | null) => {
    found = update;
    onUpdate(update);
  };
  const news = (info: UpdateInfo, state: Update["state"]): Update => ({ state, version: info.version });
  autoUpdater.on("error", (error) => {
    logError("update_failed", error);
    if (found?.state === "downloading") announce(null); // the next check tries again
  });
  if (!installable) {
    logError("update_out_of_reach");
    autoUpdater.on("update-available", (info) => announce(news(info, "out_of_reach")));
  } else {
    autoUpdater.on("update-available", (info) => announce(news(info, "downloading")));
    if (process.platform === "darwin") {
      // electron-updater has the update before Squirrel takes it in, and Restart to update installs only after.
      let downloaded: UpdateInfo | null = null;
      autoUpdater.on("update-downloaded", (info) => {
        downloaded = info;
      });
      squirrel.on("update-downloaded", () => {
        if (downloaded) announce(news(downloaded, "ready"));
      });
    } else {
      autoUpdater.on("update-downloaded", (info) => announce(news(info, "ready")));
    }
  }
  // One check at a time, however many ask: the person's while the timer's runs gets the same answer. A failed check
  // (offline, the site down) is tried again at the next one; the app works as it is.
  let checking: Promise<UpdateCheck> | null = null;
  const check = (): Promise<UpdateCheck> => {
    checking ??= autoUpdater.checkForUpdates().then((result): UpdateCheck => {
      // None when electron-updater won't update this copy, as an AppImage unpacked and run from its folder.
      if (!result) {
        logError("update_checker_inactive");
        return { found: "not_updating" };
      }
      // The download's failure is the error event's, logged above; unawaited, it would also be an unhandled rejection.
      result.downloadPromise?.catch(() => undefined);
      return found ? { found: "update", update: found } : { found: "newest" };
    }, (error: unknown): UpdateCheck => {
      logError("update_check_failed", error);
      return { found: "unreachable" };
    }).finally(() => {
      checking = null;
    });
    return checking;
  };
  void check();
  // Not once a version is ready: electron-updater announces it again at each check, which would take the notice back
  // to "downloading", and on a Mac hand Squirrel the same update again (Songbrew's review, 2026-11-13). It installs at
  // quit.
  setInterval(() => {
    if (found?.state !== "ready") void check();
  }, CHECK_EVERY_MS);
  return {
    found: () => found,
    check: () => (found ? Promise.resolve({ found: "update", update: found }) : check()),
  };
}

/** Whether a new version can take this copy's place without an administrator's password, which Squirrel (the Mac) and
 * electron-updater's .deb installer (Linux) would otherwise ask for at every update. */
export function canReplaceItself(): boolean {
  if (process.platform === "linux") {
    // An AppImage (its runtime names it in APPIMAGE, and the folder it's mounted at in APPDIR) is replaced where it is;
    // a .deb's copy, in /opt, only by root. This program must run from inside APPDIR: a copy started from a terminal
    // inside another AppImage inherits that one's variables (Songbrew's review, 2026-11-11).
    const image = process.env.APPIMAGE;
    const mounted = process.env.APPDIR;
    if (!image || !mounted || !process.execPath.startsWith(mounted + path.sep)) return false;
    return writable(path.dirname(image));
  }
  if (process.platform !== "darwin") return true; // Windows installs it for the person, in their own folder
  const bundle = path.resolve(app.getPath("exe"), "..", "..", "..");
  return writable(bundle) && writable(path.dirname(bundle));
}

function writable(folder: string): boolean {
  try {
    accessSync(folder, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/** Quits and installs the downloaded version, then opens it. On a Mac the newer copy is opened through macOS rather
 * than by Squirrel's own relaunch, which always brings it to the front and drops how this copy was started: a copy
 * updated from behind reopens behind, its environment kept (open passes it on), and one in front reopens in front
 * (hubnx Agent's fix, 2026-11-20). Squirrel installs it as this copy quits (autoInstallOnAppQuit, startUpdates). */
export function installUpdate(version: string, front: boolean): void {
  if (process.platform === "darwin") {
    const bundle = path.resolve(app.getPath("exe"), "..", "..", "..");
    const quoted = (text: string) => `'${text.replaceAll("'", "'\\''")}'`;
    // Opened once the newer version is in place, two minutes at most; run apart from this copy, which quits now.
    const script = [
      `i=0; while [ "$(/usr/bin/plutil -extract CFBundleShortVersionString raw ${quoted(path.join(bundle, "Contents", "Info.plist"))} 2>/dev/null)" != ${quoted(version)} ] && [ $i -lt 240 ]; do sleep 0.5; i=$((i+1)); done`,
      `/usr/bin/open ${front ? "" : "-g -j "}${quoted(bundle)}`,
    ].join("\n");
    try {
      spawn("/bin/sh", ["-c", script], { detached: true, stdio: "ignore" }).unref();
    } catch (error) {
      logError("update_reopen_not_scheduled", error); // it installs at quit all the same; the person opens it again
    }
    app.quit();
    return;
  }
  // electron-updater opens the newer AppImage before this copy has quit: still holding the single-instance lock, this
  // copy could take it for a second launch and the newer would quit (main.ts), leaving none open.
  if (process.platform === "linux") app.releaseSingleInstanceLock();
  electronUpdater.autoUpdater.quitAndInstall();
}
