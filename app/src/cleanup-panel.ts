/**
 * The clean-up panel above the transcript: one press cuts every proposed silence ("Clean up: 23 silences"), the pause
 * spacing as a three-way choice, voice clean-up and smooth jump cuts as switches, a quiet line counting the possible
 * "um"s marked in the transcript (English only, never on the button: gate on day 1's numbers), and undo and redo in
 * view, so a cut is always one press from coming back.
 */
import { element } from "./dom.ts";
import type { ClipEditor } from "./edit/clip-editor.ts";
import { SPACINGS, type Spacing } from "./edit/cleanup.ts";
import { secondsSaved } from "./shared/cuts.ts";
import type { SearchState } from "./shorts/speaker-search.ts";
import { words } from "./words.ts";

/** The panel; `voice` shows how the clean voice is coming along, and `voiceTime` how long it would take, on the switch
 * (null for nothing to say). */
export function cleanupPanel(editor: ClipEditor, search: () => SearchState): { element: HTMLElement; render: () => void; voice: (status: string | null) => void;
  voiceTime: (time: string | null) => void } {
  const action = element("button", { type: "button", className: "primary" });
  const saved = element("span", { className: "cleanup-saved" });
  const spacing = element("div", { className: "segmented", attributes: { role: "radiogroup", "aria-label": words.cleanup.spacing } },
    ...(Object.keys(SPACINGS) as Spacing[]).map((each) => element("button", { type: "button", textContent: words.cleanup.spacings[each],
      dataset: { spacing: each }, attributes: { role: "radio" }, onclick: () => editor.setSpacing(each) })));
  const fillers = element("p", { className: "cleanup-fillers" });
  const undo = element("button", { type: "button", textContent: words.cleanup.undo, onclick: () => editor.undo() });
  const redo = element("button", { type: "button", textContent: words.cleanup.redo, onclick: () => editor.redo() });
  // Voice clean-up as one switch (docs/plan.md › Release 1), off by default: it takes its time (Choices › cleanVoice).
  const cleanVoice = element("input", { type: "checkbox", onchange: () => editor.setCleanVoice(cleanVoice.checked) });
  const voiceStatus = element("span", { className: "cleanup-voice", attributes: { role: "status" } });
  const voiceTime = element("span", { className: "cleanup-voice-time" });
  // Smooth jump cuts (docs/design/1.1-shorts.md), off by default: usable once the speaker's face has been looked for.
  const smoothCuts = element("input", { type: "checkbox", onchange: () => editor.setSmoothCuts(smoothCuts.checked) });
  const smoothCutsWaiting = element("span", { className: "cleanup-voice-time" });
  const punchIns = element("span", { className: "cleanup-voice", attributes: { role: "status" } });
  const panel = element("section", { className: "cleanup", attributes: { "aria-label": words.cleanup.label } },
    element("div", { className: "cleanup-row" }, action, saved),
    element("div", { className: "cleanup-row" }, element("span", { className: "label", textContent: words.cleanup.spacingLabel }), spacing),
    element("div", { className: "cleanup-row" }, element("label", { className: "switch" }, cleanVoice, words.cleanup.cleanVoice, voiceTime), voiceStatus),
    element("div", { className: "cleanup-row" }, element("label", { className: "switch" }, smoothCuts, words.cleanup.smoothCuts, smoothCutsWaiting), punchIns),
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
    cleanVoice.checked = editor.cleanVoice;
    const found = search();
    smoothCuts.checked = editor.smoothCuts;
    smoothCuts.disabled = found.state !== "found" || !found.anyFace;
    smoothCutsWaiting.textContent = found.state === "finding" ? words.cleanup.smoothCutsWaiting(Math.round(found.fraction * 100))
      : found.state === "failed" || (found.state === "found" && !found.anyFace) ? words.cleanup.smoothCutsNoFace : "";
    punchIns.textContent = editor.smoothCuts && found.state === "found" && found.anyFace
      ? words.cleanup.punchIns(editor.edit.zooms.length, editor.edit.removed.length > 0) : "";
  };
  render();
  return { element: panel, render, voice: (status) => (voiceStatus.textContent = status ?? ""),
    voiceTime: (time) => (voiceTime.textContent = time === null ? "" : `(${time})`) };
}
