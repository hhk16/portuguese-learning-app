/**
 * Turbo Race — one lap. Answers are not points: they are physical actions on the karts.
 *
 *  correct in < 1.7 s  → TURBO        (big boost + flames)
 *  correct             → boost
 *  3 correct in a row  → COMBO BOOST
 *  wrong               → SPIN-OUT     (unless shielded)
 *  item round (once)   → 🛡️ shield · 🚀 nitro · 🎨 ink (splats the partner's phone buttons)
 *
 * Nonsense-word test: it is a reflex race with sabotage and decisions (which item, when to
 * gamble on speed) — fun on its own. The Portuguese is what you must retrieve to act.
 *
 * Catch-up (fairness rule): a trailing kart gets a *visible* "vento de cauda" that makes boosts a
 * bit stronger. Answers are never marked differently and both players always get the same question.
 */
import { gameNow } from "../../tv/clock.ts";
import { ALL_ITEMS } from "../../curriculum/index.ts";
import { choiceFromItem, type ChoicePrompt } from "../../curriculum/generators.ts";
import { selectItem } from "../../learner/selector.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, NavDir } from "../../shared/protocol.ts";
import { sfx } from "../../audio/sfx.ts";
import { playMusic } from "../../audio/music.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

export const BASE_SPEED = 1 / 58; // laps per second
export const TURBO_MS = 1700;
const QUESTION_MS = 5200;
const REVEAL_MS = 1300;
const GAP_MS = 900;
const ITEMS_MS = 5000;
const COUNTDOWN_MS = 3600;
const FINISH_GRACE_MS = 12000;

export type RaceItem = "shield" | "nitro" | "ink";
export const ITEM_INFO: Record<RaceItem, { label: string; emoji: string; desc: string }> = {
  shield: { label: "Escudo", emoji: "🛡️", desc: "Bloqueia o próximo pião" },
  nitro: { label: "Nitro", emoji: "🚀", desc: "Turbo imediato!" },
  ink: { label: "Tinta", emoji: "🎨", desc: "Suja o telemóvel do outro" },
};

export interface Kart {
  playerId: string;
  u: number;
  /** Visual speed (laps/s) for camera and effects. */
  speed: number;
  boostUntil: number;
  boostPower: number;
  boostKind: "boost" | "turbo" | "combo" | "nitro" | null;
  spinUntil: number;
  spinStart: number;
  shield: boolean;
  combo: number;
  finishedAt: number | null;
  ink: number;
  tailwind: boolean;
  /** Latest floating label ("TURBO!") for the TV. */
  label: { text: string; at: number; tone: "good" | "bad" | "item" } | null;
  lane: number;
}

export type RacePhase = "countdown" | "question" | "reveal" | "gap" | "items" | "finish" | "done";

export interface RaceQuestion {
  roundId: string;
  promptId: string;
  prompt: ChoicePrompt;
  startAt: number;
  endAt: number;
  answers: Map<string, { choice: string; at: number; correct: boolean }>;
}

export interface RaceResult {
  order: { playerId: string; time: number | null; u: number }[];
}

export class TurboRace implements Activity {
  readonly id = "race";
  readonly pausable = true;
  readonly music = "race" as const;
  rt!: TvRuntime;
  phase: RacePhase = "countdown";
  phaseStart = 0;
  phaseEnd = 0;
  raceStart = 0;
  karts = new Map<string, Kart>();
  question: RaceQuestion | null = null;
  itemsDone = false;
  itemPicks = new Map<string, RaceItem>();
  firstFinishAt: number | null = null;
  leaderId: string | null = null;
  photoFinish = false;
  private used: string[] = [];
  private qCount = 0;
  private readonly onDone: (r: RaceResult) => void;
  private readonly lessonIds: Set<string>;

  constructor(onDone: (r: RaceResult) => void, lessonItemIds: readonly string[] = []) {
    this.onDone = onDone;
    this.lessonIds = new Set(lessonItemIds);
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    playMusic("race");
    const now = gameNow();
    rt.activePlayers.forEach((p, i) => this.karts.set(p.playerId, newKart(p.playerId, i)));
    this.setPhase("countdown", now, COUNTDOWN_MS);
    rt.say({ type: "raceStart" }, true, 2600);
    rt.view("all", { mode: "wait", title: "Prepara-te!", subtitle: "Respostas rápidas = TURBO", emoji: "🏎️" });
    [0, 1, 2].forEach((i) => setTimeout(() => sfx.countdown(false), 600 + i * 1000));
    setTimeout(() => sfx.countdown(true), COUNTDOWN_MS - 50);
  }

  private setPhase(phase: RacePhase, at: number, dur: number) {
    this.phase = phase;
    this.phaseStart = at;
    this.phaseEnd = at + dur;
    this.rt.bump();
  }

