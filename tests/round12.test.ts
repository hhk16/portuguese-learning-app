import { describe, expect, it } from "vitest";
import { judgeForm, personsOf, VERB_PICS, verbTable } from "../src/games/verbs/verbs.ts";

describe("Quem faz o quê?", () => {
  const t = verbTable();
  it("has a full present-tense row for most pictured verbs", () => {
    expect(t.size).toBeGreaterThanOrEqual(18);
    for (const v of t.keys()) expect(VERB_PICS[v]).toBeTruthy();
  });
  it("judges the written form (pronoun optional, accent slip flagged)", () => {
    expect(judgeForm("comemos", "comemos")).toEqual({ ok: true, accent: false });
    expect(judgeForm("nós comemos", "comemos").ok).toBe(true);
    expect(judgeForm("comem", "comemos").ok).toBe(false);
  });
  it("reads who a written form is about", () => {
    const row = t.get("comer")!;
    expect(personsOf("comemos", row)).toEqual(["nos"]);
    expect(personsOf("comem", row)).toEqual(["eles"]);
    expect(personsOf("xyz", row)).toEqual([]);
  });
});

import { QUESTIONS, remixPlan } from "../src/games/final/final.ts";
describe("Grande Final remix", () => {
  it("draws three questions from each of tonight's games, then a double 'see'", () => {
    const plan = remixPlan(["stop", "kitchen", "verbs"]);
    expect(plan).toHaveLength(QUESTIONS);
    expect(plan.slice(0, 3).every((q) => q.kind === "stop" && q.remix === "Stop!")).toBe(true);
    expect(plan.slice(3, 6).every((q) => q.kind === "frase")).toBe(true);
    expect(plan.slice(6, 9).every((q) => q.kind === "verbs")).toBe(true);
    expect(plan[9]!.kind).toBe("see");
    // Mostly written: at least 6 of 10 questions ask you to produce the word.
    const written = remixPlan(["bomb", "verbs", "secret"]).filter((q) => ["stop", "verbs", "opposite", "number", "link", "see"].includes(q.kind));
    expect(written.length).toBeGreaterThanOrEqual(6);
    // Each game asks its own kind of question: no kind repeats across games.
    expect(remixPlan(["bomb", "sync", "secret"]).map((q) => q.kind).slice(0, 9)).toEqual(["number", "number", "number", "link", "link", "link", "fits", "fits", "fits"]);
    expect(remixPlan(["wave", "bomb", "draw"]).filter((q) => q.kind === "opposite")).toHaveLength(3);
  });
});
