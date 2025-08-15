"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { getModuleMetadata, preloadModule, ModuleMetadata } from "@/lib/content-loader";

// Recommended learning order
const RECOMMENDED_ORDER = [
  // Core A1 Foundation (Units u0-u9)
  "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12",
  
  // Enhanced Core Modules (Phase A)
  "m7enhanced", "m8enhanced", "m9enhanced", "m10enhanced", "m11enhanced", "m12enhanced",
  
  // Conjugation Mastery (Units u10-u14)
  "conjugation1enhanced", "conjugation2enhanced", "conjugation3enhanced", "conjugation4enhanced", "conjugation5enhanced",
  
  // Essential Vocabulary (Unit u15)
  "vocab1enhanced", "vocab2enhanced", "vocab3enhanced", "vocab4enhanced",
  "vocab5enhanced", "vocab6enhanced", "vocab7enhanced",
  
  // Phrases & Communication
  "phrases1", "phrases2",
  
  // Culture & Context (Unit u16)
  "cultural1enhanced", "cultural2enhanced", "cultural3enhanced",
  
  // Expert Level Mastery
  "expert1enhanced", "expert2enhanced", "expert3enhanced", "expert4enhanced", "expert5enhanced",
  "expert6enhanced", "expert7enhanced", "expert8enhanced", "expert9enhanced", "expert10enhanced"
];

function getLevelCategory(index: number): string {
  if (index < 12) return "🎯 Core A1 Foundation";
  if (index < 18) return "⚡ Enhanced Core Modules";
  if (index < 23) return "📝 Conjugation Mastery";
  if (index < 30) return "📚 Essential Vocabulary";
  if (index < 32) return "💬 Phrases & Communication";
  if (index < 35) return "🇵🇹 Culture & Context";
  return "🏆 Expert Level";
}

export default function LevelsPage() {
  const [modules, setModules] = useState<ModuleMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const { lessonProgress } = useAppStore();

  useEffect(() => {
    // Load module metadata (lightweight)
    const metadata = getModuleMetadata();
    setModules(metadata);
    setLoading(false);
  }, []);

  // Preload module on hover for better UX
  const handleModuleHover = (moduleId: string) => {
    setHoveredModule(moduleId);
    // Preload the module data in the background
    preloadModule(moduleId).catch(console.error);
  };

  const sortedModules = useMemo(() => {
    const moduleMap = new Map(modules.map(m => [m.id, m]));
    return RECOMMENDED_ORDER
      .map(id => moduleMap.get(id))
      .filter(Boolean) as ModuleMetadata[];
  }, [modules]);

  const getModuleProgress = (moduleId: string): number => {
    const moduleData = modules.find(m => m.id === moduleId);
    if (!moduleData || !moduleData.lessonCount) return 0;
    
    // Count completed lessons for this module
    const completedCount = Object.keys(lessonProgress).filter(lessonId => 
      lessonId.startsWith(moduleId.replace('enhanced', '')) && 
      lessonProgress[lessonId].completed
    ).length;
    
    return Math.round((completedCount / moduleData.lessonCount) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading modules...</p>
        </div>
      </div>
    );
  }

  let lastCategory = "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎯 Learning Path
          </h1>
          <p className="text-gray-600">
            Follow the recommended order for optimal learning
          </p>
        </div>

        <div className="space-y-6">
          {sortedModules.map((module, index) => {
            const category = getLevelCategory(index);
            const showCategory = category !== lastCategory;
            lastCategory = category;
            const progress = getModuleProgress(module.id);
            const isCompleted = progress === 100;
            const isInProgress = progress > 0 && progress < 100;
            const isLocked = index > 0 && getModuleProgress(sortedModules[index - 1].id) < 50;

            return (
              <div key={module.id}>
                {showCategory && (
                  <h2 className="text-2xl font-bold text-gray-700 mb-4 mt-8 first:mt-0">
                    {category}
                  </h2>
                )}
                
                <Link
                  href={isLocked ? "#" : `/module/${module.id}`}
                  className={`block ${isLocked ? 'cursor-not-allowed' : ''}`}
                  onMouseEnter={() => !isLocked && handleModuleHover(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                >
                  <div className={`
                    bg-white rounded-xl shadow-lg p-6 transition-all duration-300
                    ${isLocked ? 'opacity-50' : 'hover:shadow-xl hover:scale-[1.02]'}
                    ${isCompleted ? 'ring-2 ring-green-500' : ''}
                    ${isInProgress ? 'ring-2 ring-blue-500' : ''}
                    ${hoveredModule === module.id ? 'bg-blue-50' : ''}
                  `}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {module.title}
                          </h3>
                          {isCompleted && (
                            <span className="text-2xl">✅</span>
                          )}
                          {isLocked && (
                            <span className="text-2xl">🔒</span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">
                          {module.description}
                        </p>
                        
                        {/* Progress bar */}
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">
                            {module.lessonCount} lessons
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {progress}% complete
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <div className={`
                          w-16 h-16 rounded-full flex items-center justify-center text-2xl
                          ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}
                        `}>
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Physical Classes Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            📝 Additional Resources
          </h2>
          <Link href="/physical-classes">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Physical Classes
              </h3>
              <p className="text-gray-600">
                Your real-life class notes transformed into interactive lessons
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
