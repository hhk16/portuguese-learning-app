/**
 * Cozinha Caótica — co-op café rush for two (Overcooked-ish, one thumb each).
 *
 * Customers order out loud in Portuguese ("Queria dois cafés e um pão, por favor"); the order
 * tickets are on the TV. The pantry is split: half the food is on each phone, so you have to
 * talk ("Tens o queijo?"). Everything you tap lands on the shared tray; serve when it matches an
 * order. Every so often the pantries swap — Troca!
 */
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue } from "../../shared/protocol.ts";
import { play } from "../../audio/sfx.ts";
import { setHurry } from "../../audio/music.ts";
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import type { GameOutcome } from "../../tv/activities.ts";
import { CUE, PET, SAY } from "../../tv/host-lines.ts";
import type { Level } from "../../tv/progress.ts";
import { amount, DISHES, MENUS, orderBook, TABLE_SAY, type Dish, type Menu, type Order } from "./menu.ts";

export const SHIFT_MS = 150_000;
/** The last stretch: customers come faster and every order is worth double. */
export const RUSH_MS = 40_000;
export const HEARTS = 3;
/** Score for ⭐⭐⭐ (85%); stars are 35 / 60 / 85% of this. */
export const TARGETS: Record<Level, number> = { 1: 500, 2: 800, 3: 900 };
const MAX_TICKETS = 3;

/**
 * Difficulty: what the ticket shows, whether you must serve the right table, patience, swaps.
 * - Fácil: the order in writing (pictures only after a wrong serve), any table.
 * - Médio: listen — the ticket shows only "🔊 3 itens" and its table; replaying the order
 *   reveals the text but costs 3 s of patience. Serve to the right table.
 * - Difícil: listen only (replays never show the text), right table, faster.
 */
export const LEVEL_RULES: Record<Level, { show: "text" | "audio" | "audio-only"; tables: boolean; patience: number; perItem: number; swapMs: number; gap: number }> = {
  1: { show: "text", tables: false, patience: 38_000, perItem: 10_000, swapMs: 55_000, gap: 14_000 },
  2: { show: "audio", tables: true, patience: 34_000, perItem: 9_000, swapMs: 40_000, gap: 12_000 },
  3: { show: "audio-only", tables: true, patience: 28_000, perItem: 7_000, swapMs: 30_000, gap: 10_000 },
};
/** Patience a replay costs. */
export const REPLAY_COST = 3_000;

export interface Ticket {
  id: string;
  order: Order;
  arrived: number;
  deadline: number;
  /** Shown briefly after serving / leaving. */
  done?: "served" | "left";
  doneAt?: number;
  points?: number;
  /** After a wrong serve the tickets give a hint (pictures; on hard, the text too). */
  hinted?: boolean;
  /** Table 1–3 (unique among open tickets). */
  table: number;
  /** Replayed on Médio: the text shows now. */
  revealed?: boolean;
}

/** Points for an order: 10 per item plus a speed bonus (up to 10), doubled in rush hour. */
export function orderPoints(items: number, patienceLeft: number, rush: boolean): number {
  const base = items * 10 + Math.round(Math.max(0, Math.min(1, patienceLeft)) * 10);
  return rush ? base * 2 : base;
}

/** Tray (dish id → count) equals an order exactly. */
export function trayMatches(tray: Map<string, number>, order: Order): boolean {
  const keys = new Set([...tray.keys(), ...Object.keys(order.items)]);
  for (const k of keys) if ((tray.get(k) ?? 0) !== (order.items[k] ?? 0)) return false;
  return true;
}

