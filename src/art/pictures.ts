/**
 * Emoji → picture URL. Pictures are Microsoft Fluent Emoji "3D" renders (MIT) as 256px WebP in
 * public/art/pictures/, country flags are HatScripts circle-flags (MIT) SVGs in public/art/flags/.
 * Only files that were actually downloaded are listed in pictures.generated.json, so a non-null URL
 * always points at a real file. Regenerate with `node scripts/art/fetch-pictures.ts`.
 *
 *   pictureUrl("🍎")  → "/art/pictures/red-apple.webp"
 *   pictureUrl("🇵🇹") → "/art/flags/pt.svg"
 *   pictureUrl("❤️") === pictureUrl("❤")   (U+FE0F-insensitive)
 */
import generated from "./pictures.generated.json" with { type: "json" };
import { flagCode, normalizeGlyph } from "./glyph.ts";
import { assetUrl } from "./url.ts";

const PICTURES: Record<string, string> = generated.pictures;
const FLAGS: Record<string, string> = generated.flags;

const FLAG_CODES = new Set(Object.values(FLAGS));

/** URL of the picture for an emoji glyph, or null when we don't ship one (fall back to text). */
export function pictureUrl(glyph: string): string | null {
  const key = normalizeGlyph(glyph);
  const slug = PICTURES[key];
  if (slug) return assetUrl(`art/pictures/${slug}.webp`);
  const code = FLAGS[key];
  return code ? assetUrl(`art/flags/${code}.svg`) : null;
}

/** ISO code of a flag glyph that has a shipped circle flag ("🇵🇹" → "pt"), else null. */
export function shippedFlagCode(glyph: string): string | null {
  const code = flagCode(glyph);
  return code && FLAG_CODES.has(code) ? code : null;
}

/** True when `pictureUrl(glyph)` would return a URL. */
export function hasPicture(glyph: string): boolean {
  return pictureUrl(glyph) !== null;
}

/** Number of distinct picture files (WebP) shipped. */
export const PICTURE_COUNT: number = new Set(Object.values(PICTURES)).size;
/** Number of flag SVGs shipped. */
export const FLAG_COUNT: number = new Set(Object.values(FLAGS)).size;
