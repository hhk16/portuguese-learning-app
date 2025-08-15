interface ValidationResult {
  isCorrect: boolean;
  confidence: number; // 0-1
  feedback: string;
  acceptedAnswer?: string;
}

interface ValidationRequest {
  userAnswer: string;
  expectedAnswer: string;
  exerciseType: 'translation' | 'typing' | 'listening' | 'spelling';
  context?: string; // e.g., "Translate 'Please' to Portuguese"
  language: 'pt' | 'en';
}

class AIValidator {
  private apiKey: string | null = null;
  private fallbackValidation = true;

  constructor() {
    // Try to get API key from environment or localStorage
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || 
                  (typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') : null);
  }

  setApiKey(key: string) {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('openai_api_key', key);
    }
  }

  async validateAnswer(request: ValidationRequest): Promise<ValidationResult> {
    // Fallback validation for basic cases
    const fallbackResult = this.basicValidation(request);
    
    // If no API key, use enhanced fallback
    if (!this.apiKey) {
      return this.enhancedFallbackValidation(request);
    }

    try {
      const aiResult = await this.aiValidation(request);
      return aiResult;
    } catch (error) {
      console.warn('AI validation failed, using fallback:', error);
      return this.enhancedFallbackValidation(request);
    }
  }

  private basicValidation(request: ValidationRequest): ValidationResult {
    const userClean = request.userAnswer.trim().toLowerCase();
    const expectedClean = request.expectedAnswer.trim().toLowerCase();
    
    const isExactMatch = userClean === expectedClean;
    
    return {
      isCorrect: isExactMatch,
      confidence: isExactMatch ? 1.0 : 0.0,
      feedback: isExactMatch ? 'Correct!' : `Expected: ${request.expectedAnswer}`
    };
  }

