/**
 * Tier generators: turn atomic knowledge items into playable prompts.
 *
 * Tiers: 1 recognise (choose) · 2 recall (build/produce without options) · 3 transform · 4 spontaneous use.
 * Games ask for a *format*; the same item can surface in many formats and games, which is what lets
 * the learner model require evidence from ≥2 contexts before promoting a tier.
 */
import { Rng } from "../shared/rng.ts";
import { itemsOf } from "./index.ts";
import { PERSON_SHORT, type ItemOf, type KnowledgeItem } from "./schema.ts";

export type Tier = 1 | 2 | 3 | 4;

interface PromptBase {
  /** Items this prompt provides evidence for (primary first). */
  itemIds: string[];
  tier: Tier;
  /** Big text on the TV. */
  headline: string;
  /** Emoji / flag shown with the headline. */
  visual?: string;
  sub?: string;
  /** Text spoken by TTS after the answer (always the correct PT). */
  audio?: string;
  /** Correct answer as displayed in feedback. */
  answerText: string;
  why?: string;
}

export interface ChoicePrompt extends PromptBase {
  format: "choice";
  options: { id: string; label: string }[];
  correctId: string;
}
export interface TilesPrompt extends PromptBase {
  format: "tiles";
  tiles: { id: string; ch: string }[];
  correctSeq: string[];
}
export interface ErrorTapPrompt extends PromptBase {
  format: "errorTap";
  words: { id: string; text: string }[];
  wrongId: string;
}
export interface MergePrompt extends PromptBase {
  format: "merge";
  top: { id: string; label: string }[];
  bottom: { id: string; label: string }[];
  correct: { top: string; bottom: string };
}
export interface StreamPrompt extends PromptBase {
  format: "stream";
  rule: string;
  /** What the targets are, e.g. "uma nacionalidade" (for feedback). */
  category: string;
  words: { text: string; isTarget: boolean; itemId?: string; visual?: string }[];
}
export interface SayPrompt extends PromptBase {
  format: "say";
  target: string;
  contrast?: string;
}

export type Prompt = ChoicePrompt | TilesPrompt | ErrorTapPrompt | MergePrompt | StreamPrompt | SayPrompt;
export type PromptFormat = Prompt["format"];

const GENDER_EMOJI = { ms: "👨", fs: "👩", mp: "👨👨", fp: "👩👩" } as const;

/* ------------------------------------------------------------------ */
/* ESCOLHE — multiple choice (tier 1)                                  */
/* ------------------------------------------------------------------ */

