# The engine stack: what the editor is built on

Research for `video`, a free AGPL-3.0 CapCut alternative for Mac (Apple chips and Intel), Windows and Linux. It covers the app shell, preview, export, audio, project files, the timeline, open engines we could reuse, traps in real footage, and testing on free machines. It ends with the stack and a two-week build order. Collected 2026-11-17.

**How it was gathered.** Primary sources only:
- GitHub's API for stars, releases and issue counts.
- The projects' own files and docs, the licence texts, Chromium's and Electron's source, and the patent pools' pages.
- Songbrew's code on this Mac.

Every source is linked, with its date or "read 2026-11-17". The session's web-search budget ran out partway through, so a few points couldn't be checked; each is marked *unverified*.

## Conclusion first

1. **Shell: Electron with Vite and plain TypeScript, copied from Songbrew.**
   - It is the same Chromium on all three systems, so one set of video features and one set of tests.
   - Songbrew already signs, notarizes, updates and packages it for all three, and has already probed which video encoders Electron offers.
   - Tauri would give us Apple's WebKit on Mac and WebKitGTK on Linux, whose video support varies by version.
2. **Preview: Mediabunny (MPL-2.0) and WebCodecs, our own WebGL2 compositor, the audio clock in charge.**
   - Frames are picked by timestamp, so phone video with a variable frame rate needs no conversion to stay in sync.
   - Clips the window can't decode, or that play slowly, get an all-intra proxy made by ffmpeg.
