/**
 * The demo's cut (local/launch/youtube-demo.md › Script): the film of the app (film.ts) in steps, each step's waits
 * sped up, each with its line of words on screen and its line of narration, between a title card and an end card. The
 * narrator is the channel's (Kokoro-82M, af_heart: voice.py), and every film on the channel has a soft music bed under
 * it (the owner, 2026-11-26, through Apps HQ): hubnx media chooses the one bed and its licence, kept at
 * local/demo/music/bed.<wav|mp3|m4a>; until it's there the cut has the narration alone. Text in Inter (OFL-1.1), drawn by
 * headless Chrome, as the FFmpeg here has no text filter.
 *
 *   pnpm exec node scripts/demo/compose.ts      (after film.ts)
 *
 * Into video/local/demo/cut/: demo.mp4 (1920 × 1080, 30 frames a second, H.264 and AAC), demo.en.srt (the narration's
 * captions, which the channel asks of every spoken film), thumbnail.jpg (1280 × 720) and the pictures it's made from.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";
import { appFolder } from "../start.ts";

const local = path.resolve(appFolder, "..", "local", "demo");
const film = path.join(local, "film");
const out = path.join(local, "cut");
const narrationFolder = path.join(local, "narration");
const maker = process.env.TEST_FFMPEG ?? "ffmpeg";
const prober = maker.replace(/ffmpeg$/, "ffprobe");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PYTHON = path.join(os.homedir(), "Workspace/repo/hubnx/local/brand/remotion/voice/.venv/bin/python");
const marks = JSON.parse(readFileSync(path.join(film, "marks.json"), "utf8")) as Record<string, number>;
const fontFace = (weight: number, name: string) =>
  `@font-face { font-family: Inter; font-weight: ${weight}; src: url("data:font/ttf;base64,${readFileSync(path.join(local, "fonts", `Inter-${name}.ttf`)).toString("base64")}"); }`;
const FONTS = fontFace(500, "Medium") + fontFace(600, "SemiBold");

/** A step of the film: a stretch of it played up to `speed` times faster, its words on screen, and the narration line
 * it starts (by its `at` in narration.json); a step without one carries on the step before. */
interface Step {
  from: number;
  to: number;
  speed: number;
  words: string;
  at: string | null;
}
const STEPS: Step[] = [
  { at: "drop", from: marks.start! - 1, to: marks.opened! + 0.5, speed: 1, words: "Drop in a video. Nothing is uploaded." },
  { at: "captions", from: marks.opened! + 0.5, to: marks.captioned! + 1, speed: Math.max(1, (marks.captioned! - marks.opened!) / 7), words: "Captions appear as it listens." },
  { at: "cleanUp", from: marks.cleanUp! - 0.5, to: marks.cleanVoice!, speed: 1, words: `${marks.silences} long pauses found. One click cuts them all.` },
  { at: "cleanVoice", from: marks.cleanVoice! - 0.3, to: marks.voiceReady! + 1, speed: Math.max(1, (marks.voiceReady! - marks.cleanVoice!) / 4), words: "One switch takes out the hum and room noise." },
  { at: null, from: marks.voiceReady! + 1, to: marks.short!, speed: 1, words: "One switch takes out the hum and room noise." },
  { at: "short", from: marks.short! - 0.3, to: marks.export!, speed: 1, words: "A vertical short for YouTube Shorts, TikTok and Reels." },
  { at: "export", from: marks.export! - 0.3, to: marks.end!, speed: Math.max(1, (marks.end! - marks.export!) / 10), words: "Export up to 4K. No watermark. No account." },
];

// The narration, the pause count filled in from the run (said as a word), voiced by voice.py.
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const said = (count: number) => NUMBER_WORDS[count] ?? String(count);
const narration = (JSON.parse(readFileSync(path.join(appFolder, "scripts", "demo", "narration.json"), "utf8")) as { at: string; text: string }[])
  .map((line) => ({ ...line, text: line.text.replace("{silences}", said(marks.silences!)) }));
