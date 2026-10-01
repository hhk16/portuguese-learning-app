/**
 * Aprender juntos — a Duolingo-style lesson played in sync.
 *
 * The TV shows each exercise and says it once (one voice for the room). Everyone answers
 * privately on their phone; when all have answered, the answers are revealed together on the TV
 * (faces on the options they picked). A team star for every exercise you all get right.
 * Speaking is social: one says the phrase out loud, the partner judges on their phone.
 * No timers, no lives: mistakes come back once at the end.
 */
import { answerOf, buildSession, cardById, exTier, INSTRUCTIONS, isGraded, judge, showEnglishFor, type LearnAnswer, type LearnCard, type LearnEx } from "../../curriculum/learn.ts";
import type { Lesson } from "../../curriculum/schema.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, LearnExView } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { lessonsDone, markLessonDone } from "../../tv/progress.ts";
import { gameNow } from "../../tv/clock.ts";
import { CUE, PET, SAY } from "../../tv/host-lines.ts";
import { matchAnswer } from "../../shared/answer-check.ts";

/** The lesson ends on a lightning round: the TV says the lesson's words, tap them — how many in 40 s? */
export const RUSH_MS = 45_000;
const RUSH_WORD_MS = 6_000;
/** The lightning round is the lesson's boss: this many words together, before the hearts or the time run out. */
export const RUSH_GOAL = 5;
export const RUSH_HEARTS = 3;
/** The clincher (the last star) is written, not tapped: hear it, type it — more time for that one. */
const RUSH_TYPE_MS = 13_000;
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

export interface LearnSummary {
  stars: number;
  graded: number;
  perPlayer: { playerId: string; correct: number; graded: number }[];
  words: LearnCard[];
  bestCombo: number;
  /** Lightning round (the boss): words you both got, and whether you beat it. */
  rush?: { team: number; asked: number; goal: number; won: boolean };
  /** Only the lightning round was played (a retry). */
  rushOnly?: boolean;
}

interface Rush {
  endAt: number;
  wordEnd: number;
  card: LearnCard;
  options: LearnCard[];
  pictures: boolean;
  answers: Map<string, boolean>;
  team: number;
  asked: number;
  combo: number;
  hearts: number;
  /** Whether the current word was already settled (both answered). */
  settled: boolean;
  /** Last word's result, for the TV flash (and the word that was said). */
  last: { ok: boolean; seq: number; pt?: string } | null;
  recent: string[];
  /** This word is typed (the clincher). After one typed miss, the clincher goes back to tapping. */
  typed: boolean;
  typedMissed: boolean;
  /** What each player typed (shown on the TV when the word settles). */
  typedBy: Map<string, string>;
}

interface Answer {
  a: LearnAnswer;
  ok: boolean;
  perItem: Record<string, boolean>;
}

export class LearnActivity implements Activity {
  readonly id = "learn";
  readonly pausable = true;
  rt!: TvRuntime;
  readonly lesson: Lesson;
  queue: LearnEx[] = [];
  index = 0;
  phase: "answer" | "reveal" = "answer";
  answers = new Map<string, Answer>();
  acks = new Set<string>();
  /** Speaking: who says it (the partner judges). */
  speakerId: string | null = null;
  stars = 0;
  graded = 0;
  /** Exercises in a row that you both got right. */
  combo = 0;
  bestCombo = 0;
  readonly words: LearnCard[] = [];
  readonly perPlayer = new Map<string, { correct: number; graded: number }>();
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private retried = new Set<number>();
  private speakTurn = 0;
  private readonly onDone: (s: LearnSummary) => void;
  private finished = false;
  /** The lightning round at the end (null before/without it). */
  rush: Rush | null = null;
  /** The boss's outcome, shown full-stage for a moment before the results. */
  rushResult: "won" | "lost" | null = null;

  /** Retry: straight to the lightning round with the lesson's words. */
  readonly rushOnly: boolean;

  constructor(lesson: Lesson, onDone: (s: LearnSummary) => void, opts: { rushOnly?: boolean } = {}) {
    this.lesson = lesson;
    this.onDone = onDone;
    this.rushOnly = !!opts.rushOnly;
  }

  get ex(): LearnEx | undefined {
    return this.queue[this.index];
  }

