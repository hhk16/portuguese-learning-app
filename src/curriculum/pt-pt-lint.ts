/**
 * Flags Brazilian Portuguese forms outside Mundo do Português content.
 * The game teaches European Portuguese; Brazilian variants may only appear as labelled contrasts.
 */
const BRAZILIANISMS: [RegExp, string][] = [
  [/\bônibus\b/i, "autocarro"],
  [/\btrem\b/i, "comboio"],
  [/\bcelular\b/i, "telemóvel"],
  [/\bbanheiro\b/i, "casa de banho"],
  [/\bcafé da manhã\b/i, "pequeno-almoço"],
  [/\bsuco\b/i, "sumo"],
  [/\bcardápio\b/i, "ementa"],
  [/\bgarçom\b/i, "empregado de mesa"],
  [/\bgeladeira\b/i, "frigorífico"],
  [/\bdezesseis\b/i, "dezasseis"],
  [/\bdezessete\b/i, "dezassete"],
  [/\bdezenove\b/i, "dezanove"],
  [/\bcatorze\b/i, ""], // (valid PT-PT — kept to document that "quatorze" is the BR one)
  [/\bquatorze\b/i, "catorze"],
  [/\bequipe\b/i, "equipa"],
  [/\besporte\b/i, "desporto"],
  [/\bxícara\b/i, "chávena"],
  [/\b(estou|está|estamos|estão|estás) \w+(ando|endo|indo)\b/i, "estar a + infinitivo (estou a trabalhar)"],
  [/\b(fato|registro|ação|ótimo)\b/i, ""], // ambiguous — not flagged
];

export interface LintHit {
  text: string;
  match: string;
  suggestion: string;
}

export function lintPtPt(text: string): LintHit[] {
  const hits: LintHit[] = [];
  for (const [re, suggestion] of BRAZILIANISMS) {
    if (!suggestion) continue;
    const m = re.exec(text);
    if (m) hits.push({ text, match: m[0], suggestion });
  }
  return hits;
}
