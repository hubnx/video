/**
 * What the window sends to be saved is checked before it's written: the window is never trusted to send a well-formed
 * project, and a malformed one saved would be a project that won't open.
 */
import type { Choices, Edit } from "../src/shared/project.ts";

const REASONS = new Set(["silence", "filler", "deleted"]);

function isTime(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function isEdit(value: unknown): value is Edit {
  const edit = value as Partial<Edit> | null;
  return typeof edit === "object" && edit !== null && Array.isArray(edit.removed) && Array.isArray(edit.splits)
    && edit.removed.every((stretch) => isTime(stretch?.start) && isTime(stretch?.end) && stretch.start < stretch.end && REASONS.has(stretch.reason))
    && edit.splits.every(isTime);
}

export function isChoices(value: unknown): value is Choices {
  const choices = value as Partial<Choices> | null;
  return typeof choices === "object" && choices !== null
    && ["tight", "natural", "relaxed"].includes(choices.spacing as string)
    && ["subtitles", "wordByWord"].includes(choices.captionStyle as string)
    && typeof choices.hideFillersInCaptions === "boolean";
}
