import { type Lesson, type Exercise, getAllFlashcards } from "@/lib/content";
import { useAppStore } from "@/lib/store";

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function clone<T>(e: T): T { return JSON.parse(JSON.stringify(e)); }

// ✨ Enhanced orchestrator with pedagogical intelligence concepts from Phase 2
export function orchestrateLesson(lesson: Lesson, targetCount = 32): Exercise[] {
  const stats = useAppStore.getState().itemStats;
  const allCards = getAllFlashcards(); // Access ALL 800+ vocabulary items
  
  const base = lesson.exercises;
  const flash = base.filter(e => e.type === "flashcard");
  const pool: Exercise[] = [];

  // Get related vocabulary with enhanced semantic matching
  const relatedCards = getRelatedVocabularyEnhanced(lesson, allCards);

  // Combine lesson flashcards with related vocabulary for MAXIMUM DENSITY
  const combinedCards = [...flash, ...relatedCards].slice(0, 24);

  // ✨ Enhanced ranking with pedagogical factors
  const ranked = [...combinedCards].sort((a, b) => {
    // Factor 1: Statistical weakness (existing logic)
    const sa = stats[a.id]; 
    const sb = stats[b.id];
    const scoreA = sa ? (sa.correct + 1) / (sa.attempts + 2) : 0.5;
    const scoreB = sb ? (sb.correct + 1) / (sb.attempts + 2) : 0.5;
    
    // Factor 2: Content relevance (lesson term matching)
    const relevanceA = hasContentRelevance(a, lesson);
    const relevanceB = hasContentRelevance(b, lesson);
    
    // Combined score (lower is higher priority)
    const finalScoreA = scoreA - relevanceA * 0.1;
    const finalScoreB = scoreB - relevanceB * 0.1;
    
    return finalScoreA - finalScoreB;
  });

  // Build diversified tasks with enhanced variety
  for (const item of ranked) {
    if (!item.term || !item.translation) continue;
    
    // Core vocabulary exercises
    pool.push({ 
      id: item.id + "-mcq1", 
      type: "mcq", 
      prompt: `Tradução: '${item.term}'`, 
      options: generateSmartOptionsEnhanced(item, combinedCards), 
      correct: item.translation
    });
    
    // Enhanced exercise generation based on content analysis
    if (hasNumberContent(item)) {
      pool.push({ 
        id: item.id + "-num-context", 
        type: "typing", 
        prompt: `Complete com número: "${item.term}" significa quantos?`, 
        correct: item.translation
      });
    }
    
    if (hasVerbContent(item)) {
      pool.push({ 
        id: item.id + "-conj-practice", 
        type: "typing", 
        prompt: `Use em frase: "${item.term}"`, 
        correct: `Eu ${item.term}.`
      });
    }
    
    // Standard production exercises
    pool.push({ 
      id: item.id + "-type-pt", 
      type: "typing", 
      prompt: `Escreve em PT: '${item.translation}'`, 
      correct: item.term
    });
    
    pool.push({ 
      id: item.id + "-type-en", 
      type: "typing", 
      prompt: `Traduz: '${item.term}'`, 
      correct: item.translation
    });
  }

  // Enhanced final selection with balanced variety
  return shuffle(pool).slice(0, targetCount);
}

// ✨ Enhanced related vocabulary selection with better semantic matching
function getRelatedVocabularyEnhanced(lesson: Lesson, allCards: Exercise[]): Exercise[] {
  const lessonTerms = lesson.exercises
    .filter(e => e.type === "flashcard" && e.term)
    .map(e => e.term!.toLowerCase());
  
  const related = allCards.filter(card => {
    if (!card.term || !card.translation) return false;
    
    const term = card.term.toLowerCase();
    
    // Skip if already in lesson
    if (lessonTerms.some(lt => lt === term)) return false;
    
    // Enhanced semantic relationships
    if (hasEnhancedSemanticRelation(lessonTerms, term, lesson)) {
      return true;
    }
    
    return false;
  });

  return shuffle(related).slice(0, 16);
}

