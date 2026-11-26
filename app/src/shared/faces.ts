/**
 * The faces found in a clip, a sample every quarter second (src/shorts/find-faces.ts), kept with the clip so they're
 * found once (electron/main.ts › saveFaces). Pure: shared by the window, which finds them, and the main process, which
 * stores them. Sample `i` is the frame showing at `i * FACE_STEP_SECONDS` of the clip, as the sound map's levels are
 * indexed by their own step.
 */

/** Four samples a second: a head turns in about a quarter second, and an hour's clip is 14,400 samples. */
export const FACE_STEP_SECONDS = 0.25;

/** Which detector found them: a stored file from another is found again rather than mixed with it. */
export const FACE_DETECTOR = "blaze-face-short-range-1";

/** A face's box, as fractions of the upright picture (0 to 1, from the top-left corner), as shown. */
export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ClipFaces {
  detector: typeof FACE_DETECTOR;
  /** The faces in each sample's frame, in sample order; an empty list where none was found. */
  samples: FaceBox[][];
}

/** A stored file, checked before it's trusted: null for one that isn't faces from this detector. */
export function facesFrom(saved: unknown): ClipFaces | null {
  const faces = saved as Partial<ClipFaces> | null;
  if (typeof faces !== "object" || faces === null || faces.detector !== FACE_DETECTOR || !Array.isArray(faces.samples)) return null;
  const isBox = (box: unknown) => typeof box === "object" && box !== null
    && (["x", "y", "width", "height"] as const).every((key) => Number.isFinite((box as Record<string, unknown>)[key]));
  return faces.samples.every((sample) => Array.isArray(sample) && sample.every(isBox)) ? (faces as ClipFaces) : null;
}
