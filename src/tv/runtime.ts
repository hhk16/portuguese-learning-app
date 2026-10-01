/**
 * The TV runtime: authoritative host for a couch session.
 *
 * - owns the room connection, players, learner profiles and scores
 * - runs one Activity at a time (menus, lobby, a game, results)
 * - routes phone input to the activity and phone/remote navigation to menus
 * - records language evidence (learner model) and game performance separately
 * - is the only thing that speaks: in shared games there's one voice, from the TV
 *
 * Activities keep their own mutable state; the 3D scene reads it every frame and the DOM overlay
 * re-renders on `bump()` (coarse-grained change notifications).
 */
import { useSyncExternalStore } from "react";
import { getItem } from "../curriculum/index.ts";
import type { Outcome } from "../learner/events.ts";
import { isCorrectOutcome } from "../learner/events.ts";
import type { LearnerProfile } from "../learner/model.ts";
import { HostConnection } from "../net/host.ts";
import type { SocketStatus } from "../net/socket.ts";
import { Rng } from "../shared/rng.ts";
import type { ControllerView, InputValue, NavDir, PlayerBody, PlayerInfo } from "../shared/protocol.ts";
import { clockPaused, gameNow, pauseClock, resumeClock } from "./clock.ts";
import { play } from "../audio/sfx.ts";
import { speak, stopSpeech } from "../audio/tts.ts";
import { playMusic, setHurry, setMusicEnabled, type Track } from "../audio/music.ts";
import { isSpotlight, moodOf, PET, PET_NAMES, SAY, VARIANTS, type Line, type Mood } from "./host-lines.ts";

/** SAY line → its variants. */
const VARIANT_OF = new Map<Line, Line[]>(Object.entries(VARIANTS).map(([k, v]) => [SAY[k as keyof typeof SAY], v!]));
import { LearnerStore } from "./learner-store.ts";

export interface RuntimePlayer extends PlayerInfo {
  profile: LearnerProfile;
  ready: boolean;
  /** Session score (game performance — never learner evidence). */
  score: number;
  joinedAt: number;
  /** Words this player missed this session, for the results "para rever" list. */
  missed: { itemId: string; pt: string; en?: string }[];
}

/** What a player's 3D character is doing (read by the stage every frame). */
export type Emote = "idle" | "cheer" | "sad" | "think" | "wave";

export interface Activity {
  readonly id: string;
  start(rt: TvRuntime): void;
  tick(now: number, dt: number): void;
  onInput?(p: RuntimePlayer, promptId: string, roundId: string, value: InputValue, hostTime: number): void;
  onNav?(dir: NavDir, from: RuntimePlayer | "tv"): void;
  onReady?(p: RuntimePlayer, ready: boolean): void;
  onPlayersChanged?(): void;
  /** View a (re)joining phone should see right now. */
  viewFor(p: RuntimePlayer): ControllerView;
  stop?(): void;
  /** Games can be paused (Back on the TV / ⏸ on a phone); menus cannot. */
  readonly pausable?: boolean;
  /** Re-play the current audio (phone 🔊); `p` = who asked. */
  repeat?(p?: RuntimePlayer): void;
}

export interface Settings {
  sound: boolean;
  lowFx: boolean;
  /** The puppy's name (Ana picks it), and whether she was asked already. */
  petName?: string;
  petAsked?: boolean;
}

/** Name ideas for the puppy (Portuguese pet names). */
export { PET_NAMES, PET };
/** Things the puppy acts out on cue (on top of following the players' moods). */
export type PetAct = "hide" | "sniff" | "crown" | "cheer" | "oops" | "think" | "wave";

const SETTINGS_KEY = "pp.tv.settings.v3";

/** Background music per activity (menus, lobby and results share the menu theme). */
const MUSIC: Record<string, Track> = { lesson: "learn", learn: "learn", secret: "secret", wave: "wave", sync: "sync", draw: "draw", stop: "versus", bomb: "versus", kitchen: "rush", final: "final", champion: "final" };

