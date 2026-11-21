import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { byteRange, mediaResponse } from "../electron/media-response.ts";

describe("the byte range a player asks for", () => {
  it.each([
    ["bytes=0-99", { start: 0, end: 99 }],
    ["bytes=900-", { start: 900, end: 999 }], // from a point to the end: where a seek lands
    ["bytes=-100", { start: 900, end: 999 }],
    ["bytes=950-5000", { start: 950, end: 999 }], // past the end: up to the end
  ])("reads %s", (header, range) => {
    expect(byteRange(header, 1000)).toEqual(range);
  });

  it.each(["bytes=1000-", "bytes=500-400", "bytes=-0"])("refuses %s, which asks for nothing in the file", (header) => {
    expect(byteRange(header, 1000)).toBe("unsatisfiable");
  });

  it.each(["bytes=0-9,20-29", "items=0-9", "bytes=-"])("answers %s with the whole file", (header) => {
    expect(byteRange(header, 1000)).toBeNull();
  });
});

describe("a video's file", () => {
  let folder: string;
  let file: string;
  const bytes = Buffer.from(Array.from({ length: 1000 }, (_, index) => index % 256));
  beforeEach(async () => {
    folder = await mkdtemp(path.join(tmpdir(), "music-media-response-"));
    file = path.join(folder, "Night drive.mp4");
    await writeFile(file, bytes);
  });
  afterEach(() => rm(folder, { recursive: true, force: true }));

  it("comes whole, saying ranges may be asked for", async () => {
    const response = await mediaResponse(file, null);
    expect(response.status).toBe(200);
    expect(Object.fromEntries(response.headers)).toMatchObject({ "accept-ranges": "bytes", "content-type": "video/mp4", "content-length": "1000" });
    expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes);
  });

  it("comes from where the player seeks to", async () => {
    const response = await mediaResponse(file, "bytes=600-");
    expect(response.status).toBe(206);
    expect(Object.fromEntries(response.headers)).toMatchObject({ "content-range": "bytes 600-999/1000", "content-length": "400" });
    expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes.subarray(600));
  });

  it("says when a range is outside it", async () => {
    const response = await mediaResponse(file, "bytes=2000-");
    expect(response.status).toBe(416);
    expect(response.headers.get("content-range")).toBe("bytes */1000");
  });
});
