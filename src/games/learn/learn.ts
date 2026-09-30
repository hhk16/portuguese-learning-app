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
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

export interface LearnSummary {
  stars: number;
  graded: number;
  perPlayer: { playerId: string; correct: number; graded: number }[];
  words: LearnCard[];
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
  readonly words: LearnCard[] = [];
  readonly perPlayer = new Map<string, { correct: number; graded: number }>();
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private retried = new Set<number>();
  private speakTurn = 0;
  private readonly onDone: (s: LearnSummary) => void;
  private finished = false;

  constructor(lesson: Lesson, onDone: (s: LearnSummary) => void) {
    this.lesson = lesson;
    this.onDone = onDone;
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

  tick() {}

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
      play("star");
      this.rt.celebrate();
    } else {
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
    if (this.index >= this.queue.length) return this.finish();
    this.enter();
  }

  private finish() {
    this.finished = true;
    play("success-jingle");
    this.rt.celebrate();
    const stars = this.graded ? this.stars / this.graded : 1;
    markLessonDone(this.lesson.id, stars >= 0.85 ? 3 : stars >= 0.6 ? 2 : 1);
    void this.rt.learner.sync().then(() => this.rt.learner.pushSnapshot());
    this.onDone({
      stars: this.stars,
      graded: this.graded,
      perPlayer: [...this.perPlayer].map(([playerId, v]) => ({ playerId, ...v })),
      words: this.words,
    });
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