export function choiceFromItem(item: KnowledgeItem, rng: Rng, pool?: readonly KnowledgeItem[]): ChoicePrompt | null {
  switch (item.kind) {
    case "nationality": {
      const slot = rng.pick(["ms", "fs", "fs", "mp", "fp"] as const);
      const correct = item[slot];
      const others = (["ms", "fs", "mp", "fp"] as const).map((k) => item[k]).filter((v) => v !== correct);
      const wrong = rng.sample([...new Set(others)], 2);
      if (wrong.length < 2) {
        // -ense / belga: identical m/f — mix in another country's form of the same slot
        const alt = rng.pick(itemsOf("nationality", pool).filter((n) => n.id !== item.id))[slot];
        wrong.push(alt, item.country);
      }
      return choice(rng, {
        itemIds: [item.id],
        tier: 1,
        headline: `${item.flag} + ${GENDER_EMOJI[slot]}`,
        sub: slot === "ms" ? "Ele é…" : slot === "fs" ? "Ela é…" : slot === "mp" ? "Eles são…" : "Elas são…",
        answerText: correct,
        audio: `${slot === "ms" ? "Ele é" : slot === "fs" ? "Ela é" : slot === "mp" ? "Eles são" : "Elas são"} ${correct}.`,
        why: item.why,
        correct,
        wrong: wrong.slice(0, 2),
      });
    }
    case "profession": {
      const fem = item.m !== item.f ? rng.next() < 0.6 : rng.next() < 0.5;
      const correct = fem ? item.f : item.m;
      const others = itemsOf("profession", pool).filter((p) => p.id !== item.id);
      const wrong = item.m !== item.f ? [fem ? item.m : item.f, fem ? rng.pick(others).f : rng.pick(others).m] : rng.sample(others, 2).map((p) => (fem ? p.f : p.m));
      return choice(rng, {
        itemIds: [item.id],
        tier: 1,
        headline: `${item.emoji} ${fem ? "👩" : "👨"}`,
        sub: fem ? "Ela é…" : "Ele é…",
        answerText: correct,
        audio: `${fem ? "Ela" : "Ele"} é ${correct}.`,
        why: item.why,
        correct,
        wrong,
      });
    }
    case "frame": {
      return choice(rng, {
        itemIds: [item.id, ...(item.targets ?? [])],
        tier: 1,
        headline: item.text,
        sub: item.en,
        answerText: item.answer,
        audio: item.text.replace("___", item.answer),
        why: item.why ?? whyOfTargets(item),
        correct: item.answer,
        wrong: rng.sample(item.distractors, 2),
      });
    }
    case "origin": {
      const options = ["de", "do", "da", "dos", "das"];
      const correct = item.form.split(" ")[0]!;
      return choice(rng, {
        itemIds: [item.id],
        tier: 1,
        headline: `Sou ___ ${item.place}.`,
        visual: item.emoji,
        answerText: item.form,
        audio: `Sou ${item.form}.`,
        why: item.why,
        correct,
        wrong: rng.sample(options.filter((o) => o !== correct), 2),
      });
    }
    case "conjugation": {
      const siblings = itemsOf("conjugation", pool).filter((c) => c.verb === item.verb && c.form !== item.form);
      return choice(rng, {
        itemIds: [item.id],
        tier: 1,
        headline: `${PERSON_SHORT[item.person]} · ${item.verb}`,
        answerText: `${PERSON_SHORT[item.person]} ${item.form}`,
        audio: `${PERSON_SHORT[item.person]} ${item.form}`,
        why: item.why,
        correct: item.form,
        wrong: rng.sample(siblings.map((s) => s.form), 2),
      });
    }
    case "number": {
      // Distractors are the numbers learners actually confuse (3/13, 2/12, 6/16, 16/17…).
      const all = itemsOf("number", pool);
      const near = [item.value + 10, item.value - 10, item.value + 1, item.value - 1].filter((v) => v >= 0 && v <= 20 && v !== item.value);
      const wrong = rng.sample(all.filter((n) => near.includes(n.value)), 2).map((n) => n.pt);
      while (wrong.length < 2) wrong.push(rng.pick(all.filter((n) => n.value !== item.value && !wrong.includes(n.pt))).pt);
      return choice(rng, {
        itemIds: [item.id],
        tier: 1,
        headline: String(item.value),
        sub: "Como se diz?",
        answerText: item.pt,
        audio: item.pt,
        why: item.why,
        correct: item.pt,
        wrong,
      });
    }
    case "phrase": {
      const others = itemsOf("phrase", pool).filter((p) => p.id !== item.id && p.fn !== item.fn);
      return choice(rng, {
        itemIds: [item.id],
        tier: 1,
        headline: item.en,
        visual: item.situation,
        answerText: item.pt,
        audio: item.pt,
        correct: item.pt,
        wrong: rng.sample(others, 2).map((o) => o.pt),
      });
    }
    default:
      return null;
  }
}

function choice(
  rng: Rng,
  p: Omit<ChoicePrompt, "format" | "options" | "correctId"> & { correct: string; wrong: string[] },
): ChoicePrompt {
  const labels = [p.correct, ...p.wrong.filter((w) => w !== p.correct)].slice(0, 3);
  const options = rng.shuffle(labels).map((label, i) => ({ id: `o${i}`, label }));
  const { correct: _c, wrong: _w, ...rest } = p;
  return { ...rest, format: "choice", options, correctId: options.find((o) => o.label === p.correct)!.id };
}

function whyOfTargets(f: ItemOf<"frame">): string | undefined {
  return f.targets?.length ? undefined : undefined;
}

/* ------------------------------------------------------------------ */
/* COMPLETA — build the missing word from letter tiles (tier 2 recall) */
/* ------------------------------------------------------------------ */

const DECOY_LETTERS = ["a", "e", "o", "s", "m", "r", "ê", "é", "ã", "i", "u"];
const ACCENT_TWIN: Record<string, string> = { ê: "e", é: "e", e: "é", ã: "a", a: "ã", á: "a", ó: "o", o: "ó", í: "i" };

