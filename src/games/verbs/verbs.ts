/**
 * Quem faz o quê? — a verb game for two (write it, read it), both at once.
 *
 * Each round you BOTH pick a card — easy (a regular verb, ×1) or risky (an irregular one, ×2) — and
 * write the verb for it ("👫 nós + 🍽️" → comemos). Then you swap: each reads only the other's written
 * word and decodes who (the ending: -o eu, -as/-es tu, -a/-e ele, -amos nós, -am eles) and what (the
 * stem). The TV shows both messages and the whole present-tense rows. A message that doesn't get
 * through costs a team heart; the last round counts double.
 */
import { ALL_ITEMS } from "../../curriculum/index.ts";
import type { ItemOf } from "../../curriculum/schema.ts";
import { matchAnswer } from "../../shared/answer-check.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import type { GameOutcome } from "../../tv/activities.ts";
import { CUE, PET, SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";

export type Person = "eu" | "tu" | "ele" | "nos" | "eles";
export const PERSONS: Person[] = ["eu", "tu", "ele", "nos", "eles"];
export const PERSON_LABEL: Record<Person, { pt: string; pic: string }> = {
  eu: { pt: "eu", pic: "🙋" },
  tu: { pt: "tu", pic: "👉" },
  ele: { pt: "ele / ela", pic: "🧍" },
  nos: { pt: "nós", pic: "👫" },
  eles: { pt: "eles / elas", pic: "👥" },
};

/** Verbs a picture can show, with their English. Reflexives only on Difícil. */
export const VERB_PICS: Record<string, { pic: string; en: string; hard?: boolean }> = {
  falar: { pic: "🗣️", en: "to speak" },
  morar: { pic: "🏠", en: "to live (somewhere)" },
  trabalhar: { pic: "💼", en: "to work" },
  estudar: { pic: "📚", en: "to study" },
  comer: { pic: "🍽️", en: "to eat" },
  beber: { pic: "🥤", en: "to drink" },
  aprender: { pic: "🎓", en: "to learn" },
  ler: { pic: "📖", en: "to read" },
  ir: { pic: "🚶", en: "to go" },
  sair: { pic: "🚪", en: "to go out" },
  dormir: { pic: "😴", en: "to sleep" },
  ver: { pic: "👀", en: "to see" },
  dar: { pic: "🎁", en: "to give" },
  pedir: { pic: "🛎️", en: "to ask for" },
  saber: { pic: "🧠", en: "to know" },
  dizer: { pic: "💬", en: "to say" },
  ficar: { pic: "🛋️", en: "to stay" },
  fazer: { pic: "🥘", en: "to make / cook" },
  querer: { pic: "🙏", en: "to want" },
  ter: { pic: "🎒", en: "to have" },
  perceber: { pic: "💡", en: "to understand" },
  "gostar (de)": { pic: "❤️", en: "to like" },
  "levantar-se": { pic: "⏰", en: "to get up", hard: true },
  "deitar-se": { pic: "🛏️", en: "to go to bed", hard: true },
  "vestir-se": { pic: "👕", en: "to get dressed", hard: true },
};

export const ROUNDS = 4;
export const HEARTS = 3;
const PICK_MS = 12_000;
const READ_MS = 20_000;
const REVEAL_MS = 7000;
/** Points per message: the writer's form, the reader's person and action, a bonus when all three land; ×2 on a risky card. */
export const WRITE_POINTS = 2;
export const BONUS = 1;
/** Fácil shows the infinitive, Médio the English, Difícil only the picture. */
export const LEVEL_RULES: Record<Level, { writeMs: number; hint: "infinitive" | "english" | "none"; options: number; endings: boolean }> = {
  1: { writeMs: 45_000, hint: "infinitive", options: 4, endings: true },
  2: { writeMs: 35_000, hint: "english", options: 4, endings: false },
  3: { writeMs: 28_000, hint: "none", options: 6, endings: false },
};
/** Regular verbs (easy cards); every other pictured verb is a risky card. */
export const REGULAR = new Set(["falar", "morar", "trabalhar", "estudar", "comer", "beber", "aprender", "perceber", "gostar (de)"]);

type Conj = ItemOf<"conjugation">;

/** Every verb's present tense, person → item (only verbs we can picture, all five persons known). */
export function verbTable(): Map<string, Map<Person, Conj>> {
  const t = new Map<string, Map<Person, Conj>>();
  for (const it of ALL_ITEMS)
    if (it.kind === "conjugation" && it.tense === "presente" && VERB_PICS[it.verb]) {
      const row = t.get(it.verb) ?? new Map<Person, Conj>();
      row.set(it.person as Person, it);
      t.set(it.verb, row);
    }
  for (const [v, row] of t) if (row.size < 5) t.delete(v);
  return t;
}

const clean = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[.,!?¿¡]/g, "")
    .replace(/^(eu|tu|ele|ela|você|nós|nos|eles|elas|vocês)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();

/** Judge a written form against the target ("correct" includes a slipped accent, flagged separately). */
export function judgeForm(written: string, form: string): { ok: boolean; accent: boolean } {
  const m = matchAnswer(clean(written), [form]);
  return { ok: m === "correct" || m === "accent-slip", accent: m === "accent-slip" };
}

/** Which persons a written form says (several when forms coincide; empty when it isn't a form of this verb). */
export function personsOf(written: string, row: Map<Person, Conj>): Person[] {
  const w = clean(written);
  return PERSONS.filter((p) => {
    const f = row.get(p)?.form;
    return !!f && ["correct", "accent-slip"].includes(matchAnswer(w, [f]));
  });
}

interface Card {
  verb: string;
  person: Person;
  item: Conj;
  risky: boolean;
}

/** One player's message this round: their card, what they wrote, and how the partner read it. */
export interface Msg {
  writer: string;
  reader: string;
  offers: { easy: Card; risky: Card };
  card?: Card;
  options: string[];
  written?: string;
  pick?: { person?: Person; verb?: string };
  result?: { form: boolean; accent: boolean; person: boolean; verb: boolean; points: number };
}

export class QuemFazOQue implements Activity {
  readonly id = "verbs";
  readonly pausable = true;
  rt!: TvRuntime;
  level: Level = 1;
  practice = false;
  phase: "pick" | "write" | "read" | "reveal" | "end" = "pick";
  phaseEnd = 0;
  round = 0;
  hearts = HEARTS;
  score = 0;
  perfect = 0;
  risky = 0;
  /** This round's two messages (one written by each player). */
  msgs: Msg[] = [];
  history: Msg[] = [];
  promptId = randomId(6);
  contrib = new Map<string, number>();
  private readonly roundId = randomId(6);
  private table = verbTable();
  private used = new Set<string>();
  private readonly onDone: (o: GameOutcome) => void;

  constructor(onDone: (o: GameOutcome) => void) {
    this.onDone = onDone;
  }

  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }
  get rules() {
    return LEVEL_RULES[this.level];
  }
  get inPractice() {
    return this.round < 0;
  }
  get final() {
    return this.round === ROUNDS - 1;
  }
  get msLeft() {
    return Math.max(0, this.phaseEnd - gameNow());
  }
  /** About half the cards risky, the last round doubled. */
  get maxScore() {
    return Math.round((WRITE_POINTS + 2 + BONUS) * 2 * (ROUNDS + 1) * 1.5);
  }
  /** A verb's present-tense row, for the reveal. */
  rowOf(verb: string): { person: Person; form: string }[] {
    const row = this.table.get(verb)!;
    return PERSONS.map((p) => ({ person: p, form: row.get(p)!.form }));
  }
  msgBy(playerId: string): Msg | undefined {
    return this.msgs.find((m) => m.writer === playerId);
  }
  msgFor(playerId: string): Msg | undefined {
    return this.msgs.find((m) => m.reader === playerId);
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    for (const p of this.players) this.contrib.set(p.playerId, 1);
    if (this.practice) this.round = -1;
    this.newRound();
  }

  private card(risky: boolean): Card {
    const verbs = [...this.table.keys()].filter((v) => (this.level >= 3 || !VERB_PICS[v]!.hard) && REGULAR.has(v) !== risky);
    const fresh = verbs.filter((v) => !this.used.has(v));
    const verb = this.rt.rng.pick(fresh.length ? fresh : verbs);
    this.used.add(verb);
    // Every person comes up; nós and eles a bit more (the endings people mix up).
    const person = this.rt.rng.pick<Person>(["eu", "tu", "ele", "nos", "nos", "eles", "eles"]);
    return { verb, person, item: this.table.get(verb)!.get(person)!, risky };
  }

  private newRound() {
    const [a, b] = this.players;
    if (!a || !b) return;
    this.msgs = [a, b].map((w) => ({ writer: w.playerId, reader: (w === a ? b : a).playerId, offers: { easy: this.card(false), risky: this.card(true) }, options: [] }));
    // The practice round: easy cards, no choice.
    if (this.inPractice) for (const m of this.msgs) this.choose(m, false);
    this.phase = this.inPractice ? "write" : "pick";
    this.phaseEnd = gameNow() + (this.inPractice ? 600_000 : PICK_MS);
    this.promptId = randomId(6);
    play("whoosh");
    if (this.final) this.rt.say(SAY.finalRound);
    this.rt.cue(this.inPractice ? CUE.fill : { pt: "Fácil ou arriscada?", en: "Easy card ×1 or risky card ×2?" });
    this.rt.refreshViews();
    this.rt.bump();
  }

  private choose(m: Msg, risky: boolean) {
    m.card = risky ? m.offers.risky : m.offers.easy;
    const verbs = [...this.table.keys()].filter((v) => this.level >= 3 || !VERB_PICS[v]!.hard);
    m.options = this.rt.rng.shuffle([m.card.verb, ...this.rt.rng.sample(verbs.filter((v) => v !== m.card!.verb && VERB_PICS[v]!.pic !== VERB_PICS[m.card!.verb]!.pic), this.rules.options - 1)]);
  }

  private toWrite() {
    for (const m of this.msgs) if (!m.card) this.choose(m, false);
    this.phase = "write";
    this.phaseEnd = gameNow() + (this.inPractice ? 600_000 : this.rules.writeMs);
    this.promptId = randomId(6);
    this.rt.cue(CUE.fill);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private toRead() {
    for (const m of this.msgs) if (m.written === undefined) m.written = "";
    this.phase = "read";
    this.phaseEnd = gameNow() + (this.inPractice ? 600_000 : READ_MS);
    this.promptId = randomId(6);
    play("card-flip");
    this.rt.cue({ pt: "Troquem! Quem? O quê?", en: "Swap: read your partner's verb — who, doing what?" });
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick(now: number) {
    if (this.phase === "pick" && now >= this.phaseEnd) return this.toWrite();
    if (this.phase === "write" && now >= this.phaseEnd) {
      this.rt.say(SAY.timeUp);
      return this.toRead();
    }
    if (this.phase === "read" && now >= this.phaseEnd) return this.reveal();
    if (this.phase === "reveal" && now >= this.phaseEnd) this.next();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode === "skip" && this.inPractice) {
      this.round = 0;
      return this.newRound();
    }
    if (value.mode !== "verbs" || promptId !== this.promptId) return;
    if (this.phase === "pick" && value.choose) {
      const m = this.msgBy(p.playerId);
      if (!m || m.card) return;
      this.choose(m, value.choose === "risky");
      play("lock");
      if (this.msgs.every((x) => x.card)) return this.toWrite();
      this.rt.refreshViews();
      this.rt.bump();
      return;
    }
    if (this.phase === "write" && value.write) {
      const m = this.msgBy(p.playerId);
      if (!m || m.written !== undefined) return;
      m.written = value.write.slice(0, 30);
      play("lock");
      if (this.msgs.every((x) => x.written !== undefined)) return this.toRead();
      this.rt.refreshViews();
      this.rt.bump();
      return;
    }
    if (this.phase === "read" && value.pick) {
      const m = this.msgFor(p.playerId);
      if (!m || m.pick) return;
      m.pick = { person: value.pick.person as Person, verb: value.pick.verb };
      play("lock");
      if (this.msgs.every((x) => x.pick)) return this.reveal();
      this.rt.refreshViews();
      this.rt.bump();
    }
  }

  private judge(m: Msg) {
    const c = m.card!;
    const row = this.table.get(c.verb)!;
    const written = m.written ?? "";
    const form = written ? judgeForm(written, c.item.form) : { ok: false, accent: false };
    // The reader reads what was WRITTEN: a wrong form read correctly is still a right reading.
    const says = written ? personsOf(written, row) : [];
    const person = !!m.pick?.person && (says.length ? says.includes(m.pick.person) : m.pick.person === c.person);
    const verb = m.pick?.verb === c.verb;
    const all = form.ok && person && verb;
    const points = ((form.ok ? WRITE_POINTS : 0) + (person ? 1 : 0) + (verb ? 1 : 0) + (all ? BONUS : 0)) * (c.risky ? 2 : 1);
    m.result = { form: form.ok, accent: form.accent, person, verb, points };
    const writer = this.rt.players.get(m.writer);
    const reader = this.rt.players.get(m.reader);
    if (writer && written) this.rt.evidence(writer, c.item.id, "verbs.write", form.ok ? (form.accent ? "accent-slip" : "correct") : "wrong", 2);
    if (reader && m.pick) this.rt.evidence(reader, c.item.id, "verbs.read", person && verb ? "correct" : "wrong", 1);
    return all;
  }

  private reveal() {
    let lost = 0;
    let perfect = 0;
    for (const m of this.msgs) {
      const all = this.judge(m);
      const pts = m.result!.points * (this.final ? 2 : 1);
      if (!this.inPractice) {
        this.score += pts;
        if (all) this.perfect++;
        if (m.card!.risky) this.risky++;
        if (m.result!.form) this.contrib.set(m.writer, (this.contrib.get(m.writer) ?? 0) + 2);
        if (m.result!.person && m.result!.verb) this.contrib.set(m.reader, (this.contrib.get(m.reader) ?? 0) + 2);
        // The message didn't get through (who or what was misread): a heart.
        if (!(m.result!.person && m.result!.verb)) lost++;
      }
      if (all) perfect++;
    }
    for (const p of this.players) this.rt.addScore(p, this.msgs.reduce((s, m) => s + m.result!.points, 0) * 5, "verbs");
    if (lost) {
      this.hearts = Math.max(0, this.hearts - lost);
      play("sad-trombone", 0.6);
      this.rt.say(this.hearts > 0 ? SAY.lifeLost : SAY.livesOut);
    }
    if (perfect === 2) {
      play("star");
      this.rt.say(SAY.perfect);
      this.rt.celebrate();
      this.rt.petDo("cheer", 2400);
    } else if (perfect) this.rt.petDo("wave", 2200);
    else this.rt.petDo("think", 2200);
    for (const m of this.msgs) this.rt.emote(m.writer, m.result!.form && m.result!.person && m.result!.verb ? "cheer" : m.result!.points >= 3 ? "wave" : "sad", 2600);
    this.history.push(...this.msgs);
    this.phase = "reveal";
    this.phaseEnd = gameNow() + REVEAL_MS;
    // Hear both said right: "nós comemos", "eles vão".
    this.msgs.forEach((m, i) => setTimeout(() => this.rt.activity === this && this.rt.speakPt(`${{ eu: "eu", tu: "tu", ele: "ela", nos: "nós", eles: "eles" }[m.card!.person]} ${m.card!.item.form}`), 600 + i * 1800));
    this.rt.holdPhones(1200);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private next() {
    if (this.inPractice) {
      this.round = 0;
      this.score = 0;
      this.perfect = 0;
      this.risky = 0;
      this.history = [];
      this.hearts = HEARTS;
      this.rt.say(SAY.start);
      return this.newRound();
    }
    this.round++;
    if (this.round >= ROUNDS || this.hearts <= 0) return this.finish();
    this.newRound();
  }

  private finish() {
    this.phase = "end";
    const out = this.hearts <= 0;
    const n = this.history.length;
    play(out ? "fail-jingle" : "success-jingle");
    this.rt.bigMoment(out ? { pt: "💔 Sem corações!", en: "Out of hearts — the messages got lost" } : { pt: `🧩 ${this.perfect} de ${n} em cheio!`, en: `${this.perfect} of ${n} verbs written and read perfectly` }, out ? "lost" : "won", 2600, true);
    this.rt.petStar(out ? "oops" : "cheer", 2600);
    this.rt.bump();
    const label = (m: Msg) => `${PERSON_LABEL[m.card!.person].pt.split(" / ")[0]} ${m.card!.item.form}`;
    const wrong = this.history.filter((h) => h.result && !h.result.form);
    setTimeout(() => {
      if (this.rt.activity !== this) return;
      this.onDone({
        failed: out,
        minStars: !out && this.perfect >= n - 1 ? 3 : !out && this.perfect >= n / 2 ? 2 : undefined,
        score: this.score,
        max: this.maxScore,
        headline: `${this.perfect} de ${n} em cheio · ${this.score} pontos`,
        headlineEn: `${this.perfect} of ${n} verbs written and read · ${this.risky} risky cards`,
        sub: out ? "Acabaram-se os corações!" : `Escrever o verbo, ler quem o faz · ${this.risky} cartas arriscadas`,
        subEn: out ? "Out of hearts." : "Write the verb, read who does it.",
        words: this.history.slice(-3).map((h) => ({ pt: label(h), en: `${VERB_PICS[h.card!.verb]!.en.replace(/^to /, "")} (${PERSON_LABEL[h.card!.person].pt})`, pic: VERB_PICS[h.card!.verb]!.pic })),
        review: wrong.slice(-3).map((h) => ({ pt: label(h), en: `${h.card!.verb}: não “${h.written || "—"}”` })),
        contrib: Object.fromEntries(this.contrib),
        highlight: this.perfect ? { pt: `${this.perfect} verbos em cheio!`, en: `${this.perfect} verbs written and read perfectly`, pic: "🧩" } : undefined,
      });
    }, 2800);
  }

  private cardView(c: Card) {
    return {
      person: PERSON_LABEL[c.person],
      action: { pic: VERB_PICS[c.verb]!.pic, hint: this.rules.hint === "infinitive" ? c.verb : this.rules.hint === "english" ? VERB_PICS[c.verb]!.en : undefined },
    };
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Quem faz o quê? precisa de 2", subtitle: "Chama o teu par para jogar! · Needs two players", pic: "🧩" };
    if (this.phase === "end") return { mode: "wait", title: "Fim!", subtitle: `${this.score} pontos`, pic: "🧩" };
    const mine = this.msgBy(p.playerId);
    const theirs = this.msgFor(p.playerId);
    const partner = this.rt.partnerOf(p)?.name ?? "";
    if (this.phase === "reveal") {
      const m = theirs;
      const ok = !!m?.result && m.result.form && m.result.person && m.result.verb;
      const next = this.final || this.hearts <= 0 ? "then the results" : "then new cards";
      return { mode: "wait", title: ok ? "Em cheio! 🎉" : "Vê na TV o que falhou", subtitle: `Os dois verbos estão na TV · Both verbs are on the TV — ${next}`, pic: ok ? "🥳" : "🧩" };
    }
    const base = { mode: "verbs" as const, roundId: this.roundId, promptId: this.promptId, round: Math.max(0, this.round), rounds: ROUNDS, hearts: this.hearts, msLeft: this.inPractice ? undefined : this.msLeft, practice: this.inPractice || undefined, final: this.final || undefined };
    if (this.phase === "pick" && mine) {
      if (mine.card) return { ...base, role: "wait", other: partner };
      return {
        ...base,
        role: "pick",
        offers: [
          { id: "easy", mult: 1, ...this.cardView(mine.offers.easy) },
          { id: "risky", mult: 2, ...this.cardView(mine.offers.risky) },
        ],
        debugAnswer: this.rt.testMode ? { choose: this.rt.rng.next() < 0.4 ? "risky" : "easy" } : undefined,
      };
    }
    if (this.phase === "write" && mine?.card) {
      if (mine.written !== undefined) return { ...base, role: "wait", other: partner };
      const c = mine.card;
      return {
        ...base,
        role: "write",
        ...this.cardView(c),
        risky: c.risky || undefined,
        debugAnswer: this.rt.testMode ? { form: c.item.form, wrong: this.table.get(c.verb)!.get(c.person === "nos" ? "eles" : "nos")!.form } : undefined,
      };
    }
    if (this.phase === "read" && theirs?.card) {
      if (theirs.pick) return { ...base, role: "wait", other: partner, written: theirs.written };
      return {
        ...base,
        role: "read",
        other: partner,
        written: theirs.written ?? "",
        persons: PERSONS.map((x) => ({ id: x, ...PERSON_LABEL[x] })),
        actions: theirs.options.map((v) => ({ id: v, pic: VERB_PICS[v]!.pic, label: this.rules.hint !== "none" ? v : undefined })),
        endings: this.rules.endings || undefined,
        debugAnswer: this.rt.testMode ? { person: personsOf(theirs.written ?? "", this.table.get(theirs.card.verb)!)[0] ?? theirs.card.person, verb: theirs.card.verb } : undefined,
      };
    }
    return { ...base, role: "wait", other: partner };
  }
}
