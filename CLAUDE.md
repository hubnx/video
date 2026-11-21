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
| **Guards, run on any change to the speech engine, the voice detector or the cut code, their numbers logged in `docs/plan.md` › Risks** (local only: the AMI audio never goes in git): the silence cuts against AMI's words, and the filler detectors | `pnpm exec node scripts/check-silences.ts`; the filler check's scripts in `local/filler-check/scripts/` (`results.md` says how) |
| Screenshots of every screen, four window sizes, light and dark, into `local/screens/` | `pnpm build && pnpm exec node scripts/screens.ts` |
| WebCodecs' encoders and decoders at 1080p and 4K, here (`local/probe/`); GitHub's three with `gh workflow run probe.yml` | `pnpm probe` |
| The 4K HEVC proxy and edit-copy times (`local/edit-copy-timing/`); GitHub's Windows and Ubuntu with `gh workflow run edit-copy-timing.yml` | `pnpm exec node scripts/time-edit-copy.ts ../local/edit-copy-timing/hevc-4k-10min.mov 60` |
| Package (unsigned for checks; `--signed` signs and notarizes the Macs), into `local/release/<target>/` | `pnpm build && pnpm package mac-x64` |
| Open a package behind and check FFmpeg runs inside it; GitHub's Windows, Ubuntu (and Apple-chip Mac with `-f mac=true`) with `gh workflow run package-check.yml` | `pnpm check-package mac-x64` |
| Redraw `build-resources/icon.png` from `../brand/icon.svg` | `pnpm exec node scripts/render-icons.ts` |

## How it's built

Dependencies point one way: window → preload → main process → FFmpeg.

| Part | Files |
|---|---|
| Window (Vite, plain TypeScript) | `app/src/`: `main.ts` picks the screen; `start-view.ts`, `clip-view.ts`, `preview-view.ts`; `preview/` (`frames.ts` Mediabunny's frames by timestamp, `clock.ts` the sound's clock, `compositor.ts` WebGL2, `player.ts`); `words.ts` holds **every word shown**; `shared/` the types both sides use (`app-api.ts`, `media.ts`, `time.ts` in flicks) |
| Main process (Electron) | `app/electron/`: `main.ts` (the window, its messages, `media://`), `clips.ts` (opened files and what's made from them), `probe.ts` (ffprobe's facts), `ffmpeg-jobs.ts` (which copies a clip needs, and FFmpeg's arguments), `jobs.ts` (one FFmpeg at a time, below normal priority), `media-response.ts` (byte ranges), `paths.ts`, `targets.ts`, `preload.ts` (the only bridge) |
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
- **Electron refuses a native add-on's own memory** ("External buffers are not allowed"): sherpa-onnx's `readWave` and
  `Vad.front(true)` hand it over, so the transcriber reads the WAV itself and asks for copies (`front(false)`).

## Documentation

| File | Contains |
|---|---|
| [docs/plan.md](docs/plan.md) | **The build plan**: the promise, the rivals compared, each release, the user's flow, the model switcher, the stack, the build order with proofs, shipping, keep-or-stop numbers, risks and what's been measured |
| [docs/product.md](docs/product.md) | **The product manager's** (`video assistant`): who it's for, the scoreboard of rivals, the gap register, what we lead with, the last retro |
| [docs/research/](docs/research/) | Competitors' workflows, features, prices and users' complaints; the AI models and online services; the engine's building blocks (2026-11-17) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | For contributors: the contributor agreement, build and test |
| `local/` (not in git) | Outputs kept for later or for an audit, one folder per tool: `probe/`, `edit-copy-timing/` (the clip and the times), `filler-check/` (the measured set, its source and licence, every detector's output), `import-check/`, `preview-check/`, `screens/`, `release/`, `release-logs/`, `ffmpeg-build/` (sources, logs, builds), `ffmpeg-for-app/`, `icon-options/` (the icon decision's sheet), `research/` |
