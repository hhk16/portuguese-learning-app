export type ReviewRating = 0 | 1 | 2 | 3 | 4 | 5; // 0 wrong, 5 perfect

export interface CardReviewState {
  cardId: string;
  intervalDays: number;
  easeFactor: number; // >= 1.3
  repetitions: number;
  due: number; // epoch ms
}

export function initializeCard(cardId: string, now = Date.now()): CardReviewState {
  return { cardId, intervalDays: 0, easeFactor: 2.5, repetitions: 0, due: now };
}

export function scheduleNext(state: CardReviewState, rating: ReviewRating, now = Date.now()): CardReviewState {
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
  const due = now + intervalDays * 24 * 60 * 60 * 1000;
  return { ...state, repetitions, easeFactor, intervalDays, due };
}

export function isDue(state: CardReviewState, now = Date.now()): boolean {
  return state.due <= now;
} 