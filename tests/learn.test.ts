import { describe, expect, it } from "vitest";
import { ALL_ITEMS } from "../src/curriculum/index.ts";
import { answerOf, buildSession, cardOf, gameCards, judge, lessonCards, padCards, type LearnEx } from "../src/curriculum/learn.ts";
import { LESSONS } from "../src/curriculum/lessons.ts";
import { lintPtPt } from "../src/curriculum/pt-pt-lint.ts";
import { LearnExView } from "../src/shared/protocol.ts";
import { Rng } from "../src/shared/rng.ts";

const correctAnswer = (ex: LearnEx) => {
  switch (ex.kind) {
    case "listen":
    case "read":
    case "write":
    case "gap":
      return { t: "choice" as const, id: ex.correctId };
    case "build":
      return { t: "build" as const, words: ex.answer };
    case "pairs":
      return { t: "pairs" as const, missed: [] };
    case "speak":
      return { t: "speak" as const, transcripts: [ex.say.toUpperCase()], self: null };
    default:
      return { t: "next" as const };
  }
};

describe("Aprender (Duolingo-style lessons)", () => {
  it("every lesson has English for every card, and cards are PT-PT", () => {
    for (const l of LESSONS) {
      const cards = lessonCards(l);
      expect(cards.length, l.id).toBeGreaterThanOrEqual(4);
      for (const c of cards) {
        expect(c.en.length, c.itemId).toBeGreaterThan(0);
        expect(lintPtPt(c.pt), c.pt).toEqual([]);
      }
    }
  });

  it("every session is well-formed, fits the protocol, and its correct answers are judged correct", () => {
    for (let seed = 1; seed <= 12; seed++) {
      for (const l of LESSONS) {
        const rng = new Rng(seed);
        const session = buildSession(l, () => undefined, rng);
        expect(session.length, l.id).toBeGreaterThanOrEqual(12);
        expect(session.some((e) => e.kind === "intro"), l.id).toBe(true);
        for (const ex of session) {
          // The view sent to the phone must pass the protocol's validation.
          const { correctId: _c, answer: _a, itemId: _i, itemIds: _is, why: _w, ...view } = ex as Record<string, unknown>;
          expect(LearnExView.safeParse(view).success, `${l.id} ${JSON.stringify(ex)}`).toBe(true);
          if ("options" in ex) {
            expect(new Set(ex.options.map((o) => o.label)).size, `${l.id}: duplicate options ${JSON.stringify(ex.options)}`).toBe(ex.options.length);
            expect(ex.options.some((o) => o.id === ex.correctId)).toBe(true);
          }
          expect(judge(ex, correctAnswer(ex)).ok, `${l.id} ${ex.kind}`).toBe(true);
        }
      }
    }
  });

  it("wrong answers are wrong, and pairs grade each item", () => {
    const rng = new Rng(4);
    const s = buildSession(LESSONS[6]!, () => undefined, rng);
    const choice = s.find((e) => e.kind === "read")!;
    if (choice.kind !== "read") throw new Error();
    const wrong = choice.options.find((o) => o.id !== choice.correctId)!;
    expect(judge(choice, { t: "choice", id: wrong.id }).ok).toBe(false);
    const pairs = s.find((e) => e.kind === "pairs")!;
    if (pairs.kind !== "pairs") throw new Error();
    const r = judge(pairs, { t: "pairs", missed: [pairs.pairs[0]!.id] });
    expect(r.ok).toBe(false);
    expect(Object.values(r.perItem).filter((x) => !x).length).toBe(1);
    expect(answerOf(choice).pt.length).toBeGreaterThan(0);
  });

  it("known items turn the session into a review (no new-word cards)", () => {
    const rng = new Rng(9);
    const known = () => ({ seen: 5, correct: 4, tier: 2, weakness: 0.2 });
    const s = buildSession(LESSONS[2]!, known, rng);
    expect(s.some((e) => e.kind === "intro")).toBe(false);
    expect(s.length).toBeGreaterThan(8);
  });

  it("speech answers ignore accents and case", () => {
    const ex: LearnEx = { kind: "speak", itemId: "x.y", pt: "Até amanhã!", en: "See you tomorrow!", say: "Até amanhã!" };
    expect(judge(ex, { t: "speak", transcripts: ["ate amanha"], self: null }).ok).toBe(true);
    expect(judge(ex, { t: "speak", transcripts: ["bom dia"], self: null }).ok).toBe(false);
    expect(judge(ex, { t: "speak", transcripts: [], self: true }).ok).toBe(true);
  });

  it("games always get enough distinct cards", () => {
    for (const l of LESSONS) {
      const cards = padCards(gameCards([l]), 8);
      expect(cards.length, l.id).toBeGreaterThanOrEqual(8);
      expect(new Set(cards.map((c) => c.en)).size).toBe(cards.length);
    }
    expect(ALL_ITEMS.map(cardOf).filter(Boolean).length).toBeGreaterThan(150);
  });
});
