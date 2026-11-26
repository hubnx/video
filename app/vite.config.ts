// The window's page, loaded from a file by Electron, hence the relative base. Its packages are listed for the licenses
// (scripts/app-notices.ts). Built with `--configLoader runner`: the notices collector is TypeScript in node_modules.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { noticesCollector } from "@hubnx/web-parts/electron-notices";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "./",
  plugins: [noticesCollector({
    build: "window",
    folder: fileURLToPath(new URL("dist/notices", import.meta.url)),
    // The face detector's package ships no license file: its repository's, with the libraries its WebAssembly carries.
    atSource: { "@mediapipe/tasks-vision": readFileSync(new URL("build-resources/notices/npm/mediapipe-tasks-vision.txt", import.meta.url), "utf8").trim() },
  })],
  build: {
    outDir: "../dist/renderer",
    emptyOutDir: true,
    rollupOptions: { input: { window: fileURLToPath(new URL("src/index.html", import.meta.url)) } },
  },
});
