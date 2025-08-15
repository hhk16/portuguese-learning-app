"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getUnitById, canDoById } from "@/lib/cefr";
import { useAppStore } from "@/lib/store";

export default function UnitDetailPage() {
  const params = useParams();
  const unitId = Array.isArray(params?.unitId) ? params?.unitId[0] : params?.unitId as string;
  const unit = getUnitById(unitId);
  const { lessonProgress } = useAppStore();

  if (!unit) {
    return (
      <div className="container-max">
        <div className="card p-6">Unit not found</div>
      </div>
    );
  }

  return (
    <div className="container-max grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold text-gradient">{unit.title}</h1>
        <p className="text-white/70">{unit.description}</p>
      </div>

      <section className="card p-5">
        <h2 className="font-semibold mb-3">Micro-lessons</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {unit.lessons.map(ml => (
            <div key={ml.lessonId} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{ml.title}</div>
                  <div className="text-xs text-white/60">{ml.lessonId}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!!lessonProgress[ml.lessonId]?.completed ? (
                    <span className="text-emerald-300 text-sm">✅ Done</span>
                  ) : (
                    <span className="text-white/50 text-sm">•</span>
                  )}
                  <Link href={`/learn/${ml.lessonId}`} className="btn btn-primary text-xs">Start</Link>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {ml.canDoIds.map(id => (
                  <span key={id} className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                    ✅ {canDoById[id]?.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {unit.milestone && (
        <section className="card p-5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-300">Milestone</div>
              <div className="font-semibold">{unit.milestone.title}</div>
              <div className="text-sm text-white/70">{unit.milestone.description}</div>
            </div>
            <div>
              <Link href="/levels" className="btn btn-secondary text-xs">Prepare</Link>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <Link href={`/cefr/a1/${unit.id}/guide`} className="card p-4 hover-lift">
          <div className="font-semibold">📘 Unit Guide</div>
          <div className="text-sm text-white/70">Rules, grammar, examples & tips</div>
        </Link>
        <Link href="/practice" className="card p-4 hover-lift">
          <div className="font-semibold">📚 Review 10 (SRS)</div>
          <div className="text-sm text-white/70">Reinforce weak items from this unit</div>
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/arcade" className="card p-4 hover-lift">
          <div className="font-semibold">🕹️ Play a game</div>
          <div className="text-sm text-white/70">Unit‑themed practice mini‑games</div>
        </Link>
        <Link href="/cefr/a1" className="card p-4 hover-lift">
          <div className="font-semibold">🎯 Back to A1 Track</div>
          <div className="text-sm text-white/70">Choose another unit</div>
        </Link>
      </div>
    </div>
  );
} 