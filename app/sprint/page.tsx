"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { modules, type Exercise } from "@/lib/content-integrated";
import { useAppStore } from "@/lib/store";
import { playBeep, playCorrect, playWrong, launchConfetti } from "@/lib/effects";

function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export default function SprintPage() {
  const { incrementXP, awardCoins } = useAppStore();
  const pool = useMemo<Exercise[]>(() => {
    const list: Exercise[] = [];
    for (const m of modules) for (const l of m.lessons) for (const e of l.exercises) {
      if (e.type === "flashcard" && e.term && e.translation) list.push(e);
    }
    return list;
  }, []);

  const [time, setTime] = useState(60);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<{ term: string; correct: string; options: string[] } | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => setTime((t) => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  useEffect(() => {
    if (running && time <= 0) {
      setRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      const xp = Math.max(10, score);
      incrementXP(xp);
      awardCoins(Math.floor(score / 3));
      launchConfetti();
      alert(`Time! Score: ${score}. +${xp} XP, +${Math.floor(score/3)} coins`);
    }
  }, [time, running, score, incrementXP, awardCoins]);

  function nextQuestion() {
    if (pool.length < 3) return;
    const q = pickRandom(pool);
    const wrongs = pool.filter(p => p.term !== q.term).slice(0, 6);
    const opts = [q.translation as string, ...wrongs.slice(0, 3).map(w => w.translation as string)].sort(() => Math.random() - 0.5);
    setQuestion({ term: q.term as string, correct: q.translation as string, options: opts });
  }

  function start() {
    setScore(0); setTime(60); setRunning(true); playBeep(660, 120, 'triangle'); nextQuestion();
  }

  function answer(opt: string) {
    if (!question) return;
    if (opt === question.correct) { setScore((s) => s + 1); playCorrect(); }
    else playWrong();
    nextQuestion();
  }

  return (
    <div className="container-max grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Timed Sprint (60s)</h1>
        <div className="rounded-lg bg-white/10 px-3 py-1">Time: <strong>{time}</strong> • Score: <strong>{score}</strong></div>
      </div>
      {!running ? (
        <div className="card p-6 grid gap-3">
          <p className="text-white/70 text-sm">Answer as many as you can before time runs out. Choose the correct translation.</p>
          <button className="btn btn-primary w-fit anim-glow" onClick={start}>Start</button>
        </div>
      ) : (
        <div className="card p-6 grid gap-4 anim-pop">
          <div className="text-2xl font-extrabold">{question?.term}</div>
          <div className="grid gap-2">
            {question?.options.map((o) => (
              <button key={o} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-left hover:bg-white/10" onClick={() => answer(o)}>{o}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 