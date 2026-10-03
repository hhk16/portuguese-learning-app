import { describe, expect, it } from "vitest";
import { REFERENCE } from "../src/games/stop/reference.ts";
import { GLOSS, NOT_FOR_SUGGESTIONS } from "../src/games/stop/reference-gloss.ts";

const allWords = new Set(Object.values(REFERENCE).flat());

describe("Stop! reference glosses", () => {
  it("has a non-empty English gloss for every REFERENCE word", () => {
    const missing = [...allWords].filter((w) => !GLOSS[w]?.trim());
    expect(missing).toEqual([]);
  });

  it("only glosses REFERENCE words", () => {
    expect(Object.keys(GLOSS).filter((w) => !allWords.has(w))).toEqual([]);
  });

  it("only excludes REFERENCE words from suggestions", () => {
    expect([...NOT_FOR_SUGGESTIONS].filter((w) => !allWords.has(w))).toEqual([]);
  });

  it("keeps at least 25 suggestable words per category", () => {
    for (const [category, words] of Object.entries(REFERENCE)) {
      const suggestable = words.filter((w) => !NOT_FOR_SUGGESTIONS.has(w));
      expect(suggestable.length, category).toBeGreaterThanOrEqual(25);
    }
  });
});
