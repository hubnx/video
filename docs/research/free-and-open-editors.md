# Free and open-source video editors: features, users, openings

Research for the video app (a free, AGPL-3.0, AI-first CapCut alternative for Mac, Windows and Linux). Covers the free and open editors: DaVinci Resolve (free version), Kdenlive, Shotcut, OpenShot, OpenCut, Olive and LosslessCut. Collected 2026-11-17.

## Conclusion first

- **No free editor is both easy like CapCut and AI-capable without effort.** Each is strong where the others are weak:
  - Resolve is the most powerful, but its AI is paid.
  - Kdenlive and Shotcut have free local AI captions, but behind Python, Docker or model downloads.
  - OpenShot is the friendliest, but users rate it worst for stability.
  - OpenCut has the most attention but no shipping product.
- **Resolve's free version locks every AI tool behind Studio ($295 one-time):** captions from speech, transcription, Magic Mask, Smart Reframe, voice isolation and the Resolve 21 AI suite. On Windows and Linux the free version also lacks hardware H.264/H.265 encoding, so exports are slow. ([Studio page](https://www.blackmagicdesign.com/products/davinciresolve/studio), read 2026-11-17; [Subanana citing the Resolve 21 manual](https://subanana.com/zh-TW/blog/davinci-resolve-字幕), 2026-09-03)
- **Local AI in the open editors is hard to set up:**
  - Kdenlive's Whisper captions need you to install Python, then about 2 GB of dependencies and a 1.4 GB model ([Kdenlive manual](https://docs.kdenlive.org/getting_started/configure_kdenlive/configuration_plugins.html)).
  - Shotcut's text-to-speech needs a Docker image, reported at 13.2 GB ([Shotcut forum doc](https://forum.shotcut.org/t/subtitles-text-to-speech/50221)).
  - OpenShot's generative AI needs a ComfyUI server the user runs, on an "RTX 5070 12GB or better", with "64GB+ RAM" and "200GB free space" ([OpenShot AI guide](https://www.openshot.org/static/files/user-guide/ai.html)).
- **The top complaints, ranked:**
  1. Crashes and lost work.
  2. Hard to learn.
  3. Missing CapCut-style creative content: animated text, templates, effect packs.
  4. AI that is paid or hard to install.
  5. Slow on ordinary hardware.
  6. Files that won't import.
