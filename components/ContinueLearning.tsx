"use client";
import Link from "next/link";
import { modules } from "@/lib/content-integrated";
import { useAppStore } from "@/lib/store";

// Same order as in Levels page
const RECOMMENDED_ORDER = [
  "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12",
  "vocab1", "vocab2", "vocab3", "vocab4", "vocab5",
  "phrases1", "phrases2", 
  "cultural1",
  "expert1", "expert2", "expert3"
];

export default function ContinueLearning() {
  const { lessonProgress } = useAppStore();

  function getNextLesson() {
    for (const moduleId of RECOMMENDED_ORDER) {
      const module = modules.find(m => m.id === moduleId);
      if (!module) continue;
      
      for (const lesson of module.lessons) {
        if (!lessonProgress[lesson.id]?.completed) {
          return {
            lesson,
            module,
            isNewModule: !module.lessons.some(l => lessonProgress[l.id]?.completed)
          };
        }
      }
    }
    return null;
  }

  const nextLesson = getNextLesson();

  if (!nextLesson) {
    return (
      <div className="text-center">
        <div className="text-lg font-bold text-emerald-400 mb-2">🎉 Congratulations!</div>
        <div className="text-white/80 mb-4">You've completed all A1 lessons!</div>
        <div className="flex gap-2 justify-center">
          <Link href="/practice" className="btn btn-primary">
            Master Your Vocabulary
          </Link>
          <Link href="/arcade" className="btn btn-secondary">
            Play Games
          </Link>
        </div>
      </div>
    );
  }

  const totalCompleted = RECOMMENDED_ORDER.reduce((count, moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return count;
    return count + module.lessons.filter(l => lessonProgress[l.id]?.completed).length;
  }, 0);

  const totalLessons = RECOMMENDED_ORDER.reduce((count, moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    return count + (module?.lessons.length || 0);
  }, 0);

  const overallProgress = Math.round((totalCompleted / totalLessons) * 100);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-lg">
            {nextLesson.isNewModule ? "🚀 Start New Level" : "▶️ Continue Learning"}
          </div>
          <div className="text-sm text-white/70">
            {nextLesson.module.title} • {nextLesson.lesson.title}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">{overallProgress}% Complete</div>
          <div className="text-xs text-white/60">{totalCompleted}/{totalLessons} lessons</div>
        </div>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500 rounded-full"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      <div className="flex gap-2">
        <Link 
          href={`/learn/${nextLesson.lesson.id}`}
          className="btn btn-primary flex-1"
        >
          {nextLesson.isNewModule ? "Start Level" : "Continue Lesson"}
        </Link>
        <Link 
          href="/levels"
          className="btn btn-secondary"
        >
          View All
        </Link>
      </div>
    </div>
  );
} 
