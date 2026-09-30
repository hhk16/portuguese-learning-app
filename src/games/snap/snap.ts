/**
 * Apanha! — versus listening "Snap".
 *
 * The TV says a Portuguese word. Then picture cards flip one by one; slam your phone the moment
 * the right one shows. First correct slam (by synced timestamp) takes the card; a false slam
 * freezes you for the rest of the round. Warm-up rounds also show the word written; later rounds
 * are ear-only and worth double.
 */
import { gameNow } from "../../tv/clock.ts";
import { padCards, type LearnCard } from "../../curriculum/learn.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue } from "../../shared/protocol.ts";
import { sfx } from "../../audio/sfx.ts";
import { playMusic } from "../../audio/music.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

const LISTEN_MS = 2600;
const CARD_MS = 1500;
const REVEAL_MS = 2800;
const WARMUP_ROUNDS = 3;
/** Taps within this window of the first valid one are compared by timestamp. */
const DECIDE_MS = 90;

interface SnapRound {
  roundId: string;
  target: LearnCard;
  deck: LearnCard[];
  targetIndex: number;
  startAt: number;
  per: number;
  written: boolean;
  stunned: Set<string>;
  hits: { p: RuntimePlayer; t: number }[];
  decideAt: number | null;
  winner: RuntimePlayer | null;
}

export class Apanha implements Activity {
  readonly id = "snap";
  readonly pausable = true;
  readonly music = "race" as const;
  rt!: TvRuntime;
  phase: "listen" | "flip" | "reveal" | "end" = "listen";
  phaseEnd = 0;
  index = 0;
  round: SnapRound | null = null;
  readonly scores = new Map<string, number>();
  private readonly pool: LearnCard[];
  private readonly total: number;
  private readonly onDone: () => void;
  private used: string[] = [];

  constructor(cards: readonly LearnCard[], onDone: () => void, total = 8) {
    this.pool = padCards(cards, 8);
    this.total = total;
    this.onDone = onDone;
  }

  get totalRounds() {
    return this.total;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    playMusic("race");
    for (const p of rt.activePlayers) this.scores.set(p.playerId, 0);
    rt.say({ type: "snapStart" }, true, 3000);
    this.phaseEnd = gameNow() + 2200;
    this.phase = "reveal"; // brief lead-in, then the first round
  }

  /** Which card is face-up at host time t (-1 = none). */
  cardAt(t: number): number {
    const r = this.round;
    if (!r) return -1;
    const i = Math.floor((t - r.startAt) / r.per);
    return i >= 0 && i < r.deck.length ? i : -1;
  }

  private nextRound(now: number) {
    if (this.index >= this.total || this.pool.length < 3) {
      this.phase = "end";
      this.onDone();
      return;
    }
    const rng = this.rt.rng;
    const fresh = this.pool.filter((c) => !this.used.slice(-5).includes(c.itemId));
    const target = rng.pick(fresh.length ? fresh : this.pool);
    this.used.push(target.itemId);
    const same = rng.shuffle(this.pool.filter((c) => c !== target && c.kind === target.kind));
    const other = rng.shuffle(this.pool.filter((c) => c !== target && c.kind !== target.kind));
    const decoys = [...same, ...other].slice(0, 5);
    const targetIndex = 1 + rng.int(Math.min(4, decoys.length));
    const deck = [...decoys];
    deck.splice(targetIndex, 0, target);
    this.round = {
      roundId: randomId(6),
      target,
      deck: deck.slice(0, 6),
      targetIndex,
      startAt: 0,
      per: CARD_MS * this.rt.pace,
      written: this.index < WARMUP_ROUNDS,
      stunned: new Set(),
      hits: [],
      decideAt: null,
      winner: null,
    };
    this.index++;
    this.phase = "listen";
    this.phaseEnd = now + LISTEN_MS * Math.sqrt(this.rt.pace);
    this.rt.speakPt(target.say, { slow: this.round.written });
    sfx.blip();
    this.sendAll();
    this.rt.bump();
  }

  tick(now: number) {
    const r = this.round;
    if (this.phase === "flip" && r) {
      if (r.decideAt !== null && now >= r.decideAt) return this.award(now);
      if (now >= r.startAt + r.deck.length * r.per) return this.reveal(now, null);
      return;
    }
    if (now < this.phaseEnd) return;
    if (this.phase === "listen" && r) {
      this.phase = "flip";
      r.startAt = now;
      this.phaseEnd = now + r.deck.length * r.per;
      this.sendAll();
      this.rt.bump();
      return;
    }
    if (this.phase === "reveal") this.nextRound(now);
  }

