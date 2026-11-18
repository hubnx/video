# AI-first editors and the AI features of big editors

Research for `video` (free, open-source CapCut alternative with one AI model switcher), 2026-11-17.
Scope: Descript, OpusClip, Submagic, Captions (Mirage), VEED, Kapwing, Adobe Premiere's AI, CapCut's
AI. Other files in `docs/research/` cover the editing workflows of plain editors, the AI models and
online services, and the engine.

## Conclusion first

**What people pay for, in order** (full evidence under *Ranking*):

| # | Feature | Pay signal (short) | Runs free on a normal computer? |
|---|---|---|---|
| 1 | Auto captions, animated word by word | A whole company was built on each of Submagic ($8M ARR) and Captions ($28.4M a year in app sales); CapCut's most-used AI feature, now behind Pro | **Yes** (Whisper via whisper.cpp, MIT) |
| 2 | Long video → ranked short clips | OpusClip's whole product (20M+ users claimed); the most-wanted AI feature in Adobe's survey (19%); the score is paid-only | **Partly**: transcript + small local language model to pick moments; picking by what's *on screen* is better online |
| 3 | Silence and filler-word removal | VEED: "This alone justifies the Pro plan"; Pro-only or metered in Submagic, Descript, CapCut | **Yes** for silence; filler words need a transcript that keeps "um" (licence trap, below) |
| 4 | Editing by transcript | Descript's core (about $55M ARR, estimated); free inside every tool, so it's sold as a workflow, not by the minute | **Yes** (same transcript as captions) |
| 5 | Auto reframe to 9:16 with face tracking | Bundled with clipping; OpusClip gives free users 9:16 only, other ratios on Pro | **Yes** (MediaPipe, Apache-2.0) |
| 6 | Voice enhancement ("studio sound") | Metered at Descript and Kapwing; Pro at CapCut and Submagic; Premiere runs it on the computer | **Yes** (DeepFilterNet, MIT/Apache) |
| 7 | Translation and dubbing | The priciest meter everywhere (per minute or per second); voices called "robotic" | Subtitle translation: **partly**. Voice dubbing with lip sync: **online** (local needs an 8–18 GB GPU) |
| 8 | Text-to-speech voices | One of CapCut's four most-used AI features; metered at Kapwing and OpusClip | **Yes** for stock voices (Kokoro, Apache-2.0); cloning: maybe (Chatterbox, MIT, no longer maintained) |
| 9 | Background removal (no green screen) | Pro at CapCut; uses credits at Descript | **Yes** with a GPU (RVM, GPL-3.0); Mac speed not verified |
| 10 | Eye contact correction | Paid in Descript, Captions, VEED; niche (people reading a script) | **No open model found**; Descript itself runs it online; NVIDIA's runs only on RTX cards |
| 11 | AI b-roll and generated clips | Pro-only at OpusClip, Captions, Descript; Premiere now ships Google, Kling, Runway, Luma models | **Online** (local needs a 24 GB GPU and ~9 min per 5 s) |
| 12 | Upscaling | Mentioned, rarely sold as a headline | **Yes** (Real-ESRGAN, BSD-3) but slow |
| 13 | Object removal | Premiere beta, limited to 10-second 1080p clips | **Online** (open local model is non-commercial and needs ~19 GB GPU) |

**What our first release's AI must include** (all local, all free, no account):

1. Word-by-word animated captions, with a set of styles as good as CapCut's and Submagic's, editable text, a word list for names, and SRT export.
2. Editing by transcript: delete words to cut the video.
3. One-click silence removal, and filler-word removal with a review list before anything is cut.
4. Voice enhancement with a strength slider.
5. Auto reframe to 9:16 (and 1:1, 4:5) following the speaker's face.
6. Long video → short clips: the computer finds and ranks moments from the transcript; the user's own online key gives better picks. Show the ranking as an order with a reason, never a "virality %": tests show the score doesn't predict views.

