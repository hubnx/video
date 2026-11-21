/**
 * Starts the transcriber (transcribe.ts) in a utility process of its own for one clip's speech sound, and passes on
 * what it finds. A crash there ends that process alone, and is reported as a failure, never a frozen window.
 */
import { utilityProcess } from "electron";
import { availableParallelism } from "node:os";
import path from "node:path";
import type { Stretch } from "../../src/shared/cuts.ts";
import type { Word } from "../../src/shared/transcript.ts";
import { modelFolder, PARAKEET_V3, SILERO_VAD } from "../models.ts";
import type { TranscribeEvent, TranscribeRequest } from "./protocol.ts";

export interface Heard {
  words: Word[];
  voice: Stretch[];
}

/** Processor threads for the recogniser: all but one, at most 8 (the filler check's speed was measured at 8). */
export function recogniserThreads(): number {
  return Math.max(1, Math.min(8, availableParallelism() - 1));
}

/** Transcribes `wav`, calling `heard` with each stretch's words as they come; resolves with all of them. `signal`
 * stops it. */
export function transcribe(program: string, wav: string, modelsFolder: string, heard: (words: Word[], fraction: number) => void, signal: AbortSignal): Promise<Heard> {
  const parakeet = modelFolder(modelsFolder, PARAKEET_V3);
  const request: TranscribeRequest = {
    wav,
    parakeet: { encoder: path.join(parakeet, "encoder.int8.onnx"), decoder: path.join(parakeet, "decoder.int8.onnx"),
      joiner: path.join(parakeet, "joiner.int8.onnx"), tokens: path.join(parakeet, "tokens.txt") },
    vad: path.join(modelFolder(modelsFolder, SILERO_VAD), "silero_vad.onnx"),
    threads: recogniserThreads(),
  };
  return new Promise((resolve, reject) => {
    const child = utilityProcess.fork(program, [], { serviceName: "hubnx Video transcriber" });
    const found: Heard = { words: [], voice: [] };
    let settled = false;
    const finish = (error: Error | null) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", stop);
      if (error) reject(error);
      else resolve(found);
    };
    const stop = () => {
      child.kill();
      finish(new Error("TRANSCRIBE_STOPPED"));
    };
    signal.addEventListener("abort", stop);
    child.on("message", (event: TranscribeEvent) => {
      if (event.type === "voice") found.voice = event.stretches;
      if (event.type === "words") {
        found.words.push(...event.words);
        heard(event.words, event.fraction);
      }
      // The transcriber waits once it's said its last; ended here, so its exit never races its final message.
      if (event.type === "done" || event.type === "failed") child.kill();
      if (event.type === "done") finish(null);
      if (event.type === "failed") finish(new Error(`TRANSCRIBE_FAILED: ${event.error}`));
    });
    // Ending before its last word (a crash, or the system ending it) is a failure, whatever its code.
    child.on("exit", (code) => finish(new Error(`TRANSCRIBER_EXITED: ${code}`)));
    child.postMessage(request);
  });
}
