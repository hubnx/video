/**
 * The transcriber, run as an Electron utility process (speech.ts starts it): Silero finds where there's speech, and
 * Parakeet v3 hears each stretch of it, through sherpa-onnx's Node add-on. The words go back a stretch at a time, so
 * the transcript fills in while it runs. The settings are the filler check's, which were measured
 * (local/filler-check/scripts/run_parakeet_vad.py): stretches of at most 20 s, padded 0.2 s each side.
 */
import { setPriority } from "node:os";
import { speechSamples } from "../quiet.ts";
import { flicksOf } from "../../src/shared/time.ts";
import type { Stretch } from "../../src/shared/cuts.ts";
import type { TranscribeEvent, TranscribeRequest } from "./protocol.ts";
import { wordsOf } from "./words.ts";

// A native add-on, loaded at run time from node_modules and never bundled (electron/vite.config.ts); its types are ours
// (sherpa-onnx-node.d.ts), for the few calls made here.
import sherpa from "sherpa-onnx-node";

const RATE = 16_000;
const PAD_SECONDS = 0.2;

const parent = process.parentPort;
const send = (event: TranscribeEvent) => parent.postMessage(event);

// One request a process; once it's answered, the main process ends this one (speech.ts), so the last message is never
// lost to an exit racing it.
parent.once("message", async ({ data }) => {
  try {
    await transcribe(data as TranscribeRequest);
    send({ type: "done" });
  } catch (error) {
    send({ type: "failed", error: error instanceof Error ? error.message.split("\n")[0]!.slice(0, 200) : String(error) });
  }
});

async function transcribe(request: TranscribeRequest): Promise<void> {
  setPriority(0, 10); // below the window and the person's other work; Windows maps it to below normal
  // Read here, not by the add-on's readWave: its samples live in memory the add-on owns, which Electron refuses
  // ("External buffers are not allowed", the transcript check, 2026-11-21). The WAV is 16 kHz mono (speechArguments).
  const pcm = await speechSamples(request.wav);
  const samples = Float32Array.from(pcm, (sample) => sample / 32768);
  // Two passes of Silero: fine (0.1 s of silence ends speech) for the silence cuts, and the recogniser's stretches.
  send({ type: "voice", stretches: speech(samples, request.vad, { minSilenceDuration: 0.1, minSpeechDuration: 0.1 }) });
  const stretches = speech(samples, request.vad, { minSilenceDuration: 0.5, minSpeechDuration: 0.25 });
  const recognizer = new sherpa.OfflineRecognizer({
    featConfig: { sampleRate: RATE, featureDim: 80 },
    modelConfig: { transducer: { encoder: request.parakeet.encoder, decoder: request.parakeet.decoder, joiner: request.parakeet.joiner },
      tokens: request.parakeet.tokens, numThreads: request.threads, provider: "cpu", debug: 0, modelType: "nemo_transducer" },
  });
  const seconds = samples.length / RATE;
  for (const stretch of stretches) {
    const from = Math.max(0, stretch.startSeconds - PAD_SECONDS);
    const to = Math.min(seconds, stretch.endSeconds + PAD_SECONDS);
    const stream = recognizer.createStream();
    stream.acceptWaveform({ samples: samples.subarray(Math.floor(from * RATE), Math.ceil(to * RATE)), sampleRate: RATE });
    recognizer.decode(stream);
    const result = recognizer.getResult(stream);
    const words = wordsOf({ tokens: result.tokens, timestamps: result.timestamps, durations: result.durations ?? [] }, from);
    send({ type: "words", words, fraction: Math.min(1, to / seconds) });
  }
}

/** Silero's speech stretches over the whole sound, in seconds and as flicks. */
function speech(samples: Float32Array, model: string, settings: { minSilenceDuration: number; minSpeechDuration: number }): (Stretch & { startSeconds: number; endSeconds: number })[] {
  const vad = new sherpa.Vad({ sileroVad: { model, threshold: 0.5, ...settings, maxSpeechDuration: 20, windowSize: 512 }, sampleRate: RATE, numThreads: 1, debug: 0 }, 60);
  const found: (Stretch & { startSeconds: number; endSeconds: number })[] = [];
  const take = () => {
    while (!vad.isEmpty()) {
      const segment = vad.front(false);
      const startSeconds = segment.start / RATE;
      const endSeconds = (segment.start + segment.samples.length) / RATE;
      found.push({ start: flicksOf(startSeconds), end: flicksOf(endSeconds), startSeconds, endSeconds });
      vad.pop();
    }
  };
  for (let at = 0; at < samples.length; at += 512) {
    vad.acceptWaveform(samples.subarray(at, at + 512));
    take();
  }
  vad.flush();
  take();
  return found;
}
