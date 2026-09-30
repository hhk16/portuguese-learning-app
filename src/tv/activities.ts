/**
 * Menus, lobby, results and the flow between them.
 *
 * Main menu: Aprender juntos (lessons, in book order) · Jogar (the two-player games) · Definições.
 * After a lesson, results offer the games with that lesson's words.
 */
import { gameNow } from "./clock.ts";
import type { LearnCard } from "../curriculum/learn.ts";
import { getLesson, LESSONS } from "../curriculum/lessons.ts";
import type { Lesson } from "../curriculum/schema.ts";
import { LearnActivity, type LearnSummary } from "../games/learn/learn.ts";
import { ParesSecretos, type SecretResult } from "../games/secret/secret.ts";
import { EmSintonia, type SyncResult } from "../games/sync/sync.ts";
import { NaMesmaOnda, type WaveResult } from "../games/wave/wave.ts";
import { randomId } from "../shared/ids.ts";
import type { ControllerView, InputValue, NavDir } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { lessonsDone, lessonStars, nextLessonId, playableLessons } from "./progress.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "./runtime.ts";

export type Mode = "lesson" | "secret" | "wave" | "sync";

export interface ModeSpec {
  mode: Mode;
  /** Lesson to learn ("lesson") or whose words to play with (games). Default: everything learned. */
  lessonId?: string;
}

export interface GameInfo {
  mode: Exclude<Mode, "lesson">;
  name: string;
  pic: string;
  kind: string;
  how: string;
  soon?: boolean;
}

export const GAMES: GameInfo[] = [
  { mode: "secret", name: "Pares Secretos", pic: "🕵️", kind: "Juntos · pistas", how: "Dá pistas em português; o teu par encontra as imagens." },
  { mode: "wave", name: "Na Mesma Onda", pic: "🔮", kind: "Juntos · adivinhar", how: "Uma palavra, um mostrador: frio ou quente?" },
  { mode: "sync", name: "Em Sintonia", pic: "🤝", kind: "Juntos · telepatia", how: "Escrevam a mesma palavra ao mesmo tempo." },
];

export const SOON = [
  { name: "Desenha!", pic: "🎨" },
  { name: "Stop!", pic: "⏱️" },
  { name: "Cozinha Caótica", pic: "🍳" },
];

/* -------------------------------------------------------------------------- */
/* Title                                                                       */
/* -------------------------------------------------------------------------- */

export interface MenuItem {
  id: string;
  label: string;
  sub?: string;
  pic?: string;
  disabled?: boolean;
  badge?: string;
  stars?: number;
}

export class TitleActivity implements Activity {
  readonly id = "title";
  rt!: TvRuntime;
  menu: "main" | "learn" | "play" | "settings" = "main";
  focus = 0;

  constructor(menu: TitleActivity["menu"] = "main") {
    this.menu = menu;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    if (this.menu === "learn") this.focus = Math.max(0, LESSONS.findIndex((l) => l.id === nextLessonId()));
  }

  get items(): MenuItem[] {
    if (this.menu === "learn") {
      const done = lessonsDone();
      const stars = lessonStars();
      const next = nextLessonId();
      return LESSONS.map((l) => ({
        id: `lesson:${l.id}`,
        label: l.title,
        sub: l.unit === "u00" ? "Unidade 0" : l.unit === "u01" ? "Unidade 1" : "Palavras do dia a dia",
        pic: lessonPic(l),
        badge: l.id === next ? "Próxima" : undefined,
        stars: done.has(l.id) ? (stars[l.id] ?? 1) : 0,
      }));
    }
    if (this.menu === "play")
      return [
        ...GAMES.map((g) => ({ id: g.mode, label: g.name, sub: g.how, pic: g.pic })),
        ...SOON.map((g) => ({ id: `soon:${g.name}`, label: g.name, sub: "Em breve", pic: g.pic, disabled: true })),
      ];
    if (this.menu === "settings") {
      const s = this.rt.settings;
      return [
        { id: "sound", label: `Voz e sons: ${s.sound ? "ligados" : "desligados"}`, pic: s.sound ? "🔊" : "🔇" },
        { id: "lowFx", label: `Efeitos 3D: ${s.lowFx ? "leves" : "completos"}`, sub: "Leves = mais fluido em TVs antigas", pic: "✨" },
      ];
    }
    const done = lessonsDone().size;
    return [
      { id: "learn", label: "Aprender juntos", sub: `Lições do livro · ${done}/${LESSONS.length} feitas`, pic: "📖" },
      { id: "play", label: "Jogar", sub: "Jogos a dois com as palavras que aprenderam", pic: "🎲" },
      { id: "settings", label: "Definições", pic: "⚙️" },
    ];
  }

