/**
 * Answers the window's requests for a video's files (media://): the whole file, or the byte range asked. Mediabunny
 * reads originals and proxies in pieces this way, never whole, so a 4K hour opens at once
 * (docs/research/engine-stack.md › 2). Songbrew's song:// answer, whose players taught that a range must be answered
 * as a range. No Electron here, so the tests run in plain Node.
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

const TYPES: Record<string, string> = { ".mp4": "video/mp4", ".m4v": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm", ".mkv": "video/x-matroska", ".wav": "audio/wav",
  // The face detector's (media://app, electron/main.ts): WebAssembly must be served as such to compile as it streams.
  ".wasm": "application/wasm", ".tflite": "application/octet-stream" };

export async function mediaResponse(file: string, range: string | null): Promise<Response> {
  const answer = await mediaAnswer(file, range);
  return new Response(answer.part ? body(file, answer.part) : null, { status: answer.status, headers: answer.headers });
}

/** What to answer for a file and the range asked: its status and headers, and the bytes to send (none for a range
 * outside the file). */
export async function mediaAnswer(file: string, range: string | null): Promise<{ status: 200 | 206 | 416; headers: Record<string, string>; part: { start: number; end: number } | null }> {
  const { size } = await stat(file);
  const headers = { "Accept-Ranges": "bytes", "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" };
  const asked = range === null ? null : byteRange(range, size);
  if (asked === "unsatisfiable") return { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` }, part: null };
  if (asked === null) return { status: 200, headers: { ...headers, "Content-Length": String(size) }, part: size > 0 ? { start: 0, end: size - 1 } : null };
  return { status: 206, headers: { ...headers, "Content-Length": String(asked.end - asked.start + 1), "Content-Range": `bytes ${asked.start}-${asked.end}/${size}` }, part: asked };
}

/** One range, as players ask: `bytes=start-end`, `bytes=start-` or `bytes=-suffix`; null for a header
 * this doesn't read, which gets the whole file, as the standard allows. */
export function byteRange(header: string, size: number): { start: number; end: number } | "unsatisfiable" | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2])) return null;
  if (!match[1]) { // the last N bytes
    const suffix = Number(match[2]);
    return suffix === 0 ? "unsatisfiable" : { start: Math.max(0, size - suffix), end: size - 1 };
  }
  const start = Number(match[1]);
  const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  return start >= size || start > end ? "unsatisfiable" : { start, end };
}

function body(file: string, range?: { start: number; end: number }): ReadableStream<Uint8Array> {
  return Readable.toWeb(createReadStream(file, range)) as ReadableStream<Uint8Array>;
}
