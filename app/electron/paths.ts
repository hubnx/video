/**
 * Where everything lives. Packaged: the person's own data folder, and the programs inside the app. Run from the
 * repo: video/local, which git ignores, so a dev run never touches a person's folders.
 */
import { app } from "electron";
import { homedir } from "node:os";
import path from "node:path";
import { APP_NAME, DATA_FOLDER_NAME } from "../src/shared/app-api.ts";
import { programName, targetOf } from "./targets.ts";

export interface Paths {
  data: string; // settings, logs, edit copies, the models
  settings: string;
  logs: string;
  clips: string; // what the app makes from each clip (clips.ts)
  models: string; // the AI models, downloaded on first use (models.ts)
  ffmpeg: string; // the FFmpeg the app carries (scripts/fetch-ffmpeg.ts)
  ffprobe: string;
}

/** Call before the app is ready: it also moves Electron's own files beside the app's. */
export function resolvePaths(): Paths {
  app.setName(APP_NAME);
  if (app.isPackaged) {
    // The fresh-install check's own folder (scripts/check-fresh-install.ts), so a check on this Mac never reads or writes
    // the owner's. Never set in a person's copy.
    const checkFolder = process.env.VIDEO_CHECK_DATA;
    if (checkFolder) {
      app.setPath("userData", checkFolder);
      return withData(checkFolder, path.join(process.resourcesPath, "bin"));
    }
    app.setPath("userData", path.join(app.getPath("appData"), DATA_FOLDER_NAME));
    // Linux's big files go where freedesktop.org says data goes (~/.local/share), not ~/.config, which people back
    // up and sync: the models and edit copies run to gigabytes.
    const data = process.platform === "linux"
      ? path.join(process.env.XDG_DATA_HOME || path.join(homedir(), ".local", "share"), DATA_FOLDER_NAME)
      : app.getPath("userData");
    return withData(data, path.join(process.resourcesPath, "bin"));
  }
  const video = path.resolve(app.getAppPath(), "..");
  const local = path.join(video, "local");
  const data = path.join(local, "app-data");
  app.setPath("userData", data);
  // The models stay outside the data folder the checks clear, so each check doesn't download 0.7 GB again.
  return { ...withData(data, path.join(local, "ffmpeg-for-app", targetOf(process.platform, process.arch))), models: path.join(local, "models") };
}

function withData(data: string, programs: string): Paths {
  return {
    data,
    settings: path.join(data, "settings.json"),
    logs: path.join(data, "logs"),
    clips: path.join(data, "clips"),
    models: path.join(data, "models"),
    ffmpeg: path.join(programs, programName(process.platform, "ffmpeg")),
    ffprobe: path.join(programs, programName(process.platform, "ffprobe")),
  };
}
