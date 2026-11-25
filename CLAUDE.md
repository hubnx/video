# video (hubnx Video)

A free, open-source video editor for Mac, Windows and Linux: as easy as CapCut, every export free
(4K, no watermark), private, with AI built in through one model switcher: free models on the computer
and online models on the user's own key. Its public name is *hubnx Video* (`docs/plan.md` ›
*Where it ships*); the repo goes public at launch under AGPL-3.0 (hubnx-apps `docs/decisions.md`,
2026-11-17). Shared rules: [../CLAUDE.md](../CLAUDE.md); this app's row and next check:
[../docs/registry.md](../docs/registry.md). Ports 4160–4169.

**Two chats** (hubnx-apps `CLAUDE.md` › *Who speaks for whom*, 2026-11-20): `video` builds, tests and releases, and
owns these files; `video assistant` is the product manager and the app's contact with every other chat, so `video`
reaches other chats through it.

## Commands

From `app/`, with pnpm. Every check runs the app behind, never taking the screen (`scripts/start.ts` › `watchFrontmost`
samples the app in front all through and fails if ours ever was; `oursRunning` fails a check that never saw ours);
heavy runs go through `taskpolicy -b`, after `uptime` shows a 1-minute load under 32.

| What | Command |
|---|---|
| Install (then `pnpm exec node node_modules/electron/install.js` once, if Electron's program is missing) | `pnpm install` |
| The pinned FFmpeg for a system, into `local/ffmpeg-for-app/<target>` | `pnpm ffmpeg mac-x64` (or `mac-arm64`, `win-x64`, `linux-x64`) |
| Build FFmpeg from its pinned sources (`ffmpeg/build.sh`): the Macs here, `FFMPEG_JOBS=8` on this shared Mac; Linux and Windows on GitHub, `gh workflow run ffmpeg.yml -f targets='["win-x64"]'`. A new build goes on the release named in `ffmpeg/builds.json`, its SHA-256 pinned there | `FFMPEG_JOBS=8 taskpolicy -b bash ../ffmpeg/build.sh mac-arm64 ../local/ffmpeg-build/out` |
| Build and open the app, in front, for a person | `pnpm dev` |
| Tests · type check | `pnpm test` · `pnpm typecheck` |
| Day 2's import check: eight kinds of clip made by a full FFmpeg (Homebrew's here), read and prepared as the app does | `TEST_FFMPEG=/usr/local/bin/ffmpeg pnpm exec node scripts/check-import.ts` |
| Day 3's preview check: exact frames on 40 random seeks, the picture within a frame of the sound, a sideways phone clip upright | `pnpm build && TEST_FFMPEG=/usr/local/bin/ffmpeg pnpm exec node scripts/check-preview.ts` |
| Day 4's transcript check: a minute of AMI talk heard (the models downloaded once into `local/models/`), its transcript filling in, captions on the picture; screenshots `local/screens/4-transcript-*` | `pnpm build && pnpm exec node scripts/check-transcript.ts` |
| Day 7's export check: a cut clip's frames and sound in sync, a cancelled export leaving nothing, captions in the picture, a minute of 4K HEVC at 4K, an HDR clip through its edit copy; times per computer in `local/export-check/timings.json` | `pnpm build && pnpm exec node scripts/check-export.ts` |
| **Guards, run on any change to the speech engine, the voice detector or the cut code, their numbers logged in `docs/plan.md` › Risks** (local only: the AMI audio never goes in git): the silence cuts against AMI's words, and the filler detectors | `pnpm exec node scripts/check-silences.ts`; the filler check's scripts in `local/filler-check/scripts/` (`results.md` says how) |
| Screenshots of every screen, four window sizes, light and dark, into `local/screens/` | `pnpm build && pnpm exec node scripts/screens.ts` |
| Voice clean-up's speed, for the estimate on its switch (`src/shared/voice-speed.ts`): here at normal priority, and GitHub's three with `gh workflow run voice-speed.yml` | `pnpm exec node scripts/time-voice.ts` |
| WebCodecs' encoders and decoders at 1080p and 4K, here (`local/probe/`); GitHub's three with `gh workflow run probe.yml` | `pnpm probe` |
| The 4K HEVC proxy and edit-copy times (`local/edit-copy-timing/`); GitHub's Windows and Ubuntu with `gh workflow run edit-copy-timing.yml` | `pnpm exec node scripts/time-edit-copy.ts ../local/edit-copy-timing/hevc-4k-10min.mov 60` |
| Package (unsigned for checks; `--signed` signs and notarizes the Macs), into `local/release/<target>/`: a release builds all four here | `pnpm build && pnpm package mac-x64` |
| Day 8's feedback check: a problem report and the day-7 check-in read by a stand-in on this Mac (never hubnx.com), the check-in's body then accepted by hubnx.com's dry run | `pnpm build && pnpm exec node scripts/check-feedback.ts` |
| **Before every release, the fresh-install check**: the release's own packages installed on GitHub's Windows, Ubuntu (AppImage, and the .deb opens) and Apple-chip Mac (notarized and stapled), each captioning, cleaning up and exporting a talk clip with the flash and beep in sync; minutes to first export in each log's `FRESH_INSTALL_RESULT` line. The Intel Mac here, on its package | `gh workflow run fresh-install.yml -f tag=v1.0.0` · here: `pnpm exec node scripts/check-fresh-install.ts --program "../local/release/mac-x64/mac/hubnx Video.app/Contents/MacOS/hubnx Video" --speech <wav> --said "<its words>"` |
| **The update check, whenever the updater changes**: an older signed Intel copy, installed from its disk image, finds a newer on a server here, downloads it, restarts into it (about 10 min, most of it zipping) | `pnpm build && pnpm exec node scripts/check-update.ts` |
| Open a package behind and check FFmpeg runs inside it; GitHub's Windows, Ubuntu (and Apple-chip Mac with `-f mac=true`) with `gh workflow run package-check.yml` | `pnpm check-package mac-x64` |
| Redraw `build-resources/icon.png` and the site's icons (`site/public/`) from `../brand/icon.svg` | `pnpm exec node scripts/render-icons.ts` |
| **The site's hosting, deploy and live check**: the private `ops/` (`hubnx/video-ops`, cloned here and git-ignored; its own `CLAUDE.md`). Pages only, or pages, packages and update feeds (`app/scripts/release-files.ts` lists them, feeds last) | from `ops/`: `pnpm run deploy` · `pnpm run deploy --release` · `pnpm run check-live` |
| **The website** (`site/`, its own pnpm package; build the app first, whose licences list it carries): build, its tests, and every page at phone, tablet, laptop and wide sizes in both themes into `local/site-screens/` (headless Chrome, the server stopped after) | from `site/`: `pnpm build` · `pnpm test` · `pnpm build && pnpm screens` |

