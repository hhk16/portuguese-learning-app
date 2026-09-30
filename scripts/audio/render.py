#!/usr/bin/env python3
"""
Pre-render the European Portuguese (pt-PT) audio the game speaks.

Incremental: texts whose manifest entry already points at the file this run would produce are
skipped, so re-running after the curriculum grows only renders the new texts.

Sources, in priority order:
  1. Native recordings from Lingua Libre (Wikimedia Commons), only from pt-PT speakers
     (see LL_SPEAKERS), matched on the exact word/expression.
  2. Piper TTS voice pt_PT-tugão-medium for everything else.

Outputs (repo-relative):
  public/audio/manifest.json   audioKey(text) -> "<hash>.mp3"   (read by src/audio/tts.ts)
  public/audio/<hash>.mp3      mono, 22.05 kHz, 48 kbps CBR, silence-trimmed, ~-18 LUFS
  scripts/audio/sources.json   provenance per key (source, file title, speaker, licence, URL)
  docs/credits-audio.md        generated credits

See scripts/audio/README.md for setup and usage.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import unicodedata
import wave
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import quote

import requests

REPO = Path(__file__).resolve().parents[2]
OUT_DIR = REPO / "public" / "audio"
MANIFEST = OUT_DIR / "manifest.json"
SOURCES = REPO / "scripts" / "audio" / "sources.json"
OVERRIDES = REPO / "scripts" / "audio" / "overrides.json"
CREDITS = REPO / "docs" / "credits-audio.md"

# Bump when processing (trim/loudness/encoding) changes: every file gets a new name and re-renders.
PIPELINE_VERSION = "1"

# ---- audio processing -------------------------------------------------------------------------
SAMPLE_RATE = 22050
BITRATE = "48k"
TARGET_LUFS = -18.0
PEAK_LIMIT = 0.84  # ≈ -1.5 dBFS
SILENCE_DB = -42
KEEP_SILENCE = 0.06  # seconds kept at each end

# ---- Piper -------------------------------------------------------------------------------------
VOICE = "pt_PT-tugão-medium"
VOICE_BASE_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_PT/tug%C3%A3o/medium/"
LENGTH_SCALE = 1.12  # >1 = slower than default, for learners
SENTENCE_SILENCE = 0.25

# ---- Lingua Libre -------------------------------------------------------------------------------
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = (
    "PartyPortuguesAudioBuilder/1.0 "
    "(https://github.com/hhk16/portuguese-learning-app; private non-commercial learning app) "
    f"python-requests/{requests.__version__}"
)
# Only speakers of European Portuguese. Order = preference when both recorded the same word.
LL_SPEAKERS = ["Santamarcanda", "Waldyrious"]
LL_CATEGORY = "Category:Lingua Libre pronunciation in European Portuguese by {}"
ALLOWED_LICENSES = {"CC BY-SA 4.0", "CC BY-SA 3.0", "CC BY 4.0", "CC BY 3.0", "CC0", "Public domain"}
MIN_REQUEST_INTERVAL = 1.0  # seconds between Wikimedia API requests
DOWNLOAD_INTERVAL = 8.0  # upload.wikimedia.org throttles media downloads hard; be gentle


def audio_key(text: str) -> str:
    """Exact port of audioKey() in src/audio/tts.ts:
    text.trim().toLowerCase().normalize("NFC").replace(/\\s+/g, " ")"""
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", text.strip().lower()))


def match_form(text: str) -> str:
    """Form used to match a text against a Lingua Libre word: key minus trailing punctuation."""
    return re.sub(r"[\s.!?¡¿…,;:]+$", "", audio_key(text)).strip()


def short_hash(*parts: str) -> str:
    return hashlib.sha1("\n".join(parts).encode("utf-8")).hexdigest()[:10]


def synth_text(text: str) -> str:
    """Normalise display punctuation into something Piper reads naturally."""
    t = unicodedata.normalize("NFC", text).strip()
    t = re.sub(r"\s*·\s*", ", ", t)  # "português · portuguesa"
    t = re.sub(r"\s*/\s*", ". ", t)  # "Obrigado / Obrigada."
    t = re.sub(r"\s*(…|\.\.\.)\s*", ", ", t)  # "Como se diz … em português?" (espeak drops "…")
    t = re.sub(r"[\"“”«»()\[\]]", "", t)
    t = re.sub(r"\s+", " ", t)
    t = re.sub(r"\s+([,.!?;:])", r"\1", t)  # "significa ?" -> "significa?"
    t = re.sub(r",\s*([.!?])", r"\1", t)
    t = re.sub(r"^[,\s]+", "", t)
    if t and t[-1] not in ".!?":
        t += "."  # a final stop gives single words a natural falling ending instead of a clip
    return t


# ---- helpers -----------------------------------------------------------------------------------
def load_json(path: Path, default):
    try:
        return json.loads(path.read_text("utf-8"))
    except FileNotFoundError:
        return default


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True) + "\n", "utf-8")
    tmp.replace(path)


def find_ffmpeg() -> str:
    try:
        import imageio_ffmpeg  # type: ignore

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        exe = shutil.which("ffmpeg")
        if not exe:
            sys.exit("ffmpeg not found: pip install imageio-ffmpeg (or put ffmpeg on PATH)")
        return exe


class RateLimited(RuntimeError):
    pass


class Wikimedia:
    """Tiny polite client: descriptive UA, >=1s between requests, honours Retry-After/maxlag."""

    def __init__(self) -> None:
        self.s = requests.Session()
        self.s.headers["User-Agent"] = USER_AGENT
        self.last = 0.0
        self.originals_blocked_until = 0.0
        self.patience_deadline = 0.0  # set from --ll-patience
        self.gave_up = False

    def get(self, url: str, params: dict | None = None, stream: bool = False, attempts: int = 8,
            interval: float = MIN_REQUEST_INTERVAL) -> requests.Response:
        for attempt in range(attempts):
            wait = interval - (time.time() - self.last)
            if wait > 0:
                time.sleep(wait)
            self.last = time.time()
            r = self.s.get(url, params=params, timeout=60, stream=stream)
            lagged = params is not None and r.ok and '"code":"maxlag"' in r.text[:200]
            if r.status_code in (429, 500, 502, 503, 504) or lagged:
                delay = max(float(r.headers.get("Retry-After") or 0), min(120, 5 * 2**attempt))
                if delay > 120 or attempt == attempts - 1:
                    raise RateLimited(f"{r.status_code} (Retry-After {delay:.0f}s) for {url}")
                print(f"  wikimedia {r.status_code}; retrying in {delay:.0f}s", file=sys.stderr)
                time.sleep(delay)
                continue
            r.raise_for_status()
            return r
        raise RateLimited(f"giving up on {url}")

    def download(self, file_url: str) -> tuple[bytes, str]:
        """Original file; if upload.wikimedia.org rate-limits originals (it does for shared/cloud IPs,
        with Retry-After: 600), fall back to Commons' own high-bitrate transcode (Vorbis ~110 kbps).
        While throttled, retries one request per minute until the --ll-patience budget runs out;
        after that, remaining recordings are left for the next run."""
        head, name = file_url.rsplit("/", 1)
        tail = head.split("/wikipedia/commons/", 1)[1]  # "e/e7"
        base = head.split("/wikipedia/commons/", 1)[0]
        transcode = f"{base}/wikipedia/commons/transcoded/{tail}/{name}/{name}.ogg"
        if self.gave_up:
            raise RateLimited("media downloads throttled earlier in this run")
        while True:
            if time.time() >= self.originals_blocked_until:
                try:
                    return self.get(file_url, attempts=1, interval=DOWNLOAD_INTERVAL).content, "original"
                except RateLimited:
                    self.originals_blocked_until = time.time() + 600
            try:
                return self.get(transcode, attempts=1, interval=DOWNLOAD_INTERVAL).content, "transcode.ogg"
            except RateLimited:
                pass
            if time.time() + 60 > self.patience_deadline:
                self.gave_up = True
                raise RateLimited(f"upload.wikimedia.org is rate-limiting media downloads ({name})")
            print(f"  media downloads rate-limited; waiting 60s ({name})", file=sys.stderr)
            time.sleep(60)

    def api(self, **params) -> dict:
        params = {"format": "json", "formatversion": "2", "maxlag": "5", **params}
        return self.get(API, params).json()


def ll_index(wm: Wikimedia, work: Path, refresh: bool) -> dict[str, dict]:
    """match_form(word) -> {"title", "speaker"} for every pt-PT Lingua Libre file (cached)."""
    cache = work / "lingualibre-index.json"
    if cache.exists() and not refresh:
        return json.loads(cache.read_text("utf-8"))
    index: dict[str, dict] = {}
    for speaker in reversed(LL_SPEAKERS):  # preferred speaker last so it wins
        prefix = re.compile(rf"^File:LL-Q\d+ \(por\)-{re.escape(speaker)}-(.+)\.(wav|ogg|flac|mp3)$", re.I)
        cont: dict = {}
        n = 0
        while True:
            data = wm.api(
                action="query", list="categorymembers", cmtitle=LL_CATEGORY.format(speaker),
                cmtype="file", cmlimit="500", **cont,
            )
            for m in data["query"]["categorymembers"]:
                mm = prefix.match(m["title"])
                if not mm:
                    continue
                word = mm.group(1)
                if re.search(r"\(\d+\)$", word):  # "casa (2)" retake variants: skip
                    continue
                n += 1
                index[match_form(word)] = {"title": m["title"], "speaker": speaker}
            if "continue" not in data:
                break
            cont = {"cmcontinue": data["continue"]["cmcontinue"]}
        print(f"lingua libre: {n} files by {speaker}", file=sys.stderr)
    write_json(cache, index)
    return index


def strip_html(s: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s or "")).strip()


def ll_metadata(wm: Wikimedia, titles: list[str]) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for i in range(0, len(titles), 50):
        data = wm.api(
            action="query", titles="|".join(titles[i : i + 50]), prop="imageinfo",
            iiprop="url|extmetadata|mime|size", iiextmetadatafilter="Artist|LicenseShortName|LicenseUrl|Categories",
        )
        for p in data["query"]["pages"]:
            ii = (p.get("imageinfo") or [None])[0]
            if not ii:
                continue
            em = ii.get("extmetadata", {})
            artist = strip_html(em.get("Artist", {}).get("value", ""))
            m = re.search(r"Speaker:\s*(\S+)", artist)
            out[p["title"]] = {
                "title": p["title"],
                "speaker": m.group(1) if m else artist,
                "license": strip_html(em.get("LicenseShortName", {}).get("value", "")),
                "licenseUrl": em.get("LicenseUrl", {}).get("value", ""),
                "categories": em.get("Categories", {}).get("value", ""),
                "fileUrl": ii["url"].split("?")[0],
                "url": ii["descriptionurl"],
            }
    return out


# ---- audio -------------------------------------------------------------------------------------
def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def trim(ffmpeg: str, src: Path, dst: Path, highpass: bool) -> None:
    edge = (
        f"silenceremove=start_periods=1:start_duration=0.03:start_threshold={SILENCE_DB}dB"
        f":start_silence={KEEP_SILENCE}:detection=peak"
    )
    chain = ([f"highpass=f=70"] if highpass else []) + [
        f"aresample={SAMPLE_RATE}", edge, "areverse", edge, "areverse",
    ]
    run([ffmpeg, "-y", "-v", "error", "-i", str(src), "-ac", "1", "-af", ",".join(chain),
         "-c:a", "pcm_s16le", str(dst)])


def loudness(ffmpeg: str, wav: Path) -> float:
    # Loop short clips so the EBU R128 gating (400 ms blocks) has enough material to measure.
    p = subprocess.run(
        [ffmpeg, "-hide_banner", "-nostats", "-stream_loop", "4", "-i", str(wav),
         "-af", "loudnorm=print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    )
    start = p.stderr.rindex("{")
    js = p.stderr[start : p.stderr.index("}", start) + 1]
    return float(json.loads(js)["input_i"])


def duration(wav: Path) -> float:
    with wave.open(str(wav)) as w:
        return w.getnframes() / w.getframerate()


def encode(ffmpeg: str, src: Path, dst: Path, highpass: bool) -> float:
    with tempfile.TemporaryDirectory() as td:
        t = Path(td) / "trim.wav"
        trim(ffmpeg, src, t, highpass)
        d = duration(t)
        if d < 0.08:
            raise RuntimeError(f"clip too short after trimming ({d:.2f}s)")
        gain = TARGET_LUFS - loudness(ffmpeg, t)
        gain = max(-20.0, min(30.0, gain))
        fade = min(0.01, d / 4)
        af = (
            f"volume={gain:.2f}dB,alimiter=limit={PEAK_LIMIT}:level=false:attack=2:release=40,"
            f"afade=t=in:d={fade:.3f},afade=t=out:st={d - fade:.3f}:d={fade:.3f}"
        )
        tmp = dst.with_suffix(".part.mp3")
        run([ffmpeg, "-y", "-v", "error", "-i", str(t), "-af", af, "-ac", "1", "-ar", str(SAMPLE_RATE),
             "-c:a", "libmp3lame", "-b:a", BITRATE, "-map_metadata", "-1", "-id3v2_version", "0",
             "-write_xing", "1", str(tmp)])
        tmp.replace(dst)
        return d


def ensure_voice(work: Path) -> Path:
    vdir = work / "voices"
    vdir.mkdir(parents=True, exist_ok=True)
    model = vdir / f"{VOICE}.onnx"
    for name in (f"{VOICE}.onnx", f"{VOICE}.onnx.json", "MODEL_CARD"):
        dst = vdir / name
        if dst.exists():
            continue
        print(f"downloading {name}", file=sys.stderr)
        r = requests.get(VOICE_BASE_URL + quote(name), timeout=300, headers={"User-Agent": USER_AGENT})
        r.raise_for_status()
        dst.write_bytes(r.content)
    return model


# ---- credits -----------------------------------------------------------------------------------
def write_credits(sources: dict[str, dict]) -> None:
    ll = sorted((v for v in sources.values() if v["source"] == "lingua-libre"), key=lambda v: v["text"].lower())
    piper = [v for v in sources.values() if v["source"] == "piper"]
    lines = [
        "# Audio credits",
        "",
        "Pre-rendered European Portuguese (pt-PT) speech in `public/audio/`, built by",
        "`scripts/audio/render.py` (see `scripts/audio/README.md`). This file is generated; re-run the",
        "script instead of editing it by hand.",
        "",
        f"- **{len(ll)}** clips are native recordings from Lingua Libre (Wikimedia Commons).",
        f"- **{len(piper)}** clips are synthesised with the Piper voice `{VOICE}`.",
        "",
        "All clips were trimmed (leading/trailing silence), loudness-normalised and re-encoded as mono",
        "MP3. For the Lingua Libre recordings these are modifications of the original works; under the",
        "CC BY-SA licence the modified clips are shared under the same licence.",
        "",
        "## Piper TTS voice",
        "",
        f"- Model: `{VOICE}` from [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_PT/tug%C3%A3o/medium)",
        "  (engine: [Piper](https://github.com/OHF-Voice/piper1-gpl), GPL-3.0; the engine is only used at build time and is not shipped).",
        f"- Settings: length_scale {LENGTH_SCALE} (slightly slower than default, for learners).",
        "- Dataset: tugão, CC0 ([OHF-Voice/voice-datasets](https://github.com/OHF-Voice/voice-datasets)); piper-voices repository: MIT.",
        "- **Caveat:** the voice is a fine-tune of Piper's `en_US-lessac` voice, whose training data is",
        "  under the Blizzard 2013 Lessac licence, a **research-only** licence. The derived weights, and",
        "  therefore audio rendered with them, have no clear licence for other uses. This is acceptable for",
        "  this private, non-commercial household app, but the Piper clips must **not** be used or",
        "  distributed commercially. Replace them (re-render with another voice) before any public or",
        "  commercial release.",
        "",
        "## Lingua Libre recordings",
        "",
        "Recorded by European-Portuguese speakers via [Lingua Libre](https://lingualibre.org), hosted on",
        "Wikimedia Commons. Licence per file as stated on its Commons page.",
        "",
        "| Text | File | Speaker | Licence |",
        "|---|---|---|---|",
    ]
    for v in ll:
        title = v["title"].removeprefix("File:")
        lic = f"[{v['license']}]({v['licenseUrl']})" if v.get("licenseUrl") else v["license"]
        lines.append(f"| {v['text']} | [{title}]({v['url']}) | {v['speaker']} | {lic} |")
    CREDITS.parent.mkdir(parents=True, exist_ok=True)
    CREDITS.write_text("\n".join(lines) + "\n", "utf-8")


# ---- main --------------------------------------------------------------------------------------
def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--work", default=os.environ.get("AUDIO_WORK_DIR") or str(Path.home() / ".cache" / "pt-audio-work"),
                    help="scratch dir for downloads/caches (outside the repo). Env: AUDIO_WORK_DIR")
    ap.add_argument("--texts", help="JSON list of texts (default: run scripts/audio/collect.ts)")
    ap.add_argument("--refresh-ll", action="store_true", help="re-fetch the Lingua Libre file index")
    ap.add_argument("--no-ll", action="store_true", help="skip Lingua Libre entirely (Piper only)")
    ap.add_argument("--force", action="store_true", help="re-render every text")
    ap.add_argument("--keep-orphans", action="store_true", help="keep mp3s no current text uses")
    ap.add_argument("--ll-patience", type=float, default=5,
                    help="minutes to keep retrying (1 request/min) while Wikimedia throttles media downloads")
    ap.add_argument("--jobs", type=int, default=4)
    args = ap.parse_args()

    work = Path(args.work).resolve()
    work.mkdir(parents=True, exist_ok=True)
    (work / "ll").mkdir(exist_ok=True)
    (work / "piper").mkdir(exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ffmpeg = find_ffmpeg()

    if args.texts:
        texts = json.loads(Path(args.texts).read_text("utf-8"))
    else:
        out = work / "texts.json"
        subprocess.run(["node", str(REPO / "scripts" / "audio" / "collect.ts"), "--out", str(out)], check=True, cwd=REPO)
        texts = json.loads(out.read_text("utf-8"))

    overrides = load_json(OVERRIDES, {})
    force_piper = {audio_key(t) for t in overrides.get("forcePiper", [])}
    say_as = {audio_key(k): v for k, v in overrides.get("sayAs", {}).items()}

    by_key: dict[str, str] = {}
    for t in texts:
        if t.strip():
            by_key.setdefault(audio_key(t), t.strip())
    print(f"{len(by_key)} spoken texts", file=sys.stderr)

    manifest: dict[str, str] = load_json(MANIFEST, {})
    sources: dict[str, dict] = load_json(SOURCES, {})

    # 1. Plan: Lingua Libre where an exact pt-PT recording exists, Piper otherwise.
    index: dict[str, dict] = {}
    if not args.no_ll:
        wm = Wikimedia()
        wm.patience_deadline = time.time() + args.ll_patience * 60
        index = ll_index(wm, work, args.refresh_ll)
    ll_candidates = {k: index[match_form(t)]["title"] for k, t in by_key.items()
                     if k not in force_piper and match_form(t) in index}

    meta_cache_path = work / "lingualibre-meta.json"
    meta: dict[str, dict] = load_json(meta_cache_path, {})
    missing = sorted({t for t in ll_candidates.values() if t not in meta})
    if missing:
        meta.update(ll_metadata(wm, missing))
        write_json(meta_cache_path, meta)

    def piper_plan(k: str, text: str) -> dict:
        say = say_as.get(k) or synth_text(text)
        return {"text": text, "source": "piper", "voice": VOICE, "lengthScale": LENGTH_SCALE, "say": say,
                "file": short_hash(k, "piper", VOICE, str(LENGTH_SCALE), say, PIPELINE_VERSION) + ".mp3"}

    plan: dict[str, dict] = {}
    for k, text in by_key.items():
        title = ll_candidates.get(k)
        m = meta.get(title) if title else None
        if m:
            ok_speaker = m["speaker"] in LL_SPEAKERS and "European Portuguese" in m["categories"]
            ok_license = m["license"] in ALLOWED_LICENSES
            if ok_speaker and ok_license:
                plan[k] = {"text": text, "source": "lingua-libre", **{f: m[f] for f in
                           ("title", "speaker", "license", "licenseUrl", "url", "fileUrl")}}
                plan[k]["file"] = short_hash(k, "ll", m["title"], PIPELINE_VERSION) + ".mp3"
                continue
            print(f"  skip LL {title}: speaker={m['speaker']!r} license={m['license']!r}", file=sys.stderr)
        plan[k] = piper_plan(k, text)

    todo = [k for k, p in plan.items()
            if args.force or manifest.get(k) != p["file"] or not (OUT_DIR / p["file"]).exists()]
    print(f"{len(plan) - len(todo)} up to date, {len(todo)} to render", file=sys.stderr)

    # 2. Fetch / synthesise raw audio.
    raw: dict[str, Path] = {}
    failed: dict[str, str] = {}
    ll_deferred: list[str] = []
    voice = None
    for k in todo:
        p = plan[k]
        try:
            if p["source"] == "lingua-libre":
                try:
                    cached = sorted((work / "ll").glob(short_hash(p["title"]) + ".*"))
                    if cached:
                        dst = cached[0]
                    else:
                        data, kind = wm.download(p["fileUrl"])
                        dst = work / "ll" / f"{short_hash(p['title'])}.{kind}"
                        dst.write_bytes(data)
                    raw[k] = dst
                    p["downloaded"] = dst.name.split(".", 1)[1]  # original file or Commons transcode
                    continue
                except (RateLimited, requests.RequestException) as e:
                    # Use Piper for now; the next run retries the recording (plan still prefers it).
                    print(f"  LL download failed for {p['text']!r} ({e}); Piper this run", file=sys.stderr)
                    p = plan[k] = piper_plan(k, p["text"])
                    ll_deferred.append(p["text"])
            if voice is None:
                from piper import PiperVoice, SynthesisConfig  # type: ignore

                voice = PiperVoice.load(str(ensure_voice(work)))
                cfg = SynthesisConfig(length_scale=LENGTH_SCALE)
            dst = work / "piper" / (short_hash(p["say"], VOICE, str(LENGTH_SCALE)) + ".wav")
            if not dst.exists():
                with wave.open(str(dst), "wb") as w:
                    voice.synthesize_wav(p["say"], w, syn_config=cfg)
            raw[k] = dst
        except Exception as e:  # noqa: BLE001
            failed[k] = f"{type(e).__name__}: {e}"

    # 3. Trim, normalise, encode.
    def job(k: str):
        p = plan[k]
        try:
            d = encode(ffmpeg, raw[k], OUT_DIR / p["file"], highpass=p["source"] == "lingua-libre")
            return k, d, None
        except Exception as e:  # noqa: BLE001
            err = getattr(e, "stderr", "") or ""
            return k, None, f"{type(e).__name__}: {e} {err[-300:]}"

    with ThreadPoolExecutor(args.jobs) as ex:
        for k, d, err in ex.map(job, [k for k in todo if k in raw]):
            if err:
                failed[k] = err
            else:
                print(f"  {plan[k]['source']:12} {d:5.2f}s  {plan[k]['file']}  {plan[k]['text']}", file=sys.stderr)

    # 4. Manifest + provenance for current texts. A failed text keeps its previous file if any.
    new_manifest: dict[str, str] = {}
    new_sources: dict[str, dict] = {}
    for k, p in plan.items():
        if k in failed:
            if k in manifest and (OUT_DIR / manifest[k]).exists() and k in sources:
                new_manifest[k], new_sources[k] = manifest[k], sources[k]
            continue
        new_manifest[k] = p["file"]
        new_sources[k] = {f: v for f, v in p.items() if f != "fileUrl"}
    write_json(MANIFEST, new_manifest)
    write_json(SOURCES, new_sources)
    write_credits(new_sources)

    if not args.keep_orphans:
        used = set(new_manifest.values())
        for f in OUT_DIR.glob("*.mp3"):
            if f.name not in used:
                f.unlink()
        for f in OUT_DIR.glob("*.part.mp3"):
            f.unlink(missing_ok=True)

    n_ll = sum(1 for v in new_sources.values() if v["source"] == "lingua-libre")
    size = sum((OUT_DIR / f).stat().st_size for f in set(new_manifest.values()))
    print(f"\nmanifest: {len(new_manifest)}/{len(by_key)} texts  (lingua libre {n_ll}, piper {len(new_manifest) - n_ll})"
          f"  total {size / 1e6:.2f} MB", file=sys.stderr)
    if ll_deferred:
        print(f"{len(ll_deferred)} recordings not downloaded yet (rendered with Piper; re-run later): "
              + ", ".join(ll_deferred), file=sys.stderr)
    for k, e in failed.items():
        print(f"FAILED {by_key[k]!r}: {e}", file=sys.stderr)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
