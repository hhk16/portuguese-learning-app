"use client";
import { useAppStore } from "@/lib/store";

export default function StatusBar() {
  const { xp, streak, coins } = useAppStore();
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="rounded-lg bg-white/5 px-3 py-1">XP <strong>{xp}</strong></div>
      <div className="rounded-lg bg-white/5 px-3 py-1">🔥 <strong>{streak}</strong></div>
      <div className="rounded-lg bg-yellow-500/20 border border-yellow-400/40 px-3 py-1 text-yellow-200">🪙 <strong>{coins}</strong></div>
    </div>
  );
} 