rmSync(narrationFolder, { recursive: true, force: true });
mkdirSync(narrationFolder, { recursive: true });
writeFileSync(path.join(narrationFolder, "lines.json"), JSON.stringify(narration.map((line) => line.text)));
const lengths = JSON.parse(execFileSync(PYTHON, [path.join(appFolder, "scripts", "demo", "voice.py"), path.join(narrationFolder, "lines.json"), narrationFolder]).toString().trim().split("\n").at(-1)!) as number[];
const lineOf = (at: string) => {
  const index = narration.findIndex((line) => line.at === at);
  if (index < 0) throw new Error(`no narration for ${at}`);
  return { index, length: lengths[index]!, text: narration[index]!.text };
};

/** Room around each line: a breath before it starts and after it ends. */
const LEAD = 0.3;
const BREATH = 0.6;
// Each step held at least as long as its line (and the steps carrying it on): a sped-up wait slows, and a step at
// normal speed holds its last frame for what's left.
const planned = STEPS.map((step) => ({ ...step, hold: 0 }));
planned.forEach((step, index) => {
  if (!step.at) return;
  const need = LEAD + lineOf(step.at).length + BREATH;
  let after = 0;
  for (let next = index + 1; next < planned.length && !planned[next]!.at; next++) after += (planned[next]!.to - planned[next]!.from) / planned[next]!.speed;
  const wanted = need - after;
  const length = step.to - step.from;
  if (length / step.speed < wanted) step.speed = Math.max(1, length / wanted);
  step.hold = Math.max(0, wanted - length / step.speed);
});
const TITLE = Math.max(2.5, LEAD + lineOf("title").length + BREATH);
const END = Math.max(3, LEAD + lineOf("end").length + BREATH + 0.8);

const words = [...new Set(STEPS.map((step) => step.words))];
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// The words on a dark pill in the band beneath the film, each on a transparent 1920 × 1080 picture; the title card, the
// end card and the thumbnail as whole pictures.
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const shoot = async (html: string, file: string, transparent: boolean) => {
    await page.setContent(`<!doctype html><html><head><style>${FONTS} body { margin: 0; width: 1920px; height: 1080px; font-family: Inter; }</style></head><body>${html}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    if (!(await page.evaluate(() => document.fonts.check("600 40px Inter")))) throw new Error("Inter didn't load");
    await page.screenshot({ path: file, omitBackground: transparent });
  };
  const pill = (line: string) => `<div style="position:absolute;left:0;right:0;bottom:30px;display:flex;justify-content:center">
    <div style="padding:16px 34px;border-radius:18px;background:#2a1a40;color:#fff;font-size:44px;font-weight:600;letter-spacing:-0.01em">${line}</div></div>`;
  for (const [index, line] of words.entries()) await shoot(pill(line), path.join(out, `words-${index}.png`), true);
  const card = (subtitle: string) => `<div style="height:100%;display:grid;place-items:center;background:linear-gradient(135deg,#2a1640,#120c1c)">
    <div style="text-align:center;color:#fff"><div style="font-size:120px;font-weight:600;letter-spacing:-0.02em">hubnx Video</div>
    <div style="margin-top:24px;font-size:52px;font-weight:500;color:#d9c8f2">${subtitle}</div></div></div>`;
  await shoot(card("A free editor for talking videos"), path.join(out, "title.png"), false);
  await shoot(card("video.hubnx.com"), path.join(out, "end.png"), false);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.setContent(`<!doctype html><html><head><style>${FONTS} body { margin: 0; font-family: Inter; }</style></head><body>
    <div style="width:1280px;height:720px;display:grid;place-items:center;background:linear-gradient(135deg,#2a1640,#120c1c);color:#fff;text-align:center">
    <div><div style="font-size:92px;font-weight:600;letter-spacing:-0.02em">Captions. Pauses cut.</div>
    <div style="font-size:92px;font-weight:600;letter-spacing:-0.02em;color:#e3b3ff">Free.</div>
    <div style="margin-top:28px;font-size:40px;font-weight:500;color:#d9c8f2">hubnx Video</div></div></div></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, "thumbnail.png") });
} finally {
  await browser.close();
}
execFileSync(maker, ["-hide_banner", "-loglevel", "error", "-y", "-i", path.join(out, "thumbnail.png"), "-q:v", "3", path.join(out, "thumbnail.jpg")]);

