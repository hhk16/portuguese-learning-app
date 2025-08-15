import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import EnglishHintsToggle from "@/components/EnglishHintsToggle";

const StatusBar = dynamic(() => import("@/components/StatusBar"), { ssr: false });
const RoutePreloader = dynamic(() => import("@/components/RoutePreloader"), { ssr: false });

export const metadata: Metadata = {
  title: "A1 Portugal Portuguese • Interactive Course",
  description: "Perfect A1 Portugal Portuguese course for English speakers. Learn with flashcards, quizzes, audio, and spaced repetition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen grid grid-cols-[300px_1fr]">
          <aside className="sticky top-0 h-screen overflow-y-auto border-r border-white/10 bg-[color:var(--card)] z-40 relative">
            <div className="p-4 space-y-4">
              <Link prefetch href="/" className="flex items-center gap-2 font-extrabold text-lg">
                <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-r from-[var(--brand)] via-[var(--brand-2)] to-[var(--accent)] shadow-[0_0_16px_rgba(65,90,255,0.7)]" />
                <span>PT A1 Course</span>
              </Link>
              <nav className="space-y-1 text-sm">
                <Link className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors" href="/" prefetch={true}>
                  🏠 Home
                </Link>
                <Link className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 px-3 py-2 text-sm hover:from-emerald-500/30 hover:to-blue-500/30 transition-all font-semibold" href="/cefr/a1" prefetch={true}>
                  📚 Learn (A1 Path)
                </Link>
                <Link className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors" href="/practice" prefetch={true}>
                  🔄 Review (SRS)
                </Link>
                <Link className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors" href="/arcade" prefetch={true}>
                  🎮 Play (Skills)
                </Link>
                <Link className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors" href="/map" prefetch={true}>
                  🗺️ Explore
                </Link>
                <Link className="flex items-center gap-2 rounded-xl border border-orange-400/30 bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-3 py-2 text-sm hover:from-orange-500/30 hover:to-amber-500/30 transition-all font-semibold" href="/physical-classes" prefetch={true}>
                 📝 Physical Classes
                </Link>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <Link prefetch href="/levels" className="block rounded-lg px-3 py-2 hover:bg-white/5 text-xs text-white/60">🧭 Quick Continue</Link>
                  <Link prefetch href="/stats" className="block rounded-lg px-3 py-2 hover:bg-white/5 text-xs text-white/60">📊 Stats</Link>
                  <Link prefetch href="/shop" className="block rounded-lg px-3 py-2 hover:bg-white/5 text-xs text-white/60">🛒 Shop</Link>
                  <Link prefetch href="/avatar" className="block rounded-lg px-3 py-2 hover:bg-white/5 text-xs text-white/60">👤 Avatar</Link>
                  <Link prefetch href="/ai-settings" className="block rounded-lg px-3 py-2 hover:bg-white/5 text-xs text-white/60">🤖 AI Settings</Link>
                </div>
              </nav>
              <div className="mt-6 p-3 rounded-xl bg-white/5">
                <p className="text-xs text-white/70">Daily goal</p>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-[var(--brand)]" style={{ width: "var(--daily-progress, 0%)" }} />
                </div>
                <div className="mt-3"><StatusBar /></div>
              </div>
            </div>
          </aside>
          <main className="min-h-screen">
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div className="font-bold">A1 Portugal Portuguese</div>
              <div className="flex items-center gap-2">
                {/* English hints toggle */}
                <EnglishHintsToggle />
                <Link prefetch href="/practice" className="btn btn-secondary">Quick Practice</Link>
                <Link prefetch href="/guide" className="btn btn-primary">Course Guide</Link>
              </div>
            </header>
            <div className="p-5">{children}</div>
          </main>
        </div>
        <RoutePreloader />
      </body>
    </html>
  );
} 