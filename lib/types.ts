// ✨ Enhanced content types with comprehensive pedagogical metadata
// Following CEFR guidelines and modern language learning best practices

export type ExerciseType = "flashcard" | "mcq" | "typing" | "listening" | "matching" | "order" | "dialogue" | "pronunciation" | "spelling" | "price" | "conjugation" | "directions" | "form" | "conjugationGrid" | "dirPath";

// Linguistic skill categories for targeted practice
export type SkillTag = 
  | "pronunciation" | "listening" | "spelling" | "accents"
  | "numbers" | "time" | "dates" | "ordinals"
  | "vocabulary" | "translation" | "recognition"
  | "conjugation" | "grammar" | "prepositions" | "contractions"
  | "directions" | "spatial" | "movement"
  | "ordering" | "sequencing" | "structure"
  | "dialogue" | "interaction" | "pragmatics"
  | "reading" | "comprehension" | "production";

// Thematic content categories for contextualized learning
export type CategoryTag = 
  | "greetings" | "introductions" | "courtesy"
  | "family" | "personal" | "identity"
  | "food" | "dining" | "café" | "restaurant"
  | "shopping" | "clothes" | "prices" | "payment"
  | "health" | "pharmacy" | "symptoms" | "emergency"
  | "travel" | "transport" | "directions-category" | "accommodation"
  | "work" | "school" | "education" | "routine"
  | "weather" | "seasons" | "environment"
  | "culture" | "traditions" | "social"
  | "technology" | "communication" | "contact";

// CEFR proficiency levels for progressive difficulty
export type CEFRLevel = "A1.1" | "A1.2" | "A1.3";

// Enhanced Exercise interface with pedagogical metadata
export interface EnhancedExercise {
  id: string;
  type: ExerciseType;
  
  // Core content (existing)
  prompt?: string;
  term?: string;
  translation?: string;
  options?: string[];
  correct?: string | string[];
  audioTextPt?: string;
  pairs?: { a: string; b: string }[];
  items?: string[]; // for ordering
  
  // Dialogue optional
  dialogue?: { pt?: string; choice?: { text: string; good: boolean }[] }[];
  
  // Direction map path (simple grid-based)
  pathNodes?: { id: number; x: number; y: number; label?: string }[];
  pathEdges?: { from: number; to: number; label: string }[];
  correctPath?: number[]; // sequence of node ids

  // ✨ NEW: Comprehensive pedagogical metadata
  unitId?: string; // CEFR unit (u0, u1, etc.)
  lessonId?: string; // Source lesson ID
  skills?: SkillTag[]; // Linguistic skills targeted
  categories?: CategoryTag[]; // Thematic content areas
  canDoIds?: string[]; // CEFR can-do statements addressed
  cefrLevel?: CEFRLevel; // Granular difficulty within A1
  difficulty?: number; // 1-5 numeric difficulty
  estimatedTime?: number; // seconds
  weight?: number; // importance multiplier for orchestrator
}

// Skill and category definitions for UI and filtering
export const skillDefinitions: Record<SkillTag, { name: string; description: string; icon: string }> = {
  pronunciation: { name: "Pronunciation", description: "Correct sound production", icon: "🗣️" },
  listening: { name: "Listening", description: "Audio comprehension", icon: "👂" },
  spelling: { name: "Spelling", description: "Correct orthography", icon: "✍️" },
  accents: { name: "Accents", description: "Diacritical marks", icon: "áç" },
  numbers: { name: "Numbers", description: "Numerical system", icon: "🔢" },
  time: { name: "Time", description: "Hours and temporal expressions", icon: "🕐" },
  dates: { name: "Dates", description: "Calendar and dating", icon: "📅" },
  ordinals: { name: "Ordinals", description: "Sequential numbers", icon: "1️⃣" },
  vocabulary: { name: "Vocabulary", description: "Word knowledge", icon: "📚" },
  translation: { name: "Translation", description: "Cross-language equivalence", icon: "🔄" },
  recognition: { name: "Recognition", description: "Word identification", icon: "👁️" },
  conjugation: { name: "Conjugation", description: "Verb forms", icon: "⚡" },
  grammar: { name: "Grammar", description: "Structural rules", icon: "📝" },
  prepositions: { name: "Prepositions", description: "Spatial/temporal relations", icon: "📍" },
  contractions: { name: "Contractions", description: "Combined forms", icon: "🔗" },
  directions: { name: "Directions", description: "Spatial navigation", icon: "🧭" },
  spatial: { name: "Spatial", description: "Location relationships", icon: "📍" },
  movement: { name: "Movement", description: "Motion verbs and expressions", icon: "🚶" },
  ordering: { name: "Ordering", description: "Sequence arrangement", icon: "📋" },
  sequencing: { name: "Sequencing", description: "Temporal order", icon: "⏭️" },
  structure: { name: "Structure", description: "Sentence organization", icon: "🏗️" },
  dialogue: { name: "Dialogue", description: "Conversational skills", icon: "💬" },
  interaction: { name: "Interaction", description: "Social communication", icon: "🤝" },
  pragmatics: { name: "Pragmatics", description: "Contextual usage", icon: "🎭" },
  reading: { name: "Reading", description: "Text comprehension", icon: "📖" },
  comprehension: { name: "Comprehension", description: "Understanding skills", icon: "🧠" },
  production: { name: "Production", description: "Language creation", icon: "🎯" },
};

