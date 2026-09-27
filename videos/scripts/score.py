"""Synthesize the VerifAI loop's score and sound effects from the cue sheet.

    bun scripts/export-cues.ts
    uv run --with numpy --with pyloudnorm --with scipy python3 scripts/score.py

Writes public/audio/verifai-loop/{score.wav, drums.wav, bass.wav, pad.wav, sfx.wav}.
Everything is placed on the beat grid and on cue times from cues.ts; every
sound that runs past the end wraps to the start, so the loop is seamless.
The mix is normalized to -14 LUFS integrated with a -1 dBFS peak ceiling.
Noise is seeded (numpy default_rng(7)), so every run is identical.
"""

import json
import os

import numpy as np
import pyloudnorm
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "verifai-loop")
data = json.load(open(os.path.join(ROOT, "cues.json")))
DUR = data["duration"]
N = int(round(DUR * SR))
G = data["grid"]
BEAT = 60 / G["bpm"]
C = data["cue"]
rng = np.random.default_rng(7)


def b(bar, beat=1, frac=0.0):
    return G["firstBeat"] + (G["pickupBeats"] + (bar - 1) * G["beatsPerBar"] + (beat - 1) + frac) * BEAT


def track():
    return np.zeros(N, dtype=np.float64)


def put(buf, at, sound, gain=1.0):
    """Add a sound at time `at`, wrapping past the end back to the start."""
    start = int(round(at * SR)) % N
    idx = (np.arange(len(sound)) + start) % N
    np.add.at(buf, idx, sound * gain)


def env(n, attack=0.002, decay=0.2):
    t = np.arange(n) / SR
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-t / decay)


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


# ---- instruments -----------------------------------------------------------
def kick(len_s=0.45, punch=1.0):
    n = int(len_s * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    phase = 2 * np.pi * np.cumsum(f) / SR
    click = rng.standard_normal(n) * np.exp(-t / 0.003) * 0.3
    return (np.sin(phase) * env(n, 0.001, 0.16 * punch) + click) * 0.9


def snare():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 1500, 7000) * np.exp(-t / 0.07)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
    return noise * 0.55 + tone * 0.35


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7500) * np.exp(-t / (0.06 if open_ else 0.012)) * 0.35


def saw(freq, n):
    t = np.arange(n) / SR
    return 2 * ((t * freq) % 1) - 1


def bass_note(freq, len_s):
    n = int(len_s * SR)
    x = saw(freq, n) * 0.6 + np.sin(2 * np.pi * freq * np.arange(n) / SR) * 0.5
    return lp(x, 380) * env(n, 0.004, len_s * 0.55)


def pad_chord(freqs, len_s):
    n = int(len_s * SR)
    t = np.arange(n) / SR
    x = sum(saw(f * d, n) for f in freqs for d in (0.997, 1.003))
    x = lp(x, 900)
    shape = np.minimum(1, t / 0.4) * np.minimum(1, (len_s - t) / 0.4)
    return x * shape / (2 * len(freqs))


def blip(freq, len_s=0.07, gain=1.0):
    n = int(len_s * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t) * env(n, 0.001, len_s / 3) * gain


def buzz(freq=110, len_s=0.22):
    n = int(len_s * SR)
    t = np.arange(n) / SR
    sq = np.sign(np.sin(2 * np.pi * freq * t)) * 0.5 + np.sign(np.sin(2 * np.pi * freq * 1.5 * t)) * 0.3
    return lp(sq, 1800) * env(n, 0.002, 0.09)


def click(gain=1.0):
    n = int(0.012 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.002) * gain


def whoosh(len_s, rising=True):
    n = int(len_s * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    u = t / len_s if rising else 1 - t / len_s
    # A sweeping band: filter in chunks.
    out = np.zeros(n)
    chunk = 1024
    for i in range(0, n, chunk):
        c = min(1.0, u[i] if i < n else 1.0)
        lo = 300 + 5000 * c
        out[i:i + chunk] = bp(x[i:i + chunk], lo, lo * 1.8)
    shape = np.sin(np.pi * np.clip(t / len_s, 0, 1)) ** 2
    return out * shape * 0.5


def impact():
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-t / 0.08)) * t) * np.exp(-t / 0.45)
    crack = hp(rng.standard_normal(n), 1200) * np.exp(-t / 0.05) * 0.5
    return boom + crack


# ---- arrangement -----------------------------------------------------------
drums, bass, pad, sfx = track(), track(), track(), track()
A1, C2, F1, G1 = 55.0, 65.41, 43.65, 49.0
ROOTS = {3: A1, 4: A1, 5: F1, 6: F1, 7: F1, 8: C2, 9: C2, 10: G1, 11: G1, 12: A1}
CHORDS = {
    2: (220, 261.63, 329.63), 3: (220, 261.63, 329.63), 4: (220, 261.63, 329.63),
    5: (174.61, 220, 261.63), 6: (174.61, 220, 261.63), 7: (174.61, 220, 261.63),
    8: (261.63, 329.63, 392.0), 9: (261.63, 329.63, 392.0), 10: (196, 246.94, 293.66),
    11: (196, 246.94, 293.66), 12: (220, 261.63, 329.63), 13: (174.61, 220, 261.63), 14: (220, 261.63, 329.63),
}

