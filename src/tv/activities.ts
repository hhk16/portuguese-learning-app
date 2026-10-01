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
import { GrandeFinal } from "../games/final/final.ts";
import type { Stroke } from "../games/draw/ink.ts";
import { ParesSecretos } from "../games/secret/secret.ts";
import { EmSintonia } from "../games/sync/sync.ts";
import { NaMesmaOnda } from "../games/wave/wave.ts";
import { Desenha } from "../games/draw/draw.ts";
import { Stop } from "../games/stop/stop.ts";
import { Cozinha } from "../games/kitchen/kitchen.ts";
import { randomId } from "../shared/ids.ts";
import type { ControllerView, InputValue, NavDir } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { NAMED, RULES, SAY } from "./host-lines.ts";
import { bestScore, countPlay, lastLevel, LEVELS, recordScore, rememberLevel, wantsPractice, type Level } from "./progress.ts";
import { lessonsDone, lessonStars, nextLessonId, playableLessons } from "./progress.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "./runtime.ts";

export type Mode = "lesson" | "secret" | "wave" | "sync" | "draw" | "stop" | "kitchen" | "final";

export interface ModeSpec {
  mode: Mode;
  /** Games: 1 Fácil · 2 Médio · 3 Difícil. */
  level?: Level;
  /** Lesson to learn ("lesson") or whose words to play with (games). Default: everything learned. */
  lessonId?: string;
}

export interface GameInfo {
  mode: Exclude<Mode, "lesson" | "final">;
  name: string;
  pic: string;
  kind: string;
  how: string;
  howEn: string;
  soon?: boolean;
}

/** "Recorde 42" on a game card: the best score at the last-played difficulty. */
function bestBadge(mode: GameInfo["mode"]): string | undefined {
  const b = bestScore(mode, lastLevel(mode));
  return b !== null ? `🏆 ${b}` : undefined;
}

export const GAMES: GameInfo[] = [
  { mode: "secret", name: "Pares Secretos", pic: "🕵️", kind: "Juntos · pistas", how: "Dá pistas em português; o teu par encontra as imagens.", howEn: "Give clues in Portuguese; your partner finds the pictures." },
  { mode: "wave", name: "Na Mesma Onda", pic: "🔮", kind: "Juntos · adivinhar", how: "Uma pista, um mostrador: frio ou quente?", howEn: "One clue, one dial: cold or hot?" },
  { mode: "sync", name: "Em Sintonia", pic: "🤝", kind: "Juntos · telepatia", how: "Escrevam a mesma palavra ao mesmo tempo.", howEn: "Write the same word at the same time." },
  { mode: "draw", name: "Desenha!", pic: "🎨", kind: "Juntos · desenhar", how: "Um desenha no telemóvel, o outro adivinha a palavra.", howEn: "One draws on the phone, the other guesses the word." },
  { mode: "stop", name: "Stop!", pic: "⏱️", kind: "Um contra o outro · escrever", how: "Uma letra, quatro categorias. Quem acaba grita STOP!", howEn: "One letter, four categories. First to finish shouts STOP!" },
  { mode: "kitchen", name: "Cozinha Caótica", pic: "🧑‍🍳", kind: "Juntos · correria", how: "Os clientes pedem em português. Sirvam depressa!", howEn: "Customers order in Portuguese. Serve fast!" },
];

export const SOON: { name: string; pic: string }[] = [];

/* -------------------------------------------------------------------------- */
/* Title                                                                       */
/* -------------------------------------------------------------------------- */

