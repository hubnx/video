/**
 * The AI models the app runs on the computer, downloaded the first time a feature needs them (their size said first),
 * each file from a pinned revision and accepted only at its pinned SHA-256, so what runs is exactly what was measured
 * (docs/plan.md › Risks: the filler and silence checks). A download cut short resumes where it stopped.
 */
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { mkdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable, Transform } from "node:stream";

interface ModelFile {
  name: string;
  url: string;
  bytes: number;
  sha256: string;
}

export interface Model {
  id: string;
  /** Its licence, for the open-source licences page: every model here allows commercial use. */
  licence: string;
  files: ModelFile[];
}

const PARAKEET = "https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8/resolve/ed5d745623472f97cfc2e6c2916ee248798fc5a8";

/** Speech to text for 25 European languages, NVIDIA's Parakeet TDT 0.6B v3 in sherpa-onnx's int8 form: 3.8 s an audio
 * minute on 8 processor threads, and it hears "um" (the filler check, 2026-11-21). */
export const PARAKEET_V3: Model = {
  id: "parakeet-tdt-0.6b-v3-int8",
  licence: "CC-BY-4.0",
  files: [
    { name: "encoder.int8.onnx", url: `${PARAKEET}/encoder.int8.onnx`, bytes: 652_282_294, sha256: "1afbe69c1ffdabee94755f42e4daf1d93549131a3da11356bda84fcef0f2c479" },
    { name: "decoder.int8.onnx", url: `${PARAKEET}/decoder.int8.onnx`, bytes: 11_845_274, sha256: "0222a86147299d4dee90edf95b6d13827edb42ad8b7c9cf0b2582f030937c0b5" },
    { name: "joiner.int8.onnx", url: `${PARAKEET}/joiner.int8.onnx`, bytes: 6_355_277, sha256: "cbd02f3696e9944970111fb439d9c3fd365a80374565f13f2b9c7007d253fc98" },
    { name: "tokens.txt", url: `${PARAKEET}/tokens.txt`, bytes: 93_939, sha256: "d58544679ea4bc6ac563d1f545eb7d474bd6cfa467f0a6e2c1dc1c7d37e3c35d" },
  ],
};

/** Voice clean-up, Ceva's DPDFNet-2 at 48 kHz (Apache-2.0, code and weights: github.com/ceva-ip/DPDFNet, its Hugging Face
 * card), in sherpa-onnx's ONNX form: 10.6 MB, streaming, so an hour is cleaned without holding it in memory. */
export const DPDFNET: Model = {
  id: "dpdfnet2-48khz-hr",
  licence: "Apache-2.0",
  files: [{ name: "dpdfnet2_48khz_hr.onnx", url: "https://github.com/k2-fsa/sherpa-onnx/releases/download/speech-enhancement-models/dpdfnet2_48khz_hr.onnx",
    bytes: 10_596_848, sha256: "0b399f8a58dc4d70d8cd97541f5c39869406145193b957d00a03b66070944928" }],
};

/** Silero's voice detector, v6.2.3: what the silence check measured (sherpa-onnx's own copy is a different build). */
export const SILERO_VAD: Model = {
  id: "silero-vad-6.2.3",
  licence: "MIT",
  files: [{ name: "silero_vad.onnx", url: "https://github.com/snakers4/silero-vad/raw/v6.2.3/src/silero_vad/data/silero_vad.onnx", bytes: 2_327_524,
    sha256: "1a153a22f4509e292a94e67d6f9b85e8deb25b4988682b7e174c65279d8788e3" }],
};

export function modelBytes(models: readonly Model[]): number {
  return models.reduce((sum, model) => sum + model.files.reduce((files, file) => files + file.bytes, 0), 0);
}

export function modelFolder(modelsFolder: string, model: Model): string {
  return path.join(modelsFolder, model.id);
}

/** Whether every file of the models is in place (checked once each, when it was downloaded). */
export function modelsReady(modelsFolder: string, models: readonly Model[]): boolean {
  return models.every((model) => model.files.every((file) => existsSync(path.join(modelFolder(modelsFolder, model), file.name))));
}

/** Downloads what's missing of the models, reporting the bytes done of all of them. A file is renamed into place only
 * once its SHA-256 matches; a mismatch removes it and throws, and the next try starts it again. */
export async function downloadModels(modelsFolder: string, models: readonly Model[], progress: (done: number, total: number) => void, signal: AbortSignal): Promise<void> {
  const total = modelBytes(models);
  let finished = 0;
  for (const model of models) {
    const folder = modelFolder(modelsFolder, model);
    await mkdir(folder, { recursive: true });
    for (const file of model.files) {
      const target = path.join(folder, file.name);
      if (existsSync(target)) {
        finished += file.bytes;
        progress(finished, total);
        continue;
      }
      const partial = `${target}.partial`;
      const hash = createHash("sha256");
      // Resume: what's already there counts, and is hashed first.
      let have = existsSync(partial) ? (await stat(partial)).size : 0;
      if (have > file.bytes) {
        await rm(partial);
        have = 0;
      }
      if (have) await pipeline(createReadStream(partial), new Transform({ transform(chunk, _encoding, done) { hash.update(chunk); done(); } }));
      if (have < file.bytes) {
        const response = await fetch(file.url, { headers: have ? { Range: `bytes=${have}-` } : {}, signal, redirect: "follow" });
        if (!response.ok || !response.body) throw new Error(`MODEL_DOWNLOAD_REFUSED: ${response.status} for ${file.name}`);
        // A server that ignores the range sends the whole file: start the file again.
        if (have && response.status !== 206) {
          await rm(partial);
          have = 0;
          hash.destroy();
          return downloadModels(modelsFolder, models, progress, signal);
        }
        let received = 0;
        const counting = new Transform({
          transform(chunk: Buffer, _encoding, done) {
            hash.update(chunk);
            received += chunk.length;
            progress(finished + have + received, total);
            done(null, chunk);
          },
        });
        await pipeline(Readable.fromWeb(response.body as never), counting, createWriteStream(partial, { flags: have ? "a" : "w" }), { signal });
      }
      const sha256 = hash.digest("hex");
      if (sha256 !== file.sha256) {
        await rm(partial, { force: true });
        throw new Error(`MODEL_MISMATCH: ${file.name} has SHA-256 ${sha256}, pinned ${file.sha256}`);
      }
      await rename(partial, target);
      finished += file.bytes;
      progress(finished, total);
    }
  }
}
