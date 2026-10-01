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

const round = {
  roundId: id,
  promptId: id,
  debugAnswer: z.unknown().optional(),
  /** Unscored practice round ("Ensaio"): the phone offers "Saltar". */
  practice: z.boolean().optional(),
};

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
  z.object({
    mode: z.literal("lobby"),
    ready: z.boolean(),
    hint: shortText.optional(),
    /** Games: difficulty 1–3 (either phone can change it with ◀ ▶). */
    level: z.number().int().min(1).max(3).optional(),
    /** Games that use your words: which words (the whole book so far, or one unit) — ▲ ▼. */
    topic: shortText.optional(),
  }),
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
    cards: z.array(SecretCard).min(4).max(24),
    clue: z.object({ count: z.number().int().min(1).max(9), word: Word.optional() }).optional(),
    /** Clue words the giver can choose from (never a word on the board). */
    clueWords: z.array(Word).max(40).optional(),
    guessesLeft: z.number().int().nonnegative().optional(),
    turnsUsed: z.number().int().nonnegative(),
    turns: z.number().int().positive(),
    lives: z.number().int().nonnegative(),
    msLeft: z.number().nonnegative().optional(),
    found: z.number().int().nonnegative(),
    goal: z.number().int().positive(),
    /** Out of turns: no clues, everyone taps; one miss ends it. */
    sudden: z.boolean().optional(),
    /** The giver's bet on this turn (how many the partner finds). */
    bet: z.number().int().nonnegative().optional(),
  }),
  /** Grande Final: quick questions, first right answer wins. */
  z.object({
    mode: z.literal("final"),
    ...round,
    /** Header label (default "Grande Final"); the lesson's lightning round reuses this view. */
    label: shortText.optional(),
    kind: z.enum(["see", "hear", "frase"]),
    index: z.number().int().nonnegative(),
    total: z.number().int().positive(),
    double: z.boolean().optional(),
    msLeft: z.number().nonnegative(),
    /** "see": the picture + English to name in Portuguese. */
    prompt: Word.optional(),
    /** Choices (Portuguese words for "see", pictures for "hear"); absent = type the answer. */
    options: z.array(Word).max(8).optional(),
    pictures: z.boolean().optional(),
    answered: z.boolean(),
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
    /** Clue options for the psychic: intensifiers ("muito frio") and things, with pictures. */
    clues: z.array(Word).max(16).optional(),
    /** The clue given (the TV says it). */
    clue: Word.optional(),
    phase: z.enum(["clue", "guess", "reveal"]),
    /** Scoring band half-widths for this difficulty. */
    bands: z.tuple([z.number(), z.number(), z.number()]).optional(),
    /** Locked in, drumroll before the reveal. */
    locked: z.boolean().optional(),
    final: z.boolean().optional(),
    /** Whether the guesser bet "Tenho a certeza!" (shown at the reveal). */
    sure: z.boolean().optional(),
    /** The psychic's side bet on how close the guess lands, and whether it came true. */
    psychicBet: z.enum(["cheio", "perto", "longe"]).optional(),
    betWon: z.boolean().optional(),
    msLeft: z.number().nonnegative().optional(),
    points: z.number().int().optional(),
  }),
  /** Em Sintonia (Medium style). */
  z.object({
    mode: z.literal("sync"),
    ...round,
    words: z.tuple([Word, Word]),
    attempt: z.number().int().positive(),
    tries: z.number().int().positive().optional(),
    bank: z.array(Word).max(16),
    submitted: z.boolean(),
    /** Your locked-in word. */
    mine: shortText.optional(),
    /** Your prediction ("Vamos coincidir?"), once made. */
    predicted: z.boolean().optional(),
    final: z.boolean().optional(),
    msLeft: z.number().nonnegative().optional(),
    /** What each of you chose last try (same pair again). */
    previous: z.array(z.object({ name: shortText, word: shortText })).max(4).optional(),
    /** Same word but not an obvious link: "Faz sentido?" vote. */
    sense: z.object({ word: shortText, voted: z.boolean() }).optional(),
    /** Team lives left (a pair you never match costs one). */
    lives: z.number().int().nonnegative().optional(),
  }),
  /** Desenha! — one draws the secret word, the other picks it from Portuguese words. */
  z.object({
    mode: z.literal("draw"),
    ...round,
    role: z.enum(["draw", "guess"]),
    partner: shortText,
    round: z.number().int().nonnegative(),
    rounds: z.number().int().positive(),
    /** Milliseconds left in this turn when the view was sent, and the turn's full length (it shrinks each round). */
    msLeft: z.number().nonnegative(),
    turnMs: z.number().positive().optional(),
    /** The secret word (drawer only). */
    word: Word.optional(),
    final: z.boolean().optional(),
    /** Guesser's tap choices (Portuguese only; they appear after a while on easier levels) and the ones already tried. */
    options: z.array(z.object({ id, label: shortText })).max(8).optional(),
    /** When the options will appear. */
    optionsInMs: z.number().nonnegative().optional(),
    /** Letter hint, e.g. "g _ _ _". */
    hint: shortText.optional(),
    /** Drawer: the partner's guesses so far (newest last). */
    guesses: z.array(shortText).max(6).optional(),
    tried: z.array(id).max(8).optional(),
    canPass: z.boolean().optional(),
    /** Twist rounds: the drawer may only use this many strokes ("Só 3 traços!"), and has used these. */
    strokeLimit: z.number().int().positive().optional(),
    strokesUsed: z.number().int().nonnegative().optional(),
    /** The twist's rule, shown on both phones ("Só 3 traços!"). */
    twist: z.object({ pt: shortText, en: shortText }).optional(),
  }),
  /** Stop! — a letter, four categories, a word for each. */
  z.object({
    mode: z.literal("stop"),
    ...round,
    letter: z.string().length(1),
    categories: z.array(z.object({ id, label: shortText, en: shortText.optional(), pic: emojiField })).min(2).max(6),
    phase: z.enum(["write", "hurry", "vote"]),
    msLeft: z.number().nonnegative(),
    /** Final letter / sudden death: points ×2. */
    double: z.boolean().optional(),
    /** 💡 hints you asked for: category id → the start of a word. */
    help: z.record(z.string().max(32), shortText).optional(),
    /** Who shouted STOP (during "hurry"). */
    stoppedBy: shortText.optional(),
    /** Your partner's words the dictionary doesn't know — you decide. */
    votes: z.array(z.object({ id, category: shortText, word: shortText })).max(6).optional(),
    voted: z.boolean().optional(),
  }),
  /** Name the puppy (asked once on Ana's phone; renamed from the TV's settings). */
  z.object({ mode: z.literal("petName"), ...round, current: shortText.optional(), suggestions: z.array(shortText).max(8) }),
  /** Batata Quente — answer right to pass the hot potato; whoever holds it when it blows loses the round. */
  z.object({
    mode: z.literal("bomb"),
    ...round,
    holding: z.boolean(),
    holder: shortText,
    kind: z.enum(["hear", "see", "opposite", "number", "hearNumber", "phrase"]),
    /** What to answer: a picture (see), a word (opposite), a digit (number); hear = the TV says it. */
    prompt: Word.optional(),
    options: z.array(Word).max(6).optional(),
    /** Options are pictures to tap (hear) rather than words. */
    pictures: z.boolean().optional(),
    /** A wrong answer locks you out for a moment. */
    lockedMs: z.number().nonnegative().optional(),
    round: z.number().int().nonnegative(),
    rounds: z.number().int().positive(),
    double: z.boolean().optional(),
    /** The waiting player's "Despacha-te!" presses left (each shortens the fuse a little). */
    hurryLeft: z.number().int().nonnegative().optional(),
    score: z.array(z.object({ name: shortText, wins: z.number().int().nonnegative() })).max(4),
  }),
  /** Cozinha Caótica — your half of the pantry; the orders are on the TV. */
  z.object({
    mode: z.literal("kitchen"),
    ...round,
    pantry: z.array(z.object({ id, pt: shortText, pic: emojiField })).max(10),
    /** Open tables to serve (when the level needs the right table). */
    tables: z.array(z.number().int().min(1).max(3)).max(3).optional(),
    /** Tables whose order can be heard again. */
    replay: z.array(z.number().int().min(1).max(3)).max(3).optional(),
    /** What's on the shared tray right now. */
    tray: z.array(z.object({ pt: shortText, pic: emojiField, n: z.number().int().positive() })).max(12),
    msLeft: z.number().nonnegative(),
    served: z.number().int().nonnegative(),
    score: z.number().int().nonnegative(),
    hearts: z.number().int().min(0).max(5),
    rush: z.boolean().optional(),
    /** Set when the pantries just swapped ("Troca!"). */
    swapped: z.boolean().optional(),
  }),
]);
export type ControllerView = z.infer<typeof ControllerView>;
export type ControllerMode = ControllerView["mode"];

