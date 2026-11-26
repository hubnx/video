/**
 * The edit of release 1's one clip: the stretches of it taken out (a silence cut, a possible "um" cut, a piece deleted
 * on the timeline), and where the person split it. What plays is the clip minus what's taken out, in segments split at
 * the splits and the cuts; restoring one cut is taking it off the list, and undo is the list put back (history.ts).
 * Time inside a segment is the clip's own; time on the timeline is the sum of the segments before. Pure: the tests
 * check every edit without a window. Several clips and tracks come with release 1.3.
 */
import type { Stretch } from "../shared/cuts.ts";
import type { Edit, Removed, Segment } from "../shared/project.ts";
import type { Flicks } from "../shared/time.ts";

export function emptyEdit(): Edit {
  return { removed: [], splits: [], zoomChanges: [] };
}

/** What plays, in order: the clip minus every removed stretch, split at the splits. */
export function segments(edit: Edit, clipId: string, duration: Flicks): Segment[] {
  const removed = [...edit.removed].sort((one, other) => one.start - other.start);
  const kept: Stretch[] = [];
  let at = 0 as Flicks;
  for (const stretch of removed) {
    if (stretch.start > at) kept.push({ start: at, end: stretch.start });
    at = Math.max(at, stretch.end) as Flicks;
  }
  if (at < duration) kept.push({ start: at, end: duration });
  const splits = [...edit.splits].sort((one, other) => one - other);
  return kept.flatMap((stretch) => {
    const inside = splits.filter((split) => split > stretch.start && split < stretch.end);
    const bounds = [stretch.start, ...inside, stretch.end];
    return bounds.slice(1).map((end, index) => ({ clipId, from: bounds[index]!, to: end }));
  });
}

/** The segments with each pair that touches joined into one: a split that took nothing out plays straight through, so
 * an export reads it as one stretch, with no fade at a join nobody made (the export's fresh review, 2026-11-24). */
export function joinedSegments(parts: readonly Segment[]): Segment[] {
  const joined: Segment[] = [];
  for (const part of parts) {
    const last = joined.at(-1);
    if (last && last.clipId === part.clipId && last.to === part.from) joined[joined.length - 1] = { ...last, to: part.to };
    else joined.push({ ...part });
  }
  return joined;
}

export function timelineLength(parts: readonly Segment[]): Flicks {
  return parts.reduce((sum, segment) => sum + segment.to - segment.from, 0) as Flicks;
}

/** Where a moment of the timeline falls: the segment's index and the clip's own time there. Null past the end. */
export function sourceAt(parts: readonly Segment[], time: Flicks): { index: number; time: Flicks } | null {
  let start = 0;
  for (const [index, segment] of parts.entries()) {
    const length = segment.to - segment.from;
    if (time < start + length) return { index, time: (segment.from + (time - start)) as Flicks };
    start += length;
  }
  return null;
}

/** Where a moment of the clip plays on the timeline, or null if it's been taken out. */
export function timelineAt(parts: readonly Segment[], clipTime: Flicks): Flicks | null {
  let start = 0;
  for (const segment of parts) {
    if (clipTime >= segment.from && clipTime < segment.to) return (start + (clipTime - segment.from)) as Flicks;
    start += segment.to - segment.from;
  }
  return null;
}

/** Takes a stretch out, for a reason. Taking the same stretch out again changes nothing. */
export function remove(edit: Edit, stretch: Removed): void {
  if (edit.removed.some((each) => each.start === stretch.start && each.end === stretch.end)) return;
  edit.removed.push(stretch);
}

/** Puts a taken-out stretch back: restoring one cut, even one of many accepted at once. */
export function restore(edit: Edit, stretch: Stretch): void {
  // Spliced in place, and only when found: a new list, even an equal one, would count as a change to undo.
  const index = edit.removed.findIndex((each) => each.start === stretch.start && each.end === stretch.end);
  if (index >= 0) edit.removed.splice(index, 1);
}

/** Splits at a moment of the clip; a split where one already is changes nothing. */
export function split(edit: Edit, clipTime: Flicks): void {
  if (!edit.splits.includes(clipTime)) edit.splits.push(clipTime);
}

/** Deletes the segment at `index` of what plays. */
export function deleteSegment(edit: Edit, parts: readonly Segment[], index: number): void {
  const segment = parts[index];
  if (segment) remove(edit, { start: segment.from, end: segment.to, reason: "deleted" });
}
