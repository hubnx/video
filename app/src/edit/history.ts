/**
 * Unlimited undo and redo for the edit, from Immer's patches: each change records how to go forward and back, so a
 * long session's history costs the changes, not a copy of the whole edit per step (docs/plan.md › How it's built).
 */
import { applyPatches, enablePatches, produceWithPatches, type Draft, type Patch } from "immer";

enablePatches();

interface Step {
  forward: Patch[];
  back: Patch[];
}

export class History<State extends object> {
  private current: State;
  private readonly done: Step[] = [];
  private readonly undone: Step[] = [];

  constructor(initial: State) {
    this.current = initial;
  }

  get state(): State {
    return this.current;
  }

  /** Makes a change; a change that changes nothing isn't a step to undo. A new change ends what could be redone. */
  change(recipe: (draft: Draft<State>) => void): State {
    const [next, forward, back] = produceWithPatches(this.current, recipe);
    if (!forward.length) return this.current;
    this.current = next as State;
    this.done.push({ forward, back });
    this.undone.length = 0;
    return this.current;
  }

  get canUndo(): boolean {
    return this.done.length > 0;
  }

  get canRedo(): boolean {
    return this.undone.length > 0;
  }

  undo(): State {
    const step = this.done.pop();
    if (!step) return this.current;
    this.current = applyPatches(this.current, step.back);
    this.undone.push(step);
    return this.current;
  }

  redo(): State {
    const step = this.undone.pop();
    if (!step) return this.current;
    this.current = applyPatches(this.current, step.forward);
    this.done.push(step);
    return this.current;
  }
}
