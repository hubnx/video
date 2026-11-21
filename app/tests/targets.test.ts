/** One name per system the app is built for (electron/targets.ts): the copy run from the repo picks its FFmpeg by it. */
import { expect, it } from "vitest";
import { targetOf } from "../electron/targets.ts";

it("names each system the app is built for, and refuses one it isn't", () => {
  expect(targetOf("darwin", "arm64")).toBe("mac-arm64");
  expect(targetOf("darwin", "x64")).toBe("mac-x64");
  expect(targetOf("win32", "x64")).toBe("win-x64");
  expect(targetOf("linux", "x64")).toBe("linux-x64");
  expect(() => targetOf("linux", "arm64")).toThrow("no build for linux arm64");
});
