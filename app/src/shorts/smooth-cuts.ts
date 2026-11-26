/**
 * Smooth jump cuts (G17, docs/design/1.1-shorts.md): at each cut, the next stretch alternates between a gentle
 * punch-in about the speaker's face and the normal frame, so a cut reads as a second camera rather than a jump. A
 * stretch with no face in most of its frames isn't punched in, though the alternation still turns at its cut, so
 * in-and-out keeps its rhythm. The punch-ins are worked out afresh from the cuts whenever they change, so a zoom only
 * ever starts and ends at a cut, and the person's own changes (a punch-in taken away or shortened) are laid over them.
 * Pure: the tests check every rule.
 */
import { FACE_STEP_SECONDS } from "../shared/faces.ts";
import type { Segment, Zoom, ZoomChange } from "../shared/project.ts";
import type { Flicks } from "../shared/time.ts";
import { secondsOf } from "../shared/time.ts";
import type { SpeakerPoint } from "./track.ts";

/** About 108%: enough to read as a new angle, little enough that a 1080p picture stays sharp (Opus Clip's and
 * Descript's punch-ins sit at 105 to 115%). */
export const PUNCH_IN = 1.08;

/** A stretch is punched in only when the face is seen in at least this share of its samples. */
const FACE_SHARE = 0.5;

/** A punch-in and the cut it follows (`at`, its stretch's start), by which the person's changes find it. */
export interface PunchIn extends Zoom {
  at: Flicks;
}

/** The punch-ins for `parts` (the kept stretches, joined where they touch, in order), with the person's `changes`: every
 * second stretch after a cut, about the middle of where its face was seen. */
export function punchIns(parts: readonly Segment[], track: readonly (SpeakerPoint | null)[], changes: readonly ZoomChange[]): PunchIn[] {
  const made: PunchIn[] = [];
  parts.forEach((part, index) => {
    if (index % 2 === 0) return; // the first stretch, before any cut, and every second one after it stay as they are
    const first = Math.ceil(secondsOf(part.from) / FACE_STEP_SECONDS - 1e-6);
    const last = Math.floor(secondsOf(part.to) / FACE_STEP_SECONDS - 1e-6);
    const seen = track.slice(first, last + 1).filter((point): point is SpeakerPoint => point?.seen === true);
    if (seen.length < Math.max(1, last - first + 1) * FACE_SHARE) return;
    const change = changes.find((each) => each.at === part.from);
    if (change?.kind === "removed") return;
    const [start, end] = change?.kind === "shortened" ? [Math.max(part.from, change.start), Math.min(part.to, change.end)] : [part.from, part.to];
    if (end <= start) return;
    made.push({ at: part.from, start: start as Flicks, end: end as Flicks, scale: PUNCH_IN,
      centre: { x: middle(seen.map((point) => point.x)), y: middle(seen.map((point) => point.y)) } });
  });
  return made;
}

/** The median: a moment's lean or a wrong detection never moves the zoom's centre. */
function middle(values: number[]): number {
  const sorted = [...values].sort((one, other) => one - other);
  return sorted[Math.floor(sorted.length / 2)]!;
}
