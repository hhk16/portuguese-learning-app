import { describe, expect, it } from "vitest";
import { holderTyped } from "../src/games/bomb/bomb.ts";
import { answerOk, remixPlan } from "../src/games/final/final.ts";
import { LIST_AFTER_MS } from "../src/games/sync/sync.ts";
import { REGULAR, VERB_PICS, verbTable } from "../src/games/verbs/verbs.ts";

describe("Quem faz o quê? cards", () => {
  it("has easy (regular) and risky (irregular) verbs to offer on every level", () => {
    const verbs = [...verbTable().keys()].filter((v) => !VERB_PICS[v]!.hard);
    expect(verbs.filter((v) => REGULAR.has(v)).length).toBeGreaterThanOrEqual(5);
    expect(verbs.filter((v) => !REGULAR.has(v)).length).toBeGreaterThanOrEqual(5);
  });
});

describe("Batata Quente holder types on Médio", () => {
  it("from the third potato, for see / number / opposite only", () => {
    expect(holderTyped(1, 4, "see")).toBe(false);
    expect(holderTyped(2, 1, "see")).toBe(false);
    expect(holderTyped(2, 2, "number")).toBe(true);
    expect(holderTyped(2, 3, "hear")).toBe(false);
    expect(holderTyped(3, 2, "opposite")).toBe(true);
  });
});

describe("Grande Final new kinds", () => {
  const word = { itemId: "vocab.noun.x", pt: "x", en: "x", say: "x" } as never;
  it("numbers must be written exactly (accents forgiven)", () => {
    const q = { kind: "number", word, options: [], num: { value: 23, pt: "vinte e três", itemId: "n" } } as never;
    expect(answerOk(q, "vinte e três")).toBe(true);
    expect(answerOk(q, "vinte e tres")).toBe(true);
    expect(answerOk(q, "vinte e dois")).toBe(false);
  });
  it("a link accepts any word that fits both pictures", () => {
    const q = { kind: "link", word, options: [], link: { a: word, b: word, answers: ["frio", "branco"], example: "frio" } } as never;
    expect(answerOk(q, "branco")).toBe(true);
    expect(answerOk(q, "Frio")).toBe(true);
    expect(answerOk(q, "quente")).toBe(false);
  });
  it("Sync and Secret bring their own kinds", () => {
    const kinds = remixPlan(["sync", "secret", "wave"]).map((q) => q.kind);
    expect(new Set(kinds.slice(0, 9))).toEqual(new Set(["link", "fits", "opposite"]));
  });
  it("Sync Médio list waits", () => expect(LIST_AFTER_MS).toBeGreaterThanOrEqual(10_000));
});
