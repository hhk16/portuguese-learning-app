"use client";
import { useState, useEffect, useMemo } from "react";
import { getAllFlashcards, type Exercise } from "@/lib/content";
import { useAppStore } from "@/lib/store";
import { playCorrect, playWrong, launchConfetti } from "@/lib/effects";
import AudioButton from "@/components/AudioButton";

type GameMode = "flashcard" | "mcq" | "typing" | "listening";
type Category = "all" | "colors" | "food" | "verbs" | "professions" | "cultural" | "advanced";

export default function VocabBattlePage() {
  const { itemStats, recordItemResult, incrementXP, awardCoins } = useAppStore();
  const [gameMode, setGameMode] = useState<GameMode>("flashcard");
  const [category, setCategory] = useState<Category>("all");
  const [currentCard, setCurrentCard] = useState<Exercise | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [roundsLeft, setRoundsLeft] = useState(20);
  const [showFeedback, setShowFeedback] = useState<{correct: boolean; text: string} | null>(null);

  const allCards = getAllFlashcards();
  
  const categoryCards = useMemo(() => {
    switch(category) {
      case "colors": return allCards.filter(card => 
        card.term?.match(/vermelho|azul|verde|amarelo|branco|preto|rosa|roxo|castanho|cinzento|laranja|cor/i)
      );
      case "food": return allCards.filter(card => 
        card.term?.match(/pão|água|leite|carne|peixe|fruta|legumes|arroz|massa|queijo|ovos|manteiga|açúcar|sal|maçã|banana|laranja|tomate|batata|cebola|bacalhau|sardinha|pastel|caldo|bifana|bica|galão|vinho/i)
      );
      case "verbs": return allCards.filter(card => 
        card.term?.match(/ser|estar|ter|fazer|ir|vir|ver|dar|dizer|saber|conhecer|poder|querer|gostar|falar|comer|beber|dormir|trabalhar|estudar|viver|morar|acordar|levantar|sair|chegar|comprar|vender|pagar|ajudar/i)
      );
      case "professions": return allCards.filter(card => 
        card.term?.match(/médico|professor|enfermeiro|polícia|bombeiro|cozinheiro|vendedor|engenheiro|advogado|motorista|estudante/i)
      );
      case "cultural": return allCards.filter(card => 
        card.term?.match(/Lisboa|Porto|Coimbra|fado|festa|santos|São João|Natal|Páscoa|Carnaval|azulejo|bacalhau|francesinha|pastéis|vinho verde|chouriço|broa/i)
      );
      case "advanced": return allCards.filter(card => 
        card.term?.match(/banco|dinheiro|correios|médico|farmácia|multibanco|transferência|receita|medicamento|temperatura|tempestade|computador|internet|desporto|pintura|jardinagem/i)
      );
      default: return allCards;
    }
  }, [allCards, category]);

  const nextQuestion = () => {
    if (categoryCards.length === 0) return;
    
    // Use adaptive selection based on performance
    const adaptiveCards = [...categoryCards].sort((a, b) => {
      const statsA = itemStats[a.id] || { attempts: 0, correct: 0 };
      const statsB = itemStats[b.id] || { attempts: 0, correct: 0 };
      const scoreA = statsA.attempts > 0 ? statsA.correct / statsA.attempts : 0.5;
      const scoreB = statsB.attempts > 0 ? statsB.correct / statsB.attempts : 0.5;
      return scoreA - scoreB; // Prioritize weaker items
    });

    const card = adaptiveCards[Math.floor(Math.random() * Math.min(10, adaptiveCards.length))];
    setCurrentCard(card);
    setUserInput("");
    setShowAnswer(false);
    setShowFeedback(null);

    // Generate wrong options for MCQ
    if (gameMode === "mcq") {
      const wrongOptions = categoryCards
        .filter(c => c.id !== card.id && c.translation)
        .map(c => c.translation!)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const allOptions = [card.translation!, ...wrongOptions].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
    }
  };

  const handleAnswer = (answer: string | boolean) => {
    if (!currentCard || showFeedback) return;

    let correct = false;
    if (typeof answer === "boolean") {
      correct = answer;
    } else if (gameMode === "typing") {
      correct = answer.toLowerCase().trim() === currentCard.translation?.toLowerCase().trim();
    } else {
      correct = answer === currentCard.translation;
    }

    // Update stats and score
    recordItemResult(currentCard.id, correct);
    
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      incrementXP(5);
      awardCoins(2);
      playCorrect();
      
      if (streak > 0 && (streak + 1) % 5 === 0) {
        launchConfetti();
      }
    } else {
      setStreak(0);
      playWrong();
    }

    setShowFeedback({
      correct,
      text: correct ? "✅ Correto!" : `❌ Resposta: ${currentCard.translation}`
    });

    // Move to next question after delay
    setTimeout(() => {
      const newRounds = roundsLeft - 1;
      setRoundsLeft(newRounds);
      
      if (newRounds <= 0) {
        endGame();
      } else {
        nextQuestion();
      }
    }, 1500);
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setStreak(0);
    setRoundsLeft(20);
    nextQuestion();
  };

  const endGame = () => {
    setGameActive(false);
    const finalXP = score * 5;
    const finalCoins = score * 2;
    incrementXP(finalXP);
    awardCoins(finalCoins);
    
    if (score >= 15) launchConfetti();
  };

  const renderQuestion = () => {
    if (!currentCard || !gameActive) return null;

    switch (gameMode) {
      case "flashcard":
        return (
          <div className="card p-6 grid gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-2">{currentCard.term}</div>
              <AudioButton text={currentCard.term || ""} />
            </div>
            {showAnswer ? (
              <div className="text-center">
                <div className="text-xl text-white/80 mb-4">{currentCard.translation}</div>
                <div className="flex gap-3 justify-center">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleAnswer(false)}
                  >
                    😔 Hard
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleAnswer(true)}
                  >
                    😊 Easy
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAnswer(true)}
                >
                  Show Answer
                </button>
              </div>
            )}
          </div>
        );

      case "mcq":
        return (
          <div className="card p-6 grid gap-4">
            <div className="text-center">
              <div className="text-lg text-white/70 mb-2">Tradução:</div>
              <div className="text-2xl font-bold text-emerald-400 mb-3">{currentCard.term}</div>
              <AudioButton text={currentCard.term || ""} />
            </div>
            <div className="grid gap-2">
              {options.map((option, i) => (
                <button
                  key={i}
                  className="btn btn-secondary text-left"
                  onClick={() => handleAnswer(option)}
                  disabled={!!showFeedback}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case "typing":
        return (
          <div className="card p-6 grid gap-4">
            <div className="text-center">
              <div className="text-lg text-white/70 mb-2">Escreve em inglês:</div>
              <div className="text-2xl font-bold text-emerald-400 mb-3">{currentCard.term}</div>
              <AudioButton text={currentCard.term || ""} />
            </div>
            <div className="grid gap-3">
              <input
                type="text"
                className="rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-center text-lg"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the translation..."
                disabled={!!showFeedback}
                onKeyDown={(e) => e.key === "Enter" && handleAnswer(userInput)}
              />
              <button
                className="btn btn-primary"
                onClick={() => handleAnswer(userInput)}
                disabled={!userInput.trim() || !!showFeedback}
              >
                Submit
              </button>
            </div>
          </div>
        );

      case "listening":
        return (
          <div className="card p-6 grid gap-4">
            <div className="text-center">
              <div className="text-lg text-white/70 mb-4">Listen and type what you hear:</div>
              <AudioButton text={currentCard.term || ""} />
            </div>
            <div className="grid gap-3">
              <input
                type="text"
                className="rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-center text-lg"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type what you hear..."
                disabled={!!showFeedback}
                onKeyDown={(e) => e.key === "Enter" && handleAnswer(userInput)}
              />
              <button
                className="btn btn-primary"
                onClick={() => handleAnswer(userInput)}
                disabled={!userInput.trim() || !!showFeedback}
              >
                Submit
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container-max grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold text-gradient">🎯 Vocabulary Battle</h1>
        <p className="text-white/70">Ultimate challenge with ALL {allCards.length} vocabulary items!</p>
      </div>

      {!gameActive ? (
        <div className="grid gap-6">
          <div className="card p-6 grid gap-4">
            <h2 className="text-xl font-bold text-center">Game Settings</h2>
            
            <div className="grid gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Game Mode:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    className={`btn ${gameMode === "flashcard" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setGameMode("flashcard")}
                  >
                    💳 Flashcard
                  </button>
                  <button
                    className={`btn ${gameMode === "mcq" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setGameMode("mcq")}
                  >
                    ✅ MCQ
                  </button>
                  <button
                    className={`btn ${gameMode === "typing" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setGameMode("typing")}
                  >
                    ⌨️ Typing
                  </button>
                  <button
                    className={`btn ${gameMode === "listening" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setGameMode("listening")}
                  >
                    🎧 Listening
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    className={`btn ${category === "all" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setCategory("all")}
                  >
                    🌟 All ({allCards.length})
                  </button>
                  <button
                    className={`btn ${category === "colors" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setCategory("colors")}
                  >
                    🌈 Colors
                  </button>
                  <button
                    className={`btn ${category === "food" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setCategory("food")}
                  >
                    🍽️ Food
                  </button>
                  <button
                    className={`btn ${category === "verbs" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setCategory("verbs")}
                  >
                    ⚡ Verbs
                  </button>
                  <button
                    className={`btn ${category === "professions" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setCategory("professions")}
                  >
                    👔 Jobs
                  </button>
                  <button
                    className={`btn ${category === "cultural" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setCategory("cultural")}
                  >
                    🇵🇹 Culture
                  </button>
                  <button
                    className={`btn ${category === "advanced" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setCategory("advanced")}
                  >
                    🎓 Advanced
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-white/70 mb-3">
                Selected: {categoryCards.length} vocabulary items
              </div>
              <button 
                className="btn btn-lg btn-primary"
                onClick={startGame}
                disabled={categoryCards.length === 0}
              >
                🚀 Start Battle!
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Game Stats */}
          <div className="card p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
            <div className="flex items-center justify-between text-sm">
              <div>Round {21 - roundsLeft}/20</div>
              <div className="flex items-center gap-4">
                <div>Score: {score}/{21 - roundsLeft}</div>
                <div className={`${streak > 0 ? "text-orange-400" : "text-white/60"}`}>
                  🔥 {streak}
                </div>
              </div>
            </div>
          </div>

          {/* Question */}
          {renderQuestion()}

          {/* Feedback */}
          {showFeedback && (
            <div className={`card p-4 text-center ${
              showFeedback.correct 
                ? "bg-emerald-500/20 border-emerald-400/50" 
                : "bg-red-500/20 border-red-400/50"
            }`}>
              <div className="font-bold">{showFeedback.text}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 