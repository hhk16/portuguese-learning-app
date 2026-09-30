/**
 * Every Portuguese text the game may say aloud. The audio pipeline (scripts/audio) pre-renders
 * each one, so the TV plays real recordings instead of relying on whatever voice the device has.
 * Games that add spoken lines register them here.
 */
import { ALL_ITEMS } from "./index.ts";
import { cardOf } from "./learn.ts";
import { kitchenSpoken } from "../games/kitchen/menu.ts";
import { stopSpoken } from "../games/stop/dictionary.ts";
import { hostSpoken } from "../tv/host-lines.ts";

const extra = new Set<string>();

/** Register game-specific spoken lines (instructions, prompts). */
export function registerSpoken(...texts: string[]) {
  for (const t of texts) if (t.trim()) extra.add(t.trim());
}

export function allSpokenTexts(): string[] {
  const out = new Set<string>();
  for (const it of ALL_ITEMS) {
    const c = cardOf(it);
    if (c) out.add(c.say);
    if (it.kind === "profession") {
      out.add(it.m);
      out.add(it.f);
    }
    if (it.kind === "nationality") {
      out.add(it.ms);
      out.add(it.fs);
    }
  }
  for (const t of [...kitchenSpoken(), ...stopSpoken(), ...hostSpoken()]) out.add(t);
  for (const t of extra) out.add(t);
  return [...out].filter((t) => t.trim().length > 0).sort();
}
