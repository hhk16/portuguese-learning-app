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
