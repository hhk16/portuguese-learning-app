import { describe, expect, it } from "vitest";
import { kindsFor, stealTyped } from "../src/games/bomb/bomb.ts";
import { dishWord } from "../src/games/kitchen/kitchen.ts";
import { DISHES } from "../src/games/kitchen/menu.ts";

describe("round 10", () => {
  it("the typed Aquece! starts on the second potato on Médio (see, number, opposite)", () => {
    const readable = (round: number) => kindsFor(round).filter((k) => k === "see" || k === "number" || k === "opposite");
    expect(readable(1).some((k) => stealTyped(2, 1, k))).toBe(true);
    expect(readable(2).some((k) => stealTyped(2, 2, k))).toBe(true);
    expect(stealTyped(2, 0, "see")).toBe(false);
    expect(stealTyped(1, 3, "opposite")).toBe(false);
    expect(stealTyped(3, 2, "number")).toBe(true);
  });

  it("every dish in the recap has its article and its English", () => {
    for (const id of Object.keys(DISHES)) {
      const w = dishWord(id);
      expect(w.pt, id).toMatch(/^(o|a) /);
      expect(w.en, id).toBeTruthy();
    }
  });
});
