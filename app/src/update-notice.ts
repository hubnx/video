/**
 * The strip under the top bar when a newer version is ready (it installs at quit, or now with Restart now) or found
 * out of this copy's reach (a Mac copy run from its disk image, a .deb's copy: get it from the website). Quiet while it
 * downloads: Settings says so. Never a dialog over the work.
 */
import { element } from "./dom.ts";
import { noteUpdate } from "./settings-view.ts";
import type { Update } from "./shared/app-api.ts";
import { words } from "./words.ts";

export function updateNotice(): HTMLElement {
  const text = element("p");
  const whatsNew = element("button", { type: "button", className: "quiet", textContent: words.update.whatsNew, onclick: () => void window.video.openReleaseNotes() });
  const action = element("button", { type: "button", className: "primary" });
  const dismiss = element("button", { type: "button", textContent: words.update.dismiss });
  const strip = element("div", { className: "notice", attributes: { role: "status" }, hidden: true },
    text, element("div", { className: "notice-actions" }, whatsNew, dismiss, action));
  let shown: Update | null = null;
  dismiss.addEventListener("click", () => (strip.hidden = true));
  action.addEventListener("click", async () => {
    if (shown?.state === "out_of_reach") {
      void window.video.openWebsite("download");
      return;
    }
    if (!(await window.video.installUpdate())) text.textContent = `${words.update.ready(shown!.version)} ${words.update.afterExport}`;
  });
  window.video.onUpdate((update) => {
    noteUpdate(update);
    shown = update;
    if (!update || update.state === "downloading") {
      strip.hidden = true;
      return;
    }
    text.textContent = update.state === "ready" ? words.update.ready(update.version) : words.update.outOfReach(update.version);
    action.textContent = update.state === "ready" ? words.update.restart : words.update.download;
    strip.hidden = false;
  });
  return strip;
}
