/**
 * Em Sintonia — telepathy for two (Mind Meld / Just One spirit).
 *
 * Two words appear ("o gelado + a neve"). Each of you secretly picks or writes ONE word that links
 * them; 3, 2, 1… if you both chose the same word, you're in sync. Every pair is drawn from a real
 * link (frio, grande, fruta, praia…), each phone gets its OWN shuffled options (on medium only 6
 * of 8, on hard none — you type), and a match on an unrelated word needs you both to agree it makes
 * sense. Three tries per pair (you see each other's last words); the last pair counts double.
 */
import { ALL_ITEMS, getItem } from "../../curriculum/index.ts";
import { cardOf, type LearnCard } from "../../curriculum/learn.ts";
import type { Lesson } from "../../curriculum/schema.ts";
import { stripAccents } from "../../shared/answer-check.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, Word } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import type { GameOutcome } from "../../tv/activities.ts";
import { CUE, SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";
import { LINKS, linksOf, type Link } from "./links.ts";
import { selectItem } from "../../learner/selector.ts";

export const ROUNDS = 5;
export const ATTEMPTS = 3;
const COUNTDOWN_MS = 3200;
const REVEAL_MS = 3800;
const SENSE_MS = 15_000;
/** Difficulty: seconds to choose, and how many of the 8 options each phone sees (0 = type only). */
/**
 * Difficulty: time, how many word chips each phone gets (0 = type only), and tries per pair.
 * On Fácil both banks hold the intended link; on Médio only ONE phone has it — the other must
 * think of it (or type it); on Difícil you type.
 */
export const LEVEL_RULES: Record<Level, { writeMs: number; options: number; tries: number; linkInBoth: boolean }> = {
  1: { writeMs: 45_000, options: 8, tries: 3, linkInBoth: true },
  2: { writeMs: 35_000, options: 6, tries: 2, linkInBoth: false },
  3: { writeMs: 30_000, options: 0, tries: 2, linkInBoth: false },
};

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

/** Points for a match on attempt 1/2/3, doubled on the last pair. */
export function matchPoints(attempt: number, final: boolean): number {
  return (ATTEMPTS + 1 - attempt) * (final ? 2 : 1);
}

function memberCard(m: string): LearnCard | null {
  const it = getItem(m.startsWith("prof:") ? `vocab.profession.${m.slice(5)}` : `vocab.noun.${m}`);
  return it ? cardOf(it) : null;
}

export class EmSintonia implements Activity {
  readonly id = "sync";
  readonly pausable = true;
  rt!: TvRuntime;
  level: Level = 1;
  practice = false;
  round = 0;
  attempt = 1;
  phase: "write" | "countdown" | "reveal" | "sense" | "end" = "write";
  phaseEnd = 0;
  pair!: [Word, Word];
  /** The link this pair was drawn from (one good answer — there may be others). */
  link!: Link;
  submitted = new Map<string, string>();
  /** Previous attempt's words, shown as a nudge. */
  previous: { name: string; word: string }[] = [];
  senseVotes = new Map<string, boolean>();
  /** "Vamos coincidir?" predictions, and who got theirs right at the last reveal. */
  predictions = new Map<string, boolean>();
  rightPredictions: RuntimePlayer[] = [];
  lastMatch = false;
  score = 0;
  matches: { words: [string, string]; word: string; attempt: number }[] = [];
  banks = new Map<string, Word[]>();
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private pairMembers: [string, string] = ["", ""];
  private pool: LearnCard[] = [];
  private usedLinks = new Set<Link>();
  private readonly lessons: Lesson[];
  private readonly onDone: (r: GameOutcome) => void;

  constructor(lessons: Lesson[], onDone: (r: GameOutcome) => void) {
    this.lessons = lessons;
    this.onDone = onDone;
  }

  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }
  get rules() {
    return LEVEL_RULES[this.level];
  }
  get final() {
    return this.round === ROUNDS - 1;
  }
  /** Round -1 is the practice pair ("Ensaio") on the first plays: no timer, no points. */
  get inPractice() {
    return this.round < 0;
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.pool = ALL_ITEMS.map(cardOf).filter((c): c is LearnCard => !!c && c.short);
    if (this.practice) this.round = -1;
    this.newRound();
  }

  private toWord(c: LearnCard): Word {
    return { pt: c.pt.split(" · ")[0]!, en: c.en, pic: c.emoji };
  }

  private newRound() {
    // A link with two members from the curriculum, not used yet this game.
    const fromLessons = new Set(this.lessons.flatMap((l) => l.itemIds));
    const candidates = LINKS.filter((l) => !this.usedLinks.has(l) && l.members.filter((m) => memberCard(m)).length >= 2);
    const scored = this.rt.rng.shuffle(candidates).sort((a, b) => lessonHits(b) - lessonHits(a));
    function lessonHits(l: Link) {
      return l.members.filter((m) => fromLessons.has(m.startsWith("prof:") ? `vocab.profession.${m.slice(5)}` : `vocab.noun.${m}`)).length;
    }
    // The learner model picks a word (lesson / someone's weak word / older); use a link it belongs to.
    const memberItem = (m: string) => getItem(m.startsWith("prof:") ? `vocab.profession.${m.slice(5)}` : `vocab.noun.${m}`);
    const sel = selectItem(
      {
        candidates: [...new Set(candidates.flatMap((l) => l.members))].map(memberItem).filter((i) => !!i),
        lessonItemIds: fromLessons,
        profiles: this.players.map((p) => p.profile),
        recent: [],
      },
      this.rt.rng,
    );
    const chosen = sel ? scored.find((l) => l.members.some((m) => memberItem(m)?.id === sel.item.id)) : undefined;
    this.link = chosen ?? scored[0] ?? this.rt.rng.pick(LINKS);
    this.usedLinks.add(this.link);
    const [m1, m2] = this.rt.rng.sample(
      this.link.members.filter((m) => memberCard(m)),
      2,
    ) as [string, string];
    this.pairMembers = [m1, m2];
    this.pair = [this.toWord(memberCard(m1)!), this.toWord(memberCard(m2)!)];
    this.attempt = 1;
    this.previous = [];
    this.startAttempt();
  }

  /** Link words that genuinely connect this pair (any of them counts without a vote). */
  goodLinks(): Link[] {
    const [a, b] = this.pairMembers;
    return [...new Set([...linksOf(a), ...linksOf(b)])];
  }

  private dealBanks() {
    this.banks.clear();
    const n = this.rules.options;
    if (!n) return;
    const good = this.goodLinks();
    const others = this.rt.rng.shuffle(LINKS.filter((l) => !good.includes(l)));
    const otherGood = this.rt.rng.shuffle(good.filter((l) => l !== this.link));
    // Who gets the intended link on its chips (everyone on Fácil; one random phone otherwise).
    const lucky = this.rt.rng.pick(this.players);
    for (const p of this.players) {
      const withLink = this.rules.linkInBoth || p === lucky;
      const head = withLink ? [this.link] : [];
      // A couple of other plausible links, then unrelated words; everyone gets their own mix and order.
      const mine = [...head, ...this.rt.rng.sample(otherGood, Math.min(otherGood.length, 2)), ...this.rt.rng.sample(others, n)].slice(0, n);
      this.banks.set(
        p.playerId,
        this.rt.rng.shuffle(mine).map((l) => ({ pt: l.pt, en: l.en, pic: l.pic })),
      );
    }
  }

  /** Both answers were real links for the pair, just different ones ("frio" vs "bebida"). */
  get closeMiss(): boolean {
    const norms = this.players.map((p) => normWord(this.submitted.get(p.playerId) ?? ""));
    const good = this.goodLinks().map((l) => normWord(l.pt));
    return norms.length === 2 && norms.every((w) => w && good.includes(w));
  }

  private startAttempt() {
    this.phase = "write";
    this.phaseEnd = gameNow() + (this.inPractice ? 600_000 : this.rules.writeMs);
    this.submitted.clear();
    this.senseVotes.clear();
    this.predictions.clear();
    this.promptId = randomId(6);
    this.dealBanks();
    play("whoosh");
    if (this.final && this.attempt === 1) this.rt.say(SAY.finalRound);
    this.rt.cue(CUE.write);
    this.rt.speakPt(this.pair[0].pt);
    setTimeout(() => this.rt.activity === this && this.rt.speakPt(this.pair[1].pt), 1200);
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick(now: number) {
    if (this.phase === "write" && now >= this.phaseEnd) {
      // Time's up: anyone who didn't choose loses this try.
      for (const p of this.players) if (!this.submitted.has(p.playerId)) this.submitted.set(p.playerId, "");
      this.rt.say(SAY.timeUp);
      return this.toCountdown(now);
    }
    if (this.phase === "countdown" && now >= this.phaseEnd) return this.reveal(now);
    if (this.phase === "sense" && now >= this.phaseEnd) return this.resolveSense();
    if (this.phase === "reveal" && now >= this.phaseEnd) return this.afterReveal();
  }

  repeat() {
    this.rt.speakPt(this.pair[0].pt);
    setTimeout(() => this.rt.activity === this && this.rt.speakPt(this.pair[1].pt), 1200);
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode === "skip" && this.inPractice) {
      this.round = 0;
      return this.newRound();
    }
    if (value.mode !== "sync" || promptId !== this.promptId) return;
    if (this.phase === "sense" && value.sense !== undefined && !this.senseVotes.has(p.playerId)) {
      this.senseVotes.set(p.playerId, value.sense);
      play("lock");
      if (this.players.every((x) => this.senseVotes.has(x.playerId))) this.resolveSense();
      else this.rt.bump();
      return;
    }
    // After locking in: "Vamos coincidir?" — a correct prediction is worth a point.
    if (value.predict !== undefined && (this.phase === "write" || this.phase === "countdown") && this.submitted.has(p.playerId) && !this.predictions.has(p.playerId)) {
      this.predictions.set(p.playerId, value.predict);
      play("tap");
      this.rt.view(p, this.viewFor(p));
      this.rt.bump();
      return;
    }
    if (this.phase !== "write" || !value.word || this.submitted.has(p.playerId)) return;
    this.submitted.set(p.playerId, value.word.trim());
    play("lock");
    this.rt.emote(p.playerId, "think", 1500);
    if (this.players.every((x) => this.submitted.has(x.playerId))) this.toCountdown(gameNow());
    this.rt.refreshViews();
    this.rt.bump();
  }

  private toCountdown(now: number) {
    this.phase = "countdown";
    this.phaseEnd = now + COUNTDOWN_MS;
    // The roll is ~2 s and ends exactly where the cymbal (the reveal) starts.
    setTimeout(() => this.rt.activity === this && this.phase === "countdown" && play("drumroll"), COUNTDOWN_MS - 2050);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private reveal(now: number) {
    this.rt.holdPhones(1800);
    this.phase = "reveal";
    this.phaseEnd = now + REVEAL_MS;
    play("cymbal");
    const words = this.players.map((p) => this.submitted.get(p.playerId) ?? "");
    const norms = words.map(normWord);
    const same = this.players.length < 2 ? !!norms[0] : norms[0] !== "" && norms[0] === norms[1];
    for (const p of this.players) {
      const w = this.submitted.get(p.playerId) ?? "";
      const c = w ? cardForWord(w, this.pool) : undefined;
      if (c) this.rt.evidence(p, c.itemId, "sync.produce", "correct", 2);
    }
    if (same && !this.goodLinks().some((l) => normWord(l.pt) === norms[0])) {
      // Same word, but not an obvious link: does it make sense? Both decide.
      this.phase = "sense";
      this.phaseEnd = now + SENSE_MS;
      this.promptId = randomId(6);
      this.rt.say(SAY.makesSense);
      play("crowd-ooh");
      this.rt.refreshViews();
      this.rt.bump();
      return;
    }
    this.settle(same);
  }

  private resolveSense() {
    const yes = this.players.every((p) => this.senseVotes.get(p.playerId) === true);
    this.phase = "reveal";
    this.phaseEnd = gameNow() + REVEAL_MS;
    this.settle(yes);
  }

  private settle(match: boolean) {
    this.lastMatch = match;
    // Predictions that came true: +1 each.
    this.rightPredictions = this.players.filter((p) => this.predictions.get(p.playerId) === match);
    if (!this.inPractice) this.score += this.rightPredictions.length;
    const words = this.players.map((p) => this.submitted.get(p.playerId) ?? "");
    if (match) {
      const pts = this.inPractice ? 0 : matchPoints(this.attempt, this.final);
      this.score += pts;
      if (!this.inPractice) this.matches.push({ words: [this.pair[0].pt, this.pair[1].pt], word: words[0] ?? "", attempt: this.attempt });
      play(this.attempt === 1 ? "fanfare" : "match");
      this.rt.celebrate();
      for (const p of this.players) {
        this.rt.emote(p.playerId, "cheer", 2600);
        this.rt.addScore(p, pts * 50, "sync");
      }
      this.rt.say(this.attempt === 1 ? SAY.perfect : SAY.inSync);
      this.rt.speakPt(words[0]);
    } else {
      play("sad-trombone", 0.6);
      for (const p of this.players) this.rt.emote(p.playerId, "think", 2000);
      this.rt.say(this.closeMiss ? SAY.close : SAY.notQuite);
    }
    this.rt.refreshViews();
    this.rt.bump();
  }

  private afterReveal() {
    if (this.lastMatch || this.attempt >= this.rules.tries) {
      this.round++;
      if (this.round >= ROUNDS) return this.finish();
      return this.newRound();
    }
    // Same pair again — now you know what the other one was thinking.
    this.previous = this.players.map((p) => ({ name: p.name, word: this.submitted.get(p.playerId) || "—" }));
    this.attempt++;
    this.startAttempt();
  }

  private finish() {
    this.phase = "end";
    play("success-jingle");
    this.rt.bump();
    const n = this.matches.length;
    this.onDone({
      score: this.score,
      max: 3 * (ROUNDS - 1) + 6,
      headline: `${n} de ${ROUNDS} em sintonia · ${this.score} pontos`,
      headlineEn: `In sync on ${n} of ${ROUNDS} pairs`,
      sub: n ? `Palavras: ${this.matches.map((m) => m.word).join(", ")}` : "Continuem a tentar!",
      subEn: n ? "Your shared words" : "Keep trying!",
      words: this.matches.map((m) => ({ pt: m.word })),
      highlight: this.matches[0] ? { pt: `Os dois pensaram “${this.matches[0].word}”!`, en: `You both thought “${this.matches[0].word}”`, pic: "🤝" } : undefined,
    });
  }

  /** Words as submitted, for the TV reveal. */
  submittedBy(p: RuntimePlayer): string | undefined {
    return this.submitted.get(p.playerId);
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Em Sintonia precisa de 2", subtitle: "Chama o teu par para jogar! · Needs two players", pic: "🤝" };
    if (this.phase === "end") return { mode: "wait", title: "Fim!", subtitle: `${this.score} pontos`, pic: "🔮" };
    // During the 3-2-1 you can still make your prediction; after that, eyes on the TV.
    if (this.phase === "countdown" && (this.predictions.has(p.playerId) || this.inPractice || this.players.length < 2))
      return { mode: "wait", title: "3… 2… 1…", subtitle: "Olha para a TV! · Look at the TV!", pic: "👀" };
    if (this.phase === "reveal")
      return {
        mode: "wait",
        title: this.lastMatch ? "Em sintonia! 🎉" : this.closeMiss ? "Quase!" : "Nada disso!",
        subtitle: this.lastMatch ? "In sync!" : `${this.closeMiss ? "So close" : "Not quite"} — ${this.attempt < this.rules.tries ? "same pair again. Olha para a TV!" : "next pair. Olha para a TV!"}`,
        pic: this.lastMatch ? "🥳" : "🤔",
      };
    const base = {
      mode: "sync" as const,
      roundId: this.roundId,
      promptId: this.promptId,
      words: this.pair,
      attempt: this.attempt,
      tries: this.rules.tries,
      final: this.final || undefined,
      msLeft: this.inPractice ? undefined : this.msLeft,
      previous: this.previous.length ? this.previous : undefined,
      practice: this.inPractice || undefined,
    };
    if (this.phase === "sense")
      return { ...base, bank: [], submitted: true, sense: { word: this.submitted.get(p.playerId) ?? "", voted: this.senseVotes.has(p.playerId) } };
    return {
      ...base,
      bank: this.banks.get(p.playerId) ?? [],
      submitted: this.submitted.has(p.playerId),
      mine: this.submitted.get(p.playerId) || undefined,
      predicted: this.predictions.get(p.playerId),
      debugAnswer: this.rt.testMode ? { word: this.link.pt } : undefined,
    };
  }
}
