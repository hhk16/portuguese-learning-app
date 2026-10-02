/**
 * Grande Final — the head-to-head finale of a game night (Noite de jogos).
 *
 * Ten quick questions on the words you met tonight, both phones at once, first right answer wins:
 * - "Vê" (see): the TV shows the picture + English → pick (Fácil) or type (Médio/Difícil) the Portuguese.
 * - "Ouve" (hear): the TV says the word → tap its picture.
 * First correct: 3 points, anyone else correct: 1. The last question counts double. The night's
 * champion gets the crown.
 */
import { ALL_ITEMS } from "../../curriculum/index.ts";
import { cardOf, type LearnCard } from "../../curriculum/learn.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, Word } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { setHurry } from "../../audio/music.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import type { GameOutcome } from "../../tv/activities.ts";
import { CUE, NAMED, SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";
import { guessMatches } from "../draw/draw.ts";
import { DISHES, MENUS, orderBook } from "../kitchen/menu.ts";
import { CATEGORIES, examples, inReference, lookup, startsWith } from "../stop/dictionary.ts";
import { judgeForm, PERSON_LABEL, VERB_PICS, verbTable, type Person } from "../verbs/verbs.ts";
import { spectra } from "../wave/scale.ts";
import { LINKS } from "../sync/links.ts";
import { matchAnswer } from "../../shared/answer-check.ts";

export const QUESTIONS = 10;
const REVEAL_MS = 2600;

export const LEVEL_RULES: Record<Level, { itemMs: number; typeSee: boolean; options: number }> = {
  1: { itemMs: 12_000, typeSee: false, options: 4 },
  2: { itemMs: 10_000, typeSee: true, options: 4 },
  3: { itemMs: 8_000, typeSee: true, options: 6 },
};

export interface FinalWord {
  pt: string;
  en?: string;
  pic?: string;
}

export type FinalKind = "see" | "hear" | "frase" | "stop" | "verbs" | "opposite" | "number" | "link" | "fits";

interface Question {
  kind: FinalKind;
  word: LearnCard;
  options: LearnCard[];
  /** "frase": hear a café order, tap what was ordered ("2 × ☕"). */
  frase?: { text: string; answer: string; options: { id: string; n: number; pic: string }[] };
  /** Remix: which of tonight's games this question comes from. */
  remix?: string;
  /** "stop": a letter and a category — write any word that fits. */
  stop?: { letter: string; cat: string; label: string; pic: string; example: string };
  /** "verbs": a person and an action — write the verb. */
  verb?: { person: Person; verb: string; form: string; itemId: string };
  /** "opposite": write the opposite. */
  opp?: { from: string; fromEn: string; pic?: string; to: string; itemId: string };
  /** "number": a numeral — write it in words. */
  num?: { value: number; pt: string; itemId: string };
  /** "link": two pictures — write one word that links them (any link word that fits both counts). */
  link?: { a: LearnCard; b: LearnCard; answers: string[]; example: string; itemId?: string };
  /** "fits": a link word — tap the picture it fits (the answer is `word`). */
  fits?: { pt: string; en: string; pic?: string };
}

/** The remix: each of tonight's games gives the Final its own kind of question (most of them written). */
export const REMIX: Record<string, { kind: FinalKind; name: string }> = {
  stop: { kind: "stop", name: "Stop!" },
  verbs: { kind: "verbs", name: "Quem faz o quê?" },
  wave: { kind: "opposite", name: "Na Mesma Onda" },
  bomb: { kind: "number", name: "Batata Quente" },
  kitchen: { kind: "frase", name: "Cozinha Caótica" },
  secret: { kind: "fits", name: "Pares Secretos" },
  sync: { kind: "link", name: "Em Sintonia" },
  draw: { kind: "see", name: "Desenha!" },
};

/** The Final's plan for a night: three questions from each game played (in order), then a double "see". */
export function remixPlan(games: readonly string[]): { kind: FinalKind; remix?: string }[] {
  const out: { kind: FinalKind; remix?: string }[] = [];
  for (const g of games.slice(0, 3)) for (let i = 0; i < 3; i++) out.push(REMIX[g] ? { kind: REMIX[g]!.kind, remix: REMIX[g]!.name } : { kind: kindAt(out.length) });
  while (out.length < QUESTIONS - 1) out.push({ kind: kindAt(out.length) });
  out.length = QUESTIONS - 1;
  out.push({ kind: "see" });
  return out;
}

/** The shape of the final: see → hear → whole sentences → one last "see" worth double. */
export function kindAt(i: number): Question["kind"] {
  return i < 4 ? "see" : i < 7 ? "hear" : i < 9 ? "frase" : "see";
}

/** Points for a right answer: 3 for the first, 1 after; doubled on the last question. */
export function finalPoints(first: boolean, last: boolean): number {
  return (first ? 3 : 1) * (last ? 2 : 1);
}

export class GrandeFinal implements Activity {
  readonly id = "final";
  readonly pausable = true;
  rt!: TvRuntime;
  level: Level = 1;
  index = 0;
  phase: "ask" | "reveal" | "end" = "ask";
  phaseEnd = 0;
  questions: Question[] = [];
  points = new Map<string, number>();
  /** This question: who answered (and when, and whether right). */
  answers = new Map<string, { ok: boolean; at: number; text: string }>();
  firstRight: string | null = null;
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private readonly words: FinalWord[];
  private readonly onDone: (r: GameOutcome) => void;
  private hurried = false;
  private spare: LearnCard[] = [];

  constructor(words: FinalWord[], onDone: (r: GameOutcome) => void) {
    this.words = words;
    this.onDone = onDone;
  }

  get rules() {
    return LEVEL_RULES[this.level];
  }
  get players() {
    return this.rt.activePlayers.slice(0, 4);
  }
  get q(): Question | undefined {
    return this.questions[this.index];
  }
  /** The tenth question counts double (tie-break questions don't). */
  get last() {
    return this.index === QUESTIONS - 1;
  }
  get tieBreak() {
    return this.index >= QUESTIONS;
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    // Tonight's words (with pictures) first, topped up from everyday nouns.
    const nouns = ALL_ITEMS.filter((i) => i.kind === "noun")
      .map(cardOf)
      .filter((c): c is LearnCard => !!c && !!c.emoji);
    const norm = (s: string) => s.toLowerCase().replace(/^(o|a|os|as) /, "");
    const tonight = this.words.map((w) => nouns.find((c) => norm(c.pt) === norm(w.pt))).filter((c): c is LearnCard => !!c);
    const pool = [...new Map([...rt.rng.shuffle(tonight), ...rt.rng.shuffle(nouns)].map((c) => [c.itemId, c])).values()];
    const picked = pool.slice(0, QUESTIONS);
    this.spare = nouns;
    // Tonight's games decide the questions (a plain night shape when the Final is played on its own).
    const plan: { kind: FinalKind; remix?: string }[] = rt.night?.games?.length ? remixPlan(rt.night.games) : picked.map((_, i) => ({ kind: kindAt(i) }));
    const verbs = verbTable();
    const opps = rt.rng.shuffle(spectra());
    const cats = rt.rng.shuffle(CATEGORIES.filter((c) => c.id !== "coisa"));
    const numbers = rt.rng.shuffle(ALL_ITEMS.filter((it): it is Extract<typeof it, { kind: "number" }> => it.kind === "number" && it.value >= 11 && it.value <= 100));
    const cardOfSlug = (slug: string) => nouns.find((c) => c.itemId === `vocab.noun.${slug}`);
    const links = rt.rng.shuffle(LINKS.filter((l) => l.members.filter((m) => cardOfSlug(m)).length >= 3));
    // Sentences: single-dish café orders ("Queria dois cafés, por favor.").
    const orders = rt.rng.shuffle(MENUS.flatMap((m) => orderBook(m)).filter((o) => Object.keys(o.items).length === 1));
    this.questions = picked.map((word, i) => {
      const { kind, remix } = plan[i] ?? { kind: kindAt(i) };
      if (kind === "stop") {
        const cat = cats[i % cats.length]!;
        const letters = "ABCDEFGILMPRST".split("").filter((l) => examples(cat.id, l).length >= 2);
        const letter = rt.rng.pick(letters.length ? letters : ["C"]);
        const ex = examples(cat.id, letter)[0];
        return { kind, remix, word, options: [], stop: { letter, cat: cat.id, label: cat.label, pic: cat.pic, example: ex?.pt ?? "" } };
      }
      if (kind === "verbs") {
        const v = rt.rng.pick([...verbs.keys()].filter((x) => !VERB_PICS[x]!.hard));
        const person = rt.rng.pick<Person>(["eu", "tu", "ele", "nos", "eles"]);
        const it = verbs.get(v)!.get(person)!;
        return { kind, remix, word, options: [], verb: { person, verb: v, form: it.form, itemId: it.id } };
      }
      if (kind === "opposite") {
        const s = opps[i % opps.length]!;
        const [from, to] = rt.rng.int(2) ? [s.left, s.right] : [s.right, s.left];
        return { kind, remix, word, options: [], opp: { from: from.m, fromEn: from.en, pic: from.emoji, to: to.m, itemId: to.id } };
      }
      if (kind === "number") {
        const n = numbers[i % numbers.length]!;
        return { kind, remix, word, options: [], num: { value: n.value, pt: n.pt, itemId: n.id } };
      }
      if (kind === "link") {
        const l = links[i % links.length]!;
        const [a, b] = rt.rng.sample(l.members.filter((m) => cardOfSlug(m)), 2).map((m) => cardOfSlug(m)!);
        const slug = (c: LearnCard) => c.itemId.replace("vocab.noun.", "");
        const answers = LINKS.filter((x) => x.members.includes(slug(a!)) && x.members.includes(slug(b!))).map((x) => x.pt);
        return { kind, remix, word: a!, options: [], link: { a: a!, b: b!, answers, example: l.pt, itemId: l.itemId } };
      }
      if (kind === "fits") {
        const l = links[(i + 3) % links.length]!;
        const right = cardOfSlug(rt.rng.pick(l.members.filter((m) => cardOfSlug(m))))!;
        const wrong = rt.rng.sample(
          nouns.filter((c) => !l.members.includes(c.itemId.replace("vocab.noun.", "")) && c.emoji !== right.emoji),
          this.rules.options - 1,
        );
        return { kind, remix, word: right, options: rt.rng.shuffle([right, ...wrong]), fits: { pt: l.pt, en: l.en, pic: l.pic } };
      }
      if (kind === "frase") {
        const o = orders[i]!;
        const [id, n] = Object.entries(o.items)[0]!;
        const dish = DISHES[id]!;
        const other = rt.rng.pick(Object.values(DISHES).filter((d) => d.id !== id));
        const m = n === 1 ? 2 : 1;
        const opts = rt.rng.shuffle([
          { id: `${n}×${id}`, n, pic: dish.pic },
          { id: `${m}×${id}`, n: m, pic: dish.pic },
          { id: `${n}×${other.id}`, n, pic: other.pic },
          { id: `${m}×${other.id}`, n: m, pic: other.pic },
        ]);
        const dishCard = nouns.find((c) => c.itemId === `vocab.noun.${id}`) ?? word;
        return { kind, remix, word: dishCard, options: [], frase: { text: o.text, answer: `${n}×${id}`, options: opts } };
      }
      const others = rt.rng.sample(
        nouns.filter((c) => c.itemId !== word.itemId && c.pt !== word.pt),
        this.rules.options - 1,
      );
      return { kind, remix, word, options: rt.rng.shuffle([word, ...others]) };
    });
    for (const p of this.players) this.points.set(p.playerId, 0);
    this.ask();
  }

  private extraQuestion(): Question {
    const used = new Set(this.questions.map((q) => q.word.itemId));
    const q = this.rt.rng.pick(this.spare.filter((c) => !used.has(c.itemId)).length ? this.spare.filter((c) => !used.has(c.itemId)) : this.spare);
    const others = this.rt.rng.sample(this.spare.filter((c) => c.itemId !== q.itemId), this.rules.options - 1);
    return { kind: "see", word: q, options: this.rt.rng.shuffle([q, ...others]) };
  }

  private ask() {
    this.phase = "ask";
    this.phaseEnd = gameNow() + this.rules.itemMs;
    this.answers.clear();
    this.firstRight = null;
    this.hurried = false;
    this.promptId = randomId(6);
    play("whoosh");
    if (this.last) this.rt.say(SAY.finalRound, { interrupt: true });
    const q = this.q!;
    // Only the listening questions are read out first (a fits question says its word); written ones are silent.
    const sayIt = q.frase?.text ?? q.fits?.pt ?? q.word.say;
    if (q.kind === "hear" || q.kind === "frase" || q.kind === "fits") setTimeout(() => this.rt.activity === this && this.q === q && this.rt.speakPt(sayIt), this.last ? 1800 : 400);
    // Pipo announces each new stage of the final.
    const prev = this.questions[this.index - 1];
    if (q.kind === "hear" && prev?.kind !== "hear") this.rt.say(SAY.listenNow);
    if (q.kind === "frase" && prev?.kind !== "frase") this.rt.say(SAY.sentencesNow);
    // A new game in the remix gets its own banner.
    if (q.remix && q.remix !== prev?.remix) this.rt.cue({ pt: `🔁 Remix: ${q.remix}`, en: "A round from tonight's game" });
    else
      this.rt.cue(
        q.kind === "frase" ? { pt: "Ouve o pedido!", en: "Listen to the order!" } : q.kind === "hear" ? { pt: "Ouve e toca!", en: "Listen and tap!" } : q.kind !== "see" || this.rules.typeSee ? CUE.fill : { pt: "Escolhe!", en: "Pick!" },
      );
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick(now: number) {
    if (this.phase === "ask") {
      if (!this.hurried && this.phaseEnd - now < 4000) {
        this.hurried = true;
        play("clock-tick-fast", 0.5);
      }
      if (now >= this.phaseEnd) this.reveal();
    } else if (this.phase === "reveal" && now >= this.phaseEnd) {
      this.index++;
      if (this.index >= this.questions.length) {
        // Level at the top after the last question: one sudden-death question (at most three).
        const [a, b] = this.ranking();
        if (a && b && this.points.get(a.playerId) === this.points.get(b.playerId) && this.questions.length < QUESTIONS + 3) {
          this.questions.push(this.extraQuestion());
          this.rt.say(SAY.tieBreak, { interrupt: true });
          play("heartbeat");
          return this.ask();
        }
        return this.finish();
      }
      this.ask();
    }
  }

  repeat() {
    const q = this.q;
    if (q && (q.kind === "hear" || q.kind === "frase" || q.kind === "fits")) this.rt.speakPt(q.frase?.text ?? q.fits?.pt ?? q.word.say);
  }

  onPlayersChanged() {
    for (const p of this.players) if (!this.points.has(p.playerId)) this.points.set(p.playerId, 0);
    this.rt.refreshViews();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue, at?: number) {
    if (value.mode !== "final" || this.phase !== "ask" || promptId !== this.promptId || this.answers.has(p.playerId)) return;
    const q = this.q!;
    const ok = answerOk(q, value.answer);
    this.answers.set(p.playerId, { ok, at: at ?? gameNow(), text: value.answer });
    play(ok ? "lock" : "buzzer", ok ? 1 : 0.5);
    this.rt.evidence(p, q.verb?.itemId ?? q.opp?.itemId ?? q.num?.itemId ?? q.link?.itemId ?? q.word.itemId, `final.${q.kind}`, ok ? "correct" : "wrong", q.kind === "see" || q.kind === "hear" || q.kind === "frase" || q.kind === "fits" ? undefined : 2);
    if (ok && !this.firstRight) this.firstRight = p.playerId;
    if (this.players.every((x) => this.answers.has(x.playerId))) return this.reveal();
    this.rt.refreshViews();
    this.rt.bump();
  }

  private reveal() {
    this.rt.holdPhones(1400);
    this.phase = "reveal";
    this.phaseEnd = gameNow() + REVEAL_MS;
    this.promptId = randomId(6);
    const q = this.q!;
    let anyRight = false;
    for (const [id, a] of this.answers) {
      if (!a.ok) continue;
      anyRight = true;
      const pts = finalPoints(id === this.firstRight, this.last);
      this.points.set(id, (this.points.get(id) ?? 0) + pts);
      const p = this.rt.players.get(id);
      if (p) {
        this.rt.addScore(p, pts * 50, "final");
        this.rt.emote(id, "cheer", 1800);
      }
    }
    const first = this.firstRight ? this.rt.players.get(this.firstRight) : undefined;
    play(anyRight ? "correct" : "wrong");
    if (first) {
      this.rt.say(NAMED.wellDone, { name: first.name, interrupt: true });
      this.rt.petDo("cheer", 1800);
    }
    this.rt.speakPt(sayOf(q));
    this.rt.refreshViews();
    this.rt.bump();
  }

  /** Ranking by Grand Final points. */
  ranking(): RuntimePlayer[] {
    return [...this.players].sort((a, b) => (this.points.get(b.playerId) ?? 0) - (this.points.get(a.playerId) ?? 0));
  }

  private finish() {
    this.phase = "end";
    setHurry(false);
    play("cymbal");
    this.rt.bump();
    const total = [...this.points.values()].reduce((a, b) => a + b, 0);
    const max = QUESTIONS * 3 + 3;
    const line = this.ranking()
      .map((p) => `${p.name} ${this.points.get(p.playerId) ?? 0}`)
      .join(" · ");
    setTimeout(
      () =>
        this.onDone({
          score: total,
          max: max * 2,
          headline: `Grande Final: ${line}`,
          headlineEn: `Grand Final: ${line}`,
          words: this.questions.map((q) => ({ pt: q.word.pt, en: q.word.en, pic: q.word.emoji })),
          perPlayer: Object.fromEntries(this.players.map((p) => [p.playerId, Math.round(Math.min(100, ((this.points.get(p.playerId) ?? 0) / max) * 100))])),
        }),
      1600,
    );
  }

  viewFor(p: RuntimePlayer): ControllerView {
    const q = this.q;
    if (this.phase === "end" || !q) return { mode: "wait", title: "Fim da noite!", subtitle: "Olha para a TV! · Look at the TV!", pic: "👑" };
    if (this.phase === "reveal") {
      const a = this.answers.get(p.playerId);
      return {
        mode: "wait",
        title: a?.ok ? (this.firstRight === p.playerId ? "Primeiro! +3" : "Certo! +1") : q.frase ? "Não era isso!" : `Era: ${answerText(q)}`,
        subtitle: q.frase ? `“${q.frase.text}”` : q.stop || q.verb || q.opp || q.num || q.link ? `${a?.ok ? "✓" : "✗"} ${a?.text ?? "—"}` : a?.ok ? `${q.word.pt} · ${q.word.en}` : `It was: ${q.word.en}`,
        pic: q.verb ? VERB_PICS[q.verb.verb]!.pic : q.stop ? q.stop.pic : q.num ? "🔢" : q.link ? "🔗" : (q.opp?.pic ?? q.word.emoji),
      };
    }
    const toWord = (c: LearnCard): Word => ({ pt: c.pt, en: undefined, pic: c.emoji });
    const written = !!(q.stop || q.verb || q.opp || q.num || q.link);
    const typing = written || (q.kind === "see" && this.rules.typeSee);
    return {
      mode: "final",
      roundId: this.roundId,
      promptId: this.promptId,
      kind: q.kind,
      index: this.index,
      total: Math.max(QUESTIONS, this.questions.length),
      double: this.last || undefined,
      msLeft: this.msLeft,
      label: q.remix ? `🔁 ${q.remix} · ${Math.min(this.index + 1, QUESTIONS)}/${QUESTIONS}` : undefined,
      prompt: q.stop
        ? { pt: `${q.stop.letter} · ${q.stop.label}`, en: `a word starting with ${q.stop.letter}`, pic: q.stop.pic }
        : q.verb
          ? { pt: PERSON_LABEL[q.verb.person].pt, en: VERB_PICS[q.verb.verb]!.en, pic: VERB_PICS[q.verb.verb]!.pic }
          : q.opp
            ? { pt: q.opp.from, en: `the opposite of “${q.opp.fromEn}”`, pic: q.opp.pic }
            : q.num
              ? { pt: String(q.num.value), en: "the number in words" }
              : q.link
                ? { pt: `${q.link.a.emoji ?? ""} + ${q.link.b.emoji ?? ""}`, en: "one word for both" }
                : q.fits
                  ? { pt: q.fits.pt, en: this.level === 1 ? q.fits.en : undefined }
                  : q.kind === "see"
                    ? { pt: "", en: q.word.en, pic: q.word.emoji }
                    : undefined,
      // See: Portuguese words to pick (no pictures); hear: pictures to tap (no words); frase: "2 × ☕".
      options: q.frase ? q.frase.options.map((o) => ({ pt: o.id, en: String(o.n), pic: o.pic })) : typing ? undefined : q.options.map((c) => (q.kind === "see" ? { pt: c.pt } : { ...toWord(c), pt: c.pt })),
      pictures: q.kind !== "see" || undefined,
      answered: this.answers.has(p.playerId),
      debugAnswer: this.rt.testMode ? { answer: q.frase?.answer ?? (q.stop ? q.stop.example : q.verb ? q.verb.form : q.opp ? q.opp.to : q.num ? q.num.pt : q.link ? q.link.example : q.word.pt) } : undefined,
    };
  }
}

/** Is this answer right for the question? (Written answers are accent- and article-tolerant.) */
export function answerOk(q: Question, answer: string): boolean {
  if (q.frase) return answer === q.frase.answer;
  if (q.stop) {
    const w = answer.trim();
    return startsWith(w, q.stop.letter) && (!!lookup(q.stop.cat, w) || inReference(q.stop.cat, w));
  }
  if (q.verb) return judgeForm(answer, q.verb.form).ok;
  if (q.opp) return ["correct", "accent-slip", "close"].includes(matchAnswer(answer.toLowerCase(), [q.opp.to]));
  if (q.num) return ["correct", "accent-slip"].includes(matchAnswer(answer.toLowerCase().trim(), [q.num.pt]));
  if (q.link) return ["correct", "accent-slip", "close"].includes(matchAnswer(answer.toLowerCase().trim().replace(/^(o|a|os|as) /, ""), q.link.answers));
  return guessMatches(answer, q.word.pt) !== "no";
}

/** What the TV says at the reveal: the right answer, said right. */
export function sayOf(q: Question): string {
  if (q.frase) return q.frase.text;
  if (q.verb) return `${{ eu: "eu", tu: "tu", ele: "ela", nos: "nós", eles: "eles" }[q.verb.person]} ${q.verb.form}`;
  if (q.opp) return q.opp.to;
  if (q.num) return q.num.pt;
  if (q.link) return q.link.example;
  if (q.stop) return q.stop.example;
  return q.word.say;
}

/** The right answer, for the reveal and the phones. */
export function answerText(q: Question): string {
  if (q.stop) return `${q.stop.example} (…)`;
  if (q.verb) return `${PERSON_LABEL[q.verb.person].pt.split(" / ")[0]} ${q.verb.form}`;
  if (q.opp) return q.opp.to;
  if (q.num) return `${q.num.value} = ${q.num.pt}`;
  if (q.link) return q.link.answers.join(" / ");
  return q.frase?.text ?? q.word.pt;
}
