/**
 * Na Mesma Onda — co-op dial game for two (Wavelength's two-player mode, A1 edition).
 *
 * A dial between two opposites (frio ↔ quente). The psychic's phone shows where the hidden target
 * is; they pick ONE clue on the phone — "muito frio", "um pouco quente" or a thing ("o gelado")
 * — and the TV says it out loud. The partner turns the dial (the TV dial moves live), can bet
 * "Tenho a certeza!" for double-or-nothing, then locks it. Drumroll, reveal. Closer = more points;
 * the last dial counts double. Harder levels: narrower bands, less time, things only (no
 * intensifiers).
 */
import { ALL_ITEMS } from "../../curriculum/index.ts";
import { cardOf, type LearnCard } from "../../curriculum/learn.ts";
import type { ItemOf } from "../../curriculum/schema.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, Word } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { setHurry } from "../../audio/music.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import type { GameOutcome } from "../../tv/activities.ts";
import { SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";
import { intensifiers, spectra, type Clue, type Spectrum } from "./scale.ts";

export const ROUNDS = 6;
/** Points in the bullseye; outer bands give 3 and 2. */
export const BULLSEYE = 4;

/** Difficulty: band half-widths (dial is 0..100), clue types, and timers. */
export const LEVEL_RULES: Record<Level, { bands: [number, number, number]; intensifiers: boolean; clueMs: number; guessMs: number }> = {
  1: { bands: [5, 10, 15], intensifiers: true, clueMs: 45_000, guessMs: 40_000 },
  2: { bands: [4, 8, 12], intensifiers: true, clueMs: 35_000, guessMs: 30_000 },
  3: { bands: [3, 7, 11], intensifiers: false, clueMs: 30_000, guessMs: 25_000 },
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

const word = (a: ItemOf<"adjective">): Word => ({ pt: a.m, en: a.en, pic: a.emoji });

export class NaMesmaOnda implements Activity {
  readonly id = "wave";
  readonly pausable = true;
  rt!: TvRuntime;
  level: Level = 1;
  round = 0;
  phase: "clue" | "guess" | "suspense" | "reveal" | "end" = "clue";
  spectrum!: Spectrum;
  target = 50;
  value = 50;
  score = 0;
  lastPoints = 0;
  sure = false;
  clue: Clue | null = null;
  phaseEnd = 0;
  history: { spectrum: Spectrum; clue: string; target: number; value: number; points: number }[] = [];
  ideas: LearnCard[] = [];
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private deck: Spectrum[] = [];
  private readonly onDone: (r: GameOutcome) => void;
  private lastMoveSent = 0;
  private hurried = false;

  constructor(onDone: (r: GameOutcome) => void) {
    this.onDone = onDone;
  }

  get rules() {
    return LEVEL_RULES[this.level];
  }
  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }
  get psychic(): RuntimePlayer | undefined {
    return this.players[this.round % Math.max(1, this.players.length)];
  }
  get guesser(): RuntimePlayer | undefined {
    return this.players.length < 2 ? this.players[0] : this.players[(this.round + 1) % 2];
  }
  get final() {
    return this.round === ROUNDS - 1;
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }
  get clues(): Clue[] {
    const nouns = this.ideas.map((c) => ({ pt: c.pt, en: c.en, pic: c.emoji }));
    return this.rules.intensifiers ? [...intensifiers(this.spectrum.left, this.spectrum.right), ...nouns.slice(0, 6)] : nouns;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.deck = rt.rng.shuffle(spectra());
    this.newRound();
  }

  private newRound() {
    this.spectrum = this.deck[this.round % this.deck.length]!;
    // Keep targets off the extreme ends so every band is reachable.
    this.target = 8 + this.rt.rng.int(85);
    this.value = 50;
    this.sure = false;
    this.clue = null;
    this.phase = "clue";
    this.phaseEnd = gameNow() + this.rules.clueMs;
    this.promptId = randomId(6);
    const nouns = ALL_ITEMS.filter((i) => i.kind === "noun").map(cardOf).filter((c): c is LearnCard => !!c && !!c.emoji);
    this.ideas = this.rt.rng.sample(nouns, 12);
    this.hurried = false;
    setHurry(false);
    play("whoosh");
    if (this.final) this.rt.say(SAY.finalRound);
    this.rt.speakPt(`${this.spectrum.left.m} ou ${this.spectrum.right.m}?`);
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
    // Out of time: the clue closest to the target is given for you; the dial locks where it is.
    if (this.phase === "clue") {
      const near = intensifiers(this.spectrum.left, this.spectrum.right).reduce((a, b) => (Math.abs(b.at! - this.target) < Math.abs(a.at! - this.target) ? b : a));
      this.giveClue(near);
    } else this.lock(false);
  }

  repeat() {
    if (this.clue) this.rt.speakPt(this.clue.pt);
    else this.rt.speakPt(`${this.spectrum.left.m} ou ${this.spectrum.right.m}?`);
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  private giveClue(c: Clue) {
    this.clue = c;
    this.phase = "guess";
    this.phaseEnd = gameNow() + this.rules.guessMs;
    this.hurried = false;
    setHurry(false);
    this.promptId = randomId(6);
    play("card-flip");
    // The TV says the clue: listening practice for the guesser.
    this.rt.speakPt(c.pt);
    if (this.psychic) this.rt.emote(this.psychic.playerId, "think", 2200);
    this.rt.refreshViews();
    this.rt.bump();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
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
    this.rt.refreshViews();
    this.rt.bump();
    setTimeout(() => this.rt.activity === this && this.phase === "suspense" && this.reveal(), 2050);
  }

  private reveal() {
    this.phase = "reveal";
    this.promptId = randomId(6);
    const raw = pointsFor(this.target, this.value, this.rules.bands);
    this.lastPoints = betPoints(raw, this.sure) * (this.final ? 2 : 1);
    this.score += this.lastPoints;
    this.history.push({ spectrum: this.spectrum, clue: this.clue?.pt ?? "", target: this.target, value: this.value, points: this.lastPoints });
    play("cymbal");
    if (raw >= BULLSEYE) {
      play(this.sure ? "fanfare" : "success-jingle");
      this.rt.celebrate();
      this.rt.say(SAY.perfect, { interrupt: true });
    } else if (raw > 0 && !(this.sure && this.lastPoints === 0)) {
      play("correct");
      this.rt.say(raw >= 3 ? SAY.good : SAY.close, { interrupt: true });
    } else {
      play(this.sure ? "sad-trombone" : "wrong");
      this.rt.say(SAY.ohNo, { interrupt: true });
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
    if (this.round >= ROUNDS) {
      this.phase = "end";
      setHurry(false);
      this.rt.bump();
      const bulls = this.history.filter((h) => h.points >= BULLSEYE).length;
      const max = ROUNDS * BULLSEYE + BULLSEYE;
      const headline = this.score >= max * 0.85 ? "Telepatia! 🔮" : this.score >= max * 0.6 ? "Em sintonia!" : this.score >= max * 0.35 ? "Boa onda!" : "Quase… outra vez?";
      const headlineEn = this.score >= max * 0.85 ? "Telepathy!" : this.score >= max * 0.6 ? "In tune!" : this.score >= max * 0.35 ? "Good vibes!" : "Almost… again?";
      this.onDone({
        score: this.score,
        max,
        headline: `${headline} ${this.score} pontos`,
        headlineEn: `${headlineEn} ${this.score} points`,
        sub: `${bulls} em cheio`,
        subEn: `${bulls} bullseye${bulls === 1 ? "" : "s"}`,
        words: this.history.slice(0, 4).map((h) => ({ pt: h.clue })),
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
      msLeft: phase === "clue" || (phase === "guess" && this.phase !== "suspense") ? this.msLeft : undefined,
      points: this.phase === "reveal" ? this.lastPoints : undefined,
      debugAnswer: this.rt.testMode ? { target: this.target } : undefined,
    };
  }
}
