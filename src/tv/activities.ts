/**
 * Title / lobby / results and the flow between segments.
 *
 * The heart of the app is "Aprender": a Duolingo-style lesson side by side, then a game on that
 * lesson's words (Diz-me! together, or Apanha! against each other). Party Night strings the games
 * together with no menus in between, like a TV game show.
 */
import { gameNow } from "./clock.ts";
import { gameCards, type LearnCard } from "../curriculum/learn.ts";
import { getLesson, LESSONS } from "../curriculum/lessons.ts";
import type { Lesson } from "../curriculum/schema.ts";
import { DizMe } from "../games/dizme/dizme.ts";
import { LearnActivity, type LearnSummary } from "../games/learn/learn.ts";
import { MicroRush } from "../games/micro/rush.ts";
import { TurboRace, type RaceResult } from "../games/race/race.ts";
import { Apanha } from "../games/snap/snap.ts";
import { randomId } from "../shared/ids.ts";
import type { ControllerView, InputValue, NavDir } from "../shared/protocol.ts";
import { sfx } from "../audio/sfx.ts";
import { playMusic } from "../audio/music.ts";
import { voiceName } from "../audio/tts.ts";
import { lessonsDone, lessonStars, nextLessonId, playableLessons } from "./progress.ts";
import { SPEED_LABEL, type Activity, type RuntimePlayer, type TvRuntime } from "./runtime.ts";

export type Mode = "party" | "micro" | "race" | "lesson" | "dizme" | "snap";

export interface ModeSpec {
  mode: Mode;
  /** Lesson to learn ("lesson") or whose words to play with (games). Default: all learned so far. */
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

const MAIN_INDEX: Record<string, number> = { aprender: 0, jogos: 2, settings: 3 };

export class TitleActivity implements Activity {
  readonly id = "title";
  rt!: TvRuntime;
  menu: "main" | "aprender" | "jogos" | "settings" = "main";
  focus = 0;

  start(rt: TvRuntime) {
    this.rt = rt;
    playMusic("title");
  }

