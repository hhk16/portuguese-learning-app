"use client";
import { useState } from "react";
import { Exercise } from "@/lib/content";

interface MatchingExerciseProps {
  exercise: Exercise;
  onNext: (correct: boolean) => void;
}

export default function MatchingExercise({ exercise, onNext }: MatchingExerciseProps) {
  const pairs = exercise.pairs || [];
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const leftItems = pairs.map(p => 'left' in p ? (p as any).left : (p as any).a) as string[];
  const rightItems = (pairs.map(p => 'right' in p ? (p as any).right : (p as any).b) as string[]).sort(() => Math.random() - 0.5);

  const handleMatch = (right: string) => {
    if (selected && !matched.has(selected) && !matched.has(right)) {
      const pair = pairs.find(p => ('left' in p ? (p as any).left : (p as any).a) === selected);
      if (pair && ('right' in pair ? (pair as any).right : (pair as any).b) === right) {
        setMatched(new Set([...matched, selected, right]));
      }
      setSelected(null);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    const allMatched = new Set<string>();
    pairs.forEach(p => {
      allMatched.add('left' in p ? (p as any).left : (p as any).a);
      allMatched.add('right' in p ? (p as any).right : (p as any).b);
    });
    setMatched(allMatched);
  };

  const handleSubmit = () => {
    const isComplete = matched.size === pairs.length * 2 || showAnswer;
    setSubmitted(true);
    
    // If answer is wrong (incomplete), automatically show the correct answer
    if (!isComplete && !showAnswer) {
      setShowAnswer(true);
      const allMatched = new Set<string>();
      pairs.forEach(p => {
        allMatched.add('left' in p ? (p as any).left : (p as any).a);
        allMatched.add('right' in p ? (p as any).right : (p as any).b);
      });
      setMatched(allMatched);
    }
    
    setTimeout(() => onNext(isComplete), 1500);
  };

  const isComplete = matched.size === pairs.length * 2;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6">{exercise.prompt}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          {leftItems.map((item) => (
            <button
              key={item}
              onClick={() => !matched.has(item) && setSelected(item)}
              disabled={matched.has(item) || submitted}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                matched.has(item)
                  ? "bg-green-100 border-green-500"
                  : selected === item
                  ? "bg-blue-100 border-blue-500"
                  : "hover:bg-gray-50 border-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        
        <div className="space-y-2">
          {rightItems.map((item) => (
            <button
              key={item}
              onClick={() => handleMatch(item)}
              disabled={matched.has(item) || submitted}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                matched.has(item)
                  ? "bg-green-100 border-green-500"
                  : "hover:bg-gray-50 border-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {!isComplete && !submitted && (
          <button
            onClick={handleShowAnswer}
            className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Show Answer
          </button>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={!isComplete && !showAnswer}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
            isComplete || showAnswer
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitted ? "Next" : "Continue"}
        </button>
      </div>
    </div>
  );
}
