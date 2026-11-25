/**
 * Every word the window shows, in one place, so a screen's wording is checked and changed here (the clarity check,
 * ../../../docs/brand.md), and translating later is this one file. Written to the owner's rule for words people read:
 * plain, the point first, short sentences (~/.claude/CLAUDE.md › Outreach and SEO).
 */
import { APP_NAME, type OpenRefusal } from "./shared/app-api.ts";
import type { JobKind } from "./shared/media.ts";
import type { CaptionStyle } from "./preview/captions.ts";
import type { Spacing } from "./edit/cleanup.ts";

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
    waiting: "Words appear here as they're heard.",
    pause: (seconds: string) => `${seconds} s pause`,
    cutPause: "Cut this pause",
    putBack: "Cut. Click to put it back",
    // Possible, not certain: the filler check found 70% of these are real (gate on day 1's numbers).
    cutFiller: "Possible um: click to cut it",
    cut: "Cut",
  },
  captions: {
    label: "Captions:",
    style: "Caption style",
    styles: { subtitles: "Subtitles", wordByWord: "Word by word" } satisfies Record<CaptionStyle, string>,
    hideFillers: "Hide ums in captions",
  },
  cleanup: {
    label: "Clean up",
    cleanUp: (count: number) => `Clean up: ${count} ${count === 1 ? "silence" : "silences"}`,
    putBackAll: "Put all the silences back",
    wouldSave: (seconds: number) => `${duration(seconds)} shorter`,
    shorter: (seconds: number) => `Cut · ${duration(seconds)} shorter`,
    spacingLabel: "Pauses:",
    spacing: "Pause spacing",
    spacings: { tight: "Tight", natural: "Natural", relaxed: "Relaxed" } satisfies Record<Spacing, string>,
    possibleFillers: (count: number) => `${count} possible ${count === 1 ? "um" : "ums"}: click one in the transcript to cut it`,
    noPauses: "Clean up: no long pauses",
    undo: "Undo",
    redo: "Redo",
  },
  timeline: {
    label: "Timeline",
  },
  preview: {
    label: "Preview",
    position: "Position in the video",
    play: "Play",
    pause: "Pause",
  },
} as const;

/** "0.5 s", "45 s" or "1 min 40 s": a tenth of a second under 10 s, so it agrees with the pauses marked in the transcript. */
function duration(seconds: number): string {
  if (seconds < 10) return `${seconds.toFixed(1)} s`;
  const whole = Math.round(seconds);
  return whole < 60 ? `${whole} s` : `${Math.floor(whole / 60)} min${whole % 60 ? ` ${whole % 60} s` : ""}`;
}

export function refusalWords(refusal: OpenRefusal): string {
  return words.start.refused[refusal];
}
