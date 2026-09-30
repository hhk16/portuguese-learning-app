import { describe, expect, it } from "vitest";
import { ClockSync } from "../src/shared/clock.ts";
import { Rng } from "../src/shared/rng.ts";

describe("clock sync", () => {
  it("estimates the offset within a few ms under asymmetric jitter", () => {
    const rng = new Rng(7);
    const trueOffset = 123_456.7;
    const clock = new ClockSync();
    let local = 0;
    for (let i = 0; i < 20; i++) {
      local += 500;
      const up = 20 + rng.next() * 120; // jittery uplink
      const down = 20 + rng.next() * 60;
      const t0 = local;
      const hostTime = t0 + up + trueOffset;
      const t1 = t0 + up + down;
      clock.addSample(t0, hostTime, t1);
    }
    expect(Math.abs(clock.offset! - trueOffset)).toBeLessThan(30);
    expect(clock.toLocal(clock.toHost(1000)!)).toBeCloseTo(1000);
  });

  it("ignores garbage samples and resets", () => {
    const c = new ClockSync();
    expect(c.addSample(10, 0, 5)).toBeNull();
    expect(c.offset).toBeNull();
    c.addSample(0, 100, 10);
    expect(c.offset).toBe(95);
    c.reset();
    expect(c.offset).toBeNull();
  });
});