// ✨ Enhanced semantic relationship detection
function hasEnhancedSemanticRelation(lessonTerms: string[], term: string, lesson: Lesson): boolean {
  const lessonTitle = lesson.title.toLowerCase();
  const lessonId = lesson.id;
  
  // Unit-based relationships (Phase 2 concept)
  if (lessonId.startsWith('mp1') || lessonId.startsWith('m2l1')) {
    // Foundation unit - numbers, pronunciation
    if (term.match(/\d+|zero|um|dois|três|quatro|cinco|seis|sete|oito|nove|dez/)) return true;
    if (term.match(/ão|nh|lh|ç/)) return true;
  }
  
  if (lessonId.startsWith('m1')) {
    // Basic interactions - greetings, courtesy
    if (term.match(/olá|bom|boa|tchau|obrigado|desculpa|por favor/)) return true;
  }
  
  if (lessonId.startsWith('m3')) {
    // Food and café
    if (term.match(/café|chá|água|pão|queijo|restaurante|mesa|conta/)) return true;
  }
  
  if (lessonId.startsWith('m4')) {
    // Family and personal
    if (term.match(/pai|mãe|filho|filha|irmão|irmã|família|nome|idade/)) return true;
  }
  
  // Original semantic categories (enhanced)
  const categoryGroups = {
    colors: ['vermelho', 'azul', 'verde', 'amarelo', 'branco', 'preto', 'rosa', 'roxo', 'castanho', 'cinzento', 'laranja'],
    food: ['pão', 'água', 'carne', 'peixe', 'fruta', 'legumes', 'arroz', 'queijo', 'bacalhau', 'pastel'],
    verbs: ['ser', 'estar', 'ter', 'fazer', 'ir', 'vir', 'falar', 'comer', 'trabalhar', 'estudar'],
    family: ['mãe', 'pai', 'irmão', 'irmã', 'filho', 'filha', 'avô', 'avó'],
    house: ['casa', 'quarto', 'cozinha', 'sala', 'mesa', 'cadeira', 'cama', 'sofá'],
    work: ['médico', 'professor', 'enfermeiro', 'trabalhar', 'emprego', 'escritório'],
    numbers: ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'vinte', 'trinta', 'cem'],
    time: ['hora', 'horas', 'minuto', 'segundo', 'manhã', 'tarde', 'noite', 'hoje', 'ontem', 'amanhã'],
    directions: ['direita', 'esquerda', 'frente', 'atrás', 'perto', 'longe', 'banco', 'correios', 'farmácia']
  };
  
  for (const [category, words] of Object.entries(categoryGroups)) {
    const hasLessonCategory = lessonTerms.some(lt => words.some(w => lt.includes(w)));
    const hasTermCategory = words.some(w => term.includes(w));
    
    if (hasLessonCategory && hasTermCategory) return true;
  }
  
  return false;
}

// ✨ Enhanced MCQ option generation with smarter distractors
function generateSmartOptionsEnhanced(target: Exercise, pool: Exercise[]): string[] {
  if (!target.translation) return ["Option 1", "Option 2", "Option 3"];
  
  const candidates = pool.filter(item => 
    item.translation && 
    item.id !== target.id &&
    item.translation !== target.translation
  );
  
  // Prioritize semantically similar distractors
  const semantic = candidates.filter(item => 
    hasSimilarComplexity(target.translation!, item.translation!)
  );
  
  // Select challenging distractors
  const wrong1 = semantic.length > 0 ? 
    semantic[Math.floor(Math.random() * semantic.length)].translation! :
    candidates[Math.floor(Math.random() * candidates.length)].translation!;
    
  const remaining = candidates.filter(item => item.translation !== wrong1);
  const wrong2 = remaining.length > 0 ? 
    remaining[Math.floor(Math.random() * remaining.length)].translation! :
    "Wrong option";

  return shuffle([target.translation, wrong1, wrong2]);
}

// ✨ Helper functions for enhanced content analysis
function hasContentRelevance(exercise: Exercise, lesson: Lesson): number {
  let relevance = 0;
  const content = `${exercise.term || ""} ${exercise.translation || ""}`.toLowerCase();
  const lessonContent = lesson.exercises.map(ex => `${ex.term || ""} ${ex.prompt || ""}`).join(' ').toLowerCase();
  
  // Check for shared vocabulary
  const words = content.split(/\s+/);
  words.forEach(word => {
    if (word.length > 3 && lessonContent.includes(word)) {
      relevance += 1;
    }
  });
  
  return relevance;
}

function hasNumberContent(exercise: Exercise): boolean {
  const content = `${exercise.term || ""} ${exercise.translation || ""}`.toLowerCase();
  return content.match(/\d+|número|preço|euros?|cêntimos?|zero|um|dois|três|quatro|cinco/) !== null;
}

function hasVerbContent(exercise: Exercise): boolean {
  const content = `${exercise.term || ""}`.toLowerCase();
  return content.match(/ar$|er$|ir$|ser|estar|ter|fazer|falar|comer|trabalhar/) !== null;
}

function hasSimilarComplexity(str1: string, str2: string): boolean {
  // Length similarity
  if (Math.abs(str1.length - str2.length) <= 2) return true;
  
  // Same category (both have numbers, both have articles, etc.)
  const hasNumbers1 = /\d/.test(str1);
  const hasNumbers2 = /\d/.test(str2);
  if (hasNumbers1 && hasNumbers2) return true;
  
  const hasArticles1 = /\b(o|a|os|as|um|uma)\b/.test(str1);
  const hasArticles2 = /\b(o|a|os|as|um|uma)\b/.test(str2);
  if (hasArticles1 && hasArticles2) return true;
  
  return false;
} 