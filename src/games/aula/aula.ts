/**
 * Mini Aula — a 60–90 s animated micro-lesson (Teach stage), ending with a quick check
 * (Recognise). The practice that follows draws on the lesson's items (Produce / Use).
 *
 * The phone mirrors every step (paradigm rows, examples, notes), so nobody has to squint at the
 * TV to read, and "🔊 ouvir outra vez" replays the audio. Step length follows the speed setting;
 * "👍 Percebi!" from everyone moves on early.
 */
import { gameNow } from "../../tv/clock.ts";
import { AULAS, type AulaStep } from "../../curriculum/aulas.ts";
import { choiceFromItem, type ChoicePrompt } from "../../curriculum/generators.ts";
import { ALL_ITEMS, getItem } from "../../curriculum/index.ts";
import { getLesson, LESSONS } from "../../curriculum/lessons.ts";
import type { Lesson } from "../../curriculum/schema.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, NavDir } from "../../shared/protocol.ts";
import { sfx } from "../../audio/sfx.ts";
import { playMusic } from "../../audio/music.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

export type { AulaStep };

export class MiniAula implements Activity {
  readonly id = "aula";
  readonly pausable = true;
  readonly music = "aula" as const;
  rt!: TvRuntime;
  readonly lesson: Lesson;
  readonly steps: AulaStep[];
  stepIndex = -1;
  stepStart = 0;
  stepEnd = 0;
  check: { prompt: ChoicePrompt; roundId: string; promptId: string; answers: Map<string, boolean>; revealed: boolean } | null = null;
  acks = new Set<string>();
  private readonly onDone: () => void;
  private finished = false;

  constructor(onDone: () => void, lessonId: string = "u01.de_origin") {
    this.onDone = onDone;
    this.lesson = getLesson(lessonId) ?? LESSONS[0]!;
    this.steps = AULAS[this.lesson.id] ?? [];
  }

  get step(): AulaStep | undefined {
    return this.steps[this.stepIndex];
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    playMusic("aula");
    rt.say({ type: "aulaStart" }, true, 2600);
    this.advance(gameNow() + 900);
  }

  private advance(now: number) {
    this.stepIndex++;
    this.acks.clear();
    const s = this.step;
    if (!s) {
      if (!this.finished) {
        this.finished = true;
        this.rt.say({ type: "aulaEnd" }, true, 2400);
        markLessonDone(this.lesson.id);
        this.stepEnd = Infinity;
        setTimeout(() => this.onDone(), 1800);
      }
      return;
    }
    this.stepStart = now;
    this.stepEnd = now + s.ms * this.rt.pace;
    this.check = null;
    if (s.kind === "check") {
      const item = getItem(s.itemId)!;
      const prompt = choiceFromItem(item, this.rt.rng, ALL_ITEMS)!;
      this.check = { prompt, roundId: randomId(6), promptId: randomId(6), answers: new Map(), revealed: false };
      sfx.blip();
    } else {
      sfx.whoosh();
      setTimeout(() => this.repeat(), 450);
    }
    for (const p of this.rt.activePlayers) this.rt.conn.sendView(p.playerId, this.viewFor(p));
    this.rt.bump();
  }

  repeat() {
    const s = this.step;
    if (s && "say" in s && s.say) this.rt.speakPt(s.say);
    else if (this.check) this.rt.speakPt(this.check.prompt.audio);
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
    this.stepEnd = now + 2400 * Math.sqrt(this.rt.pace);
    this.rt.bump();
  }

  onInput(p: RuntimePlayer, promptId: string, roundId: string, value: InputValue) {
    const c = this.check;
    if (value.mode === "lesson") {
      this.acks.add(p.playerId);
      this.rt.view(p, this.viewFor(p));
      if (this.rt.activePlayers.every((x) => this.acks.has(x.playerId))) this.stepEnd = Math.min(this.stepEnd, gameNow() + 500);
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
    if (this.rt.activePlayers.every((x) => c.answers.has(x.playerId))) this.stepEnd = Math.min(this.stepEnd, gameNow() + 400);
    this.rt.bump();
  }

  onNav(dir: NavDir) {
    if (dir === "ok" && !this.check) this.stepEnd = Math.min(this.stepEnd, gameNow() + 100);
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
        card: { kicker: this.lesson.title, visual: c.prompt.visual, headline: c.prompt.headline, sub: c.prompt.sub },
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
      step: stepHeadline(s),
      lines: stepLines(s),
      card: { kicker: s.kind !== "table" && "kicker" in s && s.kicker ? s.kicker : this.lesson.title, visual: "emoji" in s ? s.emoji : undefined, headline: stepHeadline(s) },
      canContinue: !this.acks.has(p.playerId),
    };
  }
}

export function stepHeadline(s: AulaStep): string {
  switch (s.kind) {
    case "merge":
      return `${s.a} + ${s.b} = ${s.result}`;
    case "table":
      return s.kicker;
    case "summary":
      return "Resumo";
    case "check":
      return "Teste rápido";
    default:
      return s.big;
  }
}

/** Plain-text lines the phone shows under the headline. */
export function stepLines(s: AulaStep): string[] {
  switch (s.kind) {
    case "title":
      return [s.small];
    case "example":
    case "rule":
      return [s.note];
    case "merge":
      return [s.example];
    case "table":
      return [...s.rows.map(([a, b]) => `${a} → ${b}`), ...(s.note ? [s.note] : [])];
    case "summary":
      return [...s.rows.map(([a, b]) => `${a} = ${b}`), ...(s.note ? [s.note] : [])];
    default:
      return [];
  }
}

/* ------------------------------ lesson progress ------------------------------ */

const DONE_KEY = "pp.tv.lessonsDone";

export function lessonsDone(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function markLessonDone(id: string) {
  const s = lessonsDone();
  s.add(id);
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

/** Next lesson in book order that hasn't been done yet (wraps around). */
export function nextLessonId(): string {
  const done = lessonsDone();
  return (LESSONS.find((l) => !done.has(l.id)) ?? LESSONS[0]!).id;
}
