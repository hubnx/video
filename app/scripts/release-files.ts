/**
 * The packages' file names (scripts/package.ts), which the website links and the download counter counts: no spaces,
 * so their web addresses stay plain, and the version in each name, so every release's files are told apart
 * (docs/plan.md › Where it ships › Downloads).
 */
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
