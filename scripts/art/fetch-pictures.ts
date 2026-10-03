/**
 * Downloads Fluent Emoji 3D pictures (MIT) + HatScripts circle-flags (MIT) for every wanted glyph.
 *
 *   PYTHONPATH=<dir with Pillow> node scripts/art/fetch-pictures.ts [--force]
 *
 * Wanted = src/art/wanted.ts WANTED_GLYPHS ∪ emoji found in src/curriculum string literals (live scan).
 * Output:
 *   public/art/pictures/<slug>.webp   ≤256×256 WebP q82 with alpha (slug = Fluent folder name, lower-case, dashes)
 *   public/art/flags/<code>.svg       circle flags (🇵🇹 → pt, 🏴 England → gb-eng)
 *   src/art/pictures.generated.json   normalised glyph → slug / flag code, ONLY for files that exist
 * Needs: git (for the Fluent listing: jsDelivr's listing API refuses this >50 MB repo), python3 + Pillow.
 * The glyph → asset index for the whole Fluent set is cached in $ART_CACHE/fluent-index.json.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { flagCode, normalizeGlyph } from "../../src/art/glyph.ts";
import { WANTED_GLYPHS } from "../../src/art/wanted.ts";
import { CACHE, REPO, download, fetchBuffer, kb, run } from "./common.ts";
import { scanCurriculumEmoji } from "./scan-curriculum.ts";

const FORCE = process.argv.includes("--force");
const FLUENT_REPO = "https://github.com/microsoft/fluentui-emoji.git";
const SIZE = 256;
const QUALITY = 82;

interface FluentAsset {
  folder: string; // e.g. "Red apple"
  file: string; // path under assets/, e.g. "Red apple/3D/red_apple_3d.png"
  glyph: string;
}
interface FluentIndex {
  commit: string;
  count: number;
  byGlyph: Record<string, FluentAsset>; // key = normalizeGlyph(glyph)
}

export function slugOf(folder: string): string {
  return folder
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function hexToGlyph(hex: string): string {
  return hex
    .trim()
    .split(/\s+/)
    .map((h) => String.fromCodePoint(parseInt(h, 16)))
    .join("");
}

/** Builds (once) and loads the glyph → Fluent 3D asset index for the whole set. */
export function fluentIndex(): FluentIndex {
  const cached = join(CACHE, "fluent-index.json");
  if (existsSync(cached) && !FORCE) return JSON.parse(readFileSync(cached, "utf8")) as FluentIndex;
  const dir = join(CACHE, "fluentui-emoji");
  if (!existsSync(join(dir, ".git"))) {
    console.log("Cloning Fluent Emoji listing (blobless, metadata only)…");
    run("git", ["clone", "--depth", "1", "--filter=blob:none", "--no-checkout", FLUENT_REPO, dir]);
    run("git", ["-C", dir, "sparse-checkout", "set", "--no-cone", "/assets/*/metadata.json"]);
    run("git", ["-C", dir, "checkout"]);
  }
  const commit = run("git", ["-C", dir, "rev-parse", "HEAD"]).trim();
  const paths = run("git", ["-C", dir, "-c", "core.quotePath=false", "ls-tree", "-r", "--name-only", "HEAD", "assets"]).split("\n");
  const png3d = new Map<string, string>(); // folder → best 3D png
  for (const p of paths) {
    const m = /^assets\/([^/]+)\/(3D|Default\/3D)\/[^/]+\.png$/.exec(p);
    if (!m) continue;
    const folder = m[1]!;
    // Prefer the plain 3D/ file; skin-tone emoji only have Default/3D (yellow).
    if (!png3d.has(folder) || m[2] === "3D") png3d.set(folder, p.slice("assets/".length));
  }
  const byGlyph: Record<string, FluentAsset> = {};
  for (const [folder, file] of png3d) {
    const metaPath = join(dir, "assets", folder, "metadata.json");
    if (!existsSync(metaPath)) continue;
    const meta = JSON.parse(readFileSync(metaPath, "utf8")) as { glyph?: string; unicode?: string };
    const glyphs = [meta.glyph, meta.unicode ? hexToGlyph(meta.unicode) : undefined].filter(Boolean) as string[];
    for (const g of glyphs) {
      const key = normalizeGlyph(g);
      if (!byGlyph[key]) byGlyph[key] = { folder, file, glyph: meta.glyph ?? g };
    }
  }
  const index: FluentIndex = { commit, count: png3d.size, byGlyph };
  writeFileSync(cached, JSON.stringify(index));
  console.log(`Indexed ${png3d.size} Fluent assets @ ${commit.slice(0, 7)}`);
  return index;
}

/** Emoji Fluent doesn't draw, mapped to the closest one it does. */
const ALIASES: Record<string, string> = {
  "👫": "🫂", // couples (👫 👬 👭 💑) are not in Fluent → people hugging
  "👬": "🫂",
  "👭": "🫂",
  "💑": "🫂",
};

