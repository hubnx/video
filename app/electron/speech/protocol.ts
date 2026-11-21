/** The messages between the main process and the transcriber (transcribe.ts), which runs in a utility process of its
 * own so a crash or a long run never stalls the window. */
import type { Stretch } from "../../src/shared/cuts.ts";
import type { Word } from "../../src/shared/transcript.ts";

export interface TranscribeRequest {
  wav: string; // the clip's speech sound: 16 kHz mono (ffmpeg-jobs.ts › speechArguments)
  parakeet: { encoder: string; decoder: string; joiner: string; tokens: string };
  vad: string;
  threads: number;
}

export type TranscribeEvent =
  /** Where Silero hears speech, for the silence cuts (src/shared/cuts.ts › withoutSpeech). */
  | { type: "voice"; stretches: Stretch[] }
  /** The words of the next stretch, in order, and how far through the clip it is. */
  | { type: "words"; words: Word[]; fraction: number }
  | { type: "done" }
  | { type: "failed"; error: string };
