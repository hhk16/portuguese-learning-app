"use client";
import { modules, type Exercise, type Lesson } from "@/lib/content-integrated";
import ExerciseEngine from "@/components/ExerciseEngine";
import { useAppStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { launchConfetti } from "@/lib/effects";
// Removed drei Sparkles to avoid 3D dependency

function getModule(moduleId: string) { return modules.find(m => m.id === moduleId); }

export default function BossPage({ params }: { params: { moduleId: string } }) {
  const mod = getModule(params.moduleId);
  const { addBadge, incrementXP } = useAppStore();
  const [awarded, setAwarded] = useState(false);
  const [burst, setBurst] = useState(false);
  const bossLesson = useMemo<Lesson | undefined>(() => {
    if (!mod) return undefined;
    const items: Exercise[] = [];
    for (const l of mod.lessons) {
      for (const e of l.exercises) {
        if (e.type === "flashcard" || e.type === "mcq" || e.type === "typing" || e.type === "listening") {
          items.push(e);
        }
      }
    }
    const sample = items.slice(0, 12);
    return { id: `${mod.id}-boss`, title: `${mod.title} • Boss`, xp: 50, exercises: sample };
  }, [mod]);

  if (!mod || !bossLesson) return <div className="container-max"><div className="card p-6">Boss not available</div></div>;

  function onFinish() {
    if (awarded) return;
    setAwarded(true);
    setBurst(true);
    setTimeout(()=>setBurst(false), 800);
    const m = mod!;
    addBadge(`${m.id}-crown`);
    incrementXP(50);
    launchConfetti();
    alert("Boss passed! You earned a crown and 50 XP.");
  }

  return (
    <div className="container-max grid gap-3">
      {burst && (
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Simple 2D particle substitute using drei sparkle overlay in a small Canvas would be heavier; keep confetti + this state for effect */}
          <div className="fixed inset-0" />
        </div>
      )}
      <ExerciseEngine lesson={bossLesson} />
      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={onFinish}>Finish Boss</button>
      </div>
      <p className="text-sm text-white/60">Pass threshold: aim for ≥80% correct across mixed tasks.</p>
    </div>
  );
} 