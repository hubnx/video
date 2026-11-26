/**
 * The timeline: what plays across the width in the edit's own time, drawn as its sound; proposed silences hatched before
 * they're cut, a mark where each cut joins two pieces, and the playhead. Clicking moves the playhead there. Punch-ins
 * (smooth jump cuts) are blocks in a strip along the top: dragging a block's end shortens it, and a selected block goes
 * with Delete. Our own Canvas 2D (docs/research/engine-stack.md › 3); several tracks join it with release 1.3.
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

/** The punch-ins' strip along the top, in CSS pixels, and how near an end a press must be to drag it. */
const ZOOM_STRIP = 12;
const GRAB = 6;

export function timelineView(editor: ClipEditor, seek: (seconds: number) => void): { element: HTMLElement; render: () => void; at: (seconds: number) => void;
  deleteSelectedZoom: () => boolean } {
  const canvas = element("canvas", { className: "timeline-canvas", attributes: { role: "slider", "aria-label": words.timeline.label, tabindex: "0" } });
  let playhead: Flicks = 0 as Flicks;
  let selected: number | null = null;
  // A drag in progress: which punch-in, which end, and where that end is now (clip time), drawn before it's kept.
  let dragging: { index: number; end: "start" | "end"; at: Flicks } | null = null;

  /** Where each punch-in shows on the strip, in canvas pixels: the part of it that plays. */
  const zoomBoxes = (scale: number) => {
    const parts = editor.segments;
    return editor.edit.zooms.map((zoom, index) => {
      const start = dragging?.index === index && dragging.end === "start" ? dragging.at : zoom.start;
      const end = dragging?.index === index && dragging.end === "end" ? dragging.at : zoom.end;
      let from: number | null = null;
      let to = 0;
      let position = 0;
      for (const part of parts) {
        const [overlapStart, overlapEnd] = [Math.max(part.from, start), Math.min(part.to, end)];
        if (overlapEnd > overlapStart) {
          from ??= position + (overlapStart - part.from);
          to = position + (overlapEnd - part.from);
        }
        position += part.to - part.from;
      }
      return from === null ? null : { index, left: from * scale, right: to * scale };
    });
  };

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
    // With punch-ins, the sound takes the height under their strip.
    const strip = editor.edit.zooms.length ? ZOOM_STRIP * devicePixelRatio : 0;
    const middle = strip + (height - strip) / 2;
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
        const reach = Math.max(0.04, Math.min(1, (loudest + 60) / 60)) * (middle - strip - 2 * devicePixelRatio);
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
    // Punch-ins: filled blocks on the strip, the selected one outlined.
    for (const box of zoomBoxes(scale)) {
      if (!box) continue;
      context.fillStyle = colour("--accent");
      context.globalAlpha = 0.45;
      context.fillRect(box.left, devicePixelRatio, Math.max(2, box.right - box.left), strip - 2 * devicePixelRatio);
      context.globalAlpha = 1;
      if (box.index === selected) {
        context.strokeStyle = colour("--text");
        context.lineWidth = devicePixelRatio * 1.5;
        context.strokeRect(box.left, devicePixelRatio, Math.max(2, box.right - box.left), strip - 2 * devicePixelRatio);
      }
    }
    canvas.title = editor.edit.zooms.length ? words.timeline.zooms : "";
    const at = timelineAt(parts, playhead);
    if (at !== null) {
      context.fillStyle = colour("--text");
      context.fillRect(Math.round(at * scale) - gap, 0, gap * 2, height);
    }
    canvas.setAttribute("aria-valuetext", `${Math.round(secondsOf((at ?? 0) as Flicks))} s`);
  };

  // A press on the strip selects or drags a punch-in; anywhere else it moves the playhead.
  const onStrip = (event: PointerEvent) => editor.edit.zooms.length > 0 && event.clientY - canvas.getBoundingClientRect().top < ZOOM_STRIP;
  const clipTimeAt = (clientX: number): Flicks | null => {
    const parts = editor.segments;
    const box = canvas.getBoundingClientRect();
    const time = Math.min(Math.max(0, (clientX - box.left) / box.width), 1) * timelineLength(parts);
    return sourceAt(parts, Math.max(0, Math.floor(time)) as Flicks)?.time ?? null;
  };
  canvas.addEventListener("pointerdown", (event) => {
    if (!onStrip(event)) {
      selected = null;
      const at = clipTimeAt(event.clientX);
      if (at !== null) seek(secondsOf(at));
      draw();
      return;
    }
    const box = canvas.getBoundingClientRect();
    const x = (event.clientX - box.left) * (canvas.width / box.width);
    const scale = canvas.width / (timelineLength(editor.segments) || 1);
    const grab = GRAB * devicePixelRatio;
    const hit = zoomBoxes(scale).find((each) => each && x >= each.left - grab && x <= each.right + grab) ?? null;
    selected = hit?.index ?? null;
    if (hit) {
      const zoom = editor.edit.zooms[hit.index]!;
      if (Math.abs(x - hit.left) <= grab) dragging = { index: hit.index, end: "start", at: zoom.start };
      else if (Math.abs(x - hit.right) <= grab) dragging = { index: hit.index, end: "end", at: zoom.end };
      if (dragging) canvas.setPointerCapture(event.pointerId);
    }
    canvas.focus();
    draw();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const at = clipTimeAt(event.clientX);
    if (at === null) return;
    const zoom = editor.edit.zooms[dragging.index]!;
    // Shorter only: a punch-in never reaches past the cut it was made for.
    dragging.at = (dragging.end === "start" ? Math.min(Math.max(at, zoom.start), zoom.end) : Math.max(Math.min(at, zoom.end), zoom.start)) as Flicks;
    draw();
  });
  canvas.addEventListener("pointerup", () => {
    if (!dragging) return;
    const { index, end, at } = dragging;
    dragging = null;
    const zoom = editor.edit.zooms[index]!;
    // One step of undo for the whole drag; a drag down to nothing deletes it.
    if (end === "start" ? at >= zoom.end : at <= zoom.start) editor.deleteZoom(index);
    else editor.shortenZoom(index, end === "start" ? at : zoom.start, end === "end" ? at : zoom.end);
  });
  new ResizeObserver(draw).observe(canvas);

  return {
    element: element("div", { className: "timeline" }, canvas),
    render: () => {
      if (selected !== null && selected >= editor.edit.zooms.length) selected = null; // undone or remade
      draw();
    },
    deleteSelectedZoom: () => {
      if (selected === null || !editor.edit.zooms[selected]) return false;
      const index = selected;
      selected = null;
      editor.deleteZoom(index);
      return true;
    },
    at: (seconds) => {
      playhead = flicksOf(seconds);
      draw();
    },
  };
}
