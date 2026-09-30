/**
 * Pares Secretos — co-op clue game for two (Codenames Duet, made for A1).
 *
 * A board of pictures with Portuguese labels. Each phone secretly marks the cards the PARTNER must
 * find, plus the bombs. On your turn you pick ONE Portuguese clue word (frio, fruta, praia…) and a
 * number; the TV says the clue out loud and your partner taps cards. Clues can't be board words,
 * so the game is about meaning: "quente, 2" → o café, a sopa. Find all your pairs before the turns
 * run out; bombs cost a life (on hard, a bomb ends the game).
 */
import { getItem } from "../../curriculum/index.ts";
import { cardOf, type LearnCard } from "../../curriculum/learn.ts";
import type { Lesson } from "../../curriculum/schema.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, SecretCard, Word } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import type { GameOutcome } from "../../tv/activities.ts";
import { SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";
import { LINKS, linksOf, type Link } from "../sync/links.ts";

/** Difficulty: board size, targets per player, bombs, turns, lives, clue timer. */
export const LEVEL_RULES: Record<Level, { board: number; targets: number; bombs: number; turns: number; lives: number; clueMs: number; suddenDeath: boolean }> = {
  1: { board: 12, targets: 3, bombs: 2, turns: 9, lives: 2, clueMs: 60_000, suddenDeath: false },
  2: { board: 16, targets: 4, bombs: 3, turns: 9, lives: 2, clueMs: 45_000, suddenDeath: false },
  3: { board: 20, targets: 4, bombs: 3, turns: 8, lives: 1, clueMs: 35_000, suddenDeath: true },
};

interface Card {
  id: string;
  member: string;
  card: LearnCard;
  state: SecretCard["state"];
  /** Player id whose partner must find it (i.e. whose key marks it as a target). */
  targetOf: string | null;
  bomb: boolean;
}

function memberCard(m: string): LearnCard | null {
  const it = getItem(m.startsWith("prof:") ? `vocab.profession.${m.slice(5)}` : `vocab.noun.${m}`);
  const c = it ? cardOf(it) : null;
  return c && c.emoji ? c : null;
}

export class ParesSecretos implements Activity {
  readonly id = "secret";
  readonly pausable = true;
  rt!: TvRuntime;
  level: Level = 1;
  cards: Card[] = [];
  phase: "clue" | "guess" | "end" = "clue";
  phaseEnd = 0;
  giverIndex = 0;
  clueCount = 0;
  clueWord: Link | null = null;
  guessesLeft = 0;
  turnsUsed = 0;
  lives = 2;
  /** Last reveal, for the TV animation. */
  flash: { id: string; kind: "found" | "neutral" | "boom"; seq: number } | null = null;
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private readonly lessons: Lesson[];
  private readonly onDone: (r: GameOutcome) => void;
  private flashSeq = 0;
  private ended = false;
  private streak = 0;

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
  get turnsLeft() {
    return this.rules.turns - this.turnsUsed;
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.lives = this.rules.lives;
    // Build the board from linked words so there's always a clue that covers two cards.
    const fromLessons = new Set(this.lessons.flatMap((l) => l.itemIds));
    const members = [...new Set(LINKS.flatMap((l) => l.members))].filter((m) => memberCard(m));
    const inLesson = (m: string) => fromLessons.has(m.startsWith("prof:") ? `vocab.profession.${m.slice(5)}` : `vocab.noun.${m}`);
    const ordered = [...rt.rng.shuffle(members.filter(inLesson)), ...rt.rng.shuffle(members.filter((m) => !inLesson(m)))];
    const picked: string[] = [];
    // Seed with a few links' members so targets can be clued together, then fill.
    for (const l of rt.rng.shuffle(LINKS)) {
      for (const m of rt.rng.sample(l.members.filter((x) => memberCard(x) && !picked.includes(x)), 2)) if (picked.length < this.rules.board) picked.push(m);
      if (picked.length >= this.rules.board * 0.6) break;
    }
    for (const m of ordered) if (picked.length < this.rules.board && !picked.includes(m)) picked.push(m);
    this.cards = rt.rng.shuffle(picked).map((m, i) => ({ id: `c${i}`, member: m, card: memberCard(m)!, state: "hidden", targetOf: null, bomb: false }));
    const [a, b] = this.players;
    // Targets in linked pairs where possible (so a clue can cover them).
    const order = this.targetOrder();
    const t = this.rules.targets;
    order.slice(0, t).forEach((c) => (c.targetOf = a?.playerId ?? null));
    order.slice(t, t * 2).forEach((c) => (c.targetOf = b?.playerId ?? a?.playerId ?? null));
    order.slice(t * 2, t * 2 + this.rules.bombs).forEach((c) => (c.bomb = true));
    this.newTurn();
  }

  /** Cards ordered so consecutive ones share a link (targets come in clue-able pairs). */
  private targetOrder(): Card[] {
    const left = this.rt.rng.shuffle(this.cards);
    const out: Card[] = [];
    while (left.length) {
      const c = left.shift()!;
      out.push(c);
      const mate = left.findIndex((x) => linksOf(x.member).some((l) => l.members.includes(c.member)));
      if (mate >= 0) out.push(left.splice(mate, 1)[0]!);
    }
    return out;
  }

  /** Clue words: every link word that isn't on the board, most useful for your targets first. */
  clueWords(p: RuntimePlayer): Link[] {
    const board = new Set(this.cards.map((c) => c.card.pt.replace(/^(o|a) /, "").toLowerCase()));
    const mine = this.cards.filter((c) => c.targetOf === p.playerId && c.state === "hidden").map((c) => c.member);
    const useful = (l: Link) => l.members.filter((m) => mine.includes(m)).length;
    return LINKS.filter((l) => !board.has(l.pt.toLowerCase())).sort((x, y) => useful(y) - useful(x) || x.pt.localeCompare(y.pt));
  }

  private newTurn() {
    this.phase = "clue";
    this.phaseEnd = gameNow() + this.rules.clueMs;
    this.clueCount = 0;
    this.clueWord = null;
    this.guessesLeft = 0;
    this.promptId = randomId(6);
    play("whoosh");
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick(now: number) {
    // Nobody gave a clue in time: the turn is lost.
    if (this.phase === "clue" && now >= this.phaseEnd) {
      this.rt.say(SAY.timeUp);
      play("whistle");
      this.endTurn();
    }
  }

  repeat() {
    if (this.clueWord) this.rt.speakPt(`${this.clueWord.pt}, ${this.clueCount}`);
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode !== "secret" || this.phase === "end" || promptId !== this.promptId) return;
    const act = value.action;
    if (this.phase === "clue" && act.a === "clue" && p === this.giver) {
      const word = act.word ? LINKS.find((l) => l.pt === act.word) : undefined;
      if (!word) return;
      this.clueWord = word;
      this.clueCount = act.count;
      this.guessesLeft = act.count + 1;
      this.phase = "guess";
      this.promptId = randomId(6);
      this.streak = 0;
      play("card-flip");
      // The TV says the clue: listening practice for the guesser.
      this.rt.speakPt(word.pt);
      this.rt.emote(p.playerId, "think", 2000);
      if (this.guesser) this.rt.say(SAY.nowGuess);
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
      play("boom");
      this.rt.say(SAY.bomb, { interrupt: true });
      this.rt.emote(p.playerId, "sad", 2500);
      this.rt.emote(giver.playerId, "sad", 2500);
      if (this.lives <= 0 || this.rules.suddenDeath) return this.finish(false);
      return this.endTurn();
    }
    if (c.targetOf) {
      c.state = "found";
      this.flash = { id: c.id, kind: "found", seq: ++this.flashSeq };
      this.rt.evidence(p, c.card.itemId, "secret.guess", "correct");
      this.rt.addScore(p, 50, "secret");
      this.rt.addScore(giver, 50, "secret");
      // Each find in a row climbs a note.
      play("correct", 1, 1 + this.streak * 0.06);
      this.streak++;
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
    this.rt.say(SAY.ohNo);
    return this.endTurn();
  }

  private endTurn() {
    this.turnsUsed++;
    if (this.turnsLeft <= 0) return this.finish(this.found >= this.goal);
    this.giverIndex++;
    // If the new giver has nothing left for the partner to find, skip to the other.
    const g = this.giver;
    if (g && !this.cards.some((c) => c.targetOf === g.playerId && c.state === "hidden")) this.giverIndex++;
    this.phase = "clue";
    this.phaseEnd = gameNow() + 900 + this.rules.clueMs;
    setTimeout(() => this.rt.activity === this && this.phase !== "end" && this.newTurn(), 900);
    this.rt.bump();
  }

  private finish(won: boolean) {
    if (this.ended) return;
    this.ended = true;
    this.phase = "end";
    for (const c of this.cards) if (c.state === "hidden" && (c.targetOf || c.bomb)) c.state = c.bomb ? "boom" : "neutral";
    play(won ? "fanfare" : "sad-trombone");
    if (won) this.rt.celebrate();
    this.rt.bump();
    // Score: every pair found, plus a bonus for each turn to spare when you win.
    const spare = won ? this.turnsLeft : 0;
    const score = this.found * 10 + spare * 5 + (won ? 20 : 0);
    const max = this.goal * 10 + 20 + 5 * Math.max(1, this.rules.turns - Math.ceil(this.goal / 2));
    setTimeout(
      () =>
        this.onDone({
          score,
          max,
          headline: won ? `Conseguiram! ${this.found}/${this.goal} em ${this.turnsUsed} turnos` : `${this.found} de ${this.goal} pares`,
          headlineEn: won ? `You did it — ${this.turnsUsed} turns used` : `${this.found} of ${this.goal} found`,
          sub: won ? `${spare} turnos de sobra: +${spare * 5}` : this.lives <= 0 ? "A bomba ganhou desta vez." : "Acabaram-se os turnos.",
          subEn: won ? "Bonus for turns to spare" : this.lives <= 0 ? "The bomb got you this time." : "Out of turns.",
          words: this.cards.filter((c) => c.state === "found").map((c) => ({ pt: c.card.pt, en: c.card.en, pic: c.card.emoji })),
        }),
      2600,
    );
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Pares Secretos precisa de 2", subtitle: "Chama o teu par! · Needs two players", pic: "🤝" };
    if (this.phase === "end") return { mode: "wait", title: this.found >= this.goal ? "Conseguiram!" : "Fim do jogo", subtitle: `${this.found}/${this.goal} pares · pairs found`, pic: this.found >= this.goal ? "🏆" : "💣" };
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
    const toWord = (l: Link): Word => ({ pt: l.pt, en: l.en, pic: l.pic });
    const bestClue = isGiver && this.phase === "clue" ? this.clueWords(p)[0] : undefined;
    return {
      mode: "secret",
      roundId: this.roundId,
      promptId: this.promptId,
      role,
      partner,
      cards,
      clue: this.phase === "guess" && this.clueWord ? { count: this.clueCount, word: toWord(this.clueWord) } : undefined,
      clueWords: role === "clue" ? this.clueWords(p).map(toWord) : undefined,
      guessesLeft: this.phase === "guess" ? this.guessesLeft : undefined,
      turnsUsed: this.turnsUsed,
      turns: this.rules.turns,
      lives: this.lives,
      msLeft: this.phase === "clue" ? this.msLeft : undefined,
      found: this.found,
      goal: this.goal,
      debugAnswer: this.rt.testMode
        ? {
            cardId: this.phase === "guess" ? this.cards.find((c) => c.state === "hidden" && c.targetOf === this.giver?.playerId && this.clueWord?.members.includes(c.member))?.id ?? firstHiddenTarget?.id : firstHiddenTarget?.id,
            clueWord: bestClue?.pt,
            targets: bestClue ? Math.max(1, bestClue.members.filter((m) => this.cards.some((c) => c.member === m && c.targetOf === p.playerId && c.state === "hidden")).length) : 1,
          }
        : undefined,
    };
  }
}