export class Cozinha implements Activity {
  readonly id = "kitchen";
  readonly pausable = true;
  rt!: TvRuntime;
  menu!: Menu;
  phase: "shift" | "end" = "shift";
  shiftEnd = 0;
  tickets: Ticket[] = [];
  tray = new Map<string, number>();
  /** Who put what on the tray (for language evidence). */
  private trayBy: { playerId: string; dish: string }[] = [];
  pantries = new Map<string, string[]>();
  served = 0;
  missed = 0;
  mistakes = 0;
  score = 0;
  hearts = HEARTS;
  level: Level = 1;
  /** First play: one relaxed practice order ("Ensaio") before the clock starts. */
  practice = false;
  rushAnnounced = false;
  /** For TV animations. */
  flash: { kind: "served" | "wrong" | "swap"; seq: number; at: number } | null = null;
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private book: Order[] = [];
  private nextSwap = 0;
  private nextArrival = 0;
  private swapped = false;
  private flashSeq = 0;
  private words = new Set<string>();
  private firstServe = true;
  private semAnnounced = false;
  /** Items each player put on trays that were served (the MVP split on game night). */
  contrib = new Map<string, number>();
  private readonly onDone: (r: GameOutcome) => void;

  constructor(onDone: (r: GameOutcome) => void) {
    this.onDone = onDone;
  }

  get players() {
    return this.rt.activePlayers.slice(0, 2);
  }
  get msLeft() {
    return Math.max(0, this.shiftEnd - gameNow());
  }
  get open() {
    return this.tickets.filter((t) => !t.done);
  }
  get rules() {
    return LEVEL_RULES[this.level];
  }
  get rush() {
    return this.phase === "shift" && this.msLeft <= RUSH_MS;
  }
  /** What the TV shows on a ticket at this difficulty (hints unlock after a wrong serve). */
  get inPractice() {
    return this.practice && this.phase === "shift";
  }
  ticketShows(t: Ticket): { text: boolean; pictures: boolean } {
    if (this.inPractice) return { text: true, pictures: true };
    const show = this.rules.show;
    if (show === "text") return { text: true, pictures: !!t.hinted };
    if (show === "audio") return { text: !!t.revealed || !!t.hinted, pictures: false };
    return { text: !!t.hinted, pictures: false };
  }
  itemCount(t: Ticket) {
    return Object.values(t.order.items).reduce((a, b) => a + b, 0);
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    this.menu = rt.rng.pick(MENUS);
    this.book = orderBook(this.menu);
    const now = gameNow();
    // Practice: the clock waits until the first order is served.
    this.shiftEnd = now + (this.practice ? 3_600_000 : SHIFT_MS);
    this.nextSwap = now + this.rules.swapMs;
    this.nextArrival = now + 1200;
    this.deal();
    this.rt.cue(CUE.cook);
    this.rt.refreshViews();
    this.rt.bump();
  }

  /** Split the menu's dishes between the two phones. */
  private deal() {
    const ds = this.rt.rng.shuffle(this.menu.dishes);
    const [a, b] = this.players;
    const half = Math.ceil(ds.length / 2);
    if (a) this.pantries.set(a.playerId, b ? ds.slice(0, half) : ds);
    if (b) this.pantries.set(b.playerId, ds.slice(half));
  }

  /** Harder orders as you serve more; from the 4th order on, every other one is "com / sem". */
  private levelNow(): Order["level"] {
    if (this.served >= 4 && this.served % 2 === 0 && this.book.some((o) => o.level === 4)) return 4;
    return this.served < 2 ? 1 : this.served < 5 ? 2 : 3;
  }

  private arrive(now: number) {
    const lvl = this.levelNow();
    const openTexts = new Set(this.open.map((t) => t.order.text));
    const pool = this.book.filter((o) => o.level === lvl && !openTexts.has(o.text));
    const order = this.rt.rng.pick(pool.length ? pool : this.book);
    const n = Object.values(order.items).reduce((s, x) => s + x, 0);
    const patience = (this.rules.patience + this.rules.perItem * (n - 1)) * (this.rush ? 0.85 : 1);
    const used = new Set(this.open.map((t) => t.table));
    const table = [1, 2, 3].find((n) => !used.has(n)) ?? 1;
    this.tickets.push({ id: randomId(5), order, arrived: now, deadline: now + patience, table });
    play("ding");
    if (order.level === 4 && !this.semAnnounced) {
      this.semAnnounced = true;
      this.rt.say(SAY.sem);
    }
    if (this.rules.tables) void this.rt.speakSeq([order.text, TABLE_SAY[table]!]);
    else this.rt.speakPt(order.text);
    this.rt.bump();
  }

