/**
 * Whether voice clean-up earns its switch (docs/plan.md › Release 1: "voice clean-up as one switch if it fits"): a
 * minute of the filler check's AMI headset speech (CC BY 4.0, local only) with pink noise and a mains hum mixed in, cleaned
 * by the app's own code (electron/speech/denoise-file.ts, DPDFNet at 48 kHz), then measured against the clean speech:
 *   - the noise left in the pauses (where the original speech is quiet), before and after, in dB;
 *   - the speech's own level, before and after (it mustn't be eaten);
 *   - the time it takes an audio minute on this computer.
 * The mixed and cleaned files and the numbers go to video/local/voice-check/ (replaced each run). Needs a full FFmpeg to
 * mix (TEST_FFMPEG or `ffmpeg`) and the DPDFNet model in local/models (the app downloads it, or the check does).
 *
 *   pnpm exec node scripts/check-voice.ts
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import path from "node:path";
import { denoiseFile } from "../electron/speech/denoise-file.ts";
import { DPDFNET, downloadModels, modelFolder, modelsReady } from "../electron/models.ts";
import { speechSamples } from "../electron/quiet.ts";
import { modelThreads } from "../electron/speech/threads.ts";
import { appFolder } from "./start.ts";

const local = path.resolve(appFolder, "..", "local");
const folder = path.join(local, "voice-check");
const maker = process.env.TEST_FFMPEG ?? "ffmpeg";
const speech = path.join(local, "filler-check", "subset", "ES2004c-C-420.wav");
const RATE = 48_000;
const WINDOW = RATE / 50; // 20 ms

rmSync(folder, { recursive: true, force: true });
mkdirSync(folder, { recursive: true });
const clean = path.join(folder, "speech.wav");
const noisy = path.join(folder, "noisy.wav");
const cleaned = path.join(folder, "cleaned.wav");
const ff = (...args: string[]) => execFileSync(maker, ["-hide_banner", "-loglevel", "error", "-y", ...args]);
ff("-t", "60", "-i", speech, "-ac", "1", "-ar", String(RATE), "-c:a", "pcm_s16le", clean);
// Pink noise at -38 dBFS and a 60 Hz hum with its harmonics, as a laptop fan and a ground loop give a home recording.
ff("-i", clean, "-f", "lavfi", "-t", "60", "-i", `anoisesrc=color=pink:amplitude=0.02:sample_rate=${RATE}`,
  "-f", "lavfi", "-t", "60", "-i", `aevalsrc='0.01*sin(2*PI*60*t)+0.006*sin(2*PI*120*t)+0.004*sin(2*PI*180*t)':s=${RATE}`,
  "-filter_complex", "[0][1][2]amix=inputs=3:normalize=0", "-ac", "1", "-ar", String(RATE), "-c:a", "pcm_s16le", noisy);

if (!modelsReady(path.join(local, "models"), [DPDFNET])) await downloadModels(path.join(local, "models"), [DPDFNET], () => undefined, new AbortController().signal);
const threads = modelThreads();
const started = Date.now();
await denoiseFile({ source: noisy, output: cleaned, model: path.join(modelFolder(path.join(local, "models"), DPDFNET), "dpdfnet2_48khz_hr.onnx"), threads }, () => undefined);
const secondsPerMinute = (Date.now() - started) / 1000;

/** Each 20 ms window's loudness in dB. */
const levels = (samples: Int16Array) => Array.from({ length: Math.floor(samples.length / WINDOW) }, (_, index) => {
  let sum = 0;
  for (let at = index * WINDOW; at < (index + 1) * WINDOW; at++) sum += (samples[at]! / 32768) ** 2;
  return 10 * Math.log10(sum / WINDOW + 1e-12);
});
const reference = levels(await speechSamples(clean));
const before = levels(await speechSamples(noisy));
const after = levels(await speechSamples(cleaned));
// Pauses: where the original speech is 40 dB under its loudest tenth; speech: its loudest tenth.
const sorted = [...reference].sort((one, other) => one - other);
const loud = sorted[Math.floor(sorted.length * 0.9)]!;
const pauses = reference.map((level, index) => (level < loud - 40 ? index : -1)).filter((index) => index >= 0);
const spoken = reference.map((level, index) => (level >= loud - 6 ? index : -1)).filter((index) => index >= 0);
/** The average power of `levels` over `windows`, in dB. */
const mean = (values: number[], windows: number[]) => 10 * Math.log10(windows.reduce((sum, index) => sum + 10 ** ((values[index] ?? -120) / 10), 0) / windows.length);
const results = {
  measured: new Date().toISOString(),
  computer: `${cpus()[0]?.model}, ${threads} threads`,
  pauseWindows: pauses.length,
  speechWindows: spoken.length,
  noiseInPausesDb: { before: Math.round(mean(before, pauses) * 10) / 10, after: Math.round(mean(after, pauses) * 10) / 10 },
  speechLevelDb: { original: Math.round(mean(reference, spoken) * 10) / 10, noisy: Math.round(mean(before, spoken) * 10) / 10, cleaned: Math.round(mean(after, spoken) * 10) / 10 },
  secondsPerAudioMinute: Math.round(secondsPerMinute * 10) / 10,
};
writeFileSync(path.join(folder, "results.json"), `${JSON.stringify(results, null, 1)}\n`);
console.log(JSON.stringify(results, null, 1));
const noiseDrop = results.noiseInPausesDb.before - results.noiseInPausesDb.after;
const speechChange = Math.abs(results.speechLevelDb.cleaned - results.speechLevelDb.original);
console.log(`noise in the pauses down ${noiseDrop.toFixed(1)} dB; speech within ${speechChange.toFixed(1)} dB of the original`);
if (noiseDrop < 15 || speechChange > 3) {
  console.error("VOICE_CHECK_FAILED: the clean-up must take the noise down 15 dB or more and keep speech within 3 dB");
  process.exit(1);
}
