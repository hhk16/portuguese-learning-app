import Link from "next/link";
import { modules } from "@/lib/content-integrated";
import dynamic from "next/dynamic";

const LessonProgressTag = dynamic(() => import("@/components/LessonProgressTag"), { ssr: false });
const ContinueLearning = dynamic(() => import("@/components/ContinueLearning"), { ssr: false });

export default function HomePage() {
  return (
    <div className="container-max grid gap-6">
      <div className="grid gap-4">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <p className="text-white/70">Your A1 European Portuguese learning progress</p>
        
        {/* Today's Plan Section */}
        <div className="card p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30">
          <div className="grid gap-4">
            <div>
              <h2 className="text-xl font-bold text-blue-400">📅 Today's Plan</h2>
              <p className="text-white/80 text-sm">Follow your personalized learning sequence</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl">📚</div>
                <div>
                  <div className="font-semibold text-sm">1. Learn</div>
                  <div className="text-xs text-white/70">Complete next A1 lesson</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl">🔄</div>
                <div>
                  <div className="font-semibold text-sm">2. Review</div>
                  <div className="text-xs text-white/70">Practice 10 weak items</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl">🎮</div>
                <div>
                  <div className="font-semibold text-sm">3. Play</div>
                  <div className="text-xs text-white/70">Skill-based mini-game</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Link href="/cefr/a1" className="btn btn-primary">
                Start Today's Learning
              </Link>
            </div>
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="card p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-400/30">
          <div className="grid gap-4">
            <div>
              <h2 className="text-xl font-bold text-emerald-400">Ready to continue?</h2>
              <p className="text-white/80 text-sm">Pick up where you left off in your A1 journey</p>
            </div>
            <ContinueLearning />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/cefr/a1" className="card p-4 hover-lift group">
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold">Learn (A1 Path)</div>
              <div className="text-sm text-white/70">Step-by-step A1 units with guides and bosses</div>
            </div>
          </Link>
          
          <Link href="/practice" className="card p-4 hover-lift group">
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold">Review (SRS)</div>
              <div className="text-sm text-white/70">Spaced repetition of what you've learned</div>
            </div>
          </Link>
          
          <Link href="/arcade" className="card p-4 hover-lift group">
            <div className="text-center">
              <div className="text-2xl mb-2">🎮</div>
              <div className="font-semibold">Play (Skills)</div>
              <div className="text-sm text-white/70">Mini-games to master specific skills</div>
            </div>
          </Link>

          <Link href="/map" className="card p-4 hover-lift group">
            <div className="text-center">
              <div className="text-2xl mb-2">🗺️</div>
              <div className="font-semibold">Explore</div>
              <div className="text-sm text-white/70">Visual map of your progress</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Modules (Optional) */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Modules</h2>
          <Link href="/levels" className="text-sm text-emerald-400 hover:text-emerald-300">
            View all →
          </Link>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {modules.slice(0, 4).map((m) => (
            <section key={m.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold">{m.title}</h3>
                  <p className="text-white/70 text-sm">{m.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {m.lessons.slice(0, 2).map((l) => (
                  <Link prefetch href={`/learn/${l.id}`} key={l.id} className="rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 text-sm">
                    <div className="font-medium">{l.title}</div>
                    <LessonProgressTag lessonId={l.id} xp={l.xp} />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
} 