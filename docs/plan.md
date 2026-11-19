# Plan: the video editor (working name `video`)

Draft 2026-11-17: reviewed by `video assistant` (gate 1, approved with changes, folded in); waiting on the owner's OK. Who it's for, the jobs and the
gaps are the product manager's: [product.md](product.md) › *Who it's for* and *Gap register*. The
research behind every choice: [research/](research/).

## In one minute

- **What:** a free, open-source video editor for Mac, Windows and Linux, as easy as CapCut, with AI
  built in: free models on the computer, and online models on the user's own account.
- **For:** people who talk to a camera on a computer (YouTubers, course makers, podcasters who film).
  Their four jobs: captions, cutting silences and "um"s, a clean voice, and 9:16 shorts from the same
  recording ([product.md](product.md) › *Who it's for*).
- **Release 1 (target day 8):** open a video → captions → cut silences and fillers → trim and split →
  export 4K, no watermark. It goes public quietly once its checks pass; **the launch, with the posts,
  comes at 1.1 (9:16 shorts), about two weeks from now**, because the demo that sells is "a 20-minute
  talk → captions, cleaned up, a 9:16 short, free, in N minutes". **Day 9–14:** a release every day
  or two, in the order below.
- **Cost:** $0.50 a month (the `video.hubnx.com` address, approved 2026-11-17). Everything else runs
  on free services.
- **The owner's part:** OK this plan (about 15 minutes); a 2-minute email alias; at the launch, the
  posts from your own accounts, which `video` drafts. Nothing to test.

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
| **1 (target day 8; public quietly)** | Drop in a video. The transcript and captions appear (a few good styles, word by word; names fixed in a word list; SRT out). Silences and "um"s proposed on the transcript and the timeline: accept all in one click, undo any one in one click, never mid-word (fillers are named in the app and posts only once measured at 80%+, below). Trim and split while captions are still being made, then delete, unlimited undo. Export 720p, 1080p or 4K, captions burned in or as a file, with a *YouTube* preset. Voice clean-up as one switch if it fits (a 10 MiB model), with even loudness (FFmpeg's loudnorm, to YouTube's level) | G1, G2, G5, G16 |
| **1.1 (the launch)** | **9:16 shorts:** reframe a landscape recording with the speaker kept in frame (face tracking on the computer), caption styles for shorts, a *Shorts / TikTok / Reels* export preset. A candidate, `video assistant`'s call: a slight alternating zoom on each cut, so cleaned-up talks don't jump | G4 |
| 1.2 | Voice clean-up (if not in 1); **background removal** behind a person | — |
| 1.3 | **More tracks and titles:** pictures, clips and text over the video; lower thirds and title templates | G13 |
| 1.4 | **Music** (the user's own, with Songbrew linked for music without copyright claims), and **transitions** | — |
| 1.5 | **Online models:** connect OpenRouter (sign in, no key to paste): its video service lists 35 models, among them Veo 3.1, Kling 3.0, Seedance, Hailuo, Wan and Runway (`/api/v1/videos/models`, checked 2026-11-17). A fal key adds Kling 4.0, LTX-2.5, Luma, background removal and upscaling; Deepgram or ElevenLabs keys add online captions. Generate a clip from text or a picture into the timeline. The cost is shown before each run. The list is checked again when 1.5 is built: Sora's and Veo's API closures show it moves fast | G10 |

If days run short, transitions and music go first, before anything above them. **Fast export
after cuts** (re-encode only around the cuts, so a 30-minute talk exports in seconds; G8) joins
release 1 if it's cheap on day 7, otherwise 1.1. **Later, each its own brief:** picking the best
moments for shorts (needs a language model per video), driving the app from AI agents (G11), a
phone app (G12).

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
| 1 | Shell from Songbrew, every word shown kept in one table from the start (as Songbrew's `words.ts`), so translating later is one file; FFmpeg fetched with pinned checksums; probe of 4K encode and decode on all three systems. **Filler check**, on free-licensed talking-head clips with every "um" marked by hand, three detectors: (a) each speech model as it is; (b) Whisper given a prompt full of "um"s, a known trick for keeping them; (c) speech with no word: stretches where the voice detector hears speech but the transcript has none, proposed as *possible "um"* | The package opens on all three; FFmpeg runs inside it; the probe and the share of marked "um"s each detector and the best combination find saved in `local/` and written in *Risks* |
| 2 | **The public name** (a free USPTO knockout search), since the app's ID, signing name, site and repo hang on it. Import (rotation, varying frame rate, colour, sound), background jobs, edit copies, thumbnails, waveforms | The name's search recorded; each generated test clip's facts match how it was made; proxies have the right frame count |
| 3 | Preview: one video and its sound, seeking, the sound clock | Random seeks land on the exact frame; a flash and a beep stay within one frame |
| 4 | Transcript and captions through the switcher: model download, word times, the transcript panel, caption styles, SRT out | Captions of a known script score under a set word-error rate; word times within a set margin |
| 5 | Cleanup: silences and fillers proposed, reviewed, applied, each undoable; trim, split, delete; undo | No cut inside a word; undo after any edit sequence restores the project exactly |
| 6 | Project file, autosave, recovery journal; voice clean-up switch and even loudness if it fits. The site drafted | A forced quit mid-edit, then restart, brings back the exact project |
| 7 | Export: 720p, 1080p, 4K, the *YouTube* preset; captions burned in or as a file; fast export after cuts if cheap. The site's pages finished | File facts, frame numbers, sound in sync, export equals preview; 4K export time recorded per machine |
| 8 | Installers (Mac Apple chip and Intel, Windows, Linux) and the launch checklist below; **release 1**, public quietly | A scripted fresh install of the **build's own files** (never the public download links, which would inflate the count) on GitHub's Mac, Windows and Linux machines reaches a first export, or no release |
| 9 | 9:16 reframe, shorts styles and preset → **1.1, the launch** (the posts) | The speaker's face stays inside the frame on test clips; the demo's minutes measured |
| 10 | Background removal (and voice clean-up if not in 1) → **1.2** | The cut-out's edge against a reference matte, measured |
| 11–12 | More tracks, pictures and text over the video, titles and lower thirds → **1.3** | Screenshots at every size, both themes, pass the clarity check |
| 13 | Music and transitions → **1.4** | Golden frames match their references |
| 14 | Online models: OpenRouter and fal → **1.5** | A clip generated and placed, its cost shown first; the key never leaves for anywhere else |

**On every release:** the fresh-install-to-export check on all three systems, the 60-minute 4K
project, the recovery test, and model speeds measured on GitHub's machines and Modal before the app
promises a time. Screens pass the clarity check ([../../docs/brand.md](../../docs/brand.md)) at phone,
tablet and desktop widths in both themes.

**Check-ins with `video assistant`** (agreed 2026-11-17): day 1's filler numbers; day 2's name
shortlist; screenshots at phone, tablet and desktop width in both themes when each screen first
works, before polish (day 4 transcript and caption styles, day 5 cleanup review, day 7 export dialog
and presets, day 8 download page with the SmartScreen picture); release 1 passes its gate 3 review
before it goes out.

## Where it ships

- **Release and launch are separate.** Release 1 goes public quietly once its checks pass (no
  private beta). The launch posts wait for 1.1, whose demo shows all four jobs.
- **Downloads** come from the site, `video.hubnx.com/download/`, as Songbrew's do (S3 and CloudFront
  in `hubnx-apps`, within AWS's free allowance), and the installed app updates itself from there.
  They're counted Songbrew's way (`music/site/scripts/count-downloads.ts`), from the site's access
  log: only complete first-install files (`.dmg`, `Setup.exe`, AppImage, `.deb`) fetched by a
  browser count. An installed copy's update downloads, partial ranges, update files, our own checks,
  crawlers, scripts and link scanners are left out. One way, one place: the counter moves into
  hubnx-apps `shared/` with `music`'s agreement rather than living in two copies.
- **Windows** shows SmartScreen's warning on the direct download until a Store listing; it scares
  exactly our users. So the download page shows the *More info → Run anyway* step with a picture,
  and **the Microsoft Store comes first after release 1**: it removes the warning at no cost, as it
  did for Songbrew. A signing certificate costs money, so not without a yes. The Mac App Store is
  weighed after (its sandbox and FFmpeg).
- **The repo** goes public at release 1, AGPL-3.0, with a contributor agreement as Songbrew's.
- **The name:** chosen on day 2 after a free USPTO knockout search. Filing a trademark ($350, by
  the owner) is optional and later.

**Launch checklist, day 8** (hubnx-apps `CLAUDE.md` › Phase 2):
- [ ] The registry row updated
- [ ] Repo `hubnx/video` public; `video.hubnx.com` with its zone ($0.50 a month, approved)
- [ ] Privacy, terms and `/about/` pages; the "by Hub Nexus" maker line; *More from Hub Nexus*; the
  feedback form; outbound and file links in a new tab, set once at build time (`docs/brand.md`)
- [ ] Support address `video@hubnx.com` (the owner's step: an alias)
- [ ] Privacy-first visitor counts (visitors → downloads), as typing's: the CDN's request log
  counted into numbers alone
- [ ] Search Console: the site's sitemap on the `hubnx.com` domain property
- [ ] The AWS budget: the account-wide `hubnx-apps-all-apps-monthly` covers it
- [ ] hubnx's Assistant confirms its feedback route accepts `video`'s feedback and check-in (asked
  before day 8), and adds `video` to `hubnx.com/apps` at the launch
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
- **The check-in:** opt-in, in the app, showing exactly what it sends (videos exported, minutes to
  first export, setup failures); it goes to hubnx.com's feedback route, as the other apps' feedback
  does, so no new service.

## Risks

| Risk | What we do |
|---|---|
| Speech models drop "um"s (Whisper-type models tend to; the one model built to keep them is non-commercial) | Day 1 measures three detectors (*Build order*). **The rule:** if the best combination finds 80%+ of the marked "um"s, the app and its posts say "cuts silences and ums"; below that, release 1 still proposes the ones it finds, the promise is captions and silences, and fillers aren't named until a release measures 80%+. Every cut is reviewed first, so false alarms cost little. Online captions on the user's key are the stronger option in 1.5. **Measured:** not yet (day 1) |
| Slow on 8 GB laptops (most models publish no CPU timings) | Measured on GitHub's machines before any promise; smaller models picked for smaller computers |
| Two weeks is an estimate (Songbrew: 2 weeks from plan to 0.1.35, still before launch) | The release order puts the four jobs first, so whatever ships is useful |
| A rival closes the gap (FilmCraft's easy mode, Shotcut's silences, OpenCut's rewrite) | `video assistant`'s daily scan; our edge is the four jobs done end to end and minutes to first export |
| Patents on H.264 and AAC | The systems' own encoders; revisit before 100,000 downloads a year or any revenue |
| Promotion takes the owner's time, already spent on desk and Songbrew | Drafts ready to post; launch where the first user is (YouTube creators, r/NewTubers, r/podcasting, GitHub, Product Hunt, AlternativeTo as "CapCut alternative") |

## The owner's steps

1. **OK this plan**, or say what to change.
2. **Before day 8, about 2 minutes:** add the alias `video@hubnx.com` (admin.google.com →
   *Directory* › *Users* → your name → *Alternate email addresses* → add `video` → *Save*). The
   privacy and terms pages name it.
3. **At the launch (1.1, about two weeks from now):** post the drafts from your own accounts
   (Reddit, Product Hunt, YouTube). Reddit bans posts through other accounts, so only you can.
   Release 1, a few days earlier, needs nothing from you.
