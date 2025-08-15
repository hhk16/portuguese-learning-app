"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { physicalClassesEnhancedModule } from '@/lib/physical-classes-enhanced';

// Achievement system
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

// Lesson card with gamification
interface LessonCardProps {
  lesson: any;
  index: number;
  isUnlocked: boolean;
  progress: number;
  achievements: Achievement[];
}

function LessonCard({ lesson, index, isUnlocked, progress, achievements }: LessonCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Dynamic gradient based on progress
  const getGradient = () => {
    if (progress === 100) return 'from-green-400 to-emerald-600';
    if (progress > 50) return 'from-blue-400 to-indigo-600';
    if (progress > 0) return 'from-purple-400 to-pink-600';
    return 'from-gray-400 to-gray-600';
  };
  
  // Lesson difficulty badges
  const getDifficultyBadge = () => {
    const xp = lesson.xp || 0;
    if (xp >= 100) return { text: 'MASTER', color: 'bg-red-500' };
    if (xp >= 80) return { text: 'ADVANCED', color: 'bg-orange-500' };
    if (xp >= 60) return { text: 'INTERMEDIATE', color: 'bg-yellow-500' };
    return { text: 'BEGINNER', color: 'bg-green-500' };
  };
  
  const difficulty = getDifficultyBadge();
  
  return (
    <div
      className={`relative transform transition-all duration-500 ${
        isHovered ? 'scale-105 -translate-y-2' : ''
      } ${!isUnlocked ? 'opacity-60' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      {isHovered && isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl blur-xl opacity-40 animate-pulse" />
      )}
      
      {/* Main card */}
      <div className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden ${
        !isUnlocked ? 'cursor-not-allowed' : ''
      }`}>
        {/* Top banner with gradient */}
        <div className={`h-32 bg-gradient-to-br ${getGradient()} relative overflow-hidden`}>
          {/* Animated particles */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white/20 rounded-full animate-float"
                style={{
                  width: `${Math.random() * 30 + 10}px`,
                  height: `${Math.random() * 30 + 10}px`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`
                }}
              />
            ))}
          </div>
          
          {/* Lesson number */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
            {index + 1}
          </div>
          
          {/* XP Badge */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded-full px-4 py-2 text-white font-bold flex items-center gap-2">
            <span className="text-yellow-300">⚡</span>
            {lesson.xp} XP
          </div>
          
          {/* Difficulty badge */}
          <div className={`absolute bottom-4 left-4 ${difficulty.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
            {difficulty.text}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            {lesson.title}
            {progress === 100 && <span className="text-green-500">✅</span>}
          </h3>
          
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getGradient()} transition-all duration-1000 relative`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer" />
              </div>
            </div>
          </div>
          
          {/* Key topics */}
          <div className="flex flex-wrap gap-2 mb-4">
            {lesson.title.includes('Café') && (
              <>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">☕ Coffee Culture</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">🛍️ Shopping</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">👅 Tastes</span>
              </>
            )}
            {lesson.title.includes('Routine') && (
              <>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">🔄 Reflexive Verbs</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">⏰ Time</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">📊 Frequency</span>
              </>
            )}
            {lesson.title.includes('Emotions') && (
              <>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">❤️ Preferences</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">😊 Feelings</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">💭 Opinions</span>
              </>
            )}
          </div>
          
          {/* Achievements preview */}
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 mb-3"
          >
            🏆 {achievements.filter(a => a.unlocked).length}/{achievements.length} Achievements
            <span className={`transform transition-transform ${showAchievements ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {showAchievements && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`relative group ${achievement.unlocked ? '' : 'opacity-40'}`}
                  title={achievement.description}
                >
                  <div className={`text-2xl p-2 rounded-lg text-center ${
                    achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    {achievement.icon}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {achievement.title}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-3">
            {isUnlocked ? (
              <>
                <Link
                  href={`/learn/${lesson.id}`}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-bold text-center hover:shadow-lg transform transition-all hover:scale-105"
                >
                  {progress === 0 ? 'Start Learning' : progress === 100 ? 'Review' : 'Continue'}
                </Link>
                <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors" title="Practice Mode">
                  🎯
                </button>
              </>
            ) : (
              <div className="flex-1 bg-gray-200 text-gray-500 py-3 px-6 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                <span>🔒</span>
                Complete Previous Lesson
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PhysicalClassesPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showTutorial, setShowTutorial] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  
  // Mock progress data (in real app, from store)
  const lessonProgress = {
    'physical1-enhanced': 45,
    'physical2-enhanced': 20,
    'physical3-enhanced': 0
  };
  
  // Mock achievements
  const getAchievements = (lessonId: string): Achievement[] => {
    const baseAchievements = [
      { id: 'first-try', title: 'First Try', description: 'Complete without mistakes', icon: '🎯', unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'speed-demon', title: 'Speed Demon', description: 'Complete in under 5 minutes', icon: '⚡', unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'perfectionist', title: 'Perfectionist', description: 'Get 100% accuracy', icon: '💯', unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'streak', title: 'Streak Master', description: '5 correct in a row', icon: '🔥', unlocked: false, progress: 0, maxProgress: 5 },
    ];
    
    // Simulate some unlocked achievements based on progress
    if (lessonProgress[lessonId as keyof typeof lessonProgress] > 40) {
      baseAchievements[0].unlocked = true;
    }
    if (lessonProgress[lessonId as keyof typeof lessonProgress] > 60) {
      baseAchievements[1].unlocked = true;
    }
    
    return baseAchievements;
  };
  
  // Calculate user level from XP
  useEffect(() => {
    const total = Object.values(lessonProgress).reduce((sum, prog) => sum + prog, 0);
    setTotalXP(total);
    setUserLevel(Math.floor(total / 100) + 1);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>
      
      {/* Header */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Top bar with user stats */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  🎓 Physical Classes - Interactive Edition
                </h1>
                <p className="text-gray-600">
                  Your real-world lessons transformed into an immersive learning experience
                </p>
              </div>
              
              {/* User stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{userLevel}</div>
                  <div className="text-sm text-gray-600">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{totalXP}</div>
                  <div className="text-sm text-gray-600">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {physicalClassesEnhancedModule.lessons.filter(
                      l => lessonProgress[l.id as keyof typeof lessonProgress] === 100
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </div>
            
            {/* Overall progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-bold">
                  {Math.round(
                    Object.values(lessonProgress).reduce((a, b) => a + b, 0) / 
                    physicalClassesEnhancedModule.lessons.length
                  )}%
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
                  style={{ 
                    width: `${Math.round(
                      Object.values(lessonProgress).reduce((a, b) => a + b, 0) / 
                      physicalClassesEnhancedModule.lessons.length
                    )}%` 
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Filter tabs */}
          <div className="flex gap-3 mb-8">
            {['all', 'in-progress', 'completed', 'locked'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedFilter === filter
                    ? 'bg-white shadow-lg text-purple-600'
                    : 'bg-white/50 text-gray-600 hover:bg-white/70'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
              </button>
            ))}
            
            <button
              onClick={() => setShowTutorial(true)}
              className="ml-auto px-6 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-500 transition-colors flex items-center gap-2"
            >
              💡 How to Use
            </button>
          </div>
          
          {/* Lesson cards grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {physicalClassesEnhancedModule.lessons.map((lesson, index) => {
              const progress = lessonProgress[lesson.id as keyof typeof lessonProgress] || 0;
              const isUnlocked = true; // All lessons unlocked
              
              // Apply filter
              if (selectedFilter === 'completed' && progress !== 100) return null;
              if (selectedFilter === 'in-progress' && (progress === 0 || progress === 100)) return null;
              if (selectedFilter === 'locked' && isUnlocked) return null;
              
              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  isUnlocked={isUnlocked}
                  progress={progress}
                  achievements={getAchievements(lesson.id)}
                />
              );
            })}
          </div>
          
          {/* Motivational footer */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-3">🚀 Keep Going!</h3>
              <p className="text-lg mb-4">
                You're making amazing progress! Complete all lessons to unlock the Master Certificate!
              </p>
              <div className="flex justify-center gap-4">
                <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                  🔥 Current Streak: 3 days
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                  ⏱️ Time Today: 24 min
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                  📈 Accuracy: 87%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6">💡 How to Master Physical Classes</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="text-3xl">📚</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">PPP Methodology</h3>
                  <p className="text-gray-600">
                    Each lesson follows Presentation → Practice → Production. First learn concepts, 
                    then practice with exercises, finally produce language naturally.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="text-3xl">🎮</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Gamification</h3>
                  <p className="text-gray-600">
                    Earn XP, unlock achievements, and level up! Complete lessons with high accuracy 
                    to earn bonus points and special badges.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="text-3xl">🔄</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Spaced Repetition</h3>
                  <p className="text-gray-600">
                    Review completed lessons regularly. The system will remind you when it's time 
                    to review to maximize retention.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="text-3xl">💬</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Real Conversations</h3>
                  <p className="text-gray-600">
                    Practice authentic dialogues from real Portuguese cafés, daily routines, and 
                    social situations. This is Portuguese as it's actually spoken!
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowTutorial(false)}
              className="mt-8 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Got it! Let's Learn!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add CSS animations
const styles = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;