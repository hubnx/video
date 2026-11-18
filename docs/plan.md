# Plan: the video editor (working name `video`)

Draft 2026-11-17, for `video assistant`'s review, then the owner's OK. Who it's for, the jobs and the
gaps are the product manager's: [product.md](product.md) › *Who it's for* and *Gap register*. The
research behind every choice: [research/](research/).

## In one minute

- **What:** a free, open-source video editor for Mac, Windows and Linux, as easy as CapCut, with AI
  built in: free models on the computer, and online models on the user's own account.
- **For:** people who talk to a camera on a computer (YouTubers, course makers, podcasters who film).
  Their four jobs: captions, cutting silences and "um"s, a clean voice, and 9:16 shorts from the same
  recording ([product.md](product.md) › *Who it's for*).
- **First public release, about day 8:** open a video → captions → cut silences and fillers → trim
  and split → export 4K, no watermark. **Day 9–14:** a release every day or two, in the order below.
- **Cost:** $0.50 a month (the `video.hubnx.com` address, approved 2026-11-17). Everything else runs
  on free services.
- **The owner's part:** OK this plan (about 15 minutes); at launch, the posts from your own accounts,
  which `video` drafts. Nothing to test.

## The promise (the rules every release keeps)

| Rule | What it means in the app | Why |
|---|---|---|
| Free for real | 4K, 60 fps, every format, no watermark, no account. **Nothing free today ever becomes paid.** Paid credits, if they come, only for clips generated online; never for export or AI that runs on the computer | 755 of 2,554 low App Store reviews are about paywalls; 207 about features made worse or paid after an update (G14) |
| Private | Works fully offline. Nothing leaves the computer unless the user picks an online model, and the app says so at that moment. The only report is an opt-in check-in that shows what it sends | CapCut's terms license users' videos to ByteDance; Clipchamp needs the internet and OneDrive (G7) |
| AI as tools | Every AI step is a tool the user starts, sees and can undo. Proposed cuts are shown before they apply. Nothing generated is pushed | 292 low reviews complain about AI; Captions' auto-cut "cut words instead" (G1, G15) |
| Never lose work | Autosave that can't corrupt a project, a recovery journal written about a second after each edit, releases tested on a 60-minute 4K project | Crashes are the second-biggest complaint (618), lost projects 70 (G9) |
| Starts first time | One signed installer per system; no Python, Docker or setup steps; AI models download inside the app, their size shown first | Kdenlive's captions need Python and 3.4 GB of add-ons; OpenShot 4.0 didn't start on macOS (G3) |

## How it beats each rival

Detail and sources: [research/easy-editors.md](research/easy-editors.md),
[research/free-and-open-editors.md](research/free-and-open-editors.md),
[research/ai-editors.md](research/ai-editors.md).

| | **Ours** | CapCut | Clipchamp | iMovie | Resolve (free) | Shotcut | Kdenlive | Descript |
|---|---|---|---|---|---|---|---|---|
| 4K export, no watermark | **Free** | Pro ($19.99/mo) | Paid | Free (Mac, 30 fps) | Free (to UHD 60) | Free | Free | Plans from $16/mo |
| Captions from speech | **Free, on the computer** | Pro | Free, Microsoft's cloud | None | Studio ($295) | Free, on the computer | Add-on: Python + 3.4 GB | Paid, metered by minutes |
| Silences and "um"s cut, checked first | **Free** | Pro (*unverified*) | Not found | None | Not found | None ("out of scope") | None (asked since 2019) | Paid (credits) |
| Voice clean-up | **Free** | Pro | Free | Free | Studio | Free (RNNoise) | Effects (*unverified*) | Paid (AI credits) |
| 9:16 that follows the speaker | **Free (week 2)** | Paid (*unverified*) | None | None | Studio | A filter, by hand | None | — |
| Offline, no account | **Yes** | Account needed | Internet and Microsoft account | Yes | Sign-up form | Yes | Yes | Account |
| Mac, Windows, Linux | **All three** | Mac, Windows | Windows, web | Mac | All three | All three | All three | Mac, Windows |
| Easy for a CapCut user | **The goal: minutes to first export** | Yes | Yes | Yes | Hard | Harder | Harder | Yes |
| AI models to choose, local and online | **Yes** | No | No | No | No | No | No | Online only |

**The rivals to watch** (scoreboard: [product.md](product.md) › *Scoreboard*):
- **Shotcut** is the real open rival: free captions on the computer, 15 releases in 2026. It won't
  do silence cutting, more speech models or easy 9:16.
- **FilmCraft** (pure Rust, Apache-2.0, 18,489 stars in seven weeks) is professional and
  Premiere-style; an easy mode would close our gaps fast.
- **OpenCut** (98,759 stars) has shipped nothing since April.

## What each release has

Each release goes out to everyone (no private beta) and updates itself.

| Release | What the user gets | Gap |
|---|---|---|
| **1 (about day 8)** | Drop in a video. The transcript and captions appear (a few good styles, word by word; names fixed in a word list; SRT out). Silences and "um"s proposed on the transcript and the timeline: accept all in one click, undo any one in one click, never mid-word. Trim, split and delete on one timeline, unlimited undo. Export 720p, 1080p or 4K, captions burned in or as a file. Voice clean-up as one switch if it fits (a 10 MiB model) | G1, G2, G5, G16 |
| 1.1 | **9:16 shorts:** reframe a landscape recording with the speaker kept in frame (face tracking on the computer), caption styles for shorts | G4 |
| 1.2 | Voice clean-up (if not in 1); **background removal** behind a person | — |
| 1.3 | **More tracks and titles:** pictures, clips and text over the video; lower thirds and title templates | G13 |
| 1.4 | **Music** (the user's own, with Songbrew linked for music without copyright claims), and **transitions** | — |
| 1.5 | **Online models:** connect OpenRouter (sign in, no key to paste) or a fal key; generate a clip from text or a picture into the timeline; online captions where better. The cost is shown before each run | G10 |

If days run short, transitions and music go first, before anything above them. **Fast export
after cuts** (re-encode only around the cuts, so a 30-minute talk exports in seconds; G8) joins
release 1 if it's cheap on day 7, otherwise 1.1. **Later, each its own brief:** picking the best
moments for shorts (needs a language model per video), driving the app from AI agents (G11), a
phone app (G12).

## How the user goes from download to first video

1. Download from `video.hubnx.com` (Mac: Apple chip or Intel; Windows; Linux) and open it.
2. *Drop a video here.* The video plays at once; "Making captions… about 1 minute" shows real
   progress. The first time, the app downloads the speech model and says its size first (about
   0.5 GB).
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
- **Online, on the user's own account:** OpenRouter first (sign in), then fal (key). The key lives in
  the operating system's keychain and goes only to the provider, never to us. Generating video on the
  computer only works on NVIDIA cards with 24 GB, so everyone else generates online. Sora's API
  closed on 2026-09-24 and Veo left the Gemini API on 2026-10-22; both are checked again when 1.5 is
  built.

## How it's built

Detail and the options weighed: [research/engine-stack.md](research/engine-stack.md).

| Part | Choice | Why |
|---|---|---|
| App | Electron, Vite and plain TypeScript, copied from Songbrew (packaging, signing, notarizing, updates, its process runner) | One Chromium on all three systems; Songbrew already ships it. Tauri would mean WebKit, whose video support varies |
| Preview | Mediabunny (MPL-2.0) and WebCodecs, our own WebGL2 drawing, timed by the sound | Exact frames by time, so phone video with a varying frame rate stays in sync |
| Export | WebCodecs on the computer's own encoder; FFmpeg for the sound and the final file | The operating system's encoders keep the patent exposure small |
| FFmpeg | A separate program, a GPLv3 build with x264, no x265 or "nonfree" parts; its source published beside each download | Compatible with AGPL-3.0 |
| Files that won't play | An edit copy made by FFmpeg (also for HDR) | Every phone and camera file opens |
| Timeline, undo, saving | Our own; undo through Immer; projects as plain files on the computer; autosave and a recovery journal | No suitable library; never lose work |
| AI engines | whisper.cpp, sherpa-onnx, ONNX Runtime, as separate programs or add-ons | No Python; GPU where the computer has one |

**Not built on:** FilmCraft's engine (alpha, 420 open bugs, launch crashes on Windows and older
Macs; looked at again at its beta) or OpenCut's (archived; we borrow a few files under MIT, with its
notice). **Patents:** H.264 is free for the first 100,000 units a year; AAC's pool lists no free
tier. Using the systems' own encoders keeps the exposure small, as Shotcut, Kdenlive, OBS and
HandBrake do. Revisit before 100,000 downloads a year, or before any revenue.

