import AISettings from "@/components/AISettings";
import ValidationDebug from "@/components/ValidationDebug";
import NavigationDebug from "@/components/NavigationDebug";

export default function AISettingsPage() {
  return (
    <div className="container-max grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold text-gradient">🤖 AI Settings</h1>
        <p className="text-white/70">Configure intelligent answer validation</p>
      </div>

      <AISettings />
      
      <ValidationDebug />
      
      <NavigationDebug />
      
      <div className="card p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
        <div className="grid gap-3">
          <h3 className="font-bold text-purple-300">Why use AI validation?</h3>
          <div className="text-sm text-white/80">
            Traditional language learning apps are too strict - they reject correct answers due to:
            <ul className="mt-2 list-disc list-inside space-y-1 text-white/70">
              <li><strong>Case sensitivity:</strong> "por favor" vs "Por favor"</li>
              <li><strong>Multiple translations:</strong> "excuse me" can be "desculpe" OR "com licença"</li>
              <li><strong>Minor typos:</strong> "obrigado" vs "obrigdao"</li>
              <li><strong>Regional variations:</strong> European vs Brazilian Portuguese</li>
            </ul>
          </div>
          <div className="text-sm text-emerald-300">
            Our AI validation uses GPT-3.5 to evaluate answers like a human tutor would!
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid gap-3">
          <h3 className="font-bold">Privacy & Usage</h3>
          <div className="text-sm text-white/70 space-y-2">
            <p>• Your API key is stored locally in your browser</p>
            <p>• We only send your answers and expected answers to OpenAI for validation</p>
            <p>• No personal information or lesson content is transmitted</p>
            <p>• Typical cost: ~$0.01-0.02 per lesson (very affordable!)</p>
          </div>
        </div>
      </div>
    </div>
  );
} 