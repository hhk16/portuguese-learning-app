/**
 * Realtime protocol shared by the relay server, the TV host and the phone controllers.
 *
 * Topology: phone <-> relay <-> TV. The TV is authoritative for all game state; the relay
 * only owns rooms (codes, epochs, presence, tokens) and routes messages. Every message is
 * zod-validated on receipt, on every hop.
 */
import { z } from "zod";

export const PROTOCOL_VERSION = 1;

const id = z.string().min(1).max(64);
const shortText = z.string().max(200);

/* ------------------------------------------------------------------ */
/* Player identity                                                     */
/* ------------------------------------------------------------------ */

export const PLAYER_COLORS = ["cyan", "pink", "yellow", "lime"] as const;
export const PlayerColor = z.enum(PLAYER_COLORS);
export type PlayerColor = z.infer<typeof PlayerColor>;

export const AVATARS = ["blob", "bot", "cat", "ghost", "alien", "robo"] as const;
export const Avatar = z.enum(AVATARS);
export type Avatar = z.infer<typeof Avatar>;

export const PlayerInfo = z.object({
  playerId: id,
  name: z.string().min(1).max(16),
  color: PlayerColor,
  avatar: Avatar,
  /** Stable profile id remembered by the phone, so the TV can reconnect it to a learner profile. */
  profileHint: z.string().max(64).optional(),
  connected: z.boolean(),
});
export type PlayerInfo = z.infer<typeof PlayerInfo>;

/* ------------------------------------------------------------------ */
/* Phone controller views (TV -> phone). The phone renders exactly one */
/* view at a time; the TV sends the full view (a snapshot), never diffs. */
/* ------------------------------------------------------------------ */

const Option = z.object({ id, label: shortText, sub: shortText.optional(), emoji: z.string().max(16).optional() });

export const Feedback = z.object({
  status: z.enum(["correct", "wrong", "late", "neutral"]),
  text: shortText,
  detail: shortText.optional(),
});
export type Feedback = z.infer<typeof Feedback>;

export const SPEEDS = ["calma", "normal", "turbo"] as const;
export const Speed = z.enum(SPEEDS);
export type Speed = z.infer<typeof Speed>;

/** The prompt as the phone shows it — the phone is a full second screen, not just buttons. */
export const PromptCard = z.object({
  kicker: shortText.optional(),
  visual: z.string().max(32).optional(),
  /** May contain "___" for the gap. */
  headline: shortText,
  sub: shortText.optional(),
  /** No TV audio to replay for this prompt (hides the phone's 🔊). */
  quiet: z.boolean().optional(),
});
export type PromptCard = z.infer<typeof PromptCard>;

const promptBase = {
  roundId: id,
  promptId: id,
  /** Host-clock (TV performance.now) deadline in ms. */
  deadline: z.number(),
  /** Verb shouted by the microgame, e.g. "ESCOLHE!". */
  title: shortText.optional(),
  question: shortText.optional(),
  card: PromptCard.optional(),
  feedback: Feedback.optional(),
  /** Small status line (e.g. race position). */
  hud: shortText.optional(),
  /** Only sent when the TV runs in test mode (automated e2e). */
  debugAnswer: z.unknown().optional(),
};

/* Aprender (Duolingo-style) exercises as the phone sees them — answers stay on the TV. */
const LearnOpt = z.object({ id, label: shortText, emoji: z.string().max(16).optional() });
const learnOpts = z.array(LearnOpt).min(2).max(6);
const emojiField = z.string().max(16).optional();
export const LearnExView = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("tip"), title: shortText, rows: z.array(z.tuple([shortText, shortText])).max(8), note: shortText.optional(), say: shortText.optional() }),
  z.object({ kind: z.literal("intro"), pt: shortText, en: shortText, emoji: emojiField, say: shortText, note: shortText.optional() }),
  z.object({ kind: z.literal("listen"), say: shortText, options: learnOpts }),
  z.object({ kind: z.literal("read"), pt: shortText, emoji: emojiField, say: shortText, options: learnOpts }),
  z.object({ kind: z.literal("write"), en: shortText, emoji: emojiField, options: learnOpts }),
  z.object({ kind: z.literal("pairs"), pairs: z.array(z.object({ id, pt: shortText, en: shortText })).min(2).max(6) }),
  z.object({ kind: z.literal("gap"), text: shortText, en: shortText, options: learnOpts }),
  z.object({ kind: z.literal("build"), en: shortText, bank: z.array(z.object({ id, text: shortText })).min(2).max(12) }),
  z.object({ kind: z.literal("speak"), pt: shortText, en: shortText, emoji: emojiField, say: shortText }),
]);
export type LearnExView = z.infer<typeof LearnExView>;

