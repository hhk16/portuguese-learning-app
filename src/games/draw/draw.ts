/**
 * Desenha! — co-op Pictionary for two.
 *
 * One phone shows a secret word (picture + Portuguese + English) and becomes a sketch pad; the
 * drawing appears live on the TV. The other phone shows six Portuguese words (no pictures, no
 * English) and taps the one being drawn. Faster = more points; roles swap every turn. The TV
 * says the word at the reveal, so both of you hear it.
 */
import { cardOf, type LearnCard } from "../../curriculum/learn.ts";
import { ALL_ITEMS } from "../../curriculum/index.ts";
import type { Lesson } from "../../curriculum/schema.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

export const ROUNDS = 6;
export const TURN_MS = 60_000;
const REVEAL_MS = 3800;
const OPTIONS = 6;
import type { Stroke } from "./ink.ts";
export { INK, type Stroke } from "./ink.ts";

export interface DrawResult {
  score: number;
  max: number;
  guessed: { pt: string; pic?: string; secs: number }[];
}

export function pointsForTime(msLeft: number): number {
  return msLeft >= 40_000 ? 3 : msLeft >= 20_000 ? 2 : msLeft > 0 ? 1 : 0;
}

export class Desenha implements Activity {
  readonly id = "draw";
  readonly pausable = true;
  rt!: TvRuntime;
  round = 0;
  phase: "draw" | "reveal" | "end" = "draw";
  phaseEnd = 0;
  word!: LearnCard;
  options: { id: string; label: string }[] = [];
  tried = new Set<string>();
  /** Strokes by id, in drawing order. */
  strokes = new Map<number, Stroke>();
  /** Bumped on every stroke change so the TV canvas knows to redraw. */
  ink = 0;
  score = 0;
  lastPoints = 0;
  lastGuessed = false;
  passesLeft = 1;
  guessed: DrawResult["guessed"] = [];
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private pool: LearnCard[] = [];
  private used = new Set<string>();
  private readonly lessons: Lesson[];
  private readonly onDone: (r: DrawResult) => void;

