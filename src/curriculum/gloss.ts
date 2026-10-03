/** English for a Portuguese word or phrase seen in a game (any form the curriculum knows: "barulhenta" → "noisy"). */
import { ALL_ITEMS } from "./index.ts";
import { cardOf } from "./learn.ts";

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[!?.,¿¡]/g, "")
    .replace(/^(o|a|os|as|um|uma) /, "")
    .trim();

let MAP: Map<string, string> | null = null;

export function glossOf(pt: string): string | undefined {
  if (!MAP) {
    MAP = new Map();
    for (const it of ALL_ITEMS) {
      const card = cardOf(it);
      if (!card?.en) continue;
      const forms = card.pt.split(" · ");
      const r = it as unknown as Record<string, unknown>;
      for (const k of ["m", "f", "ms", "fs", "mp", "fp", "pt", "form", "country"]) if (typeof r[k] === "string") forms.push(r[k] as string);
      for (const f of forms) if (!MAP.has(norm(f))) MAP.set(norm(f), card.en.replace(/^the /, ""));
    }
  }
  return MAP.get(norm(pt));
}
