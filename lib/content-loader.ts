// Optimized content loader with dynamic imports and caching
import { Module, Lesson, Exercise } from './content';

// Cache for loaded modules to avoid re-importing
const moduleCache = new Map<string, Module>();
const modulePromiseCache = new Map<string, Promise<Module[]>>();

// Lightweight module metadata (no exercises/content)
export interface ModuleMetadata {
  id: string;
  title: string;
  description: string;
  lessonCount?: number;
}

// Get lightweight metadata without loading full content
export function getModuleMetadata(): ModuleMetadata[] {
  // This returns just the metadata, not the full content
  return [
    // Core A1 Foundation
    { id: 'm1', title: '🌟 Greetings & Introductions', description: 'Master Portuguese greetings', lessonCount: 4 },
    { id: 'm2', title: '🔢 Numbers & Time', description: 'Learn numbers and time expressions', lessonCount: 4 },
    { id: 'm3', title: '👨‍👩‍👧‍👦 Family & Descriptions', description: 'Family members and descriptions', lessonCount: 4 },
    { id: 'm4', title: '🍽️ Food & Restaurant', description: 'Food vocabulary and ordering', lessonCount: 4 },
    { id: 'm5', title: '🏠 Home & Daily Life', description: 'Home and daily routines', lessonCount: 4 },
    { id: 'm6', title: '🚇 Transport & Directions', description: 'Getting around in Portuguese', lessonCount: 4 },
    { id: 'm7', title: '🛍️ Shopping & Services', description: 'Shopping and services vocabulary', lessonCount: 4 },
    { id: 'm8', title: '⛅ Weather & Seasons', description: 'Weather and seasonal expressions', lessonCount: 4 },
    { id: 'm9', title: '🎉 Leisure & Hobbies', description: 'Free time activities', lessonCount: 4 },
    { id: 'm10', title: '💼 Work & Professions', description: 'Jobs and workplace Portuguese', lessonCount: 4 },
    { id: 'm11', title: '🏥 Health & Body', description: 'Health and body vocabulary', lessonCount: 4 },
    { id: 'm12', title: '🎓 Education & Learning', description: 'School and learning terms', lessonCount: 4 },
    
    // Enhanced versions
    { id: 'm7enhanced', title: '🛍️ Shopping & Services (Enhanced PPP)', description: 'Enhanced shopping module', lessonCount: 4 },
    { id: 'm8enhanced', title: '⛅ Weather & Seasons (Enhanced PPP)', description: 'Enhanced weather module', lessonCount: 4 },
    { id: 'm9enhanced', title: '🎉 Leisure & Hobbies (Enhanced PPP)', description: 'Enhanced leisure module', lessonCount: 4 },
    { id: 'm10enhanced', title: '💼 Work & Professions (Enhanced PPP)', description: 'Enhanced work module', lessonCount: 4 },
    { id: 'm11enhanced', title: '🏥 Health & Body (Enhanced PPP)', description: 'Enhanced health module', lessonCount: 4 },
    { id: 'm12enhanced', title: '🎓 Education & Learning (Enhanced PPP)', description: 'Enhanced education module', lessonCount: 4 },
    
    // Conjugation modules
    { id: 'conjugation1enhanced', title: '📝 Conjugation I: Regular Present', description: 'Regular present tense', lessonCount: 3 },
    { id: 'conjugation2enhanced', title: '📝 Conjugation II: Irregular Present', description: 'Irregular present tense', lessonCount: 3 },
    { id: 'conjugation3enhanced', title: '📝 Conjugation III: Past Tenses', description: 'Past tense conjugations', lessonCount: 3 },
    { id: 'conjugation4enhanced', title: '📝 Conjugation IV: Future & Conditional', description: 'Future and conditional', lessonCount: 3 },
    { id: 'conjugation5enhanced', title: '📝 Conjugation V: Subjunctive', description: 'Subjunctive mood', lessonCount: 3 },
    
    // Vocabulary modules
    { id: 'vocab1enhanced', title: '🎨 Essential Vocabulary I', description: 'Colors, numbers, body', lessonCount: 3 },
    { id: 'vocab2enhanced', title: '🏡 Essential Vocabulary II', description: 'House and furniture', lessonCount: 3 },
    { id: 'vocab3enhanced', title: '👔 Essential Vocabulary III', description: 'Clothing and shopping', lessonCount: 3 },
    { id: 'vocab4enhanced', title: '🌍 Essential Vocabulary IV', description: 'Travel and tourism', lessonCount: 3 },
    { id: 'vocab5enhanced', title: '💻 Essential Vocabulary V', description: 'Technology and modern life', lessonCount: 3 },
    { id: 'vocab6enhanced', title: '🌿 Essential Vocabulary VI', description: 'Nature and environment', lessonCount: 3 },
    { id: 'vocab7enhanced', title: '🎭 Essential Vocabulary VII', description: 'Culture and entertainment', lessonCount: 3 },
    
    // Phrases
    { id: 'phrases1', title: '💬 Essential Phrases I', description: 'Core communication phrases', lessonCount: 3 },
    { id: 'phrases2', title: '💬 Essential Phrases II', description: 'Advanced phrases', lessonCount: 3 },
    
    // Cultural modules
    { id: 'cultural1enhanced', title: '🇵🇹 Portuguese Culture I', description: 'Traditions and customs', lessonCount: 3 },
    { id: 'cultural2enhanced', title: '🇵🇹 Portuguese Culture II', description: 'Food and festivals', lessonCount: 3 },
    { id: 'cultural3enhanced', title: '🇵🇹 Portuguese Culture III', description: 'Art and history', lessonCount: 3 },
    
    // Expert modules
    { id: 'expert1enhanced', title: '🏆 Expert Level I', description: 'Advanced grammar patterns', lessonCount: 3 },
    { id: 'expert2enhanced', title: '🏆 Expert Level II', description: 'Complex verb forms', lessonCount: 3 },
    { id: 'expert3enhanced', title: '🏆 Expert Level III', description: 'Idiomatic expressions', lessonCount: 3 },
    { id: 'expert4enhanced', title: '🏆 Expert Level IV', description: 'Business Portuguese', lessonCount: 3 },
    { id: 'expert5enhanced', title: '🏆 Expert Level V', description: 'Academic Portuguese', lessonCount: 3 },
    { id: 'expert6enhanced', title: '🏆 Expert Level VI', description: 'Media and news', lessonCount: 3 },
    { id: 'expert7enhanced', title: '🏆 Expert Level VII', description: 'Literature basics', lessonCount: 3 },
    { id: 'expert8enhanced', title: '🏆 Expert Level VIII', description: 'Regional variations', lessonCount: 3 },
    { id: 'expert9enhanced', title: '🏆 Expert Level IX', description: 'Advanced conversation', lessonCount: 3 },
    { id: 'expert10enhanced', title: '🏆 Expert Level X', description: 'Mastery challenge', lessonCount: 3 },
    
    // Physical classes
    { id: 'physical', title: '📝 Physical Classes', description: 'Your class notes as lessons', lessonCount: 3 },
    { id: 'physical-enhanced', title: '🎯 Physical Classes - Interactive', description: 'Enhanced immersive lessons', lessonCount: 3 },
  ];
}

