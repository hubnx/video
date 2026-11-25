// The window's page, loaded from a file by Electron, hence the relative base. Its packages are listed for the licenses
// (scripts/app-notices.ts). Built with `--configLoader runner`: the notices collector is TypeScript in node_modules.
import { fileURLToPath } from "node:url";
import { noticesCollector } from "@hubnx/web-parts/electron-notices";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "./",
  plugins: [noticesCollector({ build: "window", folder: fileURLToPath(new URL("dist/notices", import.meta.url)) })],
  build: {
    outDir: "../dist/renderer",
    emptyOutDir: true,
    rollupOptions: { input: { window: fileURLToPath(new URL("src/index.html", import.meta.url)) } },
  },
});
