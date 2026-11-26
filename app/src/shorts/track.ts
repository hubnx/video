/**
 * The speaker through a clip, from the faces found in each sample (shared/faces.ts). One speaker is the case, and the
 * largest face is the nearest. Once followed, a face is kept while a face overlaps where it was, so two people of about
 * the same size never swap places in the frame. Lost for under two seconds (a turned head, a hand over the face), it's
 * held where it was last seen; lost for longer, there's no speaker until a face is found again. Pure: the tests check
 * every rule.
 */
import { FACE_STEP_SECONDS, type FaceBox } from "../shared/faces.ts";

/** How long a lost face is held where it was last seen. */
export const HOLD_SECONDS = 2;

/** How much a face must overlap the one followed, as intersection over union, to be the same person a sample later:
 * a head moving at walking pace still overlaps itself by more than half from one quarter second to the next. */
const SAME_FACE_OVERLAP = 0.2;

/** The speaker's face at a sample: its centre and height, as fractions of the upright picture; `seen` is false while a
 * lost face is held. */
export interface SpeakerPoint {
  x: number;
  y: number;
  height: number;
  seen: boolean;
}

/** One point per sample: the speaker's face there, or null where there's no speaker. */
export function speakerTrack(samples: readonly (readonly FaceBox[])[]): (SpeakerPoint | null)[] {
  const track: (SpeakerPoint | null)[] = [];
  let followed: FaceBox | null = null;
  let lastSeen = 0;
  for (const [index, faces] of samples.entries()) {
    const held = followed !== null && (index - lastSeen) * FACE_STEP_SECONDS < HOLD_SECONDS;
    let next: FaceBox | null = followed ? closest(faces, followed) : null;
    // A new face is taken up only when nobody is followed or held: a stranger walking past never takes the frame.
    if (!next && !held) next = largest(faces);
    if (next) {
      followed = next;
      lastSeen = index;
      track.push(pointOf(next, true));
    } else if (held && followed) {
      track.push(pointOf(followed, false));
    } else {
      followed = null;
      track.push(null);
    }
  }
  return track;
}

function pointOf(box: FaceBox, seen: boolean): SpeakerPoint {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, height: box.height, seen };
}

function largest(faces: readonly FaceBox[]): FaceBox | null {
  let found: FaceBox | null = null;
  for (const face of faces) if (!found || face.width * face.height > found.width * found.height) found = face;
  return found;
}

/** The face that overlaps `followed` most, if it overlaps enough to be the same person. */
function closest(faces: readonly FaceBox[], followed: FaceBox): FaceBox | null {
  let found: FaceBox | null = null;
  let most = SAME_FACE_OVERLAP;
  for (const face of faces) {
    const overlap = intersectionOverUnion(face, followed);
    if (overlap > most) [found, most] = [face, overlap];
  }
  return found;
}

export function intersectionOverUnion(one: FaceBox, other: FaceBox): number {
  const width = Math.min(one.x + one.width, other.x + other.width) - Math.max(one.x, other.x);
  const height = Math.min(one.y + one.height, other.y + other.height) - Math.max(one.y, other.y);
  if (width <= 0 || height <= 0) return 0;
  const shared = width * height;
  return shared / (one.width * one.height + other.width * other.height - shared);
}
