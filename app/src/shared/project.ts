/**
 * A project as it's saved: the clips it uses and the edit. Every saved project names its format's version, and an older one is brought up to date step by step when
 * opened (`migrate`), so a project made by any release opens in every later one.
 */
import type { Stretch } from "./cuts.ts";
import type { ClipFacts } from "./media.ts";
import type { Flicks } from "./time.ts";

export const PROJECT_FORMAT = "hubnx-video-project";
export const PROJECT_VERSION = 2;

/** A stretch of a clip on the timeline: from `from` to `to` in the clip's own time (src/edit/timeline.ts edits them). */
export interface Segment {
  clipId: string;
  from: Flicks;
  to: Flicks;
}

export interface ProjectClip {
  id: string;
  path: string; // where the original was when last opened
  name: string;
  facts: ClipFacts;
}

/** Why a stretch of the clip was taken out: a silence or a possible "um" the clean-up proposed, or a piece deleted. */
export type RemovedReason = "silence" | "filler" | "deleted";

export interface Removed extends Stretch {
  reason: RemovedReason;
}

/** A punch-in on a stretch of the clip (smooth jump cuts, docs/design/1.1-shorts.md): the picture `scale` times larger
 * about `centre`, the speaker's face, as fractions of the upright picture. Worked out from the cuts and the speaker
 * (shorts/smooth-cuts.ts), never stored, so it always matches the cuts as they are. */
export interface Zoom {
  start: Flicks;
  end: Flicks;
  scale: number;
  centre: { x: number; y: number };
}

/** The person's own change to the punch-in after the cut at `at` (the start of the stretch it's on): taken away, or
 * shortened to `start`–`end`. Only these are kept, and undone; a change whose cut has moved (a new spacing) no longer
 * applies. */
export type ZoomChange = { at: Flicks; kind: "removed" } | { at: Flicks; kind: "shortened"; start: Flicks; end: Flicks };

/** The edit (src/edit/timeline.ts): what's taken out of the clip, where it was split, and the person's changes to the
 * punch-ins (version 2). */
export interface Edit {
  removed: Removed[];
  splits: Flicks[];
  zoomChanges: ZoomChange[];
}

/** The person's choices for the clip, kept with the edit so a reopened project looks as they left it. */
export interface Choices {
  spacing: "tight" | "natural" | "relaxed"; // edit/cleanup.ts › SPACINGS
  captionStyle: "subtitles" | "wordByWord"; // preview/captions.ts › CAPTION_STYLES
  hideFillersInCaptions: boolean;
  /** Voice clean-up (DPDFNet), off by default: it takes about 40 s an audio minute on an 8-thread Intel Mac (the voice
   * check, 2026-11-24), so it runs only when asked. */
  cleanVoice: boolean;
  /** The preview and the export as a 9:16 short following the speaker (version 2). */
  shorts: boolean;
  /** Smooth jump cuts: a punch-in at alternate cuts where a face is in frame, off by default (version 2). */
  smoothCuts: boolean;
}

export const DEFAULT_CHOICES: Choices = { spacing: "natural", captionStyle: "wordByWord", hideFillersInCaptions: true, cleanVoice: false,
  shorts: false, smoothCuts: false };

export interface Project {
  format: typeof PROJECT_FORMAT;
  version: typeof PROJECT_VERSION;
  clips: ProjectClip[];
  edit: Edit;
  choices: Choices;
}

/** Each step from one version to the next, by the version it starts from. */
const STEPS: Record<number, (project: Record<string, unknown>) => Record<string, unknown>> = {
  // 1.1: changes to punch-ins on the edit (none), and the short and smooth-cut choices, off as release 1 had them.
  1: (project) => ({
    ...project,
    version: 2,
    edit: { ...(project.edit as object), zoomChanges: [] },
    choices: { ...(project.choices as object), shorts: false, smoothCuts: false },
  }),
};

/** A saved project, any version, as the current version; refuses what isn't a project, or one from a newer release. */
export function migrate(saved: unknown): Project {
  const project = saved as Record<string, unknown> | null;
  if (typeof project !== "object" || project === null || project.format !== PROJECT_FORMAT) throw new Error("PROJECT_NOT_A_PROJECT");
  let version = Number(project.version);
  if (!Number.isInteger(version) || version < 1) throw new Error("PROJECT_NOT_A_PROJECT");
  if (version > PROJECT_VERSION) throw new Error("PROJECT_FROM_A_NEWER_RELEASE");
  let current = project;
  while (version < PROJECT_VERSION) {
    const step = STEPS[version];
    if (!step) throw new Error(`PROJECT_NO_STEP_FROM_${version}`);
    current = step(current);
    version++;
  }
  return current as unknown as Project;
}
