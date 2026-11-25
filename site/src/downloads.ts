/**
 * The download page's cards, one per system, linking the release's files by the names the packages are given
 * (app/scripts/release-files.ts), which the deploy uploads under /download/ and the live check confirms are served
 * before the site goes out (day 8). The version is the app's own.
 */
import { readFileSync } from "node:fs";
import { LINUX_DEB, RELEASE_FILES } from "../../app/scripts/release-files.ts";
import type { Target } from "../../app/electron/targets.ts";

export const VERSION: string = JSON.parse(readFileSync(new URL("../../app/package.json", import.meta.url), "utf8")).version;

interface Download {
  target: Target;
  system: "mac" | "windows" | "linux"; // what page.ts marks for the visitor's computer
  title: string;
  needs: string;
  also?: { file: string; label: string };
  firstOpen: string;
}

// Electron 45's own floor: macOS 13 (Ventura) and Windows 10 (app/node_modules/electron/README.md).
const DOWNLOADS: Download[] = [
  { target: "mac-arm64", system: "mac", title: "Mac with Apple chip", needs: "M1 or later, macOS 13 or later",
    firstOpen: "Signed by Hub Nexus and checked by Apple, so it opens like any other app." },
  { target: "mac-x64", system: "mac", title: "Mac with Intel chip", needs: "macOS 13 or later",
    firstOpen: "Signed by Hub Nexus and checked by Apple, so it opens like any other app." },
  { target: "win-x64", system: "windows", title: "Windows", needs: "Windows 10 or 11, 64-bit",
    firstOpen: `If Windows says it protected your PC, choose More info, then Run anyway (<a href="#windows">pictured below</a>).` },
  { target: "linux-x64", system: "linux", title: "Linux", needs: "64-bit, such as Ubuntu 22.04 or later",
    also: { file: LINUX_DEB(VERSION), label: "or the .deb, for Ubuntu and Debian" },
    firstOpen: "Allow the AppImage to run as a program, in its Properties, then open it." },
];

export function renderDownloads(): string {
  return DOWNLOADS.map((download) => {
    const file = RELEASE_FILES[download.target](VERSION);
    const also = download.also ? ` · <a href="/download/${download.also.file}" download>${download.also.label}</a>` : "";
    return `<section class="card download" data-system="${download.system}">
            <h2>${download.title}<span class="yours" hidden>This computer</span></h2>
            <p class="needs">${download.needs}</p>
            <a class="button" href="/download/${file}" download aria-label="Download for ${download.title}">Download</a>
            <p class="file">${file}${also}</p>
            <p class="first-open">${download.firstOpen}</p>
          </section>`;
  }).join("\n          ");
}

/** The Windows installer's name, as SmartScreen shows it. */
export const WINDOWS_INSTALLER = RELEASE_FILES["win-x64"](VERSION);
