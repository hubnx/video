# video: how we decide and keep winning

The product manager's file: the rhythm, where users' reviews come from, the scoreboard of rivals and
the gap register. `video` builds (how to build, `CLAUDE.md`, `plan.md`, `research/*`); `video
assistant` is the product manager: researches, decides what isn't money, writes it here, challenges
each step of the build, and tells the owner in plain words.

## The owner's brief (2026-11-17)

"Act as a product manager … regular check-ups of the best competitors … a regular cadence to create
new features from research … check all platforms' reviews regularly on the related best competitors,
identify all gaps for current features and just-launched features … check-ins during implementation
to give critical feedback, best options, trade-offs, and communicate … retrospect, decide and plan
ahead to keep it the best, beating all the best competitors, with the best user experience in mind."

## Who it's for

Decided 2026-11-17, agreed with `video`.

- **The first user:** people who talk to a camera on a computer: YouTubers, tutorial and course makers, podcasters who film. Why: their paid features are the ones a model on the computer can do free, and they edit on computers already, where local models and big files fit.
- **Their four jobs:** (1) captions; (2) cutting silences and filler words; (3) a clean voice; (4) 9:16 shorts from the same recording, with the speaker kept in frame. Under all four, the promise: every export free, 4K, no watermark, no account; nothing free today becomes paid later. Paid credits, when they come, are only for clips generated online, priced to carry their cost (gap register G14). **AI is bring your own model** (owner, 2026-11-18): models on the computer, or online ones on the person's own account; never AI we host and pay for, no free AI credits or trial.
- **First public release (target day 8; "about two weeks" to the owner):** open a video → captions → cut silences and fillers → trim and split on one timeline → export 4K, with named presets (*YouTube*; *Shorts / TikTok / Reels* from 1.1). Voice clean-up joins it as one switch, with even loudness (YouTube's level), if a small local denoiser fits.
- **Fillers are named only when measured** (decided 2026-11-17, gate 1): on day 1, three detectors are measured on hand-marked clips (each model raw, Whisper with a disfluency prompt, and "speech with no words" proposed as *possible "um"*). At 80%+ of the marked "um"s found, release 1 and its posts say "cuts silences and ums". Below that, the release still proposes the ones it finds, but the promise is captions and silences until a release measures 80%+.
- **Release and launch are separate:** release 1 goes public quietly once its gates pass (public, no private beta). The launch posts wait for 1.1, because the demo that sells needs 9:16: "a 20-minute talk → captions, cleaned up, a 9:16 short, free, in N minutes".
- **Then, in this order:** 1.1 9:16 reframe with caption styles for shorts → 1.2 voice clean-up (if not in release 1) and background removal → 1.3 more tracks, titles and lower thirds → 1.4 music and transitions → 1.5 online models (generated clips; the owner approved them for week 2). Music and transitions are where CapCut already wins and our user needs them least, so they're cut first if time runs short. Auto-picking the best moments for shorts comes later, as its own brief: it needs a language model per video.
- **The number to watch:** minutes from first launch to first export, measured by a scripted fresh install on free CI runners for every release, and in the opt-in day-7 check-in.
- **Go/stop numbers:** in `plan.md` (proposed to `video` 2026-11-17: checked 8 weeks after the first release).

## Rhythm

| Rhythm | When | What | Where it lands |
|---|---|---|---|
| **Daily scan** | Tuesday to Friday, 08:51 | Rivals' releases, prices and news (CapCut, OpenCut's GitHub, DaVinci Resolve, Descript, Clipchamp, new entrants); new review themes spotted; what `video` committed or wrote since yesterday. About ten calls | The scoreboard and gap register only if something changed; the owner only if it matters; critical points to `video` |
| **Market and plan** | Mondays, 09:37 | Every rival on the scoreboard re-checked; their users' reviews on every source below, new praise and complaints; each feature we have or just launched against the best rival's, gap by gap; new feature ideas nobody has, each given a call and a home; Search Console once the site is live; notes cleaned; the plan's order re-ranked with `video` | One short pulse to the owner; this file updated in place; critical points to `video` |
| **Retro** | Fridays, 16:23 | What shipped, what moved (downloads, stars, reviews, issues), what we got wrong, what to change, next week's plan | The owner hears each decision that needs them |
| **When something happens** | At once | A rival's launch, price change or shutdown; a release of ours; a spike in reviews or issues | A plain message to the owner and to `video` |

