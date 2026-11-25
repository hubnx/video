/**
 * The export dialog: the size (the clip's own up to 4K by default, at YouTube's recommended rates), how captions go out
 * (burned in, as an .srt file beside the video, or not at all), then the save dialog, real progress with the time left
 * and Cancel, and at the end Show in folder. The picture is made here (export/export-video.ts), the sound and the final
 * file in the main process (electron/exports.ts).
 */
import { element } from "./dom.ts";
import { logProblem } from "./problems.ts";
import type { ClipEditor } from "./edit/clip-editor.ts";
import { exportPicture } from "./export/export-video.ts";
import { CAPTION_OUTPUTS, EXPORT_SIZES, exportBitrate, exportDimensions, sizesFor, type CaptionOutput, type ExportSize } from "./export/presets.ts";
import { srt } from "./export/srt.ts";
import type { ExportDestination } from "./shared/app-api.ts";
import type { Clip } from "./shared/media.ts";
import { steadyRate } from "./shared/frame-rate.ts";
import { secondsOf } from "./shared/time.ts";
import { captionLines } from "./shared/transcript.ts";
import { words } from "./words.ts";

/** The dialog, opened by `open()`. `picture` gives the address the picture is read from once it's ready (the original,
 * or its edit copy when this computer can't use the original), telling `progress` how the wait is going. */
