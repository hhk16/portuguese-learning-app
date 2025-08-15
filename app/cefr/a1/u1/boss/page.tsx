"use client";
import { useMemo, useState } from "react";
import ExerciseEngine from "@/components/ExerciseEngine";
import { useAppStore } from "@/lib/store";
import type { Exercise, Lesson } from "@/lib/content";
import { launchConfetti } from "@/lib/effects";

export default function U1BossPage() {
  const { addBadge, incrementXP } = useAppStore();
  const [awarded, setAwarded] = useState(false);

  const bossLesson = useMemo<Lesson>(() => {
    const items: Exercise[] = [
      { id: "u1b-mcq-hello", type: "mcq", prompt: "Best greeting for 9 AM?", options: ["Bom dia!", "Boa tarde!", "Boa noite!"], correct: "Bom dia!" },
      { id: "u1b-type-intro", type: "typing", prompt: "Type in PT: 'My name is Ana.'", correct: "Chamo-me Ana." },
      { id: "u1b-mcq-formal", type: "mcq", prompt: "Choose formal: (ask name)", options: ["Como se chama?", "Como te chamas?", "Qual é o teu nome?"], correct: "Como se chama?" },
      { id: "u1b-listen-intro", type: "listening", audioTextPt: "Olá, muito prazer!", prompt: "Type what you hear (PT-PT)", correct: "Olá, muito prazer!" },
      { id: "u1b-order-pol", type: "order", prompt: "Order the polite phrase", correct: "Desculpe, pode repetir?", items: ["Desculpe,","pode","repetir?"] },
      { id: "u1b-type-origin", type: "typing", prompt: "Type in PT: 'I am from Portugal.'", correct: "Sou de Portugal." },
    ];
    return { id: "u1-boss", title: "U1 • Reception Scenario Boss", xp: 70, exercises: items };
  }, []);

  function onFinish() {
    if (awarded) return;
    setAwarded(true);
    addBadge(`u1-crown`);
    incrementXP(70);
    launchConfetti();
    alert("Boss passed! You earned the U1 crown and 70 XP.");
  }

  return (
    <div className="container-max grid gap-4">
      <div className="card p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
        <div className="font-semibold">Milestone • U1</div>
        <div className="text-sm text-white/70">Reception scenario with greetings, introductions, and formal vs informal. Aim for ≥80% correct.</div>
      </div>
      <ExerciseEngine lesson={bossLesson} />
      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={onFinish}>Finish Boss</button>
      </div>
    </div>
  );
} 