  /** The practice order was served (or skipped): open the café for real. */
  private endPractice(now: number) {
    this.practice = false;
    this.tickets = this.tickets.filter((t) => t.done);
    this.clearTray();
    this.shiftEnd = now + SHIFT_MS;
    this.nextSwap = now + this.rules.swapMs;
    this.nextArrival = now + 1500;
    this.rt.say(SAY.start);
    this.rt.refreshViews();
    this.rt.bump();
  }

  tick(now: number) {
    if (this.phase !== "shift") return;
    if (this.inPractice) {
      // One order, no patience, no swaps.
      for (const t of this.open) t.deadline = now + 60_000;
      if (this.open.length === 0 && this.tickets.length === 0) this.arrive(now);
      return;
    }
    setHurry(this.shiftEnd - now < 20_000);
    if (now >= this.shiftEnd) return this.finish();
    if (this.rush && !this.rushAnnounced) {
      this.rushAnnounced = true;
      play("whistle");
      this.rt.say(SAY.rush, { interrupt: true });
    }
    // Customers who waited too long leave — and take a heart of your reputation.
    for (const t of this.open)
      if (now >= t.deadline) {
        t.done = "left";
        t.doneAt = now;
        this.missed++;
        this.hearts--;
        play("sad-trombone", 0.7);
        this.rt.say(SAY.customerLeft);
        for (const p of this.players) this.rt.emote(p.playerId, "sad", 1500);
        if (this.hearts <= 0) return this.finish();
        this.rt.refreshViews();
        this.rt.bump();
      }
    // Clear finished tickets after their little animation.
    const before = this.tickets.length;
    this.tickets = this.tickets.filter((t) => !t.done || now - (t.doneAt ?? now) < 1400);
    if (this.tickets.length !== before) this.rt.bump();
    // Keep the counter busy: never empty, up to three at once.
    if (this.open.length === 0 || (this.open.length < MAX_TICKETS && now >= this.nextArrival)) {
      this.arrive(now);
      this.nextArrival = now + (this.levelNow() === 1 ? this.rules.gap + 2000 : this.rules.gap) * (this.rush ? 0.6 : 1);
    }
    if (now >= this.nextSwap && this.players.length === 2) {
      this.nextSwap = now + this.rules.swapMs;
      const [a, b] = this.players;
      const pa = this.pantries.get(a!.playerId) ?? [];
      this.pantries.set(a!.playerId, this.pantries.get(b!.playerId) ?? []);
      this.pantries.set(b!.playerId, pa);
      this.swapped = true;
      this.flash = { kind: "swap", seq: ++this.flashSeq, at: now };
      play("whoosh");
      this.rt.say(SAY.swap);
      this.rt.refreshViews();
      this.swapped = false;
      this.rt.bump();
    }
  }

  repeat() {
    const t = this.open[0];
    if (t) this.rt.speakPt(t.order.text);
  }

  onPlayersChanged() {
    if (this.players.every((p) => this.pantries.has(p.playerId))) this.rt.refreshViews();
    else {
      this.deal();
      this.rt.refreshViews();
    }
  }

