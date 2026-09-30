# Art, 3D and sound credits

Third-party and generated media shipped in `public/art/` and `public/sfx/`. The scripts in `scripts/art/` rebuild all of it. Nothing in these folders is under a non-commercial or share-alike licence.

| What | Where | Pack / source | Licence |
|---|---|---|---|
| Pictures (emoji-style 3D renders, 256 px WebP) | `public/art/pictures/*.webp` | [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji), "3D" style (Default skin tone), commit `1ffb34c` | MIT (notice below) |
| Country flags (circular SVG) | `public/art/flags/*.svg` | [HatScripts circle-flags](https://github.com/HatScripts/circle-flags) (https://hatscripts.github.io/circle-flags/) | MIT (notice below) |
| Player characters (5 poses each + face portrait, WebP) | `public/art/characters/*.webp` | Generated for this private game with OpenAI gpt-image (image edits API). Hadi and Ana are drawn from photos Hadi supplied; the four guests are invented. Processed by `scripts/art/characters.py` | Project art (private use) |
| Stage backdrop | `public/art/backdrop.webp` | Generated with OpenAI gpt-image | Project art (private use) |
| UI sound effects | `public/sfx/*.mp3` | [Kenney: Interface Sounds](https://kenney.nl/assets/interface-sounds) 1.0 and [Kenney: UI Audio](https://kenney.nl/assets/ui-audio) | CC0 1.0 |
| Jingles | `public/sfx/success-jingle.mp3`, `fail-jingle.mp3` | [Kenney: Music Jingles](https://kenney.nl/assets/music-jingles) | CC0 1.0 |
| Whoosh | `public/sfx/whoosh.mp3` | Synthesised by `scripts/art/build-sfx.ts` (filtered noise) | Project code |

We changed the originals as follows:
- **Pictures:** re-encoded PNG → WebP (quality 82, alpha kept). The PNGs were already 256 px.
- **Characters:** trimmed to the figure, scaled to 720 px tall, WebP; faces cropped to 256 px.
- **Sounds:** trimmed levels (normalised and limited), then re-encoded OGG → MP3 at 96 kbps.

Kenney assets are public domain (CC0: https://creativecommons.org/publicdomain/zero/1.0/). Credit isn't required, but we give it gladly: **Kenney (www.kenney.nl)**.

---

## Microsoft Fluent Emoji: MIT License

```
MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE
```

## HatScripts circle-flags: MIT License

```
MIT License

Copyright (c) 2026 HatScripts

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Rebuilding

```sh
# caches go to $ART_CACHE (default: $TMPDIR/party-portugues-art-cache), never the repo
PYTHONPATH=<dir with Pillow> node scripts/art/fetch-pictures.ts   # pictures + flags + src/art/pictures.generated.json
FFMPEG=<path to ffmpeg> node scripts/art/build-sfx.ts             # e.g. from pip imageio-ffmpeg
PYTHONPATH=<dir with Pillow> python3 scripts/art/characters.py <dir with the generated PNGs>   # characters + backdrop
```
