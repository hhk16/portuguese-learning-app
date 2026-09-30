/**
 * Stop! — the classic "Stop" / Adedonha, for two.
 *
 * A letter and four categories. Each phone writes one word per category starting with that
 * letter; whoever fills them all first shouts STOP and the other gets a few seconds more.
 * Words the dictionary knows count straight away; anything else, your partner votes on (so the
 * Portuguese you know from outside the book counts too). Different valid word: 10 points; the
 * same word as your partner: 5. After each round the TV shows words you could have written.
 */
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import { CATEGORIES, examples, fairLetters, lookup, normStop, startsWith, type DictWord, type StopCategory } from "./dictionary.ts";

export const ROUNDS = 3;
export const WRITE_MS = 90_000;
export const HURRY_MS = 8_000;
const LOCK_MS = 900;
const VOTE_MS = 25_000;
const SCORE_MS = 9_000;
const PER_ROUND = 4;

export type CellStatus = "empty" | "letter" | "known" | "voted-yes" | "voted-no" | "pending";

export interface Cell {
  word: string;
  status: CellStatus;
  dict?: DictWord;
  points: number;
}

export interface StopResult {
  scores: { playerId: string; name: string; points: number }[];
  words: string[];
}

export function cellPoints(mine: Cell, theirs: Cell | undefined): number {
  const valid = (c: Cell | undefined) => !!c && (c.status === "known" || c.status === "voted-yes");
  if (!valid(mine)) return 0;
  if (valid(theirs) && normStop(theirs!.word) === normStop(mine.word)) return 5;
  return 10;
}

export class Stop implements Activity {
  readonly id = "stop";
  readonly pausable = true;
  rt!: TvRuntime;
  round = 0;
  phase: "write" | "hurry" | "lock" | "vote" | "score" | "end" = "write";
  phaseEnd = 0;
  letter = "A";
  categories: StopCategory[] = [];
  stoppedBy: RuntimePlayer | null = null;
  /** playerId → category id → typed word. */
  answers = new Map<string, Record<string, string>>();
  /** playerId → category id → judged cell (after the round). */
  cells = new Map<string, Record<string, Cell>>();
  voted = new Set<string>();
  totals = new Map<string, number>();
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private letters: string[] = [];
  private words = new Set<string>();
  private readonly onDone: (r: StopResult) => void;

