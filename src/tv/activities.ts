/**
 * Title / lobby / results / Party Night sequencing.
 *
 * Party Night has no navigation menus between segments: once it starts, the director carries the
 * players from one segment to the next like a TV game show. Menus exist only on the title screen.
 */
import { LESSONS } from "../curriculum/lessons.ts";
import { MiniAula } from "../games/aula/aula.ts";
import { MicroRush } from "../games/micro/rush.ts";
import { TurboRace, type RaceResult } from "../games/race/race.ts";
import type { ControllerView, NavDir } from "../shared/protocol.ts";
import { sfx } from "../audio/sfx.ts";
import { playMusic } from "../audio/music.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "./runtime.ts";

export type Mode = "party" | "micro" | "race" | "aula";

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
  menu: "main" | "arcade" | "settings" = "main";
  focus = 0;

  start(rt: TvRuntime) {
    this.rt = rt;
    playMusic("title");
  }

  get items(): MenuItem[] {
    const s = this.rt.settings;
    if (this.menu === "arcade")
      return [
        { id: "micro", label: "Micro Loucura", sub: "Microjogos de 5 segundos" },
        { id: "race", label: "Turbo Corrida", sub: "Respostas rápidas = TURBO" },
        { id: "aula", label: "Mini Aula", sub: "de · do · da · dos · das" },
        { id: "back", label: "← Voltar" },
      ];
    if (this.menu === "settings")
      return [
        { id: "lowFx", label: `Efeitos: ${s.lowFx ? "Leves" : "Máximos"}`, sub: "Leves = mais fluido em TVs antigas" },
        { id: "music", label: `Música: ${s.music ? "Ligada" : "Desligada"}` },
        { id: "subtitles", label: `Legendas EN do Blip: ${s.subtitles ? "Sim" : "Não"}` },
        { id: "back", label: "← Voltar" },
      ];
    return [
      { id: "party", label: "Noite de Festa", sub: "O espetáculo completo" },
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
    if (dir === "back") {
      if (this.menu !== "main") {
        this.menu = "main";
        this.focus = 0;
        sfx.nav();
        this.rt.bump();
      }
      return;
    }
    if (dir !== "ok") return;
    const item = items[this.focus]!;
    if (item.disabled) return sfx.wrong();
    sfx.select();
    switch (item.id) {
      case "party":
      case "micro":
      case "race":
      case "aula":
        this.rt.run(new LobbyActivity(item.id as Mode));
        return;
      case "arcade":
      case "settings":
        this.menu = item.id;
        this.focus = 0;
        break;
      case "back":
        this.menu = "main";
        this.focus = 0;
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

export const MODE_TITLES: Record<Mode, string> = { party: "Noite de Festa", micro: "Micro Loucura", race: "Turbo Corrida", aula: "Mini Aula" };

export class LobbyActivity implements Activity {
  readonly id = "lobby";
  rt!: TvRuntime;
  countdownAt: number | null = null;
  readonly mode: Mode;

  constructor(mode: Mode) {
    this.mode = mode;
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
      startMode(this.rt, this.mode);
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
    if (dir === "ok" && from === "tv") {
      // TV remote "OK" = everyone connected is ready (handy with one phone + remote).
      for (const p of this.rt.activePlayers) p.ready = true;
      this.rt.bump();
    }
  }

  viewFor(p: RuntimePlayer): ControllerView {
    return { mode: "lobby", ready: p.ready, canNavigate: true, hint: MODE_TITLES[this.mode] };
  }
}

/* -------------------------------------------------------------------------- */
/* Intro sting                                                                 */
/* -------------------------------------------------------------------------- */

export class IntroActivity implements Activity {
  readonly id = "intro";
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
    this.startAt = performance.now();
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
  readonly mode: Mode;
  startAt = 0;

  constructor(mode: Mode, title: string, race?: RaceResult) {
    this.mode = mode;
    this.title = title;
    this.race = race;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.startAt = performance.now();
    this.ranking.push(...rt.sessionPlayers.sort((a, b) => b.score - a.score));
    playMusic("title");
    sfx.fanfare();
    const [a, b] = this.ranking;
    if (a && b && a.score === b.score) rt.say({ type: "tie" }, true, 4000);
    else if (a && b) {
      rt.say({ type: "win", name: a.name, other: b.name }, true, 4200);
      rt.perf(a, this.mode, "win");
    } else if (a) rt.say({ type: "solo", name: a.name }, true, 4000);
    for (const p of rt.activePlayers) rt.view(p, this.viewFor(p));
    void rt.learner.sync().then(() => rt.learner.pushSnapshot());
  }

  tick() {}

  onNav(dir: NavDir) {
    if (dir === "ok") {
      sfx.select();
      this.rt.run(new LobbyActivity(this.mode));
    } else if (dir === "back") this.rt.run(new TitleActivity());
  }

  viewFor(p: RuntimePlayer): ControllerView {
    const rank = this.ranking.indexOf(p) + 1;
    return {
      mode: "results",
      title: rank === 1 ? "🏆 Ganhaste!" : `${rank}.º lugar`,
      lines: [`${p.score} pontos`, "OK na TV / no telemóvel = Mais uma!"],
      review: p.missed.slice(0, 8).map((m) => ({ pt: m.answer, why: m.why })),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Mode runner                                                                 */
/* -------------------------------------------------------------------------- */

export function startMode(rt: TvRuntime, mode: Mode) {
  const lessonIds = LESSONS[0]!.itemIds;
  const results = (race?: RaceResult) => rt.run(new ResultsActivity(mode, MODE_TITLES[mode], race));
  switch (mode) {
    case "micro":
      rt.run(new MicroRush(() => results(), 10));
      return;
    case "race":
      rt.run(new TurboRace((r) => results(r), lessonIds));
      return;
    case "aula":
      rt.run(new MiniAula(() => results()));
      return;
    case "party":
      // Intro → Micro Loucura → Mini Aula (teach) → Turbo Race (use) → Results.
      rt.run(
        new IntroActivity("NOITE DE FESTA", () =>
          rt.run(new MicroRush(() => rt.run(new MiniAula(() => rt.run(new TurboRace((r) => results(r), lessonIds)))), 8)),
        ),
      );
      return;
  }
}
