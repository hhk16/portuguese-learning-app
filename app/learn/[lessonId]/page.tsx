"use client";
import { getLessonByIdIntegrated } from "@/lib/content-integrated";
import ExerciseEngine from "@/components/ExerciseEngine";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { getCanDosForLesson } from "@/lib/cefr";

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  const lesson = getLessonByIdIntegrated(params.lessonId);
 
  const [progress, setProgress] = useState({ i: 0, total: 0 });
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [recentAnswer, setRecentAnswer] = useState<boolean | null>(null);
  const [showStarAnimation, setShowStarAnimation] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Add store access and router
  const { markLessonComplete } = useAppStore();
  const router = useRouter();
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCompletion) {
          setShowCompletion(false);
        } else if (showExitConfirm) {
          setShowExitConfirm(false);
        } else {
          setShowExitConfirm(true);
        }
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showCompletion, showExitConfirm]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    const body = document.body;
    if (showCompletion || showExitConfirm) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = 'unset';
    }
    return () => {
      body.style.overflow = 'unset';
    };
  }, [showCompletion, showExitConfirm]);

  function handleExit() {
    setShowExitConfirm(false);
    // Force navigation with multiple fallback methods
    try {
      router.push("/levels");
    } catch (error) {
      console.error("Router navigation failed:", error);
      // Fallback to window location
      window.location.href = "/levels";
    }
  }

  function handleModalClick(action: () => void) {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      // Small delay to ensure state updates are processed
      setTimeout(() => {
        action();
      }, 10);
    };
  }
  
  // Toggle html class when modal opens/closes
  useEffect(() => {
    const html = document.documentElement;
    if (showCompletion) {
      html.classList.add('modal-open');
    } else {
      html.classList.remove('modal-open');
    }
    return () => html.classList.remove('modal-open');
  }, [showCompletion]);
  
  if (!lesson) {
    return (
      <div className="container-max">
        <div className="card p-6">
          <div className="font-bold">Lesson not found</div>
          <Link className="btn btn-primary mt-3 inline-block" href="/">Back</Link>
        </div>
      </div>
    );
  }
  
  const canDos = getCanDosForLesson(lesson.id);
  
  function onProgress(i:number, total:number){ 
    setProgress({ i, total }); 
  }
  
  function onStep(ok:boolean){ 
    setRecentAnswer(ok);
    setTimeout(() => setRecentAnswer(null), 1000);
    
    if (ok) {
      setStreak(s => s+1);
      const newStreak = streak + 1;
      if (newStreak % 5 === 0) {
        const newStars = Math.min(3, stars + 1);
        setStars(newStars);
        setShowStarAnimation(true);
        setTimeout(() => setShowStarAnimation(false), 1500);
      }
    } else {
      setStreak(0);
    }
  }
  
  function onComplete(xp: number){ 
    // Mark lesson as complete in the store
    markLessonComplete(lesson!.id, xp);
    
    // Small delay before showing completion UI to ensure state is updated
    setTimeout(() => {
      setShowCompletion(true);
    }, 300);
  }
  
  const pct = progress.total? Math.round((progress.i/progress.total)*100) : 0;
  
  return (
    <div className="container-max grid gap-4 relative">
      {/* Enhanced progress header */}
      <div className="card p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Exit button */}
            <button
              onClick={() => setShowExitConfirm(true)}
              className="btn btn-secondary text-xs hover:bg-red-500/20 hover:border-red-400/30 hover:text-red-300 transition-all z-50 relative"
              title="Exit lesson"
            >
              ← Exit
            </button>
            
            {/* Animated progress ring */}
            <div className="relative h-12 w-12">
              <svg viewBox="0 0 36 36" className="h-12 w-12 progress-ring">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="3" />
                <circle 
                  cx="18" cy="18" r="16" fill="none" 
                  stroke="url(#progressGradient)" 
                  strokeWidth="3" 
                  strokeDasharray={`${pct}, 100`} 
                  transform="rotate(-90 18 18)"
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0" x2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 grid place-items-center text-xs font-bold">{pct}%</div>
            </div>
            
            {/* Animated streak counter */}
            <div className={`rounded-lg px-3 py-2 text-sm font-bold transition-all duration-300 ${
              streak > 0 ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/50 anim-glow" : "bg-white/10"
            }`}>
              🔥 {streak}
              {streak >= 5 && <span className="ml-1 text-xs">FIRE!</span>}
            </div>
            
            {/* Answer feedback */}
            {recentAnswer !== null && (
              <div className={`rounded-lg px-3 py-2 text-sm font-bold ${
                recentAnswer ? "bg-emerald-500/20 text-emerald-300 anim-pop" : "bg-red-500/20 text-red-300 anim-shake"
              }`}>
                {recentAnswer ? "✅ Correct!" : "❌ Try again"}
              </div>
            )}
          </div>
          
          {/* Animated stars */}
          <div className="flex items-center gap-1">
            {Array.from({length:3}).map((_,i)=> (
              <span 
                key={i} 
                className={`text-2xl transition-all duration-300 ${
                  i < stars 
                    ? "text-yellow-300 drop-shadow-lg" + (showStarAnimation && i === stars-1 ? " anim-bounce-in" : "")
                    : "text-gray-500"
                }`}
              >
                {i < stars ? "⭐" : "☆"}
              </span>
            ))}
          </div>
        </div>
        
        {/* Can-Do badges */}
        {canDos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {canDos.map(cd => (
              <span key={cd.id} className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                ✅ {cd.text}
              </span>
            ))}
          </div>
        )}
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
        
        {/* Progress text */}
        <div className="mt-2 text-center text-sm text-white/70">
          {lesson.title} • Question {progress.i} of {progress.total}
          {stars >= 2 && <span className="ml-2 text-yellow-300">⭐ Great job!</span>}
          {streak >= 10 && <span className="ml-2 text-orange-300">🔥 ON FIRE!</span>}
        </div>
      </div>
      
      <ExerciseEngine lesson={lesson} onProgress={onProgress} onComplete={onComplete} onStep={onStep} />
      
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExitConfirm(false);
            }
          }}
        >
          <div 
            className="card p-6 max-w-sm w-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/50 modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center grid gap-4">
              <div className="text-4xl">⚠️</div>
              <div>
                <h2 className="text-xl font-bold text-red-400">Exit Lesson?</h2>
                <p className="text-white/80 text-sm">
                  Your progress won't be saved if you leave now.
                </p>
              </div>
              
              <div className="grid gap-2">
                <button 
                  className="btn btn-primary bg-red-500 hover:bg-red-600 border-red-400"
                  onClick={handleModalClick(handleExit)}
                >
                  Yes, Exit Lesson
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleModalClick(() => setShowExitConfirm(false))}
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Completion Modal */}
      {showCompletion && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCompletion(false);
            }
          }}
        >
          <div 
            className="card p-6 max-w-md w-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border-emerald-400/50 modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center grid gap-4">
              <div className="text-4xl">🎉</div>
              <div>
                <h2 className="text-xl font-bold text-emerald-400">Lesson Complete!</h2>
                <p className="text-white/80 text-sm">
                  +{lesson.xp} XP • {stars}/3 stars • {streak} streak
                </p>
              </div>
              
              <div className="grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={handleModalClick(() => {
                    setShowCompletion(false);
                    router.push("/levels");
                  })}
                >
                  Continue to Next Level
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    className="btn btn-secondary text-xs"
                    onClick={handleModalClick(() => {
                      setShowCompletion(false);
                      router.push("/practice");
                    })}
                  >
                    📚 Review
                  </button>
                  <button 
                    className="btn btn-secondary text-xs"
                    onClick={handleModalClick(() => {
                      setShowCompletion(false);
                      router.push("/arcade");
                    })}
                  >
                    🕹️ Play
                  </button>
                </div>
                <button 
                  className="btn btn-secondary text-xs mt-2"
                  onClick={handleModalClick(() => setShowCompletion(false))}
                >
                  Close (Continue Studying)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 