export class TvRuntime {
  readonly conn: HostConnection;
  readonly learner = new LearnerStore();
  readonly rng = new Rng();
  readonly players = new Map<string, RuntimePlayer>();
  readonly testMode = new URLSearchParams(location.search).has("test");
  code = "";
  socket: SocketStatus = "connecting";
  activity: Activity | null = null;
  settings: Settings = { sound: true, lowFx: false, ...readSettings() };
  paused = false;
  pauseFocus = 0;
  /** Set by the mode runner: how to restart the current game / leave to the menu. */
  onRestart: (() => void) | null = null;
  onQuit: (() => void) | null = null;
  /** A game night in progress: the playlist, where we are, and the words met so far. */
  night: {
    games: string[];
    index: number;
    words: { pt: string; en?: string; pic?: string }[];
    /** "Pontos da noite": every game is worth 0–100 per player. */
    points: Record<string, number>;
    /** Highlights for "Melhores momentos", and the best drawing. */
    moments: { pt: string; en: string; pic?: string }[];
    drawing?: unknown;
    /** What each game gave each player, for "a noite em números" before the crowning. */
    log: { title: string; pic: string; gains: Record<string, number> }[];
    /** Difficulty picked for the night (the Grande Final uses it). */
    level?: 1 | 2 | 3;
  } | null = null;
  /** Emoji reactions flying up the TV (performance.now ms). */
  reactions: { id: number; playerId: string; emoji: string; at: number; x: number }[] = [];
  private reactSeq = 0;
  private readonly lastReact = new Map<string, number>();
  /** Per-player character emotes, with expiry (performance.now ms). */
  readonly emotes = new Map<string, { emote: Emote; until: number }>();
  /** Big celebratory burst counter (the overlay fires confetti when it changes). */
  confetti = 0;
  private version = 0;
  private listeners = new Set<() => void>();
  private lastTick = gameNow();

  constructor() {
    this.conn = new HostConnection({
      onRoom: ({ code }) => {
        this.code = code;
        this.bump();
      },
      onPlayer: (info, rejoin) => this.upsertPlayer(info, rejoin),
      onPlayerLeft: (id) => {
        const p = this.players.get(id);
        if (p) p.connected = false;
        this.activity?.onPlayersChanged?.();
        this.bump();
      },
      onPlayerBody: (id, body) => this.onBody(id, body),
      onStatus: (s) => {
        this.socket = s;
        this.bump();
      },
    });
    // Game logic ticks on a timer, independent of the render frame rate.
    setInterval(() => {
      const now = gameNow();
      const dt = Math.min(0.1, Math.max(0, (now - this.lastTick) / 1000));
      this.lastTick = now;
      if (!this.paused) this.activity?.tick(now, dt);
    }, 20);
  }

  /* --------------------------- reactive plumbing --------------------------- */

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getVersion = () => this.version;
  bump() {
    this.version++;
    for (const l of this.listeners) l();
  }

  /* ------------------------------- players -------------------------------- */

  get activePlayers(): RuntimePlayer[] {
    return [...this.players.values()].filter((p) => p.connected).sort((a, b) => a.joinedAt - b.joinedAt);
  }

  get sessionPlayers(): RuntimePlayer[] {
    return [...this.players.values()].sort((a, b) => a.joinedAt - b.joinedAt);
  }

  /** The other player (two-player games). */
  partnerOf(p: RuntimePlayer): RuntimePlayer | undefined {
    return this.activePlayers.find((x) => x !== p);
  }

  private upsertPlayer(info: PlayerInfo, rejoin: boolean) {
    const existing = this.players.get(info.playerId);
    if (existing) {
      Object.assign(existing, info, { connected: true });
    } else {
      const profile = this.learner.profileFor(info.profileHint, info.name);
      this.players.set(info.playerId, { ...info, connected: true, profile, ready: false, score: 0, joinedAt: performance.now(), missed: [] });
      if (!rejoin) {
        play("pop");
        this.emote(info.playerId, "wave", 2500);
      }
    }
    const p = this.players.get(info.playerId)!;
    this.conn.sendView(p.playerId, this.currentView(p));
    this.activity?.onPlayersChanged?.();
    this.bump();
  }

