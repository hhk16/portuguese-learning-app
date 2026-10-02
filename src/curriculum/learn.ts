/**
 * "Aprender": Duolingo-style lessons. Pure functions only (unit-tested), no runtime state.
 *
 * Every knowledge item becomes a *card* (Portuguese + English + picture + what to say aloud).
 * A lesson session introduces a few new cards, then drills them with a ramp of exercises:
 * hear it → read it → write it → match pairs → complete / build sentences → say it.
 * English is always one tap away and shown by default while an item is new (adaptive English).
 */
import { stripAccents } from "../shared/answer-check.ts";
import type { Rng } from "../shared/rng.ts";
import { AULAS } from "./aulas.ts";
import { ALL_ITEMS, getItem } from "./index.ts";
import type { ItemKind, KnowledgeItem, Lesson, Person } from "./schema.ts";

export interface LearnCard {
  itemId: string;
  kind: ItemKind;
  /** Portuguese as displayed. */
  pt: string;
  /** Portuguese as spoken by TTS. */
  say: string;
  en: string;
  /** Picture (emoji / flag / digits). */
  emoji?: string;
  note?: string;
  /** True for single words/short forms (vs whole sentences). */
  short: boolean;
}

const PRON: Record<Person, string> = { eu: "eu", tu: "tu", ele: "ele / ela", nos: "nós", eles: "eles / elas" };
const PRON_SAY: Record<Person, string> = { eu: "eu", tu: "tu", ele: "ela", nos: "nós", eles: "eles" };
const PERSON_EMOJI: Record<Person, string> = { eu: "🙋", tu: "👉", ele: "🧍", nos: "👫", eles: "👥" };
const EN_CONJ: Record<string, [string, string, string, string, string]> = {
  ser: ["I am", "you are", "he / she is", "we are", "they are"],
  ter: ["I have", "you have", "he / she has", "we have", "they have"],
  falar: ["I speak", "you speak", "he / she speaks", "we speak", "they speak"],
  morar: ["I live", "you live", "he / she lives", "we live", "they live"],
  trabalhar: ["I work", "you work", "he / she works", "we work", "they work"],
  estudar: ["I study", "you study", "he / she studies", "we study", "they study"],
  "gostar (de)": ["I like", "you like", "he / she likes", "we like", "they like"],
  "chamar-se": ["my name is", "your name is", "his / her name is", "our names are", "their names are"],
};
const PERSON_INDEX: Record<Person, number> = { eu: 0, tu: 1, ele: 2, nos: 3, eles: 4 };
const PLACE_EN: Record<string, string> = {
  Lisboa: "Lisbon",
  Brasil: "Brazil",
  Japão: "Japan",
  Alemanha: "Germany",
  Suécia: "Sweden",
  "Estados Unidos": "the United States",
  Maldivas: "the Maldives",
  Moçambique: "Mozambique",
};

