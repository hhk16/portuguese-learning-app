/**
 * Frame animations for Hadi, Ana and the puppy: key frames drawn with OpenAI gpt-image from the
 * characters' own art (same style), cropped onto one canvas per clip at the static art's scale.
 * Files: /art/anim/<who>-<clip>-<i>.webp; sizes in anim.generated.json (scripts in the art workflow).
 */
import MANIFEST from "./anim.generated.json";

export type AnimWho = "hadi" | "ana" | "pup";

/** How a clip plays: the frame order, frames per second, and whether it stops on the last frame. */
export interface ClipSpec {
  seq: number[];
  fps: number;
  hold?: boolean;
}

export const CLIPS: Record<"person" | "pup", Record<string, ClipSpec>> = {
  person: {
    cheer: { seq: [0, 1, 2, 3], fps: 7 },
    wave: { seq: [0, 1], fps: 4 },
    oops: { seq: [0, 1, 2], fps: 3, hold: true },
    think: { seq: [0, 1], fps: 0.8 },
  },
  pup: {
    idle: { seq: [0, 1, 2, 1], fps: 3 },
    cheer: { seq: [0, 1, 2, 3], fps: 8 },
    oops: { seq: [0, 1, 2], fps: 4, hold: true },
    wave: { seq: [0, 1, 2, 1], fps: 6 },
    sniff: { seq: [0, 1, 0, 1, 2, 2], fps: 4 },
    hide: { seq: [0, 0, 1, 0], fps: 3 },
    sleep: { seq: [0, 1], fps: 0.8 },
    think: { seq: [0, 1], fps: 0.7 },
    crown: { seq: [0, 1, 2, 1], fps: 8 },
  },
};

/** How high the jumping frames lift off the ground (fraction of the height), per frame of the clip. */
export const LIFT: Record<string, number[]> = { "person:cheer": [0, 0.04, 0.09, 0.01], "pup:cheer": [0, 0.08, 0.2, 0.02] };

export interface Clip {
  who: AnimWho;
  name: string;
  spec: ClipSpec;
  urls: string[];
  /** Canvas size in px (people: 720 = standing height; puppy: 480 = sitting height). */
  w: number;
  h: number;
}

const M = MANIFEST as Partial<Record<AnimWho, Record<string, { frames: number; w: number; h: number }>>>;

export function clipOf(who: AnimWho, name: string): Clip | undefined {
  const m = M[who]?.[name];
  const spec = CLIPS[who === "pup" ? "pup" : "person"][name];
  if (!m || !spec || m.frames < 1) return undefined;
  return { who, name, spec, urls: Array.from({ length: m.frames }, (_, i) => `/art/anim/${who}-${name}-${i}.webp`), w: m.w, h: m.h };
}

/** Every clip of a character, in a stable order (for preloading). */
export function clipsOf(who: AnimWho): Clip[] {
  return Object.keys(CLIPS[who === "pup" ? "pup" : "person"])
    .map((n) => clipOf(who, n))
    .filter((c): c is Clip => !!c);
}

/** The frame (index into clip.urls) at `sec` seconds into the clip. */
export function frameAt(spec: ClipSpec, sec: number): number {
  const k = Math.floor(Math.max(0, sec) * spec.fps);
  const i = spec.hold ? Math.min(k, spec.seq.length - 1) : k % spec.seq.length;
  return spec.seq[i]!;
}
