# Sound-effect credits

The 32 sound effects in `public/sfx/` come from two free sources:

- **Mixkit** (by Envato), under the [Mixkit Sound Effects Free License](https://mixkit.co/license/#sfxFree).
  You can use the sounds in commercial and non-commercial projects, video games included, and
  modify them. No attribution is required. The one restriction: you can't redistribute the sounds
  on their own (as stock, in a sound pack, and so on). Shipping them inside this game is allowed.
  Mixkit doesn't name an author for each sound effect.
- **Freesound**, only sounds released under
  [CC0 1.0 (public domain dedication)](http://creativecommons.org/publicdomain/zero/1.0/). No
  attribution is required. The authors are credited anyway, as a courtesy. We used Freesound's
  "HQ preview" encoding of each sound (MP3, 128 kbps or more). The CC0 dedication covers it the same
  as the original upload.

No Kenney clips are used any more. Nothing here has an unclear licence, and nothing is ripped from
another game.

## Processing (all files)

Each sound went through these steps, in order:

1. Cut to the time range given below. A sine-shaped fade-in and fade-out was applied, and the
   leading and trailing silence was trimmed (below -50 dB before the sound, below -60 dB after it).
2. Loudness was normalised with the ffmpeg EBU R128 meter. Clips shorter than 0.5 s were padded
   with silence to 0.5 s before measuring.
   - Short UI sounds target about -16 LUFS.
   - Stingers target -14 to -15 LUFS.
   - Very small sounds (tap, tick, dial, card-flip, marker) are set 2-4 dB lower on purpose.
3. True peak stays at or below -1 dBTP, measured on the final MP3. Where the peak was reached before
   the loudness target, a look-ahead limiter (2 ms look-ahead, 60 ms release) removed at most 3 dB.
   For hard transients (clicks, cash register, cymbal) it was allowed to remove up to 4-5 dB. The
   "limiter" column below shows how much it removed.
4. Encoded to MP3 at 44.1 kHz with LAME: 96 kbps for mono files, 112 kbps for stereo files.

Loudness in the table below is the integrated loudness of the final MP3. Clips well under 0.4 s
measure lower than they sound, because of the padding in step 2.

"Mono" means the stereo source was summed to mono.

## Files

### Replaced UI sounds

| File | Source | Original sound (id / file) | Author | Licence | URL | What was changed |
|---|---|---|---|---|---|---|
| `tap.mp3` | Mixkit | "Egg bubble pop" (#3192) | Mixkit (no author listed) | Mixkit SFX Free | https://mixkit.co/free-sound-effects/bubbles/ (file: https://assets.mixkit.co/active_storage/sfx/3192/3192.wav) | Kept only the first bubble "bloop" (0.055–0.145 s), mono, 0.08 s, -23 LUFS, limiter 4 dB |
| `select.mp3` | Mixkit | "Select click" (#1109) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/interface/ (…/sfx/1109/1109.wav) | 0–0.40 s, fade-out 0.12 s, mono, 0.34 s, -17.6 LUFS, limiter 3 dB |
| `back.mp3` | Mixkit | "Software interface back" (#2575) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/interface/ (…/sfx/2575/2575.wav) | 0–0.60 s (three falling notes), fade-out 0.2 s, mono, -16.2 LUFS |
| `correct.mp3` | Mixkit | "Correct positive answer" (#949) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/correct/ (…/sfx/949/949.wav) | 0–0.85 s (rising arpeggio), mono, 0.77 s, -16 LUFS |
| `wrong.mp3` | Mixkit | "Negative answer lose" (#2032) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/lose/ (…/sfx/2032/2032.wav) | 0–0.95 s (soft descending "uh-oh"), fade-out 0.3 s, mono, -16 LUFS |
| `pop.mp3` | Mixkit | "Soap bubble sound" (#2925) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/bubbles/ (…/sfx/2925/2925.wav) | 0.03–0.26 s (two rising bubble pops), mono, 0.21 s, limiter 4 dB |
| `whoosh.mp3` | Mixkit | "Quick swoosh" (#1462) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/swoosh/ (…/sfx/1462/1462.wav) | 0–0.48 s, mono, 0.47 s, -18 LUFS (soft air swoosh, no hiss) |
| `reveal.mp3` | Mixkit | "Tile game reveal" (#960) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/game-show/ (…/sfx/960/960.wav) | 0–1.2 s, fade-out 0.4 s, mono, 1.13 s, limiter 3 dB |
| `star.mp3` | Mixkit | "Game loot win" (#2013) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/win/ (…/sfx/2013/2013.wav) | 0.10–0.95 s, mono, 0.76 s, limiter 3 dB |
| `tick.mp3` | Mixkit | "Fast wall clock ticking" (#1063) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/clock/ (…/sfx/1063/1063.wav) | One wooden clock tick (0.099–0.30 s), mono, 0.15 s, -21.5 LUFS |
| `countdown-go.mp3` | Mixkit | "Melodic bonus collect" (#1938) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/win/ (…/sfx/1938/1938.wav) | 0.04–1.25 s (quick rising run with a bell tail), mono, 1.1 s, -15 LUFS |
| `success-jingle.mp3` | Mixkit | "Correct answer reward" (#952) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/game-show/ (…/sfx/952/952.wav) | 0–1.45 s, fade-out 0.45 s, stereo, 1.38 s, -15 LUFS |
| `fail-jingle.mp3` | Mixkit | "Losing marimba" (#2025) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/lose/ (…/sfx/2025/2025.wav) | 0–1.9 s (descending marimba run), fade-out 0.7 s, stereo, 1.81 s, -15 LUFS |
| `match.mp3` | Mixkit | "Correct answer notification" (#947) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/correct/ (…/sfx/947/947.wav) | 0–0.62 s (happy two-tone, octave up), mono, 0.59 s, limiter 3 dB |
| `lock.mp3` | Mixkit | "Gaming lock" (#2848) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/lock/ (…/sfx/2848/2848.wav) | 0–0.18 s, mono, 0.16 s, -16.8 LUFS |

### New sounds

| File | Source | Original sound (id / file) | Author | Licence | URL | What was changed |
|---|---|---|---|---|---|---|
| `card-flip.mp3` | Freesound | #84322 "flipCard.wav" | Splashdust | CC0 1.0 | https://freesound.org/people/Splashdust/sounds/84322/ | 0.27–0.80 s (flick and slap), mono, 0.52 s, -20.8 LUFS, limiter 5 dB |
| `dial.mp3` | Freesound | #96151 "SingleWind3.wav" (winding a small clock, one click) | BMacZero | CC0 1.0 | https://freesound.org/people/BMacZero/sounds/96151/ | 60 Hz high-pass, mono, 0.13 s, -24.6 LUFS (quiet on purpose, plays on every step), limiter 5 dB |
| `marker.mp3` | Mixkit | "Writing scribble on paper" (#2369) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/write/ (…/sfx/2369/2369.wav) | 0.02–0.50 s (two quick strokes), mono, 0.47 s, -19 LUFS |
| `cash.mp3` | Freesound | #209578 "Cash Register Purchase" (remix of CC0 #184438 by CapsLok) | Zott820 | CC0 1.0 | https://freesound.org/people/Zott820/sounds/209578/ | 0.05–1.45 s ("ka-ching"), fade-out 0.35 s, mono, 1.34 s, -18.4 LUFS, limiter 4 dB |
| `drumroll.mp3` | Mixkit | "Drum Roll" (#566) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/cymbal/ (…/sfx/566/566.wav) | The roll only, 0.95–2.985 s: it stops 12 ms before the crash, so there is **no cymbal**. 0.25 s fade-in, +6 dB crescendo ramp, stereo, 2.02 s, -15 LUFS |
| `cymbal.mp3` | Mixkit | "Drum Roll" (#566), its ending | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/cymbal/ (…/sfx/566/566.wav) | The crash that ends the same roll, 2.993–5.30 s, fade-out 0.8 s, stereo, 2.07 s, -15.9 LUFS, limiter 4 dB. Play it right after `drumroll` |
| `fanfare.mp3` | Mixkit | "Orchestra triumphant trumpets" (#2285) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/orchestra/ (…/sfx/2285/2285.wav) | 0.17–3.15 s, fade-out 0.45 s over the last chord, stereo, 2.88 s, -14 LUFS |
| `sad-trombone.mp3` | Mixkit | "Sad game over trombone" (#471) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/funny/ (…/sfx/471/471.wav) | Classic D-C#-C-B "wah-wah-wah-waaah", 0–3.15 s, stereo, 3.12 s, -14 LUFS |
| `crowd-ooh.mp3` | Freesound | #264499 "Crowd Ooohs and Ahhhs in Excitement" | noah0189 | CC0 1.0 | https://freesound.org/people/noah0189/sounds/264499/ | One "ooooh" (11.12–13.05 s of the 25.8 s original, picked by vowel spectrum), resampled from 48 kHz, stereo, 1.87 s, -15 LUFS |
| `crowd-cheer.mp3` | Mixkit | "Happy crowd cheer" (#975) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/happy/ (…/sfx/975/975.wav) | 0.28–2.55 s, fade-out 0.7 s, stereo, 2.25 s, -14 LUFS |
| `boom.mp3` | Freesound | #784205 "Cartoon Explosion (designed on cassette tape lol)" | modusmogulus | CC0 1.0 | https://freesound.org/people/modusmogulus/sounds/784205/ | 0–2.1 s, fade-out 0.7 s, 45 Hz high-pass. Most of its energy is at 150 Hz–1 kHz, so there is little sub-bass for a living room. Stereo, 2.05 s, -16 LUFS (softer than the other stingers) |
| `whistle.mp3` | Freesound | #218318 "Referee whistle blow, gymnasium.wav" | SpliceSound | CC0 1.0 | https://freesound.org/people/SpliceSound/sounds/218318/ | One referee blast with the room tail, 0.08–1.40 s, mono, 1.26 s, -16 LUFS (lowered because a whistle is piercing) |
| `ding.mp3` | Mixkit | "Service bell" (#931) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/bell/ (…/sfx/931/931.wav) | 0–0.55 s ("order up" desk bell), mono, 0.51 s, -17.7 LUFS, limiter 3 dB |
| `sparkle.mp3` | Mixkit | "Magic wand sparkle" (#3062) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/sparkle/ (…/sfx/3062/3062.wav) | 0–1.0 s, stereo, 0.96 s, -16 LUFS |
| `heartbeat.mp3` | Mixkit | "Human single heart beat" (#490) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/heartbeat/ (…/sfx/490/490.wav) | One "lub-dub", 0–0.62 s. 35 Hz high-pass, plus 50 % soft saturation that adds harmonics so the thump can be heard on small TV and phone speakers. Mono, 0.49 s, -15 LUFS |
| `buzzer.mp3` | Mixkit | "Game show wrong answer buzz" (#950) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/wrong/ (…/sfx/950/950.wav) | 0–0.30 s, mono, 0.27 s, -16 LUFS |
| `clock-tick-fast.mp3` | Mixkit | "Fast wall clock ticking" (#1063) | Mixkit | Mixkit SFX Free | https://mixkit.co/free-sound-effects/clock/ (…/sfx/1063/1063.wav) | Rebuilt as a loop: the recording's "tick" (at 0.109 s) and "tock" (at 0.402 s) alternate every 0.25 s, 8 hits, exactly 2.000 s. The loop is seamless because each hit dies away long before the next one. Mono, -20 LUFS, limiter 4 dB |

Mixkit file URLs follow the pattern `https://assets.mixkit.co/active_storage/sfx/<id>/<id>.wav`.
