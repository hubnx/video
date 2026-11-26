/**
 * Where a short's 9:16 window sits across a landscape picture at each moment: its centre follows the speaker as a
 * camera operator would (docs/design/1.1-shorts.md › Camera path). The window doesn't move while the face stays in its
 * middle third. When the face leaves that, the window moves to centre it again, along a critically damped spring: no
 * overshoot, settled in about 0.6 s. A camera chasing every head movement is the first complaint about other apps'
 * auto-reframe. Each stretch of the edit starts with the window already on the speaker, as a new shot does, so a cut
 * never shows a pan catching up. With no speaker, the window eases back to the middle. Pure; derived again from the
 * faces whenever the edit changes, as it costs a few milliseconds for an hour.
 */
import { FACE_STEP_SECONDS } from "../shared/faces.ts";
import type { SpeakerPoint } from "./track.ts";

/** The path's own step: a frame at 30 a second, joined straight between, which no eye tells from smooth at these speeds. */
export const CAMERA_STEP_SECONDS = 1 / 30;

/** The spring's rate (ω): a critically damped spring is within 2% of where it's going after about 5.8 / ω seconds. */
const SETTLE_RATE = 10;

/** The window's centre across the picture (a fraction of its width) through each kept stretch of the clip. */
export interface CameraPath {
  stretches: { from: number; to: number; centres: Float32Array }[]; // seconds of the clip, in order
}

/** The path through `stretches` (the edit's kept stretches, seconds of the clip, in order), for a window `width` of the
 * picture's width wide. */
export function cameraPath(track: readonly (SpeakerPoint | null)[], stretches: readonly { from: number; to: number }[], width: number): CameraPath {
  const lowest = width / 2;
  const highest = 1 - width / 2;
  const inside = (centre: number) => Math.min(Math.max(centre, lowest), highest);
  const speakerAt = (seconds: number) => track[Math.min(track.length - 1, Math.floor(seconds / FACE_STEP_SECONDS + 1e-6))] ?? null;
  const decay = Math.exp(-SETTLE_RATE * CAMERA_STEP_SECONDS);
  return {
    stretches: stretches.map(({ from, to }) => {
      const steps = Math.max(1, Math.ceil((to - from) / CAMERA_STEP_SECONDS) + 1);
      const centres = new Float32Array(steps);
      const first = speakerAt(from);
      let at = inside(first ? first.x : 0.5);
      let speed = 0;
      let goal = at;
      for (let step = 0; step < steps; step++) {
        centres[step] = at;
        const speaker = speakerAt(from + step * CAMERA_STEP_SECONDS);
        if (!speaker) goal = inside(0.5);
        else if (Math.abs(speaker.x - at) > width / 6) goal = inside(speaker.x);
        // One step of the critically damped spring, solved exactly, so the step's size never makes it ring.
        const offset = at - goal;
        const pull = speed + SETTLE_RATE * offset;
        at = goal + (offset + pull * CAMERA_STEP_SECONDS) * decay;
        speed = (speed - SETTLE_RATE * pull * CAMERA_STEP_SECONDS) * decay;
      }
      return { from, to, centres };
    }),
  };
}

/** The window's centre at `seconds` of the clip; a moment outside every stretch (taken out) takes the nearest one's. */
export function cameraAt(path: CameraPath, seconds: number): number {
  const { stretches } = path;
  if (!stretches.length) return 0.5;
  let low = 0;
  let high = stretches.length - 1;
  while (low < high) {
    const middle = (low + high + 1) >> 1;
    if (stretches[middle]!.from <= seconds) low = middle;
    else high = middle - 1;
  }
  const stretch = stretches[low]!;
  const place = Math.min(Math.max(0, (seconds - stretch.from) / CAMERA_STEP_SECONDS), stretch.centres.length - 1);
  const before = Math.floor(place);
  const after = Math.min(before + 1, stretch.centres.length - 1);
  const share = place - before;
  return stretch.centres[before]! * (1 - share) + stretch.centres[after]! * share;
}
