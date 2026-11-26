/**
 * The talk the demo edits (the owner never films: hubnx-apps CLAUDE.md › The owner never records a video): a minute of
 * a creator explaining how they plan a week of videos, as a screen recording of their planning board with their voice
 * over it. The voice is the hubnx channel's (scripts/demo/voice.py: Kokoro-82M, af_heart); the board's points appear as
 * they're said; the lines are joined by pauses long enough for Clean up to find, one with an "um"; and a little room
 * noise and mains hum sit under the voice, for the clean voice to take away. The board in Inter (OFL-1.1), drawn by
 * headless Chrome.
 *
 *   ~/Workspace/repo/hubnx/local/brand/remotion/voice/.venv/bin/python scripts/demo/voice.py \
 *     scripts/demo/talk-lines.json ../local/demo/voice
 *   pnpm exec node scripts/demo/make-talk.ts
 *
 * The lines (talk-lines.json) are worded so the app hears every word as written (2026-11-26: "twenty" said quickly was
 * heard "2", "too" as "two", "teaches" as "teach"): the demo shows the app's real transcript, so it must be right.
 *
 * Into video/local/demo/talk/: talk.mp4 (1920 × 1080, 30 frames a second, H.264 and AAC) and timing.json (when each
 * line is said), which the demo's film reads.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { appFolder } from "../start.ts";

const local = path.resolve(appFolder, "..", "local", "demo");
const voice = path.join(local, "voice");
const out = path.join(local, "talk");
const font = (weight: "Medium" | "SemiBold") => path.join(local, "fonts", `Inter-${weight}.ttf`);
const maker = process.env.TEST_FFMPEG ?? "ffmpeg";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; // playwright-core brings none

/** The pause after each line: long enough to be proposed for cutting (over a second, edit/cleanup.ts). */
const PAUSES = [1.8, 2.2, 1.6, 2.4, 1.5, 2.0, 1.8];
const LEAD = 0.6;
const TAIL = 1.0;

/** The board: its title, and each point with the line at which it appears. */
const TITLE = "My week of videos";
const POINTS: { text: string; atLine: number; delay?: number }[] = [
  { text: "1.  Every idea from the week", atLine: 1 },
  { text: "2.  Pick 3: teach, story, fun", atLine: 2 },
  { text: "3.  The first line of each", atLine: 3 },
  { text: "4.  Film on two mornings", atLine: 5 },
  { text: "5.  Edit on one afternoon", atLine: 5, delay: 1.5 },
  { text: "Planned in 20 minutes", atLine: 7 },
];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const wavs = readdirSync(voice).filter((name) => /^\d+\.wav$/.test(name)).sort((one, other) => parseInt(one) - parseInt(other));
const prober = maker.replace(/ffmpeg$/, "ffprobe");
const lengths = wavs.map((name) => Number(execFileSync(prober, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(voice, name)]).toString()));

// When each line starts: the lead, then each line and its pause.
const starts: number[] = [];
let at = LEAD;
lengths.forEach((length, index) => {
  starts.push(at);
  at += length + (PAUSES[index] ?? 0);
});
const duration = at + TAIL;

// The board in each of its states (the title, then one more point each time), drawn by headless Chrome in Inter: the
// FFmpeg here has no text filter, and a browser sets type better anyway. Then each picture is shown from its moment on.
// Inline: a page set from a string may not load a file:// font, and falls back to a serif without a word.
const fontFace = (weight: number, name: "Medium" | "SemiBold") =>
  `@font-face { font-family: Inter; font-weight: ${weight}; src: url("data:font/ttf;base64,${readFileSync(font(name)).toString("base64")}"); }`;
