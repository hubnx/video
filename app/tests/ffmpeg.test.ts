/** What the app reads from its FFmpeg (electron/ffmpeg.ts): the package check fails on a build missing an encoder. */
import { expect, it } from "vitest";
import { encodersIn } from "../electron/ffmpeg.ts";

it("finds the app's encoders in ffmpeg -encoders, by their exact names", () => {
  const listing = [
    "Encoders:",
    " V..... = Video",
    " ------",
    " V....D libx264              libx264 H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10 (codec h264)",
    " A....D aac                  AAC (Advanced Audio Coding)",
    " A....D aac_at               aac (AudioToolbox) (codec aac)",
    " A....D aac_fixed            not one of ours, though it starts the same",
  ].join("\n");
  expect(encodersIn(listing)).toEqual({ libx264: true, aac: true, aac_at: true, aac_mf: false });
});
