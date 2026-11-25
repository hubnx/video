/**
 * The clean-up panel above the transcript: one press cuts every proposed silence ("Clean up: 23 silences"), the pause
 * spacing as a three-way choice, a quiet line counting the possible "um"s marked in the transcript (English only, never
 * on the button: gate on day 1's numbers), and undo and redo in view, so a cut is always one press from coming back.
 */
import { element } from "./dom.ts";
import type { ClipEditor } from "./edit/clip-editor.ts";
import { SPACINGS, type Spacing } from "./edit/cleanup.ts";
import { secondsSaved } from "./shared/cuts.ts";
import { words } from "./words.ts";

export function cleanupPanel(editor: ClipEditor): { element: HTMLElement; render: () => void } {
  const action = element("button", { type: "button", className: "primary" });
  const saved = element("span", { className: "cleanup-saved" });
  const spacing = element("div", { className: "segmented", attributes: { role: "radiogroup", "aria-label": words.cleanup.spacing } },
    ...(Object.keys(SPACINGS) as Spacing[]).map((each) => element("button", { type: "button", textContent: words.cleanup.spacings[each],
      dataset: { spacing: each }, attributes: { role: "radio" }, onclick: () => editor.setSpacing(each) })));
  const fillers = element("p", { className: "cleanup-fillers" });
  const undo = element("button", { type: "button", textContent: words.cleanup.undo, onclick: () => editor.undo() });
  const redo = element("button", { type: "button", textContent: words.cleanup.redo, onclick: () => editor.redo() });
  const panel = element("section", { className: "cleanup", attributes: { "aria-label": words.cleanup.label } },
    element("div", { className: "cleanup-row" }, action, saved),
    element("div", { className: "cleanup-row" }, element("span", { className: "label", textContent: words.cleanup.spacingLabel }), spacing),
    fillers, element("div", { className: "cleanup-row history" }, undo, redo));

  action.addEventListener("click", () => {
    const allCut = editor.silences.every((cut) => editor.isRemoved(cut));
    if (allCut) editor.restoreSilences();
    else editor.cutSilences();
  });

  const render = () => {
    const silences = editor.silences;
    panel.hidden = editor.sound === null;
    // The button keeps its place and its height whatever's proposed, so the transcript under it never jumps (gate on
    // day 5): disabled with nothing to cut, "put back" once cut.
    const cut = silences.filter((each) => editor.isRemoved(each));
    const allCut = silences.length > 0 && cut.length === silences.length;
    action.disabled = silences.length === 0;
    action.textContent = silences.length === 0 ? words.cleanup.noPauses : allCut ? words.cleanup.putBackAll : words.cleanup.cleanUp(silences.length);
    action.className = allCut || silences.length === 0 ? "" : "primary";
    saved.textContent = silences.length ? (allCut ? words.cleanup.shorter(secondsSaved(cut)) : words.cleanup.wouldSave(secondsSaved(silences))) : "";
    for (const button of spacing.querySelectorAll<HTMLElement>("button")) button.setAttribute("aria-checked", String(button.dataset.spacing === editor.spacing));
    fillers.hidden = editor.fillers.length === 0;
    fillers.textContent = words.cleanup.possibleFillers(editor.fillers.length);
    undo.disabled = !editor.canUndo;
    redo.disabled = !editor.canRedo;
  };
  render();
  return { element: panel, render };
}
