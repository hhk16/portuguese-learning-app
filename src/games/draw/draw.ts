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
import { CUE, NAMED, PET, SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";
import { normWord } from "../sync/sync.ts";
import { selectItem } from "../../learner/selector.ts";
import type { Stroke } from "./ink.ts";
export { INK, type Stroke } from "./ink.ts";

export const ROUNDS = 6;
export const TURN_MS = 60_000;
const REVEAL_MS = 3800;
const OPTIONS = 6;
/** Full-screen replay of each drawing at the end, then everyone votes for the best one. */
const GALLERY_EACH_MS = 2300;
const VOTE_MS = 15_000;
const BEST_MS = 4200;

/**
 * Difficulty: the turn gets shorter every round (start → min, −step per round); when the
 * tap-a-word options appear (fraction of the turn; null = never); the letter hint; and which
 * rounds bring a drawing twist ("Só 3 traços!").
 */
export const LEVEL_RULES: Record<Level, { turnMs: number; stepMs: number; minMs: number; optionsAt: number | null; hint: "first-letter" | "length" | "none"; hintAt: number; twistRounds: number[] }> = {
  1: { turnMs: 60_000, stepMs: 3_000, minMs: 45_000, optionsAt: 0.5, hint: "first-letter", hintAt: 0, twistRounds: [4] },
  2: { turnMs: 50_000, stepMs: 4_000, minMs: 30_000, optionsAt: 0.66, hint: "length", hintAt: 0.25, twistRounds: [3, 4, 5] },
  3: { turnMs: 45_000, stepMs: 4_000, minMs: 25_000, optionsAt: null, hint: "none", hintAt: 0, twistRounds: [3, 4, 5] },
};

export interface Twist {
  id: "strokes3" | "oneLine" | "otherHand";
  pt: string;
  en: string;
  /** Max strokes the drawer may use (undefined = honour system). */
  limit?: number;
}
export const TWISTS: Twist[] = [
  { id: "strokes3", pt: "Só 3 traços!", en: "Only 3 strokes!", limit: 3 },
  { id: "oneLine", pt: "Sem levantar o dedo!", en: "One line — don't lift your finger!", limit: 1 },
  { id: "otherHand", pt: "Com a outra mão!", en: "With your other hand!" },
];

/** Turn length for a round at a difficulty (the practice turn is relaxed). */
export function turnMsFor(level: Level, round: number): number {
  const r = LEVEL_RULES[level];
  if (round < 0) return r.turnMs * 1.5;
  return Math.max(r.minMs, r.turnMs - r.stepMs * round);
}

/** Typed/said guesses: 3 / 2 / 1 points by how much of the turn is left. Tapping an option is always 1. */
export function pointsForTime(msLeft: number, turnMs = TURN_MS): number {
  const f = msLeft / turnMs;
  return f >= 2 / 3 ? 3 : f >= 1 / 3 ? 2 : msLeft > 0 ? 1 : 0;
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
  practice = false;
  round = 0;
  phase: "draw" | "reveal" | "gallery" | "vote" | "best" | "end" = "draw";
  phaseStart = 0;
  phaseEnd = 0;
  word!: LearnCard;
  options: { id: string; label: string }[] = [];
  tried = new Set<string>();
  /** Typed/said guesses that weren't it (shown on the TV), newest last. */
  wrongGuesses: { text: string; seq: number }[] = [];
  /** The drawer's last "quente/frio" hint. */
  warmth: { hot: boolean; seq: number; at: number } | null = null;
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
  /** Every drawing of the game, for the gallery and the "melhor desenho" vote. */
  gallery: { pt: string; en?: string; pic?: string; guessed: boolean; strokes: Stroke[]; drawer?: string; votes?: number; best?: boolean }[] = [];
  /** This turn's twist ("Só 3 traços!"), and stroke ids the drawer has started. */
  twist: Twist | null = null;
  private strokeIds = new Set<number>();
  private twists: Twist[] = [];
  /** Best-drawing votes: playerId → gallery index. */
  bestVotes = new Map<string, number>();
  bestIndex = -1;
  /** Who did what, for the MVP split on game night. */
  contrib = new Map<string, number>();
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
  /** The score ⭐⭐⭐ is measured against. */
  get maxScore() {
    return (ROUNDS - 1) * 3 + 6;
  }
  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }
  get drawer(): RuntimePlayer | undefined {
    return this.players[(this.round + 2) % 2];
  }
  get guesser(): RuntimePlayer | undefined {
    return this.players[(this.round + 3) % 2];
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }
  /** This round's turn length (it shrinks every round). */
  get turnMs() {
    return turnMsFor(this.level, this.round);
  }
  /** Which drawing the gallery is showing right now. */
  get galleryIndex() {
    return Math.min(this.gallery.length - 1, Math.max(0, Math.floor((gameNow() - this.phaseStart) / GALLERY_EACH_MS)));
  }
  get final() {
    return this.round === ROUNDS - 1;
  }
  /** Round -1 is the practice drawing ("Ensaio") on the first plays: no points. */
  get inPractice() {
    return this.round < 0;
  }
  /** The tap-a-word options are showing (after a while, on easier levels). */
  get optionsOpen() {
    const at = this.rules.optionsAt;
    return at !== null && gameNow() - this.phaseStart >= at * this.turnMs;
  }
  get hint(): string | undefined {
    if (this.phase !== "draw" || gameNow() - this.phaseStart < this.rules.hintAt * this.turnMs) return undefined;
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
    if (this.practice) this.round = -1;
    this.twists = rt.rng.shuffle(TWISTS);
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
    this.phaseEnd = this.phaseStart + this.turnMs;
    this.strokeIds.clear();
    const ti = this.rules.twistRounds.indexOf(this.round);
    this.twist = ti >= 0 ? this.twists[ti % this.twists.length]! : null;
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
    if (this.twist) {
      // Twist rounds get their own announcement and banner.
      this.rt.say(SAY.twist);
      play("fanfare", 0.5);
      if (this.drawer) this.rt.cue({ pt: this.twist.pt, en: this.twist.en }, this.drawer);
    }
    if (this.drawer) {
      this.rt.emote(this.drawer.playerId, "think", 2500);
      this.rt.cue(CUE.draw, this.drawer, NAMED.drawIt);
    }
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
      if (this.round >= ROUNDS) return this.toGallery(now);
      this.newTurn();
    }
    if (this.phase === "gallery" && now >= this.phaseEnd) this.toVote(now);
    if (this.phase === "vote" && now >= this.phaseEnd) this.resolveVote();
    if (this.phase === "best" && now >= this.phaseEnd) this.finish();
  }

  /** The gallery: every drawing full-screen for a couple of seconds, replayed stroke by stroke. */
  private toGallery(now: number) {
    if (this.gallery.length < 2) return this.finish();
    this.phase = "gallery";
    this.phaseStart = now;
    this.phaseEnd = now + GALLERY_EACH_MS * this.gallery.length + 600;
    setHurry(false);
    play("whoosh");
    this.rt.say(SAY.galleryTime);
    this.rt.refreshViews();
    this.rt.bump();
  }

  /** "Qual é o melhor desenho?" — both phones vote. */
  private toVote(now: number) {
    this.phase = "vote";
    this.phaseStart = now;
    this.phaseEnd = now + VOTE_MS;
    this.promptId = randomId(6);
    this.rt.say(SAY.bestDrawing);
    this.rt.refreshViews();
    this.rt.bump();
  }

  /** You vote for your partner's drawings, never your own (with no partner drawings: any). */
  votable(p: RuntimePlayer): number[] {
    const theirs = this.gallery.map((g, i) => (g.drawer !== p.playerId ? i : -1)).filter((i) => i >= 0);
    return (theirs.length ? theirs : this.gallery.map((_, i) => i)).slice(0, 8);
  }

  private resolveVote() {
    const counts = this.gallery.map((_, i) => [...this.bestVotes.values()].filter((v) => v === i).length);
    const top = Math.max(...counts);
    // Most votes wins; a split goes to the drawing that was guessed fastest (or the first voted).
    const tied = counts.map((c, i) => (c === top ? i : -1)).filter((i) => i >= 0);
    const best = top > 0 ? (tied.find((i) => this.gallery[i]!.guessed) ?? tied[0]!) : this.gallery.findIndex((g) => g.guessed);
    this.bestIndex = Math.max(0, best);
    this.gallery.forEach((g, i) => {
      g.votes = counts[i];
      g.best = i === this.bestIndex;
    });
    const g = this.gallery[this.bestIndex]!;
    const drawer = g.drawer ? this.rt.players.get(g.drawer) : undefined;
    if (drawer) {
      this.contrib.set(drawer.playerId, (this.contrib.get(drawer.playerId) ?? 0) + 3);
      this.rt.say(NAMED.bestBy, { name: drawer.name, interrupt: true });
      // The puppy waves its paws at the winning drawing.
      this.rt.petStar("wave", 2600, PET.loves, 0.6);
      this.rt.emote(drawer.playerId, "cheer", 3500);
    }
    this.phase = "best";
    this.phaseEnd = gameNow() + BEST_MS;
    play("fanfare");
    this.rt.celebrate();
    this.rt.refreshViews();
    this.rt.bump();
  }

  repeat() {
    if (this.phase === "reveal") this.rt.speakPt(this.word.say);
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode === "skip" && this.inPractice) {
      this.round = 0;
      return this.newTurn();
    }
    if (value.mode === "pick" && this.phase === "vote" && promptId === this.promptId && !this.bestVotes.has(p.playerId)) {
      const i = Number(value.id.replace("g", ""));
      if (!this.gallery[i] || !this.votable(p).includes(i)) return;
      this.bestVotes.set(p.playerId, i);
      // Being picked by your partner is worth something even if it isn't the overall best.
      const by = this.gallery[i]!.drawer;
      if (by) this.contrib.set(by, (this.contrib.get(by) ?? 0) + 2);
      play("lock");
      if (this.players.every((x) => this.bestVotes.has(x.playerId))) return this.resolveVote();
      this.rt.view(p, this.viewFor(p));
      this.rt.bump();
      return;
    }
    if (value.mode !== "draw" || this.phase !== "draw") return;
    const act = value.action;
    if (p === this.drawer) {
      if (act.a === "stroke") {
        // Twist: only so many strokes (new stroke ids past the limit are ignored).
        const limit = this.twist?.limit;
        if (limit && !this.strokeIds.has(act.s)) {
          if (this.strokeIds.size >= limit) return;
          this.strokeIds.add(act.s);
          if (this.strokeIds.size === limit) this.rt.view(p, this.viewFor(p));
        } else this.strokeIds.add(act.s);
        const s = this.strokes.get(act.s) ?? { c: act.c, w: act.w, segs: [] };
        s.segs[act.seg] = act.pts;
        this.strokes.set(act.s, s);
        this.ink++;
        this.rt.bump();
      } else if (act.a === "warm") {
        // 🔥 quente / ❄️ frio — the drawer steers the guesser (on the TV, in Portuguese).
        this.warmth = { hot: act.hot, seq: ++this.guessSeq, at: gameNow() };
        play(act.hot ? "sparkle" : "tap", 0.7);
        this.rt.bump();
      } else if (act.a === "undo") {
        const last = Math.max(-1, ...this.strokes.keys());
        if (last >= 0) this.strokes.delete(last);
        this.ink++;
        this.rt.bump();
      } else if (act.a === "clear") {
        this.clear();
        this.rt.bump();
      } else if (act.a === "pass" && this.passesLeft > 0) {
        this.passesLeft--;
        this.strokeIds.clear();
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
      // The drawer sees the guesses live (so they can say quente/frio).
      if (this.drawer) this.rt.view(this.drawer, this.viewFor(this.drawer));
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
    this.rt.holdPhones(1800);
    const left = this.msLeft;
    if (!this.inPractice && this.strokes.size)
      this.gallery.push({ pt: this.word.pt, en: this.word.en, pic: this.word.emoji, drawer: this.drawer?.playerId, guessed: how !== null, strokes: [...this.strokes.entries()].sort((a, b) => a[0] - b[0]).map(([, s]) => ({ c: s.c, w: s.w, segs: s.segs.map((x) => [...(x ?? [])]) })) });
    this.phase = "reveal";
    this.phaseEnd = gameNow() + REVEAL_MS;
    this.lastGuessed = how !== null;
    this.lastHow = how;
    const base = how === null ? 0 : how === "option" ? 1 : pointsForTime(left, this.turnMs);
    this.lastPoints = this.inPractice ? 0 : base * (this.final ? 2 : 1);
    this.score += this.lastPoints;
    // The guesser found it, the drawer drew it: 60/40.
    for (const [who, share] of [[this.guesser, 0.6], [this.drawer, 0.4]] as const)
      if (who && this.lastPoints) this.contrib.set(who.playerId, (this.contrib.get(who.playerId) ?? 0) + this.lastPoints * share);
    setHurry(false);
    const g = this.guesser;
    const d = this.drawer;
    if (how && g) {
      if (!this.inPractice) this.guessed.push({ pt: this.word.pt, en: this.word.en, pic: this.word.emoji, secs: Math.round((this.turnMs - left) / 1000) });
      // Producing the word (typed/said) is stronger evidence than recognising it in a list.
      this.rt.evidence(g, this.word.itemId, "draw.guess", how === "option" ? "close" : this.lastTypo ? "close" : "correct");
      for (const p of [g, d]) if (p) this.rt.addScore(p, this.lastPoints * 50, "draw");
      play(base >= 3 ? "success-jingle" : "correct");
      this.rt.celebrate();
      if (base >= 3 && Math.random() < 0.5) this.rt.say(NAMED.wellDone, { interrupt: true, name: g.name });
      else this.rt.say(base >= 3 ? SAY.perfect : SAY.good, { interrupt: true });
      for (const p of this.players) this.rt.emote(p.playerId, "cheer", 2500);
    } else {
      play("fail-jingle");
      this.rt.say(SAY.timeUp, { interrupt: true });
      this.rt.petDo("think", 2200);
      for (const p of this.players) this.rt.emote(p.playerId, "sad", 2000);
    }
    this.rt.speakPt(this.word.say);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private finish() {
    if (this.phase === "end") return;
    this.phase = "end";
    if (this.bestIndex < 0) play("fanfare");
    this.rt.bump();
    const n = this.guessed.length;
    const best = this.gallery[this.bestIndex];
    const bestBy = best?.drawer ? this.rt.players.get(best.drawer) : undefined;
    this.onDone({
      score: this.score,
      max: this.maxScore,
      headline: `${n} de ${ROUNDS} desenhos adivinhados`,
      headlineEn: `${n} of ${ROUNDS} drawings guessed`,
      sub: n ? `Mais rápido: ${[...this.guessed].sort((a, b) => a.secs - b.secs)[0]!.pt}` : "Desenhem maior e mais simples!",
      subEn: n ? `Fastest guess: ${[...this.guessed].sort((a, b) => a.secs - b.secs)[0]!.secs}s` : "Draw bigger and simpler!",
      words: this.guessed.map((w) => ({ pt: w.pt, en: w.en, pic: w.pic })),
      gallery: this.gallery,
      contrib: Object.fromEntries(this.contrib),
      highlight: best && bestBy ? { pt: `Melhor desenho: ${best.pt}, por ${bestBy.name}`, en: `Best drawing: ${best.en ?? best.pt}, by ${bestBy.name}`, pic: "🎨" } : undefined,
    });
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Desenha! precisa de 2", subtitle: "Chama o teu par! · Needs two players", pic: "🎨" };
    if (this.phase === "end") return { mode: "wait", title: "Fim!", subtitle: `${this.score} pontos · points`, pic: "🎨" };
    if (this.phase === "gallery") return { mode: "wait", title: "A galeria! 🖼️", subtitle: "Olha para a TV — your drawings, one by one", pic: "🖼️" };
    if (this.phase === "best") {
      const g = this.gallery[this.bestIndex];
      return { mode: "wait", title: `⭐ ${g?.pt ?? ""}`, subtitle: "Melhor desenho! · Best drawing — olha para a TV!", pic: g?.pic ?? "🎨" };
    }
    if (this.phase === "vote") {
      if (this.bestVotes.has(p.playerId)) return { mode: "wait", title: "Votaste! ✓", subtitle: "À espera do teu par… · Waiting for your partner", pic: "🗳️" };
      return {
        mode: "pick",
        roundId: this.roundId,
        promptId: this.promptId,
        title: this.players.length > 1 ? "O melhor desenho do teu par?" : "Qual é o melhor desenho?",
        subtitle: this.players.length > 1 ? "Pick your partner's best drawing!" : "Which drawing is the best? Vote!",
        options: this.votable(p).map((i) => {
          const g = this.gallery[i]!;
          return { id: `g${i}`, label: g.pt, sub: `${this.rt.players.get(g.drawer ?? "")?.name ?? ""} ${g.guessed ? "✓" : "✗"}`, emoji: g.pic };
        }),
      };
    }
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
      round: Math.max(0, this.round),
      rounds: ROUNDS,
      msLeft: this.msLeft,
      turnMs: this.turnMs,
      final: this.final,
      twist: this.twist ? { pt: this.twist.pt, en: this.twist.en } : undefined,
      strokeLimit: role === "draw" ? this.twist?.limit : undefined,
      strokesUsed: role === "draw" && this.twist?.limit ? this.strokeIds.size : undefined,
      word: role === "draw" ? { pt: this.word.pt, en: this.word.en, pic: this.word.emoji } : undefined,
      options: role === "guess" && this.optionsOpen ? this.options : undefined,
      optionsInMs: role === "guess" && this.rules.optionsAt !== null && !this.optionsOpen ? Math.max(0, this.phaseStart + this.rules.optionsAt * this.turnMs - gameNow()) : undefined,
      hint: role === "guess" ? this.hint : undefined,
      guesses: role === "draw" ? this.wrongGuesses.map((g) => g.text) : undefined,
      tried: role === "guess" ? [...this.tried] : undefined,
      canPass: role === "draw" ? this.passesLeft > 0 : undefined,
      practice: this.inPractice || undefined,
      debugAnswer: this.rt.testMode ? { id: this.word.itemId, pt: this.word.pt } : undefined,
    };
  }
}
