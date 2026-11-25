/**
 * The app's main process: one window, and the programs behind it.
 */
import { app, BrowserWindow, dialog, ipcMain, nativeTheme, protocol, shell } from "electron";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { APP_NAME, CHANNELS, WEBSITE_PAGES, type OpenResult, type WebsitePage } from "../src/shared/app-api.ts";
import type { Clip, ClipFacts, JobKind } from "../src/shared/media.ts";
import type { Stretch } from "../src/shared/cuts.ts";
import { loudness } from "../src/shared/quiet.ts";
import type { SoundMap, Transcript, TranscriptProgress } from "../src/shared/transcript.ts";
import { speechSamples } from "./quiet.ts";
import { errorName, logError, startAppLog } from "./app-log.ts";
import { Clips } from "./clips.ts";
import { findFfmpeg } from "./ffmpeg.ts";
import { editCopyArguments, jobsFor, proxyArguments, speechArguments } from "./ffmpeg-jobs.ts";
import { JobRunner, writingPath } from "./jobs.ts";
import { downloadModels, modelsReady, PARAKEET_V3, SILERO_VAD } from "./models.ts";
import { transcribe } from "./speech/speech.ts";
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
      const program = path.join(app.getAppPath(), "dist", "electron", "transcribe.cjs");
      const heard = await transcribe(program, clips.made(id, "speech"), paths.models,
        (words, fraction) => sendTranscript({ clipId: id, state: "hearing", fraction, words }), controller.signal);
      const transcript: Transcript = { language: "", words: heard.words };
      await writeFile(clips.stored(id, "voice.json"), JSON.stringify(heard.voice));
      await writeFile(stored, JSON.stringify(transcript));
      sendTranscript({ clipId: id, state: "done", transcript, sound: await soundMap(heard.voice) });
    } catch (error) {
      logError("transcript_unmade", errorName(error), error instanceof Error ? error.message.slice(0, 200) : "");
      sendTranscript({ clipId: id, state: "failed", error: error instanceof Error ? error.message.split(":")[0]! : "TRANSCRIBE_FAILED" });
    } finally {
      transcripts.delete(id);
    }
  };
  const jobs = new JobRunner(paths.ffmpeg, paths.logs, (progress) => {
    window?.webContents.send(CHANNELS.jobProgress, progress);
    if (progress.kind === "speech" && progress.state === "done") void transcribeClip(progress.clipId);
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

  ipcMain.handle(CHANNELS.logProblem, (_event, event: unknown, detail: unknown) => {
    if (typeof event === "string" && /^[a-z_]{1,60}$/.test(event)) logError(`window_${event}`, String(detail).slice(0, 300));
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

  app.on("second-instance", () => {
    if (shown.isMinimized()) shown.restore();
    shown.focus();
  });
  app.on("window-all-closed", () => app.quit());
  // However the app quits (Cmd+Q skips window-all-closed), FFmpeg's running job and the transcriber go with it.
  app.on("will-quit", () => {
    jobs.stopAll();
    for (const controller of transcripts.values()) controller.abort();
  });
}
