# Pre-rendered pt-PT audio

Builds `public/audio/manifest.json` plus one MP3 per spoken text. `src/audio/tts.ts` looks each
text up by `audioKey(text)` and plays the file. If a text has no file, it falls back to the device's
speech synthesis.

| File | What it is |
|---|---|
| `collect.ts` | Prints `allSpokenTexts()` (from `src/curriculum/spoken.ts`) as JSON |
| `render.py` | Chooses a source per text, then fetches/synthesises, trims, normalises and encodes the audio. Writes the manifest, `sources.json` and `docs/credits-audio.md` |
| `sources.json` | Generated provenance for each key: source, Commons file, speaker, licence, URL, or the text Piper was given |
| `overrides.json` | Manual fixes. `forcePiper`: texts that must not use a recording (for example, a bad take). `sayAs`: `{ "text": "what Piper should read" }` for pronunciation fixes |

## Sources, in priority order

1. **Lingua Libre** recordings on Wikimedia Commons, only from European-Portuguese speakers
   (`LL_SPEAKERS` in `render.py`: Santamarcanda, Waldyrious). A recording is used only when it
   matches the text exactly: case-insensitive, NFC, trailing punctuation ignored. The script checks
   the licence (from `extmetadata`) and the speaker before using a file.
2. **A TTS voice** for everything else:
   - **Gemini TTS** (default when `GEMINI_API_KEY` is set): `gemini-3.8-flash-tts`, prebuilt voice
     **Leda** (`--gemini-voice` to change), `languageCode: pt-PT`. Only the text is sent — the model
     reads any instruction aloud, so accent comes from the language code alone. 429s are waited out;
     a clip much longer than its text (the model said something else) is re-requested once.
   - **Piper** `pt_PT-tugão-medium` (`--engine piper`, offline), at `length_scale` 1.12.

   Before synthesis, display punctuation is normalised: `/` becomes `. `, `·` becomes `, `, and `…`
   becomes `, `. See `synth_text()`.

Output: mono MP3, 22.05 kHz, 48 kbps CBR, about 60 ms of silence kept at each end, gain set to
-18 LUFS (EBU R128) and limited to -1.5 dBFS. Files are named `sha1(key + source + settings)[:10].mp3`,
so a file's name changes only when its content would change.

## One-time setup

Keep the venv and caches **outside the repo**:

```sh
WORK=~/.cache/pt-audio-work            # any scratch dir outside the repo
python3 -m venv "$WORK/venv"
"$WORK/venv/bin/pip" install piper-tts imageio-ffmpeg requests
```

`imageio-ffmpeg` provides a static ffmpeg, so no system ffmpeg is needed. The script downloads the
Piper voice (~63 MB) into `$WORK/voices/` on first use. It needs Node 22+, which runs `.ts` directly.

## Re-run (incremental)

```sh
export GEMINI_API_KEY=…   # from the environment/secret store — never commit it
"$WORK/venv/bin/python" scripts/audio/render.py --work "$WORK"
```

- Runs `collect.ts` itself (or pass `--texts file.json`). Texts that already have the right file
  are skipped, so only new or changed texts get rendered.
- MP3s that no current text uses are deleted (keep them with `--keep-orphans`).
- The Lingua Libre file index and metadata are cached in `$WORK`. `--refresh-ll` re-fetches the
  index, for example after a speaker uploads new words.
- `--force` re-renders everything. `--no-ll` skips Lingua Libre (TTS only).
- `--engine piper|gemini` picks the TTS voice; changing voice or engine re-renders those texts.
- Exit code 1 means some text failed. The failures are listed at the end of the log, and a failed
  text keeps its previous file if it had one.

### Wikimedia rate limits

Every request sends a descriptive User-Agent, with at least 1 s between API calls and 8 s between
media downloads. `upload.wikimedia.org` often returns 429 with `Retry-After: 600` for **original**
files from shared or cloud IPs. When that happens, the script uses Commons' own transcode of the same
recording (`/transcoded/…/<file>.ogg`, Vorbis at about 110 kbps) instead. `sources.json` records which
one was used (`downloaded`).

While it is throttled, the script retries at most once a minute for `--ll-patience` minutes (default
5). If a recording still can't be downloaded, that text is rendered with Piper for now and listed as
"not downloaded yet". The next run tries the recording again. Downloads are cached in `$WORK/ll/`.
On a throttled network, run once with a long budget, for example `--ll-patience 60`.

## Checks

```sh
node scripts/audio/collect.ts --out /tmp/texts.json
"$WORK/venv/bin/python" - <<'EOF'
import json, re, unicodedata
key = lambda t: re.sub(r"\s+", " ", unicodedata.normalize("NFC", t.strip().lower()))
m = json.load(open("public/audio/manifest.json"))
missing = [t for t in json.load(open("/tmp/texts.json")) if key(t) not in m]
print(len(m), "entries; missing:", missing)
EOF
```

## Licences

See `docs/credits-audio.md`. The Piper voice is a fine-tune of a voice trained on research-only
data (Blizzard 2013 Lessac). Its clips are fine for this private, non-commercial app but must be
replaced before any commercial or public distribution.
