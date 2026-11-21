// Builds the main process, its preload and the transcriber, all CommonJS, one format for the three: a sandboxed
// preload must be CommonJS. vite build -c electron/vite.config.ts --mode main, then preload, then transcribe.
import { defineConfig } from "vite";

const ENTRIES = {
  main: "electron/main.ts",
  preload: "electron/preload.ts",
  transcribe: "electron/speech/transcribe.ts", // run as a utility process (electron/speech/speech.ts)
} as const;

export default defineConfig(({ mode }) => {
  const entry = ENTRIES[mode as keyof typeof ENTRIES];
  if (!entry) throw new Error(`no electron build named ${mode}`);
  return {
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