for bar in range(1, 16):
    for beat in range(1, 5):
        at = b(bar, beat)
        if bar == 1 and beat == 1:
            continue  # the hook's impact lands on beat 2
        if bar == 15 and beat > 2:
            continue  # the fold breathes out
        put(drums, at, kick(punch=1.3 if beat == 1 else 1.0), 1.0)
        if 3 <= bar <= 12 and beat in (2, 4):
            put(drums, at, snare(), 0.8)
        if 3 <= bar <= 12:
            put(drums, at + BEAT / 2, hat(open_=beat == 4), 0.9)
            if 5 <= bar <= 7:
                put(drums, at + BEAT / 4, hat(), 0.6)
                put(drums, at + 3 * BEAT / 4, hat(), 0.6)
    if bar in ROOTS:
        for s in range(16):
            put(bass, b(bar) + s * BEAT / 4, bass_note(ROOTS[bar] * (2 if s % 4 == 2 else 1), BEAT / 4), 0.9)
    if bar in (2, 8, 13):
        put(bass, b(bar), bass_note({2: A1, 8: C2, 13: F1}[bar], 2 * BEAT * 4) * 0.8, 1.0)
    if bar in CHORDS:
        put(pad, b(bar), pad_chord(CHORDS[bar], 4 * BEAT), 1.0)

# Sound effects, on the cues.
o = C["open"]
put(sfx, o["corners"][0], whoosh(0.45), 0.9)
put(sfx, b(1, 2), impact(), 1.0)
put(sfx, o["check"], whoosh(0.25, rising=True), 0.4)
for i in range(7):
    put(sfx, o["word"] + i * o["step"], click(0.5))
for key in ("punch1", "punch2", "punch3"):
    for at in C[key]["words"]:
        put(sfx, at, blip(1760, 0.05, 0.25) + np.pad(click(0.4), (0, int(0.05 * SR) - int(0.012 * SR))))
for at in C["model"]["lines"]:
    for k in range(3):
        put(sfx, at + k * 0.035, click(0.35))
put(sfx, C["model"]["scan"], whoosh(C["model"]["scanEnd"] - C["model"]["scan"]), 0.35)
ins = C["inspect"]
put(sfx, ins["scan"], whoosh(1.0), 0.3)
passes = [True, True, True, False, True, False, True, True]
for at, ok in zip(ins["rules"], passes):
    put(sfx, at, blip(1568, 0.08, 0.45) if ok else buzz(), 1.0 if ok else 0.8)
for at in (ins["focusNotes"], ins["focusTitle"]):
    put(sfx, at, whoosh(0.3, rising=False), 0.3)
    put(sfx, at + 0.18, click(0.8))
    put(sfx, at + 0.24, click(0.6))
rep = C["report"]
put(sfx, rep["in"], whoosh(0.35), 0.4)
k = 0
t_ = rep["count"]
while t_ < rep["countEnd"]:
    put(sfx, t_, blip(2200 + 40 * k, 0.03, 0.18))
    t_ += BEAT / 4
    k += 1
put(sfx, rep["verdict"], impact()[: int(0.4 * SR)], 0.35)
put(sfx, rep["shrink"], whoosh(0.4, rising=False), 0.5)
task = C["task"]
put(sfx, task["reject"], click(1.0))
put(sfx, task["reject"], buzz(82, 0.3), 0.5)
put(sfx, task["returned"], impact()[: int(0.6 * SR)], 0.6)
cl = C["close"]
put(sfx, cl["corners"][0], whoosh(0.5), 0.7)
put(sfx, cl["corners"][0] + 0.5, impact(), 0.9)
put(sfx, C["fold"]["corners"], whoosh(0.35, rising=False), 0.6)

# ---- mix ------------------------------------------------------------------
# Quiet edges so the wrap point is soft: the pad fades in bar 1 and out in bar 15 by arrangement.
mix = drums * 0.9 + bass * 0.7 + pad * 0.35 + sfx * 0.9
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
meter = pyloudnorm.Meter(SR)
stereo = np.stack([mix, mix], axis=1)
loud = meter.integrated_loudness(stereo)
gain = 10 ** ((-14.0 - loud) / 20)
stereo *= gain
peak = np.abs(stereo).max()
ceiling = 10 ** (-1 / 20)
if peak > ceiling:
    # Soft-limit the peaks, then re-normalize once.
    stereo = np.tanh(stereo / ceiling * 1.5) / np.tanh(1.5) * ceiling
    stereo *= 10 ** ((-14.0 - meter.integrated_loudness(stereo)) / 20)
    stereo = np.clip(stereo, -ceiling, ceiling)
final = meter.integrated_loudness(stereo)


def write(name, x):
    x = x if x.ndim == 2 else np.stack([x, x], axis=1)
    wavfile.write(os.path.join(ROOT, name), SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))


write("score.wav", stereo)
for name, stem in (("drums.wav", drums), ("bass.wav", bass), ("pad.wav", pad), ("sfx.wav", sfx)):
    write(name, stem / (np.abs(stem).max() + 1e-9) * 0.8)
print(f"score.wav: {DUR:.2f}s, integrated {final:.2f} LUFS, peak {20 * np.log10(np.abs(stereo).max()):.2f} dBFS")
