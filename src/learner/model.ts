/**
 * Per-learner model built ONLY from linguistic evidence (EvidenceEvent).
 * Game performance (speed, wins) lives elsewhere and never feeds this.
 *
 * Mastery tiers 1..4. Promotion rule: the learner must answer correctly at their current tier in
 * at least TWO distinct game contexts (e.g. "micro.escolhe" and "race.choice") before moving up.
 * That stops the model believing someone "knows" an item because they memorised one question shape.
 */
import { initialSrs, isDue, scheduleNext, type ReviewRating, type SrsState } from "../shared/srs.ts";
import { isCorrectOutcome, type EvidenceEvent, type Outcome } from "./events.ts";

export const MAX_TIER = 4;
export const CONTEXTS_TO_PROMOTE = 2;

export interface ItemState {
  itemId: string;
  tier: number;
  srs: SrsState;
  /** Distinct contexts with a correct answer at the current tier. */
  contextsAtTier: string[];
  seen: number;
  correct: number;
  /** Consecutive misses (drives MC jokes and weak-item injection). */
  missStreak: number;
  /** 0..1, higher = weaker. Decays with correct answers. */
  weakness: number;
  lastSeen: number;
  lastOutcome?: Outcome;
}

export interface LearnerProfile {
  profileId: string;
  name: string;
  items: Record<string, ItemState>;
  createdAt: number;
}

export function newProfile(profileId: string, name: string, now = Date.now()): LearnerProfile {
  return { profileId, name, items: {}, createdAt: now };
}

function ratingFor(outcome: Outcome, tier: number): ReviewRating {
  switch (outcome) {
    case "correct":
    case "judged-correct":
      return tier >= 2 ? 5 : 4; // recalling is stronger evidence than recognising
    case "accent-slip":
    case "close":
      return 2;
    default:
      return 0;
  }
}

/** Apply one evidence event. Pure: returns a new state. */
export function applyEvidence(state: ItemState | undefined, e: EvidenceEvent): ItemState {
  const s: ItemState = state
    ? { ...state, contextsAtTier: [...state.contextsAtTier] }
    : { itemId: e.itemId, tier: 1, srs: initialSrs(e.at), contextsAtTier: [], seen: 0, correct: 0, missStreak: 0, weakness: 0.5, lastSeen: e.at };

  s.seen += 1;
  s.lastSeen = e.at;
  s.lastOutcome = e.outcome;
  const ok = isCorrectOutcome(e.outcome);
  s.srs = scheduleNext(s.srs, ratingFor(e.outcome, e.tier), e.at);

  if (ok) {
    s.correct += 1;
    s.missStreak = 0;
    s.weakness = Math.max(0, s.weakness * 0.6 - 0.05);
    // Evidence only counts toward promotion when it was gathered at (or above) the current tier.
    if (e.tier >= s.tier && !s.contextsAtTier.includes(e.context)) s.contextsAtTier.push(e.context);
    if (s.contextsAtTier.length >= CONTEXTS_TO_PROMOTE && s.tier < MAX_TIER) {
      s.tier += 1;
      s.contextsAtTier = [];
    }
  } else {
    s.missStreak += 1;
    s.weakness = Math.min(1, s.weakness + (e.outcome === "accent-slip" || e.outcome === "close" ? 0.15 : 0.3));
    // Repeated misses drop a tier so the game re-scaffolds (recognise before recall).
    if (s.missStreak >= 2 && s.tier > 1) {
      s.tier -= 1;
      s.contextsAtTier = [];
    }
  }
  return s;
}

export function applyToProfile(p: LearnerProfile, events: readonly EvidenceEvent[]): LearnerProfile {
  const items = { ...p.items };
  for (const e of events) {
    if (e.profileId !== p.profileId) continue;
    items[e.itemId] = applyEvidence(items[e.itemId], e);
  }
  return { ...p, items };
}

export function tierOf(p: LearnerProfile, itemId: string): number {
  return p.items[itemId]?.tier ?? 1;
}

export function dueItems(p: LearnerProfile, now = Date.now()): ItemState[] {
  return Object.values(p.items).filter((s) => isDue(s.srs, now));
}

export function weakItems(p: LearnerProfile, threshold = 0.55): ItemState[] {
  return Object.values(p.items)
    .filter((s) => s.weakness >= threshold && s.seen > 0)
    .sort((a, b) => b.weakness - a.weakness);
}
