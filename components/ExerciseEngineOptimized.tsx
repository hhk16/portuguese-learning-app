"use client";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Exercise, Lesson } from "@/lib/content";
import { validateAnswer } from "@/lib/ai-validator";
import dynamic from "next/dynamic";

// Loading component for exercises
const ExerciseLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Dynamically import exercise components for code splitting
const MCQExercise = dynamic(() => import("./exercises/MCQExercise"), {
  loading: () => <ExerciseLoader />,
});

const TypingExercise = dynamic(() => import("./exercises/TypingExercise"), {
  loading: () => <ExerciseLoader />,
});

const MatchingExercise = dynamic(() => import("./exercises/MatchingExercise"), {
  loading: () => <ExerciseLoader />,
});

const ListeningExercise = dynamic(() => import("./exercises/ListeningExercise"), {
  loading: () => <ExerciseLoader />,
});

const OrderExercise = dynamic(() => import("./exercises/OrderExercise"), {
  loading: () => <ExerciseLoader />,
});

// Lazy load the lesson content presentation (heavy component)
const LessonContentPresentation = lazy(() => import("./LessonContentPresentation"));

interface ExerciseEngineProps {
  lesson: Lesson;
  onProgress?: (current: number, total: number) => void;
  onAnswer?: (correct: boolean) => void;
  onComplete?: () => void;
}

export default function ExerciseEngineOptimized({
  lesson,
  onProgress,
  onAnswer,
  onComplete,
}: ExerciseEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showContent, setShowContent] = useState(true);
  const [exerciseQueue, setExerciseQueue] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Initialize exercise queue
  useEffect(() => {
    const initQueue = async () => {
      setIsLoading(true);
      
      // If lesson has enough exercises, use them directly
      if (lesson.exercises && lesson.exercises.length >= 8) {
        setExerciseQueue(lesson.exercises);
      } else {
        // Otherwise, orchestrate exercises (this could be moved to a worker)
        const orchestrated = await orchestrateExercises(lesson);
        setExerciseQueue(orchestrated);
      }
      
      setIsLoading(false);
    };

    initQueue();
  }, [lesson]);

  // Update progress
  useEffect(() => {
    if (onProgress && exerciseQueue.length > 0) {
      onProgress(currentIndex, exerciseQueue.length);
    }
  }, [currentIndex, exerciseQueue.length, onProgress]);

  const handleNext = (correct: boolean) => {
    if (onAnswer) {
      onAnswer(correct);
    }

    if (currentIndex < exerciseQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handleStartExercises = () => {
    setShowContent(false);
  };

  const currentExercise = exerciseQueue[currentIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing exercises...</p>
        </div>
      </div>
    );
  }

  // Show lesson content first
  if (showContent && lesson.content) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <LessonContentPresentation
          content={lesson.content}
          onContinue={handleStartExercises}
        />
      </Suspense>
    );
  }

  if (!currentExercise) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No exercises available</p>
      </div>
    );
  }

  // Render current exercise
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Help buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowReview(true)}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          📖 Review Guide
        </button>
        <button
          onClick={() => setShowHelp(true)}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          💡 Exercise Tips
        </button>
      </div>

      {/* Exercise Component */}
      <Suspense fallback={<ExerciseLoader />}>
        {currentExercise.type === "mcq" && (
          <MCQExercise
            key={currentExercise.id}
            exercise={currentExercise}
            onNext={handleNext}
          />
        )}
        {currentExercise.type === "typing" && (
          <TypingExercise
            key={currentExercise.id}
            exercise={currentExercise}
            onNext={handleNext}
          />
        )}
        {currentExercise.type === "matching" && (
          <MatchingExercise
            key={currentExercise.id}
            exercise={currentExercise}
            onNext={handleNext}
          />
        )}
        {currentExercise.type === "listening" && (
          <ListeningExercise
            key={currentExercise.id}
            exercise={currentExercise}
            onNext={handleNext}
          />
        )}
        {currentExercise.type === "order" && (
          <OrderExercise
            key={currentExercise.id}
            exercise={currentExercise}
            onNext={handleNext}
          />
        )}
      </Suspense>

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            <button
              onClick={() => setShowReview(false)}
              className="float-right text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <Suspense fallback={<ExerciseLoader />}>
              <LessonContentPresentation
                content={lesson.content}
                onContinue={() => setShowReview(false)}
                isReview={true}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">💡 Exercise Tips</h3>
            <div className="space-y-3 text-gray-700">
              {currentExercise.type === "typing" && (
                <>
                  <p>• Type your answer in Portuguese</p>
                  <p>• Accents are important but won't block progress</p>
                  <p>• Use "Show Answer" if stuck</p>
                </>
              )}
              {currentExercise.type === "mcq" && (
                <>
                  <p>• Read all options carefully</p>
                  <p>• Look for context clues</p>
                  <p>• Eliminate obvious wrong answers</p>
                </>
              )}
              {currentExercise.type === "matching" && (
                <>
                  <p>• Match Portuguese with English</p>
                  <p>• Start with words you know</p>
                  <p>• Use process of elimination</p>
                </>
              )}
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Lightweight exercise orchestration
async function orchestrateExercises(lesson: Lesson): Promise<Exercise[]> {
  // This is a simplified version - in production, this could be moved to a Web Worker
  const base = lesson.exercises || [];
  
  // Simple expansion logic
  const expanded: Exercise[] = [];
  for (const ex of base) {
    expanded.push(ex);
    // Add variations if needed
    if (expanded.length < 12 && ex.type === "typing") {
      expanded.push({
        ...ex,
        id: `${ex.id}-var`,
        prompt: ex.prompt + " (variation)",
      });
    }
  }
  
  return expanded.slice(0, 12);
}
