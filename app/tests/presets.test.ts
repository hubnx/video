/** Export's sizes and bitrates (src/export/presets.ts): never enlarged, the shape kept, even sides, YouTube's rates. */
import { expect, it } from "vitest";
import { exportBitrate, exportDimensions, sizesFor } from "../src/export/presets.ts";

it("offers only sizes the clip reaches", () => {
  expect(sizesFor(3840, 2160)).toEqual(["720p", "1080p", "4K"]);
  expect(sizesFor(1920, 1080)).toEqual(["720p", "1080p"]);
  expect(sizesFor(640, 360)).toEqual(["720p"]);
  expect(sizesFor(1080, 1920)).toEqual(["720p", "1080p"]); // upright phone video: its shorter side counts
});

it("keeps the clip's shape with even sides, never enlarging", () => {
  expect(exportDimensions(3840, 2160, "1080p")).toEqual({ width: 1920, height: 1080 });
  expect(exportDimensions(1080, 1920, "720p")).toEqual({ width: 720, height: 1280 });
  expect(exportDimensions(640, 360, "720p")).toEqual({ width: 640, height: 360 });
  expect(exportDimensions(1442, 811, "720p")).toEqual({ width: 1280, height: 720 });
});

it("uses YouTube's recommended rates, half again at 60 fps", () => {
  expect(exportBitrate("1080p", 30)).toBe(8_000_000);
  expect(exportBitrate("4K", 60)).toBe(60_000_000);
});