export const ControllerView = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("learn"),
    roundId: id,
    promptId: id,
    step: z.number().int().nonnegative(),
    total: z.number().int().positive(),
    hearts: z.number().int().nonnegative(),
    streak: z.number().int().nonnegative(),
    xp: z.number().int().nonnegative(),
    instr: shortText,
    /** English instruction (shown while the players are beginners). */
    instrEn: shortText.optional(),
    /** Adaptive English: show translations by default (else behind a tap). */
    showEn: z.boolean(),
    ex: LearnExView,
    /** Present after answering: the phone shows the verdict and a Continue button. */
    result: z.object({ ok: z.boolean(), pt: shortText, en: shortText.optional(), why: shortText.optional(), say: shortText.optional() }).optional(),
    debugAnswer: z.unknown().optional(),
  }),
  /** Diz-me!: the describer's secret card. */
  z.object({
    mode: z.literal("describe"),
    roundId: id,
    promptId: id,
    deadline: z.number(),
    title: shortText,
    card: z.object({ pt: shortText, en: shortText, emoji: emojiField, say: shortText }),
    score: z.number().int(),
    partner: shortText,
  }),
  /** Apanha!: the phone is one big slam button. */
  z.object({
    mode: z.literal("buzzer"),
    roundId: id,
    promptId: id,
    state: z.enum(["listen", "go", "stunned", "won", "lost"]),
    label: shortText.optional(),
    score: z.number().int(),
    debugAnswer: z.unknown().optional(),
  }),
  /** A short menu on the phone (e.g. what to play after a lesson). */
  z.object({
    mode: z.literal("pick"),
    roundId: id,
    promptId: id,
    title: shortText,
    subtitle: shortText.optional(),
    options: z.array(Option).min(1).max(6),
  }),
  z.object({ mode: z.literal("wait"), title: shortText, subtitle: shortText.optional(), emoji: z.string().max(16).optional(), feedback: Feedback.optional() }),
  z.object({
    mode: z.literal("lobby"),
    ready: z.boolean(),
    canNavigate: z.boolean(),
    hint: shortText.optional(),
    speed: Speed,
  }),
  z.object({ mode: z.literal("paused"), speed: Speed, title: shortText }),
  z.object({ mode: z.literal("remote"), title: shortText, hint: shortText.optional() }),
  z.object({
    mode: z.literal("choices"),
    ...promptBase,
    options: z.array(Option).min(2).max(6),
    layout: z.enum(["grid", "stack"]).optional(),
    /** Race sabotage: number of ink splats covering the buttons (tap to wipe). */
    ink: z.number().int().min(0).max(8).optional(),
  }),
  z.object({
    mode: z.literal("tiles"),
    ...promptBase,
    tiles: z.array(z.object({ id, ch: z.string().min(1).max(4) })).min(2).max(12),
    length: z.number().int().min(1).max(12),
  }),
  z.object({ mode: z.literal("errorTap"), ...promptBase, words: z.array(z.object({ id, text: shortText })).min(2).max(12) }),
  z.object({ mode: z.literal("merge"), ...promptBase, top: z.array(Option).min(1).max(4), bottom: z.array(Option).min(1).max(6) }),
  z.object({
    mode: z.literal("tapStream"),
    ...promptBase,
    rule: shortText,
    /** Mirror of the TV's word stream, scheduled on the host clock. */
    stream: z
      .object({
        words: z.array(z.object({ text: shortText, visual: z.string().max(16).optional() })).max(16),
        startAt: z.number(),
        per: z.number().positive(),
        lead: z.number().nonnegative(),
      })
      .optional(),
  }),
  z.object({ mode: z.literal("mic"), ...promptBase, target: shortText, lang: z.string().max(10) }),
  z.object({
    mode: z.literal("judge"),
    ...promptBase,
    targetPlayerName: shortText,
    target: shortText,
    heard: shortText.optional(),
  }),
  z.object({
    mode: z.literal("itemPick"),
    ...promptBase,
    items: z.array(z.object({ id, label: shortText, emoji: z.string().max(16), desc: shortText })).min(2).max(4),
  }),
  z.object({
    mode: z.literal("lesson"),
    ...promptBase,
    step: shortText,
    canContinue: z.boolean(),
    /** Lesson content mirrored on the phone (paradigm rows, examples, notes). */
    lines: z.array(shortText).max(10).optional(),
  }),
  z.object({
    mode: z.literal("results"),
    title: shortText,
    lines: z.array(shortText).max(12),
    review: z.array(z.object({ pt: shortText, why: shortText.optional() })).max(10),
  }),
]);
export type ControllerView = z.infer<typeof ControllerView>;
export type ControllerMode = ControllerView["mode"];

