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


def decode(ff: str, path: Path, rate: float) -> np.ndarray:
    """Audio file → mono float32 at RATE (rate < 1 = slowed down, pitch kept)."""
    af = ["-af", f"atempo={rate}"] if abs(rate - 1) > 1e-3 else []
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
    for ev in meta["sounds"]:
        src = REPO / "public" / ev["src"].lstrip("/")
        if not src.exists():
            continue
        key = (str(src), round(ev.get("rate", 1), 2))
        if key not in cache:
            cache[key] = decode(ff, src, key[1])
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
    print(f"{out}  ({dur:.0f}s, {len(meta['sounds'])} sounds, {out.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
