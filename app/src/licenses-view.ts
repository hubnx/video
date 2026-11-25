/**
 * The open-source licenses, in the app and offline (Settings › Open-source licenses; Help › Open-source Licenses on a
 * Mac): the list made at build time from what the app ships (scripts/app-notices.ts), whose text is escaped as it's
 * made. Its "Source" links open in the browser, and only those (electron/licenses.ts).
 */
import { dialogShell } from "./dialog.ts";
import { element } from "./dom.ts";
import { logProblem } from "./problems.ts";
import { words } from "./words.ts";

let made: { open: () => void } | null = null;

export function openLicenses(): void {
  made ??= makeLicenses();
  made.open();
}

function makeLicenses() {
  const { dialog, heading } = dialogShell("licenses", "licenses");
  heading.textContent = words.licenses.heading;
  const list = element("div", { className: "licenses-list" });
  const chromium = element("button", { type: "button", className: "quiet", textContent: words.licenses.chromium, hidden: true,
    onclick: () => void window.video.openChromiumNotices().catch((error: unknown) => logProblem("chromium_notices_unopened", error)) });
  dialog.append(element("p", { textContent: words.licenses.intro }), chromium, list,
    element("div", { className: "dialog-buttons" }, element("button", { type: "button", textContent: words.licenses.close, onclick: () => dialog.close() })));
  // A link in the list goes to the browser, never into the window.
  list.addEventListener("click", (event) => {
    const link = (event.target as Element).closest("a");
    if (!link) return;
    event.preventDefault();
    void window.video.openLicenseSource(link.href).catch((error: unknown) => logProblem("license_source_unopened", error));
  });
  let loaded = false;
  return {
    open() {
      dialog.showModal();
      if (loaded) return;
      void window.video.licenses().then(({ html, chromium: shipped }) => {
        list.innerHTML = html; // the app's own build output, its every text escaped (@hubnx/web-parts › licenses)
        chromium.hidden = !shipped;
        loaded = true;
      }, (error: unknown) => logProblem("licenses_unread", error));
    },
  };
}
