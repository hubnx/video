/**
 * The edit and its history (src/edit/). Day 5's proof (docs/plan.md › Build order): undo after any sequence of edits
 * restores the project exactly; one cut among many accepted at once restores on its own; timeline time maps to the
 * right moment of the clip.
 */
import { describe, expect, it } from "vitest";
import { History } from "../src/edit/history.ts";
import { deleteSegment, emptyEdit, joinedSegments, remove, restore, segments, sourceAt, split, timelineAt, timelineLength } from "../src/edit/timeline.ts";
import type { Edit } from "../src/shared/project.ts";
import { flicksOf, secondsOf } from "../src/shared/time.ts";

const s = flicksOf;
const DURATION = s(10);
const parts = (edit: Edit) => segments(edit, "a", DURATION).map((segment) => [secondsOf(segment.from), secondsOf(segment.to)]);

describe("editing the timeline", () => {
  it("takes a silence out of the middle of the clip", () => {
    const edit = emptyEdit();
    remove(edit, { start: s(4), end: s(6), reason: "silence" });
    expect(parts(edit)).toEqual([[0, 4], [6, 10]]);
    expect(secondsOf(timelineLength(segments(edit, "a", DURATION)))).toBe(8);
  });

  it("maps timeline time to the clip's time across a cut, and back", () => {
    const edit = emptyEdit();
    remove(edit, { start: s(4), end: s(6), reason: "silence" });
    const playing = segments(edit, "a", DURATION);
    expect(secondsOf(sourceAt(playing, s(5))!.time)).toBe(7);
    expect(sourceAt(playing, s(8))).toBeNull();
    expect(secondsOf(timelineAt(playing, s(7))!)).toBe(5);
    expect(timelineAt(playing, s(5))).toBeNull(); // taken out
  });

  it("restores one cut of several on its own", () => {
    const edit = emptyEdit();
    for (const [start, end] of [[1, 2], [4, 6], [8, 9]]) remove(edit, { start: s(start!), end: s(end!), reason: "silence" });
    restore(edit, { start: s(4), end: s(6) });
    expect(parts(edit)).toEqual([[0, 1], [2, 8], [9, 10]]);
  });

  it("splits where asked, and deletes a piece by its place in what plays", () => {
    const edit = emptyEdit();
    split(edit, s(3));
    split(edit, s(3));
    expect(parts(edit)).toEqual([[0, 3], [3, 10]]);
    deleteSegment(edit, segments(edit, "a", DURATION), 0);
    expect(parts(edit)).toEqual([[3, 10]]);
  });

  it("merges overlapping cuts in what plays, so a stretch is never played twice or skipped wrongly", () => {
    const edit = emptyEdit();
    remove(edit, { start: s(2), end: s(5), reason: "silence" });
    remove(edit, { start: s(4), end: s(7), reason: "deleted" });
    expect(parts(edit)).toEqual([[0, 2], [7, 10]]);
  });
});

describe("undo and redo", () => {
  it("restores the edit exactly after any sequence of changes, and redoes them all", () => {
    const history = new History(emptyEdit());
    const states = [history.state];
    const changes: ((edit: Edit) => void)[] = [
      (edit) => remove(edit, { start: s(1), end: s(2), reason: "silence" }),
      (edit) => split(edit, s(5)),
      (edit) => deleteSegment(edit, segments(edit, "a", DURATION), 1),
      (edit) => restore(edit, { start: s(1), end: s(2) }),
      (edit) => remove(edit, { start: s(7), end: s(7.5), reason: "filler" }),
    ];
    for (const change of changes) states.push(history.change(change));
    for (let index = states.length - 2; index >= 0; index--) expect(history.undo()).toEqual(states[index]);
    for (let index = 1; index < states.length; index++) expect(history.redo()).toEqual(states[index]);
  });

  it("doesn't count a change that changed nothing, and a new change ends the redo", () => {
    const history = new History(emptyEdit());
    history.change((edit) => restore(edit, { start: s(1), end: s(2) }));
    expect(history.canUndo).toBe(false);
    history.change((edit) => split(edit, s(5)));
    history.undo();
    expect(history.canRedo).toBe(true);
    history.change((edit) => split(edit, s(2)));
    expect(history.canRedo).toBe(false);
  });
});

it("joins pieces a split left touching, so an export doesn't fade at a join nobody made, but keeps real cuts apart", () => {
  const edit = emptyEdit();
  split(edit, flicksOf(3));
  split(edit, flicksOf(5));
  remove(edit, { start: flicksOf(6), end: flicksOf(7), reason: "deleted" });
  const parts = segments(edit, "clip", flicksOf(10));
  expect(parts.length).toBe(4);
  expect(joinedSegments(parts).map((part) => [secondsOf(part.from), secondsOf(part.to)])).toEqual([[0, 6], [7, 10]]);
});
