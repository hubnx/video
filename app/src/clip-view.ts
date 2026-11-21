/**
 * An opened video: one line saying what's being got ready and how long it'll take; the preview with its captions and
 * the transcript beside it, filling in as it's heard; the captions' style; each background job's detail behind
 * *Details* (gate 2 on the preparing screen, 2026-11-21). The preview plays the original when this computer decodes it,
 * and otherwise waits for the proxy (ffmpeg-jobs.ts).
 */
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { mediaAddress } from "./shared/app-api.ts";
import type { Clip, JobKind, JobProgress } from "./shared/media.ts";
import { captionLines, type TranscriptProgress, type Word } from "./shared/transcript.ts";
import { element } from "./dom.ts";
import { CAPTION_STYLES, type CaptionStyle } from "./preview/captions.ts";
import { previewView, type Preview } from "./preview-view.ts";
import { transcriptView } from "./transcript-view.ts";
import { words } from "./words.ts";

/** The view of one video; it lives as long as the window does (opening another comes with the project, day 6). */
export function clipView(clip: Clip): HTMLElement {
  const status = element("div", { className: "clip-status", attributes: { role: "status" } });
  const statusText = element("span");
  const statusBar = element("progress", { max: 1, value: 0 });
  status.append(statusText, statusBar);
  const problem = element("p", { className: "clip-problem", attributes: { role: "alert" }, hidden: true });
  const previewPlace = element("div", { className: "preview-place" });
  let preview: Preview | null = null;
  const transcript = transcriptView((seconds) => preview?.seek(seconds));
  const heard: Word[] = [];
  let style: CaptionStyle = "wordByWord";
  const styles = element("div", { className: "caption-styles", attributes: { role: "radiogroup", "aria-label": words.captions.style } },
    ...CAPTION_STYLES.map((each) => element("button", { type: "button", textContent: words.captions.styles[each],
      attributes: { role: "radio", "aria-checked": String(each === style) }, onclick: () => setStyle(each) })));
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
  const captions = () => preview?.setCaptions(captionLines(heard), style);
  const setStyle = (chosen: CaptionStyle) => {
    style = chosen;
    for (const button of styles.querySelectorAll("button")) button.setAttribute("aria-checked", String(button.textContent === words.captions.styles[chosen]));
    captions();
  };

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
  window.video.onTranscriptProgress((progress: TranscriptProgress) => {
    if (progress.clipId !== clip.id) return;
    activity.downloading = progress.state === "downloading" ? progress.done / progress.total : null;
    activity.hearing = progress.state === "hearing" ? progress.fraction : null;
    if (progress.state === "hearing") heard.push(...progress.words);
    if (progress.state === "done") heard.splice(0, heard.length, ...progress.transcript.words);
    if (progress.state === "hearing" || progress.state === "done") {
      transcript.show(heard);
      captions();
    }
    if (progress.state === "failed") showProblem(words.clip.transcriptFailed);
    showStatus();
  });
  const showProblem = (text: string) => {
    problem.textContent = text;
    problem.hidden = false;
  };

  plan(clip).then(async (decodes) => {
    if (!clip.facts.video) return;
    if (!decodes) await proxyReady;
    preview = await previewView(mediaAddress(clip.id, decodes ? "original" : "proxy"), clip.facts.durationSeconds);
    if (!preview) return;
    preview.onTime((seconds) => transcript.at(seconds));
    previewPlace.replaceChildren(preview.element, styles);
    captions();
  }).catch((error: unknown) => {
    window.video.logProblem("clip_not_prepared", error);
    showProblem(words.clip.notStarted);
  });
  showStatus();
  return element("section", { className: "clip", attributes: { "data-clip": clip.id } },
    element("h1", { textContent: clip.name }), status, problem,
    element("div", { className: "clip-body" }, previewPlace, transcript.element), details);
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
