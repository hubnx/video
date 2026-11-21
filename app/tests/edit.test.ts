/**
 * The edit and its history (src/edit/). Day 5's proof (docs/plan.md › Build order): undo after any sequence of edits
 * restores the project exactly. And every edit maps timeline time to the right moment of the clip.
 */
import { describe, expect, it } from "vitest";
import { History } from "../src/edit/history.ts";
import { deleteSegment, removeFromClip, sourceAt, splitAt, timelineLength, wholeClip, type Edit } from "../src/edit/timeline.ts";
import { flicksOf, secondsOf } from "../src/shared/time.ts";

const s = flicksOf;
const lengths = (edit: Edit) => edit.segments.map((segment) => [secondsOf(segment.from), secondsOf(segment.to)]);

describe("editing the timeline", () => {
  it("takes a silence out of the middle of the clip, splitting it in two", () => {
    const edit = wholeClip("a", s(10));
    removeFromClip(edit, "a", { start: s(4), end: s(6) });
    expect(lengths(edit)).toEqual([[0, 4], [6, 10]]);
    expect(secondsOf(timelineLength(edit))).toBe(8);
  });

  it("maps a moment of the timeline to the clip's own time across a cut", () => {
    const edit = wholeClip("a", s(10));
    removeFromClip(edit, "a", { start: s(4), end: s(6) });
    expect(secondsOf(sourceAt(edit, s(5))!.time)).toBe(7);
    expect(sourceAt(edit, s(8))).toBeNull();
  });

  it("removes a stretch spanning several segments, and leaves other clips alone", () => {
    const edit: Edit = { segments: [{ clipId: "a", from: s(0), to: s(5) }, { clipId: "b", from: s(0), to: s(3) }, { clipId: "a", from: s(5), to: s(10) }] };
    removeFromClip(edit, "a", { start: s(4), end: s(7) });
    expect(edit.segments.map((segment) => [segment.clipId, secondsOf(segment.from), secondsOf(segment.to)])).toEqual([["a", 0, 4], ["b", 0, 3], ["a", 7, 10]]);
  });

  it("splits where the playhead is, and not on a boundary", () => {
    const edit = wholeClip("a", s(10));
    splitAt(edit, s(3));
    splitAt(edit, s(3));
    expect(lengths(edit)).toEqual([[0, 3], [3, 10]]);
    deleteSegment(edit, 0);
    expect(lengths(edit)).toEqual([[3, 10]]);
  });
});

describe("undo and redo", () => {
  it("restores the edit exactly after any sequence of changes, and redoes them all", () => {
    const history = new History(wholeClip("a", s(60)));
    const initial = history.state;
    const states = [initial];
    const changes: ((edit: Edit) => void)[] = [
      (edit) => removeFromClip(edit, "a", { start: s(10), end: s(12) }),
      (edit) => splitAt(edit, s(30)),
      (edit) => deleteSegment(edit, 1),
      (edit) => removeFromClip(edit, "a", { start: s(1), end: s(2.5) }),
      (edit) => splitAt(edit, s(5)),
    ];
    for (const change of changes) states.push(history.change(change));
    for (let index = states.length - 2; index >= 0; index--) expect(history.undo()).toEqual(states[index]);
    expect(history.state).toEqual(initial);
    for (let index = 1; index < states.length; index++) expect(history.redo()).toEqual(states[index]);
  });

  it("doesn't count a change that changed nothing, and a new change ends the redo", () => {
    const history = new History(wholeClip("a", s(10)));
    history.change((edit) => splitAt(edit, s(0)));
    expect(history.canUndo).toBe(false);
    history.change((edit) => splitAt(edit, s(5)));
    history.undo();
    expect(history.canRedo).toBe(true);
    history.change((edit) => splitAt(edit, s(2)));
    expect(history.canRedo).toBe(false);
  });
});
