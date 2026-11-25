/**
 * Day 8's feedback check: what the app sends to Hub Nexus, and only when the person sends it, read by a stand-in for
 * hubnx.com's route on this computer (no test ever reaches the live route: docs/plan.md › Keep or stop › The check-in).
 * - A problem report from the form, with the log ticked: the person's words, the app and system, the log's end with
 *   the home folder shown as ~, and the email left out when empty.
 * - The day-7 check-in, set up as a week-old copy that said yes: sent once by itself, exactly the three numbers, the
 *   version and the system, and nothing on the next opening.
 * - The same check-in body sent to the live route's dry run, which checks it whole and counts nothing, so the app's
 *   body is proved against hubnx.com's own rules (hubnx's app-checkin.util.ts).
 * The app runs behind, never taking the screen. Run after `pnpm build`:
 *
 *   pnpm exec node scripts/check-feedback.ts
 */
import { createServer, type IncomingMessage } from "node:http";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { _electron as electron } from "playwright-core";
import { FEEDBACK_URL } from "../src/shared/app-api.ts";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "./start.ts";

const PORT = 4168; // video's block is 4160–4169 (hubnx-apps docs/registry.md)
const stillBehind = watchFrontmost();
const data = path.resolve(appFolder, "..", "local", "app-data");
const received: Record<string, unknown>[] = [];

const server = createServer((request: IncomingMessage, response) => {
  let body = "";
  request.on("data", (chunk: Buffer) => (body += chunk.toString()));
  request.on("end", () => {
    received.push(JSON.parse(body) as Record<string, unknown>);
    response.writeHead(200, { "content-type": "application/json" }).end("{}");
  });
});
await new Promise<void>((resolve) => server.listen(PORT, "127.0.0.1", resolve));
const standIn = `http://127.0.0.1:${PORT}/api/feedback`;

const expect = (condition: boolean, what: string) => {
  if (!condition) throw new Error(`FEEDBACK_CHECK_FAILED: ${what}\n${JSON.stringify(received, null, 1).slice(0, 3000)}`);
  console.log(`ok: ${what}`);
};
const waitFor = async (what: () => boolean, label: string, ms = 15_000) => {
  const until = Date.now() + ms;
  while (!what()) {
    if (Date.now() > until) expect(false, label);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

/** A copy opened eight days ago that said yes to the check-in after two exports, with a home folder in its log. */
async function weekOldCopy(): Promise<void> {
  await rm(data, { recursive: true, force: true });
  await mkdir(path.join(data, "logs"), { recursive: true });
  const opened = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
  await writeFile(path.join(data, "settings.json"), JSON.stringify({
    firstOpenedAt: opened.toISOString(), exportsMade: 2, firstExportAt: new Date(opened.getTime() + 14 * 60_000).toISOString(),
    setupFailures: 1, checkIn: { answer: "yes", answeredAt: opened.toISOString() },
  }));
  await writeFile(path.join(data, "logs", "app.log"), `2026-11-25T10:00:00.000Z settings_unreadable ${path.join(homedir(), "x.json")} SyntaxError\n`);
}

async function openApp() {
  const running = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment({ VIDEO_FEEDBACK_URL: standIn }) as Record<string, string> });
  const page = await running.firstWindow();
  await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
  return { running, page };
}

let failure: unknown = null;
try {
  await weekOldCopy();
  const first = await openApp();
  try {
    // The check-in goes by itself on opening: a week has passed and the person said yes.
    await waitFor(() => received.some((body) => body.kind === "checkin"), "the check-in is sent on opening, a week after a yes");
    const checkIn = received.find((body) => body.kind === "checkin")!;
    expect(JSON.stringify(Object.keys(checkIn).sort()) === JSON.stringify(["app", "counts", "kind", "os", "version"]), "the check-in carries only app, version, system and counts");
    expect(JSON.stringify(checkIn.counts) === JSON.stringify({ videosExported: 2, minutesToFirstExport: 14, setupFailures: 1 }), "its counts are the three numbers kept on this computer");

    // A problem report, the log ticked, sent from the form.
    await first.page.locator(".top-actions").getByRole("button", { name: "Feedback" }).click();
    const form = first.page.locator("dialog.feedback[open]");
    await form.getByRole("radio", { name: "A problem" }).click();
    await form.locator("textarea").fill("Captions stopped halfway through a long video.");
    await form.getByRole("checkbox").check();
    await form.getByRole("button", { name: "Send" }).click();
    await form.getByText("Thanks. We read every report.").waitFor();
    const report = received.find((body) => body.kind === "problem")!;
    expect(report.message === "Captions stopped halfway through a long video.", "the report carries the person's words");
    expect((report.app as { name: string }).name === "video" && report.source === "app", "it names the app as hubnx.com knows it");
    expect(!("email" in report), "an empty email isn't sent");
    const log = String(report.log);
    expect(log.includes("settings_unreadable") && log.includes("~") && !log.includes(homedir()), "the ticked log goes, its home folder shown as ~");
  } finally {
    await first.running.close();
  }

  // Sent once: opening again sends nothing more.
  const sentBefore = received.filter((body) => body.kind === "checkin").length;
  const second = await openApp();
  await second.page.waitForTimeout(3000);
  await second.running.close();
  expect(received.filter((body) => body.kind === "checkin").length === sentBefore, "the check-in isn't sent again");

  // hubnx.com's own rules, on the same body: a dry run checks it whole and counts nothing.
  const checkIn = received.find((body) => body.kind === "checkin")!;
  const dryRun = await fetch(`${FEEDBACK_URL}?dryRun=1`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(checkIn) });
  expect(dryRun.ok, `hubnx.com's route accepts the app's check-in body (dry run: ${dryRun.status} ${(await dryRun.text()).slice(0, 200)})`);
} catch (error) {
  failure = error;
} finally {
  server.close();
}
const taken = stillBehind();
if (taken) throw new Error(`SCREEN_TAKEN: ${taken}`);
if (failure) throw failure;
console.log("feedback check passed");
