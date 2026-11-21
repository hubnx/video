/**
 * Packages the app into video/local/release/<target>: `pnpm package mac-arm64` (the .dmg for Apple chips), `mac-x64`
 * (Intel Macs), `win-x64` (the installer) or `linux-x64` (an AppImage and a .deb), each carrying its pinned FFmpeg
 * (scripts/fetch-ffmpeg.ts). Run `pnpm build` first. All four build on this Mac.
 *
 * `--signed` signs the Mac builds with HubNX's Developer ID and notarizes them, as a release must, so macOS opens them
 * with no warning (hubnx docs/operations.md › Apple); without it they're unsigned, for the checks on this Mac.
 * Windows still warns about a new app: it has no certificate (docs/plan.md › Where it ships › Windows).
 */
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { Arch, build, Platform } from "electron-builder";
import { TARGETS, type Target } from "../electron/targets.ts";
import { APP_ID, APP_NAME, WEBSITE_PAGES } from "../src/shared/app-api.ts";
import { fetchFfmpeg } from "./fetch-ffmpeg.ts";
import { INSTALLED_NAME, LINUX_DEB, RELEASE_FILES } from "./release-files.ts";
import { appFolder } from "./start.ts";

const local = path.resolve(appFolder, "..", "local");
// HubNX's Developer ID certificate in this Mac's keychain, and the App Store Connect key that notarizes (neither ID is
// a secret; the key file is: hubnx docs/operations.md › Apple). Shared with Songbrew, the same company's.
const APPLE = {
  identity: "HubNX, Inc. (HK389YH5KK)",
  apiKey: path.join(homedir(), ".appstoreconnect", "private_keys", "AuthKey_D7CYG6GV99.p8"),
  apiKeyId: "D7CYG6GV99",
  apiIssuer: "1406f232-2ba0-4ad9-97ea-c6181f48c887",
};

export interface PackageOptions {
  signed: boolean;
  /** package.json's unless given. */
  version?: string;
}

/** Builds one target's packages and returns the folder they're in. */
export async function packageApp(target: Target, options: PackageOptions): Promise<string> {
  const version = options.version ?? (JSON.parse(readFileSync(path.join(appFolder, "package.json"), "utf8")) as { version: string }).version;
  const output = path.join(local, "release", target);
  const ffmpeg = await fetchFfmpeg(target);
  const mac = target.startsWith("mac");
  const signedMac = mac && options.signed;
  if (signedMac) Object.assign(process.env, { APPLE_API_KEY: APPLE.apiKey, APPLE_API_KEY_ID: APPLE.apiKeyId, APPLE_API_ISSUER: APPLE.apiIssuer });
  const download = RELEASE_FILES[target](version);

  rmSync(output, { recursive: true, force: true }); // each run replaces its own folder: old and new never mix
  await build({
    publish: "never",
    targets: (mac ? Platform.MAC : target.startsWith("linux") ? Platform.LINUX : Platform.WINDOWS)
      .createTarget(null, target.endsWith("arm64") ? Arch.arm64 : Arch.x64),
    config: {
      appId: APP_ID,
      productName: target.startsWith("linux") ? INSTALLED_NAME : APP_NAME,
      copyright: "HubNX, Inc.",
      // homepage: a .deb must name one. desktopName: what Linux desktops match the running window to its launcher by.
      extraMetadata: { version, homepage: WEBSITE_PAGES.home, desktopName: `${INSTALLED_NAME}.desktop` },
      directories: { output, buildResources: "build-resources" },
      files: ["dist/**", "package.json"],
      // FFmpeg as its own programs beside the app, never inside the archive: the app runs them, and GPL's text and
      // their build's sources list travel with them (../ffmpeg/build.sh).
      extraResources: [{ from: ffmpeg, to: "bin", filter: ["ffmpeg", "ffprobe", "ffmpeg.exe", "ffprobe.exe", "COPYING.GPLv3", "BUILD.txt"] }],
      mac: {
        target: ["dmg"],
        artifactName: download,
        category: "public.app-category.video",
        identity: signedMac ? APPLE.identity : null,
        hardenedRuntime: signedMac,
        notarize: signedMac,
      },
      dmg: { sign: signedMac, writeUpdateInfo: false },
      win: { target: "nsis", executableName: INSTALLED_NAME },
      nsis: { oneClick: true, perMachine: false, artifactName: download },
      linux: {
        target: ["AppImage", "deb"],
        category: "AudioVideo",
        executableName: INSTALLED_NAME,
        desktop: { entry: { Name: APP_NAME } },
        syncDesktopName: true,
        maintainer: "Hub Nexus <video@hubnx.com>",
        synopsis: "A free video editor that cleans up talking-head videos",
        description: `${APP_NAME} makes captions, cuts silences and cleans up the voice, on your own computer. Free, no account.`,
      },
      appImage: { artifactName: download },
      // The AppImage project's static runtime: it opens without libfuse2, which Ubuntu 22.04 and later don't install.
      toolsets: { appimage: "1.0.3" },
      // electron-builder's own list, plus the two libraries Electron links that it leaves out: ALSA's sound library,
      // without which the app can't start on a bare Ubuntu 24.04, and GBM (Songbrew's Linux check, 2026-11-11).
      deb: {
        artifactName: LINUX_DEB(version),
        packageCategory: "video",
        depends: ["libgtk-3-0", "libnotify4", "libnss3", "libxss1", "libxtst6", "xdg-utils", "libatspi2.0-0", "libuuid1",
          "libsecret-1-0", "libasound2t64 | libasound2", "libgbm1"],
      },
    },
  });
  // electron-builder notarizes the app inside; the disk image people download is notarized too, and Apple's ticket
  // stapled to it, so macOS can check it even offline.
  if (signedMac) {
    const image = path.join(output, download);
    execFileSync("xcrun", ["notarytool", "submit", image, "--key", APPLE.apiKey, "--key-id", APPLE.apiKeyId, "--issuer", APPLE.apiIssuer, "--wait"], { stdio: "inherit" });
    execFileSync("xcrun", ["stapler", "staple", image], { stdio: "inherit" });
  }
  return output;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { signed: { type: "boolean", default: false } } });
  const target = positionals[0] as Target;
  if (!TARGETS.includes(target)) throw new Error(`pnpm package ${TARGETS.join(" | ")} [--signed]`);
  console.log(`Packaged: ${await packageApp(target, { signed: values.signed })}`);
}