  onPlayersChanged() {
    const now = gameNow();
    for (const p of this.rt.activePlayers) if (!this.karts.has(p.playerId)) this.karts.set(p.playerId, { ...newKart(p.playerId, this.karts.size), u: Math.max(0, this.minU() - 0.02), boostUntil: now });
  }

  private minU() {
    return Math.min(...[...this.karts.values()].map((k) => k.u));
  }

  /* --------------------------------- physics --------------------------------- */

  tick(now: number, dt: number) {
    if (this.phase !== "countdown" && this.phase !== "done") {
      const us = [...this.karts.values()].filter((k) => !k.finishedAt).map((k) => k.u);
      const leadU = Math.max(...us, 0);
      for (const k of this.karts.values()) {
        if (k.finishedAt) {
          k.speed *= 0.95;
          k.u += k.speed * dt * 0.3;
          continue;
        }
        k.tailwind = this.karts.size > 1 && leadU - k.u > 0.05;
        let v = BASE_SPEED;
        if (now < k.spinUntil) v *= 0.12;
        else if (now < k.boostUntil) v *= 1 + k.boostPower * (k.tailwind ? 1.25 : 1);
        else k.boostKind = null;
        k.speed += (v - k.speed) * Math.min(1, dt * 6);
        k.u += k.speed * dt;
        if (k.u >= 1 && !k.finishedAt) {
          k.finishedAt = now;
          k.u = 1;
          this.firstFinishAt ??= now;
          const p = this.rt.players.get(k.playerId);
          sfx.fanfare();
          if (p) this.rt.view(p, { mode: "wait", title: this.rank(k.playerId) === 1 ? "1.º LUGAR!" : `${this.rank(k.playerId)}.º lugar`, emoji: "🏁" });
          const done = [...this.karts.values()].filter((x) => x.finishedAt);
          if (done.length === 2 && done[1]!.finishedAt! - done[0]!.finishedAt! < 600) {
            this.photoFinish = true;
            this.rt.say({ type: "photoFinish" }, true);
          }
        }
      }
      // lead changes → MC
      const order = this.order();
      const leader = order[0]?.playerId ?? null;
      if (leader && this.leaderId && leader !== this.leaderId && this.karts.size > 1) {
        const lp = this.rt.players.get(leader);
        const op = this.rt.players.get(this.leaderId);
        if (lp && op) this.rt.say({ type: "leadChange", name: lp.name, other: op.name });
      }
      this.leaderId = leader;
      const allDone = [...this.karts.values()].every((k) => k.finishedAt);
      if ((allDone || (this.firstFinishAt && now - this.firstFinishAt > FINISH_GRACE_MS)) && this.phase !== "finish") {
        this.setPhase("finish", now, this.photoFinish ? 3800 : 2600);
        this.rt.view("all", { mode: "wait", title: "Corrida terminada!", emoji: "🏁" });
      }
    }
    if (now < this.phaseEnd) return;
    switch (this.phase) {
      case "countdown":
        this.raceStart = now;
        for (const k of this.karts.values()) boost(k, now, 0.6, 900, "boost"); // launch
        return this.ask(now);
      case "question":
        return this.closeQuestion(now);
      case "reveal":
        this.setPhase("gap", now, GAP_MS);
        this.rt.view("all", (p) => ({ mode: "wait", title: this.hud(p), emoji: "🏎️" }));
        return;
      case "gap":
        if (!this.itemsDone && Math.max(...[...this.karts.values()].map((k) => k.u)) > 0.42) return this.offerItems(now);
        return this.ask(now);
      case "items":
        return this.closeItems(now);
      case "finish":
        this.phase = "done";
        this.phaseEnd = Infinity;
        this.onDone({ order: this.order().map((k) => ({ playerId: k.playerId, time: k.finishedAt ? k.finishedAt - this.raceStart : null, u: k.u })) });
        return;
    }
  }

  order(): Kart[] {
    return [...this.karts.values()].sort((a, b) => {
      if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
      if (a.finishedAt) return -1;
      if (b.finishedAt) return 1;
      return b.u - a.u;
    });
  }

  rank(playerId: string): number {
    return this.order().findIndex((k) => k.playerId === playerId) + 1;
  }

  private hud(p: RuntimePlayer): string {
    const k = this.karts.get(p.playerId);
    if (!k) return "";
    return `${this.rank(p.playerId)}.º lugar · ${Math.round(Math.min(1, k.u) * 100)}%`;
  }

  /* -------------------------------- questions -------------------------------- */

