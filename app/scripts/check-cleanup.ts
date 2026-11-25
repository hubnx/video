/**
 * Day 5's check (docs/plan.md › Build order), on a minute of AMI talk (local/transcript-check/talk-60s.mp4), the app run
 * behind and driven as a person drives it:
 *   - "Clean up" cuts every proposed silence, and playing then jumps every cut;
 *   - a possible "um" is cut by one press, then put back with Undo;
 *   - one silence of those cut is put back on its own, the rest stay cut;
 *   - a new spacing cuts the silences again at it;
 *   - S splits at the playhead and Delete takes out the piece under it, its words struck through;
 *   - "Clean voice" makes the clean voice in the background, says so, and keeps it with the clip;
 *   - undo, pressed until there's nothing left, restores the edit to nothing taken out.
 * Screenshots: local/screens/5-cleanup-*.png.
 *
 *   pnpm build && pnpm exec node scripts/check-cleanup.ts
 */
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { _electron as electron, type Page } from "playwright-core";
import { appFolder, electronEnvironment, electronProgram, watchFrontmost } from "./start.ts";

const stillBehind = watchFrontmost();
const local = path.resolve(appFolder, "..", "local");
const clip = path.join(local, "transcript-check", "talk-60s.mp4");
const failures: string[] = [];
const expect = (ok: boolean, what: string) => {
  console.log(`${ok ? "ok" : "FAIL"}: ${what}`);
  if (!ok) failures.push(what);
};

async function seekTo(page: Page, seconds: number): Promise<void> {
  await page.locator(".preview-bar").evaluate((bar: HTMLInputElement, value) => {
    bar.value = String(value);
    bar.dispatchEvent(new Event("input"));
  }, seconds);
  await page.waitForTimeout(300);
}

/** The clip's times the clock shows while playing until it passes `untilSeconds`, sampled at each screen refresh. Waits
 * on the clock's time, never on wall time: at background priority, as the checks run on the shared Mac, the sound
 * clock runs at a third to half its pace (2026-11-24), while a person's copy plays in real time. */
async function playAndWatch(page: Page, untilSeconds: number): Promise<number[]> {
  await page.getByRole("button", { name: "Play", exact: true }).click();
  const times = await page.evaluate((until) => new Promise<number[]>((resolve) => {
    const canvas = document.querySelector<HTMLCanvasElement>(".preview-canvas")!;
    const seen: number[] = [];
    const started = performance.now();
    const sample = () => {
      const now = Number(canvas.dataset.clock);
      seen.push(now);
      if (now < until && performance.now() - started < 20_000) requestAnimationFrame(sample);
      else resolve(seen);
    };
    requestAnimationFrame(sample);
  }), untilSeconds);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  return times;
}

