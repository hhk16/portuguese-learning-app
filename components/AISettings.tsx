"use client";
import { useState, useEffect } from "react";
import { aiValidator } from "@/lib/ai-validator";

export default function AISettings({ onClose }: { onClose?: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    // Load existing API key
    const existing = localStorage.getItem('openai_api_key');
    if (existing) {
      setApiKey(existing);
      setIsValid(true);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      aiValidator.setApiKey(apiKey.trim());
      setIsValid(true);
      setTestResult("API key saved! AI validation is now active.");
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      // Temporarily set the API key for testing
      aiValidator.setApiKey(apiKey.trim());
      
      // Test with a simple validation
      const result = await aiValidator.validateAnswer({
        userAnswer: "olá",
        expectedAnswer: "hello",
        exerciseType: "translation",
        context: "Translate 'hello' to Portuguese",
        language: "pt"
      });
      
      if (result.confidence > 0) {
        setTestResult("✅ API key works! AI validation is active.");
        setIsValid(true);
      } else {
        setTestResult("❌ API test failed. Please check your key.");
        setIsValid(false);
      }
    } catch (error) {
      setTestResult("❌ API test failed. Please check your key and internet connection.");
      setIsValid(false);
      console.error('API test error:', error);
    } finally {
      setTesting(false);
    }
  };

  const handleRemove = () => {
    setApiKey("");
    setIsValid(false);
    setTestResult(null);
    localStorage.removeItem('openai_api_key');
  };

  return (
    <div className="card p-6 grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-emerald-400">🤖 AI-Powered Validation</h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="text-sm text-white/70">
        Add your OpenAI API key to enable intelligent answer validation that accepts:
        <ul className="mt-2 list-disc list-inside space-y-1">
          <li>Case variations ("por favor" vs "Por favor")</li>
          <li>Multiple valid translations ("excuse me" = "desculpe" OR "com licença")</li>
          <li>Minor typos and spelling mistakes</li>
          <li>Context-appropriate answers</li>
        </ul>
      </div>

      {!isValid && (
        <div className="grid gap-3">
          <div>
            <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-2 text-sm"
            />
            <div className="mt-1 text-xs text-white/60">
              Get your API key from{" "}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300"
              >
                OpenAI Platform
              </a>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={!apiKey.trim() || testing}
              className="btn btn-secondary"
            >
              {testing ? "Testing..." : "Test API Key"}
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="btn btn-primary"
            >
              Save & Activate
            </button>
          </div>
        </div>
      )}

      {isValid && (
        <div className="grid gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
            <div>
              <div className="font-medium text-emerald-400">✅ AI Validation Active</div>
              <div className="text-xs text-white/70">Your answers will be intelligently evaluated</div>
            </div>
            <button
              onClick={handleRemove}
              className="btn btn-secondary text-xs"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {testResult && (
        <div className={`p-3 rounded-xl text-sm ${
          testResult.includes('✅') 
            ? 'bg-emerald-500/10 border border-emerald-400/30 text-emerald-300'
            : 'bg-red-500/10 border border-red-400/30 text-red-300'
        }`}>
          {testResult}
        </div>
      )}

      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/30">
        <div className="text-sm font-medium text-blue-400 mb-1">💡 Fallback Mode</div>
        <div className="text-xs text-white/70">
          Even without AI, the app uses enhanced validation with common Portuguese variations and typo tolerance.
        </div>
      </div>
    </div>
  );
} 