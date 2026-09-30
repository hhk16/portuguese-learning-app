/**
 * Na Mesma Onda — co-op dial game for two (Wavelength's two-player mode, A1 edition).
 *
 * A dial between two opposites (frio ↔ quente). The psychic's phone shows where the hidden target
 * is; they say ONE Portuguese word as a clue ("gelado!") — their phone offers picture ideas of
 * words they know. The partner turns the dial on their phone (the TV dial moves live), then locks
 * it. Closer = more points. Six dials, taking turns.
 */
import { ALL_ITEMS } from "../../curriculum/index.ts";
import { cardOf, type LearnCard } from "../../curriculum/learn.ts";
import type { ItemOf } from "../../curriculum/schema.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, Word } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

export const ROUNDS = 6;
/** Half-widths of the scoring bands (dial is 0..100). */
export const BANDS: [number, number][] = [
  [4, 4],
  [9, 3],
  [14, 2],
];

export function pointsFor(target: number, value: number): number {
  const d = Math.abs(target - value);
  for (const [w, pts] of BANDS) if (d <= w) return pts;
  return 0;
}

export const RATING: [number, string][] = [
  [20, "Telepatia! 🔮"],
  [14, "Em sintonia!"],
  [8, "Boa onda!"],
  [0, "Quase… outra vez?"],
];

export interface WaveResult {
  score: number;
  max: number;
  rating: string;
}

interface Spectrum {
  left: ItemOf<"adjective">;
  right: ItemOf<"adjective">;
}

function spectra(): Spectrum[] {
  const adj = ALL_ITEMS.filter((i): i is ItemOf<"adjective"> => i.kind === "adjective");
  const out: Spectrum[] = [];
  for (const a of adj) {
    const b = adj.find((x) => x.id === a.opposite);
    if (b && a.id < b.id && !out.some((s) => s.left === b)) out.push({ left: a, right: b });
  }
  return out;
}

const word = (a: ItemOf<"adjective">): Word => ({ pt: a.m, en: a.en, pic: a.emoji });

export class NaMesmaOnda implements Activity {
  readonly id = "wave";
  readonly pausable = true;
  rt!: TvRuntime;
  round = 0;
  phase: "clue" | "guess" | "reveal" | "end" = "clue";
  spectrum!: Spectrum;
  target = 50;
  value = 50;
  score = 0;
  lastPoints = 0;
  history: { spectrum: Spectrum; target: number; value: number; points: number }[] = [];
  ideas: LearnCard[] = [];
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private deck: Spectrum[] = [];
  private readonly onDone: (r: WaveResult) => void;
  private lastMoveSent = 0;

  constructor(onDone: (r: WaveResult) => void) {
    this.onDone = onDone;
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
    this.phase = "clue";
    this.promptId = randomId(6);
    const nouns = ALL_ITEMS.filter((i) => i.kind === "noun" || i.kind === "profession").map(cardOf).filter((c): c is LearnCard => !!c && !!c.emoji);
    this.ideas = this.rt.rng.sample(nouns, 12);
    play("whoosh");
    this.rt.speakPt(`${this.spectrum.left.m} ou ${this.spectrum.right.m}?`);
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick() {}

  repeat() {
    this.rt.speakPt(`${this.spectrum.left.m} ou ${this.spectrum.right.m}?`);
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode !== "dial" || this.phase === "end") return;
    const a = value.action;
    if (a.a === "clued" && this.phase === "clue" && p === this.psychic && promptId === this.promptId) {
      this.phase = "guess";
      this.promptId = randomId(6);
      play("select");
      this.rt.emote(p.playerId, "think", 2200);
      this.rt.refreshViews();
      this.rt.bump();
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
      if (Math.random() < 0.15) play("tick", 0.4);
      return;
    }
    if (a.a === "lock" && this.phase === "guess" && p === this.guesser && promptId === this.promptId) return this.reveal();
    if (a.a === "next" && this.phase === "reveal" && promptId === this.promptId) return this.next();
  }

  onNav(dir: string) {
    if (dir === "ok" && this.phase === "reveal") this.next();
  }

  private reveal() {
    this.phase = "reveal";
    this.promptId = randomId(6);
    this.lastPoints = pointsFor(this.target, this.value);
    this.score += this.lastPoints;
    this.history.push({ spectrum: this.spectrum, target: this.target, value: this.value, points: this.lastPoints });
    play(this.lastPoints >= 3 ? "success-jingle" : this.lastPoints > 0 ? "correct" : "wrong");
    if (this.lastPoints >= 3) this.rt.celebrate();
    for (const p of this.players) {
      this.rt.emote(p.playerId, this.lastPoints >= 2 ? "cheer" : "sad", 2400);
      // Exposure to both adjectives of the spectrum; "correct" when the pair understood each other.
      const outcome = this.lastPoints >= 2 ? "correct" : "wrong";
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
      this.rt.bump();
      const rating = RATING.find(([min]) => this.score >= min)![1];
      this.onDone({ score: this.score, max: ROUNDS * 4, rating });
      return;
    }
    this.newRound();
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.phase === "end") return { mode: "wait", title: "Fim!", subtitle: `${this.score} pontos`, pic: "🔮" };
    const partner = this.rt.partnerOf(p)?.name ?? "";
    const isPsychic = p === this.psychic;
    const solo = this.players.length < 2;
    const role = this.phase === "clue" ? (isPsychic ? "psychic" : "watch") : p === this.guesser ? "guess" : isPsychic ? "psychic" : "watch";
    const showTarget = this.phase === "reveal" || (isPsychic && !(solo && this.phase === "guess"));
    return {
      mode: "dial",
      roundId: this.roundId,
      promptId: this.promptId,
      role: solo && this.phase === "guess" ? "guess" : role,
      partner,
      left: word(this.spectrum.left),
      right: word(this.spectrum.right),
      target: showTarget ? this.target : undefined,
      value: this.value,
      ideas: isPsychic && this.phase === "clue" ? this.ideas.map((c) => ({ pt: c.pt, en: c.en, pic: c.emoji })) : undefined,
      phase: this.phase,
      points: this.phase === "reveal" ? this.lastPoints : undefined,
      debugAnswer: this.rt.testMode ? { target: this.target } : undefined,
    };
  }
}
