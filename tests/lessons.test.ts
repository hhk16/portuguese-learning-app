import { describe, expect, it, vi } from "vitest";
import { AULAS } from "../src/curriculum/aulas.ts";
import { ALL_ITEMS, getItem } from "../src/curriculum/index.ts";
import { choiceFromItem } from "../src/curriculum/generators.ts";
import { LESSONS } from "../src/curriculum/lessons.ts";
import { lintPtPt } from "../src/curriculum/pt-pt-lint.ts";
import { Rng } from "../src/shared/rng.ts";

describe("lessons + Mini Aula scripts", () => {
  it("every lesson has a script, real items and provenance", () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(11);
    for (const l of LESSONS) {
      const steps = AULAS[l.id];
      expect(steps?.length, `${l.id} has no Mini Aula`).toBeGreaterThan(3);
      expect(l.source.pages?.length).toBeGreaterThan(0);
      for (const id of l.itemIds) expect(getItem(id), `${l.id}: unknown item ${id}`).toBeDefined();
      expect(steps!.some((s) => s.kind === "check"), `${l.id}: no quick check`).toBe(true);
    }
  });

  it("quick checks generate a choice prompt from an item of the lesson", () => {
    const rng = new Rng(3);
    for (const l of LESSONS)
      for (const s of AULAS[l.id]!)
        if (s.kind === "check") {
          expect(l.itemIds, `${l.id}: check item ${s.itemId} is not a lesson item`).toContain(s.itemId);
          expect(choiceFromItem(getItem(s.itemId)!, rng, ALL_ITEMS), s.itemId).toBeTruthy();
        }
  });

  it("lesson text is European Portuguese", () => {
    for (const [id, steps] of Object.entries(AULAS))
      for (const s of steps) {
        const text = JSON.stringify(s);
        expect(lintPtPt(text), `${id}: ${text}`).toEqual([]);
      }
  });
});

describe("pausable game clock", () => {
  it("stands still while paused and resumes without a jump", async () => {
    let t = 1000;
    vi.spyOn(performance, "now").mockImplementation(() => t);
    const { gameNow, pauseClock, resumeClock, clockPaused } = await import("../src/tv/clock.ts");
    const a = gameNow();
    pauseClock();
    t += 5000;
    expect(clockPaused()).toBe(true);
    expect(gameNow()).toBe(a);
    expect(resumeClock()).toBe(5000);
    t += 100;
    expect(gameNow()).toBe(a + 100);
    vi.restoreAllMocks();
  });
});
