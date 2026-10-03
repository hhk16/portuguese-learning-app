/**
 * Two separate event streams, on purpose:
 *
 * - EvidenceEvent: linguistic evidence about ONE knowledge item for ONE learner profile.
 *   Only this drives SRS, mastery tiers and the can-do map.
 * - PerformanceEvent: how someone plays (speed, wins, combos). Drives scoreboards and trophies.
 *   It never counts as knowing Portuguese — winning races is not knowing "temos".
 */
import { z } from "zod";

export const Outcome = z.enum(["correct", "accent-slip", "close", "wrong", "timeout", "judged-correct", "judged-wrong"]);
export type Outcome = z.infer<typeof Outcome>;

export const EvidenceEvent = z.object({
  profileId: z.string().min(1).max(64),
  itemId: z.string().min(1).max(160),
  /** Game context, e.g. "micro.escolhe", "race.choice". Tier promotion needs ≥2 distinct contexts. */
  context: z.string().min(1).max(64),
  tier: z.number().int().min(1).max(4),
  outcome: Outcome,
  /** Response latency (ms) — informational only, never used for mastery. */
  latencyMs: z.number().nonnegative().optional(),
  at: z.number(),
});
export type EvidenceEvent = z.infer<typeof EvidenceEvent>;

export const PerformanceEvent = z.object({
  profileId: z.string().min(1).max(64),
  game: z.string().min(1).max(64),
  metric: z.enum(["score", "win", "turbo", "combo", "spinout", "fastest", "streak"]),
  value: z.number(),
  at: z.number(),
});
export type PerformanceEvent = z.infer<typeof PerformanceEvent>;

export function isCorrectOutcome(o: Outcome): boolean {
  return o === "correct" || o === "judged-correct";
}
