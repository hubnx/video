/**
 * Runs the WebCodecs probe (scripts/webcodecs-probe/main.cjs) on this computer, behind whatever is in front, and saves
 * what it found to video/local/probe/<system>-<arch>.json. GitHub's Mac (Apple chip), Windows and Linux machines run
 * the same through .github/workflows/probe.yml.
 *
 *   pnpm probe
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "./start.ts";

const stillBehind = watchFrontmost();
const run = spawnSync(electronProgram(), [path.join(appFolder, "scripts", "webcodecs-probe", "main.cjs")], { env: electronEnvironment(), encoding: "utf8", timeout: 10 * 60_000 });
const taken = stillBehind();
if (taken) throw new Error(`SCREEN_TAKEN: ${taken}`);
const line = run.stdout.split("\n").find((each) => each.startsWith("WEBCODECS "));
if (!line) {
  console.error(`PROBE_SILENT: the probe printed nothing: ${run.stderr.slice(-2000)}`);
  process.exit(1);
}
const found = JSON.parse(line.slice("WEBCODECS ".length)) as unknown;
const folder = path.resolve(appFolder, "..", "local", "probe");
mkdirSync(folder, { recursive: true });
const file = path.join(folder, `${process.platform}-${process.arch}.json`);
writeFileSync(file, `${JSON.stringify(found, null, 1)}\n`);
console.log(JSON.stringify(found, null, 1));
console.log(`saved: ${file}`);
