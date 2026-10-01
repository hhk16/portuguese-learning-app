/**
 * Ana's wardrobe ("Guarda-roupa"): pieces from her own clothes, drawn on her character in the same
 * cartoon style. A look = one top + one bottom (with its shoes). Every piece has its Portuguese
 * name, so dressing up is also clothes vocabulary (a camisola, a saia, as botas…).
 *
 * Art: /art/characters/looks/ana-<top>-<bottom>-<pose>.webp. Looks without a pose yet fall back
 * to their standing pose; the original look ("blazer" + "couro") is the regular character art.
 */
import type { Pose } from "./avatars.ts";

export interface Piece {
  id: string;
  pt: string;
  en: string;
  pic: string;
}

export const TOPS: Piece[] = [
  { id: "blazer", pt: "o blazer preto", en: "the black blazer", pic: "🧥" },
  { id: "heart", pt: "a t-shirt branca", en: "the white t-shirt", pic: "👕" },
  { id: "gola", pt: "a camisa branca e a gola alta", en: "the white shirt and the turtleneck", pic: "👚" },
  { id: "fecho", pt: "a camisola preta com fecho", en: "the black zip jumper", pic: "🖤" },
  { id: "tpreta", pt: "a t-shirt preta", en: "the black t-shirt", pic: "🦄" },
  { id: "aviador", pt: "o casaco de aviador", en: "the aviator jacket", pic: "🧥" },
];

export const BOTTOMS: Piece[] = [
  { id: "couro", pt: "os calções de couro e as botas", en: "the leather shorts and the boots", pic: "👢" },
  { id: "calcoes", pt: "os calções pretos e as sapatilhas", en: "the black shorts and the trainers", pic: "👟" },
  { id: "saia", pt: "a saia cinzenta e as botas", en: "the grey skirt and the boots", pic: "🩶" },
];

export const DEFAULT_LOOK = { top: "blazer", bottom: "couro" };

/** Looks with finished art, and which poses each has (the rest use the standing pose). */
const LOOKS: Record<string, Pose[]> = {
  "blazer-couro": ["stand", "wave", "cheer", "oops", "think"],
  "blazer-calcoes": ["stand"],
  "blazer-saia": ["stand"],
  "heart-calcoes": ["stand"],
  "gola-couro": ["stand"],
  "gola-calcoes": ["stand"],
  "gola-saia": ["stand"],
  "fecho-couro": ["stand"],
  "fecho-calcoes": ["stand"],
  "fecho-saia": ["stand"],
  "tpreta-saia": ["stand"],
  "aviador-couro": ["stand"],
};

export function hasLook(top: string, bottom: string): boolean {
  return `${top}-${bottom}` in LOOKS;
}

/** Bottoms that go with a top (the ones drawn so far). */
export function bottomsFor(top: string): string[] {
  return BOTTOMS.map((b) => b.id).filter((b) => hasLook(top, b));
}

/** The image for Ana in a look and pose, or undefined for the regular character art. */
export function lookUrl(look: { top: string; bottom: string } | undefined, pose: Pose): string | undefined {
  if (!look || (look.top === DEFAULT_LOOK.top && look.bottom === DEFAULT_LOOK.bottom)) return undefined;
  const poses = LOOKS[`${look.top}-${look.bottom}`];
  if (!poses) return undefined;
  return `/art/characters/looks/ana-${look.top}-${look.bottom}-${poses.includes(pose) ? pose : "stand"}.webp`;
}

/** Every Portuguese line the wardrobe says (pre-rendered by the audio pipeline). */
export function wardrobeSpoken(): string[] {
  return [...TOPS, ...BOTTOMS].map((p) => p.pt);
}