  private ask(now: number) {
    if (this.firstFinishAt) {
      // After the first finisher, no more questions: the rest coast home.
      this.setPhase("gap", now, 1000);
      return;
    }
    const pool = ALL_ITEMS.filter((i) => ["origin", "frame", "nationality", "profession", "conjugation", "phrase", "number"].includes(i.kind) && !(i.kind === "conjugation" && i.form.includes("-")));
    let prompt: ChoicePrompt | null = null;
    for (let t = 0; t < 6 && !prompt; t++) {
      const sel = selectItem(
        { candidates: pool, lessonItemIds: this.lessonIds, profiles: this.rt.activePlayers.map((p) => p.profile), recent: this.used, lessonShare: 0.6 },
        this.rt.rng,
      );
      if (!sel) break;
      prompt = choiceFromItem(sel.item, this.rt.rng, ALL_ITEMS);
      if (prompt) this.used.push(sel.item.id);
    }
    if (!prompt) return;
    this.qCount++;
    const qms = QUESTION_MS * this.rt.pace;
    this.question = { roundId: randomId(6), promptId: randomId(6), prompt, startAt: now, endAt: now + qms, answers: new Map() };
    this.setPhase("question", now, qms);
    sfx.blip();
    for (const p of this.rt.activePlayers) this.rt.conn.sendView(p.playerId, this.questionView(p));
  }

  private questionView(p: RuntimePlayer): ControllerView {
    const q = this.question!;
    const k = this.karts.get(p.playerId);
    const a = q.answers.get(p.playerId);
    if (a) return { mode: "wait", title: a.correct ? "Certo! 🔥" : "Pião! 💫", subtitle: q.prompt.answerText, emoji: a.correct ? "🏎️" : "🌀", feedback: { status: a.correct ? "correct" : "wrong", text: q.prompt.answerText, detail: q.prompt.why } };
    return {
      mode: "choices",
      roundId: q.roundId,
      promptId: q.promptId,
      deadline: q.endAt,
      title: "TURBO!",
      card: { visual: q.prompt.visual, headline: q.prompt.headline, sub: q.prompt.sub },
      options: q.prompt.options,
      ink: k?.ink ?? 0,
      hud: this.hud(p),
      debugAnswer: this.rt.testMode ? { choice: q.prompt.correctId } : undefined,
    };
  }

  onInput(p: RuntimePlayer, promptId: string, roundId: string, value: InputValue, t: number) {
    const k = this.karts.get(p.playerId);
    if (!k) return;
    if (this.phase === "items" && value.mode === "itemPick") {
      if (this.itemPicks.has(p.playerId)) return;
      const item = value.item as RaceItem;
      if (!(item in ITEM_INFO)) return;
      this.itemPicks.set(p.playerId, item);
      sfx.select();
      this.rt.view(p, { mode: "wait", title: `${ITEM_INFO[item].emoji} ${ITEM_INFO[item].label}!`, emoji: ITEM_INFO[item].emoji });
      if (this.rt.activePlayers.every((x) => this.itemPicks.has(x.playerId))) this.phaseEnd = gameNow() + 300;
      return;
    }
    const q = this.question;
    if (this.phase !== "question" || !q || q.promptId !== promptId || q.roundId !== roundId || value.mode !== "choices") return;
    if (q.answers.has(p.playerId) || k.finishedAt) return; // idempotent: first answer counts
    if (t > q.endAt + 150) return;
    const correct = value.choice === q.prompt.correctId;
    q.answers.set(p.playerId, { choice: value.choice, at: t, correct });
    const latency = t - q.startAt;
    this.rt.evidence(p, q.prompt, "race.choice", correct ? "correct" : "wrong", latency);
    if (correct) {
      k.combo += 1;
      if (k.combo >= 3) {
        boost(k, t, 2.2, 2300, "combo");
        k.combo = 0;
        k.label = { text: "COMBO BOOST!", at: t, tone: "good" };
        sfx.boost();
        this.rt.say({ type: "combo", name: p.name });
        this.rt.perf(p, "race", "combo");
        this.rt.addScore(p, 150, "race");
      } else if (latency < TURBO_MS * this.rt.pace) {
        boost(k, t, 1.5, 1900, "turbo");
        k.label = { text: "TURBO!", at: t, tone: "good" };
        sfx.boost();
        if (this.rt.rng.next() < 0.35) this.rt.say({ type: "turbo", name: p.name });
        this.rt.perf(p, "race", "turbo");
        this.rt.addScore(p, 120, "race");
      } else {
        boost(k, t, 0.8, 1300, "boost");
        k.label = { text: "Boa!", at: t, tone: "good" };
        sfx.correct();
        this.rt.addScore(p, 80, "race");
      }
      this.rt.conn.fx(p.playerId, "boost");
    } else {
      k.combo = 0;
      if (k.shield) {
        k.shield = false;
        k.label = { text: "ESCUDO!", at: t, tone: "item" };
        sfx.pop();
      } else {
        k.spinUntil = t + 1400;
        k.spinStart = t;
        k.boostUntil = 0;
        k.label = { text: "PIÃO!", at: t, tone: "bad" };
        sfx.spin();
        this.rt.say({ type: "spinout", name: p.name });
        this.rt.perf(p, "race", "spinout");
      }
      this.rt.conn.fx(p.playerId, "fail");
    }
    if (k.ink > 0) k.ink = 0; // ink lasts one question
    this.rt.conn.sendView(p.playerId, this.questionView(p));
    if (this.rt.activePlayers.every((x) => q.answers.has(x.playerId) || this.karts.get(x.playerId)?.finishedAt)) this.phaseEnd = Math.min(this.phaseEnd, gameNow() + 400);
    this.rt.bump();
  }