export interface MenuItem {
  id: string;
  label: string;
  sub?: string;
  subEn?: string;
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
        ...GAMES.map((g) => ({ id: g.mode, label: g.name, sub: g.how, subEn: g.howEn, pic: g.pic, badge: bestBadge(g.mode) })),
        ...SOON.map((g) => ({ id: `soon:${g.name}`, label: g.name, sub: "Em breve", pic: g.pic, disabled: true })),
      ];
    if (this.menu === "settings") {
      const s = this.rt.settings;
      return [
        { id: "sound", label: `Voz e sons: ${s.sound ? "ligados" : "desligados"}`, subEn: `Voice, music and sounds: ${s.sound ? "on" : "off"}`, pic: s.sound ? "🔊" : "🔇" },
        { id: "lowFx", label: `Efeitos 3D: ${s.lowFx ? "leves" : "completos"}`, sub: "Leves = mais fluido em TVs antigas", subEn: "Light = smoother on older TVs", pic: "✨" },
      ];
    }
    const done = lessonsDone().size;
    return [
      { id: "night", label: "Noite de jogos", sub: "3 jogos seguidos + a Grande Final", subEn: "Game night: 3 games in a row + a Grand Final", pic: "🎉", badge: "Novo" },
      { id: "learn", label: "Aprender juntos", sub: `Lições do livro · ${done}/${LESSONS.length} feitas`, subEn: "Learn together: lessons from the book", pic: "📖" },
      { id: "play", label: "Jogar", sub: "Jogos a dois com as palavras que aprenderam", subEn: "Play: party games with your new words", pic: "🎲" },
      { id: "settings", label: "Definições", subEn: "Settings", pic: "⚙️" },
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
        this.focus = { learn: 1, play: 2, settings: 3, main: 0 }[this.menu];
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
      case "draw":
      case "stop":
      case "kitchen":
        return this.rt.run(new LobbyActivity({ mode: item.id }));
      case "night":
        return startNight(this.rt);
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
    return { mode: "remote", title: "Comando", hint: "Usa as setas para escolher na TV · Use the arrows to choose on the TV" };
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
  if (spec.mode === "final") return "Grande Final";
  return GAMES.find((g) => g.mode === spec.mode)?.name ?? "";
}

export function specPic(spec: ModeSpec): string {
  if (spec.mode === "lesson") return lessonPic(getLesson(spec.lessonId ?? "") ?? LESSONS[0]!);
  if (spec.mode === "final") return "🏆";
  return GAMES.find((g) => g.mode === spec.mode)?.pic ?? "🎲";
}

export const HOW_TO = RULES;

export class LobbyActivity implements Activity {
  readonly id = "lobby";
  rt!: TvRuntime;
  countdownAt: number | null = null;
  spec: ModeSpec;

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
    if (this.spec.mode !== "lesson" && !this.spec.level) this.spec = { ...this.spec, level: lastLevel(this.spec.mode) };
    for (const p of rt.players.values()) p.ready = false;
    // The host reads the rules (PT, with English on screen) — no reading needed at A1.
    setTimeout(() => {
      if (rt.activity === this) rt.say(RULES[this.spec.mode]);
    }, 700);
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
      // A game night keeps tonight's points from game to game.
      if (!this.rt.night) this.rt.resetSession();
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

  get level(): Level {
    return this.spec.level ?? 1;
  }

  /** Previous best at the chosen difficulty (for the lobby). */
  get best(): number | null {
    return this.spec.mode === "lesson" ? null : bestScore(this.spec.mode, this.level);
  }

  onNav(dir: NavDir, from: RuntimePlayer | "tv") {
    if ((dir === "left" || dir === "right") && this.spec.mode !== "lesson") {
      const next = Math.max(1, Math.min(3, this.level + (dir === "left" ? -1 : 1))) as Level;
      if (next !== this.level) {
        this.spec = { ...this.spec, level: next };
        rememberLevel(this.spec.mode, next);
        play("select");
        const l = LEVELS[next - 1]!;
        this.rt.cue({ pt: `${l.pt} ${l.stars}`, en: `Difficulty: ${l.en}` }, from === "tv" ? undefined : from);
        this.rt.refreshViews();
        this.rt.bump();
      }
      return;
    }
    if (dir === "back") this.rt.run(new TitleActivity(this.spec.mode === "lesson" ? "learn" : "play"));
    if (dir === "ok" && from === "tv") {
      // TV remote "OK" = everyone connected is ready.
      for (const p of this.rt.activePlayers) p.ready = true;
      this.rt.bump();
    }
  }

