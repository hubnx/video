// Builds the main process, its preload and the speech workers, all CommonJS, one format for all: a sandboxed preload
// must be CommonJS. vite build -c electron/vite.config.ts --mode main, then preload, transcribe and denoise, each with
// `--configLoader runner` (the notices collector, which lists each build's packages for the licenses, is TypeScript in
// node_modules: scripts/app-notices.ts).
import { fileURLToPath } from "node:url";
import { noticesCollector } from "@hubnx/web-parts/electron-notices";
import { defineConfig } from "vite";

const ENTRIES = {
  main: "electron/main.ts",
  preload: "electron/preload.ts",
  transcribe: "electron/speech/transcribe.ts", // run as utility processes (electron/speech/speech.ts)
  denoise: "electron/speech/denoise.ts",
} as const;

export default defineConfig(({ mode }) => {
  const entry = ENTRIES[mode as keyof typeof ENTRIES];
  if (!entry) throw new Error(`no electron build named ${mode}`);
  return {
    plugins: [noticesCollector({ build: mode, folder: fileURLToPath(new URL("../dist/notices", import.meta.url)) })],
    build: {
      ssr: entry,
      outDir: "dist/electron",
      emptyOutDir: false,
      target: "node22",
      rollupOptions: {
        // sherpa-onnx's add-on is native: loaded from node_modules at run time, never bundled.
        external: ["electron", "sherpa-onnx-node"],
        output: { format: "cjs", entryFileNames: `${mode}.cjs` },
      },
    },
  };
});
