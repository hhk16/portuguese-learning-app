/**
 * Emoji glyph helpers shared by the runtime (`pictures.ts`) and the asset scripts (`scripts/art/`).
 * No dependencies; safe in the browser and in Node.
 */

const FE0F = /️/g;
const SKIN_TONE = /[\u{1F3FB}-\u{1F3FF}]/gu;
const REGIONAL = /^[\u{1F1E6}-\u{1F1FF}]{2}$/u;
/** 🏴 + tag letters + cancel tag: subdivision flags such as England (🏴󠁧󠁢󠁥󠁮󠁧󠁿). */
const TAG_FLAG = /^\u{1F3F4}([\u{E0061}-\u{E007A}\u{E0030}-\u{E0039}]+)\u{E007F}$/u;

/**
 * Canonical key for matching: strips variation selector-16 (U+FE0F) and skin-tone modifiers,
 * keeps ZWJ sequences intact. "❤️" and "❤" normalise to the same key.
 */
export function normalizeGlyph(glyph: string): string {
  return glyph.trim().replace(FE0F, "").replace(SKIN_TONE, "");
}

/**
 * ISO-like code for a flag glyph, matching HatScripts circle-flags file names:
 * 🇵🇹 → "pt", 🏴󠁧󠁢󠁥󠁮󠁧󠁿 → "gb-eng". Returns null when the glyph is not a country/subdivision flag.
 */
export function flagCode(glyph: string): string | null {
  const g = normalizeGlyph(glyph);
  if (REGIONAL.test(g)) {
    return [...g].map((c) => String.fromCharCode(c.codePointAt(0)! - 0x1f1e6 + 97)).join("");
  }
  const tag = TAG_FLAG.exec(g);
  if (tag) {
    const letters = [...tag[1]!].map((c) => String.fromCharCode(c.codePointAt(0)! - 0xe0000)).join("");
    // Tag sequences are region (2 letters) + subdivision, e.g. "gbeng" → "gb-eng".
    return `${letters.slice(0, 2)}-${letters.slice(2)}`;
  }
  return null;
}

const PICTOGRAPHIC = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

/** Every emoji grapheme in a piece of text (in order, with duplicates). Keycaps/digits are ignored. */
export function extractEmoji(text: string): string[] {
  const out: string[] = [];
  const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
  for (const { segment } of seg.segment(text)) if (PICTOGRAPHIC.test(segment)) out.push(segment);
  return out;
}