  viewFor(p: RuntimePlayer): ControllerView {
    return { mode: "lobby", ready: p.ready, hint: this.title, level: this.spec.mode === "lesson" ? undefined : this.level };
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

/** What every game reports at the end (the results screen, stars and records are built from it). */
export interface GameOutcome {
  score: number;
  max: number;
  headline: string;
  headlineEn: string;
  sub?: string;
  subEn?: string;
  /** Words you used or met in the game, for the recap (the TV says them). */
  words?: { pt: string; en?: string; pic?: string }[];
  /** Desenha!: the drawings, replayed on the results screen. */
  gallery?: GalleryItem[];
  /** Versus games: each player's share, 0–100 (co-op games give everyone score/max). */
  perPlayer?: Record<string, number>;
  /** A moment worth remembering at the end of the night ("Em cheio com “o café”!"). */
  highlight?: { pt: string; en: string; pic?: string };
}

export interface GalleryItem {
  pt: string;
  en?: string;
  guessed: boolean;
  strokes: Stroke[];
}

/** Stars from a score: 35% / 60% / 85% of the maximum. */
export function starsFor(score: number, max: number): 0 | 1 | 2 | 3 {
  const f = max > 0 ? score / max : 0;
  return f >= 0.85 ? 3 : f >= 0.6 ? 2 : f >= 0.35 ? 1 : 0;
}

/** Points still missing for the next star. */
export function toNextStar(score: number, max: number): number | null {
  for (const f of [0.35, 0.6, 0.85]) if (score < Math.ceil(f * max)) return Math.ceil(f * max) - score;
  return null;
}

export interface ResultsInfo {
  spec: ModeSpec;
  title: string;
  /** Big team result line, e.g. "9 ⭐ de 12". */
  headline: string;
  headlineEn?: string;
  sub?: string;
  subEn?: string;
  score?: number;
  max?: number;
  stars?: 0 | 1 | 2 | 3;
  practiced?: { pt: string; en?: string; pic?: string }[];
  gallery?: GalleryItem[];
  /** Game night: go on to the first option by itself after this many ms. */
  autoGo?: number;
  /** The end of a game night: crown the champion. */
  champion?: boolean;
  /** Game night: "pontos da noite" each player just gained, and everyone's total so far. */
  nightGain?: Record<string, number>;
  nightTotals?: Record<string, number>;
  win: boolean;
  lesson?: LearnSummary;
  words?: LearnCard[];
  options: ResultOption[];
}

/* -------------------------------------------------------------------------- */
/* End of a game night: the crowning                                           */
/* -------------------------------------------------------------------------- */

type Night = NonNullable<TvRuntime["night"]>;

/**
 * The show's ending (~17 s): drumroll and lights down, the star of the night on the podium with
 * the crown, then "Melhores momentos" — the best drawing, the night's highlights and the word
 * of the night (spoken). OK on the remote skips it.
 */
export class ChampionActivity implements Activity {
  readonly id = "champion";
  rt!: TvRuntime;
  stage: 0 | 1 | 2 = 0;
  startAt = 0;
  readonly night: Night;
  private readonly onDone: () => void;
  private done = false;
  private wordSaid = false;

  constructor(night: Night, onDone: () => void) {
    this.night = night;
    this.onDone = onDone;
  }

  /** Players by pontos da noite, best first. */
  get standings(): { p: RuntimePlayer; pts: number }[] {
    return this.rt.activePlayers.map((p) => ({ p, pts: this.night.points[p.playerId] ?? 0 })).sort((a, b) => b.pts - a.pts);
  }
  get tie() {
    const [a, b] = this.standings;
    return !!a && !!b && a.pts === b.pts;
  }
  /** A word someone missed tonight (or one of tonight's words): it comes back tomorrow. */
  get wordOfNight(): { pt: string; en?: string; pic?: string } | undefined {
    const missed = this.rt.activePlayers.flatMap((p) => p.missed)[0];
    if (missed) return { pt: missed.pt, en: missed.en };
    return this.night.words.find((w) => w.pic) ?? this.night.words[0];
  }
  get drawing(): GalleryItem | undefined {
    return this.night.drawing as GalleryItem | undefined;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.startAt = gameNow();
    play("drumroll");
    rt.say(SAY.champion, { interrupt: true });
  }

  tick(now: number) {
    const t = now - this.startAt;
    if (this.stage === 0 && t > 2100) {
      this.stage = 1;
      play("cymbal");
      play("fanfare");
      setTimeout(() => this.rt.activity === this && play("crowd-cheer"), 900);
      this.rt.celebrate();
      const [top, second] = this.standings;
      if (this.tie) this.rt.say(SAY.twoChampions);
      else if (top) this.rt.say(NAMED.mvp, { name: top.p.name });
      if (top) this.rt.emote(top.p.playerId, "cheer", 6000);
      if (second) this.rt.emote(second.p.playerId, this.tie ? "cheer" : "wave", 6000);
      this.rt.refreshViews();
      this.rt.bump();
    }
    if (this.stage === 1 && t > 6500) {
      this.stage = 2;
      play("sparkle");
      this.rt.bump();
    }
    if (this.stage === 2 && !this.wordSaid && t > 10_500) {
      this.wordSaid = true;
      const w = this.wordOfNight;
      if (w) this.rt.speakPt(w.pt);
    }
    if (t > 17_500) this.finish();
  }

  onNav(dir: NavDir) {
    if (dir === "ok" && this.stage > 0) this.finish();
  }

  private finish() {
    if (this.done) return;
    this.done = true;
    this.onDone();
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.stage === 0) return { mode: "wait", title: "E a estrela da noite é…", subtitle: "And tonight's star is… 🥁", pic: "🥁" };
    const [top] = this.standings;
    const me = this.night.points[p.playerId] ?? 0;
    const star = this.tie || top?.p === p;
    return { mode: "wait", title: star ? "👑 És a estrela da noite!" : `👑 ${top?.p.name ?? ""}!`, subtitle: `${me} pontos da noite · tonight's points`, pic: star ? "👑" : "👏" };
  }
}

/** How long phones show "Olha para a TV!" while the TV reveals the results. */
const RESULTS_HOLD_MS = 4200;

export class ResultsActivity implements Activity {
  readonly id = "results";
  rt!: TvRuntime;
  readonly info: ResultsInfo;
  focus = 0;
  startAt = 0;
  /** Personal best before this game (null = first time) and whether this game beat it. */
  record: { previous: number | null; isNew: boolean } | null = null;
  private readonly promptId = randomId(6);

