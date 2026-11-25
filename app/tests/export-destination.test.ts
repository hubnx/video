/** Where an export goes (electron/export-destination.ts): beside the original, never over it or an earlier export. */
import path from "node:path";
import { expect, it } from "vitest";
import { captionsFileOf, destinationFromChoice, suggestedDestination, type Disk } from "../electron/export-destination.ts";

const disk = (existing: string[], readOnly: string[] = []): Disk => ({
  exists: (file) => existing.includes(file),
  writable: (folder) => !readOnly.includes(folder),
});
const clips = path.join("/", "Users", "a", "Desktop");
const movies = path.join("/", "Users", "a", "Movies");
const original = path.join(clips, "talk.mov");

it("goes beside the original as its name plus edited", () => {
  expect(suggestedDestination(original, movies, disk([original]))).toBe(path.join(clips, "talk edited.mp4"));
});

it("never takes an earlier export's name, or its captions file's", () => {
  expect(suggestedDestination(original, movies, disk([path.join(clips, "talk edited.mp4")]))).toBe(path.join(clips, "talk edited 2.mp4"));
  expect(suggestedDestination(original, movies, disk([path.join(clips, "talk edited.mp4"), path.join(clips, "talk edited 2.srt")])))
    .toBe(path.join(clips, "talk edited 3.mp4"));
});

it("goes to Movies when the original's folder can't be written", () => {
  expect(suggestedDestination(original, movies, disk([], [clips]))).toBe(path.join(movies, "talk edited.mp4"));
});

it("takes the person's pick, adding .mp4, but never the original itself", () => {
  expect(destinationFromChoice(path.join(movies, "final"), original, disk([]), "darwin")).toBe(path.join(movies, "final.mp4"));
  const mp4 = path.join(clips, "Talk.MP4");
  expect(destinationFromChoice(path.join(clips, "talk.mp4"), mp4, disk([mp4]), "darwin")).toBe(path.join(clips, "Talk edited.mp4"));
  expect(destinationFromChoice(path.join(clips, "talk.mp4"), mp4, disk([mp4]), "linux")).toBe(path.join(clips, "talk.mp4"));
});

it("puts the captions file beside the video", () => {
  expect(captionsFileOf(path.join(clips, "talk edited.mp4"))).toBe(path.join(clips, "talk edited.srt"));
});
