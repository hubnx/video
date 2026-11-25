/**
 * An opened video: one line saying what's being got ready and how long it'll take; the preview with its captions, the
 * caption controls and the timeline on the left; the clean-up panel and the transcript on the right, as tall as the
 * left column (gate on day 4, 2026-11-21); each background job's detail behind *Details*. The preview plays the original
 * when this computer decodes it, and otherwise waits for the proxy (ffmpeg-jobs.ts). Every edit goes through the clip's
 * editor (edit/clip-editor.ts), and every view redraws from it.
 */
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { mediaAddress } from "./shared/app-api.ts";
import type { Cut } from "./shared/cuts.ts";
import type { Clip, JobKind, JobProgress } from "./shared/media.ts";
import { flicksOf, secondsOf } from "./shared/time.ts";
import { captionLines, type TranscriptProgress, type Word } from "./shared/transcript.ts";
import { element } from "./dom.ts";
import { cleanupPanel } from "./cleanup-panel.ts";
import { ClipEditor } from "./edit/clip-editor.ts";
import { sourceAt, timelineAt } from "./edit/timeline.ts";
import { CAPTION_STYLES } from "./preview/captions.ts";
import type { Choices, Edit } from "./shared/project.ts";
import { previewView, type Preview } from "./preview-view.ts";
import { timelineView } from "./timeline-view.ts";
import { transcriptView } from "./transcript-view.ts";
import { words } from "./words.ts";

/** How much is played either side of a possible "um" just cut, so the person hears the join (gate on day 1). */
const HEAR_AROUND_SECONDS = 1;

/** The view of one video, opened with its project as last saved (null the first time); it lives as long as the window
 * does. Every change is saved about a second later (electron/project-file.ts). */
