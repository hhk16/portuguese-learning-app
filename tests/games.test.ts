import { describe, expect, it } from "vitest";
import { gameCards, padCards } from "../src/curriculum/learn.ts";
import { LESSONS } from "../src/curriculum/lessons.ts";
import { cardForWord, normWord } from "../src/games/sync/sync.ts";
import { pointsFor } from "../src/games/wave/wave.ts";

describe("Na Mesma Onda scoring", () => {
  it("scores 4/3/2/0 by distance from the target", () => {
    expect(pointsFor(50, 50)).toBe(4);
    expect(pointsFor(50, 54)).toBe(4);
    expect(pointsFor(50, 41)).toBe(3);
    expect(pointsFor(50, 64)).toBe(2);
    expect(pointsFor(50, 65)).toBe(0);
    expect(pointsFor(0, 100)).toBe(0);
  });
});

describe("Em Sintonia word matching", () => {
  it("ignores case, accents, articles and punctuation", () => {
    expect(normWord("  O Café! ")).toBe("cafe");
    expect(normWord("uma MAÇÃ")).toBe("maca");
    expect(normWord("pão")).toBe(normWord("Pao"));
    expect(normWord("o pão")).not.toBe(normWord("a pá"));
  });

  it("finds the curriculum card for a typed word", () => {
    const pool = padCards(gameCards(LESSONS), 200);
    const c = cardForWord("pao", pool);
    expect(c?.pt).toMatch(/pão/);
    expect(cardForWord("xyzzy", pool)).toBeUndefined();
  });
});

import { amount, DISHES, MENUS, orderBook } from "../src/games/kitchen/menu.ts";
import { trayMatches } from "../src/games/kitchen/kitchen.ts";
import { cellPoints } from "../src/games/stop/stop.ts";
import { CATEGORIES, fairLetters, lookup, normStop, startsWith } from "../src/games/stop/dictionary.ts";
import { pointsForTime } from "../src/games/draw/draw.ts";
import { allSpokenTexts } from "../src/curriculum/spoken.ts";
import { lintPtPt } from "../src/curriculum/pt-pt-lint.ts";

describe("Cozinha Caótica orders", () => {
  it("counts in Portuguese with gender and plurals", () => {
    expect(amount(DISHES.pao!, 2)).toBe("dois pães");
    expect(amount(DISHES.agua!, 2)).toBe("duas águas");
    expect(amount(DISHES.maca!, 3)).toBe("três maçãs");
    expect(amount(DISHES.cafe!, 1)).toBe("um café");
    expect(amount(DISHES.sopa!, 1)).toBe("uma sopa");
  });

  it("every menu has a deterministic book of PT-PT orders, pre-recorded", () => {
    const spoken = new Set(allSpokenTexts());
    for (const m of MENUS) {
      const a = orderBook(m);
      expect(a.map((o) => o.text)).toEqual(orderBook(m).map((o) => o.text));
      expect(a.filter((o) => o.level === 3).length).toBeGreaterThanOrEqual(20);
      for (const o of a) {
        expect(Object.keys(o.items).every((id) => m.dishes.includes(id))).toBe(true);
        expect(lintPtPt(o.text), o.text).toEqual([]);
        expect(spoken.has(o.text), o.text).toBe(true);
        expect(o.text).not.toMatch(/dois leites|undefined/);
      }
    }
  });

  it("the tray must match an order exactly", () => {
    const o = { items: { cafe: 2, pao: 1 }, level: 2 as const, text: "" };
    expect(trayMatches(new Map([["cafe", 2], ["pao", 1]]), o)).toBe(true);
    expect(trayMatches(new Map([["cafe", 1], ["pao", 1]]), o)).toBe(false);
    expect(trayMatches(new Map([["cafe", 2], ["pao", 1], ["ovo", 1]]), o)).toBe(false);
  });
});

describe("Stop!", () => {
  it("matches words without accents or articles, per category", () => {
    expect(normStop("  O Pão ")).toBe("pao");
    expect(lookup("comida", "pao")?.pt).toBe("pão");
    expect(lookup("profissao", "Médica")?.pt).toBe("médico");
    expect(lookup("pais", "portuguesa")?.pt).toBe("Portugal");
    expect(lookup("animal", "pão")).toBeUndefined();
    expect(startsWith("Óculos", "o")).toBe(true);
  });

  it("only deals letters with known words in most categories", () => {
    const letters = fairLetters(CATEGORIES.map((c) => c.id), 4);
    expect(letters.length).toBeGreaterThanOrEqual(3);
    expect(letters).toContain("P");
  });

  it("scores 10 for a different valid word, 5 for the same, 0 for invalid", () => {
    const cell = (word: string, status: "known" | "voted-yes" | "voted-no" | "empty") => ({ word, status, points: 0 });
    expect(cellPoints(cell("pão", "known"), cell("pizza", "known"))).toBe(10);
    expect(cellPoints(cell("pão", "known"), cell("Pao", "known"))).toBe(5);
    expect(cellPoints(cell("pão", "known"), cell("pão", "voted-no"))).toBe(10);
    expect(cellPoints(cell("xyz", "voted-no"), undefined)).toBe(0);
    expect(cellPoints(cell("", "empty"), undefined)).toBe(0);
  });
});

describe("Desenha!", () => {
  it("rewards fast guesses", () => {
    expect(pointsForTime(55_000)).toBe(3);
    expect(pointsForTime(25_000)).toBe(2);
    expect(pointsForTime(1_000)).toBe(1);
    expect(pointsForTime(0)).toBe(0);
  });
});
