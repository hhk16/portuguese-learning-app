/**
 * Na Mesma Onda — co-op dial game for two (Wavelength's two-player mode, A1 edition).
 *
 * A dial between two opposites (frio ↔ quente). The psychic's phone shows where the hidden target
 * is; they pick ONE thing as the clue ("o gelado", "o café", "o mar"…) from a few spread over the
 * dial — with no positions shown, so it's a judgement call — and the TV says it out loud. The
 * partner turns the dial (the TV dial moves live), can bet "Tenho a certeza!" for
 * double-or-nothing, then locks it. Drumroll, reveal. Closer = more points; the last dial counts
 * double. Harder levels: narrower bands, fewer clue chips, less time.
 */
import { getItem } from "../../curriculum/index.ts";
import { cardOf, type LearnCard } from "../../curriculum/learn.ts";
import type { ItemOf } from "../../curriculum/schema.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, Word } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { setHurry } from "../../audio/music.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import type { GameOutcome } from "../../tv/activities.ts";
import { CUE, NAMED, SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";
import { spectra, spectrumKey, type Clue, type Spectrum } from "./scale.ts";
import { THINGS } from "./things.ts";

export const ROUNDS = 6;
/** Points in the bullseye; outer bands give 3 and 2. */
export const BULLSEYE = 4;
/** The psychic's side bet, when it comes true. */
export const SIDE_BET = 3;
/** Signals left at the end of the show are worth this much each. */
export const SIGNAL_BONUS = 2;

/** Difficulty: band half-widths (dial is 0..100), clue types, and timers. */
/**
 * Signals ("sinais"): the radio show's lifeline. A dial that lands far off (0 points) loses one; a
 * bullseye wins one back. No signal left → the show goes off-air and the game ends early.
 */
export const LEVEL_RULES: Record<Level, { bands: [number, number, number]; chips: number; clueMs: number; guessMs: number; signals: number }> = {
  1: { bands: [5, 10, 15], chips: 8, clueMs: 45_000, guessMs: 40_000, signals: 3 },
  2: { bands: [3, 7, 11], chips: 6, clueMs: 35_000, guessMs: 30_000, signals: 2 },
  3: { bands: [3, 6, 10], chips: 4, clueMs: 30_000, guessMs: 25_000, signals: 2 },
};

export function pointsFor(target: number, value: number, bands: [number, number, number] = LEVEL_RULES[1].bands): number {
  const d = Math.abs(target - value);
  if (d <= bands[0]) return BULLSEYE;
  if (d <= bands[1]) return 3;
  if (d <= bands[2]) return 2;
  return 0;
}

/** "Tenho a certeza!" — double in the bullseye, nothing otherwise. */
export function betPoints(points: number, sure: boolean): number {
  if (!sure) return points;
  return points >= BULLSEYE ? points * 2 : 0;
}

/** Spectra the dial can use: ones with at least three things in each third. */
export function dialSpectra(): Spectrum[] {
  return spectra().filter((s) => {
    const things = THINGS[spectrumKey(s)] ?? [];
    return [0, 1, 2].every((k) => things.filter((t) => Math.min(2, Math.floor(t.at / 33.4)) === k).length >= 3);
  });
}

const word = (a: ItemOf<"adjective">): Word => ({ pt: a.m, en: a.en, pic: a.emoji });

export class NaMesmaOnda implements Activity {
  readonly id = "wave";
  readonly pausable = true;
  rt!: TvRuntime;
  level: Level = 1;
  practice = false;
  round = 0;
  phase: "clue" | "guess" | "suspense" | "reveal" | "end" = "clue";
  spectrum!: Spectrum;
  target = 50;
  value = 50;
  score = 0;
  lastPoints = 0;
  /** This dial's points without the side bet (the bet gets its own card). */
  lastDial = 0;
  sure = false;
  /** Signals left (see LEVEL_RULES); -1 until the game starts. */
  signals = -1;
  /** Last reveal: +1 / -1 signal, for the TV beat. */
  signalDelta = 0;
  offAir = false;
  /** The psychic's side bet while the partner turns the dial. */
  psychicBet: "cheio" | "perto" | "longe" | null = null;
  betWon = false;
  clue: Clue | null = null;
  phaseEnd = 0;
  history: { spectrum: Spectrum; clue: string; clueEn?: string; cluePic?: string; target: number; value: number; points: number }[] = [];
  chips: { card: LearnCard; at: number }[] = [];
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private deck: Spectrum[] = [];
  private readonly onDone: (r: GameOutcome) => void;
  private lastMoveSent = 0;
  /** Who did what, for the MVP split on game night. */
  contrib = new Map<string, number>();
  private hurried = false;

  constructor(onDone: (r: GameOutcome) => void) {
    this.onDone = onDone;
  }

  get rules() {
    return LEVEL_RULES[this.level];
  }
  /** The score ⭐⭐⭐ is measured against. */
  get maxScore() {
    return 40 + SIGNAL_BONUS * this.rules.signals;
  }
  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }
  get psychic(): RuntimePlayer | undefined {
    return this.players[(this.round + 2) % Math.max(1, this.players.length)];
  }
  get guesser(): RuntimePlayer | undefined {
    return this.players.length < 2 ? this.players[0] : this.players[(this.round + 3) % 2];
  }
  get final() {
    return this.round === ROUNDS - 1;
  }
  /** Round -1 is the practice dial ("Ensaio") on the first plays: no timer, no points. */
  get inPractice() {
    return this.round < 0;
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }
  /**
   * The psychic's clue chips: things spread over the dial (a couple per third), in random order and
   * with no positions shown — which one sits where the target is, is the psychic's call.
   */
  get clues(): Clue[] {
    return this.chips.map((t) => ({ pt: t.card.pt, en: t.card.en, pic: t.card.emoji, at: t.at, say: t.card.say }));
  }

  private dealChips(): { card: LearnCard; at: number }[] {
    const key = `${this.spectrum.left.id.split(".").pop()}|${this.spectrum.right.id.split(".").pop()}`;
    const things = (THINGS[key] ?? [])
      .map((t) => {
        const it = getItem(`vocab.noun.${t.noun}`);
        const card = it ? cardOf(it) : null;
        return card ? { card, at: t.at } : null;
      })
      .filter((x): x is { card: LearnCard; at: number } => !!x && !this.usedNouns.has(x.card.itemId));
    const n = this.rules.chips;
    // Spread: take from each third in turn, then shuffle so position isn't given away by order.
    const thirds = [0, 1, 2].map((k) => this.rt.rng.shuffle(things.filter((t) => Math.min(2, Math.floor(t.at / 33.4)) === k)));
    const out: { card: LearnCard; at: number }[] = [];
    for (let i = 0; out.length < n && i < 20; i++) {
      const t = thirds[i % 3]!.shift();
      if (t) out.push(t);
    }
    return this.rt.rng.shuffle(out);
  }
  /** Things already used as a clue this game (never offered again). */
  private usedNouns = new Set<string>();

  start(rt: TvRuntime) {
    this.rt = rt;
    this.signals = this.rules.signals;
    if (this.practice) this.round = -1;
    // Only the spectra with things spread over the dial (newer adjective pairs may not have any yet).
    this.deck = rt.rng.shuffle(dialSpectra());
    this.newRound();
  }

  private newRound() {
    this.spectrum = this.deck[(this.round + 1) % this.deck.length]!;
    // Keep targets off the extreme ends so every band is reachable.
    this.target = 8 + this.rt.rng.int(85);
    this.value = 50;
    this.sure = false;
    this.psychicBet = null;
    this.clue = null;
    this.phase = "clue";
    this.phaseEnd = gameNow() + (this.inPractice ? 600_000 : this.rules.clueMs);
    this.promptId = randomId(6);
    this.chips = this.dealChips();
    this.hurried = false;
    setHurry(false);
    play("whoosh");
    if (this.final) this.rt.say(SAY.finalRound);
    this.rt.speakPt(`${this.spectrum.left.m} ou ${this.spectrum.right.m}?`);
    if (this.psychic) this.rt.cue(CUE.pickClue, this.psychic, this.players.length > 1 ? NAMED.pickClue : undefined);
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick(now: number) {
    if (this.phase !== "clue" && this.phase !== "guess") return;
    const left = this.phaseEnd - now;
    if (!this.hurried && left < 10_000) {
      this.hurried = true;
      setHurry(true);
      this.rt.say(SAY.hurry);
    }
    if (left > 0) return;
    this.rt.say(SAY.timeUp);
    play("whistle");
    // Out of time: a random chip is given for you; the dial locks where it is.
    if (this.phase === "clue") this.giveClue(this.rt.rng.pick(this.clues));
    else this.lock(false);
  }

  repeat() {
    if (this.clue) this.rt.speakPt(this.clue.say ?? this.clue.pt);
    else this.rt.speakPt(`${this.spectrum.left.m} ou ${this.spectrum.right.m}?`);
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  private giveClue(c: Clue) {
    this.clue = c;
    const used = this.chips.find((t) => t.card.pt === c.pt);
    if (used) this.usedNouns.add(used.card.itemId);
    this.phase = "guess";
    this.phaseEnd = gameNow() + (this.inPractice ? 600_000 : this.rules.guessMs);
    this.hurried = false;
    setHurry(false);
    this.promptId = randomId(6);
    play("card-flip");
    // The TV says the clue: listening practice for the guesser.
    this.rt.speakPt(c.say ?? c.pt);
    if (this.guesser) this.rt.cue(CUE.turn, this.guesser);
    if (this.psychic) this.rt.emote(this.psychic.playerId, "think", 2200);
    this.rt.refreshViews();
    this.rt.bump();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode === "skip" && this.inPractice) {
      this.round = 0;
      return this.newRound();
    }
    if (value.mode !== "dial" || this.phase === "end") return;
    const a = value.action;
    if (a.a === "clue" && this.phase === "clue" && p === this.psychic && promptId === this.promptId) {
      const c = this.clues.find((x) => x.pt === a.text);
      if (c) this.giveClue(c);
      return;
    }
    if (a.a === "move" && this.phase === "guess" && p === this.guesser) {
      // Live dial: the TV follows every move; phones get a refreshed view at most ~5×/s.
      this.value = Math.max(0, Math.min(100, a.value));
      this.rt.bump();
      const now = performance.now();
      if (now - this.lastMoveSent > 200) {
        this.lastMoveSent = now;
        const ps = this.psychic;
        if (ps && ps !== p) this.rt.view(ps, this.viewFor(ps));
      }
      if (Math.random() < 0.2) play("dial", 0.5);
      return;
    }
    if (a.a === "lock" && this.phase === "guess" && p === this.guesser && promptId === this.promptId) return this.lock(!!a.sure);
    // While the partner turns, the psychic secretly bets how close they'll get.
    if (a.a === "bet" && this.phase === "guess" && p === this.psychic && p !== this.guesser && !this.psychicBet) {
      this.psychicBet = a.bet;
      play("lock");
      this.rt.view(p, this.viewFor(p));
      this.rt.bump();
      return;
    }
    if (a.a === "next" && this.phase === "reveal" && promptId === this.promptId) return this.next();
  }

  onNav(dir: string) {
    if (dir === "ok" && this.phase === "reveal") this.next();
  }

  /** Lock → drumroll → reveal. */
  private lock(sure: boolean) {
    this.sure = sure;
    this.phase = "suspense";
    this.promptId = randomId(6);
    setHurry(false);
    play("lock");
    play("drumroll");
    this.rt.petDo("think", 2000);
    this.rt.refreshViews();
    this.rt.bump();
    setTimeout(() => this.rt.activity === this && this.phase === "suspense" && this.reveal(), 2050);
  }

  private reveal() {
    this.rt.holdPhones(1800);
    this.phase = "reveal";
    this.promptId = randomId(6);
    const raw = pointsFor(this.target, this.value, this.rules.bands);
    this.lastPoints = betPoints(raw, this.sure) * (this.final ? 2 : 1);
    // The psychic's side bet: +2 when they called it (bullseye / close / far).
    const called = raw >= BULLSEYE ? "cheio" : raw > 0 ? "perto" : "longe";
    this.betWon = !!this.psychicBet && this.psychicBet === called;
    const dialPoints = this.lastPoints;
    this.lastDial = dialPoints;
    if (this.betWon && !this.inPractice) this.lastPoints += SIDE_BET;
    if (!this.inPractice) this.score += this.lastPoints;
    // Signals: far off (or a lost "Tenho a certeza!") loses one; a bullseye wins one back.
    this.signalDelta = 0;
    if (!this.inPractice) {
      if (dialPoints === 0) this.signalDelta = -1;
      else if (raw >= BULLSEYE && this.signals < this.rules.signals) this.signalDelta = 1;
      this.signals += this.signalDelta;
      if (this.signalDelta < 0) setTimeout(() => this.rt.activity === this && this.rt.say(this.signals > 0 ? SAY.signalLost : SAY.offAir), 2600);
      else if (this.signalDelta > 0) setTimeout(() => this.rt.activity === this && this.rt.say(SAY.signalBack), 2600);
    }
    const ps = this.psychic;
    const gs = this.guesser;
    if (!this.inPractice && ps && gs && ps !== gs) {
      // The guesser turned it, the psychic chose the clue: 60/40 of the dial, plus the side bet.
      this.contrib.set(gs.playerId, (this.contrib.get(gs.playerId) ?? 0) + dialPoints * 0.6);
      this.contrib.set(ps.playerId, (this.contrib.get(ps.playerId) ?? 0) + dialPoints * 0.4 + (this.betWon ? SIDE_BET : 0));
    }
    // The side bet gets its own beat once the dial has landed.
    if (this.psychicBet && ps && ps !== gs) {
      const label = { cheio: "Em cheio", perto: "Perto", longe: "Longe" }[this.psychicBet];
      const labelEn = { cheio: "Bullseye", perto: "Close", longe: "Far" }[this.psychicBet];
      const doubted = this.psychicBet === "longe" && raw >= BULLSEYE;
      this.rt.showBet(
        { pt: `${ps.name} apostou: “${label}”`, en: `${ps.name}'s side bet: “${labelEn}”` },
        [{ playerId: ps.playerId, pt: this.betWon ? `Certo! +${SIDE_BET}` : "Errado!", en: this.betWon ? "Called it!" : "Wrong call", won: this.betWon, pts: this.betWon ? SIDE_BET : undefined }],
        { delay: 1900, line: doubted ? NAMED.noFaith : this.betWon ? SAY.betWon : SAY.betLost, name: ps.name },
      );
    }
    if (!this.inPractice) this.history.push({ spectrum: this.spectrum, clue: this.clue?.pt ?? "", clueEn: this.clue?.en, cluePic: this.clue?.pic, target: this.target, value: this.value, points: this.lastPoints });
    play("cymbal");
    if (raw >= BULLSEYE) {
      play(this.sure ? "fanfare" : "success-jingle");
      this.rt.celebrate();
      this.rt.say(SAY.perfect, { interrupt: true });
    } else if (raw > 0 && !(this.sure && this.lastPoints === 0)) {
      play("correct");
      this.rt.say(raw >= 3 ? SAY.near : SAY.close, { interrupt: true });
    } else {
      play(this.sure ? "sad-trombone" : "wrong");
      this.rt.say(raw > 0 ? SAY.ohNo : SAY.farOff, { interrupt: true });
    }
    for (const p of this.players) {
      this.rt.emote(p.playerId, raw >= 3 ? "cheer" : "sad", 2400);
      // Exposure to both adjectives of the spectrum; "correct" when the pair understood each other.
      const outcome = raw >= 3 ? "correct" : "wrong";
      this.rt.evidence(p, this.spectrum.left.id, "wave.dial", outcome);
      this.rt.evidence(p, this.spectrum.right.id, "wave.dial", outcome);
      this.rt.addScore(p, this.lastPoints * 25, "wave");
    }
    this.rt.refreshViews();
    this.rt.bump();
  }

  private next() {
    this.round++;
    this.offAir = !this.inPractice && this.signals <= 0 && this.round > 0;
    if (this.round >= ROUNDS || this.offAir) {
      this.phase = "end";
      setHurry(false);
      // Still on air at the end: every signal left is a bonus.
      if (!this.offAir) this.score += SIGNAL_BONUS * this.signals;
      this.rt.bump();
      const bulls = this.history.filter((h) => h.points >= BULLSEYE).length;
      // Bets can double a bullseye, so ⭐⭐⭐ needs bullseyes *and* a brave bet or two.
      const max = this.maxScore;
      const headline = this.score >= max * 0.85 ? "Telepatia! 🔮" : this.score >= max * 0.6 ? "Na mesma onda!" : this.score >= max * 0.35 ? "Boa onda!" : "Quase… outra vez?";
      const headlineEn = this.score >= max * 0.85 ? "Telepathy!" : this.score >= max * 0.6 ? "On the same wavelength!" : this.score >= max * 0.35 ? "Good vibes!" : "Almost… again?";
      this.onDone({
        score: this.score,
        max,
        headline: this.offAir ? `Sem sinal! 📻 ${this.score} pontos` : `${headline} ${this.score} pontos`,
        headlineEn: this.offAir ? `Off the air! ${this.score} points` : `${headlineEn} ${this.score} points`,
        sub: this.offAir ? `A rádio saiu do ar no mostrador ${this.history.length} · ${bulls} em cheio` : `${bulls} em cheio · ainda no ar com ${this.signals} sina${this.signals === 1 ? "l" : "is"}: +${SIGNAL_BONUS * this.signals}`,
        subEn: this.offAir ? `The show went off-air after ${this.history.length} dials` : `${bulls} bullseye${bulls === 1 ? "" : "s"} · still on air: signal bonus`,
        words: this.history.map((h) => ({ pt: h.clue, en: h.clueEn, pic: h.cluePic })),
        contrib: Object.fromEntries(this.contrib),
        highlight: (() => {
          const best = [...this.history].sort((x, y) => y.points - x.points)[0];
          return best && best.points >= BULLSEYE ? { pt: `Em cheio com “${best.clue}”!`, en: `Bullseye with “${best.clueEn ?? best.clue}”`, pic: best.cluePic } : undefined;
        })(),
      });
      return;
    }
    this.newRound();
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.phase === "end") return { mode: "wait", title: "Fim!", subtitle: `${this.score} pontos · points`, pic: "🔮" };
    const partner = this.rt.partnerOf(p)?.name ?? "";
    const isPsychic = p === this.psychic;
    const solo = this.players.length < 2;
    const phase = this.phase === "suspense" ? "guess" : this.phase;
    const role = phase === "clue" ? (isPsychic ? "psychic" : "watch") : p === this.guesser ? "guess" : isPsychic ? "psychic" : "watch";
    const showTarget = this.phase === "reveal" || (isPsychic && !(solo && phase === "guess"));
    return {
      mode: "dial",
      roundId: this.roundId,
      promptId: this.promptId,
      role: solo && phase === "guess" ? "guess" : role,
      partner,
      left: word(this.spectrum.left),
      right: word(this.spectrum.right),
      target: showTarget ? this.target : undefined,
      value: this.value,
      clues: phase === "clue" && (isPsychic || solo) ? this.clues.map(({ pt, en, pic }) => ({ pt, en, pic })) : undefined,
      clue: this.clue ? { pt: this.clue.pt, en: this.clue.en, pic: this.clue.pic } : undefined,
      phase,
      bands: this.rules.bands,
      locked: this.phase === "suspense",
      final: this.final,
      sure: this.phase === "reveal" ? this.sure : undefined,
      psychicBet: isPsychic || this.phase === "reveal" ? (this.psychicBet ?? undefined) : undefined,
      betWon: this.phase === "reveal" && this.psychicBet ? this.betWon : undefined,
      msLeft: !this.inPractice && (phase === "clue" || (phase === "guess" && this.phase !== "suspense")) ? this.msLeft : undefined,
      points: this.phase === "reveal" ? this.lastPoints : undefined,
      practice: this.inPractice || undefined,
      signals: this.inPractice ? undefined : this.signals,
      debugAnswer: this.rt.testMode ? { target: this.target, ats: this.clues.map((c) => c.at ?? 50) } : undefined,
    };
  }
}
