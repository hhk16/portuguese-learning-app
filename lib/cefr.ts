export type CanDo = {
  id: string;
  text: string; // CEFR-style can-do statement
};

export type MicroLesson = {
  lessonId: string;
  title: string;
  canDoIds: string[];
};

export type Unit = {
  id: string; // u0..u15
  title: string;
  description: string;
  milestone?: { id: string; title: string; description: string };
  lessons: MicroLesson[];
};

// A1 CEFR Can-Do descriptors (expanded and comprehensive)
export const canDos: CanDo[] = [
  { id: "greet", text: "I can greet people and use simple polite forms." },
  { id: "introduce", text: "I can introduce myself and ask basic personal questions." },
  { id: "apologize", text: "I can apologize and get someone's attention politely." },
  { id: "numbers", text: "I can understand and say numbers 0–100." },
  { id: "time-date", text: "I can tell the time and give a date." },
  { id: "contact", text: "I can state my phone number and basic contact info." },
  { id: "order-food", text: "I can order food/drinks and ask for the bill." },
  { id: "preferences", text: "I can express simple likes/dislikes." },
  { id: "family", text: "I can talk simply about my family." },
  { id: "directions", text: "I can ask for and follow simple directions." },
  { id: "transport", text: "I can talk about basic transport and tickets." },
  { id: "shopping", text: "I can ask about sizes, prices, and pay." },
  { id: "present", text: "I can use basic present tense for daily routines." },
  { id: "form-fill", text: "I can fill in simple forms with personal details." },
  { id: "health", text: "I can describe basic symptoms and ask for help." },
  { id: "weather", text: "I can understand and talk about the weather." },
  { id: "invite", text: "I can make simple plans and invitations." },
  { id: "small-talk", text: "I can manage short exchanges in familiar contexts." },
  
  // New conjugation-focused can-do statements
  { id: "regular-verbs", text: "I can conjugate regular -ar, -er, -ir verbs in present tense." },
  { id: "irregular-verbs", text: "I can use essential irregular verbs (ser, estar, ter, fazer)." },
  { id: "past-actions", text: "I can talk about completed actions in the past." },
  { id: "past-habits", text: "I can describe past habits and ongoing situations." },
  { id: "future-plans", text: "I can express future plans and intentions." },
  { id: "vocabulary", text: "I can use essential vocabulary for daily situations." },
  { id: "culture", text: "I can understand basic Portuguese cultural references." },
  { id: "expert-level", text: "I can handle complex A1+ situations with confidence." },
];

export const canDoById: Record<string, CanDo> = Object.fromEntries(canDos.map(c => [c.id, c]));

