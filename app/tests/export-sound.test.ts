/** The export's sound (electron/export-sound.ts): a join that clicks, loudness left uneven, or a stretch dropped would be
 * heard in every exported video. */
import { expect, it } from "vitest";
import { aacEncoder, muxArguments, soundFilter } from "../electron/export-sound.ts";

const plan = { stretches: [{ from: 0, to: 4 }, { from: 6, to: 10 }], source: "voice.wav" };

it("keeps each stretch, fades each join, joins them in order and evens the loudness", () => {
  const filter = soundFilter(plan);
  expect(filter).toContain("[1:a:0]atrim=start=0.000000:end=4.000000,asetpts=PTS-STARTPTS,afade=t=in:d=0.0100,afade=t=out:st=3.990000:d=0.0100[p0]");
  expect(filter).toContain("[1:a:0]atrim=start=6.000000:end=10.000000");
  expect(filter).toContain("[p0][p1]concat=n=2:v=0:a=1[joined]");
  expect(filter).toContain("loudnorm=I=-14:TP=-1:LRA=11");
});

it("never fades longer than half a very short stretch", () => {
  expect(soundFilter({ stretches: [{ from: 1, to: 1.01 }], source: "a" })).toContain("afade=t=in:d=0.0050");
});

it("copies the window's video, encodes the sound with the system's own AAC, and puts the index first", () => {
  const args = muxArguments("video.mp4", plan, "filter.txt", "out.mp4", "darwin").join(" ");
  expect(args).toContain("-i video.mp4 -i voice.wav -/filter_complex filter.txt -map 0:v:0 -map [sound]");
  expect(args).toContain("-c:v copy -c:a aac_at");
  expect(args).toContain("-movflags +faststart");
  expect([aacEncoder("win32"), aacEncoder("linux")]).toEqual(["aac_mf", "aac"]);
});