  repeat() {
    const q = this.question;
    if (q) this.rt.speakPt(q.prompt.audio ?? q.prompt.answerText);
  }

  private closeQuestion(now: number) {
    const q = this.question!;
    for (const p of this.rt.activePlayers) {
      const k = this.karts.get(p.playerId);
      if (!q.answers.has(p.playerId) && k && !k.finishedAt) {
        this.rt.evidence(p, q.prompt, "race.choice", "timeout");
        k.combo = 0;
        k.label = { text: "Muito lento…", at: now, tone: "bad" };
        this.rt.view(p, { mode: "wait", title: "Tempo!", subtitle: q.prompt.answerText, emoji: "⏰", feedback: { status: "wrong", text: q.prompt.answerText, detail: q.prompt.why } });
      }
    }
    const answers = [...q.answers.values()];
    if (this.rt.activePlayers.length > 1 && answers.length > 1 && answers.every((a) => !a.correct)) this.rt.say({ type: "bothWrong" });
    this.setPhase("reveal", now, REVEAL_MS * Math.sqrt(this.rt.pace));
    this.rt.speakPt(q.prompt.audio ?? q.prompt.answerText);
  }

  /* ---------------------------------- items ---------------------------------- */

  private offerItems(now: number) {
    this.itemsDone = true;
    this.itemPicks.clear();
    this.question = null;
    this.setPhase("items", now, ITEMS_MS * this.rt.pace);
    sfx.coin();
    const solo = this.rt.activePlayers.length < 2;
    const items: RaceItem[] = solo ? ["shield", "nitro"] : ["shield", "nitro", "ink"];
    const roundId = randomId(6);
    const promptId = randomId(6);
    for (const p of this.rt.activePlayers) {
      this.rt.conn.sendView(p.playerId, {
        mode: "itemPick",
        roundId,
        promptId,
        deadline: now + ITEMS_MS * this.rt.pace,
        title: "RONDA DE ITENS!",
        question: "Escolhe um item:",
        items: items.map((id) => ({ id, ...ITEM_INFO[id] })),
        debugAnswer: this.rt.testMode ? { item: "nitro" } : undefined,
      });
    }
  }

  private closeItems(now: number) {
    for (const p of this.rt.activePlayers) {
      const k = this.karts.get(p.playerId);
      const item = this.itemPicks.get(p.playerId);
      if (!k || !item) continue;
      if (item === "shield") {
        k.shield = true;
        k.label = { text: "🛡️ Escudo", at: now, tone: "item" };
      } else if (item === "nitro") {
        boost(k, now, 1.8, 2200, "nitro");
        k.label = { text: "🚀 NITRO!", at: now, tone: "item" };
        sfx.boost();
      } else if (item === "ink") {
        const other = this.rt.activePlayers.find((x) => x.playerId !== p.playerId);
        const ok = other && this.karts.get(other.playerId);
        if (other && ok) {
          ok.ink = 4;
          ok.label = { text: "🎨 SPLAT!", at: now, tone: "bad" };
          sfx.splat();
          this.rt.say({ type: "ink", name: p.name, other: other.name }, true);
        }
      }
    }
    this.setPhase("gap", now, 700);
  }

  onNav(_d: NavDir) {}

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.phase === "question" && this.question) return this.questionView(p);
    return { mode: "wait", title: this.phase === "countdown" ? "Prepara-te!" : this.hud(p) || "Olha para a TV!", emoji: "🏎️" };
  }
}

function newKart(playerId: string, lane: number): Kart {
  return { playerId, u: 0, speed: 0, boostUntil: 0, boostPower: 0, boostKind: null, spinUntil: 0, spinStart: 0, shield: false, combo: 0, finishedAt: null, ink: 0, tailwind: false, label: null, lane };
}

function boost(k: Kart, now: number, power: number, ms: number, kind: Kart["boostKind"]) {
  k.boostPower = Math.max(power, now < k.boostUntil ? k.boostPower : 0);
  k.boostUntil = Math.max(k.boostUntil, now + ms);
  k.boostKind = kind;
  k.spinUntil = 0;
}
