/**
 * Reads a clip's speech sound (the 16 kHz mono WAV its speech job made) for the transcriber and the loudness levels
 * (src/shared/quiet.ts measures them).
 */
import { open } from "node:fs/promises";

/** Reads the speech WAV's samples (16-bit, mono, 16 kHz, as ffmpeg-jobs.ts › speechArguments writes it). */
export async function speechSamples(file: string): Promise<Int16Array> {
  const handle = await open(file);
  try {
    const bytes = await handle.readFile();
    const data = bytes.indexOf("data", 12, "latin1"); // the WAV's sample chunk, after FFmpeg's header
    if (data < 0) throw new Error("SPEECH_WAV_NO_DATA");
    const start = data + 8;
    return new Int16Array(bytes.buffer.slice(bytes.byteOffset + start, bytes.byteOffset + start + ((bytes.length - start) & ~1)));
  } finally {
    await handle.close();
  }
}
