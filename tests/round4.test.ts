import { describe, expect, it } from "vitest";
import { splitTeam } from "../src/tv/activities.ts";
import { bombShare, kindsFor, LEVEL_RULES as BOMB_LEVELS } from "../src/games/bomb/bomb.ts";
import { pointsForTime, turnMsFor, TWISTS } from "../src/games/draw/draw.ts";
import { DISHES, MENUS, orderBook } from "../src/games/kitchen/menu.ts";
import { LEVEL_RULES as SECRET_LEVELS } from "../src/games/secret/secret.ts";
import { CATEGORY_LINKS, LINKS } from "../src/games/sync/links.ts";
import { LEVEL_RULES as SYNC_LEVELS } from "../src/games/sync/sync.ts";
import { hostSpoken, NAMED, RULES } from "../src/tv/host-lines.ts";

describe("game night: MVP split of a co-op result", () => {
  it("keeps the team result when both did the same", () => {
    expect(splitTeam(70, { a: 5, b: 5 }, ["a", "b"])).toEqual({ a: 70, b: 70 });
  });
  it("moves 70%–130% of the team result towards whoever did more, capped at 100", () => {
    expect(splitTeam(50, { a: 10, b: 0 }, ["a", "b"])).toEqual({ a: 65, b: 35 });
    expect(splitTeam(100, { a: 3, b: 1 }, ["a", "b"])).toEqual({ a: 100, b: 85 });
  });
  it("is the team result with no contributions at all", () => {
    expect(splitTeam(40, {}, ["a", "b"])).toEqual({ a: 40, b: 40 });
  });
});

describe("Batata Quente", () => {
  it("escalates the question types and mixes them on the last potato", () => {
    expect(kindsFor(0)).toEqual(["hear"]);
    expect(kindsFor(3)).toEqual(["opposite"]);
    expect(kindsFor(4).length).toBe(5);
  });
  it("gives the night 40–100 for a versus result", () => {
    expect(bombShare(0, 6)).toBe(40);
    expect(bombShare(6, 6)).toBe(100);
    expect(bombShare(3, 6)).toBe(70);
  });
  it("hides a shorter fuse on harder levels", () => {
    expect(BOMB_LEVELS[3].fuse[1]).toBeLessThan(BOMB_LEVELS[1].fuse[1]);
  });
});

describe("Desenha!: shorter turns and twists", () => {
  it("shrinks the turn every round down to a floor", () => {
    expect(turnMsFor(2, 0)).toBe(50_000);
    expect(turnMsFor(2, 2)).toBe(42_000);
    expect(turnMsFor(2, 9)).toBe(30_000);
    expect(turnMsFor(2, -1)).toBe(75_000);
  });
  it("scores by the share of the turn left", () => {
    expect(pointsForTime(25_000, 30_000)).toBe(3);
    expect(pointsForTime(12_000, 30_000)).toBe(2);
    expect(pointsForTime(2_000, 30_000)).toBe(1);
  });
  it("has stroke-limited twists", () => {
    expect(TWISTS.filter((t) => t.limit).map((t) => t.limit)).toEqual([3, 1]);
  });
});

describe("Cozinha Caótica: com / sem", () => {
  it("adds com/sem orders after the others, without changing them", () => {
    for (const m of MENUS) {
      const book = orderBook(m);
      const firstFour = book.findIndex((o) => o.level === 4);
      expect(firstFour).toBeGreaterThan(0);
      expect(book.slice(firstFour).every((o) => o.level === 4)).toBe(true);
    }
  });
  it("a 'sem' order never puts the extra on the tray; a 'com' order always does", () => {
    for (const m of MENUS)
      for (const o of orderBook(m).filter((x) => x.level === 4)) {
        if (o.without) {
          expect(o.items[o.without]).toBeUndefined();
          expect(o.text).toContain(`sem ${DISHES[o.without]!.sing}`);
        }
        if (o.with) expect(o.items[o.with]).toBe(1);
      }
  });
  it("never orders an extra on its own", () => {
    for (const m of MENUS) for (const o of orderBook(m).filter((x) => x.level < 4)) expect(Object.keys(o.items).some((id) => DISHES[id]!.extra)).toBe(false);
  });
});

describe("harder co-op levels", () => {
  it("Pares Secretos: fewer turns, and no plain category clues above Fácil", () => {
    expect(SECRET_LEVELS[2].turns).toBeLessThanOrEqual(5);
    expect(SECRET_LEVELS[2].categories).toBe(false);
    for (const c of CATEGORY_LINKS) expect(LINKS.some((l) => l.pt === c)).toBe(true);
  });
  it("Em Sintonia: team lives", () => {
    expect(SYNC_LEVELS[1].lives).toBeGreaterThan(SYNC_LEVELS[3].lives);
  });
});

describe("host lines for the new bits", () => {
  it("has rules for Batata Quente and pre-records the named lines", () => {
    expect(RULES.bomb.length).toBe(4);
    const spoken = hostSpoken();
    expect(spoken).toContain(NAMED.burned.pt.replace("{name}", "Ana"));
    expect(spoken).toContain(NAMED.hurryUp.pt.replace("{name}", "Hadi"));
  });
});
