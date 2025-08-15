"use client";
import { useState, useEffect, Suspense } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { getLessonByIdOptimized } from "@/lib/content-loader";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import heavy ExerciseEngine component
const ExerciseEngine = dynamic(() => import("@/components/ExerciseEngine"), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading exercises...</p>
      </div>
    </div>
  ),
  ssr: false // Disable SSR for this component
});

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [progress, setProgress] = useState({ i: 0, total: 0 });
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [recentAnswer, setRecentAnswer] = useState<boolean | null>(null);
  const [showStarAnimation, setShowStarAnimation] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const { markLessonComplete } = useAppStore();
  const router = useRouter();
  
  // Load lesson data dynamically
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        const lessonData = await getLessonByIdOptimized(params.lessonId);
        if (!lessonData) {
          setError("Lesson not found");
        } else {
          setLesson(lessonData);
        }
      } catch (err) {
        console.error("Error loading lesson:", err);
        setError("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };
    
    loadLesson();
  }, [params.lessonId]);
  
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
      body.classList.add('modal-open');
    } else {
      body.style.overflow = 'unset';
      body.classList.remove('modal-open');
    }
    
    return () => {
      body.style.overflow = 'unset';
      body.classList.remove('modal-open');
    };
  }, [showCompletion, showExitConfirm]);

  const handleExit = () => {
    try {
      router.push('/levels');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/levels';
    }
  };

  const handleModalClick = (action: 'confirm' | 'cancel') => {
    if (action === 'confirm') {
      setTimeout(() => {
        handleExit();
      }, 50);
    } else {
      setShowExitConfirm(false);
    }
  };

  const handleCompletion = () => {
    if (lesson) {
      markLessonComplete(lesson.id, stars);
    }
    setShowCompletion(true);
  };

  const handleAnswer = (correct: boolean) => {
    setRecentAnswer(correct);
    if (correct) {
      setStreak(prev => prev + 1);
      if (streak >= 2) {
        setStars(prev => Math.min(3, prev + 1));
        setShowStarAnimation(true);
        setTimeout(() => setShowStarAnimation(false), 1000);
      }
    } else {
      setStreak(0);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {error || "Lesson not found"}
            </h1>
            <p className="text-gray-600 mb-6">
              The lesson "{params.lessonId}" could not be loaded.
            </p>
            <Link 
              href="/levels"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Levels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors z-50 relative"
              aria-label="Exit lesson"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex-1 mx-8">
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${progress.total > 0 ? (progress.i / progress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1 text-center">
                Question {progress.i} of {progress.total}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-8 h-8 transition-all duration-300 ${
                    i < stars 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  } ${showStarAnimation && i === stars - 1 ? 'animate-bounce' : ''}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Engine */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <ExerciseEngine
          lesson={lesson}
          onProgress={(i, total) => setProgress({ i, total })}
          onStep={handleAnswer}
          onComplete={() => handleCompletion()}
        />
      </Suspense>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Leave lesson?</h2>
            <p className="text-gray-600 mb-6">
              Your progress won't be saved if you leave now.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleModalClick('cancel')}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Stay
              </button>
              <button
                onClick={() => handleModalClick('confirm')}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2">Lesson Complete!</h2>
              <div className="flex justify-center gap-2 my-4">
                {[...Array(3)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-12 h-12 ${
                      i < stars 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                You earned {stars} star{stars !== 1 ? 's' : ''}!
              </p>
              <Link
                href="/levels"
                className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-lg font-semibold"
              >
                Continue
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