  tick() {}

  onNav(dir: NavDir) {
    const items = this.items;
    const cols = this.menu === "learn" ? 4 : this.menu === "play" ? 3 : 1;
    const move = (step: number) => {
      let i = this.focus;
      do i = (i + step + items.length) % items.length;
      while (items[i]!.disabled && i !== this.focus);
      this.focus = i;
      play("tap");
      this.rt.bump();
    };
    if (dir === "left") return move(-1);
    if (dir === "right") return move(1);
    if (dir === "up") return move(-cols);
    if (dir === "down") return move(cols);
    if (dir === "back") {
      if (this.menu !== "main") {
        this.focus = { learn: 0, play: 1, settings: 2, main: 0 }[this.menu];
        this.menu = "main";
        play("back");
        this.rt.bump();
      }
      return;
    }
    if (dir !== "ok") return;
    const item = items[this.focus]!;
    if (item.disabled) return play("wrong");
    play("select");
    if (item.id.startsWith("lesson:")) return this.rt.run(new LobbyActivity({ mode: "lesson", lessonId: item.id.slice(7) }));
    switch (item.id) {
      case "secret":
      case "wave":
      case "sync":
        return this.rt.run(new LobbyActivity({ mode: item.id }));
      case "learn":
        this.menu = "learn";
        this.focus = Math.max(0, LESSONS.findIndex((l) => l.id === nextLessonId()));
        break;
      case "play":
      case "settings":
        this.menu = item.id;
        this.focus = 0;
        break;
      case "sound":
        this.rt.setSettings({ sound: !this.rt.settings.sound });
        break;
      case "lowFx":
        this.rt.setSettings({ lowFx: !this.rt.settings.lowFx });
        break;
    }
    this.rt.bump();
  }

  viewFor(): ControllerView {
    return { mode: "remote", title: "Comando", hint: "Usa as setas para escolher na TV" };
  }
}

export function lessonPic(l: Lesson): string {
  const first = l.itemIds.map((id) => id).find(Boolean) ?? "";
  const byId: Record<string, string> = {
    "u00.cumprimentos": "👋",
    "u00.desenrascar": "🤔",
    "u01.ser": "🙋",
    "u01.ter": "🎂",
    "u01.verbos_ar": "💬",
    "u01.chamar_se": "🪪",
    "u01.nacionalidades": "🇵🇹",
    "u01.profissoes": "🧑‍⚕️",
    "u01.de_origin": "🌍",
    "u01.em_lugar": "🏠",
    "u01.numeros": "🔢",
    "a1.comer_beber": "☕",
    "a1.casa_coisas": "🔑",
    "a1.animais_natureza": "🐱",
    "a1.cidade": "🚌",
    "a1.opostos": "🐘",
  };
  return byId[l.id] ?? (first ? "📖" : "📖");
}

/* -------------------------------------------------------------------------- */
/* Lobby: ready check                                                          */
/* -------------------------------------------------------------------------- */

export function specTitle(spec: ModeSpec): string {
  if (spec.mode === "lesson") return getLesson(spec.lessonId ?? "")?.title ?? "Lição";
  return GAMES.find((g) => g.mode === spec.mode)?.name ?? "";
}

export function specPic(spec: ModeSpec): string {
  if (spec.mode === "lesson") return lessonPic(getLesson(spec.lessonId ?? "") ?? LESSONS[0]!);
  return GAMES.find((g) => g.mode === spec.mode)?.pic ?? "🎲";
}

