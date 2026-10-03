import { describe, expect, it, vi } from "vitest";
import { AULAS } from "../src/curriculum/aulas.ts";
import { getItem } from "../src/curriculum/index.ts";
import { LESSONS } from "../src/curriculum/lessons.ts";
import { lintPtPt } from "../src/curriculum/pt-pt-lint.ts";

describe("lessons + tips", () => {
  it("every lesson has provenance and real items", () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(16);
    for (const l of LESSONS) {
      expect(l.source.concept.length, l.id).toBeGreaterThan(1);
      for (const id of l.itemIds) expect(getItem(id), `${l.id}: unknown item ${id}`).toBeDefined();
    }
  });

  it("tip text is European Portuguese", () => {
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