  /** Last time anyone did anything (the puppy dozes off when nobody plays). */
  lastInputAt = performance.now();

  private onBody(playerId: string, body: PlayerBody) {
    const p = this.players.get(playerId);
    if (!p) return;
    if (body.k !== "ping") this.lastInputAt = performance.now();
    if (body.k === "react" && body.emoji === "❤️") this.petJoy++;
    switch (body.k) {
      case "input": {
        if (body.value.mode === "petName") return this.onPetName(p, body.value);
        if (this.paused) return;
        const now = gameNow();
        const t = body.clientHostTime > 0 && body.clientHostTime <= now + 50 && body.clientHostTime > now - 3000 ? body.clientHostTime : now;
        this.activity?.onInput?.(p, body.promptId, body.roundId, body.value, t);
        return;
      }
      case "nav":
        if (this.paused || body.dir === "back") return this.tvNav(body.dir);
        this.activity?.onNav?.(body.dir, p);
        return;
      case "menu":
        this.menu(body.action, p);
        return;
      case "react": {
        // Rate-limited so a mashing thumb can't flood the screen.
        const now = performance.now();
        if (now - (this.lastReact.get(playerId) ?? 0) < 350) return;
        this.lastReact.set(playerId, now);
        this.reactions = [...this.reactions.filter((r) => now - r.at < 3000), { id: ++this.reactSeq, playerId, emoji: body.emoji, at: now, x: 8 + Math.random() * 84 }].slice(-24);
        play("pop", 0.6, 1 + Math.random() * 0.2);
        this.bump();
        return;
      }
      case "ready":
        p.ready = body.ready;
        this.activity?.onReady?.(p, body.ready);
        this.bump();
        return;
    }
  }

  /** Remote from TV keyboard / D-pad. Back pauses a running game. */
  tvNav(dir: NavDir) {
    if (this.paused) {
      const items = this.pauseItems;
      if (dir === "up" || dir === "down") {
        this.pauseFocus = (this.pauseFocus + (dir === "up" ? -1 : 1) + items.length) % items.length;
        play("tap");
        this.bump();
      } else if (dir === "ok") this.menu(items[this.pauseFocus]!.id);
      else if (dir === "back") this.resume();
      return;
    }
    if (dir === "back" && this.activity?.pausable) return this.pause();
    this.activity?.onNav?.(dir, "tv");
  }

  /* --------------------------------- the puppy ---------------------------------- */

  /** Who is being asked to name the puppy (their phone shows the name screen). */
  petPrompt: string | null = null;
  /** Bumped when the puppy should get excited (named, a heart reaction…). */
  petJoy = 0;

  /** A game moment the puppy acts out for a while: hides from a bang, sniffs the kitchen, carries the crown… */
  petAct: { pose: PetAct; until: number; seq: number } | null = null;
  private petActSeq = 0;
  private petLineAt = 0;

  /** The puppy acts something out; sometimes Pipo comments on it (by name, at most every ~40 s). */
  petDo(pose: PetAct, ms = 2600, line?: Line, chance = 0.5) {
    this.petAct = { pose, until: performance.now() + ms, seq: ++this.petActSeq };
    if (line) this.petSay(line, chance);
  }

  /** Pipo says a line about the puppy, if it has a name (rate-limited so it stays a treat). */
  petSay(line: Line, chance = 1) {
    const name = this.settings.petName;
    const now = performance.now();
    if (!name || now - this.petLineAt < 40_000 || Math.random() > chance) return;
    this.petLineAt = now;
    this.say(line, { name });
  }

  /** The puppy's person: Ana (by character or name), else the second player. */
  petOwner(): RuntimePlayer | undefined {
    const ps = this.activePlayers;
    return ps.find((p) => /^an+a$/i.test(p.name.trim())) ?? ps.find((p) => p.avatar === "ana") ?? ps[1];
  }

  /** On the title screen, the first time Ana is here: ask her to name the puppy. */
  maybeAskPetName() {
    if (this.settings.petAsked || this.petPrompt || this.activity?.id !== "title") return;
    const ps = this.activePlayers;
    const ana = ps.find((p) => /^an+a$/i.test(p.name.trim())) ?? ps.find((p) => p.avatar === "ana");
    if (ana) this.askPetName(false, ana);
  }

