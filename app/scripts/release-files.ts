/**
 * The packages' file names (scripts/package.ts), which the website links and the download counter counts: no spaces,
 * so their web addresses stay plain, and the version in each name, so every release's files are told apart
 * (docs/plan.md › Where it ships › Downloads).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Target } from "../electron/targets.ts";
import { APP_NAME } from "../src/shared/app-api.ts";

/** The names' first part: the app's name, its space a hyphen ("hubnx-Video"). */
export const STEM = APP_NAME.replaceAll(" ", "-");

/** What the installed program's file and folder are called where the system names them after it: no space, so no
 * path the app starts FFmpeg or a model from has one. Menus, shortcuts and the window say APP_NAME. */
export const INSTALLED_NAME = "hubnx-video";

/** Where the website serves every release, and where installed copies will look for a newer one. */
export const RELEASE_URL = "https://video.hubnx.com/download/";

/** What the website offers: the Intel Mac too, which Meta Edits leaves out (docs/product.md › Scoreboard). */
export const PUBLISHED: readonly Target[] = ["mac-arm64", "mac-x64", "win-x64", "linux-x64"];

/** What people download. */
export const RELEASE_FILES: Record<Target, (version: string) => string> = {
  "mac-arm64": (version) => `${STEM}-${version}-arm64.dmg`,
  "mac-x64": (version) => `${STEM}-${version}-x64.dmg`,
  "win-x64": (version) => `${STEM}-Setup-${version}.exe`,
  "linux-x64": (version) => `${STEM}-${version}-x86_64.AppImage`,
};

/** Linux's other download: a .deb, which the system's package manager installs and updates. */
export const LINUX_DEB = (version: string) => `${STEM}-${version}-amd64.deb`;

/** What installed copies update from, beside each download (electron-updater, electron/updates.ts): a Mac's update is a
 * zip, the format its updater reads; Windows' is the installer itself, and Linux's the AppImage. Each has a blockmap,
 * so an update downloads only what changed (the AppImage's is inside it), and a feed naming the newest version. */
export const UPDATE_FILES: Record<Target, (version: string) => { files: string[]; feed: string }> = {
  "mac-arm64": (version) => ({ files: [`${STEM}-${version}-arm64.zip`, `${STEM}-${version}-arm64.zip.blockmap`], feed: "latest-mac.yml" }),
  "mac-x64": (version) => ({ files: [`${STEM}-${version}-x64.zip`, `${STEM}-${version}-x64.zip.blockmap`], feed: "latest-mac.yml" }),
  "win-x64": (version) => ({ files: [`${RELEASE_FILES["win-x64"](version)}.blockmap`], feed: "latest.yml" }),
  "linux-x64": (version) => ({ files: [LINUX_DEB(version)], feed: "latest-linux.yml" }),
};

/**
 * The one latest-mac.yml both Macs read, from the two each build writes: electron-builder writes one per architecture,
 * and the second uploaded would replace the first, leaving one kind of Mac never updated. Both builds' files go in its
 * list, where each Mac's updater picks its own by name (an Apple chip the zip with "arm64" in it, an Intel Mac the
 * other); the rest is the Intel build's, which older updaters read. Text in, text out: the feed is electron-builder's
 * own plain YAML, its file entries the indented lines under `files:`.
 */
export function mergedMacFeed(intel: string, appleChip: string): string {
  const entries = (feed: string) => {
    const lines = feed.split("\n");
    const start = lines.indexOf("files:");
    if (start < 0) throw new Error("MAC_FEED_UNREADABLE: no files list");
    const end = lines.findIndex((line, index) => index > start && line !== "" && !line.startsWith(" "));
    return { lines, start, end: end < 0 ? lines.length : end };
  };
  const base = entries(intel);
  const other = entries(appleChip);
  const version = (feed: string) => /^version: (.+)$/m.exec(feed)?.[1];
  if (version(intel) !== version(appleChip)) throw new Error(`MAC_FEEDS_DIFFER: ${version(intel)} and ${version(appleChip)}`);
  return [...base.lines.slice(0, base.end), ...other.lines.slice(other.start + 1, other.end), ...base.lines.slice(base.end)].join("\n");
}

/** Where the merged Mac feed is written, beside the two builds' folders. */
export const MAC_FEED_FOLDER = "mac";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // What a release uploads, for the site's deploy (video/ops): the downloads and update files, then the feeds last, so
  // an installed copy never sees a version whose files aren't up yet. Writes the merged Mac feed first.
  const app = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const version = (JSON.parse(readFileSync(path.join(app, "package.json"), "utf8")) as { version: string }).version;
  const release = (folder: string, name: string) => path.join(app, "..", "local", "release", folder, name);
  const macFeed = release(MAC_FEED_FOLDER, "latest-mac.yml");
  mkdirSync(path.dirname(macFeed), { recursive: true });
  writeFileSync(macFeed, mergedMacFeed(readFileSync(release("mac-x64", "latest-mac.yml"), "utf8"), readFileSync(release("mac-arm64", "latest-mac.yml"), "utf8")));
  const files = PUBLISHED.flatMap((target) => [RELEASE_FILES[target](version), ...UPDATE_FILES[target](version).files].map((name) => release(target, name)));
  const feeds = [macFeed, release("win-x64", "latest.yml"), release("linux-x64", "latest-linux.yml")];
  console.log([...files.map((file) => `file ${file}`), ...feeds.map((feed) => `feed ${feed}`)].join("\n"));
}
