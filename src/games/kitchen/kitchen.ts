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
import { gameNow } from "../../tv/clock.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";
import { amount, DISHES, MENUS, orderBook, type Dish, type Menu, type Order } from "./menu.ts";

export const SHIFT_MS = 150_000;
const MAX_TICKETS = 3;
const SWAP_EVERY_MS = 45_000;
const BASE_PATIENCE = 32_000;
const PER_ITEM_PATIENCE = 9_000;

export interface Ticket {
  id: string;
  order: Order;
  arrived: number;
  deadline: number;
  /** Shown briefly after serving / leaving. */
  done?: "served" | "left";
  doneAt?: number;
}

export interface KitchenResult {
  served: number;
  missed: number;
  menu: string;
  rating: string;
}

export function ratingFor(served: number): string {
  return served >= 10 ? "Chef estrela! ⭐⭐⭐" : served >= 7 ? "Cozinha de sucesso! ⭐⭐" : served >= 4 ? "Bom serviço! ⭐" : "Amanhã há mais!";
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
  /** For TV animations. */
  flash: { kind: "served" | "wrong" | "swap"; seq: number; at: number } | null = null;
  promptId = randomId(6);
  private readonly roundId = randomId(6);
  private book: Order[] = [];
  private nextSwap = 0;
  private nextArrival = 0;
  private swapped = false;
  private flashSeq = 0;
  private readonly onDone: (r: KitchenResult) => void;

  constructor(onDone: (r: KitchenResult) => void) {
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

  start(rt: TvRuntime) {
    this.rt = rt;
    this.menu = rt.rng.pick(MENUS);
    this.book = orderBook(this.menu);
    const now = gameNow();
    this.shiftEnd = now + SHIFT_MS;
    this.nextSwap = now + SWAP_EVERY_MS;
    this.nextArrival = now + 1200;
    this.deal();
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

  /** Harder orders as you serve more. */
  private levelNow(): Order["level"] {
    return this.served < 2 ? 1 : this.served < 5 ? 2 : 3;
  }

  private arrive(now: number) {
    const lvl = this.levelNow();
    const openTexts = new Set(this.open.map((t) => t.order.text));
    const pool = this.book.filter((o) => o.level === lvl && !openTexts.has(o.text));
    const order = this.rt.rng.pick(pool.length ? pool : this.book);
    const n = Object.values(order.items).reduce((s, x) => s + x, 0);
    this.tickets.push({ id: randomId(5), order, arrived: now, deadline: now + BASE_PATIENCE + PER_ITEM_PATIENCE * (n - 1) });
    play("pop");
    this.rt.speakPt(order.text);
    this.rt.bump();
  }

  tick(now: number) {
    if (this.phase !== "shift") return;
    if (now >= this.shiftEnd) return this.finish();
    // Customers who waited too long leave.
    for (const t of this.open)
      if (now >= t.deadline) {
        t.done = "left";
        t.doneAt = now;
        this.missed++;
        play("fail-jingle", 0.5);
        for (const p of this.players) this.rt.emote(p.playerId, "sad", 1500);
        this.rt.bump();
      }
    // Clear finished tickets after their little animation.
    const before = this.tickets.length;
    this.tickets = this.tickets.filter((t) => !t.done || now - (t.doneAt ?? now) < 1400);
    if (this.tickets.length !== before) this.rt.bump();
    // Keep the counter busy: never empty, up to three at once.
    if (this.open.length === 0 || (this.open.length < MAX_TICKETS && now >= this.nextArrival)) {
      this.arrive(now);
      this.nextArrival = now + (this.levelNow() === 1 ? 14_000 : 11_000);
    }
    if (now >= this.nextSwap && this.players.length === 2) {
      this.nextSwap = now + SWAP_EVERY_MS;
      const [a, b] = this.players;
      const pa = this.pantries.get(a!.playerId) ?? [];
      this.pantries.set(a!.playerId, this.pantries.get(b!.playerId) ?? []);
      this.pantries.set(b!.playerId, pa);
      this.swapped = true;
      this.flash = { kind: "swap", seq: ++this.flashSeq, at: now };
      play("whoosh");
      this.rt.speakPt("Troca!");
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
    if (value.mode !== "kitchen" || this.phase !== "shift" || promptId !== this.promptId) return;
    const act = value.action;
    if (act.a === "add") {
      if (!(this.pantries.get(p.playerId) ?? []).includes(act.id)) return;
      if ([...this.tray.values()].reduce((s, n) => s + n, 0) >= 8) return;
      this.tray.set(act.id, (this.tray.get(act.id) ?? 0) + 1);
      this.trayBy.push({ playerId: p.playerId, dish: act.id });
      play("tap");
    } else if (act.a === "trash") {
      this.clearTray();
      play("back");
    } else if (act.a === "serve") {
      const t = this.open.find((x) => trayMatches(this.tray, x.order));
      if (t) this.serve(t);
      else if (this.tray.size) {
        this.mistakes++;
        this.flash = { kind: "wrong", seq: ++this.flashSeq, at: gameNow() };
        play("wrong");
        this.rt.speakPt("Não é isso!");
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
    this.flash = { kind: "served", seq: ++this.flashSeq, at: now };
    for (const b of this.trayBy) {
      const who = this.rt.players.get(b.playerId);
      if (who) this.rt.evidence(who, `vocab.noun.${b.dish}`, "kitchen.listen", "correct");
    }
    for (const p of this.players) {
      this.rt.addScore(p, 100, "kitchen");
      this.rt.emote(p.playerId, "cheer", 1800);
    }
    play("success-jingle", 0.6);
    this.clearTray();
    // A served table frees a spot soon.
    this.nextArrival = Math.min(this.nextArrival, now + 2500);
  }

  private clearTray() {
    this.tray.clear();
    this.trayBy = [];
  }

  private finish() {
    this.phase = "end";
    if (this.served >= 4) this.rt.celebrate();
    this.rt.bump();
    this.onDone({ served: this.served, missed: this.missed, menu: this.menu.name, rating: ratingFor(this.served) });
  }

  trayList(): { dish: Dish; n: number }[] {
    return [...this.tray].map(([id, n]) => ({ dish: DISHES[id]!, n }));
  }

  /** "dois pães" etc. for a ticket line. */
  lines(o: Order): { dish: Dish; n: number; text: string }[] {
    return Object.entries(o.items).map(([id, n]) => ({ dish: DISHES[id]!, n, text: amount(DISHES[id]!, n) }));
  }

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.players.length < 2) return { mode: "wait", title: "Cozinha Caótica precisa de 2", subtitle: "Chama o teu par para jogar!", pic: "🍳" };
    if (this.phase === "end") return { mode: "wait", title: "Fecharam a cozinha!", subtitle: `${this.served} pedidos servidos`, pic: "🍽️" };
    const target = this.open[0];
    const need = new Map<string, number>();
    if (target) for (const [id, n] of Object.entries(target.order.items)) need.set(id, n - (this.tray.get(id) ?? 0));
    const mine = this.pantries.get(p.playerId) ?? [];
    return {
      mode: "kitchen",
      roundId: this.roundId,
      promptId: this.promptId,
      pantry: mine.map((id) => ({ id, pt: DISHES[id]!.sing, pic: DISHES[id]!.pic })),
      tray: this.trayList().map(({ dish, n }) => ({ pt: amount(dish, n), pic: dish.pic, n })),
      msLeft: this.msLeft,
      served: this.served,
      swapped: this.swapped || undefined,
      debugAnswer: this.rt.testMode
        ? {
            add: mine.filter((id) => (need.get(id) ?? 0) > 0),
            wrongTray: [...this.tray.keys()].some((id) => (need.get(id) ?? 0) < 0 || !need.has(id)),
            serve: !!target && trayMatches(this.tray, target.order),
          }
        : undefined,
    };
  }
}
