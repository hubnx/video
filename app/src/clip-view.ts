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
import { uprightSize, type Clip, type JobKind, type JobProgress } from "./shared/media.ts";
import { flicksOf, secondsOf } from "./shared/time.ts";
import { captionLines, type TranscriptProgress, type Word } from "./shared/transcript.ts";
import { element } from "./dom.ts";
import { openFeedback } from "./feedback-view.ts";
import { logProblem } from "./problems.ts";
import { cleanupPanel } from "./cleanup-panel.ts";
import { ClipEditor } from "./edit/clip-editor.ts";
import { joinedSegments, sourceAt, timelineAt } from "./edit/timeline.ts";
import { CAPTION_STYLES, captionShape, type CaptionLook } from "./preview/captions.ts";
import { framing } from "./shorts/framing.ts";
import { SpeakerSearch } from "./shorts/speaker-search.ts";
import type { Choices, Edit } from "./shared/project.ts";
import { previewView, type Preview } from "./preview-view.ts";
import { exportView } from "./export-view.ts";
import { timelineView } from "./timeline-view.ts";
import { transcriptView } from "./transcript-view.ts";
import { words } from "./words.ts";

/** How much is played either side of a possible "um" just cut, so the person hears the join (gate on day 1). */
const HEAR_AROUND_SECONDS = 1;




/** The view of one video, opened with its project as last saved (null the first time); it lives as long as the window
 * does. Every change is saved about a second later (electron/project-file.ts). */
