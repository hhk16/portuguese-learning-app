import Link from "next/link";
import { modules } from "@/lib/content-integrated";
import dynamic from "next/dynamic";

const ModuleProgress = dynamic(() => import("@/components/ModuleProgress"), { ssr: false });

export default function MapPage() {
  return (
    <div className="container-max grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold text-gradient">🗺️ Explore</h1>
        <div className="text-white/70 text-sm">Visual map of your progress</div>
        <div className="text-white/60 text-xs">Browse completed modules and discover new content</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {modules.map((mod) => (
          <section key={mod.id} className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--brand)]/15 via-[var(--brand-2)]/15 to-[var(--accent)]/15 p-5">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,.25) 0, transparent 60%), radial-gradient(circle at 70% 70%, rgba(255,255,255,.25) 0, transparent 60%)" }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{mod.title}</h2>
                  <p className="text-white/70 text-xs">{mod.description}</p>
                </div>
                <ModuleProgress lessonIds={mod.lessons.map(l => l.id)} />
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {mod.lessons.map((l, idx) => (
                  <Link prefetch key={l.id} href={`/learn/${l.id}`} className="block rounded-full bg-white/20 backdrop-blur px-4 py-2 text-sm hover:bg-white/30">
                    {idx === 0 ? "🌴" : idx === 1 ? "🏝️" : "🐚"} {l.title}
                  </Link>
                ))}
                <Link prefetch href={`/module/${mod.id}/boss`} className="block rounded-full border border-yellow-400/40 bg-yellow-400/20 px-4 py-2 text-sm hover:bg-yellow-400/30">
                  👑 Boss
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
} 