/**
 * The download page's cards, one per system, linking the release's files by the names the packages are given
 * (app/scripts/release-files.ts), which the deploy uploads under /download/ and the live check confirms are served
 * before the site goes out (day 8). The version is the app's own.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { LINUX_DEB, RELEASE_FILES } from "../../app/scripts/release-files.ts";
import type { Target } from "../../app/electron/targets.ts";

export const VERSION: string = JSON.parse(readFileSync(new URL("../../app/package.json", import.meta.url), "utf8")).version;

interface Download {
  target: Target; // page.ts marks the visitor's own, when the browser says which it is (src/visitor.ts)
  title: string;
  needs: string;
  also?: { file: string; label: string };
  firstOpen: string;
}

// Electron 45's own floor: macOS 13 (Ventura) and Windows 10 (app/node_modules/electron/README.md).
const DOWNLOADS: Download[] = [
  { target: "mac-arm64", title: "Mac with Apple chip", needs: "M1 or later, macOS 13 or later",
    firstOpen: "Signed by Hub Nexus and checked by Apple, so it opens like any other app." },
  { target: "mac-x64", title: "Mac with Intel chip", needs: "macOS 13 or later",
    firstOpen: "Signed by Hub Nexus and checked by Apple, so it opens like any other app." },
  { target: "win-x64", title: "Windows", needs: "Windows 10 or 11, 64-bit",
    firstOpen: `If Windows says it protected your PC, choose More info, then Run anyway (<a href="#windows">pictured below</a>).` },
  { target: "linux-x64", title: "Linux", needs: "64-bit, such as Ubuntu 22.04 or later",
    also: { file: LINUX_DEB(VERSION), label: "or the .deb, for Ubuntu and Debian" },
    firstOpen: "Allow the AppImage to run as a program, in its Properties, then open it." },
];

/** A package's size as the card says it ("160 MB"), read from the release built on this Mac (app/scripts/package.ts),
 * which a release's deploy uploads; nothing when the site is built without it, as a pages-only deploy is. */
function sizeOf(target: Target, file: string): string {
  const built = new URL(`../../local/release/${target}/${file}`, import.meta.url);
  return existsSync(built) ? ` · ${Math.round(statSync(built).size / 1_000_000)} MB` : "";
}

export function renderDownloads(): string {
  return DOWNLOADS.map((download) => {
    const file = RELEASE_FILES[download.target](VERSION);
    const also = download.also ? ` · <a href="/download/${download.also.file}" download>${download.also.label}</a>${sizeOf(download.target, download.also.file)}` : "";
    return `<section class="card download" data-target="${download.target}">
            <h2>${download.title}<span class="yours" hidden>This computer</span></h2>
            <p class="needs">${download.needs}</p>
            <a class="button" href="/download/${file}" download aria-label="Download for ${download.title}">Download</a>
            <p class="file">${file}${sizeOf(download.target, file)}${also}</p>
            <p class="first-open">${download.firstOpen}</p>
          </section>`;
  }).join("\n          ");
}

/** The home page's main button: the download page, until page.ts knows the visitor's system and makes it fetch that
 * system's file (each system's file and words in `data-download`, written here so page.ts names no file itself). */
export function renderHeroDownload(): string {
  const label: Record<Target, string> = { "mac-arm64": "Download for Mac", "mac-x64": "Download for Mac", "win-x64": "Download for Windows", "linux-x64": "Download for Linux" };
  const files = Object.fromEntries(DOWNLOADS.map((download) => [download.target, { href: `/download/${RELEASE_FILES[download.target](VERSION)}`, label: label[download.target] }]));
  return `<a class="button button-primary" href="/download/" data-download='${JSON.stringify(files)}'>Download for free</a>
          <span class="muted" data-download-systems>Mac, Windows and Linux</span>
          <a href="/download/" data-download-others hidden>Other systems</a>`;
}

/** The Windows installer's name, as SmartScreen shows it. */
export const WINDOWS_INSTALLER = RELEASE_FILES["win-x64"](VERSION);