/* ------------------------------------------------------------------ */
/* Player input values (phone -> TV), keyed by the controller mode.    */
/* ------------------------------------------------------------------ */

export const InputValue = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("choices"), choice: id }),
  z.object({ mode: z.literal("tiles"), seq: z.array(id).max(12) }),
  z.object({ mode: z.literal("errorTap"), wordId: id }),
  z.object({ mode: z.literal("merge"), top: id, bottom: id }),
  z.object({ mode: z.literal("tapStream"), tapHostTime: z.number() }),
  z.object({
    mode: z.literal("mic"),
    /** Speech recognition alternatives; empty when recognition is unavailable. */
    transcripts: z.array(shortText).max(8),
    unsupported: z.boolean(),
  }),
  z.object({ mode: z.literal("judge"), verdict: z.boolean() }),
  z.object({ mode: z.literal("itemPick"), item: id }),
  z.object({ mode: z.literal("lesson"), ok: z.literal(true) }),
  z.object({
    mode: z.literal("learn"),
    answer: z.discriminatedUnion("t", [
      z.object({ t: z.literal("choice"), id }),
      z.object({ t: z.literal("build"), words: z.array(shortText).max(12) }),
      z.object({ t: z.literal("pairs"), missed: z.array(id).max(6) }),
      z.object({ t: z.literal("speak"), transcripts: z.array(shortText).max(8), self: z.boolean().nullable() }),
      z.object({ t: z.literal("next") }),
    ]),
  }),
  z.object({ mode: z.literal("describe"), action: z.enum(["skip"]) }),
  z.object({ mode: z.literal("buzz"), tapHostTime: z.number() }),
  z.object({ mode: z.literal("pick"), id }),
]);
export type InputValue = z.infer<typeof InputValue>;

export const NavDir = z.enum(["up", "down", "left", "right", "ok", "back"]);
export type NavDir = z.infer<typeof NavDir>;

/* ------------------------------------------------------------------ */
/* Message bodies                                                      */
/* ------------------------------------------------------------------ */

export const PlayerBody = z.discriminatedUnion("k", [
  z.object({ k: z.literal("ping"), id, t0: z.number() }),
  z.object({
    k: z.literal("input"),
    roundId: id,
    promptId: id,
    value: InputValue,
    /** When the player acted, on the host clock (phone performance.now + synced offset). */
    clientHostTime: z.number(),
  }),
  z.object({ k: z.literal("nav"), dir: NavDir }),
  z.object({ k: z.literal("ready"), ready: z.boolean() }),
  z.object({ k: z.literal("menu"), action: z.enum(["pause", "resume", "restart", "quit", "speed", "repeat"]), speed: Speed.optional() }),
]);
export type PlayerBody = z.infer<typeof PlayerBody>;

export const HostBody = z.discriminatedUnion("k", [
  z.object({ k: z.literal("pong"), id, t0: z.number(), hostTime: z.number() }),
  z.object({ k: z.literal("view"), view: ControllerView, snapshotSeq: z.number().int().nonnegative() }),
  z.object({ k: z.literal("ack"), messageIds: z.array(id).max(64) }),
  z.object({ k: z.literal("fx"), fx: z.enum(["buzz", "success", "fail", "boost"]) }),
  /** Host clock jumped (resume after pause): re-estimate the offset now. */
  z.object({ k: z.literal("resync") }),
  /** Speak Portuguese on the phone (the TV has no Portuguese voice). */
  z.object({ k: z.literal("speak"), text: shortText }),
]);
export type HostBody = z.infer<typeof HostBody>;

