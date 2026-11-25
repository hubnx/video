// The tests' own config: vite.config.ts imports the shared notices collector, TypeScript in node_modules, which Node
// won't load for vitest (ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING).
import { defineConfig } from "vitest/config";

export default defineConfig({ test: { include: ["tests/**/*.test.ts"] } });
