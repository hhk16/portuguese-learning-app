"use client";
import { useState } from "react";
import { Exercise } from "@/lib/content";
import { validateAnswer } from "@/lib/ai-validator";

interface TypingExerciseProps {
  exercise: Exercise;
  onNext: (correct: boolean) => void;
}

export default function TypingExercise({ exercise, onNext }: TypingExerciseProps) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async () => {
    if (showAnswer) {
      setSubmitted(true);
      setIsCorrect(true);
      setFeedback("Answer shown - Continue to next");
      setTimeout(() => onNext(true), 1500);
      return;
    }

    if (answer.trim()) {
      setIsValidating(true);
      const expected = Array.isArray(exercise.correct) ? exercise.correct[0] : exercise.correct;
      const result = await validateAnswer(
        answer,
        expected || '',
        "typing",
        exercise.prompt
      );
      
      setIsValidating(false);
      setSubmitted(true);
      setIsCorrect(result.isCorrect);
      setFeedback(result.feedback);
      
      // If answer is wrong, automatically show the correct answer
      if (!result.isCorrect) {
        setShowAnswer(true);
        const expected = Array.isArray(exercise.correct) ? exercise.correct[0] : exercise.correct;
        setAnswer(expected || '');
      }
      
      setTimeout(() => onNext(result.isCorrect), 2000);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    const expected = Array.isArray(exercise.correct) ? exercise.correct[0] : exercise.correct;
    setAnswer(expected || '');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6">{exercise.prompt}</h2>
      
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted || isValidating}
        placeholder="Type your answer..."
        className="w-full p-4 border-2 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
      />

      <div className="flex gap-3 mt-6">
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
          disabled={(!answer.trim() && !showAnswer) || isValidating}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
            (answer.trim() || showAnswer) && !isValidating
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isValidating ? "Checking..." : submitted ? "Next" : "Check"}
        </button>
      </div>

      {submitted && feedback && (
        <div className={`mt-4 p-3 rounded-lg ${
          isCorrect
            ? feedback.includes("Partially") 
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {feedback}
        </div>
      )}
    </div>
  );
}
