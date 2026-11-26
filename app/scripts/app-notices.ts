/**
 * The one list of open-source notices for everything the app ships, made at the end of `pnpm build` from what's shipped
 * (../../../docs/brand.md › Every app site carries), by the shared builder (@hubnx/web-parts › electron-notices):
 * - the packages each Vite build reads (the window, the main process, the preload, the two speech workers), the
 *   packages electron-builder packs (package.json's dependencies, with theirs), Electron and Chromium;
 * - what no bundle shows: FFmpeg, with x264 and zimg inside it, and GPL's offer of their sources; ONNX Runtime inside
 *   sherpa-onnx; the face detector's model the app carries and the three models it downloads; and the app itself, under
 *   the AGPL-3.0.
 * Written to dist/licenses-list.html, which the in-app view shows (electron/licenses.ts) and the website's /licenses/
 * page carries (site/vite.config.ts). A package under a copyleft license with no decision below stops the build, so
 * none ships unseen.
 *
 *   node scripts/app-notices.ts   (after the Vite builds; `pnpm build` runs it)
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runnerImport } from "vite";
import { DPDFNET, PARAKEET_V3, SILERO_VAD } from "../electron/models.ts";
import { APP_NAME, WEBSITE_PAGES } from "../src/shared/app-api.ts";

type ElectronNotices = typeof import("@hubnx/web-parts/electron-notices");
type Licenses = typeof import("@hubnx/web-parts/licenses");
// The shared parts are TypeScript in node_modules, which Node won't run: Vite's runner compiles them (their README).
const { module: notices } = await runnerImport<ElectronNotices>("@hubnx/web-parts/electron-notices");
const { module: licenses } = await runnerImport<Licenses>("@hubnx/web-parts/licenses");

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts: string[]) => readFileSync(path.join(app, "build-resources", "notices", ...parts), "utf8").trim();

/** The Vite builds, each writing its packages to dist/notices/<build>.json (vite.config.ts, electron/vite.config.ts). */
export const NOTICE_BUILDS = ["window", "main", "preload", "transcribe", "denoise"] as const;

/** Why each package that isn't permissive may still ship: written decisions only. */
const DECISIONS = {
  mediabunny: "MPL-2.0, which applies file by file: its files ship unchanged inside the window's bundle",
};

// sherpa-onnx's packages, one per system, declare Apache-2.0 and carry no license file: the repository's, found there.
const SHERPA = read("npm", "sherpa-onnx.txt");
const AT_SOURCE = {
  "lazy-val": read("npm", "lazy-val.txt"), // electron-updater's, which ships none
  "sherpa-onnx-node": SHERPA,
  ...Object.fromEntries(["darwin-arm64", "darwin-x64", "linux-arm64", "linux-x64", "win-arm64", "win-x64", "win-ia32"].map((system) => [`sherpa-onnx-${system}`, SHERPA])),
};

const { version: ffmpegVersion, release: ffmpegRelease } = JSON.parse(readFileSync(path.join(app, "..", "ffmpeg", "builds.json"), "utf8")) as { version: string; release: string };
const ffmpegSources = `${WEBSITE_PAGES.source}/releases/tag/${ffmpegRelease}`;

const modelNotice = (name: string, license: string, source: string, text: string) => ({ name, license, source, text });

const first = [
  { name: APP_NAME, license: "AGPL-3.0-only", source: WEBSITE_PAGES.source,
    text: `${APP_NAME} is free software: you can redistribute it and change it under the GNU Affero General Public License, version 3, as published by the Free Software Foundation. Its source code is at ${WEBSITE_PAGES.source}.\n\n${readFileSync(path.join(app, "..", "LICENSE"), "utf8").trim()}` },
];

const extras = [
  { name: `FFmpeg ${ffmpegVersion}, with x264 and zimg`, license: "GPL-3.0-or-later", source: ffmpegSources,
    text: `FFmpeg runs as its own two programs beside the app (ffmpeg and ffprobe), built from unchanged sources with x264 and zimg by the app's ffmpeg/build.sh, under the GNU General Public License, version 3 or later. Their complete sources, exactly as built into this release, and the script that builds them, are at ${ffmpegSources}, free of charge, for as long as this release is offered. Each copy of the app also carries the license (COPYING.GPLv3) and the list of sources (BUILD.txt) beside the programs.\n\n${read("ffmpeg", "COPYING.GPLv3")}` },
  { name: "x264, inside FFmpeg", license: "GPL-2.0-or-later", source: "https://code.videolan.org/videolan/x264", text: read("ffmpeg", "x264.COPYING") },
  { name: "zimg, inside FFmpeg", license: "WTFPL", source: "https://github.com/sekrit-twc/zimg", text: read("ffmpeg", "zimg.COPYING") },
  // Each system's own engine package (pnpm keeps them out of node_modules' top level, so the builder can't list them).
  { name: "sherpa-onnx's engine for each system (sherpa-onnx-darwin-arm64, -darwin-x64, -win-x64, -linux-x64)", license: "Apache-2.0", source: "https://github.com/k2-fsa/sherpa-onnx", text: SHERPA },
  { name: "ONNX Runtime, inside sherpa-onnx", license: "MIT", source: "https://github.com/microsoft/onnxruntime", text: read("onnxruntime", "LICENSE") },
  modelNotice(`NVIDIA Parakeet TDT 0.6B v3, downloaded at first use (${PARAKEET_V3.id})`, PARAKEET_V3.licence, "https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3",
    "The speech model, NVIDIA's Parakeet TDT 0.6B v3 (https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3), as converted to ONNX and quantized to int8 for sherpa-onnx by its maintainers (https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8), under the Creative Commons Attribution 4.0 International License (https://creativecommons.org/licenses/by/4.0/). Changed by the converter: converted to ONNX and quantized to int8. Not changed by us."),
  modelNotice("MediaPipe BlazeFace (short range), the face detector shorts follow the speaker with, in the app", "Apache-2.0",
    "https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector", read("models", "blaze-face-short-range.LICENSE")),
  modelNotice(`Silero VAD, downloaded at first use (${SILERO_VAD.id})`, SILERO_VAD.licence, "https://github.com/snakers4/silero-vad", read("models", "silero-vad.LICENSE")),
  modelNotice(`DPDFNet-2, downloaded when the voice is first cleaned (${DPDFNET.id})`, DPDFNET.licence, "https://github.com/ceva-ip/DPDFNet",
    `Ceva's DPDFNet-2 speech enhancement model, in sherpa-onnx's ONNX form, under the Apache License 2.0:\n\n${read("models", "dpdfnet.LICENSE")}`),
];

export function appNoticesList(): string {
  const found = notices.electronAppNotices({
    appFolder: app,
    folder: path.join(app, "dist", "notices"),
    builds: NOTICE_BUILDS,
    atSource: AT_SOURCE,
    decisions: DECISIONS,
    chromiumNoticesUrl: `${WEBSITE_PAGES.home}licenses/chromium.html`,
  });
  return licenses.renderLicenses(found.packages, [...found.extras, ...extras], first);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const list = appNoticesList();
  writeFileSync(path.join(app, "dist", "licenses-list.html"), list);
  console.log(`licenses: ${(list.match(/<li/g) ?? []).length} entries → dist/licenses-list.html`);
}
