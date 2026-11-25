/** The window: its title bar's name and icon, the start screen, then the opened video. */
import icon from "../../brand/icon.svg";
import { clipView } from "./clip-view.ts";
import { required } from "./dom.ts";
import { startView } from "./start-view.ts";
import { words } from "./words.ts";

document.title = words.appName;
required<HTMLImageElement>("#app-icon").src = icon;
required("#app-name").textContent = words.appName;

const screen = required("#screen");
// A file dropped anywhere outside the drop area would otherwise be opened by Chromium as a page.
for (const kind of ["dragover", "drop"] as const) document.addEventListener(kind, (event) => event.preventDefault());

screen.replaceChildren(startView(({ clip, saved }) => screen.replaceChildren(clipView(clip, saved))));
