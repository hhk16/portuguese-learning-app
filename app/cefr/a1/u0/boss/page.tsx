"use client";
import { useMemo, useState } from "react";
import ExerciseEngine from "@/components/ExerciseEngine";
import { useAppStore } from "@/lib/store";
import type { Exercise, Lesson } from "@/lib/content";
import { launchConfetti } from "@/lib/effects";

export default function U0BossPage() {
  const { addBadge, incrementXP } = useAppStore();
  const [awarded, setAwarded] = useState(false);

  // Build a mixed scenario lesson pulling from unit 0 areas
  const bossLesson = useMemo<Lesson>(() => {
    const items: Exercise[] = [
      // Listening dictation for alphabet/words
      { id: "u0b-listen-1", type: "listening", audioTextPt: "ana ponto silva arroba exemplo ponto com", prompt: "Type the email you hear", correct: "ana.silva@example.com" },
      { id: "u0b-type-num", type: "typing", prompt: "Type the number you hear: 'nove um dois três quatro cinco' (digits)", correct: "912345" },
      // Pronunciation recognition via MCQ surrogate
      { id: "u0b-mcq-son", type: "mcq", prompt: "Which word contains 'lh'?", options: ["filho", "fino", "fio"], correct: "filho" },
      // Numbers 0–20
      { id: "u0b-mcq-zero", type: "mcq", prompt: "Translate: 'zero'", options: ["zero", "one", "two"], correct: "zero" },
      // Ordering phrase with accent focus
      { id: "u0b-order-1", type: "order", prompt: "Order the phrase", correct: "Está a chover.", items: ["Está","a","chover."] },
      // Another listening minimal pair
      { id: "u0b-listen-2", type: "listening", audioTextPt: "pão", prompt: "Type the word you hear", correct: "pão" },
    ];
    return { id: "u0-boss", title: "U0 • Pronúncia & Dictation Boss", xp: 60, exercises: items };
  }, []);

  function onFinish() {
    if (awarded) return;
    setAwarded(true);
    addBadge(`u0-crown`);
    incrementXP(60);
    launchConfetti();
    alert("Boss passed! You earned the U0 crown and 60 XP.");
  }

  return (
    <div className="container-max grid gap-4">
      <div className="card p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-400/30">
        <div className="font-semibold">Milestone • U0</div>
        <div className="text-sm text-white/70">Pronúncia & Dictation mixed challenge. Aim for ≥80% correct.</div>
      </div>
      <ExerciseEngine lesson={bossLesson} />
      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={onFinish}>Finish Boss</button>
      </div>
    </div>
  );
} 