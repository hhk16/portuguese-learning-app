/** Na Mesma Onda spectra (adjective opposites) and the intensifier clues along them. Pure data. */
import { ALL_ITEMS } from "../../curriculum/index.ts";
import type { ItemOf } from "../../curriculum/schema.ts";

export interface Clue {
  pt: string;
  en: string;
  pic?: string;
  /** Where an intensifier clue sits on the dial (nouns have no fixed spot). */
  at?: number;
}

/** The seven intensifier clues along a spectrum ("muito frio" … "muito quente"). */
export function intensifiers(left: ItemOf<"adjective">, right: ItemOf<"adjective">): Clue[] {
  return [
    { pt: `muito ${left.m}`, en: `very ${left.en}`, pic: left.emoji, at: 7 },
    { pt: left.m, en: left.en, pic: left.emoji, at: 20 },
    { pt: `um pouco ${left.m}`, en: `a bit ${left.en}`, pic: left.emoji, at: 35 },
    { pt: `nem ${left.m} nem ${right.m}`, en: `neither ${left.en} nor ${right.en}`, pic: "⚖️", at: 50 },
    { pt: `um pouco ${right.m}`, en: `a bit ${right.en}`, pic: right.emoji, at: 65 },
    { pt: right.m, en: right.en, pic: right.emoji, at: 80 },
    { pt: `muito ${right.m}`, en: `very ${right.en}`, pic: right.emoji, at: 93 },
  ];
}

export interface Spectrum {
  left: ItemOf<"adjective">;
  right: ItemOf<"adjective">;
}

export function spectra(): Spectrum[] {
  const adj = ALL_ITEMS.filter((i): i is ItemOf<"adjective"> => i.kind === "adjective");
  const out: Spectrum[] = [];
  for (const a of adj) {
    const b = adj.find((x) => x.id === a.opposite);
    if (b && a.id < b.id && !out.some((s) => s.left === b)) out.push({ left: a, right: b });
  }
  return out;
}

/** Every intensifier phrase the TV can say (for the audio pipeline). */
export function waveSpoken(): string[] {
  return spectra().flatMap((s) => intensifiers(s.left, s.right).map((c) => c.pt));
}

