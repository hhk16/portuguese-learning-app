/**
 * Stop! dictionary: which curriculum words count for which category, and which letters make a
 * fair round. Words the dictionary doesn't know aren't wrong — the partner votes on them.
 */
import { REFERENCE } from "./reference.ts";
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
  en?: string;
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
      if (cat) out.push({ itemId: it.id, category: cat, pt: it.pt, forms: [normStop(it.pt)], pic: it.emoji, en: it.en });
    } else if (it.kind === "profession") {
      out.push({ itemId: it.id, category: "profissao", pt: it.m, forms: [...new Set([it.m, it.f].map(normStop))], pic: it.emoji, en: it.en });
    } else if (it.kind === "nationality") {
      out.push({ itemId: it.id, category: "pais", pt: it.country, forms: [...new Set([it.country, it.ms, it.fs, it.mp, it.fp].map(normStop))], pic: it.flag, en: it.en });
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

/** Edit distance (for "did you mean…?" spelling help). */
export function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length]![b.length]!;
}

/** A dictionary word the typed word is one small slip away from (two for long words). */
/** Every word in the Stop reference lists, normalised (to tell real words from typos). */
const KNOWN_WORDS = new Set(Object.values(REFERENCE).flat().map((w) => normStop(w)));

const STRICT = new Set(["pais", "animal", "profissao", "comida"]);
const REF_SETS = Object.fromEntries(Object.entries(REFERENCE).map(([cat, ws]) => [cat, new Set(ws.map((w) => normStop(w)))])) as Record<string, Set<string>>;

/** A common word of this category (from the reference lists): very likely fine. */
export function inReference(category: string, typed: string): boolean {
  return !!REF_SETS[category]?.has(normStop(typed));
}

/**
 * The category a word really belongs to, when it's a known word of ANOTHER category and not of this
 * one ("bola" as a country → "coisa"). Undefined when it could belong here or we don't know it.
 */
export function otherCategory(category: string, typed: string): string | undefined {
  // Only for the strict categories: anything can be a "coisa", and many things are a "lugar".
  if (!STRICT.has(category)) return undefined;
  const n = normStop(typed);
  if (!n || inReference(category, typed) || DICTIONARY.some((w) => w.category === category && w.forms.includes(n))) return undefined;
  const dict = DICTIONARY.find((w) => w.forms.includes(n));
  if (dict) return dict.category;
  return Object.keys(REF_SETS).find((c) => REF_SETS[c]!.has(n));
}

export function nearMiss(category: string, typed: string): DictWord | undefined {
  const n = normStop(typed);
  if (n.length < 3) return undefined;
  // A real Portuguese word ("mola") is not a misspelling of another one ("mala"): the partner votes.
  if (KNOWN_WORDS.has(n)) return undefined;
  const limit = n.length >= 7 ? 2 : 1;
  let best: { w: DictWord; d: number } | undefined;
  for (const w of DICTIONARY)
    if (w.category === category)
      for (const f of w.forms) {
        const d = editDistance(n, f);
        if (d > 0 && d <= limit && f[0] === n[0] && (!best || d < best.d)) best = { w, d };
      }
  return best?.w;
}