/* ------------------------------------------------------------------ */
/* Player input values (phone -> TV), keyed by the controller mode.    */
/* ------------------------------------------------------------------ */

export const InputValue = z.discriminatedUnion("mode", [
  /** Skip the practice round. */
  z.object({ mode: z.literal("skip") }),
  z.object({ mode: z.literal("final"), answer: z.string().trim().min(1).max(40) }),
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
      z.object({ a: z.literal("clue"), count: z.number().int().min(1).max(9), word: shortText.optional() }),
      z.object({ a: z.literal("tap"), cardId: id }),
      z.object({ a: z.literal("stop") }),
      /** The clue-giver bets how many cards the partner will find this turn. */
      z.object({ a: z.literal("bet"), n: z.number().int().min(0).max(9) }),
    ]),
  }),
  z.object({
    mode: z.literal("dial"),
    action: z.discriminatedUnion("a", [
      z.object({ a: z.literal("move"), value: z.number().min(0).max(100) }),
      z.object({ a: z.literal("clue"), text: shortText }),
      z.object({ a: z.literal("lock"), sure: z.boolean().optional() }),
      z.object({ a: z.literal("bet"), bet: z.enum(["cheio", "perto", "longe"]) }),
      z.object({ a: z.literal("next") }),
    ]),
  }),
  z.object({ mode: z.literal("petName"), name: z.string().trim().min(1).max(16).optional(), skip: z.boolean().optional() }),
  z.object({ mode: z.literal("bomb"), answer: z.string().trim().min(1).max(40).optional(), hurry: z.boolean().optional() }),
  z.object({ mode: z.literal("sync"), word: z.string().trim().min(1).max(40).optional(), sense: z.boolean().optional(), predict: z.boolean().optional() }),
  z.object({
    mode: z.literal("draw"),
    action: z.discriminatedUnion("a", [
      /** A piece of a stroke: points as x,y pairs on a 0..1000 square, in order (seg = piece index). */
      z.object({ a: z.literal("stroke"), s: z.number().int().nonnegative(), seg: z.number().int().nonnegative(), c: z.number().int().min(0).max(5), w: z.number().int().min(1).max(4), pts: z.array(z.number().int().min(0).max(1000)).max(400) }),
      z.object({ a: z.literal("clear") }),
      z.object({ a: z.literal("undo") }),
      /** Drawer's hint while the partner guesses: 🔥 quente / ❄️ frio. */
      z.object({ a: z.literal("warm"), hot: z.boolean() }),
      z.object({ a: z.literal("guess"), id }),
      /** Typed guess, or what speech recognition heard (alternatives). */
      z.object({ a: z.literal("type"), text: z.string().max(40) }),
      z.object({ a: z.literal("say"), heard: z.array(z.string().max(80)).max(8) }),
      z.object({ a: z.literal("pass") }),
    ]),
  }),
  z.object({
    mode: z.literal("stop"),
    action: z.discriminatedUnion("a", [
      /** Your words so far (sent as you type); stop = "I'm done, STOP!" */
      z.object({ a: z.literal("save"), answers: z.record(z.string().max(32), z.string().max(40)), stop: z.boolean() }),
      z.object({ a: z.literal("vote"), ok: z.record(z.string().max(64), z.boolean()) }),
      z.object({ a: z.literal("help"), cat: z.string().max(32) }),
    ]),
  }),
  z.object({
    mode: z.literal("kitchen"),
    action: z.discriminatedUnion("a", [
      z.object({ a: z.literal("add"), id }),
      /** table: which table to serve (Médio/Difícil). */
      z.object({ a: z.literal("serve"), table: z.number().int().min(1).max(3).optional() }),
      z.object({ a: z.literal("trash") }),
      z.object({ a: z.literal("replay"), table: z.number().int().min(1).max(3) }),
    ]),
  }),
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
  /** A quick emoji reaction that flies across the TV (Jackbox-style), from any screen. */
  z.object({ k: z.literal("react"), emoji: z.enum(["😂", "😱", "👏", "❤️", "🤔", "🔥"]) }),
]);
export const REACTIONS = ["😂", "😱", "👏", "❤️", "🤔", "🔥"] as const;
export type Reaction = (typeof REACTIONS)[number];
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
