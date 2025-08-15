"use client";
import { useAppStore } from "@/lib/store";

export default function EnglishHintsToggle() {
  const showEnglishHints = useAppStore(s => s.showEnglishHints);
  const toggle = useAppStore(s => s.toggleEnglishHints);
  return (
    <button onClick={toggle} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs hover:bg-white/10">
      {showEnglishHints ? "EN Hints: ON" : "EN Hints: OFF"}
    </button>
  );
} 