/** Envelope fields carried by every gameplay message. */
const envelope = {
  protocolVersion: z.literal(PROTOCOL_VERSION),
  roomId: id,
  roomEpoch: z.number().int().positive(),
  messageId: id,
  sequence: z.number().int().nonnegative(),
};

export const PlayerMsg = z.object({ ...envelope, playerId: id, clientTime: z.number(), body: PlayerBody });
export type PlayerMsg = z.infer<typeof PlayerMsg>;

export const HostMsg = z.object({ ...envelope, to: z.union([z.literal("all"), id]), body: HostBody });
export type HostMsg = z.infer<typeof HostMsg>;

/* ------------------------------------------------------------------ */
/* Wire messages (socket level)                                        */
/* ------------------------------------------------------------------ */

export const PhoneToServer = z.discriminatedUnion("t", [
  z.object({
    t: z.literal("p.join"),
    protocolVersion: z.literal(PROTOCOL_VERSION),
    code: z.string().min(4).max(6),
    name: z.string().trim().min(1).max(16),
    color: PlayerColor,
    avatar: Avatar,
    profileHint: z.string().max(64).optional(),
    resume: z.object({ playerId: id, playerToken: z.string().min(16).max(128) }).optional(),
  }),
  z.object({ t: z.literal("p.msg"), playerToken: z.string().min(16).max(128), msg: PlayerMsg }),
]);
export type PhoneToServer = z.infer<typeof PhoneToServer>;

export const HostToServer = z.discriminatedUnion("t", [
  z.object({ t: z.literal("h.create"), protocolVersion: z.literal(PROTOCOL_VERSION) }),
  z.object({ t: z.literal("h.resume"), protocolVersion: z.literal(PROTOCOL_VERSION), roomId: id, hostToken: z.string().min(16).max(128) }),
  z.object({ t: z.literal("h.msg"), hostToken: z.string().min(16).max(128), msg: HostMsg }),
  z.object({ t: z.literal("h.close"), hostToken: z.string().min(16).max(128), roomId: id }),
]);
export type HostToServer = z.infer<typeof HostToServer>;

export const ServerToHost = z.discriminatedUnion("t", [
  z.object({ t: z.literal("s.created"), roomId: id, code: z.string(), roomEpoch: z.number().int(), hostToken: z.string() }),
  z.object({ t: z.literal("s.resumed"), roomId: id, code: z.string(), roomEpoch: z.number().int(), players: z.array(PlayerInfo) }),
  z.object({ t: z.literal("s.resumeFailed"), reason: shortText }),
  z.object({ t: z.literal("s.player"), player: PlayerInfo, rejoin: z.boolean() }),
  z.object({ t: z.literal("s.playerLeft"), playerId: id }),
  z.object({ t: z.literal("s.fromPlayer"), msg: PlayerMsg, serverTime: z.number() }),
  z.object({ t: z.literal("s.error"), reason: shortText }),
]);
export type ServerToHost = z.infer<typeof ServerToHost>;

export const ServerToPhone = z.discriminatedUnion("t", [
  z.object({ t: z.literal("s.joined"), roomId: id, code: z.string(), roomEpoch: z.number().int(), playerId: id, playerToken: z.string() }),
  z.object({ t: z.literal("s.joinFailed"), reason: z.enum(["no-room", "full", "bad-token", "version"]) }),
  z.object({ t: z.literal("s.fromHost"), msg: HostMsg }),
  z.object({ t: z.literal("s.epoch"), roomEpoch: z.number().int() }),
  z.object({ t: z.literal("s.hostAway") }),
  z.object({ t: z.literal("s.roomClosed") }),
  z.object({ t: z.literal("s.error"), reason: shortText }),
]);
export type ServerToPhone = z.infer<typeof ServerToPhone>;

export const MAX_PLAYERS = 4;
