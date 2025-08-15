import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import type { CardReviewState } from "./srs";

export interface ProgressByLesson {
  [lessonId: string]: {
    completed: boolean;
    xpEarned: number;
    lastCompletedAt?: number;
  };
}

export interface AvatarState {
  color: string; // hex or token
  hat: string | null; // item id
}

export interface ItemStat {
  attempts: number;
  correct: number;
  avgMs?: number;
}

interface AppState {
  xp: number;
  coins: number;
  badges: string[];
  streak: number;
  lastActiveDay: string | null; // YYYY-MM-DD
  dailyGoal: number; // XP target per day
  lessonProgress: ProgressByLesson;
  inventory: string[]; // purchased item ids
  avatar: AvatarState;
  itemStats: Record<string, ItemStat>; // cardId -> stats
  srsCards: Record<string, CardReviewState>;

  // UI settings
  showEnglishHints: boolean;

  // actions
  incrementXP: (amount: number) => void;
  markLessonComplete: (lessonId: string, xp: number) => void;
  resetProgress: () => void;
  awardCoins: (amount: number) => void;
  addBadge: (badge: string) => void;
  spendCoins: (amount: number) => boolean;
  purchase: (itemId: string, cost: number) => boolean;
  setAvatarColor: (color: string) => void;
  setAvatarHat: (hat: string | null) => void;
  recordItemResult: (cardId: string, correct: boolean, elapsedMs?: number) => void;
  updateSRSCard: (cardId: string, reviewState: CardReviewState) => void;
  toggleEnglishHints: () => void;
}

function formatYmd(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

const creator: StateCreator<AppState> = (set, get) => ({
  xp: 0,
  coins: 0,
  badges: [],
  streak: 0,
  lastActiveDay: null,
  dailyGoal: 30,
  lessonProgress: {},
  inventory: [],
  avatar: { color: "#00a884", hat: null },
  itemStats: {},
  srsCards: {},
  showEnglishHints: true,
  incrementXP: (amount: number) => {
    const today = formatYmd();
    const { lastActiveDay, streak } = get();
    let nextStreak = streak;
    if (lastActiveDay !== today) {
      if (lastActiveDay) {
        const last = new Date(lastActiveDay);
        const diffDays = Math.floor((Date.now() - last.getTime()) / 86400000);
        nextStreak = diffDays === 1 ? streak + 1 : diffDays === 0 ? streak : 1;
      } else {
        nextStreak = 1;
      }
    }
    set((s) => ({ xp: s.xp + amount, streak: nextStreak, lastActiveDay: today }));
  },
  markLessonComplete: (lessonId: string, xp: number) => {
    set((s) => ({
      lessonProgress: {
        ...s.lessonProgress,
        [lessonId]: { completed: true, xpEarned: xp, lastCompletedAt: Date.now() },
      },
    }));
    get().incrementXP(xp);
    get().awardCoins(Math.max(5, Math.round(xp / 2)));
  },
  resetProgress: () => set({ xp: 0, coins: 0, badges: [], streak: 0, lastActiveDay: null, lessonProgress: {}, inventory: [], avatar: { color: "#00a884", hat: null }, itemStats: {}, srsCards: {} }),
  awardCoins: (amount: number) => set((s) => ({ coins: s.coins + amount })),
  addBadge: (badge: string) => set((s) => ({ badges: s.badges.includes(badge) ? s.badges : [...s.badges, badge] })),
  spendCoins: (amount: number) => {
    const { coins } = get();
    if (amount <= 0 || coins < amount) return false;
    set({ coins: coins - amount });
    return true;
  },
  purchase: (itemId: string, cost: number) => {
    const ok = get().spendCoins(cost);
    if (!ok) return false;
    set((s) => ({ inventory: s.inventory.includes(itemId) ? s.inventory : [...s.inventory, itemId] }));
    return true;
  },
  setAvatarColor: (color: string) => set((s) => ({ avatar: { ...s.avatar, color } })),
  setAvatarHat: (hat: string | null) => set((s) => ({ avatar: { ...s.avatar, hat } })),
  recordItemResult: (cardId: string, wasCorrect: boolean, elapsedMs?: number) => {
    set((s) => {
      const prev = s.itemStats[cardId] || { attempts: 0, correct: 0 };
      const attempts = prev.attempts + 1;
      const correct = prev.correct + (wasCorrect ? 1 : 0);
      const avgMs = elapsedMs !== undefined
        ? prev.avgMs === undefined
          ? elapsedMs
          : Math.round((prev.avgMs * prev.attempts + elapsedMs) / attempts)
        : prev.avgMs;
      return { itemStats: { ...s.itemStats, [cardId]: { attempts, correct, avgMs } } };
    });
  },
  updateSRSCard: (cardId: string, reviewState: CardReviewState) => {
    set((state) => ({
      srsCards: { ...state.srsCards, [cardId]: reviewState }
    }));
  },
  toggleEnglishHints: () => set((s) => ({ showEnglishHints: !s.showEnglishHints })),
});

export const useAppStore = create<AppState>()(
  persist(creator, {
    name: "pta1_state",
    storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : undefined as any)),
  })
);

export function getDailyProgressPercent(): number {
  const state = useAppStore.getState();
  const pct = Math.min(100, Math.round(((state.xp % state.dailyGoal) / state.dailyGoal) * 100));
  return pct;
}

// Export shallow for components to use
export { shallow }; 