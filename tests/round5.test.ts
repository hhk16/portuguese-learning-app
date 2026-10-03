import { describe, expect, it } from "vitest";
import { inReference, otherCategory } from "../src/games/stop/dictionary.ts";
import { notPortuguese } from "../src/games/stop/stop.ts";
import { BULLSEYE, LEVEL_RULES, NaMesmaOnda, ROUNDS, SIDE_BET, SIGNAL_BONUS } from "../src/games/wave/wave.ts";
import { hostSpoken, PET, PET_NAMES } from "../src/tv/host-lines.ts";

describe("Stop! category check", () => {
  it("rejects a known word from another strict category", () => {
    expect(otherCategory("pais", "bola")).toBe("coisa");
    expect(otherCategory("animal", "laranja")).toBe("comida");
  });
  it("leaves unknown words and broad categories to the partner's vote", () => {
    expect(otherCategory("pais", "tola")).toBeUndefined();
    expect(otherCategory("coisa", "laranja")).toBeUndefined();
    expect(otherCategory("comida", "bolacha")).toBeUndefined();
  });
  it("knows common words of a category", () => {
    expect(inReference("comida", "tremoço")).toBe(true);
    expect(inReference("comida", "bola")).toBe(false);
  });
});

describe("Stop! veto", () => {
  it("rejects strings that can't be Portuguese, keeps real-looking words for the vote", () => {
    expect(notPortuguese("bxyz")).toBe(true);
    expect(notPortuguese("trmp")).toBe(true);
    expect(notPortuguese("fola")).toBe(false);
    expect(notPortuguese("kiwi")).toBe(false);
  });
});

describe("Na Mesma Onda signals", () => {
  it("every level starts with signals and the max counts the bonus", () => {
    for (const l of [1, 2, 3] as const) {
      expect(LEVEL_RULES[l].signals).toBeGreaterThanOrEqual(2);
      const g = new NaMesmaOnda(() => {});
      g.level = l;
      // A bullseye on every dial (the last doubled), every signal kept, one side bet.
      expect(g.maxScore).toBe(BULLSEYE * (ROUNDS + 1) + SIGNAL_BONUS * LEVEL_RULES[l].signals + SIDE_BET);
    }
  });
});

describe("Puppy lines", () => {
  it("are pre-recorded for every suggested name", () => {
    const spoken = new Set(hostSpoken());
    for (const n of PET_NAMES) for (const l of Object.values(PET)) expect(spoken.has(l.pt.replace("{name}", n))).toBe(true);
  });
});

describe("Stars after a good Na Mesma Onda", () => {
  it("four bullseyes still on air is at least two stars by score alone on Médio", async () => {
    const { starsFor } = await import("../src/tv/activities.ts");
    const g = new NaMesmaOnda(() => {});
    g.level = 2;
    // 4 bullseyes (one of them the doubled last dial) + 2 signals kept.
    expect(starsFor(4 * BULLSEYE + BULLSEYE + 2 * SIGNAL_BONUS, g.maxScore)).toBeGreaterThanOrEqual(2);
  });
});
