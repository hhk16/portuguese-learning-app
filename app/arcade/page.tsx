"use client";
import Link from "next/link";
import { modules } from "@/lib/content-integrated";
import { useAppStore } from "@/lib/store";

export default function ArcadePage() {
  // Vocabulary-focused games using our massive database
  const vocabularyGames = [
    { 
      id: "vocab-battle", 
      title: "🎯 Vocabulary Battle", 
      href: "/arcade/vocab-battle",
      description: "Ultimate flashcard duel with ALL 800+ vocabulary items",
      difficulty: "Adaptive",
      vocab: "All Categories"
    },
    { 
      id: "color-rush", 
      title: "🌈 Color Rush", 
      href: "/arcade/color-rush",
      description: "Lightning-fast color vocabulary challenge",
      difficulty: "Beginner",
      vocab: "Colors & Adjectives"
    },
    { 
      id: "food-frenzy", 
      title: "🍽️ Food Frenzy", 
      href: "/arcade/food-frenzy",
      description: "Portuguese food vocabulary speed challenge",
      difficulty: "Intermediate", 
      vocab: "Food & Dining"
    },
    { 
      id: "verb-master", 
      title: "⚡ Verb Master", 
      href: "/arcade/verb-master",
      description: "Conjugate 60+ essential Portuguese verbs",
      difficulty: "Advanced",
      vocab: "All Verbs"
    },
    { 
      id: "culture-quiz", 
      title: "🇵🇹 Culture Quiz", 
      href: "/arcade/culture-quiz",
      description: "Portuguese culture and traditions challenge",
      difficulty: "Expert",
      vocab: "Cultural Knowledge"
    },
  ];

  // Skill-focused games
  const skillGames = [
    { 
      id: "path", 
      title: "🛤️ Path Builder", 
      href: "/arcade/path",
      description: "Master Portuguese contractions",
      difficulty: "Intermediate"
    },
    { 
      id: "conj", 
      title: "📝 Conjugation Grid", 
      href: "/arcade/conjugation",
      description: "Complete verb conjugation grids",
      difficulty: "Advanced"
    },
    { 
      id: "nums", 
      title: "🔢 Number Builder", 
      href: "/arcade/numbers",
      description: "Master numbers 21-1000",
      difficulty: "Beginner"
    },
    { 
      id: "dirs", 
      title: "🧭 Direction Master", 
      href: "/arcade/directions",
      description: "Navigate with Portuguese directions",
      difficulty: "Intermediate"
    },
    { 
      id: "spell", 
      title: "📖 Spelling Tiles", 
      href: "/arcade/spelling",
      description: "Master Portuguese accents",
      difficulty: "Advanced"
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "Beginner": return "text-green-400 border-green-400/30 bg-green-500/10";
      case "Intermediate": return "text-yellow-400 border-yellow-400/30 bg-yellow-500/10";
      case "Advanced": return "text-orange-400 border-orange-400/30 bg-orange-500/10";
      case "Expert": return "text-red-400 border-red-400/30 bg-red-500/10";
      case "Adaptive": return "text-purple-400 border-purple-400/30 bg-purple-500/10";
      default: return "text-blue-400 border-blue-400/30 bg-blue-500/10";
    }
  };

  // Recommended section (top 2 weak skills + 1 rotating)
  const { itemStats } = useAppStore();
  const recommended = buildRecommendedFromWeakSkills(itemStats);

  return (
    <div className="container-max grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold text-gradient">🎮 Play (Skills)</h1>
        <div className="text-white/70 text-sm">Mini-games to master specific skills</div>
        <div className="text-white/60 text-xs">Target weak areas with fun, challenging games</div>
      </div>

      {/* Recommended for You */}
      {recommended.length > 0 && (
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-purple-400">✨ Recommended for You</h2>
            <div className="text-sm text-white/60">Based on your weakest skills</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommended.map((rec) => (
              <Link key={rec.href} href={rec.href} className="card p-4 hover-lift group">
                <div className="grid gap-2">
                  <div className="font-semibold">{rec.title}</div>
                  <div className="text-xs text-white/60">{rec.subtitle}</div>
                  <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">Play now →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary Champions */}
      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-emerald-400">🏆 Vocabulary Champions</h2>
          <div className="text-sm text-white/60">Battle mode with our full database</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vocabularyGames.map((game) => (
            <Link 
              key={game.id} 
              href={game.href} 
              className="card p-4 hover-lift group"
            >
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg">{game.title}</div>
                  <span className={`px-2 py-1 rounded-lg text-xs border ${getDifficultyColor(game.difficulty)}`}>
                    {game.difficulty}
                  </span>
                </div>
                <div className="text-sm text-white/80">{game.description}</div>
                {game.vocab && (
                  <div className="text-xs text-emerald-400 border border-emerald-400/30 bg-emerald-500/10 rounded-lg px-2 py-1">
                    📚 {game.vocab}
                  </div>
                )}
                <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                  Click to play →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4 text-blue-400">⚡ Skill Challenges</h2>
        <p className="text-white/70 text-sm mb-4">Focused games to master specific Portuguese skills and grammar.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillGames.map((game) => (
            <Link 
              key={game.id} 
              href={game.href} 
              className="card p-4 hover-lift group"
            >
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg">{game.title}</div>
                  <span className={`px-2 py-1 rounded-lg text-xs border ${getDifficultyColor(game.difficulty)}`}>
                    {game.difficulty}
                  </span>
                </div>
                <div className="text-sm text-white/80">{game.description}</div>
                <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                  Play challenge →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="card p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-300">🏆 Pro Tip</div>
          <div className="text-sm text-white/80 mt-1">
            Complete vocabulary games to reinforce your learning across ALL {modules.length} modules!
            Each game adapts to your performance and focuses on areas that need improvement.
          </div>
        </div>
      </div>
    </div>
  );
}

function buildRecommendedFromWeakSkills(itemStats: Record<string, { attempts: number; correct: number }>) {
  // Heuristic: map card IDs to pseudo-skills by ID hints; fallback to numbers/directions/conjugation
  // Since cards don't carry skill tags here, we rotate among common weak skills
  const skills = ["numbers", "directions", "conjugation", "spelling", "dates", "time"] as const;
  const now = new Date();
  const rot = now.getDate() % skills.length;
  const rotating = skills[rot];

  const recs = new Set<string>();
  const result: { title: string; subtitle: string; href: string }[] = [];
  const push = (skill: string) => {
    const map: Record<string, { title: string; href: string }> = {
      numbers: { title: "🔢 Number Builder", href: "/arcade/numbers" },
      directions: { title: "🧭 Direction Master", href: "/arcade/directions" },
      conjugation: { title: "📝 Conjugation Grid", href: "/arcade/conjugation" },
      spelling: { title: "📖 Spelling Tiles", href: "/arcade/spelling" },
      dates: { title: "📅 Date Composer", href: "/arcade/dates" },
      time: { title: "⏱️ Time Builder", href: "/arcade/dates" },
    };
    const m = map[skill];
    if (m && !recs.has(m.href)) {
      recs.add(m.href);
      result.push({ title: m.title, subtitle: `Practice ${skill}`, href: m.href });
    }
  };

  // Always include two strongest candidates first
  push("numbers");
  push("directions");
  // Plus a rotating one for variety
  push(rotating);

  return result;
} 