  constructor(lessons: Lesson[], onDone: (r: DrawResult) => void) {
    this.lessons = lessons;
    this.onDone = onDone;
  }

  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }
  get drawer(): RuntimePlayer | undefined {
    return this.players[this.round % 2];
  }
  get guesser(): RuntimePlayer | undefined {
    return this.players[(this.round + 1) % 2];
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    // Drawable things: everyday nouns with a picture. Lesson nouns first.
    const nouns = ALL_ITEMS.filter((i) => i.kind === "noun")
      .map(cardOf)
      .filter((c): c is LearnCard => !!c && !!c.emoji);
    const fromLessons = new Set(this.lessons.flatMap((l) => l.itemIds));
    this.pool = [...rt.rng.shuffle(nouns.filter((c) => fromLessons.has(c.itemId))), ...rt.rng.shuffle(nouns.filter((c) => !fromLessons.has(c.itemId)))];
    this.newTurn();
  }

  private pickWord(): LearnCard {
    const w = this.pool.find((c) => !this.used.has(c.itemId)) ?? this.rt.rng.pick(this.pool);
    this.used.add(w.itemId);
    return w;
  }

  private newTurn() {
    this.phase = "draw";
    this.phaseEnd = gameNow() + TURN_MS;
    this.word = this.pickWord();
    this.passesLeft = 1;
    this.dealOptions();
    this.clear();
    play("whoosh");
    if (this.drawer) this.rt.emote(this.drawer.playerId, "think", 2500);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private dealOptions() {
    this.tried.clear();
    const others = this.rt.rng.sample(
      this.pool.filter((c) => c.itemId !== this.word.itemId && c.pt !== this.word.pt),
      OPTIONS - 1,
    );
    this.options = this.rt.rng.shuffle([this.word, ...others]).map((c) => ({ id: c.itemId, label: c.pt }));
    this.promptId = randomId(6);
  }

  private clear() {
    this.strokes.clear();
    this.ink++;
  }

  tick(now: number) {
    if (this.phase === "draw" && now >= this.phaseEnd) return this.reveal(false);
    if (this.phase === "reveal" && now >= this.phaseEnd) {
      this.round++;
      if (this.round >= ROUNDS) return this.finish();
      this.newTurn();
    }
  }

  repeat() {
    if (this.phase === "reveal") this.rt.speakPt(this.word.say);
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode !== "draw" || this.phase !== "draw") return;
    const act = value.action;
    if (p === this.drawer) {
      if (act.a === "stroke") {
        const s = this.strokes.get(act.s) ?? { c: act.c, w: act.w, segs: [] };
        s.segs[act.seg] = act.pts;
        this.strokes.set(act.s, s);
        this.ink++;
        this.rt.bump();
      } else if (act.a === "clear") {
        this.clear();
        this.rt.bump();
      } else if (act.a === "pass" && this.passesLeft > 0) {
        this.passesLeft--;
        this.word = this.pickWord();
        this.dealOptions();
        this.clear();
        play("whoosh");
        this.rt.refreshViews();
        this.rt.bump();
      }
      return;
    }
    if (p !== this.guesser || act.a !== "guess" || promptId !== this.promptId || this.tried.has(act.id)) return;
    if (act.id === this.word.itemId) return this.reveal(true);
    this.tried.add(act.id);
    const wrong = this.pool.find((c) => c.itemId === act.id);
    if (wrong) this.rt.evidence(p, wrong.itemId, "draw.guess", "wrong");
    play("wrong");
    this.rt.emote(p.playerId, "sad", 1200);
    // A wrong guess costs a little time.
    this.phaseEnd = Math.max(gameNow() + 1500, this.phaseEnd - 4000);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private reveal(guessed: boolean) {
    const left = this.msLeft;
    this.phase = "reveal";
    this.phaseEnd = gameNow() + REVEAL_MS;
    this.lastGuessed = guessed;
    this.lastPoints = guessed ? pointsForTime(left) : 0;
    this.score += this.lastPoints;
    const g = this.guesser;
    const d = this.drawer;
    if (guessed && g) {
      this.guessed.push({ pt: this.word.pt, pic: this.word.emoji, secs: Math.round((TURN_MS - left) / 1000) });
      this.rt.evidence(g, this.word.itemId, "draw.guess", this.tried.size === 0 ? "correct" : "close");
      for (const p of [g, d]) if (p) this.rt.addScore(p, this.lastPoints * 50, "draw");
      play("correct");
      this.rt.celebrate();
      for (const p of this.players) this.rt.emote(p.playerId, "cheer", 2500);
    } else {
      play("fail-jingle");
      for (const p of this.players) this.rt.emote(p.playerId, "sad", 2000);
    }
    this.rt.speakPt(this.word.say);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private finish() {
    this.phase = "end";
    play("success-jingle");
    this.rt.bump();
    this.onDone({ score: this.score, max: ROUNDS * 3, guessed: this.guessed });
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Desenha! precisa de 2", subtitle: "Chama o teu par para jogar!", pic: "🎨" };
    if (this.phase === "end") return { mode: "wait", title: "Fim!", subtitle: `${this.score} pontos`, pic: "🎨" };
    if (this.phase === "reveal")
      return {
        mode: "wait",
        title: this.lastGuessed ? `+${this.lastPoints} · ${this.word.pt}!` : `Era: ${this.word.pt}`,
        subtitle: this.word.en,
        pic: this.word.emoji,
      };
    const role = p === this.drawer ? "draw" : "guess";
    return {
      mode: "draw",
      roundId: this.roundId,
      promptId: this.promptId,
      role,
      partner: this.rt.partnerOf(p)?.name ?? "",
      round: this.round,
      rounds: ROUNDS,
      msLeft: this.msLeft,
      word: role === "draw" ? { pt: this.word.pt, en: this.word.en, pic: this.word.emoji } : undefined,
      options: role === "guess" ? this.options : undefined,
      tried: role === "guess" ? [...this.tried] : undefined,
      canPass: role === "draw" ? this.passesLeft > 0 : undefined,
      debugAnswer: this.rt.testMode ? { id: this.word.itemId } : undefined,
    };
  }
}
