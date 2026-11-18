# AI models and online services

This page lists the open models that can run on the user's computer, and the online services the user can reach with their own key, for every AI feature behind the editor's one model switcher. Researched 2026-11-17.

**How this was researched.** All sources are official model cards, READMEs, licence files, pricing pages and terms, read on 2026-11-17.
- The day's web-search budget ran out early, so most pages were opened directly by their address. File sizes come from the GitHub, Hugging Face and npm APIs.
- Every number is what the cited page publishes.
- *Unverified* means it could not be read on an official page. "Not published" means the official page gives no figure.
- Nothing was benchmarked on our own machines.
- Prices are in US dollars. Source keys such as [L1], [V1] and [A1] point to the lists at the end.

## Conclusion

1. **Users never install Python.** Seven engines cover every feature, and each has ready-built versions for Mac, Windows and Linux (§1):
   - whisper.cpp
   - sherpa-onnx
   - ONNX Runtime
   - node-llama-cpp
   - the ncnn-Vulkan programs
   - stable-diffusion.cpp
   - FFmpeg's own filters
2. **Every default model's licence lets an AGPL-3.0 app download and run it.** The licences are MIT, Apache-2.0, BSD-3, CC-BY-4.0 (credit the author) or GPL-3.0 (§1.2).
3. **Leave out these models:**
   - **Non-commercial weights**, because many creators earn money from their videos: NLLB-200, CrisperWhisper, RMBG-2.0, F5-TTS, XTTS-v2 and MatAnyone.
   - **Region-locked weights:** HunyuanVideo 1.5 (not licensed in the EU, UK or South Korea) and the MiniMax-H3 open weights (not licensed in the US, EU, UK or South Korea).
4. **The first download is small: about 0.7 GB.** It covers captions in 25 European languages, speaker labels, silence cuts, voice clean-up, person cut-out and voice-over on every computer:

   | Model | Size |
   |---|---|
   | Parakeet int8 | 464 MiB |
   | Kokoro int8 | 140 MiB |
   | Speaker models | 35 MiB |
   | DPDFNet | 10 MiB |
   | MODNet | 13 MB |
   | Silero | about 2 MB |

   Larger models download the first time a feature is used: Whisper turbo (547 MiB, 99 languages), the translation model (2.5 GB), the upscaler (43–49 MiB) and RIFE.
5. **Generating video on the computer only works on big NVIDIA cards.** Wan 2.2 TI2V-5B needs at least 24 GB of graphics memory and takes "under 9 minutes" for 5 s of 720p [L56]. Everyone else uses online models.
6. **Online, support two aggregators first:**
   - **OpenRouter.** The user signs in instead of pasting a key, and pays makers' prices plus a 5.5% fee on top-ups. It covers video, captions, voices and translation.
   - **fal.** It has the widest video catalogue, plus video background removal and upscaling.
   - **Then**, direct keys for ElevenLabs and Deepgram, and after that Google Gemini (Omni 1.2 Flash, the cheapest video with sound at about $0.07/s for 720p).
7. **Three changes in 2026 shape the list:**
   - OpenAI shut down the Sora 2 API on 2026-09-24.
   - Google removed Veo from the Gemini API on 2026-10-22. Veo now runs only on Vertex AI or through aggregators.
   - BytePlus does not sell Seedance in the US.
8. **Using the user's own key ("bring your own key") is allowed in practice but not in words.**
   - No provider's terms forbid a person using their own key in a desktop app, and every provider forbids sharing a key.
   - So the key stays in the operating system's keychain and is sent only to the provider, never to us.
   - Runway wants "Powered by Runway" shown. Luma's wording is the strictest. OpenRouter is the only one built for this.

---

## 1. How models run inside the app

### 1.1 Engines

| Engine | Licence | Runs | Mac (Apple silicon) | Windows | Linux | Source |
|---|---|---|---|---|---|---|
| **whisper.cpp** | MIT | Whisper models, Silero voice detection | Metal; Core ML runs the encoder on the Neural Engine, "more than x3 faster compared with CPU-only" | CUDA, Vulkan, CPU | CUDA, Vulkan, ROCm, CPU | [L1] |
| **sherpa-onnx** (Node add-on and WASM npm packages) | Apache-2.0 | Speech to text (Parakeet, Whisper, Moonshine, SenseVoice), voice detection, speaker separation, voice clean-up (GTCRN, DPDFNet), vocal separation (UVR, Spleeter), voices (Kokoro, Piper, Matcha, Kitten, ZipVoice, Pocket) | CPU. Core ML is not stated (*unverified*) | Ready-built CPU libraries. CUDA needs a build from source | Ready-built CUDA 12.8 build | [L7][L8] |
| **ONNX Runtime for Node** (`onnxruntime-node` 1.31.1, 2026-10-26) | MIT (not re-read today) | Vision models: matting, segmentation, detection | **CPU only** per the docs table | CPU, DirectML | CPU; CUDA 11.8 on x64 | [L23] |
| **ONNX Runtime Web with WebGPU**, in the app window (also what transformers.js uses) | same | Same vision models on the GPU, plus transformers.js tasks (speech to text, background removal, voices, translation) | WebGPU on Mac since Chrome 113 | Since Chrome 113 on x64; ARM64 behind a flag | Only Intel Gen12+ (Chrome 144) and NVIDIA on Wayland (Chrome 147); other GPUs behind a flag | [L12][L24][L25] |
| **node-llama-cpp** | MIT | GGUF language models, used for caption translation | Metal | CUDA, Vulkan | CUDA, Vulkan | Ready-built binaries for all three [L22] |
| **ncnn-Vulkan programs** | Real-ESRGAN: BSD-3; rife-ncnn-vulkan: MIT | Upscaling, frame interpolation | Mac build provided | Intel, AMD or NVIDIA GPU through Vulkan; no CUDA or PyTorch needed | same | [L42][L46] |
| **stable-diffusion.cpp** | MIT | Video: Wan 2.1/2.2, LTX-2.3/2.5, HunyuanVideo 1.5, MiniMax-H3. Video upscaling: SeedVR2, RelayVSR. Also image models | Metal | CUDA, Vulkan | CUDA, Vulkan | Ready-built binaries [L59] |
| **MediaPipe Tasks** (`@mediapipe/tasks-vision`) | Apache-2.0 (the repo) | Face detection, selfie segmentation | web | web | web | [L34] |
| **FFmpeg filters** | FFmpeg's own (not covered here) | `silencedetect`, `arnndn` (RNNoise), `whisper` (an FFmpeg built with whisper.cpp), `minterpolate` | | | | [L15] |

- **Electron and WebGPU.** Electron ships its own Chromium, so the Chrome versions above apply only through the Electron release's Chromium version. That mapping is *unverified* here.
- **Linux GPUs.** On Linux, plan on native engines (CUDA or Vulkan) rather than WebGPU.
- **Python-only tools, not used directly:**
  - faster-whisper: the fastest Whisper on NVIDIA, but it needs Python 3.9+ [L4].
  - pyannote.audio [L16].
  - Demucs in PyTorch [L39].
  - The official SAM 2 and SAM 3 code [L26][L27].
  - Resemble Enhance [L37].
  - Chatterbox [L51].
  - The Wan and LTX reference code [L55][L56].

### 1.2 Licences: what an AGPL-3.0 app may download and run

Model weights are data, not code, so AGPL-3.0 does not reach them. Each set of weights' own licence decides what the *user* may do with it.

| Licence | Models | Verdict |
|---|---|---|
| MIT, Apache-2.0, BSD-3 | Whisper, Kokoro, SAM 2.1, BiRefNet, MODNet, DeepFilterNet, DPDFNet, RNNoise, Demucs, Real-ESRGAN, RIFE, Wan 2.2, Qwen3, MADLAD-400 | **Yes.** Keep the notices |
| CC-BY-4.0 | Parakeet, Canary, pyannote community-1, Opus-MT | **Yes.** Credit the author in the app's credits |
| GPL-3.0 | RobustVideoMatting, the Piper engine | **Yes.** AGPL-3.0 §13 allows combining with GPLv3 work [L60] |
| AGPL-3.0 | Ultralytics YOLO, Video2X | **Yes.** Same licence as ours |
| Custom, with use rules | SAM License (SAM 3) [L27b]; Gemma terms (TranslateGemma) [L20]; LTX-2.x Community License [L54b] | **Yes, with conditions.** Hand the licence text and use rules to the user. LTX also requires that companies with $10M or more in annual revenue buy a paid licence, and that machine-generated content be labelled |
| Non-commercial | CC-BY-NC: NLLB-200 [L17], CrisperWhisper [L13], RMBG-2.0 [L29], F5-TTS weights [L53]. NTU S-Lab License: MatAnyone [L32]. Coqui CPML: XTTS-v2 [L52] | **Not as a default.** The app is free, but these licences limit the *user's* use, and many users earn from their videos. MatAnyone's and XTTS-v2's exact terms were not read (*unverified*) |
| Region-locked | HunyuanVideo 1.5: "DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA" [L57b]. MiniMax-H3: excludes the EU, UK, South Korea and the USA [L58b] | **No** for a worldwide app |