- **Kdenlive says plainly it won't take the CapCut lane:** "Kdenlive doesn't want to be yet another CapCut clone", and on animated text, "nothing is happening in this department due to different priorities" ([KDE Discuss](https://discuss.kde.org/t/kdenli-ve-capcut-vs-fi-lmora/47297), 2026-05-25).
- **The open lane is wide.** OpenCut proved the demand: 98,766 GitHub stars, pitched as "Most basic CapCut features are now paywalled". But its rewrite has shipped nothing since 2026-04-15, and users are asking "are you guys even working on this?" ([#916](https://github.com/OpenCut-app/OpenCut/issues/916), 2026-10-20). Olive has stalled since 2024-12-05.
- **The incumbents are moving toward easy, slowly:**
  - Shotcut added an Elements sticker and animated-text library (2026-08-01).
  - OpenShot added on-screen text editing (2026-10-31).
  - Kdenlive added a welcome screen and a 9:16 layout (2025-12-18).
  - Expect them to keep closing the gap. Our edge has to be the whole package (templates, one-click AI, stability), not a single feature.

## Method and limits

- **Sources:** each project's GitHub (read through the GitHub API on 2026-11-17), its release notes, official docs, AlternativeTo reviews, app-store pages, forums (Shotcut, KDE Discuss, GitHub issues) and press coverage.
- **Reddit:** quoted only from search-result snippets. Reddit refuses scripts, and fetching through Reddit mirrors was refused, so these quotes could not be checked against the thread and are marked *snippet*.
- **G2 and Capterra:** both refused direct fetches (HTTP 403), so their ratings come from search snippets and are marked *snippet*.
- **Search budget:** the session's web-search budget ran out partway through. A few planned checks were not run and are marked *unverified*: Resolve's download registration form and its free 3D keyer, Kdenlive and Olive's keying and audio details, and OpenCut's export limits.
- **No hands-on testing:** no editor was installed or tested here. UI descriptions come from the official docs.

## At a glance

| | DaVinci Resolve (free) | Kdenlive | Shotcut | OpenShot | OpenCut | Olive | LosslessCut |
|---|---|---|---|---|---|---|---|
| What it is | Pro editor, color, VFX, audio | Pro-style open editor | Open editor, filter-based | Beginner open editor | Web editor, CapCut-inspired | Node-based editor | Lossless cutter, not an editor |
| Licence | Proprietary freeware; Studio $295 ([site](https://www.blackmagicdesign.com/products/davinciresolve) showed "Was $295 Now $236" on 2026-11-17) | GPL-3.0 | GPL-3.0 (on MLT, LGPL-2.1) | GPL-3.0+ (on libopenshot, LGPL-3.0) | MIT | GPL-3.0 | GPL-2.0; free on GitHub, $18.99 on the [Mac App Store](https://apps.apple.com/us/app/losslesscut/id1505323402) |
| Platforms | Mac, Windows, Linux (Rocky Linux) | Linux, Windows, macOS | Windows, macOS, Linux | Windows, macOS, Linux (+ Linux ARM64 in 4.1) | Browser (classic); desktop in the rewrite | Windows, macOS, Linux | Windows, macOS, Linux |
| 2026 releases | 21 (June), 21.1 (2026-09-08) | 26.04.1–.3, 26.08.0–.3 (latest 2026-11-07); 26.12 in beta | 7 stable (latest v26.11.15, 2026-11-16) + 7 betas | 6 (3.5.0, 3.5.1, 4.0.0, 4.0.1, 4.1.0, 4.1.1 on 2026-11-02) | v0.3.0 (2026-04-15); last push 2026-09-24 | None; last commit 2024-12-05 | 3.68.0, 3.69.0, 3.70.0–.2 (2026-10-28) |
| GitHub stars (2026-11-17) | Closed source | 6,136 (a mirror; the main repo is KDE's own GitLab) | 15,716 | 6,805 | 98,766 | 9,161 | 46,138 |
| AlternativeTo rating | 4.1 (28 ratings) | 3.9 (89) | 3.9 (46) | 2.7 (52) | — | 4.2 (13), marked "Discontinued" | 4.8 (24) |
| Health | Active, well funded | Active; stability-focused releases | Very active; regressions between versions | Very active, mostly one developer | Rewrite stalled publicly | Stalled | Active, one developer |

Sources: [GitHub API](https://docs.github.com/en/rest) for the stars, releases and licences; [Kdenlive news](https://kdenlive.org/news/); [Resolve 21.1 readme](https://www.blackmagicdesign.com/us/support/content/readme/59dd4eef1f4941c29fb8dc48b33f5c87) (updated 2026-09-08); and the AlternativeTo review pages, linked in each product's section below, all read 2026-11-17.

---

## 1. DaVinci Resolve (free version)

### Features by workflow

| Workflow | Free version | Studio adds ($295) |
|---|---|---|
| Import and media | Media page for organising and syncing. Reads media of "unlimited resolution" ([21.1 readme](https://www.blackmagicdesign.com/us/support/content/readme/59dd4eef1f4941c29fb8dc48b33f5c87)). Free on Linux has no H.264 or AAC decoding, so MP4 audio comes in silent ([ProVideo Coalition](https://www.provideocoalition.com/aac-audio-kdenlive-beats-davinci-resolve-studio-on-linux/); reports differ by version) | Advanced AVCHD, AVC-Intra, all-I H.264, 10-bit encoding |
| Timeline editing | Two editors. **Cut** has a source tape, a dual timeline, a smart indicator, edit modes, trim tools and a "boring detector". **Edit** is the full NLE. Smart bins ([Cut page](https://www.blackmagicdesign.com/products/davinciresolve/cut), [what's new](https://www.blackmagicdesign.com/products/davinciresolve/whatsnew)) | — |
| Text and titles | Text+ and MultiText: spell check, a font browser, emoji, character styling. Lottie and OGraf files work as titles. 2D/3D title templates | — |
| Captions | Manual subtitle tracks, SRT import, styling, burn-in or a separate file. **No captions from speech** | "Create Subtitles from Audio" and "Audio Transcription" (marked Studio Version Only in the manual, per [Subanana](https://subanana.com/zh-TW/blog/davinci-resolve-字幕), 2026-09-03) |
| Templates | Title templates and effect presets. No CapCut-style project or social templates found | — |
| Effects | Over 100 transitions and effects on the Cut page. Fusion node VFX. Color page | Over 45 more Resolve FX (Film Look Creator, face and beauty, object removal, patch replacer) |
| Transitions | Over 100, shared with effects | — |
| Keyframes | Yes. Resolve 21 adds ease presets with loop, pingpong and relative modes, and Bezier retiming | — |
| Green screen and background removal | Chroma keying (*unverified*: specific keyer not checked) | Magic Mask, object isolation and tracking, depth map ([Studio page](https://www.blackmagicdesign.com/products/davinciresolve/studio)) |
| Audio | Fairlight page: a full audio post workspace | AI voice isolation, dialogue separator, music remixer, Dolby Atmos |
| AI | None confirmed as free. Cut page "Close Up" face zoom uses the Neural Engine, and the page doesn't say whether it's Studio (*unverified*) | Super Scale, Speed Warp, Smart Reframe, scene cut detection, AI UltraNR. Resolve 21 adds AI CineFocus, UltraSharpen, Motion Deblur, Face Age Transformer, Face Reshaper, SlateFinder and SlateID ("none of which are available in the free version", [Videomaker](https://www.videomaker.com/news/davinci-resolve-21-launches-early-with-massive-ai-upgrades/), June 2026). Also new in 21: AI IntelliSearch and AI Speech Generator ([what's new](https://www.blackmagicdesign.com/products/davinciresolve/whatsnew); whether they're Studio-only is *unverified*) |
| Aspect ratios and reframing | Square and vertical resolutions in project settings | Smart Reframe (automatic) |
| Export | Deliver page. Quick-export presets for YouTube, Vimeo and TikTok. Direct upload to YouTube, TikTok, Vimeo and X. **Capped at Ultra HD 3840×2160, 60 fps** | Up to 32K at 120 fps. IMF and DCP |
| Hardware acceleration | One GPU on Windows and Linux. Hardware H.264/HEVC encoding only on Mac in the free version ([Puget Systems](https://pugetsystems.com/labs/articles/What-H-264-H-265-Hardware-Decoding-is-Supported-in-DaVinci-Resolve-Studio-2122), *snippet*) | Several GPUs; hardware H.264/H.265 decoding and encoding |
| Automation | **Python scripting moved to Studio in 21.1** ([readme](https://www.blackmagicdesign.com/us/support/content/readme/59dd4eef1f4941c29fb8dc48b33f5c87)) | Scripting. An MCP server for AI tools (21.1, reported by [RedShark](https://www.redsharknews.com/davinci-resolve-21.1-new-features-release)) |
| New in 21 | Photo page: RAW stills grading, free ([PetaPixel](https://petapixel.com/2026/06/03/davinci-resolve-21-officially-released-with-new-photo-editing-ai-tools-and-much-more/), 2026-06-03) | Photo-page AI and tethering |

**Minimum hardware** ([21.1 readme](https://www.blackmagicdesign.com/us/support/content/readme/59dd4eef1f4941c29fb8dc48b33f5c87)):
- macOS 15 on Apple Silicon, 8 GB RAM (16 GB with Fusion).
- Windows: 16 GB RAM (32 GB with Fusion) and a GPU with 4 GB VRAM.
- Linux: 32 GB RAM. Officially Rocky Linux 8.6 only.

### UI and first run

- **Layout:** a row of "pages": Media, Photo, Cut, Edit, Fusion, Color, Fairlight, Deliver ([product page](https://www.blackmagicdesign.com/products/davinciresolve)). Each page is its own full workspace, so a beginner meets seven apps in one.
- **First run:**
  1. Download. A reviewer said the download asks you to "give us your full legal name and home address" ([AlternativeTo](https://alternativeto.net/software/davinci-resolve/reviews/), 2025-09-06; the current form is *unverified*).
  2. Install.
  3. Pick or create a project in the Project Manager (*unverified* in this pass).
  4. Import on Media or Cut.
  5. Edit on Cut or Edit.
  6. Export from Cut's quick export, or the Deliver page with its presets.
- **Vertical video** is a project setting you have to know about. A six-year Studio user couldn't make titles fill a vertical frame, and a reply pointed to the "Use vertical resolution" option ([r/davinciresolve](https://www.reddit.com/r/davinciresolve/comments/1k0qiqy/moving_to_capcut_after_6_years_not_a_hater_post/), 2025-04-16, *snippet*).

### Strengths, gaps, and difficulty for a CapCut user

- **Strengths:**
  - Pro editing, color and audio, free.
  - Two edit modes (Cut for speed).
  - Social export presets and direct upload.
  - Regular big releases.
- **Gaps:**
  - All AI, auto captions and auto reframe are paid.
  - No social templates or caption styles.
  - Free on Linux misses common codecs.
  - Heavy hardware needs.
  - Closed source.
- **Difficulty for a CapCut user: high.** Seven pages, a node-based color page, and vertical setup hidden in project settings. Reviewers call the learning curve steep (Capterra and G2, *snippets*).

### What users say

| Tone | Quote | Source, date |
|---|---|---|
| Good | "you don't need to know everything to get great results." | [AlternativeTo](https://alternativeto.net/software/davinci-resolve/reviews/), 2026-09-03 |
| Good | "the free version is more than enough" | AlternativeTo, 2024-10-24 |
| Good | Capterra 4.8 (268 reviews); G2 4.7 (221 reviews) | [Capterra](https://www.capterra.com/p/209733/DaVinci-Resolve/reviews/), [G2](https://www.g2.com/products/davinci-resolve/reviews), *snippets* |
| Meh | "The color page though is like looking in the cockpit of a 747..." | AlternativeTo, 2026-11-12 |
| Meh | "learning curve a bit steep compared with alternatives"; Fusion "pretty intimidating coming from layer-based editing" | Capterra, *snippet*, undated |
| Bad | "resource-intensive and requires a high-end computer to run smoothly" | Capterra, *snippet*, undated |
| Bad | "it will not import or read the vast majority of media properly, if at all." | AlternativeTo, 2025-09-06 |
| Bad | Moving to CapCut after six years as a Studio user: CapCut "is light years ahead" with "hundreds of text effects, animations, and transitions" | [r/davinciresolve](https://www.reddit.com/r/davinciresolve/comments/1k0qiqy/moving_to_capcut_after_6_years_not_a_hater_post/), 2025-04-16, *snippet* |

### Official docs and screenshots

- [Cut page](https://www.blackmagicdesign.com/products/davinciresolve/cut)
- [Edit page](https://www.blackmagicdesign.com/products/davinciresolve/edit)
- [Fusion](https://www.blackmagicdesign.com/products/davinciresolve/fusion)
- [Color](https://www.blackmagicdesign.com/products/davinciresolve/color)
- [Fairlight](https://www.blackmagicdesign.com/products/davinciresolve/fairlight)
- [What's new in 21](https://www.blackmagicdesign.com/products/davinciresolve/whatsnew)
- [Studio vs free](https://www.blackmagicdesign.com/products/davinciresolve/studio)
- [Training](https://www.blackmagicdesign.com/products/davinciresolve/training)
- [21.1 readme](https://www.blackmagicdesign.com/us/support/content/readme/59dd4eef1f4941c29fb8dc48b33f5c87)

---

## 2. Kdenlive

### Features by workflow

| Workflow | What it does | Source |
|---|---|---|
| Import and media | FFmpeg-based import. Project bin. Proxies. OpenTimelineIO import and export (25.04; effects not carried over) | [25.04 notes](https://kdenlive.org/news/releases/25.04.0/) |
| Timeline editing | Multi-track editing, sequences (nesting), markers with duration (25.12), and track reordering, automatic audio tracks and multi-clip speed changes (26.08). Relative project paths coming in 26.12 | [26.08 notes](https://kdenlive.org/news/releases/26.08.0/), [testing post](https://kdenlive.org/news/2026/october-testing/) |
| Text and titles | Title editor, revamped in 25.08. Snapping, rounded corners and copy/paste (26.08). Mixed font styles in one block coming in 26.12. Glaxnimate for motion graphics | [What's new](https://docs.kdenlive.org/en/more_information/whats_new.html), [titles docs](https://docs.kdenlive.org/en/titles_and_graphics/titles_and_graphics.html) |
| Captions | Several subtitle tracks (24.12). **Speech to text with VOSK or Whisper, run locally.** Translation with SeamlessM4T, about 10 GB (24.05). Create clips from a text selection (24.02) | [Speech to text](https://docs.kdenlive.org/en/effects_and_filters/speech_to_text.html), [plugins](https://docs.kdenlive.org/getting_started/configure_kdenlive/configuration_plugins.html) |
| Templates | No social or CapCut-style templates; the maintainers say they aren't planned (quote above) | [KDE Discuss](https://discuss.kde.org/t/kdenli-ve-capcut-vs-fi-lmora/47297) |
| Effects | Built on the frei0r and FFmpeg filter libraries. Presets can be shared on the KDE Store | KDE Discuss (same thread) |
| Transitions | Compositions and wipes. Transition previews (26.04) | [Transitions docs](https://docs.kdenlive.org/en/compositing/transitions.html) |
| Keyframes | Yes. Keyframe curve editor (24.08). A dopesheet ("parametrized keyframes") is in progress | [What's new](https://docs.kdenlive.org/en/more_information/whats_new.html), [Kdenlive news](https://kdenlive.org/news/) 2026-09-10 |
| Green screen and background removal | Chroma key, rotoscoping and a motion tracker. **SAM2 object segmentation** (25.04): draw a box, add include and exclude points, "remove the background", "All processing is done locally" | [Alpha, mask and keying](https://docs.kdenlive.org/en/effects_and_filters/video_effects/alpha_mask_keying.html), [25.04 notes](https://kdenlive.org/news/releases/25.04.0/) |
| Audio | Mixer revamped in 25.08, clipping indicator (25.12), additive solo (26.08), recording | [Audio docs](https://docs.kdenlive.org/en/effects_and_filters/audio.html) |
| AI | Whisper/VOSK captions, SeamlessM4T translation, SAM2 masks. All local; all need Python plugins | [Plugins](https://docs.kdenlive.org/getting_started/configure_kdenlive/configuration_plugins.html) |
| Aspect ratios and reframing | Vertical layout and 9:16 safe areas (25.12). No automatic reframe found | [25.12 notes](https://kdenlive.org/news/releases/25.12.0/) |
| Export | Render dialog with MP4 and other presets | [Render docs](https://docs.kdenlive.org/en/exporting/render.html) |
| Hardware acceleration | Hardware encoding presets marked "experimental": NVENC, VAAPI and VideoToolbox (H.264/H.265) | [Render docs](https://docs.kdenlive.org/en/exporting/render.html) |

**AI setup cost** ([Kdenlive manual](https://docs.kdenlive.org/getting_started/configure_kdenlive/configuration_plugins.html)):
- Install Python first, with "Add python.exe to PATH" on Windows.
- Whisper then asks to install dependencies of "about 2GB to download", and its recommended turbo model is "1.4GB".
- GPU acceleration needs an NVIDIA card with CUDA. There is no Apple Metal path in the manual.
- In the Flatpak build, pip is blocked and the workaround is a shell command.
- One Windows user couldn't find the settings the docs described and wrote "I need a step by step." A forum helper confirmed the docs were out of date ([KDE Discuss](https://discuss.kde.org/t/problems-configuring-kdenlive-for-speech-to-text-and-object-detection/33517), 2025-04-30 to 2025-05-01).

### UI and first run

- **Layout** ([quick start](https://docs.kdenlive.org/en/getting_started/quickstart.html), [UI docs](https://docs.kdenlive.org/en/user_interface.html)):
  - Project Bin top left.
  - Clip and Project monitors to its right.
  - Timeline below.
  - Effect/Composition Stack as a panel.
  - Workspace layouts listed in the menu bar.
  - A welcome screen since 25.12.
- **First run, from the quick start:**
  1. Make a project folder.
  2. File › New, and pick a profile (or let Kdenlive suggest one from the first clip).
  3. Add clips to the bin.
  4. Drag them to the timeline.
  5. Overlap clips, then click "Click to add composition" for a wipe.
  6. Open View › Effects, search, and double-click an effect.
  7. Render (Ctrl+Enter), choose MP4, then "Render to File".

### Strengths, gaps, and difficulty for a CapCut user

- **Strengths:**
  - The fullest open-source feature set.
  - Local AI captions and background removal.
  - Steady, stability-focused releases. 26.08.3 added recovery of corrupted projects ([news](https://kdenlive.org/news/releases/26.08.3/), 2026-11-07).
- **Gaps:**
  - No templates or animated text presets, and the maintainers say none are planned.
  - AI needs Python setup.
  - Reputation for crashes.
- **Difficulty for a CapCut user: medium-high.** It's a traditional editor: effects are found by searching a list, and titles live in a separate editor.

### What users say

| Tone | Quote | Source, date |
|---|---|---|
| Good | "user interface and user experience are impressive, making the process enjoyable and efficient." | [AlternativeTo](https://alternativeto.net/software/kdenlive/reviews/), 2024-12-31 |
| Good | "Buttery smooth on my machine." | AlternativeTo, 2026-03-26 |
| Meh | "Kdenlive can sometimes feel a bit complex." (a request for CapCut-style presets) | [KDE Discuss](https://discuss.kde.org/t/kdenli-ve-capcut-vs-fi-lmora/47297), 2026-05-25 |
| Meh | "Capcut/Clip champ are markedly "funner" tools that kdenlive" | r/VideoEditing monthly software thread, 2025, *snippet* |
| Bad | "it's lost me hours of work many times due to crashes and file corruptions" | AlternativeTo, 2025-02-07 |
| Bad | "its UI is confusing and hard to use and it crashes frequently" | AlternativeTo, 2026-04-27 |
| Bad | "Some basic functions expected in a video editing app aren't there or don't work correctly." | AlternativeTo, 2025-03-14 |
| Bad | "it will lose all of your work after crash" | AlternativeTo, 2026-11-03 |

### Official docs and screenshots

- [User interface](https://docs.kdenlive.org/en/user_interface.html)
- [Quick start](https://docs.kdenlive.org/en/getting_started/quickstart.html)
- [Editing](https://docs.kdenlive.org/en/cutting_and_assembling/editing.html)
- [Titles](https://docs.kdenlive.org/en/titles_and_graphics/titles_and_graphics.html)
- [Subtitles](https://docs.kdenlive.org/en/effects_and_filters/subtitles.html)
- [Speech to text](https://docs.kdenlive.org/en/effects_and_filters/speech_to_text.html)
- [Masking and tracking](https://docs.kdenlive.org/en/compositing/masking_and_tracking.html)
- [Render](https://docs.kdenlive.org/en/exporting/render.html)
- [What's new](https://docs.kdenlive.org/en/more_information/whats_new.html)

---

## 3. Shotcut

### Features by workflow

All rows from [shotcut.org/features](https://shotcut.org/features/) unless another source is linked.

| Workflow | What it does |
|---|---|
| Import and media | FFmpeg formats. "No import required" (native timeline). Lottie, Rive and After Effects animations. Mixed resolutions and frame rates on one timeline. Webcam, audio and screen capture (25.10). Proxies, now accepting Premiere- and Resolve-style proxy folders (v26.11.15) |
| Timeline editing | Ripple, 3-point edits, insert and overwrite, grouping, sync by audio, markers. Adjustment clips (v26.9.27) |
| Text and titles | "Text: Simple", "Text: Rich" and Typewriter filters. Text from HTML (25.10). **Text is a filter added to a clip:** beginners are told to put it on a transparent clip above the video ([forum](https://forum.shotcut.org/t/how-to-add-text-to-a-video/24)) |
| Captions | Subtitles panel. **Speech to Text with whisper.cpp, built in since 24.10.29, local.** It ships with a small model, and larger ones are downloaded by hand from Hugging Face. It translates only to English ([doc](https://forum.shotcut.org/t/speech-to-text-subtitles/46306)). GPU via Vulkan on Windows and Linux since v26.4.30 (the doc page still says Apple Silicon only). Typewriter style for burned-in subtitles (v26.4.30) |
| Templates | **Elements** panel (v26.8.1): "a very slim (22MB) stock asset library" of emoji stickers, sounds, overlay transitions, animated text and graphics, royalty-free under the OFL, Sonniss and Lottie Simple licences ([doc](https://forum.shotcut.org/t/view-elements/51801)) |
| Effects | Color wheels, LUTs, blur, stabilise, lens correction, 360°, speed ramps, time remap. Shake (v26.8.1) |
| Transitions | Wipes, dissolves, fades. Overlay transitions in Elements |
| Keyframes | Yes, with easing. Presets for most filters ([doc](https://forum.shotcut.org/t/about-keyframes/12957/1)) |
| Green screen and background removal | Chroma Key (advanced and simple), masks, Motion Tracker. **No AI background removal** |
| Audio | Loudness scopes. RNNoise noise reduction (v26.6.25). Automatic ducking (v26.9.27). Mixing assistant (v26.11.15). VST2 and LV2 plugins. Voiceover recording |
| AI | Whisper captions. Text to speech using Kokoro 82M (25.10), which needs "a docker image as plugin", isn't in the Flatpak, and was reported at 13.2 GB ([doc](https://forum.shotcut.org/t/subtitles-text-to-speech/50221); [AlternativeTo news](https://alternativeto.net/news/2025/11/shotcut-25-10-brings-html-video-rendering-tts-for-notes-and-subtitles-and-screen-recording)). The team says "Do not ask us for more languages or voices" |
| Aspect ratios and reframing | **Reframe** output filter (24.09): 9:16, 16:9, 4:3 and square presets, keyframes and motion tracking ([doc](https://forum.shotcut.org/t/reframe-output-video-filter/45832/1)) |
| Export | Stock presets; "Default" makes H.264 MP4. Export from the timeline, playlist, a marker or the source. HDR export (v26.6.25) ([doc](https://forum.shotcut.org/t/export-basics/12953/1)) |
| Hardware acceleration | Hardware encoding (H.264/HEVC). **Hardware decoding since v26.1.30** (VA-API, Media Foundation, VideoToolbox). GPU processing mode. Graphics adapter choice ([v26.1.30 notes](https://github.com/mltframework/shotcut/releases/tag/v26.1.30)) |
| Help | "What's This?" contextual help (v26.1.30). The forum runs a Claude-based AI help bot |

### UI and first run

- **Layout:** panels you open from the toolbar: Playlist, Timeline, Filters, Properties, Export, Elements.
- **First run:** the first screen is **New Project**, with three fields: Projects Folder, Project Name and Video Mode ([forum doc](https://forum.shotcut.org/t/new-project/12978/1)). The quick start warns: "Leaving this in Automatic may not produce the results you desire" ([quick start](https://forum.shotcut.org/t/quick-start-guide/12977)).
- **Three editing modes:** Timeline, Playlist or Source.
- **Export:** the Export panel › Default › Export File.

### Strengths, gaps, and difficulty for a CapCut user

- **Strengths:**
  - The fastest-moving open editor: 7 stable releases in 2026.
  - Built-in local Whisper with no Python.
  - Reframe to 9:16.
  - Elements library.
  - HDR and 10-bit.
  - Ducking and noise reduction.
- **Gaps:**
  - Text-as-a-filter confuses beginners.
  - No AI background removal.
  - Text to speech needs Docker.
  - Regressions: v26.11.15 fixed 9 bugs marked "broke in v26.9", among them crashes, scratchy audio and slow clip moves ([release notes](https://github.com/mltframework/shotcut/releases/tag/v26.11.15)).
- **Difficulty for a CapCut user: medium-high.** It works, but the filter model and the panels are unlike CapCut's.

### What users say

| Tone | Quote | Source, date |
|---|---|---|
| Good | "The best that free and open source has to offer as far as video editing is concerned." | [AlternativeTo](https://alternativeto.net/software/shotcut/reviews/), 2026-01-02 |
| Good | "export in some cases is several times faster than similar apps without hardware support" | AlternativeTo, 2024-08-15 |
| Good | G2 4.2 (42 reviews); Capterra 4.5 (about 77) | [G2](https://www.g2.com/products/Shotcut/reviews), [Capterra](https://www.capterra.com/p/173467/Shotcut/reviews/), *snippets* |
| Meh | "Much more intuitive than the KDEnlive in details. Crappy performance." | AlternativeTo, 2026-03-26 |
| Meh | Interface "cramped and messy" (Windows portable) | Capterra, *snippet*, undated |
| Bad | "It's not very intuitive, but above all, it's IMPOSSIBLE to do what I wanted with the markers" | AlternativeTo, 2026-05-15 |
| Bad | "will freeze/crash on simple tasks, like editing keyframes or pressing ctrl-z for undo" | AlternativeTo, 2024-02-22 |
| Bad | Memory climbs from about 8 GB to 20 GB, then it crashes (v25.12.31) | [Shotcut forum](https://forum.shotcut.org/t/shotcut-25-12-31-memory-leak-or-high-memory-usage/50935) |

### Official docs and screenshots

- [Features](https://shotcut.org/features/)
- [Video tutorials](https://shotcut.org/tutorials/)
- [How-tos and PDF](https://shotcut.org/howtos/)
- [Docs index](https://forum.shotcut.org/t/table-of-contents/43285)
- [New project](https://forum.shotcut.org/t/new-project/12978/1)
- [Subtitles panel](https://forum.shotcut.org/t/subtitles-panel/45312/1)
- [Speech to text](https://forum.shotcut.org/t/speech-to-text-subtitles/46306)
- [Elements](https://forum.shotcut.org/t/view-elements/51801)
- [Chroma key](https://forum.shotcut.org/t/chroma-key-advanced/12834/1)
- [Motion tracker](https://forum.shotcut.org/t/motion-tracker-video-filter/40784/1)
- [Reframe](https://forum.shotcut.org/t/reframe-output-video-filter/45832/1)
- [Export](https://forum.shotcut.org/t/export-basics/12953/1)
- [Hardware encoding](https://forum.shotcut.org/t/hardware-encoding/12955/1)

---

## 4. OpenShot

### Features by workflow

Rows from the [features page](https://www.openshot.org/features/) and [release notes](https://github.com/OpenShot/openshot-qt/releases) unless another source is linked.

| Workflow | What it does |
|---|---|
| Import and media | FFmpeg import, unlimited tracks. Recording View for screen, webcam, mic and system audio (4.0, 2026-08-30). **Auto-Optimize** makes 720p editing copies of 4K+ footage (4.1) |
| Timeline editing | Native Qt timeline (3.5 → 4.0): trim, slice, snap, keyframe panel, marker navigation. No ripple or roll editing found (*unverified*) |
| Text and titles | Over 40 SVG title templates. Blender 3D animated titles. **On-screen text editing in the preview** (4.1, 2026-10-31). Copy and paste text styles |
| Captions | A Caption effect (manual). Automatic captions only through a ComfyUI Whisper workflow that exports SRT ([AI guide](https://www.openshot.org/static/files/user-guide/ai.html)) |
| Templates | Title templates. Clip-menu presets for motion, camera moves, color, film looks, lighting and audio (4.0). Emoji library |
| Effects | Effects library. 10 new in 4.0 ([AlternativeTo news](https://alternativeto.net/news/2026/9/openshot-4-0-adds-color-and-recording-views-local-ai-powered-masks-and-10-new-effects/)). Color View with wheels, curves, LUTs and scopes (4.0) |
| Transitions | Over 400 patterns; overlapping clips makes one automatically |
| Keyframes | Linear, constant and Bezier, editable on the timeline |
| Green screen and background removal | Chroma key. **Object Mask (4.0), run locally:** click positive and negative points, and it tracks the subject using YOLO, EfficientSAM and Cutie models ([UbuntuHandbook](https://ubuntuhandbook.org/index.php/2026/08/openshot-4-0-released-with-audio-video-recording-local-ai-masks/), 2026-08) |
| Audio | Waveforms, audio visualisers, channel controls. ComfyUI audio clean-up (DeepFilterNet, LavaSR) |
| AI | Local: Object Mask and Object Detection (4.0). Through ComfyUI (3.5): SDXL images, WAN video, Stable Audio and Ace-Step music, 4x upscaling, frame interpolation, scene detection, Whisper SRT. **ComfyUI needs an "RTX 5070 12GB or better", "64GB+ RAM", "200GB free space"** ([AI guide](https://www.openshot.org/static/files/user-guide/ai.html)) |
| Aspect ratios and reframing | Profiles (a docs page). No automatic reframe found |
| Export | Default settings "work for most". Live checks of export settings (4.1). GPU presets for AMD AMF and HEVC NVENC/QSV (4.1.1) |
| Hardware acceleration | Hardware decoding check (3.5). GPU export with a CPU fallback (4.1.1). Blender GPU rendering of titles |
| Automation | **CLI for "scripts, or AI agents such as Claude Code and Codex"** (4.1, experimental) ([Phoronix](https://phoronix.com/news/OpenShot-4.1-Released), 2026-10-31) |

### UI and first run

- **Layout** ([main window docs](https://www.openshot.org/static/files/user-guide/main_window.html)):
  - Tabs for Project Files, Transitions, Effects and Emojis.
  - Preview window.
  - Timeline.
  - Views: Simple, Color and Recording.
- **First run:** "When you first launch OpenShot, you will be presented with a friendly built-in tutorial."
- **Quick tutorial**, five steps ([docs](https://www.openshot.org/static/files/user-guide/quick_tutorial.html)):
  1. Drag files in.
  2. Drag them to the timeline.
  3. Add music.
  4. Preview.
  5. Click Export Video.

### Strengths, gaps, and difficulty for a CapCut user

- **Strengths:**
  - The simplest first run of the open editors.
  - Moving fast in 2026: recording, color, local AI masks, on-screen text, a CLI for agents.
- **Gaps:**
  - Stability: AlternativeTo 2.7/5, the worst here. "OpenShot 4.0.0 does not start on macOS" was the most up-voted 2026 issue ([#6099](https://github.com/OpenShot/openshot-qt/issues/6099), 2026-08-31). An arbitrary-code-execution report on crafted project files ([#6249](https://github.com/OpenShot/openshot-qt/issues/6249), 2026-11-14).
  - Generative AI needs a workstation.
- **Difficulty for a CapCut user: low-medium.** Simple layout, but missing CapCut's text and caption styles.

### What users say

| Tone | Quote | Source, date |
|---|---|---|
| Good | "This is quick, Very easy to use with no experience made a great vid!" | [AlternativeTo](https://alternativeto.net/software/openshot/reviews/), 2025-03-02 |
| Good | "Very easy tool for beginners." | AlternativeTo, 2024-07-27 |
| Meh | "Linux needs the interface of OpenShot. If it was just a bit more stable" | AlternativeTo, 2026-11-02 |
| Meh | "OpenShot missing some things like animated text and etc" | AlternativeTo, 2024-01-13 |
| Bad | "shows various bugs such as the disappearance of materials from the timeline." | AlternativeTo, 2024-09-03 |
| Bad | About 3–4 crashes in a 10-minute project edit | [FluxNote](https://fluxnote.io/guides/openshot-review-honest-2026), April 2026 (method not described) |
| Bad | Comment summary: "frequent crashes, slow performance, and issues with exporting, particularly on Windows" | AlternativeTo page summary |

### Official docs and screenshots

- [Quick tutorial](https://www.openshot.org/static/files/user-guide/quick_tutorial.html)
- [Main window](https://www.openshot.org/static/files/user-guide/main_window.html)
- [Titles](https://www.openshot.org/static/files/user-guide/titles.html)
- [Effects](https://www.openshot.org/static/files/user-guide/effects.html)
- [Transitions](https://www.openshot.org/static/files/user-guide/transitions.html)
- [Animation/keyframes](https://www.openshot.org/static/files/user-guide/animation.html)
- [Color](https://www.openshot.org/static/files/user-guide/color.html)
- [Recording](https://www.openshot.org/static/files/user-guide/recording.html)
- [Export](https://www.openshot.org/static/files/user-guide/export.html)
- [AI/ComfyUI](https://www.openshot.org/static/files/user-guide/ai.html), with screenshots `_images/create-with-ai.jpg` and `_images/comfyui-tracking-dialog-blue-red-dots.jpg`

---

## 5. OpenCut

Already known (not redone): MIT licence, 98,766 stars, v0.3.0 on 2026-04-15, last push 2026-09-24, classic editor archived May 2026.

### Features (classic editor, still running at opencut.app)

| Workflow | What it does | Source |
|---|---|---|
| Panels | Media, Sounds, Text, Stickers, Effects, Transitions, Captions, Adjustment, Settings (background) | [classic source, assets-panel-store.tsx](https://github.com/opencut-app/opencut-classic) |
| Captions | **Whisper running in the browser** (transformers.js): Tiny, Small (the default), Medium, and Large v3 Turbo ("requires WebGPU for good performance") | classic source, `transcription/models.ts` |
| Keyframes and masks | Keyframe toggles in Properties. Shape masks: rectangle, ellipse, heart, star, split, cinematic bars | classic source |
| Privacy | "Your videos stay on your device" | [classic README](https://github.com/opencut-app/opencut-classic) |
| Export limits, green screen, background removal | Not checked (*unverified*) | — |

### The rewrite

- **Planned** ([README](https://github.com/OpenCut-app/OpenCut)): an Editor API, plugins first, a Rust core for desktop, mobile and browser, an MCP server, a headless mode, and a scripting tab.
- **Status:** "not set up to take outside contributions". The desktop shell was scaffolded on 2026-07-24, and the last code before the FFmpeg CI work (2026-09-24) was on 2026-08-01.
- **Usability:** [new.opencut.app](https://new.opencut.app/) shows no usable editor content.

### UI and first run

- **Classic:** a browser editor. Asset tabs on the left, preview, properties on the right, timeline at the bottom (from the source). Nothing to install.
- **Desktop shell (rewrite):** browser, preview, inspector and timeline panels (commit 2026-07-24).

### Strengths, gaps, and difficulty for a CapCut user

- **Strengths:**
  - CapCut-like panel model.
  - Local in-browser Whisper.
  - Huge mindshare.
- **Gaps:**
  - No shipping desktop app.
  - The rewrite is silent.
  - Not taking outside contributions.
- **Difficulty for a CapCut user: low** for the classic web editor. It's the closest to CapCut, but frozen.

### What users say

- "95K+ Starts and not active development?" ([#916](https://github.com/OpenCut-app/OpenCut/issues/916), 2026-10-20, 7 up-votes)
- "If the original vision... has been abandoned... please inform your global user base" ([#920](https://github.com/OpenCut-app/OpenCut/issues/920), 2026-11-02)
- **Most up-voted requests:** a native mobile app (#14, 18 up-votes), Chinese language (#601, #662), Docker images (#333, #745).
- **New bugs:** captions don't wrap for Chinese, Japanese and Thai (#924), and SRT encoding (#925), both 2026-11-15.
- **Product Hunt:** "No reviews yet" (24 up-votes) ([page](https://www.producthunt.com/products/opencut/reviews)).

---

## 6. Olive

- **Status:**
  - README: "Olive is alpha software and is considered highly unstable."
  - Last release 0.2.0-nightly on 2024-12-05, and the last commit that same day ([GitHub](https://github.com/olive-editor/olive)).
  - The website now says only "Olive will return..." ([olivevideoeditor.org](https://olivevideoeditor.org/)).
  - AlternativeTo marks it "Discontinued".
- **Features:** a node-based compositor in a Premiere-like layout ([wiki overview](https://github.com/olive-editor/olive/wiki/Overview-Guide); [screenshot](https://olivevideoeditor.org/img/020-2.png)). Feature details were not re-checked because the site no longer lists them (*unverified*).
- **What users say:**
  - "Very promising, Olive has lots of potential" (AlternativeTo, 2024-10-03).
  - "full of bugs, which for me makes it unusable" (AlternativeTo, 2023-12-15).
  - "has been coming out for years now, but never has!" (2021-09-28) ([AlternativeTo](https://alternativeto.net/software/olive-video-editor/reviews/)).
  - GitHub [#2395](https://github.com/olive-editor/olive/issues/2395), "Olive Development Ceased?" (2025-12-01). A contributor replied that "the project was just becoming too large for one person to reasonably maintain" (2026-04-02).
- **Lesson for us:** a one-person, from-scratch engine stalls. Build on maintained libraries.

---

## 7. LosslessCut

- **What it is:** "the ultimate cross platform FFmpeg GUI for extremely fast and lossless operations." It is not an editor: there are no effects, titles, transitions or compositing ([README](https://github.com/mifi/lossless-cut), [features](https://losslesscut.app/docs/features)).
- **Features:**
  - Lossless cut and merge, track add/remove/extract, and remux.
  - Segments, chapters, and EDL/CSV/SRT import and export.
  - Black, silence and scene detection.
  - Metadata editing.
  - Lossless crop and aspect-ratio override (3.69).
  - Experimental "smart cut".
  - A CLI and an HTTP API.
  - An FFmpeg `-hwaccel auto` setting (3.69).
  - System theme (3.70).
- **UI and first run:** open a file, mark segments on the timeline, export ([getting started](https://losslesscut.app/docs/getting-started)).
- **Business model:** free on GitHub; paid builds in the Mac App Store ($18.99) and Microsoft Store "to support my continued work" ([README](https://github.com/mifi/lossless-cut)). This is a working model for paid store builds of a free open-source app.
- **What users want:** the most up-voted issues are "Implement smart cut" (#126, 120 up-votes), "Implement lossy operations" (#372, 63) and "Non-linear editor (NLE) with multiple files" (#976, 19). Users pull it toward being an editor.
- **What users say:**
  - "It's a simple cut video without recode. Just what I needed." (AlternativeTo, 2025-06-23; 4.8/5 from 24 ratings) ([AlternativeTo](https://alternativeto.net/software/lossless-cut/reviews/)).
  - Mac App Store: "This app does that, dependably and flawlessly." versus "the developer has no concept of usability." (years not shown) ([App Store](https://apps.apple.com/us/app/losslesscut/id1505323402)).
- **Lesson for us:** lossless trim and remux is a quick-win feature for "just cut this clip" jobs.

---

## Why people try free editors, then go back to CapCut or pay

The evidence is anecdotal. No survey was found that measures switch-backs.

| Reason | Evidence |
|---|---|
| **Familiarity and ease** | A creator stays on CapCut because switching means he "has to learn a new editing program" ([Digiday](https://digiday.com/media/creators-are-split-on-whether-to-keep-using-tiktoks-editing-app-capcut-post-shutdown/), 2025-01-24). Free editors are "markedly 'funner'" in CapCut (r/VideoEditing, 2025, *snippet*). An r/CapCut user tried to leave over privacy but kept coming back for its simplicity and UI (r/CapCut "Goodbye CapCut", October 2024, *snippet*) |
| **Creative content: text effects, templates, caption styles** | A Studio user moved back to CapCut, "light years ahead" with "hundreds of text effects, animations, and transitions" (r/davinciresolve, 2025-04-16, *snippet*). A Kdenlive user asked for animated text presets, social templates and one-click effects; the maintainer replied it isn't a priority ([KDE Discuss](https://discuss.kde.org/t/kdenli-ve-capcut-vs-fi-lmora/47297), 2026-05-25). "OpenShot missing some things like animated text" (AlternativeTo, 2024-01-13) |
| **Vertical/social setup friction** | Couldn't make Resolve titles fill a vertical frame (r/davinciresolve, 2025-04-16, *snippet*). Shotcut warns that the Automatic video mode "may not produce the results you desire" |
| **Crashes and lost work** | "lost me hours of work many times due to crashes" (Kdenlive, 2025-02-07). "it will lose all of your work after crash" (Kdenlive, 2026-11-03). OpenShot 2.7/5 |
| **AI behind a paywall** | Resolve free has no captions from speech, Magic Mask or Smart Reframe; Studio costs $295 (sources above). CapCut itself moved auto captions to Pro ([Descript blog](https://www.descript.com/blog/article/capcut-captions-arent-free-anymore-heres-a-better-option), a competitor). Some pay instead: a creator was offered "export with watermark or pay the annual $50 a year" by Filmora and stopped editing ([Digiday](https://digiday.com/media/creators-are-split-on-whether-to-keep-using-tiktoks-editing-app-capcut-post-shutdown/)) |
| **Hardware and speed** | Resolve: "requires a high-end computer" (Capterra, *snippet*), 16–32 GB RAM, and free Windows/Linux has no hardware encoding. Shotcut: "Crappy performance" (2026-03-26) |
| **Why they left CapCut in the first place** (context) | The watermark "can only be removed 3 times a month for free" (r/VideoEditing, January 2025, *snippet*). CapCut's June 2025 terms over the rights to user content ([TechRadar](https://www.techradar.com/pro/popular-video-editing-app-capcut-wants-to-use-any-content-you-produce-for-free-forever-heres-what-you-should-know)). OpenCut's own pitch: "Most basic CapCut features are now paywalled" |

---

## Feature matrix

Key: **Yes** means built in and free. **Plugin** means built in but needing an extra install. **Studio** means Resolve's paid tier. **No** means not found. Sources are in each product's section.

| Feature | Resolve (free) | Kdenlive | Shotcut | OpenShot | OpenCut (classic) | Olive | LosslessCut |
|---|---|---|---|---|---|---|---|
| Free 4K export, no watermark | Yes (capped at UHD 60 fps) | Yes | Yes | Yes | *unverified* | Yes (alpha) | Yes (lossless) |
| Open source | No | GPL-3.0 | GPL-3.0 | GPL-3.0+ | MIT | GPL-3.0 | GPL-2.0 |
| Desktop: Mac, Windows, Linux | Yes (Linux limited) | Yes | Yes | Yes | No (browser) | Yes | Yes |
| Plays common MP4 (H.264/AAC) everywhere | No on Linux | Yes | Yes | Yes | Browser codecs | Yes | Yes |
| Multi-track timeline | Yes | Yes | Yes | Yes | Yes | Yes | No |
| Ripple, roll, slip trims | Yes | Yes | Ripple and roll | Partial (*unverified*) | *unverified* | *unverified* | No |
| Proxies or editing copies | Yes | Yes | Yes | Yes (Auto-Optimize) | *unverified* | Cache | — |
| On-canvas text editing | Inspector + viewer controls (*unverified*) | Separate title editor | Text filter | Yes (4.1) | Text panel (*unverified* on canvas) | *unverified* | No |
| Animated text presets | Lottie titles, templates | No | Elements (Lottie) | Blender 3D titles | *unverified* | No | No |
| Stickers and asset library | No | KDE Store presets | Elements (22 MB) | Emojis | Stickers | No | No |
| Social/project templates (CapCut-style) | No | No | No | No | No | No | No |
| Auto captions from speech | **Studio** | Plugin (Python + ~3.4 GB) | Yes (whisper.cpp) | Plugin (ComfyUI workstation) | Yes (browser Whisper) | No | No |
| Styled or animated captions | Studio (reported) | No | Typewriter burn-in | No | *unverified* | No | No |
| Caption translation | Studio (*unverified*) | Plugin (SeamlessM4T, 10 GB) | To English only | No | No | No | No |
| Text to speech | AI Speech Generator (tier *unverified*) | No | Plugin (Docker, 13.2 GB) | No | No | No | No |
| Chroma key | Yes | Yes | Yes | Yes | No | *unverified* | No |
| AI background removal | **Studio** (Magic Mask) | Plugin (SAM2) | No | Yes (Object Mask, local) | No | No | No |
| Motion tracking | Basic free; AI tracking Studio | Yes | Yes | Yes (Object Detection) | No | No | No |
| Keyframes with easing | Yes | Yes + curve editor | Yes | Yes (Bezier) | Yes | Yes | No |
| Transitions | 100+ | Wipes and compositions | Wipes, dissolves, overlays | 400+ | Yes | Basic (*unverified*) | No |
| Color grading tools | Yes (best in class) | Yes | Wheels, LUT | Color View (4.0) | Adjustment | OCIO (*unverified*) | No |
| Noise reduction (audio) | Fairlight FX (*unverified*); voice isolation Studio | Effects (*unverified*) | RNNoise | ComfyUI | No | No | No |
| Auto ducking | *unverified* | No (*unverified*) | Yes | No | No | No | No |
| Auto reframe to 9:16 | **Studio** (Smart Reframe) | No (9:16 layout only) | Reframe filter, tracking-assisted | No | No | No | Lossless crop |
| Screen/webcam recording | No (*unverified*) | Audio recording | Yes | Yes (4.0) | No | No | No |
| Hardware decoding | Mac free (*snippet*); Studio elsewhere | *unverified* | Yes (26.1) | Yes | Browser | *unverified* | Setting (3.69) |
| Hardware encoding | Mac free; Studio elsewhere | Experimental presets | Yes | Yes (4.1.1) | *unverified* | *unverified* | n/a |
| Generative AI (images, video, music) | No | No | No | ComfyUI (high-end GPU) | No | No | No |
| Online models with the user's own API key | No | No | No | ComfyUI server URL only | No | No | No |
| Scripting, CLI or agents | **Studio** (+ MCP in 21.1) | No | Scripts (26.9) | CLI for agents (4.1) | Planned (MCP, headless) | No | CLI + HTTP API |
| Beginner first-run help | Training site | Welcome screen (25.12) | New Project screen, "What's This?" | Built-in tutorial | Nothing to install | No | Getting started |

---

## Top complaints, ranked with evidence

The ranking is by how often a complaint appears across the products and sources above. The order is a judgement.

1. **Crashes, freezes and lost work.** This hits every open editor:
   - Kdenlive: 3 of 8 sampled AlternativeTo quotes, 2025–2026.
   - OpenShot: 2.7/5, "particularly on Windows"; about 3–4 crashes in 10 minutes (FluxNote).
   - Shotcut: forum crash threads, a 20 GB memory crash in v25.12.31, and 9 regressions fixed in v26.11.15.
   - Olive: "highly unstable".
   - Kdenlive shipped recovery of corrupted projects on 2026-11-07, a sign the problem is real.
2. **Hard to learn, not intuitive.**
   - Resolve: "cockpit of a 747", "steep" (Capterra).
   - Kdenlive: "UI is confusing", "Crappy on the usability side", "can sometimes feel a bit complex".
   - Shotcut: "not very intuitive", text needs a transparent clip and a filter.
3. **Missing creative content:** animated text, templates, effect packs, stickers.
   - KDE Discuss, 2026-05-25.
   - OpenShot (AlternativeTo, 2024).
   - The Resolve user who moved back to CapCut (2025-04-16).
   - No product has CapCut-style templates (matrix).
4. **AI paid or hard to set up.**
   - Resolve: Studio-only.
   - Kdenlive: Python plus about 3.4 GB, and "I need a step by step".
   - Shotcut: text to speech needs Docker, 13.2 GB.
   - OpenShot: ComfyUI on an RTX 5070-class GPU with 64 GB RAM.
5. **Slow or heavy on ordinary computers.**
   - Resolve: needs 16–32 GB RAM, and free Windows/Linux has no hardware encoding.
   - Shotcut: "Crappy performance".
   - OpenShot: lags on 4K before Auto-Optimize.
6. **Files that won't open or play right.**
   - Resolve: free Linux has no H.264/AAC; "will not import or read the vast majority of media".
   - Shotcut: variable-frame-rate phone footage is advised to be converted first ([forum](https://forum.shotcut.org/t/can-anyone-please-help-me-with-why-shotcut-is-constantly-crashing/40241), *snippet*).
7. **Projects that stall.** Olive since 2024-12. OpenCut's rewrite: "are you guys even working on this?"
8. **Sign-up friction.** Resolve's download form asks for "your full legal name and home address" (2025-09-06).

---

## Openings for an easy, AI-first, open-source editor

Ranked by how directly each one answers a top complaint and how few rivals cover it.

1. **One-click local AI, with no Python, Docker or CUDA:**
   - Bundle the runtimes.
   - Download each model inside the app, showing its size first.
   - Use the GPU on Apple Silicon (Metal), Windows and Linux (Vulkan or DirectML), and fall back to the CPU.
   - Shotcut proves whisper.cpp can be built in. Kdenlive, Shotcut's text to speech and OpenShot's ComfyUI show the alternatives users struggle with.
2. **Free auto captions that look like CapCut's:** word-by-word highlight, styles, emoji, wrapping for Chinese, Japanese and Thai, translation into any language (local or the user's key).
   - Resolve charges for captions from speech.
   - Kdenlive and Shotcut make plain subtitles.
   - Shotcut translates only to English.
   - OpenCut's caption wrapping breaks for CJK and Thai (#924).
3. **The creative library Kdenlive refuses to build:** animated text presets, caption styles, stickers, transitions, sound effects and social templates, all under open licences.
   - Shotcut's Elements shows the licence path: OFL, Lottie Simple License and Sonniss, at only 22 MB.
   - No product has templates.
4. **Free background removal and auto reframe, run locally.**
   - In Resolve both are Studio-only.
   - OpenShot's ONNX Object Mask (YOLO, EfficientSAM, Cutie) proves it runs locally on ordinary GPUs.
   - Shotcut's Reframe is semi-manual.
5. **One model switcher, local or the user's own API key.** None of the seven offers it. OpenShot accepts only a ComfyUI server URL, and Resolve's MCP is Studio-only.
6. **Never lose work:** crash-safe autosave, project recovery and stable releases. This is complaint #1 everywhere. Make "your work is safe" visible, and test before each release, unlike the 9 regressions in Shotcut's v26.11.15.
7. **Vertical-first start:** the first screen asks "TikTok/Reels/Shorts, YouTube, or Square?", sets the canvas, and keeps text inside the safe zone. The fixes in Resolve, Shotcut and Kdenlive are all hidden in settings or added late (Kdenlive's 9:16 layout came in 25.12).
8. **Works on an ordinary laptop:** proxies by default (like OpenShot's Auto-Optimize), hardware decoding and encoding on all three systems, and every common codec on Linux. Resolve's free version leaves room here.
9. **No sign-up to download or use.** Resolve asks for name and address; CapCut needs an account for many features (*unverified* for the current CapCut).
10. **Agent-ready from the start:** a CLI, a headless mode or MCP. OpenShot 4.1 and FilmCraft (below) already pitch this, and OpenCut plans it. Treat it as table stakes for "AI-first", not the main draw for CapCut users.
11. **The OpenCut vacuum:** 98,766 stars of demand and no shipping desktop app. A working, easy desktop editor can take that audience, and their top requests are mobile, Chinese and Docker.

**Licence notes** (judgement; check before reusing code):
- MLT (Shotcut and Kdenlive's engine) is LGPL-2.1, and libopenshot is LGPL-3.0. Both can be used from an AGPL-3.0 app.
- GPL-3.0 code (Shotcut, Kdenlive, OpenShot) can be combined with AGPL-3.0 under section 13 of both licences.
- LosslessCut is GPL-2.0. Whether it is "or later" was not checked, and GPL-2.0-only code cannot go into AGPL-3.0.
- OpenCut (MIT) and FilmCraft (Apache-2.0) are permissive.

---

## Also seen: a new open editor outside this list

- **FilmCraft** ([storytold/filmcraft](https://github.com/storytold/filmcraft)), from the ArtCraft team:
  - Rust, native on Mac, Windows and Linux, and in the browser through WebAssembly.
  - GitHub says Apache-2.0; the README says MIT or Apache-2.0.
  - 18,488 stars since 2026-09-30, and v0.20.1 on 2026-11-12, releasing every few days.
  - Premiere-style and professional, pitched with automation for agents.
  - Users in OpenCut's tracker point to it as more active ([#920](https://github.com/OpenCut-app/OpenCut/issues/920)).
  - It aims at Premiere users, not CapCut's easy lane, but it is the fastest-moving new rival. Worth a full look in the next research pass.
