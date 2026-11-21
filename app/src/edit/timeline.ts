/**
 * The edit: which stretches of the opened clips play, in order. Cutting a silence, trimming, splitting and deleting
 * all change this list and nothing else, so what plays and what's exported both read it, and undo is the list put
 * back (history.ts). Time inside a segment is the clip's own; time on the timeline is the sum of the segments before.
 * Pure: the tests check every edit without a window.
 */
import type { Stretch } from "../shared/cuts.ts";
import type { Segment } from "../shared/project.ts";
import type { Flicks } from "../shared/time.ts";

export interface Edit {
  segments: Segment[];
}

/** The whole clip, before any edit. */
export function wholeClip(clipId: string, duration: Flicks): Edit {
  return { segments: [{ clipId, from: 0 as Flicks, to: duration }] };
}

export function timelineLength(edit: Edit): Flicks {
  return edit.segments.reduce((sum, segment) => sum + segment.to - segment.from, 0) as Flicks;
}

/** Where a moment of the timeline falls: the segment, and the clip's own time there. Null past the end. */
export function sourceAt(edit: Edit, time: Flicks): { index: number; clipId: string; time: Flicks } | null {
  let start = 0;
  for (const [index, segment] of edit.segments.entries()) {
    const length = segment.to - segment.from;
    if (time < start + length) return { index, clipId: segment.clipId, time: (segment.from + (time - start)) as Flicks };
    start += length;
  }
  return null;
}

/** Takes a stretch of a clip's own time out of the edit, wherever it plays: a silence cut, or a deleted word. The
 * segments it falls in are shortened or split; those it covers go. */
export function removeFromClip(edit: Edit, clipId: string, stretch: Stretch): void {
  edit.segments = edit.segments.flatMap((segment) => {
    if (segment.clipId !== clipId || stretch.end <= segment.from || stretch.start >= segment.to) return [segment];
    const pieces: Segment[] = [];
    if (stretch.start > segment.from) pieces.push({ clipId, from: segment.from, to: stretch.start });
    if (stretch.end < segment.to) pieces.push({ clipId, from: stretch.end, to: segment.to });
    return pieces;
  });
}

/** Splits the segment playing at a moment of the timeline in two there; a split on a boundary changes nothing. */
export function splitAt(edit: Edit, time: Flicks): void {
  const at = sourceAt(edit, time);
  if (!at) return;
  const segment = edit.segments[at.index]!;
  if (at.time === segment.from) return;
  edit.segments.splice(at.index, 1, { ...segment, to: at.time }, { ...segment, from: at.time });
}

export function deleteSegment(edit: Edit, index: number): void {
  edit.segments.splice(index, 1);
}
