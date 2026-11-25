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
  voiceEstimate: (clipId) => ipcRenderer.invoke(CHANNELS.voiceEstimate, clipId),
  exportDestination: (clipId) => ipcRenderer.invoke(CHANNELS.exportDestination, clipId),
  changeExportDestination: (clipId, current) => ipcRenderer.invoke(CHANNELS.changeExportDestination, clipId, current),
  beginExport: (destination) => ipcRenderer.invoke(CHANNELS.beginExport, destination),
  writeExport: (exportId, position, data) => ipcRenderer.invoke(CHANNELS.writeExport, exportId, position, data),
  finishExport: (exportId, clipId, sound, durationSeconds, captions) => ipcRenderer.invoke(CHANNELS.finishExport, exportId, clipId, sound, durationSeconds, captions),
  cancelExport: (exportId) => ipcRenderer.invoke(CHANNELS.cancelExport, exportId),
  onExportProgress: (listener) => subscribe<[number, number]>(CHANNELS.exportProgress, ([exportId, fraction]) => listener(exportId, fraction)),
  showExported: (destination) => ipcRenderer.invoke(CHANNELS.showExported, destination),
  logProblem: (event, detail) => void ipcRenderer.invoke(CHANNELS.logProblem, event, detail),
  about: () => ipcRenderer.invoke(CHANNELS.about),
  onMenuCommand: (listener) => subscribe(CHANNELS.menuCommand, listener),
  onUpdate: (listener) => subscribe(CHANNELS.updateFound, listener),
  checkForUpdates: () => ipcRenderer.invoke(CHANNELS.checkForUpdates),
  installUpdate: () => ipcRenderer.invoke(CHANNELS.installUpdate),
  openReleaseNotes: () => ipcRenderer.invoke(CHANNELS.openReleaseNotes),
  feedbackPreview: (draft) => ipcRenderer.invoke(CHANNELS.feedbackPreview, draft),
  sendFeedback: (draft) => ipcRenderer.invoke(CHANNELS.sendFeedback, draft),
  licenses: () => ipcRenderer.invoke(CHANNELS.licenses),
  openLicenseSource: (url) => ipcRenderer.invoke(CHANNELS.openLicenseSource, url),
  openChromiumNotices: () => ipcRenderer.invoke(CHANNELS.openChromiumNotices),
  checkIn: () => ipcRenderer.invoke(CHANNELS.checkIn),
  answerCheckIn: (answer) => ipcRenderer.invoke(CHANNELS.answerCheckIn, answer),
};

contextBridge.exposeInMainWorld("video", api);
