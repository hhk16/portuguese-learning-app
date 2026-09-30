/**
 * Em Sintonia — co-op mind-meld for two (after the board game Medium).
 *
 * Two Portuguese words appear. Each of you secretly writes ONE word that links them (type it, or
 * tap one from your word bank). 3, 2, 1… reveal. Same word? Celebration. Different? Your two words
 * become the next pair — you converge. Three tries per round, five rounds.
 * Words are matched ignoring accents and articles; spelling feedback goes to the learner model.
 */
import { ALL_ITEMS } from "../../curriculum/index.ts";
import { cardOf, type LearnCard } from "../../curriculum/learn.ts";
import type { Lesson } from "../../curriculum/schema.ts";
import { stripAccents } from "../../shared/answer-check.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, Word } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

export const ROUNDS = 5;
export const ATTEMPTS = 3;
const COUNTDOWN_MS = 3200;
const REVEAL_MS = 3600;

/** Normalise a typed word: lower-case, no accents, no article, no punctuation. */
export function normWord(s: string): string {
  return stripAccents(
    s
      .trim()
      .toLowerCase()
      .normalize("NFC")
      .replace(/[.,!?¿¡…"'«»]/g, "")
      .replace(/^(o|a|os|as|um|uma|uns|umas)\s+/, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

/** Find the curriculum card for a typed word (for pictures and evidence). */
export function cardForWord(s: string, pool: readonly LearnCard[]): LearnCard | undefined {
  const n = normWord(s);
  return pool.find((c) => {
    const forms = c.pt.split(/\s*·\s*/).map(normWord);
    return forms.includes(n);
  });
}

export interface SyncResult {
  score: number;
  max: number;
  matches: { words: [string, string]; word: string; attempt: number }[];
}

export class EmSintonia implements Activity {
  readonly id = "sync";
  readonly pausable = true;
  rt!: TvRuntime;
  round = 0;
  attempt = 1;
  phase: "write" | "countdown" | "reveal" | "end" = "write";
  phaseEnd = 0;
  pair!: [Word, Word];
  submitted = new Map<string, string>();
  lastMatch = false;
  score = 0;
  matches: SyncResult["matches"] = [];
  bank: Word[] = [];
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private pool: LearnCard[] = [];
  private readonly lessons: Lesson[];
  private readonly onDone: (r: SyncResult) => void;

  constructor(lessons: Lesson[], onDone: (r: SyncResult) => void) {
    this.lessons = lessons;
    this.onDone = onDone;
  }

  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    const all = ALL_ITEMS.map(cardOf).filter((c): c is LearnCard => !!c && c.short && !!c.emoji && (c.kind === "noun" || c.kind === "adjective" || c.kind === "profession"));
    const fromLessons = new Set(this.lessons.flatMap((l) => l.itemIds));
    // Prefer words from the lessons you've done, with the rest of the everyday words as backup.
    this.pool = [...all.filter((c) => fromLessons.has(c.itemId)), ...all.filter((c) => !fromLessons.has(c.itemId))];
    this.newRound();
  }

  private toWord(c: LearnCard): Word {
    return { pt: c.pt.split(" · ")[0]!, en: c.en, pic: c.emoji };
  }

  private newRound() {
    const [a, b] = this.rt.rng.sample(this.pool.slice(0, Math.max(24, Math.min(this.pool.length, 40))), 2);
    this.pair = [this.toWord(a!), this.toWord(b!)];
    this.attempt = 1;
    this.startAttempt();
  }

  private startAttempt() {
    this.phase = "write";
    this.submitted.clear();
    this.promptId = randomId(6);
    // A word bank: plenty of everyday words with pictures (typing is always allowed too).
    this.bank = this.rt.rng.sample(this.pool.slice(0, 48), 12).map((c) => this.toWord(c));
    play("whoosh");
    this.rt.speakPt(`${this.pair[0].pt}… e… ${this.pair[1].pt}`);
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick(now: number) {
    if (this.phase === "countdown" && now >= this.phaseEnd) return this.reveal(now);
    if (this.phase === "reveal" && now >= this.phaseEnd) return this.afterReveal();
  }

  repeat() {
    this.rt.speakPt(`${this.pair[0].pt}… e… ${this.pair[1].pt}`);
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode !== "sync" || this.phase !== "write" || promptId !== this.promptId || this.submitted.has(p.playerId)) return;
    this.submitted.set(p.playerId, value.word.trim());
    play("lock");
    this.rt.emote(p.playerId, "think", 1500);
    if (this.players.every((x) => this.submitted.has(x.playerId))) {
      this.phase = "countdown";
      this.phaseEnd = gameNow() + COUNTDOWN_MS;
      play("tick");
    }
    this.rt.refreshViews();
    this.rt.bump();
  }

  private reveal(now: number) {
    this.phase = "reveal";
    this.phaseEnd = now + REVEAL_MS;
    const words = this.players.map((p) => this.submitted.get(p.playerId) ?? "");
    const norms = words.map(normWord);
    this.lastMatch = this.players.length < 2 ? true : norms.length === 2 && norms[0] !== "" && norms[0] === norms[1];
    // Language evidence: a typed word that's in the curriculum counts as producing it.
    for (const p of this.players) {
      const w = this.submitted.get(p.playerId) ?? "";
      const c = cardForWord(w, this.pool);
      if (c) {
        const exact = c.pt.split(/\s*·\s*/).some((f) => f.toLowerCase().replace(/^(o|a)\s+/, "") === w.toLowerCase().replace(/^(o|a)\s+/, ""));
        this.rt.evidence(p, c.itemId, "sync.produce", exact ? "correct" : "accent-slip", 2);
      }
    }
    if (this.lastMatch) {
      const pts = ATTEMPTS + 1 - this.attempt;
      this.score += pts;
      this.matches.push({ words: [this.pair[0].pt, this.pair[1].pt], word: words[0] ?? "", attempt: this.attempt });
      play("match");
      this.rt.celebrate();
      for (const p of this.players) {
        this.rt.emote(p.playerId, "cheer", 2600);
        this.rt.addScore(p, pts * 50, "sync");
      }
      this.rt.speakPt(words[0]);
    } else {
      play("reveal");
      for (const p of this.players) this.rt.emote(p.playerId, "think", 2000);
    }
    this.rt.refreshViews();
    this.rt.bump();
  }

  private afterReveal() {
    if (this.lastMatch || this.attempt >= ATTEMPTS) {
      this.round++;
      if (this.round >= ROUNDS) return this.finish();
      return this.newRound();
    }
    // Converge: your two words become the next pair.
    const ws = this.players.map((p) => this.submitted.get(p.playerId) ?? "?");
    this.pair = ws.map((w) => {
      const c = cardForWord(w, this.pool);
      return c ? this.toWord(c) : { pt: w };
    }) as [Word, Word];
    this.attempt++;
    this.startAttempt();
  }

  private finish() {
    this.phase = "end";
    play("success-jingle");
    this.rt.bump();
    this.onDone({ score: this.score, max: ROUNDS * ATTEMPTS, matches: this.matches });
  }

  /** Words as submitted, for the TV reveal. */
  submittedBy(p: RuntimePlayer): string | undefined {
    return this.submitted.get(p.playerId);
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.phase === "end") return { mode: "wait", title: "Fim!", subtitle: `${this.score} pontos`, pic: "🔮" };
    if (this.phase !== "write") {
      return { mode: "wait", title: this.phase === "countdown" ? "3… 2… 1…" : this.lastMatch ? "Em sintonia! 🎉" : "Quase!", subtitle: this.phase === "countdown" ? "Olha para a TV!" : undefined, pic: this.phase === "countdown" ? "👀" : this.lastMatch ? "🥳" : "🤔" };
    }
    return {
      mode: "sync",
      roundId: this.roundId,
      promptId: this.promptId,
      words: this.pair,
      attempt: this.attempt,
      bank: this.bank,
      submitted: this.submitted.has(p.playerId),
      debugAnswer: this.rt.testMode ? { word: this.bank[0]?.pt } : undefined,
    };
  }
}
