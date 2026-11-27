# Plan: hubnx Video (`video`)

Draft 2026-11-17: reviewed by `video assistant` (gate 1, approved with changes, folded in). **OK'd by the owner 2026-11-21** ("ok as planned"); *In one minute* is frozen, and a change to it goes back to the owner (told by `video`, which holds every role since 2026-11-25). Day 0 = 11-21: day 1 = 11-22, release 1 ≈ 11-29, 1.1 ≈ 11-30. Who it's for, the jobs and the
gaps are the product manager's: [product.md](product.md) › *Who it's for* and *Gap register*. The
research behind every choice: [research/](research/).

## In one minute

The screen the owner OKs; everything below is the reference behind it.

- **What:** *hubnx Video*, a free, open-source video editor for Mac, Windows and Linux, as easy as
  CapCut. It leads with the clean-up for people who talk to a camera: silences and "um"s proposed
  and checked, a clean voice, and 9:16 shorts that follow the speaker. Every export free (4K, no
  watermark, no account), private, and AI on the person's own computer or their own online account.
- **When:** release 1 about 8 days after the OK, out quietly; the launch with the posts at 1.1, about
  two weeks after the OK. If the OK comes after about 11-24, the posts wait until after Songbrew's
  launch week (12-08 to 12-14), so the two never share a week.
- **Cost:** $0.50 a month (the `video.hubnx.com` address, approved 2026-11-17). Everything else is
  free services.
- **The owner's steps:** (1) ~~OK this screen~~ done 2026-11-21; (2) ~~add the email alias `video@hubnx.com`~~ done
  2026-11-20; (3) at 1.1, post the drafts `video` writes from your own accounts; (4) ~~the `Project`
  tag in AWS billing~~ already active since 2026-09-15, nothing to do. Nothing to
  test.
- **The three numbers, 8 weeks after release 1:** 1,000+ GitHub stars; 3,000+ complete downloads
  from the site; half or more of 30+ people who opt in to the day-7 check-in exported 3+ videos.
  All three: keep going. Under a quarter of each: fix the offer once, then stop.

## The promise (the rules every release keeps)

| Rule | What it means in the app | Why |
|---|---|---|
| Free for real | 4K, 60 fps, every format, no watermark, no account. **Nothing free today ever becomes paid.** Paid credits, if they come, only for clips generated online; never for export or AI that runs on the computer | 755 of 2,554 low App Store reviews are about paywalls; 207 about features made worse or paid after an update (G14) |
| Private | Works fully offline. Nothing leaves the computer unless the user picks an online model, and the app says so at that moment. The only report is an opt-in check-in that shows what it sends. "No account, nothing uploaded" is said at first run and on the download page | CapCut's terms license users' videos to ByteDance; Clipchamp needs the internet and OneDrive (G7); Meta Edits is Meta's |
| AI as tools | Every AI step is a tool the user starts, sees and can undo. Proposed cuts are shown before they apply. Nothing generated is pushed | 292 low reviews complain about AI; Captions' auto-cut "cut words instead" (G1, G15) |
| Never lose work | Autosave that can't corrupt a project: saved whole about a second after each edit, flushed to disk and renamed into place, the last save kept; releases tested on a 60-minute 4K project | Crashes are the second-biggest complaint (618), lost projects 70 (G9) |
| Starts first time | One signed installer per system; no Python, Docker or setup steps; AI models download inside the app, their size shown first | Kdenlive's captions need Python and 3.4 GB of add-ons; OpenShot 4.0 didn't start on macOS (G3) |

## How it beats each rival

Detail and sources: [research/easy-editors.md](research/easy-editors.md),
[research/free-and-open-editors.md](research/free-and-open-editors.md),
[research/ai-editors.md](research/ai-editors.md).

