/**
 * The transcript beside the preview, and the clean-up's editing surface: the words heard so far in paragraphs (a new
 * one at each sentence's end and each pause over a second: gate on day 4), each proposed silence a mark between words
 * that's cut or put back with a click, each possible "um" (English only) lightly underlined to cut with one press,
 * and whatever is taken out struck through. Clicking a word plays from it; while playing, the word said is lit.
 */
import { element } from "./dom.ts";
import type { ClipEditor } from "./edit/clip-editor.ts";
import type { Cut } from "./shared/cuts.ts";
import { flicksOf, secondsOf, FLICKS_PER_SECOND, type Flicks } from "./shared/time.ts";
import type { Word } from "./shared/transcript.ts";
import { words as wordsShown } from "./words.ts";

const PARAGRAPH_PAUSE = FLICKS_PER_SECOND; // a second

export interface TranscriptView {
  element: HTMLElement;
  /** Draws it again from the editor: new words, a cut made or put back. */
  render(): void;
  /** Lights the word being said at `seconds`. */
  at(seconds: number): void;
}

export function transcriptView(editor: ClipEditor, seek: (seconds: number) => void, fillerCut: (cut: Cut) => void): TranscriptView {
  const list = element("div", { className: "transcript-words" });
  const waiting = element("p", { className: "transcript-waiting", textContent: wordsShown.transcript.waiting });
  const view = element("section", { className: "transcript", attributes: { "aria-label": wordsShown.transcript.label } }, waiting, list);
  let spans: { word: Word; span: HTMLElement }[] = [];
  let lit: HTMLElement | null = null;
  let marks = new Map<HTMLElement, Cut>();

  list.addEventListener("click", (event) => {
    const target = event.target as Element;
    const mark = target.closest<HTMLElement>(".pause, .word.filler");
    const cut = mark ? marks.get(mark) : undefined;
    if (cut) {
      if (cut.kind === "filler" && !editor.isRemoved(cut)) fillerCut(cut);
      else editor.toggle(cut);
      return;
    }
    const span = target.closest<HTMLElement>("[data-start]");
    if (span) seek(Number(span.dataset.start));
  });

  const render = () => {
    const words = editor.words;
    waiting.hidden = words.length > 0;
    spans = [];
    lit = null;
    marks = new Map();
    const fillersByWord = new Map<Word, Cut>(editor.fillers.map(({ word, cut }) => [word, cut]));
    const silences = [...editor.silences];
    const paragraphs: HTMLElement[] = [];
    let paragraph = element("p", { className: "transcript-paragraph" });
    words.forEach((word, index) => {
      const previous = words[index - 1];
      if (previous && (word.start - previous.end >= PARAGRAPH_PAUSE || /[.!?…]["”’)]?$/.test(previous.text))) {
        paragraphs.push(paragraph);
        paragraph = element("p", { className: "transcript-paragraph" });
      }
      // The proposed silences that end before this word: marks between the words around them.
      while (silences.length && silences[0]!.end <= word.start + flicksOf(0.3)) {
        const silence = silences.shift()!;
        const cut = editor.isRemoved(silence);
        const seconds = secondsOf((silence.end - silence.start) as Flicks).toFixed(1);
        const mark = element("button", { type: "button", className: cut ? "pause cut" : "pause",
          textContent: wordsShown.transcript.pause(seconds), title: cut ? wordsShown.transcript.putBack : wordsShown.transcript.cutPause,
          dataset: { from: String(secondsOf(silence.start)), to: String(secondsOf(silence.end)) } });
        marks.set(mark, silence);
        paragraph.append(" ", mark);
      }
      const filler = fillersByWord.get(word);
      const removed = editor.isWordRemoved(word);
      const span = element("span", {
        className: ["word", filler ? "filler" : "", removed ? "removed" : ""].filter(Boolean).join(" "),
        textContent: word.text,
        dataset: { start: String(secondsOf(word.start)) },
        ...(filler && !removed ? { title: wordsShown.transcript.cutFiller } : {}),
      });
      if (filler) marks.set(span, filler);
      spans.push({ word, span });
      if (paragraph.childNodes.length) paragraph.append(" ");
      paragraph.append(span);
    });
    paragraphs.push(paragraph);
    list.replaceChildren(...paragraphs.filter((each) => each.childNodes.length));
  };

  return {
    element: view,
    render,
    at(seconds) {
      const now = flicksOf(seconds);
      let low = 0;
      let high = spans.length - 1;
      let found: HTMLElement | null = null;
      while (low <= high) {
        const middle = (low + high) >> 1;
        const { word, span } = spans[middle]!;
        if (now < word.start) high = middle - 1;
        else if (now >= word.end) low = middle + 1;
        else {
          found = span;
          break;
        }
      }
      if (found === lit) return;
      lit?.classList.remove("said");
      found?.classList.add("said");
      lit = found;
    },
  };
}
