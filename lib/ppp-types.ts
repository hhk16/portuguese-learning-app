// Dense PPP Enhancement Types
export interface RuleBox {
  type: 'grammar' | 'pronunciation' | 'culture' | 'warning';
  title: string;
  content: string;
  pattern?: string; // For grammar rules like "verb + -ar = eu verb + -o"
}

export interface ContrastPair {
  title: string;
  pairs: {
    pt: string;
    en: string;
    wrong?: string; // Common mistake
    note?: string;
  }[];
}

export interface Pitfall {
  mistake: string;
  correction: string;
  explanation: string;
}

export interface CulturalNote {
  icon: string;
  title: string;
  content: string;
}

export interface MiniCheck {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface PronunciationGuide {
  sounds: {
    symbol: string;
    example: string;
    tip: string;
  }[];
  audioHints?: string[];
}

export interface CheatSheet {
  title: string;
  items: {
    category: string;
    items: string[];
  }[];
}

export interface WhyItMatters {
  canDoStatements: string[];
  realWorldUse: string;
}

// Enhanced Section extending the existing section type
export interface EnhancedSection {
  title: string;
  explanation: string;
  examples: { pt: string; en: string; note?: string }[];
  keyPoints?: string[];
  
  // Dense PPP enhancements
  ruleBoxes?: RuleBox[];
  contrastPairs?: ContrastPair[];
  pitfalls?: Pitfall[];
  culturalNotes?: CulturalNote[];
  miniChecks?: MiniCheck[];
  pronunciationGuide?: PronunciationGuide;
}

// Enhanced LessonContent extending the existing type
export interface EnhancedLessonContent {
  title: string;
  sections: EnhancedSection[];
  cheatSheet?: CheatSheet;
  whyItMatters?: WhyItMatters;
} 