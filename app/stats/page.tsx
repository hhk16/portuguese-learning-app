"use client";
import { useAppStore } from "@/lib/store";

export default function StatsPage() {
  const { xp, streak, lessonProgress, resetProgress, badges } = useAppStore();
  const completed = Object.values(lessonProgress).filter((l: any) => l.completed).length;
  return (
    <div className="container-max grid gap-4">
      <h1 className="text-xl font-bold">Your Stats</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="card p-4"><div className="text-sm text-white/70">XP</div><div className="text-3xl font-extrabold">{xp}</div></div>
        <div className="card p-4"><div className="text-sm text-white/70">Streak</div><div className="text-3xl font-extrabold">{streak} 🔥</div></div>
        <div className="card p-4"><div className="text-sm text-white/70">Lessons Completed</div><div className="text-3xl font-extrabold">{completed}</div></div>
      </div>
      <div className="card p-4">
        <div className="text-sm text-white/70 mb-2">Badges</div>
        <div className="flex flex-wrap gap-2">
          {badges.length === 0 && <span className="text-white/60">No badges yet</span>}
          {badges.map((b) => (
            <span key={b} className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs">{b}</span>
          ))}
        </div>
      </div>
      <button className="btn btn-secondary w-fit" onClick={resetProgress}>Reset Progress</button>
    </div>
  );
} 