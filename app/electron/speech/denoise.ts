/**
 * The voice cleaner, run as an Electron utility process (speech.ts starts it), below normal priority: denoise-file.ts
 * does the work, and this passes on how far it's got.
 */
import { setPriority } from "node:os";
import { denoiseFile } from "./denoise-file.ts";
import type { DenoiseEvent, DenoiseRequest } from "./protocol.ts";

const parent = process.parentPort;
const send = (event: DenoiseEvent) => parent.postMessage(event);

// One request a process; the main process ends this one once it's answered (speech.ts).
parent.once("message", async ({ data }) => {
  try {
    setPriority(0, 10); // below the window and the person's other work
    await denoiseFile(data as DenoiseRequest, (fraction) => send({ type: "progress", fraction }));
    send({ type: "done" });
  } catch (error) {
    send({ type: "failed", error: error instanceof Error ? error.message.split("\n")[0]!.slice(0, 200) : String(error) });
  }
});
