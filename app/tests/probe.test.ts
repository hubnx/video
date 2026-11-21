/**
 * A video's facts as the app reads them from ffprobe (electron/probe.ts). Each would be silent if wrong: a sideways or
 * twice-turned phone video, a varying frame rate drifting out of sync, an HDR clip washed out, a cover picture taken
 * for the video (docs/research/engine-stack.md › Traps).
 */
import { describe, expect, it } from "vitest";
import { clipFacts, varies, type ProbeOutput } from "../electron/probe.ts";

const phone: ProbeOutput = {
  format: { duration: "12.345", format_name: "mov,mp4,m4a,3gp,3g2,mj2" },
  streams: [
    { codec_type: "video", codec_name: "hevc", width: 3840, height: 2160, avg_frame_rate: "30000/1001", pix_fmt: "yuv420p10le",
      color_transfer: "arib-std-b67", side_data_list: [{ side_data_type: "Display Matrix", rotation: -90 }] },
    { codec_type: "audio", codec_name: "aac", sample_rate: "44100", channels: 1 },
  ],
};

describe("a phone video's facts", () => {
  const facts = clipFacts(phone, {});

  it("turns ffprobe's counter-clockwise display matrix into clockwise quarter turns, once", () => {
    expect(facts.video?.rotation).toBe(90);
    const upsideDown = clipFacts({ streams: [{ codec_type: "video", side_data_list: [{ side_data_type: "Display Matrix", rotation: 180 }] }] }, {});
    expect(upsideDown.video?.rotation).toBe(180);
    const leftTurned = clipFacts({ streams: [{ codec_type: "video", side_data_list: [{ side_data_type: "Display Matrix", rotation: 90 }] }] }, {});
    expect(leftTurned.video?.rotation).toBe(270);
  });

  it("reads an old rotate tag as clockwise, as it was written", () => {
    expect(clipFacts({ streams: [{ codec_type: "video", tags: { rotate: "90" } }] }, {}).video?.rotation).toBe(90);
  });

  it("reads HDR from the decoded frames when the stream's summary leaves it out", () => {
    const quiet: ProbeOutput = { streams: [{ codec_type: "video", codec_name: "hevc" }] };
    expect(clipFacts(quiet, { frames: [{ pts_time: "0", color_transfer: "arib-std-b67" }] }).video?.dynamic).toBe("hlg");
  });

  it("knows HLG and PQ as HDR, and the bit depth from the pixel format", () => {
    expect(facts.video).toMatchObject({ codec: "hevc", width: 3840, height: 2160, dynamic: "hlg", bitDepth: 10 });
    expect(facts.video?.frameRate).toBeCloseTo(29.97, 2);
    expect(clipFacts({ streams: [{ codec_type: "video", color_transfer: "smpte2084" }] }, {}).video?.dynamic).toBe("pq");
    expect(clipFacts({ streams: [{ codec_type: "video", color_transfer: "bt709" }] }, {}).video?.dynamic).toBe("sdr");
  });

  it("reads the sound and the length", () => {
    expect(facts.audio).toEqual({ codec: "aac", sampleRate: 44100, channels: 1 });
    expect(facts.durationSeconds).toBe(12.345);
  });

  it("never takes a cover picture for the video", () => {
    const song = clipFacts({ streams: [{ codec_type: "audio", codec_name: "mp3" }, { codec_type: "video", codec_name: "mjpeg", disposition: { attached_pic: 1 } }] }, {});
    expect(song.video).toBeNull();
  });
});

describe("a varying frame rate", () => {
  const steady = Array.from({ length: 30 }, (_, index) => index / 29.97);

  it("isn't seen in a steady 29.97 fps file, whose gaps differ by rounding alone", () => {
    expect(varies(steady.map((time) => Math.round(time * 1000) / 1000))).toBe(false);
  });

  it("is seen when one gap in the first frames is uneven, as a phone's are", () => {
    const uneven = [...steady];
    uneven[10] = uneven[10]! + 0.012;
    expect(varies(uneven)).toBe(true);
  });

  it("reads frames in the order shown, not the order stored (B-frames come out of order)", () => {
    const stored = [0, 3, 1, 2, 6, 4, 5, 9, 7, 8, 12, 10, 11].map((index) => index / 30);
    expect(varies(stored)).toBe(false);
  });

  it("ignores a gap among the last frames read, whose frame may sit in a packet not read yet", () => {
    const missingNearTheEnd = [...steady.slice(0, 28), steady[29]!];
    expect(varies(missingNearTheEnd)).toBe(false);
  });
});
