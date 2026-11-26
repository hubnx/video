/**
 * Smooth jump cuts through the editor (src/edit/clip-editor.ts): punch-ins are made at Clean up once the speaker is
 * known, made again at a new spacing, gone when switched off or every silence is put back, shortened only inside
 * themselves, and every change one step of undo.
 */
import { describe, expect, it } from "vitest";
import { ClipEditor } from "../src/edit/clip-editor.ts";
import { FACE_DETECTOR, FACE_STEP_SECONDS, type FaceBox } from "../src/shared/faces.ts";
import { flicksOf, type Flicks } from "../src/shared/time.ts";
import type { SoundMap } from "../src/shared/transcript.ts";

const SECONDS = 40;
/** Talk with three long pauses, so Clean up makes three cuts and four stretches. */
const QUIET: [number, number][] = [[8, 11], [18, 21], [28, 31]];

function sound(): SoundMap {
  const levels = Float32Array.from({ length: SECONDS * 50 }, (_, index) => (QUIET.some(([from, to]) => index / 50 >= from && index / 50 < to) ? -60 : -20));
  const voice = [];
  let at = 0;
  for (const [from, to] of QUIET) {
    voice.push({ start: flicksOf(at), end: flicksOf(from) });
    at = to;
  }
  voice.push({ start: flicksOf(at), end: flicksOf(SECONDS) });
  return { levels, voice };
}

function editor(): ClipEditor {
  const made = new ClipEditor("c", flicksOf(SECONDS), null);
  made.setHeard([], sound());
  const face: FaceBox = { x: 0.55, y: 0.25, width: 0.1, height: 0.15 };
  made.setFaces({ detector: FACE_DETECTOR, samples: Array.from({ length: SECONDS / FACE_STEP_SECONDS + 1 }, () => [face]) });
  return made;
}

describe("smooth jump cuts in the editor", () => {
  it("makes no punch-in while the switch is off", () => {
    const made = editor();
    made.cutSilences();
    expect(made.edit.zooms).toEqual([]);
  });

  it("punches in on every second stretch after a cut, at Clean up and when switched on after it", () => {
    const before = editor();
    before.setSmoothCuts(true);
    before.cutSilences();
    expect(before.edit.zooms).toHaveLength(2);
    expect(before.edit.zooms[0]!.centre.x).toBeCloseTo(0.6);
    expect(before.edit.zooms[0]!.centre.y).toBeCloseTo(0.325);
    const after = editor();
    after.cutSilences();
    after.setSmoothCuts(true);
    expect(after.edit.zooms).toEqual(before.edit.zooms);
  });

  it("takes every punch-in away when switched off, or when every silence is put back", () => {
    const made = editor();
    made.setSmoothCuts(true);
    made.cutSilences();
    made.setSmoothCuts(false);
    expect(made.edit.zooms).toEqual([]);
    made.setSmoothCuts(true);
    made.restoreSilences();
    expect(made.edit.zooms).toEqual([]);
  });

  it("makes them again at a new spacing, as the cuts move", () => {
    const made = editor();
    made.setSmoothCuts(true);
    made.cutSilences();
    const natural = made.edit.zooms[0]!.start;
    made.setSpacing("relaxed");
    expect(made.edit.zooms).toHaveLength(2);
    expect(made.edit.zooms[0]!.start).toBeLessThan(natural); // a relaxed cut leaves more pause, so the stretch starts sooner
  });

  it("shortens a punch-in only inside itself, deletes one, and undoes each as one step", () => {
    const made = editor();
    made.setSmoothCuts(true);
    made.cutSilences();
    const zoom = made.edit.zooms[0]!;
    made.shortenZoom(0, (zoom.start - flicksOf(5)) as Flicks, (zoom.end - flicksOf(2)) as Flicks);
    expect(made.edit.zooms[0]).toMatchObject({ start: zoom.start, end: zoom.end - flicksOf(2) });
    made.deleteZoom(1);
    expect(made.edit.zooms).toHaveLength(1);
    made.undo();
    expect(made.edit.zooms).toHaveLength(2);
    made.undo();
    expect(made.edit.zooms[0]).toEqual(zoom);
  });

  it("keeps the person's own changes through a single cut put back", () => {
    const made = editor();
    made.setSmoothCuts(true);
    made.cutSilences();
    made.deleteZoom(0);
    made.toggle(made.silences[0]!);
    expect(made.edit.zooms).toHaveLength(1);
  });
});
