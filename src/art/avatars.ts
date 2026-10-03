/**
 * Player characters: cartoon art in one soft 3D animated-film style (generated for this private
 * game with OpenAI gpt-image; Hadi's and Ana's are drawn from their photos). Files: /art/characters/<id>-<pose>.webp
 * and a round face portrait /art/characters/<id>.webp.
 */
import type { Avatar } from "../shared/protocol.ts";

export type Pose = "stand" | "wave" | "cheer" | "oops" | "think";

/** Characters with finished art, in the order the join screen offers them. */
export const AVAILABLE_AVATARS: Avatar[] = ["hadi", "ana", "a", "b", "c", "d"];

const POSES: Record<Avatar, Pose[]> = {
  ana: ["stand", "wave", "cheer", "oops", "think"],
  hadi: ["stand", "wave", "cheer", "oops", "think"],
  a: ["stand", "wave", "cheer", "oops"],
  b: ["stand", "wave", "cheer", "oops"],
  c: ["stand", "wave", "cheer", "oops"],
  d: ["stand", "wave", "cheer", "oops"],
};

/** Best available image for a pose (falls back to standing, then waving). */
export function poseUrl(avatar: Avatar, pose: Pose): string {
  const have = POSES[avatar] ?? [];
  const use = have.includes(pose) ? pose : pose === "think" && have.includes("stand") ? "stand" : have.includes("stand") ? "stand" : "wave";
  return `/art/characters/${have.length ? avatar : "a"}-${use}.webp`;
}

export function faceUrl(avatar: Avatar): string {
  return `/art/characters/${POSES[avatar]?.length ? avatar : "a"}.webp`;
}
