/**
 * Mini Aula — a 60–90 s animated micro-lesson (Teach stage), ending with a quick check
 * (Recognise). The following Turbo Race then draws on these items (Use).
 *
 * R0 lesson: de / do / da / dos / das with places (Livro do Aluno p. 22, Apêndice p. 31).
 */
import { choiceFromItem, type ChoicePrompt } from "../../curriculum/generators.ts";
import { getItem } from "../../curriculum/index.ts";
import { LESSONS } from "../../curriculum/lessons.ts";
import type { Lesson } from "../../curriculum/schema.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, NavDir } from "../../shared/protocol.ts";
import { sfx } from "../../audio/sfx.ts";
import { playMusic } from "../../audio/music.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

export type AulaStep =
  | { kind: "title"; big: string; small: string; say: string; ms: number }
  | { kind: "example"; big: string; note: string; place: string; emoji: string; say: string; ms: number }
  | { kind: "merge"; a: string; b: string; result: string; example: string; emoji: string; say: string; ms: number }
  | { kind: "rule"; big: string; note: string; say: string; ms: number }
  | { kind: "check"; itemId: string; ms: number }
  | { kind: "summary"; rows: [string, string][]; ms: number };

export const DE_ORIGIN_STEPS: AulaStep[] = [
  { kind: "title", big: "De onde és?", small: "de · do · da · dos · das", say: "De onde és?", ms: 3600 },
  { kind: "example", big: "Sou de Lisboa.", note: "Cidades: normalmente SEM artigo → só de", place: "Lisboa", emoji: "🏙️", say: "Sou de Lisboa.", ms: 5200 },
  { kind: "merge", a: "de", b: "o", result: "do", example: "o Brasil → Sou do Brasil.", emoji: "🇧🇷", say: "Sou do Brasil.", ms: 5200 },
  { kind: "merge", a: "de", b: "a", result: "da", example: "a Alemanha → Sou da Alemanha.", emoji: "🇩🇪", say: "Sou da Alemanha.", ms: 5200 },
  { kind: "merge", a: "de", b: "os", result: "dos", example: "os Estados Unidos → Sou dos Estados Unidos.", emoji: "🇺🇸", say: "Sou dos Estados Unidos.", ms: 5600 },
  { kind: "rule", big: "Sou do Porto!", note: "Exceção: o Porto tem artigo (tal como o Rio de Janeiro).", say: "Sou do Porto.", ms: 5200 },
  { kind: "rule", big: "Sou de Portugal.", note: "Alguns países não levam artigo: Portugal, Angola, Moçambique…", say: "Sou de Portugal.", ms: 5000 },
  { kind: "check", itemId: "grammar.origin.alemanha", ms: 7000 },
  { kind: "check", itemId: "grammar.origin.porto", ms: 7000 },
  { kind: "summary", rows: [["de + o", "do"], ["de + a", "da"], ["de + os", "dos"], ["de + as", "das"]], ms: 4200 },
];

export class MiniAula implements Activity {
  readonly id = "aula";
  rt!: TvRuntime;
  readonly lesson: Lesson = LESSONS[0]!;
  readonly steps = DE_ORIGIN_STEPS;
  stepIndex = -1;
  stepStart = 0;
  stepEnd = 0;
  check: { prompt: ChoicePrompt; roundId: string; promptId: string; answers: Map<string, boolean>; revealed: boolean } | null = null;
  acks = new Set<string>();
  private readonly onDone: () => void;

  constructor(onDone: () => void) {
    this.onDone = onDone;
  }

  get step(): AulaStep | undefined {
    return this.steps[this.stepIndex];
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    playMusic("aula");
    rt.say({ type: "aulaStart" }, true, 2600);
    this.advance(performance.now() + 900);
  }

