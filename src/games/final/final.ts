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

interface Question {
  kind: "see" | "hear";
  word: LearnCard;
  options: LearnCard[];
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
    this.questions = picked.map((word, i) => {
      const others = rt.rng.sample(
        nouns.filter((c) => c.itemId !== word.itemId && c.pt !== word.pt),
        this.rules.options - 1,
      );
      return { kind: i % 2 === 0 ? "see" : "hear", word, options: rt.rng.shuffle([word, ...others]) };
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
    if (q.kind === "hear") setTimeout(() => this.rt.activity === this && this.q === q && this.rt.speakPt(q.word.say), this.last ? 1800 : 400);
    this.rt.cue(q.kind === "hear" ? { pt: "Ouve e toca!", en: "Listen and tap!" } : this.rules.typeSee ? CUE.fill : { pt: "Escolhe!", en: "Pick!" });
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
        if (a && b && a.score === b.score && this.questions.length < QUESTIONS + 3) {
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
    if (q) this.rt.speakPt(q.word.say);
  }

  onPlayersChanged() {
    for (const p of this.players) if (!this.points.has(p.playerId)) this.points.set(p.playerId, 0);
    this.rt.refreshViews();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue, at?: number) {
    if (value.mode !== "final" || this.phase !== "ask" || promptId !== this.promptId || this.answers.has(p.playerId)) return;
    const q = this.q!;
    const ok = guessMatches(value.answer, q.word.pt) !== "no";
    this.answers.set(p.playerId, { ok, at: at ?? gameNow(), text: value.answer });
    play(ok ? "lock" : "buzzer", ok ? 1 : 0.5);
    this.rt.evidence(p, q.word.itemId, `final.${q.kind}`, ok ? "correct" : "wrong");
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
    if (first) this.rt.say(NAMED.wellDone, { name: first.name, interrupt: true });
    this.rt.speakPt(q.word.say);
    this.rt.refreshViews();
    this.rt.bump();
  }

  /** Ranking by tonight's points (session score). */
  ranking(): RuntimePlayer[] {
    return [...this.players].sort((a, b) => b.score - a.score);
  }

  private finish() {
    this.phase = "end";
    setHurry(false);
    const [top, second] = this.ranking();
    const tie = !!second && top!.score === second.score;
    play("fanfare");
    setTimeout(() => this.rt.activity === this && play("crowd-cheer"), 1200);
    this.rt.celebrate();
    if (top && !tie) this.rt.say(NAMED.mvp, { name: top.name, interrupt: true });
    this.rt.bump();
    const total = [...this.points.values()].reduce((a, b) => a + b, 0);
    setTimeout(
      () =>
        this.onDone({
          score: total,
          max: QUESTIONS * 3 + 3,
          headline: tie ? `Empate! ${top!.score}–${second!.score}` : `👑 ${top?.name ?? ""} é a estrela da noite!`,
          headlineEn: tie ? "A tie — you're both champions!" : `${top?.name ?? ""} is tonight's champion!`,
          sub: `Final: ${this.players.map((p) => `${p.name} ${this.points.get(p.playerId) ?? 0}`).join(" · ")}`,
          subEn: "Grand Final points",
          words: this.questions.map((q) => ({ pt: q.word.pt, en: q.word.en, pic: q.word.emoji })),
        }),
      2800,
    );
  }

  viewFor(p: RuntimePlayer): ControllerView {
    const q = this.q;
    if (this.phase === "end" || !q) return { mode: "wait", title: "Fim da noite!", subtitle: "Olha para a TV! · Look at the TV!", pic: "👑" };
    if (this.phase === "reveal") {
      const a = this.answers.get(p.playerId);
      return {
        mode: "wait",
        title: a?.ok ? (this.firstRight === p.playerId ? "Primeiro! +3" : "Certo! +1") : `Era: ${q.word.pt}`,
        subtitle: a?.ok ? `${q.word.pt} · ${q.word.en}` : `It was: ${q.word.en}`,
        pic: q.word.emoji,
      };
    }
    const toWord = (c: LearnCard): Word => ({ pt: c.pt, en: undefined, pic: c.emoji });
    const typing = q.kind === "see" && this.rules.typeSee;
    return {
      mode: "final",
      roundId: this.roundId,
      promptId: this.promptId,
      kind: q.kind,
      index: this.index,
      total: Math.max(QUESTIONS, this.questions.length),
      double: this.last || undefined,
      msLeft: this.msLeft,
      prompt: q.kind === "see" ? { pt: "", en: q.word.en, pic: q.word.emoji } : undefined,
      // See: Portuguese words to pick (no pictures); hear: pictures to tap (no words).
      options: typing ? undefined : q.options.map((c) => (q.kind === "see" ? { pt: c.pt } : { ...toWord(c), pt: c.pt })),
      pictures: q.kind === "hear" || undefined,
      answered: this.answers.has(p.playerId),
      debugAnswer: this.rt.testMode ? { answer: q.word.pt } : undefined,
    };
  }
}
