/**
 * Batata Quente — head-to-head hot potato for two (Pass the Bomb / Catch Phrase, A1 edition).
 *
 * The potato sits on one phone with a quick question: hear a word and tap its picture, name a
 * picture, read a number, find the opposite. Right answer → the potato flies to the other phone.
 * Wrong → a short lock-out and a new question (you keep it). The fuse burns on the TV (its length
 * is random) and the ticking speeds up; whoever holds the potato when it blows loses the round. A fast
 * right answer (under 2.5 s) passes a hotter potato: the fuse loses a second. The safe player isn't
 * idle: "Aquece!" — their phone has its own quick question, and each right answer (three a potato)
 * burns the fuse shorter — careful, it may come back. Wrong answers lock you out for a moment.
 * Five potatoes, the last one counts double. A point for every potato that blows on the other side.
 */
import { ALL_ITEMS, getItem } from "../../curriculum/index.ts";
import { cardOf, type LearnCard } from "../../curriculum/learn.ts";
import type { ItemOf, Lesson } from "../../curriculum/schema.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, Word } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { setHurry } from "../../audio/music.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import type { GameOutcome } from "../../tv/activities.ts";
import { CUE, NAMED, PET, SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";
import { spectra } from "../wave/scale.ts";

export const ROUNDS = 5;
const INTRO_MS = 1800;
const BOOM_MS = 3600;
const LOCK_MS = 1300;
export const HURRIES = 3;
const HURRY_MS = 1200;
/** The safe player's question: a wrong answer locks it this long. */
const STEAL_LOCK_MS = 2000;
/** A right answer this fast burns this much off the fuse ("Rápido! A batata aquece"). */
export const FAST_MS = 2500;
const FAST_BURN_MS = 1000;

/** Difficulty: hidden fuse range (ms) and how many options each question has. */
export const LEVEL_RULES: Record<Level, { fuse: [number, number]; options: number }> = {
  1: { fuse: [22_000, 32_000], options: 3 },
  2: { fuse: [16_000, 26_000], options: 4 },
  3: { fuse: [12_000, 20_000], options: 6 },
};

export type BombKind = "hear" | "see" | "opposite" | "number" | "hearNumber" | "phrase";

/** The questions get harder potato by potato; the last one mixes everything. */
export function kindsFor(round: number): BombKind[] {
  return [["hear"], ["see"], ["number", "hearNumber"], ["opposite"], ["hear", "see", "opposite", "number", "hearNumber"]][Math.max(0, Math.min(4, round))] as BombKind[];
}

/** Night share for a versus game: 40 for turning up, up to 100 for winning every potato. */
export function bombShare(wins: number, possible: number): number {
  return Math.round(40 + 60 * Math.min(1, wins / Math.max(1, possible)));
}

interface Question {
  kind: BombKind;
  /** What counts as right (an option's `pt`). */
  answer: string;
  prompt?: Word;
  options: Word[];
  /** What the TV says (hear / hearNumber). */
  say?: string;
  itemId?: string;
}

export class BatataQuente implements Activity {
  readonly id = "bomb";
  readonly pausable = true;
  rt!: TvRuntime;
  level: Level = 1;
  practice = false;
  round = 0;
  phase: "intro" | "play" | "boom" | "end" = "intro";
  phaseEnd = 0;
  fuseStart = 0;
  fuseEnd = 0;
  holderIndex = 0;
  q: Question | null = null;
  lockedUntil = 0;
  askedAt = 0;
  /** The last fast answer (TV flash "🔥 −1 s"). */
  lastFast: { by: string; at: number } | null = null;
  hurryLeft = HURRIES;
  /** For the TV: the last pass ("whoosh" animation) and the last hurry press. */
  passSeq = 0;
  hurrySeq = 0;
  lastHurry: { by: string; at: number } | null = null;
  /** "Aquece!": the safe player's own question (no audio — the TV speaks for the holder). */
  stealQ: Question | null = null;
  stealPromptId = randomId(6);
  stealLockedUntil = 0;
  /** Who got burned at the last boom. */
  burned: RuntimePlayer | null = null;
  wins = new Map<string, number>();
  right = new Map<string, number>();
  passes = 0;
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private nouns: LearnCard[] = [];
  /** The chosen lessons' verbs and phrases ("nós comemos", "Queria um café"): heard, then tapped. */
  private phrases: LearnCard[] = [];
  private numbers: ItemOf<"number">[] = [];
  private recent: string[] = [];
  private missed = new Map<string, { pt: string; en?: string; pic?: string }>();
  /** Every word asked, for the recap. */
  private asked = new Map<string, { pt: string; en?: string; pic?: string }>();
  private tickAt = 0;
  private hurrySaid = false;
  private extra = false;
  private readonly lessons: Lesson[];
  private readonly onDone: (r: GameOutcome) => void;

  constructor(lessons: Lesson[], onDone: (r: GameOutcome) => void) {
    this.lessons = lessons;
    this.onDone = onDone;
  }

  get rules() {
    return LEVEL_RULES[this.level];
  }
  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }
  get holder(): RuntimePlayer | undefined {
    return this.players[this.holderIndex % 2];
  }
  get other(): RuntimePlayer | undefined {
    return this.players[(this.holderIndex + 1) % 2];
  }
  get inPractice() {
    return this.round < 0;
  }
  get final() {
    return this.round === ROUNDS - 1 || this.extra;
  }
  /** 0 → just lit, 1 → about to blow (for the TV's glow; the real fuse stays hidden). */
  get heat() {
    return Math.max(0, Math.min(1, (gameNow() - this.fuseStart) / Math.max(1, this.fuseEnd - this.fuseStart)));
  }
  get lockedMs() {
    return Math.max(0, this.lockedUntil - gameNow());
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    const fromLessons = new Set(this.lessons.flatMap((l) => l.itemIds));
    const nouns = ALL_ITEMS.filter((i) => i.kind === "noun")
      .map(cardOf)
      .filter((c): c is LearnCard => !!c && !!c.emoji);
    this.nouns = [...rt.rng.shuffle(nouns.filter((c) => fromLessons.has(c.itemId))), ...rt.rng.shuffle(nouns.filter((c) => !fromLessons.has(c.itemId)))];
    this.phrases = this.lessons
      .flatMap((l) => l.itemIds)
      .map((id) => getItem(id))
      .filter((i) => !!i && i.kind !== "noun" && i.kind !== "number")
      .map((i) => cardOf(i!))
      .filter((c): c is LearnCard => !!c && !!c.say && c.pt.length <= 32);
    this.numbers = ALL_ITEMS.filter((i): i is ItemOf<"number"> => i.kind === "number" && i.value >= 1 && i.value <= 20);
    for (const p of this.players) {
      this.wins.set(p.playerId, 0);
      this.right.set(p.playerId, 0);
    }
    this.holderIndex = rt.rng.int(2);
    if (this.practice) this.round = -1;
    this.newRound();
  }

  private newRound() {
    this.phase = "intro";
    this.phaseEnd = gameNow() + INTRO_MS;
    this.hurryLeft = HURRIES;
    this.hurrySaid = false;
    this.burned = null;
    this.q = null;
    play("whoosh");
    if (this.final && !this.inPractice) this.rt.say(this.extra ? SAY.tie : SAY.finalRound);
    else this.rt.say(SAY.hotPotato);
    if (this.holder) this.rt.cue(CUE.answer, this.holder);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private light(now: number) {
    const [a, b] = this.rules.fuse;
    this.phase = "play";
    this.fuseStart = now;
    this.fuseEnd = now + (this.inPractice ? 14_000 : a + this.rt.rng.int(b - a));
    this.tickAt = now;
    setHurry(true);
    this.ask();
    this.newSteal();
  }

  /** A fresh question for the holder. */
  private ask() {
    const kinds = kindsFor(Math.max(0, this.round));
    // With a unit or lesson chosen, its verbs and phrases come up too (heard on the TV, tapped on the phone).
    const phrase = this.phrases.length >= 4 && this.rt.rng.next() < 0.4;
    this.q = this.question(phrase ? "phrase" : this.rt.rng.pick(kinds));
    this.askedAt = gameNow();
    const it = this.q.itemId ? getItem(this.q.itemId) : undefined;
    const card = it ? cardOf(it) : null;
    if (card && this.q.kind !== "hearNumber" && this.q.kind !== "number") this.asked.set(card.itemId, { pt: card.pt, en: card.en, pic: card.emoji });
    this.promptId = randomId(6);
    if (this.q.say) this.rt.speakPt(this.q.say);
    this.rt.refreshViews();
    this.rt.bump();
  }

  /** A fresh "Aquece!" question for the safe player: something to read, not to hear. */
  private newSteal() {
    const kinds = kindsFor(Math.max(0, this.round)).filter((k) => k === "see" || k === "number" || k === "opposite");
    this.stealQ = this.question(this.rt.rng.pick(kinds.length ? kinds : (["see", "number", "opposite"] as BombKind[])));
    this.stealPromptId = randomId(6);
    const o = this.other;
    if (o) this.rt.view(o, this.viewFor(o));
  }

  private question(kind: BombKind): Question {
    const rng = this.rt.rng;
    const n = this.rules.options;
    if (kind === "opposite") {
      const s = rng.pick(spectra());
      const [from, to] = rng.int(2) ? [s.left, s.right] : [s.right, s.left];
      const others = rng.sample(spectra().flatMap((x) => [x.left, x.right]).filter((x) => x.id !== to.id && x.id !== from.id), n - 1);
      return { kind, answer: to.m, prompt: { pt: from.m, en: from.en, pic: from.emoji }, options: rng.shuffle([to, ...others]).map((x) => ({ pt: x.m })), itemId: to.id };
    }
    if (kind === "phrase") {
      const fresh = this.phrases.filter((c) => !this.recent.includes(c.itemId));
      const t = rng.pick(fresh.length ? fresh : this.phrases);
      this.remember(t.itemId);
      const others = rng.sample(this.phrases.filter((c) => c.pt !== t.pt), n - 1);
      return { kind, answer: t.pt, say: t.say, options: rng.shuffle([t, ...others]).map((c) => ({ pt: c.pt })), itemId: t.itemId };
    }
    if (kind === "number" || kind === "hearNumber") {
      const pool = rng.shuffle(this.numbers.filter((x) => !this.recent.includes(x.id)));
      const t = pool[0] ?? rng.pick(this.numbers);
      this.remember(t.id);
      // Look-alikes: neighbours and same-sounding numbers first.
      const near = this.numbers.filter((x) => x.id !== t.id).sort((x, y) => Math.abs(x.value - t.value) - Math.abs(y.value - t.value));
      const others = rng.shuffle(near.slice(0, n + 1)).slice(0, n - 1);
      const opts = rng.shuffle([t, ...others]);
      if (kind === "number") return { kind, answer: t.pt, prompt: { pt: String(t.value), pic: String(t.value) }, options: opts.map((x) => ({ pt: x.pt })), itemId: t.id };
      return { kind, answer: String(t.value), say: t.pt, options: opts.map((x) => ({ pt: String(x.value), pic: String(x.value) })), itemId: t.id };
    }
    const fresh = this.nouns.filter((c) => !this.recent.includes(c.itemId));
    const t = (fresh.length ? fresh : this.nouns)[rng.int(Math.min(12, (fresh.length ? fresh : this.nouns).length))]!;
    this.remember(t.itemId);
    const others = rng.sample(this.nouns.filter((c) => c.itemId !== t.itemId && c.emoji !== t.emoji), n - 1);
    const opts = rng.shuffle([t, ...others]);
    if (kind === "hear") return { kind, answer: t.pt, say: t.say, options: opts.map((c) => ({ pt: c.pt, pic: c.emoji })), itemId: t.itemId };
    return { kind: "see", answer: t.pt, prompt: { pt: "", pic: t.emoji }, options: opts.map((c) => ({ pt: c.pt })), itemId: t.itemId };
  }

  private remember(id: string) {
    this.recent = [...this.recent, id].slice(-16);
  }

  tick(now: number) {
    if (this.phase === "intro" && now >= this.phaseEnd) return this.light(now);
    if (this.phase === "play") {
      // Ticking speeds up as the fuse burns (from ~0.8 s to ~0.18 s between ticks).
      const gap = 800 - 620 * this.heat;
      if (now - this.tickAt >= gap) {
        this.tickAt = now;
        play("tick", 0.35 + 0.4 * this.heat, 1 + this.heat * 0.5);
      }
      if (now >= this.fuseEnd) return this.boom(now);
    }
    if (this.phase === "boom" && now >= this.phaseEnd) {
      if (this.inPractice) {
        this.round = 0;
        return this.newRound();
      }
      this.round++;
      if (this.round < ROUNDS) return this.newRound();
      // Level after five potatoes: one more, worth double (once).
      const [a, b] = this.players.map((p) => this.wins.get(p.playerId) ?? 0);
      if (a === b && !this.extra) {
        this.extra = true;
        return this.newRound();
      }
      return this.finish();
    }
  }

  private boom(now: number) {
    const loser = this.holder;
    const winner = this.other;
    this.phase = "boom";
    this.phaseEnd = now + BOOM_MS;
    this.burned = loser ?? null;
    this.q = null;
    setHurry(false);
    play("boom");
    // The puppy hides its eyes at every bang (and Pipo sometimes says so).
    this.rt.petDo("hide", 3200);
    setTimeout(() => this.rt.activity === this && this.rt.petSay(PET.scared, 0.5), 2600);
    setTimeout(() => this.rt.activity === this && play(this.inPractice ? "reveal" : "crowd-ooh", 0.8), 500);
    this.rt.celebrate();
    if (loser) {
      this.rt.say(NAMED.burned, { name: loser.name, interrupt: true });
      this.rt.emote(loser.playerId, "sad", 3200);
    }
    if (winner) {
      this.rt.emote(winner.playerId, "cheer", 3200);
      if (!this.inPractice) this.wins.set(winner.playerId, (this.wins.get(winner.playerId) ?? 0) + (this.final ? 2 : 1));
    }
    // The one who got burned starts the next potato.
    this.rt.holdPhones(1600);
    this.rt.refreshViews();
    this.rt.bump();
  }

  repeat() {
    if (this.q?.say) this.rt.speakPt(this.q.say);
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode === "skip" && this.inPractice) {
      this.round = 0;
      setHurry(false);
      return this.newRound();
    }
    if (value.mode !== "bomb" || this.phase !== "play") return;
    // "Aquece!": the safe player answers their own question to burn the fuse.
    if (value.steal && p === this.other && this.hurryLeft > 0 && this.stealQ && promptId === this.stealPromptId) {
      if (gameNow() < this.stealLockedUntil) return;
      const sq = this.stealQ;
      const right = value.steal === sq.answer;
      if (sq.itemId) this.rt.evidence(p, sq.itemId, `bomb.${sq.kind}`, right ? "correct" : "wrong");
      if (!right) {
        play("buzzer", 0.4);
        this.stealLockedUntil = gameNow() + STEAL_LOCK_MS;
        setTimeout(() => this.rt.activity === this && this.phase === "play" && this.other === p && this.newSteal(), STEAL_LOCK_MS);
        this.rt.view(p, this.viewFor(p));
        return;
      }
      this.hurryLeft--;
      this.fuseEnd = Math.max(gameNow() + 900, this.fuseEnd - HURRY_MS);
      this.lastHurry = { by: p.playerId, at: gameNow() };
      this.hurrySeq++;
      play("whistle", 0.5, 1.2);
      if (!this.hurrySaid && this.holder) {
        this.hurrySaid = true;
        this.rt.say(NAMED.hurryUp, { name: this.holder.name });
      }
      if (this.hurryLeft > 0) this.newSteal();
      else this.rt.view(p, this.viewFor(p));
      this.rt.bump();
      return;
    }
    if (value.hurry && p === this.other && this.hurryLeft > 0) {
      // "Despacha-te!": the fuse burns a little faster.
      this.hurryLeft--;
      this.fuseEnd = Math.max(gameNow() + 900, this.fuseEnd - HURRY_MS);
      this.lastHurry = { by: p.playerId, at: gameNow() };
      this.hurrySeq++;
      play("whistle", 0.5, 1.2);
      if (!this.hurrySaid && this.holder) {
        this.hurrySaid = true;
        this.rt.say(NAMED.hurryUp, { name: this.holder.name });
      }
      this.rt.view(p, this.viewFor(p));
      this.rt.bump();
      return;
    }
    if (!value.answer || p !== this.holder || promptId !== this.promptId || this.lockedMs > 0 || !this.q) return;
    const q = this.q;
    const ok = value.answer === q.answer;
    if (q.itemId) this.rt.evidence(p, q.itemId, `bomb.${q.kind}`, ok ? "correct" : "wrong");
    if (!ok) {
      play("buzzer", 0.6);
      this.rt.emote(p.playerId, "sad", 900);
      const shown = q.options.find((o) => o.pt === q.answer);
      if (shown && q.kind !== "hearNumber") this.missed.set(q.answer, { pt: q.answer, pic: shown.pic ?? q.prompt?.pic });
      this.lockedUntil = gameNow() + LOCK_MS;
      setTimeout(() => this.rt.activity === this && this.phase === "play" && this.holder === p && this.ask(), LOCK_MS);
      this.rt.view(p, this.viewFor(p));
      this.rt.bump();
      return;
    }
    // Right: the potato flies to the other phone — hotter if you were fast.
    if (!this.inPractice) this.right.set(p.playerId, (this.right.get(p.playerId) ?? 0) + 1);
    if (gameNow() - this.askedAt < FAST_MS) {
      this.fuseEnd = Math.max(gameNow() + 1500, this.fuseEnd - FAST_BURN_MS);
      this.lastFast = { by: p.playerId, at: gameNow() };
      play("sparkle", 0.6, 1.3);
    }
    this.passes++;
    this.passSeq++;
    this.holderIndex++;
    play("whoosh");
    play("correct", 0.5, 1.2);
    navigatorBuzz(this.rt, this.holder);
    this.rt.emote(p.playerId, "cheer", 900);
    this.ask();
    // The one who just got rid of it is the safe player now: their own question to heat it up.
    this.stealLockedUntil = 0;
    this.newSteal();
  }

  private finish() {
    this.phase = "end";
    setHurry(false);
    const ranked = [...this.players].sort((x, y) => (this.wins.get(y.playerId) ?? 0) - (this.wins.get(x.playerId) ?? 0));
    const [a, b] = ranked;
    const wa = a ? (this.wins.get(a.playerId) ?? 0) : 0;
    const wb = b ? (this.wins.get(b.playerId) ?? 0) : 0;
    const tie = !!b && wa === wb;
    play("fanfare");
    this.rt.celebrate();
    if (a && !tie) {
      this.rt.say(NAMED.wins, { name: a.name });
      this.rt.say(SAY.revenge);
    }
    this.rt.bump();
    const possible = ROUNDS + 1 + (this.extra ? 2 : 0);
    const answered = [...this.right.values()].reduce((s, x) => s + x, 0);
    this.onDone({
      score: answered,
      max: 36,
      headline: tie ? `Empate! ${wa}–${wb} pontos` : `${a?.name ?? ""} ganha! ${wa}–${wb} pontos`,
      headlineEn: tie ? "It's a tie!" : `${a?.name ?? ""} wins — a point for every potato that blew up on the other side`,
      sub: `Um ponto por batata (a última vale 2) · ${answered} respostas certas · ${this.passes} passes`,
      subEn: `${answered} right answers between you`,
      // Words you missed first, then the rest of what came up.
      words: [...new Map([...this.missed, ...this.asked].map(([, w]) => [w.pt, w])).values()].slice(0, 12),
      perPlayer: Object.fromEntries(this.players.map((p) => [p.playerId, bombShare(this.wins.get(p.playerId) ?? 0, possible)])),
      highlight: tie || !a ? undefined : { pt: `${a.name} ganhou a Batata Quente ${wa}–${wb}`, en: `${a.name} won Hot Potato`, pic: "🥔" },
    });
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Batata Quente precisa de 2", subtitle: "Chama o teu par! · Needs two players", pic: "🥔" };
    if (this.phase === "end") return { mode: "wait", title: "Fim!", subtitle: "Olha para a TV! · Look at the TV!", pic: "🥔" };
    if (this.phase === "boom")
      return this.burned === p
        ? { mode: "wait", title: "💥 Bum! Queimaste-te!", subtitle: "You got burned! Começas tu a próxima.", pic: "💥" }
        : { mode: "wait", title: "Safaste-te! 😅", subtitle: "You're safe — this potato is yours!", pic: "🥔" };
    const holding = p === this.holder;
    const score = this.players.map((x) => ({ name: x.name, wins: this.wins.get(x.playerId) ?? 0 }));
    const q = this.q;
    const sq = !holding && this.phase === "play" && this.hurryLeft > 0 ? this.stealQ : null;
    return {
      mode: "bomb",
      roundId: this.roundId,
      promptId: holding ? this.promptId : this.stealPromptId,
      steal: sq ? { kind: sq.kind, prompt: sq.prompt, options: sq.options, lockedMs: Math.max(0, this.stealLockedUntil - gameNow()) || undefined } : undefined,
      holding: holding && this.phase === "play",
      holder: this.holder?.name ?? "",
      kind: q?.kind ?? "hear",
      prompt: holding ? q?.prompt : undefined,
      options: holding ? q?.options : undefined,
      pictures: q?.kind === "hear" || q?.kind === "hearNumber" || undefined,
      lockedMs: holding && this.lockedMs > 0 ? this.lockedMs : undefined,
      round: Math.max(0, this.round),
      rounds: ROUNDS,
      double: this.final || undefined,
      hurryLeft: !holding && this.phase === "play" ? this.hurryLeft : undefined,
      score,
      practice: this.inPractice || undefined,
      debugAnswer: this.rt.testMode ? (holding ? { answer: q?.answer } : sq ? { steal: sq.answer } : undefined) : undefined,
    };
  }
}

/** The new holder's phone gets the potato (its view vibrates on arrival). */
function navigatorBuzz(rt: TvRuntime, p: RuntimePlayer | undefined) {
  if (p) rt.conn.fx(p.playerId, "buzz");
}