  private enhancedFallbackValidation(request: ValidationRequest): ValidationResult {
    // Existing exact match logic
    const userClean = request.userAnswer.trim().toLowerCase();
    const expectedClean = request.expectedAnswer.trim().toLowerCase();
    if (userClean === expectedClean) return { isCorrect: true, feedback: "Correct!", confidence: 1.0 };
 
    // Check for accent differences FIRST (should be partially correct, not wrong)
    const accentTolerance = this.checkAccentDifferences(userClean, expectedClean, request.userAnswer, request.expectedAnswer);
    if (accentTolerance.hasAccentDifference) {
      return { 
        isCorrect: true, 
        feedback: `Partially correct! ${accentTolerance.message}`, 
        confidence: 0.7 
      };
    }

    // Flexible variations
    const translationVariations: Record<string, string[]> = {
      // Portuguese to English (most common direction)
      'desculpa': ['sorry', 'excuse me', 'sorry/excuse me', 'sorry/excuse me (informal)', 'excuse me (informal)'],
      'desculpe': ['sorry', 'excuse me', 'sorry/excuse me', 'sorry/excuse me (formal)', 'excuse me (formal)'],
      'com licença': ['excuse me', 'sorry', 'excuse me (formal)', 'pardon me'],
      'por favor': ['please', 'if you please'],
      'obrigado': ['thank you', 'thanks', 'thank you (male)'],
      'obrigada': ['thank you', 'thanks', 'thank you (female)'],
      'olá': ['hello', 'hi'],
      'oi': ['hi', 'hello', 'hey'],
      'tchau': ['bye', 'goodbye', 'see you'],
      'adeus': ['goodbye', 'farewell', 'bye'],
      'bom dia': ['good morning', 'morning'],
      'boa tarde': ['good afternoon', 'afternoon'],
      'boa noite': ['good evening', 'good night', 'evening', 'night'],
      'sim': ['yes'],
      'não': ['no'],
      'água': ['water'],
      'pão': ['bread'],
      'leite': ['milk'],
      'café': ['coffee'],
      
      // English to Portuguese (reverse direction)
      'hello': ['olá', 'oi'],
      'goodbye': ['adeus', 'tchau', 'até logo'],
      'good morning': ['bom dia'],
      'good afternoon': ['boa tarde'],
      'good evening': ['boa noite'],
      'good night': ['boa noite'],
      'please': ['por favor', 'se faz favor'],
      'thank you': ['obrigado', 'obrigada', 'obrigado/a'],
      'excuse me': ['desculpe', 'com licença', 'desculpa'],
      'sorry': ['desculpe', 'desculpa', 'lamento'],
      'yes': ['sim'],
      'no': ['não'],
      'water': ['água'],
      'bread': ['pão'],
      'milk': ['leite'],
      'coffee': ['café']
    };
    // Check direct translations (Portuguese word -> English options)
    if (translationVariations[expectedClean]?.includes(userClean)) {
      return { isCorrect: true, feedback: "Correct!", confidence: 0.9 };
    }
    // Check reverse translations (English word -> Portuguese options)
    if (translationVariations[userClean]?.includes(expectedClean)) {
      return { isCorrect: true, feedback: "Correct!", confidence: 0.9 };
    }
    // Check if user answer is in any of the translation arrays
    for (const [key, translations] of Object.entries(translationVariations)) {
      if (translations.includes(userClean) && translations.includes(expectedClean)) {
        return { isCorrect: true, feedback: "Correct!", confidence: 0.85 };
      }
    }
 
    // Ordinal acceptance (EN ↔ PT), and floor ↔ andar
    const normalize = (s:string)=> s.toLowerCase().replace(/\./g,'').replace(/º|ª/g,'').replace(/\s+/g,' ').trim();
    const u = normalize(userClean);
    const e = normalize(expectedClean);
    const ordMap: Record<string,string[]> = {
      'primeiro':[ '1o','1º','1st','first' ],
      'segundo':[ '2o','2º','2nd','second' ],
      'terceiro':[ '3o','3º','3rd','third' ],
      'quarto':[ '4o','4º','4th','fourth' ],
      'quinto':[ '5o','5º','5th','fifth' ],
    };
    for (const [pt, vars] of Object.entries(ordMap)) {
      if ((e.includes(pt) || vars.some(v=>e.includes(v))) && (u.includes(pt) || vars.some(v=>u.includes(v)))) {
        return { isCorrect: true, feedback: "Correct! Ordinal accepted.", confidence: 0.8 };
      }
    }
    if ((e.includes('andar') && (u.includes('floor')||u.includes('storey'))) || (u.includes('andar') && (e.includes('floor')||e.includes('storey')))) {
      return { isCorrect: true, feedback: "Correct!", confidence: 0.8 };
    }

    // Special handling for "desculpa" context
    if (expectedClean.includes('desculpa') || (request.context||'').toLowerCase().includes('desculpa')) {
      if (u.includes('sorry') || u.includes('excuse me')) {
        return { isCorrect: true, feedback: "Correct! Valid translation.", confidence: 0.8 };
      }
    }
 
    // Typo tolerance (edit distance)
    const dist = this.calculateEditDistance(userClean, expectedClean);
    if (dist === 1 && Math.min(userClean.length, expectedClean.length) >= 4) {
      // Find the specific difference
      const typoDetails = this.findTypoDetails(userClean, expectedClean);
      return { isCorrect: true, feedback: `Close enough (minor typo: ${typoDetails}).`, confidence: 0.6 };
    }
 
    return { isCorrect: false, feedback: `Expected: ${request.expectedAnswer}`, confidence: 0.0 };
  }

  private async aiValidation(request: ValidationRequest): Promise<ValidationResult> {
    const prompt = this.buildPrompt(request);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Portuguese language tutor. Evaluate student answers with intelligence and flexibility, considering context, common variations, and minor errors.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';
    
    return this.parseAIResponse(aiResponse, request);
  }

  private buildPrompt(request: ValidationRequest): string {
    const { userAnswer, expectedAnswer, exerciseType, context, language } = request;
    
    return `
Exercise Type: ${exerciseType}
Context: ${context || 'Translation exercise'}
Expected Answer: "${expectedAnswer}"
Student Answer: "${userAnswer}"
Target Language: ${language === 'pt' ? 'Portuguese (European)' : 'English'}

Please evaluate if the student's answer is correct, considering:
1. Case variations (Por favor vs por favor)
2. Multiple valid translations (excuse me = desculpe OR com licença OR desculpa)
3. Partial matches for compound answers (if expected is "sorry/excuse me" and student writes "sorry" or "excuse me", accept it)
4. Minor typos or spelling mistakes
5. Regional variations
6. Context appropriateness
7. Informal vs formal variations (desculpa = informal, desculpe = formal, both valid)
8. Accent marks: Missing accents should be marked as PARTIALLY CORRECT, not wrong (e.g., "deitar" vs "deitar" - accept but show correct form)

IMPORTANT: Be GENEROUS with translations. If the student provides any reasonable translation that conveys the same meaning, accept it.
ACCENT TOLERANCE: If the answer is correct except for missing/wrong accents, mark it as CORRECT with feedback showing the proper accent form.

Examples of CORRECT answers to accept:
- "desculpa" → "sorry", "excuse me", "sorry/excuse me" (ALL CORRECT)
- "por favor" → "please" (case insensitive)
- "obrigado" → "thank you", "thanks" (ALL CORRECT)
- "nos nao nos deitamos cedo" → CORRECT (missing accents but meaning is clear)
- "deitar-se" vs "deitar-se" → CORRECT (accent difference but understandable)

Respond in this EXACT format:
CORRECT: [yes/no]
CONFIDENCE: [0.0-1.0]
FEEDBACK: [brief explanation]
ACCEPTED: [the accepted version of the answer, if correct]

Example:
CORRECT: yes
CONFIDENCE: 0.95
FEEDBACK: Correct! "sorry" is a valid translation for "desculpa"
ACCEPTED: sorry
`;
  }