rmSync(path.join(local, "app-data"), { recursive: true, force: true });
const app = await electron.launch({ executablePath: electronProgram(), args: [appFolder], env: electronEnvironment() as Record<string, string> });
try {
  const page = await app.firstWindow();
  page.on("pageerror", (error) => failures.push(`window error: ${error.message}`));
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.setSize(1280, 800));
  await page.getByRole("heading", { name: "Drop a video here" }).waitFor();
  await app.evaluate(({ dialog }, chosen) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [chosen] });
  }, clip);
  await page.getByRole("button", { name: "Choose a video" }).click();
  const cleanUp = page.getByRole("button", { name: /^Clean up: \d+ silences?$/ });
  await cleanUp.or(page.locator(".clip-problem:not([hidden])")).first().waitFor({ timeout: 10 * 60_000 });
  if (await page.locator(".clip-problem").isVisible()) throw new Error(`the app said: ${await page.locator(".clip-problem").innerText()}`);
  await page.locator(".preview-canvas[data-drawn]").waitFor();

  const proposed = Number(/(\d+)/.exec(await cleanUp.innerText())![1]);
  const pauses = page.locator(".pause");
  expect((await pauses.count()) === proposed, `${proposed} silences proposed, each marked in the transcript`);
  await page.screenshot({ path: path.join(local, "screens", "5-cleanup-proposed-laptop-light.png") });

  // One press cuts them all; playing then jumps each.
  await cleanUp.click();
  expect((await page.locator(".pause.cut").count()) === proposed, "Clean up cut every proposed silence");
  expect(await page.getByRole("button", { name: "Put all the silences back" }).isVisible(), "the button now offers to put them all back");
  const first = { from: Number(await pauses.first().getAttribute("data-from")), to: Number(await pauses.first().getAttribute("data-to")) };
  await seekTo(page, Math.max(0, first.from - 1));
  const played = await playAndWatch(page, first.to + 0.5);
  const inside = played.filter((time) => time > first.from + 0.05 && time < first.to - 0.05);
  expect(inside.length === 0 && played.some((time) => time >= first.to),
    `playing jumped the cut ${first.from.toFixed(2)}–${first.to.toFixed(2)} s (${inside.length} of ${played.length} refreshes inside it; played ${Math.min(...played).toFixed(2)}–${Math.max(...played).toFixed(2)} s)`);

  // One silence put back on its own.
  await pauses.first().click();
  expect(!(await pauses.first().getAttribute("class"))!.includes("cut") && (await page.locator(".pause.cut").count()) === proposed - 1,
    "one silence put back, the rest still cut");

  // A possible "um", cut with one press, then undone.
  const filler = page.locator(".word.filler").first();
  if (await filler.count()) {
    await filler.click();
    await page.waitForTimeout(300);
    expect((await filler.getAttribute("class"))!.includes("removed"), "one press cut a possible um");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    expect(!(await filler.getAttribute("class"))!.includes("removed"), "Undo put the um back");
  } else expect(false, "the minute of English talk showed no possible um to cut");

  // A new spacing cuts the silences again at it.
  const savedNatural = await page.locator(".cleanup-saved").innerText();
  await page.getByRole("radio", { name: "Relaxed" }).click();
  const savedRelaxed = await page.locator(".cleanup-saved").innerText();
  expect(savedRelaxed !== savedNatural, `Relaxed leaves more of each pause (${savedNatural} → ${savedRelaxed})`);

  // S splits at the playhead, Delete takes out the piece under it.
  await seekTo(page, 20);
  await page.locator(".timeline-canvas").focus();
  await page.keyboard.press("s");
  await seekTo(page, 25);
  await page.keyboard.press("s");
  await seekTo(page, 22);
  await page.keyboard.press("Delete");
  await page.waitForTimeout(300);
  const struck = await page.locator(".word.removed").count();
  expect(struck > 0, `Delete took out the piece between the splits (${struck} words struck through)`);
  await page.screenshot({ path: path.join(local, "screens", "5-cleanup-edited-laptop-light.png") });
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await app.evaluate(({ nativeTheme }, chosen) => {
      nativeTheme.themeSource = chosen;
    }, theme);
    for (const [name, width, height] of [["small", 400, 640], ["laptop", 1280, 800], ["wide", 1920, 1080]] as const) {
      await app.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0]?.setSize(size.width, size.height), { width, height });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(local, "screens", `5-cleanup-${name}-${theme}.png`) });
    }
  }

  // Voice clean-up as one switch: made in the background with its progress said, then played in the preview.
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.setSize(1280, 800));
  // Before it's on, the switch says how long it would take (a minute of talk here: under a minute).
  const estimate = await page.locator(".cleanup-voice-time").innerText();
  expect(/^\((under a minute|about \d+ min) for this video\)$/.test(estimate), `the switch says how long it would take ("${estimate}")`);
  await page.getByRole("checkbox", { name: "Clean voice" }).check();
  const ready = page.locator(".cleanup [role=status]").filter({ hasText: /Background noise removed|couldn't be cleaned/ });
  await ready.waitFor({ timeout: 10 * 60_000 });
  const voiceSaid = await ready.innerText();
  const made = existsSync(path.join(local, "app-data", "clips", (await page.locator(".clip").getAttribute("data-clip"))!, "clean-voice.wav"));
  expect(voiceSaid.includes("Background noise removed") && made, `the voice was cleaned and kept with the clip ("${voiceSaid}")`);
  await page.screenshot({ path: path.join(local, "screens", "6-clean-voice-laptop-light.png") });
  expect((await page.locator(".cleanup-voice-time").innerText()) === "", "the estimate goes once the voice is made");

  // Undo until there's nothing left: nothing taken out.
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  for (let presses = 0; presses < 50 && (await undo.isEnabled()); presses++) await undo.click();
  expect((await page.locator(".pause.cut, .word.removed").count()) === 0, "undo, pressed to the start, restored the edit to nothing taken out");
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  await app.close();
}
const taken = stillBehind();
if (taken) failures.push(`SCREEN_TAKEN: ${taken}`);
if (failures.length) {
  console.error(`CLEANUP_CHECK_FAILED:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("the clean-up cuts, jumps, restores, splits, deletes and undoes as a person expects");
