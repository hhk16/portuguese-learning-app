# Animation frames to generate (GPT image)

The game animates Hadi, Ana, the puppy Bolacha and the host Pipo with a few key frames per move,
played like a flip book. This file lists every frame still needed, with the exact prompt for each.

## How to make them

1. **Attach the reference image** named in each section. Download it from the repo (branch
   `ccr-0f0e31c4-decr5f`), for example
   `https://github.com/hhk16/portuguese-learning-app/raw/ccr-0f0e31c4-decr5f/public/art/characters/hadi-stand.webp`.
2. **One image per frame.** Do not make sprite sheets: frames drawn together come out at different
   sizes.
3. Paste the **shared rules** below, then the frame line.
4. **Name each file** exactly as listed (`hadi-idle-0.png` …). Send them back as a zip, or as
   uploads with the names in the message.

### Shared rules (paste with every prompt)

> Edit the attached character image. Keep EXACTLY the same character: same face, hair, outfit,
> colours, proportions and the same 3D cartoon render style (soft studio light, Pixar-like). Full
> body, head to feet, nothing cropped. Same size and camera as the reference: front view, eye
> level, feet at the bottom of the frame. **Transparent background** (PNG with alpha). If
> transparency isn't possible, use a flat pure white background with no shadow on the floor.
> No text, no props unless asked. Only change the pose described here:

Portrait, 1024×1536.

---

## Hadi (reference: `public/art/characters/hadi-stand.webp`)

Hadi: man with short dark hair and a short beard, white linen shirt, black trousers, white
sneakers, a watch on his left wrist.

| File | Pose (add after the shared rules) |
|---|---|
| `hadi-idle-0.png` | Relaxed standing pose, arms loose by his sides, slight smile, eyes open. |
| `hadi-idle-1.png` | Same as idle-0 but breathing in: chest and shoulders a tiny bit higher. Eyes open. |
| `hadi-idle-2.png` | Same as idle-0 but eyes closed (a blink). |
| `hadi-type-0.png` | Holding a smartphone in both hands at chest height, looking down at it, typing with both thumbs, concentrated. |
| `hadi-type-1.png` | Same as type-0, thumbs in a different spot, tiny head tilt, lips pressed in concentration. |
| `hadi-wave-0.png` | His right hand raised beside his head, palm open to the viewer, waving, friendly smile. |
| `hadi-wave-1.png` | Same as wave-0, the SAME (right) hand tilted to the left. |
| `hadi-wave-2.png` | Same as wave-0, the SAME (right) hand tilted to the right. |
| `hadi-think-0.png` | One hand on his chin, the other arm across his body, looking up and to the side, thinking. |
| `hadi-think-1.png` | Same as think-0 but eyes looking to the other side, eyebrows a bit raised. |
| `hadi-sad-0.png` | Shoulders slumped, head slightly down, mouth in a small frown, arms hanging. |
| `hadi-sad-1.png` | Same as sad-0, sighing: eyes closed, shoulders even lower. |
| `hadi-point-0.png` | Pointing with his right arm to the right side of the image, excited open-mouth smile, as if saying "there!". |
| `hadi-point-1.png` | Same as point-0, arm slightly further out, leaning a bit towards it. |
| `hadi-win-0.png` | Both fists raised above his head in victory, big open-mouth grin, slight crouch. |
| `hadi-win-1.png` | Jumping: both feet off the ground, fists high, eyes closed in joy. |
| `hadi-win-2.png` | Landing: knees bent, one fist pumped down at hip height, shouting "yes!". |

## Ana (reference: `public/art/characters/ana-stand.webp`)

Ana: woman with long wavy brown hair, a black blazer over a black top, black leather shorts,
knee-high black boots and a thin necklace.

Make the same 17 frames as Hadi, with the same poses and file names starting with `ana-`
(`ana-idle-0.png` … `ana-win-2.png`). For the wave, use her right hand in all three frames.

## Bolacha the puppy (reference: `public/art/pet/pup-idle.webp`)

Bolacha: a small curly-haired cavapoo puppy, apricot/brown curls, a white patch on the chest.
The shared rules apply, but "full body" means the whole dog. Square 1024×1024.

| File | Pose |
|---|---|
| `pup-run-0.png` | Side view facing RIGHT, running: front legs reaching forward, back legs pushing, ears flying back, tongue out. |
| `pup-run-1.png` | Side view facing RIGHT, mid-run: all four paws gathered under the body, ears up. |
| `pup-run-2.png` | Side view facing RIGHT, running: front legs pushing back, back legs reaching forward. |
| `pup-run-3.png` | Side view facing RIGHT, mid-run: all four paws stretched out, body long, off the ground. |
| `pup-beg-0.png` | Sitting up on the hind legs, front paws raised together, begging, big eyes. |
| `pup-beg-1.png` | Same as beg-0, head tilted to one side, one ear flopped. |
| `pup-spin-0.png` | Front view, standing, happy, tail up. |
| `pup-spin-1.png` | Turned three-quarters to the left, chasing its tail. |
| `pup-spin-2.png` | Seen from behind, tail wagging. |
| `pup-spin-3.png` | Turned three-quarters to the right. |

## Pipo the host parrot (reference: `public/art/host/pipo-idle.webp`)

Pipo: a cartoon green parrot with a yellow belly, blue wing tips, a red bow tie and a
microphone. Portrait 1024×1536.

| File | Pose |
|---|---|
| `pipo-talk-0.png` | Holding the microphone near the beak, beak open wide, talking, other wing open in a gesture. |
| `pipo-talk-1.png` | Same as talk-0, beak half open, the gesturing wing a bit lower. |
| `pipo-talk-2.png` | Same as talk-0, beak closed, smiling. |
| `pipo-point-0.png` | Pointing with one wing to the RIGHT of the image (towards a screen), microphone in the other wing, beak open. |
| `pipo-point-1.png` | Same as point-0, leaning further towards the right. |
| `pipo-dance-0.png` | Dancing: weight on the left foot, wings up, eyes closed, happy. |
| `pipo-dance-1.png` | Dancing: both feet together, small hop, wings out to the sides. |
| `pipo-dance-2.png` | Dancing: weight on the right foot, wings up, eyes closed. |
| `pipo-dance-3.png` | Dancing: crouched, wings forward, winking. |
| `pipo-gasp-0.png` | Shocked: eyes wide, feathers puffed up, both wings to the cheeks. |

## Where they're used

- **idle**: Hadi and Ana breathe and blink between moments, so they're never frozen.
- **type**: shown while the players are writing on their phones (most games now have a writing phase).
- **wave**: a fixed version (the old one swapped arms), used when a player joins or answers.
- **think / sad / point / win**: the reactions after reveals, and the winner celebration.
- **pup-run**: Bolacha runs across the stage to the winner. **beg / spin**: idle moments and big wins.
- **pipo talk / point / dance / gasp**: the host moves while speaking, points at the TV for
  instructions, dances on big wins, and gasps at near misses.