---

## 2. Local models, feature by feature

"Speed" columns quote the source's own figures. Most model pages publish no CPU or Apple-silicon timing; those cells say *not published* and need our own tests.

### 2.1 Speech to text with word timestamps

| Model | Licence (code / weights) | Disk | Memory | CPU | Apple silicon | NVIDIA | Runtime | Notes |
|---|---|---|---|---|---|---|---|---|
| **Whisper large-v3-turbo** | MIT / MIT [L3] | 1.5 GiB f16; **547 MiB q5_0** [L2]. sherpa-onnx package: 537 MiB [L9] | Not published for turbo (whisper.cpp "large": ~3.9 GB [L1]) | Not published | Core ML encoder ">x3" faster than CPU [L1]; turbo timing not published | Not published for turbo. Large-v2 with whisper.cpp on an RTX 3070 Ti: 13 min of audio in 1 min 05 s [L4] | whisper.cpp; sherpa-onnx; transformers.js on WebGPU [L12] | 99 languages; 809M parameters. Its decoder was cut from 32 layers to 4: "way faster, at the expense of a minor quality degradation" [L3] |
| **Whisper small** | MIT | 466 MiB [L2] | ~852 MB [L1] | 13 min of audio in **2 min 05 s** on an Intel i7-12700K with 8 threads, about 6× real time [L4] | Not published | — | whisper.cpp | Fallback for weak computers in non-European languages |
| Whisper base / tiny | MIT | 142 / 75 MiB [L2] | ~388 / ~273 MB [L1] | Not published | — | — | whisper.cpp | Quick previews only |
| **Parakeet TDT 0.6B v3** (NVIDIA) | CC-BY-4.0, "ready for commercial/non-commercial use" [L5] | int8 package **464 MiB** [L9] | Not published | Not published | **~190× real time on an M4 Pro** (1 hour of audio in ~19 s) through FluidAudio, a Swift library that uses the Neural Engine [L10] | RTFx 3,332.74 on the Open ASR Leaderboard (hardware not named) [L5] | sherpa-onnx (all platforms); FluidAudio (Mac only, Apache-2.0) | **25 European languages only.** Word timestamps built in; punctuation; files up to 3 hours with local attention; released 2025-08-14 [L5] |
| Canary-1B-v2 (NVIDIA) | CC-BY-4.0 [L6] | Not published | Not published | Not published | — | RTFx 749 [L6] | NeMo (Python); ONNX port *unverified* | 25 European languages. Also translates speech between English and 24 languages, with segment-level timestamps only for translations [L6] |
| Moonshine | MIT, except older non-English, non-streaming models (non-commercial) [L11] | base-en quantized 106 MiB [L9] | Not published | Built for live, low-latency use | — | — | sherpa-onnx; its own JS/WASM library | 10 languages. Word timestamps not stated |
| faster-whisper | MIT | — | — | Same test as Whisper small: 1 min 42 s at int8 [L4] | — | Large-v2, batched int8: 16 s for 13 min of audio [L4] | **Python only** | Reference figure only |

- **Pick:**
  - **Parakeet v3** for the 25 European languages, on every computer. Its word timestamps are native.
  - **Whisper large-v3-turbo q5_0** for other languages on Macs and NVIDIA PCs.
  - **Whisper small** for other languages on computers with no GPU.
- **Trap: whisper.cpp's word timestamps are "experimental".** They come from `-ml 1` [L1]. Test both models on real clips before the caption editor relies on word edges.

### 2.2 Filler words and silence

- **Silence:**
  - **Silero VAD**, a voice detector:
    - MIT, about 2 MB.
    - "less than 1ms" per 30 ms chunk on one CPU thread.
    - Trained on more than 6,000 languages [L14].
    - The README says MIT, but a badge on the same page says CC BY-NC. Read the LICENSE file before shipping.
    - whisper.cpp has it built in (`--vad`) [L1].
  - FFmpeg's `silencedetect` needs no model [L15].
- **Filler words ("um", "uh"):**
  - Whisper-type models tend to drop them. CrisperWhisper exists to keep "fillers, pauses, stutters and false starts" [L13]. But its weights are **CC-BY-NC** and cover only English and German, so leave it out.
  - Whether Parakeet keeps fillers is *unverified*. Test it.
  - **Plan (our design, untested):** find fillers in the transcript's word list, using a list per language. Also flag stretches where the voice detector hears speech but the transcript has no word.
  - Filler options in online services were not checked (*unverified*).

### 2.3 Speaker separation

| Model | Licence | Disk | Speed | Runtime | Notes |
|---|---|---|---|---|---|
| **pyannote segmentation-3.0 + 3D-Speaker CAM++ voice model** | Segmentation: MIT, gated (accept terms) [L16b]. CAM++: *unverified* | **6.6 MiB + 28.2 MiB** [L9] | Not published | sherpa-onnx Node add-on [L8] | Works on every computer class |
| NeMo TitaNet small (voice model) | *unverified* | 38.3 MiB [L9] | Not published | sherpa-onnx | Alternative voice model |
| pyannote community-1 | CC-BY-4.0, gated (Hugging Face login and accepted conditions) [L16] | — | Not published | **Python** (`pyannote.audio`); ONNX port *unverified* | More accurate: error rate on AMI meetings 17.0% vs 18.8% for 3.1; the paid precision-2 scores 12.9% [L16] |
| whisper.cpp tinydiarize | MIT | 465 MiB (small.en-tdrz) [L2] | — | whisper.cpp | English only, "experimental"; marks speaker turns, not who is speaking [L1] |
| NVIDIA Sortformer | NVIDIA Open Model License (terms not read) [L10] | — | — | FluidAudio (Mac) | — |

**Pick:** the sherpa-onnx pair (35 MiB) on every computer. Online upgrades: Deepgram (speaker labels free with Nova-3), ElevenLabs Scribe (up to 32 speakers), pyannoteAI precision-2 (price *unverified*).

### 2.4 Caption translation

| Model | Licence | Disk | Speed | Runtime | Notes |
|---|---|---|---|---|---|
| **Qwen3-4B-Instruct-2507** | Apache-2.0 [L21] | **Q4_K_M 2.5 GB**; Q8_0 4.28 GB [L21b] | Not published | node-llama-cpp (Metal, CUDA, Vulkan, CPU) | General model with 262,144-token context; number of languages not stated [L21] |
| TranslateGemma 4B (also 12B and 27B) | Gemma terms; download requires accepting Google's licence [L20] | Quantized versions exist; sizes *unverified* | Not published | node-llama-cpp | 55 languages. For the 4B on the WMT24++ test: MetricX 5.32, COMET 81.6 [L20]. Technical report 2026-01-13 |
| MADLAD-400 3B | Apache-2.0 [L18] | GGUF q4k 1.65 GB [L18] | Not published | llama.cpp support for its architecture (T5) *unverified* | 419 languages; "not been assessed for production" [L18] |
| Opus-MT (Marian), one model per language pair | CC-BY-4.0 [L19] | Per pair, *unverified* | Not published | transformers.js translation task [L12]; per-pair ONNX availability *unverified* | English→German scores 40.9 BLEU on newstest2019 [L19] |
| Canary-1B-v2 | CC-BY-4.0 | — | — | Python | Turns speech straight into translated text for European languages [L6] |
| NLLB-200 | **CC-BY-NC-4.0** | — | — | — | **Leave out:** non-commercial, "not released for production deployment" [L17] |

**Pick:** Qwen3-4B Q4_K_M through node-llama-cpp on every computer. A language model translates a whole block of captions with context. TranslateGemma 4B can replace it once its Gemma terms are read; how the two compare is *unverified*. Online: any language model through OpenRouter, or Gemini.

### 2.5 Background and person removal

