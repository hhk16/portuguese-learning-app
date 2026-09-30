/**
 * Stop! dictionary: which curriculum words count for which category, and which letters make a
 * fair round. Words the dictionary doesn't know aren't wrong — the partner votes on them.
 */
import { ALL_ITEMS } from "../../curriculum/index.ts";
import { stripAccents } from "../../shared/answer-check.ts";

export interface StopCategory {
  id: string;
  label: string;
  pic: string;
}

export const CATEGORIES: StopCategory[] = [
  { id: "comida", label: "Comida ou bebida", pic: "🍽️" },
  { id: "animal", label: "Animal", pic: "🐶" },
  { id: "coisa", label: "Coisa", pic: "🔑" },
  { id: "profissao", label: "Profissão", pic: "🧑‍🍳" },
  { id: "pais", label: "País ou nacionalidade", pic: "🌍" },
  { id: "lugar", label: "Lugar ou natureza", pic: "🌳" },
];

export interface DictWord {
  itemId: string;
  category: string;
  /** Display form (first form). */
  pt: string;
  /** Every accepted form, normalised. */
  forms: string[];
  pic?: string;
}

/** Lower-case, no accents, no article, letters and spaces only. */
export function normStop(s: string): string {
  return stripAccents(
    s
      .trim()
      .toLowerCase()
      .normalize("NFC")
      .replace(/^(o|a|os|as|um|uma)\s+/, "")
      .replace(/[^\p{L} -]/gu, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

const NOUN_CAT: Record<string, string> = {
  comida: "comida",
  bebida: "comida",
  animal: "animal",
  casa: "coisa",
  objeto: "coisa",
  roupa: "coisa",
  transporte: "coisa",
  lugar: "lugar",
  natureza: "lugar",
};

function build(): DictWord[] {
  const out: DictWord[] = [];
  for (const it of ALL_ITEMS) {
    if (it.kind === "noun") {
      const cat = NOUN_CAT[it.category];
      if (cat) out.push({ itemId: it.id, category: cat, pt: it.pt, forms: [normStop(it.pt)], pic: it.emoji });
    } else if (it.kind === "profession") {
      out.push({ itemId: it.id, category: "profissao", pt: it.m, forms: [...new Set([it.m, it.f].map(normStop))], pic: it.emoji });
    } else if (it.kind === "nationality") {
      out.push({ itemId: it.id, category: "pais", pt: it.country, forms: [...new Set([it.country, it.ms, it.fs, it.mp, it.fp].map(normStop))], pic: it.flag });
    }
  }
  return out;
}

export const DICTIONARY: DictWord[] = build();

/** The dictionary entry a typed word matches in a category (accent- and article-insensitive). */
export function lookup(category: string, typed: string): DictWord | undefined {
  const n = normStop(typed);
  if (!n) return undefined;
  return DICTIONARY.find((w) => w.category === category && w.forms.includes(n));
}

/** Known words for a category that start with a letter (for "you could have written…"). */
export function examples(category: string, letter: string): DictWord[] {
  const l = normStop(letter);
  return DICTIONARY.filter((w) => w.category === category && w.forms.some((f) => f.startsWith(l)));
}

export function startsWith(typed: string, letter: string): boolean {
  return normStop(typed).startsWith(normStop(letter));
}

/**
 * Letters that make a fair round: for each candidate, how many categories have at least one
 * known word. Returns letters with ≥ `min` coverable categories, best first.
 */
export function fairLetters(categories: readonly string[], min = 3): string[] {
  const letters = "abcdefghijlmnoprstuv".split("");
  return letters
    .map((l) => ({ l, n: categories.filter((c) => examples(c, l).length > 0).length }))
    .filter((x) => x.n >= min)
    .sort((a, b) => b.n - a.n)
    .map((x) => x.l.toUpperCase());
}

export function stopSpoken(): string[] {
  return "ABCDEFGHIJLMNOPRSTUV".split("").map((l) => `Letra ${l}!`);
}
