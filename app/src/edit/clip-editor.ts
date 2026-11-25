/**
 * One clip's editing, in one place: the edit with its undo history, the words, the sound map and the clean-up's
 * spacing. The transcript, the captions, the preview's playing and the timeline all read what they show from here, and
 * every change goes through here, so each is one step of undo and every view hears of it.
 */
import type { Cut, Stretch } from "../shared/cuts.ts";
import { DEFAULT_CHOICES, type Choices, type Edit, type Segment } from "../shared/project.ts";
import type { CaptionStyle } from "../preview/captions.ts";
import type { Flicks } from "../shared/time.ts";
import type { SoundMap, Word } from "../shared/transcript.ts";
import { fillerCuts, isEnglish, isFiller, silenceProposals, type FillerCut, type Spacing } from "./cleanup.ts";
import { History } from "./history.ts";
import { deleteSegment, emptyEdit, remove, restore, segments, split } from "./timeline.ts";

export class ClipEditor {
  private readonly history: History<Edit>;
  private readonly listeners: (() => void)[] = [];
  private readonly clipId: string;
  private readonly duration: Flicks;
  words: Word[] = [];
  sound: SoundMap | null = null;
  spacing: Spacing;
  captionStyle: CaptionStyle;
  /** Worked out once per change of words, sound or spacing, not at every read: an hour's sound map is 180,000 levels. */
  english = false;
  silences: Cut[] = [];
  fillers: FillerCut[] = [];
  /** Hides "um" and "uh" from the captions (English only), on by default: most creators don't want them on screen even
   * when they keep them in the sound (gate on day 4, 2026-11-21). */
  hideFillersInCaptions: boolean;

  /** `saved`: the clip's project as last saved, opened again; otherwise a fresh edit with the defaults. */
  constructor(clipId: string, duration: Flicks, saved: { edit: Edit; choices: Choices } | null) {
    this.clipId = clipId;
    this.duration = duration;
    this.history = new History<Edit>(saved?.edit ?? emptyEdit());
    const choices = saved?.choices ?? DEFAULT_CHOICES;
    this.spacing = choices.spacing;
    this.captionStyle = choices.captionStyle;
    this.hideFillersInCaptions = choices.hideFillersInCaptions;
  }

  get choices(): Choices {
    return { spacing: this.spacing, captionStyle: this.captionStyle, hideFillersInCaptions: this.hideFillersInCaptions };
  }

  setCaptionStyle(style: CaptionStyle): void {
    this.captionStyle = style;
    this.changed();
  }

  onChange(listener: () => void): void {
    this.listeners.push(listener);
  }

  get edit(): Edit {
    return this.history.state;
  }

  /** What plays, in order. */
  get segments(): Segment[] {
    return segments(this.edit, this.clipId, this.duration);
  }

  /** The silences proposed at the chosen spacing, whether cut yet or not; the possible "um"s, in English only (none when
   * the language can't be told). */
  private propose(): void {
    this.english = isEnglish(this.words);
    this.silences = this.sound ? silenceProposals(this.sound, this.words, this.spacing) : [];
    this.fillers = this.sound && this.english ? fillerCuts(this.words, this.sound) : [];
  }

  isRemoved(stretch: Stretch): boolean {
    return this.edit.removed.some((each) => each.start === stretch.start && each.end === stretch.end);
  }

  /** Whether a moment of the clip has been taken out. */
  removedAt(time: Flicks): Stretch | null {
    return this.edit.removed.find((each) => time >= each.start && time < each.end) ?? null;
  }

  /** Whether a word is taken out: its middle falls in a removed stretch, or it's a possible "um" whose own cut was made
   * (that cut starts a little after the word, at the quiet point: cleanup.ts › fillerCuts). */
  isWordRemoved(word: Word): boolean {
    if (this.removedAt(((word.start + word.end) / 2) as Flicks)) return true;
    const filler = this.fillers.find((each) => each.word === word);
    return filler !== undefined && this.isRemoved(filler.cut);
  }

  /** The words the captions show: none taken out, and no "um" when hidden. */
  get captionWords(): Word[] {
    const hideFillers = this.hideFillersInCaptions && this.english;
    return this.words.filter((word) => !(hideFillers && isFiller(word.text)) && !this.isWordRemoved(word));
  }

  setHeard(words: Word[], sound: SoundMap | null): void {
    this.words = words;
    this.sound = sound;
    this.propose();
    this.changed();
  }

  /** "Clean up": every proposed silence cut, as one step. */
  cutSilences(): void {
    const proposals = this.silences;
    this.history.change((edit) => {
      for (const cut of proposals) remove(edit, { start: cut.start, end: cut.end, reason: "silence" });
    });
    this.changed();
  }

  /** Puts back every silence cut, as one step. */
  restoreSilences(): void {
    this.history.change((edit) => {
      edit.removed = edit.removed.filter((each) => each.reason !== "silence");
    });
    this.changed();
  }

  /** Cuts or restores one proposal: a silence, or one possible "um" (one press, one cut). */
  toggle(cut: Cut): void {
    const removed = this.isRemoved(cut);
    this.history.change((edit) => (removed ? restore(edit, cut) : remove(edit, { start: cut.start, end: cut.end, reason: cut.kind })));
    this.changed();
  }

  /** A new spacing: silences already cut are cut again at it, in the same step, so the choice applies to what's done. */
  setSpacing(spacing: Spacing): void {
    const hadCut = this.edit.removed.some((each) => each.reason === "silence");
    this.spacing = spacing;
    this.propose();
    if (hadCut) {
      const proposals = this.silences;
      this.history.change((edit) => {
        edit.removed = edit.removed.filter((each) => each.reason !== "silence");
        for (const cut of proposals) remove(edit, { start: cut.start, end: cut.end, reason: "silence" });
      });
    }
    this.changed();
  }

  setHideFillers(hide: boolean): void {
    this.hideFillersInCaptions = hide;
    this.changed();
  }

  splitAt(clipTime: Flicks): void {
    this.history.change((edit) => split(edit, clipTime));
    this.changed();
  }

  deleteSegmentAt(index: number): void {
    const playing = this.segments;
    this.history.change((edit) => deleteSegment(edit, playing, index));
    this.changed();
  }

  get canUndo(): boolean {
    return this.history.canUndo;
  }

  get canRedo(): boolean {
    return this.history.canRedo;
  }

  undo(): void {
    this.history.undo();
    this.changed();
  }

  redo(): void {
    this.history.redo();
    this.changed();
  }

  private changed(): void {
    for (const listener of this.listeners) listener();
  }
}
