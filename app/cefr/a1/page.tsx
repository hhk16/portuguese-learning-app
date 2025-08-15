"use client";
import Link from "next/link";
import { getUnits } from "@/lib/cefr";
import { useAppStore } from "@/lib/store";
import { modules } from "@/lib/content";

function getLessonProgressPercent(lessonProgress: Record<string, any>, lessonIds: string[]): number {
  const total = lessonIds.length;
  const completed = lessonIds.filter(id => !!lessonProgress[id]?.completed).length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export default function A1TrackPage() {
  const units = getUnits();
  const { lessonProgress, badges } = useAppStore();

  function isUnitUnlocked(idx: number): boolean {
    if (idx === 0) return true;
    const prev = units[idx - 1];
    const prevLessonIds = prev.lessons.map(l => l.lessonId);
    const pct = getLessonProgressPercent(lessonProgress, prevLessonIds);
    const hasPrevBoss = badges.includes(`${prev.id}-crown`) || badges.includes(`crown-${prev.id}`);
    return pct >= 70 || hasPrevBoss;
  }

  return (
    <div className="container-max grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold text-gradient">📚 Learn (A1 Path)</h1>
        <div className="text-white/70 text-sm">Step-by-step A1 units with guides and bosses</div>
        <div className="text-white/60 text-xs">10 Units • 48 micro-lessons • 6 milestones • Final A1 Boss</div>
      </div>

      <div className="grid gap-4">
        {units.map((u, idx) => {
          const unlocked = isUnitUnlocked(idx);
          const pct = getLessonProgressPercent(lessonProgress, u.lessons.map(l => l.lessonId));
          return (
            <section key={u.id} className={`card p-5 ${unlocked ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 rounded-lg text-xs border border-blue-400/30 bg-blue-500/10 text-blue-300">Unit {idx + 1}</span>
                    <span className="text-xs text-white/60">CEFR A1</span>
                  </div>
                  <h2 className="text-lg font-bold">{u.title}</h2>
                  <p className="text-white/70 text-sm">{u.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{pct}%</div>
                  <div className="text-xs text-white/60">progress</div>
                </div>
              </div>

              <div className="my-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{ width: `${pct}%` }} />
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {u.lessons.map((ml) => (
                  <div key={ml.lessonId} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{ml.title}</div>
                      <div className="text-xs text-white/60">Lesson • {ml.lessonId}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!!lessonProgress[ml.lessonId]?.completed ? (
                        <span className="text-emerald-300 text-sm">✅</span>
                      ) : (
                        <span className="text-white/50 text-sm">•</span>
                      )}
                      {unlocked ? (
                        <Link href={`/learn/${ml.lessonId}`} className="btn btn-secondary text-xs">Open</Link>
                      ) : (
                        <span className="text-xs text-white/50">🔒 Locked</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-white/60">
                  {u.milestone ? (
                    <>
                      Milestone: {u.milestone.title}
                      {u.id === "u0" && <Link href="/cefr/a1/u0/boss" className="ml-2 underline text-emerald-300">Open Boss</Link>}
                      {u.id === "u1" && <Link href="/cefr/a1/u1/boss" className="ml-2 underline text-emerald-300">Open Boss</Link>}
                    </>
                  ) : ""}
                </div>
                <div className="flex items-center gap-2">
                  {unlocked ? (
                    <Link href={`/cefr/a1/${u.id}`} className="btn btn-primary text-xs">View Unit</Link>
                  ) : (
                    <span className="text-xs text-white/60">Complete previous unit to unlock</span>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
} 