Next, through the model switcher (the user's own key, cost shown before each run): translation and
dubbing, AI b-roll and generated clips, eye contact, object removal. Background removal and
text-to-speech can be local in release 1 if the engine has room; they are cheap wins.

**What the complaints tell us to do**: never charge or spend credits for a failed result; show the cost
before running anything online; never put a paywall at export; let the user review every automatic
cut; no queues (local work starts at once).

## Products at a glance

Prices are US list prices seen on the date given; "yearly" means the monthly price when billed yearly.

| Product | Main AI job | Paid plans (2026) | How AI is metered | Trustpilot (seen 2026-11-17) |
|---|---|---|---|---|
| Descript | Edit video by editing the transcript; Underlord AI co-editor | Hobbyist $16 / $24, Creator $24 / $35, Business $50 / $65 a person a month | Two meters: media minutes (600 / 1,800 / 2,400) and AI credits (400 / 800 / 1,500 a month) | 2.5 / 5, 296 reviews, 44% one-star |
| OpusClip | Paste a long video, get ranked short clips | Starter $15, Pro $29 ($14.50 yearly), Business custom | ~1 credit per minute of source video: Free 60, Starter 150, Pro 300 a month | 4.0, 525 reviews, 20% one-star |
| Submagic | Animated captions + shorts editing | Starter $19 ($12 yearly), Pro $39 ($23), Business $69 ($41) | Counted videos: 15 / 40 / 100 captioned, 5 / 15 / 37 long videos clipped a month; max length 2 / 5 / 30 min | 4.5, 864 reviews, 7% one-star |
| Captions (Mirage) | "AI that edits like a professional editor would": AI Edit, captions, eye contact, AI twins | Basic $9.99 (App Store), Max $24.99, Frontier $69.99–$279.99 | Credits: Max 500, Frontier 1,400–5,600 a month; roll over up to 3× | 4.5, 566 reviews, 18% one-star; App Store 4.7 from 39K ratings |
| VEED | Browser editor: subtitles, Magic Cut, avatars, dubbing | Creator $25 ($147/yr), Pro $45 ($265/yr), Studio $79 ($465/yr) per seat | Credits: 500 / 2,500 / 15,000 a month; subtitles "unlimited" (50 h fair use); translation by the minute | 4.2, 3,948 reviews, 15% one-star |
| Kapwing | Browser editor: subtitles, Smart Cut, dubbing | Pro $16, Business $50 | Credits (1,000 / 4,000) plus minute caps per feature | 1.8, 1,375 reviews |
| Premiere (Adobe) | Pro editor; Generative Extend, on-device speech and audio AI | Premiere $22.99/mo (25 credits); Creative Cloud Pro $69.99 (4,000 credits) | Generative credits for generative features only; speech-to-text and Enhance Speech run on the computer | not collected |
| CapCut | Everything, free on the surface | Pro $19.99/mo or $179.99/yr (was ~$77.99/yr) | Pro badge gates features at export; credits at $0.01 each for generation | 1.2, 1,406 reviews, 88% one-star |

Sources: [Descript pricing](https://www.descript.com/pricing) (seen 2026-11-17; the page shows two
prices per plan without labels, the yearly one first, "save up to 35%");
[OpusClip pricing](https://www.opus.pro/pricing) (seen 2026-11-17) and
[BIGVU's test](https://bigvu.tv/blog/opus-clip-tested-2026-where-ai-wins-40-percent-discard/) for
credits and the yearly price (2026-11-05; BIGVU is a competitor);
[Submagic pricing](https://www.submagic.co/pricing) (seen 2026-11-17);
[Captions pricing](https://www.captions.ai/pricing) (seen 2026-11-17, "iOS plans only") and
[App Store](https://apps.apple.com/us/app/captions-for-talking-videos/id1541407007) (seen 2026-11-17);
[Magic Hour on VEED](https://magichour.ai/blog/veed-pricing) (prices checked 2026-09-09/13; Magic Hour
is a competitor; VEED's own page didn't return plan data) and
[Dupple](https://dupple.com/pricing/veed) (2026-10-14, euro prices: Creator €11, Pro €23, Studio €37
yearly); [Kapwing pricing](https://www.kapwing.com/pricing) (seen 2026-11-17, "save 33%" yearly,
prices unlabelled); [Adobe Premiere plans](https://www.adobe.com/products/premiere/plans.html) (seen
2026-11-17; CC Pro on promotion at $29.99 until Nov 27);
[CapCut Standard vs Pro](https://www.capcut.com/resource/capcut-standard-vs-pro) (2026-11-12);
Trustpilot pages for [Descript](https://www.trustpilot.com/review/descript.com),
[OpusClip](https://www.trustpilot.com/review/opus.pro),
[Submagic](https://www.trustpilot.com/review/submagic.co),
[Captions](https://www.trustpilot.com/review/captions.ai),
[VEED](https://www.trustpilot.com/review/veed.io),
[Kapwing](https://www.trustpilot.com/review/kapwing.com) (its listed star split, 75% five-star,
contradicts its 1.8 score; Trustpilot's page looks wrong) and
[CapCut](https://www.trustpilot.com/review/capcut.com) (profile unclaimed). G2 and Capterra refused
the fetcher (HTTP 403), so their scores are not here.

## Descript

**AI features and prices**

| Feature | What it does | Free plan | Paid | Cost |
|---|---|---|---|---|
| Transcription + edit by text | Delete words in the transcript to cut the video | Included (25 languages) | Included | Media minutes |
| Remove filler words | Finds "um", "uh" (English only); lets you delete, ignore or keep each | Limited | Included | AI credits, scales with words removed, max 30 a file |
| Shorten word gaps | Shortens silences | — | — | not checked |
| Studio Sound | Removes noise and room echo from speech | Limited | Included | AI credits, scales with length, max 30 a file |
| Eye Contact | Moves the speaker's gaze to the lens | Limited | Included | AI credits; **needs a network connection** |
| Green Screen | Removes the background | Limited | Included | AI credits |
| Text-to-speech, voice clone, Regenerate | Fix a word in your own cloned voice | Limited | Included | AI credits |
| Translate captions, dubbing | Subtitles and voice in other languages | Limited | Included (proofreading on Business only) | AI credits |
| AI avatars, generate image/video | Generated presenters and clips; model picker with "coin" cost icons | Limited | Included | AI credits by model |
| Underlord | Chat co-editor: captions, clips, vertical reframe, zooms, translation, ducking, slides to video; you pick its model | Limited | Included; premium models paid | Credits for its "reasoning" *and* each tool it runs; not fixed |

Free plan: 60 media minutes a month, 100 AI credits once, 720p export with a watermark.
Sources: [pricing](https://www.descript.com/pricing) (seen 2026-11-17),
[media minutes and AI credits](https://help.descript.com/billing-payments-plans/track-and-understand-your-media-minutes-and-ai-credits.md),
[filler words](https://help.descript.com/script-editing/filler-words.md),
[Eye Contact](https://help.descript.com/effects-animations-transitions/eye-contact.md),
[Underlord](https://help.descript.com/getting-started/underlord-beta-your-ai-co-editor-in-descript.md)
(help pages undated, seen 2026-11-17).

**The change users hate**: in 2025 Descript replaced transcription hours and unlimited Underlord with
two meters, media minutes and AI credits; old plans were moved over from 2025-11-17
([Descript FAQ](https://help.descript.com/hc/en-us/articles/40471885821325-Questions-and-concerns-we-ve-heard-from-the-customer-community)).
The FAQ itself asks "I don't use AI. Do you offer a plan without AI features?"

**Main flow: edit video by editing the text**
([help](https://help.descript.com/getting-started/edit-like-a-doc.md))
1. Import a video; Descript transcribes it and links each word to the media.
2. Select words and press Delete: the video under them is cut (restorable).
3. Cut and paste text to move the video with it.
4. "Ignore" strikes words out but keeps them visible; fix wrong words with Correct.
5. Open AI Tools › Remove filler words: a list of every "um" with its time; preview, then delete,
   delete-and-keep-gap, ignore or keep each; "Avoid harsh cuts" skips removals that would clip words.

**How well it works**
- Studio Sound vs Adobe's Enhance Speech, same noisy file at 25–100% strength: Descript "introduces
  fewer artifacts" and kept a more natural sound; Adobe at high settings was "overly compressed and
  muddy" ([The Podcast Haven](https://thepodcasthaven.com/adobe-speech-enhancement-vs-descript-studio-sound-a-shootout/),
  2024-05-24, updated 2026-03; one listener, not blind).
- Caption accuracy: a small test by a competitor put Descript best on a longer clip (6.4% word error
  rate) ([BlitzCut](https://blitzcutai.com/blog/caption-accuracy-comparison-2026), 2026; tiny sample).
- Underlord is "in beta. It may overpromise, make incorrect assumptions, or attempt workflows it can't
  complete" (Descript's own [help page](https://help.descript.com/getting-started/underlord-beta-your-ai-co-editor-in-descript.md)).

**What users say** (Trustpilot, [descript.com](https://www.trustpilot.com/review/descript.com))

| Tone | Quote | Date, stars |
|---|---|---|
| Good | "Descript is a wonderful tool…but the Ai features are disproportionately expensive." | 2025-11-20, 2★ |
| Meh | "Otherwise a decent product … AI makes mistakes and you need to constantly fix them." | 2026-10-29, 2★ |
| Meh | "It 'got the job done' for the few months of using it." | 2026-01-23, 2★ |
| Bad | "Burned through 800 credits just trying to clean up filler pauses on a short reel" | 2026-10-03, 1★ |
| Bad | "many of the words important to the understanding of the lecture were removed" | 2026-08-22, 1★ |
| Bad | "£35 a month and it couldn't do the simplest of instructions" | 2026-08-15, 1★ |
| Bad (blog) | "What I disagree with is the idea that a tool like Descript needs to have All the AI All the Time" | [Chris Enns](https://chrisenns.com/2025/10/descript-needs-more-money-for-ai-generator-slop-machine), 2025-10-21 |

## OpusClip

**AI features and prices** ([pricing](https://www.opus.pro/pricing), seen 2026-11-17)

| Feature | Free | Starter $15 | Pro $29 |
|---|---|---|---|
| AI clipping | Spoken words only | Spoken words only | Spoken, visual, sound, emotion, genre models (ClipAnything) |
| Virality score | No | Yes | Yes |
| Auto reframe (ReframeAnything, object tracking) | 9:16 | 9:16 | 9:16, 1:1, 16:9 |
| Animated captions | Watermarked templates | Yes | Yes |
| B-roll | — | 3 AI images + 3 stock a month | 50 AI images a day, unlimited stock, AI video b-roll |
| AI voice-over | — | 20 a day | 20 a day |
| Dubbing | — | — | Yes |
| Clip storage | 3 days | 30 days | No limit |

Credits: about 1 credit per minute of source video, not per clip; Free 60, Starter 150, Pro 300 a
month ([BIGVU](https://bigvu.tv/blog/opus-clip-tested-2026-where-ai-wins-40-percent-discard/),
2026-11-05). Homepage claims "Used by 20M+ creators and businesses" and captions "over 99%"
accurate, while the same page's FAQ data says 97% ([opus.pro](https://www.opus.pro/), seen 2026-11-17).

**Main flow: long video → ranked clips**
([ClipAnything help](https://help.opus.pro/docs/article/how-to-use-clipanything))
1. Paste a video link or upload.
2. Pick the clip model (ClipAnything for any genre, including videos with little talking).
3. Optional: pick a genre; type a prompt ("Find all the touchdowns").
4. Pick a caption style or none.
5. Results page: clips, each with a virality score (paid plans), rate with heart or thumbs down,
   edit captions in a transcript editor, schedule or export.

**How well it works**
- A 30-day paid test on 6 videos returned 76 clips: 47 (62%) usable as they were, 19 (25%) needed
  light edits, 10 (13%) unusable; 4 of 11 b-roll inserts were wrong for the context. **The score
  didn't predict views: the best performer scored 64, the weakest 87** (ScaleReach's test, reported
  by [BIGVU](https://bigvu.tv/blog/opus-clip-tested-2026-where-ai-wins-40-percent-discard/),
  2026-11-05; both sell competing tools).
- A long-time user estimates the AI gets a clip "to about 70–90%", the rest needs finishing (same source).
- Reviewers call the score "a sorting heuristic, not a guarantee"; it misses the key moment on
  technical or slow-building talks (review roundups via search,
  e.g. [toolsforhumans](https://www.toolsforhumans.ai/ai-tools/opus-clip), 2026; affiliate-style).

**What users say** ([Trustpilot](https://www.trustpilot.com/review/opus.pro))

| Tone | Quote | Date, stars |
|---|---|---|
| Good | "just renewed for another year...at the same price as last year!" | 2026-11-07, 5★ |
| Good | "offered to restore half of my expired credits as a goodwill gesture." | 2026-10-14, 5★ |
| Meh | "Happy with the value prop but overall I feel the UI could be better for web editing." | 2026-10-21, 4★ |
| Bad | "Paid Pro plan cancelled by mistake on 13 November, and 798 paid, unused credits locked." | 2026-11-13, 1★ |
| Bad | "the clips were unusable due to audio issues" | 2026-11-10, 1★ |

Recurring theme in roundups: projects lock when a subscription lapses, even with paid credits left
([toolsforhumans](https://www.toolsforhumans.ai/ai-tools/opus-clip); *unverified* beyond the roundup).

## Submagic

**AI features and prices** ([pricing](https://www.submagic.co/pricing), seen 2026-11-17)

| | Starter $19 ($12 yearly) | Pro $39 ($23) | Business $69 ($41) |
|---|---|---|---|
| Captioned videos a month | 15 | 40 | 100 |
| Long videos clipped (Magic Clips) | 5 | 15 | 37 |
| Videos edited by the Iris agent | 2 | 6 | 15 |
| Max video length | 2 min | 5 min | 30 min |
| Export | 1080p 30 fps | 2K 30 fps | 4K 60 fps |
| Caption templates | Standard set | All | All |
| Remove bad takes and silences, AI clean audio | — | Yes | Yes |
| B-roll and music | Free library | Storyblocks | Storyblocks |

No watermark on any paid plan. Homepage: "Turn your raw videos into viral shorts", "Loved by 4M+
creators", captions in 118 languages, "99%" accuracy claimed; auto-zoom, hooks, sound effects,
translation ([submagic.co](https://www.submagic.co/), seen 2026-11-17).

**Main flow** (homepage): upload a talking-head video → pick a caption template → it adds animated
word-by-word captions with highlighted keywords and emojis, auto zooms, b-roll, music and sound
effects, and removes silences → edit → export or schedule. Magic Clips first cuts a long video into
several shorts.

**How well it works**
- Caption accuracy claims (98.9–99%) come from Submagic and affiliate pages; a small competitor test
  put Submagic worst on a short clip (7.1% word error) and showed it mishearing a brand name
  ([BlitzCut](https://blitzcutai.com/blog/caption-accuracy-comparison-2026), 2026; tiny sample).
- Auto b-roll "sometimes inserts off-topic or irrelevant footage that you have to manually review"
  ([Toolradar](https://toolradar.com/tools/submagic), 2026); auto-zoom praised in hands-on reviews.
- Business proof: $1M ARR three months after its first customer (May 2023) and $8M ARR, bootstrapped,
  team of 13, by mid-2025; affiliates bring about 20% of revenue
  ([Latka interview](https://getlatka.com/interviews/submagic-david-zitoun-2025), 2025-06-05;
  self-reported, not audited). The founder: they started with captions and stayed "super focused on
  the one thing".

**What users say** ([Trustpilot](https://www.trustpilot.com/review/submagic.co)): most praise is for
support, not features.

| Tone | Quote | Date, stars |
|---|---|---|
| Good | "captions generate in a sec and accurate" | 2026-02-09, 5★ |
| Good | "Auto-captions with the option to save your style as a template is a lifesaver!" | 2026-09-25, 5★ |
| Meh | "There still seems to be some challenges to work through" | 2026-10-09, 5★ |
| Bad | "Being forced to pay before canceling the subscription feels like a forced purchase" | 2026-11-06, 1★ |
| Bad | "it processed a sale without giving us the opportunity to not submit it" | 2026-10-10, 1★ |

## Captions (now Mirage)

**AI features and prices** ([pricing](https://www.captions.ai/pricing), seen 2026-11-17, iOS prices)

- Free: no AI credits, one caption template.
- Basic: $5.99 a week, $9.99 a month or $64.99 a year
  ([App Store](https://apps.apple.com/us/app/captions-for-talking-videos/id1541407007), seen 2026-11-17).
- Max $24.99 a month: 500 credits, 100+ caption styles, AI Edit styles, AI twin and AI actors,
  chat editor, clips from long videos, generated b-roll, music, sound effects, images.
- Frontier $69.99 / $139.99 / $279.99: 1,400 / 2,800 / 5,600 credits and "our most sophisticated
  tier of generative AI models". Unused credits roll over up to 3× the monthly amount.
- Other features: AI Denoise, Eye Contact, trim pauses and filler words, dubbing with lip sync
  ("Lipdub") into 28+ languages, voice clone
  ([eesel](https://www.eesel.ai/blog/captions-ai), 2026-09-27; eesel is a competitor).

Homepage: "AI that edits like a professional editor would.", 20M users, 100+ languages
([captions.ai](https://www.captions.ai/), seen 2026-11-17).

**Main flow: AI Edit** (homepage): record or upload a talking video → pick an edit style → AI cuts the
scenes, overlays b-roll, adds captions and translated subtitles → change anything with a typed
request → export.

**How well it works**
- Eye contact "can occasionally look unnatural", an "uncanny valley effect" mentioned in 89 reviews
  ([Tooliverse](https://tooliverse.ai/tools/captions), 2026; aggregator, *unverified* count).
- Speed: the developer replied to a review that Pro users go to a priority queue after six AI projects
  a month, with waits "up to 360 minutes" (App Store review of 2025-02-06).
- Business proof: 3.2M downloads and $28.4M in-app revenue in the past year (Appfigures, reported in
  [Trending Topics](https://www.trendingtopics.eu/mirage-raises-75m-to-push-ai-video-app-captions-into-asian-markets/),
  2026-03); $75M growth financing from General Catalyst
  ([press release](https://fortune.com/press-releases/mirage-growth-financing-general-catalyst-cvf-2026-03-24/),
  2026-03-24).

**What users say** ([Trustpilot](https://www.trustpilot.com/review/captions.ai), App Store)

| Tone | Quote | Date, stars |
|---|---|---|
| Good | "It transcribes my songs flawlessly, then gives me total control over the captions" | 2026-11-16, 5★ |
| Good | "It has saved me thousands of dollars on editing and countless hours." | 2026-11-10, 4★ |
| Bad | "Takes 10+ minutes for it to generate a video. Half the time it glitches and you end up with nothing and losing credits." | 2026-11-11, 1★ |
| Bad | "the animation and the ai generated images are really BAD." | 2026-11-09, 1★ |
| Bad (App Store) | AI prompt edits "were significantly different than what I'd described", so credits went on fixing them; the developer called the feedback valid | Jul 7, year and stars not shown |

## VEED

**AI features and prices**: Creator $25 a month or $147 a year (500 credits a month), Pro $45 or $265
(2,500, up to 4K), Studio $79 or $465 (15,000); free exports are 720p with a watermark; generated files
on free are limited to 12 seconds ([Magic Hour](https://magichour.ai/blog/veed-pricing), checked
2026-09; competitor). Subtitles are "unlimited" on paid plans with a 50-hour fair-use limit;
translation is counted by the minute ([veed.io/pricing](https://www.veed.io/pricing) FAQ, seen
2026-11-17). AI tools: auto subtitles, Magic Cut (silences, fillers, retakes), Clean Audio, Eye Contact,
background removal, avatars (Pro: 5 minutes a month), dubbing, text-to-video, auto-resize
([Dupple review](https://dupple.com/reviews/veed), updated 2026-03).

**Main flow: Magic Cut**: upload a talking video → Magic Cut → it removes silences, filler words and
repeated takes → review the cuts → add subtitles → export (steps from reviews, not checked against
VEED's help pages).

**How well it works** ([Dupple](https://dupple.com/reviews/veed), 2026-03)
- Subtitles "in the high 90s on clean audio and closer to 90% with heavy accents"; better than CapCut
  on accented English.
- Magic Cut on a 20-minute podcast removed 47 fillers and saved about 40 minutes: "This alone
  justifies the Pro plan if you edit spoken content regularly."
- Dubbing: "the synthetic voice can sound robotic"; avatars: lip sync "close but not perfect".
- "No offline mode: a lost connection freezes the edit session"; lag past 15–20 minutes of footage.

**What users say** ([Trustpilot](https://www.trustpilot.com/review/veed.io))

| Tone | Quote | Date, stars |
|---|---|---|
| Good | "Ton of AI support tools, paid, but effective." | 2026-08-07, 5★ |
| Meh | "The initial transcription was close." | 2026-08-12, 4★ |
| Meh | "Around one month of meaningful use ultimately cost me about US$750, but VEED eventually refunded almost all of it" | 2026-11-04, 4★ |
| Bad | "used less than 100 of my 30,000 credits, didn't export anything from the software and asked for a refund" | 2026-11-06, 1★ |

## Kapwing

**AI features and prices** ([pricing](https://www.kapwing.com/pricing), seen 2026-11-17)

| Monthly limit | Free | Pro $16 | Business $50 |
|---|---|---|---|
| AI credits | 10 once | 1,000 | 4,000 |
| Export | 720p, 4 min, watermark | 4K, 120 min | 4K, 120 min |
| Auto subtitles | 10 min | 1,000 min | 4,000 min |
| Auto translation | 5 min | 500 min | 2,000 min |
| Text-to-speech | 1 min | 50 min | 200 min |
| Clean audio | 5 min | 500 min | 2,000 min |
| AI dubbing | — | 50 min | 200 min |
| Voice clone | — | — | Yes |

Also listed without limits: Smart Cut (silence removal), video background remover, resizer, chroma
key, stabilisation. A review says Smart Cut and background removal use no credits on paid plans
([search roundup](https://tooliverse.ai/tools/kapwing), 2026; *unverified*).

**Main flow: Smart Cut + subtitles**: upload → Smart Cut removes silences → Subtitles › auto-generate
→ style → export (steps not checked against Kapwing's help pages).

**How well it works**: "a value-for-money product that bundles a wide range of AI video generation and
editing features"; Smart Cut "automatically removes awkward silences"; cons: "Pretty expensive", strict
free caps ([TechRadar](https://www.techradar.com/computing/creative-software/kapwing-ai-video-editor-review),
2026-07-20).

**What users say** ([Trustpilot](https://www.trustpilot.com/review/kapwing.com), 1.8 / 5)

| Tone | Quote | Date, stars |
|---|---|---|
| Meh | "Tries so hard to be a legitimate video editor, but it's very basic." | 2026-02-07, 2★ |
| Bad | "Their translation has VERY SERIOUS issues!" | 2026-05-08, 2★ |
| Bad | "Not even the simplest of edits works without glitches and eating tons of credits." | 2026-07-21, 1★ |
| Bad | "Their exports are broken, videos just straight up glitch.." | 2026-08-10, 1★ |
| Bad | "I tried to cancel on the same day I subscribed but AI support told me it wasn't possible." | 2026-10-16, 1★ |

## Adobe Premiere's AI

Premiere dropped "Pro" from its name with version 26.0 in January 2026
([Fstoppers](https://fstoppers.com/post-production/premiere-260-drops-pro-and-adds-powerful-ai-masking-900238), 2026-01).

| Feature | What it does | Where it runs | Cost |
|---|---|---|---|
| Speech to Text, auto captions | Transcript and captions (text-based editing too, *not re-checked in this pass*) | **On the computer** (language packs since 2022; a Speechmatics on-device model announced 2026-04-21, reported at about 55 s per hour of video) | In the subscription |
| Caption translation | Captions into 27 languages | not stated | not stated |
| Enhance Speech | Speech cleanup | **On the computer**, "no internet connection is required" | In the subscription |
| Media Intelligence | Search clips by what's in them, camera angle, dialogue | not stated | In the subscription |
| Object Mask (26.0) | Hover and click a subject; the mask tracks it through the shot | **On the computer** (reported) | In the subscription |
| Generative Extend | Adds frames to the start or end of a clip, up to 4K (about 2 s of video or 10 s of audio, per 2025 coverage found by search, *unverified*) | Cloud (Firefly) | Free at launch; now 50–175 credits a second (125 at 1080p 30 fps) |
| Generative Media Tool (MAX 2026) | Generate video, sound effects, soundscapes and music in the timeline, with Firefly **or partner models from Google, Kling, Runway, Luma** | Cloud | Credits, estimate shown |
| Generative Remove (beta) | Mask, track and fill an unwanted object | Cloud | Limited to 10-second 1080p clips |
| Enhance Audio, Separate Crosstalk, Separate Sound Source | Noise reduction; split overlapping speakers; split dialogue, music, ambience, effects | not stated | not stated |
| AI Assistant (beta) | Multi-step edits from plain language | Cloud | "Spends Firefly credits on every response; no pre-run estimate" |

Sources: [Adobe Speech to Text blog](https://blog.adobe.com/en/publish/2022/02/08/new-in-premiere-pro-remix-music-3x-faster-speech-to-text)
(2022-02-08); [Speechmatics announcement](https://www.tvtechnology.com/production/adobe-and-speechmatics-deliver-cloud-grade-on-device-speech-recognition-for-premiere)
(2026-04; the 55-second figure is from coverage found by search, *unverified*);
[Enhance Speech announcement](https://community.adobe.com/announcements-732/now-released-enhance-speech-in-premiere-pro-313485)
(2023-09-13); [Newsshooter](https://www.newsshooter.com/2025/04/02/adobe-launches-new-ai-powered-premiere-pro-new-after-effects-frame-io-upgrades/)
(2025-04-02: Generative Extend generally available in 4K, "complimentary generations" for a limited
time, caption translation, Media Intelligence); [PetaPixel](https://petapixel.com/2026/01/20/rebranded-adobe-premiere-26-arrives-with-one-click-object-tracking)
(2026-01-20; on-device Object Mask, via search summary — the page refused the fetcher);
[CGPress credit table](https://cgpress.org/archives/cgpress-has-published-a-guide-to-help-readers-navigate-adobes-new-ai-credit-system.html)
(2025-10-31); [GadgetGuy](https://www.gadgetguy.com.au/adobe-premiere-whats-new-from-color-mode-to-ai-audio-clean-up/)
(2026-11-13) and [Cutsio](https://cutsio.com/blog/adobe-max-2026-video-editors-announcements)
(MAX 2026, 2026-11-10 to 12).

**What it costs in practice**: the $22.99 Premiere plan includes 25 credits a month; one 2-second
Generative Extend at 1080p 30 fps costs 250 credits, ten months of that plan's allowance. Generative AI
in Premiere is effectively for the $69.99 Creative Cloud Pro plan (4,000 credits).

**Main flow: Generative Extend**: pick the Generative Extend tool → drag a clip's edge past its last
frame → Firefly generates the extra frames and audio → the new frames are marked as AI
(Content Credentials).

**How well it works**: Separate Crosstalk did "a very decent job" in GadgetGuy's test (2026-11-13);
Generative Remove's demo used a static shot, so a moving camera is untested; Adobe "hasn't said how many
generative credits the generative features use" (same source). No independent test of Generative Extend
was collected (the search budget ran out).

**Lesson for us**: Adobe keeps the everyday AI (transcription, speech cleanup, masking) on the
computer and inside the subscription, and charges only for generation, now with a choice of outside
models. That is the same split as our design: local free tools plus a model switcher.

## CapCut's AI

**What is free and what is Pro** — sources disagree, and CapCut changes it by platform, region and
version:
- CapCut's own comparison lists auto captions as "Not available" on the free Standard tier; Pro adds
  motion tracking, background removal, noise reduction, AI video, music and image generators, advanced
  video enhancement ([CapCut](https://www.capcut.com/resource/capcut-standard-vs-pro), 2026-11-12).
- CapCut's help: a free user sees the Pro prompt **at export** when "the feature you used, such as auto
  captions, includes Pro-only functionality"
  ([CapCut help](https://www.capcut.com/help/capcut-pro-prompt-standard-user), 2026-04-03).
- Some third-party guides still say desktop captions, cutout and smart reframe are free
  ([BIGVU](https://bigvu.tv/blog/capcut-free-vs-pro-what-2026s-restructure-actually-gives-you/),
  2026-06-29; others in search results, *unverified*).
- Price: Pro $19.99 a month or $179.99 a year; the yearly price rose from about $77.99 (+177%),
  reported from 2026-02-20; a mobile-only Standard tier at about $89.99 a year; US users lost "Retouch"
  and "Makeup" ([Sonary](https://sonary.com/content/capcut-increases-price-in-latest-update), 2026-10-08).
- Generation uses credits worth $0.01 each ([CapCut help](https://www.capcut.com/help/credits-in-capcut),
  2026-03-25). Pro's monthly credits: 1,200 per two third-party pages, 550 per another (*unverified*).

**Most used**: "the most used AI features, Auto captions, AutoCut, Voice filter, and Text-to-speech"
([CapCut newsroom](https://www.capcut.com/newsroom/revealing-the-creative-trends-on-capcut-in-2025),
2025-12-29; no numbers given).

**AI features**: auto captions (with styles), AutoCut, long video to shorts, smart crop to 9:16 with
subject tracking, background removal, noise reduction and voice enhancer, text-to-speech and voice
effects, voice clone (Pro), AI avatars, script to video, AI video upscaler, AI video/music/image
generation, motion tracking, stabilise (Pro).

**Main flow: long video to shorts**
([CapCut tool page](https://www.capcut.com/tools/long-video-to-shorts), seen 2026-11-17)
1. Upload the long video (from the computer, cloud, Google Drive, Dropbox).
2. "AI Highlights" finds key moments from speech; choose clip length.
3. Clips come out in 9:16 with subject tracking and auto captions.
4. Preview, "Edit more" in the editor, export or post. No score shown.

**What users say** ([Trustpilot](https://www.trustpilot.com/review/capcut.com), 1.2 / 5)

| Tone | Quote | Date, stars |
|---|---|---|
| Good | "Easy to use, effective, free" | 2026-11-03, 5★ |
| Bad | "CapCut charges you more credits every time you try to fix mistakes made by its own AI." | 2026-11-07, 1★ |
| Bad | "If your AI can't hear clear speech, then don't advertise Auto Captions and Split Scenes as features." | 2026-11-07, 1★ |
| Bad | "PROMOTES ITS FREE UNTIL YOU TRY TO EXPORT VIDEO THEN YOU HAVE TO PAY A SUBSCRIPTION OF $30." | 2026-11-17, 1★ |
| Mixed (press) | Critics say the value collapsed at the new price; supporters say the all-in-one tools still justify it | [Sonary](https://sonary.com/content/capcut-increases-price-in-latest-update), 2026-10-08 |

## Complaints that repeat across products

| Complaint | Where | What we do instead |
|---|---|---|
| Credits spent on failed or wrong AI output | CapCut, Captions, Kapwing, Descript, VEED | Local AI costs nothing; online runs show the estimated cost first and keep the result even if the user undoes it |
| Meters you can't predict (two meters, "no fixed price") | Descript, Captions, Premiere's assistant | No meters for local tools; for online, a price per run before it starts |
| Free until export | CapCut | Every export free, 4K, no watermark |
| AI cuts the wrong words | Descript (lecture words removed), VEED (meaningful pauses) | Show every planned cut in a list; one-click undo per cut |
| Waits and queues | Captions (10+ min; queues up to 360 min) | Local work starts at once; show progress |
| Off-topic b-roll | Submagic, OpusClip (4 of 11 wrong) | Suggest b-roll, never insert it unasked |
| Billing, cancellation, refunds | Kapwing, Submagic, VEED, OpusClip | No subscription in release 1; later credits, if sold, never expire |
| Names misheard in captions | Submagic, CapCut | A word list (names, brands) the transcriber is told about |
| Online-only editing | VEED, Kapwing, Descript (eye contact needs a connection) | Desktop app; online only when the user picks an online model |

## Ranking: the AI features people pay for most

How to read it: no source measures "spend per feature", so the rank combines four signals — which tier
the feature sits in, how products market it, whole companies built on it, and usage data from CapCut and
Adobe. **Search volumes were not measured**: the free tools need a Google Ads account (Keyword Planner)
or a browser, and this session's web-search budget ran out; the one figure found ("video captions",
+241% over 5 years, [Exploding Topics](https://explodingtopics.com/blog/trending-youtube-topics), undated)
is *unverified*.

| # | Feature | Tier where it sits | Marketing | Business and usage proof | Local or online (best evidence) |
|---|---|---|---|---|---|
| 1 | **Auto captions, animated word by word** | Moved behind Pro by CapCut; watermarked styles on OpusClip free; minute caps at Kapwing; style sets split by tier at Submagic and Captions | The product's name at Captions; Submagic's headline; "99%" claims everywhere | Submagic $8M ARR on captions first; Captions $28.4M a year in app sales; CapCut's #1 most-used AI feature (2025) | **Local**: whisper.cpp (MIT) on Mac Metal, Windows/Linux CUDA or Vulkan, CPU; large model ~3.9 GB memory; Shotcut ships it ([Shotcut 24.10](https://shotcut.org/blog/new-release-241029/), 2024-10-29), Kdenlive runs Whisper offline ([docs](https://docs.kdenlive.org/effects_and_compositions/speech_to_text.html)), Premiere runs speech-to-text on the computer |
| 2 | **Long video → ranked shorts** | Score paid-only at OpusClip; Submagic plans counted in "long videos clipped"; Captions Max; Descript Underlord | OpusClip's whole site; "viral" in every headline | Most-requested AI feature in Adobe's survey: auto-repurposing 19% ([Adobe Express](https://www.adobe.com/express/learn/blog/ai-video-tools), survey 2025-12-01 to 05, n=384, published 2026-03-25); OpusClip eight-figure ARR and 6M users in 2024 ([OpusClip](https://www.opus.pro/blog/opusclip-celebrates-30m-in-funding-and-the-launch-of-clipanything)) | **Mixed**: the transcript is local; choosing moments from text needs a language model — a small one can run locally (*quality vs online not measured*); choosing from what's on screen (ClipAnything) needs a vision model, so online is better. Tests say the score doesn't predict views, so a cheaper model loses little |
| 3 | **Silence and filler-word removal** | Pro-only at Submagic; credits at Descript; Magic Cut on VEED paid; Captions Max | A named tool in Descript, Submagic, Captions and VEED; in Kapwing and CapCut per third-party pages (*unverified*) | "This alone justifies the Pro plan" (Dupple on VEED); Descript users burn credits on it | **Local**: silence via voice-activity detection (Silero VAD, built into whisper.cpp). Fillers need a transcriber that writes them down; CrisperWhisper does, but **its weights are non-commercial** ([GitHub](https://github.com/nyrahealth/CrisperWhisper)) — choose another way (prompting Whisper to keep fillers, or audio-based detection; *untested*) |
| 4 | **Editing by transcript** | Free in Descript, included in Premiere, VEED, Kapwing | Descript's identity | Descript ~ $55M ARR (late 2024, [Sacra estimate](https://sacra.com/c/descript/)) | **Local**: the same word-timed transcript as captions |
| 5 | **Auto reframe to 9:16 with face tracking** | OpusClip free 9:16 only, other shapes Pro; CapCut smart crop | "ReframeAnything", "the only AI reframe model…" | Always bundled with clipping; few sell it alone | **Local**: face and pose tracking on-device with MediaPipe (Apache-2.0, [GitHub](https://github.com/google-ai-edge/mediapipe)) |
| 6 | **Voice enhancement** | Credits at Descript (max 30 a file); minutes at Kapwing (500 a month on Pro); Pro at CapCut and Submagic | "Studio Sound" is a Descript brand | Descript built a brand on it; Adobe ships it free inside Premiere | **Local**: Premiere does it on the computer; DeepFilterNet (MIT or Apache-2.0, 48 kHz, real-time variant, [GitHub](https://github.com/Rikorose/DeepFilterNet)) |
| 7 | **Translation and dubbing** | Pro-only at OpusClip; per-minute caps at Kapwing (50 min dubbing on Pro) and VEED; Captions Max; Premiere 5–15 credits a second | VEED Pro's headline: "translation into 50+ languages" | The priciest per minute; quality "robotic" (Dupple on VEED), "VERY SERIOUS issues" (Kapwing user) | **Online** for good voices and lip sync. Local lip sync exists (LatentSync, Apache-2.0, 8–18 GB GPU, [GitHub](https://github.com/bytedance/LatentSync)). Local subtitle translation: Whisper translates to English only; NLLB is **non-commercial** ([model card](https://huggingface.co/facebook/nllb-200-distilled-600M)) |
| 8 | **Text-to-speech voices** | Minutes at Kapwing (50 on Pro); 20 a day on OpusClip Starter; CapCut Pro badge | Rarely the headline | CapCut's top-4 most-used AI feature (2025); voiceovers used by 36% of creators using AI (Adobe survey) | **Local** stock voices: Kokoro-82M (Apache-2.0, 8 languages, 54 voices, no cloning, [model card](https://huggingface.co/hexgrad/Kokoro-82M)). Cloning: Chatterbox (MIT, 23 languages, small model 3× real time on 8 CPU cores) but "retired… no longer maintained" since 2026-08 ([GitHub](https://github.com/resemble-ai/chatterbox)) |
| 9 | **Background removal** | CapCut Pro list; Descript credits; Kapwing listed | Common, not a headline | Classic CapCut draw | **Local with a GPU**: Robust Video Matting (GPL-3.0, compatible with AGPL-3.0), 4K at 154 fps on RTX 3090, 74 fps on GTX 1080 Ti ([GitHub](https://github.com/PeterL1n/RobustVideoMatting)); Mac speed *not measured* |
| 10 | **Eye contact** | Credits at Descript; Captions; VEED paid | Niche: people reading a script | "Uncanny" complaints (Captions); Descript runs it online | **No open model found.** NVIDIA Broadcast does it live on RTX cards ([PC Gamer](https://www.pcgamer.com/nvidia-broadcast-eye-contact-out-now)) — proves it can run on a computer, but not on every computer; treat as online for now |
| 11 | **AI b-roll and generated clips** | Pro at OpusClip (AI video b-roll), Captions Max, Descript credits; Premiere's partner models | Growing in every product's homepage | Users find it off-topic (4 of 11 wrong in OpusClip's test); "the ai generated images are really BAD" (Captions user) | **Online.** Local Wan 2.2 5B (Apache-2.0) needs 24 GB of GPU memory and "under 9 minutes" for 5 s of 720p ([GitHub](https://github.com/Wan-Video/Wan2.2)); LTX-Video makes 720×480 clips in under a minute on an RTX 4060 (community 8-bit build), newer LTX-2.5 under its own community licence ([GitHub](https://github.com/Lightricks/LTX-Video)) |
| 12 | **Upscaling** | CapCut "AI video upscaler", tier unclear | Low | No product sells it as its main thing in this scope | **Local**: Real-ESRGAN (BSD-3-Clause), portable builds for Windows, Linux and macOS with no CUDA needed ([GitHub](https://github.com/xinntao/Real-ESRGAN)); slow on long videos (*not measured*) |
| 13 | **Object removal** | Premiere beta; not in most AI-first tools | Low | Premiere limits it to 10-second 1080p clips | **Online.** The best-known open model, ProPainter, is **non-commercial** and needs ~19 GB of GPU memory for 50 frames of 720p ([GitHub](https://github.com/sczhou/ProPainter)) |

Outside the candidate list but sold hard: **AI avatars and AI twins** (Captions, Descript, VEED,
CapCut). Avatars appeared in 24.1% of 36,388 AI-generated videos OpusClip analysed
([OpusClip](https://www.opus.pro/blog/state-of-ai-video-creation-2026), 2026-04). They are online-only
and outside an editor's core; leave them to the model switcher.

**Both Adobe and Descript now let users pick the model** (Premiere's partner models; Underlord's model
picker). A model switcher is becoming normal, not exotic; our difference is that the local models are
free and the online ones run on the user's own key.

## Licence traps for an AGPL-3.0 app that may later sell credits

| Model | Use | Licence | Verdict |
|---|---|---|---|
| whisper.cpp | Transcription, captions | MIT | Safe |
| Silero VAD | Silence detection | not checked here (listed by whisper.cpp) | Check |
| DeepFilterNet | Voice enhancement | MIT or Apache-2.0 | Safe |
| MediaPipe | Face tracking for reframe | Apache-2.0 | Safe |
| Robust Video Matting | Background removal | GPL-3.0 | Safe with AGPL-3.0 (GPLv3 and AGPLv3 allow combining) |
| Kokoro-82M | Text-to-speech | Apache-2.0 | Safe |
| Chatterbox | Voice cloning | MIT | Safe, but unmaintained since 2026-08 |
| Real-ESRGAN | Upscaling | BSD-3-Clause | Safe |
| LatentSync | Lip sync | Apache-2.0 | Safe |
| Wan 2.2 | Video generation | Apache-2.0 | Safe, but too heavy for normal computers |
| CrisperWhisper | Verbatim transcripts (fillers) | Weights non-commercial | **Avoid** |
| NLLB-200 | Translation | CC-BY-NC, "not released for production" | **Avoid** |
| ProPainter | Object removal | Non-commercial | **Avoid** |
| LTX-2.5 | Video generation | LTX community licence, separate commercial terms | Read before use |

## Gaps

- G2 and Capterra scores: both refused the fetcher (HTTP 403).
- Search volumes per feature: not measured (needs Keyword Planner or Search Console data for
  competitors' terms; the session's web-search budget was used up).
- Independent tests of Generative Extend, CapCut's AI quality and Kapwing's dubbing were not found.
- Speed of local models on a normal Mac or a laptop without NVIDIA: not measured. The engine research
  should benchmark whisper.cpp, DeepFilterNet, MediaPipe and RVM on an 8–16 GB Apple Silicon laptop
  before release 1 promises them.
