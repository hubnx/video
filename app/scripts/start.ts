/**
 * Starts the built app, and the screen watch every check runs. Started without ELECTRON_RUN_AS_NODE, which VS Code's
 * terminal passes on and which makes Electron run as plain Node, with no app or window (Songbrew, 2026-11-02).
 *
 *   pnpm dev    the app, in front, for a person to use
 */
import { execFileSync, spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { APP_ID } from "../src/shared/app-api.ts";

/** The environment the app is started with. Behind by default: every check runs the app unseen, with no focus, Dock
 * icon or sound (electron/main.ts › BEHIND; ~/.claude/CLAUDE.md › Tests never take my screen); `pnpm dev` alone
 * shows it. */
export function electronEnvironment(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  // A report or check-in a check sends goes nowhere unless the check names its own stand-in: never to hubnx.com
  // (docs/plan.md › Keep or stop › The check-in).
  const environment: NodeJS.ProcessEnv = { ...process.env, VIDEO_BEHIND: "1", VIDEO_FEEDBACK_URL: "http://127.0.0.1:9/api/feedback", ...extra };
  delete environment.ELECTRON_RUN_AS_NODE;
  return environment;
}

/** What macOS calls our app when packaged: from the one id, never typed again here, so a renamed app can't slip past
 * the watch (hubnx Agent's update checks passed measuring nothing once its name changed, 2026-11-20). check-package.ts
 * checks each built copy's Info.plist against it. */
export const OUR_APPS: readonly string[] = [APP_ID];
/** The app run from the repo is Electron's own, an id every Electron app run from a repo shares (other chats' checks
 * too): it's ours only from this repo's node_modules. */
const ELECTRON_FROM_A_REPO = "com.github.Electron";

export const appFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

interface FrontApp {
  id: string;
  bundle: string;
}

/** The app in front on this Mac (its bundle id and where it is), or null elsewhere or when it can't tell. */
function frontApp(): FrontApp | null {
  if (process.platform !== "darwin") return null;
  try {
    const asn = execFileSync("lsappinfo", ["front"], { encoding: "utf8" }).trim();
    const field = (name: string) => execFileSync("lsappinfo", ["info", "-only", name, asn], { encoding: "utf8" }).trim().replace(/^.*=\s*"?|"$/g, "");
    const id = field("bundleid");
    return id ? { id, bundle: field("bundlepath") } : null;
  } catch {
    return null; // can't tell: never a failure of its own
  }
}

/** Whether an app is ours: by id, or Electron's own run from this repo. */
export function ours(app: FrontApp): boolean {
  return OUR_APPS.includes(app.id) || (app.id === ELECTRON_FROM_A_REPO && app.bundle.startsWith(appFolder));
}

/** Watches the app in front from now, five times a second, until the returned function is called at the check's end,
 * which says whether ours was ever in front, for the check to fail loudly. Sampled all along, not only at the start and
 * the end: a copy that comes to the front and quits before the end (Squirrel's relaunch after an update, 2026-11-20)
 * leaves the owner's app in front again by then. It never names our app beyond `ours`, so a rename can't make it pass
 * blind. */
export function watchFrontmost(): () => string | null {
  const before = frontApp();
  let taken: string | null = null;
  const sample = () => {
    const now = frontApp();
    if (!taken && now && ours(now) && !(before && ours(before))) taken = `${now.id} came to the front (from ${before?.id ?? "unknown"}) at ${new Date().toISOString()}: a check took the owner's screen`;
  };
  const timer = setInterval(sample, 200);
  timer.unref();
  return () => {
    clearInterval(timer);
    sample();
    if (taken) return taken;
    const after = frontApp();
    // Another app quitting or the owner switching moves the front too: said, never a failure.
    if (before && after && before.id !== after.id) console.log(`note: the app in front changed from ${before.id} to ${after.id}, not ours`);
    return null;
  };
}

/** Whether a process macOS knows as one of ours is running: a check that found none watched nothing, and fails
 * (the watch above can only see what macOS lists as ours). Elsewhere, true: there's no front app to take there. */
export function oursRunning(): boolean {
  if (process.platform !== "darwin") return true;
  return runningApps(execFileSync("lsappinfo", ["list"], { encoding: "utf8" })).some(ours);
}

/** The apps in `lsappinfo list`, each entry's own id and bundle (an entry starts " 12) "name" ASN:…"). */
export function runningApps(listing: string): FrontApp[] {
  return listing.split(/^\s*\d+\) /m).flatMap((entry) => {
    const id = /bundleID="([^"]+)"/.exec(entry)?.[1];
    const bundle = /bundle path="([^"]+)"/.exec(entry)?.[1];
    return id && bundle ? [{ id, bundle }] : [];
  });
}

/** Electron's program in node_modules: looked up when asked, so scripts that don't need it run where it isn't
 * installed. */
export function electronProgram(): string {
  return createRequire(import.meta.url)("electron") as unknown as string;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // pnpm dev: the person wants to see it.
  spawn(electronProgram(), [appFolder], { env: electronEnvironment({ VIDEO_BEHIND: "" }), stdio: "inherit" }).on("exit", (code) => process.exit(code ?? 0));
}
