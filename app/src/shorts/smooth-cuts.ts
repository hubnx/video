/**
 * Smooth jump cuts (G17, docs/design/1.1-shorts.md): at each cut, the next stretch alternates between a gentle
 * punch-in about the speaker's face and the normal frame, so a cut reads as a second camera rather than a jump. A
 * stretch with no face in most of its frames isn't punched in, though the alternation still turns at its cut, so
 * in-and-out keeps its rhythm. Pure: the editor makes the zooms from these at Clean up, and the tests check the rule.
 */
import { FACE_STEP_SECONDS } from "../shared/faces.ts";
import type { Segment, Zoom } from "../shared/project.ts";
import { secondsOf } from "../shared/time.ts";
import type { SpeakerPoint } from "./track.ts";

/** About 108%: enough to read as a new angle, little enough that a 1080p picture stays sharp (Opus Clip's and
 * Descript's punch-ins sit at 105 to 115%). */
export const PUNCH_IN = 1.08;

/** A stretch is punched in only when the face is seen in at least this share of its samples. */
const FACE_SHARE = 0.5;

/** The zooms for `parts` (the kept stretches, joined where they touch, in order): every second stretch after a cut, about
 * the middle of where its face was seen. */
export function smoothCutZooms(parts: readonly Segment[], track: readonly (SpeakerPoint | null)[]): Zoom[] {
  const zooms: Zoom[] = [];
  parts.forEach((part, index) => {
    if (index % 2 === 0) return; // the first stretch, before any cut, and every second one after it stay as they are
    const first = Math.ceil(secondsOf(part.from) / FACE_STEP_SECONDS - 1e-6);
    const last = Math.floor(secondsOf(part.to) / FACE_STEP_SECONDS - 1e-6);
    const seen = track.slice(first, last + 1).filter((point): point is SpeakerPoint => point?.seen === true);
    const samples = Math.max(1, last - first + 1);
    if (seen.length < samples * FACE_SHARE) return;
    zooms.push({ start: part.from, end: part.to, scale: PUNCH_IN, centre: { x: middle(seen.map((point) => point.x)), y: middle(seen.map((point) => point.y)) } });
  });
  return zooms;
}

/** The median: a moment's lean or a wrong detection never moves the zoom's centre. */
function middle(values: number[]): number {
  const sorted = [...values].sort((one, other) => one - other);
  return sorted[Math.floor(sorted.length / 2)]!;
}
