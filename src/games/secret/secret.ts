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
import { setHurry } from "../../audio/music.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import type { GameOutcome } from "../../tv/activities.ts";
import { CUE, NAMED, SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";
import { CATEGORY_LINKS, LINKS, linksOf, type Link } from "../sync/links.ts";

/**
 * Difficulty: board size, targets per player, bombs, turns, lives, clue timer, and the clue menu:
 * on Médio and Difícil the obvious category words (fruta, animal…) are gone — only sideways clues
 * (quente, velho, praia, manhã…) — and fewer of the chips touch your pictures at all.
 */
export const LEVEL_RULES: Record<Level, { board: number; targets: number; bombs: number; turns: number; lives: number; clueMs: number; bombEnds: boolean; categories: boolean; useful: number }> = {
  1: { board: 12, targets: 3, bombs: 2, turns: 6, lives: 3, clueMs: 60_000, bombEnds: false, categories: true, useful: 6 },
  2: { board: 16, targets: 4, bombs: 3, turns: 5, lives: 2, clueMs: 45_000, bombEnds: false, categories: false, useful: 4 },
  3: { board: 20, targets: 4, bombs: 3, turns: 4, lives: 1, clueMs: 35_000, bombEnds: true, categories: false, useful: 3 },
};

/** How many clue chips the giver chooses from. */
const CLUE_CHIPS = 12;
/** Bonus for a giver's bet that comes true (≈ a quarter of a good turn). */
export const BET_BONUS = 5;

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
  /** First play: the first turn is a practice turn ("Ensaio"): no timer, doesn't use a turn, bombs don't hurt. */
  practice = false;
  cards: Card[] = [];
  /** "sudden": out of turns — no more clues, both keep tapping; one wrong card and it's over. */
  phase: "clue" | "guess" | "sudden" | "end" = "clue";
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
  /** The giver's bet this turn, finds this turn, and bets won (+5 each at the end). */
  giverBet: number | null = null;
  turnFinds = 0;
  /** Between turns (bet card, then the next giver): phones show a short "end of turn" card. */
  turnOver = false;
  betsWon = 0;
  lastBet: { n: number; won: boolean } | null = null;
  /** Who did what, for the MVP split on game night: finds as guesser, finds from your clues, bets won. */
  contrib = new Map<string, number>();
  /** Bumped for every new board so the TV doesn't animate the old board's cards into the new one. */
  boardSeq = 0;
  /** This turn's clue chips (dealt once per turn). */
  private turnClues: Link[] = [];
  private heartbeat: ReturnType<typeof setInterval> | null = null;

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
  get inPractice() {
    return this.practice && this.phase !== "end";
  }
  get turnsLeft() {
    return this.rules.turns - this.turnsUsed;
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.dealBoard();
    this.newTurn();
  }

  /** A fresh board (the practice turn gets one, then the real game gets another). */
  private dealBoard() {
    const rt = this.rt;
    this.lives = this.rules.lives;
    this.turnsUsed = 0;
    this.giverIndex = 0;
    this.streak = 0;
    this.flash = null;
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
    this.boardSeq++;
    this.cards = rt.rng.shuffle(picked).map((m, i) => ({ id: `b${this.boardSeq}c${i}`, member: m, card: memberCard(m)!, state: "hidden", targetOf: null, bomb: false }));
    const [a, b] = this.players;
    // Targets in linked pairs where possible (so a clue can cover them).
    const order = this.targetOrder();
    const t = this.rules.targets;
    order.slice(0, t).forEach((c) => (c.targetOf = a?.playerId ?? null));
    order.slice(t, t * 2).forEach((c) => (c.targetOf = b?.playerId ?? a?.playerId ?? null));
    order.slice(t * 2, t * 2 + this.rules.bombs).forEach((c) => (c.bomb = true));
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

  /**
   * Clue chips for a turn, in alphabetical order: links that touch your hidden targets, mixed with
   * decoys that touch bombs and other cards. Working out which one is safe is the game.
   */
  private dealClues(p: RuntimePlayer): Link[] {
    const board = new Set(this.cards.map((c) => c.card.pt.replace(/^(o|a) /, "").toLowerCase()));
    const hidden = this.cards.filter((c) => c.state === "hidden");
    const mine = hidden.filter((c) => c.targetOf === p.playerId).map((c) => c.member);
    const others = hidden.filter((c) => c.targetOf !== p.playerId).map((c) => c.member);
    const avail = LINKS.filter((l) => !board.has(l.pt.toLowerCase()) && (this.rules.categories || !CATEGORY_LINKS.has(l.pt)));
    // Clues that cover two of your pictures first — but only a few of them make the menu.
    const covers = (l: Link) => l.members.filter((m) => mine.includes(m)).length;
    const useful = this.rt.rng.shuffle(avail.filter((l) => covers(l) > 0)).sort((a, b) => Math.min(2, covers(b)) - Math.min(2, covers(a)));
    const decoys = this.rt.rng.shuffle(avail.filter((l) => !useful.includes(l) && l.members.some((m) => others.includes(m))));
    const filler = this.rt.rng.shuffle(avail.filter((l) => !useful.includes(l) && !decoys.includes(l)));
    const n = Math.min(useful.length, this.rules.useful);
    return [...useful.slice(0, n), ...decoys, ...filler].slice(0, CLUE_CHIPS).sort((x, y) => x.pt.localeCompare(y.pt, "pt"));
  }

  clueWords(p: RuntimePlayer): Link[] {
    return p === this.giver && this.turnClues.length ? this.turnClues : this.dealClues(p);
  }

  /** Best clue among the chips (for bots/tests): most targets, no bombs. */
  private bestClue(p: RuntimePlayer): Link | undefined {
    const hidden = this.cards.filter((c) => c.state === "hidden");
    const score = (l: Link) =>
      hidden.filter((c) => c.targetOf === p.playerId && l.members.includes(c.member)).length * 2 - hidden.filter((c) => c.bomb && l.members.includes(c.member)).length * 5;
    return [...this.clueWords(p)].sort((a, b) => score(b) - score(a))[0];
  }

  private newTurn() {
    this.phase = "clue";
    this.turnClues = this.giver ? this.dealClues(this.giver) : [];
    this.phaseEnd = gameNow() + (this.inPractice ? 600_000 : this.rules.clueMs);
    this.clueCount = 0;
    this.clueWord = null;
    this.giverBet = null;
    this.turnFinds = 0;
    this.turnOver = false;
    this.guessesLeft = 0;
    this.promptId = randomId(6);
    play("whoosh");
    if (this.giver) this.rt.cue(CUE.pickClue, this.giver, NAMED.giveClue);
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
    if (value.mode === "skip" && this.inPractice) {
      this.practice = false;
      this.dealBoard();
      return this.newTurn();
    }
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
      if (this.guesser) this.rt.cue(CUE.tap, this.guesser, NAMED.guessIt);
      this.rt.refreshViews();
      this.rt.bump();
      return;
    }
    if (this.phase === "sudden" && act.a === "tap") return this.suddenTap(p, act.cardId);
    if (act.a === "bet" && this.phase === "guess" && p === this.giver && this.giverBet === null) {
      this.giverBet = Math.min(act.n, this.clueCount + 1);
      play("lock");
      this.rt.view(p, this.viewFor(p));
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
    if (c.bomb && this.inPractice) {
      // Practice: show what a bomb does, then put it back.
      c.state = "boom";
      this.flash = { id: c.id, kind: "boom", seq: ++this.flashSeq };
      play("boom");
      this.rt.petDo("hide", 2800);
      this.rt.say(SAY.bomb, { interrupt: true });
      setTimeout(() => {
        if (c.state === "boom") c.state = "hidden";
        this.rt.bump();
      }, 1800);
      return this.endTurn();
    }
    if (c.bomb) {
      c.state = "boom";
      this.lives--;
      this.flash = { id: c.id, kind: "boom", seq: ++this.flashSeq };
      play("boom");
      this.rt.petDo("hide", 2800);
      this.rt.say(SAY.bomb, { interrupt: true });
      this.rt.emote(p.playerId, "sad", 2500);
      this.rt.emote(giver.playerId, "sad", 2500);
      if (this.lives <= 0 || this.rules.bombEnds) return this.finish(false);
      return this.endTurn();
    }
    if (c.targetOf) {
      c.state = "found";
      this.turnFinds++;
      if (!this.inPractice) {
        this.credit(p, 2);
        this.credit(giver, 1);
      }
      this.flash = { id: c.id, kind: "found", seq: ++this.flashSeq };
      this.rt.evidence(p, c.card.itemId, "secret.guess", "correct");
      if (!this.inPractice) {
        this.rt.addScore(p, 50, "secret");
        this.rt.addScore(giver, 50, "secret");
      }
      // Each find in a row climbs a note.
      play("correct", 1, 1 + this.streak * 0.06);
      this.streak++;
      this.rt.emote(p.playerId, "cheer");
      this.rt.emote(giver.playerId, "cheer");
      if (this.found >= this.goal) {
        // The winning tap still used this turn.
        this.turnsUsed++;
        return this.finish(true);
      }
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

  private suddenTap(p: RuntimePlayer, cardId: string) {
    const c = this.cards.find((x) => x.id === cardId);
    const partner = this.rt.partnerOf(p);
    if (!c || c.state !== "hidden" || !partner) return;
    this.rt.speakPt(c.card.say);
    if (c.targetOf === partner.playerId) {
      c.state = "found";
      this.flash = { id: c.id, kind: "found", seq: ++this.flashSeq };
      this.rt.evidence(p, c.card.itemId, "secret.guess", "correct");
      play("correct", 1, 1 + this.streak++ * 0.06);
      this.rt.emote(p.playerId, "cheer");
      this.rt.addScore(p, 50, "secret");
      this.credit(p, 2);
      if (this.found >= this.goal) return this.finish(true);
      this.rt.refreshViews();
      this.rt.bump();
      return;
    }
    c.state = c.bomb ? "boom" : "neutral";
    this.flash = { id: c.id, kind: c.bomb ? "boom" : "neutral", seq: ++this.flashSeq };
    play(c.bomb ? "boom" : "buzzer");
    this.rt.say(c.bomb ? SAY.bomb : SAY.ohNo, { interrupt: true });
    return this.finish(false);
  }

  private endTurn() {
    if (this.practice) {
      // Practice is over: nothing from it counts — a new board, all turns and lives.
      this.practice = false;
      this.rt.say(SAY.start);
      setTimeout(() => {
        if (this.rt.activity !== this || this.phase === "end") return;
        this.dealBoard();
        this.newTurn();
      }, 1400);
      return;
    }
    this.turnsUsed++;
    // The turn is over on every phone too (no taps on a finished turn).
    this.promptId = randomId(6);
    this.turnOver = true;
    this.rt.refreshViews();
    let pause = 900;
    const giver = this.giver;
    if (this.giverBet !== null && giver) {
      const won = this.giverBet === this.turnFinds;
      if (won) {
        this.betsWon++;
        this.credit(giver, 2);
      }
      this.lastBet = { n: this.giverBet, won };
      // The bet gets its own beat on the TV before the next turn.
      this.rt.showBet(
        { pt: `${giver.name} apostou ${this.giverBet}`, en: `${giver.name} bet ${this.giverBet} — found ${this.turnFinds}` },
        [{ playerId: giver.playerId, pt: won ? `Certo! +${BET_BONUS}` : `Encontraram ${this.turnFinds}`, en: won ? "Spot on!" : `Found ${this.turnFinds}`, won, pts: won ? BET_BONUS : undefined }],
        { delay: 500, line: won ? SAY.betWon : SAY.betLost, ms: 2400 },
      );
      pause = 2900;
    } else this.lastBet = null;
    if (this.found >= this.goal) return this.finish(true);
    if (this.turnsLeft <= 0) {
      if (this.rules.bombEnds) return this.finish(false);
      // Let the bet card have its beat before sudden death takes the stage.
      if (pause > 900) {
        // Stale taps during the bet card are ignored.
        this.promptId = randomId(6);
        this.rt.refreshViews();
        setTimeout(() => this.rt.activity === this && this.phase !== "end" && this.toSuddenDeath(), pause);
        return;
      }
      return this.toSuddenDeath();
    }
    this.giverIndex++;
    // If the new giver has nothing left for the partner to find, skip to the other.
    const g = this.giver;
    if (g && !this.cards.some((c) => c.targetOf === g.playerId && c.state === "hidden")) this.giverIndex++;
    this.phase = "clue";
    this.phaseEnd = gameNow() + pause + this.rules.clueMs;
    setTimeout(() => this.rt.activity === this && this.phase !== "end" && this.newTurn(), pause);
    this.rt.bump();
  }

  private credit(p: RuntimePlayer, n: number) {
    this.contrib.set(p.playerId, (this.contrib.get(p.playerId) ?? 0) + n);
  }

  /** Out of turns: no more clues. Both of you keep tapping your partner's pictures — one miss and it's over. */
  private toSuddenDeath() {
    this.phase = "sudden";
    this.promptId = randomId(6);
    setHurry(true);
    play("heartbeat");
    this.heartbeat = setInterval(() => this.rt.activity === this && this.phase === "sudden" && !this.rt.paused && play("heartbeat", 0.7), 1400);
    this.rt.say(SAY.suddenDeath, { interrupt: true });
    this.rt.refreshViews();
    this.rt.bump();
  }

  stop() {
    if (this.heartbeat) clearInterval(this.heartbeat);
  }

  private finish(won: boolean) {
    if (this.heartbeat) clearInterval(this.heartbeat);
    setHurry(false);
    if (this.ended) return;
    this.ended = true;
    this.phase = "end";
    for (const c of this.cards) if (c.state === "hidden" && (c.targetOf || c.bomb)) c.state = c.bomb ? "boom" : "neutral";
    play(won ? "fanfare" : "sad-trombone");
    if (won) this.rt.celebrate();
    this.rt.petStar(won ? "cheer" : "oops", 2600);
    this.rt.bump();
    // Score: every pair found, plus a bonus for each turn to spare when you win.
    const spare = won ? this.turnsLeft : 0;
    const score = this.found * 10 + spare * 5 + (won ? 20 : 0) + this.betsWon * BET_BONUS;
    // A great game: every pair, a turn or two to spare and a couple of bets called.
    const max = this.goal * 10 + 20 + 5 * Math.max(1, this.rules.turns - Math.ceil(this.goal / 2)) + 2 * BET_BONUS;
    setTimeout(
      () =>
        this.onDone({
          failed: !won,
          score,
          max,
          headline: won ? `Conseguiram! ${this.found}/${this.goal} em ${this.turnsUsed} turno${this.turnsUsed === 1 ? "" : "s"}` : `${this.found} de ${this.goal} pares`,
          headlineEn: won ? `You did it — ${this.turnsUsed} turns used` : `${this.found} of ${this.goal} found`,
          sub: won ? (spare ? `${spare} turno${spare === 1 ? "" : "s"} de sobra: +${spare * 5}` : "Mesmo à justa — no último turno!") : this.lives <= 0 ? "A bomba ganhou desta vez." : "Acabaram-se os turnos.",
          subEn: won ? (spare ? "Bonus for turns to spare" : "Just in time — on the last turn!") : this.lives <= 0 ? "The bomb got you this time." : "Out of turns.",
          words: this.cards.filter((c) => c.state === "found").map((c) => ({ pt: c.card.pt, en: c.card.en, pic: c.card.emoji })),
          contrib: Object.fromEntries(this.contrib),
          highlight: won ? { pt: `Todos os pares em ${this.turnsUsed} turno${this.turnsUsed === 1 ? "" : "s"}!`, en: `Every pair in ${this.turnsUsed} turns`, pic: "🕵️" } : undefined,
        }),
      2600,
    );
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Pares Secretos precisa de 2", subtitle: "Chama o teu par! · Needs two players", pic: "🤝" };
    if (this.phase === "end") return { mode: "wait", title: this.found >= this.goal ? "Conseguiram!" : "Fim do jogo", subtitle: `${this.found}/${this.goal} pares · pairs found`, pic: this.found >= this.goal ? "🏆" : "💣" };
    const sudden = this.phase === "sudden";
    if (this.turnOver && !sudden)
      return {
        mode: "wait",
        title: `Fim do turno · ${this.turnFinds} encontrad${this.turnFinds === 1 ? "o" : "os"}`,
        subtitle: `End of the turn — ${this.found}/${this.goal} found. Olha para a TV!`,
        pic: this.turnFinds ? "✅" : "⏭️",
      };
    const isGiver = p === this.giver && !sudden;
    const role = sudden ? "guess" : this.phase === "clue" ? (isGiver ? "clue" : "watch") : p === this.guesser ? "guess" : "watch";
    const partner = this.rt.partnerOf(p)?.name ?? "";
    // The giver sees their own key (which cards their partner must find, and the bombs); in sudden death everyone does.
    const showKey = isGiver || sudden;
    const cards: SecretCard[] = this.cards.map((c) => ({
      id: c.id,
      word: { pt: c.card.pt, en: isGiver ? c.card.en : undefined, pic: c.card.emoji },
      state: c.state,
      key: showKey ? (c.bomb ? "bomb" : c.targetOf === p.playerId ? "target" : "neutral") : undefined,
    }));
    const firstHiddenTarget = this.cards.find((c) => c.state === "hidden" && c.targetOf === this.giver?.playerId);
    const toWord = (l: Link): Word => ({ pt: l.pt, en: l.en, pic: l.pic });
    const bestClue = isGiver && this.phase === "clue" ? this.bestClue(p) : undefined;
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
      msLeft: this.phase === "clue" && !this.inPractice ? this.msLeft : undefined,
      found: this.found,
      goal: this.goal,
      sudden: sudden || undefined,
      bet: p === this.giver && this.phase === "guess" ? (this.giverBet ?? undefined) : undefined,
      practice: this.inPractice || undefined,
      debugAnswer: this.rt.testMode
        ? {
            cardId: sudden
              ? this.cards.find((c) => c.state === "hidden" && c.targetOf === this.rt.partnerOf(p)?.playerId)?.id
              : this.phase === "guess" ? this.cards.find((c) => c.state === "hidden" && c.targetOf === this.giver?.playerId && this.clueWord?.members.includes(c.member))?.id ?? firstHiddenTarget?.id : firstHiddenTarget?.id,
            clueWord: bestClue?.pt,
            targets: bestClue ? Math.max(1, bestClue.members.filter((m) => this.cards.some((c) => c.member === m && c.targetOf === p.playerId && c.state === "hidden")).length) : 1,
          }
        : undefined,
    };
  }
}
