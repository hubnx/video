# The easy editors: CapCut, Clipchamp, iMovie, Filmora

Research for `video`, 2026-11-17. Scope: the four editors beginners pick first. For each one: every feature workflow
(free, paid or absent), the 2026 price and where the free line falls, the layout and first-run flow, strengths and
weaknesses, what users say, and links to the official help pages so a reader can see the UI. The cross-product
matrix, the 15 most frequent complaints and the features users love come first; the detail per product follows.

Known before this research and not repeated: CapCut Pro rose from $9.99 to $19.99 a month in January 2026 and
1080p+ export is paid on some surfaces ([piunikaweb](https://piunikaweb.com), 2026-01-27; [eesel](https://www.eesel.ai/blog/capcut-reviews));
CapCut's terms license users' content to ByteDance; OpenCut (MIT, 98,759 stars) hasn't released since April 2026.

## Conclusion first

**What we found**

- **Every easy editor makes the user pay at the last step, or limits what the free version can do.**
  - CapCut and Clipchamp let free users put paid items on the timeline and then **block the export** until the user
    pays or removes them ([CapCut help](https://www.capcut.com/help/why-prompted-to-purchase-capcut-pro), 2026-04-02;
    [Clipchamp watermark FAQ](https://support.microsoft.com/en-us/Clipchamp/does-clipchamp-add-a-watermark-to-videos), fetched 2026-11-17).
  - Filmora **watermarks every free export** ([install guide](https://filmora.wondershare.com/guide/download-install-to-uninstall.html), fetched 2026-11-17).
  - iMovie is the only one that's truly free, but it runs only on Apple devices and hasn't had a feature release
    since 2023 ([9to5Mac](https://9to5mac.com/2025/10/11/rip-clips-apple-abandons-its-quirky-short-form-video-app/), 2025-10-11).
- **Each one has stepped back in 2025–26 and left users stranded.**
  - CapCut moved features behind Pro and doubled its price.
  - Clipchamp forces projects into OneDrive (since March 2026), retired its iOS app on 2026-06-09, and never shipped
    one for Android ([Windows Latest](https://www.windowslatest.com/2026/03/18/microsoft-forces-onedrive-on-clipchamp-windows-11s-built-in-video-editor), 2026-03-18;
    [Microsoft](https://support.microsoft.com/en-us/clipchamp/clipchamp-ios-app-deprecation), fetched 2026-11-17).
  - Apple's iMovie product pages now redirect to the support site (checked 2026-11-17: apple.com/imovie, /mac/imovie
    and /ios/imovie all return 301 to support.apple.com/imovie). Apple's AI editing lives in Final Cut Pro instead:
    $299.99 one-time, or Apple Creator Studio at $12.99 a month ([apple.com](https://www.apple.com/final-cut-pro/), fetched 2026-11-17;
    [TechCrunch](https://techcrunch.com/2026/01/13/apple-launches-creator-studio-bundle-of-apps-for-12-99-per-month), 2026-01-13).
  - Filmora 16 (2026-10-09) made perpetual licences bought before 2026-06-24 invalid for the new version
    ([Wondershare support](https://support.wondershare.com/how-tos/filmora/i-have-a-perpetual-plan-why-does-a-watermark-appear-during-export.html), fetched 2026-11-17).
- **Every AI feature runs online, and most cost money.**
  - CapCut and Filmora meter AI in credits: Filmora charges 4 credits a minute for captions and 450 for one Veo 3.1 clip
    ([credit rules](https://filmora.wondershare.com/filmora-ai-credits-rule.html), fetched 2026-11-17).
  - Clipchamp's free captions and text-to-speech send the audio and text to Microsoft's cloud, Azure
    ([captions help](https://support.microsoft.com/en-us/Clipchamp/how-to-use-autocaptions-in-clipchamp), fetched 2026-11-17).
  - iMovie has no AI at all.
  - None of the four lets the user bring their own API key (none found in any help centre).
- **The two most frequent complaints aren't about features.** They are crashes, lag and failed exports (32 sources),
  and paid items mixed into the free library that only show up at export (26 sources). After those come support and
  refunds, unwanted charges, watermarks, lost projects, and updates that move or remove things.
- **Users love ease above everything.** All four are praised first for being easy for beginners. Then: free with no
  watermark (iMovie, Clipchamp), templates and trailers that make a video look finished fast (CapCut, iMovie), auto
  captions and background removal (CapCut), and built-in screen and webcam recording (Clipchamp).

**What our editor must do to beat them**

1. **Nothing that's free while editing becomes paid at export.** Every tool and library item exports at every
   resolution: 4K, 60 fps, HDR, ProRes, GIF, no watermark. This answers complaints 2, 5 and 13.
2. **Stability is the feature.** Autosave and crash recovery; no slowdown on long projects (hours, not 10 minutes);
   export runs in the background and, when it fails, says why and how to fix it. This answers complaint 1, the most
   frequent of all.
3. **Projects are plain files on the user's disk.** No account, works offline, no cloud required, no project that
   can vanish. This answers complaints 7 and 11, which hit Clipchamp hardest.
4. **Match the beginner flow, then run its AI on the computer for free.** Start from a template or trailer; auto
   captions with styles, SRT import and export, and translation; background removal without a green screen; beat
   sync; voice changer; text-to-speech; noise reduction; silence and filler-word cuts; auto reframe to 9:16; direct
   share. These are what CapCut and Filmora charge credits for, and what Clipchamp sends to Azure.
5. **Online models at the provider's own price, through the user's key**, with the cost shown before each run. The
   alternative is Filmora at about $1.80–$3.00 per Veo 3.1 clip (our arithmetic from Wondershare's credit prices).
6. **Room to grow without leaving.** Keyframes with curves, masks, tracking, multicam, unlimited tracks, speed curves
   and LUTs, kept out of a beginner's way until wanted. "Outgrown it" is iMovie's and Clipchamp's second complaint (12 sources).
7. **The interface stays put.** No forced updates, no feature removed without a replacement and notice. This answers
   complaint 8.
8. **Mac, Windows and Linux, with one free licence.** iMovie is Apple-only, Clipchamp and CapCut have no Linux app,
   and Filmora needs a separate licence for phones.
9. **Risk we don't answer yet:** CapCut's and iMovie's users value moving a project between phone and computer. We
   have no phone app; say so plainly and make phone footage easy to import.

## How to read this

- **Free** = in the free version, and export isn't blocked. **Paid** = needs a paid plan. **Credits** = paid per use
  from a metered allowance. **Partial** = part free, part paid, or limited (the note says how). **None** = absent.
- *unverified* = we couldn't confirm it from a primary source. *(snippet)* = taken from a search-result snippet
  because the site blocks scripts.
- **Dates:** a live page with no date of its own is marked "fetched 2026-11-17". App Store review dates without a year
  are marked "year not shown".
- **Source limits:**
  - Reddit and Product Hunt refuse scripts, and the search tool blocked reddit.com, so Reddit appears only through other sites' snippets.
  - G2, Capterra, GetApp and Software Advice returned 403, so their figures are snippets or Toolradar's copies.
  - The Microsoft Store page content wasn't readable for CapCut or Clipchamp.
- **Complaint counts** are separate reviews or pages this research actually read, not totals on each site. They lean
  toward Trustpilot, where unhappy buyers go; treat them as a ranking, not a market share.
- **Spot-checked against the live pages on 2026-11-17:** CapCut's and Filmora's plan prices, Clipchamp's iOS
  retirement and OneDrive change, both Trustpilot scores, and the iMovie page redirects.

## At a glance

| | CapCut | Clipchamp (personal) | iMovie | Filmora 16 |
|---|---|---|---|---|
| Maker | ByteDance | Microsoft | Apple | Wondershare |
| Runs on | Mac, Windows, web, iPhone, iPad, Android | Windows 10/11 app; web in Edge or Chrome (Mac, Linux, ChromeOS); iOS app retired 2026-06-09 | Mac, iPhone, iPad | Windows, Mac; separate phone app |
| Account | Effectively required: sign-in "unlocks access to most Pro features" ([Windows guide](https://www.capcut.com/resource/capcut-for-windows), 2026-11-12) | Microsoft account required ([help](https://support.microsoft.com/en-us/Clipchamp/how-to-start-editing-a-new-video)) | None | Not to edit; needed for AI, cloud and activation |
| Paid plans | Pro $19.99/mo or $179.99/yr; Ultra $79/mo or $900/yr; Teams from $12.49/seat/mo ([pricing](https://www.capcut.com/pricing), fetched 2026-11-17) | Premium via Microsoft 365 Personal $9.99/mo or $99.99/yr, Family $12.99/mo ([Microsoft 365](https://www.microsoft.com/en-us/microsoft-365/buy/compare-all-microsoft-365-products), fetched 2026-11-17) | None (Final Cut Pro $299.99, or Creator Studio $12.99/mo, sits above it) | Basic $49.99/yr, Advanced $59.99/yr, Premium $99.99/yr, Perpetual (one version), plus credit packs and an assets add-on ([plans](https://filmora.wondershare.com/guide/member-plan.html), fetched 2026-11-17) |
| Free export | Desktop 1080p 30 fps, no watermark, only if no Pro item is used; 4K and 60 fps locked; phone may watermark | Up to 1080p, no watermark; premium items block export; 30 fps cap; MP4 only | Everything: up to 4K 30 fps (1080p 60), ProRes, no watermark | Watermark on every export |
| Where the paywall shows up | At export | At export | Nowhere | At export (watermark) and at each AI use (credits) |
| AI | Cloud, credits | Cloud (Azure), free basics | None | Cloud, credits |
| Works offline | Partly *unverified* | No: "requires an active internet connection" ([requirements](https://support.microsoft.com/en-US/Clipchamp/make-sure-clipchamp-works-well-for-you)) | Yes | Partly: online for registration and AI ([tech spec](https://filmora.wondershare.com/tech-spec.html)) |
| Projects stored | Local, plus CapCut cloud Space | OneDrive, required since March 2026 | Local iMovie library | Local, plus optional Wondershare Drive |
| Linux | No (web only) | Web editor only | No | No |

**Ratings** (fetched 2026-11-17 unless noted)

| Site | CapCut | Clipchamp | iMovie | Filmora |
|---|---|---|---|---|
| Trustpilot | **1.2** (1,406; 88% one-star) | **4.8** (7,553; "hasn't invited customers recently") | not checked | **4.0** (15,730; 13% one-star) |
| iOS App Store (US) | 4.6 (1.1M) | retired; 4.8 before ([Windows Latest](https://www.windowslatest.com/2026/04/18/microsoft-retires-clipchamps-ios-app-says-windows-11s-built-in-video-editor-is-here-to-stay/), 2026-04-18) | 4.4 (323K) | 4.68 (90,238; phone app) |
| Mac App Store (US) | 4.8 (29K) | — | "not enough ratings" shown | "not enough ratings" shown |
| Google Play | 3.57 (13,018,036; [unstar.app](https://unstar.app/blog/capcut-everything-is-pro-now-cant-export-reviews-2026), 2026-09-15) | no Android app | — | 4.0 (1.18M; phone app) |
| Microsoft Store | not readable | not readable | — | 4.4 (3,740) |
| G2 | no listing | 4.1 (52) *(snippet)* | about 4.3 (about 568) *(snippet, unverified)* | 4.4 (612) via [Toolradar](https://toolradar.com/tools/filmora), 2026-09-17 |
| Capterra | no listing | 4.3 (101) *(snippet)* | 4.5 (428) *(snippet)* | 4.5 (736) via Toolradar, 2026-09-17 |

CapCut's gap between Trustpilot (1.2) and the App Store (4.6) suggests casual phone users rate it in the store, while
people with billing or export problems go to Trustpilot. That's our reading, not a measured fact.

**UI layout: all four share one convention**

| Area | CapCut | Clipchamp | iMovie (Mac) | Filmora |
|---|---|---|---|---|
| Media and library | top left, tabs (Media, Audio, Text, Stickers, Effects, Transitions, Captions, Filters…) | left toolbar opens a panel (Your media, Record & create, Content library, Templates, Text, Transitions, Brand kit) | Libraries sidebar plus browser, top left, tabs (My Media, Audio & Video, Titles, Backgrounds, Transitions) | Media panel, top left *unverified*, tabs (Media, Stock, Audio, Titles, Transitions, Effects, Stickers, Templates) |
| Preview | top centre | centre, with a floating toolbar | top right | top centre *unverified* |
| Properties | right, changes with selection | right property panel (Captions, Audio, Fade, Filters, Effects, Colour, Speed) | adjustment buttons above the viewer | right *unverified* (Video, Audio, Colour, Speed) |
| Timeline | bottom, multi-track | bottom | bottom, magnetic, 2 video tracks | bottom, multi-track |
| Export | top right | top right | Share, top right | top right |

Our layout should follow the same convention (library top left, preview centre, properties right, timeline bottom,
Export top right) so that a switcher from any of them is at home on the first screen.

## Feature matrix

Each cell links to its source; per-product help links are in each product's workflows table below. CapCut is
the desktop app, Clipchamp is the personal version, iMovie is the Mac app, and Filmora is Filmora 16 desktop.
**Every Filmora "Free" cell exports with the watermark.** `?` = *unverified*.

| Feature | CapCut | Clipchamp | iMovie | Filmora |
|---|---|---|---|---|
| **Import and media** | | | | |
| Import from computer | [Free][cc-howto] | [Free][ch-edit]: also OneDrive, Google Drive, Dropbox | [Free][im-import]: Photos, Finder, cameras | [Free][fm-spec]: up to 8K |
| Stock media library | [Partial][cc-tutorial]: some Pro | [Partial][ch-pricing]: premium tier | [Partial][im-maps]: backgrounds, maps, sound effects; no stock video | [Partial][fm-pricing]: 600+ free, 1.1M+ paid |
| Screen recording | [Free][cc-recorder] | [Free][ch-record] | [None][im-guide] | [Free?][fm-record] |
| Webcam or voiceover recording | [Free][cc-recorder] | [Free][ch-pricing] | [Free][im-record] | [Free?][fm-press] |
| **Timeline editing** | | | | |
| Multi-track timeline | [Free][cc-vidpros] | [Free][ch-timeline] | [Partial][im-tracks]: 2 video tracks | [Free][fm-timeline] |
| Split and trim | [Free][cc-howto] | [Free][ch-split] | [Free][im-split] | [Free][fm-trim] |
| Speed change | [Free][cc-vidpros] | [Free][ch-speed]: 0.1–16× | [Free][im-speed] | [Free][fm-speed] |
| Speed curves | [Free][cc-vidpros]: "speed ramping" | [None][ch-speed] | [None][im-speed] | [Partial?][fm-speed] |
| Reverse and freeze frame | Free? | [None][ch-reverse] reverse; freeze [?][ch-freeze] | [Free][im-freeze] | [Free][fm-speed] |
| Crop, rotate, flip | Free? | [Free][ch-features] | [Partial][im-crop]: flip ? | [Free?][fm-panels] |
| Picture-in-picture | [Free][cc-equinet] | [Free][ch-pip] | [Free][im-pip]: one overlay at a time | [Free?][fm-compositing] |
| Masks | Free? | [None?][ch-features] | [None][im-ios-overlays] | [Free?][fm-masks] |
| Blend modes | Free? | [Free?][ch-whatsnew] | [None][im-guide] | [Free?][fm-compositing] |
| Multicam | [Partial?][cc-multicam]: tier unknown | [None][ch-aiarty] | [None][im-pcworld] | [Free?][fm-multicam] |
| **Text and captions** | | | | |
| Basic text | [Free][cc-howto] | [Free][ch-text] | [Free][im-titles]: presets | [Free][fm-text] |
| Animated text templates | [Partial][cc-tutorial]: some Pro | [Free][ch-rm564968] | [Free][im-ios-store]: preset titles | [Partial][fm-pricing]: most presets paid |
| Auto captions | [Paid][cc-pro-pc]: small free allowance claimed by [vidpros][cc-vidpros] | [Free][ch-captions]: in Azure's cloud | [None][im-freealt] | [Credits][fm-credits]: 4 a minute |
| Caption translation | [Paid][cc-pro-pc] | [None?][ch-captions] | [None][im-freealt] | [Credits][fm-credits]: 5–16 a minute |
| SRT import or export | [Paid][cc-descript]: export; import ? | [Partial][ch-captions]: export only | [None][im-freealt] | [Free][fm-spec]: import; export ? |
| **Templates, effects, filters, transitions, stickers** | | | | |
| Video templates | [Partial][cc-pricing] | [Partial][ch-compare] | [Free][im-mac-store]: 29 trailers, themes | [Partial][fm-templates] |
| Effects | [Partial][cc-vidpros] | [Partial][ch-compare] | [Free][im-mac-store]: 48 video and audio | [Partial][fm-pricing]: 1,500+ free, 18K+ paid |
| Filters | [Partial][cc-tutorial] | [Partial][ch-compare] | [Free][im-effects] | [Partial][fm-pricing] |
| Transitions | [Partial][cc-join] | [Partial][ch-compare] | [Free][im-transitions] | [Partial][fm-pricing] |
| Stickers and GIFs | [Partial][cc-join] | [Partial][ch-pricing]: GIPHY | [None][im-guide] | [Partial][fm-stickers] |
| **Keyframes and animation** | | | | |
| Keyframes | [Free][cc-desktop-ai]: with graphs | [None][ch-keyframes-qa] | [Partial][im-volume]: volume, Ken Burns | [Free?][fm-keyframes] |
| Motion tracking | [Paid][cc-vidpros] | [None?][ch-cyberlink] | [None][im-freealt] | [Free?][fm-tracking]: also planar, camera |
| **Green screen and background** | | | | |
| Chroma key | [Free][cc-vidpros] | [Free][ch-greenscreen] | [Free][im-greenscreen] | [Free?][fm-greenscreen] |
| AI background removal (video) | [Paid][cc-pro-pc] | [Partial][ch-bg-image]: images only | [None][im-fcp]: paid in Final Cut Pro | [Free][fm-pricing]: AI Portrait |
| **Colour** | | | | |
| Colour correction | [Free][cc-desktop-ai] | [Free][ch-color]: basic sliders | [Free][im-color] | [Free?][fm-color] |
| LUTs | [Free?][cc-desktop-ai] | [None?][ch-features] | [None][im-color] | [?][fm-guide] |
| **Audio** | | | | |
| Music library | [Partial][cc-join] | [Partial][ch-pricing] | [Partial][im-101664]: jingles, your own Music library | [Partial][fm-pricing]: 9,600+ free |
| Sound effects | [Free][cc-howto] | [Partial][ch-pricing] | [Free][im-101664] | [Partial][fm-credits] |
| Voice changer | [Partial][cc-howto] | [None?][ch-features] | [Partial][im-audio-effects]: unnamed audio effects | [Free?][fm-voice] |
| Noise reduction | [Paid][cc-pro-pc] | [Free][ch-noise] | [Free][im-enhance] | [Partial?][fm-costbench] |
| Beat sync | [Free?][cc-desktop-ai] | [None?][ch-features] | [None][im-fcp] | [Free?][fm-beatsync] |
| Text-to-speech | [Paid][cc-pro-pc] | [Free][ch-tts]: in Azure's cloud | [None][im-guide] | [Credits][fm-credits] |
| Audio ducking | [None on desktop][cc-ducking] | [None?][ch-features] | [Free][im-macmost-audio] | [Free?][fm-ducking] |
| Vocal or stem separation | [Paid][cc-pro-pc] | [None?][ch-features] | [None][im-guide] | [Free?][fm-vocal] |
| **AI** | | | | |
| Auto cut silences or filler words | [Paid?][cc-fillers] | [Partial][ch-silence]: silences free | [None][im-guide] | [Partial][fm-silence]: silences |
| Long video to shorts | Paid? | [None?][ch-features] | [None][im-guide] | [Credits][fm-credits] |
| Text- or image-to-video | [Credits][cc-pricing]: Seedance, Veo, Sora | [None][ch-copilot]: work Copilot only, stock footage | None | [Credits][fm-credits]: Veo 3.1, Sora 2 |
| AI avatars | [Paid][cc-pro-pc] | [None?][ch-features] | None | [None?][fm-guide] |
| AI script writer | [Paid?][cc-desktop-ai] | [None][ch-copilot]: work Copilot only | None | [Credits][fm-credits] |
| AI upscale or enhance | [Paid][cc-vidpros] | [Partial][ch-upscale]: Windows app, on the device | [None][im-color] | [Credits][fm-credits] |
| Retouch / beauty | [Paid][cc-pro-pc] | [None?][ch-features] | [None][im-color] | [Free?][fm-retouch] |
| Bring your own AI key, or local models | None found | None found | None | None found |
| **Aspect ratios and reframing** | | | | |
| Aspect ratio presets | [Free][cc-howto] | [Free][ch-aspect] | [None?][im-settings]: 16:9 only | [Free][fm-project] |
| Auto reframe | [Paid?][cc-fluxnote] | [None][ch-toolbar] | None | [Free][fm-pricing] |
| **Export** | | | | |
| 1080p export | [Free][cc-why-pro]: desktop; phone may watermark | [Free][ch-export] | [Free][im-102276] | [Free][fm-install]: watermark |
| 4K export | [Paid][cc-why-pro] | [Paid][ch-4k] | [Free][im-102276]: 30 fps on Mac | [Paid][fm-pricing] |
| 60 fps export | [Paid][cc-why-pro] | [None][ch-export]: 30 fps cap | [Partial][im-102276]: 1080p60 only | [?][fm-project] |
| No watermark | [Partial][cc-why-pro]: only without Pro items | [Free][ch-watermark]: premium items block export instead | [Free][im-freealt] | [Paid][fm-plans]: from $49.99/yr |
| GIF export | Free?: 240–640p | [Free][ch-export]: 15 s or less | [None][im-export] | [Free?][fm-spec] |
| ProRes or other pro formats | [None?][cc-miracamp] | [None][ch-export]: MP4 only | [Free][im-macmost-export]: ProRes | [Partial][fm-spec]: ProRes MOV, AV1, HEVC |
| HDR | [Paid][cc-vidpros] | [None?][ch-export] | [Partial][im-hdr]: Mac converts to SDR | [Free?][fm-hdr]: HLG, PQ |
| **Sharing** | | | | |
| Direct share to YouTube or TikTok | [Free][cc-tutorial] | [Free][ch-export] | [None][im-social]: Mac makes a file | [Free][fm-export]: watermark |
| **Projects and cloud** | | | | |
| Cloud storage or sync | [Paid][cc-pricing]: 1 TB on Pro | [Free 5 GB, paid 1 TB][ch-storage]: required | [None][im-ios-export] | [Paid][fm-pricing]: 1–100 GB |
| Team collaboration | [Paid][cc-pricing]: Teams | [Paid][ch-compare]: work version | None | [Partial][fm-drive] |
| Brand kit | [Paid][cc-pricing]: Teams | [Paid][ch-brandkit] | None | [?][fm-upgrade] |
| Works offline | [Partial?][cc-windows] | [None][ch-requirements] | Free | [Partial][fm-spec] |
| Files stay local | [Partial][cc-bigvu]: cloud AI, content licence | [Partial][ch-onedrive]: projects in OneDrive | [Free][im-libraries] | [Partial][fm-shorts]: AI uploads |
| Linux build | [None][cc-linux] | [Partial][ch-devices]: web editor | None | [None][fm-spec] |

[cc-pricing]: https://www.capcut.com/pricing
[cc-pro-pc]: https://www.capcut.com/resource/capcut-pro-pc
[cc-why-pro]: https://www.capcut.com/help/why-prompted-to-purchase-capcut-pro
[cc-howto]: https://www.capcut.com/resource/how-to-use-capcut-on-pc
[cc-tutorial]: https://www.capcut.com/resource/capcut-tutorial-for-beginners
[cc-recorder]: https://www.capcut.com/resource/computer-screen-recording-software
[cc-vidpros]: https://vidpros.com/capcut-pro-vs-free/
[cc-desktop-ai]: https://www.capcut.com/tools/desktop-ai-power
[cc-multicam]: https://www.capcut.com/resource/multicam-editing
[cc-join]: https://www.capcut.com/help/join-capcut-pro-for-exporting
[cc-descript]: https://www.descript.com/blog/article/capcut-captions-arent-free-anymore-heres-a-better-option
[cc-ducking]: https://www.capcut.com/create/audio-ducking-for-clear-dialogue-in-video
[cc-fillers]: https://www.capcut.com/tools/filler-words
[cc-fluxnote]: https://fluxnote.io/guides/capcut-ai-features-free-vs-paid-2026
[cc-miracamp]: https://www.miracamp.com/learn/capcut/how-to-export-high-quality-videos
[cc-bigvu]: https://bigvu.tv/blog/capcut-desktop-review-2026-features-pricing-smart-alternatives/
[cc-linux]: https://www.change.org/p/bytedance-make-capcut-available-for-linux-capcutforlinux
[cc-windows]: https://www.capcut.com/resource/capcut-for-windows
[cc-equinet]: https://www.equinetacademy.com/blog/how-to-use-capcut-everything-you-need-to-start-editing-videos-easily/
[ch-pricing]: https://clipchamp.com/en-us/pricing/
[ch-edit]: https://support.microsoft.com/en-us/Clipchamp/how-to-edit-a-video-in-clipchamp
[ch-record]: https://support.microsoft.com/en-us/Clipchamp/record-video
[ch-timeline]: https://support.microsoft.com/en-us/Clipchamp/how-to-work-with-the-timeline-in-clipchamp
[ch-split]: https://support.microsoft.com/en-us/Clipchamp/how-to-split-or-cut-videos-and-audio-assets
[ch-speed]: https://support.microsoft.com/en-us/Clipchamp/how-to-speed-up-or-slow-down-a-video
[ch-reverse]: https://moviemaker.minitool.com/news/clipchamp-reverse-video.html
[ch-freeze]: https://windowsreport.com/clipchamp-how-to-freeze-frame/
[ch-features]: https://support.microsoft.com/en-us/Clipchamp/video-editing-features
[ch-pip]: https://support.microsoft.com/en-us/Clipchamp/how-to-use-picture-in-picture
[ch-whatsnew]: https://clipchamp.com/en/whats-new
[ch-aiarty]: https://www.aiarty.com/edit-video/clipchamp-review.htm
[ch-text]: https://support.microsoft.com/en-us/Clipchamp/how-to-add-text-and-titles-to-a-video
[ch-rm564968]: https://mc.merill.net/message/RM564968
[ch-captions]: https://support.microsoft.com/en-us/Clipchamp/how-to-use-autocaptions-in-clipchamp
[ch-compare]: https://support.microsoft.com/en-us/clipchamp/feature-comparison-between-clipchamp-for-work-and-personal-versions
[ch-keyframes-qa]: https://learn.microsoft.com/en-us/answers/questions/5522382/add-custom-image-animation-feature-to-clipchamp
[ch-cyberlink]: https://www.cyberlink.com/blog/the-top-video-editors/5394/clipchamp-alternative
[ch-greenscreen]: https://support.microsoft.com/en-us/Clipchamp/how-to-use-the-green-screen-effect-in-clipchamp
[ch-bg-image]: https://support.microsoft.com/en-us/Clipchamp/how-to-remove-background-from-your-photos-and-images
[ch-color]: https://support.microsoft.com/en-us/Clipchamp/how-to-change-the-color-of-a-video
[ch-noise]: https://support.microsoft.com/en-us/Clipchamp/how-to-use-noise-suppression
[ch-tts]: https://support.microsoft.com/en-us/Clipchamp/how-to-use-the-text-to-speech-feature
[ch-silence]: https://support.microsoft.com/en-us/Clipchamp/how-to-use-silence-removal
[ch-copilot]: https://support.microsoft.com/en-us/Clipchamp/how-to-create-video-with-copilot
[ch-upscale]: https://support.microsoft.com/en-us/Clipchamp/how-to-upscale-videos-with-video-super-resolution
[ch-toolbar]: https://clipchamp.com/en/blog/floating-toolbar-property-panel-clipchamp
[ch-aspect]: https://support.microsoft.com/en-us/Clipchamp/how-to-change-the-aspect-ratio-of-a-video
[ch-export]: https://support.microsoft.com/en-us/Clipchamp/exporting-and-saving-a-video-in-clipchamp
[ch-4k]: https://support.microsoft.com/en-us/Clipchamp/4k-video-support-in-clipchamp
[ch-watermark]: https://support.microsoft.com/en-us/Clipchamp/does-clipchamp-add-a-watermark-to-videos
[ch-storage]: https://support.microsoft.com/en-us/clipchamp/clipchamp-cloud-storage-frequently-asked-questions
[ch-brandkit]: https://support.microsoft.com/en-us/Clipchamp/how-to-use-the-brand-kit-tool-in-clipchamp
[ch-requirements]: https://support.microsoft.com/en-US/Clipchamp/make-sure-clipchamp-works-well-for-you
[ch-onedrive]: https://www.windowslatest.com/2026/03/18/microsoft-forces-onedrive-on-clipchamp-windows-11s-built-in-video-editor
[ch-devices]: https://support.microsoft.com/en-us/Clipchamp/which-devices-does-clipchamp-work-on
[im-import]: https://support.apple.com/guide/imovie/import-media-from-your-mac-mov6fa10197d/mac
[im-maps]: https://support.apple.com/guide/imovie/add-maps-and-backgrounds-mov06651529f/mac
[im-guide]: https://support.apple.com/guide/imovie/welcome/mac
[im-record]: https://support.apple.com/guide/imovie/record-video-into-imovie-movc665d799a/mac
[im-tracks]: https://discussions.apple.com/thread/253049078
[im-split]: https://support.apple.com/guide/imovie/move-and-split-clips-mov16b2ea79a/mac
[im-speed]: https://support.apple.com/guide/imovie/change-clip-speed-mov6c442b2eb/mac
[im-freeze]: https://support.apple.com/guide/imovie/add-freeze-frames-mov772ab4a71/mac
[im-crop]: https://support.apple.com/guide/imovie/crop-clips-mova56757e7e/mac
[im-pip]: https://support.apple.com/guide/imovie/create-a-picture-in-picture-effect-mova1aaa682b/mac
[im-ios-overlays]: https://support.apple.com/guide/imovie-iphone/add-video-overlay-effects-kna831efee4d/ios
[im-pcworld]: https://www.pcworld.com/article/3236186/imovie-10-review-free-video-editing-thats-elegant-and-easy.html
[im-titles]: https://support.apple.com/guide/imovie/add-titles-mov4d3dce7ba/mac
[im-ios-store]: https://apps.apple.com/us/app/imovie/id377298193
[im-mac-store]: https://apps.apple.com/us/app/imovie/id408981434?mt=12
[im-freealt]: https://freealternatives.to/imovie/review
[im-effects]: https://support.apple.com/guide/imovie/add-video-effects-movd17f56aaa/mac
[im-transitions]: https://support.apple.com/guide/imovie/add-transitions-movcaedc4dbd/mac
[im-volume]: https://support.apple.com/guide/imovie/change-audio-volume-mov3b5ded23e/mac
[im-greenscreen]: https://support.apple.com/guide/imovie/create-a-green-screen-effect-mov82da1338a/mac
[im-fcp]: https://www.apple.com/final-cut-pro/
[im-color]: https://support.apple.com/guide/imovie/adjust-a-clips-color-movf2a3f0f42/mac
[im-101664]: https://support.apple.com/101664
[im-audio-effects]: https://support.apple.com/guide/imovie/add-audio-effects-mov84788882d/mac
[im-enhance]: https://support.apple.com/guide/imovie/correct-and-enhance-audio-mov86277afbd/mac
[im-macmost-audio]: https://macmost.com/imovie-for-mac-audio-tips-and-tricks.html
[im-settings]: https://support.apple.com/guide/imovie/change-project-settings-mov6db33963c/mac
[im-102276]: https://support.apple.com/en-us/102276
[im-export]: https://support.apple.com/guide/imovie/export-a-movie-trailer-or-clip-as-a-file-move6e0cb2ad/mac
[im-macmost-export]: https://macmost.com/choosing-the-best-imovie-export-settings.html
[im-hdr]: https://discussions.apple.com/thread/256086103
[im-social]: https://support.apple.com/guide/imovie/share-to-social-platforms-move0470816c/mac
[im-ios-export]: https://support.apple.com/guide/imovie-iphone/export-projects-knaf0c276dc0/ios
[im-libraries]: https://support.apple.com/guide/imovie/work-with-multiple-libraries-mov3fa25bae7/mac
[fm-spec]: https://filmora.wondershare.com/tech-spec.html
[fm-pricing]: https://filmora.wondershare.com/pricing.html
[fm-record]: https://filmora.wondershare.com/guide/record-pc-screen.html
[fm-press]: https://www.cantechletter.com/newswires/wondershare-filmora-16-launches-to-make-professional-video-creation-more-accessible-with-ai/
[fm-timeline]: https://filmora.wondershare.com/guide/use-the-timeline.html
[fm-trim]: https://filmora.wondershare.com/guide/trim-split-cut.html
[fm-speed]: https://filmora.wondershare.com/guide/change-video-speed.html
[fm-panels]: https://filmora.wondershare.com/guide/panel-layout.html
[fm-compositing]: https://filmora.wondershare.com/guide/compositing.html
[fm-masks]: https://filmora.wondershare.com/guide/masks.html
[fm-multicam]: https://filmora.wondershare.com/guide/multicam-editing.html
[fm-text]: https://filmora.wondershare.com/guide/edit-and-customize-texts.html
[fm-credits]: https://filmora.wondershare.com/filmora-ai-credits-rule.html
[fm-templates]: https://filmora.wondershare.com/guide/edit-with-preset-templates.html
[fm-stickers]: https://filmora.wondershare.com/guide/add-and-customize-elements.html
[fm-keyframes]: https://filmora.wondershare.com/guide/add-animation-keyframing.html
[fm-tracking]: https://filmora.wondershare.com/guide/motion-tracking.html
[fm-greenscreen]: https://filmora.wondershare.com/guide/green-screen.html
[fm-color]: https://filmora.wondershare.com/guide/adjust-tone-in-color-correction.html
[fm-guide]: https://filmora.wondershare.com/guide/
[fm-voice]: https://filmora.wondershare.com/guide/voice-changer.html
[fm-costbench]: https://www.costbench.com/software/video-editing/filmora/free-plan/
[fm-beatsync]: https://filmora.wondershare.com/guide/auto-beat-sync.html
[fm-ducking]: https://filmora.wondershare.com/guide/ducking.html
[fm-vocal]: https://filmora.wondershare.com/guide/ai-vocal-remover.html
[fm-silence]: https://filmora.wondershare.com/guide/silence-detection.html
[fm-retouch]: https://filmora.wondershare.com/guide/retouch.html
[fm-project]: https://filmora.wondershare.com/guide/create-a-project.html
[fm-install]: https://filmora.wondershare.com/guide/download-install-to-uninstall.html
[fm-plans]: https://filmora.wondershare.com/guide/member-plan.html
[fm-hdr]: https://filmora.wondershare.com/guide/hdr.html
[fm-export]: https://filmora.wondershare.com/guide/export-to-local.html
[fm-drive]: https://filmora.wondershare.com/guide/wondershare-drive-overview.html
[fm-upgrade]: https://filmora.wondershare.com/upgrade/16-free-download.html
[fm-shorts]: https://filmora.wondershare.com/guide/smart-short-clips.html

**What the matrix says**

- **Free and complete at once:** no one. iMovie is free but thin, Filmora is complete but watermarked, and CapCut is
  complete but pays at export.
- **Free AI basics:** only Clipchamp (captions, text-to-speech, silences, noise), and only in Microsoft's cloud.
- **No one offers** local AI models or a bring-your-own key, free 4K at 60 fps with HDR, *and* Linux.

## Top 15 complaints, ranked

The count is separate sources this research read, given as CapCut / Clipchamp / iMovie / Filmora. Themes overlap a
little (one review can name two), so read the totals as a ranking.

| # | Complaint | Sources (CC/CH/IM/FM = total) | Evidence | What we do |
|---|---|---|---|---|
| 1 | **Crashes, lag, failed or slow exports, especially on long projects** | 2 / 11 / 9 / 10 = **32** | "It crashes randomly every 10-20 minutes" ([Mac App Store UK, iMovie](https://apps.apple.com/gb/app/imovie/id408981434?mt=12), year not shown); "This program can't handle complex projects longer than 10 minutes." ([Trustpilot, Filmora](https://www.trustpilot.com/review/filmora.wondershare.com), 2026-10-23); "after almost 30 minutes for an 8-minute video" ([Trustpilot, Clipchamp](https://www.trustpilot.com/review/clipchamp.com?stars=1), 2026-08-04); "keeps crashing whenever I try to export a video longer than five minutes" ([Trustpilot, CapCut](https://www.trustpilot.com/review/capcut.com?stars=3), 2026-05-14) | Autosave, crash recovery, a test suite of long projects, background export, failures that say why |
| 2 | **Paid items mixed into the library; paywall only at export; features moved to paid; upsells** | 10 / 3 / 0 / 13 = **26** | "PROMOTES ITS FREE UNTIL YOU TRY TO EXPORT VIDEO" ([Trustpilot, CapCut](https://www.trustpilot.com/review/capcut.com), 2026-11-17); "it won't let me export the video because it still thinks I have the premium feature on" (Google Play, CapCut, most-voted negative review with 4,603 helpful votes, via [unstar.app](https://unstar.app/blog/capcut-everything-is-pro-now-cant-export-reviews-2026), 2026-09-15; 234 of 900 sampled reviews say "locked"); "constantly hit with upsells and gated features" ([Mac App Store, Filmora](https://apps.apple.com/us/app/filmora-ai-video-editor/id1516822341), 2025-07-02) | Everything in the app exports, free; nothing is ever tagged as paid |
| 3 | **Poor support; refunds refused** | 3 / 3 / 0 / 12 = **18** | "an AI assistant that took me in circles" ([Trustpilot, Filmora](https://www.trustpilot.com/review/filmora.wondershare.com), 2026-10-16); "obtaining a refund has become an infuriating ordeal" ([Trustpilot, Filmora](https://www.trustpilot.com/review/filmora.wondershare.com?stars=1), Oct 2026); Wondershare: "Our 30-day policy does not apply to auto-renewal charges" ([terms](https://www.wondershare.com/subscription-and-cancellation-terms.html), fetched 2026-11-17) | Nothing to refund; a help page for each common problem; public issue tracker |
| 4 | **Unwanted charges, auto-renewal, can't cancel, double charges** | 4 / 0 / 0 / 8 = **12** | "Charged me for a pro subscription that I didn't ask for." ([Trustpilot, CapCut](https://www.trustpilot.com/review/capcut.com), 2026-11-01); "you can't cancel the subscription" (same, 2026-10-31); "the second time that they charged me twice" ([Trustpilot, Filmora](https://www.trustpilot.com/review/filmora.wondershare.com), 2026-11-11) | No subscription |
| 5 | **Watermark** | 2 / 0 / 0 / 10 = **12** | "the water mark … smothers the whole screen and ruins your work" ([Trustpilot, Filmora](https://www.trustpilot.com/review/filmora.wondershare.com), 2026-10-16); "had to pay 75$ to remove it" (Trustpilot, Filmora, 2026-10-06); 54 of 900 CapCut Google Play reviews ([unstar.app](https://unstar.app/blog/capcut-everything-is-pro-now-cant-export-reviews-2026), 2026-09-15) | Never |
| 6 | **Too limited; outgrown; missing advanced tools** | 0 / 5 / 7 / 0 = **12** | "I have accomplished a lot with iMovie, but have now outgrown it." ([Mac App Store](https://apps.apple.com/us/app/imovie/id408981434?mt=12), year not shown); "Filmora, Capcut and other programs are far ahead of I-Movie" ([Apple Community](https://discussions.apple.com/thread/255921491), 2025-01-09); Clipchamp keyframes request ([Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5522382/add-custom-image-animation-feature-to-clipchamp), Aug 2025) | Keyframes, masks, tracking, multicam, curves, kept out of the way until wanted |
| 7 | **Projects or files lost** | 3 / 8 / 0 / 0 = **11** | "All the projects I ever worked on are gone." ([Microsoft Q&A, Clipchamp](https://learn.microsoft.com/en-us/answers/questions/5820384/all-clipchamp-projects-are-gone-from-ddesktop-app), 2026-03-13); "When OneDrive doesn't sync, the program doesn't work." ([Trustpilot, Clipchamp](https://www.trustpilot.com/review/clipchamp.com?stars=2), 2026-01-05); "Lost content, 15 hours in fact." ([Trustpilot, CapCut](https://www.trustpilot.com/review/capcut.com?page=2), 2026-10-29) | Projects are local files, saved continuously, with versions |
| 8 | **Updates move, change or remove things; forced updates** | 2 / 5 / 3 / 1 = **11** | "you took an awesome program and broke it." ([Trustpilot, Clipchamp](https://www.trustpilot.com/review/clipchamp.com?stars=2), 2026-02-28); Clipchamp's speaker coach removed 2025-12-01 ([Microsoft](https://support.microsoft.com/en-us/Clipchamp/how-to-use-speaker-coach)); CapCut: "older versions may be disabled" ([help](https://www.capcut.com/help/being-forced-to-update-capcut), 2025-12-25); "The interface changed so much that I feel lost" ([Trustpilot, Filmora](https://www.trustpilot.com/review/filmora.wondershare.com?stars=3), 2025-10-23) | Stable layout; no forced updates; removal only with notice and a replacement |
| 9 | **Abandoned or stagnant** | 0 / 4 / 6 / 0 = **10** | "iMovie hasn't received major new features since 2023" ([9to5Mac](https://9to5mac.com/2025/10/11/rip-clips-apple-abandons-its-quirky-short-form-video-app/), 2025-10-11); "The only updates iMovie has received in the past year were onboarding screens" ([Six Colors](https://sixcolors.com/post/2025/10/creative-neglect-what-about-the-apps-in-apple/), 2025-10-23); Clipchamp iOS retired 2026-06-09 ([Microsoft](https://support.microsoft.com/en-us/clipchamp/clipchamp-ios-app-deprecation)) | Public roadmap and release notes; open source outlives us |
| 10 | **Price too high, or rising** | 4 / 0 / 0 / 5 = **9** | "they basically doubled the cost of their service" ([Mac App Store, CapCut](https://apps.apple.com/us/app/capcut-video-editor/id1500855883?platform=mac&see-all=reviews), 2025-03-05); Hong Kong yearly HK$388 → HK$988 ([unwire.hk](https://unwire.hk/2026/01/24/capcut-subscription-price-increase-hk988/software/), 2026-01-24); Filmora "$35/mo" (Trustpilot, 2026-10-11) | Free |
| 11 | **Account or internet required; sign-in loops** | 0 / 6 / 0 / 3 = **9** (CapCut requires sign-in by design) | "it freezes if it detects you are not connected" ([Trustpilot, Clipchamp](https://www.trustpilot.com/review/clipchamp.com?stars=1), 2026-07-05); Clipchamp "requires an active internet connection to function" ([Microsoft](https://support.microsoft.com/en-US/Clipchamp/make-sure-clipchamp-works-well-for-you)); [Guiding Tech](https://www.guidingtech.com/clipchamp-keeps-looping-on-login/) on login loops | No account; fully offline |
| 12 | **Paying again for each new major version** | 0 / 0 / 0 / 8 = **8** | "I had to pay an additional fee to continue using the new version without a watermark." ([Trustpilot, Filmora](https://www.trustpilot.com/review/filmora.wondershare.com?stars=1), 2026-10-04); perpetual licences before 2026-06-24 "not valid for Filmora 16" ([support](https://support.wondershare.com/how-tos/filmora/i-have-a-perpetual-plan-why-does-a-watermark-appear-during-export.html)); 2023 lifetime-licence change ([No Film School](https://nofilmschool.com/lifetime-licenses-need-to-knows), 2023-01-30) | Every version free |
| 13 | **Export limits: frame rate, format, quality, HDR** | 0 / 3 / 4 / 0 = **7** | "it consistently converts my footage to 30 fps, SDR" ([Apple Community, iMovie](https://discussions.apple.com/thread/256086103), 2025-06-23); Clipchamp: "The frame rate is 30fps", MP4 only ([export help](https://support.microsoft.com/en-us/Clipchamp/exporting-and-saving-a-video-in-clipchamp)); "microsoft's clipchamp is 30fps only" (Reddit r/pcmasterrace, Mar 2025, *snippet*) | Any resolution and frame rate, HDR, ProRes, GIF, bitrate control |
| 14 | **AI credits drain, cost too much, or fail** | 2 / 0 / 0 / 4 = **6** | "CapCut repeatedly deducts my paid credits when I simply open the app" ([Trustpilot](https://www.trustpilot.com/review/capcut.com), 2026-11-01); "Cost to use AI-Tools is ridicuosly high comparing the quality of the outcome." ([Trustpilot, Filmora](https://www.trustpilot.com/review/filmora.wondershare.com?stars=3), 2025-09-09) | Local AI free; online AI on the user's key, cost shown first |
| 15 | **No auto captions or subtitle files** | 0 / 0 / 5 / 0 = **5** | iMovie has no captions or SRT ([freealternatives.to](https://freealternatives.to/imovie/review), Jul 2026); "not great for complex editing with advanced options for titles and subtitles" ([Techjockey](https://www.techjockey.com/reviews/imovie), 2024-07-16); CapCut's paywall on captions drew a competitor's article ([Descript](https://www.descript.com/blog/article/capcut-captions-arent-free-anymore-heres-a-better-option), 2026-07-29) | Free local captions, styles, SRT in and out |

**Tied with #15 at 5 sources:** a confusing or rigid interface (iMovie, mostly 2017–2024 reviews); and a music or
stock library that's thin or keeps changing (Clipchamp 3, iMovie 2: "the library of music and sound effects changes
and you don't know which will be removed", [Trustpilot](https://www.trustpilot.com/review/clipchamp.com), 2026-11-14).

**Below 5:** track and overlay limits (iMovie 4); weak audio editing (iMovie 4); Apple-only or no Linux (iMovie 3,
CapCut 1); a heavy disk footprint (iMovie 3); separate phone and desktop licences (Filmora 2); and ads in the phone app
(CapCut, 97 of 900 sampled Google Play reviews, [unstar.app](https://unstar.app/blog/capcut-everything-is-pro-now-cant-export-reviews-2026), 2026-09-15).

## Features users love most: we must match these

| # | Loved feature | Who has it | Evidence | What we do |
|---|---|---|---|---|
| 1 | **Easy for beginners** | All four | "Super easy to use. I'm a 55 year old woman with only moderate computer experience." ([Trustpilot, Clipchamp](https://www.trustpilot.com/review/clipchamp.com), 2026-10-27); "Love the easy to use tools, perfect for beginners." ([Trustpilot, Filmora](https://www.trustpilot.com/review/filmora.wondershare.com), 2026-05-24); "simple and easy to use, beginners won't find it confusing." ([App Store, iMovie](https://apps.apple.com/us/app/imovie/id377298193?see-all=reviews), 2022-04-27); "Easy to use, effective, free" ([Trustpilot, CapCut](https://www.trustpilot.com/review/capcut.com?stars=5), 2026-11-04); G2 ease of use 9.4 for Clipchamp *(snippet)* | The first export within minutes of install, with no account, no settings and no tour to sit through |
| 2 | **Free, with no watermark** | iMovie, Clipchamp (to 1080p) | "Absolutely brilliant app to edit my videos for social media - no need for Capcut subscriptions!" ([Trustpilot, Clipchamp](https://www.trustpilot.com/review/clipchamp.com), 2026-11-17); iMovie "free for Apple device users" (Capterra *snippet*) | Free at every resolution |
| 3 | **Templates and trailers that look finished fast** | CapCut, iMovie, Filmora | "Love their templates and all the features" ([Trustpilot, CapCut](https://www.trustpilot.com/review/capcut.com?stars=5), 2026-06-30); "You truly can make professional looking videos with this." ([App Store, iMovie](https://apps.apple.com/us/app/imovie/id377298193?see-all=reviews), 2021-05-28); PCWorld on iMovie trailers ([PCWorld](https://www.pcworld.com/article/3236186/imovie-10-review-free-video-editing-thats-elegant-and-easy.html), 2017-11-17) | Templates and trailer-style starts, all free and openly licensed |
| 4 | **Auto captions and background removal** | CapCut (paid now), Clipchamp captions, Filmora (credits) | "ai generated captions, remove background items etc." ([Trustpilot, CapCut](https://www.trustpilot.com/review/capcut.com?stars=5), 2026-06-30); Descript wrote a whole article for users who lost CapCut's free captions (2026-07-29) | Both free, on the computer |
| 5 | **Many effects and features in one place** | CapCut, Filmora | "Easy to use, with plenty of functionality." ([Trustpilot, Filmora](https://www.trustpilot.com/review/filmora.wondershare.com), 2026-04-12); "has all the features, if not more" ([Mac App Store, CapCut](https://apps.apple.com/us/app/capcut-video-editor/id1500855883?platform=mac&see-all=reviews), 2025-12-03) | A full effect, filter, transition and sticker library from day one |
| 6 | **Screen and webcam recording built in** | CapCut, Clipchamp, Filmora | G2 five-star snippet praising Clipchamp's fast, simple screen recording | Built-in recorder |
| 7 | **Handles big files smoothly** | Clipchamp (praised); CapCut timeline | "Handles large files that other apps struggle." ([Trustpilot, Clipchamp](https://www.trustpilot.com/review/clipchamp.com), 2026-11-14); "The multi-layer video track editor works smoothly" ([Trustpilot, CapCut](https://www.trustpilot.com/review/capcut.com?stars=3), 2026-06-03) | Proxy files and a native engine, measured on 4K projects |
| 8 | **Works with the phone and the photo library** | iMovie, CapCut | iMovie's "Robust and useful interactions with other Apple products" ([PCWorld](https://www.pcworld.com/article/3236186/imovie-10-review-free-video-editing-thats-elegant-and-easy.html), 2017); CapCut's one account across phone, web and desktop | Fast import from phones and photo libraries; phone app later, if ever |
| 9 | **Small fixes users asked for** | CapCut | "YOU LISTENED, THANK YOU for adding a favorites tab for animations!!" ([Mac App Store](https://apps.apple.com/us/app/capcut-video-editor/id1500855883?platform=mac&see-all=reviews), year not shown) | Favourites and recents in every library; a public feedback board |

---

## CapCut

**In one line:** the fastest route from raw clips to a trend video, with near-pro desktop tools. But paid items sit
in the free library and block export, billing and support anger users (Trustpilot 1.2), and every AI feature runs in
the cloud on credits.

### Price in 2026 and where the free line falls

| Plan | Monthly | Yearly | Adds | Source |
|---|---|---|---|---|
| Free | $0 | $0 | "Free templates to start fast", "Basic editing tools"; no AI credits or storage listed | [pricing](https://www.capcut.com/pricing), fetched 2026-11-17 |
| Standard (phone only) | $9.99 in iOS | — | "primarily designed for app (mobile) use"; the desktop app needs Pro | [help](https://www.capcut.com/help/valid-devices-for-standard-subscription), 2026-04-08 |
| Pro | $19.99 | $179.99 | 1,200 AI credits a month, 1 TB storage, all premium templates and Pro features | pricing |
| Ultra | $79 | $900 | 8,645 AI credits a month, "exclusive AI features" | pricing |
| Teams | from $12.49 per seat | from $107.50 per seat | Pro per seat, plus a brand kit | pricing |

- **Trial:** Pro has a 7-day trial with no card, and "availability varies by region" (pricing FAQ). The desktop app
  can't take payment: "Join" opens the web checkout ([help](https://www.capcut.com/help/join-capcut-pro-for-exporting), 2026-04-02).
- **AI video costs extra on top:** Seedance 2.5 from $0.12 a second on Pro (pricing page).
- **Regional prices:** Hong Kong yearly HK$388 → HK$988 from 2026-02-21 ([unwire.hk](https://unwire.hk/2026/01/24/capcut-subscription-price-increase-hk988/software/), 2026-01-24);
  UK £21.99 a month or £199.99 a year ([marcandrews.com](https://marcandrews.com/capcut-pro-price-uk-2026-plans-costs-best-deals/), July 2026, *snippet*).
- **The free line on desktop:**
  - 4K and 60 fps are greyed out.
  - Any Pro-tagged item blocks export with "CapCut Pro is required to export this video" ([help](https://www.capcut.com/help/why-prompted-to-purchase-capcut-pro), 2026-04-02).
  - Free users can *use* Pro items while editing: "only exporting the video requires an upgrade" ([CapCut Pro PC](https://www.capcut.com/resource/capcut-pro-pc), 2026-08-27).
  - Whether free gets 2K: *unverified*.
- **The free line on phone and web:**
  - Phone: 1080p or no watermark may trigger "Watermark-free export requires CapCut Pro"; exports over 15 minutes need Pro, with the limit varying by region; declining exports with a watermark.
  - Web: 4K, 60 fps and "No Watermark" need Pro ([help](https://www.capcut.com/help/export-videos-in-capcut), 2026-01-14).
- **Pro on PC, by CapCut's own list:** AI video maker, AI video, AI avatar, text-to-speech, auto captions, auto
  background removal, retouch, normalize loudness, enhance voice, video translator, reduce noise, separate audio ([CapCut Pro PC](https://www.capcut.com/resource/capcut-pro-pc), 2026-08-27).
- **Third parties disagree on free allowances:** free auto captions "up to 10 minutes per video" ([vidpros](https://vidpros.com/capcut-pro-vs-free/), 2026-05-22),
  against auto captions "now requires a Pro subscription" ([Descript](https://www.descript.com/blog/article/capcut-captions-arent-free-anymore-heres-a-better-option), 2026-07-29, a competitor).

### UI layout

- **Desktop:**
  - Home screen: Create project, Import, My presets, and the list of projects ([tutorial](https://www.capcut.com/resource/capcut-tutorial-for-beginners), 2026-08-20).
  - Editor: the asset panel top left (Media, Audio, Text, Stickers, Effects, Transitions, Captions, Filters, Adjustment, Templates, AI media); the Player top centre; a details panel on the right that changes with the selection (for example Video › Basic for aspect ratio and auto reframe); the multi-track timeline at the bottom; Export top right ([how-to on PC](https://www.capcut.com/resource/how-to-use-capcut-on-pc), 2026-10-10).
  - Panels move between versions: "some tools, buttons, or menus have been moved" ([help](https://www.capcut.com/help/capcut-ui-update-changes), 2026-01-07).
- **Web:** a left material panel (Media, Templates, Elements, Audio, Text, Captions, Transcript; *unverified*); rendering happens in the cloud, and Chrome works best ([help](https://www.capcut.com/help/export-videos-in-capcut)).
- **Phone:** a big "New Video" button; the preview above the timeline; a scrolling tool bar along the bottom; Export top right ([Storyblocks](https://www.storyblocks.com/resources/tutorials/how-to-use-capcut), 2026-08-17). iPad has its own app with a different feature set ([help index](https://www.capcut.com/help)).

### First run, install to first export (desktop)

1. **Download** `CapCut_Setup.exe` (about 200 MB) or the Mac DMG, or get it from the Microsoft Store or Mac App Store ([Windows guide](https://www.capcut.com/resource/capcut-for-windows), 2026-11-12).
   Requirements: Windows 10 64-bit or macOS 12+ ([help](https://www.capcut.com/help/export-videos-in-capcut)); CapCut's own product page still says Windows 7 and macOS 10.14 ([desktop page](https://www.capcut.com/tools/desktop-video-editor)).
2. **Sign in** with Google, TikTok or Facebook, or scan a QR code from the phone app ([help](https://www.capcut.com/help/log-in-to-capcut), 2025-12-23).
3. **Create project**, then Import or drag files in. A Record option captures the screen and webcam.
4. **Edit:** drag clips to the timeline, split at the playhead, and add text, effects, captions and music from the top-left tabs. Pro items carry a diamond badge but can still be used.
5. **Export** (top right): resolution, bitrate, codec, format, frame rate. 4K and 60 fps are locked.
6. **If any Pro item is in the project:** "CapCut Pro is required to export this video". Join opens the browser; the alternative is removing the items, and one user says "IT PUTS THEM ALL BACK" ([Trustpilot](https://www.trustpilot.com/review/capcut.com), 2026-10-31).
7. **Save** the file, or share it straight to TikTok or YouTube.

**On the phone:** an onboarding questionnaire and a photo-access request come first; template exports carry a
watermark "unless you export directly to TikTok or use a paid plan" (Storyblocks, 2026-08-17); and the app shows ads.

### Workflows (desktop unless noted)

| Group | Feature | Status | Notes | Official link |
|---|---|---|---|---|
| Import and media | Import, stock library, screen and webcam recorder | Free; some stock Pro | Whole screen, one app, or an area | [how-to](https://www.capcut.com/resource/how-to-use-capcut-on-pc), [recorder](https://www.capcut.com/resource/computer-screen-recording-software) |
| Timeline | Multi-track, split, speed, keyframes with graphs, multicam | Free; multicam tier *unverified* | Multicam syncs by audio or marker | [desktop AI](https://www.capcut.com/tools/desktop-ai-power), [multicam](https://www.capcut.com/resource/multicam-editing) |
| Text and captions | Text, text templates, auto captions, caption templates, translation, SRT | Partial: auto captions and translator Pro; SRT export paid | Brand names mistranscribed ([eesel](https://www.eesel.ai/blog/capcut-reviews), 2026) | [captions](https://www.capcut.com/tools/add-subtitles-to-video), [caption templates](https://www.capcut.com/resource/caption-template) |
| Templates, effects, filters, transitions, stickers | Large libraries | Free plus Pro-tagged | Pro-tagged items block export | [tutorial](https://www.capcut.com/resource/capcut-tutorial-for-beginners) |
| Green screen and cutout | Chroma key; auto background removal | Chroma free; auto removal Pro | | [background remover](https://www.capcut.com/tools/video-background-remover) |
| Colour | Colour wheels, LUTs, auto adjust | Free (*unverified* per tool) | | [desktop AI](https://www.capcut.com/tools/desktop-ai-power) |
| Audio | Music, sound effects, voice changer, Auto Beat | Free plus Pro items | | [how-to](https://www.capcut.com/resource/how-to-use-capcut-on-pc) |
| AI audio | Reduce noise, enhance voice, separate audio, normalize loudness, text-to-speech | Pro | Auto ducking documented only on phones | [noise](https://www.capcut.com/tools/remove-background-noise-from-audio), [voice](https://www.capcut.com/tools/voice-enhancer), [TTS](https://www.capcut.com/tools/text-to-speech), [ducking](https://www.capcut.com/create/audio-ducking-for-clear-dialogue-in-video) |
| AI editing | EditPilot (edits from plain-English requests, PC only), filler-word removal, script to video, long video to shorts | Tier *unverified*; credits likely | | [EditPilot](https://www.capcut.com/tools/edit-pilot), [fillers](https://www.capcut.com/tools/filler-words), [script](https://www.capcut.com/tools/script-to-video-maker) |
| AI generation | Text or image to video (Seedance, Veo 3.1, Sora 2), AI avatar, enhance | Pro plus credits | Priced per second | [AI video](https://www.capcut.com/tools/ai-video-generator), [enhancer](https://www.capcut.com/tools/ai-video-enhancer) |
| Reframing | Aspect ratio; auto reframe | Ratio free; auto reframe Pro *unverified* | Under Video › Basic | [how-to](https://www.capcut.com/resource/how-to-use-capcut-on-pc) |
| Export | 1080p 30 fps free; 4K, 60 fps, HDR Pro; MP4, MOV; GIF 240–640p | Partial | No ProRes found | [export](https://www.capcut.com/help/export-videos-in-capcut), [no 4K option](https://www.capcut.com/help/no-2k-or-4k-option-for-export) |
| Sharing | Straight to TikTok and YouTube | Free | | [tutorial](https://www.capcut.com/resource/capcut-tutorial-for-beginners) |
| Projects and cloud | CapCut Space sync, Teams, brand kit | Pro 1 TB; brand kit Teams only | Free storage unpublished | [pricing](https://www.capcut.com/pricing) |

### Strengths, gaps, weaknesses

- **Strengths:**
  - Templates, captions, effects, a sound library and TikTok sharing: the shortest path to a social video.
  - One account and cloud projects across phone, web and desktop.
  - Near-pro desktop tools: keyframe graphs, colour wheels, LUTs, multicam, a recorder, EditPilot.
  - Free desktop export at 1080p with no watermark when no Pro item is used.
- **Gaps:**
  - No Linux ([petition](https://www.change.org/p/bytedance-make-capcut-available-for-linux-capcutforlinux)), and no ProRes (*unverified*).
  - No auto ducking on desktop.
  - 4K, 60 fps and HDR are paid.
  - No AI on the computer or offline.
  - Project import from Premiere only.
- **Weaknesses:**
  - Paid items mixed into free libraries with a paywall at export; users call it bait.
  - Unwanted renewals, hard cancelling, draining credits, weak support.
  - Forced updates ("older versions may be disabled", [help](https://www.capcut.com/help/being-forced-to-update-capcut), 2025-12-25) and a layout that moves.
  - Sign-in effectively required; users' content licensed to ByteDance.
  - Crashes and lost projects reported.

### What users say

- **Good**
  - "Easy to use, effective, free" ([Trustpilot](https://www.trustpilot.com/review/capcut.com?stars=5), 2026-11-04)
  - "Love their templates and all the features, including ai generated captions, remove background items etc." (Trustpilot, 2026-06-30)
  - "It is fully a beginner designed app but works so well it can still be used for professional projects." ([Mac App Store](https://apps.apple.com/us/app/capcut-video-editor/id1500855883?platform=mac&see-all=reviews), Jun 15, year not shown)
  - "CapCut is very cost effective and has all the features, if not more" (Mac App Store, 2025-12-03)
  - "CapCut Pro is an excellent tool and is worth every cent." (Trustpilot, 2025-11-14)
- **Meh**
  - "I don't think the subscription is worth it nowdays with all the free options available on the market." ([Trustpilot 3★](https://www.trustpilot.com/review/capcut.com?stars=3), 2026-09-16)
  - "most of the features are PRO only and the price for pro is not that cheap too." (Trustpilot 3★, 2026-05-03)
  - "The credit issue is resolved, but it took repeated follow-ups to get there," (Trustpilot 3★, 2026-10-19)
  - "The multi-layer video track editor works smoothly on my tablet" (Trustpilot 3★, 2026-06-03)
- **Bad**
  - "PROMOTES ITS FREE UNTIL YOU TRY TO EXPORT VIDEO THEN YOU HAVE TO PAY A SUBSCRIPTION" ([Trustpilot](https://www.trustpilot.com/review/capcut.com), 2026-11-17)
  - "Charged me for a pro subscription that I didn't ask for." (Trustpilot, 2026-11-01)
  - "CapCut repeatedly deducts my paid credits when I simply open the app" (Trustpilot, 2026-11-01)
  - "Lost content, 15 hours in fact." ([Trustpilot](https://www.trustpilot.com/review/capcut.com?page=2), 2026-10-29)
  - "The desktop version keeps crashing whenever I try to export a video longer than five minutes." (Trustpilot 3★, 2026-05-14)
  - "Until they stop locking basic features behind a paywall, I cannot recommend it." (Mac App Store, Nov 9, year not shown)
  - "putting the most basic features such as sound extracting behind a paywall is straight up rude." (Google Play, via [unstar.app](https://unstar.app/blog/capcut-everything-is-pro-now-cant-export-reviews-2026), sample 2026-07-21 to 09-14)
  - "the export feature started showing a message saying I only had 4 free exports per week." ([Sikayetvar](https://www.sikayetvar.com/en/capcut-us/capcut-now-forces-me-to-upgrade-to-pro-just-to-export-videos-after-4-months-free), 2025-05-03)
- **One sample's proportions:** in 900 Google Play reviews about Pro (2026-07-21 to 09-14), 234 say "locked", 70 say export was blocked, 68 say it "used to be free", 97 mention ads and 54 the watermark ([unstar.app](https://unstar.app/blog/capcut-everything-is-pro-now-cant-export-reviews-2026), 2026-09-15).

---

## Microsoft Clipchamp

**In one line:** the easiest free editor on Windows, preinstalled on Windows 11, with free 1080p, no watermark and
free AI basics. But it needs a Microsoft account and an internet connection, has kept projects in OneDrive since
March 2026, caps exports at 30 fps in MP4, lacks keyframes and reverse, and no longer has a phone app.

### Price in 2026 and where the free line falls

| Plan | Price (US) | Gets | Source |
|---|---|---|---|
| Free | $0 | Exports up to 1080p, no watermark; free stock, filters and effects; trim, crop, rotate, resize; screen, camera and voice recorder; animated text; AI subtitles, voiceovers and silence removal; audio-only export; 5 GB cloud storage | [pricing](https://clipchamp.com/en-us/pricing/), [cloud FAQ](https://support.microsoft.com/en-us/clipchamp/clipchamp-cloud-storage-frequently-asked-questions), fetched 2026-11-17 |
| Premium via Microsoft 365 Personal | $9.99/mo or $99.99/yr ($6.99 first month, $69.99 first year) | 4K export, premium stock, filters and effects, a one-brand brand kit, 1 TB OneDrive | [Microsoft 365](https://www.microsoft.com/en-us/microsoft-365/buy/compare-all-microsoft-365-products), fetched 2026-11-17 |
| Microsoft 365 Family | $12.99/mo or $129.99/yr | The same for up to 6 people | same |
| Microsoft 365 Premium | $19.99/mo or $199.99/yr | Includes Clipchamp premium ([Microsoft](https://support.microsoft.com/en-us/topic/what-clipchamp-products-are-there-and-what-s-their-cost-e0e28eb8-cca3-445c-aefb-ed0dd0bbfa1f)) | same |
| Standalone Premium | No price on clipchamp.com; a third party gives $11.99/mo (*unverified*) | Existing subscribers are encouraged to move to Microsoft 365 | [paid plans](https://support.microsoft.com/en-us/clipchamp/what-are-the-clipchamp-paid-plans-and-how-do-they-work) |

- **The free line is export resolution plus premium assets.**
  - 1080p is free, 4K is paid.
  - No watermark is ever added. A premium item in a free project blocks the export instead: "no watermark gets added but you will not be able to export and save your video" ([watermark FAQ](https://support.microsoft.com/en-us/Clipchamp/does-clipchamp-add-a-watermark-to-videos)).
- **Microsoft's own pages disagree** on whether project cloud backup is free (pricing page) or Premium (the [comparison](https://support.microsoft.com/en-us/clipchamp/feature-comparison-between-clipchamp-for-work-and-personal-versions) page).
- **Work version (Microsoft 365 business and education):**
  - Its "Standard" tier includes 4K and a brand kit; a Copilot licence adds AI video creation.
  - It has no motion titles, no templates and no YouTube or TikTok export.
  - It adds SharePoint, shared projects and live webcam backgrounds (same comparison page).

### UI layout

- **Left:** a collapsible toolbar: Your media · Record & create · Content library (music, sound effects, stickers,
  video, images, backgrounds, overlays, GIFs) · Templates · Text · Transitions · Brand kit ([blog](https://clipchamp.com/en/blog/how-to-navigate-video-editing-tools/), 2025-04-16).
- **Centre:** the preview, with a floating toolbar ([blog](https://clipchamp.com/en/blog/floating-toolbar-property-panel-clipchamp), 2025-04-16).
  - Nothing selected: Size (aspect presets), background colour, AI captions.
  - Clip selected: crop, order, fit/fill, rotate, flip, picture-in-picture.
- **Right:** a property panel (AI captions, Audio, Fade, Filters, Effects, Adjust colors, Speed).
- **Bottom:** the timeline ([help](https://support.microsoft.com/en-us/Clipchamp/how-to-work-with-the-timeline-in-clipchamp)). Export sits top right; light and dark themes.

### First run, install to first export

1. **Get it.** Preinstalled on Windows 11; Windows 10 gets it from the Microsoft Store. Mac, Linux and ChromeOS use
   the web editor in Edge or Chrome; mobile browsers aren't supported ([devices](https://support.microsoft.com/en-us/Clipchamp/which-devices-does-clipchamp-work-on)).
   It needs 8 GB RAM, with 16 GB better ([requirements](https://support.microsoft.com/en-US/Clipchamp/make-sure-clipchamp-works-well-for-you)).
2. **Sign in with a Microsoft account; you can't skip it** ([start help](https://support.microsoft.com/en-us/Clipchamp/how-to-start-editing-a-new-video)).
   Google and email sign-in "aren't available in the Windows app" ([changes](https://support.microsoft.com/en-us/Clipchamp/changes-to-accessing-clipchamp-through-its-windows-app)).
3. **Projects go to OneDrive:** "Projects must be saved to OneDrive to stay editable"; media can stay local ([Windows Latest](https://www.windowslatest.com/2026/03/18/microsoft-forces-onedrive-on-clipchamp-windows-11s-built-in-video-editor), 2026-03-18).
4. **Home:** Create a new video, or Create a video with AI (auto compose).
5. **Import:** drag files in, or pull from OneDrive, Google Drive, Dropbox or Xbox. Keep the originals, because
   Clipchamp may later ask you to "Locate" them ([help](https://support.microsoft.com/en-us/Clipchamp/why-do-i-need-to-locate-my-files)).
6. **Edit:** drag media to the timeline, trim by dragging edges, split at the playhead, add text, stock and effects
   ([edit help](https://support.microsoft.com/en-us/Clipchamp/how-to-edit-a-video-in-clipchamp)). Diamonds mark premium items.
7. **Export:** 480p, 720p or 1080p (4K has a diamond); MP4 at 30 fps, or a GIF for clips of 15 seconds or less. A
   premium item blocks the export. The file goes to Downloads, or straight to OneDrive, Google Drive, YouTube, TikTok,
   Dropbox or LinkedIn ([export help](https://support.microsoft.com/en-us/Clipchamp/exporting-and-saving-a-video-in-clipchamp)).

### Workflows

Help links are on support.microsoft.com unless noted; all fetched 2026-11-17 or listed in the
[features index](https://support.microsoft.com/en-us/Clipchamp/video-editing-features).

| Group | Feature | Status | Notes | Link |
|---|---|---|---|---|
| Import and media | Local, OneDrive, Google Drive, Dropbox, Xbox | Free | 4K import on every tier | [4K](https://support.microsoft.com/en-us/Clipchamp/4k-video-support-in-clipchamp) |
| Import and media | Screen, webcam and voice recorders | Free | Windows 11 widget to start recording (2026-02-12) | [record](https://support.microsoft.com/en-us/Clipchamp/record-video) |
| Timeline | Multi-track, split, trim, gap removal, grouping | Free | | [split](https://support.microsoft.com/en-us/Clipchamp/how-to-split-or-cut-videos-and-audio-assets), [gaps](https://support.microsoft.com/en-us/Clipchamp/how-to-remove-gaps-on-the-timeline), [group](https://support.microsoft.com/en-us/Clipchamp/how-to-group-assets-on-the-timeline) |
| Timeline | Speed 0.1–16× | Free | Constant only; no curves | [speed](https://support.microsoft.com/en-us/Clipchamp/how-to-speed-up-or-slow-down-a-video) |
| Timeline | Reverse; freeze frame | Absent; unclear | Third-party guides only | [MiniTool](https://moviemaker.minitool.com/news/clipchamp-reverse-video.html), [Windows Report](https://windowsreport.com/clipchamp-how-to-freeze-frame/) |
| Timeline | Edit by transcript | Free (*unverified* tier) | Added 2025 | [Insider blog](https://techcommunity.microsoft.com/t5/microsoft-365-insider-blog/microsoft-clipchamp-a-year-in-review-cohesive-ai-powered-video/ba-p/4474506), 2026-01-16 |
| Visual | Crop (freehand), rotate, flip, picture-in-picture, backgrounds | Free | | [crop](https://support.microsoft.com/en-us/Clipchamp/how-to-crop-videos-or-images-in-clipchamp), [PiP](https://support.microsoft.com/en-us/Clipchamp/how-to-use-picture-in-picture) |
| Visual | Masks, motion tracking, multicam | Absent (*unverified*) | Named as limits by reviewers | [aiarty](https://www.aiarty.com/edit-video/clipchamp-review.htm) |
| Text | Titles, animated titles, custom fonts | Free | In/out animations generally available July 2026 | [text](https://support.microsoft.com/en-us/Clipchamp/how-to-add-text-and-titles-to-a-video), [RM564968](https://mc.merill.net/message/RM564968) |
| Captions | AI auto captions | Free | Azure, cloud; one language per video; SRT download | [captions](https://support.microsoft.com/en-us/Clipchamp/how-to-use-autocaptions-in-clipchamp) |
| Templates, effects, filters, transitions, stickers | Libraries; GIPHY; ASL stickers | Free plus premium | | [filters](https://support.microsoft.com/en-us/Clipchamp/how-to-add-filters-to-a-video), [transitions](https://support.microsoft.com/en-us/Clipchamp/how-to-add-transitions-and-fades-to-videos) |
| Keyframes | Custom keyframes | Absent | Requested; not planned | [Q&A](https://learn.microsoft.com/en-us/answers/questions/5522382/add-custom-image-animation-feature-to-clipchamp) |
| Background | Chroma key (green, blue, red) | Free | | [green screen](https://support.microsoft.com/en-us/Clipchamp/how-to-use-the-green-screen-effect-in-clipchamp) |
| Background | AI background removal | Images only, free | No video | [image background](https://support.microsoft.com/en-us/Clipchamp/how-to-remove-background-from-your-photos-and-images) |
| Colour | Brightness, contrast, saturation | Free | No LUTs (*unverified*) | [colour](https://support.microsoft.com/en-us/Clipchamp/how-to-change-the-color-of-a-video) |
| Audio | Music and sound effects | Free plus premium | | [pricing](https://clipchamp.com/en-us/pricing/) |
| Audio | Noise suppression; silence removal; text-to-speech | Free | Noise needs audio detached first; TTS in Azure | [noise](https://support.microsoft.com/en-us/Clipchamp/how-to-use-noise-suppression), [silence](https://support.microsoft.com/en-us/Clipchamp/how-to-use-silence-removal), [TTS](https://support.microsoft.com/en-us/Clipchamp/how-to-use-the-text-to-speech-feature) |
| Audio | Speaker coach | Retired 2025-12-01 | | [speaker coach](https://support.microsoft.com/en-us/Clipchamp/how-to-use-speaker-coach) |
| AI | Auto compose (a draft from your clips) | Free, personal only | Runs in the browser; files stay local | [auto compose](https://support.microsoft.com/en-us/Clipchamp/how-to-use-video-auto-composition) |
| AI | Video upscaler | Windows app only | On the device's CPU or NPU, up to 4K | [upscale](https://support.microsoft.com/en-us/Clipchamp/how-to-upscale-videos-with-video-super-resolution) |
| AI | Copilot "Create a video"; Sora 2 | Work accounts only | Assembles stock; "There is no generation of pixels" | [Copilot](https://support.microsoft.com/en-us/Clipchamp/how-to-create-video-with-copilot) |
| Aspect | 16:9, 9:16, 1:1 presets; fit or fill | Free | No auto reframe | [aspect](https://support.microsoft.com/en-us/Clipchamp/how-to-change-the-aspect-ratio-of-a-video) |
| Export | 480p–1080p MP4 30 fps; GIF ≤15 s; audio only | Free | No bitrate control | [export](https://support.microsoft.com/en-us/Clipchamp/exporting-and-saving-a-video-in-clipchamp) |
| Export | 4K (70 Mbps) | Paid | | [4K](https://support.microsoft.com/en-us/Clipchamp/4k-video-support-in-clipchamp) |
| Sharing | YouTube, TikTok, OneDrive, Google Drive, Dropbox, LinkedIn | Free, personal only | | [YouTube](https://support.microsoft.com/en-us/Clipchamp/how-to-upload-a-video-directly-to-youtube-from-clipchamp) |
| Projects | OneDrive; 5 GB free, 1 TB with Microsoft 365; brand kit paid | Required since March 2026 | | [cloud FAQ](https://support.microsoft.com/en-us/clipchamp/clipchamp-cloud-storage-frequently-asked-questions), [brand kit](https://support.microsoft.com/en-us/Clipchamp/how-to-use-the-brand-kit-tool-in-clipchamp) |

### Strengths, gaps, weaknesses

- **Strengths:**
  - Preinstalled on Windows 11, and runs in a browser elsewhere.
  - Truly free 1080p with no watermark, plus free captions, text-to-speech, silence removal, noise suppression and auto compose.
  - A simple, predictable layout with good accessibility (screen reader, shortcuts, ASL stickers).
  - Media stays on the computer by default: "your files always stay on your computer" ([help](https://support.microsoft.com/en-us/Clipchamp/why-do-i-need-to-locate-my-files)).
- **Gaps:**
  - No native Mac or Linux app, and no offline use.
  - 30 fps, MP4 only, 4K paid.
  - Missing: keyframes, speed curves, reverse, masks, tracking, multicam, LUTs, video background removal, auto
    reframe, voice effects, beat sync, stem separation, long-to-shorts.
  - No generative video for personal users.
  - No mobile: iOS retired 2026-06-09, and Android "will never happen" ([Windows Central](https://www.windowscentral.com/software-apps/clipchamp-is-going-backward-microsoft-will-retire-ios-app-instead-of-making-an-android-one), Apr 2026).
- **Weaknesses:**
  - Lock-in: a Microsoft account, plus OneDrive with a 5 GB free cap.
  - Lost projects, sync failures, freezes, slow exports.
  - Captions and text-to-speech go to Azure.
  - Microsoft keeps removing things: speaker coach, the iOS app, Google sign-in, local projects.

### What users say

- **Good**
  - "Super easy to use. I'm a 55 year old woman with only moderate computer experience." ([Trustpilot](https://www.trustpilot.com/review/clipchamp.com), 2026-10-27)
  - "Absolutely brilliant app to edit my videos for social media - no need for Capcut subscriptions!" (Trustpilot, 2026-11-17)
  - "Handles large files that other apps struggle." (Trustpilot, 2026-11-14)
  - "it was easier to use then capcut" ([Trustpilot 3★](https://www.trustpilot.com/review/clipchamp.com?stars=3), 2026-07-08)
- **Meh**
  - "It's good for editing videos that are simple and not complex in edits." (Trustpilot 4★, 2026-11-16)
  - "the library of music and sound effects changes and you don't know which will be removed and when." (Trustpilot 4★, 2026-11-14)
  - "its legit but it takes alot of time to load items" (Trustpilot 3★, 2026-10-29)
  - "It someties takes too long to export videos" (Trustpilot 3★, 2026-06-21)
- **Bad**
  - "Clipchamp LOST all my files" ([Trustpilot 2★](https://www.trustpilot.com/review/clipchamp.com?stars=2), 2026-06-29)
  - "When OneDrive doesn't sync, the program doesn't work." (Trustpilot 2★, 2026-01-05)
  - "When I came back, my project was gone." ([Trustpilot 1★](https://www.trustpilot.com/review/clipchamp.com?stars=1), 2026-08-18)
  - "All the projects I ever worked on are gone." ([Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5820384/all-clipchamp-projects-are-gone-from-ddesktop-app), 2026-03-13)
  - "This app is painfully slow, constantly struggles with basic editing" (Trustpilot 1★, 2026-11-08)
  - "it freezes if it detects you are not connected." (Trustpilot 1★, 2026-07-05)
  - "now the Transitions panel doesn't load" ([Tech Community](https://techcommunity.microsoft.com/discussions/microsoft-clipchamp-discussions/clipchamp-app-not-functioning-properly-%E2%80%94-transitions-panel-blank--frequent-crash/4488457), 2026-01-23)

---

## Apple iMovie

**In one line:** free, offline and simple for home movies on Apple devices, but frozen. No features since 2023, no
captions or AI, two video tracks, 4K only at 30 fps on the Mac, and Apple now points anyone who outgrows it to paid
Final Cut Pro.

### Price in 2026 and where the free line falls

- **Free, with no in-app purchases and no watermark** ([Mac App Store](https://apps.apple.com/us/app/imovie/id408981434?mt=12), [iOS App Store](https://apps.apple.com/us/app/imovie/id377298193), fetched 2026-11-17).
- **The free line is the device, not money.** Mac needs macOS 26.6+, 4 GB of memory and a 3.6 GB download;
  iPhone and iPad need iOS 27; there's no Windows, Android, Linux or web version ([freealternatives.to](https://freealternatives.to/imovie/review), Jul 2026).
- **Export limits:**
  - Mac exports 4K at 30 fps, and 60 fps only as 1080p60; the first clip sets the project's resolution and frame rate ([Apple 102276](https://support.apple.com/en-us/102276), 2026-05-27).
  - Mac converts 4K60 HDR iPhone footage to "30 fps, SDR" ([Apple Community](https://discussions.apple.com/thread/256086103), 2025-06-23).
  - iPhone and iPad export 4K60 with an HDR toggle; sharing by Mail or Messages is fixed at 360p ([iPhone guide](https://support.apple.com/guide/imovie-iphone/share-your-movie-as-video-file-kna4501dba9/ios)).
- **Barely updated.**
  - Mac 10.4.4 (2026-01-28, fixes only); Mac 10.4.5 (2026-09-29), which only adds editing of Cinematic-mode video from Final Cut Camera and needs macOS 27 ([TidBITS](https://tidbits.com/watchlist/imovie-10-4-5/), 2026-10-02).
  - iOS 3.0.6 ("Oct 22", year not shown, 2026 inferred), fixes only.
  - The press calls it neglected ([9to5Mac](https://9to5mac.com/2025/10/11/rip-clips-apple-abandons-its-quirky-short-form-video-app/), 2025-10-11; [Six Colors](https://sixcolors.com/post/2025/10/creative-neglect-what-about-the-apps-in-apple/), 2025-10-23). Apple discontinued Clips in October 2025 ([MacRumors](https://www.macrumors.com/2025/10/11/apples-clips-app-discontinued/)).
- **What Apple sells above it:**
  - Final Cut Pro at $299.99, or Apple Creator Studio at $12.99/mo or $129/yr (students $2.99/mo), which bundles
    Final Cut Pro, Logic Pro, Pixelmator Pro, Motion, Compressor and MainStage ([apple.com](https://www.apple.com/apple-creator-studio/), fetched 2026-11-17; [MacRumors](https://macrumors.com/2026/01/28/apple-creator-studio-hands-on), 2026-01-28).
  - Final Cut Pro has the AI iMovie lacks: automatic captions, Magnetic Mask (background removal), Beat Detection, Transcript Search ([apple.com](https://www.apple.com/final-cut-pro/)).
  - iMovie has File › Send Movie To Final Cut Pro ([guide](https://support.apple.com/guide/imovie/send-projects-to-final-cut-pro-movcbf7e2a3f/mac)).
  - **Our reading:** a Mac beginner who outgrows iMovie meets a $12.99 a month or $299.99 wall. That's our opening.

### UI layout (Mac)

- **Projects view first:** a grid of projects with Create New ([guide](https://support.apple.com/guide/imovie/the-first-time-you-open-imovie-mov755717b21/mac)).
- **Editor:** "browser in upper left, viewer in upper right, and timeline at bottom" ([guide](https://support.apple.com/guide/imovie/what-is-imovie-mov5ec96da08/mac)).
  - A Libraries sidebar (events, Photos library) sits left of the browser.
  - Tabs above the browser: My Media, Audio & Video, Titles, Backgrounds, Transitions.
  - Adjustment buttons above the viewer: colour, crop, stabilisation, volume, noise and EQ, speed, clip filter and audio effects.
- **Timeline:** magnetic, with a main storyline, connected clips above it and a background-music well ([Apple 101664](https://support.apple.com/101664), 2023-10-11).
- **Barely customisable:** only the viewer/timeline border moves ([guide](https://support.apple.com/guide/imovie/change-the-window-layout-movcab8cb6ef/mac)).
- **iPhone and iPad:** pick Magic Movie (automatic), Storyboard (20 guided templates with shot lists) or Movie
  (timeline) ([iPhone guide](https://support.apple.com/guide/imovie-iphone/welcome/ios)).

### First run, install to first export (Mac)

1. Free from the Mac App Store (3.6 GB). Preinstalled on new Macs: *unverified*.
2. It opens in Projects view → **Create New › Movie** (or Trailer) ([guide](https://support.apple.com/guide/imovie/create-a-new-movie-project-move6ccb3330/mac)).
3. **Media:** the Photos library in the sidebar, drag from Finder, or Import › device › "Import to" an event ([guide](https://support.apple.com/guide/imovie/import-media-from-your-mac-mov6fa10197d/mac)).
4. **Drag clips to the timeline.** The first clip fixes the resolution and frame rate.
5. **Edit:** trim, split, titles, transitions, audio, adjustments.
6. **Name the project** when you go back to Projects view.
7. **Share › File:** format, resolution, quality (including ProRes) → Next → save ([guide](https://support.apple.com/guide/imovie/export-a-movie-trailer-or-clip-as-a-file-move6e0cb2ad/mac)).
   "Share to social platforms" only prepares a file to upload by hand ([guide](https://support.apple.com/guide/imovie/share-to-social-platforms-move0470816c/mac)).

There's no sign-in and no cloud step at any point.

### Workflows

| Group | Feature | Status | Notes | Link |
|---|---|---|---|---|
| Import | Photos library, Finder, cameras, iPhone | Free | Media goes into events in a library | [import](https://support.apple.com/guide/imovie/import-media-from-your-mac-mov6fa10197d/mac) |
| Import | FaceTime camera recording | Free | No screen recording | [record](https://support.apple.com/guide/imovie/record-video-into-imovie-movc665d799a/mac) |
| Import | Stock | Partial | Backgrounds, maps, sound effects, jingles; no stock video | [maps and backgrounds](https://support.apple.com/guide/imovie/add-maps-and-backgrounds-mov06651529f/mac) |
| Timeline | Trim, split, move | Free | Magnetic | [trim](https://support.apple.com/guide/imovie/trim-clips-movf8b8fc9b2/mac), [split](https://support.apple.com/guide/imovie/move-and-split-clips-mov16b2ea79a/mac) |
| Timeline | Tracks | Partial | "Two video tracks is the max" ([Apple Community](https://discussions.apple.com/thread/253049078), 2021) | |
| Timeline | Speed, reverse, keep pitch, freeze frame, instant replay | Free | No curves | [speed](https://support.apple.com/guide/imovie/change-clip-speed-mov6c442b2eb/mac), [freeze](https://support.apple.com/guide/imovie/add-freeze-frames-mov772ab4a71/mac) |
| Timeline | Crop, rotate, Ken Burns, stabilise | Free | | [crop](https://support.apple.com/guide/imovie/crop-clips-mova56757e7e/mac), [stabilise](https://support.apple.com/guide/imovie/stabilize-shaky-clips-mov52b5a78a6/mac) |
| Text | Titles | Free | Style presets; position and duration only; no captions | [titles](https://support.apple.com/guide/imovie/add-titles-mov4d3dce7ba/mac) |
| Templates | 29 trailers; themes | Free | A trailer converts to a movie | [trailer](https://support.apple.com/guide/imovie/create-a-new-trailer-project-mov6e14403f2/mac), [themes](https://support.apple.com/guide/imovie/add-or-change-a-movie-theme-mov978c5af3a/mac) |
| Templates (iOS) | Magic Movie, 20 storyboards | Free | Opens on Mac since 10.3.6 | [Magic Movie](https://support.apple.com/guide/imovie-iphone/create-a-magic-movie-project-kna6ccbb607f/ios), [storyboard](https://support.apple.com/guide/imovie-iphone/create-a-storyboard-project-knad42dc8b8/ios) |
| Effects and transitions | Clip filters; transitions | Free | 48 video and audio effects | [effects](https://support.apple.com/guide/imovie/add-video-effects-movd17f56aaa/mac), [transitions](https://support.apple.com/guide/imovie/add-transitions-movcaedc4dbd/mac) |
| Compositing | Green screen, picture-in-picture, split screen, cutaway | Free | One overlay at a time | [green screen](https://support.apple.com/guide/imovie/create-a-green-screen-effect-mov82da1338a/mac), [PiP](https://support.apple.com/guide/imovie/create-a-picture-in-picture-effect-mova1aaa682b/mac) |
| Colour | Auto, match colour, white balance, skin tone | Free | No LUTs | [colour](https://support.apple.com/guide/imovie/adjust-a-clips-color-movf2a3f0f42/mac) |
| Audio | Sound effects, jingles, Music library; voiceover; volume keyframes | Free | iOS has 130+ soundtracks that fit the length | [audio](https://support.apple.com/guide/imovie/add-music-and-sound-clips-mov91a895a64/mac), [voiceover](https://support.apple.com/guide/imovie/record-a-voiceover-mov44e3a4427/mac) |
| Audio | Noise reduction, EQ, ducking, audio effects | Free | | [enhance](https://support.apple.com/guide/imovie/correct-and-enhance-audio-mov86277afbd/mac), [audio effects](https://support.apple.com/guide/imovie/add-audio-effects-mov84788882d/mac) |
| AI | Captions, TTS, background removal, generation | None | Some of it in Final Cut Pro, paid | |
| Export | Up to 4K30 or 1080p60; ProRes; audio only; still image | Free | | [export](https://support.apple.com/guide/imovie/export-a-movie-trailer-or-clip-as-a-file-move6e0cb2ad/mac) |
| Projects | Library on disk; iOS projects in; send to Final Cut Pro | Free | No cloud sync | [iOS export](https://support.apple.com/guide/imovie-iphone/export-projects-knaf0c276dc0/ios) |

### Strengths, gaps, weaknesses

- **Strengths:**
  - Free, no watermark, no account, offline; files stay local.
  - Trailers make home video look polished in minutes.
  - Tight links to Photos, the iPhone and Final Cut Pro.
  - Solid basics: colour match, stabilisation, noise reduction, ducking, green screen.
- **Gaps:**
  - No captions or SRT.
  - No vertical or square projects (*unverified*).
  - No stickers, masks, blend modes, keyframed motion, speed curves, tracking, LUTs, beat sync, TTS or AI.
  - No direct upload, cloud or teams.
  - No Windows, Android or Linux.
- **Weaknesses:**
  - Stagnant since 2023.
  - Crashes and stuck exports on macOS Tahoe in 2026.
  - Two video tracks.
  - 4K30 only on Mac, and HDR dropped to SDR.
  - Fixed title presets; a big library on disk; no GIF export.

### What users say

- **Good**
  - "a good and simple editing system that is really fun to use." ([App Store](https://apps.apple.com/us/app/imovie/id377298193?see-all=reviews), 2024-08-06)
  - "simple and easy to use, beginners won't find it confusing." (App Store, 2022-04-27)
  - "You truly can make professional looking videos with this." (App Store, 2021-05-28)
  - "The interface is beautiful and fun to use." ([Techjockey](https://www.techjockey.com/reviews/imovie), 2024-07-16)
- **Meh**
  - "I have accomplished a lot with iMovie, but have now outgrown it." ([Mac App Store](https://apps.apple.com/us/app/imovie/id408981434?mt=12), May 29, year not shown)
  - "It's not great for complex editing with advanced options for titles and subtitles." (Techjockey, 2024-07-16)
  - "it really needs some updating and bugs worked out." (App Store, 2021-09-26)
- **Bad**
  - "It crashes randomly every 10-20 minutes… It's infuriating." ([Mac App Store UK](https://apps.apple.com/gb/app/imovie/id408981434?mt=12), 18 Mar, year not shown)
  - "Since upgrading to Tahoe, iMovie became more or less unusable for me." ([Apple Community](https://discussions.apple.com/thread/256284306), 2026-05-03)
  - "Trying to Export iMovie and it is failing ever single time." ([Apple Community](https://discussions.apple.com/thread/256264487), 2026-03-17)
  - "Simply having iMovie OPEN … shows %CPU at over 100%" ([Apple Community](https://discussions.apple.com/thread/256267479), 2026-03-22)
  - "unable to edit volume level other than mute/unmute which is unacceptable" ([Apple Community](https://discussions.apple.com/thread/256328509), 2026-07-20)
  - "it consistently converts my footage to 30 fps, SDR" ([Apple Community](https://discussions.apple.com/thread/256086103), 2025-06-23)
  - "It's only good for Mac users" (Techjockey, 2024-07-23)

---

## Wondershare Filmora

**In one line:** the most "pro" of the easy editors (multicam, tracking, masks, HDR, 8K, ProRes, XML) and easy to
use. But it charges at every layer: a watermark on every free export, a yearly subscription, AI credits that expire
monthly, an assets add-on, cloud storage, a separate phone licence, and a new licence for each major version.

### Price in 2026 and where the free line falls

| Plan | Price | Watermark | AI credits | Cloud | Updates | Source |
|---|---|---|---|---|---|---|
| Free | $0 | **Yes, every export** | 100 for "some AI features" (store listings); AI Mate 15 a day | None (pricing); 1 GB per the Drive guide (pages conflict) | — | [pricing](https://filmora.wondershare.com/pricing.html), fetched 2026-11-17 |
| Basic | $49.99/yr, auto-renews | No | None listed | 1 GB | Continuous | [plans](https://filmora.wondershare.com/guide/member-plan.html), fetched 2026-11-17 |
| Advanced | $59.99/yr (list $69.99) | No | 1,000 a month, taken back monthly | 10 GB | Continuous | plans, pricing |
| Premium | $99.99/yr; the Mac App Store sells $79.99/yr or $35.99/mo | No | 2,000 a month | 100 GB | Continuous, plus Creative Assets | plans, [Mac App Store](https://apps.apple.com/us/app/filmora-ai-video-editor/id1516822341) |
| Perpetual | $79.99 one-time (Mac App Store "Lifetime License"; [Toolradar](https://toolradar.com/tools/filmora), 2026-09-29) | No | 1,000 once | 1 GB | "Updates Within Filmora 16" only; Windows and Mac licences separate | pricing |

- **More layers to pay for:**
  - The Creative Assets add-on, billed monthly.
  - Credit packs, from $9.99 for 1,500 credits to $399 for 100,000 ([packs](https://filmora.wondershare.com/store/integral-pack.html)).
  - Mac App Store add-ons: Effects Monthly $16.99, Cloud 100 GB $7.99.
  - The phone app's own plans: $9.99/mo or $45.99/yr, plus "Remove Logo Roll" $4.99 ([App Store](https://apps.apple.com/us/app/filmora-ai-video-editor-maker/id1019382747)).
- **Credit costs** ([credit rules](https://filmora.wondershare.com/filmora-ai-credits-rule.html), fetched 2026-11-17):
  - captions 4 a minute; text-to-speech 1 per 10 characters; translation 5–16 a minute; Smart Short Clips 6 a minute
  - enhancer 20 a use; object remover 100; voice cloning 100
  - Veo 3.1 text-to-video 450 a use; Sora 2 150–450; AI Idea to Video 300–800 a session
  - At pack prices, one Veo 3.1 clip costs about $1.80–$3.00 (our arithmetic).
- **The free line:**
  - Free gets the basic editor and a fraction of the assets (600+ stock items, 9,600+ music tracks, 1,500+ effects, against 1.1M+, 45K+ and 18K+ on paid plans).
  - Five AI tools are listed as free: Smart Search, Auto Reframe, AI Face Mosaic, AI Portrait, AI Color Palette.
  - Paid only: 4K, the "100+ advanced editing features", the full asset library and cloud.
  - Wondershare doesn't say which tools are in that "100+": Toolradar says free has "all editing features" (2026-09-29).
- **Billing terms:** the 30-day money-back guarantee "does not apply to auto-renewal charges", and annual contracts
  paid monthly renew "without notice" ([terms](https://www.wondershare.com/subscription-and-cancellation-terms.html)).
  Perpetual licences bought before 2026-06-24 aren't valid for Filmora 16 ([support](https://support.wondershare.com/how-tos/filmora/i-have-a-perpetual-plan-why-does-a-watermark-appear-during-export.html)).
- **Version:** Filmora 16 launched 2026-10-09 ([press release](https://www.cantechletter.com/newswires/wondershare-filmora-16-launches-to-make-professional-video-creation-more-accessible-with-ai/)); the Mac App Store build is still 15.0.14 from 2025-12-18 (Apple lookup, fetched 2026-11-17).

### UI layout

- **Panels** ([panel guide](https://filmora.wondershare.com/guide/panel-layout.html)):
  - a Media panel with tabs (Media, Stock Media, Audio, Titles, Transitions, Effects, Stickers, Templates)
  - a Player, which can be detached
  - a Property panel (Video, Audio, Color, Speed)
  - the Timeline, and Export at top right
  - Default positions: media top left, player top centre, properties right, timeline bottom (*unverified*: the guide doesn't say them in words).
- **Nine preset layouts:** Default, Organize, Edit, Short Video, Classic, Dual (two monitors), Timeline, Color Grading, Audio Mixing.

### First run, install to first export

1. **Download** from filmora.wondershare.com (Windows 7+ 64-bit, macOS 10.14+), or get it from the Microsoft Store or
   Mac App Store ([install guide](https://filmora.wondershare.com/guide/download-install-to-uninstall.html)). The
   Microsoft Store build must run from an administrator account ([listing](https://apps.microsoft.com/detail/xp8jnpkgtv6nrl)).
2. **No account needed to edit.** A Wondershare ID, Google, Facebook or Twitter account is needed for cloud, credits and activation.
3. **Startup window** ([guide](https://filmora.wondershare.com/guide/startup-window.html)), with four tabs:
   - Create Projects: aspect ratio and recent projects.
   - Filmora Cloud.
   - Creator Hub: tutorials.
   - AI Toolbox: Instant Mode, Screen Record, Auto Reframe, Instant Cutter, Silence Detection, Auto Beat Sync, AI Copywriting.
4. **Pick 16:9, 1:1, 9:16 or custom** → Create Project ([guide](https://filmora.wondershare.com/guide/create-a-project.html)).
5. **Import, drag to the timeline, and add titles, music and effects.** Paid assets sit beside free ones, and it's
   unclear which is which ([Trustpilot](https://www.trustpilot.com/review/filmora.wondershare.com?stars=3), 2026-01-05).
6. **Export** (top right): Local, Device, YouTube, TikTok, Vimeo, DVD; format, resolution, frame rate ([guide](https://filmora.wondershare.com/guide/export-to-local.html)).
7. **The free export carries the watermark.** A third party says this isn't clearly disclosed before download ([Costbench](https://www.costbench.com/software/video-editing/filmora/free-plan/), 2026-08-06).

### Workflows

"Free*" = works in the free version (watermarked), but Wondershare doesn't say whether it's one of the paid
"100+ advanced features" (*unverified*).

| Group | Feature | Status | Notes | Help page |
|---|---|---|---|---|
| Import | Local files to 8K, 12K images, SRT/LRC, XML | Free | AI Media Analysis and Smart Media Bin new in 16 | [import](https://filmora.wondershare.com/guide/importing-media.html), [spec](https://filmora.wondershare.com/tech-spec.html) |
| Import | Stock | Partial | 600+ free, 1.1M+ paid | [stock](https://filmora.wondershare.com/guide/media-for-use.html) |
| Import | Screen, camera, mic, system audio, game recording | Free* | Separate sources in 16 | [recording](https://filmora.wondershare.com/guide/record-pc-screen.html) |
| Timeline | Multi-track, split, trim, speed, freeze, multicam | Free / Free* | No speed curve on the 16 page | [timeline](https://filmora.wondershare.com/guide/use-the-timeline.html), [speed](https://filmora.wondershare.com/guide/change-video-speed.html), [multicam](https://filmora.wondershare.com/guide/multicam-editing.html) |
| Compositing | PiP, blend modes, track matte, masks, colour mask | Free* | Track matte and colour mask new in 16 | [compositing](https://filmora.wondershare.com/guide/compositing.html), [masks](https://filmora.wondershare.com/guide/masks.html) |
| Text and captions | Titles; auto and dynamic captions; translation | Titles free plus paid presets; captions and translation on credits | Subtitle track new in 16 | [text](https://filmora.wondershare.com/guide/edit-and-customize-texts.html), [captions](https://filmora.wondershare.com/guide/auto-caption.html), [translation](https://filmora.wondershare.com/guide/ai-translation.html) |
| Templates, effects, filters, transitions, stickers | Instant Mode, libraries | Partial | 1,500+ free, 18K+ paid; AI Sticker 10 credits | [templates](https://filmora.wondershare.com/guide/edit-with-preset-templates.html), [effects](https://filmora.wondershare.com/guide/types-of-effects.html), [transitions](https://filmora.wondershare.com/guide/modify-transitions.html) |
| Animation | Keyframes, path curve; motion, planar, camera tracking | Free* | Camera tracking new in 16 | [keyframes](https://filmora.wondershare.com/guide/add-animation-keyframing.html), [motion](https://filmora.wondershare.com/guide/motion-tracking.html), [planar](https://filmora.wondershare.com/guide/planar-tracking.html) |
| Background | Chroma key; AI Portrait; Smart Cutout | Free* / Free | | [green screen](https://filmora.wondershare.com/guide/green-screen.html), [AI Portrait](https://filmora.wondershare.com/guide/ai-portrait-add-on.html) |
| Colour | Presets, HSL, Auto Color, HDR (HLG, PQ) | Free* | HDR needs GPU and runs about 4× slower | [colour](https://filmora.wondershare.com/guide/adjust-tone-in-color-correction.html), [HDR](https://filmora.wondershare.com/guide/hdr.html) |
| Audio | Music library; AI music and sound effects | Partial; credits | 9,600+ free | [AI music](https://filmora.wondershare.com/guide/ai-music-generator.html) |
| Audio | Voice changer, ducking, denoise, vocal remover, beat detection, Auto Beat Sync | Free* | | [voice](https://filmora.wondershare.com/guide/voice-changer.html), [ducking](https://filmora.wondershare.com/guide/ducking.html), [denoise](https://filmora.wondershare.com/guide/ai-audio-denoise-for-windows.html), [vocal](https://filmora.wondershare.com/guide/ai-vocal-remover.html), [beat sync](https://filmora.wondershare.com/guide/auto-beat-sync.html) |
| Audio | Text-to-speech, voice cloning | Credits | | [TTS](https://filmora.wondershare.com/guide/stt-tts-srt.html), [cloning](https://filmora.wondershare.com/guide/ai-voice-cloning.html) |
| AI | Silence detection | Free* | No filler words | [silence](https://filmora.wondershare.com/guide/silence-detection.html) |
| AI | Smart Short Clips; text, image or idea to video; AI Mate; object remover; enhancer | Credits | AI Mate 15 free a day | [shorts](https://filmora.wondershare.com/guide/smart-short-clips.html), [text-to-video](https://filmora.wondershare.com/guide/ai-text-to-video.html), [AI Mate](https://filmora.wondershare.com/guide/ai-copilot-editing.html), [enhancer](https://filmora.wondershare.com/guide/ai-video-enhancer.html) |
| Reframe | Auto Reframe, 360° reframing | Free | | [auto reframe](https://filmora.wondershare.com/guide/auto-reframe.html) |
| Export | MP4, MOV, MKV, AV1, HEVC, WebM, GIF, audio; 8K MP4 or ProRes MOV; batch export | Free (watermark); 4K paid | | [spec](https://filmora.wondershare.com/tech-spec.html), [export](https://filmora.wondershare.com/guide/export-to-local.html) |
| Sharing | YouTube, TikTok, Vimeo, DVD | Free (watermark) | | [export](https://filmora.wondershare.com/guide/export-to-local.html) |
| Cloud | Wondershare Drive: backup, sync, password share links | Paid | | [Drive](https://filmora.wondershare.com/guide/wondershare-drive-overview.html) |

### Strengths, gaps, weaknesses

- **Strengths:**
  - Easy drag-and-drop over a deep toolset: multicam, tracking, masks, keyframes, HDR, XML, 8K, ProRes.
  - Windows (including ARM) and Mac on one subscription.
  - The cheapest paid easy editor at $49.99 a year.
  - Veo 3.1 and Sora 2 built in.
- **Gaps:**
  - No Linux.
  - No local AI models and no bring-your-own key.
  - No speed curve shown in 16; no filler-word cuts; no AI avatars (*unverified*).
- **Weaknesses:**
  - No free export without the watermark.
  - Six things to pay for.
  - Credits expire monthly; renewals can't be refunded; the perpetual licence covers one major version.
  - Wondershare changed lifetime licences in 2022–23 and filed a copyright strike against a critic ([No Film School](https://nofilmschool.com/lifetime-licenses-need-to-knows), 2023-01-30).
  - Unstable on long projects.

### What users say

- **Good**
  - "Quite simply, one of the best products of its type. Easy to use, with plenty of functionality." ([Trustpilot](https://www.trustpilot.com/review/filmora.wondershare.com), 2026-04-12)
  - "Love the easy to use tools, perfect for beginners." (Trustpilot, 2026-05-24)
  - "Just Drag and Drop." (Trustpilot, 2026-05-15)
  - "the quality genuinely stands out from the competition" ([App Store](https://apps.apple.com/us/app/filmora-ai-video-editor-maker/id1019382747), 2024-06-12)
- **Meh**
  - "I like the program but very annoyed with the number of features/addon/etc" ([Trustpilot 3★](https://www.trustpilot.com/review/filmora.wondershare.com?stars=3), 2026-01-05)
  - "The interface changed so much that I feel lost every time I open it." (Trustpilot 3★, 2025-10-23)
  - "I would have loved if more features were available in the free tier." (Trustpilot 3★, 2025-09-20)
- **Bad**
  - "the water mark the program leaves smothers the whole screen and ruins your work." (Trustpilot 2★, 2026-10-16)
  - "many effects and transitions are locked behind an additional monthly subscription." (Trustpilot 2★, 2026-10-16)
  - "this is the second time that they charged me twice" (Trustpilot 1★, 2026-11-11)
  - "This program can't handle complex projects longer than 10 minutes." (Trustpilot 2★, 2026-10-23)
  - "I had to pay an additional fee to continue using the new version without a watermark." ([Trustpilot 1★](https://www.trustpilot.com/review/filmora.wondershare.com?stars=1), 2026-10-04)
  - "They have two separate licenses for mobile and desktop versions" (Trustpilot 1★, 2026-11-09)
  - "Almost ALL of the effects and filters are Pro. Plus there is a persistent Watermark." ([Google Play](https://play.google.com/store/apps/details?id=com.wondershare.filmorago&hl=en_US), 2023-02-28)

## Open questions

- **Free/paid status still *unverified* for:** CapCut's multicam, long-to-shorts, auto reframe and LUTs; and Filmora's
  "Free*" tools. Settling them needs each app installed on a test machine, signed out, and each tool tried to export.
- **Not covered here:** Reddit wording, because of the blocks. A later pass by hand, or via Search Console queries
  once we have a site, would show the words users search with ("capcut export locked", "clipchamp onedrive").
