/**
 * An opened video while the app prepares it: the jobs in the background, each with its real progress. The video
 * itself plays here from day 3 (docs/plan.md › Build order).
 */
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { mediaAddress } from "./shared/app-api.ts";
import type { Clip, JobKind, JobProgress } from "./shared/media.ts";
import { element } from "./dom.ts";
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
  window.video.onJobProgress(show);
  const problem = element("p", { className: "clip-problem", attributes: { role: "alert" }, hidden: true });
  plan(clip).catch(() => {
    // The main process logged why (its handler threw); the person learns the jobs didn't start.
    problem.textContent = words.clip.notStarted;
    problem.hidden = false;
  });
  return element("section", { className: "clip", attributes: { "data-clip": clip.id } }, element("h1", { textContent: clip.name }), jobs, problem);
}

/** Whether this computer's window can decode the original, which decides the proxy and edit copy (ffmpeg-jobs.ts). */
async function plan(clip: Clip): Promise<void> {
  let decodes = false;
  if (clip.facts.video) {
    const input = new Input({ source: new UrlSource(mediaAddress(clip.id, "original")), formats: ALL_FORMATS });
    try {
      const track = await input.getPrimaryVideoTrack();
      decodes = track ? await track.canDecode() : false;
    } catch {
      decodes = false; // a container the window can't read: an edit copy, then
    } finally {
      input.dispose();
    }
  }
  await window.video.planClip(clip.id, decodes);
}

function stateWords(progress: JobProgress): string {
  switch (progress.state) {
    case "waiting": return words.clip.waiting;
    case "running": return progress.secondsLeft === null ? words.clip.starting : words.clip.minutesLeft(Math.max(1, Math.round(progress.secondsLeft / 60)));
    case "done": return words.clip.done;
    case "failed": return words.clip.failed;
    case "cancelled": return words.clip.cancelled;
  }
}