export const HOW_TO: Record<Mode, string[]> = {
  lesson: ["A TV mostra e diz cada exercício.", "Cada um responde em segredo no telemóvel.", "As respostas aparecem juntas. Acertam os dois? Estrela!"],
  secret: ["Cada telemóvel mostra 3 imagens secretas para o teu par encontrar.", "Dá uma pista em português, em voz alta, e escolhe um número.", "O teu par toca nas imagens. Cuidado com as bombas! 💣"],
  wave: ["Um mostrador entre dois opostos: frio ↔ quente.", "Quem vê o alvo diz UMA palavra em português.", "O outro roda o mostrador. Quanto mais perto, mais pontos!"],
  sync: ["Aparecem duas palavras.", "Cada um escreve uma palavra que as ligue.", "3, 2, 1… A mesma palavra? Estão em sintonia!"],
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

  get needsTwo() {
    return this.spec.mode !== "lesson";
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    for (const p of rt.players.values()) p.ready = false;
  }

  tick(now: number) {
    const ps = this.rt.activePlayers;
    const enough = ps.length >= (this.needsTwo ? 2 : 1);
    const allReady = enough && ps.every((p) => p.ready);
    if (allReady && this.countdownAt === null) {
      this.countdownAt = now + 2500;
      play("tick");
      this.rt.bump();
    } else if (!allReady && this.countdownAt !== null) {
      this.countdownAt = null;
      this.rt.bump();
    }
    if (this.countdownAt !== null && now >= this.countdownAt) {
      this.countdownAt = null;
      play("countdown-go");
      this.rt.resetSession();
      startMode(this.rt, this.spec);
    }
  }

  onReady(p: RuntimePlayer, ready: boolean) {
    if (ready) play("select");
    this.rt.view(p, this.viewFor(p));
  }

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  onNav(dir: NavDir, from: RuntimePlayer | "tv") {
    if (dir === "back") this.rt.run(new TitleActivity(this.spec.mode === "lesson" ? "learn" : "play"));
    if (dir === "ok" && from === "tv") {
      // TV remote "OK" = everyone connected is ready.
      for (const p of this.rt.activePlayers) p.ready = true;
      this.rt.bump();
    }
  }

  viewFor(p: RuntimePlayer): ControllerView {
    return { mode: "lobby", ready: p.ready, hint: this.title };
  }
}

/* -------------------------------------------------------------------------- */
/* Results (+ what next)                                                       */
/* -------------------------------------------------------------------------- */

export interface ResultOption {
  id: string;
  label: string;
  sub?: string;
  pic?: string;
  go: () => void;
}

export interface ResultsInfo {
  spec: ModeSpec;
  title: string;
  /** Big team result line, e.g. "9 ⭐ de 12". */
  headline: string;
  sub?: string;
  win: boolean;
  lesson?: LearnSummary;
  words?: LearnCard[];
  options: ResultOption[];
}

export class ResultsActivity implements Activity {
  readonly id = "results";
  rt!: TvRuntime;
  readonly info: ResultsInfo;
  focus = 0;
  startAt = 0;
  private readonly promptId = randomId(6);

  constructor(info: ResultsInfo) {
    this.info = info;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.startAt = gameNow();
    play(this.info.win ? "success-jingle" : "reveal");
    if (this.info.win) rt.celebrate();
    for (const p of rt.activePlayers) rt.emote(p.playerId, this.info.win ? "cheer" : "wave", 3000);
    void rt.learner.sync().then(() => rt.learner.pushSnapshot());
  }

  tick() {}

  private choose(i: number) {
    const o = this.info.options[i];
    if (!o) return;
    play("select");
    o.go();
  }

  onNav(dir: NavDir) {
    const n = this.info.options.length;
    if (dir === "up" || dir === "left" || dir === "down" || dir === "right") {
      this.focus = (this.focus + (dir === "up" || dir === "left" ? -1 : 1) + n) % n;
      play("tap");
      this.rt.bump();
    } else if (dir === "ok") this.choose(this.focus);
    else if (dir === "back") this.rt.run(new TitleActivity());
  }

