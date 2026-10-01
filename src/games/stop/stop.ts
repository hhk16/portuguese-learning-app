/**
 * Stop! — the classic "Stop" / Adedonha, for two.
 *
 * A letter and four categories (five on hard). Each phone writes one word per category starting
 * with that letter; whoever fills them all first shouts STOP (+5) and the other gets a few seconds.
 * Dictionary words count straight away (a small spelling slip counts too, with the correction
 * shown); anything else the partner must vote YES on — silence means no. Unique word 10, the same
 * word as your partner 5, a voted-in word 7, a word written with 💡 help counts half. The last
 * letter is worth double; a tie brings a sudden-death letter.
 */
import { REFERENCE } from "./reference.ts";
import { GLOSS, NOT_FOR_SUGGESTIONS } from "./reference-gloss.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { setHurry } from "../../audio/music.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import type { GameOutcome } from "../../tv/activities.ts";
import { CUE, NAMED, SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";
import { CATEGORIES, examples, fairLetters, lookup, nearMiss, normStop, startsWith, type DictWord, type StopCategory } from "./dictionary.ts";

export const ROUNDS = 3;
export const HURRY_MS = 8_000;
const LOCK_MS = 900;
const VOTE_MS = 25_000;
const SCORE_MS = 9_000;
export const STOP_BONUS = 5;
/** Difficulty: categories per letter and seconds to write. */
export const LEVEL_RULES: Record<Level, { cats: number; writeMs: number }> = {
  1: { cats: 4, writeMs: 70_000 },
  2: { cats: 4, writeMs: 55_000 },
  3: { cats: 5, writeMs: 50_000 },
};

const CAT_EN: Record<string, string> = { comida: "Food or drink", animal: "Animal", coisa: "Thing", profissao: "Job", pais: "Country or nationality", lugar: "Place or nature" };

export type CellStatus = "empty" | "letter" | "known" | "spelling" | "voted-yes" | "voted-no" | "pending";

export interface Cell {
  word: string;
  status: CellStatus;
  dict?: DictWord;
  /** Written after asking for 💡 help (counts half). */
  helped?: boolean;
  points: number;
}

const VALID: CellStatus[] = ["known", "spelling", "voted-yes"];

/** Points for one cell, before the final-round double. */
export function cellPoints(mine: Cell, theirs: Cell | undefined): number {
  const valid = (c: Cell | undefined) => !!c && VALID.includes(c.status);
  if (!valid(mine)) return 0;
  const key = (c: Cell) => (c.dict ? c.dict.itemId : normStop(c.word));
  // Known word 10, word the partner accepted 7, a near-miss spelling 5; the same word as your partner 5.
  let pts = valid(theirs) && key(theirs!) === key(mine) ? 5 : mine.status === "known" ? 10 : mine.status === "spelling" ? 5 : 7;
  if (mine.helped) pts = Math.ceil(pts / 2);
  return pts;
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
  /** Who actually got the STOP bonus this letter (every word held up). */
  stopBonusTo: RuntimePlayer | null = null;
  /** playerId → category id → typed word. */
  answers = new Map<string, Record<string, string>>();
  /** playerId → category id → judged cell (after the round). */
  cells = new Map<string, Record<string, Cell>>();
  voted = new Set<string>();
  totals = new Map<string, number>();
  /** Points each player got this round (after doubles and bonuses). */
  roundTotals = new Map<string, number>();
  /** playerId → category ids they asked 💡 help for → the hint shown. */
  help = new Map<string, Record<string, string>>();
  level: Level = 1;
  suddenDeath = false;
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private letters: string[] = [];
  private words = new Map<string, { pt: string; pic?: string }>();
  private readonly onDone: (r: GameOutcome) => void;

  constructor(onDone: (r: GameOutcome) => void) {
    this.onDone = onDone;
  }

  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }
  get rules() {
    return LEVEL_RULES[this.level];
  }
  /** The last regular letter (and sudden death) count double. */
  get double() {
    return this.round === ROUNDS - 1 || this.suddenDeath;
  }
  /** First plays: letter -1 is a short unscored practice ("Ensaio") with two categories. */
  practice = false;
  get inPractice() {
    return this.round < 0;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    const fair = fairLetters(
      CATEGORIES.map((c) => c.id),
      4,
    );
    this.letters = rt.rng.sample(fair, ROUNDS + 2);
    for (const p of this.players) this.totals.set(p.playerId, 0);
    if (this.practice) this.round = -1;
    this.newRound();
  }

  private newRound() {
    // Letters: [0..ROUNDS-1] the game, [ROUNDS] sudden death, [ROUNDS+1] the practice letter.
    this.letter = this.letters[this.inPractice ? ROUNDS + 1 : this.round % this.letters.length] ?? "P";
    // Categories, preferring ones where this letter has known words.
    const cover = CATEGORIES.filter((c) => examples(c.id, this.letter).length > 0);
    const rest = CATEGORIES.filter((c) => !cover.includes(c));
    // The final letter adds a category: a twist, not just double points.
    this.categories = [...this.rt.rng.shuffle(cover), ...rest].slice(0, this.inPractice ? 2 : this.rules.cats + (this.double ? 1 : 0));
    this.answers.clear();
    this.cells.clear();
    this.voted.clear();
    this.help.clear();
    this.roundTotals.clear();
    this.stoppedBy = null;
    this.stopBonusTo = null;
    this.phase = "write";
    // Each letter gives a little less time (−12%, then −24%): the game speeds up.
    this.phaseEnd = gameNow() + (this.inPractice ? 45_000 : this.rules.writeMs * (1 - 0.12 * Math.min(this.round, 2)));
    this.promptId = randomId(6);
    play("whoosh");
    if (this.double && !this.suddenDeath) this.rt.say(SAY.finalRound);
    this.rt.speakPt(`Letra ${this.letter}!`);
    this.rt.cue(CUE.fill);
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick(now: number) {
    setHurry(this.phase === "hurry" || (this.phase === "write" && this.phaseEnd - now < 15_000));
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
      if (this.round >= ROUNDS) {
        const [a, b] = this.players.map((p) => this.totals.get(p.playerId) ?? 0);
        // Tie after the last letter: one sudden-death letter (once).
        if (a === b && !this.suddenDeath && a! > 0) {
          this.suddenDeath = true;
          this.rt.say(SAY.tie, { interrupt: true });
          play("heartbeat");
          return this.newRound();
        }
        return this.finish();
      }
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
    if (value.mode === "skip" && this.inPractice && (this.phase === "write" || this.phase === "hurry")) {
      this.round = 0;
      return this.newRound();
    }
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
        play("buzzer");
        this.rt.say(SAY.stop, { interrupt: true });
        this.rt.emote(p.playerId, "cheer", 2000);
        for (const o of this.players) if (o !== p) this.rt.emote(o.playerId, "sad", 1500);
        this.rt.refreshViews();
      }
      this.rt.bump();
      return;
    }
    if (act.a === "help" && (this.phase === "write" || this.phase === "hurry")) {
      const cat = this.categories.find((c) => c.id === act.cat);
      const mine = this.help.get(p.playerId) ?? {};
      if (!cat || mine[cat.id]) return;
      // The start of a real word: enough to jog the memory, not the whole answer.
      const ex = this.rt.rng.pick(examples(cat.id, this.letter).length ? examples(cat.id, this.letter) : [{ pt: this.letter.toLowerCase() } as DictWord]);
      const w = ex.pt;
      mine[cat.id] = w.length <= 3 ? `${w.slice(0, 1)}…` : `${w.slice(0, Math.ceil(w.length / 2))}…`;
      this.help.set(p.playerId, mine);
      play("sparkle");
      this.rt.refreshViews();
      this.rt.bump();
      return;
    }
    if (act.a === "vote" && this.phase === "vote" && !this.voted.has(p.playerId)) {
      const partner = this.rt.partnerOf(p);
      if (partner) {
        const cells = this.cells.get(partner.playerId) ?? {};
        // Only an explicit YES lets an unknown word in.
        for (const [cat, cell] of Object.entries(cells)) if (cell.status === "pending") cell.status = act.ok[`${partner.playerId}:${cat}`] === true ? "voted-yes" : "voted-no";
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
        const exact = word ? lookup(c.id, word) : undefined;
        const near = word && !exact ? nearMiss(c.id, word) : undefined;
        const dict = exact ?? near;
        const status: CellStatus = !word ? "empty" : !startsWith(word, this.letter) ? "letter" : exact ? "known" : near ? "spelling" : "pending";
        row[c.id] = { word, status, dict, helped: !!this.help.get(p.playerId)?.[c.id], points: 0 };
        if (dict && status !== "letter") {
          this.rt.evidence(p, dict.itemId, "stop.produce", exact ? "correct" : "accent-slip", 2);
          this.words.set(dict.itemId, { pt: dict.pt, pic: dict.pic });
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
    this.rt.holdPhones(2200);
    // Nobody said yes: an unknown word doesn't count.
    for (const row of this.cells.values()) for (const c of Object.values(row)) if (c.status === "pending") c.status = "voted-no";
    const [a, b] = this.players;
    for (const p of this.players) {
      const other = p === a ? b : a;
      const row = this.cells.get(p.playerId) ?? {};
      let sum = 0;
      for (const c of this.categories) {
        const cell = row[c.id];
        if (!cell) continue;
        cell.points = cellPoints(cell, other ? this.cells.get(other.playerId)?.[c.id] : undefined) * (this.double ? 2 : 1);
        sum += cell.points;
        if (cell.status === "voted-yes") this.words.set(normStop(cell.word), { pt: cell.word });
      }
      // Shouting STOP pays — only if every word holds up.
      const good = this.categories.filter((c) => (row[c.id]?.points ?? 0) > 0).length;
      if (this.stoppedBy === p && good === this.categories.length) {
        sum += STOP_BONUS;
        this.stopBonusTo = p;
      }
      this.roundTotals.set(p.playerId, sum);
      if (!this.inPractice) {
        this.totals.set(p.playerId, (this.totals.get(p.playerId) ?? 0) + sum);
        this.rt.addScore(p, sum * 10, "stop");
      }
    }
    const sums = this.players.map((p) => this.roundTotals.get(p.playerId) ?? 0);
    const best = Math.max(...sums);
    this.players.forEach((p, i) => this.rt.emote(p.playerId, sums[i] === best && best > 0 ? "cheer" : "think", 3000));
    this.phase = "score";
    this.phaseEnd = gameNow() + SCORE_MS;
    play(best > 0 ? "crowd-cheer" : "sad-trombone", 0.7);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private finish() {
    this.phase = "end";
    setHurry(false);
    const scores = this.players.map((p) => ({ name: p.name, points: this.totals.get(p.playerId) ?? 0 })).sort((x, y) => y.points - x.points);
    const [a, b] = scores;
    const tie = !!b && a!.points === b.points;
    play("fanfare");
    this.rt.celebrate();
    const winner = this.players.find((p) => p.name === a?.name);
    if (!tie && winner) {
      this.rt.say(NAMED.wins, { name: winner.name });
      this.rt.say(SAY.revenge);
    }
    this.rt.bump();
    // Records and stars count the couple's total; the headline is the rivalry.
    const total = scores.reduce((s, x) => s + x.points, 0);
    const perfect = 2 * this.rules.cats * 10 * (ROUNDS + 1);
    this.onDone({
      score: total,
      max: Math.round(perfect * 0.75),
      headline: tie ? `Empate! ${a!.points}–${b!.points}` : `${a!.name} ganha! ${a!.points}–${b?.points ?? 0}`,
      headlineEn: tie ? "It's a tie!" : `${a!.name} wins!`,
      sub: `Os dois juntos: ${total} pontos`,
      subEn: `Together: ${total} points`,
      // Newest first, so the last letter's words make the recap.
      words: [...this.words.values()].reverse(),
      // Each player's share for the night: a strong solo game is worth 100.
      perPlayer: Object.fromEntries(this.players.map((p) => [p.playerId, Math.round(Math.min(100, ((this.totals.get(p.playerId) ?? 0) / (perfect * 0.375)) * 100))])),
      highlight: tie ? undefined : { pt: `${a!.name} ganhou o Stop! ${a!.points}–${b?.points ?? 0}`, en: `${a!.name} won Stop!`, pic: "⏱️" },
    });
  }

  /** Round score for a player (TV table). */
  roundPoints(p: RuntimePlayer): number {
    return this.roundTotals.get(p.playerId) ?? 0;
  }

  /** Other words you could have written (from the reference list), never ones you did write. */
  hints(catId: string): { pt: string; en?: string }[] {
    const key = `${this.round}:${catId}`;
    const cached = this.hintCache.get(key);
    if (cached) return cached;
    const typed = new Set(this.players.map((p) => normStop(this.answers.get(p.playerId)?.[catId] ?? "")));
    const ref = (REFERENCE as Record<string, string[]>)[catId] ?? [];
    // A1–A2 words only, each with its English (the curriculum words first).
    const curriculum = examples(catId, this.letter);
    const pool = [...new Set([...curriculum.map((d) => d.pt), ...ref.filter((w) => !NOT_FOR_SUGGESTIONS.has(w))])].filter((w) => startsWith(w, this.letter) && !typed.has(normStop(w)));
    const enOf = (w: string) => GLOSS[w] ?? curriculum.find((d) => d.pt === w)?.en;
    const out = this.rt.rng.sample(pool, Math.min(3, pool.length)).map((pt) => ({ pt, en: enOf(pt) }));
    if (this.phase === "score") this.hintCache.set(key, out);
    return out;
  }
  private hintCache = new Map<string, { pt: string; en?: string }[]>();

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
      categories: this.categories.map((c) => ({ id: c.id, label: c.label, en: CAT_EN[c.id], pic: c.pic })),
      msLeft: this.msLeft,
      double: this.double || undefined,
      practice: this.inPractice || undefined,
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
      help: this.help.get(p.playerId),
      msLeft: this.phase === "lock" ? 0 : this.msLeft,
      debugAnswer: debug,
    };
  }
}
