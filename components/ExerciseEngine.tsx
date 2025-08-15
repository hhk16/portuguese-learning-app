"use client";
import { useState, useEffect, useMemo } from "react";
import { type Exercise, type Lesson, type LessonContent } from "@/lib/content";
import { useAppStore } from "@/lib/store";
import AccentKeyboard from "@/components/AccentKeyboard";
import AudioButton from "@/components/AudioButton";
import SpeechInput from "@/components/SpeechInput";

import { launchConfetti, playCorrect, playWrong } from "@/lib/effects";
import { orchestrateLesson } from "@/lib/orchestrator";
import { validateAnswer } from "@/lib/ai-validator";
import { getAllFlashcards } from "@/lib/content";

// Utility to generate realistic wrong answers for MCQ
function generateWrongAnswers(correctAnswer: string, currentExerciseId: string, count: number = 2): string[] {
  const allFlashcards = getAllFlashcards();
  
  // Categorize words to create more challenging distractors
  const categories = {
    greetings: ['hello', 'goodbye', 'good morning', 'good afternoon', 'good evening', 'good night'],
    politeness: ['please', 'thank you', 'excuse me', 'sorry', 'you\'re welcome'],
    basics: ['yes', 'no', 'maybe', 'here', 'there'],
    food: ['water', 'bread', 'milk', 'coffee', 'tea', 'wine', 'cheese', 'meat', 'fish'],
    colors: ['red', 'blue', 'green', 'yellow', 'white', 'black', 'orange', 'purple'],
    numbers: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
    time: ['today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening', 'night'],
    family: ['mother', 'father', 'brother', 'sister', 'son', 'daughter', 'family']
  };
  
  // Find which category the correct answer belongs to
  let sameCategory: string[] = [];
  for (const [_category, words] of Object.entries(categories)) {
    if (words.some(word => word.toLowerCase() === correctAnswer.toLowerCase())) {
      sameCategory = words.filter(word => word.toLowerCase() !== correctAnswer.toLowerCase());
      break;
    }
  }
  
  // Filter available flashcard translations (prioritize different types)
  const otherTranslations = allFlashcards
    .filter(card => 
      card.id !== currentExerciseId && 
      card.translation && 
      card.translation.toLowerCase() !== correctAnswer.toLowerCase()
    )
    .map(card => card.translation!)
    .filter(Boolean);
  
  const wrongAnswers: string[] = [];
  
  // Strategy 1: Add 1 from same category (more challenging)
  if (sameCategory.length > 0 && wrongAnswers.length < count) {
    const randomSameCategory = sameCategory[Math.floor(Math.random() * sameCategory.length)];
    wrongAnswers.push(randomSameCategory);
  }
  
  // Strategy 2: Add from other flashcards (realistic alternatives)
  while (wrongAnswers.length < count && otherTranslations.length > 0) {
    const randomIndex = Math.floor(Math.random() * otherTranslations.length);
    const candidate = otherTranslations[randomIndex];
    if (!wrongAnswers.includes(candidate)) wrongAnswers.push(candidate);
    otherTranslations.splice(randomIndex, 1);
  }
  
  // Strategy 3: Fallback to mixed categories if needed
  if (wrongAnswers.length < count) {
    const allFallbacks = Object.values(categories)
      .flat()
      .filter(word => 
        word.toLowerCase() !== correctAnswer.toLowerCase() && 
        !wrongAnswers.includes(word)
      );
    
    while (wrongAnswers.length < count && allFallbacks.length > 0) {
      const randomIndex = Math.floor(Math.random() * allFallbacks.length);
      wrongAnswers.push(allFallbacks[randomIndex]);
      allFallbacks.splice(randomIndex, 1);
    }
  }
  
  return wrongAnswers.slice(0, count);
}

// Build a short auto-quiz (5 items) from lesson content
function buildAutoQuiz(lesson: Lesson): Exercise[] {
  const quiz: Exercise[] = [];
  const flashcards = lesson.exercises.filter(e => e.type === "flashcard" && e.term && e.translation);
  if (flashcards.length === 0) return quiz;

  // Helper pick
  const pick = () => flashcards[Math.floor(Math.random() * flashcards.length)] as any;

  // 1) MCQ (term -> translation)
  const a = pick();
  const wrongA = generateWrongAnswers(a.translation, a.id, 3);
  quiz.push({ id: `quiz-${lesson.id}-mcq-1`, type: "mcq", prompt: `Translate: '${a.term}'`, options: [a.translation, ...wrongA].sort(() => Math.random() - 0.5), correct: a.translation } as any);

  // 2) Typing (EN -> PT)
  const b = pick();
  quiz.push({ id: `quiz-${lesson.id}-type-pt`, type: "typing", prompt: `Type in Portuguese: '${b.translation}'`, correct: b.term } as any);

  // 3) Typing (PT -> EN)
  const c = pick();
  quiz.push({ id: `quiz-${lesson.id}-type-en`, type: "typing", prompt: `Type in English: '${c.term}'`, correct: c.translation } as any);

  // 4) Listening (say PT; user types PT)
  const d = pick();
  quiz.push({ id: `quiz-${lesson.id}-listen`, type: "listening", audioTextPt: d.term, prompt: "Type what you hear (PT-PT)", correct: d.term } as any);

  // 5) Order (if possible), else MCQ
  const e = pick();
  const words = (e.term as string).split(" ");
  if (words.length > 1) {
    quiz.push({ id: `quiz-${lesson.id}-order`, type: "order", prompt: "Order the Portuguese phrase", correct: e.term, items: words } as any);
  } else {
    const wrongB = generateWrongAnswers(e.translation, e.id, 3);
    quiz.push({ id: `quiz-${lesson.id}-mcq-2`, type: "mcq", prompt: `Translate: '${e.term}'`, options: [e.translation, ...wrongB].sort(() => Math.random() - 0.5), correct: e.translation } as any);
  }

  // Mark quiz items with id prefix "quiz-" so we don't requeue wrong answers
  return quiz;
}

// Utility to expand a lesson with extra variants for density
function expandLesson(lesson: Lesson): Exercise[] {
  const result: Exercise[] = [];
  for (const ex of lesson.exercises) {
    // IMPORTANT: Preserve ALL properties of the original exercise
    // This includes special properties like 'pairs' for matching exercises
    result.push({ ...ex });
    
    if (ex.type === "flashcard" && ex.term && ex.translation) {
      // Generate realistic wrong answers for MCQ
      const wrongAnswers = generateWrongAnswers(ex.translation, ex.id, 2);
      const allOptions = [ex.translation, ...wrongAnswers].sort(() => Math.random() - 0.5);
      
      result.push({ 
        id: ex.id + "-mcq-en", 
        type: "mcq", 
        prompt: `Translate: '${ex.term}'`, 
        options: allOptions, 
        correct: ex.translation 
      } as any);
      result.push({ id: ex.id + "-type-en", type: "typing", prompt: `Type in English: '${ex.term}'`, correct: ex.translation } as any);
      result.push({ id: ex.id + "-type-pt", type: "typing", prompt: `Type in Portuguese: '${ex.translation}'`, correct: ex.term } as any);
      const words = (ex.term as string).split(" ");
      if (words.length > 1) result.push({ id: ex.id + "-order", type: "order", correct: ex.term, items: words } as any);
    }
  }
  return result;
}

function useStopwatch() {
  const [start, setStart] = useState<number | null>(null);
  useEffect(() => { setStart(Date.now()); }, []);
  const elapsed = () => (start ? Date.now() - start : undefined);
  return { elapsed };
}

function isPortugueseExpected(expected: string): boolean {
  const s = (expected || "").toLowerCase();
  // Accents or special PT chars
  if (/[áàâãçéêíóôõú]/i.test(s)) return true;
  // Ordinal symbols used in PT
  if (/[ºª]/.test(s)) return true;
  // Common PT tokens/articles/prepositions and frequent vocab
  const ptTokens = [
    " o ", " a ", " os ", " as ", " um ", " uma ", " de ", " do ", " da ", " dos ", " das ",
    " ao ", " à ", " aos ", " às ", " no ", " na ", " nos ", " nas ",
    "andar", "primeiro", "segundo", "terceiro", "quarto", "quinto", "sexto", "sétimo", "oitavo", "nono", "décimo"
  ];
  const padded = ` ${s} `;
  if (ptTokens.some(t => padded.includes(t))) return true;
  // Looks like PT ordinal written as "1.o" or similar
  if (/\b\d+\.?o\b/.test(s)) return true;
  return false;
}

function EnglishHint({ ex }: { ex: Exercise }) {
  const show = useAppStore(s => s.showEnglishHints);
  if (!show) return null;
  let hint: string | null = null;
  switch (ex.type) {
    case "flashcard":
      hint = "Tap Show to reveal the English meaning.";
      break;
    case "mcq":
      hint = "Choose the best English meaning for the Portuguese phrase.";
      break;
    case "typing": {
      const expected = (ex.correct ?? "").toString();
      const expectPt = isPortugueseExpected(expected);
      // If expected is PT, instruct to type in Portuguese; else English
      hint = expectPt
        ? "Type your answer in Portuguese. Use accents (á ã ç) when needed."
        : "Type your answer in English.";
      // Ordinal tip
      if (expectPt && /[ºª]|primeiro|segundo|terceiro|quarto|quinto|sexto|sétimo|oitavo|nono|décimo/i.test(expected)) {
        hint += " Accepts forms like '1st/first' ↔ '1.º/primeiro'.";
      }
      break;
    }
    case "listening":
      hint = "Type exactly what you hear in European Portuguese. You can replay the audio.";
      break;
    case "matching":
      hint = "Match each left item with its correct pair on the right (translations or related words).";
      break;
    case "order": {
      const corr = (ex.correct ?? "").toString();
      const words = corr.split(" ");
      if (words.length > 1) {
        hint = `Arrange the Portuguese words into a natural sentence. Starts with: "${words[0]}"`;
      } else {
        hint = "Arrange the items into the correct order.";
      }
      break;
    }
    case "pronunciation":
      hint = "Listen and pick the option that matches what you heard.";
      break;
    case "spelling":
      hint = "Type the Portuguese word. Use accents when needed (á ã ç).";
      break;
    case "price":
      hint = "Write the price using the Portuguese format (e.g., 12,50 €).";
      break;
    case "conjugation":
      hint = "Type the correct verb form for the prompt.";
      break;
    case "conjugationGrid":
      hint = "Fill the six present forms: eu, tu, ele/ela, nós, vocês, eles/elas.";
      break;
    case "directions":
      hint = "Choose the correct contraction (ao/à/no/na) for the sentence.";
      break;
    case "form":
      hint = "Fill name, surname, email, and postal code (1234-567).";
      break;
    case "dirPath":
      hint = "Tap nodes to follow the path in order; only adjacent connections are valid.";
      break;
    default:
      hint = null;
  }
  if (!hint) return null;
  return <div className="text-xs text-white/60">Hint: {hint}</div>;
}