**Four gates for every feature:**
1. **Before building**: a brief from `video` (the problem and its evidence, the best rival's way, options with trade-offs, a recommendation, how we'll know it worked); the PM replies with critical feedback before code starts.
2. **Mid-build**: a review of the flow and screens against the brief (the clarity check in `../../docs/brand.md`, the edge cases).
3. **Before release**: the result against the brief, in screenshots at phone, tablet and desktop width and both themes, walked as a user beside the best rival's flow.
4. **One to two weeks after**: did the number move? Keep, change or cut, written in the feature's own file.

**How it runs:** session crons, which die with the session; recurring ones expire after 7 days. The
Monday pass schedules the next Monday and Friday one-shots and re-creates the daily scan. After a
restart or compaction, run CronList and re-create whatever is missing from the prompts below.

| Job | Cron | Prompt |
|---|---|---|
| Daily scan | `51 8 * * 2-5`, recurring | VIDEO DAILY SCAN: read `video/docs/product.md` › *Rhythm*; check rivals' releases, prices and news and new review themes; read `video`'s commits and docs since the last scan; about ten calls; update this file only if something changed; tell the owner only what matters; send critical points to `video` |
| Market and plan | `37 9 <next Monday> *`, one-shot | VIDEO WEEKLY PASS: the *Market and plan* row; then schedule the next Monday and Friday one-shots and re-create the daily scan |
| Retro | `23 16 <next Friday> *`, one-shot | VIDEO RETRO: the *Retro* row; then schedule the next Friday |

## Where the reviews come from

| Source | How | Limit |
|---|---|---|
| Apple App Store (CapCut, iMovie, VN, InShot, Descript, DaVinci Resolve) | Apple's public customer-reviews feed per app ID | The latest 500 per country |
| Google Play, Microsoft Store (CapCut, Clipchamp, DaVinci Resolve) | Public pages, fetched or searched | Without JavaScript, Play gives the rating, the count and three featured reviews; the Microsoft Store only ratings (2026-11-17). Search snippets are marked *unverified* |
| Trustpilot, G2, Capterra, Product Hunt, AlternativeTo | Public pages, fetched or searched | As above |
| Reddit (r/VideoEditing, r/CapCut, r/davinciresolve, r/NewTubers, r/podcasting, r/kdenlive, r/linux) | Search and mirrors; Reddit answers scripts with 403 | Sampled, not counted |
| Open-source rivals' GitHub (OpenCut, Kdenlive, Shotcut, OpenShot, LosslessCut) | `gh`, read only: issues, discussions, releases | Their users are developers |
| Hacker News | Algolia's public search API | Developers |
| Ours, once public | GitHub issues and stars, downloads, Search Console, the feedback form | Only people who choose to say |

## Scoreboard

Every number with its date and source. Raw data and the scripts behind the counts:
`local/reviews/` (community: `community/themes.md`, `projects.md`, `community_notes.md`; stores:
`app-store/themes.md`). Features, prices and workflows: `video`'s `research/`.

