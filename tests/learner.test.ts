import { describe, expect, it } from "vitest";
import { applyEvidence, applyToProfile, newProfile } from "../src/learner/model.ts";
import type { EvidenceEvent } from "../src/learner/events.ts";
import { matchAnswer, matchSpeech } from "../src/shared/answer-check.ts";

const ev = (o: Partial<EvidenceEvent>): EvidenceEvent => ({ profileId: "p", itemId: "grammar.ter.eles", context: "micro.escolhe", tier: 1, outcome: "correct", at: 1, ...o });

describe("learner model", () => {
  it("promotes a tier only after correct answers in two distinct contexts", () => {
    let s = applyEvidence(undefined, ev({}));
    s = applyEvidence(s, ev({ at: 2 }));
    s = applyEvidence(s, ev({ at: 3 }));
    expect(s.tier).toBe(1); // same context three times: no promotion
    s = applyEvidence(s, ev({ context: "race.choice", at: 4 }));
    expect(s.tier).toBe(2);
    expect(s.contextsAtTier).toEqual([]);
  });

  it("lower-tier evidence does not count toward promotion", () => {
    let s = applyEvidence(undefined, ev({}));
    s = applyEvidence(s, ev({ context: "race.choice" }));
    expect(s.tier).toBe(2);
    s = applyEvidence(s, ev({ context: "micro.escolhe", tier: 1 }));
    s = applyEvidence(s, ev({ context: "race.choice", tier: 1 }));
    expect(s.tier).toBe(2);
  });

  it("two misses in a row drop a tier and raise weakness", () => {
    let s = applyEvidence(undefined, ev({}));
    s = applyEvidence(s, ev({ context: "race.choice" }));
    s = applyEvidence(s, ev({ outcome: "wrong", tier: 2 }));
    s = applyEvidence(s, ev({ outcome: "wrong", tier: 2 }));
    expect(s.tier).toBe(1);
    expect(s.weakness).toBeGreaterThan(0.5);
  });

  it("ignores other profiles' evidence", () => {
    const p = applyToProfile(newProfile("p", "Hadi"), [ev({}), ev({ profileId: "q" })]);
    expect(p.items["grammar.ter.eles"]!.seen).toBe(1);
  });
});

describe("answer check", () => {
  it("treats accents as meaningful", () => {
    expect(matchAnswer("têm", "têm")).toBe("correct");
    expect(matchAnswer("tem", "têm")).toBe("accent-slip");
    expect(matchAnswer("  Somos! ", "somos")).toBe("correct");
    expect(matchAnswer("trabalhamo", "trabalhamos")).toBe("close");
    expect(matchAnswer("sou", "somos")).toBe("wrong");
  });
  it("speech is lenient on accents but distinguishes minimal pairs", () => {
    expect(matchSpeech(["Três"], "três", "treze")).toBe("match");
    expect(matchSpeech(["treze"], "três", "treze")).toBe("contrast");
    expect(matchSpeech(["eu disse tres"], "três")).toBe("match");
    expect(matchSpeech(["banana"], "três")).toBe("unclear");
  });
});
