# Assets & licences

Party Português is procedural by design. Almost everything you see and hear is generated in code, so the game has one visual language and no third-party media.

| Asset | Source | Licence |
|---|---|---|
| 3D world, karts, track, Blip, avatars | Procedural (three.js primitives + shaders in `src/tv/three/`) | Project code |
| 2D avatars | Procedural SVG (`src/ui/Avatar.tsx`) | Project code |
| Sound effects | `public/sfx/*.mp3` — Mixkit (Free SFX License) and CC0 Freesound; per-file sources in `docs/credits-sfx.md`. A small Web Audio fallback plays until a file loads | Mixkit SFX Free License / CC0 1.0 |
| Music | `public/music/*.mp3` — generated for this game with Google Lyria (see `docs/credits-art.md`) | Project audio (private use) |
| Game sets, host mascot (Pipo), the puppy | `public/art/sets/*.webp`, `public/art/host/*.webp`, `public/art/pet/*.webp` — generated with OpenAI gpt-image (the puppy from the owners' own photo as reference) | Project art (private use) |
| Font: Bungee | Google Fonts via `@fontsource/bungee` | SIL OFL 1.1 |
| Font: Press Start 2P | Google Fonts via `@fontsource/press-start-2p` | SIL OFL 1.1 |
| Font: Nunito | Google Fonts via `@fontsource/nunito` | SIL OFL 1.1 |
| Native TV scenes, character close-ups and café food | `public/art/native-tv/*.webp` — generated with OpenAI image generation; Hadi/Ana scene artwork references their existing photo-derived characters | Project art (private use) |
| Native TV Nunito | Google Fonts `ofl/nunito`, font and OFL licence bundled in `public/art/native-tv/fonts/` | SIL OFL 1.1 |
| Emoji | Rendered by the device's system font | Device |

## Voice (PT-PT speech)

The audio pipeline doesn't depend on any one provider. Curriculum data stores only text; `src/audio/tts.ts` plays a pre-rendered file from `public/audio/manifest.json` when one exists, and otherwise uses the device's `pt-PT` speech synthesis.

**Evaluated and not adopted (for now): Piper `pt_PT-tugão-medium`.**
- Its model card says the tugão dataset is CC0, and the piper-voices repo is MIT.
- But the voice was **fine-tuned from Piper's `en_US-lessac` voice**. That voice's training data is under the *Blizzard 2013 Lessac* licence, which is a **research licence**.
- The derived weights therefore don't have a clear licence for non-research use, so under our asset rule we don't ship audio rendered with it.
- It may be acceptable for private, non-commercial household use, but that is the owner's decision.
- Candidates: a pt_PT voice trained from scratch on permissively licensed data, or a TTS service whose terms allow storing the rendered audio (pre-rendered once, so there's no runtime dependency).

## Book material

*Português a Valer 1* (Lidel) is used only as a curriculum reference. The book PDFs and rendered page images are never committed. Game items are original sentences that exercise the same skills. `src/curriculum/source/source-map.json` holds only structure, word lists and grammar paradigms, with no passages, dialogues, images, recordings or answer keys.
