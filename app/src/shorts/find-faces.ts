/**
 * The faces through a clip, found in the window in the background once its captions are made: a frame every quarter
 * second, decoded by the computer's own decoder and handed over upright and 320 px wide by Mediabunny, then looked over
 * by the face detector (face-finder.ts), a few milliseconds a frame.
 */
import { ALL_FORMATS, CanvasSink, Input, UrlSource } from "mediabunny";
import { FACE_DETECTOR, FACE_STEP_SECONDS, type ClipFaces, type FaceBox } from "../shared/faces.ts";
import { FaceFinder } from "./face-finder.ts";

/** Wide enough for a face a tenth of the picture's height (BlazeFace looks at 128 × 128), small enough to be quick. */
const WIDTH = 320;

/** Every sample's faces in the clip at `address`, `durationSeconds` long; `progress` hears how far it's got. */
export async function findFaces(address: string, durationSeconds: number, progress: (fraction: number) => void, signal: AbortSignal): Promise<ClipFaces> {
  const input = new Input({ source: new UrlSource(address), formats: ALL_FORMATS });
  let finder: FaceFinder | null = null;
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) throw new Error("FACES_NO_PICTURE");
    const height = Math.max(2, Math.round((WIDTH * track.displayHeight) / track.displayWidth));
    // Unflipped, as the compositor draws it (it turns a frame but never mirrors it), so a face is found where it's shown.
    const sink = new CanvasSink(track, { width: WIDTH, height, fit: "fill", flip: false });
    finder = await FaceFinder.open();
    const count = Math.floor(durationSeconds / FACE_STEP_SECONDS) + 1;
    // A hair past each moment, as frames.ts › at: a frame's own start never lands on the frame before it.
    const moments = Array.from({ length: count }, (_, index) => index * FACE_STEP_SECONDS + 1e-6);
    const samples: FaceBox[][] = [];
    for await (const shown of sink.canvasesAtTimestamps(moments)) {
      if (signal.aborted) throw new Error("FACES_CANCELLED");
      samples.push(shown ? finder.find(shown.canvas, WIDTH, height).map(rounded) : []);
      progress(samples.length / count);
      // A turn for the rest of the window every few frames: playing and editing never wait on the faces.
      if (samples.length % 8 === 0) await nextTurn();
    }
    return { detector: FACE_DETECTOR, samples };
  } finally {
    finder?.close();
    input.dispose();
  }
}

/** Four places: a ten-thousandth of the picture is under a pixel at 4K, and an hour's faces stay about a megabyte. */
function rounded(box: FaceBox): FaceBox {
  const round = (value: number) => Math.round(value * 10_000) / 10_000;
  return { x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height) };
}

/** Waits for the window's other work, by a message rather than a timer: Chromium slows timers to once a second in a
 * window it thinks hidden, as a check's is (preview/player.ts). */
function nextTurn(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve();
    channel.port2.postMessage(null);
  });
}
