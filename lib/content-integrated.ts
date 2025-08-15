// Integrated content file that includes conjugation modules
import { modules as originalModules, getLessonById } from './content';
import type { Exercise } from './content';
import { conjugationModules } from './conjugation-content';
import { enhancedModules } from './enhanced-content';
import { phaseADenseModules } from './phase-a-dense';
import { phaseBDenseModules } from './phase-b-dense';
import { phaseCDenseModules } from './phase-c-dense';
import { phaseDDenseModules } from './phase-d-dense';
import { phaseEDenseModules } from './phase-e-dense';
import physicalClassesModule from './physical-classes';
import { physicalClassesEnhancedModule } from './physical-classes-enhanced';

// Export all types from the original content file
export type { ExerciseType, Exercise, Lesson, Module } from './content';

// IDs of modules that have been enhanced/replaced in Phase A
const phaseAReplacedIds = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']; // Phase A complete: all core A1 modules replaced with dense versions

// IDs of modules that have been enhanced/replaced in Phase B  
const phaseBReplacedIds = ['vocab1', 'vocab2', 'vocab3', 'vocab4', 'vocab5', 'vocab6', 'vocab7']; // Phase B complete: all vocabulary modules replaced with dense versions

// IDs of modules that have been enhanced/replaced in Phase C
const phaseCReplacedIds = ['cult1', 'cult2', 'cult3']; // Phase C complete: all cultural modules replaced with dense versions

// IDs of modules that have been enhanced/replaced in Phase D
const phaseDReplacedIds = ['exp1', 'exp2', 'exp3', 'exp4', 'exp5', 'exp6', 'exp7', 'exp8', 'exp9', 'exp10']; // Phase D complete: all expert modules replaced with dense versions

// IDs of modules that have been enhanced/replaced in Phase E
const phaseEReplacedIds = ['conj1', 'conj2', 'conj3', 'conj4', 'conj5', 'conj6', 'conj7', 'conj8', 'conj9', 'conj10']; // Phase E complete: all conjugation modules replaced with dense versions

// Create integrated modules array
export const modules = [
  // Original modules (excluding those replaced in all phases)
  ...originalModules.filter(m => 
    !phaseAReplacedIds.includes(m.id) && 
    !phaseBReplacedIds.includes(m.id) &&
    !phaseCReplacedIds.includes(m.id) &&
    !phaseDReplacedIds.includes(m.id) &&
    !phaseEReplacedIds.includes(m.id)
  ),
  // Phase A dense modules (m1-m6 enhanced)
  ...phaseADenseModules,
  // Phase B dense modules (vocab1-7 enhanced)
  ...phaseBDenseModules,
  // Phase C dense modules (cult1-3 enhanced)
  ...phaseCDenseModules,
  // Phase D dense modules (exp1-10 enhanced)
  ...phaseDDenseModules,
  // Phase E dense modules (conj1-10 enhanced)
  ...phaseEDenseModules,
  // Physical Classes Enhanced (user-fed PPP lessons with gamification)
  physicalClassesEnhancedModule,
  // Enhanced modules (m7-m12, remaining modules - excluding those replaced by dense versions)
  ...enhancedModules.filter(m => 
    !phaseBReplacedIds.includes(m.id.replace('enhanced', '')) &&
    !phaseCReplacedIds.includes(m.id.replace('enhanced', '')) &&
    !phaseDReplacedIds.includes(m.id.replace('enhanced', '')) &&
    !phaseEReplacedIds.includes(m.id.replace('enhanced', ''))
  ),
  // Original conjugation modules (now replaced by Phase E enhanced versions)
  // ...conjugationModules (removed as they are replaced by Phase E)
];

// Re-export utility functions
export { getLessonById };

// Create an integrated getAllFlashcards that searches all modules
let _allFlashcardsIntegratedCache: Exercise[] | null = null;
export function getAllFlashcards(): Exercise[] {
  // Return cached result if available
  if (_allFlashcardsIntegratedCache) {
    return _allFlashcardsIntegratedCache;
  }
  
  // Calculate flashcards from all integrated modules
  const flashcards: Exercise[] = [];
  for (const module of modules) {
    for (const lesson of module.lessons) {
      for (const exercise of lesson.exercises) {
        if (exercise.type === "flashcard" && exercise.term && exercise.translation) {
          flashcards.push(exercise);
        }
      }
    }
  }
  
  // Cache the result
  _allFlashcardsIntegratedCache = flashcards;
  return flashcards;
}

// Create an enhanced getLessonById that searches in all modules including conjugation
export function getLessonByIdIntegrated(id: string) {
  for (const m of modules) {
    const match = m.lessons.find((l: any) => l.id === id);
    if (match) return match;
  }
  return undefined;
} 