function Flashcard({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [show, setShow] = useState(false);
  return (
    <div className="card p-6 grid gap-4">
      <div className="text-3xl font-extrabold">{ex.term}</div>
      <div className="text-white/70">European Portuguese</div>
      <EnglishHint ex={ex} />
      {show && <div className="text-xl">{ex.translation}</div>}
      <div className="flex gap-2 mt-2">
        {!show && (
          <button className="btn btn-secondary" onClick={() => setShow(true)}>Show</button>
        )}
        {show && (
          <button className="btn btn-primary" onClick={() => onNext(true, elapsed())}>Continue</button>
        )}
      </div>
    </div>
  );
}

function MCQ({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [choice, setChoice] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const isCorrect = choice === ex.correct;
  
  // Reset state when exercise changes
  useEffect(() => {
    setShowAnswer(false);
    setChoice(null);
    setDone(false);
  }, [ex.id]);
  
  return (
    <div className="card p-6 grid gap-4">
      <div className="font-semibold">{ex.prompt}</div>
      <EnglishHint ex={ex} />
      <div className="grid gap-2">
        {ex.options?.map((opt) => (
          <button
            key={opt}
            className={`rounded-xl border px-4 py-2 text-left ${
              showAnswer && opt === ex.correct ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" :
              choice===opt ? (isCorrect?"border-emerald-400 bg-emerald-500/10 anim-pop":"border-rose-400 bg-rose-500/10 anim-shake") : 
              "border-white/15 bg-white/5"
            }`}
            onClick={() => { if (!done && !showAnswer) { setChoice(opt); setDone(true); } }}
          >
            {opt}
            {showAnswer && opt === ex.correct && <span className="ml-2 text-emerald-400">✓ Correct Answer</span>}
          </button>
        ))}
      </div>
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold">Answer: {ex.correct}</div>
          <div className="text-white/70 text-sm mt-1">Take your time to understand this answer before continuing.</div>
        </div>
      )}
      
      {done ? (
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => onNext(isCorrect, elapsed())}>Continue</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button 
            className="btn btn-secondary text-sm" 
            onClick={() => setShowAnswer(true)}
            disabled={showAnswer}
          >
            {showAnswer ? "Answer Shown" : "💡 Show Answer"}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        </div>
      )}
    </div>
  );
}

