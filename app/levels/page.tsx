"use client";
import Link from "next/link";
import { modules, type Module } from "@/lib/content-integrated";
import { useAppStore } from "@/lib/store";

// Recommended learning order: Core A1 → Conjugation → Vocabulary → Phrases → Culture → Expert
const RECOMMENDED_ORDER = [
  // Core A1 Foundation (Units u0-u9)
  "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12",
  
  // Enhanced Core Modules (Phase A)
  "m7enhanced", "m8enhanced", "m9enhanced", "m10enhanced", "m11enhanced", "m12enhanced",
  
  // Conjugation Mastery (Units u10-u14)
  "conjugation1enhanced", "conjugation2enhanced", "conjugation3enhanced", "conjugation4enhanced", "conjugation5enhanced",
  
  // Essential Vocabulary (Unit u15)
  "vocab1enhanced", "vocab2enhanced", "vocab3enhanced", "vocab4enhanced", 
  "vocab5enhanced", "vocab6enhanced", "vocab7enhanced",
  
  // Phrases & Communication
  "phrases1", "phrases2",
  
  // Culture & Context (Unit u16)
  "cultural1enhanced", "cultural2enhanced", "cultural3enhanced",
  
  // Expert Level Mastery
  "expert1enhanced", "expert2enhanced", "expert3enhanced", "expert4enhanced", "expert5enhanced",
  "expert6enhanced", "expert7enhanced", "expert8enhanced", "expert9enhanced", "expert10enhanced"
];

