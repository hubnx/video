/**
 * How words become captions (src/shared/transcript.ts). Wrong here, every video's captions read badly: a line too long
 * to read, a caption running on through a pause, a sentence's end and the next one's start on one card.
 */
import { describe, expect, it } from "vitest";
import { captionLines, captionText, SUBTITLES, type Word } from "../src/shared/transcript.ts";
import { flicksOf } from "../src/shared/time.ts";

/** Words said one after another, `gap` seconds apart, each lasting `length`. */
function said(text: string, from = 0, length = 0.3, gap = 0.05): Word[] {
  let at = from;
  return text.split(" ").map((word) => {
    const made = { text: word, start: flicksOf(at), end: flicksOf(at + length) };
    at += length + gap;
    return made;
  });
}

describe("cutting words into captions", () => {
  it("puts every word in exactly one caption, in order", () => {
    const words = said("so today we are going to look at how captions get cut into lines that people can actually read on a phone screen without squinting");
    expect(captionLines(words).flatMap((caption) => caption.words)).toEqual(words);
  });

  it("ends a caption at a sentence's end", () => {
    const captions = captionLines(said("That's the first idea. Here's the second one."));
    expect(captions.map((caption) => caption.words.map((word) => word.text).join(" "))).toEqual(["That's the first idea.", "Here's the second one."]);
  });

  it("starts a new caption after a pause long enough to hear", () => {
    const words = [...said("before the pause"), ...said("after it", 3)];
    expect(captionLines(words).map((caption) => caption.words.length)).toEqual([3, 2]);
  });

  it("never holds more than two lines of 42 characters, nor stays on screen past 7 seconds", () => {
    const fast = said(Array.from({ length: 60 }, (_, index) => `word${index}`).join(" "));
    for (const caption of captionLines(fast)) {
      expect(caption.words.map((word) => word.text).join(" ").length).toBeLessThanOrEqual(84);
      expect(captionText(caption).every((line) => line.length <= SUBTITLES.charactersPerLine)).toBe(true);
    }
    const slow = said(Array.from({ length: 20 }, () => "slowly").join(" "), 0, 0.5, 0.4);
    for (const caption of captionLines(slow)) expect((caption.end - caption.start) / 705_600_000).toBeLessThanOrEqual(7);
  });
});

describe("breaking a caption into lines", () => {
  it("keeps a short caption on one line", () => {
    expect(captionText(captionLines(said("Short and sweet."))[0]!)).toEqual(["Short and sweet."]);
  });

  it("breaks a long one into two lines of about equal length, between words", () => {
    const [caption] = captionLines(said("this caption is long enough that it has to be broken into two lines"));
    const lines = captionText(caption!);
    expect(lines).toHaveLength(2);
    expect(Math.abs(lines[0]!.length - lines[1]!.length)).toBeLessThan(12);
    expect(lines.join(" ")).toBe("this caption is long enough that it has to be broken into two lines");
  });
});
