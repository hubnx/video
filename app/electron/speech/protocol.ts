/** The messages between the main process and the speech workers (transcribe.ts, denoise.ts), each run in a utility
 * process of its own so a crash or a long run never stalls the window. */
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

export interface DenoiseRequest {
  source: string; // the clip's sound at 48 kHz mono (ffmpeg-jobs.ts › voiceSourceArguments)
  output: string; // where the clean voice goes, written beside it first and renamed into place when done
  model: string;
  threads: number;
}

export type DenoiseEvent = { type: "progress"; fraction: number } | { type: "done" } | { type: "failed"; error: string };
