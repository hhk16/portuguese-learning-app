import { describe, expect, it } from "vitest";
import { gameCards, padCards } from "../src/curriculum/learn.ts";
import { LESSONS } from "../src/curriculum/lessons.ts";
import { cardForWord, normWord } from "../src/games/sync/sync.ts";
import { betPoints, dialSpectra, LEVEL_RULES as WAVE_LEVELS, pointsFor } from "../src/games/wave/wave.ts";
import { intensifiers, spectra, waveSpoken } from "../src/games/wave/scale.ts";

describe("Na Mesma Onda scoring", () => {
  it("scores 4/3/2/0 by distance from the target (easy bands ±5/10/15)", () => {
    expect(pointsFor(50, 50)).toBe(4);
    expect(pointsFor(50, 55)).toBe(4);
    expect(pointsFor(50, 41)).toBe(3);
    expect(pointsFor(50, 64)).toBe(2);
    expect(pointsFor(50, 66)).toBe(0);
    expect(pointsFor(0, 100)).toBe(0);
  });

  it("gets stricter on harder levels", () => {
    expect(pointsFor(50, 55, WAVE_LEVELS[1].bands)).toBe(4);
    expect(pointsFor(50, 55, WAVE_LEVELS[3].bands)).toBe(3);
    expect(pointsFor(50, 62, WAVE_LEVELS[3].bands)).toBe(0);
  });

  it("the sure bet doubles a bullseye and zeroes anything else", () => {
    expect(betPoints(4, true)).toBe(8);
    expect(betPoints(3, true)).toBe(0);
    expect(betPoints(3, false)).toBe(3);
  });

  it("has seven intensifier clues per spectrum, in order along the dial", () => {
    const s = spectra()[0]!;
    const c = intensifiers(s.left, s.right);
    expect(c).toHaveLength(7);
    expect(c[0]!.pt).toBe(`muito ${s.left.m}`);
    expect(c[3]!.pt).toBe(`nem ${s.left.m} nem ${s.right.m}`);
    expect(c.map((x) => x.at)).toEqual([...c.map((x) => x.at!)].sort((a, b) => a - b));
    expect(new Set(waveSpoken()).size).toBe(spectra().length * 7);
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
import { guessMatches, hintPattern, pointsForTime } from "../src/games/draw/draw.ts";
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

  it("accepts typed or spoken guesses without article/accents, one typo on long words", () => {
    expect(guessMatches("gato", "o gato")).toBe("yes");
    expect(guessMatches("O GATO!", "o gato")).toBe("yes");
    expect(guessMatches("é um gato", "o gato")).toBe("yes");
    expect(guessMatches("pao", "o pão")).toBe("yes");
    expect(guessMatches("bicicleto", "a bicicleta")).toBe("typo");
    expect(guessMatches("gata", "o gato")).toBe("no");
    expect(guessMatches("", "o gato")).toBe("no");
  });

  it("builds letter hints", () => {
    expect(hintPattern("o gato", "first-letter")).toBe("g _ _ _");
    expect(hintPattern("a maçã", "length")).toBe("_ _ _ _");
    expect(hintPattern("o gato", "none")).toBeUndefined();
  });
});

import { finalPoints } from "../src/games/final/final.ts";
import { THINGS } from "../src/games/wave/things.ts";
import { LINKS } from "../src/games/sync/links.ts";
import { REFERENCE } from "../src/games/stop/reference.ts";
import { getItem } from "../src/curriculum/index.ts";
import { hostSpoken, NAMED, VARIANTS } from "../src/tv/host-lines.ts";

describe("Grande Final", () => {
  it("pays 3 to the first right answer, 1 after, double on the last question", () => {
    expect(finalPoints(true, false)).toBe(3);
    expect(finalPoints(false, false)).toBe(1);
    expect(finalPoints(true, true)).toBe(6);
  });
});

describe("Word data", () => {
  it("the dial has plenty of spectra, each with things spread over the whole dial", () => {
    expect(dialSpectra().length).toBeGreaterThanOrEqual(8);
    for (const s of dialSpectra()) {
      const key = `${s.left.id.split(".").pop()}|${s.right.id.split(".").pop()}`;
      const things = THINGS[key];
      expect(things, key).toBeDefined();
      for (const k of [0, 1, 2]) expect(things!.filter((t) => Math.min(2, Math.floor(t.at / 33.4)) === k).length, `${key} third ${k}`).toBeGreaterThanOrEqual(3);
      for (const t of things!) expect(getItem(`vocab.noun.${t.noun}`), t.noun).toBeDefined();
    }
  });

  it("link words have real members and no duplicates", () => {
    expect(new Set(LINKS.map((l) => l.pt)).size).toBe(LINKS.length);
    for (const l of LINKS) {
      expect(l.members.length, l.pt).toBeGreaterThanOrEqual(2);
      for (const m of l.members) expect(getItem(m.startsWith("prof:") ? `vocab.profession.${m.slice(5)}` : `vocab.noun.${m}`), `${l.pt}: ${m}`).toBeDefined();
    }
  });

  it("Stop suggestions have plenty of words per category", () => {
    for (const [cat, words] of Object.entries(REFERENCE)) expect(words.length, cat).toBeGreaterThanOrEqual(60);
  });
});

describe("Host lines", () => {
  it("pre-records every variant and every named line for the couple", () => {
    const spoken = new Set(hostSpoken());
    for (const ls of Object.values(VARIANTS)) for (const l of ls!) expect(spoken.has(l.pt)).toBe(true);
    for (const l of Object.values(NAMED)) for (const n of ["Hadi", "Ana"]) expect(spoken.has(l.pt.replace("{name}", n))).toBe(true);
  });
});

import { kindAt } from "../src/games/final/final.ts";

describe("Grande Final shape", () => {
  it("goes see → hear → sentences → one last see", () => {
    expect([...Array(10).keys()].map(kindAt)).toEqual(["see", "see", "see", "see", "hear", "hear", "hear", "frase", "frase", "see"]);
  });
});
