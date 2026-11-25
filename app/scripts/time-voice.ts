/**
 * How long voice clean-up takes a minute of sound on this computer, for the estimate on its switch
 * (src/shared/voice-speed.ts). The sound is made here, a voice-like tone in noise, since the cleaner's speed doesn't depend
 * on what's said; the model is downloaded and checked as the app does. Prints one line, `VOICE_SPEED {…}`. Runs here and
 * on GitHub's Apple-chip Mac, Windows and Ubuntu (`gh workflow run voice-speed.yml`); the quality check is
 * check-voice.ts.
 *
 *   pnpm exec node scripts/time-voice.ts
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import path from "node:path";
import { DPDFNET, downloadModels, modelFolder, modelsReady } from "../electron/models.ts";
import { denoiseFile, wavHeader } from "../electron/speech/denoise-file.ts";
import { modelThreads } from "../electron/speech/threads.ts";
import { appFolder } from "./start.ts";

const RATE = 48_000;
const SECONDS = 60;
const local = path.resolve(appFolder, "..", "local");
const folder = path.join(local, "voice-speed");
const models = path.join(local, "models");
rmSync(folder, { recursive: true, force: true });
mkdirSync(folder, { recursive: true });

// A rising and falling 140 Hz voice with its harmonics, in syllables, over steady noise.
const pcm = Buffer.alloc(RATE * SECONDS * 2);
let seed = 1;
for (let index = 0; index < RATE * SECONDS; index++) {
  const time = index / RATE;
  const pitch = 140 + 20 * Math.sin(2 * Math.PI * 0.5 * time);
  const syllable = Math.max(0, Math.sin(2 * Math.PI * 4 * time));
  let voice = 0;
  for (let harmonic = 1; harmonic <= 6; harmonic++) voice += Math.sin(2 * Math.PI * pitch * harmonic * time) / harmonic;
  seed = (seed * 1_103_515_245 + 12_345) % 2 ** 31;
  const noise = (seed / 2 ** 31 - 0.5) * 0.1;
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, 0.25 * voice * syllable + noise)) * 32767), index * 2);
}
const source = path.join(folder, "source.wav");
writeFileSync(source, Buffer.concat([wavHeader(pcm.length), pcm]));

if (!modelsReady(models, [DPDFNET])) await downloadModels(models, [DPDFNET], () => undefined, new AbortController().signal);
const threads = modelThreads();
const started = performance.now();
await denoiseFile({ source, output: path.join(folder, "cleaned.wav"), model: path.join(modelFolder(models, DPDFNET), "dpdfnet2_48khz_hr.onnx"), threads }, () => undefined);
const secondsPerMinute = (performance.now() - started) / 1000 / (SECONDS / 60);
console.log(`VOICE_SPEED ${JSON.stringify({ system: `${process.platform}-${process.arch}`, processor: cpus()[0]?.model, threads, secondsPerMinute: Math.round(secondsPerMinute * 10) / 10 })}`);