function Typing({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isCorrect: boolean;
    feedback: string;
    confidence: number;
  } | null>(null);

  // Reset state when exercise changes
  useEffect(() => {
    setShowAnswer(false);
    setValue("");
    setChecked(false);
    setValidationResult(null);
  }, [ex.id]);
  
  const handleCheck = async () => {
    setChecked(true);
    setValidating(true);
    
    try {
      const expectedAnswer = ex.correct?.toString() || "";
      const expectedIsPt = isPortugueseExpected(expectedAnswer);
      // If expected is PT, user types EN; else user types PT
      const inputLanguage: 'pt' | 'en' = expectedIsPt ? 'en' : 'pt';
      const direction = expectedIsPt ? 'Portuguese to English' : 'English to Portuguese';
      const context = `${ex.prompt} | Expected: "${expectedAnswer}" | Type: Translation from ${direction}`;
      const result = await validateAnswer(
        value,
        expectedAnswer,
        'typing',
        context,
        inputLanguage
      );
      setValidationResult({
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        confidence: result.confidence
      });
    } catch (error) {
      const correct = (ex.correct ?? "").toString();
      const userClean = value.trim().toLowerCase();
      const expectedClean = correct.trim().toLowerCase();
      let isCorrect = userClean === expectedClean;
      let feedback = isCorrect ? "Correct!" : `Expected: ${correct}`;
      if (!isCorrect) {
        // Ordinal tolerance: accept EN ↔ PT for common cases
        const normalize = (s:string)=> s.toLowerCase().replace(/\./g,'').replace(/º|ª/g,'').replace(/\s+/g,' ').trim();
        const u = normalize(userClean);
        const e = normalize(expectedClean);
        const ordMap: Record<string,string[]> = {
          'primeiro':[ '1o','1º','1st','first' ],
          'segundo':[ '2o','2º','2nd','second' ],
          'terceiro':[ '3o','3º','3rd','third' ],
          'quarto':[ '4o','4º','4th','fourth' ],
          'quinto':[ '5o','5º','5th','fifth' ],
        };
        for (const [pt, vars] of Object.entries(ordMap)) {
          if ((e.includes(pt) || vars.some(v=>e.includes(v))) && (u.includes(pt) || vars.some(v=>u.includes(v)))) {
            isCorrect = true; feedback = "Correct! Ordinal accepted."; break;
          }
        }
        // Special case: floor ↔ andar
        if (!isCorrect && ((e.includes('andar') && (u.includes('floor')||u.includes('storey'))) || (u.includes('andar') && (e.includes('floor')||e.includes('storey'))))) {
          isCorrect = true; feedback = "Correct!";
        }
      }
      setValidationResult({ isCorrect, feedback, confidence: isCorrect ? 0.8 : 0.0 });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="card p-6 grid gap-4">
      <div className="font-semibold">{ex.prompt}</div>
      <EnglishHint ex={ex} />
      <input 
        className="rounded-xl bg-white/5 border border-white/15 px-4 py-2" 
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
        placeholder="Type here"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !checked && value.trim() && !showAnswer) {
            handleCheck();
          }
        }}
        disabled={showAnswer}
      />
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold">Answer: {ex.correct}</div>
          <div className="text-white/70 text-sm mt-1">Take your time to understand this answer before continuing.</div>
        </div>
      )}
      
      {!checked && !showAnswer ? (
        <div className="flex gap-2">
          <button 
            className="btn btn-secondary" 
            onClick={handleCheck}
            disabled={!value.trim()}
          >
            Check
          </button>
          <button 
            className="btn btn-secondary text-sm" 
            onClick={() => setShowAnswer(true)}
          >
            💡 Show Answer
          </button>
        </div>
      ) : showAnswer ? (
        <button 
          className="btn btn-primary" 
          onClick={() => onNext(false, elapsed())}
        >
          Continue (Reviewed)
        </button>
      ) : validating ? (
        <div className="rounded-xl px-3 py-2 bg-blue-500/10 border border-blue-400">
          🤖 AI checking answer...
        </div>
      ) : validationResult ? (
        <div className="grid gap-3">
          <div className={`rounded-xl px-3 py-2 ${
            validationResult.isCorrect 
              ? "bg-emerald-500/10 border border-emerald-400 anim-pop" 
              : "bg-rose-500/10 border border-rose-400 anim-shake"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div>{validationResult.feedback}</div>
                {/* Show specific typo details if available */}
                {!validationResult.isCorrect && (validationResult.feedback.toLowerCase().includes('typo') || validationResult.feedback.toLowerCase().includes('accent')) && (
                  <div className="text-xs text-white/70 mt-1">
                    Your answer: "<span className="text-red-300">{value}</span>" → Expected: "<span className="text-green-300">{ex.correct}</span>"
                  </div>
                )}
                {/* Show encouraging message for partially correct answers */}
                {validationResult.isCorrect && validationResult.feedback.toLowerCase().includes('partially') && (
                  <div className="text-xs text-emerald-300 mt-1">
                    ✓ Good! Keep practicing with accents to perfect your Portuguese.
                  </div>
                )}
              </div>
              {validationResult.confidence < 1.0 && validationResult.isCorrect && (
                <span className="text-xs text-white/60">
                  🤖 {Math.round(validationResult.confidence * 100)}%
                </span>
              )}
            </div>
          </div>

          {!validationResult.isCorrect && showAnswer && (
            <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
              <div className="text-emerald-300 font-semibold">Answer: {ex.correct}</div>
              <div className="text-white/70 text-sm mt-1">Take your time to understand this answer before continuing.</div>
            </div>
          )}

          <div className="flex gap-2">
            {!showAnswer && (
              <button 
                className="btn btn-secondary text-sm" 
                onClick={() => setShowAnswer(true)}
              >
                💡 Show Answer
              </button>
            )}
            {validationResult.isCorrect ? (
              <button 
                className="btn btn-primary" 
                onClick={() => onNext(true, elapsed())}
              >
                Continue
              </button>
            ) : showAnswer ? (
              <button 
                className="btn btn-primary" 
                onClick={() => onNext(false, elapsed())}
              >
                Continue (Reviewed)
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={() => onNext(false, elapsed())}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Listening({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [value, setValue] = useState("");
  const [validating, setValidating] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isCorrect: boolean;
    feedback: string;
    confidence: number;
  } | null>(null);
  
  // Reset showAnswer when exercise changes
  useEffect(() => {
    setShowAnswer(false);
    setValue("");
    setValidationResult(null);
    setChecked(false);
  }, [ex.id]);
  
  const say = () => {
    if (!ex.audioTextPt) return;
    const utter = new SpeechSynthesisUtterance(ex.audioTextPt);
    const voice = window.speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith("pt-pt"))
      || window.speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith("pt"));
    if (voice) utter.voice = voice;
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };
  
  const [checked, setChecked] = useState(false);
  useEffect(()=>{ const id = setTimeout(()=>say(), 200); return ()=>clearTimeout(id); }, []);

  const handleCheck = async () => {
    setChecked(true);
    setValidating(true);
    
    try {
      const result = await validateAnswer(
        value,
        ex.correct?.toString() || "",
        'listening',
        `Listening exercise: "${ex.audioTextPt || ''}"`,
        'pt'
      );
      
      setValidationResult({
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        confidence: result.confidence
      });
    } catch (error) {
      // Fallback to basic validation
      const isCorrect = value.trim().toLowerCase() === (ex.correct ?? "").toString().toLowerCase();
      setValidationResult({
        isCorrect,
        feedback: isCorrect ? "Correct!" : `Expected: ${ex.correct}`,
        confidence: isCorrect ? 1.0 : 0.0
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="card p-6 grid gap-4">
      <div className="flex gap-2">
        <button className="btn btn-secondary" onClick={say}>🔊 Play</button>
      </div>
      <EnglishHint ex={ex} />
      <input 
        className="rounded-xl bg-white/5 border border-white/15 px-4 py-2" 
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
        placeholder="Type what you hear"
        disabled={showAnswer}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !checked && value.trim() && !showAnswer) {
            handleCheck();
          }
        }}
      />
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold">Answer: {ex.correct}</div>
          <div className="text-white/70 text-sm mt-1">Take your time to understand this answer before continuing.</div>
        </div>
      )}
      
      {!checked && !showAnswer ? (
        <div className="flex gap-2">
          <button 
            className="btn btn-secondary" 
            onClick={handleCheck}
            disabled={!value.trim()}
          >
            Check
          </button>
          <button 
            className="btn btn-secondary text-sm" 
            onClick={() => setShowAnswer(true)}
          >
            💡 Show Answer
          </button>
        </div>
      ) : showAnswer ? (
        <button 
          className="btn btn-primary" 
          onClick={() => onNext(false, elapsed())}
        >
          Continue (Reviewed)
        </button>
      ) : validating ? (
        <div className="rounded-xl px-3 py-2 bg-blue-500/10 border border-blue-400">
          🤖 AI checking answer...
        </div>
      ) : validationResult ? (
        <div className="grid gap-3">
          <div className={`rounded-xl px-3 py-2 ${
            validationResult.isCorrect 
              ? "bg-emerald-500/10 border border-emerald-400 anim-pop" 
              : "bg-rose-500/10 border border-rose-400 anim-shake"
          }`}>
            <div className="flex items-center justify-between">
              <span>{validationResult.feedback}</span>
              {validationResult.confidence < 1.0 && validationResult.isCorrect && (
                <span className="text-xs text-white/60">
                  🤖 {Math.round(validationResult.confidence * 100)}%
                </span>
              )}
            </div>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Matching({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  
  // Debug logging
  console.log('Matching component received ex:', ex);
  console.log('ex.pairs:', ex.pairs);
  console.log('typeof ex.pairs:', typeof ex.pairs);
  
  // Add safety check for pairs
  const rawPairs = ex.pairs || [];
  if (!Array.isArray(rawPairs) || rawPairs.length === 0) {
    console.error('Matching exercise missing or invalid pairs:', {
      ex,
      pairs: ex.pairs,
      isArray: Array.isArray(ex.pairs),
      length: ex.pairs?.length
    });
    return (
      <div className="card p-4 bg-red-500/10 border border-red-400/30">
        <p className="text-red-300">Error: This matching exercise has no pairs defined.</p>
        <p className="text-white/70 text-sm mt-2">Exercise ID: {ex.id}</p>
        <button className="btn btn-primary mt-3" onClick={() => onNext(false, 0)}>
          Skip
        </button>
      </div>
    );
  }
  
  // Safer mapping with additional checks
  const pairs = rawPairs.map((p: any, idx: number) => {
    if (!p || typeof p !== 'object') {
      console.error('Invalid pair at index', idx, ':', p);
      return { a: '', b: '', id: idx };
    }
    return { 
      a: p.a || '', 
      b: p.b || '', 
      id: idx 
    };
  });
  
  const left = pairs.map(p => p.a || '');
  
  // Fix: Use useState to shuffle only once on initialization
  const [right] = useState(() => {
    try {
      return [...pairs.map(p => p.b || '')].sort(() => Math.random() - 0.5);
    } catch (e) {
      console.error('Error shuffling pairs:', e);
      return [];
    }
  });
  
  const [selA, setSelA] = useState<string | null>(null);
  const [ok, setOk] = useState<Record<string, boolean>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Reset state when exercise changes
  useEffect(() => {
    setShowAnswer(false);
    setSelA(null);
    setOk({});
  }, [ex.id]);
  
  useEffect(()=>{ 
    if (Object.keys(ok).length === pairs.length && !showAnswer) onNext(true, elapsed()); 
  }, [ok]);
  
  return (
    <div className="grid gap-4">
      {showAnswer && (
        <div className="card p-4 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold mb-3">Correct Pairs:</div>
          <div className="grid gap-2">
            {pairs && Array.isArray(pairs) && pairs.length > 0 ? pairs.map((pair, idx) => (
              <div key={`answer-${idx}`} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span className="text-emerald-300">{pair.a || ''}</span>
                <span className="text-white/70">→</span>
                <span className="text-emerald-300">{pair.b || ''}</span>
              </div>
            )) : <div className="text-white/50">No pairs available</div>}
          </div>
          <button 
            className="btn btn-primary mt-3" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        </div>
      )}
      
      {!showAnswer && (
        <>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="card p-4 grid gap-2">
              <div className="text-sm text-white/70">Column A</div>
              <EnglishHint ex={ex} />
              {left && Array.isArray(left) && left.length > 0 ? left.map((t, idx) => (
                <button key={`left-${idx}-${t}`} className={`rounded-xl border px-3 py-2 text-left ${
                  ok[t] ? "border-emerald-400 bg-emerald-500/10 text-emerald-300" :
                  selA===t ? "border-[var(--brand)]" : "border-white/15"
                }`} onClick={()=>setSelA(t)} disabled={!!ok[t]}>
                  {t} {ok[t] && "✓"}
                </button>
              )) : <div className="text-white/50">No items to match</div>}
            </div>
            <div className="card p-4 grid gap-2">
              <div className="text-sm text-white/70">Column B</div>
              {right && Array.isArray(right) && right.length > 0 ? right.map((t, idx) => {
                const isMatched = Object.values(pairs).some(p => 
                  (p.b === t && ok[p.a]) || (p.a === t && ok[p.b])
                );
                return (
                  <button key={`right-${idx}-${t}`} className={`rounded-xl border px-3 py-2 text-left ${
                    isMatched ? "border-emerald-400 bg-emerald-500/10 text-emerald-300" : "border-white/15"
                  }`} onClick={() => {
                    if (!selA || isMatched) return;
                    const match = pairs.find(p => (p.a===selA && p.b===t) || (p.a===t && p.b===selA));
                    if (match) setOk(prev => ({ ...prev, [selA]: true }));
                    setSelA(null);
                  }} disabled={isMatched}>
                    {t} {isMatched && "✓"}
                  </button>
                );
              }) : <div className="text-white/50">No items to match</div>}
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              className="btn btn-secondary text-sm" 
              onClick={() => setShowAnswer(true)}
            >
              💡 Show Answer
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Order({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [list, setList] = useState<string[]>(() => [...(ex.items ?? [])].sort(() => Math.random() - 0.5));
  const [showAnswer, setShowAnswer] = useState(false);
  const correctOrder = JSON.stringify(list) === JSON.stringify(ex.items ?? []);
  
  // Reset state when exercise changes
  useEffect(() => {
    setShowAnswer(false);
    setList([...(ex.items ?? [])].sort(() => Math.random() - 0.5));
  }, [ex.id]);
  
  return (
    <div className="card p-6 grid gap-4">
      <EnglishHint ex={ex} />
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold mb-2">Correct Order:</div>
          <div className="text-white/90">{(ex.items ?? []).join(" ")}</div>
          <div className="text-white/70 text-sm mt-1">Take your time to understand this order before continuing.</div>
        </div>
      )}
      
      {list.map((t, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2">{t}</div>
          <button 
            className="btn btn-secondary" 
            onClick={()=>{ if(i<=0) return; const a=[...list]; [a[i-1],a[i]]=[a[i],a[i-1]]; setList(a); }}
            disabled={showAnswer}
          >
            ↑
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={()=>{ if(i>=list.length-1) return; const a=[...list]; [a[i+1],a[i]]=[a[i],a[i+1]]; setList(a); }}
            disabled={showAnswer}
          >
            ↓
          </button>
        </div>
      ))}
      <div className="flex gap-2 justify-end">
        {!showAnswer ? (
          <>
            <button 
              className="btn btn-secondary text-sm" 
              onClick={() => setShowAnswer(true)}
            >
              💡 Show Answer
            </button>
            <button className="btn btn-primary" onClick={()=>onNext(correctOrder, elapsed())}>Check</button>
          </>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        )}
      </div>
    </div>
  );
}

function Dialogue({ ex, onNext }: { ex: Exercise; onNext: () => void }) {
  const script = (ex as any).dialogue as { pt?: string; choice?: { text: string; good: boolean }[] }[] | undefined;
  const [idx, setIdx] = useState(0);
  const step = script?.[idx];
  useEffect(()=>{
    if (!step || step.choice) return;
    if (step?.pt) {
      const u = new SpeechSynthesisUtterance(step.pt);
      const v = window.speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith("pt-pt")) || window.speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith("pt"));
      if (v) u.voice = v; u.rate=0.95; window.speechSynthesis.speak(u);
      const id = setTimeout(()=> setIdx(i=>i+1), 600);
      return ()=> clearTimeout(id);
    }
  }, [idx]);
  if (!script) return null;
  if (idx >= script.length) return (
    <div className="grid gap-3">
      <div className="card p-4">Dialogue finished!</div>
      <div className="flex justify-end"><button className="btn btn-primary" onClick={onNext}>Continue</button></div>
    </div>
  );
  if (step?.choice) {
    return (
      <div className="card p-4 grid gap-3">
        <div className="text-sm text-white/70">Choose the most natural reply</div>
        <div className="flex flex-wrap gap-2">
          {step.choice.map((c, i) => (
            <button key={i} className={`btn ${c.good?"btn-primary":"btn-secondary"}`} onClick={()=> setIdx(idx+1)}>{c.text}</button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="card p-4">
      <div>{step?.pt}</div>
    </div>
  );
}

function Pronunciation({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [showAnswer, setShowAnswer] = useState(false);
  const say = () => {
    const utter = new SpeechSynthesisUtterance(ex.audioTextPt || "");
    const voice = window.speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith("pt-pt")) || window.speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith("pt"));
    if (voice) utter.voice = voice; utter.rate = 0.95; window.speechSynthesis.speak(utter);
  };
  return (
    <div className="card p-6 grid gap-3">
      <div className="flex gap-2"><button className="btn btn-secondary" onClick={say}>🔊 Ouvir</button></div>
      <EnglishHint ex={ex} />
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold">Answer: {ex.correct}</div>
          <div className="text-white/70 text-sm mt-1">Take your time to understand this answer before continuing.</div>
        </div>
      )}
      
      <div className="grid gap-2">
        {ex.options?.map((o)=> (
          <button 
            key={o} 
            className={`rounded-xl border px-4 py-2 text-left ${
              showAnswer && o === ex.correct ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : "border-white/15 bg-white/5"
            }`}
            onClick={()=> {
              if (showAnswer) return;
              onNext(o===ex.correct, elapsed());
            }}
            disabled={showAnswer}
          >
            {o}
            {showAnswer && o === ex.correct && <span className="ml-2 text-emerald-400">✓ Correct Answer</span>}
          </button>
        ))}
      </div>
      
      {!showAnswer ? (
        <div className="flex justify-center">
          <button 
            className="btn btn-secondary text-sm" 
            onClick={() => setShowAnswer(true)}
          >
            💡 Show Answer
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <button 
            className="btn btn-primary" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        </div>
      )}
    </div>
  );
}

function Spelling({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [value, setValue] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="card p-6 grid gap-3">
      <div className="font-semibold">{ex.prompt}</div>
      <EnglishHint ex={ex} />
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold">Answer: {ex.correct}</div>
          <div className="text-white/70 text-sm mt-1">Take your time to understand this answer before continuing.</div>
        </div>
      )}
      
      <input 
        className="rounded-xl bg-white/5 border border-white/15 px-4 py-2" 
        value={value} 
        onChange={(e)=>setValue(e.target.value)} 
        placeholder="Escreve aqui"
        disabled={showAnswer}
      />
      <div className="flex gap-2 justify-end">
        {!showAnswer ? (
          <>
            <button 
              className="btn btn-secondary text-sm" 
              onClick={() => setShowAnswer(true)}
            >
              💡 Show Answer
            </button>
            <button className="btn btn-primary" onClick={()=> onNext(value.trim().toLowerCase() === (ex.correct as string).toLowerCase(), elapsed())}>Confirmar</button>
          </>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        )}
      </div>
    </div>
  );
}

function Price({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [value, setValue] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const say = () => {
    const utter = new SpeechSynthesisUtterance(ex.audioTextPt || "");
    const voice = window.speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith("pt-pt")) || window.speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith("pt"));
    if (voice) utter.voice = voice; utter.rate = 0.95; window.speechSynthesis.speak(utter);
  };
  return (
    <div className="card p-6 grid gap-3">
      <div className="flex gap-2"><button className="btn btn-secondary" onClick={say}>🔊 Ouvir</button></div>
      <EnglishHint ex={ex} />
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold">Answer: {ex.correct}</div>
          <div className="text-white/70 text-sm mt-1">Take your time to understand this answer before continuing.</div>
        </div>
      )}
      
      <input 
        className="rounded-xl bg-white/5 border border-white/15 px-4 py-2" 
        value={value} 
        onChange={(e)=>setValue(e.target.value)} 
        placeholder="Ex.: 12,50 €"
        disabled={showAnswer}
      />
      <div className="flex gap-2 justify-end">
        {!showAnswer ? (
          <>
            <button 
              className="btn btn-secondary text-sm" 
              onClick={() => setShowAnswer(true)}
            >
              💡 Show Answer
            </button>
            <button className="btn btn-primary" onClick={()=> onNext(value.trim() === (ex.correct as string), elapsed())}>Confirmar</button>
          </>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        )}
      </div>
    </div>
  );
}

function Conjugation({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [value, setValue] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="card p-6 grid gap-3">
      <div className="font-semibold">{ex.prompt}</div>
      <EnglishHint ex={ex} />
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold">Answer: {ex.correct}</div>
          <div className="text-white/70 text-sm mt-1">Take your time to understand this answer before continuing.</div>
        </div>
      )}
      
      <input 
        className="rounded-xl bg-white/5 border border-white/15 px-4 py-2" 
        value={value} 
        onChange={(e)=>setValue(e.target.value)} 
        placeholder="Resposta"
        disabled={showAnswer}
      />
      <div className="flex gap-2 justify-end">
        {!showAnswer ? (
          <>
            <button 
              className="btn btn-secondary text-sm" 
              onClick={() => setShowAnswer(true)}
            >
              💡 Show Answer
            </button>
            <button className="btn btn-primary" onClick={()=> onNext(value.trim().toLowerCase() === (ex.correct as string).toLowerCase(), elapsed())}>Confirmar</button>
          </>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        )}
      </div>
    </div>
  );
}

function DirectionContractions({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [showAnswer, setShowAnswer] = useState(false);
  // options are contractions; correct holds string or array
  return (
    <div className="card p-6 grid gap-3">
      <div className="font-semibold">Escolhe a contração correta</div>
      <div className="text-white/70">{ex.prompt || "Ex.: __ lado da farmácia"}</div>
      <EnglishHint ex={ex} />
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold">Answer: {Array.isArray(ex.correct) ? (ex.correct as string[]).join(' or ') : ex.correct}</div>
          <div className="text-white/70 text-sm mt-1">Take your time to understand this contraction before continuing.</div>
        </div>
      )}
      
      <div className="grid gap-2">
        {ex.options?.map((opt)=> (
          <button 
            key={opt} 
            className={`rounded-xl border px-4 py-2 text-left ${
              showAnswer && (Array.isArray(ex.correct) ? (ex.correct as string[]).includes(opt) : opt === ex.correct) 
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" 
                : "border-white/15 bg-white/5"
            }`}
            onClick={()=> {
              if (showAnswer) return;
              onNext(Array.isArray(ex.correct)? (ex.correct as string[]).includes(opt): opt===ex.correct, elapsed());
            }}
            disabled={showAnswer}
          >
            {opt}
            {showAnswer && (Array.isArray(ex.correct) ? (ex.correct as string[]).includes(opt) : opt === ex.correct) && 
              <span className="ml-2 text-emerald-400">✓ Correct Answer</span>
            }
          </button>
        ))}
      </div>
      
      {!showAnswer ? (
        <div className="flex justify-center">
          <button 
            className="btn btn-secondary text-sm" 
            onClick={() => setShowAnswer(true)}
          >
            💡 Show Answer
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <button 
            className="btn btn-primary" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        </div>
      )}
    </div>
  );
}

function FormFill({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [cp, setCp] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  function validate() {
    const okNome = nome.length >= 2;
    const okAp = apelido.length >= 2;
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const okCp = /^\d{4}-?\d{3}$/.test(cp);
    return okNome && okAp && okEmail && okCp;
  }
  return (
    <div className="card p-6 grid gap-3">
      <div className="font-semibold">Preenche o formulário</div>
      <EnglishHint ex={ex} />
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold mb-2">Sample Valid Form:</div>
          <div className="grid gap-1 text-sm">
            <div><span className="text-white/70">Nome:</span> <span className="text-white/90">João</span></div>
            <div><span className="text-white/70">Apelido:</span> <span className="text-white/90">Silva</span></div>
            <div><span className="text-white/70">Email:</span> <span className="text-white/90">joao@exemplo.pt</span></div>
            <div><span className="text-white/70">Código Postal:</span> <span className="text-white/90">1234-567</span></div>
          </div>
          <div className="text-white/70 text-sm mt-2">Use this format as a guide.</div>
        </div>
      )}
      
      <div className="grid gap-2 md:grid-cols-2">
        <input 
          className="rounded-xl bg-white/5 border border-white/15 px-3 py-2" 
          placeholder="Nome" 
          value={nome} 
          onChange={e=>setNome(e.target.value)}
          disabled={showAnswer}
        />
        <input 
          className="rounded-xl bg-white/5 border border-white/15 px-3 py-2" 
          placeholder="Apelido" 
          value={apelido} 
          onChange={e=>setApelido(e.target.value)}
          disabled={showAnswer}
        />
        <input 
          className="rounded-xl bg-white/5 border border-white/15 px-3 py-2" 
          placeholder="Email" 
          value={email} 
          onChange={e=>setEmail(e.target.value)}
          disabled={showAnswer}
        />
        <input 
          className="rounded-xl bg-white/5 border border-white/15 px-3 py-2" 
          placeholder="Código Postal (1234-567)" 
          value={cp} 
          onChange={e=>setCp(e.target.value)}
          disabled={showAnswer}
        />
      </div>
      <div className="text-xs text-white/60">Dica: CP tem 4 dígitos, hífen, 3 dígitos.</div>
      <div className="flex gap-2 justify-end">
        {!showAnswer ? (
          <>
            <button 
              className="btn btn-secondary text-sm" 
              onClick={() => setShowAnswer(true)}
            >
              💡 Show Answer
            </button>
            <button className="btn btn-primary" onClick={()=> onNext(validate(), elapsed())}>Submeter</button>
          </>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        )}
      </div>
    </div>
  );
}

function ConjugationGrid({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const persons = ["eu","tu","ele/ela","nós","vocês","eles/elas"];
  const [answers, setAnswers] = useState<string[]>(Array(6).fill(""));
  const [showAnswer, setShowAnswer] = useState(false);
  function setValue(i:number, v:string){ const a=[...answers]; a[i]=v; setAnswers(a); }
  function check(){
    const corr = Array.isArray(ex.correct) ? (ex.correct as string[]) : [];
    const ok = corr.length === answers.length && corr.every((c,i)=> (answers[i]||"").trim().toLowerCase()===c.toLowerCase());
    onNext(ok, elapsed());
  }
  return (
    <div className="card p-6 grid gap-3">
      <div className="font-semibold">{ex.prompt || "Completa a tabela"}</div>
      <EnglishHint ex={ex} />
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold mb-2">Correct Answers:</div>
          {Array.isArray(ex.correct) && (ex.correct as string[]).map((answer, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="text-white/70 w-20">{persons[idx]}:</span>
              <span className="text-white/90">{answer}</span>
            </div>
          ))}
          <div className="text-white/70 text-sm mt-2">Take your time to understand these forms before continuing.</div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        {persons.map((p,i)=> (
          <div key={p} className="grid grid-cols-[80px_1fr] items-center gap-2">
            <div className="text-sm text-white/70">{p}</div>
            <input 
              className="rounded-xl bg-white/5 border border-white/15 px-3 py-2" 
              value={answers[i]} 
              onChange={e=>setValue(i, e.target.value)}
              disabled={showAnswer}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        {!showAnswer ? (
          <>
            <button 
              className="btn btn-secondary text-sm" 
              onClick={() => setShowAnswer(true)}
            >
              💡 Show Answer
            </button>
            <button className="btn btn-primary" onClick={check}>Verificar</button>
          </>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        )}
      </div>
    </div>
  );
}

function DirPath({ ex, onNext }: { ex: Exercise; onNext: (ok: boolean, ms?: number) => void }) {
  const { elapsed } = useStopwatch();
  const [path, setPath] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const nodes = ex.pathNodes || [];
  const edges = ex.pathEdges || [];
  function addNode(id: number){ setPath((p)=> (p.length===0 || edges.some(e=> e.from===p[p.length-1] && e.to===id)) ? [...p, id] : p); }
  function reset(){ setPath([]); }
  function check(){
    const corr = ex.correctPath || [];
    const ok = corr.length === path.length && corr.every((v,i)=> v===path[i]);
    onNext(ok, elapsed());
  }
  return (
    <div className="card p-6 grid gap-3">
      <div className="font-semibold">{ex.prompt || "Toca nos nós para seguir o caminho"}</div>
      <EnglishHint ex={ex} />
      
      {showAnswer && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30">
          <div className="text-emerald-300 font-semibold mb-2">Correct Path:</div>
          <div className="text-white/90">{(ex.correctPath || []).join(" → ")}</div>
          <div className="text-white/70 text-sm mt-1">Take your time to understand this path before continuing.</div>
        </div>
      )}
      
      <div className="relative h-56 w-full rounded-xl border border-white/15 bg-white/5">
        {edges.map((e,i)=>{
          const a = nodes.find(n=>n.id===e.from)!; const b = nodes.find(n=>n.id===e.to)!;
          const x1 = 20 + a.x*60, y1 = 20 + a.y*60, x2 = 20 + b.x*60, y2 = 20 + b.y*60;
          const style = { left: Math.min(x1,x2), top: Math.min(y1,y2), width: Math.abs(x2-x1), height: 2 } as any;
          return <div key={i} className="absolute bg-white/20" style={style} />;
        })}
        {nodes.map((n)=> (
          <button 
            key={n.id} 
            className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 text-[10px]" 
            style={{ left: 20 + n.x*60, top: 20 + n.y*60 }} 
            onClick={()=>addNode(n.id)}
            disabled={showAnswer}
          >
            {n.label||n.id}
          </button>
        ))}
      </div>
      <div className="text-xs text-white/60">Caminho: {path.join(" → ")}</div>
      <div className="flex gap-2">
        {!showAnswer ? (
          <>
            <button className="btn btn-secondary" onClick={reset}>Repor</button>
            <button 
              className="btn btn-secondary text-sm" 
              onClick={() => setShowAnswer(true)}
            >
              💡 Show Answer
            </button>
            <button className="btn btn-primary" onClick={check}>Verificar</button>
          </>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={() => onNext(false, elapsed())}
          >
            Continue (Reviewed)
          </button>
        )}
      </div>
    </div>
  );
}

function LessonContentPresentation({ content, onStartPractice }: { content: LessonContent; onStartPractice: () => void }) {
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])); // First section expanded by default
  const [userNotes, setUserNotes] = useState<string>("");
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<number>(0);

  // Adaptive pacing controls
  const [readingSpeed, setReadingSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);
  const [showPacingControls, setShowPacingControls] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
  const [sectionStartTime, setSectionStartTime] = useState<number>(Date.now());
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);

  const totalSections = content.sections.length;
  const completionPercentage = Math.round((completedSections.size / totalSections) * 100);

  // Reading time estimates based on content length and speed
  const getEstimatedReadingTime = (section: any) => {
    const examplesArr = Array.isArray(section.examples) ? section.examples : [];
    const expl = (section.explanation || (section as any).content || '');
    const wordCount = (expl + examplesArr.map((ex: any) => `${ex.en || (ex as any).english || ''} ${ex.pt || (ex as any).portuguese || ''}`).join(' ')).split(/\s+/).filter(Boolean).length;
    const baseWPM = readingSpeed === 'slow' ? 150 : readingSpeed === 'normal' ? 200 : 250;
    return Math.ceil(wordCount / baseWPM * 60); // seconds
  };

  const getAutoAdvanceDelay = (section: any) => {
    const estimatedTime = getEstimatedReadingTime(section);
    const speedMultiplier = readingSpeed === 'slow' ? 1.5 : readingSpeed === 'normal' ? 1.0 : 0.7;
    return estimatedTime * 1000 * speedMultiplier; // Convert to milliseconds
  };

  const toggleSection = (index: number) => {
    // Clear any existing timer
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }

    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        setCurrentSection(index);
        setSectionStartTime(Date.now());
        
        // Set up auto-advance if enabled
        if (autoAdvance && !isPaused) {
          const delay = getAutoAdvanceDelay(content.sections[index]);
          const timer = setTimeout(() => {
            markSectionComplete(index);
          }, delay);
          setAutoAdvanceTimer(timer);
        }
      }
      return newSet;
    });
  };

  const markSectionComplete = (index: number) => {
    // Track study time
    const studyTime = Date.now() - sectionStartTime;
    setTotalStudyTime(prev => prev + studyTime);

    setCompletedSections(prev => new Set([...prev, index]));
    
    // Auto-expand next section
    if (index + 1 < totalSections) {
      setExpandedSections(prev => new Set([...prev, index + 1]));
      setCurrentSection(index + 1);
      setSectionStartTime(Date.now());
      
      // Set up auto-advance for next section if enabled
      if (autoAdvance && !isPaused) {
        const delay = getAutoAdvanceDelay(content.sections[index + 1]);
        const timer = setTimeout(() => {
          markSectionComplete(index + 1);
        }, delay);
        setAutoAdvanceTimer(timer);
      }
    } else {
      // All sections completed
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        setAutoAdvanceTimer(null);
      }
    }
  };

  const toggleAutoAdvance = () => {
    setAutoAdvance(!autoAdvance);
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused && autoAdvanceTimer) {
      // Pausing - clear timer
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    } else if (isPaused && autoAdvance && expandedSections.size > 0) {
      // Resuming - restart timer for current section
      const currentSectionData = content.sections[currentSection];
      if (currentSectionData && !completedSections.has(currentSection)) {
        const delay = getAutoAdvanceDelay(currentSectionData);
        const timer = setTimeout(() => {
          markSectionComplete(currentSection);
        }, delay);
        setAutoAdvanceTimer(timer);
      }
    }
  };

  const allSectionsCompleted = completedSections.size === totalSections;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer]);

  return (
    <div className="grid gap-6">
      {/* Header with Progress */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">{content.title}</h2>
        <div className="text-white/70 text-sm mb-4">📚 Study the material below, then start practicing!</div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/60">Progress</span>
            <span className="text-xs text-emerald-400 font-semibold">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-blue-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-white/50 mt-1">
            {completedSections.size} of {totalSections} sections complete
            {totalStudyTime > 0 && ` • ${Math.round(totalStudyTime / 1000 / 60)}m studied`}
          </div>
        </div>
      </div>

      {/* Adaptive Pacing Controls */}
      <div className="card p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-purple-400">⚙️ Learning Preferences</h3>
          <button
            onClick={() => setShowPacingControls(!showPacingControls)}
            className="btn btn-secondary text-xs"
          >
            {showPacingControls ? 'Hide' : 'Customize'}
          </button>
        </div>
        
        {showPacingControls && (
          <div className="grid gap-4 anim-slide-in">
            {/* Reading Speed */}
            <div>
              <label className="text-xs font-semibold text-white/90 block mb-2">📖 Reading Speed</label>
              <div className="flex gap-2">
                {['slow', 'normal', 'fast'].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setReadingSpeed(speed as any)}
                    className={`btn text-xs ${
                      readingSpeed === speed ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {speed === 'slow' ? '🐌 Slow' : speed === 'normal' ? '👤 Normal' : '⚡ Fast'}
                  </button>
                ))}
              </div>
              <div className="text-xs text-white/60 mt-1">
                Adjusts estimated reading times and auto-advance pace
              </div>
            </div>

            {/* Auto-advance Controls */}
            <div>
              <label className="text-xs font-semibold text-white/90 block mb-2">🤖 Auto-advance</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAutoAdvance}
                  className={`btn text-xs ${autoAdvance ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {autoAdvance ? 'ON' : 'OFF'}
                </button>
                
                {autoAdvance && (
                  <button
                    onClick={togglePause}
                    className={`btn text-xs ${isPaused ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                  </button>
                )}
              </div>
              <div className="text-xs text-white/60 mt-1">
                Automatically moves to next section after estimated reading time
              </div>
            </div>

            {/* Current Section Info */}
            {expandedSections.size > 0 && !completedSections.has(currentSection) && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs font-semibold text-blue-300 mb-1">📊 Current Section</div>
                <div className="text-xs text-white/70">
                  Estimated reading time: {getEstimatedReadingTime(content.sections[currentSection])}s
                  {autoAdvance && !isPaused && (
                    <span className="text-yellow-400"> • Auto-advancing...</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Section Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {content.sections.map((section, index) => {
          const estimatedTime = getEstimatedReadingTime(section);
          return (
            <div key={index} className="relative group">
              <button
                onClick={() => toggleSection(index)}
                className={`w-8 h-8 rounded-full text-xs font-semibold transition-all duration-200 ${
                  completedSections.has(index)
                    ? 'bg-emerald-500 text-white'
                    : expandedSections.has(index)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {completedSections.has(index) ? '✓' : index + 1}
              </button>
              
              {/* Tooltip with reading time */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {section.title} • {estimatedTime}s read
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Sections */}
      {content.sections.map((section, sIdx) => {
        const isExpanded = expandedSections.has(sIdx);
        const isCompleted = completedSections.has(sIdx);
        const isCurrent = currentSection === sIdx;
        const estimatedTime = getEstimatedReadingTime(section);
        
        return (
          <div key={sIdx} className={`card transition-all duration-300 ${
            isCurrent ? 'ring-2 ring-blue-400/50 bg-gradient-to-br from-white/10 to-white/5' : 'bg-white/5'
          } ${isCompleted ? 'border-emerald-400/50' : 'border-white/10'}`}>
            {/* Section Header - Always Visible */}
            <div 
              className="p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg"
              onClick={() => toggleSection(sIdx)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {isCompleted ? '✓' : sIdx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-emerald-400">{section.title}</h3>
                  <div className="text-xs text-white/50">({estimatedTime}s read)</div>
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted && <span className="text-xs text-emerald-400">Complete</span>}
                  {isCurrent && autoAdvance && !isPaused && !isCompleted && (
                    <span className="text-xs text-yellow-400 animate-pulse">Auto-advancing...</span>
                  )}
                  <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    ⌄
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Content */}
            {isExpanded && (
              <div className="px-4 pb-4 anim-slide-in">
                <div className="text-white/80 text-sm leading-relaxed mb-4">
                  {section.explanation || (section as any).content}
                </div>

                {/* Rule Boxes */}
                {(section as any).ruleBoxes && (section as any).ruleBoxes.map((rule: any, rIdx: number) => (
                  <div key={rIdx} className={`mb-4 p-4 rounded-lg border ${
                    rule.type === 'grammar' ? 'bg-blue-500/10 border-blue-400/30' :
                    rule.type === 'pronunciation' ? 'bg-purple-500/10 border-purple-400/30' :
                    rule.type === 'culture' ? 'bg-orange-500/10 border-orange-400/30' :
                    'bg-red-500/10 border-red-400/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {rule.type === 'grammar' ? '📚' : rule.type === 'pronunciation' ? '🗣️' : rule.type === 'culture' ? '🇵🇹' : '⚠️'}
                      </span>
                      <h4 className="font-semibold text-sm">{rule.title}</h4>
                    </div>
                    <p className="text-white/80 text-sm mb-2">{rule.content}</p>
                    {rule.pattern && (
                      <div className="font-mono text-xs bg-white/5 p-2 rounded border border-white/10">
                        {rule.pattern}
                      </div>
                    )}
                  </div>
                ))}

                {/* Contrast Pairs */}
                {(section as any).contrastPairs && (
                  <div className="mb-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
                    <h4 className="font-semibold text-sm mb-3 text-yellow-300">⚖️ Contrast & Compare</h4>
                    <div className="grid gap-2">
                      {(section as any).contrastPairs.map((pair: any, pIdx: number) => (
                        <div key={pIdx} className="p-2 rounded bg-white/5">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-green-300 font-semibold">{pair.portuguese || pair.pt}</span>
                            <span className="text-white/80">({pair.english || pair.en})</span>
                            <span className="text-white/70">vs</span>
                            <span className="text-red-300 font-semibold">{pair.versus}</span>
                            <span className="text-white/80">({pair.versusEnglish})</span>
                          </div>
                          {pair.tip && (
                            <div className="text-white/60 text-xs italic ml-2">
                              💡 {pair.tip}
                            </div>
                          )}
                          {pair.wrong && (
                            <div className="text-red-300 text-xs ml-2">
                              ❌ NOT: {pair.wrong}
                            </div>
                          )}
                          {pair.note && (
                            <div className="text-white/60 text-xs italic ml-2">
                              {pair.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pitfalls */}
                {(section as any).pitfalls && (section as any).pitfalls.map((pitfall: any, pIdx: number) => (
                  <div key={pIdx} className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-400/30">
                    <h4 className="font-semibold text-sm mb-2 text-red-300">🚫 Common Mistake</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">❌</span>
                        <span className="text-red-300">{pitfall.mistake ?? pitfall.issue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✅</span>
                        <span className="text-green-300">{pitfall.correction ?? pitfall.correct}</span>
                      </div>
                      <p className="text-white/70 text-xs mt-2">{pitfall.explanation}</p>
                    </div>
                  </div>
                ))}

                {/* Cultural Notes */}
                {(section as any).culturalNotes && (section as any).culturalNotes.map((note: any, nIdx: number) => (
                  <div key={nIdx} className="mb-4 p-4 rounded-lg bg-orange-500/10 border border-orange-400/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{note.icon || '🇵🇹'}</span>
                      <h4 className="font-semibold text-sm text-orange-300">{note.title}</h4>
                    </div>
                    <p className="text-white/80 text-sm">{note.content}</p>
                  </div>
                ))}

                {/* Pronunciation Guide */}
                {(section as any).pronunciationGuide && (
                  <div className="mb-4 p-4 rounded-lg bg-purple-500/10 border border-purple-400/30">
                    <h4 className="font-semibold text-sm mb-3 text-purple-300">🗣️ Pronunciation Guide</h4>
                    <div className="grid gap-2">
                      {Array.isArray((section as any).pronunciationGuide?.sounds) && (section as any).pronunciationGuide.sounds.map((sound: any, sIdx: number) => (
                        <div key={sIdx} className="flex items-center justify-between p-2 rounded bg-white/5">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-purple-300">[{sound.symbol}]</span>
                            <span className="text-white/80">{sound.example}</span>
                          </div>
                          <span className="text-white/60 text-xs">{sound.tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(section.examples) && section.examples.length > 0 && (
                  <div className="grid gap-3 mb-4">
                    <div className="text-sm font-semibold text-white/90">💡 Examples:</div>
                    <div className="grid gap-2">
                      {section.examples.map((ex, eIdx) => (
                        <div 
                          key={eIdx} 
                          className="group flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-400/30 transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            // Interactive click to hear pronunciation
                            const text = ex.pt || (ex as any).portuguese;
                            if (text) {
                              const utterance = new SpeechSynthesisUtterance(text);
                              const voice = window.speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith("pt-pt")) || 
                                           window.speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith("pt"));
                              if (voice) utterance.voice = voice;
                              utterance.rate = readingSpeed === 'slow' ? 0.7 : readingSpeed === 'normal' ? 0.9 : 1.1;
                              window.speechSynthesis.speak(utterance);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="font-semibold text-emerald-300 group-hover:text-emerald-200 transition-colors">
                              {ex.pt || (ex as any).portuguese}
                            </div>
                            <div className="text-white/70">→</div>
                            <div className="text-white/80">{ex.en || (ex as any).english}</div>
                            {(ex.note || (ex as any).context) && <div className="text-xs text-white/60 italic">({ex.note || (ex as any).context})</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                              Click to hear
                            </div>
                            <AudioButton text={ex.pt || (ex as any).portuguese} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mini Checks */}
                {(section as any).miniChecks && (section as any).miniChecks.map((check: any, cIdx: number) => (
                  <div key={cIdx} className="mb-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-400/30">
                    <h4 className="font-semibold text-sm mb-3 text-emerald-300">🎯 Quick Check</h4>
                    <p className="text-white/80 text-sm mb-3">{check.question}</p>
                    {/* If this mini check has options (multiple choice) */}
                    {Array.isArray(check.options) && (
                      <div className="grid gap-2 mb-3">
                        {check.options.map((option: string, oIdx: number) => (
                          <button 
                            key={oIdx}
                            className="text-left p-2 rounded bg-white/5 hover:bg-emerald-500/20 transition-colors text-sm"
                            onClick={() => {
                              const isCorrect = option === (check.correct || check.answer);
                              // Simple feedback without state management
                              const btn = document.activeElement as HTMLButtonElement;
                              if (isCorrect) {
                                btn.className = btn.className.replace('hover:bg-emerald-500/20', '') + ' bg-emerald-500/30 text-emerald-200';
                                btn.innerHTML = `✅ ${option}`;
                              } else {
                                btn.className = btn.className.replace('hover:bg-emerald-500/20', '') + ' bg-red-500/30 text-red-200';
                                btn.innerHTML = `❌ ${option}`;
                              }
                              setTimeout(() => {
                                // Show explanation
                                const explanation = document.createElement('div');
                                explanation.className = 'text-xs text-white/70 mt-2 p-2 rounded bg-white/5';
                                explanation.textContent = check.explanation;
                                btn.parentElement?.appendChild(explanation);
                              }, 500);
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* If this mini check just has a question/answer format (no options) */}
                    {!Array.isArray(check.options) && (check.answer || check.correct) && (
                      <div className="mb-3">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-emerald-300 font-semibold text-sm mb-2">✅ Answer:</div>
                          <div className="text-white/90 mb-2">{check.answer || check.correct}</div>
                          {check.explanation && (
                            <div className="text-white/70 text-xs italic">{check.explanation}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Section-level Cheat Sheet */}
                {(section as any).cheatSheet && (
                  <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-400/30">
                    <h4 className="font-semibold text-sm mb-3 text-green-300">📋 {(section as any).cheatSheet.title || 'Quick Reference'}</h4>
                    <div className="grid gap-2">
                      {Array.isArray((section as any).cheatSheet.items) && (section as any).cheatSheet.items.map((item: string, iIdx: number) => (
                        <div key={iIdx} className="text-sm text-white/80 flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversation Practice */}
                {(section as any).conversationPractice && (
                  <div className="mb-4 p-4 rounded-lg bg-purple-500/10 border border-purple-400/30">
                    <h4 className="font-semibold text-sm mb-3 text-purple-300">💬 {(section as any).conversationPractice.scenario}</h4>
                    <div className="space-y-3">
                      {(section as any).conversationPractice.conversation && (section as any).conversationPractice.conversation.map((line: any, lIdx: number) => (
                        <div key={lIdx} className={`p-3 rounded-lg ${line.speaker === 'You' ? 'bg-blue-500/20 border-l-4 border-blue-400' : 'bg-white/5 border-l-4 border-purple-400'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-purple-200">{line.speaker}:</span>
                          </div>
                          <div className="mb-2">
                            <div className="font-medium text-white">{line.pt}</div>
                            <div className="text-white/70 text-sm italic">{line.en}</div>
                          </div>
                          {line.tip && (
                            <div className="text-purple-300 text-xs bg-purple-500/20 p-2 rounded">
                              💡 {line.tip}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenges/Gamification */}
                {(section as any).challenges && (
                  <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30">
                    <h4 className="font-semibold text-sm mb-3 text-yellow-300">🎮 Challenges</h4>
                    <div className="grid gap-3">
                      {(section as any).challenges.map((challenge: any, cIdx: number) => (
                        <div key={cIdx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              challenge.level === 'Bronze' ? 'bg-amber-600 text-amber-100' :
                              challenge.level === 'Silver' ? 'bg-gray-500 text-gray-100' :
                              challenge.level === 'Gold' ? 'bg-yellow-600 text-yellow-100' :
                              'bg-purple-600 text-purple-100'
                            }`}>
                              {challenge.level}
                            </span>
                            <span className="text-yellow-400 font-bold">+{challenge.points} XP</span>
                          </div>
                          <div className="text-white/90 text-sm mb-2">{challenge.task}</div>
                          <div className="font-mono text-green-300 text-sm bg-green-500/10 p-2 rounded border border-green-500/20">
                            {challenge.phrase}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Story Mode */}
                {(section as any).storyMode && (
                  <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-400/30">
                    <h4 className="font-semibold text-sm mb-3 text-indigo-300">🎬 {(section as any).storyMode.title}</h4>
                    <div className="space-y-3">
                      {(section as any).storyMode.segments && (section as any).storyMode.segments.map((segment: any, sIdx: number) => (
                        <div key={sIdx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded text-xs">
                              {segment.time}
                            </span>
                          </div>
                          <div className="mb-2">
                            <div className="font-medium text-white mb-1">{segment.pt}</div>
                            <div className="text-white/70 text-sm italic">{segment.en}</div>
                          </div>
                          {segment.vocab && segment.vocab.length > 0 && (
                            <div className="mt-2 p-2 bg-indigo-500/10 rounded border border-indigo-500/20">
                              <div className="text-indigo-300 text-xs font-semibold mb-1">📚 Vocabulary:</div>
                              <div className="grid gap-1">
                                {segment.vocab.map((vocabItem: string, vIdx: number) => (
                                  <div key={vIdx} className="text-xs text-white/80">{vocabItem}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.keyPoints && section.keyPoints.length > 0 && (
                  <div className="grid gap-2 mb-4">
                    <div className="text-sm font-semibold text-white/90">🔑 Key Points:</div>
                    <ul className="list-none space-y-2">
                      {section.keyPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 text-sm text-white/70 p-2 rounded-lg bg-white/5">
                          <span className="text-yellow-400 mt-0.5">★</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section Completion Button */}
                {!isCompleted && (
                  <div className="text-center">
                    <button
                      onClick={() => markSectionComplete(sIdx)}
                      className="btn btn-primary hover:scale-105 transition-transform"
                    >
                      ✓ Mark Section Complete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Notes Section */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-blue-400">📝 Your Notes</h3>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="btn btn-secondary text-sm"
          >
            {showNotes ? 'Hide Notes' : 'Add Notes'}
          </button>
        </div>
        
        {showNotes && (
          <div className="anim-slide-in">
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Write down important points, questions, or anything you want to remember..."
              className="w-full h-24 p-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
            <div className="text-xs text-white/50 mt-2">
              Notes are saved in your browser for this lesson
            </div>
          </div>
        )}
      </div>

      {/* Cheat Sheet */}
      {(content as any).cheatSheet && (
        <div className="card p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30">
          <h3 className="text-lg font-bold text-green-400 mb-4">📋 {(content as any).cheatSheet.title}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.isArray((content as any).cheatSheet?.items) && (content as any).cheatSheet.items.map((category: any, cIdx: number) => (
              <div key={cIdx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-semibold text-sm text-green-300 mb-2">{category.category}</h4>
                <ul className="space-y-1">
                  {Array.isArray(category.items) && category.items.map((item: string, iIdx: number) => (
                    <li key={iIdx} className="text-xs text-white/80 flex items-center gap-2">
                      <span className="text-green-400">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why It Matters */}
      {(content as any).whyItMatters && (
        <div className="card p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
          <h3 className="text-lg font-bold text-purple-400 mb-4">🎯 Why This Lesson Matters</h3>
          
          <div className="grid gap-4">
            {Array.isArray((content as any).whyItMatters?.canDoStatements) && (
              <div>
                <h4 className="font-semibold text-sm text-purple-300 mb-2">🏆 You'll Be Able To:</h4>
                <ul className="space-y-2">
                  {(content as any).whyItMatters.canDoStatements.map((statement: string, sIdx: number) => (
                    <li key={sIdx} className="flex items-center gap-2 text-sm text-white/80">
                      <span className="text-purple-400">✓</span>
                      {statement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {(content as any).whyItMatters?.realWorld && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-semibold text-sm text-blue-300 mb-2">🌍 Real World</h4>
                <p className="text-sm text-white/80">{(content as any).whyItMatters.realWorld}</p>
              </div>
            )}
            
            {(content as any).whyItMatters?.realWorldUse && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-semibold text-sm text-blue-300 mb-2">🌍 Real-World Use</h4>
                <p className="text-sm text-white/80">{(content as any).whyItMatters.realWorldUse}</p>
              </div>
            )}
            
            {(content as any).whyItMatters?.linguisticInsight && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-semibold text-sm text-purple-300 mb-2">🧠 Linguistic Insight</h4>
                <p className="text-sm text-white/80">{(content as any).whyItMatters.linguisticInsight}</p>
              </div>
            )}
            
            {(content as any).whyItMatters?.culturalConnection && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-semibold text-sm text-orange-300 mb-2">🇵🇹 Cultural Connection</h4>
                <p className="text-sm text-white/80">{(content as any).whyItMatters.culturalConnection}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Practice Button */}
      <div className="text-center">
        <div className={`transition-all duration-300 ${
          allSectionsCompleted 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-50 transform translate-y-2'
        }`}>
          <button 
            onClick={onStartPractice} 
            disabled={!allSectionsCompleted}
            className={`btn btn-lg px-8 py-4 text-lg transition-all duration-200 ${
              allSectionsCompleted 
                ? 'btn-primary hover:scale-105 anim-glow' 
                : 'btn-secondary cursor-not-allowed'
            }`}
          >
            {allSectionsCompleted ? '🎯 Start Practice Exercises' : '📚 Complete all sections first'}
          </button>
        </div>
        
        {allSectionsCompleted ? (
          <div className="text-xs text-emerald-400 mt-2 anim-bounce-in">
            Great! You've studied all the material. Ready to practice? ✨
          </div>
        ) : (
          <div className="text-xs text-white/60 mt-2">
            Study each section and mark it complete to unlock practice
          </div>
        )}
      </div>

      {/* Quick Navigation */}
      {completedSections.size > 0 && (
        <div className="card p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30">
          <div className="text-center">
            <div className="text-sm font-semibold text-blue-400 mb-2">📋 Quick Review</div>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from(completedSections).map(sectionIdx => (
                <button
                  key={sectionIdx}
                  onClick={() => toggleSection(sectionIdx)}
                  className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                >
                  {content.sections[sectionIdx].title}
                </button>
              ))}
            </div>
            <div className="text-xs text-white/60 mt-2">Click to review any completed section</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExerciseEngine({ lesson, onProgress, onComplete, onStep }: { lesson: Lesson; onProgress?: (index:number, total:number)=>void; onComplete?: (xp:number)=>void; onStep?: (ok:boolean)=>void }) {
  // State to track if we're showing content or exercises
  const [showingContent, setShowingContent] = useState(!!lesson.content);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewContext, setReviewContext] = useState<string | null>(null);
  const [showQuickReference, setShowQuickReference] = useState(false);

  // Memoize expensive queue calculation
  const initialQueue = useMemo(() => {
    console.log('🔍 DEBUG - Lesson being processed:', { id: lesson.id, title: lesson.title, exerciseCount: lesson.exercises.length });
    console.log('📝 DEBUG - Raw lesson exercises:', lesson.exercises.map(ex => ({ 
      id: ex.id, 
      type: ex.type, 
      prompt: ex.prompt, 
      correct: ex.correct,
      pairs: ex.pairs,
      hasPairs: !!ex.pairs,
      pairsLength: ex.pairs?.length 
    })));
    const base = expandLesson(lesson);
    console.log('🔍 DEBUG - Base exercises from expandLesson:', base.map(ex => ({ 
      id: ex.id, 
      type: ex.type,
      prompt: ex.prompt, 
      correct: ex.correct,
      pairs: ex.pairs,
      hasPairs: !!ex.pairs,
      pairsLength: ex.pairs?.length
    })));
    // For lessons with sufficient exercises (like Physical Classes), use them as-is
    // Only orchestrate lessons with very few exercises to generate more content
    const content = base.length < 8 ? orchestrateLesson(lesson, 28) : base;
    console.log('🔍 DEBUG - Final content queue:', content.map(ex => ({ id: ex.id, prompt: ex.prompt, correct: ex.correct })));
    const quiz = buildAutoQuiz(lesson);
    console.log('🔍 DEBUG - Auto quiz:', quiz.map(ex => ({ id: ex.id, prompt: ex.prompt, correct: ex.correct })));
    return [...content, ...quiz];
  }, [lesson.id]); // Only recalculate if lesson changes

  const [queue, setQueue] = useState<Exercise[]>(initialQueue);
  const [index, setIndex] = useState(0);
  const { markLessonComplete, recordItemResult } = useAppStore();

  useEffect(() => {
    document.documentElement.style.setProperty("--daily-progress", `${Math.min(100, 100)}%`);
  }, []);

  useEffect(() => {
    if (!showingContent) {
      onProgress?.(index + 1, queue.length);
    }
  }, [index, queue.length, showingContent]);

  const handleNext = useMemo(() => {
    return (ok: boolean, ms?: number) => {
      const current = queue[index];
      if (current?.id) recordItemResult(current.id, ok, ms);
      onStep?.(ok);
      
      // Show contextual help for wrong answers
      if (!ok && lesson.content) {
        // Always show the complete lesson guide instead of contextual sections
        setReviewContext(null);
        setShowReviewModal(true);
      }
      
      const isQuizItem = current?.id?.startsWith("quiz-");
      if (!ok && !isQuizItem) setQueue((q) => [...q, current]);
      if (index + 1 < queue.length) setIndex(index + 1);
      else {
        markLessonComplete(lesson.id, lesson.xp);
        launchConfetti();
        onComplete?.(lesson.xp);
      }
    };
  }, [queue, index, recordItemResult, onStep, markLessonComplete, lesson.id, lesson.xp, onComplete, lesson.content]);

  // Function to determine which content section is most relevant for current exercise
  const getContextualHelp = (exercise: Exercise): string | null => {
    if (!lesson.content) return null;
    
    const exerciseContent = `${exercise.prompt || ""} ${exercise.term || ""} ${exercise.correct || ""}`.toLowerCase();
    
    // Check for specific topics
    if (exerciseContent.includes("falar") || exerciseContent.includes("comer") || exerciseContent.includes("abrir") || 
        exerciseContent.includes("conjuga") || exerciseContent.includes("-ar") || exerciseContent.includes("-er") || exerciseContent.includes("-ir")) {
      return "verb-conjugation";
    }
    
    if (exerciseContent.includes("do") || exerciseContent.includes("da") || exerciseContent.includes("no") || 
        exerciseContent.includes("na") || exerciseContent.includes("ao") || exerciseContent.includes("à") ||
        exerciseContent.includes("contração")) {
      return "contractions";
    }
    
    if (exerciseContent.includes("sempre") || exerciseContent.includes("às vezes") || exerciseContent.includes("nunca") ||
        exerciseContent.includes("segunda") || exerciseContent.includes("trabalho") || exerciseContent.includes("acordo")) {
      return "frequency";
    }
    
    if (exerciseContent.includes("arroba") || exerciseContent.includes("ponto") || exerciseContent.includes("euro") ||
        exerciseContent.includes("cêntimo") || exerciseContent.includes("@") || exerciseContent.includes("email")) {
      return "alphabet-email";
    }
    
    if (exerciseContent.includes("lh") || exerciseContent.includes("nh") || exerciseContent.includes("ão") ||
        exerciseContent.includes("ç") || exerciseContent.includes("filho") || exerciseContent.includes("senhor")) {
      return "pronunciation";
    }
    
    return null;
  };

  const getContextualContent = (context: string) => {
    if (!lesson.content) return null;
    
    const contextMap: Record<string, { title: string; keywords: string[] }> = {
      "verb-conjugation": { title: "Regular Verb Conjugations", keywords: ["conjugation", "verb", "-ar", "-er", "-ir"] },
      "contractions": { title: "Preposition Contractions", keywords: ["contraction", "preposition", "de", "em", "a"] },
      "frequency": { title: "Frequency Expressions", keywords: ["frequency", "sempre", "às vezes", "routine"] },
      "alphabet-email": { title: "Portuguese Alphabet", keywords: ["alphabet", "email", "arroba", "ponto"] },
      "pronunciation": { title: "Portuguese Sounds", keywords: ["pronunciation", "sound", "lh", "nh", "ão"] }
    };
    
    const target = contextMap[context];
    if (!target) return null;
    
    // Find the most relevant section
    return lesson.content.sections.find(section => 
      target.keywords.some(keyword => 
        section.title.toLowerCase().includes(keyword) || 
        section.explanation.toLowerCase().includes(keyword)
      )
    );
  };

  // Show lesson content first if it exists and we haven't started practice
  if (showingContent && lesson.content) {
    return (
      <LessonContentPresentation 
        content={lesson.content} 
        onStartPractice={() => setShowingContent(false)} 
      />
    );
  }

  const ex = queue[index];
  if (!ex) return null;
  
  return (
    <div className="grid gap-4">
      {/* Header with Review Options */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/70">{lesson.title} • {index + 1} / {queue.length}</div>
        <div className="flex items-center gap-2">
          {lesson.content && (
            <button
              onClick={() => { setReviewContext(null); setShowReviewModal(true); }}
              className="btn btn-secondary text-xs"
              title="Review complete lesson guide"
            >
              📚 Review Guide
            </button>
          )}
          <button
            onClick={() => setShowQuickReference(!showQuickReference)}
            className="btn btn-secondary text-xs"
            title="Exercise-specific tips and hints"
          >
            {showQuickReference ? 'Hide Tips' : '💡 Exercise Tips'}
          </button>
        </div>
      </div>

      {/* Quick Reference Sidebar */}
      {showQuickReference && lesson.content && (
        <div className="card p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30 anim-slide-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-blue-400">💡 Exercise Tips & Quick Help</h3>
            <button
              onClick={() => setShowQuickReference(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Explanation of purpose */}
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-400/30">
            <div className="text-xs font-semibold text-blue-400 mb-1">ℹ️ What is this?</div>
            <div className="text-xs text-white/80">
              Get specific tips for this exercise type and quick access to lesson sections. 
              For the complete lesson guide, use "📚 Review Guide" above.
            </div>
          </div>
          
          {/* Exercise-specific help */}
          <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
            <div className="text-xs font-semibold text-yellow-400 mb-2">🎯 How to complete this exercise</div>
            <div className="text-xs text-white/80">
              {ex.type === 'flashcard' && 'Read the Portuguese word and try to recall its meaning. Click "Show" to reveal the English translation.'}
              {ex.type === 'mcq' && 'Read the Portuguese text and choose the correct English translation from the options below.'}
              {ex.type === 'typing' && 'Type the correct translation. Use Portuguese accents (á, ã, ç) when needed. AI will check for typos and variations.'}
              {ex.type === 'listening' && 'Listen to the Portuguese audio and type exactly what you hear. Click the speaker to replay.'}
              {ex.type === 'matching' && 'Match the Portuguese words with their English meanings by clicking pairs.'}
              {ex.type === 'order' && 'Arrange the Portuguese words into the correct sentence order using the arrow buttons.'}
              {ex.type === 'pronunciation' && 'Listen to the audio and choose which Portuguese text matches what you heard.'}
              {ex.type === 'spelling' && 'Type the Portuguese word correctly. Pay attention to accents and special characters.'}
              {ex.type === 'price' && 'Listen to the Portuguese price and write it in the correct format (e.g., 12,50 €).'}
              {ex.type === 'conjugation' && 'Type the correct verb form for the given person and context.'}
              {ex.type === 'conjugationGrid' && 'Fill in all six forms of the verb conjugation (eu, tu, ele/ela, nós, vocês, eles/elas).'}
              {ex.type === 'directions' && 'Choose the correct Portuguese preposition contraction (ao, à, no, na, etc.).'}
              {ex.type === 'form' && 'Fill out the form with valid Portuguese information. Use format 1234-567 for postal codes.'}
              {ex.type === 'dirPath' && 'Click the nodes in the correct path order. Only adjacent connections are valid.'}
              {!['flashcard', 'mcq', 'typing', 'listening', 'matching', 'order', 'pronunciation', 'spelling', 'price', 'conjugation', 'conjugationGrid', 'directions', 'form', 'dirPath'].includes(ex.type) && 'Follow the instructions and complete the exercise. Use the "💡 Show Answer" button if you get stuck.'}
            </div>
          </div>
          
          <div className="grid gap-2">
            <div className="text-xs font-semibold text-white/70 mb-2">📚 Quick access to lesson sections:</div>
            {lesson.content.sections.map((section, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setReviewContext(section.title.toLowerCase().replace(/\s+/g, '-'));
                  setShowReviewModal(true);
                  setShowQuickReference(false); // Close help when opening review
                }}
                className="text-left text-xs p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all"
              >
                <div className="font-semibold">{section.title}</div>
                <div className="text-white/60 text-xs truncate">{section.explanation.slice(0, 60)}...</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Content */}
      {ex.type === "flashcard" && <Flashcard key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "mcq" && <MCQ key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "typing" && <Typing key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "listening" && <Listening key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "matching" && (
        <>
          {console.log('Rendering Matching component with ex:', ex)}
          <Matching key={ex.id} ex={ex} onNext={handleNext} />
        </>
      )}
      {ex.type === "order" && <Order key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "dialogue" && (
        <div key={ex.id} className="card p-4">
          <div className="text-white/70">Dialogue coming soon</div>
          <div className="flex justify-end"><button className="btn btn-primary" onClick={()=>handleNext(true)}>Continue</button></div>
        </div>
      )}
      {ex.type === "pronunciation" && <Pronunciation key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "spelling" && <Spelling key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "price" && <Price key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "conjugation" && <Conjugation key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "conjugationGrid" && <ConjugationGrid key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "dirPath" && <DirPath key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "directions" && <DirectionContractions key={ex.id} ex={ex} onNext={handleNext} />}
      {ex.type === "form" && <FormFill key={ex.id} ex={ex} onNext={handleNext} />}

      {/* Review Modal */}
      {showReviewModal && lesson.content && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-700 p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gradient">📚 Complete Lesson Guide</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">Review all lesson content - scroll to browse all sections</span>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="btn btn-secondary text-sm"
                  >
                    Back to Exercise
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Show the complete lesson content using the same rich component as the pre-exercise guide */}
              <LessonContentPresentation 
                content={lesson.content} 
                onStartPractice={() => setShowReviewModal(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
