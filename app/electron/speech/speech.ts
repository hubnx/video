/**
 * Starts the speech workers (transcribe.ts, denoise.ts), each in a utility process of its own for one clip, and passes on
 * what they find. A crash there ends that process alone, and is reported as a failure, never a frozen window.
 */
import { utilityProcess } from "electron";
import path from "node:path";
import type { Stretch } from "../../src/shared/cuts.ts";
import type { Word } from "../../src/shared/transcript.ts";
import { DPDFNET, modelFolder, PARAKEET_V3, SILERO_VAD } from "../models.ts";
import type { DenoiseEvent, DenoiseRequest, TranscribeEvent, TranscribeRequest } from "./protocol.ts";
import { modelThreads } from "./threads.ts";

export interface Heard {
  words: Word[];
  voice: Stretch[];
}

/** Runs one request in a worker until it says it's done or failed; `event` hears everything it says on the way. The
 * worker waits once it's said its last, and is ended here, so its exit never races its final message; ending before
 * that (a crash, or the system ending it) is a failure, whatever its code. `signal` stops it. */
function runWorker<Event extends { type: string }>(program: string, serviceName: string, request: object, event: (said: Event) => void, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = utilityProcess.fork(program, [], { serviceName });
    let settled = false;
    const finish = (error: Error | null) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", stop);
      if (error) reject(error);
      else resolve();
    };
    const stop = () => {
      child.kill();
      finish(new Error("SPEECH_WORKER_STOPPED"));
    };
    signal.addEventListener("abort", stop);
    child.on("message", (said: Event & { error?: string }) => {
      event(said);
      if (said.type === "done" || said.type === "failed") child.kill();
      if (said.type === "done") finish(null);
      if (said.type === "failed") finish(new Error(`SPEECH_WORKER_FAILED: ${said.error ?? ""}`));
    });
    child.on("exit", (code) => finish(new Error(`SPEECH_WORKER_EXITED: ${code}`)));
    child.postMessage(request);
  });
}

/** Transcribes `wav`, calling `heard` with each stretch's words as they come; resolves with all of them. */
export async function transcribe(programs: string, wav: string, modelsFolder: string, heard: (words: Word[], fraction: number) => void, signal: AbortSignal): Promise<Heard> {
  const parakeet = modelFolder(modelsFolder, PARAKEET_V3);
  const request: TranscribeRequest = {
    wav,
    parakeet: { encoder: path.join(parakeet, "encoder.int8.onnx"), decoder: path.join(parakeet, "decoder.int8.onnx"),
      joiner: path.join(parakeet, "joiner.int8.onnx"), tokens: path.join(parakeet, "tokens.txt") },
    vad: path.join(modelFolder(modelsFolder, SILERO_VAD), "silero_vad.onnx"),
    threads: modelThreads(),
  };
  const found: Heard = { words: [], voice: [] };
  await runWorker<TranscribeEvent>(path.join(programs, "transcribe.cjs"), "hubnx Video transcriber", request, (said) => {
    if (said.type === "voice") found.voice = said.stretches;
    if (said.type === "words") {
      found.words.push(...said.words);
      heard(said.words, said.fraction);
    }
  }, signal);
  return found;
}

/** Cleans the voice of `source` (48 kHz mono) into `output`, calling `progress` as it goes. */
export function cleanVoice(programs: string, source: string, output: string, modelsFolder: string, progress: (fraction: number) => void, signal: AbortSignal): Promise<void> {
  const request: DenoiseRequest = { source, output, model: path.join(modelFolder(modelsFolder, DPDFNET), "dpdfnet2_48khz_hr.onnx"), threads: modelThreads() };
  return runWorker<DenoiseEvent>(path.join(programs, "denoise.cjs"), "hubnx Video voice cleaner", request, (said) => {
    if (said.type === "progress") progress(said.fraction);
  }, signal);
}
