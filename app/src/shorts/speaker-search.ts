/**
 * The search for a clip's speaker: the faces kept with the clip from an earlier opening, or found once in the
 * background (find-faces.ts) and kept. It's started once the captions are made (most people open the app for those, and
 * both want the computer), or at once when a short asks for it. Everyone waiting hears each change: the Short switch's
 * words, the clean-up panel, an export of a short.
 */
import { logProblem } from "../problems.ts";
import type { ClipFaces } from "../shared/faces.ts";
import { findFaces } from "./find-faces.ts";

export type SearchState =
  | { state: "waiting" }
  | { state: "finding"; fraction: number }
  | { state: "found"; anyFace: boolean }
  | { state: "failed" };

export class SpeakerSearch {
  state: SearchState = { state: "waiting" };
  private readonly clipId: string;
  private readonly durationSeconds: number;
  private readonly address: Promise<string>;
  private readonly found: (faces: ClipFaces) => void;
  private readonly kept: Promise<ClipFaces | null>;
  private readonly listeners: (() => void)[] = [];
  private running: Promise<void> | null = null;

  /** `address`: the picture the faces are found in (the one the preview plays), once it's known; `found` takes the
   * faces, from the clip's store or from the search. */
  constructor(clipId: string, durationSeconds: number, address: Promise<string>, found: (faces: ClipFaces) => void) {
    this.clipId = clipId;
    this.durationSeconds = durationSeconds;
    this.address = address;
    this.found = found;
    // A clip opened before frames its short at once, from what's kept, without looking again.
    this.kept = window.video.faces(clipId).catch((error: unknown) => {
      logProblem("faces_unread", error);
      return null;
    });
    void this.kept.then((faces) => {
      if (faces) this.take(faces);
    });
  }

  /** Hears each change until the returned function is called. */
  onChange(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) this.listeners.splice(index, 1);
    };
  }

  /** Looks for the speaker, once however often it's asked; settles when the search has ended, found or not. */
  start(): Promise<void> {
    this.running ??= this.run();
    return this.running;
  }

  private async run(): Promise<void> {
    const kept = await this.kept;
    if (kept) return; // taken when it was read
    try {
      const address = await this.address;
      this.set({ state: "finding", fraction: 0 });
      const faces = await findFaces(address, this.durationSeconds, (fraction) => this.set({ state: "finding", fraction }), new AbortController().signal);
      await window.video.saveFaces(this.clipId, faces);
      this.take(faces);
    } catch (error) {
      logProblem("faces_failed", error);
      this.set({ state: "failed" }); // a short then sits in the middle, and smooth cuts stay off
    }
  }

  private take(faces: ClipFaces): void {
    this.state = { state: "found", anyFace: faces.samples.some((sample) => sample.length > 0) };
    this.found(faces);
    this.changed();
  }

  private set(state: SearchState): void {
    this.state = state;
    this.changed();
  }

  private changed(): void {
    for (const listener of [...this.listeners]) listener(); // a copy: a listener may stop listening
  }
}
