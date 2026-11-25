/**
 * Where an export goes unless the person changes it: beside the original as "<name> edited.mp4", or in the Videos
 * folder (Movies on a Mac) when the original's folder can't be written, such as a camera's card. Never over the
 * original or an earlier export, or its captions file: " 2", " 3" and on instead (gate 7, `video assistant`,
 * 2026-11-24). Pure, so the tests check every case without a disk.
 */
import path from "node:path";

export interface Disk {
  writable(folder: string): boolean;
  exists(file: string): boolean;
}

/** The first "<base> edited.mp4", "<base> edited 2.mp4"… in `folder` whose video and captions file are both free. */
export function freeName(folder: string, base: string, disk: Disk): string {
  for (let number = 1; ; number++) {
    const file = path.join(folder, `${base} edited${number === 1 ? "" : ` ${number}`}.mp4`);
    if (!disk.exists(file) && !disk.exists(captionsFileOf(file))) return file;
  }
}

export function suggestedDestination(original: string, videosFolder: string, disk: Disk): string {
  const base = path.basename(original, path.extname(original));
  const folder = path.dirname(original);
  return freeName(disk.writable(folder) ? folder : videosFolder, base, disk);
}

/** The person's pick from the save dialog, unless it's the original itself, which an export must never overwrite. */
export function destinationFromChoice(chosen: string, original: string, disk: Disk, platform: NodeJS.Platform): string {
  const withExtension = path.extname(chosen).toLowerCase() === ".mp4" ? chosen : `${chosen}.mp4`;
  // Macs and Windows usually ignore letter case in file names, so "Talk.MP4" is the same file as "talk.mp4".
  const key = (file: string) => (platform === "linux" ? path.resolve(file) : path.resolve(file).toLowerCase());
  if (key(withExtension) !== key(original)) return withExtension;
  return freeName(path.dirname(original), path.basename(original, path.extname(original)), disk);
}

/** An export's captions file, beside it. */
export function captionsFileOf(video: string): string {
  return video.replace(/\.[^./\\]+$/, "") + ".srt";
}
