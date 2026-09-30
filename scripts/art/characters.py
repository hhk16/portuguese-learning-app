"""
Process generated character art into game assets.

Source PNGs (transparent, 1024x1536, made with OpenAI gpt-image for this private game) live
outside the repo. Usage:
  PYTHONPATH=<pillow> python3 scripts/art/characters.py <source-dir>
Source names: <id>-full.png|<id>.png (wave), <id>-cheer.png, <id>-oops.png, <id>-think.png, backdrop.png
Output: public/art/characters/<id>-<pose>.webp, public/art/characters/<id>.webp (face), public/art/backdrop.webp
"""
import os, sys
from PIL import Image

src = sys.argv[1]
out = os.path.join(os.path.dirname(__file__), "..", "..", "public", "art")
os.makedirs(os.path.join(out, "characters"), exist_ok=True)

IDS = {"ana": "ana", "hadi": "hadi", "guest-a": "a", "guest-b": "b", "guest-c": "c", "guest-d": "d"}

def load(path):
    im = Image.open(path).convert("RGBA")
    a = im.getchannel("A").point(lambda v: 255 if v > 24 else 0)
    box = a.getbbox()
    return im, box

def pose(im, box, dest):
    pad = 16
    x0, y0, x1, y1 = box
    crop = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))
    h = 720
    w = round(crop.width * h / crop.height)
    crop.resize((w, h), Image.LANCZOS).save(dest, "WEBP", quality=86, method=6)

def face(im, box, dest):
    x0, y0, x1, y1 = box
    fig_h = y1 - y0
    side = int(fig_h * 0.34)
    # Head centre: the horizontal centre of opaque pixels in the top band of the figure.
    band = im.crop((x0, y0, x1, y0 + int(fig_h * 0.22))).getchannel("A")
    xs = [x for x in range(band.width) for y in range(0, band.height, 6) if band.getpixel((x, y)) > 128]
    cx = x0 + (sorted(xs)[len(xs) // 2] if xs else (x1 - x0) // 2)
    cy = y0 + int(fig_h * 0.16)
    sq = im.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)).resize((256, 256), Image.LANCZOS)
    sq.save(dest, "WEBP", quality=88, method=6)

for name, cid in IDS.items():
    base = next((p for p in [f"{name}-full.png", f"{name}.png"] if os.path.exists(os.path.join(src, p))), None)
    if not base:
        continue
    im, box = load(os.path.join(src, base))
    pose(im, box, os.path.join(out, "characters", f"{cid}-wave.webp"))
    # Face portrait from the standing pose when there is one (no hand in front of the face).
    stand = os.path.join(src, f"{name}-stand.png")
    fim, fbox = load(stand) if os.path.exists(stand) else (im, box)
    face(fim, fbox, os.path.join(out, "characters", f"{cid}.webp"))
    for p in ["cheer", "oops", "think", "stand"]:
        f = os.path.join(src, f"{name}-{p}.png")
        if os.path.exists(f):
            im2, box2 = load(f)
            pose(im2, box2, os.path.join(out, "characters", f"{cid}-{p}.webp"))
    print("done", cid)

bd = os.path.join(src, "backdrop.png")
if os.path.exists(bd):
    Image.open(bd).convert("RGB").save(os.path.join(out, "backdrop.webp"), "WEBP", quality=84, method=6)
    print("done backdrop")