export const categoryDefinitions: Record<CategoryTag, { name: string; description: string; icon: string }> = {
  greetings: { name: "Greetings", description: "Hello, goodbye, basic courtesy", icon: "👋" },
  introductions: { name: "Introductions", description: "Personal presentation", icon: "👤" },
  courtesy: { name: "Courtesy", description: "Polite expressions", icon: "🙏" },
  family: { name: "Family", description: "Relatives and relationships", icon: "👨‍👩‍👧‍👦" },
  personal: { name: "Personal", description: "Individual information", icon: "🆔" },
  identity: { name: "Identity", description: "Self-description", icon: "🪪" },
  food: { name: "Food", description: "Meals and ingredients", icon: "🍽️" },
  dining: { name: "Dining", description: "Restaurant experience", icon: "🍴" },
  café: { name: "Café", description: "Coffee shop interactions", icon: "☕" },
  restaurant: { name: "Restaurant", description: "Formal dining", icon: "🏪" },
  shopping: { name: "Shopping", description: "Retail activities", icon: "🛒" },
  clothes: { name: "Clothes", description: "Clothing and fashion", icon: "👕" },
  prices: { name: "Prices", description: "Cost and payment", icon: "💰" },
  payment: { name: "Payment", description: "Transaction methods", icon: "💳" },
  health: { name: "Health", description: "Medical vocabulary", icon: "🏥" },
  pharmacy: { name: "Pharmacy", description: "Medication and drugstore", icon: "💊" },
  symptoms: { name: "Symptoms", description: "Health complaints", icon: "🤒" },
  emergency: { name: "Emergency", description: "Urgent situations", icon: "🚨" },
  travel: { name: "Travel", description: "Tourism and trips", icon: "✈️" },
  transport: { name: "Transport", description: "Public transportation", icon: "🚌" },
  "directions-category": { name: "Directions", description: "Navigation and location", icon: "🗺️" },
  accommodation: { name: "Accommodation", description: "Hotels and lodging", icon: "🏨" },
  work: { name: "Work", description: "Professional activities", icon: "💼" },
  school: { name: "School", description: "Educational contexts", icon: "🎓" },
  education: { name: "Education", description: "Learning and teaching", icon: "📚" },
  routine: { name: "Routine", description: "Daily activities", icon: "🔄" },
  weather: { name: "Weather", description: "Climate and conditions", icon: "🌤️" },
  seasons: { name: "Seasons", description: "Temporal cycles", icon: "🍂" },
  environment: { name: "Environment", description: "Natural surroundings", icon: "🌍" },
  culture: { name: "Culture", description: "Portuguese traditions", icon: "🇵🇹" },
  traditions: { name: "Traditions", description: "Cultural practices", icon: "🎭" },
  social: { name: "Social", description: "Community interactions", icon: "👥" },
  technology: { name: "Technology", description: "Digital tools", icon: "💻" },
  communication: { name: "Communication", description: "Information exchange", icon: "📞" },
  contact: { name: "Contact", description: "Personal details", icon: "📧" },
};

