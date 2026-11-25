/**
 * The in-app open-source licenses view's main-process side (src/licenses-view.ts; Settings › Open-source licenses, and
 * Help › Open-source Licenses on a Mac): the list made at build time (scripts/app-notices.ts), offline, in every copy.
 * Chromium's notices are too long for the list; they ship whole beside the app, and the view opens that file.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { app, shell } from "electron";

/** The source links the view was given: the only addresses openSource opens, so the window can't open others. */
const shownSources = new Set<string>();

export function licensesShown(): { html: string; chromium: boolean } {
  const html = readFileSync(path.join(app.getAppPath(), "dist", "licenses-list.html"), "utf8");
  shownSources.clear();
  for (const match of html.matchAll(/<a href="([^"]+)"/g)) shownSources.add(unescaped(match[1]!));
  return { html, chromium: chromiumNotices() !== null };
}

/** A list's "Source" link, opened in the browser: only one the view was given, and only on the web. */
export async function openSource(url: string): Promise<void> {
  if (!shownSources.has(url) || !/^https?:\/\//.test(url)) throw new Error("license_source_not_shown");
  await shell.openExternal(url);
}

/** Chromium's notices, as Electron ships them beside the app: in Resources on a Mac, beside the program elsewhere,
 * and in Electron's own folder when run from the repo. */
function chromiumNotices(): string | null {
  const name = "LICENSES.chromium.html";
  const folders = [process.resourcesPath, path.dirname(process.execPath), path.join(app.getAppPath(), "node_modules", "electron", "dist")];
  return folders.map((folder) => path.join(folder, name)).find((file) => existsSync(file)) ?? null;
}

export async function openChromiumNotices(): Promise<void> {
  const file = chromiumNotices();
  if (!file) throw new Error("chromium_notices_missing");
  const failure = await shell.openPath(file);
  if (failure) throw new Error(`chromium_notices_not_opened: ${failure}`);
}

function unescaped(html: string): string {
  return html.replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
}
