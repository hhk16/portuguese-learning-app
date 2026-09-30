# Audio credits

Pre-rendered European Portuguese (pt-PT) speech in `public/audio/`, built by
`scripts/audio/render.py` (see `scripts/audio/README.md`). This file is generated; re-run the
script instead of editing it by hand.

- **0** clips are native recordings from Lingua Libre (Wikimedia Commons).
- **573** clips are synthesised with the Piper voice `pt_PT-tugão-medium`.

All clips were trimmed (leading/trailing silence), loudness-normalised and re-encoded as mono
MP3. For the Lingua Libre recordings these are modifications of the original works; under the
CC BY-SA licence the modified clips are shared under the same licence.

## Piper TTS voice

- Model: `pt_PT-tugão-medium` from [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_PT/tug%C3%A3o/medium)
  (engine: [Piper](https://github.com/OHF-Voice/piper1-gpl), GPL-3.0; the engine is only used at build time and is not shipped).
- Settings: length_scale 1.12 (slightly slower than default, for learners).
- Dataset: tugão, CC0 ([OHF-Voice/voice-datasets](https://github.com/OHF-Voice/voice-datasets)); piper-voices repository: MIT.
- **Caveat:** the voice is a fine-tune of Piper's `en_US-lessac` voice, whose training data is
  under the Blizzard 2013 Lessac licence, a **research-only** licence. The derived weights, and
  therefore audio rendered with them, have no clear licence for other uses. This is acceptable for
  this private, non-commercial household app, but the Piper clips must **not** be used or
  distributed commercially. Replace them (re-render with another voice) before any public or
  commercial release.

## Lingua Libre recordings

Recorded by European-Portuguese speakers via [Lingua Libre](https://lingualibre.org), hosted on
Wikimedia Commons. Licence per file as stated on its Commons page.

| Text | File | Speaker | Licence |
|---|---|---|---|