| Model | Licence (code / weights) | Disk | CPU | Apple silicon | NVIDIA | Runtime | Notes |
|---|---|---|---|---|---|---|---|
| **RobustVideoMatting** (MobileNetV3 or ResNet50) | GPL-3.0 [L30] | Not published | Not published | Core ML export at fixed sizes (1280×720, 1920×1080) [L30] | **RTX 3090 FP16: 172 FPS at HD, 154 at 4K**; GTX 1080 Ti: 104 FPS at HD [L30] | ONNX Runtime (fp32 and fp16 ONNX provided); Core ML | People only. No green screen or trimap needed. Built for video: it remembers earlier frames, so edges flicker less |
| **MODNet** | Apache-2.0 [L31] | ONNX 26 MB; fp16 13 MB; uint8 7 MB [L31b] | No figure ("Fast speed on common PCs") | — | — | ONNX Runtime; transformers.js | Portraits, frame by frame |
| MediaPipe Selfie Segmenter | Repo Apache-2.0; licence on the model card *unverified* [L34] | Not published | Pixel 6 phone: **33.46 ms** per frame on CPU at 256×256 [L34] | — | — | MediaPipe Tasks | Real-time preview quality |
| **BiRefNet / BiRefNet_lite** | MIT / MIT [L28][L28b] | lite ONNX 224 MB (fp16 115 MB); full ONNX 973 MB (fp16 490 MB) [L28c] | Not published | Not published | **17 FPS at 1024×1024 on an RTX 4090** (FP16, 3.45 GB) [L28] | ONNX Runtime; transformers.js background-removal task [L12] | Any object, sharpest edges. Works frame by frame, so expect flicker without our own smoothing |
| **SAM 2.1** (tiny to large) | Apache-2.0 [L26] | tiny ONNX: encoder fp16 67 MB + decoder fp16 10 MB [L26b] | Not published | Not published | A100: tiny 91.2 FPS, large 39.5 FPS [L26] | ONNX Runtime (tracking through a video needs our own code, *unverified*); official code is CUDA and Python | Click any object and it is followed through the video |
| SAM 3 / 3.1 | SAM License: royalty-free, pass the licence on, trade-control limits [L27b] | 848M parameters | — | — | Official code needs a CUDA 12.6+ GPU [L27] | Python | Select by text ("the dog"). SAM 3.1 released 2026-03-27 |
| RMBG-2.0 (BRIA) | **CC BY-NC 4.0** | — | — | — | — | — | **Leave out** [L29] |
| BEN2 | Base model MIT; the full model is paid [L33] | — | — | — | — | — | — |
| MatAnyone | NTU S-Lab License 1.0 [L32] | — | — | — | — | — | Leave out until its licence is read (S-Lab licences are usually non-commercial, *unverified*) |

**Pick:**
- **No GPU:** RobustVideoMatting MobileNetV3 for people, with MODNet as a fallback.
- **Apple silicon and NVIDIA:**
  - RobustVideoMatting for people.
  - SAM 2.1 for "any object".
  - BiRefNet for stills and the highest-quality frames.
- **Online:** fal's video background removal, $0.008 per 30 frames [A1].

### 2.6 Voice clean-up and noise removal

| Model | Licence | Disk | Speed | Runtime | Notes |
|---|---|---|---|---|---|
| **DPDFNet** (8, 16 and 48 kHz versions) | Apache-2.0 [L38] | 8.3–13.9 MiB; **48 kHz HR 10.1 MiB** [L9] | Not published | sherpa-onnx (Denoiser API) [L8] | Packages dated 2026-03 |
| GTCRN | *unverified* | **0.5 MiB** [L9] | Not published (very small model) | sherpa-onnx | 16 kHz |
| DeepFilterNet 3 | MIT or Apache-2.0, code and weights [L35] | Command-line program 25–37 MiB [L35b] | Not published | Its own Rust program; LADSPA plugin | 48 kHz full band. **Last release v0.5.6 on 2023-08-31**, a maintenance risk [L35b] |
| RNNoise | BSD-3 [L36] | Small (not published) | Not published | FFmpeg `arnndn` filter [L15] | 48 kHz. The lightest option |
| VoxLock | *unverified* | int8 69.1 MiB (2026-10-26) [L9] | — | sherpa-onnx | Newest model in that release |
| Resemble Enhance | MIT code; weights licence not stated [L37] | — | — | **Python** | Removes noise and restores missing high frequencies ("bandwidth extension"); trained at 44.1 kHz |

**Pick:** DPDFNet 48 kHz HR on every computer, and RNNoise for fast previews. Online clean-up services were not researched (*unverified*).

### 2.7 Music and voice separation

| Model | Licence | Disk | Speed | Runtime | Notes |
|---|---|---|---|---|---|
| **UVR MDX-Net** (e.g. `Voc_FT`) | Credit under MIT to UVR; licences of individual model files not stated [L41] | 28–64 MiB each; **Voc_FT 63.6 MiB** [L9] | Not published | sherpa-onnx; ONNX Runtime | Two parts: voice and instrumental |
| Spleeter, 2 parts | *unverified* | fp16 33.6 MiB [L9] | Not published | sherpa-onnx | Fast, lower quality (*unverified*) |
| **Demucs v4** (`htdemucs`) | MIT [L39] | Not published | PyTorch on CPU: about **1.5× the track's length**. GPU needs at least 3 GB (about 7 GB at default settings) [L39] | **demucs.cpp** (C++ with Eigen, no Python; "sacrificing the speed of the Torch implementation" for low memory) [L40] | Four parts (vocals, drums, bass, other); separation quality (SDR) 9.00 dB. **Repo archived 2025-01-01** [L39] |
| BS-RoFormer / Mel-Band RoFormer | Licences vary by model file, not stated [L41] | — | — | Python `audio-separator` (CUDA, MPS, ONNX with Core ML) | Check each model's licence before use |

**Pick:** UVR MDX-Net Voc_FT (63.6 MiB) for isolating voice on every computer, and Demucs through demucs.cpp for four parts. Online prices for Demucs-type models were not checked.

### 2.8 Upscaling

| Model | Licence | Disk | Speed | Runtime | Notes |
|---|---|---|---|---|---|
| **Real-ESRGAN** (`realesr-general-x4v3`, `x4plus`, `animevideov3`) | BSD-3 [L42] | **4 MiB** (general-x4v3); 2 MiB (animevideov3); the whole program with its models is 43–49 MiB (2022-04-24 release) [L42b] | **Not published** | Mac build available (whether it runs through MoltenVK is *unverified*) | Portable ncnn-Vulkan program; works on Intel, AMD or NVIDIA GPUs | Needs a Vulkan GPU, but a built-in one is enough. Defaults to fp16; tiling optional [L42] |
| Real-CUGAN, Anime4K | Video2X is AGPL-3.0 [L43] | — | — | — | Video2X runs on Windows and Linux only and needs AVX2 and Vulkan [L43] |
| SeedVR2-3B (also 7B) | Apache-2.0 [L44] | Not published | Not published | stable-diffusion.cpp [L59] | One-step diffusion video restoration. Graphics memory needed: not published |

**Pick:** Real-ESRGAN general-x4v3 on every computer with a GPU, including built-in ones. SeedVR2 is the high-end option on big NVIDIA cards once tested. Online: fal's SeedVR2 at $0.001 per megapixel [A1].

### 2.9 Frame interpolation

| Model | Licence | Disk | Speed | Runtime | Notes |
|---|---|---|---|---|---|
| **RIFE v4.6** (`rife-ncnn-vulkan`) | MIT [L46] | Program with every model: 411–416 MiB (2022-10-29 release) [L46b]; one model alone *unverified* | Not published | ncnn-Vulkan | Newer RIFE 4.25/4.26 exists only in PyTorch (Practical-RIFE, MIT; it recommends 4.25) [L45] |
| FILM (Google) | Apache-2.0 code; weights licence not stated [L47] | — | — | TensorFlow 2 with CUDA | Built for large motion |
| FFmpeg `minterpolate` | — | No model | — | FFmpeg [L15] | Fallback without a GPU |

**Pick:** RIFE v4.6 through ncnn-Vulkan, and `minterpolate` on computers without Vulkan.

### 2.10 Auto reframe and face tracking

| Model | Licence | Size | Speed | Runtime | Notes |
|---|---|---|---|---|---|
| **MediaPipe BlazeFace** (short-range, full-range, sparse) | Repo Apache-2.0; model card licence *unverified* [L34c] | Not published (sparse is "roughly 60% smaller") | Pixel 6 phone: **2.94 ms on CPU** for short-range [L34b] | `@mediapipe/tasks-vision` | Faces |
| **Ultralytics YOLO26n** (detection, pose, segmentation) | AGPL-3.0, or a paid Enterprise licence [L48] | 2.4M parameters (detection) | **38.9 ms on CPU** through ONNX at 640 px; 1.7 ms on an NVIDIA T4 with TensorRT [L48] | ONNX Runtime | People, objects, body pose. Same licence as ours |
| AutoFlip | — | — | — | — | Appears only as a publication, not a current MediaPipe solution [L34c]. Its approach (detect, then smooth a crop path) is ours to rebuild |

**Pick:** BlazeFace for faces and YOLO26n for people, with our own crop-path smoothing. Both run on the CPU on every computer.

### 2.11 Text to speech