| Rival | Kind | Where it stands (2026-11-17) | Watch for |
|---|---|---|---|
| CapCut | Closed, free with Pro; desktop, web, phone | Pro went from $9.99 to $19.99 a month in January 2026, 1080p export paid (decisions, 2026-11-17). App Store, 500 reviews 2026-10-29 to 11-15 (one listing for iPhone, iPad and Mac): 310 at 1–3★; paywall 101, AI 75, crashes 37, features moved to paid by an update 26: "now we have to pay for basic tools like captions". Google Play 3.5 from 13.2M; Microsoft Store 4.8 from 94,305. Product Hunt 4.3 from 43: "The pro features paywall is getting a little aggressive lately" | Prices and paywalls, terms, AI features |
| **Shotcut** | Open source (GPL), desktop | **The strongest open rival on our jobs**: free Whisper captions on the computer since 24.10; 15 releases in 2026, the latest v26.11.15 on 2026-11-16 (GitHub API); an MCP server (a way for AI agents to drive it) planned. Its forum's most-wanted: a lower-thirds library (79 likes), portrait↔landscape (39 likes, 7,745 views), automatic silence removal (23 likes, 8,031 views), which a regular called "out of scope". Won't add more speech models: "limited human resources" | Silence removal, 9:16, MCP, ease of use |
| **FilmCraft** | Open source (MIT or Apache-2.0), pure Rust; Mac, Windows, Linux, browser | **The fastest-moving open editor**: created 2026-09-30, 18,489 stars, 7,496 forks, 2,339 open issues, 100+ contributors; v0.20.1 on 2026-11-12, a release every few days; its own codecs; an agent control protocol (GitHub API, 2026-11-17). A pro, Premiere-style editor, not CapCut-easy; Its engine is not our base (plan, 2026-11-17: alpha, launch crashes). **Moving into our jobs (2026-11-19):** captions from transcripts with speaker labels, exported as TTML, SCC or MCC; a *Remove Silence* pull request (#5027, opened 2026-11-18, not merged) adds a menu dialog that applies every cut in one step: silences only, no fillers, no review cut by cut; animated word-by-word captions asked (#4982) | **The biggest threat**: an easy mode, silence cutting or captions would close our gaps fast. Every daily scan reads its releases |
| Kdenlive | Open source (GPL), desktop | Three feature releases a year, v26.08.3 on 2026-11-03; its most-upvoted issue is "auto cuts silences" (#247, open since 2019); 959 likes on AlternativeTo's CapCut page, the most | Silence removal, performance |
| OpenCut | Open source (MIT), web and desktop | 98,766 stars; last app release v0.3.0 on 2026-04-15; last commit 2026-09-24 (GitHub API). A Rust rewrite announced 2026-05-26 (#811); users ask "are you guys even working on this?" (#916). Most-wanted: a phone app (#14), Chinese, Docker, export presets for YouTube and TikTok (#737) | Whether the rewrite ships |
| LosslessCut | Open source (GPL), desktop | 46,138 stars; v3.70.2 on 2026-10-28. "Smart cut" (#126: 120 👍, 159 reactions) is the most-reacted ask across all six open projects: cut without re-encoding the whole file | Smart cut |
| OpenShot | Open source (GPL), desktop | 6,805 stars; v4.1.1 on 2026-11-02. Version 4.0 didn't start on macOS (#6099, 12); Apple-silicon issues 35 reactions over three issues; users asked to remove Google Analytics (10) | Mac reliability |
| Olive | Open source | Abandoned: last commit 2024-12-05, no stable release | A fork |
| DaVinci Resolve | Closed, free and Studio | Latest 21.2 (CG Channel, 2026-11-15): support for Apple's touchscreen MacBook Pro. Crashes are 42% of its Mac App Store low reviews (78 of 185) and 48% on iPad (91 of 191); its top praise is "free": "I cannot believe this incredible software is free"; on iPad "the most unintuitive app i ever had the displeasure of using". AlternativeTo 4.1 from 28: a sign-up form before download, 3 GB size; the free version on Linux lacks H.264, the format phones record (HN) | AI features moving into the free tier |
| Clipchamp | Closed, Microsoft, free and paid | 4K export paid: users say it locks "4k rendering behind paid gates" (HN); Microsoft Store 4.7 from 27,007 | Export limits, Windows bundling |
| Canva (video) | Closed, online, free and paid | Trustpilot 4.0 from 8,505 (all of Canva): "canva is so pay to win for video", "2-5 seconds to load every cut"; App Store 500 reviews from 2026-10-20, 101 low: paywall 33, AI 31: "better without ai" | Video features, prices |
| iMovie | Closed, Apple, free | Mac: 500 reviews 2022–2026, 346 low; crashes 87, worse after updates 48; aspect ratio or 9:16 named 34 times: "iMovie doesnt allow you to change the video dimensions/aspect ratio", "No 4K in 2026?". iPhone: "No vertical video support"; praise: easy | Updates |
| Final Cut Pro | Closed, Apple, paid | Mac: 500 reviews, 141 low; crashes 52, paywall 32; praise easy 120; asks for auto captions (22): "WISH YOU HAD AUTO CAPTIONS LIKE CAPCUT HAS", "PLEASE GIVE US AUTO REMOVE SILENCE". iPad: paywall 146 of 311 low, a one-time licence asked 22 times, "Internet required to edit" | Captions, silence removal, prices |
| Descript | Closed, paid | Editing by transcript, filler-word removal; no official App Store app | Prices, local options |
| Filmora | Closed, paid | Filmora 16 launched 2026-10-12, sold on AI. Mac App Store: 500 reviews, 242 low; paywall 127, watermark 60, export blocked until paying 27, sign-in 24: "Bought lifetime license in 2023--then forced to pay subscription to remove watermark" | Watermark and licence changes |
| Captions | Closed, phone, paid | App Store: 500 reviews, 330 low; paywall 205, AI 117, billing or refund trouble 90, export blocked until paying 31: "I hit export, and I have to pay to do that!"; silence cutting "cut words instead"; 9:16 from a horizontal podcast "damn near impossible … keep the talkers on screen" | Prices, AI quality |
| VN, InShot | Closed, phone, free | Rated well (VN iPhone 54 low of 500; InShot 61 of 500); praise: easy. VN Mac: failed exports, "VIDEO IS BLACK when it finished exporting"; InShot pushes app installs to remove the watermark | Ease |
| Premiere Pro | Closed, paid | | AI features and prices |
| Opus Clip, Submagic, VEED, Kapwing | Closed, online, paid | | AI clipping and captions, prices |
| Meta Edits | Closed, free, phone; a desktop version and an AI assistant previewed (TechCrunch, 2026-06-11) | Whether the desktop version has shipped: check at the Monday pass | A free desktop editor from Meta |
| YouTube Create / *Edit with AI* | Closed, free, phone | Turns raw footage into Shorts (date not found) | Our 9:16 job (G4) |
| New open-source entrants | Open source | Product Hunt 2026: OpenChatCut 112, WeftCut 79, Powermove 74, SupoClip 71 points, no reviews; the common pitch is an editor that AI agents drive | Traction |
| Runway, Kling, Veo | Online models | | Price per generated second, API access |

## Gap register

Each gap: what users lack or complain about, the evidence, the best rival's way, our call and where
it lives. Calls: **build** (with when), **later**, **never**.

| # | Gap | Evidence (2026-11-17) | Best rival's way | Call | Home |
|---|---|---|---|---|---|
| G1 | Silences and filler words cut automatically, free, and checked before they apply | Kdenlive's top issue since 2019 (#247); Shotcut's forum (23 likes, 8,031 views), called "out of scope"; Final Cut Pro: "PLEASE GIVE US AUTO REMOVE SILENCE"; Captions' automatic cut "cut words instead" | Descript (paid); CapCut (Pro); FilmCraft coming (#5027, one-step dialog) | **Build, week 1**: the core of the first release; proposed cuts shown on the transcript and timeline, accepted in one click, each one undone in one click, nothing cut mid-word | *Who it's for* |
| G2 | Captions that are free, accurate, easy to fix, in many languages | HN: "The caption editing workflow has been a pain point for years"; local-only clones: "The local transcription is trash"; Final Cut Pro users ask for them (22), "Caption only in English - Too bad"; Captions: "out of sync with the audio" | Descript: edit the transcript, the video follows | **Build, week 1**: captions edited as text, a good multilingual local model by default, an online one through the switcher when accuracy matters | `plan.md` |
| G3 | Installs and starts first time, on every computer | HN on OpenCut: "Very few casual desktop CapCut users are going to get past the prerequisits"; OpenShot 4.0 didn't start on macOS; Apple-silicon issues 35 reactions | CapCut: one installer | **Build, every release**: one signed installer per system, and a scripted fresh install on free CI runners must reach a first export before any release | `plan.md` |
| G4 | 9:16 from a landscape recording | Shotcut forum (39 likes, 7,745 views); OpenCut #737 | CapCut, Opus Clip (paid) | **Build, week 2, first** | *Who it's for* |
| G5 | Free 4K, no watermark, no sign-up | App Store low reviews: export blocked until paying 71, watermark 69 (Filmora 60, Captions 31); Clipchamp's paid 4K (HN); Resolve's sign-up form; CapCut Pro's paid 1080p | Shotcut, Kdenlive (free, but harder) | **Build**: the promise, said on the download page | *Who it's for* |
| G14 | No subscription, no credits, nothing free today made paid later | Paywall is 755 of 2,554 low App Store reviews; features worse or paid after an update 207; billing and refund trouble 164 (Captions 90); Final Cut Pro: "Slowly everything creeps behind a subscription" | None of the closed ones | **Never break it**: *Who it's for* › the promise. The AGPL licence backs it: anyone can keep a free copy | *Who it's for* |
| G15 | AI as tools the user turns on, not generated filler | AI complaints 292 in low reviews (Captions 117, CapCut 75, Canva 31): "better without ai", "corporate greed mixed in with ai slop" | — | **Build**: every AI step is a visible tool the user starts and can undo; generated clips stay an option, never pushed | `plan.md` |
| G16 | Easy: the top praise in every app | "Easy" is the top praise across all 13 listings (794 mentions); Resolve's "unintuitive" | CapCut, iMovie, VN, InShot | **Build**: the clarity check on every screen; the number to watch, minutes to first export | *Who it's for* |
| G6 | Phone footage plays everywhere, Linux too | Resolve's free version on Linux lacks H.264 (HN) | Shotcut, Kdenlive (FFmpeg) | **Build**: H.264, HEVC and AAC on every system; `video` checks the codec licences in `research/engine-stack.md` | `plan.md` |
| G7 | Private: no account, no upload, no analytics | HN: "Wild that apps used to be completely local, no accounts, no uploads"; OpenShot users asked to remove Google Analytics; CapCut's terms | Shotcut, Kdenlive | **Build**: nothing leaves the computer unless the user picks an online model; the opt-in check-in is the only report, and it says what it sends | `plan.md` |
| G8 | Fast export after cuts | LosslessCut's smart cut, the most-reacted ask (#126, 159 reactions) | LosslessCut (cuts, but can't edit) | **Build, week 1 if cheap**: an option for `video`: re-encode only around the cuts when nothing else changed, so a 30-minute talk exports in seconds | `plan.md` |
| G9 | Stays stable on long projects, never loses work | Crashes 618 in low App Store reviews, lost projects 70 (Resolve iPad 48% of its low reviews); HN: "performance regression when working with larger projects", "crashing and corrupted backups"; OpenCut #593 (20 GB of memory) | Resolve | **Build**: a 60-minute 4K test project in CI, autosave that can't corrupt the project | `plan.md` |
| G10 | One switcher for local and online models | Shotcut: "We cannot justify to integrate more runtimes"; local-only quality complaints | None has both | **Build**: the decided switcher; it's what Shotcut has said it won't do | `plan.md` |
| G11 | Driven by AI agents (MCP) | Shotcut plans an MCP server; four Product Hunt launches in 2026 pitch it | None shipped and popular yet | **Later**: after the four jobs; weigh at the first monthly retro | — |
| G12 | A phone app | OpenCut's most-wanted (#14, 18 👍); AlternativeTo: "Does not work on mobile like CapCut does" | CapCut | **Later**: desktop first, for the first user's jobs; `plan.md` says when, or whether | `plan.md` |
| G13 | Lower thirds and title templates | Shotcut's forum's most-wanted (79 likes) | CapCut's templates | **Build, 1.3**, with *more tracks and titles* | *Who it's for* |
| G17 | Jump cuts left after cutting silences | An idea, no review evidence yet: a talking head jumps at each cut; creators hide it with a slight alternating zoom | To check: whether CapCut or Descript automate it | **1.1 candidate** (it reuses the reframe's crop); the call at the Monday pass, 2026-11-23 | — |
