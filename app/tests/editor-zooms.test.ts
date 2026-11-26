/**
 * Smooth jump cuts through the editor (src/edit/clip-editor.ts): the punch-ins follow the cuts as they are (Clean up,
 * a new spacing, a cut put back), the switch and the faces, whenever each arrives; the person's own changes (taken away,
 * shortened) are kept by the cut each follows and undone like any edit (the 1.1 review, 2026-11-26).
 */
import { describe, expect, it } from "vitest";
import { ClipEditor } from "../src/edit/clip-editor.ts";
import { FACE_DETECTOR, FACE_STEP_SECONDS, type ClipFaces, type FaceBox } from "../src/shared/faces.ts";
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

const FACES: ClipFaces = { detector: FACE_DETECTOR,
  samples: Array.from({ length: SECONDS / FACE_STEP_SECONDS + 1 }, (): FaceBox[] => [{ x: 0.55, y: 0.25, width: 0.1, height: 0.15 }]) };

function editor({ faces = true } = {}): ClipEditor {
  const made = new ClipEditor("c", flicksOf(SECONDS), null);
  made.setHeard([], sound());
  if (faces) made.setFaces(FACES);
  return made;
}

describe("smooth jump cuts in the editor", () => {
  it("makes no punch-in while the switch is off", () => {
    const made = editor();
    made.cutSilences();
    expect(made.zooms).toEqual([]);
  });

  it("punches in on every second stretch after a cut, about the face, whether switched on before Clean up or after", () => {
    const before = editor();
    before.setSmoothCuts(true);
    before.cutSilences();
    expect(before.zooms).toHaveLength(2);
    expect(before.zooms[0]!.centre.x).toBeCloseTo(0.6);
    expect(before.zooms[0]!.centre.y).toBeCloseTo(0.325);
    const after = editor();
    after.cutSilences();
    after.setSmoothCuts(true);
    expect(after.zooms).toEqual(before.zooms);
  });

  it("makes them once the faces arrive, though Clean up came first", () => {
    const made = editor({ faces: false });
    made.setSmoothCuts(true);
    made.cutSilences();
    expect(made.zooms).toEqual([]);
    made.setFaces(FACES);
    expect(made.zooms).toHaveLength(2);
  });

  it("starts and ends every punch-in at a cut: putting one cut back joins two stretches, and the alternation follows", () => {
    const made = editor();
    made.setSmoothCuts(true);
    made.cutSilences();
    made.toggle(made.silences[1]!); // the cut that ended the first punch-in, put back
    const parts = made.segments;
    for (const zoom of made.zooms) {
      expect(parts.some((part) => part.from === zoom.start)).toBe(true);
      expect(parts.some((part) => part.to === zoom.end)).toBe(true);
    }
  });

  it("follows the switch whatever is undone", () => {
    const made = editor();
    made.setSmoothCuts(true);
    made.cutSilences();
    made.setSmoothCuts(false);
    expect(made.zooms).toEqual([]);
    made.undo(); // undoes Clean up, not the switch
    expect(made.smoothCuts).toBe(false);
    expect(made.zooms).toEqual([]);
  });

  it("makes them again at a new spacing, as the cuts move", () => {
    const made = editor();
    made.setSmoothCuts(true);
    made.cutSilences();
    const natural = made.zooms[0]!.start;
    made.setSpacing("relaxed");
    expect(made.zooms).toHaveLength(2);
    expect(made.zooms[0]!.start).toBeLessThan(natural); // a relaxed cut leaves more pause, so the stretch starts sooner
  });

  it("shortens a punch-in only inside itself, takes one away, keeps both through a cut put back elsewhere, and undoes each", () => {
    const made = editor();
    made.setSmoothCuts(true);
    made.cutSilences();
    const [first, second] = made.zooms;
    made.shortenZoom(first!.at, (first!.start - flicksOf(5)) as Flicks, (first!.end - flicksOf(2)) as Flicks);
    expect(made.zooms[0]).toMatchObject({ start: first!.start, end: first!.end - flicksOf(2) });
    made.deleteZoom(second!.at);
    expect(made.zooms.map((zoom) => zoom.at)).toEqual([first!.at]);
    made.undo();
    expect(made.zooms).toHaveLength(2);
    made.undo();
    expect(made.zooms[0]).toEqual(first);
  });

  it("takes a punch-in away when it's shortened to nothing", () => {
    const made = editor();
    made.setSmoothCuts(true);
    made.cutSilences();
    const first = made.zooms[0]!;
    made.shortenZoom(first.at, first.end, first.end);
    expect(made.zooms.map((zoom) => zoom.at)).not.toContain(first.at);
  });
});
