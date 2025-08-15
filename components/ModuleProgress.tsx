"use client";
import { useAppStore } from "@/lib/store";

export default function ModuleProgress({ lessonIds }: { lessonIds: string[] }) {
  const { lessonProgress } = useAppStore();
  const completed = lessonIds.filter((id) => lessonProgress[id]?.completed).length;
  return (
    <div className="rounded-lg bg-white/10 px-3 py-1 text-xs">{completed}/{lessonIds.length} lessons</div>
  );
} 