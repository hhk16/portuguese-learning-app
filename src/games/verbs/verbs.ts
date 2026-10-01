/**
 * Quem faz o quê? — a verb game for two (write it, read it).
 *
 * One of you sees a person and an action ("👫 nós + 🍽️") and WRITES the verb: "comemos". The other sees
 * only that written word and READS it: who (the ending: -o eu, -as/-es tu, -a/-e ele, -amos nós, -am eles)
 * and what (the stem). Then the TV shows the whole present-tense row with the right one lit up.
 * The writer is judged on the form; the reader on what that written form says (a wrong form read
 * correctly still counts for the reader). Three hearts: a round where the message didn't get through
 * costs one. Roles swap every round; the last round counts double.
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
  pedir: { pic: "🙋", en: "to ask for" },
  saber: { pic: "🧠", en: "to know" },
  dizer: { pic: "💬", en: "to say" },
  ficar: { pic: "🛋️", en: "to stay" },
  fazer: { pic: "🍳", en: "to make / do" },
  querer: { pic: "🙏", en: "to want" },
  ter: { pic: "🎒", en: "to have" },
  perceber: { pic: "💡", en: "to understand" },
  "gostar (de)": { pic: "❤️", en: "to like" },
  "levantar-se": { pic: "⏰", en: "to get up", hard: true },
  "deitar-se": { pic: "🛏️", en: "to go to bed", hard: true },
  "vestir-se": { pic: "👕", en: "to get dressed", hard: true },
};

export const ROUNDS = 6;
export const HEARTS = 3;
const GUESS_MS = 20_000;
const REVEAL_MS = 5200;
/** Points: the writer's form, the reader's person, the reader's action, and a bonus when all three land. */
export const WRITE_POINTS = 2;
export const BONUS = 1;
/** Fácil shows the infinitive, Médio the English, Difícil only the picture. */
export const LEVEL_RULES: Record<Level, { writeMs: number; hint: "infinitive" | "english" | "none"; options: number; endings: boolean }> = {
  1: { writeMs: 45_000, hint: "infinitive", options: 4, endings: true },
  2: { writeMs: 35_000, hint: "english", options: 4, endings: false },
  3: { writeMs: 28_000, hint: "none", options: 6, endings: false },
};

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

interface Round {
  verb: string;
  person: Person;
  item: Conj;
  writer: string;
  reader: string;
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
  phase: "write" | "guess" | "reveal" | "end" = "write";
  phaseEnd = 0;
  round = 0;
  hearts = HEARTS;
  score = 0;
  perfect = 0;
  r!: Round;
  history: Round[] = [];
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
  get maxScore() {
    return (WRITE_POINTS + 2 + BONUS) * (ROUNDS + 1);
  }
  /** The present-tense row of the round's verb, for the reveal. */
  get row(): { person: Person; form: string }[] {
    const row = this.table.get(this.r.verb)!;
    return PERSONS.map((p) => ({ person: p, form: row.get(p)!.form }));
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    for (const p of this.players) this.contrib.set(p.playerId, 1);
    if (this.practice) this.round = -1;
    this.newRound();
  }

  private newRound() {
    const [a, b] = this.players;
    if (!a || !b) return;
    const writer = (this.round + 1) % 2 === 0 ? a : b;
    const reader = writer === a ? b : a;
    const verbs = [...this.table.keys()].filter((v) => this.level >= 3 || !VERB_PICS[v]!.hard);
    const fresh = verbs.filter((v) => !this.used.has(v));
    const verb = this.rt.rng.pick(fresh.length ? fresh : verbs);
    this.used.add(verb);
    // Every person comes up; nós and eles a bit more (their endings are the ones people mix up).
    const person = this.rt.rng.pick<Person>(["eu", "tu", "ele", "nos", "nos", "eles", "eles"]);
    const options = this.rt.rng.shuffle([verb, ...this.rt.rng.sample(verbs.filter((v) => v !== verb && VERB_PICS[v]!.pic !== VERB_PICS[verb]!.pic), this.rules.options - 1)]);
    this.r = { verb, person, item: this.table.get(verb)!.get(person)!, writer: writer.playerId, reader: reader.playerId, options };
    this.phase = "write";
    this.phaseEnd = gameNow() + (this.inPractice ? 600_000 : this.rules.writeMs);
    this.promptId = randomId(6);
    play("whoosh");
    if (this.final) this.rt.say(SAY.finalRound);
    this.rt.cue(CUE.fill, writer);
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick(now: number) {
    if ((this.phase === "write" || this.phase === "guess") && now >= this.phaseEnd) {
      this.rt.say(SAY.timeUp);
      if (this.phase === "write") this.r.written = "";
      return this.reveal();
    }
    if (this.phase === "reveal" && now >= this.phaseEnd) this.next();
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode !== "verbs" || promptId !== this.promptId) return;
    if (this.phase === "write" && p.playerId === this.r.writer && value.write) {
      this.r.written = value.write.slice(0, 30);
      play("lock");
      this.phase = "guess";
      this.phaseEnd = gameNow() + (this.inPractice ? 600_000 : GUESS_MS);
      this.promptId = randomId(6);
      const reader = this.rt.players.get(this.r.reader);
      this.rt.cue({ pt: "Quem? O quê?", en: "Who? Doing what?" }, reader);
      this.rt.refreshViews();
      this.rt.bump();
      return;
    }
    if (this.phase === "guess" && p.playerId === this.r.reader && value.pick) {
      this.r.pick = { person: value.pick.person as Person, verb: value.pick.verb };
      play("lock");
      this.reveal();
    }
  }