  private parseAIResponse(response: string, request: ValidationRequest): ValidationResult {
    try {
      const lines = response.trim().split('\n');
      
      const correctLine = lines.find(l => l.startsWith('CORRECT:'))?.split(':')[1]?.trim();
      const confidenceLine = lines.find(l => l.startsWith('CONFIDENCE:'))?.split(':')[1]?.trim();
      const feedbackLine = lines.find(l => l.startsWith('FEEDBACK:'))?.split(':')[1]?.trim();
      const acceptedLine = lines.find(l => l.startsWith('ACCEPTED:'))?.split(':')[1]?.trim();
      
      const isCorrect = correctLine?.toLowerCase() === 'yes';
      const confidence = parseFloat(confidenceLine || '0') || 0;
      const feedback = feedbackLine || 'Evaluated by AI';
      const acceptedAnswer = acceptedLine || undefined;
      
      return {
        isCorrect,
        confidence,
        feedback,
        acceptedAnswer
      };
    } catch (error) {
      console.warn('Failed to parse AI response:', error);
      return this.enhancedFallbackValidation(request);
    }
  }

  private calculateEditDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private findTypoDetails(str1: string, str2: string): string {
    // Find the exact typo for single character differences
    if (str1.length === str2.length) {
      // Substitution
      for (let i = 0; i < str1.length; i++) {
        if (str1[i] !== str2[i]) {
          return `'${str1[i]}' should be '${str2[i]}'`;
        }
      }
    } else if (str1.length === str2.length + 1) {
      // Extra character in user input
      for (let i = 0; i < str2.length; i++) {
        if (str1[i] !== str2[i]) {
          return `remove extra '${str1[i]}'`;
        }
      }
      return `remove extra '${str1[str1.length - 1]}'`;
    } else if (str2.length === str1.length + 1) {
      // Missing character in user input
      for (let i = 0; i < str1.length; i++) {
        if (str1[i] !== str2[i]) {
          return `missing '${str2[i]}'`;
        }
      }
      return `missing '${str2[str2.length - 1]}'`;
    }
    return 'minor difference';
  }

  private checkAccentDifferences(str1: string, str2: string, userAnswer: string, expectedAnswer: string): { hasAccentDifference: boolean; message: string } {
    // Remove accents from both strings to compare base form
    const removeAccents = (text: string) => text
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/ñ/g, 'n');
    
    const str1NoAccents = removeAccents(str1);
    const str2NoAccents = removeAccents(str2);
    
    // If base forms match but original strings don't, it's an accent difference
    if (str1NoAccents === str2NoAccents && str1 !== str2) {
      return { 
        hasAccentDifference: true, 
        message: `Missing accents - correct form: "${expectedAnswer}"`
      };
    }
    
    return { hasAccentDifference: false, message: '' };
  }
}

// Export singleton instance
export const aiValidator = new AIValidator();

// Utility function for easy use in components
export async function validateAnswer(
  userAnswer: string,
  expectedAnswer: string,
  exerciseType: ValidationRequest['exerciseType'] = 'translation',
  context?: string,
  language: 'pt' | 'en' = 'pt'
): Promise<ValidationResult> {
  return await aiValidator.validateAnswer({
    userAnswer,
    expectedAnswer,
    exerciseType,
    context,
    language
  });
}

export type { ValidationResult, ValidationRequest }; 