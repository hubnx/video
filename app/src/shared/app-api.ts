/**
 * What the window may ask of the app (electron/preload.ts exposes exactly this as window.video), and the shapes it
 * gets back. The window never touches files or processes itself.
 */
import type { Clip, JobProgress, VoiceProgress } from "./media.ts";
import type { Choices, Edit } from "./project.ts";
import type { TranscriptProgress } from "./transcript.ts";

/** The name a person sees, everywhere: hubnx plus the app's address word (../../../docs/brand.md › Naming). Always
 * lowercase "hubnx", so no sentence starts with it (docs/plan.md › Where it ships). */
export const APP_NAME = "hubnx Video";

/** The packaged app's id, which names its records on a Mac and its install on Windows: never changed after release 1,
 * since a changed id breaks updates and settings. The screen watch knows our app by it (scripts/start.ts). */
export const APP_ID = "com.hubnx.video";

/** The data folder's name: settings, logs, edit copies and the models. No space, so FFmpeg's and the models' paths
 * never need quoting on Windows and Linux. */
export const DATA_FOLDER_NAME = "hubnx-video";

export const WEBSITE_PAGES = {
  home: "https://video.hubnx.com/",
  download: "https://video.hubnx.com/download/",
  hubNexus: "https://hubnx.com/",
  licenses: "https://video.hubnx.com/licenses/",
  privacy: "https://video.hubnx.com/privacy/",
  terms: "https://video.hubnx.com/terms/",
  source: "https://github.com/hubnx/video",
} as const;

/** A release's notes, on GitHub (the release is tagged v<version>). */
export const releaseNotesUrl = (version: string) => `${WEBSITE_PAGES.source}/releases/tag/v${version}`;
export type WebsitePage = keyof typeof WEBSITE_PAGES;

/** What the bundled FFmpeg says it is: its first line of `-version`, and whether the encoders the app relies on are in
 * it. Null when it couldn't run. */
export interface FfmpegFound {
  version: string;
  encoders: Record<FfmpegEncoder, boolean>;
}

/** The encoders the app uses FFmpeg for: x264 for edit copies and as the export's fallback, and the operating system's
 * own AAC encoder where there is one (docs/plan.md › How it's built: their patents are the system's). */
export const FFMPEG_ENCODERS = ["libx264", "aac", "aac_at", "aac_mf"] as const;
export type FfmpegEncoder = (typeof FFMPEG_ENCODERS)[number];

export const CHANNELS = {
  appVersion: "app:version",
  ffmpeg: "ffmpeg:found",
  openWebsite: "app:open-website",
  openVideo: "clip:open",
  chooseVideo: "clip:choose",
  planClip: "clip:plan",
  cancelClip: "clip:cancel",
  jobProgress: "clip:job-progress",
  transcriptProgress: "clip:transcript-progress",
  logProblem: "app:log-problem",
  saveEdit: "clip:save-edit",
  cleanVoice: "clip:clean-voice",
  voiceProgress: "clip:voice-progress",
  voiceEstimate: "voice:estimate",
  exportDestination: "export:destination",
  changeExportDestination: "export:change-destination",
  beginExport: "export:begin",
  writeExport: "export:write",
  finishExport: "export:finish",
  cancelExport: "export:cancel",
  exportProgress: "export:progress",
  showExported: "export:show",
  about: "app:about",
  menuCommand: "app:menu-command",
  updateFound: "update:found",
  checkForUpdates: "update:check",
  installUpdate: "update:install",
  openReleaseNotes: "update:release-notes",
  feedbackPreview: "feedback:preview",
  sendFeedback: "feedback:send",
  licenses: "licenses:list",
  openLicenseSource: "licenses:open-source",
  openChromiumNotices: "licenses:open-chromium",
  checkIn: "check-in:state",
  answerCheckIn: "check-in:answer",
} as const;

/** Where hubnx.com takes reports and check-ins (its `/api/feedback`; the contract: @hubnx/web-parts › feedback-report and
 * hubnx's app-checkin.util.ts). Hub Nexus knows this app as `video`. */