  onInput(p: RuntimePlayer, _promptId: string, roundId: string, value: InputValue, hostTime: number) {
    const r = this.round;
    if (this.phase !== "flip" || !r || roundId !== r.roundId || value.mode !== "buzz" || r.winner) return;
    if (r.stunned.has(p.playerId)) return;
    const t = value.tapHostTime > 0 ? value.tapHostTime : hostTime;
    const i = this.cardAt(t);
    if (i < 0) return;
    if (i === r.targetIndex) {
      r.hits.push({ p, t });
      r.decideAt ??= gameNow() + DECIDE_MS;
      return;
    }
    // False slam: frozen for the rest of the round (that's the whole penalty — no negative points).
    r.stunned.add(p.playerId);
    sfx.wrong();
    this.rt.conn.fx(p.playerId, "fail");
    this.rt.say({ type: "snapFalse", name: p.name }, false, 1800);
    this.rt.view(p, this.viewFor(p));
    if (this.rt.activePlayers.every((x) => r.stunned.has(x.playerId))) this.reveal(gameNow(), null);
    this.rt.bump();
  }

  private award(now: number) {
    const r = this.round!;
    const first = r.hits.sort((a, b) => a.t - b.t)[0];
    this.reveal(now, first?.p ?? null);
  }

  private reveal(now: number, winner: RuntimePlayer | null) {
    const r = this.round!;
    r.winner = winner;
    this.phase = "reveal";
    this.phaseEnd = now + REVEAL_MS;
    const at = Date.now();
    if (winner) {
      const pts = r.written ? 1 : 2;
      this.scores.set(winner.playerId, (this.scores.get(winner.playerId) ?? 0) + pts);
      this.rt.addScore(winner, 100 * pts, "snap");
      this.rt.learner.record({ profileId: winner.profile.profileId, itemId: r.target.itemId, context: "snap.listen", tier: 1, outcome: "correct", at });
      sfx.correct();
      this.rt.conn.fx(winner.playerId, "success");
      this.rt.say({ type: "snapWin", name: winner.name }, false, 2200);
    } else {
      sfx.wrong();
      this.rt.say({ type: "snapNobody" }, false, 2200);
    }
    for (const id of r.stunned) {
      const p = this.rt.players.get(id);
      if (!p) continue;
      this.rt.learner.record({ profileId: p.profile.profileId, itemId: r.target.itemId, context: "snap.listen", tier: 1, outcome: "wrong", at });
      if (!p.missed.some((m) => m.answer === r.target.pt)) p.missed.push({ itemId: r.target.itemId, answer: r.target.pt, why: r.target.en });
    }
    this.rt.speakPt(r.target.say);
    this.sendAll();
    this.rt.bump();
  }

  private sendAll() {
    for (const p of this.rt.activePlayers) this.rt.view(p, this.viewFor(p));
  }

  onPlayersChanged() {
    for (const p of this.rt.activePlayers) if (!this.scores.has(p.playerId)) this.scores.set(p.playerId, 0);
    this.sendAll();
  }

  viewFor(p: RuntimePlayer): ControllerView {
    const r = this.round;
    const score = this.scores.get(p.playerId) ?? 0;
    if (!r) return { mode: "wait", title: "Apanha!", subtitle: "Ouve a palavra. Bate quando a vires na TV!", emoji: "⚡" };
    const base = { mode: "buzzer" as const, roundId: r.roundId, promptId: r.roundId, score };
    if (this.phase === "listen") return { ...base, state: "listen", label: r.written ? r.target.pt : "🔊 Ouve…" };
    if (this.phase === "flip")
      return {
        ...base,
        state: r.stunned.has(p.playerId) ? "stunned" : "go",
        label: r.written ? r.target.pt : undefined,
        debugAnswer: this.rt.testMode ? { startAt: r.startAt, per: r.per, targetIndex: r.targetIndex } : undefined,
      };
    return { ...base, state: r.winner === p ? "won" : "lost", label: `${r.target.pt} = ${r.target.en}` };
  }
}
