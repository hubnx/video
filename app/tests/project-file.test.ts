/**
 * The project file (electron/project-file.ts, src/shared/project.ts): never lost, never half-written, and a project
 * from a newer release refused rather than overwritten (docs/plan.md › The promise › Never lose work).
 */
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { Autosave, openProject, saveProject } from "../electron/project-file.ts";
import { PROJECT_FORMAT, PROJECT_VERSION, type Project } from "../src/shared/project.ts";
import { emptyEdit, split } from "../src/edit/timeline.ts";
import { flicksOf } from "../src/shared/time.ts";

let folder: string;
let file: string;
beforeEach(async () => {
  folder = await mkdtemp(path.join(tmpdir(), "project-"));
  file = path.join(folder, "talk.hubnxvideo");
});
afterEach(async () => {
  await rm(folder, { recursive: true, force: true });
});

/** A project told apart by where its one split is. */
function project(seconds: number): Project {
  const edit = emptyEdit();
  split(edit, flicksOf(seconds));
  return { format: PROJECT_FORMAT, version: PROJECT_VERSION, clips: [], edit };
}

it("saves and opens a project as it was", async () => {
  await saveProject(file, project(10));
  expect(await openProject(file)).toEqual(project(10));
  expect(existsSync(`${file}.writing`)).toBe(false);
});

it("keeps the last save, and opens it when the file is unreadable", async () => {
  await saveProject(file, project(10));
  await saveProject(file, project(20));
  await writeFile(file, "{ half a fi"); // what a write cut short would leave, were it written in place
  expect(await openProject(file)).toEqual(project(10));
});

it("opens nothing where nothing was saved", async () => {
  expect(await openProject(file)).toBeNull();
});

it("refuses a project from a newer release rather than open it as something else", async () => {
  await writeFile(file, JSON.stringify({ ...project(10), version: PROJECT_VERSION + 1 }));
  await expect(openProject(file)).rejects.toThrow("PROJECT_FROM_A_NEWER_RELEASE");
});

it("saves about a second after the last of many quick changes, once, with the latest state", async () => {
  const autosave = new Autosave(file, 50);
  for (let seconds = 1; seconds <= 20; seconds++) autosave.changed(project(seconds));
  expect(existsSync(file)).toBe(false);
  await new Promise((resolve) => setTimeout(resolve, 120));
  await autosave.flush();
  expect(JSON.parse(await readFile(file, "utf8"))).toEqual(project(20));
  expect(existsSync(`${file}.previous`)).toBe(false); // one save, not twenty
});
