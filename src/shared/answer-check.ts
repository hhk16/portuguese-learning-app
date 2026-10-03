/**
 * Answer matching for typed / spoken Portuguese.
 *
 * Accents are meaningful in Portuguese (tem ≠ têm, esta ≠ está), so an answer that differs only
 * by accents is NOT correct — it is an "accent-slip": the game can say "quase! atenção ao acento"
 * and the learner model records it as wrong-but-close.
 */
export type MatchResult = "correct" | "accent-slip" | "close" | "wrong";

export function normalizeSpaces(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?¿¡;:"“”«»]/g, "")
    .replace(/\s+/g, " ");
}

export function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n]!;
}

export function matchAnswer(given: string, expected: string | readonly string[]): MatchResult {
  const g = normalizeSpaces(given).normalize("NFC");
  const targets = (typeof expected === "string" ? [expected] : expected).map((e) => normalizeSpaces(e).normalize("NFC"));
  if (targets.includes(g)) return "correct";
  const gs = stripAccents(g);
  if (targets.some((t) => stripAccents(t) === gs)) return "accent-slip";
  if (targets.some((t) => t.length >= 5 && levenshtein(stripAccents(t), gs) === 1)) return "close";
  return "wrong";
}

/**
 * Speech transcripts: recognisers disagree on accents and casing, and minimal pairs
 * (três/treze) are exactly what they get wrong. So speech matching is lenient on accents,
 * strict on letters, and never authoritative — the partner can always challenge.
 */
export function matchSpeech(transcripts: readonly string[], target: string, contrast?: string): "match" | "contrast" | "unclear" {
  const t = stripAccents(normalizeSpaces(target));
  const c = contrast ? stripAccents(normalizeSpaces(contrast)) : null;
  for (const raw of transcripts) {
    const words = stripAccents(normalizeSpaces(raw)).split(" ");
    const phrase = words.join(" ");
    if (phrase === t || words.includes(t)) return "match";
    if (c && (phrase === c || words.includes(c))) return "contrast";
  }
  return "unclear";
}
