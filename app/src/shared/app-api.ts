/**
 * What the window may ask of the app (electron/preload.ts exposes exactly this as window.video), and the shapes it
 * gets back. The window never touches files or processes itself.
 */

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
} as const;
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
} as const;

export interface VideoApi {
  appVersion(): Promise<string>;
  ffmpeg(): Promise<FfmpegFound | null>;
  openWebsite(page: WebsitePage): Promise<void>;
}