## How it's built

Dependencies point one way: window → preload → main process → FFmpeg.

| Part | Files |
|---|---|
| Window (Vite, plain TypeScript) | `app/src/`: `main.ts` picks the screen; `start-view.ts`, `clip-view.ts`, `preview-view.ts`; `preview/` (`frames.ts` Mediabunny's frames by timestamp, `clock.ts` the sound's clock, `compositor.ts` WebGL2, `player.ts`); `export-view.ts` and `export/` (the picture encoded by WebCodecs through the preview's own compositor and captions, presets, the captions file); `problems.ts` (the window's errors to the log); `words.ts` holds **every word shown**; `shared/` the types both sides use (`app-api.ts`, `media.ts`, `time.ts` in flicks) |
| Main process (Electron) | `app/electron/`: `main.ts` (the window, its messages, `media://`), `clips.ts` (opened files and what's made from them), `probe.ts` (ffprobe's facts), `ffmpeg-jobs.ts` (which copies a clip needs, and FFmpeg's arguments), `jobs.ts` (one FFmpeg at a time, below normal priority), `exports.ts` and `export-sound.ts` (the window's picture written to disk, then FFmpeg adds the cut sound at YouTube's loudness), `media-response.ts` (byte ranges), `paths.ts`, `targets.ts`, `preload.ts` (the only bridge) |
| Website | `site/`: static pages with their shared parts written in at build time (`vite.config.ts`, `src/header.ts`, `src/footer.ts`, `src/downloads.ts` from `app/scripts/release-files.ts`); links, feedback and the licenses list from the public `@hubnx/web-parts` pinned by commit; colours from `brand/colors.css`, as the app's. Out of search (`src/site.ts` › `INDEXED`) until release 1's files are served |
| FFmpeg | `ffmpeg/build.sh` (pinned FFmpeg 9.0.2, x264, zimg; GPLv3, no x265 or nonfree), `ffmpeg/builds.json` (each build's SHA-256), the release `ffmpeg-9.0.2-1` (the builds and their sources: GPL's source offer) |

## Traps

- **VS Code's terminal sets `ELECTRON_RUN_AS_NODE=1`**: `scripts/start.ts` removes it before starting Electron.
- **Node's own TypeScript can't run parameter properties** (`constructor(private x)`): `tsconfig.json` sets
  `erasableSyntaxOnly`, so the type check refuses them.
- **Bash reads a script as it runs**: `ffmpeg/build.sh` runs from a copy of itself, so editing it mid-build is safe.
- **FFmpeg copies a file's rotation into its output under `-noautorotate`**: the jobs pass `-display_rotation:v:0 0`
  and turn the picture themselves, once.
- **zscale needs every colour named** for HDR tone-mapping, or it finds "no path between colorspaces".
- **GitHub's artifact storage for hubnx fills up**: workflows read results from logs and upload to releases.
- **Never hide a build's output** (`> /dev/null`): a failed build leaves the last good one, and checks pass on old code.
- **Backticks inside a shader's comment end its template string**: the build fails, and the old code keeps running.
- **At background priority everything timed runs slow**: under `taskpolicy -b`, as checks run here, the preview's clock
  ran at a third to half real time, and voice clean-up took 41.7 s a minute against 24 s at normal priority
  (2026-11-24). A check waits on the clock's time, never on wall time; a speed that goes into the app or the plan is
  timed at normal priority (`scripts/time-voice.ts`), or on GitHub.
- **Mediabunny's `new Quality(number)` is a 0–1 quality level, not a bitrate**: a bitrate goes in
  `new Quality({ bitrate })`. Its typing accepts any object as a `Quality`, so the type check doesn't catch it, and a
  bitrate taken as a level asks for quantizer mode at level 6.2, which this Mac's hardware encoder refuses ("Encoder
  initialization error"). This Intel Mac's hardware H.264 encoder also refuses `latencyMode: "realtime"`.
- **Plain `node` here is Node 20**, which can't run TypeScript: run scripts with `pnpm exec node`, which uses the
  project's Node 24 (`devEngines`).
- **A check that clears `local/<tool>/` at its start clears a log written there**: keep a run's log outside its own
  folder.
- **Squirrel (the Mac's updater) checks the newer copy's signature against the older's**, so the update check needs
  signed packages; Apple's notary isn't part of it, so `check-update.ts` signs without notarizing.
- **A `DOMException` crosses the preload bridge as an empty object** (WebCodecs' errors are DOMExceptions): the window
  describes its own errors (`src/problems.ts`) and the bridge carries only text.
- **Electron refuses a native add-on's own memory** ("External buffers are not allowed"): sherpa-onnx's `readWave` and
  `Vad.front(true)` hand it over, so the transcriber reads the WAV itself and asks for copies (`front(false)`).

## Documentation

| File | Contains |
|---|---|
| [docs/plan.md](docs/plan.md) | **The build plan**: the promise, the rivals compared, each release, the user's flow, the model switcher, the stack, the build order with proofs, shipping, keep-or-stop numbers, risks and what's been measured |
| [docs/product.md](docs/product.md) | **The product manager's** (`video assistant`): who it's for, the scoreboard of rivals, the gap register, what we lead with, the last retro |
| [docs/research/](docs/research/) | Competitors' workflows, features, prices and users' complaints; the AI models and online services; the engine's building blocks (2026-11-17) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | For contributors: the contributor agreement, build and test |
| `local/` (not in git) | Outputs kept for later or for an audit, one folder per tool: `probe/`, `edit-copy-timing/` (the clip and the times), `filler-check/` (the measured set, its source and licence, every detector's output), `import-check/`, `preview-check/`, `export-check/` (the exports and their times), `site-screens/`, `voice-speed/`, `screens/`, `release/`, `release-logs/`, `ffmpeg-build/` (sources, logs, builds), `ffmpeg-for-app/`, `icon-options/` (the icon decision's sheet), `research/`, `seo/` (`keywords.csv`, kept by `video assistant`: the searches we target, their positions with date and source, the next step) |
