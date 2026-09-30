/**
 * The TV runtime: authoritative host for a couch session.
 *
 * - owns the room connection, players, learner profiles and scores
 * - runs one Activity at a time (title, lobby, micro rush, race, mini aula, results)
 * - routes phone input to the activity and phone navigation to the menus
 * - records language evidence (learner model) and game performance separately
 * - drives Blip, the MC
 *
 * Activities keep their own mutable state; the 3D scene reads it every frame and the DOM overlay
 * re-renders on `bump()` (coarse-grained change notifications).
 */
import { useSyncExternalStore } from "react";
import type { Prompt } from "../curriculum/generators.ts";
import { getItem } from "../curriculum/index.ts";
import { fillTemplate, LINES, type Line, type McEvent } from "../engine/mc/lines.ts";
import type { Outcome } from "../learner/events.ts";
import { isCorrectOutcome } from "../learner/events.ts";
import type { LearnerProfile } from "../learner/model.ts";
import { HostConnection } from "../net/host.ts";
import type { SocketStatus } from "../net/socket.ts";
import { Rng } from "../shared/rng.ts";
import type { ControllerView, InputValue, NavDir, PlayerBody, PlayerInfo, Speed } from "../shared/protocol.ts";
import { playMusic, stopMusic } from "../audio/music.ts";
import { clockPaused, gameNow, pauseClock, resumeClock } from "./clock.ts";
import { sfx } from "../audio/sfx.ts";
import { speak } from "../audio/tts.ts";
import { LearnerStore } from "./learner-store.ts";

export interface RuntimePlayer extends PlayerInfo {
  profile: LearnerProfile;
  ready: boolean;
  /** Session score (game performance — never learner evidence). */
  score: number;
  joinedAt: number;
  /** Items this player missed this session, for the results "para rever" list. */
  missed: { itemId: string; answer: string; why?: string }[];
}

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
  /** Game segments can be paused (Back on the TV / ⏸ on a phone); menus cannot. */
  readonly pausable?: boolean;
  /** Re-play the current audio (phone "🔊 ouvir outra vez"). */
  repeat?(): void;
  /** Music track to restore after a pause. */
  readonly music?: "title" | "party" | "race" | "aula";
}

export interface Settings {
  speed: Speed;
  lowFx: boolean;
  music: boolean;
  subtitles: boolean;
}

export interface McBubble {
  line: Line;
  text: string;
  sub: string;
  until: number;
  seq: number;
}

const SETTINGS_KEY = "pp.tv.settings";

