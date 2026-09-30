/**
 * Diz-me! — co-op speaking & listening. Us vs the clock.
 *
 * The describer's phone shows a secret card (picture + Portuguese + English). They must SAY it in
 * Portuguese — no English, no pointing. The partner hears it and taps the matching picture among
 * six. Every hit is a team point; then roles swap. Passes the nonsense-word test (it's charades
 * with a buzzer), and the learning is real: one of you produces, the other decodes, out loud,
 * to each other.
 */
import { gameNow } from "../../tv/clock.ts";
import { padCards, type LearnCard } from "../../curriculum/learn.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue } from "../../shared/protocol.ts";
import { sfx } from "../../audio/sfx.ts";
import { playMusic } from "../../audio/music.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

const TURN_MS = 50_000;
const INTRO_MS = 4200;
const TURN_END_MS = 3800;
const RECORD_KEY = "pp.tv.dizmeRecord";

export interface DizMeFound {
  card: LearnCard;
  by: string;
}

export class DizMe implements Activity {
  readonly id = "dizme";
  readonly pausable = true;
  readonly music = "party" as const;
  rt!: TvRuntime;
  phase: "intro" | "play" | "turnEnd" | "solo" | "end" = "intro";
  phaseStart = 0;
  phaseEnd = 0;
  turn = 0;
  order: RuntimePlayer[] = [];
  target: LearnCard | null = null;
  tiles: LearnCard[] = [];
  wrong = new Map<string, Set<string>>();
  misses = 0;
  score = 0;
  found: DizMeFound[] = [];
  /** Last hit, for the TV pop-up. */
  hit: { card: LearnCard; seq: number } | null = null;
  record = readRecord();
  newRecord = false;
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private readonly pool: LearnCard[];
  private used: string[] = [];
  private readonly turnsEach: number;
  private readonly onDone: (score: number) => void;
  private hitSeq = 0;

  constructor(cards: readonly LearnCard[], onDone: (score: number) => void, turnsEach = 1) {
    this.pool = padCards(cards, 8);
    this.onDone = onDone;
    this.turnsEach = turnsEach;
  }

  get describer(): RuntimePlayer | undefined {
    return this.order[this.turn % Math.max(1, this.order.length)];
  }
  get guessers(): RuntimePlayer[] {
    const d = this.describer;
    return this.rt.activePlayers.filter((p) => p !== d);
  }
  get totalTurns() {
    return this.order.length * this.turnsEach;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    playMusic("party");
    this.order = [...rt.activePlayers];
    if (this.order.length < 2) {
      this.setPhase("solo", 4500);
      rt.view("all", { mode: "wait", title: "Diz-me! precisa de 2", subtitle: "Chama o teu par para jogar! 📱📱", emoji: "🗣️" });
      return;
    }
    this.beginTurn();
  }

  private setPhase(phase: DizMe["phase"], ms: number) {
    this.phase = phase;
    this.phaseStart = gameNow();
    this.phaseEnd = this.phaseStart + ms;
    this.rt.bump();
  }

  private beginTurn() {
    const d = this.describer!;
    this.setPhase("intro", INTRO_MS);
    sfx.slam();
    this.rt.say({ type: "dizmeStart", name: d.name, other: this.guessers.map((g) => g.name).join(" e ") }, true, 3800);
    this.sendAll();
  }

  private startPlay() {
    this.setPhase("play", TURN_MS * this.rt.pace);
    this.nextTarget();
  }

  private nextTarget() {
    const recent = new Set(this.used.slice(-Math.min(12, this.pool.length - 6)));
    const candidates = this.pool.filter((c) => !recent.has(c.itemId));
    const t = this.rt.rng.pick(candidates.length ? candidates : this.pool);
    this.used.push(t.itemId);
    this.target = t;
    // Similar cards first (same kind), so listening matters.
    const same = this.rt.rng.shuffle(this.pool.filter((c) => c !== t && c.kind === t.kind && c.en !== t.en));
    const other = this.rt.rng.shuffle(this.pool.filter((c) => c !== t && c.kind !== t.kind && c.en !== t.en));
    const picks: LearnCard[] = [];
    for (const c of [...same, ...other]) if (picks.length < 5 && !picks.some((x) => x.en === c.en)) picks.push(c);
    this.tiles = this.rt.rng.shuffle([t, ...picks]);
    this.wrong.clear();
    this.misses = 0;
    this.promptId = randomId(6);
    this.sendAll();
    this.rt.bump();
  }

  tick(now: number) {
    if (now < this.phaseEnd) return;
    switch (this.phase) {
      case "solo":
        this.phase = "end";
        this.onDone(0);
        return;
      case "intro":
        return this.startPlay();
      case "play":
        this.target = null;
        sfx.countdown(true);
        this.setPhase("turnEnd", TURN_END_MS);
        this.sendAll();
        return;
      case "turnEnd":
        this.turn++;
        if (this.turn >= this.totalTurns) return this.finish();
        return this.beginTurn();
    }
  }