// ✨ Helper function to infer skills from exercise type and content
export function inferSkillsFromExercise(exercise: { type: ExerciseType; prompt?: string; term?: string }): SkillTag[] {
  const skills: SkillTag[] = [];
  
  switch (exercise.type) {
    case "pronunciation":
      skills.push("pronunciation", "listening");
      break;
    case "listening":
      skills.push("listening", "comprehension");
      break;
    case "spelling":
      skills.push("spelling", "accents", "production");
      break;
    case "conjugation":
    case "conjugationGrid":
      skills.push("conjugation", "grammar", "production");
      break;
    case "directions":
    case "dirPath":
      skills.push("directions", "spatial", "prepositions");
      break;
    case "typing":
      skills.push("production", "spelling");
      if (exercise.prompt?.includes("número") || exercise.prompt?.includes("preço")) {
        skills.push("numbers");
      }
      break;
    case "mcq":
      skills.push("recognition", "comprehension");
      break;
    case "flashcard":
      skills.push("vocabulary", "translation", "recognition");
      break;
    case "matching":
      skills.push("vocabulary", "recognition");
      break;
    case "order":
      skills.push("ordering", "structure", "grammar");
      break;
    case "dialogue":
      skills.push("dialogue", "interaction", "pragmatics");
      break;
    case "price":
      skills.push("numbers", "vocabulary");
      break;
    case "form":
      skills.push("production");
      break;
  }
  
  // Content-based skill inference
  const content = `${exercise.prompt || ""} ${exercise.term || ""}`.toLowerCase();
  if (content.match(/\d+|número|preço|euros?|cêntimos?/)) {
    skills.push("numbers");
  }
  if (content.match(/horas?|tempo|às|meio-dia/)) {
    skills.push("time");
  }
  if (content.match(/janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|data/)) {
    skills.push("dates");
  }
  if (content.match(/primeiro|segundo|terceiro|quarto|quinto|1º|2º|3º/)) {
    skills.push("ordinals");
  }
  
  return [...new Set(skills)]; // Remove duplicates
}

// ✨ Helper function to infer categories from exercise content
export function inferCategoriesFromExercise(exercise: { prompt?: string; term?: string; translation?: string }): CategoryTag[] {
  const categories: CategoryTag[] = [];
  const content = `${exercise.prompt || ""} ${exercise.term || ""} ${exercise.translation || ""}`.toLowerCase();
  
  // Family and personal
  if (content.match(/pai|mãe|filho|filha|irmão|irmã|avô|avó|marido|mulher|família/)) {
    categories.push("family");
  }
  if (content.match(/nome|idade|telefone|email|morada|nacionalidade/)) {
    categories.push("personal", "contact");
  }
  
  // Food and dining
  if (content.match(/café|chá|água|leite|pão|queijo|presunto|bolo|restaurante|mesa|conta|garçon/)) {
    categories.push("food", "café");
  }
  if (content.match(/almoço|jantar|pequeno-almoço|menu|prato|sobremesa/)) {
    categories.push("dining", "restaurant");
  }
  
  // Shopping and money
  if (content.match(/loja|comprar|vender|preço|euro|cêntimo|pagar|cartão|dinheiro/)) {
    categories.push("shopping", "prices", "payment");
  }
  if (content.match(/roupa|camisa|calças|sapatos|vestido|tamanho|cor/)) {
    categories.push("clothes", "shopping");
  }
  
  // Health
  if (content.match(/médico|hospital|farmácia|doente|dor|medicamento|saúde/)) {
    categories.push("health");
  }
  if (content.match(/farmácia|medicamento|comprimido|receita/)) {
    categories.push("pharmacy");
  }
  
  // Travel and transport
  if (content.match(/autocarro|comboio|metro|táxi|bilhete|estação|aeroporto/)) {
    categories.push("transport", "travel");
  }
  if (content.match(/hotel|quarto|reserva|turista|viagem/)) {
    categories.push("accommodation", "travel");
  }
  
  // Directions and location
  if (content.match(/direita|esquerda|em frente|atrás|perto|longe|banco|correios|supermercado/)) {
    categories.push("directions-category");
  }
  
  // Work and routine
  if (content.match(/trabalho|emprego|escritório|reunião|horário/)) {
    categories.push("work", "routine");
  }
  
  // Weather and environment
  if (content.match(/tempo|sol|chuva|vento|frio|calor|nuvem/)) {
    categories.push("weather");
  }
  
  // Greetings and courtesy
  if (content.match(/olá|bom dia|boa tarde|boa noite|tchau|desculpa|obrigado|por favor/)) {
    categories.push("greetings", "courtesy");
  }
  
  return [...new Set(categories)];
} 