  get items(): MenuItem[] {
    const s = this.rt.settings;
    if (this.menu === "aprender") {
      const done = lessonsDone();
      const stars = lessonStars();
      const next = nextLessonId();
      return [
        ...LESSONS.map((l, i) => ({
          id: `lesson:${l.id}`,
          label: `${i + 1}. ${l.title}`,
          sub: `${l.unit === "u00" ? "Unidade 0" : "Unidade 1"} · ${done.has(l.id) ? "⭐".repeat(stars[l.id] ?? 1) + " · repetir = rever" : "palavras novas"}`,
          badge: l.id === next ? "PRÓXIMA" : done.has(l.id) ? "✓" : undefined,
        })),
        { id: "back", label: "← Voltar" },
      ];
    }
    if (this.menu === "jogos")
      return [
        { id: "dizme", label: "Diz-me! 🗣️", sub: "Juntos: um diz a palavra, o outro adivinha" },
        { id: "snap", label: "Apanha! ⚡", sub: "Um contra o outro: ouve e bate primeiro" },
        { id: "micro", label: "Micro Loucura", sub: "Microjogos rápidos" },
        { id: "race", label: "Turbo Corrida", sub: "Responde para acelerar" },
        { id: "back", label: "← Voltar" },
      ];
    if (this.menu === "settings")
      return [
        { id: "speed", label: `Velocidade: ${SPEED_LABEL[s.speed]}`, sub: "Calma = mais tempo para pensar" },
        { id: "music", label: `Música: ${s.music ? "Ligada" : "Desligada"}` },
        { id: "subtitles", label: `Legendas EN do Blip: ${s.subtitles ? "Sim" : "Não"}` },
        { id: "lowFx", label: `Efeitos: ${s.lowFx ? "Leves" : "Máximos"}`, sub: "Leves = mais fluido em TVs antigas" },
        {
          id: "voice",
          label: this.rt.tvVoiceMissing ? "Voz: sem voz portuguesa nesta TV" : `Voz: ${voiceName() ?? "a carregar…"}`,
          sub: this.rt.tvVoiceMissing ? "Os telemóveis leem em voz alta" : "Português europeu",
          disabled: true,
        },
        { id: "back", label: "← Voltar" },
      ];
    const done = lessonsDone().size;
    return [
      { id: "aprender", label: "Aprender", sub: `Lições ao estilo Duolingo · ${done}/${LESSONS.length} feitas` },
      { id: "party", label: "Noite de Festa", sub: "Todos os jogos seguidos, sem menus" },
      { id: "jogos", label: "Jogos", sub: "Diz-me! · Apanha! · Micro Loucura · Corrida" },
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
      case "dizme":
      case "snap":
        this.rt.run(new LobbyActivity({ mode: item.id }));
        return;
      case "aprender":
        this.menu = "aprender";
        this.focus = Math.max(0, LESSONS.findIndex((l) => l.id === nextLessonId()));
        break;
      case "jogos":
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

/* -------------------------------------------------------------------------- */
/* Lobby: ready check                                                          */
/* -------------------------------------------------------------------------- */

export function specTitle(spec: ModeSpec): string {
  if (spec.mode === "lesson") return getLesson(spec.lessonId ?? "")?.title ?? "Lição";
  return { party: "Noite de Festa", micro: "Micro Loucura", race: "Turbo Corrida", dizme: "Diz-me!", snap: "Apanha!" }[spec.mode];
}

const SPEC_HINT: Record<Mode, string> = {
  lesson: "Cada um no seu telemóvel, ao seu ritmo. Sem pressa!",
  party: "Todos os jogos seguidos.",
  micro: "Microjogos rápidos no telemóvel.",
  race: "Responde certo e rápido para acelerar.",
  dizme: "Um diz a palavra em português, o outro toca na imagem certa. Juntos contra o relógio!",
  snap: "A TV diz uma palavra. Bate no telemóvel quando a imagem certa aparecer!",
};

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

  get hint() {
    return SPEC_HINT[this.spec.mode];
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
/* Results (+ what next)                                                       */
/* -------------------------------------------------------------------------- */

export interface ResultOption {
  id: string;
  label: string;
  sub?: string;
  go: () => void;
}

export interface ResultsInfo {
  spec: ModeSpec;
  title: string;
  race?: RaceResult;
  /** After a lesson: per-player XP / accuracy, and the words learned. */
  lesson?: { summaries: LearnSummary[]; words: LearnCard[] };
  /** Co-op games: the team score. */
  coop?: { score: number; record: number; isRecord: boolean };
  /** Versus games with their own points (Apanha!). */
  points?: Map<string, number>;
  options: ResultOption[];
}

export class ResultsActivity implements Activity {
  readonly id = "results";
  rt!: TvRuntime;
  readonly ranking: RuntimePlayer[] = [];
  readonly info: ResultsInfo;
  focus = 0;
  startAt = 0;
  private readonly promptId = randomId(6);

  constructor(info: ResultsInfo) {
    this.info = info;
  }

  get title() {
    return this.info.title;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.startAt = gameNow();
    const score = (p: RuntimePlayer) =>
      this.info.lesson ? (this.info.lesson.summaries.find((s) => s.playerId === p.playerId)?.xp ?? 0) : (this.info.points?.get(p.playerId) ?? p.score);
    this.ranking.push(...rt.sessionPlayers.sort((a, b) => score(b) - score(a)));
    playMusic("title");
    sfx.fanfare();
    const [a, b] = this.ranking;
    if (this.info.lesson || this.info.coop) {
      if (a) rt.say({ type: "lessonDone", name: this.ranking.map((p) => p.name).join(" e ") }, true, 3500);
    } else if (a && b && score(a) === score(b)) rt.say({ type: "tie" }, true, 4000);
    else if (a && b) {
      rt.say({ type: "win", name: a.name, other: b.name }, true, 4200);
      rt.perf(a, this.info.spec.mode, "win");
    } else if (a) rt.say({ type: "solo", name: a.name }, true, 4000);
    for (const p of rt.activePlayers) rt.view(p, this.viewFor(p));
    void rt.learner.sync().then(() => rt.learner.pushSnapshot());
  }

  scoreOf(p: RuntimePlayer): number {
    if (this.info.lesson) return this.info.lesson.summaries.find((s) => s.playerId === p.playerId)?.xp ?? 0;
    return this.info.points?.get(p.playerId) ?? p.score;
  }

  tick() {}

  private choose(i: number) {
    const o = this.info.options[i];
    if (!o) return;
    sfx.select();
    o.go();
  }

  onNav(dir: NavDir) {
    const n = this.info.options.length;
    if (dir === "up" || dir === "down") {
      this.focus = (this.focus + (dir === "up" ? -1 : 1) + n) % n;
      sfx.nav();
      this.rt.bump();
    } else if (dir === "ok") this.choose(this.focus);
    else if (dir === "back") this.rt.run(new TitleActivity());
  }

  onInput(_p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode !== "pick" || promptId !== this.promptId) return;
    this.choose(this.info.options.findIndex((o) => o.id === value.id));
  }

  viewFor(p: RuntimePlayer): ControllerView {
    const rank = this.ranking.indexOf(p) + 1;
    const lesson = this.info.lesson?.summaries.find((s) => s.playerId === p.playerId);
    const title = lesson
      ? `${"⭐".repeat(lesson.stars)} +${lesson.xp} XP`
      : this.info.coop
        ? `Equipa: ${this.info.coop.score} ${this.info.coop.isRecord ? "🏆 RECORDE!" : ""}`
        : rank === 1 && this.ranking.length > 1
          ? "🏆 Ganhaste!"
          : `${rank}.º lugar`;
    const subtitle = lesson ? `${lesson.correct}/${lesson.graded} certas · melhor sequência ${lesson.bestStreak}` : this.info.coop ? `Recorde: ${this.info.coop.record}` : `${this.scoreOf(p)} pontos`;
    return {
      mode: "pick",
      roundId: "results",
      promptId: this.promptId,
      title,
      subtitle,
      options: this.info.options.map((o) => ({ id: o.id, label: o.label, sub: o.sub })),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Mode runner                                                                 */
/* -------------------------------------------------------------------------- */

function lessonsFor(spec: ModeSpec): Lesson[] {
  const l = spec.lessonId ? getLesson(spec.lessonId) : undefined;
  return l ? [l] : playableLessons();
}

function cardsFor(spec: ModeSpec): LearnCard[] {
  return gameCards(lessonsFor(spec));
}

export function startMode(rt: TvRuntime, spec: ModeSpec) {
  rt.onRestart = () => {
    rt.resetSession();
    startMode(rt, spec);
  };
  rt.onQuit = () => rt.run(new TitleActivity());
  const go = (s: ModeSpec) => () => {
    rt.resetSession();
    startMode(rt, s);
  };
  const menu = { id: "menu", label: "🏠 Menu", go: () => rt.run(new TitleActivity()) };
  const two = rt.activePlayers.length >= 2;
  const lessonId = spec.lessonId;
  const games = (except: Mode): ResultOption[] => {
    const out: ResultOption[] = [];
    if (two && except !== "dizme") out.push({ id: "dizme", label: "🗣️ Diz-me!", sub: "Juntos: um diz, o outro adivinha", go: go({ mode: "dizme", lessonId }) });
    if (except !== "snap") out.push({ id: "snap", label: "⚡ Apanha!", sub: "Um contra o outro: ouve e bate", go: go({ mode: "snap", lessonId }) });
    return out;
  };
  const itemIds = lessonsFor(spec).flatMap((l) => l.itemIds);

  switch (spec.mode) {
    case "lesson": {
      const lesson = getLesson(spec.lessonId ?? "") ?? LESSONS[0]!;
      const next = LESSONS[(LESSONS.indexOf(lesson) + 1) % LESSONS.length]!;
      const act = new LearnActivity(lesson, (summaries) =>
        rt.run(
          new ResultsActivity({
            spec,
            title: "Lição completa!",
            lesson: { summaries, words: act.words },
            options: [
              ...games("lesson").map((o) => ({ ...o, label: `${o.label} com estas palavras` })),
              { id: "next", label: `➡️ Próxima lição`, sub: next.title, go: go({ mode: "lesson", lessonId: next.id }) },
              { id: "again", label: "↺ Repetir esta lição", go: go(spec) },
              menu,
            ],
          }),
        ),
      );
      rt.run(act);
      return;
    }
    case "dizme": {
      const act: DizMe = new DizMe(cardsFor(spec), (score) =>
        rt.run(
          new ResultsActivity({
            spec,
            title: act.newRecord ? "NOVO RECORDE!" : "Diz-me!",
            coop: { score, record: act.record, isRecord: act.newRecord },
            options: [{ id: "again", label: "↺ Jogar outra vez", go: go(spec) }, ...games("dizme"), menu],
          }),
        ),
      );
      rt.run(act);
      return;
    }
    case "snap": {
      const act: Apanha = new Apanha(cardsFor(spec), () =>
        rt.run(
          new ResultsActivity({
            spec,
            title: "Apanha!",
            points: act.scores,
            options: [{ id: "again", label: "↺ Jogar outra vez", go: go(spec) }, ...games("snap"), menu],
          }),
        ),
      );
      rt.run(act);
      return;
    }
    case "micro":
      rt.run(
        new MicroRush(() => rt.run(new ResultsActivity({ spec, title: "Micro Loucura", options: [{ id: "again", label: "↺ Jogar outra vez", go: go(spec) }, ...games("micro"), menu] })), {
          total: 8,
          lessonItemIds: itemIds,
          lessonShare: 0.7,
        }),
      );
      return;
    case "race":
      rt.run(
        new TurboRace((r) => rt.run(new ResultsActivity({ spec, title: "Turbo Corrida", race: r, options: [{ id: "again", label: "↺ Jogar outra vez", go: go(spec) }, ...games("race"), menu] })), itemIds),
      );
      return;
    case "party": {
      // Intro → Micro Loucura → Apanha! → Diz-me! (co-op) → Turbo Corrida → results.
      const cards = cardsFor(spec);
      const results = (r?: RaceResult) =>
        rt.run(new ResultsActivity({ spec, title: "Noite de Festa", race: r, options: [{ id: "again", label: "↺ Outra noite!", go: go(spec) }, menu] }));
      const race = () => rt.run(new TurboRace((r) => results(r), itemIds));
      const dizme = () => (rt.activePlayers.length >= 2 ? rt.run(new DizMe(cards, () => race())) : race());
      const snap = () => rt.run(new Apanha(cards, () => dizme(), 5));
      rt.run(new IntroActivity("NOITE DE FESTA", () => rt.run(new MicroRush(() => snap(), { total: 6, lessonItemIds: itemIds, lessonShare: 0.7 }))));
      return;
    }
  }
}