| | **Ours** | CapCut | Meta Edits | Clipchamp | iMovie | Resolve (free) | Shotcut | Kdenlive | Descript |
|---|---|---|---|---|---|---|---|---|---|
| 4K export, no watermark | **Free** | Pro ($19.99/mo) | Free (Mac) | Paid | Free (Mac, 30 fps) | Free (to UHD 60) | Free | Free | Plans from $16/mo |
| Captions from speech | **Free, on the computer** | Pro | Free, unlimited | Free, Microsoft's cloud | None | Studio ($295) | Free, on the computer | Add-on: Python + 3.4 GB | Paid, metered by minutes |
| Silences and "um"s cut, checked first | **Free** | Pro (*unverified*) | Not stated (Instagram's *First Draft* trims silences in Reels; in the Mac app *unverified*) | Not found | None | Not found | None ("out of scope") | None (asked since 2019) | Paid (credits) |
| Voice clean-up | **Free** | Pro | Not stated | Free | Free | Studio | Free (RNNoise) | Effects (*unverified*) | Paid (AI credits) |
| 9:16 that follows the speaker | **Free (week 2)** | Paid (*unverified*) | Vertical format; following not stated | None | None | Studio | A filter, by hand | None | — |
| Offline, no account | **Yes** | Account needed | Instagram sign-in required | Internet and Microsoft account | Yes | Sign-up form | Yes | Yes | Account |
| Mac, Windows, Linux | **All three, Intel Macs too** | Mac, Windows | Macs with Apple chips only (M1 or later); phones | Windows, web | Mac | All three | All three | All three | Mac, Windows |
| Easy for a CapCut user | **The goal: minutes to first export** | Yes | Yes (*unverified* on Mac) | Yes | Yes | Hard | Harder | Harder | Yes |
| AI models to choose, local and online | **Yes** | No | No; MCP for AI agents | No | No | No | No | No | Online only |

**The rivals to watch** (scoreboard: [product.md](product.md) › *Scoreboard*):
- **Meta Edits** came to the Mac on 2026-11-05 (Social Media Today, BetaNews, AlternativeTo): free
  4K with no watermark and unlimited captions, 50M phone users. Nothing says it cuts silences or
  "um"s, cleans the voice or follows the speaker in 9:16, and it has no Windows or Linux. Windows
  CapCut users paying for Pro are the biggest pool it doesn't reach.
- **Shotcut** is the real open rival: free captions on the computer, 15 releases in 2026. It won't
  do silence cutting, more speech models or easy 9:16.
- **FilmCraft** (pure Rust, Apache-2.0, 18,489 stars in seven weeks) is professional and
  Premiere-style; an easy mode would close our gaps fast. It already makes captions from
  transcripts, and pull request #5027 (opened 2026-11-18, not merged) adds *Remove Silence…*: a menu
  dialog that applies every cut at once, silences only. Having the feature is no longer our edge;
  how it feels is (`video assistant`'s scan, 2026-11-19).
- **OpenCut** (98,759 stars) has shipped nothing since April.

## What each release has

Each release goes out to everyone (no private beta) and updates itself.

| Release | What the user gets | Gap |
|---|---|---|
| **1 (target day 8; public quietly)** | Drop in a video. The transcript and captions appear (a few good styles, word by word; names fixed in a word list; SRT out). Silences and "um"s proposed on the transcript and the timeline: accept all in one click, undo any one in one click, never mid-word (fillers are named in the app and posts only once measured at 80%+, below). Trim and split while captions are still being made, then delete, unlimited undo. Export 720p, 1080p or 4K, captions burned in or as a file, with a *YouTube* preset. Voice clean-up as one switch if it fits (a 10 MiB model), with even loudness (FFmpeg's loudnorm, to YouTube's level) | G1, G2, G5, G16 |
| **1.1 (the launch)** ([design](design/1.1-shorts.md)) | **9:16 shorts:** reframe a landscape recording with the speaker kept in frame (face tracking on the computer), caption styles for shorts, a *Shorts / TikTok / Reels* export preset. **Smooth jump cuts** (G17, decided 2026-11-24): a switch in the clean-up panel, off by default; a gentle punch-in (about 108%), alternating at silence cuts where a face is in frame, from 1.1's face tracking, each zoom a block on the timeline to adjust or remove (Opus Clip sells it as Pro's *Auto Zoom*) | G4, G17 |
| 1.2 | Voice clean-up (if not in 1); **background removal** behind a person | — |
| 1.3 | **More tracks and titles:** pictures, clips and text over the video; lower thirds and title templates | G13 |
| 1.4 | **Music** (the user's own, with Songbrew linked for music without copyright claims), and **transitions** | — |
| 1.5 | **Online models:** connect OpenRouter (sign in, no key to paste): its video service lists 35 models, among them Veo 3.1, Kling 3.0, Seedance, Hailuo, Wan and Runway (`/api/v1/videos/models`, checked 2026-11-17). A fal key adds Kling 4.0, LTX-2.5, Luma, background removal and upscaling; Deepgram or ElevenLabs keys add online captions. Generate a clip from text or a picture into the timeline. The cost is shown before each run. The list is checked again when 1.5 is built: Sora's and Veo's API closures show it moves fast | G10 |

If days run short, transitions and music go first, before anything above them. **Fast export
after cuts** (re-encode only around the cuts, so a 30-minute talk exports in seconds; G8) joins
release 1 if it's cheap on day 7, otherwise 1.1. **Later, each its own brief:** picking the best
moments for shorts (needs a language model per video), driving the app from AI agents (G11; Meta Edits, Shotcut and FilmCraft
have it or plan it, weighed at the first monthly retro on 2026-12-07), a phone app (G12).

## How the user goes from download to first video

1. Download from `video.hubnx.com` (Mac: Apple chip or Intel; Windows; Linux) and open it.
2. *Drop a video here.* The video plays at once; "Making captions… about N minutes" shows real
   progress, N being the time measured for a 20-minute video on an 8 GB computer, not a guess. The
   user can already trim and split meanwhile, so the minutes to first export don't wait on the
   model. The first time, the app downloads the speech model and says its size first (about 0.5 GB).
3. The transcript sits beside the video, captions on it. *Clean up: 23 silences, 9 "um"s* is one
   button; each proposed cut is marked on the transcript and the timeline, ready to keep or undo.
4. *Export* → size (4K is the default when the video is 4K) → *Save*. The file opens in the
   folder when it's done.

The number we watch: minutes from first launch to first export (product.md).

## The AI and the model switcher

Detail: [research/models-and-online.md](research/models-and-online.md).

- **What the user sees:** *Where AI runs: on this computer (free) or online (your account)*. The app
  picks the best model the computer can run; model names and licences sit under *Details*. Each
  model downloads the first time its feature is used, its size shown first.
- **On the computer (no Python for users):** whisper.cpp and sherpa-onnx for speech (Parakeet v3
  for European languages, Whisper large-v3-turbo for the rest, a smaller Whisper on 8 GB laptops);
  Silero and FFmpeg for silences; fillers from the transcript's words; DPDFNet for voice clean-up;
  face tracking for 9:16; RobustVideoMatting and MODNet for background removal. All licensed for an
  AGPL app to download and run.
- **Left out on purpose:** non-commercial models (CrisperWhisper, NLLB-200, RMBG-2.0, F5-TTS,
  XTTS-v2, MatAnyone), because many creators earn from their videos; region-locked ones (HunyuanVideo
  1.5, MiniMax-H3's weights). No face-swapping and no copying other people's voices.
- **Bring your own model** (the owner, 2026-11-18): no AI we host, no free AI credits or trial, no
  Claude sign-in. Online AI stays off until the person connects an account; AI on the computer runs
  only when they start a tool.
- **Online, on the user's own account:** OpenRouter first (one click, OAuth sign-in), then fal,
  Deepgram and ElevenLabs, each through a guided key screen that links straight to that provider's
  key page. Models are picked from a list with our pick marked, never typed, the way Hub Nexus Write's
  switcher works, so the apps behave alike. The key lives in the operating system's keychain and goes
  only to the provider, never to us. Generating video on the computer only works on NVIDIA cards with
  24 GB, so everyone else generates online. Sora's API closed on 2026-09-24 and Veo left the Gemini
  API on 2026-10-22; both are checked again when 1.5 is built.
- **A language model, when one is needed** (*best moments*, once it has its brief): the same list as
  Write's. Models already on the computer are found by themselves (Ollama, LM Studio), then
  OpenRouter, then a guided key for OpenAI, Anthropic or Google. Claude means the person's API key or
  OpenRouter, because Anthropic doesn't allow "Sign in with Claude" in other companies' apps, and
  "Sign in with ChatGPT" is a waitlist for partners (both checked by hubnx, 2026-11-18).

## How it's built

Detail and the options weighed: [research/engine-stack.md](research/engine-stack.md).

| Part | Choice | Why |
|---|---|---|
| App | Electron, Vite and plain TypeScript, copied from Songbrew (packaging, signing, notarizing, updates, its process runner) | One Chromium on all three systems; Songbrew already ships it. Tauri would mean WebKit, whose video support varies |
| Preview | Mediabunny (MPL-2.0) and WebCodecs, our own WebGL2 drawing, timed by the sound | Exact frames by time, so phone video with a varying frame rate stays in sync |
| Export | WebCodecs on the computer's own encoder; FFmpeg for the sound and the final file | The operating system's encoders keep the patent exposure small |
| FFmpeg | A separate program, a GPLv3 build with x264, no x265 or "nonfree" parts; its source published beside each download | Compatible with AGPL-3.0 |
| Files that won't play | An edit copy made by FFmpeg (also for HDR) | Every phone and camera file opens |
| Timeline, undo, saving | Our own; undo through Immer; projects as plain files on the computer; an atomic autosave about a second after each edit (it gives what a recovery journal would, with no second file to replay: decided 2026-11-21) | No suitable library; never lose work |
| AI engines | whisper.cpp, sherpa-onnx, ONNX Runtime, as separate programs or add-ons | No Python; GPU where the computer has one |

**Not built on:** FilmCraft's engine (alpha, 420 open bugs, launch crashes on Windows and older
Macs; looked at again at its beta) or OpenCut's (archived; we borrow a few files under MIT, with its
notice). **Patents:** H.264 is free for the first 100,000 units a year; AAC's pool lists no free
tier. Using the systems' own encoders keeps the exposure small, as Shotcut, Kdenlive, OBS and
HandBrake do. Revisit before 100,000 downloads a year, or before any revenue.

## Build order

Each day ends with its proof. Tests run on this Mac, GitHub's free Mac, Windows and Linux machines,
and Modal's free credit for an NVIDIA card; never a paid machine.

**Checks never take the screen** (`~/.claude/CLAUDE.md` › *Rules in every repo*; hubnx-apps registry ›
*Shared* › *Checks that never take the screen*). The app runs hidden or behind, and a watcher
samples the frontmost app all through each check (an NSWorkspace activation observer, or polling a
few times a second) and fails on any change, without naming ours. Comparing only before and after
misses an app that comes to the front and quits, as Squirrel's relaunch can. Not naming ours means a
rename can't make it pass silently: hubnx Agent's update checks "passed" measuring nothing once its name changed (2026-11-20),
and this app was `video` before *hubnx Video*. Where a check must find our process, the name comes
from the packaging's own constants (product name, `com.hubnx.video`), pinned by a test, and finding
no matching process fails the check. Squirrel's relaunch after an update comes to the front, so the
update check relaunches with `open -g -j`.

| Day | Step | Proof |
|---|---|---|
| 1 | Shell from Songbrew, every word shown kept in one table from the start (as Songbrew's `words.ts`), so translating later is one file; FFmpeg fetched with pinned checksums; probe of 4K encode and decode on all three systems. **Filler check**, on free-licensed talking-head clips with every "um" marked by hand, three detectors: (a) each speech model as it is; (b) Whisper given a prompt full of "um"s, a known trick for keeping them; (c) speech with no word: stretches where the voice detector hears speech but the transcript has none, proposed as *possible "um"* | The package opens on all three without taking the screen, the watcher failing if it finds no process; FFmpeg runs inside it; the probe and the share of marked "um"s each detector and the best combination find saved in `local/` and written in *Risks* |
| 2 | Import (rotation, varying frame rate, colour, sound), background jobs, edit copies, thumbnails, waveforms. Where the computer can't decode a video (HEVC with no hardware decoder: GitHub's Windows and Linux, day 1's probe), captions start from the sound at once while *Preparing your video for smooth playback… about N min* shows real progress | Each generated test clip's facts match how it was made; proxies have the right frame count; the edit-copy time of a 10-minute 4K HEVC clip measured on GitHub's Windows and Linux and this Intel Mac, for that N |
| 3 | Preview: one video and its sound, seeking, the sound clock | Random seeks land on the exact frame; a flash and a beep stay within one frame |
| 4 | Transcript and captions through the switcher: model download, word times, the transcript panel, caption styles, SRT out. The preparing screen as gate 2 asked (2026-11-21): one line on top with one progress bar and the real time left, the transcript filling in beside it as the main thing to look at, each job's detail behind *Details*, and a failed job's own plain sentence with *Send a problem report* | Captions of a known script score under a set word-error rate; word times within a set margin |
| 5 | Cleanup: silences proposed (quiet by loudness and Silero together, 0.25 s kept each side) and accepted with one press, each cut still shown on the transcript and timeline with its own restore; a *Tight / Natural / Relaxed* choice (0.15, 0.25, 0.4 s) if cheap, else 1.1; crossfades at every cut; possible "um"s in English only, lightly underlined, one press cutting one at the strict boundary then playing a second either side with Undo in view, never in "accept all" (gate on day 1's numbers, 2026-11-21); trim, split, delete; undo. The screen shows at a glance what a menu dialog can't: the cuts already proposed when the video lands, marked on the transcript, each kept or undone on its own | No cut inside a word; undo after any edit sequence restores the project exactly; gate 3 compares our flow click by click with FilmCraft's *Remove Silence…* and Meta Edits' |
| 6 | Project file and autosave; voice clean-up switch and even loudness if it fits. The site drafted | A forced quit mid-edit, then restart, brings back the exact project |
| 7 | Export: 720p, 1080p, 4K, the *YouTube* preset; captions burned in or as a file; fast export after cuts if cheap. The site's pages finished | File facts, frame numbers, sound in sync, export equals preview; 4K export time recorded per machine |
| 8 | Installers (Mac Apple chip and Intel, Windows, Linux) and the launch checklist below; **release 1**, public quietly | A scripted fresh install of the **build's own files** (never the public download links, which would inflate the count) on GitHub's Mac, Windows and Linux machines reaches a first export whose flash and beep land within a frame (each system's own AAC encoder: Media Foundation's on Windows is unproven until then), or no release; the update installs and relaunches behind, the frontmost app unchanged at every sample through the run; a model added to the model list shows up on both licence pages with no hand edit |
| 9 | 9:16 reframe, shorts styles and preset; the site's switching page for Premiere Rush's users (`docs/product.md` › *Where and when it launches*), in search with the posts → **1.1, the launch** (the posts) | The speaker's face stays inside the frame on test clips; the demo's minutes measured |
| 10 | Background removal (and voice clean-up if not in 1) → **1.2** | The cut-out's edge against a reference matte, measured |
| 11–12 | More tracks, pictures and text over the video, titles and lower thirds → **1.3** | Screenshots at every size, both themes, pass the clarity check |
| 13 | Music and transitions → **1.4** | Golden frames match their references |
| 14 | Online models: OpenRouter and fal → **1.5** | A clip generated and placed, its cost shown first; the key never leaves for anywhere else |

**On every release:** the fresh-install-to-export check on all three systems, the 60-minute 4K
project, the recovery test, and model speeds measured on GitHub's machines and Modal before the app
promises a time. Modal's November credit is spent, so release 1 promises only times measured on this Mac and
GitHub's machines. **December's Modal share is $5** (given by `music`, 2026-11-20; hubnx-apps
registry › *Modal*): runs from 12-04, after Songbrew's launch-blocking runs, or earlier if `music`
says it's done. Before each run, check `modal billing summary` and estimate the run (an L4 is about
$0.80 an hour); start it only if `music`'s $5 for its release gates stays afterwards, since hitting
the limit disables the workspace mid-run for both apps until January. At $5 spent, stop. NVIDIA
times join the first release after 12-04. Screens pass the clarity check ([../../docs/brand.md](../../docs/brand.md)) at phone,
tablet and desktop widths in both themes. Words people read (launch posts, support replies, the
check-in, the SmartScreen help, first-run messages) follow `~/.claude/CLAUDE.md` › *Outreach and SEO*
› "Every email and message to a person reads like a friendly person wrote it" (owner, 2026-11-19).
Each launch post is drafted after reading that community's current self-promotion rules and
megathreads; the rule and the format sit beside the draft, checked against the owner's account in
hubnx-apps registry › *Community accounts* (r/macapps rule 6, for example: a main-feed post needs
200+ karma and a 60-day-old account, else a comment in the month's *App Pile* thread; hubnx Write's
post was removed for it, 2026-11-20).

**Check-ins** (agreed 2026-11-17 with `video assistant`; since 2026-11-25 `video` holds them, each gate reviewed by a
fresh reviewer agent given the screens and the code, not the builder's conclusions: `product.md` › *Four gates*): day 1's filler numbers; screenshots at phone, tablet and desktop width in both themes when each screen first
works, before polish (day 4 transcript and caption styles, day 5 cleanup review, day 7 export dialog
and presets, day 8 download page with the SmartScreen picture); release 1 passes its gate 3 review
before it goes out. **Gate 3 approved 2026-11-25** with six fixes, all made the same day; **Public 2026-11-27**, the
history first rewritten to the owner's name only (as Songbrew and Agent); the Apple-chip Mac's and Ubuntu's fresh
installs passed again that morning on the public repo (0.7 and 0.5 minutes to first export).

### Debt: shortcuts taken on purpose

| Shortcut | What it costs | How it goes |
|---|---|---|
| Export waits for the edit copy where the window can't use the original: HDR (every iPhone's default), and HEVC with no hardware decoder (2026-11-24) | The edit copy starts when the clip opens, so it's often done by export; if not, the dialog shows its progress. A 10-minute 4K iPhone HDR clip is ready about 15 min after opening on this Mac, up to about an hour on a 2-core machine (*Risks*) | HDR that decodes: tone-map in the compositor's shader and read the original. HEVC that doesn't: decode in FFmpeg, which needs the captions drawn there too (libass, not in our build today) |
| The transcript is drawn again whole as each stretch of words arrives (day 4) | Grows with the clip's length; unnoticed at an hour, untested beyond | Append each stretch's paragraphs instead |
| The updater is proved end to end on the Intel Mac only (`scripts/check-update.ts`, 2026-11-25: the newer version's strip after 8 s, installed and reopened in 20 s, signed, the screen never taken); Windows and Linux rest on Songbrew's identical updater, shipped through its 0.1.47 | A Windows or Linux copy that can't update would stay on its version until the person downloads again | Port the check to GitHub's Windows (the installer run with `--updated /S`) and Ubuntu (the AppImage replaced in place) before 1.1 |

## Where it ships

- **Release and launch are separate.** Release 1 goes public quietly once its checks pass (no
  private beta). The launch posts wait for 1.1, whose demo shows all four jobs.
- **Where and when the launch posts go** (decided 2026-11-20 with `music` and `agent`, since every
  post comes from the owner's one account; detail in [product.md](product.md)). Nothing in Songbrew's
  launch week, 12-08 to 12-14.
  - **At 1.1, where the first user is:** a YouTube demo, r/NewTubers, r/podcasting, r/VideoEditing,
    r/linux and a Windows-friendly community, each drafted to its current rules.
  - **r/macapps:** December's *App Pile* thread, first come (Write used the account's 30-day
    main-feed slot on 11-20); if another app takes December, January.
  - **Product Hunt: the week of 2027-01-25**, two weeks clear of Songbrew's (12-08) and Agent's
    (week of 2027-01-11), with several releases and real reviews to show by then.
  - **r/LocalLLaMA: skipped.** It's Songbrew's place, and not where our first user is.
- **Downloads** come from the site's own bucket, `video.hubnx.com/download/`, with the version in
  each file name, as Songbrew's do (S3 and CloudFront in `hubnx-apps`), and the installed app
  updates itself from there. GitHub Releases carries the same files for the open-source crowd; its
  per-file count, which includes every bot, is recorded beside ours as a second number (decided
  2026-11-20: the keep-or-stop number rests on downloads the site serves).
- **Counted** by the shared download counter (Songbrew's, moving into hubnx-apps' private `shared/`
  with `music`'s yes, 2026-11-20), from the site's access log: only complete first-install files
  (`.dmg`, `Setup.exe`, AppImage, `.deb`) fetched by a browser count. Update downloads, partial
  ranges, our own checks, crawlers, scripts and link scanners are left out. It's an ops script that
  reads a private log bucket, so it and this app's settings for it never go in this public repo:
  they live in the private **`hubnx/video-ops`**, cloned at `video/ops/` and git-ignored here, with
  the site's stack (one stack in us-east-1, for CloudFront's certificate), its deploy and live check
  (agent `hubnx-video-live-check`), and `ops/site/infra/count-downloads.ts`, set from hubnx-apps'
  `local/downloads-proof/video-use.md`; the installer patterns are pinned by a test with release 1's
  real file names, since a name matching none is never counted (decided 2026-11-21, as music's
  split). `video` runs it from 12-06, at least every 13 days. The site provides what it
  reads, as `music/site/infra/site.yaml` does: CloudFront standard logs as JSON (timestamp, path,
  status, bytes, browser name; no address field), a log bucket that deletes after 14 days, and
  pages that load their own styles and scripts.
- **Cost:** CloudFront's always-free 1 TB a month out holds to about 5,000 downloads a month; the
  `video-monthly` budget warns before that, and anything past it goes to the owner first.
- **Windows is the biggest open door** (2026-11-20): Meta Edits doesn't reach it, and Windows
  CapCut users pay for Pro. Day 8's checks treat it as first-class, and the launch posts speak to
  Windows users too. It shows SmartScreen's warning on the direct download until a Store listing;
  that scares exactly our users. So the download page shows the *More info → Run anyway* step with a picture,
  and **the Microsoft Store comes first after release 1**: it removes the warning at no cost, as it
  did for Songbrew. A signing certificate costs money, so not without a yes. The Mac App Store is
  weighed after (its sandbox and FFmpeg).
- **The repo** goes public at release 1, AGPL-3.0, with the shared contributor agreement from
  `hubnx/.github` (*Apps HQ* builds it before day 8; root roadmap › *Open decisions* 11), not a copy.
- **The name is *hubnx Video*** (decided 2026-11-19, after the owner's rule of `hubnx` plus the app's
  address word): in the window title, installer, signing name, site and posts, and the app ID
  `com.hubnx.video` (as Songbrew's `com.hubnx.music`). `hubnx` is always lowercase, so a sentence
  never starts with it. The trademark question is the `hubnx` brand's, not this app's. Search finds
  the job, so page titles and first lines lead with it: *hubnx Video: a free CapCut alternative with
  captions and silence cutting*.

**Launch checklist, day 8** (hubnx-apps `CLAUDE.md` › Phase 2):
- [ ] The registry row updated
- [x] Repo `hubnx/video` public (2026-11-27)
- [x] `video.hubnx.com` with its zone ($0.50 a month, approved): stack `video-site` live 2026-11-25 (pages only, out of
  search; packages at release 1), in the private `hubnx/video-ops`
- [ ] Shared parts from the public `hubnx/web-parts` repo pinned by commit, never a path into
  hubnx-apps' private `shared/`, since this repo goes public (*Apps HQ* splits it out by day 8)
- [x] The contributor agreement check: the repo calls `hubnx/.github`'s reusable workflow, never a
  copied one (wired 2026-11-21, its key set by `cla/add-repo.sh`)
- [x] A ruleset on `main` making the **CLA** status required for merging (2026-11-27; repository admins may bypass
  it, so the release's own commits still go straight to `main`)
- [ ] Privacy, terms and `/about/` pages; the footer's *About Hub Nexus* (no "by Hub Nexus" line
  beside the name, which wears `hubnx` already); *More from Hub Nexus*; the feedback form; outbound
  and file links in a new tab, set once at build time (`docs/brand.md`)
- [x] Open-source licenses (2026-11-25): `/licenses/` on the site and *Help* › *Open-source licenses* in the app,
  both made at build time by the shared builder and its Electron part (lifted from Songbrew's
  `notices-collector.ts` and `app-notices.ts`: every build's packages, what electron-builder packs,
  Electron's and Chromium's notices). Ours to add: FFmpeg's GPLv3 text with its source offer, ONNX
  Runtime and each local model's licence listed from the model list, our AGPL-3.0, and a written
  decision for any copyleft package (`docs/brand.md`)
- [ ] Support address `video@hubnx.com` (the owner's step: an alias)
- [ ] Privacy-first visitor counts (visitors → downloads), as typing's: the CDN's request log
  counted into numbers alone
- [ ] Search Console: the site's sitemap on the `hubnx.com` domain property
- [x] The AWS budget (in the stack, 2026-11-25): `video-monthly`, about $2 a month, in the site's own stack, filtered on
  `user:Project$video` and emailing apps@hubnx.com (free; decisions, 2026-11-19; as `music-monthly`). Every
  resource tagged `Project=video` and `Portfolio=hubnx-apps`; the account-wide alarm is the backstop
- [x] The feedback form (app and site, 2026-11-25; the app's sends from its main process in the same contract,
  `electron/feedback.ts`, proved by `scripts/check-feedback.ts`) through the shared parts' `feedback-report.ts`, which holds
  hubnx.com's `/api/feedback` contract: hubnx registered `video` for both, the site at
  exactly `https://video.hubnx.com` (hubnx's Assistant, 2026-11-20)
- [ ] For `hubnx.com/apps` at 1.1: the app's icon as an SVG on the site; `video` sends
  hubnx the link, the icon's address, one English line, where it runs and that it's free
- [ ] No Stripe product: nothing is sold

## Why desktop first, and the phone

Most CapCut users edit on phones, so this leaves them out for now, on purpose. Our first user records
and edits on a computer; the models and long 4K files need a computer's memory and disk; and a phone
app is a separate build and two store reviews. **When:** weighed at the 8-week check below; if the bet
is kept, a phone app is the first thing weighed then.

## Keep or stop: checked 8 weeks after release 1

Proposed by `video assistant` (2026-11-17).

- **Go** if all three: 1,000+ GitHub stars; 3,000+ complete first-install downloads, counted as in
  *Where it ships* (Songbrew's first count was all crawlers and our own checks); and among 30+ people
  who send the opt-in day-7 check-in, half or more exported 3+ videos.
- **Stop** if under a quarter of each: fix the offer once, then stop. Fewer than 30 check-ins reads
  *unknown*, not a pass.
- **The check-in** (approved by hubnx, 2026-11-20; the contract is hubnx `docs/roadmap.md` row 90):
  `kind: "checkin"` on hubnx.com's `/api/feedback`, sending three whole numbers: videos exported,
  minutes to first export (or none yet) and setup failures, with the version and the system. No
  free text, name, address or install ID. Only daily totals are stored, in ranges (exports 0, 1–2,
  3–9, 10+), which is what "half exported 3+" needs.
  - **Asked once, in plain words, after the first successful export**: a quiet note in the
    export-done view, never at first launch and never a dialog over their work. Off until they say
    yes; switchable in Settings.
  - **Live since 2026-11-21.** Each refusal is logged as `checkin.refused` with its code (`checkin-app`,
    `-name`, `-version`, `-os`, `-field`), never silently; a 429 (`checkin-busy`) retries once, the next
    day. Development copies send to `?dryRun=1`; CI uses a stand-in. The *what it sends* view uses the
    same words as `hubnx.com/about/privacy`, which lists them for hubnx Video.
  - The app keeps first-launch time, exports and setup failures **on the computer only** from the
    start, and sends them once, at day 7, only after a yes. A local flag keeps it to one per install,
    since the server doesn't enforce that. The *what it sends* view shows exactly the three numbers.
  - **The gap:** people who never reach a first export are never asked, so setup failures count
    only those who later succeed. Two things cover the rest: the fresh-install gate on GitHub's
    three systems before every release, and a *Send a problem report* button on every setup-error
    screen (feedback kind `problem`, the log attached only if they agree).

## Risks

| Risk | What we do |
|---|---|
| Speech models drop "um"s (Whisper-type models tend to; the one model built to keep them is non-commercial) | Day 1 measures three detectors (*Build order*). **The rule:** if the best combination finds 80%+ of the marked "um"s, the app and its posts say "cuts silences and ums"; below that, release 1 still proposes the ones it finds, the promise is captions and silences, and fillers aren't named until a release measures 80%+. Every cut is reviewed first, so false alarms cost little. Online captions on the user's key are the stronger option in 1.5. **Measured 2026-11-21** (AMI headset mics, CC BY 4.0, 60 min, 306 fillers; `local/filler-check/results.md`): the best is Parakeet v3's own "um"/"uh" words, each spanned to the next word: 67% recall, 70% precision, but 152 of 318 proposals cut more than 30 ms into a word (69 more than 100 ms). Whisper as it is finds 6%; with the filler prompt and DTW times, 53% at 68%; "speech with no word" is 5–12% precise. **Below 80%: fillers aren't named.** Parakeet hears 88% of fillers within 100 ms, so the misses are mostly timing; the set is meeting speech whose reference times come from forced alignment, a rough lower bound for one person on a close microphone. PodcastFillers was not used: non-commercial |
| Voice clean-up harms the speech, or is too slow to offer | **Measured 2026-11-24** (`scripts/check-voice.ts`, `local/voice-check/`): a minute of AMI speech with pink noise at −38 dBFS and a 60 Hz hum, cleaned by DPDFNet-2 at 48 kHz (Apache-2.0, code and weights): noise in the pauses down 23.6 dB (−40.3 to −63.9), speech within 1.1 dB of the original; 24 s an audio minute on this Intel Mac (41 s was at background priority, as checks run here; 1 to 8 threads take the same), 14 s on GitHub's Apple-chip Mac, 21 s on its Ubuntu and 24 s on its Windows (`voice-speed.yml`, 2026-11-24). So it ships in release 1 as a switch, off by default, made in the background with its progress said, kept with the clip; the switch says about how long it would take before it's on, from those figures until this computer has measured its own (`src/shared/voice-speed.ts`) |
| A silence cut eats into a word (silences are in "accept all", so they carry the zero bar) | **Measured 2026-11-21** on the filler check's AMI hour (`scripts/check-silences.ts`, `local/filler-check/silences.json`): quiet by loudness alone let 17 of 233 cuts reach 100 ms into the reference's words. Quiet needs loudness **and** Silero's voice detector to agree, cuts keep 0.25 s each side, pauses under 1 s stay: 208 cuts, 5.4 of 60 minutes removed, 7 reaching 100 ms into a reference word, every one a one-syllable word the forced alignment stretched to 1.3–2.2 s over the pause, the cut in its quiet tail; 2 remain with words held to 1 s. Every cut gets a short crossfade. Fillers (gate on day 1's numbers): English only, lightly underlined, one press cuts one at the strict boundary, then plays a second either side with Undo in view; never in "accept all", never named (`docs/product.md` › G1) |
| Slow on 8 GB laptops (most models publish no CPU timings) | Measured on GitHub's machines before any promise; smaller models picked for smaller computers. **First numbers 2026-11-21**, this Intel Mac's processor at 8 threads: Parakeet v3 3.8 s per audio minute (plus 1.6 s for Silero's voice detection), Whisper large-v3-turbo 24 s; whisper.cpp's Metal wrote no text on this Mac's AMD card, so it runs on the processor here |
| 4K won't play or export on some computers | **Measured 2026-11-21** (day 1's probe, `local/probe/`): H.264 4K encodes and decodes through WebCodecs on all four, in software at least: GitHub's Apple-chip Mac 27 fps, Windows 18, Ubuntu 23 (2 to 5 cores, no graphics card); this Intel Mac by hardware. HEVC (iPhones) decodes only with a hardware decoder (this Mac yes; GitHub's Windows and Ubuntu no), so there it gets a proxy and an edit copy, captions starting from the sound at once. Ubuntu's WebCodecs has no AAC encoder: FFmpeg's, as planned. The package opened, unseen, on all four with FFmpeg 9.0.2 running inside (x264; AudioToolbox's AAC on the Macs, Media Foundation's on Windows). **Export measured 2026-11-24** (`scripts/check-export.ts`, `local/export-check/timings.json`), this Intel Mac at background priority: a minute of a phone's 4K HEVC exported at 4K in 103 s, a minute of 720p talk with captions in the picture in 41–48 s. GitHub's machines are measured with the fresh-install check on day 8 |
| An iPhone's 4K HEVC waits a long time to prepare | **Measured 2026-11-21**, a minute of 4K HEVC Main 10 at 24 Mb/s (`local/edit-copy-timing/`). This Intel Mac (32 threads, other work running): proxy 27 s SDR, 84 s HDR (tone-mapped); edit copy 107 s SDR, 113 s HDR, and after sizing before tone-mapping and x264's superfast for edit copies: proxy 26 s SDR, 29 s HDR; edit copy 43 s SDR, 90 s HDR. GitHub's 2-core machines, no graphics card: Windows proxy 68 s SDR, 87 s HDR, edit copy 191 s and 382 s; Ubuntu proxy 65 s and 77 s, edit copy 174 s and 306 s. So a 10-minute iPhone HDR clip plays smoothly after about 13–15 min on such a machine; captions never wait for it. **Day 7 (2026-11-24):** export waits for the edit copy, which starts when the clip opens, and shows its progress; reading the original instead is in *Build order › Debt*, since FFmpeg would also have to draw the captions |
| Two weeks is an estimate (Songbrew: 2 weeks from plan to 0.1.35, still before launch) | The release order puts the four jobs first, so whatever ships is useful |
| A rival closes the gap (FilmCraft's easy mode, Shotcut's silences, OpenCut's rewrite) | the daily scan (`product.md` › *Rhythm*); our edge is the four jobs done end to end and minutes to first export |
| Patents on H.264 and AAC | The systems' own encoders; revisit before 100,000 downloads a year or any revenue |
| Promotion takes the owner's time, already spent on desk and Songbrew | Drafts ready to post; launch where the first user is (*Where and when the launch posts go*), plus GitHub and AlternativeTo as "CapCut alternative" |

## The owner's steps

1. **OK this plan**, or say what to change.
2. **Done 2026-11-20** (checked in admin.google.com: the alias reads `video`): add the alias `video@hubnx.com` (admin.google.com →
   *Directory* › *Users* → your name → *Alternate email addresses* → add `video` → *Save*). The
   privacy and terms pages name it.
3. **At the launch (1.1, about two weeks from now):** post the drafts from your own accounts
   (Reddit, Product Hunt, YouTube). Reddit bans posts through other accounts, so only you can.
   Release 1, a few days earlier, needs nothing from you.
4. ~~**The `Project` tag in AWS billing**~~ nothing to do: it has been active since 2026-09-15 (`video assistant`,
   2026-11-21).
