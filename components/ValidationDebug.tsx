"use client";
import { useState } from "react";
import { validateAnswer } from "@/lib/ai-validator";

export default function ValidationDebug() {
  const [userAnswer, setUserAnswer] = useState("sorry/excuse me (informal)");
  const [expectedAnswer, setExpectedAnswer] = useState("Sorry/Excuse me (informal)");
  const [result, setResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const test = async () => {
    setTesting(true);
    try {
      const res = await validateAnswer(
        userAnswer,
        expectedAnswer,
        'translation',
        `Type in English: 'Desculpa'`,
        'en'
      );
      setResult(res);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="card p-4 grid gap-3">
      <h3 className="font-bold">🔧 Validation Debug</h3>
      
      <div className="grid gap-2">
        <label className="text-sm">Expected Answer:</label>
        <input 
          value={expectedAnswer}
          onChange={(e) => setExpectedAnswer(e.target.value)}
          className="rounded bg-white/5 border border-white/15 px-2 py-1 text-sm"
        />
      </div>
      
      <div className="grid gap-2">
        <label className="text-sm">User Answer:</label>
        <input 
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="rounded bg-white/5 border border-white/15 px-2 py-1 text-sm"
        />
      </div>
      
      <button 
        onClick={test}
        disabled={testing}
        className="btn btn-secondary text-sm"
      >
        {testing ? "Testing..." : "Test Validation"}
      </button>
      
      {result && (
        <div className={`p-3 rounded text-sm ${
          result.isCorrect 
            ? "bg-emerald-500/10 border border-emerald-400/30" 
            : "bg-red-500/10 border border-red-400/30"
        }`}>
          <div><strong>Correct:</strong> {result.isCorrect ? "✅ Yes" : "❌ No"}</div>
          <div><strong>Confidence:</strong> {Math.round((result.confidence || 0) * 100)}%</div>
          <div><strong>Feedback:</strong> {result.feedback}</div>
          {result.error && <div><strong>Error:</strong> {result.error}</div>}
        </div>
      )}
    </div>
  );
} 