3. **Export: the same compositor encodes through WebCodecs, preferring the computer's hardware encoder. ffmpeg encodes the sound to AAC and packs the final MP4.**
   - On Mac and Windows, the encoders are the operating system's own: VideoToolbox, AudioToolbox, Media Foundation.
   - On Linux, Electron has no AAC encoder (Songbrew's probe, 2026-11-17), hence ffmpeg for the sound everywhere.
4. **ffmpeg ships as a separate program (a child process) in a GPLv3 build, with x264, without x265 or anything "nonfree".**
   - GPLv3 and AGPLv3 allow combining with each other outright.
   - We publish ffmpeg's source and its build line beside each download.
5. **Patents: H.264 and AAC are the real exposure. We keep it small.**
   - We use the operating system's encoders wherever they exist, and ship x264 and ffmpeg's AAC encoder only as the fallback, as Shotcut, Kdenlive, OBS, HandBrake and LosslessCut do.
   - H.264 costs $0 for the first 100,000 units a year; AAC's pool lists no free tier. Revisit before 100,000 downloads a year, or before any revenue (section 3).
6. **Our own timeline (Canvas 2D), undo through Immer patches, an atomically written JSON project, autosave and a recovery journal.** No timeline library is both maintained and free of React and licence strings.
7. **OpenCut: we take ideas and a few files, not its engine.**
   - The classic editor is archived and its rewrite is a stub.
   - Worth borrowing under MIT: its Mediabunny frame cache, its export, its command-pattern undo, its timeline logic.
8. **FilmCraft is the strongest open engine to watch, but not one to build v1 on.**
   - It is a Rust editor, MIT or Apache-2.0, 18,489 stars in seven weeks.
   - It is alpha, with 420 open bugs and launch crashes on Windows, Intel graphics and older macOS. Its API changes every few days, and it has no frame interface fast enough for an outside preview.
   - Using its own encoders doesn't lower the patent exposure.
   - Re-check at its beta (section 7).

## Words used here

| Word | Meaning |
|---|---|
| WebCodecs | The browser's interface to the computer's own video and audio decoders and encoders |
| Demux, mux | Unpack, or pack, the video and sound streams in a file (MP4, MOV, MKV) |
| Keyframe | A frame that decodes on its own. Frames between keyframes need the ones before them, so jumping to one means decoding from the last keyframe |
| All-intra | Every frame is a keyframe, so any frame decodes at once |
| Proxy | A small, easy copy of a clip used while editing. The export still uses the original |
| VFR, CFR | Variable frame rate (phones record it: frames arrive unevenly) and constant frame rate |
| HDR, SDR, tone-mapping | High and standard dynamic range. Tone-mapping squeezes HDR into SDR so it doesn't look washed out |
| Compositor | The code that stacks the layers (video, text, stickers) into one picture |

## 1. App shell

| Option | For | Against | Verdict |
|---|---|---|---|
| **Electron + Vite + plain TypeScript** | One Chromium everywhere: Electron 45.2.1, Songbrew's, is Chromium 156.0.8078.75 ([releases.json](https://releases.electronjs.org/releases.json), 2026-10-30). Songbrew's packaging, signing, notarizing, updates and checks already work. Its probe found H.264 encoding on all three systems, AAC on Mac and Windows only (`music/app/scripts/probe-webcodecs.ts`; `music/docs/roadmap.md`, 2026-11-17) | Large download: Songbrew 0.1.37's packages are 123–153 MB, though they also carry uv and ACE-Step's code (`music/local/release/`, measured 2026-11-17) | **Choose** |
| Tauri | Small app; a Rust side | Uses WKWebView on Mac, WebView2 on Windows and webkit2gtk on Linux; "unsupported macOS versions **do not** receive WebKit updates", and Linux's WebKitGTK version varies by distro ([Tauri webview versions](https://v2.tauri.app/reference/webview-versions/), 2026-05-17). Safari has full WebCodecs only from 26.0; 16.4–18.7 are "partial" ([caniuse](https://caniuse.com/webcodecs), read 2026-11-17). WebKitGTK's WebCodecs: *unverified*. Three engines to test, and Songbrew's shell lost | No |
| Native: Qt (Shotcut, Kdenlive), GPUI (OpenCut's rewrite), egui (FilmCraft) | Fast, small | A UI rewrite outside our TypeScript. Not doable in two weeks | No |

**What we copy from Songbrew** (copy, not share: each app is its own repo):

| Songbrew file | What it gives us | Change for video |
|---|---|---|
| `app/scripts/package.ts` | electron-builder for: a signed and notarized `.dmg` (stapled) plus the zip the Mac updater reads; the one-click Windows installer; the Microsoft Store's appx; a Linux AppImage (static runtime, no libfuse2) and a `.deb` with the two libraries Electron needs (`libasound2t64 \| libasound2`, `libgbm1`); the Mac App Store target | Carry ffmpeg and ffprobe in `extraResources` in place of uv and ACE-Step |
| `app/scripts/fetch-uv.ts` | Downloads a pinned tool per target, checked against its SHA-256 | Becomes `fetch-ffmpeg.ts` |
| `app/electron/json-lines-process.ts` | Child process in its own process group, stderr to a log file (the last one kept), graceful stop, then kill of the group (`taskkill /T` on Windows) | The job runner for ffmpeg, which reports progress as `key=value` lines through `-progress pipe:1`, and later for AI models |
| `app/electron/song-response.ts` | A custom protocol answering byte ranges | `media://`: lets Mediabunny read originals and proxies in pieces, never whole |
| `app/electron/updates.ts`, `applications-folder.ts` | electron-updater from our site, Mac Squirrel's traps, AppImage self-update, store copies left to their stores | As is |
| `app/electron/preload.ts`, `src/shared/app-api.ts` | One typed bridge, nothing else of Node exposed | New API |
| `app/electron/paths.ts`, `linux-data-folder.ts`, `settings.ts`, `app-log.ts`, `feedback*.ts` | Data folders, settings saved one after another, logs with event names, failure reports | As is |
| `app/src/lyric-video-encode.ts` | Canvas → WebCodecs H.264 → Mediabunny MP4, with AAC checked first | The export's first draft. Swap `BufferTarget` for `StreamTarget` (section 3) |
| `app/src/waveform.ts`, `song-audio.ts`, `drawn-text.ts`, `words.ts` | Loudness bars, decoding, text drawn on a canvas, every visible word in one file | Peaks at several zoom levels; caption text |
| `app/scripts/start.ts`, `check-app.ts`, `screens.ts`, `check-package.ts`, `check-update.ts` | Starting Electron without `ELECTRON_RUN_AS_NODE`; checks hidden from the owner's screen; Playwright driving the app; screenshots at four sizes in both themes | As is |
| `app/scripts/webcodecs-probe/`, `.github/workflows/webcodecs-probe.yml`, `linux-packages.yml`, `windows-store.yml` | The encoder probe on GitHub's Ubuntu and Windows; the Linux and Windows package checks | Extend the probe to 4K, HEVC and decoding |
| `app/vite.config.ts` › `lameAsItsOwnFile` | A build that fails if a separately licensed file gets bundled | Same guard idea for anything LGPL |

Songbrew's traps carry over (`music/CLAUDE.md` › Traps):
- VS Code's terminal sets `ELECTRON_RUN_AS_NODE`.
- pnpm needs `allowBuilds` for Electron's install script.
- An app started from a script counts as part of the terminal, and Squirrel then asks for an admin password.
- Every file the app reads must be in the package filter.

## 2. Preview and compositing

### The options

| Option | Licence | What it is | For | Against | Verdict |
|---|---|---|---|---|---|
| **Mediabunny + WebCodecs + our WebGL2** | MPL-2.0. AGPL-3.0 is one of MPL's named "Secondary Licenses" ([LICENSE](https://github.com/Vanilagy/mediabunny/blob/main/LICENSE)) | A TypeScript library that reads and writes MP4, MOV, MKV, WebM, Ogg, MP3, WAV, ADTS, FLAC and MPEG-TS, and decodes and encodes through WebCodecs ([formats](https://mediabunny.dev/guide/supported-formats-and-codecs), read 2026-11-17) | 7,514 stars, v1.66.0 on 2026-11-13, sponsored by Figma, Remotion and others ([README](https://github.com/Vanilagy/mediabunny)). Remotion retired its own WebCodecs package "in favor of Mediabunny" ([docs](https://www.remotion.dev/docs/webcodecs/)). OpenCut classic and Songbrew use it | One maintainer. Only decodes what Chromium decodes, plus ProRes through `@mediabunny/prores` (WASM) | **Choose** |
| ffmpeg as a child process for preview | GPL or LGPL | Decode in a separate process and pipe frames | Decodes everything | A 4K frame in I420 is 3840 × 2160 × 1.5 = 12.4 MB, about 373 MB/s at 30 fps through a pipe. There is also no zero-copy way between native code and the window's frames ([electron#49762](https://github.com/electron/electron/issues/49762), open) | Import, proxies and odd files only |
| MLT via `melt` | LGPL-2.1 core; GPL modules on by default ([CMakeLists](https://github.com/mltframework/mlt/blob/master/CMakeLists.txt)) | Shotcut's and Kdenlive's engine; v7.42.0 on 2026-10-03 | Proven export | Shotcut links MLT in-process for preview ([mltcontroller.h](https://github.com/mltframework/shotcut/blob/master/src/mltcontroller.h)). melt's keyboard controls step relatively and have no "go to frame N" ([melt.c](https://github.com/mltframework/mlt/blob/master/src/melt/melt.c)). No prebuilt melt; Shotcut v26.11.15 is 136–206 MiB ([releases](https://github.com/mltframework/shotcut/releases), read 2026-11-17). A second compositor means preview and export can differ | No |
| GStreamer Editing Services | LGPL-2.1 ([docs](https://gstreamer.freedesktop.org/documentation/gst-editing-services/index.html)) | Timeline and render pipeline | Mature model | No Node bindings; only Python ones in the tree. Its flagship editor Pitivi last released 2023.03 ([news](https://pitivi.org/news/)). Packaging on Mac and Windows is heavy | No |
| **FilmCraft** engine crates | MIT OR Apache-2.0 | A Rust editor with its own codecs and GPU compositor | The most complete open engine | Alpha, moving fast, no fast frame interface (section 7) | Not for v1; re-check at its beta |
| Remotion | Source-available, not open source; a paid company licence above 3 employees ([LICENSE](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md), [FAQ](https://www.remotion.dev/docs/license/faq)) | React to video | — | Its extra restrictions conflict with AGPL (our reading) | No |
| Diffusion Studio, Twick, Shotstack, Etro | Watermark-key MPL; Sustainable Use; PolyForm Shield; GPL-3.0 | Web compositors | — | Licence strings attached, or no frame accuracy (section 7) | No |

### How preview works

- **Main process.** It probes each file with `ffprobe` at import, decides how the clip will play (below), and runs proxy, thumbnail and waveform jobs at background priority. It serves files to the window over `media://` with byte ranges.
- **Window.**
  - Video: Mediabunny's `Input` reads `media://…`, and `VideoSampleSink` or `CanvasSink` hands frames to a small frame cache, which feeds the WebGL2 compositor and the preview canvas.
  - Sound: `AudioBufferSink` feeds a Web Audio graph and the speakers.
  - Each frame shown is the one at the audio clock's time.
- **Frame accuracy.** `getSample(t)` "returns the last sample with a timestamp less than or equal to" `t`, and `samplesAtTimestamps()` avoids decoding a packet twice ([media sinks](https://mediabunny.dev/guide/media-sinks)). Frames are chosen by real timestamps, never by frame count × nominal rate.
  - That makes VFR footage line up without converting it. Mediabunny works out the frame rate "directly from the actual frame timestamps", never from metadata ([reading media files](https://github.com/Vanilagy/mediabunny/blob/main/docs/guide/reading-media-files.md)).
- **Seeking.** After `configure()` or `flush()`, a decoder must start at a key chunk ([WebCodecs spec](https://github.com/w3c/webcodecs/blob/main/index.src.html)).
  - So a jump into long-GOP phone video decodes from the previous keyframe.
  - All-intra proxies make every jump a single decode. That is why Kdenlive's default proxy is `-g 1 -bf 0` ([encodingprofiles.rc](https://invent.kde.org/multimedia/kdenlive/-/blob/master/data/encodingprofiles.rc)), and Shotcut's too, at 540p ([proxymanager.cpp](https://github.com/mltframework/shotcut/blob/master/src/proxymanager.cpp), 2026-10-17).
- **Never `<video>` for frames.** requestVideoFrameCallback gives "no strict timing guarantees" and can skip frames ([WICG](https://wicg.github.io/video-rvfc/), 2024-08-02). Remotion's test allows HTML video 8 missed frames in 100, and its ffmpeg path 0 ([frame-accuracy.test.ts](https://github.com/remotion-dev/remotion/blob/main/packages/it-tests/src/rendering/frame-accuracy.test.ts)).
- **Compositor.** WebGL2, not WebGPU, for v1: it runs on SwiftShader on GitHub's GPU-less machines (section 9).
  - Each layer is a texture with transform, crop, opacity and blend.
  - Transitions and effects are small shaders.
  - Text is drawn with Canvas 2D (Songbrew's `drawn-text.ts`) and uploaded as a texture, so the system's fonts cover CJK and Arabic.
  - The preview renders at the canvas's size (half or quarter of the project), and the export at full size.
  - Uploading a `VideoFrame` straight into a WebGL texture is assumed; to confirm on day 4.

### Which file plays

| Source | Plays from | Why |
|---|---|---|
| H.264, VP9, AV1, 8-bit, up to 1080p | The original | Chromium decodes these on every system: H.264 through its own ffmpeg ([codec_list.c](https://chromium.googlesource.com/chromium/third_party/ffmpeg/+/refs/heads/master/chromium/config/Chrome/linux/x64/libavcodec/codec_list.c)), VP8 and VP9 with libvpx, AV1 with dav1d ([media/filters](https://chromium.googlesource.com/chromium/src/+/HEAD/media/filters/)) |
| 4K, or anything that drops frames on this computer | A proxy (all-intra H.264, 720p, constant frame rate, 48 kHz) | Smooth on any computer; the original is used for export |
| HEVC (iPhone) | The original on Mac, and on Windows with an HEVC-capable GPU. Elsewhere, a proxy plus an edit copy | HEVC comes only from the operating system: VideoToolbox on Mac (software fallback included), D3D11 hardware on Windows, VA-API on Linux ([Chromium's HEVC guide](https://github.com/StaZhu/enable-chromium-hevc-hardware-decoding)). Chromium's VA-API "is not supported… no guarantees" ([vaapi.md](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/gpu/vaapi.md)) |
| HDR (HLG, PQ, Dolby Vision 8.4) | A tone-mapped BT.709 edit copy (v1 is SDR only) | Shotcut warns such files "may result in incorrect colors or brightness" and offers a conversion ([util.cpp](https://github.com/mltframework/shotcut/blob/master/src/util.cpp)). Whether Chromium tone-maps HDR frames drawn to a canvas is *unverified*: test on day 2, and skip the copy on Mac if it matches ffmpeg's |
| ProRes, DNxHR, MPEG-2, MJPEG, DV, AVI, AC-3 sound | A full-size H.264 edit copy plus a proxy (like Shotcut's "Convert to Edit-friendly" ([transcodedialog.cpp](https://github.com/mltframework/shotcut/blob/master/src/dialogs/transcodedialog.cpp))) | Not in the WebCodecs registry ([registry](https://www.w3.org/TR/webcodecs-codec-registry/), 2026-09-24). `@mediabunny/prores` can decode ProRes later |

## 3. Export

### The path

1. The compositor draws each frame at full size, in an `OffscreenCanvas` (the window stays responsive).
2. Mediabunny's `CanvasSource` encodes with `hardwareAcceleration: "prefer-hardware"` into an MP4 with no sound.
   - It writes through `StreamTarget` to a temporary file, because `BufferTarget` "suits files under roughly 100 MB" and larger ones can crash the page ([writing media files](https://mediabunny.dev/guide/writing-media-files), read 2026-11-17).
   - Songbrew's lyric video uses `BufferTarget`, which is fine for its short videos only.
3. The sound mix is rendered by an `OfflineAudioContext` built from the same graph as playback, and written as WAV.
4. ffmpeg runs `-c:v copy` on the video, encodes the sound to AAC with the system's encoder where there is one, adds `-movflags +faststart` (so phones start playing at once) and writes the final file.
   - The encoders: `aac_at` on Mac, `aac_mf` on Windows ([configure](https://github.com/FFmpeg/FFmpeg/blob/master/configure)), ffmpeg's own `aac` on Linux.
5. Fallback, only if WebCodecs fails at 4K on Linux: send raw frames to ffmpeg's `libx264`, `h264_nvenc` or `h264_vaapi`.

**Presets:** 720p, 1080p and 4K, at 24–60 fps; H.264 by default, HEVC wherever an encoder exists (WebCodecs encodes HEVC from Chrome 130 ([guide](https://github.com/StaZhu/enable-chromium-hevc-hardware-decoding))); no watermark.

### Encoders per system

| System | Video encoder used | Sound | Source |
|---|---|---|---|
| Mac (Apple chips and Intel) | VideoToolbox, through WebCodecs | AudioToolbox (`aac_at`) | Songbrew's probe, 2026-11-17. Which Intel Macs encode HEVC in hardware: *unverified* |
| Windows | Media Foundation, hardware when present, through WebCodecs | Media Foundation (`aac_mf`) | Windows has had an H.264 encoder built in since Windows 7 ([Microsoft Learn](https://learn.microsoft.com/en-us/windows/win32/medfound/h-264-video-encoder), 2021-08-19) |
| Linux | Chromium's software H.264. That is likely OpenH264 (`media_use_openh264` ([media_options.gni](https://chromium.googlesource.com/chromium/src/+/main/media/media_options.gni))), *inferred*. Works at 720p and 1080p; 4K *unverified* until day 1 | ffmpeg's own `aac` | Songbrew's probe: no AAC encoder in Electron on Linux |
| Fallback (any) | ffmpeg: `libx264`, `h264_nvenc`, `h264_qsv`, `h264_amf`, `h264_vaapi`, `h264_videotoolbox` | — | NVENC, AMF, VideoToolbox, D3D11VA and VA-API are autodetected, not "nonfree" ([configure](https://github.com/FFmpeg/FFmpeg/blob/master/configure)). GeForce cards allow 12 NVENC sessions at once ([NVIDIA](https://developer.nvidia.com/video-encode-and-decode-gpu-support-matrix-new)) |

### ffmpeg: which build, and its licence

- **Licence.**
  - ffmpeg is LGPL-2.1+ by default. `--enable-gpl` makes it "GPL v2+", and `--enable-version3` GPLv3.
  - libx264 and libx265 need `--enable-gpl`. libfdk_aac needs `--enable-nonfree`, which makes the build "nonfree and unredistributable" ([LICENSE.md](https://github.com/FFmpeg/FFmpeg/blob/master/LICENSE.md), [configure](https://github.com/FFmpeg/FFmpeg/blob/master/configure)).
- **Compatibility with AGPL.**
  - GPLv3 §13 and AGPLv3 §13 each allow combining with the other ([GPL FAQ](https://www.gnu.org/licenses/gpl-faq.html#AGPLGPL)).
  - A separate program called through pipes and arguments is normally an "aggregate" ([GPLv3](https://www.gnu.org/licenses/gpl-3.0.html) §5, [FAQ](https://www.gnu.org/licenses/gpl-faq.html#MereAggregation)).
  - So a GPLv3 ffmpeg run as a child process is fine either way.
  - x264 is GPL v2 "or any later version" ([x264.c](https://github.com/mirror/x264/blob/master/x264.c)).
- **Trap: don't copy two precedents' flags.** LosslessCut's Mac build script ([mifi/ffmpeg-build-script](https://github.com/mifi/ffmpeg-build-script/blob/master/build-ffmpeg)) and KDE Craft's ([ffmpeg.py](https://github.com/KDE/craft-blueprints-kde/blob/master/libs/ffmpeg/ffmpeg.py)) both pass `--enable-nonfree` without any nonfree library. That makes the build unredistributable for no gain.
- **Our build:** `--enable-gpl --enable-version3 --enable-libx264 --enable-libzimg` (tone-mapping), plus the system and hardware encoders. No x265, no fdk-aac, no nonfree, no ffplay. We publish its source and configure line beside each download, as GPL §6 requires.
- **Running it:** as a child process, Songbrew's pattern. A crash or hang on a broken file then ends one job, not the app.
  - node-av (MIT bindings over a GPL ffmpeg, Electron-compatible prebuilts ([README](https://github.com/seydx/node-av))) would run inside the app instead, so its crashes would be ours. Not for v1.

| Binary | Systems | Licence or terms | Size | Use |
|---|---|---|---|---|
| [BtbN/FFmpeg-Builds](https://github.com/BtbN/FFmpeg-Builds/releases/tag/latest) | Windows and Linux (x64, arm64), no Mac | gpl and lgpl variants; GPLv3 or LGPLv3 by default | gpl-shared: win64 86 MB, linux64 68 MB (2026-11-17) | **Windows and Linux**: pin a dated build plus its SHA-256 and mirror it to our release (LosslessCut mirrors it too ([downloadFfmpeg.ts](https://github.com/mifi/lossless-cut/blob/master/script/downloadFfmpeg.ts))) |
| Our own build on GitHub's `macos-15` (arm64) and `macos-15-intel` runners | Mac | GPLv3 | LosslessCut's static Mac builds: 38–48 MB each | **Mac**, as LosslessCut does. No maintained LGPL Mac arm64 build was found |
| [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) | Windows | GPLv3 | essentials 34 MB (.7z), 2026-11-16 | Alternative |
| evermeet.cx, osxexperts, Martin Riedl, `ffmpeg-static` | Mac | Intel only ([evermeet](https://evermeet.cx/ffmpeg/)); "for educational purposes only" ([osxexperts](https://www.osxexperts.net/)); licence not stated (*unverified*); ships ffmpeg 6.1.1 ([ffmpeg-static](https://github.com/eugeneware/ffmpeg-static)) | — | No |
| ffmpeg.wasm | Window | — | Native took 5.2 s and multi-threaded wasm 60.4 s on one 720p test ([performance](https://ffmpegwasm.netlify.app/docs/performance), 2023-10-09). 2 GB input limit ([FAQ](https://github.com/ffmpegwasm/ffmpeg.wasm/blob/main/apps/website/docs/faq.md)) | No |

### Patents

| Codec | Pool's terms | Source |
|---|---|---|
| H.264 (AVC) | First 100,000 units a year $0 (one legal entity per group), then $0.20 up to 5 million, then $0.10; cap $9.75 million. "Decoder, encoder or product consisting of one decoder and one encoder = unit". The licence includes the end user's right to use encoders and decoders for personal and consumer purposes. Whether free downloads count as units, and whether a project must sign up to use the $0 tier: *unverified* | [Via LA AVC](https://www.via-la.com/licensing-2/avc-h-264/), updated 2026-11-01 |
| HEVC | Access Advance: no royalty on software downloaded after the device's sale and "fully executed in software on a general purpose CPU" ([2016-11-22](https://www.prnewswire.com/news-releases/hevc-advance-announces-royalty-free-hevc-software-300367212.html)), but its July 2026 overview still lists "All HEVC Software $1.00/$0.50" with exclusions ([PDF](https://accessadvance.com/wp-content/uploads/2025/07/HEVC-Advance-Program-Overview-July-2026.pdf)). Via LA: first 100,000 units $0 ([HEVC/VVC](https://www.via-la.com/licensing-programs/hevc-vvc/), 2026-10-01) | as cited |
| AAC | "Needed by manufacturers or developers of end-user encoder and/or decoder products". $0.98 a unit for the first 500,000, no free tier; $15,000 once ($1,000 for 15 or fewer staff and under $1 million revenue). It quotes Google: implementations "including in open source software… may require patent licenses". Bitstreams carry no fees | [Via LA AAC](https://www.via-la.com/licensing-programs/aac/), read 2026-11-17 |
| OpenH264 | Cisco pays the AVC royalty only for its own binary, "separately downloaded" by the user, with a credit line shown | [Binary licence](http://www.openh264.org/BINARY_LICENSE.txt) |

**How others ship.**
- Shotcut: GPLv3 build with x264 and x265, plus NVENC, libvpl and AMF ([build-shotcut.sh](https://github.com/mltframework/shotcut/blob/master/scripts/build-shotcut.sh)).
- Kdenlive (KDE Craft): x264, x265, NVENC, AMF and libvpl ([ffmpeg.py](https://github.com/KDE/craft-blueprints-kde/blob/master/libs/ffmpeg/ffmpeg.py)).
- OBS: GPL build with x264, no x265 ([obs-deps](https://github.com/obsproject/obs-deps/tree/master/deps.ffmpeg)).
- HandBrake: GPLv2 with x265, NVENC, QSV and MF, but fdk-aac is "by default not included" as "neither free nor redistributable" ([LICENSE](https://github.com/HandBrake/HandBrake/blob/master/LICENSE)).
- LosslessCut: BtbN gpl on Windows and Linux, its own Mac build, and on both stores ([Mac App Store](https://apps.apple.com/app/id1505323402), [Microsoft Store](https://apps.microsoft.com/detail/9p30lsr4705l)).
- OpenCut classic: exports with Mediabunny over WebCodecs ([scene-exporter.ts](https://github.com/OpenCut-app/opencut-classic/blob/main/apps/web/src/services/renderer/scene-exporter.ts)).
- None of these publishes a patent statement that we found. Whether any holds pool licences: *unverified*.
- Every Electron app already ships H.264 and AAC decoders, because Electron builds with `proprietary_codecs = true` ([all.gn](https://github.com/electron/electron/blob/main/build/args/all.gn)). Songbrew does too.

**Decided** (the owner's rule: research the expert question and decide it; no money involved):
- Mac and Windows export only through the system's encoders, whose maker carries the pool licence. That an app calling the OS encoder is covered this way is the common reading, *unverified*.
- x264 and ffmpeg's AAC ship as fallbacks and for proxies and edit copies. That is the open-source norm.
- No x265 and no fdk-aac.
- Count downloads (as Songbrew does) and revisit before 100,000 a year or before any revenue.
- If a pool writes to us, the fallback can go:
  - ffmpeg built without `libx264` and the `aac` encoder;
  - proxies made with hardware encoders (Kdenlive's hardware profiles are also `-g 1 -bf 0`), or in VP9, which WebCodecs decodes everywhere;
  - Linux sound through Cisco's downloaded OpenH264 is no help for AAC, so Linux exports would then need another answer (*open*).

## 4. Audio

- **Decoding.** Mediabunny's `AudioBufferSink` (AAC, MP3, Opus, FLAC, Vorbis, PCM in Chromium ([codec_list.c](https://chromium.googlesource.com/chromium/third_party/ffmpeg/+/refs/heads/master/chromium/config/Chrome/linux/x64/libavcodec/codec_list.c))). ffmpeg converts the rest (AC-3, E-AC-3, DTS) to a WAV edit copy.
- **Mixing.** One `AudioContext` at 48 kHz, so 44.1 kHz phone audio is resampled once.
  - Each clip gets a gain node with fades as gain automation; then track gain and mute; then the master.
  - Export runs the same graph in an `OfflineAudioContext` (Songbrew's approach).
- **Sync.** The audio clock drives the picture, as in Mediabunny's player ("we always use the audio context's clock" ([media-player.ts](https://github.com/Vanilagy/mediabunny/blob/main/examples/media-player/media-player.ts))) and FilmCraft ("the sound card is the master clock" ([README](https://github.com/storytold/filmcraft))).
  - OpenCut classic times playback from `performance.now()` instead ([playback-manager.ts](https://github.com/OpenCut-app/opencut-classic/blob/main/apps/web/src/core/managers/playback-manager.ts)). Don't copy it.
- **Priming and edit lists.** AAC starts with encoder delay, 2112 samples by default in Apple's tools; the MP4 edit list skips it ([TN2258](https://developer.apple.com/library/archive/technotes/tn2258/_index.html)).
  - Take positions from container timestamps after the edit list, and never present samples with negative timestamps.
  - Chrome's bug that dropped negative-timestamp audio chunks is fixed in 156.0.8070 ([Remotion's list](https://www.remotion.dev/docs/mediabunny/webcodecs-bugs)), so it is fixed in Electron 45.
- **Waveforms.** ffmpeg decodes to mono `f32le`; we store min and max per bucket at a few zoom levels (audiowaveform's `.dat` idea), cached beside the proxy; the canvas timeline draws them.
  - wavesurfer.js (BSD-3, v8.1.0) and peaks.js (LGPL-3.0) are whole players we don't need. peaks.js itself says computing in the browser is "CPU intensive" for long files ([README](https://github.com/bbc/peaks.js)).
- **Later:** pitch-kept speed changes. OpenCut used soundtouchjs, which is LGPL-2.1 (npm, read 2026-11-17).

## 5. Project files, undo, autosave, recovery

| Part | Decision | Why and precedent |
|---|---|---|
| Time | Integers in **flicks**, 705,600,000 per second, converted to Mediabunny's seconds at the edge | A flick holds 24, 25, 30, 48, 50, 60, 90, 100 and 120 fps frames, NTSC's ×1000/1001 rates, and 8–192 kHz samples exactly ([Flicks](https://github.com/facebookarchive/Flicks)). A JavaScript number stays exact up to 2^53 flicks, about 147 days. FilmCraft uses integer ticks too, so "edits never drift" ([README](https://github.com/storytold/filmcraft)) |
| Project | One JSON document with a `version`, and a list of migrations, each upgrading one version, never edited once shipped (FilmCraft's rule ([project-files.md](https://github.com/storytold/filmcraft/blob/main/docs/project-files.md))). Media referenced by absolute path, path relative to the project, and a fingerprint (size, modified time, a hash of the first and last MB) for relinking | One file to save, diff and recover |
| Undo | Every edit is a command that changes the document through Immer's `produceWithPatches`, which returns patches and inverse patches "as basis for undo/redo" ([Immer](https://immerjs.github.io/immer/patches), MIT, v11.2.10). A drag is one undo step | Small memory per step; the same patches feed the journal. OpenCut classic hand-wrote a command class per action ([base-command.ts](https://github.com/OpenCut-app/opencut-classic/blob/main/apps/web/src/commands/base-command.ts)) |
| Saving | The main process writes a temporary file, flushes it to disk, then renames it over the old one. A crash leaves "either the complete old file or the complete new" ([FilmCraft](https://github.com/storytold/filmcraft/blob/main/docs/project-files.md)) | Never a half-written project |
| Autosave | Every 30 s after a change, a numbered copy in the project's `Autosave/` folder, keeping the last 20 | FilmCraft keeps 20 versions by default, every 5 minutes. CapCut users expect no Save button: our choice |
| Crash recovery | Patches appended to `project.journal` (JSON lines) between autosaves; a lock file marks an open session. At start, a lock left behind plus a newer journal means "Restore your unsaved changes?" | FilmCraft keeps a recovery journal updated "at least every 5 seconds" by default. Crashes and lost work are the open editors' top complaint (`free-and-open-editors.md`) |

## 6. Timeline UI

- **Decision: build our own.** One Canvas 2D for the ruler, tracks, clips, waveforms and thumbnails; the DOM for inputs and menus; plain TypeScript.
- **Checked and rejected:**
  - `@xzdarcy/react-timeline-editor`: needs React.
  - animation-timeline-js: keyframes, not clips; last release 2024-07-21.
  - Shotstack Studio: PolyForm Shield.
  - `@designcombo/timeline`: no licence on npm; sold commercially.
  - vis-timeline: calendar dates.
- **Borrowed under MIT, with OpenCut's notice:** the logic of OpenCut classic's `timeline/controllers/`, `snapping/`, `group-move/` and `placement/` ([repo](https://github.com/OpenCut-app/opencut-classic)), ported out of React.
- **v1 has:** tracks for video, text and sound; drag, trim, split, ripple delete; snapping to playhead and clip edges; zoom; keyboard shortcuts; selection.

## 7. Open engines and what we can reuse

### OpenCut

| | Classic editor | Rewrite |
|---|---|---|
| Repo | [opencut-classic](https://github.com/OpenCut-app/opencut-classic): MIT, **archived** 2026-05-17 | [OpenCut](https://github.com/OpenCut-app/OpenCut): MIT, 98,766 stars, last push 2026-09-24 |
| What it is | Next.js 16 and React 19 web app, plus server parts (better-auth, Drizzle with Postgres, Upstash). Preview through a Mediabunny `CanvasSink` per clip, with a prefetched next frame and seek generations ([video-cache](https://github.com/OpenCut-app/opencut-classic/blob/main/apps/web/src/services/video-cache/service.ts)). Compositing in a Rust wgpu compositor built to WASM (`opencut-wasm`, MIT, v0.2.10). Export through Mediabunny `CanvasSource` and `AudioBufferSource`. Projects in IndexedDB and OPFS. Whisper through transformers.js. 38 test files | A Cargo workspace whose only member is a GPUI desktop shell (`crates/*` commented out). `crates/media` only builds ffmpeg (BtbN lgpl-shared 8.1.3). "We're not set up to take outside contributions yet" ([README](https://github.com/OpenCut-app/OpenCut)) |
| Maturity | Last release v0.3.0, 2026-04-15. Open in the main repo: 292 issues (98 labelled bug) and 97 PRs (GitHub search, 2026-11-17). Worst bugs: importing a 20-second clip "devours RAM until desktop crash" ([#656](https://github.com/OpenCut-app/OpenCut/issues/656)), "Out of memory" ([#628](https://github.com/OpenCut-app/OpenCut/issues/628)), scrubbing a MOV freezes for 30+ s ([#584](https://github.com/OpenCut-app/OpenCut/issues/584)), frame loss and black screen ([#597](https://github.com/OpenCut-app/OpenCut/issues/597)), a Clipchamp MP4 that won't import ([#637](https://github.com/OpenCut-app/OpenCut/issues/637)) | A stub; "are you guys even working on this?" ([#916](https://github.com/OpenCut-app/OpenCut/issues/916), 2026-10-20) |
| We reuse (MIT, keeping its copyright line) | The frame-cache pattern; the export shape (we have Songbrew's); command-pattern undo; timeline interaction logic; the blend and mask shaders in `rust/crates/compositor/src/shaders/` as reference for ours | Nothing yet |
| We leave | Next.js, auth, database, browser storage; wall-clock playback; soundtouchjs (LGPL) unless needed | — |

### FilmCraft (asked for by the coordinator)

| Fact | Value | Source |
|---|---|---|
| Licence | MIT OR Apache-2.0 (workspace `Cargo.toml`); GitHub labels it Apache-2.0. Shared crates come from [craft-libs](https://github.com/storytold/craft-libs) (Apache-2.0 per GitHub, 440 stars), pinned by git commit, **not on crates.io** (`filmcraft-engine` "does not exist" there) | [Cargo.toml](https://github.com/storytold/filmcraft/blob/main/Cargo.toml), crates.io, 2026-11-17 |
| Size and pace | 18,489 stars, 7,496 forks, created 2026-09-30. Releases: 0.15.0 (10-31), 0.16.0 (11-01), 0.17.0 (11-03), 0.17.1 (11-05), 0.18.0 (11-06), 0.19.0 (11-09), 0.20.0 (11-11), 0.20.1 (11-12). 118 PRs merged 2026-11-10 to 11-17. About 343k lines of Rust in 45 crates, 2,520 tests | GitHub API 2026-11-17; [ROADMAP](https://github.com/storytold/filmcraft/blob/main/ROADMAP.md) (updated 2026-11-08) |
| Bug load | 1,331 open issues and 1,008 open PRs (GitHub's "2,339 open issues" counts both); 420 open issues labelled bug; 71 open issues match "crash" | GitHub search, 2026-11-17 |
| Stage | "alpha". "Ready for real work ~56%", "Essentials user ~60%". Beta is "~400–700 Opus 5.5 agent-hours" away | ROADMAP |
| Known gaps | Launch crashes: macOS 12 (missing VideoToolbox symbol), Intel UHD graphics, Windows 11 (G4). "Windows and Linux get far less testing than macOS"; phone and camera files "less tested". H.264 decoder is 8-bit 4:2:0 only (no High 10 or 4:2:2; G3). Every decoded frame is read back to the CPU and uploaded again (G5). Colour grading, keys and export rendering are still on the CPU | [README](https://github.com/storytold/filmcraft) › Status, [gaps.md](https://github.com/storytold/filmcraft/blob/main/docs/gaps.md) |
| Codecs | Its own Rust H.264 (decode and encode), HEVC (decode only), ProRes, DNxHR, AAC-LC, VP8, VP9, AV1 (decode), Opus. "No FFmpeg inside". HEVC export only through hardware. Hardware decode: VideoToolbox, Media Foundation, VA-API and NVDEC. Hardware encode: VideoToolbox H.264 (opt-in, no B-frames), NVENC; no QSV or AMF | README › Formats and codecs, [hardware-parity.md](https://github.com/storytold/filmcraft/blob/main/docs/hardware-parity.md) |
| Speed | Apple M4 Pro, VideoToolbox: 4K H.264 decodes at 107 fps (35 in software), 4K playback drops no frames. Windows, Xeon E5-2680 v4 with RTX 5060, exporting 300 frames of 4K at 30 fps (10 s): software H.264 54.12 s, NVENC 15.64 s, peak memory about 3.1–3.25 GB | [performance.md](https://github.com/storytold/filmcraft/blob/main/docs/performance.md) (2026-10-05 runs) |
| Ways in | (a) `filmcraft-cli mcp` on stdio, headless: 650+ commands, with `render_frame` returning "PNG of the program frame". (b) The desktop app's JSON-lines control channel on loopback TCP with a token. (c) Embedding the `filmcraft-engine` crate ("session, command registry, history, media pool") in our own binary | [control-protocol.md](https://github.com/storytold/filmcraft/blob/main/docs/control-protocol.md), [agents.md](https://github.com/storytold/filmcraft/blob/main/docs/agents.md) |
| Packages | v0.20.1: Mac universal `.dmg` 118.8 MB, Windows x64 `.msi` 93.4 MB, Linux x86_64 AppImage 106.3 MB, web build 15.6 MB. Its own CI runs took 15–31 minutes each on 2026-11-17 | GitHub API |
| Upstream rules | Its house rules forbid Electron, Tauri or webview shells in their apps, and every change goes through their PR process. An Electron binding would be ours alone to maintain | [AGENTS.md](https://github.com/storytold/filmcraft/blob/main/AGENTS.md) |

**Could our CapCut-easy UI run on FilmCraft's engine?**

| Route | What it takes | Verdict |
|---|---|---|
| Sidecar (`filmcraft-cli mcp` or the control channel) | Editing commands work as JSON. But preview frames come as PNGs: one 4K frame per call, nowhere near 30 frames a second. Sound plays inside its process, not ours | Fine for headless export or tests, not for preview |
| napi-rs addon embedding `filmcraft-engine` | We write and keep a binding to an unpublished API that releases every 1–3 days. Raw frames cross into JavaScript (33 MB per 4K RGBA frame) and are uploaded again. Its playback is built around its egui and wgpu window. Build: a 343k-line workspace on each target, build time for us *unverified* | Weeks of plumbing, plus tracking churn. Not in 2 weeks |
| Rust shell (fork FilmCraft, simplify its egui UI) | Legal (permissive licence; our fork AGPL). But its UI is Premiere-style and dense; we'd inherit its alpha bugs (launch crashes on Windows and Intel graphics) and 1,000 open PRs of churn; Songbrew's shell and checks are lost | No |

**Patents:** its own encoders don't help. A patent covers any implementation of the method, open-source ones included (the Android note quoted on [Via LA's AAC page](https://www.via-la.com/licensing-programs/aac/)). Shipping its H.264 and AAC encoders is the same exposure as x264 and ffmpeg's AAC. The system encoders remain the lower-risk path. FilmCraft's README makes no patent statement.

**Decision:** don't build on FilmCraft for v1. Read its design (integer time, atomic saves, the journal, audio-clock playback, commands for agents) and, from it, its MCP command model when we add ours. Re-check at its beta, or if Electron's decoders fail us on a format its crates read (DNxHR, MXF, AVCHD) and a WASM or napi build of just those decoders becomes the cheaper fix.

### Others checked

| Engine | Licence | State (GitHub API, 2026-11-17) | Verdict |
|---|---|---|---|
| Remotion | Remotion License: free up to 3 employees; companies pay ([pricing](https://www.remotion.dev/docs/license/pricing)) | 73,894 stars, v4.0.544 | No: not open source |
| Diffusion Studio Core | "MPL-2.0" since 2025-11-18 ([commit](https://github.com/diffusionstudio/core/commit/d7234801959a684d1a5b3057439c5efb0040d457)), but free only "as long as you keep the 'Made with Diffusion Studio' watermark"; npm ships one minified file | Last push 2025-11-18 | No |
| Etro | GPL-3.0 | v0.14.1 (2026-08-12); sources are `<video>` elements, "offline rendering coming soon" ([README](https://github.com/etro-js/etro)) | No: not frame-accurate |
| Omniclip | MIT | "Omniclip 2.0 is in development"; last main-branch commit 2025-08-07 | Reference only |
| Motion Canvas | MIT | 20,002 stars; last release 2024-12-14 | Animation in code, not an editor |
| Revideo (now midrender/revideo) | MIT | 0.11.0, 2026-07-10 | Code-to-video renderer |
| Twick | Sustainable Use License 1.0 | v0.15.31 | No |
| WebAV | MIT, plus a paid Pro edition | 1.2.8, 2026-01-10 | Possible, but centred on MP4; Mediabunny is broader |
| OpenReel, FreeCut | MIT | 5,684 and 2,330 stars; no releases | Reference |

## 8. Traps with real footage

| Trap | What goes wrong | What we do | Source |
|---|---|---|---|
| Variable frame rate (phones) | Editors assuming a constant rate drift out of sync. Shotcut warns "not reliable for editing" (MLT flags it when 3+ of the first 20 packets differ in duration) | Pick frames by timestamp (section 2). Proxies and edit copies are made constant with `-fps_mode cfr`. Import records the packet-duration spread | [producer_avformat.c](https://github.com/mltframework/mlt/blob/master/src/modules/avformat/producer_avformat.c), [util.cpp](https://github.com/mltframework/shotcut/blob/master/src/util.cpp), [ffmpeg.html](https://ffmpeg.org/ffmpeg.html) |
| Rotation (portrait phone video stored landscape) | Sideways clips; rotation applied twice | One clockwise rotation per clip, applied in the compositor. **ffprobe gives counter-clockwise degrees, Mediabunny clockwise.** Proxies use `-noautorotate` and our own transform, as Shotcut does | [display.h](https://github.com/FFmpeg/FFmpeg/blob/master/libavutil/display.h), [Mediabunny](https://github.com/Vanilagy/mediabunny/blob/main/docs/guide/reading-media-files.md), [proxymanager.cpp](https://github.com/mltframework/shotcut/blob/master/src/proxymanager.cpp) |
| iPhone HDR: HEVC Main10, Dolby Vision 8.4 or HLG, the default since iPhone 12 | Washed-out or too-bright colours; HEVC missing on Linux and on some Windows GPUs | Detect HLG or PQ at import and tone-map to BT.709 with zscale and tonemap, so people never need to change their phone's settings ("Most Compatible" records H.264) | [Apple TN3145](https://developer.apple.com/documentation/technotes/tn3145-hdr-video-metadata), [ffmpeg-filters](https://ffmpeg.org/ffmpeg-filters.html) |
| HDR in Mac App Store builds | An HDR `<video>` blanks the whole window since Electron 27/28 | We never use `<video>`; keep v1 SDR. Retest before any store build | [electron#47947](https://github.com/electron/electron/issues/47947), open |
| H.264 colour space on Mac | VideoToolbox decoding ignores the stream's colour space and outputs BT.709 | Fine for SDR v1; matters for HDR later | crbug 532860177 via [Remotion's list](https://www.remotion.dev/docs/mediabunny/webcodecs-bugs) |
| 144 Hz or faster monitors | VideoDecoder 5–10× slower | Watch dropped frames per monitor; report it in failure reports | crbug 552063578, open, same list |
| ProRes, MKV, WebM, AVI, MPEG-2, DNxHR | Won't decode in the window; MKV and WebM do demux | Edit copy (section 2); MKV and WebM with H.264, VP9 or AV1 play directly | [registry](https://www.w3.org/TR/webcodecs-codec-registry/) |
| iPhone ProRes and Log (Pro models) | Up to 30× larger than HEVC | Proxy first, edit copy in the background, disk space checked before | [Apple 109041](https://support.apple.com/109041), 2026-11-10 |
| Audio drift | 44.1 vs 48 kHz; AAC priming; start offsets | 48 kHz context, timestamps after edit lists (section 4); a sync test in every check (section 9) | [TN2258](https://developer.apple.com/library/archive/technotes/tn2258/_index.html) |
| Memory on long 4K projects | Frames not closed stall the decoder; inactive or hidden decoders get reclaimed (QuotaExceededError); the V8 heap is capped at 4 GB; OpenCut's out-of-memory bugs | Close every frame in `finally`; a cap on frames in flight; a cache sized in bytes; re-create a reclaimed decoder; proxies for long timelines; thumbnails and peaks from ffmpeg, never in the window | [WebCodecs spec](https://github.com/w3c/webcodecs/blob/main/index.src.html), [Electron blog](https://www.electronjs.org/blog/v8-memory-cage) (2022-06-30) |
| Cinematic mode, spatial audio, Apple and AMD decoder session limits | *Not researched (search budget)* | Collect sample files from users' reports | — |

## 9. Testing on free machines only

| Machine | What it can prove | Limits |
|---|---|---|
| This Mac: 2019 Mac Pro, Intel, Radeon Pro 580X, T2 chip ([Apple](https://support.apple.com/en-us/103265)) | Real GPU, VideoToolbox, WebGL2, 4K playback and export speed, the signed and notarized package | Intel only. HEVC 10-bit in hardware here: *unverified* (`chrome://media-internals` names the decoder). Run checks with `taskpolicy -b`, wait while the 1-minute load is over 32, keep the owner's screen untouched (Songbrew's hidden mode) |
| GitHub `ubuntu-24.04`, `windows-latest`, `macos-15` (arm64, 3 cores, 7 GB), `macos-15-intel` | Packages install and start; software decode and encode; every correctness check below | No GPU on any of them ([runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)). Pin `ubuntu-24.04`: `ubuntu-latest` moves to 26.04 ([#13518](https://github.com/actions/runner-images/issues/13518)). WebGL needs `--enable-unsafe-swiftshader` or `--use-angle=swiftshader` since Chrome 139 ([chromestatus](https://chromestatus.com/feature/5166674414927872)). Electron's own Intel macOS VMs have "no Metal-capable GPU" and pass `--disable-gpu` ([electron#53994](https://github.com/electron/electron/pull/53994)). VideoToolbox inside the Mac VMs: *unverified* |
| Minutes | Public repos are free. Our repo stays private until launch: the Free plan includes $12 a month, and a macOS minute costs $0.062 ([billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)) | Start workflows by hand, as Songbrew does. Build ffmpeg once per version |
| Modal's free monthly credit (Linux with an NVIDIA card) | NVENC export, Linux playback with a GPU (Songbrew already uses it) | Within the free credit only. NVENC on Modal's cards: *unverified* |

**Checks that run without a person.**
- **Generated test clips.** ffmpeg makes them:
  - `testsrc2` with the frame number drawn as coloured blocks the check can read back, and a beep (`sine`) at the same moment as a white flash, every second;
  - versions made VFR, rotated 90°, 44.1 kHz, HLG-tagged HEVC 10-bit (made with a full ffmpeg on the test machine, not the shipped one), ProRes, MKV, WebM and AVI.
- **Import:** ffprobe facts match what the clip was made with. The proxy has the expected frame count (`-count_frames`), constant timestamps, rotation applied and 48 kHz audio ([ffprobe](https://ffmpeg.org/ffprobe.html)).
- **Seeking:** the app, driven by Playwright as in Songbrew's `check-app.ts`, seeks to random frames. The compositor's pixels must read back as exactly that frame number: 0 misses on proxies, Remotion's bar for its exact path.
- **Sync:** the flash frame and the beep sample are within 1 frame, in preview and in the export.
- **Export:** ffprobe checks codec, size, fps, duration within 1 frame, `faststart` and AAC at 48 kHz. Every Nth frame's number decodes as expected.
  - SSIM against a reference frame passes a threshold we measure ourselves, because encoders differ by machine ([ssim/psnr](https://ffmpeg.org/ffmpeg-filters.html)).
  - `framemd5` is exact only on software paths ([framehash](https://ffmpeg.org/ffmpeg-formats.html#framehash-1)), as ffmpeg's own FATE tests use reference hashes with tolerances ([fate-run.sh](https://github.com/FFmpeg/FFmpeg/blob/master/tests/fate-run.sh)).
- **Memory:** a 30-minute timeline of generated 4K clips plays and exports while the window's memory is sampled. It must stay flat.
- **Crash recovery:** `kill -9` during edits. The next start offers the journal, and the restored document equals the one before the kill.

## Recommended stack

| Part | Choice | Licence | Why |
|---|---|---|---|
| Shell | Electron 45 (Chromium 156), Vite, plain TypeScript, pnpm | MIT | One Chromium on all three systems; Songbrew's shell, packaging and checks |
| Packaging and updates | electron-builder, electron-updater (Songbrew's `package.ts` and `updates.ts`) | MIT | Signed and notarized Mac, Windows installer, AppImage and `.deb`, self-update |
| Reading files, decoding, encoding in the window | Mediabunny and WebCodecs | MPL-2.0 (AGPL a named Secondary License) | Frame-accurate by timestamp, rotation, VFR, many containers; hardware encoders |
| Compositor, effects, transitions | Our own WebGL2 shaders | AGPL-3.0 (ours) | Runs everywhere, SwiftShader included; preview equals export |
| Text and captions | Canvas 2D drawn into textures; SRT in and out | ours | System fonts cover CJK and Arabic |
| Audio | Web Audio at 48 kHz, audio clock in charge; `OfflineAudioContext` for export | platform | One graph for playback and export |
| Media tool | ffmpeg and ffprobe as child processes: GPLv3 build with x264 and zimg, no x265 or nonfree; BtbN on Windows and Linux, our own Mac build | GPLv3 (aggregate; compatible with AGPL either way) | Probe, proxies, edit copies, tone-mapping, thumbnails, peaks, AAC and the final mux |
| Final encoders | VideoToolbox and AudioToolbox; Media Foundation; Linux: Chromium's H.264 and ffmpeg's AAC | OS-licensed; open-source fallback | Least patent exposure that still works everywhere |
| Proxies | All-intra H.264, 720p, constant frame rate, 48 kHz, rotation and tone-mapping applied | — | Every frame decodes at once; plays on any computer |
| Timeline | Our own Canvas 2D, logic ported from OpenCut classic | ours, plus MIT notice | No suitable library |
| Project, undo, recovery | JSON with migrations; Immer patches; atomic writes; autosave and journal | Immer MIT | Never lose work: the open editors' top complaint |
| Time | Integer flicks (705,600,000 per second) | constant | Exact for every common frame and sample rate |

## Build order: two weeks

| Day | Step | How it's proven |
|---|---|---|
| 1 | Shell copied from Songbrew; `fetch-ffmpeg.ts` with pinned SHA-256s; the WebCodecs probe extended to 4K H.264 and HEVC encode and decode on all three systems | The package opens on this Mac and on GitHub's Ubuntu and Windows. `ffmpeg -version` runs from inside each package. The probe's JSON is saved in `local/webcodecs-probe/` |
| 2 | Test-clip generator; import with ffprobe into the clip model (rotation, VFR, colour, sound streams) and the "which file plays" choice; the HDR probe (Chromium's canvas against ffmpeg's tone-map) | Unit tests: every generated clip's probed facts match how it was made. The HDR frames' SSIM is recorded, and the Mac edit-copy choice is made from it |
| 3 | Job runner (background priority, cancel, progress): proxies, edit copies, thumbnails, waveform peaks | Each test clip's proxy has the expected frame count, constant timestamps, upright frames and 48 kHz audio; peaks of a sine match its computed loudness |
| 4–5 | Preview: `media://` with byte ranges; Mediabunny sinks; frame cache sized in bytes; WebGL2 compositor; audio clock; seeking | Random seeks read back the exact frame number (0 misses on proxies). Flash and beep within 1 frame. Dropped frames at 1080p and 4K measured on this Mac |
| 6–7 | Timeline (canvas) and edits: place, drag, trim, split, ripple delete, snapping, zoom, several tracks; time in flicks; commands with Immer patches | Property tests: undo after any edit sequence restores the document exactly. Screenshots at phone, tablet, laptop and wide widths in both themes pass the clarity check |
| 8 | Project file, autosave, recovery journal, relinking moved media | `kill -9` mid-edit, then restart: the journal restores the exact document. An atomic-write test. A migration test from v1 |
| 9 | Text and captions (styles, SRT in and out), transitions (crossfade, dip to black, wipe), basic effects (brightness, contrast, saturation, blur), volume and fades | Golden frames on SwiftShader match stored references by SSIM. Latin, CJK and Arabic text draws (no empty boxes) |
| 10–11 | Export: compositor → WebCodecs (prefer hardware) → `StreamTarget` → WAV mix → ffmpeg AAC and faststart mux; 720p, 1080p, 4K; HEVC where possible; the Linux 4K fallback only if day 1's probe failed | The export check on this Mac and on GitHub's three systems: ffprobe facts, frame numbers, sync within 1 frame, SSIM against preview grabs; 4K export time recorded per machine |
| 12 | One local AI feature through the model switcher: captions from speech (the model chosen in this folder's AI research) | Captions of a generated speech clip match its script within a set word-error rate |
| 13 | Packages: signed and notarized `.dmg` (Apple chips and Intel), Windows installer, AppImage and `.deb`; ffmpeg's source and configure line published; licence page | Songbrew's `check-package`, `check-update` and Linux-package workflows, adapted; the source link resolves |
| 14 | Real-footage pass with free-licensed phone clips (Wikimedia Commons; iPhone HDR samples' availability *unverified*), the memory soak, fixes, release | Each clip goes import → edit → export → ffprobe without an error. Memory flat over the 30-minute soak |

Cut first if the days run short: HEVC export, the Linux 4K fallback, the wipe transition. Never cut: crash recovery, sync checks, the edit copy for files that won't decode.

## Still open

- WebKitGTK's WebCodecs (only matters if Tauri comes back).
- Chromium's 4K H.264 encoding on Linux (day 1).
- Chromium's HDR-to-canvas tone-mapping (day 2).
- VideoToolbox in GitHub's Mac VMs.
- Whether free downloads count as AVC units, and AAC's position for free software.
- DaVinci's and CapCut's proxy defaults, Cinematic mode, spatial audio, decoder session limits on Apple and AMD hardware.
