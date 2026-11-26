"""The demo talk's lines, spoken in the hubnx channel's voice: Kokoro-82M (Apache-2.0), voice af_heart, through
kokoro-onnx (MIT), with misaki's dictionary for English (hubnx docs/operations.md › YouTube › Another app's video on the
channel). The model files and Python are hubnx's own, read only (~/Workspace/repo/hubnx/local/brand/remotion/voice/).

    ~/Workspace/repo/hubnx/local/brand/remotion/voice/.venv/bin/python scripts/demo/voice.py <lines.json> <out folder>

Reads a JSON list of lines, writes <out>/<n>.wav for each and prints their lengths as JSON. A word the dictionary
lacks stops the run: misaki drops it silently otherwise.
"""
import json
import os
import sys

import soundfile as sf
from kokoro_onnx import Kokoro
from misaki import en

VOICE = os.path.expanduser("~/Workspace/repo/hubnx/local/brand/remotion/voice")
lines = json.load(open(sys.argv[1], encoding="utf-8"))
out = sys.argv[2]
os.makedirs(out, exist_ok=True)
g2p = en.G2P(trf=False, british=False, fallback=None)

unknown = set()
for line in lines:
    _, tokens = g2p(line)
    unknown |= {t.text for t in tokens if t.phonemes is None and any(c.isalpha() for c in t.text)}
if unknown:
    sys.exit(f"no pronunciation for {sorted(unknown)}: say them another way")

kokoro = Kokoro(os.path.join(VOICE, "models", "kokoro-v1.0.onnx"), os.path.join(VOICE, "models", "voices-v1.0.bin"))
lengths = []
for n, line in enumerate(lines):
    phonemes, _ = g2p(line)
    samples, rate = kokoro.create(phonemes, voice="af_heart", speed=1.0, is_phonemes=True)
    sf.write(os.path.join(out, f"{n}.wav"), samples, rate)
    lengths.append(round(len(samples) / rate, 3))
print(json.dumps(lengths))