  private reveal() {
    const r = this.r;
    const row = this.table.get(r.verb)!;
    const written = r.written ?? "";
    const form = written ? judgeForm(written, r.item.form) : { ok: false, accent: false };
    // The reader reads what was WRITTEN: a wrong form read correctly is still a right reading.
    const says = written ? personsOf(written, row) : [];
    const person = !!r.pick?.person && (says.length ? says.includes(r.pick.person) : r.pick.person === r.person);
    const verb = r.pick?.verb === r.verb;
    const all = form.ok && person && verb;
    const points = (form.ok ? WRITE_POINTS : 0) + (person ? 1 : 0) + (verb ? 1 : 0) + (all ? BONUS : 0);
    r.result = { form: form.ok, accent: form.accent, person, verb, points };
    const writer = this.rt.players.get(r.writer);
    const reader = this.rt.players.get(r.reader);
    if (writer && written) this.rt.evidence(writer, r.item.id, "verbs.write", form.ok ? (form.accent ? "accent-slip" : "correct") : "wrong", 2);
    if (reader && r.pick) this.rt.evidence(reader, r.item.id, "verbs.read", person && verb ? "correct" : "wrong", 1);
    if (!this.inPractice) {
      this.score += points * (this.final ? 2 : 1);
      if (all) this.perfect++;
      if (writer && form.ok) this.contrib.set(writer.playerId, (this.contrib.get(writer.playerId) ?? 0) + 2);
      if (reader && person && verb) this.contrib.set(reader.playerId, (this.contrib.get(reader.playerId) ?? 0) + 2);
      for (const p of this.players) this.rt.addScore(p, points * 10, "verbs");
      // The message didn't get through: a heart.
      if (points < 3) {
        this.hearts--;
        play("sad-trombone", 0.6);
        this.rt.say(this.hearts > 0 ? SAY.lifeLost : SAY.livesOut);
      }
    }
    if (all) {
      play("star");
      this.rt.say(SAY.perfect);
      this.rt.celebrate();
      if (this.perfect === 2) this.rt.petSay(PET.knew, 0.7);
      this.rt.petDo("cheer", 2200);
    } else if (!form.ok) this.rt.petDo("think", 2200);
    for (const p of this.players) this.rt.emote(p.playerId, all ? "cheer" : points >= 3 ? "wave" : "sad", 2400);
    this.history.push(r);
    this.phase = "reveal";
    this.phaseEnd = gameNow() + REVEAL_MS;
    // Hear it said right: "nós comemos".
    setTimeout(() => this.rt.activity === this && this.rt.speakPt(`${{ eu: "eu", tu: "tu", ele: "ela", nos: "nós", eles: "eles" }[r.person]} ${r.item.form}`), 600);
    this.rt.holdPhones(1200);
    this.rt.refreshViews();
    this.rt.bump();
  }

