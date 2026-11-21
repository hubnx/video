/**
 * The menu bar, in place of Electron's own (whose Help menu links to Electron, and whose View menu reloads the
 * window). On the Mac: the app menu, File (for Cmd+W), Edit (without which copy and paste don't work in text boxes),
 * Window. On Windows and Linux: no menu bar; the window's own buttons do the same. Help › Open-source licenses joins
 * with the licences page on day 8 (docs/plan.md › Launch checklist).
 */
import { Menu } from "electron";

export function setMenu(): void {
  if (process.platform !== "darwin") {
    Menu.setApplicationMenu(null);
    return;
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate([{ role: "appMenu" }, { role: "fileMenu" }, { role: "editMenu" }, { role: "windowMenu" }]));
}