| Model | Licence | Disk | Speed | Runtime | Notes |
|---|---|---|---|---|---|
| **Kokoro-82M** v1.0/v1.1 | Apache-2.0; trained only on permissively licensed or synthetic audio [L49] | **int8 multi-language 140 MiB**; full 347 MiB [L9]. ONNX fp16 163 MB, q8 92.4 MB [L49b] | Not published | sherpa-onnx; `kokoro-js` | 8 languages and 54 voices (v1.0); 24 kHz |
| **Piper** voices | Engine GPL-3.0 (`piper1-gpl`). Each voice has its own licence; the docs list only voices whose whole training chain allows commercial use, and many were retrained late in 2026 [L50] | Small (per voice, not published) | Not published | sherpa-onnx | Ship each voice's `MODEL_CARD` with it [L50b] |
| Chatterbox (Turbo 350M, Multilingual 500M, Nano 110M) | MIT [L51] | — | Nano: "3x faster than realtime on 8 CPU cores" [L51] | **Python** | Copies a voice from a short clip and watermarks every output (Perth). **Retired and unmaintained since August 2026** [L51] |
| Pocket TTS, ZipVoice (voice copying in sherpa-onnx) | *unverified* | — | — | sherpa-onnx [L8] | Read their licences before offering |
| XTTS-v2 | Coqui Public Model License [L52] | — | — | — | Leave out until the licence is read |
| F5-TTS | Code MIT; **weights CC-BY-NC** [L53] | — | — | — | **Leave out** |

**Pick:** Kokoro on every computer, and Piper's commercially cleared voices for languages Kokoro lacks. Voice copying goes online only: ElevenLabs, or Gemini with a recorded consent statement (§3.4).

### 2.12 Video generation

| Model | Licence | Disk | Graphics memory | Speed | Runtime | Notes |
|---|---|---|---|---|---|---|
| **Wan 2.2 TI2V-5B** | Apache-2.0 [L56] | *unverified* | **At least 24 GB** (e.g. RTX 4090) [L56] | 5 s of 720p "in under 9 minutes on a single consumer-grade GPU" [L56]; Mac speed *unverified* | stable-diffusion.cpp (CUDA, Vulkan, Metal) [L59] | 720p at 24 fps; text or image to video; released 2025-07-28. **No newer Wan has open weights** [L56b] |
| Wan 2.2 A14B (text to video, image to video) | Apache-2.0 | — | — | — | stable-diffusion.cpp | Two 14B experts, 27B total with 14B active; 480p or 720p [L56] |
| **LTX-2.5** (about 22B), distilled | LTX-2.x Community License, 2026-08-11, amended 2026-10-29 [L54b] | The full set is "roughly 66 GiB" [L54] | Not published; fp8 and CPU or disk offloading help smaller cards [L54] | No official figure. The brief's blog figure for LTX-2 is 45–90 s at 768×512 on an RTX 4090, not re-checked | stable-diffusion.cpp; ComfyUI (Python) | Video and sound from one model; several shots in one clip; 4K through a 2× upscaler [L55c]. Conditions: pass the agreement on; companies with $10M or more in annual revenue need a paid licence; label output as machine-generated; no deepfakes without consent [L54b] |
| HunyuanVideo 1.5 (8.3B) | Tencent Hunyuan Community: excludes the EU, UK and South Korea [L57b] | — | 14 GB with offloading [L57] | Distilled 480p image-to-video "within 75 seconds" on an RTX 4090 [L57] | stable-diffusion.cpp | **Leave out** (region-locked) |
| MiniMax-H3 (33B open weights, 2026-07-28) | MiniMax H3 Community: excludes the US, EU, UK and South Korea [L58b] | — | Not published | Not published | stable-diffusion.cpp | **Leave out** (region-locked). Video with stereo sound, 4–15 s [L58] |

**Pick:**
- **NVIDIA with 24 GB or more:** Wan 2.2 TI2V-5B through stable-diffusion.cpp, labelled "takes minutes". LTX-2.5 distilled comes second, once its graphics memory need is measured.
- **Every other computer:** online models.

---

## 3. Online models with the user's own key

### 3.1 Video generation providers

All prices are per second of finished video unless stated. Sources: [V*].

| Provider | Models (Nov 2026) | Price | Text / image to video | Length, resolution, sound | Key for one person | Own key in the terms |
|---|---|---|---|---|---|---|
| **Google Gemini API** (AI Studio key) | `gemini-omni-1.2-flash`. Veo was shut down here on 2026-10-22 [V3] | 360p $0.023 · **720p ~$0.07** · 1080p $0.104 · 4K $0.209 [V1] | Both; also first/last frame, up to 6 reference images, editing, extending [V2] | Up to 15 s, extendable to 30 s. 1080p and 4K are upscaled. Sound included [V2] | Google account; billing with at least $5 prepaid; no free tier for Omni; 18+ [V1][V4][V24] | Silent. Keys "are intended to be used by you" [V25]. Also "not for consumer use" [A27] |
| **Google Vertex AI** | Veo 3.1, 3.1 Fast, 3.1 Lite [V5] | Veo 3.1: $0.40 with sound, $0.20 without; 4K $0.60. Fast: $0.10–0.30. **Lite: 720p $0.05, 1080p $0.08 with sound** [V5] | Both; first/last frame, reference images, extending [V6] | 4, 6 or 8 s; up to 4K; region `us-central1` only; English prompts only [V6] | Google Cloud project with billing; harder for a desktop app (*unverified* whether simple API keys can run Veo) | Not checked |
| **Kling** (kling.ai) | Kling 4.0, 4.0 Flash, 3.0 Turbo, 3.0, 3.0 Omni, O1, 2.6, 2.5 Turbo [V8] | 4.0: 720p $0.157, 1080p $0.235 · 4.0 Flash 720p $0.094 · 3.0 720p $0.084 without sound, $0.126 with · **2.6 and 2.5 Turbo 720p $0.042** [V7] | Both; first/last frame; 4.0 takes up to 10 keyframes [V8][V9] | 4.0: 3–30 s at 720p or 1080p. 3.0: 3–15 s, up to 4K. Sound on 4.0, 4.0 Flash, 3.0 Turbo and 3.0 [V8][V9] | Kling account by email; buy a prepaid pack (pack prices *unverified*) [V9][V9a] | "shall not transfer, rent, lend, disclose or leak the Key to any third party" [V23] |
| **Runway** | Gen-4.5, Gen-4 Turbo, Aleph 2.0, Act-Two, **plus Kling 4.0, Seedance 2.5, Veo 3.1, Gemini Omni, MiniMax H3, Wan 3.0, Grok Imagine** [V10] | Gen-4.5 $0.12 · Gen-4 Turbo $0.05 · Aleph 2.0 $0.28 · Veo 3.1 $0.40 · Wan 3.0 720p $0.10 · Kling 4.0 720p $0.157 [V10] | Gen-4.5: both. Gen-4 Turbo: image. Aleph: edits existing video [V10] | Gen-4.5 limits not stated; partner models keep their own [V10] | Sign up; **at least $10** of credits; no free API credits [V11] | Apps must "prominently display 'Powered by Runway'"; keys "for your use only" [V11b] |
| **Luma** | `ray-3.2` [V12] | In credits: 5 s at 720p = 100, at 1080p = 400; HDR doubles it. Dollars per credit not published (*unverified*) [V12][V12a] | Both; first/last frame, up to 64 keyframes, extending [V12b] | 5 or 10 s; up to 1080p; HDR and EXR; sound not mentioned [V12b] | Pay as you go; no minimum; no free tier [V13] | "shall not share, transfer, or disclose API Credentials"; FAQ says never "ship them to client-side code" [V13][V14] |
| **MiniMax** (Hailuo, now H3) | H3, H3-Highspeed, H3-Lite, H3-Max; Hailuo 2.3 and 02 [V15] | H3: 768p $0.08, 2K $0.13 · **Lite: 480p $0.025, 768p $0.04** · Hailuo 2.3: $0.28 per 6 s clip [V15] | Both; first/last frame; image, video or audio references [V16] | 4–15 s; 768p or 2K; "native stereo sound" [V16][V17] | Register, create a key, top up; minimum top-up *unverified* [V16b] | Terms page did not load: *unverified* |
| **Seedance** (BytePlus ModelArk) | Seedance 2.5, 2.5 Flash, 2.0, 2.0 Mini [V18] | 2.5: 720p $0.231, 1080p $0.569 · 2.0 Mini 720p $0.08 [V18] | Both; first/last frame, extending, editing [V19] | 2.5: 4–30 s, up to 4K, sound [V19] | **Not sold in the US** [V21][V22] | Bars building it into "AI content creation tools" for others [V22] |
| **Alibaba Wan** (Model Studio) | wan3.0-video, wan3.0-video-prime, wan2.7, wan2.6, HappyHorse [V26a] | wan3.0: 480p $0.05, **720p $0.10**, 1080p $0.20 (30% off for a limited time) [V26a] | Both, plus reference-to-video [V26b] | Wan 3.0: 2–30 s, up to 1080p, with sound [V10][V26b] | Alibaba Cloud account; 30 s free on Wan 3.0 (Singapore region), valid 90 days [V26c] | Its key docs explain using the key "from third-party tools" [V26] |
| **OpenAI Sora** | **None.** The Sora 2 API shut down 2026-09-24 with "No one-to-one replacement" [V27][V28] | — | — | — | — | — |
| xAI Grok Imagine | `grok-imagine-video-1.5` $0.08 · `-1.5-lite` **$0.02** [V29] | — | — | Not stated | — | Not checked |

