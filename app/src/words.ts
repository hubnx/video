/**
 * Every word the window shows, in one place, so a screen's wording is checked and changed here (the clarity check,
 * ../../../docs/brand.md), and translating later is this one file. Written to the owner's rule for words people read:
 * plain, the point first, short sentences (~/.claude/CLAUDE.md › Outreach and SEO).
 */
import { APP_NAME, type CheckInCounts, type FeedbackDraft, type FeedbackResult, type OpenRefusal } from "./shared/app-api.ts";
import type { JobKind } from "./shared/media.ts";
import type { CaptionStyle } from "./preview/captions.ts";
import type { Spacing } from "./edit/cleanup.ts";
import type { CaptionOutput } from "./export/presets.ts";

export const words = {
  appName: APP_NAME,
  start: {
    heading: "Drop a video here",
    // Says only what ships and is measured: the voice since its clean-up shipped and measured (the voice check,
    // 2026-11-24: noise in pauses down 23.6 dB, speech within 1.1 dB); "ums" only once the filler check reaches 80%.
    lead: "Captions, silences and the voice, cleaned up for you to check.",
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
      voiceSource: "Getting the sound ready for voice clean-up",
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
      voiceSource: "The sound couldn't be read, so the voice can't be cleaned up.",
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
  shorts: {
    switch: "Short (9:16)",
    finding: (percent: number) => `Finding the speaker… ${percent}%`,
    noFace: "No face found, so the short stays centred.",
    failed: "The speaker couldn't be found, so the short stays centred.",
    job: "Finding the speaker for shorts",
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
    cleanVoice: "Clean voice",
    smoothCuts: "Smooth jump cuts",
    // Said beside the switch: what it will do, or what it's waiting for.
    smoothCutsWaiting: (percent: number) => `(finding the speaker… ${percent}%)`,
    smoothCutsNoFace: "(no face found)",
    punchIns: (count: number, cutsMade: boolean) => count
      ? `${count} ${count === 1 ? "punch-in" : "punch-ins"}, on the timeline`
      : cutsMade ? "No cut with a face to punch in on" : "Punches in at the cuts Clean up makes",
    // What the switch is doing, as the person sees it (src/shared/media.ts › VoiceProgress).
    // On the switch before it's on: "Clean voice (about 14 min for this video)".
    voiceTime: (seconds: number) => (seconds < 60 ? "under a minute for this video" : `about ${Math.round(seconds / 60)} min for this video`),
    voice: {
      preparing: (percent: number) => `Getting the sound ready… ${percent}%`,
      downloading: (percent: number) => `Getting the voice model ready (first time only)… ${percent}%`,
      cleaning: (percent: number) => `Cleaning the voice… ${percent}%`,
      ready: "Background noise removed",
      failed: "The voice couldn't be cleaned up for this video.",
    },
  },
  timeline: {
    label: "Timeline",
    zooms: "Punch-ins: drag an end to shorten one, or select it and press Delete",
  },
  export: {
    open: "Export",
    heading: "Export",
    for: "For:",
    destinations: { video: "YouTube", shorts: "Shorts" } satisfies Record<"video" | "shorts", string>,
    size: "Size:",
    captions: "Captions:",
    captionOutputs: { burnedIn: "In the video", file: "As a file (.srt)", none: "None" } satisfies Record<CaptionOutput, string>,
    youtube: "Ready for YouTube: the format and loudness YouTube recommends.",
    shortsNote: "Ready for YouTube Shorts, TikTok and Reels: 9:16, following the speaker.",
    // YouTube Shorts and Instagram Reels take up to 3 minutes (both since 2024-25); TikTok takes 10 in the app.
    tooLong: (length: string) => `This edit runs ${length}. YouTube Shorts and Reels take up to 3 minutes; TikTok takes longer.`,
    findingSpeaker: "Finding the speaker…",
    details: "Details",
    detailsText: (width: number, height: number, frameRate: number, megabits: number) =>
      `H.264 video, ${width} × ${height} at ${Number(frameRate.toFixed(2))} frames a second and ${megabits} Mb/s; AAC sound at 192 kb/s, evened to −14 LUFS, YouTube's loudness.`,
    savesTo: "Saves to:",
    place: (folder: string, file: string) => `${folder} › ${file}`,
    change: "Change…",
    start: "Export",
    cancel: "Cancel",
    close: "Close",
    show: "Show in folder",
    preparing: "Getting the video ready to export…",
    picture: "Exporting…",
    sound: "Adding the sound…",
    done: (file: string) => `Saved as ${file}.`,
    cancelled: "Stopped. Nothing was saved.",
    failed: "The export didn't finish. Nothing was saved.",
    nothingLeft: "Everything is cut, so there's nothing to export. Undo to bring some back.",
  },
  topBar: {
    feedback: "Feedback",
    settings: "Settings",
  },
  update: {
    ready: (version: string) => `${APP_NAME} ${version} is ready. It installs when you quit.`,
    restart: "Restart now",
    // Said when the restart waits for an export (quitting would stop it).
    afterExport: "Restart after the export finishes.",
    whatsNew: "What's new",
    outOfReach: (version: string) => `${APP_NAME} ${version} is out. This copy can't update itself where it is.`,
    download: "Download it",
    dismiss: "Not now",
  },
  settings: {
    heading: "Settings",
    updates: "Updates",
    check: "Check for updates",
    checking: "Checking…",
    found: {
      newest: "You have the newest version.",
      unreachable: "Couldn't reach the website. The app checks again later.",
      not_updating: "This copy doesn't update itself. Get new versions from the website.",
    },
    downloading: (version: string) => `Downloading ${version}. It installs when you quit.`,
    ready: (version: string) => `${version} is ready. It installs when you quit.`,
    outOfReach: (version: string) => `${version} is out. Download it from the website.`,
    checkIn: "Counts, once",
    checkInSwitch: "Send three counts once, a week after you started",
    sent: (day: string) => `Sent on ${day}. Nothing more goes.`,
    goesOn: (day: string) => `Goes on ${day}, if this is on.`,
    help: "Help",
    feedback: "Send feedback",
    licenses: "Open-source licenses",
    privacy: "Privacy",
    terms: "Terms",
    close: "Close",
  },
  // The day-7 check-in, in the words hubnx.com/about/privacy uses for it (docs/plan.md › Keep or stop › The check-in).
  checkIn: {
    ask: "Help us make it better? A week after you started, the app can send three counts, once.",
    numbers: (counts: CheckInCounts) => [
      `Videos exported: ${counts.videosExported}`,
      `Minutes to your first export: ${counts.minutesToFirstExport ?? "none yet"}`,
      `Setup failures: ${counts.setupFailures}`,
    ],
    nothingElse: "With the app's version and system. Nothing else: no video, words, name or install number.",
    yes: "Yes, send them",
    no: "No, thanks",
    thanks: "Thanks. You can change this in Settings.",
  },
  feedback: {
    heading: "Send feedback",
    problemHeading: "Send a problem report",
    open: "Send a problem report",
    kinds: { problem: "A problem", idea: "An idea" } satisfies Record<FeedbackDraft["kind"], string>,
    kind: "What it's about",
    message: { problem: "What happened?", idea: "What would help?" } satisfies Record<FeedbackDraft["kind"], string>,
    email: "Your email, if you'd like an answer",
    optional: "(optional)",
    withLog: "Include the app's log, to help us find the problem",
    preview: "See exactly what's sent",
    previewIntro: "Your words go with this:",
    send: "Send",
    sending: "Sending…",
    cancel: "Cancel",
    close: "Close",
    refusals: {
      message_short: "Say a little more: at least ten characters, so we know what to look at.",
      message_long: "Keep it under 5,000 characters.",
      email: "That doesn't look like an email address. Check it, or leave the box empty.",
    },
    results: {
      sent: "Thanks. We read every report.",
      refused: "It wasn't accepted. Check the email address, or leave it empty, and try again.",
      too_many: "Too many reports from this network just now. Try again in an hour.",
      unreachable: "Couldn't reach Hub Nexus. Check the internet connection, then try again.",
    } satisfies Record<FeedbackResult, string>,
  },
  licenses: {
    heading: "Open-source licenses",
    intro: `${APP_NAME} is open source under the GNU AGPL, version 3. It's built with the software below, each under its own license.`,
    chromium: "Chromium's notices",
    close: "Close",
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
