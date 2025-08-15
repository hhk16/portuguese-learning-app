export type ExerciseType = "flashcard" | "mcq" | "typing" | "listening" | "matching" | "order" | "dialogue" | "pronunciation" | "spelling" | "price" | "conjugation" | "directions" | "form" | "conjugationGrid" | "dirPath";

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt?: string;
  term?: string;
  translation?: string;
  options?: string[];
  correct?: string | string[];
  audioTextPt?: string;
  pairs?: { a: string; b: string }[];
  items?: string[]; // for ordering
  // dialogue optional
  dialogue?: { pt?: string; choice?: { text: string; good: boolean }[] }[];
  // direction map path (simple grid-based)
  pathNodes?: { id: number; x: number; y: number; label?: string }[];
  pathEdges?: { from: number; to: number; label: string }[];
  correctPath?: number[]; // sequence of node ids
}

export interface LessonContent {
  title: string;
  sections: {
    title: string;
    explanation: string; // English explanation
    examples: { pt: string; en: string; note?: string }[];
    keyPoints?: string[];
  }[];
}

export interface Lesson {
  id: string;
  title: string;
  xp: number;
  content?: LessonContent; // NEW: Presentation phase with teaching content
  exercises: Exercise[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}
