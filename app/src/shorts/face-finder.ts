/**
 * Faces in a picture, found on the computer by MediaPipe's Face Detector (BlazeFace short-range, for faces within about
 * 2 m, which a talking video's are), its WASM and its model (~230 KB) shipped in the app: offline, on every system, no
 * native add-on (docs/design/1.1-shorts.md). CPU only: GPU delegates vary by driver, and GitHub's machines have none.
 *
 * MediaPipe's web build posts usage numbers (the system, the task, its timings) to Google every minute and has no switch
 * for it. Nothing about the person or their video is in them, but the app promises to send nothing it doesn't name, so
 * the window may not reach the web at all: its CSP allows connections only to media: and its own files, and the main
 * process refuses and logs any web request from it (electron/main.ts › window_request_blocked).
 */
import { FaceDetector } from "@mediapipe/tasks-vision";
import loaderAddress from "@mediapipe/tasks-vision/vision_wasm_internal.js?url";
import binaryAddress from "@mediapipe/tasks-vision/vision_wasm_internal.wasm?url";
import type { FaceBox } from "../shared/faces.ts";
import modelAddress from "./blaze-face-short-range.tflite?url";

export class FaceFinder {
  private readonly detector: FaceDetector;

  private constructor(detector: FaceDetector) {
    this.detector = detector;
  }

  static async open(): Promise<FaceFinder> {
    const model = new Uint8Array(await (await fetch(modelAddress)).arrayBuffer());
    const detector = await FaceDetector.createFromOptions({ wasmLoaderPath: loaderAddress, wasmBinaryPath: binaryAddress }, {
      baseOptions: { modelAssetBuffer: model, delegate: "CPU" },
      runningMode: "IMAGE",
      minDetectionConfidence: 0.5,
    });
    return new FaceFinder(detector);
  }

  /** The faces in `picture`, `width` × `height` pixels, as fractions of it. */
  find(picture: TexImageSource, width: number, height: number): FaceBox[] {
    return this.detector.detect(picture).detections.flatMap(({ boundingBox: box }) => box
      ? [{ x: box.originX / width, y: box.originY / height, width: box.width / width, height: box.height / height }]
      : []);
  }

  close(): void {
    this.detector.close();
  }
}
