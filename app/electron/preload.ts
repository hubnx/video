/**
 * Hands the window exactly the VideoApi (src/shared/app-api.ts) and nothing else of Electron or Node.
 * Built as CommonJS: a sandboxed preload can't be a module.
 */
import { contextBridge, ipcRenderer, webUtils, type IpcRendererEvent } from "electron";
import { CHANNELS, type VideoApi } from "../src/shared/app-api.ts";

function subscribe<Value>(channel: string, listener: (value: Value) => void): () => void {
  const handler = (_event: IpcRendererEvent, value: Value) => listener(value);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.off(channel, handler);
}

const api: VideoApi = {
  appVersion: () => ipcRenderer.invoke(CHANNELS.appVersion),
  ffmpeg: () => ipcRenderer.invoke(CHANNELS.ffmpeg),
  openWebsite: (page) => ipcRenderer.invoke(CHANNELS.openWebsite, page),
  pathOfDropped: (file) => webUtils.getPathForFile(file),
  openVideo: (path) => ipcRenderer.invoke(CHANNELS.openVideo, path),
  chooseVideo: () => ipcRenderer.invoke(CHANNELS.chooseVideo),
  planClip: (clipId, decodes) => ipcRenderer.invoke(CHANNELS.planClip, clipId, decodes),
  cancelClip: (clipId) => ipcRenderer.invoke(CHANNELS.cancelClip, clipId),
  onJobProgress: (listener) => subscribe(CHANNELS.jobProgress, listener),
  onTranscriptProgress: (listener) => subscribe(CHANNELS.transcriptProgress, listener),
  saveEdit: (clipId, edit, choices) => void ipcRenderer.invoke(CHANNELS.saveEdit, clipId, edit, choices),
  cleanVoice: (clipId) => ipcRenderer.invoke(CHANNELS.cleanVoice, clipId),
  onVoiceProgress: (listener) => subscribe(CHANNELS.voiceProgress, listener),
  logProblem: (event, error) => {
    const described = error instanceof Error ? `${error.name}: ${error.message.split("\n")[0]}` : String(error);
    void ipcRenderer.invoke(CHANNELS.logProblem, event, described.slice(0, 300));
  },
};

contextBridge.exposeInMainWorld("video", api);