export default function LevelsPage() {
  const { lessonProgress, badges } = useAppStore();
  
  // Get modules in recommended order
  const orderedModules = RECOMMENDED_ORDER.map(id => modules.find(m => m.id === id)).filter((mod): mod is Module => !!mod);

  function getModuleProgress(mod: Module) {
    const completed = mod.lessons.filter(l => lessonProgress[l.id]?.completed).length;
    const total = mod.lessons.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }

  function isModuleUnlocked(idx: number) {
    if (idx === 0) return true; // First module always unlocked
    
    const prevMod = orderedModules[idx - 1];
    const prevProgress = getModuleProgress(prevMod);
    const hasBoss = badges.some(b => b.includes(`${prevMod.id}-crown`) || b.includes(`crown-${prevMod.id}`));
    
    return prevProgress.percentage >= 70 || hasBoss;
  }

  function getNextLesson() {
    for (const mod of orderedModules) {
      for (const lesson of mod.lessons) {
        if (!lessonProgress[lesson.id]?.completed) {
          return { lesson, module: mod };
        }
      }
    }
    return null;
  }

  const nextLesson = getNextLesson();

  function getFirstIncompleteLesson(mod: Module) {
    return mod.lessons.find(l => !lessonProgress[l.id]?.completed);
  }

  function getModuleStatus(mod: Module, idx: number) {
    const unlocked = isModuleUnlocked(idx);
    const progress = getModuleProgress(mod);
    const nextLesson = getFirstIncompleteLesson(mod);
    const hasBoss = badges.some(b => b.includes(`${mod.id}-crown`) || b.includes(`crown-${mod.id}`));
    
    if (!unlocked) return { type: "locked", message: "Complete previous level to unlock" };
    if (nextLesson) return { type: "continue", lesson: nextLesson };
    if (!hasBoss) return { type: "boss", message: "Ready for Boss Challenge!" };
    return { type: "complete", message: "Level Complete!" };
  }

  function getLevelCategory(idx: number) {
    if (idx < 12) return { name: "Core A1", color: "emerald" };
    if (idx < 18) return { name: "Enhanced A1", color: "teal" };
    if (idx < 23) return { name: "Conjugation", color: "indigo" };
    if (idx < 30) return { name: "Vocabulary", color: "blue" };
    if (idx < 32) return { name: "Phrases", color: "purple" };
    if (idx < 35) return { name: "Culture", color: "orange" };
    return { name: "Expert", color: "red" };
  }

  return (
    <div className="container-max grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold text-gradient">🧭 Quick Continue</h1>
        <div className="text-white/70 text-sm">Fast entry to your next lesson</div>
        <div className="text-white/60 text-xs">Jump directly to where you left off in the A1 Path</div>
      </div>

      {/* Next Lesson CTA */}
      {nextLesson && (
        <div className="card p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-400/30">
          <div className="grid gap-4">
            <div>
              <h2 className="text-xl font-bold text-emerald-400">📚 Next Up</h2>
              <p className="text-white/80 text-sm">Continue your A1 journey</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{nextLesson.lesson.title}</div>
                <div className="text-sm text-white/70">From {nextLesson.module.title}</div>
              </div>
              <Link href={`/learn/${nextLesson.lesson.id}`} className="btn btn-primary">
                Start Lesson
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Alternative: Go to A1 Track */}
      <div className="card p-4 border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">View Full A1 Path</div>
            <div className="text-sm text-white/70">Browse all units, guides, and bosses</div>
          </div>
          <Link href="/cefr/a1" className="btn btn-secondary">
            View A1 Track
          </Link>
        </div>
      </div>

      {/* Module Overview */}
      <div className="grid gap-4">
        <h2 className="text-xl font-bold">📊 Progress Overview</h2>
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold text-gradient">🧭 Levels</h1>
          <p className="text-white/70">Master A1 European Portuguese step by step</p>
          <div className="text-sm text-white/60">
            {orderedModules.length} levels • Progressive unlocking • Boss challenges
          </div>
        </div>

        {orderedModules.map((mod, idx) => {
          const progress = getModuleProgress(mod);
          const status = getModuleStatus(mod, idx);
          const category = getLevelCategory(idx);
          const unlocked = isModuleUnlocked(idx);

          return (
            <section 
              key={mod.id} 
              className={`card p-5 ${unlocked ? "" : "opacity-60"} transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded-lg text-xs border text-${category.color}-400 border-${category.color}-400/30 bg-${category.color}-500/10`}>
                      {category.name}
                    </span>
                    <span className="text-xs text-white/60">Level {idx + 1}</span>
                  </div>
                  <h2 className="text-lg font-bold">{mod.title}</h2>
                  <p className="text-white/70 text-sm">{mod.description}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {progress.completed}/{progress.total} lessons
                  </div>
                  <div className="text-xs text-white/60">{progress.percentage}% complete</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-${category.color}-500 to-${category.color}-400 transition-all duration-500 rounded-full`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              {/* Lesson badges */}
              <div className="mb-4 flex gap-2 flex-wrap">
                {mod.lessons.map((lesson) => {
                  const completed = !!lessonProgress[lesson.id]?.completed;
                  return (
                    <span 
                      key={lesson.id}
                      className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                        completed 
                          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300" 
                          : "border-white/15 bg-white/5 text-white/70"
                      }`}
                    >
                      {completed ? "✅" : "•"} {lesson.title}
                    </span>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {status.type === "continue" && status.lesson && (
                    <Link 
                      href={`/learn/${status.lesson.id}`} 
                      className="btn btn-primary"
                    >
                      {progress.completed === 0 ? "🚀 Start Level" : "▶️ Continue"}
                    </Link>
                  )}
                  
                  {status.type === "boss" && (
                    <Link 
                      href={`/module/${mod.id}/boss`} 
                      className="btn btn-secondary bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30"
                    >
                      👑 Boss Challenge
                    </Link>
                  )}
                  
                  {status.type === "complete" && (
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-semibold">✅ Complete!</span>
                      <Link href={`/module/${mod.id}/boss`} className="btn btn-secondary text-xs">
                        👑 Replay Boss
                      </Link>
                    </div>
                  )}
                  
                  {status.type === "locked" && (
                    <div className="text-sm text-white/70">
                      🔒 {status.message}
                    </div>
                  )}
                </div>

                {/* Quick access to practice this module's vocabulary */}
                {unlocked && (
                  <Link 
                    href={`/practice?module=${mod.id}`} 
                    className="btn btn-secondary text-xs"
                  >
                    📚 Practice
                  </Link>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Progress summary */}
      <div className="card p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-300">🏆 Your A1 Journey</div>
          <div className="text-sm text-white/80 mt-1">
            {orderedModules.filter((mod) => getModuleProgress(mod).percentage === 100).length} / {orderedModules.length} levels completed
          </div>
          <div className="text-xs text-white/60 mt-2">
            Complete each level to unlock the next • Beat boss challenges for extra rewards
          </div>
        </div>
      </div>
    </div>
  );
} 