// Dynamic module loaders
async function loadCoreModules(): Promise<Module[]> {
  const { modules } = await import('./content');
  return modules;
}

async function loadEnhancedModules(): Promise<Module[]> {
  const { enhancedModules } = await import('./enhanced-content');
  return enhancedModules;
}

async function loadConjugationModules(): Promise<Module[]> {
  const { conjugationModules } = await import('./conjugation-content');
  return conjugationModules;
}

async function loadPhaseAModules(): Promise<Module[]> {
  const { phaseADenseModules } = await import('./phase-a-dense');
  return phaseADenseModules;
}

async function loadPhaseBModules(): Promise<Module[]> {
  const { phaseBDenseModules } = await import('./phase-b-dense');
  return phaseBDenseModules;
}

async function loadPhaseCModules(): Promise<Module[]> {
  const { phaseCDenseModules } = await import('./phase-c-dense');
  return phaseCDenseModules;
}

async function loadPhaseDModules(): Promise<Module[]> {
  const { phaseDDenseModules } = await import('./phase-d-dense');
  return phaseDDenseModules;
}

async function loadPhaseEModules(): Promise<Module[]> {
  const { phaseEDenseModules } = await import('./phase-e-dense');
  return phaseEDenseModules;
}

async function loadPhysicalClassesModule(): Promise<Module> {
  const { physicalClassesEnhancedModule } = await import('./physical-classes-enhanced');
  return physicalClassesEnhancedModule;
}

// Get a specific module by ID (with caching)
export async function getModuleById(moduleId: string): Promise<Module | null> {
  // Check cache first
  if (moduleCache.has(moduleId)) {
    return moduleCache.get(moduleId)!;
  }

  // Determine which chunk to load based on module ID
  let modulePromise: Promise<Module[]>;
  
  if (moduleId === 'physical' || moduleId === 'physical-enhanced') {
    const module = await loadPhysicalClassesModule();
    moduleCache.set(moduleId, module);
    return module;
  } else if (moduleId.includes('enhanced')) {
    // Load enhanced modules
    if (moduleId.includes('conjugation')) {
      modulePromise = loadConjugationModules();
    } else if (moduleId.includes('vocab') || moduleId.includes('cultural') || moduleId.includes('expert')) {
      modulePromise = loadEnhancedModules();
    } else if (moduleId.startsWith('m7') || moduleId.startsWith('m8') || moduleId.startsWith('m9') || 
               moduleId.startsWith('m10') || moduleId.startsWith('m11') || moduleId.startsWith('m12')) {
      modulePromise = loadPhaseAModules();
    } else {
      modulePromise = loadEnhancedModules();
    }
  } else if (moduleId.startsWith('phrases')) {
    modulePromise = loadPhaseBModules();
  } else {
    // Load core modules for m1-m12
    modulePromise = loadCoreModules();
  }

  const modules = await modulePromise;
  const module = modules.find(m => m.id === moduleId);
  
  if (module) {
    moduleCache.set(moduleId, module);
  }
  
  return module || null;
}