  onInput(p: RuntimePlayer, promptId: string, _roundId: string, value: InputValue) {
    if (value.mode === "skip" && this.inPractice) return this.endPractice(gameNow());
    if (value.mode !== "kitchen" || this.phase !== "shift" || promptId !== this.promptId) return;
    const act = value.action;
    if (act.a === "add") {
      if (!(this.pantries.get(p.playerId) ?? []).includes(act.id)) return;
      if ([...this.tray.values()].reduce((s, n) => s + n, 0) >= 8) return;
      this.tray.set(act.id, (this.tray.get(act.id) ?? 0) + 1);
      this.trayBy.push({ playerId: p.playerId, dish: act.id });
      play("pop");
    } else if (act.a === "trash") {
      this.clearTray();
      play("back");
    } else if (act.a === "replay") {
      // Hear an order again; on Médio that reveals its text. Costs patience.
      const t = this.open.find((x) => x.table === act.table);
      if (!t) return;
      t.deadline = Math.max(gameNow() + 2000, t.deadline - REPLAY_COST);
      if (this.rules.show === "audio") t.revealed = true;
      void this.rt.speakSeq(this.rules.tables ? [t.order.text, TABLE_SAY[t.table]!] : [t.order.text]);
    } else if (act.a === "serve") {
      const matching = this.open.filter((x) => trayMatches(this.tray, x.order));
      const t = this.rules.tables ? matching.find((x) => x.table === act.table) : matching[0];
      if (t) this.serve(t);
      else if (matching.length && this.rules.tables) {
        // Right food, wrong table.
        this.mistakes++;
        this.flash = { kind: "wrong", seq: ++this.flashSeq, at: gameNow() };
        play("buzzer");
        this.rt.speakPt("Mesa errada!");
        for (const x of this.players) this.rt.emote(x.playerId, "sad", 1200);
      } else if (this.tray.size) {
        this.mistakes++;
        this.flash = { kind: "wrong", seq: ++this.flashSeq, at: gameNow() };
        play("buzzer");
        this.rt.say(SAY.notThat, { interrupt: true });
        // A hint: the tickets now show more (pictures; on hard, the words too).
        for (const x of this.open) x.hinted = true;
        for (const x of this.players) this.rt.emote(x.playerId, "sad", 1200);
        // Items nobody ordered were a listening slip.
        const wanted = new Set(this.open.flatMap((x) => Object.keys(x.order.items)));
        for (const b of this.trayBy) {
          const who = this.rt.players.get(b.playerId);
          if (who && !wanted.has(b.dish)) this.rt.evidence(who, `vocab.noun.${b.dish}`, "kitchen.listen", "wrong");
        }
        this.clearTray();
      }
    }
    this.rt.refreshViews();
    this.rt.bump();
  }

  private serve(t: Ticket) {
    const now = gameNow();
    t.done = "served";
    t.doneAt = now;
    this.served++;
    const items = Object.values(t.order.items).reduce((a, b) => a + b, 0);
    t.points = this.inPractice ? 0 : orderPoints(items, (t.deadline - now) / (t.deadline - t.arrived), this.rush);
    this.score += t.points;
    if (this.inPractice) {
      this.served--;
      play("cash");
      this.rt.say(SAY.served);
      setTimeout(() => this.rt.activity === this && this.endPractice(gameNow()), 1600);
      this.clearTray();
      return;
    }
    for (const id of Object.keys(t.order.items)) this.words.add(id);
    this.flash = { kind: "served", seq: ++this.flashSeq, at: now };
    // The puppy sniffs every plate that goes out.
    this.rt.petDo("sniff", 2200, this.served === 3 ? PET.hungry : undefined, 0.7);
    if (this.firstServe) {
      this.firstServe = false;
      this.rt.say(SAY.served);
    }
    for (const b of this.trayBy) {
      const who = this.rt.players.get(b.playerId);
      if (who) this.rt.evidence(who, `vocab.noun.${b.dish}`, "kitchen.listen", "correct");
      this.contrib.set(b.playerId, (this.contrib.get(b.playerId) ?? 0) + 1);
    }
    for (const p of this.players) {
      this.rt.addScore(p, 100, "kitchen");
      this.rt.emote(p.playerId, "cheer", 1800);
    }
    play("cash");
    this.clearTray();
    // A served table frees a spot soon.
    this.nextArrival = Math.min(this.nextArrival, now + 2500);
  }