export const FEEDBACK_URL = "https://www.hubnx.com/api/feedback";
export const FEEDBACK_APP_KEY = "video";
export const FEEDBACK_LIMITS = { shortestMessage: 10, longestMessage: 5000, longestEmail: 320, longestLog: 64 * 1024 } as const;

/** Why a report can't go yet, as what to fix, or null: the form says it before sending (src/feedback-view.ts), and the
 * main process checks again (electron/main.ts), as the route does. */
export function draftRefusal(draft: { message: string; email: string }): "message_short" | "message_long" | "email" | null {
  const message = draft.message.trim();
  if (message.length < FEEDBACK_LIMITS.shortestMessage) return "message_short";
  if (message.length > FEEDBACK_LIMITS.longestMessage) return "message_long";
  const email = draft.email.trim();
  if (email && (email.length > FEEDBACK_LIMITS.longestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return "email";
  return null;
}

/** What a menu item asks the window to open (electron/menu.ts): the window owns every dialog. */
export type MenuCommand = "settings" | "checkForUpdates" | "feedback" | "licenses";

/** The app and where it runs, for Settings › About and a report's first line. */
export interface AboutFacts {
  version: string;
  /** "macOS 15.1 · arm64" */
  system: string;
  /** Whether this copy updates itself (a packaged copy from the website), so Settings offers *Check for updates*. */
  updates: boolean;
}

/** A newer version: downloading, ready to install at the next restart, or found but out of this copy's reach (a Mac
 * copy run from its disk image or a folder it can't write to, a .deb's copy), so the person gets it from the site. */
export interface Update {
  state: "downloading" | "ready" | "out_of_reach";
  version: string;
}
export type UpdateCheck = { found: "update"; update: Update } | { found: "newest" } | { found: "unreachable" } | { found: "not_updating" };

/** A report the person writes (Settings › Send feedback, or *Send a problem report* by a failure). */
export interface FeedbackDraft {
  kind: "problem" | "idea";
  message: string;
  email: string; // empty: no answer wanted
  /** Whether the end of the app's log goes with it, which the person sees first (feedbackPreview). */
  withLog: boolean;
  /** The failure it was opened from, as its code ("transcript_failed"), or null. */
  failure: string | null;
  theme: "light" | "dark";
  locale: string;
}
export type FeedbackResult = "sent" | "refused" | "too_many" | "unreachable";

/** The day-7 check-in's three numbers (hubnx's app-checkin.util.ts › video), counted on this computer only from the
 * first open, and sent once, a week after it, only after a yes (docs/plan.md › Keep or stop › The check-in). */
export interface CheckInCounts {
  videosExported: number;
  minutesToFirstExport: number | null; // none yet
  setupFailures: number;
}
export interface CheckInState {
  /** The person's answer: null until asked, which is once, after the first export. */
  answer: "yes" | "no" | null;
  /** When it went, or null. Sent once; nothing more goes after. */
  sentAt: string | null;
  /** When it goes, if they say yes: a week after the first open. */
  dueAt: string;
  /** Exactly what it sends, with the version and system beside them. */
  counts: CheckInCounts;
}

/** Why a video didn't open, as a code the window turns into words (words.ts). */
export type OpenRefusal = "not_a_video" | "unreadable";
/** An opened clip, with its project as last saved when it was opened before (null the first time). */
export type OpenResult = { clip: Clip; saved: { edit: Edit; choices: Choices } | null } | { refused: OpenRefusal };

/** media:// addresses: a clip's original, proxy or edit copy, by its id (electron/clips.ts serves only these). */
export function mediaAddress(clipId: string, file: "original" | "proxy" | "editCopy" | "cleanVoice"): string {
  return `media://clip/${clipId}/${file}`;
}

/** Where an export will be saved: the whole path for the calls, and the two names the dialog shows. */
export interface ExportDestination {
  path: string;
  folderName: string;
  fileName: string;
}

export interface VideoApi {
  appVersion(): Promise<string>;
  ffmpeg(): Promise<FfmpegFound | null>;
  openWebsite(page: WebsitePage): Promise<void>;
  /** The path of a file dropped on the window: Electron no longer puts it on File itself. */
  pathOfDropped(file: File): string;
  openVideo(path: string): Promise<OpenResult>;
  /** The system's file dialog; null when the person closed it. */
  chooseVideo(): Promise<OpenResult | null>;
  /** Starts the clip's jobs, once the window knows whether it can decode the original (electron/ffmpeg-jobs.ts). */
  planClip(clipId: string, decodes: boolean): Promise<void>;
  cancelClip(clipId: string): Promise<void>;
  onJobProgress(listener: (progress: JobProgress) => void): () => void;
  onTranscriptProgress(listener: (progress: TranscriptProgress) => void): () => void;
  /** Writes a problem the window met to the app's log, under a searchable event name; `detail` is from src/problems.ts. */
  logProblem(event: string, detail: string): void;
  /** The clip's edit and choices as they are now: saved about a second after the last change (electron/project-file.ts). */
  saveEdit(clipId: string, edit: Edit, choices: Choices): void;
  /** Makes the clip's clean voice, if it isn't made yet; its progress comes to onVoiceProgress. */
  cleanVoice(clipId: string): Promise<void>;
  onVoiceProgress(listener: (progress: VoiceProgress) => void): () => void;
  /** About how many seconds the clip's clean voice will take on this computer, or null when it's already made. */
  voiceEstimate(clipId: string): Promise<number | null>;
  /** Where the clip's export goes unless the person changes it (electron/export-destination.ts), asked afresh each time. */
  exportDestination(clipId: string): Promise<ExportDestination>;
  /** The system's save dialog, starting from `current`; null when the person closed it. */
  changeExportDestination(clipId: string, current: string): Promise<ExportDestination | null>;
  /** Starts an export to a destination given by the two calls above; its number for the calls below. */
  beginExport(destination: string): Promise<number>;
  /** A piece of the encoded MP4 (the picture), at its place in the file. */
  writeExport(exportId: number, position: number, data: Uint8Array): Promise<void>;
  /** Adds the sound (`sound`: the kept stretches of the clip, and whether the clean voice plays) and writes the
   * destination, with the captions file beside it when given; progress comes to onExportProgress. */
  finishExport(exportId: number, clipId: string, sound: ExportSound, durationSeconds: number, captions: string | null): Promise<void>;
  cancelExport(exportId: number): Promise<void>;
  onExportProgress(listener: (exportId: number, fraction: number) => void): () => void;
  /** Shows an exported file in the system's file manager. */
  showExported(destination: string): Promise<void>;
  about(): Promise<AboutFacts>;
  /** What a menu item asks the window to open. */
  onMenuCommand(listener: (command: MenuCommand) => void): () => void;
  /** A newer version found, as it downloads and once it's ready; null when a download failed (the next check retries). */
  onUpdate(listener: (update: Update | null) => void): () => void;
  /** Checks now: the version already found, else what the website says. */
  checkForUpdates(): Promise<UpdateCheck>;
  /** Quits, installs the ready version and opens it again; false while an export runs, which quitting would stop. */
  installUpdate(): Promise<boolean>;
  /** The found version's release notes, on GitHub. */
  openReleaseNotes(): Promise<void>;
  /** Exactly what a report adds to the person's words: the app and system, the failure, and the log's end if asked. */
  feedbackPreview(draft: FeedbackDraft): Promise<string>;
  sendFeedback(draft: FeedbackDraft): Promise<FeedbackResult>;
  /** The open-source licenses list, as HTML made at build time (scripts/app-notices.ts), and whether Chromium's notices
   * ship beside the app. */
  licenses(): Promise<{ html: string; chromium: boolean }>;
  /** A "Source" link of the list, in the browser: only one the list holds. */
  openLicenseSource(url: string): Promise<void>;
  openChromiumNotices(): Promise<void>;
  checkIn(): Promise<CheckInState>;
  /** Yes or no to the day-7 check-in; the same switch in Settings. */
  answerCheckIn(answer: "yes" | "no"): Promise<CheckInState>;
}

export interface ExportSound {
  stretches: { from: number; to: number }[]; // seconds of the clip, in the order they play
  cleanVoice: boolean;
}
