/** The window: its title bar's name and icon, and the start screen until a video is opened. */
import icon from "../../brand/icon.svg";
import { element, required } from "./dom.ts";
import { words } from "./words.ts";

document.title = words.appName;
required<HTMLImageElement>("#app-icon").src = icon;
required("#app-name").textContent = words.appName;

required("#screen").replaceChildren(
  element("section", { className: "start", attributes: { "aria-labelledby": "start-heading" } },
    element("div", { className: "drop-area" },
      element("h1", { id: "start-heading", textContent: words.start.heading }),
      element("p", { className: "lead", textContent: words.start.lead }),
    ),
    element("p", { className: "privacy", textContent: words.start.privacy }),
  ),
);
