import { describe, expect, it } from "vitest";
import { inReference, otherCategory } from "../src/games/stop/dictionary.ts";
import { LEVEL_RULES, NaMesmaOnda, SIGNAL_BONUS } from "../src/games/wave/wave.ts";
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

describe("Na Mesma Onda signals", () => {
  it("every level starts with signals and the max counts the bonus", () => {
    for (const l of [1, 2, 3] as const) {
      expect(LEVEL_RULES[l].signals).toBeGreaterThanOrEqual(2);
      const g = new NaMesmaOnda(() => {});
      g.level = l;
      expect(g.maxScore).toBe(40 + SIGNAL_BONUS * LEVEL_RULES[l].signals);
    }
  });
});

describe("Puppy lines", () => {
  it("are pre-recorded for every suggested name", () => {
    const spoken = new Set(hostSpoken());
    for (const n of PET_NAMES) for (const l of Object.values(PET)) expect(spoken.has(l.pt.replace("{name}", n))).toBe(true);
  });
});
