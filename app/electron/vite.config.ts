// Builds the main process and its preload, both CommonJS, one format for the two: a sandboxed preload
// must be CommonJS. vite build -c electron/vite.config.ts --mode main, then --mode preload.
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const preload = mode === "preload";
  return {
    build: {
      ssr: preload ? "electron/preload.ts" : "electron/main.ts",
      outDir: "dist/electron",
      emptyOutDir: false,
      target: "node22",
      rollupOptions: {
        external: ["electron"],
        output: { format: "cjs", entryFileNames: preload ? "preload.cjs" : "main.cjs" },
      },
    },
  };
});
