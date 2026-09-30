/** Lesson progress on this TV (which lessons are done, stars). Local to the household's TV. */
import { LESSONS } from "../curriculum/lessons.ts";

const DONE_KEY = "pp.tv.lessonsDone";
const STARS_KEY = "pp.tv.lessonStars";

function read<T>(key: string, fallback: T): T {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? "null") as T) ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode etc. */
  }
}

export function lessonsDone(): Set<string> {
  return new Set(read<string[]>(DONE_KEY, []));
}

export function lessonStars(): Record<string, number> {
  return read<Record<string, number>>(STARS_KEY, {});
}

export function markLessonDone(id: string, stars = 1) {
  const s = lessonsDone();
  s.add(id);
  write(DONE_KEY, [...s]);
  const all = lessonStars();
  all[id] = Math.max(all[id] ?? 0, stars);
  write(STARS_KEY, all);
}

/** Next lesson in book order that hasn't been done yet (wraps around). */
export function nextLessonId(): string {
  const done = lessonsDone();
  return (LESSONS.find((l) => !done.has(l.id)) ?? LESSONS[0]!).id;
}

/** Lessons whose words the games may use: everything done + the next one. */
export function playableLessons() {
  const done = lessonsDone();
  const next = nextLessonId();
  const list = LESSONS.filter((l) => done.has(l.id) || l.id === next);
  return list.length ? list : [LESSONS[0]!];
}

/* ---------------------------------------------------------------- game levels + records */

export type Level = 1 | 2 | 3;
export const LEVELS: { level: Level; pt: string; en: string; stars: string }[] = [
  { level: 1, pt: "Fácil", en: "Easy", stars: "★" },
  { level: 2, pt: "Médio", en: "Medium", stars: "★★" },
  { level: 3, pt: "Difícil", en: "Hard", stars: "★★★" },
];

const LEVEL_KEY = "pp.tv.gameLevel";
const BEST_KEY = "pp.tv.gameBest";

/** Last difficulty played for a game (default: easy). */
export function lastLevel(mode: string): Level {
  return (read<Record<string, Level>>(LEVEL_KEY, {})[mode] ?? 1) as Level;
}
export function rememberLevel(mode: string, level: Level) {
  const all = read<Record<string, Level>>(LEVEL_KEY, {});
  all[mode] = level;
  write(LEVEL_KEY, all);
}

const PLAYS_KEY = "pp.tv.gamePlays";
/** How many times a game was finished on this TV. */
export function playCount(mode: string): number {
  return read<Record<string, number>>(PLAYS_KEY, {})[mode] ?? 0;
}
export function countPlay(mode: string) {
  const all = read<Record<string, number>>(PLAYS_KEY, {});
  all[mode] = (all[mode] ?? 0) + 1;
  write(PLAYS_KEY, all);
}
/** The first two plays of a game start with an unscored practice round ("Ensaio"). */
export function wantsPractice(mode: string): boolean {
  return playCount(mode) < 2;
}

export function bestScore(mode: string, level: Level): number | null {
  return read<Record<string, number>>(BEST_KEY, {})[`${mode}:${level}`] ?? null;
}

/** Store a score; returns the previous best (null = first time) and whether this beat it. */
export function recordScore(mode: string, level: Level, score: number): { previous: number | null; isNew: boolean } {
  const all = read<Record<string, number>>(BEST_KEY, {});
  const key = `${mode}:${level}`;
  const previous = all[key] ?? null;
  const isNew = previous === null ? score > 0 : score > previous;
  if (isNew) {
    all[key] = score;
    write(BEST_KEY, all);
  }
  return { previous, isNew };
}
