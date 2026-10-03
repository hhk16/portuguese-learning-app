#!/usr/bin/env python3
"""
Compose an e2e video run into one watchable walkthrough: the TV next to both phones, in sync,
with the TV's real sound. Browser screen recordings are silent, so the soundtrack is rebuilt from
the TV's test-mode sound log (every clip it started, with a timestamp) using the actual audio files.

    E2E_VIDEO=1 E2E_MODES=kitchen npm run e2e
    python3 scripts/e2e-video.py e2e-output/video/meta.json out.mp4

Needs numpy and an ffmpeg (FFMPEG env var, or imageio-ffmpeg, or ffmpeg on PATH).
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parents[1]
RATE = 44100


def ffmpeg() -> str:
    if os.environ.get("FFMPEG"):
        return os.environ["FFMPEG"]
    try:
        import imageio_ffmpeg  # type: ignore

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        exe = shutil.which("ffmpeg")
        if not exe:
            sys.exit("ffmpeg not found")
        return exe


def decode(ff: str, path: Path, rate: float, pitch: bool = False) -> np.ndarray:
    """Audio file → mono float32 at RATE. rate < 1 = slowed down; pitch=True shifts pitch with the
    speed (Web Audio playbackRate, used for SFX variation), else the pitch is kept (slow speech)."""
    if abs(rate - 1) <= 1e-3:
        af = []
    elif pitch:
        af = ["-af", f"asetrate={int(RATE * rate)},aresample={RATE}"]
    else:
        af = ["-af", f"atempo={rate}"]
    raw = subprocess.run([ff, "-v", "error", "-i", str(path), *af, "-ac", "1", "-ar", str(RATE), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def main() -> None:
    meta_path = Path(sys.argv[1] if len(sys.argv) > 1 else REPO / "e2e-output" / "video" / "meta.json")
    out = Path(sys.argv[2] if len(sys.argv) > 2 else meta_path.with_name("walkthrough.mp4"))
    meta = json.loads(meta_path.read_text())
    ff = ffmpeg()
    t0 = meta["starts"]["tv"]
    dur = (meta["end"] - t0) / 1000 + 1

    # 1. Soundtrack: every logged clip at its moment, mixed.
    track = np.zeros(int(dur * RATE) + RATE, dtype=np.float32)
    cache: dict[tuple[str, float], np.ndarray] = {}
    sounds = [e for e in meta["sounds"] if e["src"].startswith(("/sfx/", "/audio/"))]
    music = [e for e in meta["sounds"] if e["src"].startswith("/music/")]

    # Music: each track loops (without its intro/outro fades) until the next one, 1.2 s crossfades,
    # ducked while the TV speaks — the same rules as src/audio/music.ts.
    level = np.zeros(len(track), dtype=np.float32)
    bed = np.zeros(len(track), dtype=np.float32)
    fade = int(1.2 * RATE)
    for j, ev in enumerate(music):
        start = int((ev["t"] - t0) / 1000 * RATE)
        stop = int((music[j + 1]["t"] - t0) / 1000 * RATE) if j + 1 < len(music) else len(track)
        start, stop = max(0, start), min(len(track), stop + fade)
        if stop <= start:
            continue
        src = REPO / "public" / ev["src"].lstrip("/")
        clip = decode(ff, src, 1.0)
        ls, le = int(min(2, len(clip) / RATE / 4) * RATE), len(clip) - 4 * RATE
        body = clip[int(0.5 * RATE) :]
        loop = clip[ls:le]
        need = stop - start
        seg = np.concatenate([body] + [loop] * (need // max(1, len(loop)) + 1))[:need].copy()
        ramp = np.ones(need, dtype=np.float32)
        ramp[: min(fade, need)] = np.linspace(0, 1, min(fade, need))
        if j + 1 < len(music):
            ramp[-min(fade, need):] = np.linspace(1, 0, min(fade, need))
        bed[start:stop] += seg * ramp
    level[:] = 0.30
    for ev in sounds:
        if ev["src"].startswith("/audio/"):
            a = int((ev["t"] - t0) / 1000 * RATE)
            level[max(0, a) : max(0, a) + int(2.5 * RATE)] = 0.10
    # Smooth the ducking so it breathes instead of clicking.
    k = int(0.2 * RATE)
    level = np.convolve(level, np.ones(k, dtype=np.float32) / k, mode="same")
    track += bed * level

    for ev in sounds:
        src = REPO / "public" / ev["src"].lstrip("/")
        if not src.exists():
            continue
        key = (str(src), round(ev.get("rate", 1), 2))
        if key not in cache:
            cache[key] = decode(ff, src, key[1], pitch="/sfx/" in ev["src"])
        clip = cache[key] * float(ev.get("vol", 1)) * (0.55 if "/sfx/" in ev["src"] else 1.0)
        i = int((ev["t"] - t0) / 1000 * RATE)
        if i < 0 or i >= len(track):
            continue
        n = min(len(clip), len(track) - i)
        track[i : i + n] += clip[:n]
    peak = float(np.max(np.abs(track))) or 1.0
    if peak > 0.95:
        track *= 0.95 / peak
    wav = meta_path.with_name("soundtrack.wav")
    subprocess.run([ff, "-y", "-v", "error", "-f", "f32le", "-ar", str(RATE), "-ac", "1", "-i", "-", str(wav)], input=track.tobytes(), check=True)

    # 2. Video: TV | Hadi | Ana, phones delayed to line up with the TV clock.
    v = meta["videos"]
    offs = {k: max(0.0, (meta["starts"][k] - t0) / 1000) for k in ("Hadi", "Ana")}
    filt = (
        "[0:v]fps=24,scale=1280:720,setsar=1[tv];"
        f"[1:v]fps=24,tpad=start_duration={offs['Hadi']:.3f}:start_mode=add:color=0xfff6e5,scale=-2:720,setsar=1[p1];"
        f"[2:v]fps=24,tpad=start_duration={offs['Ana']:.3f}:start_mode=add:color=0xfff6e5,scale=-2:720,setsar=1[p2];"
        "[tv][p1][p2]hstack=inputs=3,pad=ceil(iw/2)*2:ih:0:0:color=0x1f2a44[v]"
    )
    subprocess.run(
        [ff, "-y", "-v", "error", "-i", v["tv"], "-i", v["Hadi"], "-i", v["Ana"], "-i", str(wav),
         "-filter_complex", filt, "-map", "[v]", "-map", "3:a", "-t", f"{dur:.2f}",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k",
         "-movflags", "+faststart", str(out)],
        check=True,
    )
    print(f"{out}  ({dur:.0f}s, {len(sounds)} sounds, {len(music)} music cues, {out.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
