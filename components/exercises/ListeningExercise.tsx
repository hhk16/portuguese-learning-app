"use client";
import { useState, useRef } from "react";
import { Exercise } from "@/lib/content";

interface ListeningExerciseProps {
  exercise: Exercise;
  onNext: (correct: boolean) => void;
}

export default function ListeningExercise({ exercise, onNext }: ListeningExerciseProps) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const text = Array.isArray(exercise.correct) ? exercise.correct[0] : exercise.correct;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-PT';
      utterance.rate = 0.8;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = () => {
    const expected = Array.isArray(exercise.correct) ? exercise.correct[0] : exercise.correct;
    const isCorrect = expected ? answer.toLowerCase().trim() === expected.toLowerCase().trim() || showAnswer : showAnswer;
    setSubmitted(true);
    setTimeout(() => onNext(isCorrect), 1500);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    const expected = Array.isArray(exercise.correct) ? exercise.correct[0] : exercise.correct;
    setAnswer(expected || '');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6">{exercise.prompt}</h2>
      
      <button
        onClick={handlePlay}
        disabled={isPlaying}
        className="mb-6 px-8 py-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-3 mx-auto"
      >
        <span className="text-2xl">🔊</span>
        {isPlaying ? "Playing..." : "Play Audio"}
      </button>
      
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted}
        placeholder="Type what you hear..."
        className="w-full p-4 border-2 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6"
        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
      />

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
          disabled={!answer.trim() && !showAnswer}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
            answer.trim() || showAnswer
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitted ? "Next" : "Check"}
        </button>
      </div>

      {submitted && (() => {
        const expected = Array.isArray(exercise.correct) ? exercise.correct[0] : exercise.correct;
        const isCorrect = expected ? answer.toLowerCase().trim() === expected.toLowerCase().trim() || showAnswer : showAnswer;
        return (
          <div className={`mt-4 p-3 rounded-lg ${
            isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {isCorrect ? "✓ Correct!" : `✗ The answer is: ${expected || ''}`}
          </div>
        );
      })()}
    </div>
  );
}
