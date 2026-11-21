/**
 * Hands the window exactly the VideoApi (src/shared/app-api.ts) and nothing else of Electron or Node.
 * Built as CommonJS: a sandboxed preload can't be a module.
 */
import { contextBridge, ipcRenderer } from "electron";
import { CHANNELS, type VideoApi } from "../src/shared/app-api.ts";

const api: VideoApi = {
  appVersion: () => ipcRenderer.invoke(CHANNELS.appVersion),
  ffmpeg: () => ipcRenderer.invoke(CHANNELS.ffmpeg),
  openWebsite: (page) => ipcRenderer.invoke(CHANNELS.openWebsite, page),
};

contextBridge.exposeInMainWorld("video", api);