## Build order

Each day ends with its proof. Tests run on this Mac, GitHub's free Mac, Windows and Linux machines,
and Modal's free credit for an NVIDIA card; never a paid machine.

| Day | Step | Proof |
|---|---|---|
| 1 | Shell from Songbrew; FFmpeg fetched with pinned checksums; probe of 4K encode and decode on all three systems. **Filler check:** how many "um"s each speech model keeps, on free-licensed talking-head clips marked by hand | The package opens on all three; FFmpeg runs inside it; the probe and the filler counts saved in `local/` |
| 2 | Import (rotation, varying frame rate, colour, sound), background jobs, edit copies, thumbnails, waveforms | Each generated test clip's facts match how it was made; proxies have the right frame count |
| 3 | Preview: one video and its sound, seeking, the sound clock | Random seeks land on the exact frame; a flash and a beep stay within one frame |
| 4 | Transcript and captions through the switcher: model download, word times, the transcript panel, caption styles, SRT out | Captions of a known script score under a set word-error rate; word times within a set margin |
| 5 | Cleanup: silences and fillers proposed, reviewed, applied, each undoable; trim, split, delete; undo | No cut inside a word; undo after any edit sequence restores the project exactly |
| 6 | Project file, autosave, recovery journal; voice clean-up switch if it fits | A forced quit mid-edit, then restart, brings back the exact project |
| 7 | Export: 720p, 1080p, 4K; captions burned in or as a file; fast export after cuts if cheap | File facts, frame numbers, sound in sync, export equals preview; 4K export time recorded per machine |
| 8 | Installers (Mac Apple chip and Intel, Windows, Linux), the site with downloads, about, privacy, terms and feedback; the public name; **release 1** | A scripted fresh install on GitHub's Mac, Windows and Linux machines reaches a first export, or no release |
| 9 | 9:16 reframe and shorts styles → **1.1** | The speaker's face stays inside the frame on test clips |
| 10 | Background removal (and voice clean-up if not in 1) → **1.2** | The cut-out's edge against a reference matte, measured |
| 11–12 | More tracks, pictures and text over the video, titles and lower thirds → **1.3** | Screenshots at every size, both themes, pass the clarity check |
| 13 | Music and transitions → **1.4** | Golden frames match their references |
| 14 | Online models: OpenRouter and fal → **1.5** | A clip generated and placed, its cost shown first; the key never leaves for anywhere else |