  private clearTray() {
    this.tray.clear();
    this.trayBy = [];
  }

  private finish() {
    if (this.phase === "end") return;
    this.phase = "end";
    setHurry(false);
    play("whistle");
    const closedEarly = this.hearts <= 0;
    this.rt.bump();
    this.onDone({
      failed: closedEarly,
      score: this.score,
      max: TARGETS[this.level],
      headline: `${this.score} pontos · ${this.served} pedidos`,
      headlineEn: `${this.score} points · ${this.served} orders served`,
      sub: closedEarly
        ? `${this.menu.name} · A cozinha fechou: clientes a mais foram-se embora!`
        : `${this.menu.name} · ${this.missed === 0 ? "Nenhum cliente se foi embora!" : this.missed === 1 ? "1 cliente foi-se embora" : `${this.missed} clientes foram-se embora`}`,
      subEn: closedEarly ? "The kitchen closed: too many customers left!" : this.missed === 1 ? "1 customer left" : `${this.missed} customers left`,
      words: [...this.words].map((id) => ({ pt: DISHES[id]!.sing, pic: DISHES[id]!.pic })),
      contrib: Object.fromEntries(this.contrib),
      highlight: this.served ? { pt: `${this.served} pedidos servidos na cozinha!`, en: `${this.served} orders served`, pic: "🧑‍🍳" } : undefined,
    });
  }

  trayList(): { dish: Dish; n: number }[] {
    return [...this.tray].map(([id, n]) => ({ dish: DISHES[id]!, n }));
  }

  /** "dois pães" etc. for a ticket line; a "sem" order shows the extra crossed out (n = 0). */
  lines(o: Order): { dish: Dish; n: number; text: string }[] {
    const out = Object.entries(o.items).map(([id, n]) => ({ dish: DISHES[id]!, n, text: amount(DISHES[id]!, n) }));
    if (o.without) out.push({ dish: DISHES[o.without]!, n: 0, text: `sem ${DISHES[o.without]!.sing}` });
    return out;
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Cozinha Caótica precisa de 2", subtitle: "Chama o teu par para jogar!", pic: "🍳" };
    if (this.phase === "end") return { mode: "wait", title: "A cozinha fechou!", subtitle: `${this.score} pontos · ${this.served} pedidos`, pic: "🍽️" };
    const target = this.open[0];
    const need = new Map<string, number>();
    if (target) for (const [id, n] of Object.entries(target.order.items)) need.set(id, n - (this.tray.get(id) ?? 0));
    const mine = this.pantries.get(p.playerId) ?? [];
    return {
      mode: "kitchen",
      roundId: this.roundId,
      promptId: this.promptId,
      pantry: mine.map((id) => ({ id, pt: DISHES[id]!.sing, pic: DISHES[id]!.pic })),
      tables: this.rules.tables ? this.open.map((t) => t.table).sort() : undefined,
      replay: this.rules.show !== "text" ? this.open.map((t) => t.table).sort() : undefined,
      tray: this.trayList().map(({ dish, n }) => ({ pt: amount(dish, n), pic: dish.pic, n })),
      msLeft: this.msLeft,
      served: this.served,
      score: this.score,
      hearts: this.hearts,
      rush: this.rush || undefined,
      swapped: this.swapped || undefined,
      practice: this.inPractice || undefined,
      debugAnswer: this.rt.testMode
        ? {
            add: mine.filter((id) => (need.get(id) ?? 0) > 0),
            wrongTray: [...this.tray.keys()].some((id) => (need.get(id) ?? 0) < 0 || !need.has(id)),
            serve: !!target && trayMatches(this.tray, target.order),
            table: target?.table,
          }
        : undefined,
    };
  }
}
