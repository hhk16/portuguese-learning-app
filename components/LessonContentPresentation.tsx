"use client";
import { LessonContent } from "@/lib/content";

interface LessonContentPresentationProps {
  content: LessonContent | any;
  onContinue: () => void;
  isReview?: boolean;
}

export default function LessonContentPresentation({ 
  content, 
  onContinue,
  isReview = false 
}: LessonContentPresentationProps) {
  
  if (!content) {
    return (
      <div className="p-8 text-center">
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Exercises
        </button>
      </div>
    );
  }

  // Render enhanced content if available
  const sections = content.sections || [];
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Title */}
        {content.title && (
          <h1 className="text-3xl font-bold mb-6">{content.title}</h1>
        )}

        {/* Introduction */}
        {content.introduction && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-lg">{content.introduction}</p>
          </div>
        )}

        {/* Sections */}
        {sections.map((section: any, index: number) => (
          <div key={index} className="mb-8">
            {section.title && (
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
            )}
            
            {/* Examples */}
            {section.examples && (
              <div className="space-y-3 mb-4">
                {section.examples.map((ex: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold">{ex.portuguese}</p>
                    <p className="text-gray-600">{ex.english}</p>
                    {ex.literal && (
                      <p className="text-sm text-gray-500 italic">Literal: {ex.literal}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Rule Boxes */}
            {section.ruleBoxes && section.ruleBoxes.map((rule: any, i: number) => (
              <div key={i} className={`p-4 rounded-lg mb-4 ${
                rule.type === 'grammar' ? 'bg-blue-50 border-l-4 border-blue-500' :
                rule.type === 'cultural' ? 'bg-purple-50 border-l-4 border-purple-500' :
                'bg-gray-50'
              }`}>
                <h3 className="font-bold mb-2">{rule.title}</h3>
                <p>{rule.content}</p>
                {rule.examples && (
                  <div className="mt-2 space-y-1">
                    {rule.examples.map((ex: string, j: number) => (
                      <p key={j} className="text-sm">• {ex}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Cultural Notes */}
            {section.culturalNotes && section.culturalNotes.map((note: any, i: number) => (
              <div key={i} className="p-4 bg-yellow-50 rounded-lg mb-4">
                <h3 className="font-bold text-yellow-800 mb-2">🇵🇹 Cultural Note</h3>
                <p>{note.content}</p>
              </div>
            ))}

            {/* Pitfalls */}
            {section.pitfalls && section.pitfalls.map((pitfall: any, i: number) => (
              <div key={i} className="p-4 bg-red-50 rounded-lg mb-4">
                <h3 className="font-bold text-red-800 mb-2">⚠️ Common Mistake</h3>
                <p className="mb-2">{pitfall.issue}</p>
                <p className="text-green-700">✓ {pitfall.correct}</p>
              </div>
            ))}
          </div>
        ))}

        {/* Why It Matters */}
        {content.whyItMatters && (
          <div className="p-4 bg-green-50 rounded-lg mb-6">
            <h3 className="font-bold text-green-800 mb-2">💡 Why This Matters</h3>
            <p>{content.whyItMatters.realWorld}</p>
          </div>
        )}

        {/* Continue Button */}
        {!isReview && (
          <button
            onClick={onContinue}
            className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            Start Exercises →
          </button>
        )}
      </div>
    </div>
  );
}