  askPetName(rename: boolean, who = this.petOwner() ?? this.activePlayers[0]) {
    if (!who) return;
    this.petPrompt = who.playerId;
    if (rename) this.cue({ pt: "🐶 Um nome para o cachorrinho?", en: `${who.name}: name the puppy on your phone` }, who);
    this.conn.sendView(who.playerId, this.currentView(who));
    this.bump();
  }

  private onPetName(p: RuntimePlayer, v: { name?: string; skip?: boolean }) {
    if (this.petPrompt !== p.playerId) return;
    this.petPrompt = null;
    if (v.name && !v.skip) {
      this.setSettings({ petName: v.name.trim().slice(0, 16), petAsked: true });
      this.petJoy++;
      play("fanfare", 0.7);
      this.celebrate();
      this.cue({ pt: `🐶 ${this.settings.petName}!`, en: "The puppy has a name!" }, p);
      this.say(SAY.petNamed);
    } else this.setSettings({ petAsked: true });
    this.conn.sendView(p.playerId, this.currentView(p));
    this.bump();
  }

  /* ------------------------------- side bets ------------------------------- */

  /** A side-bet / prediction reveal on the TV, after the main reveal ("Ana apostou: LONGE… ✗"). */
  betCard: { seq: number; at: number; title: Line; rows: { playerId: string; pt: string; en?: string; won: boolean; pts?: number }[] } | null = null;
  private betSeq = 0;

  /** Flip the bet card `delay` ms from now (once the reveal has landed), with its own sting and a host line. */
  showBet(title: Line, rows: { playerId: string; pt: string; en?: string; won: boolean; pts?: number }[], opts: { delay?: number; line?: Line; name?: string; ms?: number } = {}) {
    if (!rows.length) return;
    const a = this.activity;
    setTimeout(() => {
      if (this.activity !== a) return;
      const seq = ++this.betSeq;
      this.betCard = { seq, at: performance.now(), title, rows };
      play("card-flip");
      const won = rows.some((r) => r.won);
      setTimeout(() => this.activity === a && play(won ? "sparkle" : "wrong", won ? 1 : 0.6), 700);
      if (opts.line) this.say(opts.line, { name: opts.name });
      this.bump();
      setTimeout(() => {
        if (this.betCard?.seq === seq) {
          this.betCard = null;
          this.bump();
        }
      }, opts.ms ?? 2800);
    }, opts.delay ?? 1500);
  }

  /* --------------------------------- pause --------------------------------- */

  get pauseItems(): { id: "resume" | "restart" | "quit"; label: string }[] {
    return [
      { id: "resume", label: "Continuar" },
      { id: "restart", label: "Recomeçar" },
      { id: "quit", label: "Sair para o menu" },
    ];
  }

  menu(action: "pause" | "resume" | "restart" | "quit" | "repeat", from?: RuntimePlayer) {
    switch (action) {
      case "pause":
        if (this.activity?.pausable) this.pause();
        return;
      case "resume":
        return this.resume();
      case "restart":
        this.unpauseQuietly();
        play("select");
        this.onRestart?.();
        return;
      case "quit":
        this.unpauseQuietly();
        play("back");
        this.onQuit?.();
        return;
      case "repeat":
        if (!this.paused) this.activity?.repeat?.(from);
        return;
    }
  }

  pause() {
    if (this.paused || !this.activity?.pausable) return;
    pauseClock();
    stopSpeech();
    this.paused = true;
    this.pauseFocus = 0;
    play("select");
    for (const p of this.activePlayers) this.conn.sendView(p.playerId, this.currentView(p));
    this.bump();
  }

  resume() {
    if (!this.paused) return;
    resumeClock();
    this.paused = false;
    // Phones' clock offsets are stale after the host clock stood still: resync, then resend views.
    for (const p of this.activePlayers) {
      this.conn.resync(p.playerId);
      this.conn.sendView(p.playerId, this.currentView(p));
    }
    play("select");
    this.bump();
  }

