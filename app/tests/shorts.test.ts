/**
 * 1.1's shorts and smooth jump cuts, without a window (docs/design/1.1-shorts.md): the speaker followed through the
 * faces found, the 9:16 window's path, the views the compositor draws, and the punch-ins made at the cuts.
 */
import { describe, expect, it } from "vitest";
import { FACE_STEP_SECONDS, facesFrom, FACE_DETECTOR, type FaceBox } from "../src/shared/faces.ts";
import { migrate, PROJECT_FORMAT, type Segment } from "../src/shared/project.ts";
import { flicksOf } from "../src/shared/time.ts";
import { cameraAt, cameraPath, CAMERA_STEP_SECONDS } from "../src/shorts/camera.ts";
import { PUNCH_IN, punchIns } from "../src/shorts/smooth-cuts.ts";
import { HOLD_SECONDS, speakerTrack, type SpeakerPoint } from "../src/shorts/track.ts";
import { WHOLE } from "../src/preview/compositor.ts";
import { shortsView, shortsWidth, zoomedView } from "../src/shorts/view.ts";

const face = (centreX: number, centreY = 0.4, size = 0.2): FaceBox => ({ x: centreX - size / 2, y: centreY - size / 2, width: size, height: size });
const samplesFor = (seconds: number) => Math.round(seconds / FACE_STEP_SECONDS);

describe("the speaker's track", () => {
  it("follows the largest face, and keeps following it when another grows larger", () => {
    const track = speakerTrack([[face(0.3, 0.4, 0.2), face(0.7, 0.4, 0.1)], [face(0.3, 0.4, 0.2), face(0.7, 0.4, 0.3)]]);
    expect(track.map((point) => point?.x)).toEqual([0.3, 0.3]);
  });

  it("holds a lost face where it was for two seconds, then lets it go", () => {
    const lost = samplesFor(HOLD_SECONDS) + 2;
    const track = speakerTrack([[face(0.6)], ...Array.from({ length: lost }, () => [])]);
    expect(track[1]).toMatchObject({ x: 0.6, seen: false });
    expect(track[samplesFor(HOLD_SECONDS)]).toBeNull();
  });

  it("never takes up a stranger while the speaker is held, and takes them up once the speaker's gone", () => {
    const stranger = face(0.15, 0.4, 0.3);
    const samples = [[face(0.7)], ...Array.from({ length: samplesFor(HOLD_SECONDS) + 2 }, () => [stranger])];
    const track = speakerTrack(samples);
    expect(track[1]).toMatchObject({ x: 0.7, seen: false });
    expect(track.at(-1)).toMatchObject({ x: 0.15, seen: true });
  });

  it("follows a face walking across, a sample at a time", () => {
    const samples = Array.from({ length: 40 }, (_, index) => [face(0.2 + index * 0.015)]);
    const track = speakerTrack(samples);
    expect(track.every((point) => point?.seen)).toBe(true);
    expect(track.at(-1)!.x).toBeCloseTo(0.2 + 39 * 0.015);
  });
});

describe("the camera path", () => {
  const width = shortsWidth(1920, 1080); // 0.316
  const still = (x: number, seconds: number): SpeakerPoint[] => Array.from({ length: samplesFor(seconds) }, () => ({ x, y: 0.4, height: 0.2, seen: true }));

  it("starts on the speaker and never moves while they sit still", () => {
    const path = cameraPath(still(0.62, 10), [{ from: 0, to: 10 }], width);
    const centres = [...path.stretches[0]!.centres];
    expect(Math.max(...centres) - Math.min(...centres)).toBeLessThan(1e-6);
    expect(centres[0]).toBeCloseTo(0.62);
  });

  it("doesn't move for a lean inside the window's middle third", () => {
    const track = [...still(0.5, 2), ...still(0.5 + width / 7, 3)];
    const path = cameraPath(track, [{ from: 0, to: 5 }], width);
    expect(cameraAt(path, 4.9)).toBeCloseTo(0.5);
  });

  it("re-centres a speaker who moves out of the middle third, settling in under a second without passing them", () => {
    const track = [...still(0.4, 2), ...still(0.7, 3)];
    const path = cameraPath(track, [{ from: 0, to: 5 }], width);
    const after = [...path.stretches[0]!.centres].slice(Math.round(2 / CAMERA_STEP_SECONDS));
    expect(Math.max(...after)).toBeLessThanOrEqual(0.7 + 1e-6); // critically damped: no overshoot
    expect(cameraAt(path, 3)).toBeGreaterThan(0.7 - 0.02); // within 2% a second after the move
  });

  it("starts each stretch on the speaker, as a new shot", () => {
    const track = [...still(0.3, 4), ...still(0.8, 4)];
    const path = cameraPath(track, [{ from: 0, to: 3 }, { from: 5, to: 8 }], width);
    expect(cameraAt(path, 5)).toBeCloseTo(0.8, 5);
  });

  it("eases to the middle with no speaker, and keeps the window inside the picture", () => {
    const path = cameraPath([...still(0.99, 1), ...Array.from({ length: samplesFor(4) }, () => null)], [{ from: 0, to: 5 }], width);
    expect(cameraAt(path, 0)).toBeCloseTo(1 - width / 2);
    expect(cameraAt(path, 4.9)).toBeCloseTo(0.5, 2);
  });
});

