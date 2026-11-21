/**
 * The screen watch every check on the owner's Mac runs (scripts/start.ts): it knows our app only by the app's one id, so
 * a renamed app can't make a check that took the screen pass blind (hubnx Agent's update checks, 2026-11-20); and a
 * check fails if macOS never listed our app, since then the watch watched nothing.
 */
import path from "node:path";
import { expect, it } from "vitest";
import { APP_ID } from "../src/shared/app-api.ts";
import { appFolder, OUR_APPS, ours, runningApps } from "../scripts/start.ts";

it("knows the packaged app by the app's one id", () => {
  expect(OUR_APPS).toEqual([APP_ID]);
  expect(ours({ id: APP_ID, bundle: "/Applications/hubnx Video.app" })).toBe(true);
});

it("counts Electron's own app as ours only when it runs from this repo, not another chat's", () => {
  const electron = path.join(appFolder, "node_modules", "electron", "dist", "Electron.app");
  expect(ours({ id: "com.github.Electron", bundle: electron })).toBe(true);
  expect(ours({ id: "com.github.Electron", bundle: "/Users/someone/other-app/node_modules/electron/dist/Electron.app" })).toBe(false);
  expect(ours({ id: "com.apple.finder", bundle: "/System/Library/CoreServices/Finder.app" })).toBe(false);
});

it("reads each running app's own id and bundle from lsappinfo, never one entry's id with the next one's bundle", () => {
  const listing = [
    ' 1) "loginwindow" ASN:0x0-0x5005: ',
    '    bundleID="com.apple.loginwindow"',
    '    bundle path="/System/Library/CoreServices/loginwindow.app"',
    ' 2) "some helper" ASN:0x0-0x6006: ',
    '    bundleID=[ NULL ]',
    ' 3) "hubnx Video" ASN:0x0-0x7007: ',
    `    bundleID="${APP_ID}"`,
    '    bundle path="/Applications/hubnx Video.app"',
  ].join("\n");
  expect(runningApps(listing)).toEqual([
    { id: "com.apple.loginwindow", bundle: "/System/Library/CoreServices/loginwindow.app" },
    { id: APP_ID, bundle: "/Applications/hubnx Video.app" },
  ]);
});
