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
