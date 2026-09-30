/**
 * Desenha! — co-op Pictionary for two.
 *
 * One phone shows a secret word (picture + Portuguese + English) and becomes a sketch pad; the
 * drawing appears live on the TV. The other phone TYPES or SAYS the word in Portuguese (article
 * and accents optional) — wrong guesses pop up on the TV. Stuck? After a while six look-alike
 * words (same category) appear to tap, for 1 point. Faster = more points; the last drawing
 * counts double; roles swap every turn. The TV says the word at the reveal.
 */
import { cardOf, type LearnCard } from "../../curriculum/learn.ts";
import { ALL_ITEMS } from "../../curriculum/index.ts";
import type { Lesson } from "../../curriculum/schema.ts";
import { getItem } from "../../curriculum/index.ts";
import { levenshtein } from "../../shared/answer-check.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { setHurry } from "../../audio/music.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import type { GameOutcome } from "../../tv/activities.ts";
import { SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";
import { normWord } from "../sync/sync.ts";
import { selectItem } from "../../learner/selector.ts";
import type { Stroke } from "./ink.ts";
export { INK, type Stroke } from "./ink.ts";

export const ROUNDS = 6;
export const TURN_MS = 60_000;
const REVEAL_MS = 3800;
const OPTIONS = 6;

/** Difficulty: when the tap-a-word options appear (ms into the turn; null = never), and the letter hint. */
export const LEVEL_RULES: Record<Level, { optionsAt: number | null; hint: "first-letter" | "length" | "none"; hintAt: number }> = {
  1: { optionsAt: 30_000, hint: "first-letter", hintAt: 0 },
  2: { optionsAt: 40_000, hint: "length", hintAt: 15_000 },
  3: { optionsAt: null, hint: "none", hintAt: 0 },
};

/** Typed/said guesses: 3 / 2 / 1 points by time left. Tapping an option is always 1. */
export function pointsForTime(msLeft: number): number {
  return msLeft >= 40_000 ? 3 : msLeft >= 20_000 ? 2 : msLeft > 0 ? 1 : 0;
}

/** Does a typed or spoken guess name the card? Article/accents/case don't matter; one typo is OK on longer words. */
export function guessMatches(guess: string, pt: string): "yes" | "typo" | "no" {
  const g = normWord(guess);
  if (!g) return "no";
  const forms = pt.split(/\s*·\s*/).map(normWord);
  if (forms.includes(g) || forms.some((f) => g.split(" ").includes(f))) return "yes";
  if (forms.some((f) => f.length >= 5 && levenshtein(f, g) === 1)) return "typo";
  return "no";
}

/** "g _ _ _" / "_ _ _ _" — the hint pattern for a word. */
export function hintPattern(pt: string, hint: "first-letter" | "length" | "none"): string | undefined {
  if (hint === "none") return undefined;
  const w = pt.split(/\s*·\s*/)[0]!.replace(/^(o|a|os|as)\s+/i, "");
  return [...w].map((ch, i) => (ch === " " ? " " : i === 0 && hint === "first-letter" ? ch : "_")).join(" ");
}

export class Desenha implements Activity {
  readonly id = "draw";
  readonly pausable = true;
  rt!: TvRuntime;
  level: Level = 1;
  round = 0;
  phase: "draw" | "reveal" | "end" = "draw";
  phaseStart = 0;
  phaseEnd = 0;
  word!: LearnCard;
  options: { id: string; label: string }[] = [];
  tried = new Set<string>();
  /** Typed/said guesses that weren't it (shown on the TV), newest last. */
  wrongGuesses: { text: string; seq: number }[] = [];
  /** Strokes by id, in drawing order. */
  strokes = new Map<number, Stroke>();
  /** Bumped on every stroke change so the TV canvas knows to redraw. */
  ink = 0;
  score = 0;
  lastPoints = 0;
  lastGuessed = false;
  /** How the last word was guessed: typed/said, or tapped from the options. */
  lastHow: "typed" | "said" | "option" | null = null;
  lastTypo = false;
  passesLeft = 1;
  /** "Revisão para Ana!" — this word is one the guesser has been missing. */
  reviewFor: string | null = null;
  guessed: { pt: string; en: string; pic?: string; secs: number }[] = [];
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private pool: LearnCard[] = [];
  private used = new Set<string>();
  private guessSeq = 0;
  private optionsShown = false;
  private hurried = false;
  private readonly lessons: Lesson[];
  private readonly onDone: (r: GameOutcome) => void;

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
  get drawer(): RuntimePlayer | undefined {
    return this.players[this.round % 2];
  }
  get guesser(): RuntimePlayer | undefined {
    return this.players[(this.round + 1) % 2];
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }
  get final() {
    return this.round === ROUNDS - 1;
  }
  /** The tap-a-word options are showing (after a while, on easier levels). */
  get optionsOpen() {
    const at = this.rules.optionsAt;
    return at !== null && gameNow() - this.phaseStart >= at;
  }
  get hint(): string | undefined {
    if (this.phase !== "draw" || gameNow() - this.phaseStart < this.rules.hintAt) return undefined;
    return hintPattern(this.word.pt, this.rules.hint);
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

  /** Next word: the learner model's pick (lesson words, words someone keeps missing, older ones). */
  private pickWord(): LearnCard {
    const fresh = this.pool.filter((c) => !this.used.has(c.itemId));
    const candidates = (fresh.length ? fresh : this.pool).map((c) => getItem(c.itemId)).filter((i) => !!i);
    const sel = selectItem(
      {
        candidates,
        lessonItemIds: new Set(this.lessons.flatMap((l) => l.itemIds)),
        profiles: this.players.map((p) => p.profile),
        recent: [...this.used],
      },
      this.rt.rng,
    );
    const w = (sel && this.pool.find((c) => c.itemId === sel.item.id)) ?? fresh[0] ?? this.rt.rng.pick(this.pool);
    this.used.add(w.itemId);
    // Only the guesser's weak words are labelled — that's who has to produce it.
    const g = this.guesser;
    this.reviewFor = sel?.reason === "review" && g && sel.forProfileId === g.profile.profileId ? g.name : null;
    return w;
  }

  private newTurn() {
    this.phase = "draw";
    this.phaseStart = gameNow();
    this.phaseEnd = this.phaseStart + TURN_MS;
    this.word = this.pickWord();
    this.passesLeft = 1;
    this.optionsShown = false;
    this.hurried = false;
    this.lastHow = null;
    this.lastTypo = false;
    this.wrongGuesses = [];
    this.dealOptions();
    this.clear();
    setHurry(false);
    play("whoosh");
    if (this.final) this.rt.say(SAY.finalRound);
    if (this.drawer) this.rt.emote(this.drawer.playerId, "think", 2500);
    this.rt.refreshViews();
    this.rt.bump();
  }

  /** Six look-alike options: same category first (fruit with fruit), so the drawing has to be clear. */
  private dealOptions() {
    this.tried.clear();
    const cat = (c: LearnCard) => {
      const it = getItem(c.itemId);
      return it && it.kind === "noun" ? it.category : undefined;
    };
    const mine = cat(this.word);
    const rest = this.pool.filter((c) => c.itemId !== this.word.itemId && c.pt !== this.word.pt);
    const same = this.rt.rng.shuffle(rest.filter((c) => mine && cat(c) === mine));
    const other = this.rt.rng.shuffle(rest.filter((c) => !mine || cat(c) !== mine));
    const others = [...same, ...other].slice(0, OPTIONS - 1);
    this.options = this.rt.rng.shuffle([this.word, ...others]).map((c) => ({ id: c.itemId, label: c.pt }));
    this.promptId = randomId(6);
  }

  private clear() {
    this.strokes.clear();
    this.ink++;
  }

  tick(now: number) {
    if (this.phase === "draw") {
      if (!this.hurried && this.phaseEnd - now < 10_000) {
        this.hurried = true;
        setHurry(true);
        this.rt.say(SAY.hurry);
      }
      if (!this.optionsShown && this.optionsOpen) {
        this.optionsShown = true;
        play("sparkle");
        this.rt.refreshViews();
      }
      if (now >= this.phaseEnd) return this.reveal(null);
    }
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
    if (p !== this.guesser || promptId !== this.promptId) return;
    if (act.a === "type" || act.a === "say") {
      const tries = act.a === "type" ? [act.text] : act.heard;
      for (const t of tries) {
        const m = guessMatches(t, this.word.pt);
        if (m !== "no") {
          this.lastTypo = m === "typo";
          return this.reveal(act.a === "type" ? "typed" : "said");
        }
      }
      const shown = (tries[0] ?? "").trim().slice(0, 24);
      if (shown) this.wrongGuesses = [...this.wrongGuesses, { text: shown, seq: ++this.guessSeq }].slice(-4);
      play("buzzer", 0.5);
      this.rt.emote(p.playerId, "think", 1000);
      this.rt.bump();
      return;
    }
    if (act.a !== "guess" || !this.optionsOpen || this.tried.has(act.id)) return;
    if (act.id === this.word.itemId) return this.reveal("option");
    this.tried.add(act.id);
    const wrong = this.pool.find((c) => c.itemId === act.id);
    if (wrong) this.rt.evidence(p, wrong.itemId, "draw.guess", "wrong");
    play("wrong");
    this.rt.emote(p.playerId, "sad", 1200);
    // A wrong tap costs a little time.
    this.phaseEnd = Math.max(gameNow() + 1500, this.phaseEnd - 4000);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private reveal(how: "typed" | "said" | "option" | null) {
    const left = this.msLeft;
    this.phase = "reveal";
    this.phaseEnd = gameNow() + REVEAL_MS;
    this.lastGuessed = how !== null;
    this.lastHow = how;
    const base = how === null ? 0 : how === "option" ? 1 : pointsForTime(left);
    this.lastPoints = base * (this.final ? 2 : 1);
    this.score += this.lastPoints;
    setHurry(false);
    const g = this.guesser;
    const d = this.drawer;
    if (how && g) {
      this.guessed.push({ pt: this.word.pt, en: this.word.en, pic: this.word.emoji, secs: Math.round((TURN_MS - left) / 1000) });
      // Producing the word (typed/said) is stronger evidence than recognising it in a list.
      this.rt.evidence(g, this.word.itemId, "draw.guess", how === "option" ? "close" : this.lastTypo ? "close" : "correct");
      for (const p of [g, d]) if (p) this.rt.addScore(p, this.lastPoints * 50, "draw");
      play(base >= 3 ? "success-jingle" : "correct");
      this.rt.celebrate();
      this.rt.say(base >= 3 ? SAY.perfect : SAY.good, { interrupt: true });
      for (const p of this.players) this.rt.emote(p.playerId, "cheer", 2500);
    } else {
      play("fail-jingle");
      this.rt.say(SAY.timeUp, { interrupt: true });
      for (const p of this.players) this.rt.emote(p.playerId, "sad", 2000);
    }
    this.rt.speakPt(this.word.say);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private finish() {
    this.phase = "end";
    play("fanfare");
    this.rt.bump();
    const n = this.guessed.length;
    this.onDone({
      score: this.score,
      max: (ROUNDS - 1) * 3 + 6,
      headline: `${n} de ${ROUNDS} desenhos adivinhados`,
      headlineEn: `${n} of ${ROUNDS} drawings guessed`,
      sub: n ? `Mais rápido: ${[...this.guessed].sort((a, b) => a.secs - b.secs)[0]!.pt}` : "Desenhem maior e mais simples!",
      subEn: n ? `Fastest guess: ${[...this.guessed].sort((a, b) => a.secs - b.secs)[0]!.secs}s` : "Draw bigger and simpler!",
      words: this.guessed.map((w) => ({ pt: w.pt, en: w.en, pic: w.pic })),
    });
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Desenha! precisa de 2", subtitle: "Chama o teu par! · Needs two players", pic: "🎨" };
    if (this.phase === "end") return { mode: "wait", title: "Fim!", subtitle: `${this.score} pontos · points`, pic: "🎨" };
    if (this.phase === "reveal")
      return {
        mode: "wait",
        title: this.lastGuessed ? `+${this.lastPoints} · ${this.word.pt}!` : `Era: ${this.word.pt}`,
        subtitle: this.lastGuessed ? this.word.en : `It was: ${this.word.en}`,
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
      final: this.final,
      word: role === "draw" ? { pt: this.word.pt, en: this.word.en, pic: this.word.emoji } : undefined,
      options: role === "guess" && this.optionsOpen ? this.options : undefined,
      optionsInMs: role === "guess" && this.rules.optionsAt !== null && !this.optionsOpen ? Math.max(0, this.phaseStart + this.rules.optionsAt - gameNow()) : undefined,
      hint: role === "guess" ? this.hint : undefined,
      tried: role === "guess" ? [...this.tried] : undefined,
      canPass: role === "draw" ? this.passesLeft > 0 : undefined,
      debugAnswer: this.rt.testMode ? { id: this.word.itemId, pt: this.word.pt } : undefined,
    };
  }
}
