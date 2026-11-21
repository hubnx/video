/**
 * Draws the app's icon from video/brand/icon.svg, the one source (../../../docs/brand.md › Icons):
 * build-resources/icon.png, 1024 px, which electron-builder turns into the Mac, Windows and Linux icons. On Apple's
 * grid for Mac app icons, the tile is 824 px inside the 1024 px canvas. The website's icons join with the site.
 * Drawn by Chrome with no window (headless), so it never takes the screen. Run after changing the icon:
 *
 *   pnpm exec node scripts/render-icons.ts
 */
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { appFolder } from "./start.ts";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; // playwright-core brings none
const CANVAS = 1024;
const TILE = 824;
const icon = readFileSync(path.join(appFolder, "..", "brand", "icon.svg"), "utf8");
if (!icon.includes('viewBox="0 0 64 64"')) throw new Error("ICON_SHAPE_CHANGED: the tile no longer fills a 64-unit canvas; update the size drawn here");

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: CANVAS, height: CANVAS } });
  await page.setContent(`<body style="margin:0;background:transparent;display:grid;place-items:center;height:${CANVAS}px">${
    icon.replace("<svg ", `<svg width="${TILE}" height="${TILE}" style="display:block" `)}</body>`);
  mkdirSync(path.join(appFolder, "build-resources"), { recursive: true });
  const file = path.join(appFolder, "build-resources", "icon.png");
  await page.screenshot({ path: file, omitBackground: true });
  console.log(`drew ${file}`);
} finally {
  await browser.close();
}