  private unpauseQuietly() {
    if (clockPaused()) resumeClock();
    this.paused = false;
  }

  currentView(p: RuntimePlayer): ControllerView {
    if (this.petPrompt === p.playerId) return { mode: "petName", roundId: "pet", promptId: "pet", current: this.settings.petName, suggestions: PET_NAMES };
    if (this.paused) return { mode: "paused", title: "Pausa" };
    // During a reveal the TV is the show: phones wait a beat before showing the result.
    if (performance.now() < this.holdUntil) return { mode: "wait", title: "Olha para a TV!", subtitle: "Look at the TV! 👀", pic: "👀" };
    return this.activity ? this.activity.viewFor(p) : { mode: "wait", title: "Olha para a TV!" };
  }

  private holdUntil = 0;
  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  /** Phones show "Olha para a TV!" for `ms` (the reveal plays on the TV first), then their real view. */
  holdPhones(ms = 1600) {
    this.holdUntil = performance.now() + ms;
    if (this.holdTimer) clearTimeout(this.holdTimer);
    this.holdTimer = setTimeout(() => {
      this.holdUntil = 0;
      this.refreshViews();
    }, ms);
  }

  /* ------------------------------ activities ------------------------------ */

  run(a: Activity) {
    this.unpauseQuietly();
    // An unanswered puppy-name question doesn't follow you into a game (it's asked again later).
    if (this.petPrompt && a.id !== "title") this.petPrompt = null;
    stopSpeech();
    this.activity?.stop?.();
    this.activity = a;
    this.hostQueue = [];
    this.hostLine = null;
    this.command = null;
    this.betCard = null;
    this.holdUntil = 0;
    setHurry(false);
    playMusic(MUSIC[a.id] ?? "menu");
    a.start(this);
    for (const p of this.activePlayers) this.conn.sendView(p.playerId, this.currentView(p));
    this.bump();
  }

  view(p: RuntimePlayer | "all", view: ControllerView | ((p: RuntimePlayer) => ControllerView)) {
    const targets = p === "all" ? this.activePlayers : [p];
    for (const t of targets) this.conn.sendView(t.playerId, typeof view === "function" ? view(t) : view);
  }

  /** Send every player the activity's current view. */
  refreshViews() {
    for (const p of this.activePlayers) this.conn.sendView(p.playerId, this.currentView(p));
  }

  /* ----------------------- learning evidence & scores ----------------------- */

  /** Record linguistic evidence for one item. `context` = game/format (tier promotion needs ≥2). */
  evidence(p: RuntimePlayer, itemId: string, context: string, outcome: Outcome, tier: 1 | 2 = 1) {
    const it = getItem(itemId);
    if (!it) return;
    this.learner.record({ profileId: p.profile.profileId, itemId, context, tier, outcome, at: Date.now() });
    if (!isCorrectOutcome(outcome) && !p.missed.some((m) => m.itemId === itemId)) {
      const pt = "pt" in it ? String(it.pt) : "m" in it ? String(it.m) : "form" in it ? String(it.form) : itemId;
      p.missed.push({ itemId, pt, en: "en" in it && it.en ? String(it.en) : undefined });
    }
  }

  addScore(p: RuntimePlayer, points: number, game: string) {
    p.score = Math.max(0, p.score + points);
    this.learner.recordPerformance({ profileId: p.profile.profileId, game, metric: "score", value: points, at: Date.now() });
  }

  resetSession() {
    for (const p of this.players.values()) {
      p.score = 0;
      p.missed = [];
      p.ready = false;
    }
  }

  /* ------------------------------ presentation ------------------------------ */

  emote(playerId: string, emote: Emote, ms = 1800) {
    this.emotes.set(playerId, { emote, until: performance.now() + ms });
  }

  emoteOf(playerId: string): Emote {
    const e = this.emotes.get(playerId);
    return e && e.until > performance.now() ? e.emote : "idle";
  }

  celebrate() {
    this.confetti++;
    this.bump();
  }

