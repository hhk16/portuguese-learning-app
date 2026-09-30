/**
 * Realtime protocol shared by the relay server, the TV host and the phone controllers.
 *
 * Topology: phone <-> relay <-> TV. The TV is authoritative for all game state; the relay
 * only owns rooms (codes, epochs, presence, tokens) and routes messages. Every message is
 * zod-validated on receipt, on every hop.
 */
import { z } from "zod";

export const PROTOCOL_VERSION = 2;

const id = z.string().min(1).max(64);
const shortText = z.string().max(200);

/* ------------------------------------------------------------------ */
/* Player identity                                                     */
/* ------------------------------------------------------------------ */

export const PLAYER_COLORS = ["coral", "sky", "mint", "sun"] as const;
export const PlayerColor = z.enum(PLAYER_COLORS);
export type PlayerColor = z.infer<typeof PlayerColor>;

/** Player characters (cartoon art in /art/characters/<id>-<pose>.webp). */
export const AVATARS = ["ana", "hadi", "a", "b", "c", "d"] as const;
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

/** A picture word as the phone shows it. `pic` is an emoji glyph mapped to the Fluent 3D art. */
const Word = z.object({ pt: shortText, en: shortText.optional(), pic: z.string().max(24).optional() });
export type Word = z.infer<typeof Word>;

/* Aprender juntos exercises as the phone sees them — answers stay on the TV. */
const LearnOpt = z.object({ id, label: shortText, emoji: z.string().max(24).optional() });
const learnOpts = z.array(LearnOpt).min(2).max(6);
const emojiField = z.string().max(24).optional();
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
  /** Partner judges a spoken answer. */
  z.object({ kind: z.literal("judge"), name: shortText, pt: shortText, en: shortText, emoji: emojiField }),
]);
export type LearnExView = z.infer<typeof LearnExView>;

const round = { roundId: id, promptId: id, debugAnswer: z.unknown().optional() };

export const SecretCard = z.object({
  id,
  word: Word,
  /** Public state on the board. */
  state: z.enum(["hidden", "found", "neutral", "boom"]),
  /** This player's private key (only on the clue-giver's phone). */
  key: z.enum(["target", "bomb", "neutral"]).optional(),
});
export type SecretCard = z.infer<typeof SecretCard>;

export const ControllerView = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("wait"), title: shortText, subtitle: shortText.optional(), pic: emojiField }),
  z.object({ mode: z.literal("lobby"), ready: z.boolean(), hint: shortText.optional() }),
  z.object({ mode: z.literal("paused"), title: shortText }),
  z.object({ mode: z.literal("remote"), title: shortText, hint: shortText.optional() }),
  z.object({ mode: z.literal("pick"), ...round, title: shortText, subtitle: shortText.optional(), options: z.array(Option).min(1).max(8) }),
  /** Aprender juntos: the same exercise for everyone, answered privately, revealed together. */
  z.object({
    mode: z.literal("learn"),
    ...round,
    step: z.number().int().nonnegative(),
    total: z.number().int().positive(),
    instr: shortText,
    instrEn: shortText.optional(),
    showEn: z.boolean(),
    ex: LearnExView,
    /** After answering: whose answer we're waiting for. */
    waiting: shortText.optional(),
    /** After the reveal. */
    result: z.object({ ok: z.boolean(), pt: shortText, en: shortText.optional(), why: shortText.optional() }).optional(),
  }),
  /** Pares Secretos (Codenames Duet style). */
  z.object({
    mode: z.literal("secret"),
    ...round,
    role: z.enum(["clue", "guess", "watch"]),
    partner: shortText,
    cards: z.array(SecretCard).min(4).max(20),
    clue: z.object({ count: z.number().int().min(1).max(9) }).optional(),
    guessesLeft: z.number().int().nonnegative().optional(),
    turnsLeft: z.number().int().nonnegative(),
    found: z.number().int().nonnegative(),
    goal: z.number().int().positive(),
  }),
  /** Na Mesma Onda (Wavelength style). */
  z.object({
    mode: z.literal("dial"),
    ...round,
    role: z.enum(["psychic", "guess", "watch"]),
    partner: shortText,
    left: Word,
    right: Word,
    /** 0..100 — only on the psychic's phone (and everyone's after the reveal). */
    target: z.number().min(0).max(100).optional(),
    value: z.number().min(0).max(100),
    /** Clue ideas for the psychic: words they know, with pictures. */
    ideas: z.array(Word).max(12).optional(),
    phase: z.enum(["clue", "guess", "reveal"]),
    points: z.number().int().optional(),
  }),
  /** Em Sintonia (Medium style). */
  z.object({
    mode: z.literal("sync"),
    ...round,
    words: z.tuple([Word, Word]),
    attempt: z.number().int().positive(),
    bank: z.array(Word).max(16),
    submitted: z.boolean(),
  }),
]);
export type ControllerView = z.infer<typeof ControllerView>;
export type ControllerMode = ControllerView["mode"];

/* ------------------------------------------------------------------ */
/* Player input values (phone -> TV), keyed by the controller mode.    */
/* ------------------------------------------------------------------ */

export const InputValue = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("learn"),
    answer: z.discriminatedUnion("t", [
      z.object({ t: z.literal("choice"), id }),
      z.object({ t: z.literal("build"), words: z.array(shortText).max(12) }),
      z.object({ t: z.literal("pairs"), missed: z.array(id).max(6) }),
      z.object({ t: z.literal("speak"), transcripts: z.array(shortText).max(8), self: z.boolean().nullable() }),
      z.object({ t: z.literal("judge"), ok: z.boolean() }),
      z.object({ t: z.literal("next") }),
    ]),
  }),
  z.object({ mode: z.literal("pick"), id }),
  z.object({
    mode: z.literal("secret"),
    action: z.discriminatedUnion("a", [
      z.object({ a: z.literal("clue"), count: z.number().int().min(1).max(9) }),
      z.object({ a: z.literal("tap"), cardId: id }),
      z.object({ a: z.literal("stop") }),
    ]),
  }),
  z.object({
    mode: z.literal("dial"),
    action: z.discriminatedUnion("a", [
      z.object({ a: z.literal("move"), value: z.number().min(0).max(100) }),
      z.object({ a: z.literal("clued") }),
      z.object({ a: z.literal("lock") }),
      z.object({ a: z.literal("next") }),
    ]),
  }),
  z.object({ mode: z.literal("sync"), word: z.string().trim().min(1).max(40) }),
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
  z.object({ k: z.literal("menu"), action: z.enum(["pause", "resume", "restart", "quit", "repeat"]) }),
]);
export type PlayerBody = z.infer<typeof PlayerBody>;

export const HostBody = z.discriminatedUnion("k", [
  z.object({ k: z.literal("pong"), id, t0: z.number(), hostTime: z.number() }),
  z.object({ k: z.literal("view"), view: ControllerView, snapshotSeq: z.number().int().nonnegative() }),
  z.object({ k: z.literal("ack"), messageIds: z.array(id).max(64) }),
  z.object({ k: z.literal("fx"), fx: z.enum(["buzz", "success", "fail", "boost"]) }),
  /** Host clock jumped (resume after pause): re-estimate the offset now. */
  z.object({ k: z.literal("resync") }),
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