  onInput(_p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode !== "pick" || promptId !== this.promptId) return;
    this.choose(this.info.options.findIndex((o) => o.id === value.id));
  }

  viewFor(): ControllerView {
    return {
      mode: "pick",
      roundId: "results",
      promptId: this.promptId,
      title: this.info.headline,
      subtitle: this.info.sub,
      options: this.info.options.map((o) => ({ id: o.id, label: o.label, sub: o.sub, emoji: o.pic })),
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

export function startMode(rt: TvRuntime, spec: ModeSpec) {
  rt.onRestart = () => {
    rt.resetSession();
    startMode(rt, spec);
  };
  rt.onQuit = () => rt.run(new TitleActivity(spec.mode === "lesson" ? "learn" : "play"));
  const go = (s: ModeSpec) => () => {
    rt.resetSession();
    startMode(rt, s);
  };
  const menu: ResultOption = { id: "menu", label: "Menu", pic: "🏠", go: () => rt.run(new TitleActivity()) };
  const again: ResultOption = { id: "again", label: "Jogar outra vez", pic: "🔁", go: go(spec) };
  const two = rt.activePlayers.length >= 2;
  const lessonId = spec.lessonId;
  const games = (except?: Mode): ResultOption[] =>
    two ? GAMES.filter((g) => g.mode !== except).map((g) => ({ id: g.mode, label: g.name, sub: g.kind, pic: g.pic, go: go({ mode: g.mode, lessonId }) })) : [];

  switch (spec.mode) {
    case "lesson": {
      const lesson = getLesson(spec.lessonId ?? "") ?? LESSONS[0]!;
      const next = LESSONS[(LESSONS.indexOf(lesson) + 1) % LESSONS.length]!;
      rt.run(
        new LearnActivity(lesson, (s) =>
          rt.run(
            new ResultsActivity({
              spec,
              title: lesson.title,
              headline: `${s.stars} ⭐ de ${s.graded}`,
              sub: s.stars === s.graded ? "Perfeito! Os dois acertaram tudo." : "Estrelas de equipa: quando os dois acertam.",
              win: true,
              lesson: s,
              words: s.words,
              options: [
                ...games().map((o) => ({ ...o, sub: "Jogar com estas palavras" })),
                { id: "next", label: "Próxima lição", sub: next.title, pic: "➡️", go: go({ mode: "lesson", lessonId: next.id }) },
                { id: "again", label: "Repetir a lição", pic: "🔁", go: go(spec) },
                menu,
              ],
            }),
          ),
        ),
      );
      return;
    }
    case "secret":
      rt.run(
        new ParesSecretos(lessonsFor(spec), (r: SecretResult) =>
          rt.run(
            new ResultsActivity({
              spec,
              title: "Pares Secretos",
              headline: r.won ? "Conseguiram! 🎉" : `${r.found} de ${r.goal} pares`,
              sub: r.won ? `Em ${r.turnsUsed} jogadas.` : "Para a próxima!",
              win: r.won,
              options: [again, ...games("secret"), menu],
            }),
          ),
        ),
      );
      return;
    case "wave":
      rt.run(
        new NaMesmaOnda((r: WaveResult) =>
          rt.run(
            new ResultsActivity({
              spec,
              title: "Na Mesma Onda",
              headline: `${r.score} pontos · ${r.rating}`,
              sub: `Máximo: ${r.max}`,
              win: r.score >= 8,
              options: [again, ...games("wave"), menu],
            }),
          ),
        ),
      );
      return;
    case "sync":
      rt.run(
        new EmSintonia(lessonsFor(spec), (r: SyncResult) =>
          rt.run(
            new ResultsActivity({
              spec,
              title: "Em Sintonia",
              headline: `${r.matches.length} de 5 em sintonia`,
              sub: r.matches.length ? `Palavras: ${r.matches.map((m) => m.word).join(", ")}` : "Continuem a tentar!",
              win: r.matches.length >= 2,
              options: [again, ...games("sync"), menu],
            }),
          ),
        ),
      );
      return;
  }
}
