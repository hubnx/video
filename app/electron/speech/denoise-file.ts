/**
 * Voice clean-up of one file: DPDFNet at 48 kHz through sherpa-onnx's streaming denoiser, a second of sound at a time,
 * read from the voice source and written straight to the clean WAV, so an hour is cleaned without holding it in memory.
 * Written beside the output and renamed into place when done, so a stopped run never leaves half a clean voice that
 * would play as whole. Run by the voice cleaner's utility process (denoise.ts) and by its check (scripts/check-voice.ts).
 */
import { open, rename, rm } from "node:fs/promises";
import sherpa from "sherpa-onnx-node";
import type { DenoiseRequest } from "./protocol.ts";

const RATE = 48_000;
const CHUNK_SAMPLES = RATE; // a second

/** Cleans `request.source` into `request.output`, a second at a time, telling `progress` how far it's got. */
export async function denoiseFile(request: DenoiseRequest, progress: (fraction: number) => void): Promise<void> {
  const denoiser = new sherpa.OnlineSpeechDenoiser({ model: { dpdfnet: { model: request.model }, numThreads: request.threads, provider: "cpu", debug: 0 } });
  if (denoiser.sampleRate !== RATE) throw new Error(`DENOISE_MODEL_RATE: ${denoiser.sampleRate}`);
  const source = await open(request.source);
  const writing = `${request.output}.writing`;
  const output = await open(writing, "w");
  try {
    const { dataStart, dataBytes } = await wavData(source);
    await output.write(wavHeader(0)); // its sizes filled in at the end
    let written = 0;
    const write = async (samples: Float32Array) => {
      const pcm = Buffer.alloc(samples.length * 2);
      samples.forEach((sample, index) => pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), index * 2));
      await output.write(pcm);
      written += pcm.length;
    };
    const chunk = Buffer.alloc(CHUNK_SAMPLES * 2);
    for (let at = 0; at < dataBytes; at += chunk.length) {
      const { bytesRead } = await source.read(chunk, 0, Math.min(chunk.length, dataBytes - at), dataStart + at);
      const samples = new Float32Array(bytesRead / 2);
      for (let index = 0; index < samples.length; index++) samples[index] = chunk.readInt16LE(index * 2) / 32768;
      await write(denoiser.run({ samples, sampleRate: RATE, enableExternalBuffer: false }).samples);
      progress(Math.min(1, (at + bytesRead) / dataBytes));
    }
    await write(denoiser.flush(false).samples);
    await output.write(wavHeader(written), 0, 44, 0);
  } finally {
    await source.close();
    await output.close();
  }
  await rename(writing, request.output).catch(async (error: unknown) => {
    await rm(writing, { force: true });
    throw error;
  });
}

/** Where a WAV's samples start and how many bytes they take: its "data" chunk, after FFmpeg's header. */
async function wavData(file: Awaited<ReturnType<typeof open>>): Promise<{ dataStart: number; dataBytes: number }> {
  const head = Buffer.alloc(4096);
  const { bytesRead } = await file.read(head, 0, head.length, 0);
  const data = head.subarray(0, bytesRead).indexOf("data", 12, "latin1");
  if (data < 0) throw new Error("VOICE_SOURCE_NO_DATA");
  const size = head.readUInt32LE(data + 4);
  const { size: fileSize } = await file.stat();
  return { dataStart: data + 8, dataBytes: Math.min(size === 0xffffffff || size === 0 ? fileSize : size, fileSize - data - 8) };
}

/** A 44-byte header for 16-bit mono 48 kHz PCM, `bytes` of samples after it. */
export function wavHeader(bytes: number): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "latin1");
  header.writeUInt32LE(36 + bytes, 4);
  header.write("WAVEfmt ", 8, "latin1");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36, "latin1");
  header.writeUInt32LE(bytes, 40);
  return header;
}
