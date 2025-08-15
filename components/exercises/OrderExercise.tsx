"use client";
import { useState } from "react";
import { Exercise } from "@/lib/content";

interface OrderExerciseProps {
  exercise: Exercise;
  onNext: (correct: boolean) => void;
}

export default function OrderExercise({ exercise, onNext }: OrderExerciseProps) {
  const correctAnswer = Array.isArray(exercise.correct) ? exercise.correct[0] : exercise.correct;
  const words = correctAnswer ? correctAnswer.split(' ') : [];
  const [shuffled] = useState(() => [...words].sort(() => Math.random() - 0.5));
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>(shuffled);
  const [submitted, setSubmitted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleAddWord = (word: string, index: number) => {
    setSelected([...selected, word]);
    setAvailable(available.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (index: number) => {
    const word = selected[index];
    setAvailable([...available, word]);
    setSelected(selected.filter((_, i) => i !== index));
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setSelected(words);
    setAvailable([]);
  };

  const handleSubmit = () => {
    const isCorrect = correctAnswer ? selected.join(' ') === correctAnswer || showAnswer : showAnswer;
    setSubmitted(true);
    setTimeout(() => onNext(isCorrect), 1500);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6">{exercise.prompt}</h2>
      
      {/* Selected words */}
      <div className="min-h-[60px] p-4 border-2 border-blue-300 rounded-lg bg-blue-50 mb-4">
        <div className="flex flex-wrap gap-2">
          {selected.length === 0 ? (
            <span className="text-gray-400">Click words below to build the sentence</span>
          ) : (
            selected.map((word, index) => (
              <button
                key={index}
                onClick={() => !submitted && handleRemoveWord(index)}
                disabled={submitted}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {word}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Available words */}
      <div className="min-h-[60px] p-4 border-2 border-gray-300 rounded-lg bg-gray-50 mb-6">
        <div className="flex flex-wrap gap-2">
          {available.length === 0 ? (
            <span className="text-gray-400">All words used</span>
          ) : (
            available.map((word, index) => (
              <button
                key={index}
                onClick={() => !submitted && handleAddWord(word, index)}
                disabled={submitted}
                className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {word}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-3">
        {!submitted && (
          <button
            onClick={handleShowAnswer}
            className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Show Answer
          </button>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0 && !showAnswer}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
            selected.length > 0 || showAnswer
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitted ? "Next" : "Check"}
        </button>
      </div>

      {submitted && (
        <div className={`mt-4 p-3 rounded-lg ${
          (correctAnswer && selected.join(' ') === correctAnswer) || showAnswer
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {(correctAnswer && selected.join(' ') === correctAnswer) || showAnswer
            ? "✓ Correct!"
            : `✗ The answer is: ${correctAnswer || ''}`}
        </div>
      )}
    </div>
  );
}
