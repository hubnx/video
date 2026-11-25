/** The start screen: drop a video, or choose one. Opening one hands it, with its saved project, to `opened`. */
import type { OpenResult } from "./shared/app-api.ts";
import { element } from "./dom.ts";
import { refusalWords, words } from "./words.ts";

export type Opened = Extract<OpenResult, { clip: unknown }>;

export function startView(opened: (result: Opened) => void): HTMLElement {
  const message = element("p", { className: "start-message", attributes: { role: "status" } });
  const choose = element("button", { type: "button", className: "primary", textContent: words.start.choose });
  const dropArea = element("div", { className: "drop-area" },
    element("h1", { id: "start-heading", textContent: words.start.heading }),
    element("p", { className: "lead", textContent: words.start.lead }),
    choose,
  );

  const handle = (result: OpenResult | null) => {
    choose.disabled = false;
    if (!result) {
      message.textContent = "";
      return;
    }
    if ("refused" in result) {
      message.textContent = refusalWords(result.refused);
      return;
    }
    opened(result);
  };
  const begin = () => {
    choose.disabled = true;
    message.textContent = words.start.opening;
  };

  choose.addEventListener("click", () => {
    begin();
    window.video.chooseVideo().then(handle, () => handle({ refused: "unreadable" }));
  });
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault(); // without it, the drop never comes
    dropArea.classList.add("dragging");
  });
  dropArea.addEventListener("dragleave", () => dropArea.classList.remove("dragging"));
  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("dragging");
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    begin();
    window.video.openVideo(window.video.pathOfDropped(file)).then(handle, () => handle({ refused: "unreadable" }));
  });

  return element("section", { className: "start", attributes: { "aria-labelledby": "start-heading" } },
    dropArea, message, element("p", { className: "privacy", textContent: words.start.privacy }));
}
