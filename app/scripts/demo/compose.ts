/**
 * The demo's cut (local/launch/youtube-demo.md › Script): the film of the app (film.ts) in segments, each step's waits
 * sped up, each segment with its one line of on-screen text; a title card first. No voice-over: the words are on screen
 * (the owner never films, and the channel's voice is for narration, not needed here). Text in Inter (OFL-1.1), drawn by
 * headless Chrome, as the FFmpeg here has no text filter.
 *
 *   pnpm exec node scripts/demo/compose.ts
 *
 * Into video/local/demo/cut/: demo.mp4 (1920 × 1080, 30 frames a second, H.264, silent), thumbnail.jpg (1280 × 720) and
 * the pictures it's made from.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { appFolder } from "../start.ts";

const local = path.resolve(appFolder, "..", "local", "demo");
const film = path.join(local, "film");
const out = path.join(local, "cut");
const maker = process.env.TEST_FFMPEG ?? "ffmpeg";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const marks = JSON.parse(readFileSync(path.join(film, "marks.json"), "utf8")) as Record<string, number>;
const fontFace = (weight: number, name: string) =>
  `@font-face { font-family: Inter; font-weight: ${weight}; src: url("data:font/ttf;base64,${readFileSync(path.join(local, "fonts", `Inter-${name}.ttf`)).toString("base64")}"); }`;
const FONTS = fontFace(500, "Medium") + fontFace(600, "SemiBold");

/** A stretch of the film, played `speed` times faster, with its words. */
interface Segment {
  from: number;
  to: number;
  speed: number;
  words: string;
}
const SEGMENTS: Segment[] = [
  { from: marks.start! - 1, to: marks.opened! + 0.5, speed: 1, words: "Drop in a video. Nothing is uploaded." },
  { from: marks.opened! + 0.5, to: marks.captioned! + 1, speed: Math.max(1, (marks.captioned! - marks.opened!) / 7), words: "Captions appear as it listens." },
  { from: marks.cleanUp! - 0.5, to: marks.cleanVoice!, speed: 1, words: `${marks.silences} long pauses found. One click cuts them all.` },
  { from: marks.cleanVoice! - 0.3, to: marks.voiceReady! + 1, speed: Math.max(1, (marks.voiceReady! - marks.cleanVoice!) / 4), words: "One switch takes out the hum and room noise." },
  { from: marks.voiceReady! + 1, to: marks.short!, speed: 1, words: "One switch takes out the hum and room noise." },
  { from: marks.short! - 0.3, to: marks.export!, speed: 1, words: "A vertical short for YouTube Shorts, TikTok and Reels." },
  { from: marks.export! - 0.3, to: marks.end!, speed: Math.max(1, (marks.end! - marks.export!) / 10), words: "Export up to 4K. No watermark. No account." },
];

const words = [...new Set(SEGMENTS.map((segment) => segment.words))];
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// The words on a dark pill along the bottom, each on a transparent 1920 × 1080 picture; the title card and the
// thumbnail as whole pictures.
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

// The film's segments, each sped up, framed at its own 1600 × 900 on dark (sharp: never scaled), its words in the band
// beneath, so nothing of the app is covered; between the title card and the end card.
const inputs = ["-i", path.join(film, "raw.webm"), "-loop", "1", "-t", "2.5", "-i", path.join(out, "title.png"), "-loop", "1", "-t", "3", "-i", path.join(out, "end.png"),
  ...SEGMENTS.flatMap((segment) => ["-i", path.join(out, `words-${words.indexOf(segment.words)}.png`)])];
const graph = [
  "[1:v]fps=30,format=yuv420p,setsar=1[title]",
  "[2:v]fps=30,format=yuv420p,setsar=1[end]",
  ...SEGMENTS.map((segment, index) => `[0:v]trim=${segment.from.toFixed(2)}:${segment.to.toFixed(2)},setpts=(PTS-STARTPTS)/${segment.speed.toFixed(3)},fps=30,`
    + `pad=1920:1080:160:24:color=0x120c1c,setsar=1[film${index}];[film${index}][${3 + index}:v]overlay=0:0:eof_action=repeat,format=yuv420p[part${index}]`),
  `[title]${SEGMENTS.map((_, index) => `[part${index}]`).join("")}[end]concat=n=${SEGMENTS.length + 2}:v=1:a=0[demo]`,
].join(";");
execFileSync(maker, ["-hide_banner", "-loglevel", "error", "-y", ...inputs, "-filter_complex", graph,
  "-map", "[demo]", "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(out, "demo.mp4")]);
const length = Number(execFileSync(maker.replace(/ffmpeg$/, "ffprobe"), ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(out, "demo.mp4")]).toString());
console.log(`demo.mp4: ${length.toFixed(1)} s, ${SEGMENTS.length} segments; thumbnail.jpg`);
