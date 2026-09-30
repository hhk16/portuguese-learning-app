/**
 * Sound-effect files (MP3, 96 kbps) in public/sfx/, built by scripts/art/build-sfx.ts from Kenney CC0
 * packs "Interface Sounds", "UI Audio" and "Music Jingles" (+ one generated whoosh). Soft sine/bubble/
 * pizzicato/steel-drum timbres, levels pre-balanced. Sources per name are listed in the build script.
 *
 * Tip: decode once into AudioBuffers (Web Audio) for low-latency repeat playback, e.g. tap/tick.
 */
import { assetUrl } from "./url.ts";

export const SFX_NAMES = [
  "tap", // UI tap / button press (tiny soft blip)
  "select", // choose an option (up-chirp)
  "back", // go back / cancel (down-chirp)
  "correct", // right answer
  "wrong", // wrong answer (gentle "uh-oh")
  "pop", // bubble pop: items appearing, points popping
  "whoosh", // transitions, cards flying in
  "reveal", // reveal answer / picture
  "star", // earn a star
  "tick", // countdown / timer tick
  "countdown-go", // "go!" after 3-2-1
  "success-jingle", // round won / lesson complete (~0.9 s)
  "fail-jingle", // round lost / time up (~0.8 s)
  "match", // pair matched (happy two-tone)
  "lock", // answer locked in
] as const;

export type SfxName = (typeof SFX_NAMES)[number];

export const SFX: Record<SfxName, string> = Object.fromEntries(
  SFX_NAMES.map((n) => [n, assetUrl(`sfx/${n}.mp3`)]),
) as Record<SfxName, string>;
