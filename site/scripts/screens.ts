/**
 * Screenshots of every page at a phone's, a tablet's, a laptop's and a wide screen's size, light and dark, into
 * video/local/site-screens/ (replaced each run), for the clarity check (../../../docs/brand.md › Clarity check) before
 * anyone else sees them. Serves the built site (`pnpm build` first) and reads it in Chrome with no window, in a fresh
 * profile, so nothing takes the screen; the server stops when it's done, however it ends.
 *
 *   pnpm build && pnpm screens
 */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; // playwright-core brings none
const PORT = 4163;
const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const folder = path.resolve(site, "..", "local", "site-screens");
const PAGES = [["home", "/"], ["download", "/download/"], ["premiere-rush", "/premiere-rush-alternative/"], ["about", "/about/"], ["privacy", "/privacy/"], ["feedback", "/feedback/"], ["licenses", "/licenses/"]] as const;
// The phone at the height Safari shows inside its bars (brand.md › Every screen size).
const SIZES = [["phone", 390, 664], ["tablet", 768, 1024], ["laptop", 1280, 800], ["wide", 1920, 1080]] as const;

rmSync(folder, { recursive: true, force: true });
mkdirSync(folder, { recursive: true });
// Vite itself, in a process group of its own, so stopping the group stops the server (through pnpm it lived on, its pipe
// holding this script open).
const server = spawn(path.join(site, "node_modules", ".bin", "vite"), ["preview", "--configLoader", "runner", "--port", String(PORT), "--strictPort"],
  { cwd: site, stdio: ["ignore", "pipe", "inherit"], detached: true });
const stop = () => {
  if (server.pid !== undefined && server.exitCode === null) process.kill(-server.pid, "SIGTERM");
  server.stdout.destroy();
};
process.on("SIGINT", () => {
  stop();
  process.exit(130);
});
try {
  await new Promise<void>((resolve, reject) => {
    server.stdout.on("data", (chunk: Buffer) => {
      if (chunk.toString().includes(String(PORT))) resolve();
    });
    server.on("exit", (code) => reject(new Error(`SITE_PREVIEW_EXITED: ${code}`)));
  });
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    for (const theme of ["light", "dark"] as const) {
      for (const [size, width, height] of SIZES) {
        const page = await browser.newPage({ viewport: { width, height }, colorScheme: theme });
        for (const [name, address] of PAGES) {
          await page.goto(`http://localhost:${PORT}${address}`);
          await page.screenshot({ path: path.join(folder, `${name}-${size}-${theme}.png`), fullPage: name !== "licenses" });
        }
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`pictures in ${folder}`);
} finally {
  stop();
}