  get players() {
    return this.rt.activePlayers;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    // One exercise list for everyone. "New" = new to the least experienced player present.
    const profiles = rt.activePlayers.map((p) => p.profile);
    const known = (id: string) => {
      const states = profiles.map((pr) => pr.items[id]);
      if (!states.length || states.some((s) => !s)) return undefined;
      return states.reduce((a, b) => (a!.weakness > b!.weakness ? a : b));
    };
    this.queue = buildSession(this.lesson, known, rt.rng, rt.activePlayers.length > 1 ? "full" : "full");
    for (const ex of this.queue) {
      if (ex.kind === "intro") {
        const c = cardById(ex.itemId);
        if (c && !this.words.some((w) => w.itemId === c.itemId)) this.words.push(c);
      }
    }
    if (this.rushOnly) {
      // The retry knows every word of the lesson, not just today's new ones.
      for (const id of this.lesson.itemIds) {
        const c = cardById(id);
        if (c && !this.words.some((w) => w.itemId === c.itemId)) this.words.push(c);
      }
      this.queue = [];
      return this.startRush();
    }
    this.enter();
  }

  /** Begin the current exercise. */
  private enter() {
    this.phase = "answer";
    this.answers.clear();
    this.acks.clear();
    this.promptId = randomId(6);
    const ex = this.ex;
    this.speakerId = null;
    if (ex?.kind === "speak") {
      const ps = this.players;
      this.speakerId = ps[this.speakTurn++ % Math.max(1, ps.length)]?.playerId ?? null;
    }
    play(ex?.kind === "intro" ? "star" : "whoosh");
    setTimeout(() => this.repeat(), 350);
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick(now: number) {
    const r = this.rush;
    if (!r || this.finished) return;
    if (now >= r.endAt) return this.finish();
    if (now >= r.wordEnd) {
      // Nobody (or only one of you) answered in time: that costs a heart — and a beat to see the word.
      if (r.wordEnd && !r.settled) {
        this.rushMiss();
        if (r.hearts > 0) r.wordEnd = now + (r.typed ? 2800 : 1300);
        return;
      }
      if (!this.finished) this.nextRushWord();
    }
  }

  /** Lightning round: needs at least four lesson words. */
  private startRush() {
    const pool = this.rushPool();
    if (pool.length < 4 || !this.players.length) return this.finish();
    this.rush = { endAt: gameNow() + RUSH_MS + 1500, wordEnd: 0, card: pool[0]!, options: [], pictures: false, answers: new Map(), team: 0, asked: 0, combo: 0, hearts: RUSH_HEARTS, settled: false, last: null, recent: [], typed: false, typedMissed: false, typedBy: new Map() };
    this.rt.say([SAY.lightning, SAY.lightningGoal]);
    this.rt.cue(CUE.listenTap);
    play("whistle");
    setTimeout(() => this.rt.activity === this && !this.finished && this.nextRushWord(), 1500);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private rushPool(): LearnCard[] {
    return this.words.filter((w) => w.say && w.pt.length <= 28);
  }

  private nextRushWord() {
    const r = this.rush;
    if (!r) return;
    const pool = this.rushPool();
    // One star to go: write it (a short word you can spell from hearing it).
    r.typed = r.team === RUSH_GOAL - 1 && !r.typedMissed;
    const short = pool.filter((c) => c.pt.replace(/^(o|a|os|as) /, "").replace(/[?!.,¿¡]/g, "").length <= 12);
    if (r.typed && short.length < 2) r.typed = false;
    const from = r.typed ? short : pool;
    const fresh = from.filter((c) => !r.recent.includes(c.itemId));
    const card = this.rt.rng.pick(fresh.length ? fresh : from);
    r.recent = [...r.recent, card.itemId].slice(-Math.min(3, pool.length - 1));
    const others = this.rt.rng.sample(pool.filter((c) => c.itemId !== card.itemId && c.pt !== card.pt), 3);
    r.card = card;
    r.options = this.rt.rng.shuffle([card, ...others]);
    // Pictures only for things a picture really shows (nouns, numbers…) — greetings and phrases are words.
    r.pictures = r.options.every((o) => o.emoji && /^vocab\.(noun|number|adjective|colour|color)/.test(o.itemId)) && new Set(r.options.map((o) => o.emoji)).size === r.options.length;
    r.settled = false;
    r.answers = new Map();
    r.typedBy = new Map();
    r.asked++;
    r.wordEnd = gameNow() + (r.typed ? RUSH_TYPE_MS : RUSH_WORD_MS);
    // The written clincher always gets its full time, even at the end of the clock.
    if (r.typed) {
      r.endAt = Math.max(r.endAt, r.wordEnd + 400);
      this.rt.say(SAY.lightningType, { interrupt: true });
      this.rt.cue(CUE.listenType);
    }
    this.promptId = randomId(6);
    if (r.typed) setTimeout(() => this.rt.activity === this && r.card === card && !r.settled && this.rt.speakPt(card.say, { slow: true }), 2200);
    else this.rt.speakPt(card.say);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private rushAnswer(p: RuntimePlayer, answer: string) {
    const r = this.rush!;
    if (r.answers.has(p.playerId)) return;
    // Typed: the article is optional and a slipped accent still counts (the TV shows the spelling).
    const ok = r.typed ? ["correct", "accent-slip", "close"].includes(matchAnswer(answer.toLowerCase(), [r.card.pt, r.card.pt.replace(/^(o|a|os|as) /, "")])) : answer === r.card.pt;
    r.answers.set(p.playerId, ok);
    if (r.typed) r.typedBy.set(p.playerId, answer.trim().slice(0, 24));
    this.rt.evidence(p, r.card.itemId, r.typed ? "learn.rush.typed" : "learn.rush", ok ? "correct" : "wrong", r.typed ? 2 : undefined);
    play(ok ? "pop" : "buzzer", ok ? 0.8 : 0.4, 1 + Math.min(r.combo, 8) * 0.05);
    if (this.players.every((x) => r.answers.has(x.playerId))) {
      const all = [...r.answers.values()].every(Boolean);
      r.settled = true;
      if (all) {
        r.team++;
        r.combo++;
        play("star", 0.8, 1 + Math.min(r.combo, 8) * 0.06);
        if (r.combo === 3) this.rt.petSay(PET.knew, 0.6);
        r.last = { ok: true, seq: (r.last?.seq ?? 0) + 1, pt: r.card.pt };
        // Boss beaten!
        if (r.team >= RUSH_GOAL) {
          this.rt.view(p, this.viewFor(p));
          setTimeout(() => this.rt.activity === this && this.finish(), 900);
          r.wordEnd = gameNow() + 60_000;
          this.rt.bump();
          return;
        }
      } else {
        r.combo = 0;
        this.rushMiss();
        if (this.finished) return;
      }
      // A beat to see it, then the next word.
      r.wordEnd = Math.min(r.wordEnd, gameNow() + (r.typed ? 2800 : 1300));
    }
    this.rt.view(p, this.viewFor(p));
    this.rt.bump();
  }

  /** A word you didn't both get: one heart less. No hearts left → the lightning round is lost. */
  private rushMiss() {
    const r = this.rush;
    if (!r) return;
    r.settled = true;
    r.combo = 0;
    r.hearts--;
    if (r.typed) r.typedMissed = true;
    r.last = { ok: false, seq: (r.last?.seq ?? 0) + 1, pt: r.card.pt };
    // Hear it once more, now that you know which one it was.
    setTimeout(() => this.rt.activity === this && this.rt.speakPt(r.card.say), 350);
    play("buzzer", 0.5);
    for (const p of this.players) this.rt.emote(p.playerId, "sad", 1200);
    if (r.hearts <= 0) {
      r.wordEnd = gameNow() + 60_000;
      setTimeout(() => this.rt.activity === this && this.finish(), 900);
    }
    this.rt.bump();
  }

  repeat() {
    const ex = this.ex;
    if (!ex) return;
    if (this.phase === "reveal") return this.rt.speakPt(answerOf(ex).pt.includes(" = ") ? undefined : "say" in ex ? ex.say : undefined);
    if (ex.kind === "write" || ex.kind === "pairs" || ex.kind === "build") return; // no audio: it would give the answer away
    if (ex.kind === "gap") return this.rt.speakPt(ex.text.replace("___", "…"));
    if ("say" in ex && ex.say) this.rt.speakPt(ex.say, { slow: ex.kind === "listen" });
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  onNav(dir: string) {
    // TV remote "OK" moves on from intros and reveals (handy when one phone is slow).
    if (dir !== "ok") return;
    const ex = this.ex;
    if (!ex) return;
    if (!isGraded(ex) || this.phase === "reveal") this.next();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (this.rush && value.mode === "final" && promptId === this.promptId && !this.finished) return this.rushAnswer(p, value.answer);
    if (value.mode !== "learn" || promptId !== this.promptId || this.finished) return;
    const ex = this.ex;
    if (!ex) return;
    const a = value.answer as LearnAnswer;

    // Intros / tips / reveals: everyone taps "continue".
    if (!isGraded(ex) || this.phase === "reveal") {
      if (a.t !== "next") return;
      this.acks.add(p.playerId);
      play("tap");
      if (this.players.every((x) => this.acks.has(x.playerId))) return this.next();
      this.rt.refreshViews();
      this.rt.bump();
      return;
    }

    if (ex.kind === "speak") {
      // The partner judges the speaker (solo: self-judged).
      const solo = this.players.length < 2;
      const speaker = this.players.find((x) => x.playerId === this.speakerId);
      if (!speaker) return;
      const ok = a.t === "judge" ? a.ok : a.t === "speak" ? judge(ex, a).ok : null;
      if (ok === null) return;
      if (!solo && p === speaker) return;
      this.answers.set(speaker.playerId, { a, ok, perItem: { [ex.itemId]: ok } });
      return this.reveal();
    }

    if (this.answers.has(p.playerId) || a.t === "next" || a.t === "judge") return;
    const { ok, perItem } = judge(ex, a);
    this.answers.set(p.playerId, { a, ok, perItem });
    play("lock");
    if (this.players.every((x) => this.answers.has(x.playerId))) return this.reveal();
    this.rt.refreshViews();
    this.rt.bump();
  }

  private reveal() {
    this.rt.holdPhones(1200);
    const ex = this.ex!;
    this.phase = "reveal";
    const at = Date.now();
    const everyone = [...this.answers.values()];
    const allRight = everyone.length > 0 && everyone.every((x) => x.ok);
    // Everyone playing is graded on every exercise (no answer = not right), so the counts match.
    for (const p of this.players) if (!this.answers.has(p.playerId)) {
      const pp = this.perPlayer.get(p.playerId) ?? { correct: 0, graded: 0 };
      pp.graded++;
      this.perPlayer.set(p.playerId, pp);
    }
    for (const [pid, ans] of this.answers) {
      const p = this.rt.players.get(pid);
      if (!p) continue;
      for (const [itemId, good] of Object.entries(ans.perItem)) {
        this.rt.evidence(p, itemId, `learn.${ex.kind}`, ex.kind === "speak" ? (good ? "judged-correct" : "judged-wrong") : good ? "correct" : "wrong", exTier(ex));
      }
      const pp = this.perPlayer.get(pid) ?? { correct: 0, graded: 0 };
      pp.graded++;
      if (ans.ok) pp.correct++;
      this.perPlayer.set(pid, pp);
      this.rt.emote(pid, ans.ok ? "cheer" : "sad", 2200);
      if (ans.ok) this.rt.addScore(p, 10, "learn");
    }
    this.graded++;
    if (allRight) {
      this.stars++;
      // Team combo: both right again and again — each star a note higher, a cheer from ×3.
      this.combo++;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      play("star", 1, 1 + Math.min(this.combo - 1, 6) * 0.06);
      if (this.combo >= 3) {
        play("crowd-cheer", 0.5);
        this.rt.cue({ pt: `Combo ×${this.combo}!`, en: "Both right again — keep going!" });
      }
      this.rt.celebrate();
    } else {
      if (this.combo >= 3) play("sad-trombone", 0.5);
      this.combo = 0;
      play("wrong");
      // Bring it back once at the end.
      if (!this.retried.has(this.index) && ex.kind !== "speak") {
        // Same exercise, new order, so a retry tests the Portuguese, not the button position.
        const again = { ...ex } as typeof ex;
        if ("options" in again && Array.isArray(again.options)) (again as { options: unknown[] }).options = this.rt.rng.shuffle(again.options);
        if (again.kind === "pairs") again.pairs = this.rt.rng.shuffle(again.pairs);
        this.queue.push(again);
        this.retried.add(this.queue.length - 1);
      }
    }
    setTimeout(() => this.repeat(), 500);
    this.rt.refreshViews();
    this.rt.bump();
    void at;
  }

  private next() {
    if (this.finished) return;
    this.index++;
    if (this.index >= this.queue.length) return this.startRush();
    this.enter();
  }

  private finish() {
    if (this.finished) return;
    this.finished = true;
    const r = this.rush;
    const won = !r || r.team >= RUSH_GOAL;
    if (won) {
      play("success-jingle");
      this.rt.celebrate();
      if (r) {
        this.rt.say(SAY.lightningWon, { interrupt: true });
        this.rt.petStar("cheer", 2600, PET.knew, 0.6, "center");
      }
    } else {
      play("fail-jingle");
      this.rt.say((r?.team ?? 0) >= 3 ? SAY.lightningLost : SAY.lightningLostFar, { interrupt: true });
      this.rt.petStar("oops", 2600, undefined, 0, "center");
    }
    const stars = this.graded ? this.stars / this.graded : 1;
    // The lesson only counts as done once its lightning round is beaten.
    if (won) markLessonDone(this.lesson.id, this.rushOnly ? 2 : stars >= 0.85 ? 3 : stars >= 0.6 ? 2 : 1);
    void this.rt.learner.sync().then(() => this.rt.learner.pushSnapshot());
    const summary: LearnSummary = {
      stars: this.stars,
      graded: this.graded,
      perPlayer: [...this.perPlayer].map(([playerId, v]) => ({ playerId, ...v })),
      words: this.words,
      bestCombo: this.bestCombo,
      rush: r ? { team: r.team, asked: r.asked, goal: RUSH_GOAL, won } : undefined,
      rushOnly: this.rushOnly || undefined,
    };
    if (!r) return this.onDone(summary);
    // The boss's outcome gets its own full-stage beat on the TV before the results.
    this.rushResult = won ? "won" : "lost";
    for (const p of this.players) this.rt.emote(p.playerId, won ? "cheer" : "sad", 3000);
    this.rt.refreshViews();
    this.rt.bump();
    setTimeout(() => this.rt.activity === this && this.onDone(summary), 3200);
  }

  /* --------------------------------- views --------------------------------- */

  /** Names of players we're still waiting for (answer phase or "continue"). */
  waitingFor(): string[] {
    const ex = this.ex;
    if (!ex) return [];
    if (!isGraded(ex) || this.phase === "reveal") return this.players.filter((x) => !this.acks.has(x.playerId)).map((x) => x.name);
    if (ex.kind === "speak") return [];
    return this.players.filter((x) => !this.answers.has(x.playerId)).map((x) => x.name);
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.rushResult)
      return this.rushResult === "won"
        ? { mode: "wait", title: "⚡ Relâmpago superado!", subtitle: "Lição completa! · Lesson complete — olha para a TV!", pic: "🏆" }
        : { mode: "wait", title: "⚡ Relâmpago perdido!", subtitle: (this.rush?.team ?? 0) >= 3 ? "Quase! Tentem outra vez · So close — try again!" : "Hoje não deu — tentem outra vez · Not today — try again!", pic: "💔" };
    const r = this.rush;
    if (r && !this.finished) {
      if (!r.wordEnd) return { mode: "wait", title: "⚡ Desafio relâmpago!", subtitle: "Lightning round: listen to the TV, tap fast — together!", pic: "⚡" };
      return {
        mode: "final",
        roundId: this.roundId,
        promptId: this.promptId,
        label: `${r.typed ? "✍️ A última! Escreve" : "⚡"} ${r.team}/${RUSH_GOAL} ⭐ · ${"❤️".repeat(Math.max(0, r.hearts))}`,
        kind: "hear",
        index: r.asked - 1,
        total: Math.max(r.asked, 1),
        msLeft: Math.max(0, r.endAt - gameNow()),
        options: r.typed ? undefined : r.options.map((c) => (r.pictures ? { pt: c.pt, pic: c.emoji } : { pt: c.pt })),
        pictures: (!r.typed && r.pictures) || undefined,
        answered: r.answers.has(p.playerId),
        debugAnswer: this.rt.testMode ? { answer: r.card.pt } : undefined,
      };
    }
    const ex = this.ex;
    if (!ex) return { mode: "wait", title: "Lição completa!", pic: "🎉" };
    const instr = INSTRUCTIONS[ex.kind];
    const beginner = lessonsDone().size < 4;
    const known = "itemId" in ex ? p.profile.items[ex.itemId] : undefined;
    const base = {
      mode: "learn" as const,
      roundId: this.roundId,
      promptId: this.promptId,
      step: this.index,
      total: this.queue.length,
      instr: instr.pt,
      instrEn: beginner ? instr.en : undefined,
      showEn: ex.kind === "intro" || ex.kind === "tip" || showEnglishFor(known),
    };
    const others = this.players.filter((x) => x !== p).map((x) => x.name);

    // Speaking turn: speaker speaks, partner judges.
    if (ex.kind === "speak" && this.phase === "answer") {
      const speaker = this.players.find((x) => x.playerId === this.speakerId);
      const solo = this.players.length < 2;
      if (!solo && speaker && speaker !== p) {
        return { ...base, instr: `${speaker.name} disse bem?`, instrEn: beginner ? `Did ${speaker.name} say it right?` : undefined, ex: { kind: "judge", name: speaker.name, pt: ex.pt, en: ex.en, emoji: ex.emoji }, debugAnswer: this.rt.testMode ? { t: "judge", ok: true } : undefined };
      }
      return {
        ...base,
        ex: toView(ex),
        waiting: solo ? undefined : `${others.join(" e ")} vai dizer se ficou bem`,
        debugAnswer: this.rt.testMode ? { t: "speak", transcripts: [ex.say], self: true } : undefined,
      };
    }

    if (this.phase === "reveal" || !isGraded(ex)) {
      const mine = this.answers.get(p.playerId) ?? (ex.kind === "speak" ? this.answers.get(this.speakerId ?? "") : undefined);
      const ans = answerOf(ex);
      const acked = this.acks.has(p.playerId);
      return {
        ...base,
        ex: toView(ex),
        result: isGraded(ex) ? { ok: mine?.ok ?? false, pt: ans.pt, en: ans.en, why: !mine?.ok && "itemId" in ex ? (("why" in ex && ex.why) || cardById(ex.itemId)?.note) : undefined } : undefined,
        waiting: acked ? `À espera de ${this.waitingFor().join(" e ")}…` : undefined,
        debugAnswer: this.rt.testMode ? { t: "next" } : undefined,
      };
    }

    const answered = this.answers.has(p.playerId);
    return {
      ...base,
      ex: toView(ex),
      waiting: answered ? `À espera de ${this.waitingFor().join(" e ")}…` : undefined,
      debugAnswer: this.rt.testMode ? debugAnswer(ex) : undefined,
    };
  }

  /** For the TV: what each player picked (choice exercises). */
  pickedBy(optionId: string): RuntimePlayer[] {
    return this.players.filter((p) => {
      const a = this.answers.get(p.playerId)?.a;
      return a?.t === "choice" && a.id === optionId;
    });
  }

  answerOf(p: RuntimePlayer): Answer | undefined {
    return this.answers.get(p.playerId);
  }
}

/** Strip the answer out: the phone only gets what it needs to render. */
function toView(ex: LearnEx): LearnExView {
  switch (ex.kind) {
    case "tip":
      return { kind: "tip", title: ex.title, rows: ex.rows, note: ex.note, say: ex.say };
    case "intro":
      return { kind: "intro", pt: ex.pt, en: ex.en, emoji: ex.emoji, say: ex.say, note: ex.note };
    case "listen":
      return { kind: "listen", say: ex.say, options: ex.options };
    case "read":
      return { kind: "read", pt: ex.pt, emoji: ex.emoji, say: ex.say, options: ex.options };
    case "write":
      return { kind: "write", en: ex.en, emoji: ex.emoji, options: ex.options };
    case "pairs":
      return { kind: "pairs", pairs: ex.pairs };
    case "gap":
      return { kind: "gap", text: ex.text, en: ex.en, options: ex.options };
    case "build":
      return { kind: "build", en: ex.en, bank: ex.bank };
    case "speak":
      return { kind: "speak", pt: ex.pt, en: ex.en, emoji: ex.emoji, say: ex.say };
  }
}

function debugAnswer(ex: LearnEx): LearnAnswer {
  switch (ex.kind) {
    case "listen":
    case "read":
    case "write":
    case "gap":
      return { t: "choice", id: ex.correctId };
    case "build":
      return { t: "build", words: ex.answer };
    case "pairs":
      return { t: "pairs", missed: [] };
    default:
      return { t: "next" };
  }
}