export function cardOf(item: KnowledgeItem): LearnCard | null {
  const base = { itemId: item.id, kind: item.kind, note: item.why };
  switch (item.kind) {
    case "phrase":
      return { ...base, pt: item.pt, say: item.pt.replace(/…/g, "").replace(" / Obrigada", ""), en: item.en, emoji: item.situation, short: item.pt.length <= 14 };
    case "nationality":
      return {
        ...base,
        pt: item.ms === item.fs ? item.ms : `${item.ms} · ${item.fs}`,
        say: item.ms === item.fs ? item.ms : `${item.ms}, ${item.fs}`,
        en: item.en,
        emoji: item.flag,
        note: item.ms === item.fs ? item.why : `♂ ${item.ms} · ♀ ${item.fs}`,
        short: true,
      };
    case "profession":
      return {
        ...base,
        pt: item.m === item.f ? item.m : `${item.m} · ${item.f}`,
        say: item.m === item.f ? item.m : `${item.m}, ${item.f}`,
        en: item.en,
        emoji: item.emoji,
        note: item.m === item.f ? item.why : `♂ ${item.m} · ♀ ${item.f}`,
        short: true,
      };
    case "conjugation": {
      // Verbs from later units carry their own English ("we ate"); the Unit 1 verbs use the table.
      const en = EN_CONJ[item.verb]?.[PERSON_INDEX[item.person]] ?? item.en;
      if (!en) return null;
      // Commands read as commands ("Bebe!"), not as a present tense with a pronoun.
      if (item.tense === "imperativo") {
        const cmd = `${item.form[0]!.toUpperCase()}${item.form.slice(1)}!`;
        return { ...base, pt: cmd, say: cmd, en, emoji: "👉", short: true };
      }
      return { ...base, pt: `${PRON[item.person]} ${item.form}`, say: `${PRON_SAY[item.person]} ${item.form}`, en, emoji: PERSON_EMOJI[item.person], short: true };
    }
    case "number":
      return { ...base, pt: item.pt, say: item.pt, en: String(item.value), emoji: String(item.value), short: true };
    case "noun":
      return { ...base, pt: `${item.article} ${item.pt}`, say: `${item.article} ${item.pt}`, en: `the ${item.en}`, emoji: item.emoji, short: true };
    case "adjective":
      return {
        ...base,
        pt: item.m === item.f ? item.m : `${item.m} · ${item.f}`,
        say: item.m === item.f ? item.m : `${item.m}, ${item.f}`,
        en: item.en,
        emoji: item.emoji,
        short: true,
      };
    case "origin": {
      const pt = `Sou ${item.form}.`;
      return { ...base, pt, say: pt, en: `I'm from ${PLACE_EN[item.place] ?? item.place}.`, emoji: item.emoji, short: false };
    }
    case "contraction": {
      const who = { o: "♂ (o)", a: "♀ (a)", os: "♂♂ (os)", as: "♀♀ (as)" }[item.article];
      const en = `${item.prep === "de" ? "from the" : "in the"} ${who}`;
      return { ...base, pt: item.form, say: item.form, en, note: `${item.prep} + ${item.article} = ${item.form}`, short: true };
    }
    case "frame": {
      if (!item.en) return null;
      const pt = item.text.replace("___", item.answer).replace(" ?", "?");
      return { ...base, pt, say: pt, en: item.en, short: false };
    }
    case "error": {
      if (!item.en) return null;
      const pt = item.tokens.map((t, i) => (i === item.wrongIndex ? item.fix + (/[.?!]$/.test(t) ? t.slice(-1) : "") : t)).join(" ");
      return { ...base, pt, say: pt, en: item.en, short: false };
    }
    default:
      return null;
  }
}

export function cardById(id: string): LearnCard | null {
  const it = getItem(id);
  return it ? cardOf(it) : null;
}

/** Cards that stand on their own as "words to learn" (vs practice sentences). */
const CORE_KINDS: ItemKind[] = ["phrase", "nationality", "profession", "conjugation", "number", "origin", "contraction", "noun", "adjective"];
export function isCore(c: LearnCard): boolean {
  return CORE_KINDS.includes(c.kind);
}

export function lessonCards(lesson: Lesson): LearnCard[] {
  return lesson.itemIds.map(cardById).filter((c): c is LearnCard => c !== null);
}

/* ------------------------------------------------------------------ */
/* Exercises                                                           */
/* ------------------------------------------------------------------ */

export interface LearnOption {
  id: string;
  label: string;
  emoji?: string;
}

