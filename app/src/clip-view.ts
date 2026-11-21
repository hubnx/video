/**
 * An opened video: its preview, and the jobs that prepare it in the background, each with its real progress. The
 * preview plays the original when this computer decodes it, and otherwise waits for the proxy (ffmpeg-jobs.ts).
 */
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { mediaAddress } from "./shared/app-api.ts";
import type { Clip, JobKind, JobProgress } from "./shared/media.ts";
import { element } from "./dom.ts";
import { previewView } from "./preview-view.ts";
import { words } from "./words.ts";

/** The view of one video; it lives as long as the window does (opening another comes with the project, day 6). */
export function clipView(clip: Clip): HTMLElement {
  const jobs = element("ul", { className: "jobs", attributes: { "aria-label": clip.name } });
  const rows = new Map<JobKind, HTMLElement>();
  const show = (progress: JobProgress) => {
    if (progress.clipId !== clip.id) return;
    let row = rows.get(progress.kind);
    if (!row) {
      row = element("li", { className: "job" });
      rows.set(progress.kind, row);
      jobs.append(row);
    }
    row.replaceChildren(element("span", { textContent: words.clip.jobs[progress.kind] }), element("span", { className: "job-state", textContent: stateWords(progress) }));
    if (progress.state === "running") row.append(element("progress", { value: progress.fraction, max: 1 }));
  };
  const preview = element("div", { className: "preview-place" });
  let proxyDone: () => void = () => undefined;
  const proxyReady = new Promise<void>((resolve) => (proxyDone = resolve));
  window.video.onJobProgress((progress) => {
    show(progress);
    if (progress.clipId === clip.id && progress.kind === "proxy" && progress.state === "done") proxyDone();
  });
  const problem = element("p", { className: "clip-problem", attributes: { role: "alert" }, hidden: true });
  plan(clip).then(async (decodes) => {
    if (!clip.facts.video) return;
    if (!decodes) await proxyReady;
    const shown = await previewView(mediaAddress(clip.id, decodes ? "original" : "proxy"), clip.facts.durationSeconds);
    if (shown) preview.replaceChildren(shown);
  }).catch((error: unknown) => {
    window.video.logProblem("clip_not_prepared", error);
    problem.textContent = words.clip.notStarted;
    problem.hidden = false;
  });
  return element("section", { className: "clip", attributes: { "data-clip": clip.id } }, element("h1", { textContent: clip.name }), preview, jobs, problem);
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