// A notes card in the middle, narrow enough for a short's 9:16 window to show it whole: with no face to follow, a
// short sits in the middle (shorts/camera.ts), so the same talk reads in landscape and as a short.
const boardHtml = (shown: number) => `<!doctype html><html><head><style>${fontFace(500, "Medium")}${fontFace(600, "SemiBold")}
  body { margin: 0; width: 1920px; height: 1080px; display: grid; place-items: center; font-family: Inter;
    background: linear-gradient(135deg, #ebe7f6, #f6f5f2 60%); }
  .card { box-sizing: border-box; width: 540px; height: 780px; padding: 64px 52px; border-radius: 28px; background: #ffffff;
    box-shadow: 0 18px 50px rgba(40, 20, 80, 0.12); }
  h1 { margin: 0 0 40px; font-size: 48px; line-height: 1.15; font-weight: 600; color: #1b1b1f; letter-spacing: -0.01em; }
  ol { list-style: none; margin: 0; padding: 0; }
  li { font-size: 32px; line-height: 1.3; font-weight: 500; color: #2b2b31; margin: 0 0 30px; text-wrap: balance; }
  li.done { font-weight: 600; color: #8a2be2; margin-top: 40px; }
</style></head><body><div class="card"><h1>${TITLE}</h1><ol>${POINTS.slice(0, shown).map((point, index) => `<li class="${index === POINTS.length - 1 ? "done" : ""}">${point.text}</li>`).join("")}</ol></div></body></html>`;
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  for (let shown = 0; shown <= POINTS.length; shown++) {
    await page.setContent(boardHtml(shown));
    await page.evaluate(() => document.fonts.ready);
    if (!(await page.evaluate(() => document.fonts.check("600 76px Inter")))) throw new Error("Inter didn't load: the board would be in a fallback font");
    await page.screenshot({ path: path.join(out, `board-${shown}.png`) });
  }
} finally {
  await browser.close();
}
// The board's pictures as a list: each shown until the next point appears.
const changes = [0, ...POINTS.map((point) => starts[point.atLine]! + (point.delay ?? 0))];
const list = changes.map((from, shown) => `file 'board-${shown}.png'\nduration ${((changes[shown + 1] ?? duration) - from).toFixed(3)}`).join("\n");
writeFileSync(path.join(out, "board.txt"), `${list}\nfile 'board-${POINTS.length}.png'\n`);

// The voice: each line delayed to its start, mixed with a quiet room (pink noise) and a 60 Hz hum.
const inputs = wavs.flatMap((name) => ["-i", path.join(voice, name)]);
const voices = wavs.map((_, index) => `[${index + 1}:a]aresample=48000,aformat=channel_layouts=mono,adelay=${Math.round(starts[index]! * 1000)}[v${index}]`);
const room = `anoisesrc=color=pink:amplitude=0.006:duration=${duration.toFixed(2)}:sample_rate=48000[noise];sine=frequency=60:duration=${duration.toFixed(2)}:sample_rate=48000,volume=0.01[hum]`;
const mix = `${wavs.map((_, index) => `[v${index}]`).join("")}[noise][hum]amix=inputs=${wavs.length + 2}:normalize=0:duration=longest,atrim=0:${duration.toFixed(2)}[a]`;

execFileSync(maker, ["-hide_banner", "-loglevel", "error", "-y",
  "-f", "concat", "-safe", "0", "-i", path.join(out, "board.txt"), ...inputs,
  "-filter_complex", `[0:v]fps=30,format=yuv420p,trim=0:${duration.toFixed(2)}[pic];${voices.join(";")};${room};${mix}`,
  "-map", "[pic]", "-map", "[a]", "-c:v", "libx264", "-g", "30", "-crf", "18", "-c:a", "aac", "-b:a", "192k", path.join(out, "talk.mp4")]);
writeFileSync(path.join(out, "timing.json"), JSON.stringify({ duration, lines: lengths.map((length, index) => ({ start: starts[index], length, pauseAfter: PAUSES[index] ?? TAIL })) }, null, 1));
console.log(`talk.mp4: ${duration.toFixed(1)} s, ${wavs.length} lines, pauses ${PAUSES.join(", ")} s`);