Vidu and PixVerse are priced in credits that could not be converted (*unverified*) [V31][V32]. Pika and Hunyuan's API were not checked.

### 3.2 Aggregators: one key, many models

Sources: [A*].

| Aggregator | Video models | Markup vs the maker | How one person gets a key | Also offers | Own key in the terms |
|---|---|---|---|---|---|
| **OpenRouter** | 35, including Veo 3.1 (all three), Kling 3.0 and O1 (**no Kling 4.0**), Seedance 2.5/2.0, Hailuo, Wan 3.0/2.7, Runway Gen-4.5 and Aleph, Grok Imagine, Gemini Omni [A18] | None: "without any markup", plus a **5.5% fee on credit purchases** ($0.80 minimum) [A19] | Sign up; "a small free allowance" [A19]. **OAuth PKCE sign-in lets our app get a key from the user's own account** [A20] | Speech to text (30 models, incl. Nova-3, Scribe, Parakeet; speaker labels and word timestamps where supported), voices (39), video upscaling, language models [A22][A23] | **Built for it**: "Let users bring their own OpenRouter API key and pay for their own inference" [A20]. Reselling access is barred; a user's own key is not resale [A24] |
| **fal** | The widest: Kling 4.0/3.0/O3, Veo 3.1, Seedance 2.5/2.0, MiniMax H3, Hailuo 2.3, Wan 3.0, **LTX-2.3/2.5, Luma Ray 3.2**, PixVerse V6, Grok Imagine [A1][A11] | None on Veo 3.1, Kling 4.0, Wan 3.0 and Hailuo 2.3. More on Seedance (about 2×), Veo 3.1 Fast (+25%), Scribe (2.4×) and ElevenLabs voices (+25%) [A1–A10] | Prepaid credits that expire after 365 days; new accounts get 2 concurrent requests [A12] | **Video background removal $0.008 per 30 frames**, SeedVR2 upscaling $0.001 per megapixel, Scribe, ElevenLabs voices and dubbing [A1][A10] | Silent: "for your own personal or internal business use"; no sharing credentials [A13] |
| Replicate | 81 text-to-video entries, including **Runway Gen-4.5** and Luma Ray 3.2 [A15] | Usually none; **Kling 3.0 costs 2× fal's price** [A14] | **GitHub sign-in required** [A17]; prepaid credit [A16b] | Speech to text, voices, upscalers (Topaz, SeedVR2, Real-ESRGAN), background removal including RobustVideoMatting [A15] | Silent; no sharing credentials [A17] |
| WaveSpeedAI, Runware | Large catalogues at list prices [A32][A33] | — | $1 free credit (WaveSpeed); $2 with a business email (Runware) | — | WaveSpeed terms not found; Runware silent |
| Together AI | About 20; **no Kling** [A34] | Price units unclear | **$15 minimum first purchase** [A34] | Whisper/Parakeet at $0.0015/min; Kokoro voices at $4 per million characters [A34] | Silent |
| AIMLAPI | Broad [A35] | Veo 3.1 $0.52 vs Google's $0.40 (+30%) [A35] | Free tier "currently paused" [A35] | — | Terms not found |
| Eden AI | — | 0% markup plus a 5.5% fee [A37] | — | — | **Excludes consumers**: "exclusively for professional use" [A37] |

**Same model, different seller (per second):**

| Model | Maker | OpenRouter | fal | Replicate |
|---|---|---|---|---|
| Veo 3.1 with sound | Google Cloud $0.40 | $0.40 | $0.40 | $0.40 |
| Veo 3.1 Fast with sound | $0.10 (720p) | $0.10 | $0.15 | $0.15 |
| Kling 3.0 Pro without / with sound | *unverified* | $0.112 / $0.168 | $0.112 / $0.168 | $0.224 / $0.336 |
| Kling 4.0 at 720p / 1080p | $0.157 / $0.235 [V7] | not carried | $0.157 / $0.235 | $0.157 / $0.235 |
| Wan 3.0 at 1080p | Alibaba $0.20 | $0.20 | $0.20 | $0.14 |
| Hailuo 2.3, 6 s clip at 768p | MiniMax $0.28 | — | $0.28 | $0.28 |

Source: [A] Table A2, built from [A1–A18], [A25b], [A29–A31] and [V7].

### 3.3 Online speech to text (where it beats local)

