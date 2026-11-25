/**
 * A project as it's saved: the clips it uses and the edit. Every saved project names its format's version, and an older one is brought up to date step by step when
 * opened (`migrate`), so a project made by any release opens in every later one.
 */
import type { Stretch } from "./cuts.ts";
import type { ClipFacts } from "./media.ts";
import type { Flicks } from "./time.ts";

export const PROJECT_FORMAT = "hubnx-video-project";
export const PROJECT_VERSION = 1;

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

/** The edit (src/edit/timeline.ts): what's taken out of the clip, and where it was split. */
export interface Edit {
  removed: Removed[];
  splits: Flicks[];
}

/** The person's choices for the clip, kept with the edit so a reopened project looks as they left it. */
export interface Choices {
  spacing: "tight" | "natural" | "relaxed"; // edit/cleanup.ts › SPACINGS
  captionStyle: "subtitles" | "wordByWord"; // preview/captions.ts › CAPTION_STYLES
  hideFillersInCaptions: boolean;
  /** Voice clean-up (DPDFNet), off by default: it takes about 40 s an audio minute on an 8-thread Intel Mac (the voice
   * check, 2026-11-24), so it runs only when asked. */
  cleanVoice: boolean;
}

export const DEFAULT_CHOICES: Choices = { spacing: "natural", captionStyle: "wordByWord", hideFillersInCaptions: true, cleanVoice: false };

export interface Project {
  format: typeof PROJECT_FORMAT;
  version: typeof PROJECT_VERSION;
  clips: ProjectClip[];
  edit: Edit;
  choices: Choices;
}

/** Each step from one version to the next, by the version it starts from. Empty until version 2 exists. */
const STEPS: Record<number, (project: Record<string, unknown>) => Record<string, unknown>> = {};

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
