/**
 * Aprender — a Duolingo-style lesson, side by side.
 *
 * Both players get the same exercises (fair, and they can talk about them) but play at their own
 * pace on their own phone: no timers. The TV is the shared "stadium": both progress lanes, hearts,
 * streaks, the words being learned, and Blip cheering. Audio is personal: each phone speaks its
 * own exercise (the TV takes over only if a phone has no Portuguese voice).
 *
 * Mistakes come back once at the end of the lesson (as in Duolingo). Hearts never block — a
 * couple's evening shouldn't end because one of you ran out of lives.
 */
import { answerOf, buildSession, exTier, INSTRUCTIONS, isGraded, judge, showEnglishFor, type LearnAnswer, type LearnEx } from "../../curriculum/learn.ts";
import { cardById, type LearnCard } from "../../curriculum/learn.ts";
import type { Lesson } from "../../curriculum/schema.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, LearnExView } from "../../shared/protocol.ts";
import { sfx } from "../../audio/sfx.ts";
import { playMusic } from "../../audio/music.ts";
import { lessonsDone, markLessonDone } from "../../tv/progress.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

export const START_HEARTS = 5;

export interface LearnSummary {
  playerId: string;
  xp: number;
  correct: number;
  graded: number;
  bestStreak: number;
  hearts: number;
  stars: number;
}

interface Session {
  p: RuntimePlayer;
  queue: LearnEx[];
  index: number;
  /** Queue positions whose exercise was already re-queued after a miss. */
  retried: Set<number>;
  result: { ok: boolean; pt: string; en?: string; why?: string; say?: string } | null;
  hearts: number;
  streak: number;
  bestStreak: number;
  xp: number;
  correct: number;
  graded: number;
  promptId: string;
  done: boolean;
  /** Last answer, for the TV lane flash. */
  flash: { ok: boolean; text: string; seq: number } | null;
}

export class LearnActivity implements Activity {
  readonly id = "learn";
  readonly pausable = true;
  readonly music = "aula" as const;
  rt!: TvRuntime;
  readonly lesson: Lesson;
  readonly sessions = new Map<string, Session>();
  /** Words introduced in this lesson (TV word wall). */
  readonly words: LearnCard[] = [];
  private template: LearnEx[] = [];
  private readonly onDone: (s: LearnSummary[]) => void;
  private finished = false;
  private flashSeq = 0;
  private roundId = randomId(6);

  constructor(lesson: Lesson, onDone: (s: LearnSummary[]) => void) {
    this.lesson = lesson;
    this.onDone = onDone;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    playMusic("aula");
    // One exercise list for everyone. "New" = new to the least experienced player present.
    const profiles = rt.activePlayers.map((p) => p.profile);
    const known = (id: string) => {
      const states = profiles.map((pr) => pr.items[id]);
      if (states.some((s) => !s)) return undefined;
      return states.reduce((a, b) => (a!.weakness > b!.weakness ? a : b));
    };
    this.template = buildSession(this.lesson, known, rt.rng);
    for (const ex of this.template) {
      if (ex.kind === "intro") {
        const c = cardById(ex.itemId);
        if (c && !this.words.some((w) => w.itemId === c.itemId)) this.words.push(c);
      }
    }
    for (const p of rt.activePlayers) this.sessionFor(p);
    rt.say({ type: "aulaStart" }, true, 2600);
  }

  private sessionFor(p: RuntimePlayer): Session {
    let s = this.sessions.get(p.playerId);
    if (!s) {
      s = {
        p,
        queue: [...this.template],
        index: 0,
        retried: new Set(),
        result: null,
        hearts: START_HEARTS,
        streak: 0,
        bestStreak: 0,
        xp: 0,
        correct: 0,
        graded: 0,
        promptId: randomId(6),
        done: false,
        flash: null,
      };
      this.sessions.set(p.playerId, s);
    }
    return s;
  }

  get lanes(): Session[] {
    return this.rt.activePlayers.map((p) => this.sessionFor(p));
  }

  tick() {}

  onPlayersChanged() {
    for (const p of this.rt.activePlayers) this.rt.view(p, this.viewFor(p));
  }