  private advance(now: number) {
    this.stepIndex++;
    this.acks.clear();
    const s = this.step;
    if (!s) {
      this.rt.say({ type: "aulaEnd" }, true, 2400);
      this.stepEnd = Infinity;
      setTimeout(() => this.onDone(), 1800);
      return;
    }
    this.stepStart = now;
    this.stepEnd = now + s.ms;
    this.check = null;
    if (s.kind === "check") {
      const item = getItem(s.itemId)!;
      const prompt = choiceFromItem(item, this.rt.rng)!;
      this.check = { prompt, roundId: randomId(6), promptId: randomId(6), answers: new Map(), revealed: false };
      sfx.blip();
    } else {
      sfx.whoosh();
      if ("say" in s) setTimeout(() => this.rt.speakPt(s.say), 450);
    }
    for (const p of this.rt.activePlayers) this.rt.conn.sendView(p.playerId, this.viewFor(p));
    this.rt.bump();
  }

  tick(now: number) {
    if (now < this.stepEnd) return;
    const c = this.check;
    if (c && !c.revealed) return this.revealCheck(now);
    this.advance(now);
  }

  private revealCheck(now: number) {
    const c = this.check!;
    c.revealed = true;
    for (const p of this.rt.activePlayers) {
      if (!c.answers.has(p.playerId)) this.rt.evidence(p, c.prompt, "aula.check", "timeout");
      const ok = c.answers.get(p.playerId) === true;
      this.rt.view(p, { mode: "wait", title: ok ? "Isso!" : "Atenção:", subtitle: c.prompt.answerText, emoji: ok ? "🎓" : "📝", feedback: { status: ok ? "correct" : "wrong", text: c.prompt.answerText, detail: c.prompt.why } });
    }
    (c.answers.size && [...c.answers.values()].every(Boolean) ? sfx.correct : sfx.wrong)();
    this.rt.speakPt(c.prompt.audio);
    this.stepEnd = now + 2200;
    this.rt.bump();
  }

  onInput(p: RuntimePlayer, promptId: string, roundId: string, value: InputValue) {
    const c = this.check;
    if (value.mode === "lesson") {
      this.acks.add(p.playerId);
      this.rt.view(p, { mode: "wait", title: "👍", subtitle: "À espera do outro…", emoji: "🎓" });
      if (this.rt.activePlayers.every((x) => this.acks.has(x.playerId))) this.stepEnd = Math.min(this.stepEnd, performance.now() + 500);
      this.rt.bump();
      return;
    }
    if (!c || c.revealed || c.promptId !== promptId || c.roundId !== roundId || value.mode !== "choices" || c.answers.has(p.playerId)) return;
    const ok = value.choice === c.prompt.correctId;
    c.answers.set(p.playerId, ok);
    this.rt.evidence(p, c.prompt, "aula.check", ok ? "correct" : "wrong");
    this.rt.addScore(p, ok ? 50 : 0, "aula");
    sfx.pop();
    this.rt.view(p, { mode: "wait", title: "Resposta enviada!", emoji: "📨" });
    if (this.rt.activePlayers.every((x) => c.answers.has(x.playerId))) this.stepEnd = Math.min(this.stepEnd, performance.now() + 400);
    this.rt.bump();
  }

  onNav(dir: NavDir) {
    if (dir === "ok" && !this.check) this.stepEnd = Math.min(this.stepEnd, performance.now() + 100);
  }

  viewFor(p: RuntimePlayer): ControllerView {
    const s = this.step;
    const c = this.check;
    if (c && !c.revealed && !c.answers.has(p.playerId)) {
      return {
        mode: "choices",
        roundId: c.roundId,
        promptId: c.promptId,
        deadline: this.stepEnd,
        title: "TESTE RÁPIDO",
        question: c.prompt.headline,
        options: c.prompt.options,
        debugAnswer: this.rt.testMode ? { choice: c.prompt.correctId } : undefined,
      };
    }
    if (!s || s.kind === "check") return { mode: "wait", title: "Mini Aula", emoji: "🎓" };
    return {
      mode: "lesson",
      roundId: "aula",
      promptId: `step${this.stepIndex}`,
      deadline: this.stepEnd,
      title: "MINI AULA",
      step: s.kind === "summary" ? "Resumo" : s.kind === "merge" ? `${s.a} + ${s.b} = ${s.result}` : s.big,
      canContinue: !this.acks.has(p.playerId),
    };
  }
}