export type LearnEx =
  | { kind: "tip"; title: string; rows: [string, string][]; note?: string; say?: string }
  | { kind: "intro"; itemId: string; pt: string; en: string; emoji?: string; say: string; note?: string }
  /** Hear Portuguese → tap what you heard. */
  | { kind: "listen"; itemId: string; say: string; options: LearnOption[]; correctId: string; answer: string; en: string }
  /** Read Portuguese → tap the meaning. */
  | { kind: "read"; itemId: string; pt: string; emoji?: string; say: string; options: LearnOption[]; correctId: string; answer: string; en: string }
  /** English → tap the Portuguese. */
  | { kind: "write"; itemId: string; en: string; emoji?: string; say: string; options: LearnOption[]; correctId: string; answer: string }
  | { kind: "pairs"; itemIds: string[]; pairs: { id: string; pt: string; en: string }[] }
  | { kind: "gap"; itemId: string; text: string; en: string; say: string; options: LearnOption[]; correctId: string; answer: string; why?: string }
  /** English sentence → build the Portuguese from a word bank. */
  | { kind: "build"; itemId: string; en: string; bank: { id: string; text: string }[]; answer: string[]; say: string; pt: string }
  | { kind: "speak"; itemId: string; pt: string; en: string; emoji?: string; say: string };

export type LearnExKind = LearnEx["kind"];

/** Exercises that score (tip/intro don't). */
export function isGraded(ex: LearnEx): boolean {
  return ex.kind !== "tip" && ex.kind !== "intro";
}

/** Evidence tier per exercise: recognition = 1, recall/production = 2. */
export function exTier(ex: LearnEx): 1 | 2 {
  return ex.kind === "build" || ex.kind === "speak" || ex.kind === "write" ? 2 : 1;
}

export const INSTRUCTIONS: Record<LearnExKind, { pt: string; en: string }> = {
  tip: { pt: "Dica", en: "Tip" },
  intro: { pt: "Palavra nova", en: "New word" },
  listen: { pt: "Ouve e toca", en: "Listen, then tap" },
  read: { pt: "O que quer dizer?", en: "What does it mean?" },
  write: { pt: "Como se diz em português?", en: "How do you say it in Portuguese?" },
  pairs: { pt: "Junta os pares", en: "Match the pairs" },
  gap: { pt: "Completa a frase", en: "Complete the sentence" },
  build: { pt: "Traduz a frase", en: "Translate the sentence" },
  speak: { pt: "Diz em voz alta", en: "Say it out loud" },
};

/** What the learner model knows about an item (subset of ItemState). */
export interface Known {
  seen: number;
  correct: number;
  tier: number;
  weakness: number;
}

/** Adaptive English: shown by default while an item is new or weak. */
export function showEnglishFor(k: Known | undefined): boolean {
  return !k || k.tier <= 1 || k.correct < 3 || k.weakness > 0.5;
}

const sameKindPool = (c: LearnCard, extra: readonly LearnCard[]) => {
  const pool = [...extra, ...ALL_ITEMS.map(cardOf).filter((x): x is LearnCard => x !== null)].filter((x) => x.kind === c.kind && x.itemId !== c.itemId && x.pt !== c.pt && x.en !== c.en);
  const seen = new Set<string>();
  return pool.filter((x) => (seen.has(x.itemId) ? false : (seen.add(x.itemId), true)));
};

function options(rng: Rng, correct: LearnOption, wrong: LearnOption[]): { options: LearnOption[]; correctId: string } {
  const all = rng.shuffle([correct, ...wrong]).map((o, i) => ({ ...o, id: `o${i}` }));
  return { options: all, correctId: all.find((o) => o.label === correct.label)!.id };
}

function distractors(rng: Rng, c: LearnCard, lessonCards: readonly LearnCard[], n: number): LearnCard[] {
  // Prefer the lesson's own cards (the confusable ones), then the rest of the unit.
  // Compared by id and by label (cards are rebuilt per call, so object identity means nothing).
  const unlike = (x: LearnCard) => x.itemId !== c.itemId && x.pt !== c.pt && x.en !== c.en;
  const lessonIds = new Set(lessonCards.map((l) => l.itemId));
  const inLesson = rng.shuffle(sameKindPool(c, lessonCards).filter((x) => unlike(x) && lessonIds.has(x.itemId)));
  const out: LearnCard[] = [];
  const seen = new Set<string>();
  const take = (x: LearnCard) => {
    const keys = [`i:${x.itemId}`, `p:${x.pt}`, `e:${x.en}`];
    if (keys.some((k) => seen.has(k))) return;
    keys.forEach((k) => seen.add(k));
    out.push(x);
  };
  for (const x of inLesson) if (out.length < n) take(x);
  if (out.length < n) for (const x of rng.shuffle(sameKindPool(c, []).filter((x) => unlike(x) && !lessonIds.has(x.itemId)))) if (out.length < n) take(x);
  return out;
}