  constructor(info: ResultsInfo) {
    this.info = info;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.startAt = gameNow();
    setTimeout(() => rt.activity === this && rt.refreshViews(), RESULTS_HOLD_MS + 50);
    const { spec, score } = this.info;
    if (spec.mode !== "lesson" && score !== undefined) {
      this.record = recordScore(spec.mode, spec.level ?? 1, score);
      countPlay(spec.mode);
    }
    const stars = this.info.stars;
    // Versus results already had their winner line; co-op gets praise or encouragement.
    if (this.record?.isNew && this.record.previous !== null) rt.say(SAY.record);
    else if (spec.mode !== "stop" && spec.mode !== "final") rt.say(stars === undefined || stars >= 2 ? SAY.youDidIt : SAY.nextTime);
    // Recap: the TV says the words you met, so the round ends on listening.
    const words = (this.info.practiced ?? []).slice(0, 4);
    if (words.length) setTimeout(() => rt.activity === this && words.forEach((w, i) => setTimeout(() => rt.activity === this && rt.speakPt(w.pt), i * 1600)), 2600);
    play(this.info.win ? "success-jingle" : "reveal");
    // Stars land one by one, each a note higher; three stars get the crowd, a record the fanfare.
    const n = stars ?? 0;
    for (let i = 0; i < n; i++) setTimeout(() => rt.activity === this && play("star", 1, 1 + i * 0.12), 900 + i * 450);
    if (this.record?.isNew && this.record.previous !== null) setTimeout(() => rt.activity === this && play("fanfare"), 900 + n * 450);
    else if (n === 3) setTimeout(() => rt.activity === this && play("crowd-cheer"), 900 + n * 450);
    else if (stars === 0) setTimeout(() => rt.activity === this && play("sad-trombone", 0.7), 900);
    if (this.info.win) rt.celebrate();
    for (const p of rt.activePlayers) rt.emote(p.playerId, this.info.win ? "cheer" : "wave", 3000);
    void rt.learner.sync().then(() => rt.learner.pushSnapshot());
  }

