/**
 * A project as it's saved: the clips it uses, the edit, and the clean-up's proposals with what the person chose for
 * each. Every saved project names its format's version, and an older one is brought up to date step by step when
 * opened (`migrate`), so a project made by any release opens in every later one.
 */
import type { Cut } from "./cuts.ts";
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

/** What the person chose for a proposal: cut (its stretch is out of the edit) or kept (left as it was). */
export type ProposalChoice = "cut" | "kept";

export interface Proposal {
  clipId: string;
  cut: Cut;
  choice: ProposalChoice;
}

export interface Project {
  format: typeof PROJECT_FORMAT;
  version: typeof PROJECT_VERSION;
  clips: ProjectClip[];
  edit: { segments: Segment[] };
  proposals: Proposal[];
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
