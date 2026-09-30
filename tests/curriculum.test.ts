import { describe, expect, it } from "vitest";
import { ALL_ITEMS } from "../src/curriculum/index.ts";
import { FORMAT_KINDS, generate, mergeForm, spellTiles, type PromptFormat } from "../src/curriculum/generators.ts";
import { KnowledgeItem } from "../src/curriculum/schema.ts";
import { lintPtPt } from "../src/curriculum/pt-pt-lint.ts";
import { Rng } from "../src/shared/rng.ts";

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

  it("every format can be generated from its item kinds, with a correct answer that is on offer", () => {
    const rng = new Rng(42);
    for (const format of Object.keys(FORMAT_KINDS) as PromptFormat[]) {
      const items = ALL_ITEMS.filter((i) => FORMAT_KINDS[format].includes(i.kind));
      let produced = 0;
      for (const item of items) {
        const p = generate(format, item, rng, ALL_ITEMS);
        if (!p) continue;
        produced++;
        if (p.format === "choice") {
          expect(p.options.some((o) => o.id === p.correctId)).toBe(true);
          expect(new Set(p.options.map((o) => o.label)).size).toBe(p.options.length);
        }
        if (p.format === "tiles") expect(spellTiles(p, p.correctSeq)).toBe(p.answerText);
        if (p.format === "merge") expect(mergeForm(p.correct.top, p.correct.bottom)).toBe(p.answerText);
        if (p.format === "errorTap") expect(p.words.some((w) => w.id === p.wrongId)).toBe(true);
        if (p.format === "stream") expect(p.words.some((w) => w.isTarget)).toBe(true);
      }
      expect(produced, format).toBeGreaterThan(3);
    }
  });
});
