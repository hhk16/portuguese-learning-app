/**
 * Pares Secretos — co-op clue game for two (Codenames Duet, simplified for A1).
 *
 * 12 pictures on the TV. Each phone secretly marks 3 of them that the PARTNER must find, plus one
 * bomb. Take turns: the clue-giver says Portuguese words out loud ("comida!", "é frio!") and taps
 * a number; the partner taps pictures on their phone. Find all 6 before the turns run out; two
 * bombs and it's over. Labels are Portuguese, so both of you read and say the words all game.
 */
import { gameCards, padCards, type LearnCard } from "../../curriculum/learn.ts";
import type { Lesson } from "../../curriculum/schema.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, SecretCard } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

export const BOARD = 12;
export const TARGETS_EACH = 3;
export const TURNS = 8;
export const LIVES = 2;

interface Card {
  id: string;
  card: LearnCard;
  state: SecretCard["state"];
  /** Player id whose partner must find it (i.e. whose key marks it as a target). */
  targetOf: string | null;
  bomb: boolean;
}

export interface SecretResult {
  won: boolean;
  found: number;
  goal: number;
  turnsUsed: number;
}

export class ParesSecretos implements Activity {
  readonly id = "secret";
  readonly pausable = true;
  rt!: TvRuntime;
  cards: Card[] = [];
  phase: "clue" | "guess" | "end" = "clue";
  giverIndex = 0;
  clueCount = 0;
  guessesLeft = 0;
  turnsLeft = TURNS;
  lives = LIVES;
  /** Last reveal, for the TV animation. */
  flash: { id: string; kind: "found" | "neutral" | "boom"; seq: number } | null = null;
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private readonly lessons: Lesson[];
  private readonly onDone: (r: SecretResult) => void;
  private flashSeq = 0;
  private ended = false;

