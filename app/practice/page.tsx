"use client";
import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { getAllFlashcards, type Exercise, modules } from "@/lib/content-integrated";
import { isDue, scheduleNext, type ReviewRating } from "@/lib/srs";
import { launchConfetti, playCorrect, playWrong } from "@/lib/effects";
import Link from "next/link";
import { inferSkillsFromExercise, type SkillTag } from "@/lib/types";
import { getUnits } from "@/lib/cefr";

export default function PracticePage() {
  const { srsCards, updateSRSCard, incrementXP, awardCoins, itemStats, lessonProgress } = useAppStore();
  const [mode, setMode] = useState<"due" | "weak" | "all" | "sprint">("due");
  const [currentCard, setCurrentCard] = useState<Exercise | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [startTime] = useState<number>(() => Date.now());

  // Quick filters
  const [selectedSkill, setSelectedSkill] = useState<SkillTag | "all">("all");
  const [useThisUnit, setUseThisUnit] = useState<boolean>(false);
  const [weakest20, setWeakest20] = useState<boolean>(false);

  // Compute latest lesson and its CEFR unit
  const latestLessonId = useMemo(() => {
    const entries = Object.entries(lessonProgress || {});
    if (entries.length === 0) return null;
    entries.sort((a, b) => (b[1].lastCompletedAt || 0) - (a[1].lastCompletedAt || 0));
    return entries[0][0];
  }, [lessonProgress]);

  const unitLessonSet = useMemo(() => {
    if (!latestLessonId) return new Set<string>();
    const units = getUnits();
    const unit = units.find(u => u.lessons.some(ml => ml.lessonId === latestLessonId));
    const set = new Set<string>();
    if (unit) {
      unit.lessons.forEach(ml => set.add(ml.lessonId));
    }
    return set;
  }, [latestLessonId]);

  // Flashcards and skill inference
  const allCards = useMemo(() => getAllFlashcards(), []);
  const cardSkills = useMemo(() => {
    const map = new Map<string, SkillTag[]>();
    for (const c of allCards) {
      const skills = inferSkillsFromExercise({ type: c.type, prompt: c.prompt, term: c.term });
      map.set(c.id, skills as SkillTag[]);
    }
    return map;
  }, [allCards]);

  // Helpers to get lessonId for a card by scanning modules
  const cardsByLessonId = useMemo(() => {
    const map = new Map<string, Set<Exercise>>();
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        for (const ex of lesson.exercises) {
          if (ex.type === "flashcard" && ex.term && ex.translation) {
            if (!map.has(lesson.id)) map.set(lesson.id, new Set<Exercise>());
            map.get(lesson.id)!.add(ex);
          }
        }
      }
    }
    return map;
  }, []);

  const dueCards = useMemo(() => {
    return allCards.filter((card: Exercise) => {
      const srsData = srsCards[card.id];
      return srsData ? isDue(srsData) : true;
    });
  }, [allCards, srsCards]);

  const weakCards = useMemo(() => {
    return allCards.filter((card: Exercise) => {
      const stats = itemStats[card.id];
      if (!stats) return true;
      const accuracy = stats.correct / stats.attempts;
      return accuracy < 0.7;
    });
  }, [allCards, itemStats]);

  // Apply quick filters
  const basePool = useMemo(() => {
    const pool = mode === "due" ? dueCards : mode === "weak" ? weakCards : allCards;
    let filtered = pool;

    if (useThisUnit && unitLessonSet.size > 0) {
      const lessonCards = new Set<Exercise>();
      for (const lessonId of unitLessonSet) {
        const set = cardsByLessonId.get(lessonId);
        if (set) set.forEach(ex => lessonCards.add(ex));
      }
      filtered = filtered.filter(c => lessonCards.has(c));
    }

    if (selectedSkill !== "all") {
      filtered = filtered.filter(c => (cardSkills.get(c.id) || []).includes(selectedSkill));
    }

    if (weakest20) {
      filtered = [...filtered].sort((a, b) => {
        const sa = itemStats[a.id] || { attempts: 0, correct: 0 };
        const sb = itemStats[b.id] || { attempts: 0, correct: 0 };
        const accA = sa.attempts > 0 ? sa.correct / sa.attempts : 0.0;
        const accB = sb.attempts > 0 ? sb.correct / sb.attempts : 0.0;
        return accA - accB;
      }).slice(0, 20);
    }

    return filtered;
  }, [mode, dueCards, weakCards, allCards, useThisUnit, unitLessonSet, cardsByLessonId, selectedSkill, cardSkills, weakest20, itemStats]);

  const practiceCards = basePool;

  useEffect(() => {
    if (practiceCards.length > 0 && !currentCard) {
      const randomCard = practiceCards[Math.floor(Math.random() * practiceCards.length)];
      setCurrentCard(randomCard);
    }
  }, [practiceCards, currentCard]);

  // Session skill stats
  const [sessionSkillStats, setSessionSkillStats] = useState<Record<string, { attempts: number; correct: number }>>({});

  function handleRating(rating: ReviewRating) {
    if (!currentCard) return;
    const isCorrect = rating >= 3;
    const xpGain = isCorrect ? 5 + (streak * 2) : 1;

    if (isCorrect) {
      playCorrect();
      setStreak(s => s + 1);
      if (streak > 0 && (streak + 1) % 5 === 0) {
        launchConfetti();
        awardCoins(10);
      }
    } else {
      playWrong();
      setStreak(0);
    }

    incrementXP(xpGain);
    setSessionXP(x => x + xpGain);
    setSessionCount(c => c + 1);
    if (isCorrect) setSessionCorrect(c => c + 1);

    // Update session skill stats
    const skills = cardSkills.get(currentCard.id) || [];
    setSessionSkillStats(prev => {
      const next = { ...prev };
      for (const s of skills) {
        const stat = next[s] || { attempts: 0, correct: 0 };
        stat.attempts += 1;
        stat.correct += isCorrect ? 1 : 0;
        next[s] = stat;
      }
      return next;
    });

    const currentSRS = srsCards[currentCard.id] || { 
      easeFactor: 2.5, 
      interval: 1, 
      repetitions: 0, 
      nextReview: new Date() 
    };
    const newSRS = scheduleNext(currentSRS, rating);
    updateSRSCard(currentCard.id, newSRS);

    setShowAnswer(false);

    // Get next card
    const remaining = practiceCards.filter((c: Exercise) => c.id !== currentCard.id);
    if (remaining.length > 0) {
      setCurrentCard(remaining[Math.floor(Math.random() * remaining.length)]);
    } else {
      setCurrentCard(null);
    }
  }

  const modes = [
    { id: "due", label: "📅 Due Now", count: dueCards.length, color: "bg-red-500/20 border-red-400" },
    { id: "weak", label: "💪 Weak Items", count: weakCards.length, color: "bg-orange-500/20 border-orange-400" },
    { id: "all", label: "🎯 All Cards", count: allCards.length, color: "bg-blue-500/20 border-blue-400" },
    { id: "sprint", label: "⚡ Sprint Mode", count: "∞", color: "bg-purple-500/20 border-purple-400" }
  ];

  if (mode === "sprint") {
    return <SprintMode onBack={() => setMode("due")} />;
  }

  // Build recommended arcade links for weakest skills
  function skillToArcadeLink(skill: SkillTag): string {
    switch (skill) {
      case "numbers": return "/arcade/numbers";
      case "directions": return "/arcade/directions";
      case "conjugation": return "/arcade/conjugation";
      case "spelling":
      case "accents": return "/arcade/spelling";
      case "dates":
      case "time": return "/arcade/dates";
      default: return "/arcade/vocab-battle";
    }
  }

  const sessionDurationSec = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
  const sessionAccuracy = sessionCount > 0 ? Math.round((sessionCorrect / sessionCount) * 100) : 0;
  const weakestSkills = useMemo(() => {
    const arr = Object.entries(sessionSkillStats).map(([skill, s]) => ({ skill: skill as SkillTag, acc: s.attempts ? s.correct / s.attempts : 0, attempts: s.attempts }));
    return arr.sort((a, b) => a.acc - b.acc).slice(0, 3);
  }, [sessionSkillStats]);

  return (
    <div className="container-max grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold text-gradient">🔄 Review (SRS)</h1>
        <div className="text-white/70 text-sm">Spaced repetition of what you've learned</div>
        <div className="text-white/60 text-xs">Smart review system focusing on weak and overdue items</div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-400/30">
          <div className="text-2xl font-bold text-emerald-300">{sessionXP}</div>
          <div className="text-xs text-emerald-200/70">Session XP</div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-400/30">
          <div className="text-2xl font-bold text-blue-300">{sessionCount}</div>
          <div className="text-xs text-blue-200/70">Cards Done</div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-400/30">
          <div className="text-2xl font-bold text-yellow-300">🔥 {streak}</div>
          <div className="text-xs text-yellow-200/70">Current Streak</div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-400/30">
          <div className="text-2xl font-bold text-purple-300">{dueCards.length}</div>
          <div className="text-xs text-purple-200/70">Due Today</div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="card p-4 grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button className={`btn ${useThisUnit ? "btn-primary" : "btn-secondary"}`} onClick={() => setUseThisUnit(v => !v)}>This Unit</button>
          <button className={`btn ${mode === "due" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("due")}>Due Only</button>
          <button className={`btn ${weakest20 ? "btn-primary" : "btn-secondary"}`} onClick={() => setWeakest20(v => !v)}>Weakest 20</button>
          <button className={`btn ${mode === "weak" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("weak")}>All Weak</button>
          <button className={`btn ${mode === "all" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("all")}>All</button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-white/70">This Skill:</label>
          <select className="rounded-lg bg-white/5 border border-white/15 px-2 py-1 text-sm" value={selectedSkill}
            onChange={(e)=> setSelectedSkill((e.target.value as SkillTag | "all") )}>
            <option value="all">All skills</option>
            <option value="numbers">Numbers</option>
            <option value="directions">Directions</option>
            <option value="conjugation">Conjugation</option>
            <option value="spelling">Spelling</option>
            <option value="accents">Accents</option>
            <option value="dates">Dates</option>
            <option value="time">Time</option>
            <option value="pronunciation">Pronunciation</option>
            <option value="vocabulary">Vocabulary</option>
          </select>
        </div>
      </div>

      {/* Intense Practice CTA */}
      <Link href="/practice/intense" className="card p-6 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 border-red-400/40 hover-lift anim-pulse-rainbow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gradient">⚡ INTENSE PRACTICE MODE ⚡</h2>
            <p className="text-white/80">5-minute rapid-fire challenges • Multiple game modes • Ultimate test!</p>
          </div>
          <div className="text-4xl anim-bounce-in">🔥</div>
        </div>
      </Link>

      {/* Mode selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`card p-4 transition-all hover:scale-105 ${
              mode === m.id ? m.color + " anim-glow" : "border-white/15"
            }`}
          >
            <div className="font-semibold">{m.label}</div>
            <div className="text-sm text-white/70">{m.count} items</div>
          </button>
        ))}
      </div>

      {/* Practice area */}
      {currentCard ? (
        <div className="card p-8 bg-gradient-to-br from-white/5 to-white/10 border-white/20">
          <div className="grid gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 anim-pop">{currentCard.term}</div>
              <div className="text-white/60">European Portuguese</div>
            </div>

            {showAnswer && (
              <div className="text-center anim-pop">
                <div className="text-2xl text-emerald-300 mb-4">{currentCard.translation}</div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-md mx-auto">
                  <button 
                    onClick={() => handleRating(1)}
                    className="btn bg-red-500/20 border-red-400 hover:bg-red-500/30 text-red-200"
                  >
                    😵 Again
                  </button>
                  <button 
                    onClick={() => handleRating(2)}
                    className="btn bg-orange-500/20 border-orange-400 hover:bg-orange-500/30 text-orange-200"
                  >
                    😐 Hard
                  </button>
                  <button 
                    onClick={() => handleRating(3)}
                    className="btn bg-blue-500/20 border-blue-400 hover:bg-blue-500/30 text-blue-200"
                  >
                    😊 Good
                  </button>
                  <button 
                    onClick={() => handleRating(4)}
                    className="btn bg-emerald-500/20 border-emerald-400 hover:bg-emerald-500/30 text-emerald-200"
                  >
                    🚀 Easy
                  </button>
                </div>
              </div>
            )}

            {!showAnswer && (
              <div className="text-center">
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="btn btn-primary btn-lg anim-pop px-8 py-4 text-lg"
                >
                  Show Answer
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-2xl font-bold mb-2">All done!</div>
          <div className="text-white/70 mb-4">
            {mode === "due" && "No more cards due for review right now."}
            {mode === "weak" && "You've practiced all your weak items!"}
            {mode === "all" && "You've reviewed every card!"}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Session Summary */}
      <div className="card p-6 grid gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="text-sm text-white/60">Accuracy</div>
            <div className="text-xl font-bold">{sessionAccuracy}%</div>
          </div>
          <div>
            <div className="text-sm text-white/60">Time</div>
            <div className="text-xl font-bold">{sessionDurationSec}s</div>
          </div>
        </div>
        {weakestSkills.length > 0 && (
          <div className="grid gap-2">
            <div className="text-sm text-white/60">Weakest skills</div>
            <div className="flex flex-wrap gap-2">
              {weakestSkills.map(ws => (
                <Link key={ws.skill} href={skillToArcadeLink(ws.skill)} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
                  {ws.skill} • {Math.round(ws.acc * 100)}% ({ws.attempts}) → Play
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SprintMode({ onBack }: { onBack: () => void }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentCard, setCurrentCard] = useState<Exercise | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);

  const allCards = getAllFlashcards();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    nextQuestion();
  }, []);

  function nextQuestion() {
    if (allCards.length === 0) return;
    
    const card = allCards[Math.floor(Math.random() * allCards.length)];
    setCurrentCard(card);
    
    const wrongOptions = allCards
      .filter((c: Exercise) => c.id !== card.id && c.translation)
      .map((c: Exercise) => c.translation!)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    const allOptions = [card.translation!, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  }

  function handleAnswer(answer: string) {
    if (!currentCard || gameOver) return;
    
    const correct = answer === currentCard.translation;
    if (correct) {
      playCorrect();
      setScore(s => s + (1 + Math.floor(streak / 5)));
      setStreak(s => s + 1);
      if (streak > 0 && (streak + 1) % 10 === 0) {
        launchConfetti();
      }
    } else {
      playWrong();
      setStreak(0);
    }
    
    nextQuestion();
  }

  if (gameOver) {
    return (
      <div className="container-max">
        <div className="card p-8 text-center bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-400/30">
          <div className="text-6xl mb-4">⚡</div>
          <div className="text-3xl font-bold mb-2">Sprint Complete!</div>
          <div className="text-xl text-purple-300 mb-4">Score: {score}</div>
          <div className="text-white/70 mb-6">Best streak: {streak}</div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Try Again
            </button>
            <button onClick={onBack} className="btn btn-secondary">
              Back to Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-max grid gap-4">
      {/* Sprint header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${
            timeLeft <= 10 ? "bg-red-500/20 text-red-300 anim-glow" : "bg-purple-500/20 text-purple-300"
          }`}>
            ⏱️ {timeLeft}s
          </div>
          <div className="text-xl font-bold text-emerald-300">🏆 {score}</div>
          <div className="text-lg text-yellow-300">🔥 {streak}</div>
        </div>
        <button onClick={onBack} className="btn btn-secondary">Exit</button>
      </div>

      {/* Sprint question */}
      {currentCard && (
        <div className="card p-8 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-400/30">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold mb-2 anim-pop">{currentCard.term}</div>
            <div className="text-white/60">Choose the translation</div>
          </div>
          
          <div className="grid gap-3 max-w-md mx-auto">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                className="btn bg-white/5 border-white/15 hover:bg-white/10 text-left p-4 transition-all hover:scale-105"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 