// Get a specific lesson by ID (loads only the required module)
export async function getLessonByIdOptimized(lessonId: string): Promise<Lesson | null> {
  // Try to determine module from lesson ID patterns
  let possibleModuleIds: string[] = [];
  
  // Physical classes
  if (lessonId.startsWith('physical')) {
    possibleModuleIds = ['physical', 'physical-enhanced'];
  }
  // Core modules (m1l1, m2l3, etc.)
  else if (lessonId.match(/^m\d+l\d+/)) {
    const moduleNum = lessonId.match(/^m(\d+)/)?.[1];
    if (moduleNum) {
      possibleModuleIds = [`m${moduleNum}`];
    }
  }
  // Enhanced modules
  else if (lessonId.includes('enhanced')) {
    // Try to extract module ID from lesson ID
    const parts = lessonId.split('enhanced');
    if (parts[0]) {
      possibleModuleIds = [`${parts[0]}enhanced`];
    }
  }
  // Conjugation lessons
  else if (lessonId.startsWith('conj')) {
    possibleModuleIds = ['conjugation1enhanced', 'conjugation2enhanced', 'conjugation3enhanced', 
                         'conjugation4enhanced', 'conjugation5enhanced'];
  }
  // Vocabulary lessons
  else if (lessonId.startsWith('vocab')) {
    possibleModuleIds = ['vocab1enhanced', 'vocab2enhanced', 'vocab3enhanced', 'vocab4enhanced',
                         'vocab5enhanced', 'vocab6enhanced', 'vocab7enhanced'];
  }
  
  // Search in possible modules first
  for (const moduleId of possibleModuleIds) {
    const module = await getModuleById(moduleId);
    if (module) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) return lesson;
    }
  }
  
  // If not found, search all modules (fallback)
  const allModuleIds = getModuleMetadata().map(m => m.id);
  for (const moduleId of allModuleIds) {
    const module = await getModuleById(moduleId);
    if (module) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) return lesson;
    }
  }
  
  return null;
}

// Get all modules (loads everything - use sparingly)
export async function getAllModules(): Promise<Module[]> {
  const [
    core,
    enhanced,
    conjugation,
    phaseA,
    phaseB,
    phaseC,
    phaseD,
    phaseE,
    physical
  ] = await Promise.all([
    loadCoreModules(),
    loadEnhancedModules(),
    loadConjugationModules(),
    loadPhaseAModules(),
    loadPhaseBModules(),
    loadPhaseCModules(),
    loadPhaseDModules(),
    loadPhaseEModules(),
    loadPhysicalClassesModule()
  ]);

  // Filter out replaced modules
  const phaseAReplacedIds = ['m7', 'm8', 'm9', 'm10', 'm11', 'm12'];
  const phaseBReplacedIds = ['phrases1', 'phrases2'];
  const phaseCReplacedIds = ['vocab5', 'vocab6', 'vocab7'];
  const phaseDReplacedIds = ['cultural1', 'cultural2', 'cultural3'];
  const phaseEReplacedIds = ['expert1', 'expert2', 'expert3', 'expert4', 'expert5', 
                             'expert6', 'expert7', 'expert8', 'expert9', 'expert10'];

  const filteredCore = core.filter(m => 
    !phaseAReplacedIds.includes(m.id) &&
    !phaseBReplacedIds.includes(m.id) &&
    !phaseCReplacedIds.includes(m.id) &&
    !phaseDReplacedIds.includes(m.id) &&
    !phaseEReplacedIds.includes(m.id)
  );

  const filteredEnhanced = enhanced.filter(m =>
    !phaseBReplacedIds.includes(m.id.replace('enhanced', '')) &&
    !phaseCReplacedIds.includes(m.id.replace('enhanced', '')) &&
    !phaseDReplacedIds.includes(m.id.replace('enhanced', '')) &&
    !phaseEReplacedIds.includes(m.id.replace('enhanced', ''))
  );

  return [
    ...filteredCore,
    ...phaseA,
    ...phaseB,
    ...phaseC,
    ...phaseD,
    ...phaseE,
    physical,
    ...filteredEnhanced,
    ...conjugation
  ];
}

// Preload a module (for better UX)
export async function preloadModule(moduleId: string): Promise<void> {
  await getModuleById(moduleId);
}

// Clear cache (if needed for memory management)
export function clearModuleCache(): void {
  moduleCache.clear();
  modulePromiseCache.clear();
}
