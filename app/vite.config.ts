// The window's page, loaded from a file by Electron, hence the relative base.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "./",
  build: {
    outDir: "../dist/renderer",
    emptyOutDir: true,
    rollupOptions: { input: { window: fileURLToPath(new URL("src/index.html", import.meta.url)) } },
  },
  test: { root: ".", include: ["tests/**/*.test.ts"] },
});