// CEFR A1 Units (expanded to include all essential content)
export const units: Unit[] = [
  {
    id: "u0",
    title: "Foundation: Pronúncia & Números",
    description: "Sounds of PT-PT, spelling, and numbers 0–20.",
    milestone: { id: "u0-boss", title: "Pronúncia & Dictation Boss", description: "Mini dictation + pronunciation round" },
    lessons: [
      { lessonId: "mp1l1", title: "Sons do PT-PT (lh/nh/ão/ç)", canDoIds: ["greet"] },
      { lessonId: "mp1l2", title: "Soletrar & e-mails", canDoIds: ["form-fill"] },
      { lessonId: "m2l1", title: "Números 0–20", canDoIds: ["numbers"] },
    ],
  },
  {
    id: "u1",
    title: "Cumprimentos & Apresentações",
    description: "Greetings, names, formal/informal, nationalities & languages.",
    milestone: { id: "u1-boss", title: "Reception Scenario", description: "Greet, introduce, apologize politely" },
    lessons: [
      { lessonId: "m1l1", title: "Cumprimentos", canDoIds: ["greet"] },
      { lessonId: "m1l2", title: "Apresentações", canDoIds: ["introduce"] },
      { lessonId: "m1l3", title: "Formal vs Informal", canDoIds: ["apologize"] },
      { lessonId: "m3l1", title: "Nacionalidades & Línguas", canDoIds: ["introduce"] },
    ],
  },
  {
    id: "u2",
    title: "Números, Hora & Datas",
    description: "21–100, ordinals, time & dates.",
    lessons: [
      { lessonId: "mp2l1", title: "21–100; meses", canDoIds: ["numbers"] },
      { lessonId: "mp2l2", title: "Datas & ordinais", canDoIds: ["time-date"] },
      { lessonId: "m2l2", title: "Preços & telefone", canDoIds: ["contact", "numbers"] },
    ],
  },
  {
    id: "u3",
    title: "Café & Restaurante",
    description: "Ordering, preferences, paying.",
    lessons: [
      { lessonId: "m6l1", title: "No café", canDoIds: ["order-food"] },
      { lessonId: "m6l2", title: "Preferências", canDoIds: ["preferences"] },
    ],
  },
  {
    id: "u4",
    title: "Família & Possessivos",
    description: "Family and basics of possessives.",
    lessons: [
      { lessonId: "m4l1", title: "Família", canDoIds: ["family"] },
      { lessonId: "m4l2", title: "Possessivos", canDoIds: ["family"] }
    ]
  },
  {
    id: "u5",
    title: "Cidade & Direções",
    description: "Places, directions, transport.",
    lessons: [
      { lessonId: "m7l1", title: "Direções", canDoIds: ["directions"] },
      { lessonId: "m7l2", title: "Transportes", canDoIds: ["transport"] }
    ]
  },
  {
    id: "u6",
    title: "Compras & Dinheiro",
    description: "Sizes, colors, prices.",
    lessons: [
      { lessonId: "m8l1", title: "Roupas & tamanhos", canDoIds: ["shopping"] },
      { lessonId: "m8l2", title: "Cores & preços", canDoIds: ["shopping"] }
    ]
  },
  {
    id: "u7",
    title: "Rotina & Presente",
    description: "Present regular verbs; routine.",
    lessons: [
      { lessonId: "mp3l1", title: "Present reg.", canDoIds: ["present"] },
      { lessonId: "mp3l2", title: "Rotina", canDoIds: ["present"] }
    ]
  },
  {
    id: "u8",
    title: "Saúde & Emergências",
    description: "Symptoms; pharmacy; urgent help.",
    lessons: [
      { lessonId: "m10l1", title: "Sintomas", canDoIds: ["health"] },
      { lessonId: "m10l2", title: "Urgências", canDoIds: ["health"] }
    ]
  },
  {
    id: "u9",
    title: "Tempo, Conversa & Cultura",
    description: "Weather; invitations; small talk; culture.",
    lessons: [
      { lessonId: "m11l1", title: "Tempo", canDoIds: ["weather"] },
      { lessonId: "m11l2", title: "Convites", canDoIds: ["invite"] },
      { lessonId: "phrases2l2", title: "Sentimentos", canDoIds: ["small-talk"] }
    ]
  },
  
  // NEW UNITS FOR CONJUGATION AND ADVANCED CONTENT
  {
    id: "u10",
    title: "Conjugação: Presente Básico",
    description: "Master regular and irregular present tense verbs.",
    milestone: { id: "u10-boss", title: "Conjugation Champion", description: "Complete verb conjugation challenge" },
    lessons: [
      { lessonId: "conj1el1", title: "Regular -AR Verbs Present Tense", canDoIds: ["regular-verbs", "present"] },
      { lessonId: "conj1el2", title: "Regular -ER and -IR Verbs Present Tense", canDoIds: ["regular-verbs", "present"] },
    ],
  },
  {
    id: "u11",
    title: "Conjugação: Verbos Irregulares",
    description: "Essential irregular verbs for daily communication.",
    milestone: { id: "u11-boss", title: "Irregular Verb Master", description: "Navigate complex irregular verb scenarios" },
    lessons: [
      { lessonId: "conj2el1", title: "Ser vs Estar - Being Verbs Mastery", canDoIds: ["irregular-verbs", "present"] },
      { lessonId: "conj2el2", title: "TER and FAZER - Essential Irregular Verbs", canDoIds: ["irregular-verbs", "present"] },
    ],
  },
  {
    id: "u12",
    title: "Conjugação: Passado Completo",
    description: "Talk about completed actions in the past.",
    milestone: { id: "u12-boss", title: "Past Tense Expert", description: "Master storytelling in past tense" },
    lessons: [
      { lessonId: "conj3el1", title: "Regular Preterite Past Tense", canDoIds: ["past-actions"] },
    ],
  },
  {
    id: "u13",
    title: "Conjugação: Passado Imperfeito",
    description: "Describe past habits and ongoing situations.",
    milestone: { id: "u13-boss", title: "Past Habits Master", description: "Narrate childhood memories and habits" },
    lessons: [
      { lessonId: "conj4el1", title: "Regular Imperfect Past Tense", canDoIds: ["past-habits"] },
    ],
  },
  {
    id: "u14",
    title: "Conjugação: Futuro",
    description: "Express future plans and intentions.",
    milestone: { id: "u14-boss", title: "Future Planner", description: "Plan and discuss future events" },
    lessons: [
      { lessonId: "conj5el1", title: "Near Future with IR + Infinitive", canDoIds: ["future-plans"] },
    ],
  },
  {
    id: "u15",
    title: "Vocabulário Essencial",
    description: "Core vocabulary across all life domains.",
    milestone: { id: "u15-boss", title: "Vocabulary Champion", description: "Demonstrate mastery of essential vocabulary" },
    lessons: [
      { lessonId: "vocab1el1", title: "Daily Objects & Home", canDoIds: ["vocabulary"] },
      { lessonId: "vocab1el2", title: "House & Furniture", canDoIds: ["vocabulary"] },
      { lessonId: "vocab2el1", title: "Body Parts & Health", canDoIds: ["vocabulary", "health"] },
      { lessonId: "vocab2el2", title: "Clothing & Accessories", canDoIds: ["vocabulary", "shopping"] },
    ],
  },
  {
    id: "u16",
    title: "Cultura Portuguesa",
    description: "Portuguese culture, traditions, and social contexts.",
    milestone: { id: "u16-boss", title: "Cultural Navigator", description: "Navigate Portuguese cultural situations" },
    lessons: [
      { lessonId: "cultural1el1", title: "Portuguese Traditions & Holidays", canDoIds: ["culture", "small-talk"] },
      { lessonId: "cultural1el2", title: "Food Culture & Dining Etiquette", canDoIds: ["culture", "order-food"] },
    ],
  },
];

export function getUnits(): Unit[] { return units; }
export function getUnitById(id: string): Unit | undefined { return units.find(u => u.id === id); }

export function getCanDosForLesson(lessonId: string): CanDo[] {
  for (const unit of units) {
    const ml = unit.lessons.find(l => l.lessonId === lessonId);
    if (ml) return ml.canDoIds.map(id => canDoById[id]).filter(Boolean);
  }
  return [];
} 