/**
 * Menus, lobby, results and the flow between them.
 *
 * Main menu: Aprender juntos (lessons, in book order) · Jogar (the two-player games) · Definições.
 * After a lesson, results offer the games with that lesson's words.
 */
import { gameNow } from "./clock.ts";
import type { LearnCard } from "../curriculum/learn.ts";
import { getLesson, LESSONS } from "../curriculum/lessons.ts";
import { UNITS, unitOf } from "../curriculum/units.ts";
import type { Lesson } from "../curriculum/schema.ts";
import { LearnActivity, type LearnSummary } from "../games/learn/learn.ts";
import { GrandeFinal } from "../games/final/final.ts";
import type { Stroke } from "../games/draw/ink.ts";
import { ParesSecretos } from "../games/secret/secret.ts";
import { EmSintonia } from "../games/sync/sync.ts";
import { NaMesmaOnda } from "../games/wave/wave.ts";
import { Desenha } from "../games/draw/draw.ts";
import { QuemFazOQue } from "../games/verbs/verbs.ts";
import { Stop } from "../games/stop/stop.ts";
import { Cozinha } from "../games/kitchen/kitchen.ts";
import { BatataQuente } from "../games/bomb/bomb.ts";
import { randomId } from "../shared/ids.ts";
import type { ControllerView, InputValue, NavDir } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { NAMED, RULES, SAY } from "./host-lines.ts";
import { bestScore, countPlay, lastLevel, lastTopic, LEVELS, recordScore, rememberLevel, rememberTopic, wantsPractice, type Level } from "./progress.ts";
import { lessonsDone, lessonStars, nextLessonId, playableLessons } from "./progress.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "./runtime.ts";
import { award, levelOf, type Award } from "./stats.ts";
import { BOTTOMS, bottomsFor, DEFAULT_LOOK, hasLook, TOPS } from "../art/wardrobe.ts";

export type Mode = "lesson" | "secret" | "wave" | "sync" | "draw" | "stop" | "bomb" | "kitchen" | "verbs" | "final";

/** Head-to-head games (the rest are co-op). A game night has one of them. */
export const VERSUS: readonly Mode[] = ["stop", "bomb"];

export interface ModeSpec {
  mode: Mode;
  /** Which words: a book unit ("u03") or "all" (everything learned so far). */
  unitId?: string;
  /** Games: 1 Fácil · 2 Médio · 3 Difícil. */
  level?: Level;
  /** Lesson to learn ("lesson") or whose words to play with (games). Default: everything learned. */
  lessonId?: string;
  /** Lesson: just the lightning round again (a retry after losing it). */
  rushOnly?: boolean;
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
  { mode: "verbs", name: "Quem faz o quê?", pic: "🧩", kind: "Juntos · verbos", how: "Os dois escrevem um verbo; depois troquem e leiam quem o faz.", howEn: "Both write a verb, then swap and read who's doing it." },
  { mode: "bomb", name: "Batata Quente", pic: "🥔", kind: "Um contra o outro · rapidez", how: "Responde certo e passa a batata. Quando explodir, não a queiras na mão!", howEn: "Answer right to pass the potato. Don't be holding it when it blows!" },
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
  /** learn = the book's units; unit = one unit's lessons; progress = levels, streaks, badges. */
  menu: "main" | "learn" | "unit" | "play" | "settings" | "progress" = "main";
  focus = 0;
  unitId = "u00";

  constructor(menu: TitleActivity["menu"] = "main") {
    this.menu = menu;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    if (this.menu === "learn") this.focusNextUnit();
    // First time: Ana names the puppy on her phone.
    setTimeout(() => rt.activity === this && rt.maybeAskPetName(), 1500);
  }

  onPlayersChanged() {
    this.rt.maybeAskPetName();
    this.rt.bump();
  }

  /** Units that have lessons, in book order. */
  get units() {
    return UNITS.filter((u) => LESSONS.some((l) => unitOf(l.unit)?.id === u.id));
  }
  private focusNextUnit() {
    const next = getLesson(nextLessonId() ?? "");
    this.focus = Math.max(0, this.units.findIndex((u) => u.id === unitOf(next?.unit ?? "u00")?.id));
  }

