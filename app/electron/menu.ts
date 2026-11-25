/**
 * The menu bar, in place of Electron's own (whose Help menu links to Electron, and whose View menu reloads the
 * window). On the Mac: the app menu, with *Check for Updates…* under About where Mac apps keep it (for a copy that
 * updates itself) and Settings…; File (for Cmd+W); Edit (without which copy and paste don't work in text boxes);
 * Window; Help, with *Send Feedback…* and the open-source licenses. On Windows and Linux: no menu bar; the window's
 * Settings and Feedback buttons hold the same. Each item asks the window, which owns every dialog.
 */
import { app, Menu } from "electron";
import type { MenuCommand } from "../src/shared/app-api.ts";

// The menu's words of ours; the rest are macOS's own, in the person's language. The window's words are src/words.ts,
// which runs only in the window.
const WORDS = {
  checkForUpdates: "Check for Updates…",
  settings: "Settings…",
  feedback: "Send Feedback…",
  licenses: "Open-source Licenses", // ../../docs/brand.md › Every app site carries: Help › Open-source licenses
};

export function setMenu(ask: (command: MenuCommand) => void, options: { updates: boolean }): void {
  if (process.platform !== "darwin") {
    Menu.setApplicationMenu(null);
    return;
  }
  const appMenu: Electron.MenuItemConstructorOptions = { label: app.name, submenu: [
    { role: "about" },
    ...(options.updates ? [{ label: WORDS.checkForUpdates, click: () => ask("checkForUpdates") }] : []),
    { type: "separator" },
    { label: WORDS.settings, accelerator: "CommandOrControl+,", click: () => ask("settings") },
    { type: "separator" },
    { role: "services" }, { type: "separator" },
    { role: "hide" }, { role: "hideOthers" }, { role: "unhide" }, { type: "separator" },
    { role: "quit" },
  ] };
  const helpMenu: Electron.MenuItemConstructorOptions = { role: "help", submenu: [
    { label: WORDS.feedback, click: () => ask("feedback") },
    { label: WORDS.licenses, click: () => ask("licenses") },
  ] };
  Menu.setApplicationMenu(Menu.buildFromTemplate([appMenu, { role: "fileMenu" }, { role: "editMenu" }, { role: "windowMenu" }, helpMenu]));
}