export function clipView(clip: Clip, saved: { edit: Edit; choices: Choices } | null): HTMLElement {
  const editor = new ClipEditor(clip.id, flicksOf(clip.facts.durationSeconds), saved);
  editor.onChange(() => window.video.saveEdit(clip.id, editor.edit, editor.choices));
  const status = element("div", { className: "clip-status", attributes: { role: "status" } });
  const statusText = element("span", { className: "clip-status-text" });
  const statusBar = element("progress", { max: 1, value: 0 });
  status.append(statusText, statusBar);
  const problem = element("p", { className: "clip-problem", attributes: { role: "alert" }, hidden: true });
  const previewPlace = element("div", { className: "preview-place" });
  let preview: Preview | null = null;
  const seek = (seconds: number) => preview?.seek(seconds);
  const cutFiller = (cut: Cut) => {
    editor.toggle(cut);
    // Heard at once: a second before the cut to a second after, with Undo in view in the clean-up panel.
    preview?.playStretch(Math.max(0, secondsOf(cut.start) - HEAR_AROUND_SECONDS), secondsOf(cut.end) + HEAR_AROUND_SECONDS);
  };
  const transcript = transcriptView(editor, seek, cutFiller);
  const panel = cleanupPanel(editor);
  const timeline = timelineView(editor, seek);
  const styleButtons = element("div", { className: "segmented", attributes: { role: "radiogroup", "aria-label": words.captions.style } },
    ...CAPTION_STYLES.map((each) => element("button", { type: "button", textContent: words.captions.styles[each], dataset: { style: each },
      attributes: { role: "radio" }, onclick: () => editor.setCaptionStyle(each) })));
  const hideFillers = element("input", { type: "checkbox", checked: editor.hideFillersInCaptions, onchange: () => editor.setHideFillers(hideFillers.checked) });
  const hideFillersLabel = element("label", { className: "switch", hidden: true }, hideFillers, words.captions.hideFillers);
  const captionControls = element("div", { className: "caption-controls" },
    element("span", { className: "label", textContent: words.captions.label }), styleButtons, hideFillersLabel);
  const jobs = element("ul", { className: "jobs" });
  const details = element("details", { className: "clip-details" }, element("summary", { textContent: words.clip.details }), jobs);

  // What each activity has reached: the line shows the one that holds the person up most.
  const activity = { downloading: null as number | null, hearing: null as number | null, preparing: null as JobProgress | null };
  const showStatus = () => {
    const [text, fraction] = activity.downloading !== null ? [words.clip.downloadingModel, activity.downloading]
      : activity.hearing !== null ? [words.clip.hearing, activity.hearing]
        : activity.preparing?.state === "running" ? [words.clip.preparing, activity.preparing.fraction] : [null, 1];
    status.hidden = text === null;
    if (text === null) return;
    const left = activity.preparing?.state === "running" && activity.downloading === null && activity.hearing === null ? activity.preparing.secondsLeft : null;
    statusText.textContent = left === null ? text : `${text} ${words.clip.timeLeft(left)}`;
    statusBar.value = fraction;
  };
  /** Every view drawn again from the editor. */
  const showEdit = () => {
    transcript.render();
    panel.render();
    timeline.render();
    hideFillersLabel.hidden = !editor.english;
    for (const button of styleButtons.querySelectorAll<HTMLElement>("button")) button.setAttribute("aria-checked", String(button.dataset.style === editor.captionStyle));
    preview?.setCaptions(captionLines(editor.captionWords), editor.captionStyle);
    preview?.setSkips(editor.edit.removed.map((stretch) => ({ start: secondsOf(stretch.start), end: secondsOf(stretch.end) })));
  };
  editor.onChange(showEdit);
  // The clean voice: asked for when switched on (made once, then kept with the clip), played in the preview once ready.
  let voiceReady = false;
  let soundIsClean = false;
  const playCleanVoiceIfChosen = () => {
    const wanted = editor.cleanVoice && voiceReady;
    if (!preview || wanted === soundIsClean) return;
    soundIsClean = wanted;
    void preview.useSound(wanted ? mediaAddress(clip.id, "cleanVoice") : null);
  };
  let voiceAsked = false;
  editor.onChange(() => {
    if (editor.cleanVoice && !voiceAsked) {
      voiceAsked = true;
      void window.video.cleanVoice(clip.id);
    }
    if (!editor.cleanVoice) panel.voice(null);
    else if (voiceReady) panel.voice(words.cleanup.voice.ready);
    playCleanVoiceIfChosen();
  });
  window.video.onVoiceProgress((progress) => {
    if (progress.clipId !== clip.id) return;
    const percent = "fraction" in progress ? Math.round(progress.fraction * 100) : 0;
    if (progress.state === "preparing" || progress.state === "downloading" || progress.state === "cleaning") panel.voice(words.cleanup.voice[progress.state](percent));
    if (progress.state === "ready") {
      voiceReady = true;
      panel.voice(editor.cleanVoice ? words.cleanup.voice.ready : null);
      playCleanVoiceIfChosen();
    }
    if (progress.state === "failed") {
      panel.voice(words.cleanup.voice.failed);
      voiceAsked = false; // a later switch-on tries again
    }
  });

  const rows = new Map<JobKind, HTMLElement>();
  let proxyDone: () => void = () => undefined;
  const proxyReady = new Promise<void>((resolve) => (proxyDone = resolve));
  window.video.onJobProgress((progress) => {
    if (progress.clipId !== clip.id) return;
    let row = rows.get(progress.kind);
    if (!row) {
      row = element("li", { className: "job" });
      rows.set(progress.kind, row);
      jobs.append(row);
    }
    row.replaceChildren(element("span", { textContent: words.clip.jobs[progress.kind] }), element("span", { className: "job-state", textContent: stateWords(progress) }));
    if (progress.kind === "proxy" && progress.state === "done") proxyDone();
    if (progress.kind !== "speech") activity.preparing = progress.state === "running" ? progress : null;
    if (progress.state === "failed") showProblem(words.clip.jobFailed[progress.kind]);
    showStatus();
  });
  const heard: Word[] = [];
  window.video.onTranscriptProgress((progress: TranscriptProgress) => {
    if (progress.clipId !== clip.id) return;
    activity.downloading = progress.state === "downloading" ? progress.done / progress.total : null;
    activity.hearing = progress.state === "hearing" ? progress.fraction : null;
    if (progress.state === "hearing") {
      heard.push(...progress.words);
      editor.setHeard([...heard], null);
    }
    if (progress.state === "done") editor.setHeard(progress.transcript.words, progress.sound);
    if (progress.state === "failed") showProblem(words.clip.transcriptFailed);
    showStatus();
  });
  const showProblem = (text: string) => {
    problem.textContent = text;
    problem.hidden = false;
  };

  // The keys an editor expects: space plays, S splits at the playhead, Delete takes out the piece under it, undo and redo.
  window.addEventListener("keydown", (event) => {
    if ((event.target as Element).closest("input, textarea")) return;
    const command = event.metaKey || event.ctrlKey;
    if (command && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) editor.redo();
      else editor.undo();
      return;
    }
    if (command && event.key.toLowerCase() === "y") {
      event.preventDefault();
      editor.redo();
      return;
    }
    if (!preview || command) return;
    const at = flicksOf(preview.time);
    if (event.key === " ") {
      event.preventDefault();
      preview.togglePlay();
    } else if (event.key.toLowerCase() === "s") {
      editor.splitAt(at);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      const parts = editor.segments;
      const position = timelineAt(parts, at);
      const under = position === null ? null : sourceAt(parts, position);
      if (under) editor.deleteSegmentAt(under.index);
    }
  });

  plan(clip).then(async (decodes) => {
    if (!clip.facts.video) return;
    if (!decodes) await proxyReady;
    preview = await previewView(mediaAddress(clip.id, decodes ? "original" : "proxy"), clip.facts.durationSeconds);
    if (!preview) return;
    preview.onTime((seconds) => {
      transcript.at(seconds);
      timeline.at(seconds);
    });
    previewPlace.replaceChildren(preview.element, captionControls, timeline.element);
    showEdit();
    if (editor.cleanVoice && !voiceAsked) {
      voiceAsked = true;
      void window.video.cleanVoice(clip.id); // opened with the switch on: the clean voice is found, or made
    }
    playCleanVoiceIfChosen();
  }).catch((error: unknown) => {
    window.video.logProblem("clip_not_prepared", error);
    showProblem(words.clip.notStarted);
  });
  showStatus();
  showEdit();
  return element("section", { className: "clip", attributes: { "data-clip": clip.id } },
    element("h1", { textContent: clip.name }), status, problem,
    element("div", { className: "clip-body" }, previewPlace,
      element("div", { className: "clip-side" }, element("div", { className: "clip-side-inner" }, panel.element, transcript.element))),
    details);
}

/** Whether this computer's window can decode the original, which decides the proxy and edit copy (ffmpeg-jobs.ts);
 * the jobs start once it's known. */
async function plan(clip: Clip): Promise<boolean> {
  let decodes = false;
  if (clip.facts.video) {
    const input = new Input({ source: new UrlSource(mediaAddress(clip.id, "original")), formats: ALL_FORMATS });
    try {
      const track = await input.getPrimaryVideoTrack();
      decodes = track ? await track.canDecode() : false;
    } catch (error) {
      window.video.logProblem("clip_not_decodable", error); // a container the window can't read: an edit copy, then
      decodes = false;
    } finally {
      input.dispose();
    }
  }
  await window.video.planClip(clip.id, decodes);
  return decodes;
}

function stateWords(progress: JobProgress): string {
  switch (progress.state) {
    case "waiting": return words.clip.waiting;
    case "running": return progress.secondsLeft === null ? words.clip.starting : words.clip.timeLeft(progress.secondsLeft);
    case "done": return words.clip.done;
    case "failed": return words.clip.failed;
    case "cancelled": return words.clip.cancelled;
  }
}
