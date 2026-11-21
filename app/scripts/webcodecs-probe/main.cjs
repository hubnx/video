// What this computer's Electron can encode and decode through WebCodecs, at the sizes the editor exports and the
// phones record (docs/plan.md › Build order, day 1: "probe of 4K encode and decode on all three systems"). Each
// configuration is asked (isConfigSupported can say yes to what then fails) and then used: 60 frames encoded, timed,
// and the same chunks decoded back, timed. HEVC, which iPhones record, is decoded where the computer can encode it
// to make a sample, and otherwise only asked. Runs in a hidden window, prints one JSON line and quits; run by
// scripts/probe-webcodecs.ts here and by GitHub's machines (.github/workflows/probe.yml).
const { app, BrowserWindow } = require("electron");
const path = require("node:path");

const PROBE = `(async () => {
  const sizes = { "1080p": [1920, 1080], "4K": [3840, 2160] };
  const codecs = {
    h264: { "1080p": "avc1.640028", "4K": "avc1.640033" },
    hevc: { "1080p": "hvc1.1.6.L123.B0", "4K": "hvc1.1.6.L153.B0" },
  };
  const FRAMES = 60;
  const encode = (config) => new Promise((resolve) => {
    const chunks = [];
    let decoderConfig = null;
    const started = performance.now();
    const encoder = new VideoEncoder({
      output: (chunk, metadata) => {
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        chunks.push({ type: chunk.type, timestamp: chunk.timestamp, data });
        if (metadata?.decoderConfig) decoderConfig = metadata.decoderConfig;
      },
      error: (error) => resolve({ error: error.message }),
    });
    encoder.configure(config);
    const canvas = new OffscreenCanvas(config.width, config.height);
    const context = canvas.getContext("2d");
    for (let index = 0; index < FRAMES; index++) {
      context.fillStyle = "hsl(" + index * 6 + ", 60%, 50%)";
      context.fillRect(0, 0, config.width, config.height);
      context.fillStyle = "#fff";
      context.fillRect((index * 50) % config.width, 0, 200, config.height);
      const frame = new VideoFrame(canvas, { timestamp: Math.round(index * 1e6 / 30) });
      encoder.encode(frame, { keyFrame: index % 30 === 0 });
      frame.close();
    }
    encoder.flush().then(() => {
      const seconds = (performance.now() - started) / 1000;
      resolve({ chunks, decoderConfig, fps: Math.round(FRAMES / seconds), bytes: chunks.reduce((sum, chunk) => sum + chunk.data.byteLength, 0) });
    }, (error) => resolve({ error: error.message }));
  });
  const decode = (decoderConfig, chunks, hardwareAcceleration) => new Promise((resolve) => {
    let frames = 0;
    const started = performance.now();
    const decoder = new VideoDecoder({ output: (frame) => { frames++; frame.close(); }, error: (error) => resolve({ error: error.message }) });
    decoder.configure({ ...decoderConfig, hardwareAcceleration });
    for (const chunk of chunks) decoder.decode(new EncodedVideoChunk(chunk));
    decoder.flush().then(() => resolve({ frames, fps: Math.round(frames / ((performance.now() - started) / 1000)) }), (error) => resolve({ error: error.message }));
  });
  const results = {};
  for (const [codec, bySize] of Object.entries(codecs)) {
    for (const [size, [width, height]] of Object.entries(sizes)) {
      for (const hardwareAcceleration of ["prefer-hardware", "prefer-software"]) {
        const config = { codec: bySize[size], width, height, bitrate: size === "4K" ? 40_000_000 : 12_000_000, framerate: 30, hardwareAcceleration,
          ...(codec === "h264" ? { avc: { format: "avc" } } : { hevc: { format: "hevc" } }) };
        const key = codec + " " + size + " " + hardwareAcceleration;
        const supported = (await VideoEncoder.isConfigSupported(config).catch((error) => ({ supported: false, error: String(error) }))).supported;
        const entry = { encodeSupported: supported };
        if (supported) {
          const encoded = await encode(config);
          if (encoded.error) entry.encodeError = encoded.error;
          else {
            entry.encodeFps = encoded.fps;
            entry.megabits = Math.round(encoded.bytes * 8 / 2 / 1e6); // 60 frames at 30 fps: two seconds
            const decoderConfig = encoded.decoderConfig ?? { codec: bySize[size], codedWidth: width, codedHeight: height };
            const decoded = await decode(decoderConfig, encoded.chunks, hardwareAcceleration);
            if (decoded.error) entry.decodeError = decoded.error;
            else { entry.decodedFrames = decoded.frames; entry.decodeFps = decoded.fps; }
          }
        }
        if (!entry.decodedFrames) {
          const asked = await VideoDecoder.isConfigSupported({ codec: bySize[size], codedWidth: width, codedHeight: height, hardwareAcceleration })
            .catch(() => ({ supported: false }));
          entry.decodeSupported = asked.supported;
        }
        results[key] = entry;
      }
    }
  }
  const audio = {};
  for (const [name, codec] of Object.entries({ aac: "mp4a.40.2", opus: "opus" })) {
    audio[name] = (await AudioEncoder.isConfigSupported({ codec, sampleRate: 48000, numberOfChannels: 2, bitrate: 160_000 }).catch(() => ({ supported: false }))).supported;
  }
  return { userAgent: navigator.userAgent, cores: navigator.hardwareConcurrency, video: results, audioEncode: audio };
})()`;

app.whenReady().then(async () => {
  if (process.platform === "darwin") app.dock?.hide(); // never in front: ~/.claude/CLAUDE.md › Tests never take my screen
  const window = new BrowserWindow({ show: false });
  await window.loadFile(path.join(__dirname, "probe.html")); // a file: a secure page, as WebCodecs needs
  try {
    console.log("WEBCODECS " + JSON.stringify(await window.webContents.executeJavaScript(PROBE)));
  } catch (error) {
    console.log("WEBCODECS " + JSON.stringify({ failed: String(error) }));
  }
  app.quit();
});
