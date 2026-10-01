/**
 * Cozinha Caótica content: three café menus and every order a customer can make from them.
 * Orders are a fixed, finite book (not generated at play time) so the audio pipeline can
 * pre-record each sentence. Pure data — no DOM, safe for scripts/audio/collect.ts.
 *
 * Grammar on show: um/uma, dois/duas, três + plurals (pão → pães, maçã → maçãs), and polite
 * café Portuguese: "Queria…, por favor", "…, se faz favor", "Para mim…".
 */
import { Rng } from "../../shared/rng.ts";

export interface Dish {
  /** Short id, also the curriculum slug (vocab.noun.<id>). */
  id: string;
  sing: string;
  plural: string;
  g: "m" | "f";
  pic: string;
  /** Uncountable at the counter ("um leite", never "dois leites"). */
  onlyOne?: boolean;
  /** An extra that only comes "com …" another dish (o açúcar, o gelo, o limão). */
  extra?: boolean;
}

const D = (id: string, sing: string, plural: string, g: "m" | "f", pic: string, onlyOne = false, extra = false): Dish => ({ id, sing, plural, g, pic, onlyOne, extra });

export const DISHES: Record<string, Dish> = Object.fromEntries(
  [
    D("cafe", "café", "cafés", "m", "☕"),
    D("leite", "leite", "leites", "m", "🥛", true),
    D("pao", "pão", "pães", "m", "🍞"),
    D("queijo", "queijo", "queijos", "m", "🧀"),
    D("ovo", "ovo", "ovos", "m", "🥚"),
    D("croissant", "croissant", "croissants", "m", "🥐"),
    D("laranja", "laranja", "laranjas", "f", "🍊"),
    D("banana", "banana", "bananas", "f", "🍌"),
    D("sopa", "sopa", "sopas", "f", "🍲"),
    D("salada", "salada", "saladas", "f", "🥗"),
    D("pizza", "pizza", "pizzas", "f", "🍕"),
    D("agua", "água", "águas", "f", "💧"),
    D("vinho", "vinho", "vinhos", "m", "🍷"),
    D("cerveja", "cerveja", "cervejas", "f", "🍺"),
    D("tomate", "tomate", "tomates", "m", "🍅"),
    D("bolo", "bolo", "bolos", "m", "🎂"),
    D("gelado", "gelado", "gelados", "m", "🍦"),
    D("chocolate", "chocolate", "chocolates", "m", "🍫"),
    D("maca", "maçã", "maçãs", "f", "🍎"),
    D("morango", "morango", "morangos", "m", "🍓"),
    D("acucar", "açúcar", "açúcar", "m", "🍬", true, true),
    D("gelo", "gelo", "gelo", "m", "🧊", true, true),
    D("limao", "limão", "limões", "m", "🍋", true, true),
  ].map((d) => [d.id, d]),
);

export interface Menu {
  id: string;
  name: string;
  pic: string;
  dishes: string[];
}

export const MENUS: Menu[] = [
  { id: "manha", name: "Pequeno-almoço", pic: "🥐", dishes: ["cafe", "leite", "pao", "queijo", "ovo", "croissant", "laranja", "banana", "acucar"] },
  { id: "almoco", name: "Almoço", pic: "🍲", dishes: ["sopa", "salada", "pizza", "pao", "tomate", "agua", "vinho", "cerveja", "gelo", "limao"] },
  { id: "lanche", name: "Lanche", pic: "🎂", dishes: ["bolo", "gelado", "chocolate", "maca", "morango", "cafe", "agua", "leite", "acucar"] },
];

/** Which dishes an extra goes with ("um café com açúcar", "uma água com gelo"). */
const EXTRA_FOR: Record<string, string[]> = { acucar: ["cafe", "leite"], gelo: ["agua", "cerveja"], limao: ["agua"] };

export interface Order {
  /** dish id → quantity */
  items: Record<string, number>;
  /** 1 = one thing, 2 = two things, 3 = a proper order, 4 = "com / sem" (with or without an extra). */
  level: 1 | 2 | 3 | 4;
  text: string;
  /** "sem açúcar": the extra the customer does NOT want (a listening trap). */
  without?: string;
  /** "com gelo": the extra is part of the dish. */
  with?: string;
}

