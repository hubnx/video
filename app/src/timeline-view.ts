/**
 * The timeline: what plays across the width in the edit's own time, drawn as its sound; proposed silences hatched before
 * they're cut, a mark where each cut joins two pieces, and the playhead. Clicking moves the playhead there. Our own
 * Canvas 2D (docs/research/engine-stack.md › 3); several tracks join it with release 1.3.
 */
import { element } from "./dom.ts";
import type { ClipEditor } from "./edit/clip-editor.ts";
import { sourceAt, timelineAt, timelineLength } from "./edit/timeline.ts";
import { LEVEL_SECONDS } from "./shared/quiet.ts";
import { flicksOf, secondsOf, type Flicks } from "./shared/time.ts";
import { words } from "./words.ts";

/** Diagonal stripes in `colour`, for what a press would take out. */
function hatching(context: CanvasRenderingContext2D, colour: string): CanvasPattern | string {
  const size = Math.round(8 * devicePixelRatio);
  const tile = new OffscreenCanvas(size, size);
  const pen = tile.getContext("2d");
  if (!pen) return colour;
  pen.strokeStyle = colour;
  pen.lineWidth = Math.max(1, devicePixelRatio * 1.5);
  pen.beginPath();
  pen.moveTo(0, size);
  pen.lineTo(size, 0);
  pen.stroke();
  return context.createPattern(tile, "repeat") ?? colour;
}

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
    const scale = width / total; // pixels a flick
    const middle = height / 2;
    const levels = editor.sound?.levels;
    // The sound across what plays, a bar a pixel: each column's loudest 20 ms, -60 dB at the middle line to 0 dB at the
    // edges, so a pause reads as a flat stretch (gate on day 5: the strip shows the sound).
    context.fillStyle = colour("--timeline-wave");
    let x = 0;
    for (const part of parts) {
      const length = (part.to - part.from) * scale;
      for (let column = Math.floor(x); column < Math.ceil(x + length); column++) {
        const from = part.from + Math.max(0, (column - x) / scale);
        const to = part.from + Math.min(part.to - part.from, (column + 1 - x) / scale);
        let loudest = -90;
        if (levels) {
          const first = Math.floor(secondsOf(from as Flicks) / LEVEL_SECONDS);
          const last = Math.min(levels.length - 1, Math.ceil(secondsOf(to as Flicks) / LEVEL_SECONDS));
          for (let index = first; index <= last; index++) loudest = Math.max(loudest, levels[index] ?? -90);
        }
        const reach = Math.max(0.04, Math.min(1, (loudest + 60) / 60)) * (middle - 2 * devicePixelRatio);
        context.fillRect(column, middle - reach, 1, reach * 2);
      }
      x += length;
    }
    // Silences proposed and not cut yet: light hatched blocks, so the strip shows what Clean up will take out. Once cut
    // they're gaps between pieces, as a deleted piece is.
    context.save();
    context.fillStyle = hatching(context, colour("--accent"));
    for (const silence of editor.silences) {
      if (editor.isRemoved(silence)) continue;
      const start = timelineAt(parts, silence.start);
      if (start === null) continue;
      context.globalAlpha = 0.55;
      context.fillRect(start * scale, 0, (silence.end - silence.start) * scale, height);
    }
    context.restore();
    // Where a cut joins two pieces.
    context.fillStyle = colour("--accent");
    const gap = Math.max(1, devicePixelRatio);
    x = 0;
    for (const [index, part] of parts.entries()) {
      if (index) context.fillRect(Math.round(x) - gap, 0, gap * 2, height);
      x += (part.to - part.from) * scale;
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