/** Looks a glyph up; for unknown ZWJ sequences falls back to the first component (e.g. a gendered variant). */
function lookup(index: FluentIndex, glyph: string): { asset: FluentAsset; fallback: boolean } | null {
  const key = normalizeGlyph(glyph);
  const alias = ALIASES[key];
  if (alias && !index.byGlyph[key] && index.byGlyph[alias]) return { asset: index.byGlyph[alias]!, fallback: true };
  const hit = index.byGlyph[key];
  if (hit) return { asset: hit, fallback: false };
  const base = key.split("‍")[0]!;
  if (base !== key && index.byGlyph[base]) return { asset: index.byGlyph[base]!, fallback: true };
  return null;
}

const PY_CONVERT = `
import json, sys
from PIL import Image
for src, dst, size, q in json.load(sys.stdin):
    im = Image.open(src).convert("RGBA")
    im.thumbnail((size, size), Image.LANCZOS)
    im.save(dst, "WEBP", quality=q, method=6)
`;

async function main(): Promise<void> {
  const index = fluentIndex();
  const scanned = scanCurriculumEmoji();
  const wantedKeys = new Set(WANTED_GLYPHS.map(normalizeGlyph));
  const newFromCurriculum = scanned.filter((g) => !wantedKeys.has(normalizeGlyph(g)));
  const wanted = [...WANTED_GLYPHS, ...newFromCurriculum];
  if (newFromCurriculum.length) console.log(`+${newFromCurriculum.length} new curriculum emoji: ${newFromCurriculum.join(" ")}`);

  const picDir = join(REPO, "public/art/pictures");
  const flagDir = join(REPO, "public/art/flags");
  mkdirSync(picDir, { recursive: true });
  mkdirSync(flagDir, { recursive: true });

  const pictures: Record<string, string> = {};
  const flags: Record<string, string> = {};
  const missing: string[] = [];
  const fallbacks: string[] = [];
  const jobs: [string, string, number, number][] = [];

  for (const glyph of wanted) {
    const key = normalizeGlyph(glyph);
    const code = flagCode(glyph);
    if (code) {
      const dest = join(flagDir, `${code}.svg`);
      try {
        if (FORCE || !existsSync(dest)) writeFileSync(dest, await fetchBuffer(`https://hatscripts.github.io/circle-flags/flags/${code}.svg`));
        flags[key] = code;
      } catch (e) {
        missing.push(`${glyph} (flag ${code}: ${(e as Error).message})`);
      }
      continue;
    }
    const found = lookup(index, glyph);
    if (!found) {
      missing.push(glyph);
      continue;
    }
    if (found.fallback) fallbacks.push(`${glyph}→${found.asset.glyph}`);
    const slug = slugOf(found.asset.folder);
    const dest = join(picDir, `${slug}.webp`);
    if (FORCE || !existsSync(dest)) {
      const url = `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@${index.commit}/assets/${found.asset.file
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`;
      try {
        const png = await download(url, join(CACHE, "fluent-png", found.asset.file.replace(/\//g, "__")));
        jobs.push([png, dest, SIZE, QUALITY]);
      } catch (e) {
        missing.push(`${glyph} (${(e as Error).message})`);
        continue;
      }
    }
    pictures[key] = slug;
  }

  if (jobs.length) {
    console.log(`Converting ${jobs.length} PNG → WebP…`);
    run(process.env.PYTHON ?? "python3", ["-c", PY_CONVERT], { input: JSON.stringify(jobs) });
  }

  // Only reference files that really exist.
  for (const [k, slug] of Object.entries(pictures)) if (!existsSync(join(picDir, `${slug}.webp`))) delete pictures[k];
  for (const [k, code] of Object.entries(flags)) if (!existsSync(join(flagDir, `${code}.svg`))) delete flags[k];

  const sort = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  const out = {
    source: `microsoft/fluentui-emoji@${index.commit.slice(0, 12)} (3D) + HatScripts/circle-flags`,
    pictures: sort(pictures),
    flags: sort(flags),
  };
  writeFileSync(join(REPO, "src/art/pictures.generated.json"), JSON.stringify(out, null, 1) + "\n");

  const slugs = new Set(Object.values(pictures));
  const codes = new Set(Object.values(flags));
  let bytes = 0;
  for (const s of slugs) bytes += statSync(join(picDir, `${s}.webp`)).size;
  let flagBytes = 0;
  for (const c of codes) flagBytes += statSync(join(flagDir, `${c}.svg`)).size;
  console.log(`pictures: ${Object.keys(pictures).length} glyphs → ${slugs.size} webp (${kb(bytes)})`);
  console.log(`flags:    ${codes.size} svg (${kb(flagBytes)})`);
  if (fallbacks.length) console.log(`fallbacks (alias / ZWJ base used): ${fallbacks.join(" ")}`);
  if (missing.length) console.log(`MISSING (no asset): ${missing.join(" ")}`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
