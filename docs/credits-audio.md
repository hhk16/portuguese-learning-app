# Audio credits

Pre-rendered European Portuguese (pt-PT) speech in `public/audio/`, built by
`scripts/audio/render.py` (see `scripts/audio/README.md`). This file is generated; re-run the
script instead of editing it by hand.

- **23** clips are native recordings from Lingua Libre (Wikimedia Commons).
- **0** clips are synthesised with Google Gemini TTS (`gemini-3.8-flash-tts`, voice -, language pt-PT).
- **670** clips are synthesised with the Piper voice `pt_PT-tugão-medium`.

## Gemini TTS

- Generated at build time with the Gemini API text-to-speech model `gemini-3.8-flash-tts` (prebuilt voice,
  `languageCode: pt-PT`), under the Gemini API terms of service. Only the text is sent; the API key
  comes from the environment and is never stored in the repository.

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
| Adeus! | [LL-Q5146 (por)-Santamarcanda-adeus.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-adeus.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| advogado | [LL-Q5146 (por)-Santamarcanda-advogado.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-advogado.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| bom | [LL-Q5146 (por)-Santamarcanda-bom.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-bom.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| bonito | [LL-Q5146 (por)-Santamarcanda-bonito.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-bonito.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| caro | [LL-Q5146 (por)-Santamarcanda-caro.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-caro.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| cinco | [LL-Q5146 (por)-Santamarcanda-cinco.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-cinco.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| da | [LL-Q5146 (por)-Santamarcanda-da.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-da.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| das | [LL-Q5146 (por)-Santamarcanda-das.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-das.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Depressa! | [LL-Q5146 (por)-Santamarcanda-depressa.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-depressa.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Desculpe. | [LL-Q5146 (por)-Santamarcanda-desculpe.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-desculpe.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| dez | [LL-Q5146 (por)-Santamarcanda-dez.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-dez.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| difícil | [LL-Q5146 (por)-Santamarcanda-difícil.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-dif%C3%ADcil.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| do | [LL-Q5146 (por)-Santamarcanda-do.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-do.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| dois | [LL-Q5146 (por)-Santamarcanda-dois.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-dois.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| dos | [LL-Q5146 (por)-Santamarcanda-dos.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-dos.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| engenheiro | [LL-Q5146 (por)-Waldyrious-engenheiro.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Waldyrious-engenheiro.wav) | Waldyrious | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| estudante | [LL-Q5146 (por)-Waldyrious-estudante.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Waldyrious-estudante.wav) | Waldyrious | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| feliz | [LL-Q5146 (por)-Santamarcanda-feliz.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-feliz.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Obrigado. | [LL-Q5146 (por)-Santamarcanda-obrigado.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-obrigado.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Olá! | [LL-Q5146 (por)-Santamarcanda-olá.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-ol%C3%A1.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Perfeito! | [LL-Q5146 (por)-Santamarcanda-perfeito.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-perfeito.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Quase! | [LL-Q5146 (por)-Santamarcanda-quase.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-quase.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Troca! | [LL-Q5146 (por)-Santamarcanda-troca.wav](https://commons.wikimedia.org/wiki/File:LL-Q5146_(por)-Santamarcanda-troca.wav) | Santamarcanda | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