  /** Speak Portuguese from the TV (pre-recorded audio when available). */
  /** What the host is saying right now (TV subtitle bubble: Portuguese + English). */
  hostLine: (Line & { seq: number; mood: Mood; spotlight?: boolean }) | null = null;
  /** The big one-verb command on the TV ("Escolhe uma pista!"), and who it's for. */
  command: (Line & { seq: number; playerId?: string; at: number }) | null = null;
  private commandSeq = 0;
  private hostQueue: (Line & { mood: Mood; spotlight?: boolean })[] = [];
  private lastVariant = new Map<Line, Line>();
  private hostBusy = false;
  private hostSeq = 0;

  /**
   * The host says one or more lines, in order: the TV shows a bubble (PT + EN) and speaks the PT.
   * `interrupt` drops whatever the host was still going to say.
   */
  say(lines: Line | Line[], opts: { interrupt?: boolean; name?: string } = {}) {
    const ls = (Array.isArray(lines) ? lines : [lines]).map((l) => {
      // Pick a variant (never the same one twice in a row), fill in the name, keep the mood.
      const pool = [l, ...(VARIANT_OF.get(l) ?? [])];
      const options = pool.length > 1 ? pool.filter((x) => x !== this.lastVariant.get(l)) : pool;
      const v = options[Math.floor(Math.random() * options.length)]!;
      this.lastVariant.set(l, v);
      const name = opts.name ?? "";
      return { pt: v.pt.replace("{name}", name), en: v.en.replace("{name}", name), mood: moodOf(l), spotlight: isSpotlight(l) };
    });
    if (opts.interrupt) this.hostQueue = [];
    this.hostQueue.push(...ls);
    if (!this.hostBusy) void this.drainHost();
  }

  /** Show a big command on the TV for a player ("Ana: Roda o mostrador!"), optionally with a named host line. */
  cue(command: Line, p?: RuntimePlayer, line?: Line) {
    if (line) this.say(line, { name: p?.name });
    // One banner at a time: a new one waits for the current one to finish.
    const busy = this.command ? 2900 - (performance.now() - this.command.at) : 0;
    const show = () => {
      this.command = { ...command, seq: ++this.commandSeq, playerId: p?.playerId, at: performance.now() };
      this.bump();
    };
    if (busy > 200) {
      const a = this.activity;
      setTimeout(() => this.activity === a && show(), busy);
    } else show();
  }

  private async drainHost() {
    this.hostBusy = true;
    while (this.hostQueue.length) {
      const l = this.hostQueue.shift()!;
      const seq = ++this.hostSeq;
      this.hostLine = { ...l, seq };
      this.bump();
      const started = performance.now();
      if (this.settings.sound) await speak(l.pt);
      // Keep short lines on screen long enough to read the English.
      const readMs = 900 + l.en.length * 35;
      const left = readMs - (performance.now() - started);
      if (left > 0 && this.hostLine?.seq === seq) await new Promise((r) => setTimeout(r, left));
      await new Promise((r) => setTimeout(r, 250));
    }
    this.hostBusy = false;
    const last = this.hostSeq;
    setTimeout(() => {
      if (!this.hostBusy && this.hostSeq === last) {
        this.hostLine = null;
        this.bump();
      }
    }, 1200);
  }

  speakPt(text: string | undefined, opts: { slow?: boolean } = {}) {
    if (!text || !this.settings.sound) return;
    void speak(text, opts);
  }

  /** Several clips one after another ("Queria dois cafés." … "Mesa dois."). */
  async speakSeq(texts: string[]) {
    if (!this.settings.sound) return;
    for (const t of texts) await speak(t);
  }

  setSettings(s: Partial<Settings>) {
    this.settings = { ...this.settings, ...s };
    setMusicEnabled(this.settings.sound);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      /* ignore */
    }
    this.bump();
  }
}

function readSettings(): Partial<Settings> {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

let singleton: TvRuntime | null = null;
export function getRuntime(): TvRuntime {
  singleton ??= new TvRuntime();
  return singleton;
}

/** Re-render when the runtime bumps. */
export function useRuntime(): TvRuntime {
  const rt = getRuntime();
  useSyncExternalStore(rt.subscribe, rt.getVersion);
  return rt;
}
