/**
 * Title / lobby / results / Party Night sequencing.
 *
 * Party Night has no navigation menus between segments: once it starts, the director carries the
 * players from one segment to the next like a TV game show. Menus exist only on the title screen.
 */
import { gameNow } from "./clock.ts";
import { getLesson, LESSONS } from "../curriculum/lessons.ts";
import { lessonsDone, MiniAula, nextLessonId } from "../games/aula/aula.ts";
import { MicroRush } from "../games/micro/rush.ts";
import { TurboRace, type RaceResult } from "../games/race/race.ts";
import type { ControllerView, NavDir } from "../shared/protocol.ts";
import { sfx } from "../audio/sfx.ts";
import { playMusic } from "../audio/music.ts";
import { SPEED_LABEL, type Activity, type RuntimePlayer, type TvRuntime } from "./runtime.ts";

export type Mode = "party" | "micro" | "race" | "lesson";

export interface ModeSpec {
  mode: Mode;
  /** For "lesson": which Mini Aula. */
  lessonId?: string;
}

/* -------------------------------------------------------------------------- */
/* Title                                                                       */
/* -------------------------------------------------------------------------- */

export interface MenuItem {
  id: string;
  label: string;
  sub?: string;
  disabled?: boolean;
  badge?: string;
}

export class TitleActivity implements Activity {
  readonly id = "title";
  rt!: TvRuntime;
  menu: "main" | "aulas" | "arcade" | "settings" = "main";
  focus = 0;

  start(rt: TvRuntime) {
    this.rt = rt;
    playMusic("title");
  }

  get items(): MenuItem[] {
    const s = this.rt.settings;
    if (this.menu === "aulas") {
      const done = lessonsDone();
      return [
        ...LESSONS.map((l, i) => ({
          id: `lesson:${l.id}`,
          label: `${i + 1}. ${l.title}`,
          sub: `${l.unit === "u00" ? "Unidade 0" : "Unidade 1"} · Mini Aula + treino`,
          badge: done.has(l.id) ? "✓ FEITA" : undefined,
        })),
        { id: "back", label: "← Voltar" },
      ];
    }
    if (this.menu === "arcade")
      return [
        { id: "micro", label: "Micro Loucura", sub: "Microjogos de 5 segundos" },
        { id: "race", label: "Turbo Corrida", sub: "Respostas rápidas = TURBO" },
        { id: "back", label: "← Voltar" },
      ];
    if (this.menu === "settings")
      return [
        { id: "speed", label: `Velocidade: ${SPEED_LABEL[s.speed]}`, sub: "Calma = mais tempo para pensar" },
        { id: "lowFx", label: `Efeitos: ${s.lowFx ? "Leves" : "Máximos"}`, sub: "Leves = mais fluido em TVs antigas" },
        { id: "music", label: `Música: ${s.music ? "Ligada" : "Desligada"}` },
        { id: "subtitles", label: `Legendas EN do Blip: ${s.subtitles ? "Sim" : "Não"}` },
        { id: "back", label: "← Voltar" },
      ];
    return [
      { id: "party", label: "Noite de Festa", sub: "O espetáculo completo" },
      { id: "aulas", label: "Aulas", sub: `${lessonsDone().size}/${LESSONS.length} feitas · aprende e treina` },
      { id: "arcade", label: "Arcade", sub: "Escolhe um jogo" },
      { id: "desafio", label: "Desafio", sub: "Desafia o teu par", disabled: true, badge: "EM BREVE" },
      { id: "profiles", label: "Perfis", sub: "Progresso e metas A1", disabled: true, badge: "EM BREVE" },
      { id: "settings", label: "Definições" },
    ];
  }

  tick() {}