  private finish() {
    this.phase = "end";
    if (this.score > this.record) {
      this.newRecord = true;
      this.record = this.score;
      writeRecord(this.score);
      this.rt.say({ type: "dizmeRecord" }, true, 3500);
    }
    this.onDone(this.score);
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (this.phase !== "play" || !this.target || promptId !== this.promptId) return;
    const d = this.describer!;
    if (value.mode === "describe" && p === d && value.action === "skip") {
      sfx.whoosh();
      return this.nextTarget();
    }
    if (value.mode !== "choices" || p === d) return;
    const at = Date.now();
    if (value.choice === this.target.itemId) {
      this.score++;
      this.found.push({ card: this.target, by: d.name });
      this.hit = { card: this.target, seq: ++this.hitSeq };
      sfx.correct();
      this.rt.speakPt(this.target.say);
      // Evidence: the describer produced it, the guesser understood it.
      this.rt.learner.record({ profileId: d.profile.profileId, itemId: this.target.itemId, context: "dizme.say", tier: 2, outcome: "judged-correct", at });
      this.rt.learner.record({ profileId: p.profile.profileId, itemId: this.target.itemId, context: "dizme.listen", tier: 1, outcome: "correct", at });
      this.rt.addScore(d, 100, "dizme");
      this.rt.addScore(p, 100, "dizme");
      this.rt.conn.fx(d.playerId, "success");
      this.rt.conn.fx(p.playerId, "success");
      if (this.score % 3 === 0) this.rt.say({ type: "dizmeHit", name: d.name }, false, 2000);
      return this.nextTarget();
    }
    const set = this.wrong.get(p.playerId) ?? new Set<string>();
    set.add(value.choice);
    this.wrong.set(p.playerId, set);
    this.misses++;
    sfx.wrong();
    this.rt.conn.fx(p.playerId, "fail");
    this.rt.learner.record({ profileId: p.profile.profileId, itemId: this.target.itemId, context: "dizme.listen", tier: 1, outcome: "wrong", at });
    if (!p.missed.some((m) => m.answer === this.target!.pt)) p.missed.push({ itemId: this.target.itemId, answer: this.target.pt, why: this.target.en });
    if (this.misses >= 3) return this.nextTarget();
    this.rt.view(p, this.viewFor(p));
  }

  private sendAll() {
    for (const p of this.rt.activePlayers) this.rt.view(p, this.viewFor(p));
  }

  onPlayersChanged() {
    this.sendAll();
  }

  viewFor(p: RuntimePlayer): ControllerView {
    const d = this.describer;
    if (this.phase === "intro" && d) {
      return p === d
        ? { mode: "wait", title: "Tu dizes!", subtitle: "Vais ver palavras. Di-las em português — sem inglês, sem apontar!", emoji: "🗣️" }
        : { mode: "wait", title: "Tu adivinhas!", subtitle: `Ouve o que ${d.name} diz e toca na imagem certa.`, emoji: "👂" };
    }
    if (this.phase === "play" && this.target && d) {
      if (p === d) {
        return {
          mode: "describe",
          roundId: this.roundId,
          promptId: this.promptId,
          deadline: this.phaseEnd,
          title: "DIZ EM VOZ ALTA!",
          card: { pt: this.target.pt, en: this.target.en, emoji: this.target.emoji, say: this.target.say },
          score: this.score,
          partner: this.guessers.map((g) => g.name).join(" e "),
        };
      }
      const wrong = this.wrong.get(p.playerId) ?? new Set<string>();
      return {
        mode: "choices",
        roundId: this.roundId,
        promptId: this.promptId,
        deadline: this.phaseEnd,
        title: "OUVE E ESCOLHE!",
        card: { kicker: `${d.name} está a dizer…`, headline: "Qual é?", sub: `${this.score} ✓`, quiet: true },
        layout: "grid",
        options: this.tiles
          .filter((c) => !wrong.has(c.itemId))
          .map((c) => ({ id: c.itemId, label: c.en, emoji: c.emoji !== c.en ? c.emoji : undefined })),
        debugAnswer: this.rt.testMode ? { choice: this.target.itemId } : undefined,
      };
    }
    if (this.phase === "turnEnd") return { mode: "wait", title: "Tempo!", subtitle: `${this.score} palavras até agora`, emoji: "⏰" };
    return { mode: "wait", title: "Diz-me!", emoji: "🗣️" };
  }
}

function readRecord(): number {
  try {
    return Number(localStorage.getItem(RECORD_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}
function writeRecord(n: number) {
  try {
    localStorage.setItem(RECORD_KEY, String(n));
  } catch {
    /* ignore */
  }
}
