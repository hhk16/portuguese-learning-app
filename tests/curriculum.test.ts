import { describe, expect, it } from "vitest";
import { ALL_ITEMS, getItem } from "../src/curriculum/index.ts";
import { cardOf, lessonCards } from "../src/curriculum/learn.ts";
import { LESSONS } from "../src/curriculum/lessons.ts";
import { KnowledgeItem } from "../src/curriculum/schema.ts";
import { lintPtPt } from "../src/curriculum/pt-pt-lint.ts";

describe("curriculum content", () => {
  it("every item is schema-valid with provenance and a unique id", () => {
    const ids = new Set<string>();
    for (const item of ALL_ITEMS) {
      const r = KnowledgeItem.safeParse(item);
      expect(r.success, `${item.id}: ${r.success ? "" : JSON.stringify(r.error.issues)}`).toBe(true);
      expect(ids.has(item.id), `duplicate ${item.id}`).toBe(false);
      ids.add(item.id);
      expect(item.source.concept.length).toBeGreaterThan(1);
    }
  });

  it("contains no Brazilian forms", () => {
    for (const item of ALL_ITEMS) expect(lintPtPt(JSON.stringify(item)), item.id).toEqual([]);
  });

  it("every lesson points at real items and has enough cards to teach", () => {
    for (const l of LESSONS) {
      for (const id of l.itemIds) expect(getItem(id), `${l.id}: unknown item ${id}`).toBeDefined();
      expect(lessonCards(l).length, l.id).toBeGreaterThanOrEqual(4);
      expect(lintPtPt(l.title), l.id).toEqual([]);
    }
  });

  it("the A1 core nouns carry an article and a picture, and adjectives come in opposite pairs", () => {
    const nouns = ALL_ITEMS.filter((i) => i.kind === "noun");
    expect(nouns.length).toBeGreaterThanOrEqual(60);
    for (const n of nouns) {
      const c = cardOf(n)!;
      expect(c.pt, n.id).toMatch(/^(o|a) /);
      expect(c.emoji, n.id).toBeTruthy();
    }
    const adjs = ALL_ITEMS.filter((i) => i.kind === "adjective");
    expect(adjs.length).toBeGreaterThanOrEqual(24);
    for (const a of adjs) {
      if (a.kind !== "adjective" || !a.opposite) continue;
      const opp = getItem(a.opposite);
      expect(opp, `${a.id} → ${a.opposite}`).toBeDefined();
      expect(opp?.kind === "adjective" && opp.opposite).toBe(a.id);
    }
  });
});
