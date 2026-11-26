/**
 * What the compositor shows at each moment of the clip: the whole picture, or a short's 9:16 window following the
 * speaker, either one punched in where the edit has a zoom. Made again from the editor's state whenever it changes
 * (the camera path costs a few milliseconds for an hour); the preview and the export ask it for every frame, so both
 * frame alike.
 */
import { WHOLE, type View } from "../preview/compositor.ts";
import type { Segment, Zoom } from "../shared/project.ts";
import { secondsOf } from "../shared/time.ts";
import { cameraAt, cameraPath } from "./camera.ts";
import type { SpeakerPoint } from "./track.ts";
import { shortsView, shortsWidth, zoomedView } from "./view.ts";

/** The view at a moment, in seconds of the clip. */
export type Framing = (seconds: number) => View;

export interface FramingFacts {
  /** The picture's size as shown upright, in square pixels. */
  picture: { width: number; height: number };
  shorts: boolean;
  /** The speaker through the clip (track.ts), or null while their face is still being found: a short then sits in the
   * middle. */
  speaker: readonly (SpeakerPoint | null)[] | null;
  /** The kept stretches, joined where they touch (edit/timeline.ts › joinedSegments): each starts a new shot. */
  parts: readonly Segment[];
  zooms: readonly Zoom[];
}

/** The framing, or null for the whole picture throughout, as release 1 drew it. */
export function framing(facts: FramingFacts): Framing | null {
  const { picture, shorts, speaker, parts } = facts;
  if (!shorts && !facts.zooms.length) return null;
  const width = shortsWidth(picture.width, picture.height);
  const path = shorts && speaker && width < 1
    ? cameraPath(speaker, parts.map((part) => ({ from: secondsOf(part.from), to: secondsOf(part.to) })), width)
    : null;
  const zooms = facts.zooms.map((zoom) => ({ ...zoom, from: secondsOf(zoom.start), to: secondsOf(zoom.end) }));
  return (seconds) => {
    const base = shorts ? shortsView(picture.width, picture.height, path ? cameraAt(path, seconds) : 0.5) : WHOLE;
    const zoom = zooms.find((each) => seconds >= each.from && seconds < each.to);
    return zoom ? zoomedView(base, zoom.centre, zoom.scale) : base;
  };
}