  onNav(dir: NavDir) {
    const items = this.items;
    if (dir === "up" || dir === "down") {
      const step = dir === "up" ? -1 : 1;
      let i = this.focus;
      do i = (i + step + items.length) % items.length;
      while (items[i]!.disabled && i !== this.focus);
      this.focus = i;
      sfx.nav();
      this.rt.bump();
      return;
    }
    if ((dir === "left" || dir === "right") && items[this.focus]?.id === "speed") {
      this.rt.menu("speed");
      return;
    }
    if (dir === "back") {
      if (this.menu !== "main") {
        this.focus = MAIN_INDEX[this.menu] ?? 0;
        this.menu = "main";
        sfx.nav();
        this.rt.bump();
      }
      return;
    }
    if (dir !== "ok") return;
    const item = items[this.focus]!;
    if (item.disabled) return sfx.wrong();
    sfx.select();
    if (item.id.startsWith("lesson:")) {
      this.rt.run(new LobbyActivity({ mode: "lesson", lessonId: item.id.slice("lesson:".length) }));
      return;
    }
    switch (item.id) {
      case "party":
      case "micro":
      case "race":
        this.rt.run(new LobbyActivity({ mode: item.id }));
        return;
      case "aulas":
        this.menu = "aulas";
        // Start on the next lesson in book order.
        this.focus = Math.max(0, LESSONS.findIndex((l) => l.id === nextLessonId()));
        break;
      case "arcade":
      case "settings":
        this.menu = item.id;
        this.focus = 0;
        break;
      case "back":
        this.focus = MAIN_INDEX[this.menu] ?? 0;
        this.menu = "main";
        break;
      case "speed":
        this.rt.menu("speed");
        break;
      case "lowFx":
        this.rt.setSettings({ lowFx: !this.rt.settings.lowFx });
        break;
      case "music":
        this.rt.setSettings({ music: !this.rt.settings.music });
        break;
      case "subtitles":
        this.rt.setSettings({ subtitles: !this.rt.settings.subtitles });
        break;
    }
    this.rt.bump();
  }

  onReady() {}

  viewFor(): ControllerView {
    return { mode: "remote", title: "Comando", hint: "Usa as setas para escolher no ecrã" };
  }
}

const MAIN_INDEX: Record<string, number> = { aulas: 1, arcade: 2, settings: 5 };

/* -------------------------------------------------------------------------- */
/* Lobby: ready check                                                          */
/* -------------------------------------------------------------------------- */

export function specTitle(spec: ModeSpec): string {
  if (spec.mode === "lesson") return getLesson(spec.lessonId ?? "")?.title ?? "Aula";
  return { party: "Noite de Festa", micro: "Micro Loucura", race: "Turbo Corrida" }[spec.mode];
}

export class LobbyActivity implements Activity {
  readonly id = "lobby";
  rt!: TvRuntime;
  countdownAt: number | null = null;
  readonly spec: ModeSpec;

  constructor(spec: ModeSpec) {
    this.spec = spec;
  }

  get title() {
    return specTitle(this.spec);
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    for (const p of rt.players.values()) p.ready = false;
    playMusic("title");
  }

  tick(now: number) {
    const ps = this.rt.activePlayers;
    const allReady = ps.length > 0 && ps.every((p) => p.ready);
    if (allReady && this.countdownAt === null) {
      this.countdownAt = now + 3000;
      sfx.countdown(false);
      this.rt.bump();
    } else if (!allReady && this.countdownAt !== null) {
      this.countdownAt = null;
      this.rt.bump();
    }
    if (this.countdownAt !== null && now >= this.countdownAt) {
      this.countdownAt = null;
      sfx.countdown(true);
      this.rt.resetSession();
      startMode(this.rt, this.spec);
    }
  }

  onReady(p: RuntimePlayer, ready: boolean) {
    if (ready) sfx.select();
    this.rt.view(p, this.viewFor(p));
  }

  onPlayersChanged() {
    for (const p of this.rt.activePlayers) this.rt.view(p, this.viewFor(p));
  }

  onNav(dir: NavDir, from: RuntimePlayer | "tv") {
    if (dir === "back") this.rt.run(new TitleActivity());
    if (dir === "left" || dir === "right") {
      const order = ["calma", "normal", "turbo"] as const;
      const i = order.indexOf(this.rt.settings.speed) + (dir === "left" ? -1 : 1);
      this.rt.menu("speed", order[Math.min(2, Math.max(0, i))]);
    }
    if (dir === "ok" && from === "tv") {
      // TV remote "OK" = everyone connected is ready (handy with one phone + remote).
      for (const p of this.rt.activePlayers) p.ready = true;
      this.rt.bump();
    }
  }

  viewFor(p: RuntimePlayer): ControllerView {
    return { mode: "lobby", ready: p.ready, canNavigate: true, hint: this.title, speed: this.rt.settings.speed };
  }
}

/* -------------------------------------------------------------------------- */
/* Intro sting                                                                 */
/* -------------------------------------------------------------------------- */

export class IntroActivity implements Activity {
  readonly id = "intro";
  readonly pausable = true;
  readonly music = "party" as const;
  rt!: TvRuntime;
  startAt = 0;
  readonly title: string;
  private readonly onDone: () => void;
  private done = false;