  constructor(onDone: (r: StopResult) => void) {
    this.onDone = onDone;
  }

  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    const fair = fairLetters(
      CATEGORIES.map((c) => c.id),
      4,
    );
    this.letters = rt.rng.sample(fair, ROUNDS);
    for (const p of this.players) this.totals.set(p.playerId, 0);
    this.newRound();
  }

  private newRound() {
    this.letter = this.letters[this.round % this.letters.length] ?? "P";
    // Four categories, preferring ones where this letter has known words.
    const cover = CATEGORIES.filter((c) => examples(c.id, this.letter).length > 0);
    const rest = CATEGORIES.filter((c) => !cover.includes(c));
    this.categories = [...this.rt.rng.shuffle(cover), ...rest].slice(0, PER_ROUND);
    this.answers.clear();
    this.cells.clear();
    this.voted.clear();
    this.stoppedBy = null;
    this.phase = "write";
    this.phaseEnd = gameNow() + WRITE_MS;
    this.promptId = randomId(6);
    play("whoosh");
    this.rt.speakPt(`Letra ${this.letter}!`);
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick(now: number) {
    if ((this.phase === "write" || this.phase === "hurry") && now >= this.phaseEnd) {
      // Short grace so the last keystrokes arrive.
      this.phase = "lock";
      this.phaseEnd = now + LOCK_MS;
      this.rt.refreshViews();
      this.rt.bump();
    } else if (this.phase === "lock" && now >= this.phaseEnd) this.judge();
    else if (this.phase === "vote" && now >= this.phaseEnd) this.score();
    else if (this.phase === "score" && now >= this.phaseEnd) {
      this.round++;
      if (this.round >= ROUNDS) return this.finish();
      this.newRound();
    }
  }

  repeat() {
    this.rt.speakPt(`Letra ${this.letter}!`);
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode !== "stop" || promptId !== this.promptId) return;
    const act = value.action;
    if (act.a === "save" && (this.phase === "write" || this.phase === "hurry" || this.phase === "lock")) {
      const clean: Record<string, string> = {};
      for (const c of this.categories) clean[c.id] = (act.answers[c.id] ?? "").trim().slice(0, 40);
      this.answers.set(p.playerId, clean);
      const full = this.categories.every((c) => clean[c.id]);
      if (act.stop && full && this.phase === "write") {
        this.stoppedBy = p;
        this.phase = "hurry";
        this.phaseEnd = gameNow() + HURRY_MS;
        play("countdown-go");
        this.rt.emote(p.playerId, "cheer", 2000);
        for (const o of this.players) if (o !== p) this.rt.emote(o.playerId, "sad", 1500);
        this.rt.refreshViews();
      }
      this.rt.bump();
      return;
    }
    if (act.a === "vote" && this.phase === "vote" && !this.voted.has(p.playerId)) {
      const partner = this.rt.partnerOf(p);
      if (partner) {
        const cells = this.cells.get(partner.playerId) ?? {};
        for (const [cat, cell] of Object.entries(cells)) if (cell.status === "pending") cell.status = act.ok[`${partner.playerId}:${cat}`] === false ? "voted-no" : "voted-yes";
      }
      this.voted.add(p.playerId);
      play("lock");
      if (this.players.every((x) => this.voted.has(x.playerId))) return this.score();
      this.rt.refreshViews();
      this.rt.bump();
    }
  }

  private judge() {
    for (const p of this.players) {
      const a = this.answers.get(p.playerId) ?? {};
      const row: Record<string, Cell> = {};
      for (const c of this.categories) {
        const word = a[c.id] ?? "";
        const dict = word ? lookup(c.id, word) : undefined;
        const status: CellStatus = !word ? "empty" : !startsWith(word, this.letter) ? "letter" : dict ? "known" : "pending";
        row[c.id] = { word, status, dict, points: 0 };
        if (dict) {
          this.rt.evidence(p, dict.itemId, "stop.produce", "correct", 2);
          this.words.add(dict.pt);
        }
      }
      this.cells.set(p.playerId, row);
    }
    // Players with nothing to vote on are done already.
    for (const p of this.players) {
      const partner = this.rt.partnerOf(p);
      const pending = partner ? Object.values(this.cells.get(partner.playerId) ?? {}).some((c) => c.status === "pending") : false;
      if (!pending) this.voted.add(p.playerId);
    }
    if (this.players.every((x) => this.voted.has(x.playerId))) return this.score();
    this.phase = "vote";
    this.phaseEnd = gameNow() + VOTE_MS;
    this.promptId = randomId(6);
    play("reveal");
    this.rt.refreshViews();
    this.rt.bump();
  }

  private score() {
    // Unanswered votes count as accepted: be generous with each other.
    for (const row of this.cells.values()) for (const c of Object.values(row)) if (c.status === "pending") c.status = "voted-yes";
    const [a, b] = this.players;
    for (const p of this.players) {
      const other = p === a ? b : a;
      const row = this.cells.get(p.playerId) ?? {};
      let sum = 0;
      for (const c of this.categories) {
        const cell = row[c.id];
        if (!cell) continue;
        cell.points = cellPoints(cell, other ? this.cells.get(other.playerId)?.[c.id] : undefined);
        sum += cell.points;
        if (cell.status === "voted-yes") this.words.add(cell.word);
      }
      this.totals.set(p.playerId, (this.totals.get(p.playerId) ?? 0) + sum);
      this.rt.addScore(p, sum * 10, "stop");
    }
    const sums = this.players.map((p) => Object.values(this.cells.get(p.playerId) ?? {}).reduce((s, c) => s + c.points, 0));
    const best = Math.max(...sums);
    this.players.forEach((p, i) => this.rt.emote(p.playerId, sums[i] === best && best > 0 ? "cheer" : "think", 3000));
    this.phase = "score";
    this.phaseEnd = gameNow() + SCORE_MS;
    play("star");
    this.rt.refreshViews();
    this.rt.bump();
  }

  private finish() {
    this.phase = "end";
    const scores = this.players.map((p) => ({ playerId: p.playerId, name: p.name, points: this.totals.get(p.playerId) ?? 0 }));
    play("success-jingle");
    this.rt.celebrate();
    this.rt.bump();
    this.onDone({ scores, words: [...this.words] });
  }

  /** Round score so far for a player (TV table). */
  roundPoints(p: RuntimePlayer): number {
    return Object.values(this.cells.get(p.playerId) ?? {}).reduce((s, c) => s + c.points, 0);
  }

  /** Known words for a category, for the "podiam ter escrito" hints. */
  hints(catId: string): DictWord[] {
    return examples(catId, this.letter).slice(0, 3);
  }

  filled(p: RuntimePlayer): number {
    const a = this.answers.get(p.playerId) ?? {};
    return this.categories.filter((c) => a[c.id]).length;
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Stop! precisa de 2", subtitle: "Chama o teu par para jogar!", pic: "⏱️" };
    if (this.phase === "end") return { mode: "wait", title: "Fim!", subtitle: `${this.totals.get(p.playerId) ?? 0} pontos`, pic: "🏁" };
    if (this.phase === "score") return { mode: "wait", title: `+${this.roundPoints(p)} pontos`, subtitle: "Olha para a TV!", pic: "📋" };
    const base = {
      mode: "stop" as const,
      roundId: this.roundId,
      promptId: this.promptId,
      letter: this.letter,
      categories: this.categories.map((c) => ({ id: c.id, label: c.label, pic: c.pic })),
      msLeft: this.msLeft,
    };
    if (this.phase === "vote") {
      const partner = this.rt.partnerOf(p);
      const cells = partner ? (this.cells.get(partner.playerId) ?? {}) : {};
      const votes = Object.entries(cells)
        .filter(([, c]) => c.status === "pending")
        .map(([cat, c]) => ({ id: `${partner!.playerId}:${cat}`, category: CATEGORIES.find((x) => x.id === cat)?.label ?? cat, word: c.word }));
      return { ...base, phase: "vote", votes, voted: this.voted.has(p.playerId) };
    }
    const debug = this.rt.testMode
      ? Object.fromEntries(this.categories.map((c) => [c.id, examples(c.id, this.letter)[this.players.indexOf(p) % 2]?.pt ?? examples(c.id, this.letter)[0]?.pt ?? `${this.letter.toLowerCase()}xyz`]))
      : undefined;
    return {
      ...base,
      phase: this.phase === "lock" ? "hurry" : this.phase,
      stoppedBy: this.stoppedBy ? this.stoppedBy.name : undefined,
      msLeft: this.phase === "lock" ? 0 : this.msLeft,
      debugAnswer: debug,
    };
  }
}
