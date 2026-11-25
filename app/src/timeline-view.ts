/**
 * The timeline: what plays, as pieces across the width in the edit's own time, a mark where each cut joins two pieces,
 * and the playhead. Clicking moves the playhead there. Our own Canvas 2D (docs/research/engine-stack.md › 3); several
 * tracks join it with release 1.3.
 */
import { element } from "./dom.ts";
import type { ClipEditor } from "./edit/clip-editor.ts";
import { sourceAt, timelineAt, timelineLength } from "./edit/timeline.ts";
import { flicksOf, secondsOf, type Flicks } from "./shared/time.ts";
import { words } from "./words.ts";

export function timelineView(editor: ClipEditor, seek: (seconds: number) => void): { element: HTMLElement; render: () => void; at: (seconds: number) => void } {
  const canvas = element("canvas", { className: "timeline-canvas", attributes: { role: "slider", "aria-label": words.timeline.label, tabindex: "0" } });
  let playhead: Flicks = 0 as Flicks;

  const draw = () => {
    const context = canvas.getContext("2d");
    if (!context) return;
    const width = Math.max(1, Math.round(canvas.clientWidth * devicePixelRatio));
    const height = Math.max(1, Math.round(canvas.clientHeight * devicePixelRatio));
    if (canvas.width !== width || canvas.height !== height) [canvas.width, canvas.height] = [width, height];
    const style = getComputedStyle(canvas);
    const colour = (name: string) => style.getPropertyValue(name).trim();
    context.clearRect(0, 0, width, height);
    const parts = editor.segments;
    const total = timelineLength(parts) || 1;
    const scale = width / total;
    let x = 0;
    const gap = Math.max(1, devicePixelRatio);
    for (const [index, part] of parts.entries()) {
      const length = (part.to - part.from) * scale;
      context.fillStyle = colour("--timeline-piece");
      context.fillRect(x + (index ? gap : 0), height * 0.2, Math.max(1, length - (index ? gap : 0)), height * 0.6);
      // A cut joins this piece to the last: marked where they meet.
      if (index) {
        context.fillStyle = colour("--accent");
        context.fillRect(x - gap / 2, height * 0.1, gap * 2, height * 0.8);
      }
      x += length;
    }
    const at = timelineAt(parts, playhead);
    if (at !== null) {
      context.fillStyle = colour("--text");
      context.fillRect(Math.round(at * scale) - gap, 0, gap * 2, height);
    }
    canvas.setAttribute("aria-valuetext", `${Math.round(secondsOf((at ?? 0) as Flicks))} s`);
  };

  canvas.addEventListener("click", (event) => {
    const parts = editor.segments;
    const box = canvas.getBoundingClientRect();
    const time = ((event.clientX - box.left) / box.width) * timelineLength(parts);
    const at = sourceAt(parts, Math.max(0, Math.floor(time)) as Flicks);
    if (at) seek(secondsOf(at.time));
  });
  new ResizeObserver(draw).observe(canvas);

  return {
    element: element("div", { className: "timeline" }, canvas),
    render: draw,
    at: (seconds) => {
      playhead = flicksOf(seconds);
      draw();
    },
  };
}