| Service | Price | Word timestamps | Speaker labels | Limits | Free credit | Own key in the terms |
|---|---|---|---|---|---|---|
| **Deepgram Nova-3** | **$0.0043/min** English; $0.0052/min multilingual [A40] | Yes [A40c] | **Included free** for recorded files [A40] | 2 GB per file [A40b] | **$200, no card** [A40] | Silent; no sharing credentials [A40d] |
| **ElevenLabs Scribe v3** | $0.20/hour [A38a] | Yes, by word or character [A38d] | Yes, up to 32 speakers [A38c] | 5 GB, 15 hours [A38e] | Free plan 4 h 30 min a month, but non-commercial only [A38a][A38f] | Silent; its use policy covers apps "built with our technology" [A38g] |
| AssemblyAI STT-3.7 | $0.21/hour, plus $0.02/hour for speaker labels [A42] | Yes, within about 400 ms [A42b] | Yes (add-on) | 2.2 GB upload; 10 hours [A42b] | $50 [A42] | Silent [A42c] |
| Gemini 3.5 Transcribe | about $0.003/min [A26] | Yes | Up to 8 speakers [A28] | **30 minutes per request with timestamps or speaker labels on** [A28b] | Free tier (Google's reviewers may read free-tier data) [A26][A27] | Terms say "not for consumer use" [A27] |
| OpenAI `gpt-transcribe` | $0.0045/min [A39] | **Not documented** [A39b] | Not documented [A39c] | 25 MB | — | Terms page refused automated access (*unverified*). `whisper-1` and `gpt-4o-transcribe-diarize` **shut down 2027-02-26** [A39a] |
| Groq Whisper | large-v3-turbo $0.04/hour [A41] | Yes | No | 25–100 MB [A41] | Free tier | Silent [A41c] |

**Online is worth it** on weak computers, for long files that must finish fast, for languages Parakeet lacks, and for better speaker labels. Local models already give word timestamps and speaker labels for free.

### 3.4 Online voices, voice copying and dubbing

| Service | Price | Languages | Voice copying | Commercial use | Notes |
|---|---|---|---|---|---|
| **ElevenLabs** v4, v3, Multilingual v2 | **$80 per million characters**; Flash and Turbo $40 [A38a] | v4: 90+ [A38c] | Instant copying from the Starter plan ($6/month); no copying a living person "without their explicit and informed consent" [A38b][A38g] | **Free plan is non-commercial only** [A38f] | Quality and feature leader |
| **Gemini 3.8 Flash TTS** | About **$0.0135 per minute** until 2026-12-31, then about double [A26] | 130 [A26c] | Needs a 10–30 s sample **plus a recorded consent statement** [A26d] | Allowed, but "not for consumer use" [A27] | Cheapest good option |
| Cartesia Sonic | $37–50 per million characters [A43] | *unverified* | From the Pro plan | Pro and up | Free plan 20k credits |
| Deepgram Aura-2 | $30 per million characters [A40] | *unverified* | — | — | — |
| MiniMax Speech 2.8 | HD $100 / Turbo $60 per million characters [A29] | *unverified* | Quick copy $1.50 per voice | *unverified* | — |
| OpenAI TTS (`gpt-4o-mini-tts`, `tts-1`) | — | — | — | — | **Shuts down 2027-01-06**; don't build on it [A39e] |
| **ElevenLabs Dubbing** | v1: $0.50/min without watermark, $0.33 with. **v2: $2.20/min** [A38a] | — | — | Paid plans | fal resells it at $0.60/min [A10] |

### 3.5 What the terms say about the user's own key

| Provider | Clause | Our reading |
|---|---|---|
| OpenRouter | OAuth guide: users "bring their own OpenRouter API key" and are billed to "their own OpenRouter credits" [A20] | Explicitly allowed. Best path |
| Runway | "make that functionality available to end users … provided that Your Applications … prominently display 'Powered by Runway'"; keys "for your use only" [V11b] | Allowed; show "Powered by Runway" with a link when Runway is used |
| Kling | Key "can only be used for the authorized your Client Application … shall not transfer, rent, lend, disclose" it [V23] | A user's key in software they run themselves is their own use, as long as the key never reaches us |
| Google Gemini | Keys "intended to be used by you" [V25]; "for professional or business purposes, not for consumer use"; 18+; only paid services in the EEA, Switzerland and the UK [A27] | Gray for hobbyists. Say so in the key screen |
| Luma | "shall not share, transfer, or disclose API Credentials"; FAQ: never "ship them to client-side code" [V13][V14] | Strictest wording; treat as gray |
| BytePlus | Not available in the US; no re-integrating into "AI content creation tools" for others [V22] | Skip |
| fal, Replicate, Deepgram, ElevenLabs | No sharing credentials; silent on third-party apps [A13][A17][A40d][A38f] | Fine if the key stays on the user's computer |
| Eden AI | "exclusively for professional use … not as a consumer" [A37] | Skip |

**Design rule** (ours, from the clauses above):
- The key is stored in the operating system's keychain and sent only to the provider's own address.
- It is never sent to our servers or logged.
- The app shows whose account pays.

### 3.6 Shutdowns to design around

| Service | Shutdown | Source |
|---|---|---|
| OpenAI Sora 2 and the Videos API | 2026-09-24 | [V28] |
| Veo 3.1, 3.1 Fast and 3.1 Lite on the Gemini API | 2026-10-22 | [V3] |
| OpenAI TTS | 2027-01-06 | [A39e] |
| OpenAI `whisper-1` and the `gpt-4o-*-transcribe` models | 2027-02-26 | [A39a] |

The model switcher must cope with models that disappear: keep a remote-updatable list of models, and fall back gracefully when one goes.

---

## 4. Recommendation

### 4.1 Default model per feature and computer

"No GPU" means an 8 GB laptop with only built-in graphics. Download sizes come from §2.

| Feature | No GPU (8 GB laptop) | Apple silicon | NVIDIA PC | Download | Online option |
|---|---|---|---|---|---|
| Speech to text with word timestamps | Parakeet v3 int8 (European languages); Whisper small (others) | Whisper large-v3-turbo q5_0 (Metal + Core ML); Parakeet v3 for European languages | Whisper large-v3-turbo (CUDA); Parakeet v3 (sherpa-onnx, CUDA) | 464 MiB; 466 MiB; 547 MiB | Deepgram Nova-3 ($0.0043/min); ElevenLabs Scribe v3 ($0.20/h) |
| Filler words and silence | Silero VAD + FFmpeg `silencedetect` + fillers from the transcript's words | same | same | ~2 MB | Deepgram or ElevenLabs filler options (*unverified*) |
| Speaker separation | pyannote segmentation-3.0 + CAM++ (sherpa-onnx) | same | same | 6.6 + 28.2 MiB | Deepgram (free with Nova-3); ElevenLabs Scribe |
| Caption translation | Qwen3-4B Q4_K_M (node-llama-cpp, CPU; slow, speed *unverified*) | Qwen3-4B Q4_K_M (Metal) | Qwen3-4B Q4_K_M (CUDA/Vulkan) | 2.5 GB | Any language model through OpenRouter; Gemini |
| Background / person removal | RobustVideoMatting MobileNetV3 (people); MODNet fallback | RobustVideoMatting; SAM 2.1 tiny (any object); BiRefNet_lite (stills) | RobustVideoMatting ResNet50; SAM 2.1; BiRefNet | MODNet 13 MB; SAM 2.1 tiny ~77 MB; BiRefNet_lite 115 MB; RobustVideoMatting *unverified* | fal video background removal ($0.008 per 30 frames) |
| Voice clean-up | DPDFNet 48 kHz HR; RNNoise preview | same | same | 10.1 MiB | Not researched |
| Music / voice separation | UVR MDX-Net Voc_FT | same; Demucs (demucs.cpp) for four parts | same | 63.6 MiB; Demucs *unverified* | Not priced |
| Upscaling | Real-ESRGAN general-x4v3 (Vulkan on the built-in GPU) | same (Mac build) | same; SeedVR2-3B later | 4 MiB model, 43–49 MiB program | fal SeedVR2 ($0.001 per megapixel) |
| Frame interpolation | FFmpeg `minterpolate`; RIFE v4.6 if Vulkan works | RIFE v4.6 (ncnn-Vulkan) | RIFE v4.6 | *unverified* per model (411 MiB with all models) | Not needed |
| Auto reframe / face tracking | BlazeFace + YOLO26n (CPU) | same | same | Small (not published) | Not needed |
| Text to speech | Kokoro int8 (8 languages); Piper's cleared voices | same | same | 140 MiB | ElevenLabs ($80 per million characters); Gemini 3.8 Flash TTS (~$0.0135/min) |
| Voice copying | Online only | Online only | Online only | — | ElevenLabs (consent required); Gemini (recorded consent) |
| Video generation | Online only | Online only | Wan 2.2 TI2V-5B with 24 GB or more (under 9 min per 5 s at 720p); otherwise online | *unverified* (LTX-2.5: about 66 GiB in total) | Gemini Omni 1.2 Flash ($0.07/s at 720p with sound); Kling 2.6 ($0.042/s); Kling 4.0; Veo 3.1 Lite ($0.05/s, Vertex) |

### 4.2 Online providers to support first, in order

1. **OpenRouter.**
   - The user clicks *Connect* and approves; no key to paste [A20].
   - One account covers video (35 models, including Veo 3.1, Seedance, Wan, Hailuo, Runway), captions (Nova-3, Scribe), voices (ElevenLabs, Gemini) and translation.
   - Makers' prices plus a 5.5% top-up fee [A19].
2. **fal**, which fills OpenRouter's gaps:
   - Kling 4.0, LTX-2.5, Luma Ray 3.2, MiniMax H3.
   - Video background removal and SeedVR2 upscaling [A1][A11].
   - The user pastes a key.
3. **ElevenLabs direct**, for voices, dubbing and Scribe. A paid plan is needed for commercial use [A38f].
4. **Deepgram direct**, for the cheapest captions, with free speaker labels and $200 of credit [A40].
5. **Google Gemini API direct**, for Omni 1.2 Flash (the cheapest good video with sound) and Gemini voices. Show its "not for consumer use" and 18+ terms on the key screen [V1][A27].
6. **Later:** Kling direct [V9], Runway (one key covers Kling 4.0, Veo 3.1 and Seedance; show "Powered by Runway") [V10][V11b], and Alibaba Model Studio for Wan 3.0 [V26].
7. **Skip:**
   - Sora (shut down).
   - BytePlus Seedance (not sold in the US).
   - Eden AI (excludes consumers).
   - Replicate as a first choice (GitHub sign-in, Kling at 2× fal's price).
   - The local MiniMax-H3 and HunyuanVideo weights (region-locked).

### 4.3 Still to check before building

- **Measure our own speeds** on an 8 GB Windows laptop, an M-series Mac and an RTX card, for every pick in §4.1. Most official pages publish no CPU or Apple-silicon timing.
- **Licences not yet read:**
  - Silero VAD (MIT, or the CC BY-NC its badge shows).
  - The CAM++ voice model and GTCRN.
  - Each UVR file.
  - The MediaPipe model cards.
  - The full Gemma terms (TranslateGemma).
- **Engine questions:**
  - Whether sherpa-onnx and `onnxruntime-node` can use Core ML on Mac. The docs list CPU only.
  - Which Chromium version our Electron release ships, which decides WebGPU on Linux.
- **Model behaviour:**
  - Whether Parakeet keeps filler words.
  - Whether whisper.cpp's "experimental" word timestamps are accurate enough for word-level caption editing.
- **Prices still in credits:** Kling's pack prices, Luma's dollars per credit, and MiniMax's minimum top-up and terms.
- **Newer models:** some 2026 open models could have been missed because search was unavailable. Repeat a search pass for new speech, matting, voice and video models.

---

## Sources

### Local models (all accessed 2026-11-17 unless a date is given)

- **L1** whisper.cpp README — https://github.com/ggml-org/whisper.cpp
- **L2** whisper.cpp model sizes — https://github.com/ggml-org/whisper.cpp/blob/master/models/README.md
- **L3** Whisper large-v3-turbo model card — https://huggingface.co/openai/whisper-large-v3-turbo
- **L4** faster-whisper README, benchmark tables — https://github.com/SYSTRAN/faster-whisper
- **L5** Parakeet TDT 0.6B v3 model card (released 2025-08-14) — https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- **L6** Canary-1B-v2 model card (2025-08-14) — https://huggingface.co/nvidia/canary-1b-v2
- **L7** sherpa-onnx README — https://github.com/k2-fsa/sherpa-onnx
- **L8** sherpa-onnx docs — https://k2-fsa.github.io/sherpa/onnx/index.html ; speaker diarization — https://k2-fsa.github.io/sherpa/onnx/speaker-diarization/index.html
- **L9** sherpa-onnx model releases, sizes read through the GitHub API — https://github.com/k2-fsa/sherpa-onnx/releases. Tags used: `asr-models` (Parakeet v3 int8, 2026-11-07), `tts-models` (Kokoro v1.1, 2026-10-26), `speaker-segmentation-models`, `speaker-recongition-models`, `speech-enhancement-models` (DPDFNet, 2026-03-16), `source-separation-models`
- **L10** FluidAudio — https://github.com/FluidInference/FluidAudio
- **L11** Moonshine — https://github.com/moonshine-ai/moonshine
- **L12** transformers.js docs — https://huggingface.co/docs/transformers.js/index ; Whisper turbo ONNX — https://huggingface.co/onnx-community/whisper-large-v3-turbo
- **L13** CrisperWhisper — https://huggingface.co/nyrahealth/CrisperWhisper
- **L14** Silero VAD — https://github.com/snakers4/silero-vad
- **L15** FFmpeg filters documentation (`arnndn`, `silencedetect`, `whisper`, `minterpolate`) — https://ffmpeg.org/ffmpeg-filters.html
- **L16** pyannote speaker-diarization-community-1 (benchmarks dated 2025-09) — https://huggingface.co/pyannote/speaker-diarization-community-1
- **L16b** pyannote segmentation-3.0 (MIT, gated), via the Hugging Face API — https://huggingface.co/pyannote/segmentation-3.0
- **L17** NLLB-200 distilled 600M — https://huggingface.co/facebook/nllb-200-distilled-600M
- **L18** MADLAD-400 3B — https://huggingface.co/google/madlad400-3b-mt
- **L19** Opus-MT en-de — https://huggingface.co/Helsinki-NLP/opus-mt-en-de
- **L20** TranslateGemma 4B (technical report 2026-01-13) — https://huggingface.co/google/translategemma-4b-it
- **L21** Qwen3-4B-Instruct-2507 — https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- **L21b** GGUF sizes — https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF/tree/main
- **L22** node-llama-cpp — https://github.com/withcatai/node-llama-cpp
- **L23** ONNX Runtime for Node, platform table — https://onnxruntime.ai/docs/get-started/with-javascript/node.html ; latest npm version 1.31.1, published 2026-10-26 — https://registry.npmjs.org/onnxruntime-node
- **L24** ONNX Runtime Web, WebGPU — https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html
- **L25** WebGPU implementation status — https://github.com/gpuweb/gpuweb/wiki/Implementation-Status
- **L26** SAM 2 — https://github.com/facebookresearch/sam2
- **L26b** SAM 2.1 tiny ONNX sizes — https://huggingface.co/onnx-community/sam2.1-hiera-tiny-ONNX
- **L27** SAM 3 (SAM 3.1 released 2026-03-27) — https://github.com/facebookresearch/sam3
- **L27b** SAM License — https://github.com/facebookresearch/sam3/blob/main/LICENSE
- **L28** BiRefNet — https://github.com/ZhengPeng7/BiRefNet
- **L28b** BiRefNet weights (MIT) — https://huggingface.co/ZhengPeng7/BiRefNet
- **L28c** ONNX sizes — https://huggingface.co/onnx-community/BiRefNet_lite-ONNX and https://huggingface.co/onnx-community/BiRefNet-ONNX
- **L29** RMBG-2.0 — https://huggingface.co/briaai/RMBG-2.0
- **L30** RobustVideoMatting — https://github.com/PeterL1n/RobustVideoMatting
- **L31** MODNet — https://github.com/ZHKKKe/MODNet
- **L31b** MODNet ONNX sizes — https://huggingface.co/Xenova/modnet
- **L32** MatAnyone — https://github.com/pq-yang/MatAnyone
- **L33** BEN2 — https://huggingface.co/PramaLLC/BEN2
- **L34** MediaPipe image segmenter — https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
- **L34b** MediaPipe face detector — https://developers.google.com/edge/mediapipe/solutions/vision/face_detector
- **L34c** MediaPipe repo — https://github.com/google-ai-edge/mediapipe
- **L35** DeepFilterNet — https://github.com/Rikorose/DeepFilterNet
- **L35b** Release v0.5.6 (2023-08-31) — https://github.com/Rikorose/DeepFilterNet/releases
- **L36** RNNoise — https://github.com/xiph/rnnoise
- **L37** Resemble Enhance — https://github.com/resemble-ai/resemble-enhance
- **L38** DPDFNet (Apache-2.0, updated 2026-07-05) — https://huggingface.co/Ceva-IP/DPDFNet
- **L39** Demucs (archived 2025-01-01) — https://github.com/facebookresearch/demucs
- **L40** demucs.cpp — https://github.com/sevagh/demucs.cpp
- **L41** python-audio-separator — https://github.com/nomadkaraoke/python-audio-separator
- **L42** Real-ESRGAN — https://github.com/xinntao/Real-ESRGAN
- **L42b** Release v0.2.5.0 (2022-04-24), asset sizes through the GitHub API — https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0
- **L43** Video2X — https://github.com/k4yt3x/video2x
- **L44** SeedVR2-3B (paper 2025-06-05) — https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- **L45** Practical-RIFE — https://github.com/hzwer/Practical-RIFE
- **L46** rife-ncnn-vulkan — https://github.com/nihui/rife-ncnn-vulkan
- **L46b** Release 20221029, asset sizes through the GitHub API — https://github.com/nihui/rife-ncnn-vulkan/releases/tag/20221029
- **L47** FILM — https://github.com/google-research/frame-interpolation
- **L48** Ultralytics (YOLO26) — https://github.com/ultralytics/ultralytics
- **L49** Kokoro-82M (v1.0, 2025-01-27) — https://huggingface.co/hexgrad/Kokoro-82M
- **L49b** Kokoro ONNX sizes — https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- **L50** Piper — https://github.com/OHF-Voice/piper1-gpl
- **L50b** Piper commercial-use list — https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/COMMERCIAL_USE.md
- **L51** Chatterbox (retired August 2026) — https://github.com/resemble-ai/chatterbox
- **L52** XTTS-v2 — https://huggingface.co/coqui/XTTS-v2
- **L53** F5-TTS — https://github.com/SWivid/F5-TTS
- **L54** LTX-2 repo (code Apache-2.0; model licences listed) — https://github.com/Lightricks/LTX-2
- **L54b** LTX-2.x Community License (2026-08-11, amended 2026-10-29) — https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- **L55** LTX-2 model card (paper 2026-01-06) — https://huggingface.co/Lightricks/LTX-2 ; LTX-2.3 — https://huggingface.co/Lightricks/LTX-2.3
- **L55c** LTX-2.5 (repo updated 2026-10-11) — https://huggingface.co/Lightricks/LTX-2.5
- **L56** Wan 2.2 TI2V-5B (released 2025-07-28) — https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- **L56b** Wan-AI organisation, model list — https://huggingface.co/Wan-AI
- **L57** HunyuanVideo 1.5 (released 2025-11-20) — https://huggingface.co/tencent/HunyuanVideo-1.5
- **L57b** HunyuanVideo 1.5 licence — https://huggingface.co/tencent/HunyuanVideo-1.5/blob/main/LICENSE
- **L58** MiniMax-H3 (repo created 2026-07-28) — https://huggingface.co/MiniMaxAI/MiniMax-H3
- **L58b** MiniMax-H3 licence — https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- **L59** stable-diffusion.cpp — https://github.com/leejet/stable-diffusion.cpp
- **L60** GNU AGPL-3.0, §13 ("permission to link or combine any covered work with a work licensed under version 3 of the GNU General Public License") — https://www.gnu.org/licenses/agpl-3.0.html

### Video generation APIs (accessed 2026-11-17 unless a date is given)

- **V1** Gemini API pricing — https://aistudio.google.com/docs/pricing
- **V2** Gemini Omni docs — https://aistudio.google.com/docs/omni
- **V3** Gemini API deprecations (Veo shut down 2026-10-22) — https://aistudio.google.com/docs/deprecations
- **V4** Gemini API billing — https://aistudio.google.com/docs/billing
- **V5** Vertex AI pricing, Veo section — https://cloud.google.com/vertex-ai/generative-ai/pricing
- **V6** Veo 3.1 model page — https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/veo/3-1-generate
- **V7** Kling API video pricing — https://kling.ai/document-api/pricing/base/video
- **V8** Kling video capability map (updated 2026-10-20) — https://kling.ai/document-api/guides/capability-map/video
- **V9** Kling quick start — https://kling.ai/document-api/guides/get-started/quick-start
- **V9a** Kling developer pricing (pack prices load by script) — https://kling.ai/dev/pricing
- **V10** Runway API pricing — https://docs.dev.runwayml.com/guides/pricing/ ; models — https://docs.dev.runwayml.com/guides/models/
- **V11** Runway API setup — https://docs.dev.runwayml.com/guides/setup/
- **V11b** Runway Terms of Use (updated 2026-10-23) — https://runway.com/terms-of-use
- **V12** Luma API — https://lumalabs.ai/api
- **V12a** Luma pricing guide — https://docs.agents.lumalabs.ai/guides/pricing/
- **V12b** Luma video generation guide — https://docs.agents.lumalabs.ai/guides/videos/generation/
- **V13** Luma FAQ — https://docs.agents.lumalabs.ai/guides/faq/
- **V14** Luma API terms (2026-04-28) — https://lumalabs.ai/legal/api-terms-of-use
- **V15** MiniMax pay-as-you-go pricing — https://platform.minimax.io/docs/guides/pricing-paygo
- **V16** MiniMax video generation guide — https://platform.minimax.io/docs/guides/video-generation
- **V16b** MiniMax account set-up — https://platform.minimax.io/docs/guides/quickstart-preparation
- **V17** MiniMax H3 launch post (2026-07-31) — https://www.minimax.io/blog/minimax-h3
- **V18** BytePlus ModelArk pricing (2026-11-16) — https://docs.byteplus.com/en/docs/ModelArk/1544106
- **V19** Seedance 2.5 tutorial — https://docs.byteplus.com/en/docs/modelark/seedance-2-5
- **V21** BytePlus availability (2026-04-21) — https://docs.byteplus.com/en/docs/ModelArk/availability
- **V22** BytePlus service terms — https://docs.byteplus.com/en/docs/legal/docs-service-specific-terms
- **V23** Kling API paid service terms (effective 2026-04-21) — https://kling.ai/document-api/guides/protocols/paid-service
- **V24** Gemini API additional terms (effective 2026-03-23) — https://aistudio.google.com/docs/terms
- **V25** Google APIs Terms of Service (2021-11-09) — https://developers.google.com/terms
- **V26** Alibaba Model Studio API keys (2026-11-15) — https://www.alibabacloud.com/help/en/model-studio/get-api-key
- **V26a** Model Studio pricing (2026-11-17) — https://www.alibabacloud.com/help/en/model-studio/model-pricing
- **V26b** Wan text-to-video API — https://www.alibabacloud.com/help/en/model-studio/text-to-video-api-reference
- **V26c** Model Studio free quota (2026-11-16) — https://www.alibabacloud.com/help/en/model-studio/new-free-quota
- **V27** OpenAI video generation guide — https://developers.openai.com/api/docs/guides/video-generation
- **V28** OpenAI deprecations — https://developers.openai.com/api/docs/deprecations
- **V29** xAI models and pricing — https://docs.x.ai/docs/models
- **V31** Vidu API pricing — https://platform.vidu.com/docs/overview/pricing
- **V32** PixVerse API docs — https://docs.platform.pixverse.ai/

### Aggregators, speech and voice (accessed 2026-11-17 unless a date is given)

- **A1** fal pricing — https://fal.ai/pricing
- **A2–A9** fal model pages:
  - Veo 3.1 — https://fal.ai/models/fal-ai/veo3.1/llms.txt
  - Kling v3 — https://fal.ai/models/fal-ai/kling-video/v3/pro/text-to-video/llms.txt
  - Kling 4.0 — https://fal.ai/models/kling/v4/text-to-video/llms.txt
  - Seedance 2.0 Fast — https://fal.ai/models/bytedance/seedance-2.0/fast/text-to-video/llms.txt
  - Seedance 2.5 US — https://fal.ai/models/bytedance/seedance-2.5/us/text-to-video/llms.txt
  - Wan 3.0 — https://fal.ai/models/alibaba/wan-3.0/text-to-video/llms.txt
  - Hailuo 2.3 — https://fal.ai/models/fal-ai/minimax/hailuo-2.3/standard/text-to-video/llms.txt
  - MiniMax H3 — https://fal.ai/models/minimax/h3/text-to-video/llms.txt
- **A10** fal ElevenLabs endpoints (voices v3, Scribe v2, dubbing) — https://fal.ai/models/fal-ai/elevenlabs/tts/eleven-v3/llms.txt and sibling pages
- **A11** fal text-to-video catalogue — https://fal.ai/models?categories=text-to-video
- **A12** fal FAQ and billing — https://fal.ai/docs/documentation/model-apis/faq.md , https://fal.ai/docs/documentation/model-apis/pricing.md
- **A13** fal terms (updated 2026-09-08) — https://fal.ai/terms
- **A14** Replicate and fal model pages, e.g. https://replicate.com/google/veo-3.1 , https://replicate.com/kwaivgi/kling-v3-video ; fal queue API — https://fal.ai/docs/documentation/model-apis/inference/queue.md
- **A15** Replicate collections — https://replicate.com/collections/
- **A16b** Replicate prepaid credit — https://replicate.com/docs/topics/billing/prepaid-credit
- **A17** Replicate terms (2026-04-01) — https://replicate.com/terms
- **A18** OpenRouter video models (public API) — https://openrouter.ai/api/v1/videos/models
- **A19** OpenRouter FAQ — https://openrouter.ai/docs/faq
- **A20** OpenRouter OAuth PKCE guide — https://openrouter.ai/docs/guides/overview/auth/oauth.md
- **A22** OpenRouter speech model lists — https://openrouter.ai/api/v1/models?output_modalities=transcription , https://openrouter.ai/api/v1/models?output_modalities=speech
- **A23** OpenRouter speech-to-text request fields — https://openrouter.ai/docs/client-sdks/typescript/models/sttrequest.md
- **A24** OpenRouter terms (2026-08-31) — https://openrouter.ai/terms
- **A25b** Google Cloud Veo prices — https://cloud.google.com/vertex-ai/generative-ai/pricing
- **A26** Gemini API pricing (voices, Transcribe, Omni) — https://aistudio.google.com/docs/pricing
- **A26c** Gemini 3.8 Flash TTS — https://aistudio.google.com/docs/models/gemini-3.8-flash-tts.md
- **A26d** Gemini voice replication — https://aistudio.google.com/docs/voice-replication.md
- **A27** Gemini API additional terms (effective 2026-03-23) — https://ai.google.dev/gemini-api/terms
- **A28** Gemini Transcribe guide — https://aistudio.google.com/docs/transcribe.md
- **A28b** Gemini 3.5 Transcribe model page — https://aistudio.google.com/docs/models/gemini-3.5-transcribe.md
- **A29** MiniMax pricing — https://platform.minimax.io/docs/guides/pricing
- **A30** Alibaba Model Studio pricing — https://www.alibabacloud.com/help/en/model-studio/model-pricing
- **A31** BytePlus ModelArk pricing — https://docs.byteplus.com/docs/en/modelark/model-pricing.md
- **A32** WaveSpeedAI — https://wavespeed.ai/pricing , https://wavespeed.ai/llms.txt
- **A33** Runware — https://runware.ai/pricing ; terms (2026-09-29) — https://runware.ai/terms
- **A34** Together AI — https://www.together.ai/pricing , https://docs.together.ai/docs/billing-credits.md ; terms (2026-05-19) — https://www.together.ai/terms-of-service
- **A35** AIMLAPI — https://aimlapi.com/ai-ml-api-pricing , https://docs.aimlapi.com/faq/free-tier.md
- **A37** Eden AI — https://www.edenai.co/pricing ; terms (2026-10-22) — https://www.edenai.co/terms
- **A38** ElevenLabs:
  - **A38a** API pricing — https://elevenlabs.io/pricing/api
  - **A38b** Plans — https://elevenlabs.io/pricing
  - **A38c** Models — https://elevenlabs.io/docs/overview/models.md
  - **A38d** Speech-to-text API — https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md
  - **A38e** Speech-to-text limits — https://elevenlabs.io/docs/overview/capabilities/speech-to-text.md
  - **A38f** Terms (2026-10-09) — https://elevenlabs.io/terms-of-use
  - **A38g** Use policy (2026-10-09) — https://elevenlabs.io/use-policy
- **A39** OpenAI:
  - Pricing — https://developers.openai.com/api/docs/pricing.md
  - **A39a** Deprecations — https://developers.openai.com/api/docs/deprecations.md
  - **A39b** Speech-to-text guide — https://developers.openai.com/api/docs/guides/speech-to-text.md
  - **A39c** `gpt-transcribe` — https://developers.openai.com/api/docs/models/gpt-transcribe.md
  - **A39e** Text-to-speech shutdown — https://developers.openai.com/api/docs/guides/text-to-speech.md
  - The terms pages returned HTTP 403
- **A40** Deepgram:
  - Pricing — https://deepgram.com/pricing
  - **A40b** Audio limits — https://developers.deepgram.com/docs/supported-audio-formats.md
  - **A40c** Diarization — https://developers.deepgram.com/docs/diarization.md
  - **A40d** Terms (2026-08-06) — https://deepgram.com/terms
- **A41** Groq speech to text — https://console.groq.com/docs/speech-to-text.md
  - **A41c** Website terms (2025-11-13) — https://groq.com/terms-of-use
- **A42** AssemblyAI:
  - Pricing — https://www.assemblyai.com/pricing
  - **A42b** FAQ — https://www.assemblyai.com/docs/llms-full/faq-1.txt
  - **A42c** Terms (2026-07-01) — https://www.assemblyai.com/legal/terms-of-service
- **A43** Cartesia — https://cartesia.ai/pricing ; terms (2024-06-14) — https://cartesia.ai/legal/terms