export class TvRuntime {
  readonly conn: HostConnection;
  readonly learner = new LearnerStore();
  readonly rng = new Rng();
  readonly players = new Map<string, RuntimePlayer>();
  readonly testMode = new URLSearchParams(location.search).has("test");
  code = "";
  socket: SocketStatus = "connecting";
  activity: Activity | null = null;
  settings: Settings = { speed: "normal", lowFx: false, music: true, subtitles: true, ...readSettings() };
  paused = false;
  pauseFocus = 0;
  /** Set by the mode runner: how to restart the current mode / leave to the title screen. */
  onRestart: (() => void) | null = null;
  onQuit: (() => void) | null = null;
  mc: McBubble | null = null;
  mcMood: Line["mood"] = "happy";
  mcTalkUntil = 0;
  private mcCooldown = 0;
  private mcSeq = 0;
  private version = 0;
  private listeners = new Set<() => void>();
  private lastTick = performance.now();
  private activityFactory: Record<string, () => Activity> = {};

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
    // Game logic ticks on a timer, independent of the render frame rate (slow TV GPUs must not
    // slow the rules down). Rendering reads the state on its own rAF.
    setInterval(() => {
      const now = gameNow();
      const dt = Math.min(0.1, Math.max(0, (now - this.lastTick) / 1000));
      this.lastTick = now;
      if (!this.paused) this.activity?.tick(now, dt);
      if (this.mc && performance.now() > this.mc.until) {
        this.mc = null;
        this.bump();
      }
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

  private upsertPlayer(info: PlayerInfo, rejoin: boolean) {
    const existing = this.players.get(info.playerId);
    if (existing) {
      Object.assign(existing, info, { connected: true });
    } else {
      const profile = this.learner.profileFor(info.profileHint, info.name);
      this.players.set(info.playerId, { ...info, connected: true, profile, ready: false, score: 0, joinedAt: performance.now(), missed: [] });
      if (!rejoin) {
        sfx.join();
        this.say({ type: profile.createdAt > Date.now() - 5000 ? "join" : "rejoin", name: info.name }, true);
      }
    }
    const p = this.players.get(info.playerId)!;
    this.conn.sendView(p.playerId, this.currentView(p));
    this.activity?.onPlayersChanged?.();
    this.bump();
  }

  private onBody(playerId: string, body: PlayerBody) {
    const p = this.players.get(playerId);
    if (!p) return;
    switch (body.k) {
      case "input": {
        if (this.paused) return;
        // Latency-sensitive: prefer the phone's host-synced timestamp, bounded by receipt time.
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
        this.menu(body.action, body.speed);
        return;
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
        sfx.nav();
        this.bump();
      } else if (dir === "ok") this.menu(items[this.pauseFocus]!.id);
      else if (dir === "back") this.resume();
      else if ((dir === "left" || dir === "right") && items[this.pauseFocus]!.id === "speed") this.menu("speed");
      return;
    }
    if (dir === "back" && this.activity?.pausable) return this.pause();
    this.activity?.onNav?.(dir, "tv");
  }

  /* --------------------------------- pause --------------------------------- */

  get pauseItems(): { id: "resume" | "speed" | "restart" | "quit"; label: string }[] {
    return [
      { id: "resume", label: "▶ Continuar" },
      { id: "speed", label: `Velocidade: ${SPEED_LABEL[this.settings.speed]}` },
      { id: "restart", label: "↺ Recomeçar" },
      { id: "quit", label: "⏏ Sair para o menu" },
    ];
  }

  /** Relative duration multiplier for timers: calma gives more time, turbo less. */
  get pace(): number {
    return PACE[this.settings.speed];
  }

  menu(action: "pause" | "resume" | "restart" | "quit" | "speed" | "repeat", speed?: Speed) {
    switch (action) {
      case "pause":
        if (this.activity?.pausable) this.pause();
        return;
      case "resume":
        return this.resume();
      case "speed": {
        const next = speed ?? SPEED_ORDER[(SPEED_ORDER.indexOf(this.settings.speed) + 1) % SPEED_ORDER.length]!;
        this.setSettings({ speed: next });
        sfx.select();
        for (const p of this.activePlayers) this.conn.sendView(p.playerId, this.currentView(p));
        return;
      }
      case "restart":
        this.unpauseQuietly();
        sfx.select();
        this.onRestart?.();
        return;
      case "quit":
        this.unpauseQuietly();
        sfx.select();
        this.onQuit?.();
        return;
      case "repeat":
        if (!this.paused) this.activity?.repeat?.();
        return;
    }
  }

  pause() {
    if (this.paused || !this.activity?.pausable) return;
    pauseClock();
    this.paused = true;
    this.pauseFocus = 0;
    stopMusic();
    sfx.select();
    for (const p of this.activePlayers) this.conn.sendView(p.playerId, this.currentView(p));
    this.bump();
  }

  resume() {
    if (!this.paused) return;
    resumeClock();
    this.paused = false;
    // Phones' clock offsets are stale after the host clock stood still: resync, then resend views
    // (deadlines are unchanged in game time, so they are still correct).
    for (const p of this.activePlayers) {
      this.conn.resync(p.playerId);
      this.conn.sendView(p.playerId, this.currentView(p));
    }
    if (this.activity?.music && this.settings.music) playMusic(this.activity.music);
    sfx.select();
    this.bump();
  }

  private unpauseQuietly() {
    if (clockPaused()) resumeClock();
    this.paused = false;
  }

  currentView(p: RuntimePlayer): ControllerView {
    if (this.paused) return { mode: "paused", speed: this.settings.speed, title: "Pausa" };
    return this.activity ? this.activity.viewFor(p) : { mode: "wait", title: "Olha para a TV!" };
  }

  /* ------------------------------ activities ------------------------------ */

  register(id: string, factory: () => Activity) {
    this.activityFactory[id] = factory;
  }

  go(id: string) {
    const f = this.activityFactory[id];
    if (!f) throw new Error(`unknown activity ${id}`);
    this.run(f());
  }

  run(a: Activity) {
    this.unpauseQuietly();
    this.activity?.stop?.();
    this.activity = a;
    a.start(this);
    for (const p of this.activePlayers) this.conn.sendView(p.playerId, a.viewFor(p));
    this.bump();
  }

  view(p: RuntimePlayer | "all", view: ControllerView | ((p: RuntimePlayer) => ControllerView)) {
    const targets = p === "all" ? this.activePlayers : [p];
    for (const t of targets) this.conn.sendView(t.playerId, typeof view === "function" ? view(t) : view);
  }

  /* ----------------------- learning evidence & scores ----------------------- */

  /**
   * Record linguistic evidence for every item a prompt exercised.
   * `context` identifies the game/format so tier promotion needs ≥2 distinct contexts.
   */
  evidence(p: RuntimePlayer, prompt: Prompt, context: string, outcome: Outcome, latencyMs?: number) {
    const at = Date.now();
    for (const itemId of prompt.itemIds) {
      if (!getItem(itemId)) continue;
      this.learner.record({ profileId: p.profile.profileId, itemId, context, tier: prompt.tier, outcome, latencyMs, at });
    }
    if (!isCorrectOutcome(outcome) && !p.missed.some((m) => m.answer === prompt.answerText)) {
      p.missed.push({ itemId: prompt.itemIds[0] ?? "", answer: prompt.answerText, why: prompt.why });
    }
  }

  addScore(p: RuntimePlayer, points: number, game: string) {
    p.score = Math.max(0, p.score + points);
    this.learner.recordPerformance({ profileId: p.profile.profileId, game, metric: "score", value: points, at: Date.now() });
  }

  perf(p: RuntimePlayer, game: string, metric: "win" | "turbo" | "combo" | "spinout" | "fastest" | "streak", value = 1) {
    this.learner.recordPerformance({ profileId: p.profile.profileId, game, metric, value, at: Date.now() });
  }

  resetSession() {
    for (const p of this.players.values()) {
      p.score = 0;
      p.missed = [];
      p.ready = false;
    }
  }

  /* ----------------------------------- MC ----------------------------------- */

  /** Blip reacts. `force` bypasses the cooldown (important moments). */
  say(e: McEvent, force = false, holdMs = 3200) {
    const now = performance.now();
    if (!force && now < this.mcCooldown) return;
    const bank = LINES[e.type];
    const line = bank[this.rng.int(bank.length)]!;
    const text = fillTemplate(line.pt, e);
    this.mc = { line, text, sub: fillTemplate(line.en, e), until: now + holdMs, seq: ++this.mcSeq };
    this.mcMood = line.mood;
    this.mcTalkUntil = now + Math.min(holdMs, 400 + text.length * 55);
    this.mcCooldown = now + holdMs + 1200;
    void speak(text, { character: true });
    this.bump();
  }

  /** Speak curriculum audio (correct PT form after a reveal). */
  speakPt(text: string | undefined) {
    if (text) void speak(text);
  }

  setSettings(s: Partial<Settings>) {
    this.settings = { ...this.settings, ...s };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      /* ignore */
    }
    this.bump();
  }
}

export const SPEED_LABEL: Record<Speed, string> = { calma: "Calma 🐢", normal: "Normal", turbo: "Turbo ⚡" };
const SPEED_ORDER: Speed[] = ["calma", "normal", "turbo"];
const PACE: Record<Speed, number> = { calma: 1.7, normal: 1, turbo: 0.8 };

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
