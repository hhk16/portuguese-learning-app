/**
 * SM-2 style scheduler (ported from the legacy app's lib/srs.ts).
 * Ratings: 0 = wrong … 5 = perfect.
 */
export type ReviewRating = 0 | 1 | 2 | 3 | 4 | 5;

export interface SrsState {
  intervalDays: number;
  easeFactor: number; // >= 1.3
  repetitions: number;
  due: number; // epoch ms (wall clock — scheduling across days, not latency-sensitive)
}

const DAY = 24 * 60 * 60 * 1000;

export function initialSrs(now = Date.now()): SrsState {
  return { intervalDays: 0, easeFactor: 2.5, repetitions: 0, due: now };
}

export function scheduleNext(state: SrsState, rating: ReviewRating, now = Date.now()): SrsState {
  let { repetitions, easeFactor, intervalDays } = state;
  if (rating < 3) {
    repetitions = 0;
    intervalDays = 0;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
  // A failed item comes back within the same session (10 minutes), not "now".
  const due = rating < 3 ? now + 10 * 60 * 1000 : now + intervalDays * DAY;
  return { repetitions, easeFactor, intervalDays, due };
}

export function isDue(state: SrsState, now = Date.now()): boolean {
  return state.due <= now;
}
