/**
 * Settings (the top bar's button; Settings… in the Mac's app menu): the version and updates, the day-7 check-in's
 * switch with exactly what it sends, and help: feedback, the open-source licenses, privacy and terms.
 */
import { dialogShell } from "./dialog.ts";
import { element } from "./dom.ts";
import { openFeedback } from "./feedback-view.ts";
import { openLicenses } from "./licenses-view.ts";
import type { CheckInState, Update, UpdateCheck } from "./shared/app-api.ts";
import { words } from "./words.ts";

let made: ReturnType<typeof makeSettings> | null = null;

/** Opens Settings; `checkNow` also checks for updates at once (the Mac menu's Check for Updates…). */
export function openSettings(options: { checkNow: boolean } = { checkNow: false }): void {
  made ??= makeSettings();
  made.open(options.checkNow);
}

/** What Settings says of an update found while it's closed, so it's right when it opens. */
let latestUpdate: Update | null = null;
export function noteUpdate(update: Update | null): void {
  latestUpdate = update;
  made?.showUpdate();
}

function makeSettings() {
  const { dialog, heading } = dialogShell("settings", "settings");
  heading.textContent = words.settings.heading;
  const section = (title: string, ...children: HTMLElement[]) => element("section", { className: "settings-part" }, element("h3", { textContent: title }), ...children);

  const about = element("p");
  const updateStatus = element("p", { className: "muted", attributes: { role: "status" } });
  const check = element("button", { type: "button", textContent: words.settings.check });
  const updates = section(words.settings.updates, about, element("div", { className: "settings-row" }, check), updateStatus);
  const showUpdate = (result?: UpdateCheck) => {
    const update = latestUpdate;
    if (update) updateStatus.textContent = update.state === "downloading" ? words.settings.downloading(update.version)
      : update.state === "ready" ? words.settings.ready(update.version) : words.settings.outOfReach(update.version);
    else updateStatus.textContent = result && result.found !== "update" ? words.settings.found[result.found] : "";
  };
  const checkNow = async () => {
    check.disabled = true;
    updateStatus.textContent = words.settings.checking;
    const result = await window.video.checkForUpdates().catch((): UpdateCheck => ({ found: "unreachable" }));
    if (result.found === "update") latestUpdate = result.update;
    check.disabled = false;
    showUpdate(result);
  };
  check.addEventListener("click", () => void checkNow());

  const checkInSwitch = element("input", { type: "checkbox" });
  const numbers = element("ul", { className: "check-in-numbers" });
  const checkInStatus = element("p", { className: "muted" });
  const showCheckIn = (state: CheckInState) => {
    checkInSwitch.checked = state.answer === "yes";
    checkInSwitch.disabled = state.sentAt !== null;
    numbers.replaceChildren(...words.checkIn.numbers(state.counts).map((line) => element("li", { textContent: line })));
    checkInStatus.textContent = state.sentAt ? words.settings.sent(day(state.sentAt)) : words.settings.goesOn(day(state.dueAt));
  };
  checkInSwitch.addEventListener("change", () => void window.video.answerCheckIn(checkInSwitch.checked ? "yes" : "no").then(showCheckIn));
  const checkIn = section(words.settings.checkIn,
    element("label", { className: "check" }, checkInSwitch, element("span", { textContent: words.settings.checkInSwitch })),
    numbers, element("p", { className: "muted", textContent: words.checkIn.nothingElse }), checkInStatus);

  const link = (text: string, action: () => void) => element("button", { type: "button", className: "quiet", textContent: text, onclick: action });
  const help = section(words.settings.help, element("div", { className: "settings-row" },
    element("button", { type: "button", textContent: words.settings.feedback, onclick: () => openFeedback({ kind: "problem", failure: null }) }),
    element("button", { type: "button", textContent: words.settings.licenses, onclick: openLicenses })),
  element("div", { className: "settings-row" },
    link(words.settings.privacy, () => void window.video.openWebsite("privacy")),
    link(words.settings.terms, () => void window.video.openWebsite("terms"))));

  dialog.append(updates, checkIn, help,
    element("div", { className: "dialog-buttons" }, element("button", { type: "button", textContent: words.settings.close, onclick: () => dialog.close() })));

  return {
    showUpdate: () => showUpdate(),
    open(checkFirst: boolean) {
      void window.video.about().then((facts) => {
        about.textContent = `${words.appName} ${facts.version} · ${facts.system}`;
        check.hidden = !facts.updates;
        if (!facts.updates) updateStatus.textContent = words.settings.found.not_updating;
        else showUpdate();
        if (checkFirst && facts.updates) void checkNow();
      });
      void window.video.checkIn().then(showCheckIn);
      dialog.showModal();
    },
  };
}

/** "December 2", in the person's own way of writing dates. */
function day(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric" });
}