  constructor(lessons: Lesson[], onDone: (r: SecretResult) => void) {
    this.lessons = lessons;
    this.onDone = onDone;
  }

  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }
  get giver(): RuntimePlayer | undefined {
    return this.players[this.giverIndex % 2];
  }
  get guesser(): RuntimePlayer | undefined {
    return this.players[(this.giverIndex + 1) % 2];
  }
  get goal() {
    return this.cards.filter((c) => c.targetOf).length;
  }
  get found() {
    return this.cards.filter((c) => c.state === "found").length;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    const pool = padCards(
      gameCards(this.lessons).filter((c) => c.emoji && c.short && c.kind !== "contraction"),
      BOARD + 4,
    ).filter((c) => c.emoji);
    const picked = rt.rng.sample(pool, BOARD);
    this.cards = picked.map((card, i) => ({ id: `c${i}`, card, state: "hidden", targetOf: null, bomb: false }));
    const order = rt.rng.shuffle(this.cards);
    const [a, b] = this.players;
    order.slice(0, TARGETS_EACH).forEach((c) => (c.targetOf = a?.playerId ?? null));
    order.slice(TARGETS_EACH, TARGETS_EACH * 2).forEach((c) => (c.targetOf = b?.playerId ?? a?.playerId ?? null));
    order.slice(TARGETS_EACH * 2, TARGETS_EACH * 2 + 2).forEach((c) => (c.bomb = true));
    this.newTurn();
  }

  private newTurn() {
    this.phase = "clue";
    this.clueCount = 0;
    this.guessesLeft = 0;
    this.promptId = randomId(6);
    play("whoosh");
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick() {}

  repeat() {
    this.rt.speakPt(this.cards.filter((c) => c.state === "hidden").map((c) => c.card.say).join(", "));
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode !== "secret" || this.phase === "end" || promptId !== this.promptId) return;
    const act = value.action;
    if (this.phase === "clue" && act.a === "clue" && p === this.giver) {
      this.clueCount = act.count;
      this.guessesLeft = act.count + 1;
      this.phase = "guess";
      this.promptId = randomId(6);
      play("select");
      this.rt.emote(p.playerId, "think", 2000);
      this.rt.refreshViews();
      this.rt.bump();
      return;
    }
    if (this.phase !== "guess" || p !== this.guesser) return;
    if (act.a === "stop") return this.endTurn();
    if (act.a !== "tap") return;
    const c = this.cards.find((x) => x.id === act.cardId);
    if (!c || c.state !== "hidden") return;
    const giver = this.giver!;
    this.rt.speakPt(c.card.say);
    if (c.bomb) {
      c.state = "boom";
      this.lives--;
      this.flash = { id: c.id, kind: "boom", seq: ++this.flashSeq };
      play("fail-jingle");
      this.rt.emote(p.playerId, "sad", 2500);
      this.rt.emote(giver.playerId, "sad", 2500);
      if (this.lives <= 0) return this.finish(false);
      return this.endTurn();
    }
    if (c.targetOf) {
      c.state = "found";
      this.flash = { id: c.id, kind: "found", seq: ++this.flashSeq };
      this.rt.evidence(p, c.card.itemId, "secret.guess", "correct");
      this.rt.addScore(p, 50, "secret");
      this.rt.addScore(giver, 50, "secret");
      play("correct");
      this.rt.emote(p.playerId, "cheer");
      this.rt.emote(giver.playerId, "cheer");
      if (this.found >= this.goal) return this.finish(true);
      // Someone else's target (lucky) ends the turn; the giver's own continues.
      if (c.targetOf !== giver.playerId) return this.endTurn();
      this.guessesLeft--;
      if (this.guessesLeft <= 0) return this.endTurn();
      this.promptId = randomId(6);
      this.rt.refreshViews();
      this.rt.bump();
      return;
    }
    c.state = "neutral";
    this.flash = { id: c.id, kind: "neutral", seq: ++this.flashSeq };
    play("wrong");
    return this.endTurn();
  }

  private endTurn() {
    this.turnsLeft--;
    if (this.turnsLeft <= 0) return this.finish(this.found >= this.goal);
    this.giverIndex++;
    // If the new giver has nothing left for the partner to find, skip to the other.
    const g = this.giver;
    if (g && !this.cards.some((c) => c.targetOf === g.playerId && c.state === "hidden")) this.giverIndex++;
    setTimeout(() => this.newTurn(), 900);
    this.phase = "clue";
    this.rt.bump();
  }

  private finish(won: boolean) {
    if (this.ended) return;
    this.ended = true;
    this.phase = "end";
    for (const c of this.cards) if (c.state === "hidden" && (c.targetOf || c.bomb)) c.state = c.bomb ? "boom" : "neutral";
    play(won ? "success-jingle" : "fail-jingle");
    if (won) this.rt.celebrate();
    this.rt.bump();
    setTimeout(() => this.onDone({ won, found: this.found, goal: this.goal, turnsUsed: TURNS - this.turnsLeft }), 2600);
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Pares Secretos precisa de 2", subtitle: "Chama o teu par para jogar!", pic: "🤝" };
    if (this.phase === "end") return { mode: "wait", title: this.found >= this.goal ? "Conseguiram!" : "Fim do jogo", subtitle: `${this.found}/${this.goal} pares encontrados`, pic: this.found >= this.goal ? "🏆" : "💣" };
    const isGiver = p === this.giver;
    const role = this.phase === "clue" ? (isGiver ? "clue" : "watch") : p === this.guesser ? "guess" : "watch";
    const partner = this.rt.partnerOf(p)?.name ?? "";
    const cards: SecretCard[] = this.cards.map((c) => ({
      id: c.id,
      word: { pt: c.card.pt, en: isGiver ? c.card.en : undefined, pic: c.card.emoji },
      state: c.state,
      // The giver sees their own key: which cards their partner must find (and the bombs).
      key: isGiver ? (c.bomb ? "bomb" : c.targetOf === p.playerId ? "target" : "neutral") : undefined,
    }));
    const firstHiddenTarget = this.cards.find((c) => c.state === "hidden" && c.targetOf === this.giver?.playerId);
    return {
      mode: "secret",
      roundId: this.roundId,
      promptId: this.promptId,
      role,
      partner,
      cards,
      clue: this.phase === "guess" ? { count: this.clueCount } : undefined,
      guessesLeft: this.phase === "guess" ? this.guessesLeft : undefined,
      turnsLeft: this.turnsLeft,
      found: this.found,
      goal: this.goal,
      debugAnswer: this.rt.testMode ? { cardId: firstHiddenTarget?.id, targets: this.cards.filter((c) => c.targetOf === this.giver?.playerId && c.state === "hidden").length } : undefined,
    };
  }
}
