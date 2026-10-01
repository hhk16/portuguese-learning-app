/** The curriculum: every knowledge item, indexed by id and kind. */
import { U00_ITEMS } from "./knowledge/u00.ts";
import { U01_ITEMS } from "./knowledge/u01.ts";
import { A1_CORE_ITEMS } from "./knowledge/a1-core.ts";
import { U02_ITEMS } from "./knowledge/u02.ts";
import { U03_ITEMS } from "./knowledge/u03.ts";
import { U04_ITEMS } from "./knowledge/u04.ts";
import { U05_ITEMS } from "./knowledge/u05.ts";
import { U06_ITEMS } from "./knowledge/u06.ts";
import { U07_ITEMS } from "./knowledge/u07.ts";
import { U08_ITEMS } from "./knowledge/u08.ts";
import { LESSONS } from "./lessons.ts";
import type { ItemKind, ItemOf, KnowledgeItem } from "./schema.ts";

export const ALL_ITEMS: readonly KnowledgeItem[] = [...U00_ITEMS, ...U01_ITEMS, ...A1_CORE_ITEMS, ...U02_ITEMS, ...U03_ITEMS, ...U04_ITEMS, ...U05_ITEMS, ...U06_ITEMS, ...U07_ITEMS, ...U08_ITEMS];

const byId = new Map(ALL_ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): KnowledgeItem | undefined {
  return byId.get(id);
}

export function itemsOf<K extends ItemKind>(kind: K, pool: readonly KnowledgeItem[] = ALL_ITEMS): ItemOf<K>[] {
  return pool.filter((i): i is ItemOf<K> => i.kind === kind);
}

export { LESSONS };
