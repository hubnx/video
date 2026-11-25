/**
 * The videos the person opened in this run, and where the app keeps what it makes from each. A clip's id comes from
 * its file's place, size and time changed, so the same file opened again finds its sound, proxy and edit copy already
 * made, and a changed file gets new ones. The window knows clips by id only; their paths stay here, and media:// serves
 * only these files.
 */
import { createHash } from "node:crypto";
import { realpath, stat } from "node:fs/promises";
import path from "node:path";
import type { JobKind } from "../src/shared/media.ts";

const MADE_FILE_NAMES: Record<JobKind, string> = { speech: "speech.wav", proxy: "proxy.mp4", editCopy: "edit-copy.mp4" };

export class Clips {
  private readonly originals = new Map<string, string>();
  private readonly folder: string;

  constructor(folder: string) {
    this.folder = folder;
  }

  /** Registers an opened file and returns its id. */
  async add(file: string): Promise<string> {
    const real = await realpath(file);
    const facts = await stat(real);
    const id = createHash("sha256").update(`${real}\n${facts.size}\n${facts.mtimeMs}`).digest("hex").slice(0, 20);
    this.originals.set(id, real);
    return id;
  }

  original(id: string): string {
    const file = this.originals.get(id);
    if (!file) throw new Error(`no clip opened with id ${id}`);
    return file;
  }

  /** Where a job's file for a clip goes: the clip's own folder in the app's data. */
  made(id: string, kind: JobKind): string {
    if (!/^[0-9a-f]{20}$/.test(id)) throw new Error(`not a clip id: ${id}`);
    return path.join(this.folder, id, MADE_FILE_NAMES[kind]);
  }

  /** Where the app keeps what it learned and what the person did with a clip: its transcript, where the voice detector
   * heard speech, and its project (the edit, autosaved). */
  stored(id: string, name: "transcript.json" | "voice.json" | "project.hubnxvideo"): string {
    if (!/^[0-9a-f]{20}$/.test(id)) throw new Error(`not a clip id: ${id}`);
    return path.join(this.folder, id, name);
  }

  /** The file media:// serves for a clip, or null for a name it doesn't serve or a clip not opened in this run. */
  served(id: string, file: string): string | null {
    if (!this.originals.has(id)) return null;
    if (file === "original") return this.original(id);
    if (file === "proxy" || file === "editCopy") return this.made(id, file);
    return null;
  }
}
