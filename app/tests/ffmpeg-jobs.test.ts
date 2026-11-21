/**
 * What the app makes from each clip, and how (electron/ffmpeg-jobs.ts). Wrong here, the failure is silent: a phone
 * video turned twice or not at all, an HDR clip washed out, a 4K clip stuttering, or captions waiting on a copy the
 * sound never needed (docs/plan.md › Build order, day 2).
 */
import { describe, expect, it } from "vitest";
import { constantRate, editCopyArguments, jobsFor, pictureFilters, proxyArguments, speechArguments } from "../electron/ffmpeg-jobs.ts";
import type { ClipFacts, VideoFacts } from "../src/shared/media.ts";

const hd: VideoFacts = { codec: "h264", width: 1920, height: 1080, rotation: 0, frameRate: 30, variableFrameRate: false, bitDepth: 8, dynamic: "sdr" };
const clip = (video: Partial<VideoFacts> | null, audio = true): ClipFacts => ({
  durationSeconds: 60, container: "mov,mp4,m4a,3gp,3g2,mj2",
  video: video ? { ...hd, ...video } : null,
  audio: audio ? { codec: "aac", sampleRate: 48000, channels: 2 } : null,
});

describe("which files a clip needs", () => {
  it("makes the sound first, always, so captions start before any copy of the picture", () => {
    expect(jobsFor(clip({ codec: "hevc", width: 3840, height: 2160 }), false)[0]).toBe("speech");
  });

  it("plays a 1080p clip the window decodes as it is", () => {
    expect(jobsFor(clip({}), true)).toEqual(["speech"]);
  });

  it("gives 4K a proxy for smooth seeking, but no edit copy when the window decodes it", () => {
    expect(jobsFor(clip({ width: 3840, height: 2160 }), true)).toEqual(["speech", "proxy"]);
  });

  it("gives a clip the window can't decode (HEVC with no hardware decoder) a proxy and an edit copy", () => {
    expect(jobsFor(clip({ codec: "hevc" }), false)).toEqual(["speech", "proxy", "editCopy"]);
  });

  it("tone-maps HDR into both copies even where the window decodes it, since release 1 is SDR", () => {
    expect(jobsFor(clip({ dynamic: "hlg" }), true)).toEqual(["speech", "proxy", "editCopy"]);
  });

  it("makes only the sound for a recording with no picture, and nothing for a silent one beyond its copies", () => {
    expect(jobsFor(clip(null), true)).toEqual(["speech"]);
    expect(jobsFor(clip({ codec: "hevc" }, false), false)).toEqual(["proxy", "editCopy"]);
  });
});

describe("turning and sizing the picture", () => {
  it("turns a phone video upright once, with FFmpeg reading the file's rotation as none", () => {
    const args = proxyArguments("in.mov", "out.mp4", clip({ width: 1920, height: 1080, rotation: 90 })).join(" ");
    expect(args).toMatch(/-display_rotation:v:0 0 -i in\.mov/);
    expect(pictureFilters({ ...hd, rotation: 90 }, { shortSide: 720 })).toBe("scale=-2:720,transpose=clock,format=yuv420p");
    expect(pictureFilters({ ...hd, rotation: 270 }, { shortSide: 720 })).toBe("scale=-2:720,transpose=cclock,format=yuv420p");
    expect(pictureFilters({ ...hd, rotation: 180 }, { shortSide: 720 })).toBe("scale=-2:720,hflip,vflip,format=yuv420p");
  });

  it("sizes the proxy's shorter side to 720 and never enlarges a smaller clip", () => {
    expect(proxyArguments("in", "out.mp4", clip({ width: 3840, height: 2160 }))).toContain("scale=-2:720,format=yuv420p");
    expect(proxyArguments("in", "out.mp4", clip({ width: 640, height: 360 }))).toContain("scale=-2:360,format=yuv420p");
  });

  it("sizes an HDR proxy before tone-mapping it, so the costly part runs on 720p, not 4K", () => {
    expect(pictureFilters({ ...hd, width: 3840, height: 2160, dynamic: "hlg" }, { shortSide: 720 })).toMatch(/^scale=-2:720,zscale=tin=arib-std-b67/);
  });

  it("tone-maps HDR to BT.709 before turning it, naming the input's colours rather than trusting the file's tags", () => {
    expect(pictureFilters({ ...hd, dynamic: "hlg" }, { shortSide: null })).toMatch(/^zscale=tin=arib-std-b67:pin=bt2020:min=bt2020nc:rin=tv:t=linear:p=bt2020:m=bt2020nc:npl=100,.*tonemap=hable.*,format=yuv420p$/);
    expect(pictureFilters({ ...hd, dynamic: "pq" }, { shortSide: null })).toMatch(/^zscale=tin=smpte2084:/);
  });

  it("makes every proxy frame a keyframe at a constant rate, with 48 kHz sound", () => {
    const args = proxyArguments("in", "out.mp4", clip({ frameRate: 29.94, variableFrameRate: true }));
    expect(args.join(" ")).toContain("-fps_mode cfr -r 30000/1001");
    expect(args.join(" ")).toContain("-g 1 -bf 0");
    expect(args.join(" ")).toContain("-ar 48000");
  });

  it("keeps the edit copy full size", () => {
    expect(editCopyArguments("in", "out.mp4", clip({ width: 3840, height: 2160 })).join(" ")).not.toContain("scale=");
  });
});

it("gives the speech models 16 kHz mono 16-bit sound", () => {
  expect(speechArguments("in.mov", "speech.wav").join(" ")).toContain("-map 0:a:0 -vn -ac 1 -ar 16000 -c:a pcm_s16le -f wav speech.wav");
});

it("makes a varying rate constant at the nearest common rate, and keeps an unusual one", () => {
  expect(constantRate(29.97)).toBe("30000/1001");
  expect(constantRate(30.4)).toBe("30");
  expect(constantRate(59.9)).toBe("60000/1001");
  expect(constantRate(15)).toBe("15");
});