  repeat(p?: RuntimePlayer) {
    // Only reached when a phone has no Portuguese voice: the TV reads that player's audio.
    const s = p && this.sessions.get(p.playerId);
    const ex = s?.queue[s.index];
    const text = s?.result?.say ?? (ex && "say" in ex ? ex.say : undefined);
    this.rt.speakPt(text, { slow: true });
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode !== "learn") return;
    const s = this.sessionFor(p);
    if (s.done || promptId !== s.promptId) return;
    const ex = s.queue[s.index];
    if (!ex) return;
    const a = value.answer as LearnAnswer;
    if (s.result || !isGraded(ex)) {
      if (a.t === "next") this.advance(s);
      return;
    }
    if (a.t === "next") return;
    this.grade(s, ex, a);
  }

  private grade(s: Session, ex: LearnEx, a: LearnAnswer) {
    const { ok, perItem } = judge(ex, a);
    const at = Date.now();
    for (const [itemId, good] of Object.entries(perItem)) {
      this.rt.learner.record({ profileId: s.p.profile.profileId, itemId, context: `learn.${ex.kind}`, tier: exTier(ex), outcome: good ? "correct" : "wrong", at });
    }
    const retry = s.retried.has(s.index);
    s.graded++;
    const ans = answerOf(ex);
    if (ok) {
      s.correct++;
      s.streak++;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
      s.xp += retry ? 5 : 10 + (s.streak >= 5 ? 2 : 0);
      sfx.correct();
      if (s.streak === 5 || s.streak === 10) this.rt.say({ type: "streak", name: s.p.name, n: s.streak }, false);
    } else {
      s.streak = 0;
      s.hearts = Math.max(0, s.hearts - 1);
      sfx.wrong();
      // Come back to it once at the end.
      if (!retry) {
        s.queue.push(ex);
        s.retried.add(s.queue.length - 1);
      }
      if (!s.p.missed.some((m) => m.answer === ans.pt)) s.p.missed.push({ itemId: Object.keys(perItem)[0] ?? "", answer: ans.pt, why: ans.en });
    }
    const why = "why" in ex && ex.why ? ex.why : !ok && "itemId" in ex ? cardById(ex.itemId)?.note : undefined;
    s.result = ex.kind === "pairs" && ok ? { ok, pt: "Todos os pares certos!" } : { ok, pt: ans.pt, en: ans.en, why, say: "say" in ex ? ex.say : undefined };
    s.flash = { ok, text: ex.kind === "pairs" ? "pares" : ans.pt, seq: ++this.flashSeq };
    this.rt.conn.fx(s.p.playerId, ok ? "success" : "fail");
    this.rt.addScore(s.p, ok ? 10 : 0, "learn");
    this.rt.view(s.p, this.viewFor(s.p));
    this.rt.bump();
  }

  private advance(s: Session) {
    s.result = null;
    s.index++;
    s.promptId = randomId(6);
    if (s.index >= s.queue.length) {
      s.done = true;
      s.xp += 20 + (s.correct === s.graded ? 20 : 0);
      sfx.fanfare();
      const first = this.lanes.filter((x) => x.done).length === 1 && this.lanes.length > 1;
      this.rt.say(first ? { type: "finishFirst", name: s.p.name } : { type: "lessonDone", name: s.p.name }, true, 3000);
    }
    this.rt.view(s.p, this.viewFor(s.p));
    this.rt.bump();
    if (this.lanes.every((x) => x.done) && !this.finished) {
      this.finished = true;
      setTimeout(() => this.finish(), 1800);
    }
  }

  private finish() {
    const summaries = this.lanes.map((s) => ({
      playerId: s.p.playerId,
      xp: s.xp,
      correct: s.correct,
      graded: s.graded,
      bestStreak: s.bestStreak,
      hearts: s.hearts,
      stars: starsFor(s.correct, s.graded),
    }));
    markLessonDone(this.lesson.id, Math.max(1, ...summaries.map((x) => x.stars)));
    void this.rt.learner.sync().then(() => this.rt.learner.pushSnapshot());
    this.onDone(summaries);
  }

  viewFor(p: RuntimePlayer): ControllerView {
    const s = this.sessionFor(p);
    if (s.done) {
      const waiting = this.lanes.filter((x) => !x.done).map((x) => x.p.name);
      return {
        mode: "wait",
        title: "Lição completa! 🎉",
        subtitle: waiting.length ? `+${s.xp} XP · à espera de ${waiting.join(" e ")}…` : `+${s.xp} XP`,
        emoji: s.correct === s.graded ? "🏆" : "⭐",
      };
    }
    const ex = s.queue[s.index]!;
    const instr = INSTRUCTIONS[ex.kind];
    const beginner = lessonsDone().size < 4;
    const known = "itemId" in ex ? p.profile.items[ex.itemId] : undefined;
    return {
      mode: "learn",
      roundId: this.roundId,
      promptId: s.promptId,
      step: Math.min(s.index, s.queue.length),
      total: s.queue.length,
      hearts: s.hearts,
      streak: s.streak,
      xp: s.xp,
      instr: instr.pt,
      instrEn: beginner ? instr.en : undefined,
      showEn: ex.kind === "intro" || ex.kind === "tip" || showEnglishFor(known),
      ex: toView(ex),
      result: s.result ?? undefined,
      debugAnswer: this.rt.testMode ? debugAnswer(ex) : undefined,
    };
  }
}

export function starsFor(correct: number, graded: number): number {
  const acc = graded ? correct / graded : 1;
  return acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
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
    case "speak":
      return { t: "speak", transcripts: [ex.say], self: null };
    default:
      return { t: "next" };
  }
}
