// PPP Content Authoring Helpers
import { RuleBox, ContrastPair, Pitfall, CulturalNote, MiniCheck, PronunciationGuide, CheatSheet, WhyItMatters } from './ppp-types';

// Rule Box helpers
export const grammarRule = (title: string, content: string, pattern?: string): RuleBox => ({
  type: 'grammar',
  title,
  content,
  pattern
});

export const pronunciationRule = (title: string, content: string): RuleBox => ({
  type: 'pronunciation',
  title,
  content
});

export const culturalRule = (title: string, content: string): RuleBox => ({
  type: 'culture',
  title,
  content
});

export const warningRule = (title: string, content: string): RuleBox => ({
  type: 'warning',
  title,
  content
});

// Contrast helpers
export const contrast = (title: string, pairs: { pt: string; en: string; wrong?: string; note?: string }[]): ContrastPair => ({
  title,
  pairs
});

export const ptVsEn = (pt: string, en: string, wrong?: string, note?: string) => ({
  pt, en, wrong, note
});

// Pitfall helpers
export const pitfall = (mistake: string, correction: string, explanation: string): Pitfall => ({
  mistake,
  correction,
  explanation
});

// Cultural note helpers
export const culturalNote = (icon: string, title: string, content: string): CulturalNote => ({
  icon,
  title,
  content
});

// Mini check helpers
export const miniCheck = (question: string, options: string[], correct: string, explanation: string): MiniCheck => ({
  question,
  options,
  correct,
  explanation
});

// Pronunciation guide helpers
export const pronunciationGuide = (
  sounds: { symbol: string; example: string; tip: string }[],
  audioHints?: string[]
): PronunciationGuide => ({
  sounds,
  audioHints
});

export const sound = (symbol: string, example: string, tip: string) => ({
  symbol, example, tip
});

// Cheat sheet helpers
export const cheatSheet = (title: string, items: { category: string; items: string[] }[]): CheatSheet => ({
  title,
  items
});

export const cheatCategory = (category: string, items: string[]) => ({
  category, items
});

// Why it matters helpers
export const whyItMatters = (canDoStatements: string[], realWorldUse: string): WhyItMatters => ({
  canDoStatements,
  realWorldUse
});

// Example building helpers
export const example = (pt: string, en: string, note?: string) => ({
  pt, en, note
});

// Common patterns for A1 Portuguese
export const commonPatterns = {
  // Grammar patterns
  arVerbConjugation: "verb-AR: eu verb-O, tu verb-AS, ele verb-A, nós verb-AMOS, vocês verb-AM, eles verb-AM",
  erVerbConjugation: "verb-ER: eu verb-O, tu verb-ES, ele verb-E, nós verb-EMOS, vocês verb-EM, eles verb-EM",
  irVerbConjugation: "verb-IR: eu verb-O, tu verb-ES, ele verb-E, nós verb-IMOS, vocês verb-EM, eles verb-EM",
  
  // Preposition contractions
  deContractions: "de + o = do, de + a = da, de + os = dos, de + as = das",
  emContractions: "em + o = no, em + a = na, em + os = nos, em + as = nas",
  aContractions: "a + o = ao, a + a = à, a + os = aos, a + as = às",
  
  // Common mistakes
  serVsEstar: "SER = permanent/identity, ESTAR = temporary/location/feeling"
};

// Quick templates for common A1 content
export const templates = {
  basicGreeting: () => [
    example("Olá", "Hello"),
    example("Bom dia", "Good morning"),
    example("Boa tarde", "Good afternoon"),
    example("Boa noite", "Good evening/night")
  ],
  
  basicNumbers: () => [
    example("um", "one"), example("dois", "two"), example("três", "three"),
    example("quatro", "four"), example("cinco", "five"), example("seis", "six")
  ],
  
  basicFamily: () => [
    example("pai", "father"), example("mãe", "mother"),
    example("irmão", "brother"), example("irmã", "sister")
  ]
};

// Content density helpers
export const ensureDensity = {
  minExamples: 6,
  minRuleBoxes: 1,
  minPitfalls: 1,
  minCulturalNotes: 1,
  recommendedMiniChecks: 1
}; 