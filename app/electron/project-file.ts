/**
 * Saving and opening a project file so that no crash, power cut or full disk can lose or half-write one: each save is
 * written whole beside the file, flushed to the disk, then renamed over it (a rename is all or nothing), and the last
 * save is kept as `.previous` in case the new one is somehow unreadable. Saves come about a second after each edit
 * (`Autosave`), so a crash loses at most that second: the guarantee docs/plan.md's recovery journal was for, without a
 * second file to replay.
 */
import { open, readFile, rename } from "node:fs/promises";
import { migrate, type Project } from "../src/shared/project.ts";
import { errorName, logError } from "./app-log.ts";

export async function saveProject(file: string, project: Project): Promise<void> {
  const writing = `${file}.writing`;
  const handle = await open(writing, "w");
  try {
    await handle.writeFile(JSON.stringify(project));
    await handle.sync(); // on the disk before the rename, or a power cut could leave the rename over an empty file
  } finally {
    await handle.close();
  }
  await rename(file, `${file}.previous`).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error; // the first save has no previous
  });
  await rename(writing, file);
}

/** The project in `file`, brought up to date; the previous save if the file is unreadable; null when neither exists. */
export async function openProject(file: string): Promise<Project | null> {
  for (const candidate of [file, `${file}.previous`]) {
    try {
      return migrate(JSON.parse(await readFile(candidate, "utf8")));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      // A newer release's project must not be overwritten by this one: refuse it loudly, never fall back.
      if (error instanceof Error && error.message === "PROJECT_FROM_A_NEWER_RELEASE") throw error;
      logError("project_unreadable", candidate === file ? "file" : "previous", errorName(error));
    }
  }
  return null;
}

/** Saves the latest state about a second after the last change, one save at a time, and at once on `flush` (quitting). */
export class Autosave {
  private pending: Project | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private saving: Promise<void> = Promise.resolve();
  private readonly file: string;
  private readonly delayMilliseconds: number;

  constructor(file: string, delayMilliseconds = 1000) {
    this.file = file;
    this.delayMilliseconds = delayMilliseconds;
  }

  changed(project: Project): void {
    this.pending = project;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), this.delayMilliseconds);
  }

  /** Saves what's pending now, after any save already under way. */
  flush(): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    const project = this.pending;
    this.pending = null;
    if (!project) return this.saving;
    this.saving = this.saving.catch(() => undefined).then(() => saveProject(this.file, project)).catch((error: unknown) => {
      logError("project_unsaved", errorName(error));
      throw error;
    });
    return this.saving;
  }
}