  constructor(title: string, onDone: () => void) {
    this.title = title;
    this.onDone = onDone;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.startAt = gameNow();
    playMusic("party");
    sfx.slam();
    rt.say({ type: "partyStart" }, true, 3000);
    rt.view("all", { mode: "wait", title: this.title, subtitle: "Olha para a TV!", emoji: "🎉" });
  }

  tick(now: number) {
    if (!this.done && now - this.startAt > 3800) {
      this.done = true;
      this.onDone();
    }
  }

  viewFor(): ControllerView {
    return { mode: "wait", title: this.title, emoji: "🎉" };
  }
}

/* -------------------------------------------------------------------------- */
/* Results                                                                     */
/* -------------------------------------------------------------------------- */

export class ResultsActivity implements Activity {
  readonly id = "results";
  rt!: TvRuntime;
  readonly ranking: RuntimePlayer[] = [];
  readonly title: string;
  readonly race?: RaceResult;
  readonly spec: ModeSpec;
  startAt = 0;

  constructor(spec: ModeSpec, title: string, race?: RaceResult) {
    this.spec = spec;
    this.title = title;
    this.race = race;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.startAt = gameNow();
    this.ranking.push(...rt.sessionPlayers.sort((a, b) => b.score - a.score));
    playMusic("title");
    sfx.fanfare();
    const [a, b] = this.ranking;
    if (a && b && a.score === b.score) rt.say({ type: "tie" }, true, 4000);
    else if (a && b) {
      rt.say({ type: "win", name: a.name, other: b.name }, true, 4200);
      rt.perf(a, this.spec.mode, "win");
    } else if (a) rt.say({ type: "solo", name: a.name }, true, 4000);
    for (const p of rt.activePlayers) rt.view(p, this.viewFor(p));
    void rt.learner.sync().then(() => rt.learner.pushSnapshot());
  }

  tick() {}

  onNav(dir: NavDir) {
    if (dir === "ok") {
      sfx.select();
      this.rt.run(new LobbyActivity(this.next));
    } else if (dir === "back") this.rt.run(new TitleActivity());
  }

  /** After a lesson, "OK" moves on to the next lesson; otherwise it replays the mode. */
  get next(): ModeSpec {
    if (this.spec.mode !== "lesson") return this.spec;
    const i = LESSONS.findIndex((l) => l.id === this.spec.lessonId);
    return { mode: "lesson", lessonId: LESSONS[(i + 1) % LESSONS.length]!.id };
  }

  get nextLabel(): string {
    return this.spec.mode === "lesson" ? `Próxima aula: ${specTitle(this.next)}` : "Mais uma!";
  }

  viewFor(p: RuntimePlayer): ControllerView {
    const rank = this.ranking.indexOf(p) + 1;
    return {
      mode: "results",
      title: rank === 1 ? "🏆 Ganhaste!" : `${rank}.º lugar`,
      lines: [`${p.score} pontos`, `OK = ${this.nextLabel}`],
      review: p.missed.slice(0, 8).map((m) => ({ pt: m.answer, why: m.why })),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Mode runner                                                                 */
/* -------------------------------------------------------------------------- */

export function startMode(rt: TvRuntime, spec: ModeSpec) {
  const results = (race?: RaceResult) => rt.run(new ResultsActivity(spec, specTitle(spec), race));
  rt.onRestart = () => {
    rt.resetSession();
    startMode(rt, spec);
  };
  rt.onQuit = () => rt.run(new TitleActivity());
  switch (spec.mode) {
    case "micro":
      rt.run(new MicroRush(() => results(), { total: 10 }));
      return;
    case "race":
      rt.run(new TurboRace((r) => results(r), getLesson(nextLessonId())?.itemIds ?? []));
      return;
    case "lesson": {
      // Teach (Mini Aula) → Recognise/Produce (a short rush focused on the lesson) → results.
      const lesson = getLesson(spec.lessonId ?? "") ?? LESSONS[0]!;
      rt.run(new MiniAula(() => rt.run(new MicroRush(() => results(), { total: 6, lessonItemIds: lesson.itemIds, lessonShare: 0.85 })), lesson.id));
      return;
    }
    case "party": {
      // Intro → Micro Loucura (warm-up) → Mini Aula (teach the next lesson) → Turbo Race (use it) → Results.
      const lesson = getLesson(nextLessonId()) ?? LESSONS[0]!;
      rt.run(
        new IntroActivity("NOITE DE FESTA", () =>
          rt.run(new MicroRush(() => rt.run(new MiniAula(() => rt.run(new TurboRace((r) => results(r), lesson.itemIds)), lesson.id)), { total: 8 })),
        ),
      );
      return;
    }
  }
}