**On every release:** the fresh-install-to-export check on all three systems, the 60-minute 4K
project, the recovery test, and model speeds measured on GitHub's machines and Modal before the app
promises a time. Screens pass the clarity check ([../../docs/brand.md](../../docs/brand.md)) at phone,
tablet and desktop widths in both themes.

## Where it ships

- **Downloads:** GitHub Releases (free once the repo is public, at release 1), linked from
  `video.hubnx.com`; the site on S3 and CloudFront in `hubnx-apps`, within AWS's free allowance, as
  Songbrew's.
- **Windows** shows SmartScreen's warning on the direct download until a Store listing, as Songbrew
  did; a signing certificate costs money, so not without a yes. **The Microsoft Store and the Mac App
  Store** come after release 1, weighed on their own (the Mac store's sandbox and FFmpeg).
- **The repo** goes public at release 1, AGPL-3.0, with a contributor agreement as Songbrew's.
- **The name:** chosen by day 8 after a free USPTO knockout search. Filing a trademark ($350, by
  the owner) is optional and later.

## Why desktop first, and the phone

Most CapCut users edit on phones, so this leaves them out for now, on purpose. Our first user records
and edits on a computer; the models and long 4K files need a computer's memory and disk; and a phone
app is a separate build and two store reviews. **When:** weighed at the 8-week check below; if the bet
is kept, a phone app is the first thing weighed then.

## Keep or stop: checked 8 weeks after release 1

Proposed by `video assistant` (2026-11-17).

- **Go** if all three: 1,000+ GitHub stars; 3,000+ complete installer downloads (GitHub's counts,
  less our own checks: Songbrew's first count was crawlers); and among 30+ people who send the opt-in
  day-7 check-in, half or more exported 3+ videos.
- **Stop** if under a quarter of each: fix the offer once, then stop. Fewer than 30 check-ins reads
  *unknown*, not a pass.
- **The check-in:** opt-in, in the app, showing exactly what it sends (videos exported, minutes to
  first export, setup failures); it goes to hubnx.com's feedback route, as the other apps' feedback
  does, so no new service.

## Risks

| Risk | What we do |
|---|---|
| Speech models drop "um"s (Whisper-type models tend to; the one model built to keep them is non-commercial) | Day 1 measures it. If fillers are found too rarely, release 1 still cuts silences and offers the fillers it finds; online captions on the user's key as the stronger option in 1.5 |
| Slow on 8 GB laptops (most models publish no CPU timings) | Measured on GitHub's machines before any promise; smaller models picked for smaller computers |
| Two weeks is an estimate (Songbrew: 2 weeks from plan to 0.1.35, still before launch) | The release order puts the four jobs first, so whatever ships is useful |
| A rival closes the gap (FilmCraft's easy mode, Shotcut's silences, OpenCut's rewrite) | `video assistant`'s daily scan; our edge is the four jobs done end to end and minutes to first export |
| Patents on H.264 and AAC | The systems' own encoders; revisit before 100,000 downloads a year or any revenue |
| Promotion takes the owner's time, already spent on desk and Songbrew | Drafts ready to post; launch where the first user is (YouTube creators, r/NewTubers, r/podcasting, GitHub, Product Hunt, AlternativeTo as "CapCut alternative") |

## The owner's steps

1. **OK this plan**, or say what to change.
2. **At release 1**: post the drafts from your own accounts (Reddit, Product Hunt, YouTube). Reddit
   bans posts through other accounts, so only you can.