  get items(): MenuItem[] {
    if (this.menu === "learn") {
      const done = lessonsDone();
      const next = nextLessonId();
      return this.units.map((u) => {
        const ls = LESSONS.filter((l) => unitOf(l.unit)?.id === u.id);
        const n = ls.filter((l) => done.has(l.id)).length;
        return { id: `unit:${u.id}`, label: `${u.short} · ${u.title}`, sub: `${n}/${ls.length} lições`, subEn: u.en, pic: u.pic, badge: ls.some((l) => l.id === next) ? "Próxima" : undefined, stars: n === ls.length && n > 0 ? 3 : 0 };
      });
    }
    if (this.menu === "unit") {
      const done = lessonsDone();
      const stars = lessonStars();
      const next = nextLessonId();
      return LESSONS.filter((l) => unitOf(l.unit)?.id === this.unitId).map((l) => ({
        id: `lesson:${l.id}`,
        label: l.title,
        // The unit is already in the breadcrumb: say what's inside instead.
        sub: `${l.itemIds.length} palavras e frases`,
        subEn: `${l.itemIds.length} words and phrases`,
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
        { id: "pet", label: `Cachorrinho: ${s.petName || "sem nome"}`, sub: "Mudar o nome no telemóvel da Ana", subEn: "Rename the puppy (on Ana's phone)", pic: "🐶" },
      ];
    }
    const done = lessonsDone().size;
    return [
      { id: "night", label: "Noite de jogos", sub: "3 jogos seguidos + a Grande Final", subEn: "Game night: 3 games in a row + a Grand Final", pic: "🎉", badge: "Novo" },
      { id: "learn", label: "Aprender juntos", sub: `Lições do livro · ${done}/${LESSONS.length} feitas`, subEn: "Learn together: lessons from the book", pic: "📖" },
      { id: "play", label: "Jogar", sub: "Jogos a dois com as palavras que aprenderam", subEn: "Play: party games with your new words", pic: "🎲" },
      { id: "progress", label: "Progresso", sub: "Níveis, dias seguidos e medalhas", subEn: "Progress: levels, streaks and badges", pic: "📈" },
      { id: "wardrobe", label: "Guarda-roupa", sub: "A Ana escolhe a roupa no telemóvel", subEn: "Wardrobe: Ana picks her outfit on her phone", pic: "👗", badge: "Novo" },
      { id: "settings", label: "Definições", subEn: "Settings", pic: "⚙️" },
    ];
  }

  tick() {}

  onNav(dir: NavDir) {
    const items = this.items;
    if (!items.length && dir !== "back") return;
    const cols = this.menu === "unit" ? 4 : this.menu === "learn" || this.menu === "play" ? 3 : 1;
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
      if (this.menu === "unit") {
        this.menu = "learn";
        this.focus = Math.max(0, this.units.findIndex((u) => u.id === this.unitId));
        play("back");
        this.rt.bump();
      } else if (this.menu !== "main") {
        this.focus = { learn: 1, play: 2, progress: 3, settings: 5, main: 0 }[this.menu];
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
    if (item.id.startsWith("unit:")) {
      this.unitId = item.id.slice(5);
      this.menu = "unit";
      const ls = LESSONS.filter((l) => unitOf(l.unit)?.id === this.unitId);
      this.focus = Math.max(0, ls.findIndex((l) => l.id === nextLessonId()));
      this.rt.bump();
      return;
    }
    switch (item.id) {
      case "secret":
      case "wave":
      case "sync":
      case "draw":
      case "stop":
      case "bomb":
      case "kitchen":
      case "verbs":
        return this.rt.run(new LobbyActivity({ mode: item.id }));
      case "night":
        return startNight(this.rt);
      case "wardrobe":
        return this.rt.run(new WardrobeActivity());
      case "learn":
        this.menu = "learn";
        this.focusNextUnit();
        break;
      case "play":
      case "settings":
      case "progress":
        this.menu = item.id;
        this.focus = 0;
        break;
      case "pet":
        this.rt.askPetName(true);
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

/**
 * Guarda-roupa: Ana picks a top and a bottom on her phone and sees herself in them, big on the TV.
 * The TV says each piece in Portuguese (clothes vocabulary). The TV remote works too: ◀ ▶ tops, ▲ ▼ bottoms.
 */
export class WardrobeActivity implements Activity {
  readonly id = "wardrobe";
  rt!: TvRuntime;
  top = DEFAULT_LOOK.top;
  bottom = DEFAULT_LOOK.bottom;
  /** Bumped on every change (the TV pops the new look). */
  seq = 0;
  private changes = 0;

  /** Who's dressing up: whoever plays Ana's character, else the puppy's person. */
  get dresser(): RuntimePlayer | undefined {
    return this.rt.activePlayers.find((p) => p.avatar === "ana") ?? this.rt.petOwner();
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    const l = rt.settings.look ?? DEFAULT_LOOK;
    if (hasLook(l.top, l.bottom)) [this.top, this.bottom] = [l.top, l.bottom];
    rt.say(SAY.wardrobe);
    const d = this.dresser;
    if (d) rt.emote(d.playerId, "wave", 2500);
    rt.refreshViews();
  }

  tick() {}

  onPlayersChanged() {
    this.rt.refreshViews();
  }

  private set(top: string, bottom: string) {
    if (!hasLook(top, bottom)) bottom = bottomsFor(top)[0] ?? bottom;
    if (!hasLook(top, bottom) || (top === this.top && bottom === this.bottom)) return;
    const said = top !== this.top ? TOPS.find((t) => t.id === top) : BOTTOMS.find((b) => b.id === bottom);
    this.top = top;
    this.bottom = bottom;
    this.seq++;
    this.changes++;
    this.rt.setSettings({ look: { top, bottom } });
    play("pop", 0.9, 1.1);
    if (said) this.rt.speakPt(said.pt);
    const d = this.dresser;
    if (d) this.rt.emote(d.playerId, "cheer", 1400);
    this.rt.petDo("cheer", 1600);
    if (this.changes % 4 === 2) setTimeout(() => this.rt.activity === this && this.rt.say(SAY.suitsYou), 1400);
    this.rt.refreshViews();
    this.rt.bump();
  }

  onInput(p: RuntimePlayer, _promptId: string, _roundId: string, value: InputValue) {
    if (value.mode !== "wardrobe" || p !== this.dresser) return;
    if (value.done) return this.close();
    if (value.top) this.set(value.top, this.bottom);
    if (value.bottom) this.set(this.top, value.bottom);
  }

  onNav(dir: NavDir) {
    const tops = TOPS.filter((t) => bottomsFor(t.id).length);
    const bottoms = bottomsFor(this.top);
    const ti = tops.findIndex((t) => t.id === this.top);
    const bi = bottoms.indexOf(this.bottom);
    if (dir === "left" || dir === "right") this.set(tops[(ti + (dir === "right" ? 1 : -1) + tops.length) % tops.length]!.id, this.bottom);
    else if (dir === "up" || dir === "down") this.set(this.top, bottoms[(bi + (dir === "down" ? 1 : -1) + bottoms.length) % bottoms.length]!);
    else if (dir === "ok" || dir === "back") this.close();
  }

  private closing = false;
  /** "Pronto!": a little reveal of today's look, then back to the menu. */
  private close() {
    if (this.closing) return;
    this.closing = true;
    play("fanfare", 0.7);
    this.rt.celebrate();
    const top = TOPS.find((t) => t.id === this.top);
    const bottom = BOTTOMS.find((b) => b.id === this.bottom);
    this.rt.bigMoment({ pt: "✨ O look de hoje!", en: `${top?.pt ?? ""} + ${bottom?.pt ?? ""}` }, "won", 2800, true);
    const d = this.dresser;
    if (d) this.rt.emote(d.playerId, "cheer", 2800);
    this.rt.petDo("cheer", 2800);
    this.rt.say(SAY.suitsYou);
    setTimeout(() => this.rt.activity === this && this.rt.run(new TitleActivity()), 3000);
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (p !== this.dresser) return { mode: "wait", title: `${this.dresser?.name ?? "A Ana"} está a escolher a roupa`, subtitle: "Picking an outfit — olha para a TV! 👗", pic: "👗" };
    return {
      mode: "wardrobe",
      roundId: "wardrobe",
      promptId: "wardrobe",
      tops: TOPS.map((t) => ({ ...t, available: bottomsFor(t.id).length > 0 })),
      bottoms: BOTTOMS.map((b) => ({ ...b, available: hasLook(this.top, b.id) })),
      top: this.top,
      bottom: this.bottom,
    };
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

  /** The Grande Final plays at the night's difficulty: no picker. */
  get picksLevel() {
    return this.spec.mode !== "lesson" && this.spec.mode !== "final";
  }

  /** Games built on your words can be played with one unit's words (▲ ▼ on the phone). */
  get picksTopic() {
    return WORD_GAMES.includes(this.spec.mode);
  }
  get topics(): { id: string; pt: string; en: string }[] {
    const units = UNITS.filter((u) => LESSONS.some((l) => unitOf(l.unit)?.id === u.id));
    return [{ id: "all", pt: "Tudo o que já aprendemos", en: "Everything you've learned" }, ...units.map((u) => ({ id: u.id, pt: `${u.short} · ${u.title}`, en: u.en }))];
  }
  get topic(): { id: string; pt: string; en: string } {
    if (this.spec.lessonId && !this.spec.unitId) {
      const l = getLesson(this.spec.lessonId);
      return { id: "lesson", pt: l?.title ?? "Esta lição", en: "This lesson's words" };
    }
    return this.topics.find((t) => t.id === (this.spec.unitId ?? "all")) ?? this.topics[0]!;
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    if (this.spec.mode === "final") this.spec = { ...this.spec, level: rt.night?.level ?? 1 };
    if (this.picksTopic && !this.spec.unitId && !this.spec.lessonId) this.spec = { ...this.spec, unitId: lastTopic() };
    else if (this.spec.mode !== "lesson" && !this.spec.level) this.spec = { ...this.spec, level: lastLevel(this.spec.mode) };
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
      // A game night keeps tonight's points from game to game (and remembers its difficulty).
      if (!this.rt.night) this.rt.resetSession();
      else this.rt.night.level ??= this.level;
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
    if ((dir === "left" || dir === "right") && this.picksLevel) {
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
    if ((dir === "up" || dir === "down") && this.picksTopic) {
      const ts = this.topics;
      const i = ts.findIndex((t) => t.id === this.topic.id);
      const next = ts[(i + (dir === "down" ? 1 : -1) + ts.length) % ts.length]!;
      this.spec = { ...this.spec, unitId: next.id, lessonId: undefined };
      rememberTopic(next.id);
      play("tap");
      this.rt.cue({ pt: next.pt, en: `Words: ${next.en}` }, from === "tv" ? undefined : from);
      this.rt.refreshViews();
      this.rt.bump();
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
    return { mode: "lobby", ready: p.ready, hint: this.title, level: this.picksLevel ? this.level : undefined, topic: this.picksTopic ? this.topic.pt : undefined };
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
  /** The team lost (out of turns, lives, signals or customers): no win jingle, at most one star. */
  failed?: boolean;
  /** A clear win guarantees at least this many stars (a perfect game never reads as a poor one). */
  minStars?: 1 | 2 | 3;
  /** Words to review that the game knows you missed (e.g. Secret's pictures nobody found). */
  review?: { pt: string; en?: string }[];
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
  /** Co-op games: what each player contributed (finds, clues, served items…), for the night's MVP split. */
  contrib?: Record<string, number>;
}

export interface GalleryItem {
  pt: string;
  en?: string;
  pic?: string;
  guessed: boolean;
  strokes: Stroke[];
  drawer?: string;
  votes?: number;
  best?: boolean;
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
  /** Words the game knows you missed (shown under "Para rever"). */
  review?: { pt: string; en?: string }[];
  gallery?: GalleryItem[];
  /** Game night: go on to the first option by itself after this many ms. */
  autoGo?: number;
  /** The end of a game night: crown the champion. */
  champion?: boolean;
  /** Game night: "pontos da noite" each player just gained, and everyone's total so far. */
  nightGain?: Record<string, number>;
  nightTotals?: Record<string, number>;
  /** Co-op game on game night: who contributed most (Pipo names the game's star). */
  mvp?: string;
  /** Versus games: each player's share (the winner gets bonus XP). */
  perPlayer?: Record<string, number>;
  /** XP for this screen: lessons and games award per player; the night-over card awards the night. */
  xp?: "lesson" | "game" | "night";
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
  /** -1: tonight's points game by game · 0: drumroll · 1: the crown · 2: best moments. */
  stage: -1 | 0 | 1 | 2 = -1;
  startAt = 0;
  readonly night: Night;
  private readonly onDone: () => void;
  private done = false;
  private wordSaid = false;
  private rowsShown = 0;

  constructor(night: Night, onDone: () => void) {
    this.night = night;
    this.onDone = onDone;
  }

  /** How long the "a noite em números" recap lasts (one row per game). */
  get recapMs() {
    return 1500 + this.night.log.length * 1300 + 1800;
  }
  /** Rows of the recap revealed so far. */
  get rows() {
    return Math.max(0, Math.min(this.night.log.length, Math.floor((gameNow() - this.startAt - 1500) / 1300) + 1));
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
    rt.say(SAY.nightMaths, { interrupt: true });
  }

  tick(now: number) {
    const t = now - this.startAt;
    if (this.stage === -1) {
      if (this.rows > this.rowsShown) {
        this.rowsShown = this.rows;
        play("pop", 0.9, 1 + this.rowsShown * 0.08);
        this.rt.bump();
      }
      if (t > this.recapMs) {
        this.stage = 0;
        play("drumroll");
        this.rt.say(SAY.champion, { interrupt: true });
        this.rt.refreshViews();
        this.rt.bump();
      }
      return;
    }
    const s = t - this.recapMs;
    if (this.stage === 0 && s > 2100) {
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
    if (this.stage === 1 && s > 6500) {
      this.stage = 2;
      play("sparkle");
      this.rt.bump();
    }
    if (this.stage === 2 && !this.wordSaid && s > 10_500) {
      this.wordSaid = true;
      const w = this.wordOfNight;
      if (w) this.rt.speakPt(w.pt);
    }
    if (s > 16_500) this.finish();
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
    if (this.stage === -1) return { mode: "wait", title: "A noite em números…", subtitle: "Tonight's points, game by game — olha para a TV!", pic: "🧮" };
    if (this.stage === 0) return { mode: "wait", title: "E a estrela da noite é…", subtitle: "And tonight's star is… 🥁", pic: "🥁" };
    const [top] = this.standings;
    const me = this.night.points[p.playerId] ?? 0;
    const star = this.tie || top?.p === p;
    if (star) return { mode: "wait", title: this.tie ? "👑 Dois campeões!" : "👑 És a estrela da noite!", subtitle: `${me} pontos da noite · tonight's points`, pic: "👑" };
    return { mode: "wait", title: `👑 ${top?.p.name ?? ""} é a estrela!`, subtitle: `Tu: ${me} · ${top?.p.name ?? ""}: ${top?.pts ?? 0} pontos — desforra na próxima noite!`, pic: "👏" };
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
  /** XP, level and streak changes per player (shown on the TV and each phone). */
  awards = new Map<string, Award>();
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
    else if (!VERSUS.includes(spec.mode) && spec.mode !== "final") rt.say(this.info.win !== false && (stars === undefined || stars >= 1) ? SAY.youDidIt : SAY.nextTime);
    if (this.info.mvp) rt.say(NAMED.mvpGame, { name: this.info.mvp });
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
    this.giveXp();
    void rt.learner.sync().then(() => rt.learner.pushSnapshot());
  }

  /** XP: playing earns it, stars and wins earn more; a streak adds a daily bonus. */
  private giveXp() {
    const { xp, stars, lesson, perPlayer, nightTotals } = this.info;
    if (!xp) return;
    const rt = this.rt;
    const top = perPlayer ? Object.entries(perPlayer).sort((a, b) => b[1] - a[1]) : [];
    const winner = top.length >= 2 && top[0]![1] > top[1]![1] ? top[0]![0] : undefined;
    const nightTop = nightTotals ? Object.entries(nightTotals).sort((a, b) => b[1] - a[1]) : [];
    const champs = nightTop.filter(([, v]) => v === nightTop[0]?.[1]).map(([id]) => id);
    for (const p of rt.activePlayers) {
      let gain: number;
      if (xp === "lesson") {
        gain = 20 + 10 * (lesson ? Math.round((3 * lesson.stars) / Math.max(1, lesson.graded)) : 1) + 2 * (lesson?.rush?.team ?? 0);
        // A lesson isn't complete until its lightning round is beaten: less XP until then.
        if (lesson?.rush && !lesson.rush.won) gain = Math.round(gain * 0.6);
      }
      else if (xp === "game") gain = 15 + 10 * (stars ?? 0) + (winner === p.playerId ? 15 : 0);
      else gain = 40 + (champs.includes(p.playerId) ? 40 : 0);
      // A lesson only counts (and earns its badges) once its lightning round is beaten.
      const lessonDone = xp === "lesson" && !(lesson?.rush && !lesson.rush.won);
      this.awards.set(p.playerId, award(p.profile, gain, { lesson: lessonDone, game: xp === "game", win: winner === p.playerId, crown: xp === "night" && champs.includes(p.playerId) }));
    }
    // A level up gets its own fanfare and a line from Pipo, after the stars.
    const ups = rt.activePlayers.filter((p) => this.awards.get(p.playerId)?.levelUp);
    setTimeout(() => {
      if (rt.activity !== this) return;
      for (const p of ups) {
        play("fanfare", 0.8);
        rt.say(NAMED.levelUp, { name: p.name });
        rt.emote(p.playerId, "cheer", 3000);
      }
      if (rt.activePlayers.some((p) => this.awards.get(p.playerId)?.newBadges.length)) play("sparkle");
    }, 3200);
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

  /** "+45 XP · Nível 3 · 🔥 4 dias" for a player's phone. */
  xpLine(p: RuntimePlayer): string | undefined {
    const a = this.awards.get(p.playerId);
    if (!a) return undefined;
    return `+${a.gain} XP · Nível ${levelOf(a.after)}${a.levelUp ? " 🎉" : ""}${a.streak >= 2 ? ` · 🔥 ${a.streak} dias` : ""}`;
  }

  viewFor(p: RuntimePlayer): ControllerView {
    // Phones wait for the TV's reveal (stars, record) before showing the menu.
    if (gameNow() - this.startAt < RESULTS_HOLD_MS) return { mode: "wait", title: "Olha para a TV!", subtitle: "Look at the TV — here come the results!", pic: "👀" };
    return {
      mode: "pick",
      roundId: "results",
      promptId: this.promptId,
      title: this.info.headline,
      subtitle: this.xpLine(p) ?? this.info.sub,
      options: this.info.options.map((o) => ({ id: o.id, label: o.label, sub: o.sub, emoji: o.pic })),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Mode runner                                                                 */
/* -------------------------------------------------------------------------- */

/** Games whose words come from the lessons (the chapter picker applies to these). */
export const WORD_GAMES: readonly Mode[] = ["secret", "sync", "draw", "bomb"];

/** The lessons a game draws its words from: one lesson, one unit, or everything learned so far. */
function lessonsFor(spec: ModeSpec): Lesson[] {
  const l = spec.lessonId ? getLesson(spec.lessonId) : undefined;
  if (l) return [l];
  if (spec.unitId && spec.unitId !== "all") {
    const ls = LESSONS.filter((x) => unitOf(x.unit)?.id === spec.unitId);
    if (ls.length) return ls;
  }
  return playableLessons();
}

/** Game night: one head-to-head game (Stop! or Batata Quente) and two co-op games, then the Grande Final. */
export function startNight(rt: TvRuntime) {
  rt.resetSession();
  const versus = rt.rng.pick([...VERSUS]);
  const coop = rt.rng.shuffle(GAMES.filter((g) => !VERSUS.includes(g.mode)).map((g) => g.mode));
  rt.night = { games: rt.rng.shuffle([versus, coop[0]!, coop[1]!]), index: 0, words: [], points: {}, moments: [], log: [] };
  rt.run(new LobbyActivity({ mode: rt.night.games[0] as Mode }));
}

/**
 * A co-op game's "pontos da noite": the team result (0–100), split by who did more — from 70%
 * to 130% of it (capped at 100), so every game moves the rivalry a little without breaking the team.
 */
export function splitTeam(team: number, contrib: Record<string, number>, ids: string[]): Record<string, number> {
  const total = ids.reduce((s, id) => s + Math.max(0, contrib[id] ?? 0), 0);
  return Object.fromEntries(ids.map((id) => [id, Math.round(Math.min(100, team * (total > 0 ? 0.7 + 0.3 * ids.length * (Math.max(0, contrib[id] ?? 0) / total) : 1)))]));
}

/** Adds a game's "pontos da noite" (0–100 each) and returns what everyone gained. */
function addNightPoints(rt: TvRuntime, o: GameOutcome, title: string, pic: string): Record<string, number> {
  const n = rt.night;
  const gained: Record<string, number> = {};
  if (!n) return gained;
  const team = Math.round(Math.min(100, (o.score / Math.max(1, o.max)) * 100));
  const ids = rt.activePlayers.map((p) => p.playerId);
  const split = !o.perPlayer && o.contrib && ids.length >= 2 ? splitTeam(team, o.contrib, ids) : undefined;
  for (const p of rt.activePlayers) {
    const g = o.perPlayer?.[p.playerId] ?? split?.[p.playerId] ?? team;
    gained[p.playerId] = g;
    n.points[p.playerId] = (n.points[p.playerId] ?? 0) + g;
  }
  n.log.push({ title, pic, gains: { ...gained } });
  return gained;
}

/** The co-op game's star (most night points from the split), when there clearly was one. */
function mvpOf(rt: TvRuntime, gained: Record<string, number>): string | undefined {
  const [a, b] = [...rt.activePlayers].sort((x, y) => (gained[y.playerId] ?? 0) - (gained[x.playerId] ?? 0));
  return a && b && (gained[a.playerId] ?? 0) - (gained[b.playerId] ?? 0) >= 8 ? a.name : undefined;
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
          .slice(0, 2)
          .map((g) => ({ id: g.mode, label: g.name, sub: g.kind, pic: g.pic, go: go({ mode: g.mode, lessonId }) }))
      : [];

  const level: Level = spec.level ?? 1;
  const night = rt.night && rt.night.games[rt.night.index] === spec.mode ? rt.night : null;
  const gameDone = (title: string, o: GameOutcome) => {
    // Versus games have a winner, not team stars.
    const versus = !!o.perPlayer;
    // A lost game is never praised like a win: one star at most.
    const stars = versus ? undefined : o.failed ? (Math.min(1, starsFor(o.score, o.max)) as 0 | 1) : (Math.max(starsFor(o.score, o.max), o.minStars ?? 0) as 0 | 1 | 2 | 3);
    if (night) {
      // A few words from each game, so the night's recap covers the whole night.
      night.words.push(...(o.words ?? []).slice(0, 2));
      const gained = addNightPoints(rt, o, title, GAMES.find((g) => g.mode === spec.mode)?.pic ?? "🎲");
      if (o.highlight) night.moments.push(o.highlight);
      if (o.gallery?.length) night.drawing = o.gallery.find((g) => g.best) ?? o.gallery.find((g) => g.guessed) ?? o.gallery[0];
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
          win: versus || (!o.failed && (stars ?? 0) > 0),
          score: o.score,
          max: o.max,
          stars,
          practiced: o.words,
          review: o.review,
          gallery: o.gallery,
          nightGain: gained,
          nightTotals: { ...night.points },
          mvp: o.perPlayer ? undefined : mvpOf(rt, gained),
          perPlayer: o.perPlayer,
          xp: "game",
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
        win: versus || (!o.failed && (stars ?? 0) > 0),
        score: o.score,
        max: o.max,
        stars,
        practiced: o.words,
        review: o.review,
        gallery: o.gallery,
        perPlayer: o.perPlayer,
        xp: "game",
        options: [...up, { ...again, label: "Outra vez!", sub: "Play again" }, ...games(spec.mode), menu],
      }),
    );
  };

  switch (spec.mode) {
    case "lesson": {
      const lesson = getLesson(spec.lessonId ?? "") ?? LESSONS[0]!;
      const next = LESSONS[(LESSONS.indexOf(lesson) + 1) % LESSONS.length]!;
      const retry = { id: "rush", label: "Repetir o relâmpago", sub: "Retry the lightning round", pic: "⚡", go: go({ ...spec, rushOnly: true }) };
      rt.run(
        new LearnActivity(
          lesson,
          (s) => {
            const lost = s.rush && !s.rush.won;
            const rushLine = s.rush ? (s.rush.won ? ` ⚡ Relâmpago superado: ${s.rush.team}/${s.rush.goal}!` : ` ⚡ Relâmpago: ${s.rush.team}/${s.rush.goal} — a lição ainda não está completa.`) : "";
            const rushLineEn = s.rush ? (s.rush.won ? ` Lightning round beaten!` : ` Lightning round lost: the lesson isn't complete yet.`) : "";
            rt.run(
              new ResultsActivity({
                spec,
                title: lesson.title,
                headline: s.rushOnly ? (lost ? `${s.rush!.team >= 3 ? "Quase!" : "Hoje não deu…"} ${s.rush!.team}/${s.rush!.goal} ⚡` : "Relâmpago superado! ⚡") : lost ? `Lição por completar ⚡ ${s.rush!.team}/${s.rush!.goal}` : `${s.stars} ⭐ de ${s.graded}`,
                headlineEn: lost ? (s.rush!.team >= 3 ? "So close — beat the lightning round to complete the lesson" : "Not today — beat the lightning round to complete the lesson") : s.rushOnly ? "Lesson complete!" : undefined,
                sub: s.rushOnly ? rushLine.trim() : `${s.stars === s.graded ? "Perfeito! Os dois acertaram tudo." : "Estrelas de equipa: quando os dois acertam."}${s.bestCombo >= 3 ? ` Melhor combo: ×${s.bestCombo}!` : ""}${rushLine}`,
                subEn: s.rushOnly ? rushLineEn.trim() : `${s.stars === s.graded ? "Perfect — you both got everything right." : "Team stars: when you're both right."}${s.bestCombo >= 3 ? ` Best combo ×${s.bestCombo}!` : ""}${rushLineEn}`,
                win: !lost,
                lesson: s,
                words: s.words,
                xp: "lesson",
                options: lost
                  ? [retry, { id: "again", label: "Repetir a lição", sub: "Repeat the lesson", pic: "🔁", go: go({ ...spec, rushOnly: undefined }) }, ...games(), menu]
                  : [
                      // Next lesson first (and focused); then games with these words.
                      { id: "next", label: "Próxima lição", sub: next.title, pic: "➡️", go: go({ mode: "lesson", lessonId: next.id }) },
                      ...games(),
                      { id: "again", label: "Repetir a lição", sub: "Repeat the lesson", pic: "🔁", go: go({ ...spec, rushOnly: undefined }) },
                      menu,
                    ],
              }),
            );
          },
          { rushOnly: !!spec.rushOnly },
        ),
      );
      return;
    }
    case "secret": {
      const g = new ParesSecretos(lessonsFor(spec), (o) => gameDone("Pares Secretos", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode, !!night);
      rt.run(g);
      return;
    }
    case "wave": {
      const g = new NaMesmaOnda((o) => gameDone("Na Mesma Onda", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode, !!night);
      rt.run(g);
      return;
    }
    case "sync": {
      const g = new EmSintonia(lessonsFor(spec), (o) => gameDone("Em Sintonia", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode, !!night);
      rt.run(g);
      return;
    }
    case "verbs": {
      const g = new QuemFazOQue((o) => gameDone("Quem faz o quê?", o));
      g.level = level;
      g.practice = wantsPractice(spec.mode, !!night);
      rt.run(g);
      return;
    }
    case "draw": {
      const g = new Desenha(lessonsFor(spec), (o) => gameDone("Desenha!", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode, !!night);
      rt.run(g);
      return;
    }
    case "final": {
      const words = rt.night?.words ?? [];
      const g = new GrandeFinal(words, (o) => {
        const night = rt.night;
        if (night) addNightPoints(rt, o, "Grande Final", "🏆");
        const totals = night ? { ...night.points } : undefined;
        // Tonight's words: every game's, not only the Final's (one of each).
        const nightWords = [...new Map([...(night?.words ?? []), ...(o.words ?? [])].map((w) => [w.pt, w])).values()];
        // After the crowning: the night is over — the star, tonight's points, what next. No stars or "faltam" here.
        const results = (champ?: ChampionActivity) => {
          rt.night = null;
          const star = champ?.tie ? "Dois campeões!" : champ?.standings[0] ? `${champ.standings[0].p.name} é a estrela da noite!` : o.headline;
          rt.run(
            new ResultsActivity({
              spec,
              title: "Fim da noite · Game night over",
              headline: `👑 ${star}`,
              headlineEn: champ?.tie ? "Two champions tonight!" : "Tonight's star",
              sub: o.headline,
              subEn: "Grande Final",
              win: true,
              practiced: nightWords,
              champion: true,
              nightTotals: totals,
              xp: "night",
              options: [
                { id: "night", label: "Outra noite!", sub: "Another game night", pic: "🎉", go: () => startNight(rt) },
                ...games(),
                menu,
              ],
            }),
          );
        };
        // The crowning ceremony first, then the night-over card.
        if (night) {
          const champ: ChampionActivity = new ChampionActivity(night, () => results(champ));
          rt.run(champ);
        } else results();
      });
      g.level = level;
      rt.run(g);
      return;
    }
    case "bomb": {
      const g = new BatataQuente(lessonsFor(spec), (o) => gameDone("Batata Quente", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode, !!night);
      rt.run(g);
      return;
    }
    case "stop": {
      const g = new Stop((o) => gameDone("Stop!", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode, !!night);
      rt.run(g);
      return;
    }
    case "kitchen": {
      const g = new Cozinha((o) => gameDone("Cozinha Caótica", o));
      g.level = level;
      if ("practice" in g) g.practice = wantsPractice(spec.mode, !!night);
      rt.run(g);
      return;
    }
  }
}
