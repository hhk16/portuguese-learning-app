"use client";
import type { CanDo } from "@/lib/cefr";

export default function CanDoBadge({ canDo }: { canDo: CanDo }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
      <span>✅</span>
      <span>{canDo.text}</span>
    </span>
  );
} 