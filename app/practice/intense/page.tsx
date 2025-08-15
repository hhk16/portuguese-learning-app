"use client";
import { useState, useEffect, useCallback } from "react";
import { getAllFlashcards, type Exercise } from "@/lib/content";
import { useAppStore } from "@/lib/store";
import { launchConfetti, playCorrect, playWrong } from "@/lib/effects";
import Link from "next/link";

type GameType = "flashcard" | "mcq" | "typing" | "listening" | "matching" | "speed";

export default function IntensePracticePage() {
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes instead of 5
  const [gameActive, setGameActive] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  const games = [
    { id: "flashcard", title: "🔥 Flash Drill", desc: "Rapid flashcard review" },
    { id: "mcq", title: "⚡ Lightning MCQ", desc: "Fast multiple choice" },
    { id: "typing", title: "⌨️ Type Storm", desc: "Speed typing challenge" },
    { id: "listening", title: "👂 Audio Blitz", desc: "Listen and respond" },
    { id: "matching", title: "🔗 Match Rush", desc: "Connect pairs quickly" },
    { id: "speed", title: "🚀 Speed Round", desc: "Ultimate challenge" }
  ];

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  const startGame = useCallback((type: GameType) => {
    setGameType(type);
    setGameActive(true);
    setScore(0);
    setStreak(0);
    setSessionStats({ correct: 0, total: 0 });
    setTimeLeft(600); // 10 minutes
  }, []);

  const handleAnswer = useCallback((correct: boolean) => {
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
    setSessionStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  }, [streak]);

  if (!gameActive && gameType) {
    return (
      <div className="container-max">
        <div className="card p-8 text-center bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-400/40">
          <div className="text-6xl mb-4 anim-bounce-in">🎯</div>
          <h1 className="text-4xl font-bold mb-4 text-gradient">Intense Session Complete!</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto mb-6">
            <div className="bg-emerald-500/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-emerald-300">{score}</div>
              <div className="text-xs text-emerald-200/70">Score</div>
            </div>
            <div className="bg-yellow-500/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-yellow-300">{streak}</div>
              <div className="text-xs text-yellow-200/70">Best Streak</div>
            </div>
            <div className="bg-blue-500/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-blue-300">{sessionStats.total}</div>
              <div className="text-xs text-blue-200/70">Questions</div>
            </div>
            <div className="bg-purple-500/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-purple-300">{Math.round((sessionStats.correct / sessionStats.total) * 100) || 0}%</div>
              <div className="text-xs text-purple-200/70">Accuracy</div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(gameType)} className="btn btn-primary">
              🔄 Play Again
            </button>
            <button onClick={() => { setGameType(null); setGameActive(false); }} className="btn btn-secondary">
              🏠 Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameActive && gameType) {
    return <GameRenderer gameType={gameType} onAnswer={handleAnswer} timeLeft={timeLeft} score={score} streak={streak} />;
  }

  return (
    <div className="container-max grid gap-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-gradient anim-bounce-in">⚡ INTENSE PRACTICE ⚡</h1>
        <p className="text-xl text-white/70">10-minute focused challenges • Multiple game modes • Beat your best score!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, i) => (
          <button
            key={game.id}
            onClick={() => startGame(game.id as GameType)}
            className="card p-6 hover-lift anim-slide-in group"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="text-3xl mb-3 group-hover:anim-bounce-in">{game.title.split(' ')[0]}</div>
            <h3 className="text-xl font-bold mb-2">{game.title.substring(2)}</h3>
            <p className="text-white/60">{game.desc}</p>
            <div className="mt-4 text-sm text-emerald-300">▶ Start Challenge</div>
          </button>
        ))}
      </div>

      <div className="card p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-400/30">
        <h2 className="text-2xl font-bold mb-3 text-orange-300">🎯 How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-orange-200">⏱️ 10 Minutes</div>
            <div className="text-white/70">Answer as many as you can at your own pace</div>
          </div>
          <div>
            <div className="font-semibold text-orange-200">🔥 Streaks</div>
            <div className="text-white/70">Consecutive correct = bonus points</div>
          </div>
          <div>
            <div className="font-semibold text-orange-200">🏆 High Score</div>
            <div className="text-white/70">Challenge yourself to improve</div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/practice" className="btn btn-secondary">
          ← Back to Regular Practice
        </Link>
      </div>
    </div>
  );
}

