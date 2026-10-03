/**
 * Progress you can see: XP and levels, the daily streak, badges, words known — per player
 * (learner profile), kept on the TV. This is motivation, not the learner model: XP comes from
 * playing (lessons, games, game nights); "words you know" reads the learner model.
 */
import type { LearnerProfile } from "../learner/model.ts";

const KEY = "pp.tv.stats.v1";

export interface PlayerStats {
  xp: number;
  /** Days played (YYYY-MM-DD, local time), newest last, at most 120. */
  days: string[];
  lessons: number;
  games: number;
  wins: number;
  crowns: number;
  badges: string[];
}

const empty = (): PlayerStats => ({ xp: 0, days: [], lessons: 0, games: 0, wins: 0, crowns: 0, badges: [] });

function readAll(): Record<string, PlayerStats> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, PlayerStats>;
  } catch {
    return {};
  }
}
function writeAll(all: Record<string, PlayerStats>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function statsOf(profileId: string): PlayerStats {
  return { ...empty(), ...readAll()[profileId] };
}

/* ------------------------------------------------------------------ levels */

/** XP needed to reach a level: 0, 100, 300, 600, 1000, 1500… */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * level;
}
export function levelOf(xp: number): number {
  let l = 1;
  while (xp >= xpForLevel(l + 1)) l++;
  return l;
}
/** Progress inside the current level, 0..1. */
export function levelProgress(xp: number): number {
  const l = levelOf(xp);
  return (xp - xpForLevel(l)) / Math.max(1, xpForLevel(l + 1) - xpForLevel(l));
}
const TITLES = ["Turista", "Aprendiz", "Curioso", "Conversador", "Desenrascado", "Habitué do café", "Alfacinha", "Lisboeta", "Mestre do Português"];
const TITLES_EN = ["Tourist", "Apprentice", "Curious", "Chatterbox", "Resourceful", "Café regular", "Alfacinha (Lisbon local)", "Lisboeta", "Master of Portuguese"];
export function levelTitle(level: number): { pt: string; en: string } {
  const i = Math.min(TITLES.length - 1, level - 1);
  return { pt: TITLES[i]!, en: TITLES_EN[i]! };
}

/* ------------------------------------------------------------------ streak */

export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function prevDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y!, m! - 1, d! - 1));
}
/** Days in a row with play, ending today (or yesterday — today isn't over yet). */
export function streakOf(s: PlayerStats, today = dayKey()): number {
  const set = new Set(s.days);
  let day = set.has(today) ? today : prevDay(today);
  let n = 0;
  while (set.has(day)) {
    n++;
    day = prevDay(day);
  }
  return n;
}

/** Words this player knows (answered right at least twice). */
export function wordsKnown(p: LearnerProfile): number {
  return Object.values(p.items).filter((s) => s.correct >= 2).length;
}

/* ------------------------------------------------------------------ badges */

export const BADGES: { id: string; pic: string; pt: string; en: string; test: (s: PlayerStats, words: number) => boolean }[] = [
  { id: "first-lesson", pic: "📖", pt: "Primeira lição", en: "First lesson", test: (s) => s.lessons >= 1 },
  { id: "ten-lessons", pic: "🎓", pt: "Dez lições", en: "Ten lessons", test: (s) => s.lessons >= 10 },
  { id: "first-game", pic: "🎲", pt: "Primeiro jogo", en: "First game", test: (s) => s.games >= 1 },
  { id: "streak3", pic: "🔥", pt: "3 dias seguidos", en: "3-day streak", test: (s) => streakOf(s) >= 3 },
  { id: "streak7", pic: "🌋", pt: "7 dias seguidos", en: "7-day streak", test: (s) => streakOf(s) >= 7 },
  { id: "words50", pic: "🧠", pt: "50 palavras", en: "50 words known", test: (_s, w) => w >= 50 },
  { id: "words150", pic: "📚", pt: "150 palavras", en: "150 words known", test: (_s, w) => w >= 150 },
  { id: "crown", pic: "👑", pt: "Estrela da noite", en: "Star of a game night", test: (s) => s.crowns >= 1 },
  { id: "level5", pic: "🚀", pt: "Nível 5", en: "Level 5", test: (s) => levelOf(s.xp) >= 5 },
];

/* ------------------------------------------------------------------ awarding */

export interface Award {
  gain: number;
  before: number;
  after: number;
  levelUp: boolean;
  streak: number;
  /** A new day in the streak (first play today). */
  newDay: boolean;
  newBadges: { pic: string; pt: string; en: string }[];
}

/** Add XP (and a play day) for one player; returns what changed, for the results screen. */
export function award(p: LearnerProfile, xp: number, kind: { lesson?: boolean; game?: boolean; win?: boolean; crown?: boolean }): Award {
  const all = readAll();
  const s = { ...empty(), ...all[p.profileId] };
  const before = s.xp;
  const today = dayKey();
  const newDay = !s.days.includes(today);
  if (newDay) s.days = [...s.days, today].slice(-120);
  // A streak bonus: +5 XP per day in a row (up to +35).
  const streak = streakOf(s, today);
  const gain = Math.round(xp + (newDay ? Math.min(35, 5 * streak) : 0));
  s.xp += gain;
  if (kind.lesson) s.lessons++;
  if (kind.game) s.games++;
  if (kind.win) s.wins++;
  if (kind.crown) s.crowns++;
  const words = wordsKnown(p);
  const newBadges = BADGES.filter((b) => !s.badges.includes(b.id) && b.test(s, words));
  s.badges = [...s.badges, ...newBadges.map((b) => b.id)];
  all[p.profileId] = s;
  writeAll(all);
  return { gain, before, after: s.xp, levelUp: levelOf(s.xp) > levelOf(before), streak, newDay, newBadges: newBadges.map(({ pic, pt, en }) => ({ pic, pt, en })) };
}
