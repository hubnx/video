import { describe, expect, it } from "vitest";
import { mergedMacFeed } from "../scripts/release-files.ts";

const feed = (arch: string, version = "1.0.0") => `version: ${version}
files:
  - url: hubnx-Video-${version}-${arch}.zip
    sha512: ${arch}zip
    size: 100
  - url: hubnx-Video-${version}-${arch}.dmg
    sha512: ${arch}dmg
    size: 200
path: hubnx-Video-${version}-${arch}.zip
sha512: ${arch}zip
releaseDate: '2026-11-25T10:00:00.000Z'
`;

// Both Macs read one latest-mac.yml: each build writes its own, and the second uploaded would leave the other kind
// of Mac never updated (release-files.ts › mergedMacFeed).
describe("the Macs' one update feed", () => {
  it("lists both builds' files, keeping the Intel build's top-level fields for older updaters", () => {
    const merged = mergedMacFeed(feed("x64"), feed("arm64"));
    expect(merged).toBe(`version: 1.0.0
files:
  - url: hubnx-Video-1.0.0-x64.zip
    sha512: x64zip
    size: 100
  - url: hubnx-Video-1.0.0-x64.dmg
    sha512: x64dmg
    size: 200
  - url: hubnx-Video-1.0.0-arm64.zip
    sha512: arm64zip
    size: 100
  - url: hubnx-Video-1.0.0-arm64.dmg
    sha512: arm64dmg
    size: 200
path: hubnx-Video-1.0.0-x64.zip
sha512: x64zip
releaseDate: '2026-11-25T10:00:00.000Z'
`);
  });

  it("refuses two versions, which would send one kind of Mac the other's release", () => {
    expect(() => mergedMacFeed(feed("x64", "1.0.0"), feed("arm64", "1.0.1"))).toThrow(/MAC_FEEDS_DIFFER/);
  });
});