function GameRenderer({ gameType, onAnswer, timeLeft, score, streak }: {
  gameType: GameType;
  onAnswer: (correct: boolean) => void;
  timeLeft: number;
  score: number;
  streak: number;
}) {
  const [currentCard, setCurrentCard] = useState<Exercise | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const allCards = getAllFlashcards();

  const nextQuestion = useCallback(() => {
    if (allCards.length === 0) return;
    
    const card = allCards[Math.floor(Math.random() * allCards.length)];
    setCurrentCard(card);
    setUserInput("");
    setShowAnswer(false);
    setShowFeedback(null);
    setIsProcessing(false);
    
    if (gameType === "mcq" || gameType === "speed") {
      const wrongOptions = allCards
        .filter(c => c.id !== card.id && c.translation)
        .map(c => c.translation!)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const allOptions = [card.translation!, ...wrongOptions].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
    }
  }, [allCards, gameType]);

  // Only call nextQuestion ONCE when component mounts
  useEffect(() => {
    if (!currentCard) {
      nextQuestion();
    }
  }, []); // Empty dependency array - only run on mount

  const handleAnswer = (answer: string | boolean) => {
    if (!currentCard || isProcessing) return;
    
    setIsProcessing(true);
    
    let correct = false;
    if (typeof answer === "boolean") {
      correct = answer;
    } else if (gameType === "typing") {
      correct = answer.toLowerCase().trim() === currentCard.translation?.toLowerCase().trim();
    } else {
      correct = answer === currentCard.translation;
    }
    
    // Show immediate feedback
    setShowFeedback({
      correct,
      text: correct ? "✅ Correct!" : `❌ ${currentCard.translation}`
    });
    
    onAnswer(correct);
    
    // Wait 1.5 seconds before moving to next question
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentCard) return <div className="text-center p-8">Loading next question...</div>;

  return (
    <div className="container-max grid gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-bold px-4 py-2 rounded-xl ${
            timeLeft <= 60 ? "bg-red-500/20 text-red-300 anim-glow" : "bg-purple-500/20 text-purple-300"
          }`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <div className="text-xl font-bold text-emerald-300">🏆 {score}</div>
          <div className="text-lg text-yellow-300">🔥 {streak}</div>
        </div>
        <div className="text-lg font-semibold text-white/70">{gameType.toUpperCase()}</div>
      </div>

      {/* Game Area */}
      <div className="card p-8 bg-gradient-to-br from-white/10 to-white/5 border-white/20">
        {showFeedback ? (
          <div className="text-center">
            <div className={`text-3xl font-bold mb-4 ${
              showFeedback.correct ? 'text-emerald-300 anim-pop' : 'text-red-300 anim-shake'
            }`}>
              {showFeedback.text}
            </div>
            <div className="text-white/60">Next question in a moment...</div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2 anim-pop">{currentCard.term}</div>
              <div className="text-white/60">
                {gameType === "flashcard" && "Remember the translation"}
                {gameType === "mcq" && "Choose the correct translation"}
                {gameType === "typing" && "Type the translation"}
                {gameType === "listening" && "Listen and type what you hear"}
                {gameType === "speed" && "Quick! Pick the right answer"}
              </div>
            </div>

            {gameType === "flashcard" && (
              <div className="text-center space-y-4">
                {!showAnswer ? (
                  <button 
                    onClick={() => setShowAnswer(true)}
                    className="btn btn-primary btn-lg anim-pop"
                    disabled={isProcessing}
                  >
                    Show Answer
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-2xl text-emerald-300 anim-bounce-in">{currentCard.translation}</div>
                    <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => handleAnswer(false)} 
                        className="btn bg-red-500/20 border-red-400 text-red-200"
                        disabled={isProcessing}
                      >
                        😵 Forgot
                      </button>
                      <button 
                        onClick={() => handleAnswer(true)} 
                        className="btn bg-emerald-500/20 border-emerald-400 text-emerald-200"
                        disabled={isProcessing}
                      >
                        ✅ Knew It
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(gameType === "mcq" || gameType === "speed") && (
              <div className="grid gap-3 max-w-md mx-auto">
                {options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option)}
                    className="btn bg-white/5 border-white/15 hover:bg-white/10 text-left p-4 transition-all hover:scale-105 anim-slide-in disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ animationDelay: `${i * 0.1}s` }}
                    disabled={isProcessing}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {gameType === "typing" && (
              <div className="max-w-md mx-auto space-y-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isProcessing) {
                      handleAnswer(userInput);
                    }
                  }}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-lg text-center disabled:opacity-50"
                  placeholder="Type the translation..."
                  autoFocus
                  disabled={isProcessing}
                />
                <button 
                  onClick={() => handleAnswer(userInput)}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  Submit
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 