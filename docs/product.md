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
- **Their four jobs:** (1) captions; (2) cutting silences and filler words; (3) a clean voice; (4) 9:16 shorts from the same recording, with the speaker kept in frame. Under all four, the promise: every export free, 4K, no watermark.
- **First public release (about week 1):** open a video → captions → cut silences and fillers → trim and split on one timeline → export 4K. Voice clean-up joins it if a small local denoiser fits as one switch.
- **Week 2, in this order:** 9:16 reframe with caption styles for shorts → voice clean-up (if not in week 1) → background removal → more tracks and titles → music → transitions. The last two are where CapCut already wins and our user needs them least, so they're cut first if time runs short. Auto-picking the best moments for shorts comes later, as its own brief: it needs a language model per video.
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
| Google Play, Microsoft Store (CapCut, Clipchamp, DaVinci Resolve) | Public pages, fetched or searched | Some block scripts; marked *unverified* when not read first-hand |
| Trustpilot, G2, Capterra, Product Hunt, AlternativeTo | Public pages, fetched or searched | As above |
| Reddit (r/VideoEditing, r/CapCut, r/davinciresolve, r/NewTubers, r/podcasting, r/kdenlive, r/linux) | Search and mirrors; Reddit answers scripts with 403 | Sampled, not counted |
| Open-source rivals' GitHub (OpenCut, Kdenlive, Shotcut, OpenShot, LosslessCut) | `gh`, read only: issues, discussions, releases | Their users are developers |
| Hacker News | Algolia's public search API | Developers |
| Ours, once public | GitHub issues and stars, downloads, Search Console, the feedback form | Only people who choose to say |

## Scoreboard

Rivals watched, filled in by the first Monday pass from `video`'s research (`research/`) and the
sources above; every number with its date and source.

| Rival | Kind | Watch for |
|---|---|---|
| CapCut | Closed, free with Pro; desktop, web, phone | Prices and paywalls (Pro went from $9.99 to $19.99 a month in January 2026, 1080p export paid: decisions, 2026-11-17), terms, AI features |
| DaVinci Resolve | Closed, free and Studio | The free tier's limits, AI features moving into the free tier |
| Clipchamp | Closed, Microsoft, free and paid | Export limits, Windows bundling |
| iMovie | Closed, Apple, free | Updates; Mac and phone only |
| Descript | Closed, paid | Editing by transcript, filler-word removal, prices |
| Filmora, Premiere Pro | Closed, paid | AI features and prices |
| OpenCut | Open source (MIT) | Releases (none since April 2026, 98,759 stars: GitHub API, 2026-11-17), whether it restarts |
| Kdenlive, Shotcut, OpenShot | Open source (GPL) | Releases, AI features, the complaints in their issues |
| Opus Clip, Submagic, VEED, Kapwing | Closed, online, paid | AI clipping and captions, prices |
| Runway, Kling, Veo | Online models | Price per generated second, API access |

## Gap register

Each gap: what users lack or complain about, the evidence, the best rival's way, our call (build,
merge, later, never) and where it lives. Filled from the first Monday pass.

| # | Gap | Evidence | Best rival's way | Call | Home |
|---|---|---|---|---|---|