  tick(now: number) {
    const auto = this.info.autoGo;
    if (auto && now - this.startAt > auto && !this.went) {
      this.went = true;
      this.info.options[0]?.go();
    }
  }
  private went = false;

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
    // Phones wait for the TV's reveal (stars, record) before showing the menu.
    if (gameNow() - this.startAt < RESULTS_HOLD_MS) return { mode: "wait", title: "Olha para a TV!", subtitle: "Look at the TV — here come the results!", pic: "👀" };
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

/** Game night: three different games in a row (at least one versus), then the Grande Final. */
export function startNight(rt: TvRuntime) {
  rt.resetSession();
  const coop = rt.rng.shuffle(GAMES.filter((g) => g.mode !== "stop").map((g) => g.mode));
  rt.night = { games: rt.rng.shuffle(["stop", coop[0]!, coop[1]!]), index: 0, words: [], points: {}, moments: [] };
  rt.run(new LobbyActivity({ mode: rt.night.games[0] as Mode }));
}

/** Adds a game's "pontos da noite" (0–100 each) and returns what everyone gained. */
function addNightPoints(rt: TvRuntime, o: GameOutcome): Record<string, number> {
  const n = rt.night;
  const gained: Record<string, number> = {};
  if (!n) return gained;
  const team = Math.round(Math.min(100, (o.score / Math.max(1, o.max)) * 100));
  for (const p of rt.activePlayers) {
    const g = o.perPlayer?.[p.playerId] ?? team;
    gained[p.playerId] = g;
    n.points[p.playerId] = (n.points[p.playerId] ?? 0) + g;
  }
  return gained;
}

/** Next game of the night, or the final. Session points are kept between games. */
function nextInNight(rt: TvRuntime) {
  const n = rt.night;
  if (!n) return rt.run(new TitleActivity());
  n.index++;
  rt.run(new LobbyActivity({ mode: (n.games[n.index] ?? "final") as Mode }));
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
  // Suggest three other games, a different three each time.
  const games = (except?: Mode): ResultOption[] =>
    two
      ? rt.rng
          .shuffle(GAMES.filter((g) => g.mode !== except))
          .slice(0, 3)
          .map((g) => ({ id: g.mode, label: g.name, sub: g.kind, pic: g.pic, go: go({ mode: g.mode, lessonId }) }))
      : [];

  const level: Level = spec.level ?? 1;
  const night = rt.night && rt.night.games[rt.night.index] === spec.mode ? rt.night : null;
  const gameDone = (title: string, o: GameOutcome) => {
    const stars = starsFor(o.score, o.max);
    if (night) {
      night.words.push(...(o.words ?? []));
      const gained = addNightPoints(rt, o);
      if (o.highlight) night.moments.push(o.highlight);
      if (o.gallery?.length) night.drawing = o.gallery.find((g) => g.guessed) ?? o.gallery[0];
      const nextMode = night.games[night.index + 1];
      const nextGame = GAMES.find((g) => g.mode === nextMode);
      const advance: ResultOption = nextGame
        ? { id: "night-next", label: `A seguir: ${nextGame.name}`, sub: `Next game (${night.index + 2}/${night.games.length})`, pic: nextGame.pic, go: () => nextInNight(rt) }
        : { id: "night-final", label: "Grande Final! 🏆", sub: "The Grand Final: who's tonight's star?", pic: "🏆", go: () => nextInNight(rt) };
      rt.run(
        new ResultsActivity({
          spec,
          title: `Noite de jogos ${night.index + 1}/${night.games.length} · ${title}`,
          headline: o.headline,
          headlineEn: o.headlineEn,
          sub: o.sub,
          subEn: o.subEn,
          win: stars > 0,
          score: o.score,
          max: o.max,
          stars,
          practiced: o.words,
          gallery: o.gallery,
          nightGain: gained,
          nightTotals: { ...night.points },
          options: [advance, { ...menu, label: "Terminar a noite", sub: "End the night" }],
          autoGo: 15_000,
        }),
      );
      return;
    }
    const up: ResultOption[] =
      stars === 3 && level < 3 ? [{ id: "levelup", label: `Tentar ${LEVELS[level]!.pt} ${LEVELS[level]!.stars}`, sub: `Try ${LEVELS[level]!.en}`, pic: "🚀", go: go({ ...spec, level: (level + 1) as Level }) }] : [];
    rt.run(
      new ResultsActivity({
        spec,
        title: `${title} · ${LEVELS[level - 1]!.pt}`,
        headline: o.headline,
        headlineEn: o.headlineEn,
        sub: o.sub,
        subEn: o.subEn,
        win: stars > 0,
        score: o.score,
        max: o.max,
        stars,
        practiced: o.words,
        gallery: o.gallery,
        options: [...up, { ...again, label: "Outra vez!", sub: "Play again" }, ...games(spec.mode), menu],
      }),
    );
  };

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
              sub: `${s.stars === s.graded ? "Perfeito! Os dois acertaram tudo." : "Estrelas de equipa: quando os dois acertam."}${s.bestCombo >= 3 ? ` Melhor combo: ×${s.bestCombo}!` : ""}`,
              subEn: s.stars === s.graded ? "Perfect — you both got everything right." : `Team stars: when you're both right.${s.bestCombo >= 3 ? ` Best combo ×${s.bestCombo}!` : ""}`,
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
    case "secret": {
      const g = new ParesSecretos(lessonsFor(spec), (o) => gameDone("Pares Secretos", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode);
      rt.run(g);
      return;
    }
    case "wave": {
      const g = new NaMesmaOnda((o) => gameDone("Na Mesma Onda", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode);
      rt.run(g);
      return;
    }
    case "sync": {
      const g = new EmSintonia(lessonsFor(spec), (o) => gameDone("Em Sintonia", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode);
      rt.run(g);
      return;
    }
    case "draw": {
      const g = new Desenha(lessonsFor(spec), (o) => gameDone("Desenha!", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode);
      rt.run(g);
      return;
    }
    case "final": {
      const words = rt.night?.words ?? [];
      const g = new GrandeFinal(words, (o) => {
        const night = rt.night;
        if (night) addNightPoints(rt, o);
        const totals = night ? { ...night.points } : undefined;
        const results = () => {
          rt.night = null;
          rt.run(
          new ResultsActivity({
            spec,
            title: "Grande Final · Noite de jogos",
            headline: o.headline,
            headlineEn: o.headlineEn,
            sub: o.sub,
            subEn: o.subEn,
            win: true,
            score: o.score,
            max: o.max,
            stars: starsFor(o.score, o.max),
            practiced: o.words,
        gallery: o.gallery,
            champion: true,
            nightTotals: totals,
            options: [
              { id: "night", label: "Outra noite!", sub: "Another game night", pic: "🎉", go: () => startNight(rt) },
              ...games(),
              menu,
            ],
          }),
          );
        };
        // The crowning ceremony first, then the results card.
        if (night) rt.run(new ChampionActivity(night, results));
        else results();
      });
      g.level = level;
      rt.run(g);
      return;
    }
    case "stop": {
      const g = new Stop((o) => gameDone("Stop!", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode);
      rt.run(g);
      return;
    }
    case "kitchen": {
      const g = new Cozinha((o) => gameDone("Cozinha Caótica", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode);
      rt.run(g);
      return;
    }
  }
}