export function exportView(clip: Clip, editor: ClipEditor,
  picture: (progress: (fraction: number, secondsLeft: number | null) => void) => Promise<string>): { element: HTMLDialogElement; open: () => void } {
  const video = clip.facts.video!;
  const [uprightWidth, uprightHeight] = video.rotation % 180 === 0 ? [video.width, video.height] : [video.height, video.width];
  const sizes = sizesFor(uprightWidth, uprightHeight);
  let size: ExportSize = sizes.at(-1)!; // the clip's own size, up to 4K
  let captions: CaptionOutput = "burnedIn";
  const frameRate = steadyRate(video.frameRate).value;
  // Every row puts its label the same way: beside its control, or above it in a narrow window (styles.css).
  const row = (label: string, control: HTMLElement) => element("div", { className: "export-row" }, element("span", { className: "label", textContent: label }), control);
  const choice = <Value extends string>(label: string, options: readonly Value[], names: Record<Value, string>, get: () => Value, set: (value: Value) => void) => {
    const group = element("div", { className: "segmented", attributes: { role: "radiogroup", "aria-label": label } },
      ...options.map((option) => element("button", { type: "button", textContent: names[option], dataset: { value: option }, attributes: { role: "radio" },
        onclick: () => {
          set(option);
          refresh();
          showDetails();
        } })));
    const refresh = () => {
      for (const button of group.querySelectorAll<HTMLElement>("button")) button.setAttribute("aria-checked", String(button.dataset.value === get()));
    };
    refresh();
    return row(label, group);
  };
  // A clip with one size to give says what it is, rather than offering a choice of one (and a smaller clip isn't 720p).
  const onlySize = () => {
    const { width, height } = exportDimensions(uprightWidth, uprightHeight, size);
    return row(words.export.size, element("span", { textContent: `${Math.min(width, height)}p` }));
  };
  // Where it saves, said before it saves, with the way to change it (gate 7).
  let destination: ExportDestination | null = null;
  const placeName = element("span", { className: "export-place-name" });
  const change = element("button", { type: "button", className: "quiet", textContent: words.export.change, onclick: async () => {
    if (!destination) return;
    const picked = await window.video.changeExportDestination(clip.id, destination.path);
    if (picked) showDestination(picked);
  } });
  const showDestination = (shown: ExportDestination | null) => {
    destination = shown;
    placeName.textContent = shown ? words.export.place(shown.folderName, shown.fileName) : "";
    start.disabled = !shown;
    change.disabled = !shown;
  };
  // The format's facts, for whoever wants them, out of everyone else's way.
  const detailsText = element("p");
  const showDetails = () => {
    const dimensions = exportDimensions(uprightWidth, uprightHeight, size);
    detailsText.textContent = words.export.detailsText(dimensions.width, dimensions.height, frameRate, exportBitrate(size, frameRate) / 1_000_000);
  };
  const choices = element("div", { className: "export-choices" },
    sizes.length > 1
      ? choice(words.export.size, sizes, Object.fromEntries((Object.keys(EXPORT_SIZES) as ExportSize[]).map((each) => [each, each])) as Record<ExportSize, string>, () => size, (value) => (size = value))
      : onlySize(),
    choice(words.export.captions, CAPTION_OUTPUTS, words.export.captionOutputs, () => captions, (value) => (captions = value)),
    row(words.export.savesTo, element("span", { className: "export-place" }, placeName, change)),
    element("p", { className: "export-note", textContent: words.export.youtube }),
    element("details", { className: "export-details" }, element("summary", { textContent: words.export.details }), detailsText));
  const status = element("p", { className: "export-status", attributes: { role: "status" } });
  const bar = element("progress", { max: 1, value: 0, hidden: true });
  const start = element("button", { type: "button", className: "primary", textContent: words.export.start });
  const cancel = element("button", { type: "button", textContent: words.export.cancel });
  const show = element("button", { type: "button", className: "primary", textContent: words.export.show, hidden: true });
  const dialog = element("dialog", { className: "export", attributes: { "aria-labelledby": "export-heading" } },
    element("h2", { id: "export-heading", textContent: words.export.heading }), choices, status, bar,
    element("div", { className: "export-buttons" }, cancel, show, start));

  let running: AbortController | null = null;
  let exportId: number | null = null;

  cancel.addEventListener("click", () => {
    if (running) {
      running.abort();
      return;
    }
    dialog.close();
  });
  show.addEventListener("click", () => {
    if (destination) void window.video.showExported(destination.path);
  });
  start.addEventListener("click", () => void run());

  const run = async () => {
    if (!destination) return;
    const target = destination;
    running = new AbortController();
    const signal = running.signal;
    // The picture's loop sees the signal itself; the sound is FFmpeg's in the main process, which only this stops.
    signal.addEventListener("abort", () => {
      if (exportId !== null) void window.video.cancelExport(exportId);
    });
    start.hidden = true;
    choices.hidden = true;
    bar.hidden = false;
    const startedAt = performance.now();
    const say = (stage: string, fraction: number, scale: [number, number]) => {
      // Picture and sound share the bar: the picture its first nine-tenths, the sound and the final file the rest.
      const overall = scale[0] + fraction * (scale[1] - scale[0]);
      bar.value = overall;
      const elapsed = (performance.now() - startedAt) / 1000;
      const left = overall > 0.03 ? elapsed / overall - elapsed : null;
      status.textContent = left === null ? stage : `${stage} ${words.clip.timeLeft(left)}`;
    };
    try {
      status.textContent = words.export.preparing;
      bar.value = 0;
      const stopped = new Promise<never>((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error("EXPORT_CANCELLED"))));
      const address = await Promise.race([stopped, picture((fraction, secondsLeft) => {
        bar.value = fraction;
        status.textContent = secondsLeft === null ? words.export.preparing : `${words.export.preparing} ${words.clip.timeLeft(secondsLeft)}`;
      })]);
      const segments = editor.segments;
      const dimensions = exportDimensions(uprightWidth, uprightHeight, size);
      const lines = captionLines(editor.captionWords);
      exportId = await window.video.beginExport(target.path);
      const id = exportId;
      await exportPicture({ address, segments, ...dimensions, frameRate, bitrate: exportBitrate(size, frameRate),
        captions: captions === "burnedIn" && lines.length ? { lines, style: editor.captionStyle } : null },
      (position, data) => window.video.writeExport(id, position, data), (fraction) => say(words.export.picture, fraction, [0, 0.9]), signal);
      const stopListening = window.video.onExportProgress((progressId, fraction) => {
        if (progressId === id) say(words.export.sound, fraction, [0.9, 1]);
      });
      try {
        await window.video.finishExport(id, clip.id, {
          stretches: segments.map((segment) => ({ from: secondsOf(segment.from), to: secondsOf(segment.to) })),
          cleanVoice: editor.cleanVoice,
        }, segments.reduce((sum, segment) => sum + secondsOf(segment.to) - secondsOf(segment.from), 0),
        captions === "file" ? srt(editor.captionWords, segments) : null);
      } finally {
        stopListening();
      }
      // Done: the one thing left is to find the file, so Show in folder is the main button and the choices stay away.
      status.textContent = words.export.done(target.fileName);
      cancel.textContent = words.export.close;
      show.hidden = false;
    } catch (error) {
      if (exportId !== null) await window.video.cancelExport(exportId);
      const cancelled = signal.aborted;
      if (!cancelled) logProblem("export_failed", error);
      showChoices();
      status.textContent = cancelled ? words.export.cancelled : words.export.failed;
    } finally {
      running = null;
      exportId = null;
      bar.hidden = true;
    }
  };

  const showChoices = () => {
    choices.hidden = false;
    start.hidden = false;
    show.hidden = true;
    cancel.textContent = words.export.cancel;
    status.textContent = "";
  };

  return {
    element: dialog,
    open: () => {
      showChoices();
      showDetails();
      // Asked afresh each time: the last export now holds its name, so this one gets the next.
      showDestination(null);
      void window.video.exportDestination(clip.id).then(showDestination, (error: unknown) => {
        logProblem("export_destination_unknown", error);
        status.textContent = words.export.failed;
      });
      dialog.showModal();
    },
  };
}