export function tilesFromItem(item: KnowledgeItem, rng: Rng): TilesPrompt | null {
  let answer: string;
  let headline: string;
  let audio: string;
  let ids = [item.id];
  if (item.kind === "frame" && item.answer.length <= 8 && !item.answer.includes(" ")) {
    answer = item.answer;
    headline = item.text;
    audio = item.text.replace("___", item.answer);
    ids = [item.id, ...(item.targets ?? [])];
  } else if (item.kind === "conjugation" && item.form.length <= 8 && !item.form.includes("-")) {
    answer = item.form;
    headline = `${PERSON_SHORT[item.person]} · ${item.verb}`;
    audio = `${PERSON_SHORT[item.person]} ${item.form}`;
  } else return null;

  const letters = [...answer];
  // Decoys: an accent twin of one letter (tem/têm!), plus random letters.
  const decoys: string[] = [];
  const accented = letters.find((l) => ACCENT_TWIN[l]);
  if (accented) decoys.push(ACCENT_TWIN[accented]!);
  while (decoys.length < 2) decoys.push(rng.pick(DECOY_LETTERS));
  const all = [...letters.map((ch, i) => ({ id: `t${i}`, ch })), ...decoys.map((ch, i) => ({ id: `d${i}`, ch }))];
  return {
    format: "tiles",
    itemIds: ids,
    tier: 2,
    headline,
    answerText: answer,
    audio,
    why: item.why,
    tiles: rng.shuffle(all),
    correctSeq: letters.map((_, i) => `t${i}`),
  };
}

/** Tiles are interchangeable when they carry the same letter; judge by the spelled string. */
export function spellTiles(p: TilesPrompt, seq: readonly string[]): string {
  return seq.map((id) => p.tiles.find((t) => t.id === id)?.ch ?? "").join("");
}

/* ------------------------------------------------------------------ */
/* CORRIGE — tap the wrong word (tier 1: recognise the error)          */
/* ------------------------------------------------------------------ */

export function errorTapFromItem(item: KnowledgeItem): ErrorTapPrompt | null {
  if (item.kind !== "error") return null;
  const words = item.tokens.map((text, i) => ({ id: `w${i}`, text }));
  const fixed = item.tokens.map((t, i) => (i === item.wrongIndex ? item.fix + (/[.?!]$/.test(t) ? t.slice(-1) : "") : t)).join(" ");
  return {
    format: "errorTap",
    itemIds: [item.id],
    tier: 1,
    headline: item.tokens.join(" "),
    answerText: fixed,
    audio: fixed,
    why: item.why,
    words,
    wrongId: `w${item.wrongIndex}`,
  };
}

/* ------------------------------------------------------------------ */
/* ARRASTA — drag preposition onto article (tier 2: build the form)    */
/* ------------------------------------------------------------------ */

const CONTRACTION_OF: Record<string, { prep: string; art: string }> = {
  do: { prep: "de", art: "o" },
  da: { prep: "de", art: "a" },
  dos: { prep: "de", art: "os" },
  das: { prep: "de", art: "as" },
  no: { prep: "em", art: "o" },
  na: { prep: "em", art: "a" },
  nos: { prep: "em", art: "os" },
  nas: { prep: "em", art: "as" },
  de: { prep: "de", art: "none" },
  em: { prep: "em", art: "none" },
};

export function mergeFromItem(item: KnowledgeItem): MergePrompt | null {
  if (item.kind !== "frame") return null;
  const c = CONTRACTION_OF[item.answer];
  if (!c) return null;
  return {
    format: "merge",
    itemIds: [item.id, ...(item.targets ?? [])],
    tier: 2,
    headline: item.text,
    answerText: item.answer,
    audio: item.text.replace("___", item.answer),
    why: c.art === "none" ? "Sem artigo (ex.: cidades): fica só a preposição." : `${c.prep} + ${c.art} = ${item.answer}`,
    top: [
      { id: "de", label: "de" },
      { id: "em", label: "em" },
    ],
    bottom: [
      { id: "o", label: "o" },
      { id: "a", label: "a" },
      { id: "os", label: "os" },
      { id: "as", label: "as" },
      { id: "none", label: "∅" },
    ],
    correct: { top: c.prep, bottom: c.art },
  };
}

export function mergeForm(top: string, bottom: string): string {
  if (bottom === "none") return top;
  const table: Record<string, string> = { "de+o": "do", "de+a": "da", "de+os": "dos", "de+as": "das", "em+o": "no", "em+a": "na", "em+os": "nos", "em+as": "nas" };
  return table[`${top}+${bottom}`] ?? `${top} ${bottom}`;
}

/* ------------------------------------------------------------------ */
/* NÃO TOQUES — tap only on the target category (tier 1)               */
/* ------------------------------------------------------------------ */

export type StreamVariant = "nationality" | "profession" | "ter";