export function listenEx(rng: Rng, c: LearnCard, lesson: readonly LearnCard[]): LearnEx {
  const o = options(rng, { id: "c", label: c.pt }, distractors(rng, c, lesson, 2).map((d) => ({ id: d.itemId, label: d.pt })));
  return { kind: "listen", itemId: c.itemId, say: c.say, ...o, answer: c.pt, en: c.en };
}

/** Read Portuguese → tap the meaning. Options are English only: a picture next to them would give the answer away. */
export function readEx(rng: Rng, c: LearnCard, lesson: readonly LearnCard[]): LearnEx {
  const o = options(rng, { id: "c", label: c.en }, distractors(rng, c, lesson, 2).map((d) => ({ id: d.itemId, label: d.en })));
  return { kind: "read", itemId: c.itemId, pt: c.pt, say: c.say, ...o, answer: c.en, en: c.en };
}

export function writeEx(rng: Rng, c: LearnCard, lesson: readonly LearnCard[]): LearnEx {
  const o = options(rng, { id: "c", label: c.pt }, distractors(rng, c, lesson, 2).map((d) => ({ id: d.itemId, label: d.pt })));
  return { kind: "write", itemId: c.itemId, en: c.en, emoji: c.emoji, say: c.say, ...o, answer: c.pt };
}

export function pairsEx(rng: Rng, cards: readonly LearnCard[]): LearnEx {
  const uniq = cards.filter((c, i) => cards.findIndex((x) => x.en === c.en || x.pt === c.pt) === i).slice(0, 5);
  return { kind: "pairs", itemIds: uniq.map((c) => c.itemId), pairs: rng.shuffle(uniq).map((c, i) => ({ id: `p${i}`, pt: c.pt, en: c.en })) };
}

export function gapEx(rng: Rng, item: KnowledgeItem): LearnEx | null {
  if (item.kind !== "frame" || !item.en) return null;
  const o = options(rng, { id: "c", label: item.answer }, rng.sample(item.distractors, 2).map((d) => ({ id: d, label: d })));
  const say = item.text.replace("___", item.answer).replace(" ?", "?");
  return { kind: "gap", itemId: item.id, text: item.text, en: item.en, say, ...o, answer: item.answer, why: item.why };
}

const tokenize = (s: string) => s.split(/\s+/).filter(Boolean);

export function buildEx(rng: Rng, c: LearnCard, item: KnowledgeItem): LearnEx | null {
  const words = tokenize(c.pt);
  if (words.length < 2 || words.length > 8) return null;
  const decoys = item.kind === "frame" ? item.distractors.slice(0, 2) : item.kind === "error" ? [item.tokens[item.wrongIndex]!] : [];
  const bankWords = [...words, ...decoys.filter((d) => !words.includes(d))];
  const bank = rng.shuffle(bankWords.map((text, i) => ({ id: `w${i}`, text })));
  return { kind: "build", itemId: c.itemId, en: c.en, bank, answer: words, say: c.say, pt: c.pt };
}

export function speakEx(c: LearnCard): LearnEx {
  return { kind: "speak", itemId: c.itemId, pt: c.pt, en: c.en, emoji: c.emoji, say: c.say };
}

export function introEx(c: LearnCard): LearnEx {
  return { kind: "intro", itemId: c.itemId, pt: c.pt, en: c.en, emoji: c.emoji, say: c.say, note: c.note };
}

