"use client";
import { useState } from "react";
import { Exercise } from "@/lib/content";

interface MCQExerciseProps {
  exercise: Exercise;
  onNext: (correct: boolean) => void;
}

export default function MCQExercise({ exercise, onNext }: MCQExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const options = exercise.options || [];
  const correct = Array.isArray(exercise.correct) ? exercise.correct[0] : exercise.correct;

  const handleSubmit = () => {
    if (selected || showAnswer) {
      const isCorrect = selected === correct || showAnswer;
      setSubmitted(true);
      
      // If answer is wrong, automatically show the correct answer
      if (!isCorrect && !showAnswer) {
        setShowAnswer(true);
      }
      
      setTimeout(() => onNext(isCorrect), 1500);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setSelected(correct || null);
  };

  const getButtonClass = (option: string) => {
    if (!submitted) {
      return selected === option
        ? "ring-2 ring-blue-500 bg-blue-50"
        : "hover:bg-gray-50";
    }
    if (option === correct) {
      return "bg-green-100 ring-2 ring-green-500";
    }
    if (selected === option && option !== correct) {
      return "bg-red-100 ring-2 ring-red-500";
    }
    return "";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6">{exercise.prompt}</h2>
      
      <div className="space-y-3 mb-6">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => !submitted && setSelected(option)}
            disabled={submitted}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getButtonClass(option)}`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        {!submitted && !showAnswer && (
          <button
            onClick={handleShowAnswer}
            className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Show Answer
          </button>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={!selected && !showAnswer}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
            selected || showAnswer
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitted ? "Next" : "Check"}
        </button>
      </div>

      {submitted && (
        <div className={`mt-4 p-3 rounded-lg ${
          selected === correct || showAnswer
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {selected === correct || showAnswer ? "✓ Correct!" : `✗ The answer is: ${correct}`}
        </div>
      )}
    </div>
  );
}
