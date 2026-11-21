/**
 * The transcript beside the preview: every word heard so far, a caption to a line, filling in while the speech model
 * works. Clicking a word plays from it; while playing, the word being said is lit.
 */
import { element } from "./dom.ts";
import { captionLines, type Word } from "./shared/transcript.ts";
import { flicksOf, secondsOf } from "./shared/time.ts";
import { words as wordsShown } from "./words.ts";

export interface TranscriptView {
  element: HTMLElement;
  /** Shows these words (all heard so far, in order). */
  show(words: readonly Word[]): void;
  /** Lights the word being said at `seconds`. */
  at(seconds: number): void;
}

export function transcriptView(seek: (seconds: number) => void): TranscriptView {
  const list = element("div", { className: "transcript-words", attributes: { role: "list" } });
  const waiting = element("p", { className: "transcript-waiting", textContent: wordsShown.transcript.waiting });
  const view = element("section", { className: "transcript", attributes: { "aria-label": wordsShown.transcript.label } }, waiting, list);
  let spans: { word: Word; span: HTMLElement }[] = [];
  let lit: HTMLElement | null = null;

  list.addEventListener("click", (event) => {
    const span = (event.target as Element).closest<HTMLElement>("[data-start]");
    if (span) seek(Number(span.dataset.start));
  });

  return {
    element: view,
    show(words) {
      waiting.hidden = words.length > 0;
      spans = [];
      lit = null;
      list.replaceChildren(...captionLines(words).map((caption) => element("p", { className: "transcript-line", attributes: { role: "listitem" } },
        ...caption.words.flatMap((word, index) => {
          const span = element("span", { className: "word", textContent: word.text, dataset: { start: String(secondsOf(word.start)) } });
          spans.push({ word, span });
          return index ? [" ", span] : [span];
        }))));
    },
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