const NUM: Record<number, [string, string]> = { 1: ["um", "uma"], 2: ["dois", "duas"], 3: ["três", "três"] };

/** "dois pães", "uma água". */
export function amount(d: Dish, n: number): string {
  return `${NUM[n]![d.g === "m" ? 0 : 1]} ${n === 1 ? d.sing : d.plural}`;
}

function list(parts: string[]): string {
  return parts.length === 1 ? parts[0]! : `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
}

const TEMPLATES = [(x: string) => `Queria ${x}, por favor.`, (x: string) => `${x[0]!.toUpperCase()}${x.slice(1)}, se faz favor.`, (x: string) => `Para mim, ${x}.`];

function orderText(items: Record<string, number>, k: number): string {
  const x = list(Object.entries(items).map(([id, n]) => amount(DISHES[id]!, n)));
  return TEMPLATES[k % TEMPLATES.length]!(x);
}

/** Every order for a menu, deterministic (same book on every device and in the audio pipeline). */
export function orderBook(menu: Menu): Order[] {
  // Extras only appear in "com / sem" orders, after everything else (so the other orders never change).
  const plain = menu.dishes.filter((id) => !DISHES[id]!.extra);
  const rng = new Rng(menu.id.length * 7919 + plain.length);
  const out: Order[] = [];
  const add = (items: Record<string, number>, level: Order["level"]) => out.push({ items, level, text: orderText(items, out.length) });
  const ds = plain.map((id) => DISHES[id]!);
  for (const d of ds) add({ [d.id]: 1 }, 1);
  for (const d of ds) if (!d.onlyOne) add({ [d.id]: 2 }, 2);
  for (let i = 0; i < ds.length; i++) for (let j = i + 1; j < ds.length; j++) add({ [ds[i]!.id]: 1, [ds[j]!.id]: 1 }, 2);
  // Level 3: 2–3 different things, some with quantities — a fixed sample per menu.
  const seen = new Set(out.map((o) => JSON.stringify(o.items)));
  let guard = 0;
  while (out.filter((o) => o.level === 3).length < 24 && guard++ < 500) {
    const pick = rng.sample(ds, 2 + rng.int(2));
    const items: Record<string, number> = {};
    for (const d of pick) items[d.id] = d.onlyOne ? 1 : rng.pick([1, 1, 2, 3]);
    const key = JSON.stringify(Object.fromEntries(Object.entries(items).sort()));
    if (seen.has(key)) continue;
    seen.add(key);
    add(items, 3);
  }
  // Level 4: "com / sem" — "Queria um café sem açúcar, por favor." means: no sugar on the tray.
  for (const x of menu.dishes.filter((id) => DISHES[id]!.extra)) {
    const extra = DISHES[x]!;
    for (const base of (EXTRA_FOR[x] ?? []).filter((id) => plain.includes(id))) {
      const b = DISHES[base]!;
      const other = ds.find((d) => d.id !== base && !EXTRA_FOR[x]?.includes(d.id) && !d.onlyOne)!;
      const k = out.length;
      const one = `${NUM[1]![b.g === "m" ? 0 : 1]} ${b.sing}`;
      const tpl = (s: string) => TEMPLATES[k % 2]!(s);
      out.push({ items: { [base]: 1, [x]: 1 }, level: 4, with: x, text: tpl(`${one} com ${extra.sing}`) });
      out.push({ items: { [base]: 1 }, level: 4, without: x, text: tpl(`${one} sem ${extra.sing}`) });
      out.push({ items: { [base]: 1, [x]: 1, [other.id]: 2 }, level: 4, with: x, text: tpl(`${one} com ${extra.sing} e ${amount(other, 2)}`) });
      out.push({ items: { [base]: 1, [other.id]: 1 }, level: 4, without: x, text: tpl(`${one} sem ${extra.sing} e ${amount(other, 1)}`) });
    }
  }
  return out;
}

/** Every sentence the kitchen can say (for the audio pipeline). */
export function kitchenSpoken(): string[] {
  return [...MENUS.flatMap((m) => orderBook(m).map((o) => o.text)), "Troca!", "Não é isso!", ...TABLE_SAY.slice(1), "Mesa errada!"];
}

/** How the TV announces a table ("Mesa dois."), index = table number. */
export const TABLE_SAY = ["", "Mesa um.", "Mesa dois.", "Mesa três."];
