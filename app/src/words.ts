/**
 * Every word the window shows, in one place, so a screen's wording is checked and changed here (the clarity check,
 * ../../../docs/brand.md), and translating later is this one file. Written to the owner's rule for words people read:
 * plain, the point first, short sentences (~/.claude/CLAUDE.md › Outreach and SEO).
 */
import { APP_NAME, type OpenRefusal } from "./shared/app-api.ts";
import type { JobKind } from "./shared/media.ts";
import type { CaptionStyle } from "./preview/captions.ts";

export const words = {
  appName: APP_NAME,
  start: {
    heading: "Drop a video here",
    // Says only what ships and is measured: "and the voice" joins when voice clean-up does (gate 2, 2026-11-21), and
    // "ums" only once the filler check reaches 80% (docs/plan.md › Risks).
    lead: "Captions and silences, cleaned up for you to check.",
    choose: "Choose a video",
    // Said at first run, where someone coming from an online editor notices it (docs/plan.md › The promise › Private).
    privacy: "Nothing is uploaded. No account. Your videos stay on this computer.",
    opening: "Opening…",
    refused: {
      not_a_video: "That file isn't a video this app can open. Try an MP4 or MOV file.",
      unreadable: "That file couldn't be read. Check it's still there, then try again.",
    } satisfies Record<OpenRefusal, string>,
  },
  clip: {
    // What each background job is doing, as the person sees it (src/shared/media.ts › JobKind).
    jobs: {
      speech: "Getting the sound ready for captions",
      proxy: "Preparing your video for smooth playback",
      editCopy: "Making a copy this computer can export",
    } satisfies Record<JobKind, string>,
    waiting: "Waiting",
    done: "Ready",
    failed: "Didn't finish",
    cancelled: "Stopped",
    timeLeft: (seconds: number) => {
      if (seconds < 50) return "less than a minute left";
      const minutes = Math.round(seconds / 60);
      return minutes <= 1 ? "about a minute left" : `about ${minutes} minutes left`;
    },
    starting: "Starting",
    notStarted: "This video couldn't be prepared. Close the app and open it again.",
    // The one line at the top: what's being got ready now (gate 2 on the preparing screen, 2026-11-21).
    downloadingModel: "Getting the speech model ready (first time only)…",
    hearing: "Writing captions…",
    preparing: "Getting your video ready for smooth playback…",
    details: "Details",
    jobFailed: {
      speech: "The sound couldn't be read, so captions can't be made for this video.",
      proxy: "The video couldn't be prepared for smooth playback.",
      editCopy: "A copy for export couldn't be made.",
    } satisfies Record<JobKind, string>,
    transcriptFailed: "Captions couldn't be made for this video.",
  },
  transcript: {
    label: "Transcript",
    waiting: "The words appear here as they're heard.",
  },
  captions: {
    style: "Caption style",
    styles: { subtitles: "Subtitles", wordByWord: "Word by word" } satisfies Record<CaptionStyle, string>,
  },
  preview: {
    label: "Preview",
    position: "Position in the video",
    play: "Play",
    pause: "Pause",
  },
} as const;

export function refusalWords(refusal: OpenRefusal): string {
  return words.start.refused[refusal];
}