/** The lesson's first paradigm table / summary as a "Dica" card. */
export function tipFor(lessonId: string): LearnEx | null {
  const steps = AULAS[lessonId] ?? [];
  const table = steps.find((s) => s.kind === "table");
  if (table && table.kind === "table") return { kind: "tip", title: table.kicker, rows: table.rows, note: table.note, say: table.say };
  const summary = steps.find((s) => s.kind === "summary");
  if (summary && summary.kind === "summary") return { kind: "tip", title: "Resumo", rows: summary.rows, note: summary.note };
  return null;
}

/**
 * One lesson session. `known(itemId)` is the learner's state (undefined = never seen).
 * New items are introduced two or three at a time and drilled right away; practice sentences
 * (frames / fixed errors) follow. If everything is already known, the session is pure review of
 * the weakest items.
 */
export function buildSession(lesson: Lesson, known: (itemId: string) => Known | undefined, rng: Rng, size: "short" | "full" = "full"): LearnEx[] {
  const cards = lessonCards(lesson);
  const core = cards.filter(isCore);
  const sentences = lesson.itemIds.map(getItem).filter((i): i is KnowledgeItem => !!i && (i.kind === "frame" || i.kind === "error"));
  const fresh = core.filter((c) => !known(c.itemId)?.seen);
  const byWeak = [...core].sort((a, b) => (known(b.itemId)?.weakness ?? 1) - (known(a.itemId)?.weakness ?? 1));
  const nNew = size === "short" ? 3 : 5;
  const isReview = fresh.length < 2;
  const focus = (isReview ? byWeak : fresh).slice(0, nNew);
  // Pad with older cards so pairs/distractors have enough material.
  const others = rng.shuffle(core.filter((c) => !focus.includes(c)));
  const pick = <T>(arr: readonly T[]): T | undefined => (arr.length ? rng.pick(arr) : undefined);

  const out: LearnEx[] = [];
  const tip = tipFor(lesson.id);
  if (tip && !isReview) out.push(tip);
  const [a, b, c, d, e] = focus;
  const intro = (x?: LearnCard) => x && !isReview && out.push(introEx(x));
  const drill = (x: LearnCard | undefined, kind: "listen" | "read" | "write") => {
    if (!x) return;
    out.push(kind === "listen" ? listenEx(rng, x, cards) : kind === "read" ? readEx(rng, x, cards) : writeEx(rng, x, cards));
  };
  const sentence = () => {
    const it = sentences.length ? sentences.splice(rng.int(sentences.length), 1)[0] : undefined;
    if (!it) return;
    const card = cardOf(it);
    const ex = it.kind === "frame" && rng.next() < 0.55 ? gapEx(rng, it) : card ? buildEx(rng, card, it) : null;
    if (ex) out.push(ex);
    else if (it.kind === "frame") {
      const g = gapEx(rng, it);
      if (g) out.push(g);
    }
  };

  intro(a);
  intro(b);
  drill(pick([a, b].filter(Boolean) as LearnCard[]), "listen");
  drill(a !== undefined && b !== undefined ? (rng.next() < 0.5 ? a : b) : a, "read");
  intro(c);
  drill(c ?? a, "write");
  if (focus.length + others.length >= 3) out.push(pairsEx(rng, [...focus.slice(0, 3), ...others].slice(0, 4)));
  sentence();
  intro(d);
  intro(e);
  drill(d ?? b, "read");
  drill(e ?? c, "listen");
  sentence();
  const speakable = focus.filter((x) => x.pt.length <= 28 && x.kind !== "contraction");
  const sp = pick(speakable) ?? pick(cards.filter((x) => !x.short && x.pt.length <= 28));
  if (sp) out.push(speakEx(sp));
  if (size === "full") {
    if (focus.length >= 4) out.push(pairsEx(rng, [...focus.slice(2), ...others].slice(0, 5)));
    sentence();
    drill(pick(focus), "write");
    sentence();
  }
  return out.filter((x, i) => i === 0 || JSON.stringify(x) !== JSON.stringify(out[i - 1]));
}

/* ------------------------------------------------------------------ */
/* Judging                                                             */
/* ------------------------------------------------------------------ */