// Where each narration line starts in the cut: the title's at 0, each step's at that step's start, the end's at the end
// card's; LEAD after each.
const starts: { at: string; start: number }[] = [{ at: "title", start: LEAD }];
let clock = TITLE;
for (const step of planned) {
  if (step.at) starts.push({ at: step.at, start: clock + LEAD });
  clock += (step.to - step.from) / step.speed + step.hold;
}
starts.push({ at: "end", start: clock + LEAD });
const total = clock + END;

// The picture: the cards, and each step sped up, held, framed at its own 1600 × 900 on dark (sharp: never scaled), its
// words in the band beneath, so nothing of the app is covered.
const pictureInputs = ["-i", path.join(film, "raw.webm"), "-loop", "1", "-t", TITLE.toFixed(2), "-i", path.join(out, "title.png"),
  "-loop", "1", "-t", END.toFixed(2), "-i", path.join(out, "end.png"), ...planned.flatMap((step) => ["-i", path.join(out, `words-${words.indexOf(step.words)}.png`)])];
const firstSound = pictureInputs.filter((part) => part === "-i").length;
const voices = starts.map(({ at }) => path.join(narrationFolder, `${lineOf(at).index}.wav`));
const bed = existsSync(path.join(local, "music")) ? readdirSync(path.join(local, "music")).find((name) => /^bed\.(wav|mp3|m4a)$/.test(name)) : undefined;
const soundInputs = [...voices.flatMap((file) => ["-i", file]), ...(bed ? ["-stream_loop", "-1", "-i", path.join(local, "music", bed)] : [])];
const graph = [
  "[1:v]fps=30,format=yuv420p,setsar=1[title]",
  "[2:v]fps=30,format=yuv420p,setsar=1[end]",
  ...planned.map((step, index) => `[0:v]trim=${step.from.toFixed(2)}:${step.to.toFixed(2)},setpts=(PTS-STARTPTS)/${step.speed.toFixed(3)},fps=30,`
    + `tpad=stop_mode=clone:stop_duration=${step.hold.toFixed(3)},pad=1920:1080:160:24:color=0x120c1c,setsar=1[film${index}];`
    + `[film${index}][${3 + index}:v]overlay=0:0:eof_action=repeat,format=yuv420p[part${index}]`),
  `[title]${planned.map((_, index) => `[part${index}]`).join("")}[end]concat=n=${planned.length + 2}:v=1:a=0[demo]`,
  // The sound: each line at its start, then the bed under it, quiet, fading in and out, when there is one.
  ...starts.map((_, index) => `[${firstSound + index}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(starts[index]!.start * 1000)}:all=1[n${index}]`),
  `${starts.map((_, index) => `[n${index}]`).join("")}amix=inputs=${starts.length}:normalize=0:duration=longest,apad,atrim=0:${total.toFixed(2)}[voice]`,
  bed
    ? `[${firstSound + starts.length}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${total.toFixed(2)},volume=-24dB,afade=t=in:d=1.5,afade=t=out:st=${(total - 2).toFixed(2)}:d=2[bed];[voice][bed]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[sound]`
    : "[voice]loudnorm=I=-14:TP=-1.5:LRA=11[sound]",
].join(";");
execFileSync(maker, ["-hide_banner", "-loglevel", "error", "-y", ...pictureInputs, ...soundInputs, "-filter_complex", graph,
  "-map", "[demo]", "-map", "[sound]", "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", total.toFixed(2), path.join(out, "demo.mp4")]);

// The narration's captions, a cue a line, timed as it's said.
const srtTime = (seconds: number) => {
  const whole = Math.floor(seconds);
  const pad = (value: number, width = 2) => String(value).padStart(width, "0");
  return `${pad(Math.floor(whole / 3600))}:${pad(Math.floor((whole % 3600) / 60))}:${pad(whole % 60)},${pad(Math.round((seconds - whole) * 1000), 3)}`;
};
writeFileSync(path.join(out, "demo.en.srt"), starts.map(({ at, start }, index) => {
  const { length, text } = lineOf(at);
  return `${index + 1}\n${srtTime(start)} --> ${srtTime(start + length)}\n${text}\n`;
}).join("\n"));
const length = Number(execFileSync(prober, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(out, "demo.mp4")]).toString());
console.log(`demo.mp4: ${length.toFixed(1)} s, ${planned.length} steps, narrated${bed ? `, over ${bed}` : ", no music bed yet (local/demo/music/bed.*)"}; demo.en.srt; thumbnail.jpg`);