export function streamPrompt(rng: Rng, pool: readonly KnowledgeItem[], length = 7, only?: StreamVariant): StreamPrompt {
  const nats = itemsOf("nationality", pool);
  const profs = itemsOf("profession", pool);
  const variant = only ?? rng.pick(["nationality", "profession", "ter"] as const);
  const words: StreamPrompt["words"] = [];
  const targetsWanted = 2 + rng.int(2);
  let rule: string;
  let category: string;
  const push = (text: string, isTarget: boolean, itemId?: string, visual?: string) => words.push({ text, isTarget, itemId, visual });
  if (variant === "nationality") {
    rule = "Toca só nas NACIONALIDADES!";
    category = "uma nacionalidade";
    for (const n of rng.sample(nats, targetsWanted)) push(rng.pick([n.ms, n.fs]), true, n.id);
    for (const p of rng.sample(profs, length - targetsWanted)) push(rng.pick([p.m, p.f]), false, p.id, p.emoji);
    // Trap: country names look like nationalities.
    if (words.length > 3) words[words.length - 1] = { text: rng.pick(nats).country, isTarget: false };
  } else if (variant === "profession") {
    rule = "Toca só nas PROFISSÕES!";
    category = "uma profissão";
    for (const p of rng.sample(profs, targetsWanted)) push(rng.pick([p.m, p.f]), true, p.id, p.emoji);
    for (const n of rng.sample(nats, length - targetsWanted)) push(rng.pick([n.ms, n.fs]), false, n.id);
  } else {
    rule = "Toca só no verbo TER!";
    category = "o verbo ter";
    const ter = itemsOf("conjugation", pool).filter((c) => c.verb === "ter");
    const ser = itemsOf("conjugation", pool).filter((c) => c.verb === "ser" || c.verb === "falar");
    for (const c of rng.sample(ter, targetsWanted)) push(c.form, true, c.id);
    for (const c of rng.sample(ser, length - targetsWanted)) push(c.form, false, c.id);
  }
  const shuffled = rng.shuffle(words);
  const targets = shuffled.filter((w) => w.isTarget);
  return {
    format: "stream",
    itemIds: shuffled.flatMap((w) => (w.itemId ? [w.itemId] : [])),
    tier: 1,
    headline: rule,
    answerText: targets.map((t) => t.text).join(", "),
    rule,
    category,
    words: shuffled,
  };
}

/* ------------------------------------------------------------------ */
/* DIZ — say it (tier 2 production). Partner can always judge.         */
/* ------------------------------------------------------------------ */

export function sayFromItem(item: KnowledgeItem): SayPrompt | null {
  if (item.kind === "minimalPair") {
    return {
      format: "say",
      itemIds: [item.id],
      tier: 2,
      headline: item.target,
      sub: `(não é "${item.contrast}")`,
      answerText: item.target,
      audio: item.target,
      why: item.hint,
      target: item.target,
      contrast: item.contrast,
    };
  }
  if (item.kind === "number" && item.value <= 20) {
    return { format: "say", itemIds: [item.id], tier: 2, headline: String(item.value), sub: "Diz o número!", answerText: item.pt, audio: item.pt, why: item.why, target: item.pt };
  }
  if (item.kind === "phrase" && item.pt.length <= 20 && !item.pt.includes("…")) {
    return { format: "say", itemIds: [item.id], tier: 2, headline: item.en, visual: item.situation, answerText: item.pt, audio: item.pt, target: item.pt.replace(/[!.?]/g, "").split(" / ")[0]! };
  }
  return null;
}

/** Which item kinds each format can consume (used by the selector). */
export const FORMAT_KINDS: Record<PromptFormat, readonly KnowledgeItem["kind"][]> = {
  choice: ["nationality", "profession", "frame", "origin", "conjugation", "phrase", "number"],
  tiles: ["frame", "conjugation"],
  errorTap: ["error"],
  merge: ["frame"],
  stream: ["nationality", "profession", "conjugation"],
  say: ["minimalPair", "number", "phrase"],
};

export function generate(format: PromptFormat, item: KnowledgeItem, rng: Rng, pool?: readonly KnowledgeItem[]): Prompt | null {
  switch (format) {
    case "choice":
      return choiceFromItem(item, rng, pool);
    case "tiles":
      return tilesFromItem(item, rng);
    case "errorTap":
      return errorTapFromItem(item);
    case "merge":
      return mergeFromItem(item);
    case "say":
      return sayFromItem(item);
    case "stream":
      return streamPrompt(rng, pool ?? [item]);
  }
}
