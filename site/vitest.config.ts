/** The tests' own config: vite.config.ts imports @hubnx/web-parts, TypeScript in node_modules, which Node won't load
 * outside Vite's runner, and the tests need none of the build. */
import { defineConfig } from "vitest/config";

export default defineConfig({ test: { include: ["tests/**/*.test.ts"] } });
