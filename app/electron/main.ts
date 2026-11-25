/**
 * The app's main process: one window, and the programs behind it.
 */
import { app, BrowserWindow, dialog, ipcMain, nativeTheme, protocol, shell } from "electron";
import { accessSync, constants, existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { APP_NAME, CHANNELS, draftRefusal, releaseNotesUrl, WEBSITE_PAGES, type AboutFacts, type ExportDestination, type ExportSound, type FeedbackDraft, type MenuCommand, type OpenResult, type WebsitePage } from "../src/shared/app-api.ts";
import type { Clip, ClipFacts, JobKind, VoiceProgress } from "../src/shared/media.ts";
import { PROJECT_FORMAT, PROJECT_VERSION } from "../src/shared/project.ts";
import type { Stretch } from "../src/shared/cuts.ts";
import { loudness } from "../src/shared/quiet.ts";
import { expectedSecondsPerMinute, voiceSeconds } from "../src/shared/voice-speed.ts";
import type { SoundMap, Transcript, TranscriptProgress } from "../src/shared/transcript.ts";
import { speechSamples } from "./quiet.ts";
import { errorName, logError, startAppLog } from "./app-log.ts";
import { Clips } from "./clips.ts";
import { findFfmpeg } from "./ffmpeg.ts";
import { jobArguments, jobsFor } from "./ffmpeg-jobs.ts";
import { JobRunner, writingPath } from "./jobs.ts";
import { downloadModels, DPDFNET, modelsReady, PARAKEET_V3, SILERO_VAD } from "./models.ts";
import { cleanVoice, transcribe } from "./speech/speech.ts";
import { mediaResponse } from "./media-response.ts";
import { destinationFromChoice, suggestedDestination, type Disk } from "./export-destination.ts";
import { Exports } from "./exports.ts";
import { afterCheckIn, checkInReady, checkInState, withExport } from "./check-in.ts";
import { checkInBody, feedbackUrl, logEnd, reportBody, reportDetails, sendCheckIn, sendReport, systemLine, type FeedbackSystem } from "./feedback.ts";
import { licensesShown, openChromiumNotices, openSource } from "./licenses.ts";
import { setMenu } from "./menu.ts";
import { installUpdate, startUpdates, updatesItself } from "./updates.ts";
import { resolvePaths } from "./paths.ts";
import { probeClip } from "./probe.ts";
import { Autosave, openProject } from "./project-file.ts";
import { isChoices, isEdit } from "./project-check.ts";
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

  let window: BrowserWindow | null = null;
  setMenu((command: MenuCommand) => window?.webContents.send(CHANNELS.menuCommand, command), { updates: updatesItself() });
  // A setup failure, for the day-7 check-in's count (check-in.ts): a model that wouldn't download, or the speech engine
  // or voice cleaner failing to run. Never one the person stopped.
  const countSetupFailure = () => saveSettings({ setupFailures: (settings.setupFailures ?? 0) + 1 }).catch((error: unknown) => logError("settings_unsaved", errorName(error)));
  const clips = new Clips(paths.clips);
  const facts = new Map<string, ClipFacts>();
  const workers = path.join(app.getAppPath(), "dist", "electron"); // the speech workers' programs (electron/vite.config.ts)
  const transcripts = new Map<string, AbortController>(); // the clips being transcribed, to stop them on quitting
  const sendTranscript = (progress: TranscriptProgress) => window?.webContents.send(CHANNELS.transcriptProgress, progress);
  // A clip's transcript, once its speech sound is made: the stored one if it was made before; otherwise the models
  // (downloaded on first use) hear it in the transcriber, the words sent to the window as they come, then stored.
  const transcribeClip = async (id: string) => {
    if (transcripts.has(id)) return;
    const controller = new AbortController();
    transcripts.set(id, controller);
    const stored = clips.stored(id, "transcript.json");
    try {
      // The clean-up's sound map, measured from the speech sound in one pass (a minute of it in about 20 ms).
      const soundMap = async (voice: Stretch[]): Promise<SoundMap> => ({ levels: loudness(await speechSamples(clips.made(id, "speech"))), voice });
      if (existsSync(stored)) {
        const voice = JSON.parse(await readFile(clips.stored(id, "voice.json"), "utf8")) as Stretch[];
        sendTranscript({ clipId: id, state: "done", transcript: JSON.parse(await readFile(stored, "utf8")) as Transcript, sound: await soundMap(voice) });
        return;
      }
      const models = [PARAKEET_V3, SILERO_VAD];
      if (!modelsReady(paths.models, models)) {
        await downloadModels(paths.models, models, (done, total) => sendTranscript({ clipId: id, state: "downloading", done, total }), controller.signal);
      }
      const heard = await transcribe(workers, clips.made(id, "speech"), paths.models,
        (words, fraction) => sendTranscript({ clipId: id, state: "hearing", fraction, words }), controller.signal);
      const transcript: Transcript = { language: "", words: heard.words };
      await writeFile(clips.stored(id, "voice.json"), JSON.stringify(heard.voice));
      await writeFile(stored, JSON.stringify(transcript));
      sendTranscript({ clipId: id, state: "done", transcript, sound: await soundMap(heard.voice) });
    } catch (error) {
      logError("transcript_unmade", errorName(error), error instanceof Error ? error.message.slice(0, 200) : "");
      if (!controller.signal.aborted) void countSetupFailure();
      sendTranscript({ clipId: id, state: "failed", error: error instanceof Error ? error.message.split(":")[0]! : "TRANSCRIBE_FAILED" });
    } finally {
      transcripts.delete(id);
    }
  };
  // Voice clean-up, when asked: the sound at 48 kHz (a job), the model (first use only), then the cleaner, each step's
  // progress to the window; the clean voice is stored with the clip, so it's made once.
  const voices = new Map<string, AbortController>();
  const voiceSources = new Map<string, () => void>(); // a clip waiting for its 48 kHz sound
  const sendVoice = (progress: VoiceProgress) => window?.webContents.send(CHANNELS.voiceProgress, progress);
  const cleanVoiceOf = async (id: string) => {
    const found = facts.get(id);
    if (!found || voices.has(id)) return;
    const output = clips.stored(id, "clean-voice.wav");
    if (existsSync(output)) {
      sendVoice({ clipId: id, state: "ready" });
      return;
    }
    const controller = new AbortController();
    voices.set(id, controller);
    try {
      await new Promise<void>((resolve) => {
        voiceSources.set(id, resolve);
        addJob(id, "voiceSource", found);
      });
      if (!existsSync(clips.made(id, "voiceSource"))) throw new Error("VOICE_SOURCE_UNMADE");
      if (!modelsReady(paths.models, [DPDFNET])) {
        await downloadModels(paths.models, [DPDFNET], (done, total) => sendVoice({ clipId: id, state: "downloading", fraction: done / total }), controller.signal);
      }
      const started = performance.now();
      await cleanVoice(workers, clips.made(id, "voiceSource"), output, paths.models, (fraction) => sendVoice({ clipId: id, state: "cleaning", fraction }), controller.signal);
      sendVoice({ clipId: id, state: "ready" });
      // This computer's own speed, for the next estimate; a short clip's time is mostly starting up, so it isn't kept.
      if (found.durationSeconds >= 60) {
        const perMinute = (performance.now() - started) / 1000 / (found.durationSeconds / 60);
        saveSettings({ voiceSecondsPerMinute: Math.round(perMinute * 10) / 10 }).catch((error: unknown) => logError("settings_unsaved", errorName(error)));
      }
    } catch (error) {
      logError("voice_uncleaned", errorName(error), error instanceof Error ? error.message.slice(0, 200) : "");
      if (!controller.signal.aborted) void countSetupFailure();
      sendVoice({ clipId: id, state: "failed", error: error instanceof Error ? error.message.split(":")[0]! : "VOICE_FAILED" });
    } finally {
      voices.delete(id);
    }
  };
  ipcMain.handle(CHANNELS.voiceEstimate, (_event, clipId: unknown) => {
    const found = typeof clipId === "string" ? facts.get(clipId) : undefined;
    if (!found || typeof clipId !== "string") throw new Error("not an open clip");
    if (existsSync(clips.stored(clipId, "clean-voice.wav"))) return null;
    return voiceSeconds(found.durationSeconds, expectedSecondsPerMinute(process.platform, process.arch, settings.voiceSecondsPerMinute));
  });
  const jobs: JobRunner = new JobRunner(paths.ffmpeg, paths.logs, (progress) => {
    window?.webContents.send(CHANNELS.jobProgress, progress);
    if (progress.kind === "speech" && progress.state === "done") void transcribeClip(progress.clipId);
    if (progress.kind === "voiceSource") {
      if (progress.state === "running") sendVoice({ clipId: progress.clipId, state: "preparing", fraction: progress.fraction });
      if (progress.state === "done" || progress.state === "failed" || progress.state === "cancelled") {
        voiceSources.get(progress.clipId)?.();
        voiceSources.delete(progress.clipId);
      }
    }
  });

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
      const project = await openProject(clips.stored(id, "project.hubnxvideo"));
      return { clip, saved: project ? { edit: project.edit, choices: project.choices } : null };
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
  const addJob = (id: string, kind: JobKind, found: ClipFacts) => {
    const output = clips.made(id, kind);
    jobs.add({ clipId: id, kind, arguments: jobArguments(kind, clips.original(id), writingPath(output), found), writing: writingPath(output), output, durationSeconds: found.durationSeconds });
  };
  ipcMain.handle(CHANNELS.planClip, (_event, id: unknown, decodes: unknown) => {
    const found = typeof id === "string" ? facts.get(id) : undefined;
    if (!found || typeof id !== "string" || typeof decodes !== "boolean") throw new Error("not a clip opened in this run");
    for (const kind of jobsFor(found, decodes)) addJob(id, kind, found);
  });
  // Each clip's project, saved about a second after its last change: written whole and renamed into place, so a crash
  // or a forced quit loses at most that second (project-file.ts; docs/plan.md › The promise › Never lose work).
  const autosaves = new Map<string, Autosave>();
  ipcMain.handle(CHANNELS.saveEdit, (_event, id: unknown, edit: unknown, choices: unknown) => {
    const found = typeof id === "string" ? facts.get(id) : undefined;
    if (!found || typeof id !== "string" || !isEdit(edit) || !isChoices(choices)) throw new Error("not an edit of a clip opened in this run");
    let autosave = autosaves.get(id);
    if (!autosave) {
      autosave = new Autosave(clips.stored(id, "project.hubnxvideo"));
      autosaves.set(id, autosave);
    }
    autosave.changed({ format: PROJECT_FORMAT, version: PROJECT_VERSION, clips: [{ id, path: clips.original(id), name: path.basename(clips.original(id)), facts: found }], edit, choices });
  });
  ipcMain.handle(CHANNELS.cleanVoice, (_event, id: unknown) => {
    if (typeof id !== "string" || !facts.has(id)) throw new Error("not a clip opened in this run");
    void cleanVoiceOf(id);
  });
  // Exports: a destination comes only from here (the suggestion or the save dialog), never from the window (exports.ts).
  const exports = new Exports(paths.ffmpeg);
  const destinations = new Set<string>();
  const disk: Disk = {
    exists: existsSync,
    writable: (folder) => {
      try {
        accessSync(folder, constants.W_OK);
        return true;
      } catch {
        return false;
      }
    },
  };
  const destinationOf = (file: string): ExportDestination => {
    destinations.add(file);
    return { path: file, folderName: path.basename(path.dirname(file)), fileName: path.basename(file) };
  };
  ipcMain.handle(CHANNELS.exportDestination, (_event, clipId: unknown) => {
    if (typeof clipId !== "string" || !facts.has(clipId)) throw new Error("not an open clip");
    return destinationOf(suggestedDestination(clips.original(clipId), app.getPath("videos"), disk));
  });
  ipcMain.handle(CHANNELS.changeExportDestination, async (_event, clipId: unknown, current: unknown) => {
    if (typeof clipId !== "string" || !facts.has(clipId)) throw new Error("not an open clip");
    // Attached to the window, so nothing behind it can be pressed while it's open.
    const options = { defaultPath: typeof current === "string" && destinations.has(current) ? current : app.getPath("videos"),
      filters: [{ name: "MP4 video", extensions: ["mp4"] }] };
    const choice = await (window ? dialog.showSaveDialog(window, options) : dialog.showSaveDialog(options));
    if (choice.canceled || !choice.filePath) return null;
    return destinationOf(destinationFromChoice(choice.filePath, clips.original(clipId), disk, process.platform));
  });
  ipcMain.handle(CHANNELS.beginExport, (_event, destination: unknown) => {
    if (typeof destination !== "string" || !destinations.has(destination)) throw new Error("not a destination this process gave");
    return exports.begin(destination);
  });
  ipcMain.handle(CHANNELS.writeExport, (_event, id: unknown, position: unknown, data: unknown) => {
    if (typeof id !== "number" || typeof position !== "number" || !(data instanceof Uint8Array)) throw new Error("not a piece of an export");
    return exports.write(id, position, data);
  });
  ipcMain.handle(CHANNELS.finishExport, async (event, id: unknown, clipId: unknown, sound: unknown, durationSeconds: unknown, captions: unknown) => {
    const plan = sound as ExportSound | null;
    if (typeof id !== "number" || typeof clipId !== "string" || !facts.has(clipId) || typeof durationSeconds !== "number"
      || !plan || !Array.isArray(plan.stretches) || plan.stretches.length === 0 || !plan.stretches.every((each) => typeof each?.from === "number" && typeof each.to === "number" && each.from < each.to)
      || typeof plan.cleanVoice !== "boolean" || (captions !== null && typeof captions !== "string")) throw new Error("not an export to finish");
    const cleanVoice = clips.stored(clipId, "clean-voice.wav");
    const source = facts.get(clipId)?.audio == null ? null : plan.cleanVoice && existsSync(cleanVoice) ? cleanVoice : clips.original(clipId);
    const destination = await exports.finish(id, { stretches: plan.stretches, source }, durationSeconds, captions,
      (fraction) => {
        if (!event.sender.isDestroyed()) event.sender.send(CHANNELS.exportProgress, [id, fraction]);
      });
    // Counted for the day-7 check-in, on this computer only until a yes sends it (check-in.ts).
    saveSettings(withExport(settings, new Date())).catch((error: unknown) => logError("settings_unsaved", errorName(error)));
    return destination;
  });
  ipcMain.handle(CHANNELS.cancelExport, (_event, id: unknown) => {
    if (typeof id === "number") return exports.cancel(id);
  });
  ipcMain.handle(CHANNELS.showExported, (_event, destination: unknown) => {
    if (typeof destination === "string" && destinations.has(destination)) shell.showItemInFolder(destination);
  });
  ipcMain.handle(CHANNELS.cancelClip, (_event, id: unknown) => {
    if (typeof id === "string") jobs.cancel(id);
  });

  ipcMain.handle(CHANNELS.logProblem, (_event, event: unknown, detail: unknown) => {
    if (typeof event === "string" && /^[a-z_]{1,60}$/.test(event)) logError(`window_${event}`, String(detail).slice(0, 300));
  });
  ipcMain.handle(CHANNELS.appVersion, () => app.getVersion());
  const system: FeedbackSystem = { version: app.getVersion(), platform: process.platform, systemVersion: process.getSystemVersion(), arch: process.arch };
  ipcMain.handle(CHANNELS.about, (): AboutFacts => ({ version: system.version, system: systemLine(system), updates: updatesItself() }));

  // Reports and the check-in: to hubnx.com from a person's copy, its dry run from the repo, a stand-in in the checks.
  const sendTo = feedbackUrl(app.isPackaged, process.env.VIDEO_FEEDBACK_URL);
  const draftOf = (draft: unknown): FeedbackDraft => {
    const given = draft as Partial<FeedbackDraft> | null;
    if (!given || (given.kind !== "problem" && given.kind !== "idea") || typeof given.message !== "string" || typeof given.email !== "string"
      || typeof given.withLog !== "boolean" || (given.failure !== null && typeof given.failure !== "string")
      || (given.theme !== "light" && given.theme !== "dark") || typeof given.locale !== "string") throw new Error("not a feedback draft");
    return { kind: given.kind, message: given.message, email: given.email, withLog: given.withLog, failure: given.failure?.slice(0, 60) ?? null, theme: given.theme, locale: given.locale.slice(0, 35) };
  };
  const detailsOf = async (draft: FeedbackDraft) => reportDetails(system, draft.failure, draft.withLog ? await logEnd(paths.logs) : null);
  ipcMain.handle(CHANNELS.feedbackPreview, async (_event, draft: unknown) => detailsOf(draftOf(draft)));
  ipcMain.handle(CHANNELS.sendFeedback, async (_event, given: unknown) => {
    const draft = draftOf(given);
    if (draftRefusal(draft)) return "refused";
    return sendReport(sendTo, reportBody(draft, system, await detailsOf(draft)));
  });
  // The check-in goes once it's due and the person said yes: looked at on opening, after a yes, and every six hours.
  let checkingIn = false;
  const checkInIfDue = async () => {
    if (checkingIn || !checkInReady(settings, new Date())) return;
    checkingIn = true;
    try {
      const outcome = await sendCheckIn(sendTo, checkInBody(checkInState(settings, new Date()).counts, system));
      await saveSettings(afterCheckIn(settings, outcome, new Date()));
    } catch (error) {
      logError("checkin_unsaved", errorName(error));
    } finally {
      checkingIn = false;
    }
  };
  ipcMain.handle(CHANNELS.checkIn, () => checkInState(settings, new Date()));
  ipcMain.handle(CHANNELS.answerCheckIn, async (_event, answer: unknown) => {
    if (answer !== "yes" && answer !== "no") throw new Error("not an answer");
    await saveSettings({ checkIn: { answer, answeredAt: new Date().toISOString() } });
    void checkInIfDue();
    return checkInState(settings, new Date());
  });
  void checkInIfDue();
  setInterval(() => void checkInIfDue(), 6 * 60 * 60 * 1000);

  ipcMain.handle(CHANNELS.licenses, () => licensesShown());
  ipcMain.handle(CHANNELS.openLicenseSource, (_event, url: unknown) => {
    if (typeof url !== "string") throw new Error("not an address");
    return openSource(url);
  });
  ipcMain.handle(CHANNELS.openChromiumNotices, () => openChromiumNotices());
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
      // The checks' window is unseen but must play at full pace, as a person's does in front.
      backgroundThrottling: !BEHIND,
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

  // Updates, once the window can hear of them (updates.ts).
  const updates = startUpdates((update) => window?.webContents.send(CHANNELS.updateFound, update), process.env.VIDEO_UPDATE_FEED);
  ipcMain.handle(CHANNELS.checkForUpdates, () => updates.check());
  ipcMain.handle(CHANNELS.installUpdate, () => {
    const found = updates.found();
    // Quitting would stop an export under way (before-quit cancels it), so the restart waits for it.
    if (found?.state !== "ready" || exports.busy()) return false;
    installUpdate(found.version, shown.isFocused());
    return true;
  });
  ipcMain.handle(CHANNELS.openReleaseNotes, () => {
    const found = updates.found();
    if (found) return shell.openExternal(releaseNotesUrl(found.version));
  });

  app.on("second-instance", () => {
    if (shown.isMinimized()) shown.restore();
    shown.focus();
  });
  app.on("window-all-closed", () => app.quit());
  // However the app quits (Cmd+Q skips window-all-closed), FFmpeg's running job and the transcriber go with it.
  // Quitting waits for each pending save first: the last second of edits is the person's work too.
  let flushedBeforeQuit = false;
  app.on("before-quit", (event) => {
    if (flushedBeforeQuit) return;
    event.preventDefault();
    // An export under way is stopped and its files beside the destination removed: nothing half-made is left behind.
    Promise.all([...[...autosaves.values()].map((autosave) => autosave.flush().catch(() => undefined)), exports.cancelAll()]).finally(() => {
      flushedBeforeQuit = true;
      app.quit();
    });
  });
  app.on("will-quit", () => {
    jobs.stopAll();
    for (const controller of [...transcripts.values(), ...voices.values()]) controller.abort();
  });
}