describe("views", () => {
  it("frames 9:16 across a landscape picture, kept inside it", () => {
    expect(shortsView(1920, 1080, 0.5)).toEqual({ left: 0.5 - 0.31640625 / 2, top: 0, width: 0.31640625, height: 1 });
    expect(shortsView(1920, 1080, 0.99).left).toBeCloseTo(1 - 0.31640625);
  });

  it("shows a picture already as narrow as 9:16 whole across, the middle of its height", () => {
    expect(shortsView(1080, 1920, 0.2)).toEqual(WHOLE);
    const tall = shortsView(1000, 2000, 0.5);
    expect(tall.width).toBe(1);
    expect(tall.top).toBeCloseTo((1 - 1000 / (9 / 16) / 2000) / 2);
  });

  it("punches in about the face, which keeps its place, and stays inside the view", () => {
    const zoomed = zoomedView(WHOLE, { x: 0.25, y: 0.4 }, 1.25);
    expect((0.25 - zoomed.left) / zoomed.width).toBeCloseTo(0.25); // the face is still a quarter of the way across
    const edge = zoomedView(WHOLE, { x: 2, y: -1 }, 2);
    expect(edge).toEqual({ left: 0.5, top: 0, width: 0.5, height: 0.5 });
  });
});

describe("smooth jump cuts", () => {
  const seconds = (from: number, to: number): Segment => ({ clipId: "c", from: flicksOf(from), to: flicksOf(to) });
  const seen = (x: number, length: number): SpeakerPoint[] => Array.from({ length }, () => ({ x, y: 0.35, height: 0.2, seen: true }));

  it("punches in on every second stretch after a cut, about the face", () => {
    const parts = [seconds(0, 4), seconds(5, 9), seconds(10, 14), seconds(15, 19)];
    const zooms = punchIns(parts, seen(0.6, samplesFor(20)), []);
    expect(zooms.map((zoom) => [zoom.start, zoom.end])).toEqual([[parts[1]!.from, parts[1]!.to], [parts[3]!.from, parts[3]!.to]]);
    expect(zooms[0]).toMatchObject({ scale: PUNCH_IN, centre: { x: 0.6, y: 0.35 } });
  });

  it("leaves a stretch without a face as it is, and keeps the rhythm after it", () => {
    const track = [...seen(0.6, samplesFor(5)), ...Array.from({ length: samplesFor(5) }, () => null), ...seen(0.6, samplesFor(10))];
    const parts = [seconds(0, 4), seconds(5, 9), seconds(10, 14), seconds(15, 19)];
    expect(punchIns(parts, track, []).map((zoom) => zoom.start)).toEqual([parts[3]!.from]);
  });

  it("makes none without a cut", () => {
    expect(punchIns([seconds(0, 30)], seen(0.5, samplesFor(30)), [])).toEqual([]);
  });

  it("lays the person's changes over them by the cut each follows, and forgets one whose cut has gone", () => {
    const parts = [seconds(0, 4), seconds(5, 9), seconds(10, 14), seconds(15, 19)];
    const track = seen(0.6, samplesFor(20));
    const shortened = punchIns(parts, track, [{ at: parts[1]!.from, kind: "shortened", start: parts[1]!.from, end: flicksOf(7) }]);
    expect(shortened[0]).toMatchObject({ at: parts[1]!.from, start: parts[1]!.from, end: flicksOf(7) });
    expect(punchIns(parts, track, [{ at: parts[3]!.from, kind: "removed" }]).map((zoom) => zoom.at)).toEqual([parts[1]!.from]);
    expect(punchIns(parts, track, [{ at: flicksOf(5.5), kind: "removed" }])).toHaveLength(2); // its cut moved: no longer applies
  });
});

describe("stored faces and older projects", () => {
  it("trusts only faces from this detector, every box made of numbers", () => {
    expect(facesFrom({ detector: FACE_DETECTOR, samples: [[face(0.5)], []] })).not.toBeNull();
    expect(facesFrom({ detector: "another", samples: [] })).toBeNull();
    expect(facesFrom({ detector: FACE_DETECTOR, samples: [[{ x: "0" }]] })).toBeNull();
  });

  it("opens release 1's project with no punch-ins and shorts and smooth cuts off", () => {
    const old = { format: PROJECT_FORMAT, version: 1, clips: [], edit: { removed: [], splits: [] },
      choices: { spacing: "tight", captionStyle: "subtitles", hideFillersInCaptions: false, cleanVoice: true } };
    const opened = migrate(old);
    expect(opened.version).toBe(2);
    expect(opened.edit.zoomChanges).toEqual([]);
    expect(opened.choices).toMatchObject({ spacing: "tight", cleanVoice: true, shorts: false, smoothCuts: false });
  });
});
