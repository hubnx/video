/** The window: its top bar (the name and icon; Feedback and Settings), the update notice, the start screen, then the
 * opened video. A Mac's menu items open the same dialogs (electron/menu.ts). */
import icon from "../../brand/icon.svg";
import { clipView } from "./clip-view.ts";
import { element, required } from "./dom.ts";
import { openFeedback } from "./feedback-view.ts";
import { openLicenses } from "./licenses-view.ts";
import { openSettings } from "./settings-view.ts";
import type { MenuCommand } from "./shared/app-api.ts";
import { startView } from "./start-view.ts";
import { updateNotice } from "./update-notice.ts";
import { words } from "./words.ts";

document.title = words.appName;
required<HTMLImageElement>("#app-icon").src = icon;
required("#app-name").textContent = words.appName;
required("#top-actions").append(
  element("button", { type: "button", textContent: words.topBar.feedback, onclick: () => openFeedback({ kind: "idea", failure: null }) }),
  element("button", { type: "button", textContent: words.topBar.settings, onclick: () => openSettings() }));
required("#notices").append(updateNotice());

const commands: Record<MenuCommand, () => void> = {
  settings: () => openSettings(),
  checkForUpdates: () => openSettings({ checkNow: true }),
  feedback: () => openFeedback({ kind: "problem", failure: null }),
  licenses: openLicenses,
};
window.video.onMenuCommand((command) => {
  // Another dialog open stays in front, unless it's the one asked for: the menu never stacks a dialog on the export.
  if (!document.querySelector("dialog[open]")) commands[command]();
});

const screen = required("#screen");
// A file dropped anywhere outside the drop area would otherwise be opened by Chromium as a page.
for (const kind of ["dragover", "drop"] as const) document.addEventListener(kind, (event) => event.preventDefault());

screen.replaceChildren(startView(({ clip, saved }) => screen.replaceChildren(clipView(clip, saved))));