  private next() {
    if (this.inPractice) {
      this.round = 0;
      this.score = 0;
      this.perfect = 0;
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
    play(out ? "fail-jingle" : "success-jingle");
    this.rt.bigMoment(out ? { pt: "💔 Sem corações!", en: "Out of hearts — the messages got lost" } : { pt: `🧩 ${this.perfect} em cheio!`, en: `${this.perfect} of ${ROUNDS} rounds perfect — written and read` }, out ? "lost" : "won", 2600, true);
    this.rt.petStar(out ? "oops" : "cheer", 2600);
    this.rt.bump();
    const wrong = this.history.filter((h) => h.result && !h.result.form);
    setTimeout(() => {
      if (this.rt.activity !== this) return;
      this.onDone({
        failed: out,
        minStars: !out && this.perfect >= ROUNDS - 1 ? 3 : !out && this.perfect >= ROUNDS / 2 ? 2 : undefined,
        score: this.score,
        max: this.maxScore,
        headline: `${this.perfect} de ${ROUNDS} em cheio · ${this.score} pontos`,
        headlineEn: `${this.perfect} of ${ROUNDS} perfect rounds`,
        sub: out ? "Acabaram-se os corações!" : "Escrever o verbo, ler quem o faz.",
        subEn: out ? "Out of hearts." : "Write the verb, read who does it.",
        words: this.history.slice(-4).map((h) => ({ pt: `${PERSON_LABEL[h.person].pt.split(" / ")[0]} ${h.item.form}`, en: `${VERB_PICS[h.verb]!.en.replace(/^to /, "")} (${PERSON_LABEL[h.person].pt})`, pic: VERB_PICS[h.verb]!.pic })),
        review: wrong.map((h) => ({ pt: `${PERSON_LABEL[h.person].pt.split(" / ")[0]} ${h.item.form}`, en: `${h.verb}: não “${h.written || "—"}”` })),
        contrib: Object.fromEntries(this.contrib),
        highlight: this.perfect ? { pt: `${this.perfect} verbos em cheio!`, en: `${this.perfect} verbs written and read perfectly`, pic: "🧩" } : undefined,
      });
    }, 2800);
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Quem faz o quê? precisa de 2", subtitle: "Chama o teu par para jogar! · Needs two players", pic: "🧩" };
    if (this.phase === "end") return { mode: "wait", title: "Fim!", subtitle: `${this.score} pontos`, pic: "🧩" };
    const r = this.r;
    const writer = this.rt.players.get(r.writer);
    const reader = this.rt.players.get(r.reader);
    if (this.phase === "reveal") {
      const res = r.result!;
      const ok = res.form && res.person && res.verb;
      return { mode: "wait", title: ok ? "Em cheio! 🎉" : `${PERSON_LABEL[r.person].pt.split(" / ")[0]} ${r.item.form}`, subtitle: `${ok ? "Written and read!" : "Look at the TV: the whole row"} · Olha para a TV!`, pic: ok ? "🥳" : "🧩" };
    }
    const base = { mode: "verbs" as const, roundId: this.roundId, promptId: this.promptId, round: Math.max(0, this.round), rounds: ROUNDS, hearts: this.hearts, msLeft: this.inPractice ? undefined : this.msLeft, practice: this.inPractice || undefined, final: this.final || undefined };
    if (this.phase === "write") {
      if (p.playerId === r.writer)
        return {
          ...base,
          role: "write",
          person: PERSON_LABEL[r.person],
          action: { pic: VERB_PICS[r.verb]!.pic, hint: this.rules.hint === "infinitive" ? r.verb : this.rules.hint === "english" ? VERB_PICS[r.verb]!.en : undefined },
          debugAnswer: this.rt.testMode ? { form: r.item.form, wrong: this.table.get(r.verb)!.get(r.person === "nos" ? "eles" : "nos")!.form } : undefined,
        };
      return { ...base, role: "wait", other: writer?.name ?? "", endings: this.rules.endings || undefined };
    }
    // guess
    if (p.playerId === r.reader)
      return {
        ...base,
        role: "read",
        written: r.written ?? "",
        persons: PERSONS.map((x) => ({ id: x, ...PERSON_LABEL[x] })),
        actions: r.options.map((v) => ({ id: v, pic: VERB_PICS[v]!.pic, label: this.rules.hint === "infinitive" ? v : undefined })),
        endings: this.rules.endings || undefined,
        debugAnswer: this.rt.testMode ? { person: personsOf(r.written ?? "", this.table.get(r.verb)!)[0] ?? r.person, verb: r.verb } : undefined,
      };
    return { ...base, role: "wait", other: reader?.name ?? "", written: r.written };
  }
}
