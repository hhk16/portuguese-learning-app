/**
 * Chooses which knowledge item a game round should use.
 *
 * Mix: ~50% current lesson, ~30% due-or-weak (for any player present), ~20% interleaved older items.
 * On the shared TV screen both players see the same prompt, so head-to-head rounds are equal by
 * construction. When a round targets one player's weak item, the round is labelled
 * ("Revisão para Hadi!") — adaptation is never hidden inside a supposedly equal contest.
 */
import type { KnowledgeItem } from "../curriculum/schema.ts";
import type { Rng } from "../shared/rng.ts";
import { isDue } from "../shared/srs.ts";
import type { LearnerProfile } from "./model.ts";

export interface SelectContext {
  candidates: readonly KnowledgeItem[];
  lessonItemIds: ReadonlySet<string>;
  profiles: readonly LearnerProfile[];
  /** Items already used this session (avoid immediate repeats). */
  recent: readonly string[];
  now?: number;
  /** Share of rounds drawn from the lesson (default 0.5; ~0.8 right after its Mini Aula). */
  lessonShare?: number;
}

export interface Selection {
  item: KnowledgeItem;
  reason: "lesson" | "review" | "interleave";
  /** When chosen because of one player's weakness: whose. */
  forProfileId?: string;
}

export function selectItem(ctx: SelectContext, rng: Rng): Selection | null {
  const now = ctx.now ?? Date.now();
  const recent = new Set(ctx.recent.slice(-12));
  const fresh = ctx.candidates.filter((c) => !recent.has(c.id));
  const pool = fresh.length > 0 ? fresh : ctx.candidates;
  if (pool.length === 0) return null;

  const roll = rng.next();
  const reviewCut = ctx.lessonShare !== undefined && ctx.lessonShare > 0.6 ? 0.15 : 0.3;
  const lessonCut = Math.min(0.97, reviewCut + (ctx.lessonShare ?? 0.5));
  if (roll < reviewCut) {
    // Review: weakest or due item among players present.
    let best: { item: KnowledgeItem; score: number; profileId: string } | null = null;
    for (const p of ctx.profiles) {
      for (const item of pool) {
        const s = p.items[item.id];
        if (!s || s.seen === 0) continue;
        const score = s.weakness + (isDue(s.srs, now) ? 0.3 : 0) + (s.missStreak > 0 ? 0.2 : 0);
        if (score > 0.6 && (!best || score > best.score)) best = { item, score, profileId: p.profileId };
      }
    }
    if (best) return { item: best.item, reason: "review", forProfileId: best.profileId };
  }
  if (roll < lessonCut) {
    const lesson = pool.filter((c) => ctx.lessonItemIds.has(c.id));
    if (lesson.length > 0) return { item: rng.pick(lesson), reason: "lesson" };
  }
  return { item: rng.pick(pool), reason: "interleave" };
}