export function clipView(clip: Clip, saved: { edit: Edit; choices: Choices } | null): HTMLElement {
  const editor = new ClipEditor(clip.id, flicksOf(clip.facts.durationSeconds), saved);
  // A clip with no picture never frames anything; its size only keeps the types simple.
  const picture = clip.facts.video ? uprightSize(clip.facts.video) : { width: 16, height: 9 };
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
  // The speaker's face through the clip (shorts/speaker-search.ts): whatever asks for a short (the switch here, the
  // export's *For* row, a project saved as one) starts the search at once.
  const previewAddress = Promise.withResolvers<string>();
  previewAddress.promise.catch(() => undefined); // the search hears it from its own await; nobody else may be waiting
  const search = new SpeakerSearch(clip.id, clip.facts.durationSeconds, previewAddress.promise, (faces) => editor.setFaces(faces));
  editor.onChange(() => {
    if (editor.shorts) void search.start();
  });
  const transcript = transcriptView(editor, seek, cutFiller);
  const panel = cleanupPanel(editor, () => search.state);
  const timeline = timelineView(editor, seek);
  const styleButtons = element("div", { className: "segmented", attributes: { role: "radiogroup", "aria-label": words.captions.style } },
    ...CAPTION_STYLES.map((each) => element("button", { type: "button", textContent: words.captions.styles[each], dataset: { style: each },
      attributes: { role: "radio" }, onclick: () => editor.setCaptionStyle(each) })));
  const hideFillers = element("input", { type: "checkbox", checked: editor.hideFillersInCaptions, onchange: () => editor.setHideFillers(hideFillers.checked) });
  const hideFillersLabel = element("label", { className: "switch", hidden: true }, hideFillers, words.captions.hideFillers);
  // A short beside the captions: the preview shows the 9:16 frame at once, so what exports is what was seen.
  const shortsSwitch = element("input", { type: "checkbox", checked: editor.shorts, onchange: () => editor.setShorts(shortsSwitch.checked) });
  const shortsStatus = element("span", { className: "shorts-status", attributes: { role: "status" } });
  const captionControls = element("div", { className: "caption-controls" },
    element("span", { className: "label", textContent: words.captions.label }), styleButtons, hideFillersLabel,
    element("span", { className: "shorts-control" }, element("label", { className: "switch" }, shortsSwitch, words.shorts.switch), shortsStatus));
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
    shortsSwitch.checked = editor.shorts;
    showSearch();
    const look: CaptionLook = editor.shorts ? "shorts" : "video";
    preview?.setCaptions(captionLines(editor.captionWords, captionShape(look)), editor.captionStyle, look);
    preview?.setView(framing({ picture, shorts: editor.shorts, speaker: editor.speaker, parts: joinedSegments(editor.segments), zooms: editor.zooms }));
    preview?.setSkips(editor.edit.removed.map((stretch) => ({ start: secondsOf(stretch.start), end: secondsOf(stretch.end) })));
  };
  editor.onChange(showEdit);

  search.onChange(() => showSearch());
  const facesRow = element("li", { className: "job", hidden: true });
  jobs.append(facesRow);
  /** The search's words: on the Short switch, in the clean-up panel and under Details. */
  function showSearch(): void {
    const found = search.state;
    shortsStatus.dataset.search = found.state; // what the shorts check waits on
    const percent = found.state === "finding" ? Math.round(found.fraction * 100) : 0;
    shortsStatus.textContent = !editor.shorts ? ""
      : found.state === "finding" ? words.shorts.finding(percent)
        : found.state === "failed" ? words.shorts.failed
          : found.state === "found" && !found.anyFace ? words.shorts.noFace : "";
    facesRow.hidden = found.state === "waiting";
    facesRow.replaceChildren(element("span", { textContent: words.shorts.job }), element("span", { className: "job-state",
      textContent: found.state === "finding" ? `${percent}%` : found.state === "failed" ? words.clip.failed : words.clip.done }));
    panel.render();
  }
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
  // How long it would take, on the switch while it's off and the clean voice isn't made: it's minutes for a long talk.
  let voiceEstimate: number | null = null;
  const showVoiceTime = () => panel.voiceTime(voiceEstimate !== null && !editor.cleanVoice && !voiceReady ? words.cleanup.voiceTime(voiceEstimate) : null);
  window.video.voiceEstimate(clip.id).then((seconds) => {
    voiceEstimate = seconds;
    showVoiceTime();
  }, (error: unknown) => logProblem("voice_estimate_unknown", error));
  editor.onChange(() => {
    showVoiceTime();
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
      showVoiceTime();
      panel.voice(editor.cleanVoice ? words.cleanup.voice.ready : null);
      playCleanVoiceIfChosen();
    }
    if (progress.state === "failed") {
      panel.voice(null);
      showProblem(words.cleanup.voice.failed, `voice_failed: ${progress.error}`);
      voiceAsked = false; // a later switch-on tries again
    }
  });

  const rows = new Map<JobKind, HTMLElement>();
  let proxyDone: () => void = () => undefined;
  const proxyReady = new Promise<void>((resolve) => (proxyDone = resolve));
  // The edit copy, for export when the window can't use the original: settled when it's made or has failed, and its
  // progress passed on to an export waiting for it.
  const editCopy = Promise.withResolvers<void>();
  editCopy.promise.catch(() => undefined); // nobody may be waiting; an export that is hears it from its own await
  let editCopyWatcher: ((fraction: number, secondsLeft: number | null) => void) | null = null;
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
    // No proxy, no picture to find faces in: the speaker search ends, and a short waiting on it exports centred.
    if (progress.kind === "proxy" && (progress.state === "failed" || progress.state === "cancelled")) previewAddress.reject(new Error(`PROXY_${progress.state.toUpperCase()}`));
    if (progress.kind === "editCopy" && progress.state === "running") editCopyWatcher?.(progress.fraction, progress.secondsLeft);
    if (progress.kind === "editCopy" && progress.state === "done") editCopy.resolve();
    if (progress.kind === "editCopy" && (progress.state === "failed" || progress.state === "cancelled")) editCopy.reject(new Error(`EDIT_COPY_${progress.state.toUpperCase()}`));
    if (progress.kind !== "speech") activity.preparing = progress.state === "running" ? progress : null;
    if (progress.state === "failed") showProblem(words.clip.jobFailed[progress.kind], `${progress.kind}_failed`);
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
    if (progress.state === "failed") showProblem(words.clip.transcriptFailed, `transcript_failed: ${progress.error}`);
    if (progress.state === "done" || progress.state === "failed") void search.start();
    showStatus();
  });
  // What didn't work, in its own sentence, with the way to tell us (gate 2: *Send a problem report*).
  const showProblem = (text: string, failure: string) => {
    problem.replaceChildren(`${text} `, element("button", { type: "button", className: "quiet", textContent: words.feedback.open,
      onclick: () => openFeedback({ kind: "problem", failure }) }));
    problem.hidden = false;
  };

  // The keys an editor expects: space plays, S splits at the playhead, Delete takes out the piece under it, undo and redo.
  window.addEventListener("keydown", (event) => {
    // A dialog over the screen (export) keeps its keys: Space presses its button, nothing edits the clip behind it.
    if ((event.target as Element).closest("input, textarea") || document.querySelector("dialog[open]")) return;
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
      if (timeline.deleteSelectedZoom()) return; // a selected punch-in goes first, not the piece under the playhead
      const parts = editor.segments;
      const position = timelineAt(parts, at);
      const under = position === null ? null : sourceAt(parts, position);
      if (under) editor.deleteSegmentAt(under.index);
    }
  });

  // Export reads the original when this computer decodes it and it's SDR; otherwise its edit copy (upright, SDR), made
  // from the moment the clip opened, waiting for it with its progress shown (docs/plan.md › Risks, the 4K HEVC row).
  let decodesOriginal: Promise<boolean> = Promise.resolve(false);
  const pictureForExport = async (progress: (fraction: number, secondsLeft: number | null) => void) => {
    const decodes = await decodesOriginal;
    if (decodes && clip.facts.video?.dynamic === "sdr") return mediaAddress(clip.id, "original");
    editCopyWatcher = progress;
    try {
      await editCopy.promise;
    } finally {
      editCopyWatcher = null;
    }
    return mediaAddress(clip.id, "editCopy");
  };
  // A short waits for the speaker before its export starts, with the search's progress shown.
  const speakerForExport = async (progress: (fraction: number) => void) => {
    if (!editor.shorts) return;
    const listen = () => {
      if (search.state.state === "finding") progress(search.state.fraction);
    };
    const stopListening = search.onChange(listen);
    try {
      await search.start();
    } finally {
      stopListening();
    }
  };
  const exporter = clip.facts.video ? exportView(clip, editor, pictureForExport, speakerForExport) : null;
  const exportButton = element("button", { type: "button", className: "primary", textContent: words.export.open, hidden: !exporter,
    onclick: () => {
      preview?.pause();
      exporter?.open();
    } });

  decodesOriginal = plan(clip);
  decodesOriginal.then(async (decodes) => {
    if (!clip.facts.video) return;
    if (!decodes) await proxyReady;
    previewAddress.resolve(mediaAddress(clip.id, decodes ? "original" : "proxy"));
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
    logProblem("clip_not_prepared", error);
    showProblem(words.clip.notStarted, "clip_not_prepared");
  });
  showStatus();
  showEdit();
  // Export is the screen's one filled button, top right, so it never competes with Clean up (gate on day 5).
  return element("section", { className: "clip", attributes: { "data-clip": clip.id } },
    element("div", { className: "clip-title" }, element("h1", { textContent: clip.name }), exportButton), status, problem,
    element("div", { className: "clip-body" }, previewPlace,
      element("div", { className: "clip-side" }, element("div", { className: "clip-side-inner" }, panel.element, transcript.element))),
    details, ...(exporter ? [exporter.element] : []));
}

/** Whether this computer's window can use the original, which decides the proxy and edit copy (ffmpeg-jobs.ts); the
 * jobs start once it's known. Usable means decoded here and timed from zero: a camera's MPEG-TS (.mts) keeps its clock's
 * own times, which the window reads as they are but FFmpeg starts at zero, so the picture would run a second or more
 * behind the words and the sound (the export's fresh review, 2026-11-24). Such a clip plays and exports from its copies. */
async function plan(clip: Clip): Promise<boolean> {
  let decodes = false;
  if (clip.facts.video) {
    const input = new Input({ source: new UrlSource(mediaAddress(clip.id, "original")), formats: ALL_FORMATS });
    try {
      const track = await input.getPrimaryVideoTrack();
      decodes = track ? (await track.canDecode()) && Math.abs(await input.getFirstTimestamp()) < 0.001 : false;
    } catch (error) {
      logProblem("clip_not_decodable", error); // a container the window can't read: an edit copy, then
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
