/**
 * Whether the clean-up's silence cuts ever eat into a word: silences are in "accept all", so they carry the zero bar
 * (gate on day 1's filler numbers, `video assistant`, 2026-11-21). On the filler check's AMI hour (headset mics,
 * CC BY 4.0; local/filler-check/SOURCE.md), the app's own rules (electron/quiet.ts finds the quiet, src/shared/cuts.ts
 * proposes the cuts, moved off Parakeet's words) are run at several paddings, and each cut is checked against the
 * reference's words: how many reach more than 30 ms and more than 100 ms into a word this speaker said. Results print
 * and go to local/filler-check/silences.json.
 *
 *   pnpm exec node scripts/check-silences.ts
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { silenceCuts, withoutSpeech, type Stretch } from "../src/shared/cuts.ts";
import { flicksOf, secondsOf } from "../src/shared/time.ts";
import type { Word } from "../src/shared/transcript.ts";
import { loudness, quietStretches, speechSamples } from "../electron/quiet.ts";
import { appFolder } from "./start.ts";

const root = path.resolve(appFolder, "..", "local", "filler-check");
const EDGE_SECONDS = 0.5; // as the filler check: nothing within half a second of a segment's edge counts
const PADDINGS = [0.15, 0.25, 0.3, 0.35, 0.4];
const WORD_CAP_SECONDS = 1;

interface Reference {
  length_s: number;
  words: { start: number; end: number; text: string; class: string }[];
}
interface Heard {
  words: { start: number; end: number; text: string }[];
}
interface Voice {
  fine: [number, number][]; // Silero's speech stretches, at 0.1 s minimum silence (the filler check's)
}

const segments = readdirSync(path.join(root, "subset")).filter((name) => name.endsWith(".wav")).map((name) => name.slice(0, -4)).sort();
const prepared = await Promise.all(segments.map(async (segment) => {
  const reference = JSON.parse(readFileSync(path.join(root, "subset", `${segment}.ref.json`), "utf8")) as Reference;
  const heard = JSON.parse(readFileSync(path.join(root, "out", "parakeet", `${segment}.json`), "utf8")) as Heard;
  const words: Word[] = heard.words.map((word) => ({ text: word.text, start: flicksOf(word.start), end: flicksOf(word.end) }));
  const quiet = quietStretches(loudness(await speechSamples(path.join(root, "subset", `${segment}.wav`))));
  const voice = (JSON.parse(readFileSync(path.join(root, "out", "vad", `${segment}.json`), "utf8")) as Voice).fine
    .map(([start, end]): Stretch => ({ start: flicksOf(start), end: flicksOf(end) }));
  // This speaker's words (fillers are fair to cut into; hums such as "mm-hmm" are words, as the filler check counted).
  const said = reference.words.filter((word) => word.class !== "filler");
  return { segment, reference, words, quiet, voice, said };
}));

const results = (["loudness", "loudness and voice"] as const).flatMap((rule) => PADDINGS.map((padding) => {
  let cuts = 0;
  let seconds = 0;
  let over30 = 0;
  let over100 = 0;
  let over100Capped = 0;
  for (const { reference, words, quiet, voice, said } of prepared) {
    const candidates = rule === "loudness" ? quiet : withoutSpeech(quiet, voice);
    for (const cut of silenceCuts(candidates, words, { shortestSeconds: 1, paddingSeconds: padding })) {
      const [start, end] = [secondsOf(cut.start), secondsOf(cut.end)];
      if (start < EDGE_SECONDS || end > reference.length_s - EDGE_SECONDS) continue;
      cuts++;
      seconds += end - start;
      const into = Math.max(0, ...said.map((word) => Math.min(end, word.end) - Math.max(start, word.start)));
      if (into > 0.03) over30++;
      if (into > 0.1) over100++;
      // The reference's times come from forced alignment, which stretches a word over the pause after it (a 2 s "okay"):
      // the same count with each word held to a believable 1 s.
      const intoCapped = Math.max(0, ...said.map((word) => Math.min(end, word.start + Math.min(word.end - word.start, WORD_CAP_SECONDS)) - Math.max(start, word.start)));
      if (intoCapped > 0.1) over100Capped++;
    }
  }
  return { rule, padding, cuts, minutesCut: Math.round((seconds / 60) * 10) / 10, over30, over100, over100Capped };
}));

console.log("quiet by · padding · cuts · minutes cut · into a word >30 ms · >100 ms · >100 ms with words held to 1 s");
for (const row of results) console.log(`${row.rule} · ${row.padding} s · ${row.cuts} · ${row.minutesCut} · ${row.over30} · ${row.over100} · ${row.over100Capped}`);
const file = path.join(root, "silences.json");
writeFileSync(file, `${JSON.stringify({ measured: new Date().toISOString(), set: "AMI headset, 60 min (filler check)", results }, null, 1)}\n`);
console.log(`saved: ${file}`);