export type LearnAnswer =
  | { t: "choice"; id: string }
  | { t: "build"; words: string[] }
  | { t: "pairs"; missed: string[] }
  | { t: "speak"; transcripts: string[]; self: boolean | null }
  | { t: "judge"; ok: boolean }
  | { t: "next" };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFC")
    .replace(/[.,!?¿¡…]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Result of one graded answer: per-item correctness (pairs grade several items). */
export function judge(ex: LearnEx, a: LearnAnswer): { ok: boolean; perItem: Record<string, boolean> } {
  switch (ex.kind) {
    case "listen":
    case "read":
    case "write":
    case "gap": {
      const ok = a.t === "choice" && a.id === ex.correctId;
      return { ok, perItem: { [ex.itemId]: ok } };
    }
    case "build": {
      const ok = a.t === "build" && norm(a.words.join(" ")) === norm(ex.answer.join(" "));
      return { ok, perItem: { [ex.itemId]: ok } };
    }
    case "pairs": {
      const missed = new Set(a.t === "pairs" ? a.missed : ex.pairs.map((p) => p.id));
      // Pairs are shuffled relative to itemIds: map each item back to its pair by the Portuguese.
      const perItem: Record<string, boolean> = {};
      for (const id of ex.itemIds) {
        const p = ex.pairs.find((x) => x.pt === cardById(id)?.pt);
        perItem[id] = !!p && !missed.has(p.id);
      }
      return { ok: missed.size === 0, perItem };
    }
    case "speak": {
      if (a.t !== "speak") return { ok: false, perItem: { [ex.itemId]: false } };
      // Recognisers are unreliable with accents: compare without them.
      const target = stripAccents(norm(ex.say));
      const heard = a.transcripts.some((t) => stripAccents(norm(t)).includes(target));
      const ok = heard || a.self === true;
      return { ok, perItem: { [ex.itemId]: ok } };
    }
    default:
      return { ok: true, perItem: {} };
  }
}

/** The answer shown after a mistake (and after a correct answer, as confirmation). */
export function answerOf(ex: LearnEx): { pt: string; en?: string } {
  switch (ex.kind) {
    case "listen":
      return { pt: ex.answer, en: ex.en };
    case "read":
      return { pt: ex.pt, en: ex.answer };
    case "write":
      return { pt: ex.answer, en: ex.en };
    case "gap":
      return { pt: ex.say, en: ex.en };
    case "build":
      return { pt: ex.pt, en: ex.en };
    case "speak":
      return { pt: ex.pt, en: ex.en };
    case "pairs":
      return { pt: "Todos os pares" };
    case "intro":
      return { pt: ex.pt, en: ex.en };
    case "tip":
      return { pt: ex.title };
  }
}

/* ------------------------------------------------------------------ */
/* Game pools                                                          */
/* ------------------------------------------------------------------ */

/** Cards for the lesson games (Diz-me!, Apanha!): words first, then sentences. */
export function gameCards(lessons: readonly Lesson[]): LearnCard[] {
  const all = lessons.flatMap(lessonCards);
  const seen = new Set<string>();
  const uniq = all.filter((c) => (seen.has(c.en) || seen.has(c.pt) ? false : (seen.add(c.en), seen.add(c.pt), true)));
  return [...uniq.filter((c) => c.short), ...uniq.filter((c) => !c.short)];
}

/** At least `min` distinct short cards: pad a small lesson with related words from the unit. */
export function padCards(cards: readonly LearnCard[], min: number): LearnCard[] {
  const out = cards.filter((c, i) => cards.findIndex((x) => x.en === c.en) === i);
  if (out.length >= min) return out;
  const all = ALL_ITEMS.map(cardOf).filter((c): c is LearnCard => c !== null && c.short);
  const kinds = new Set(out.map((c) => c.kind));
  for (const c of [...all.filter((c) => kinds.has(c.kind)), ...all]) {
    if (out.length >= min + 2) break;
    if (!out.some((x) => x.en === c.en || x.pt === c.pt)) out.push(c);
  }
  return out;
}
