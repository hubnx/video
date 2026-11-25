/** The captions file (src/export/srt.ts): wrong here, every caption on YouTube is out of step with the edit. */
import { expect, it } from "vitest";
import { srt, srtTime } from "../src/export/srt.ts";
import { emptyEdit, remove, segments } from "../src/edit/timeline.ts";
import { flicksOf } from "../src/shared/time.ts";
import type { Word } from "../src/shared/transcript.ts";

const word = (text: string, start: number, end: number): Word => ({ text, start: flicksOf(start), end: flicksOf(end) });

it("writes SRT's time as hours, minutes, seconds and milliseconds", () => {
  expect(srtTime(3723.4567)).toBe("01:02:03,457");
  expect(srtTime(0)).toBe("00:00:00,000");
});

it("times each caption where it plays in the edit, a cut before it moving it earlier", () => {
  const words = [word("Hello.", 1, 1.5), word("Second", 6, 6.4), word("part.", 6.4, 6.9)];
  const edit = emptyEdit();
  remove(edit, { start: flicksOf(2), end: flicksOf(5), reason: "silence" });
  const file = srt(words, segments(edit, "a", flicksOf(10)));
  expect(file).toBe("1\n00:00:01,000 --> 00:00:01,500\nHello.\n\n2\n00:00:03,000 --> 00:00:03,900\nSecond part.\n");
});
