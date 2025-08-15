"use client";
import { useAppStore } from "@/lib/store";

export default function LessonProgressTag({ lessonId, xp }: { lessonId: string; xp: number }) {
  const { lessonProgress } = useAppStore();
  const done = !!lessonProgress[lessonId]?.completed;
  return <div className="text-xs text-white/70">XP {xp} {done ? "• Completed" : ""}</div>;
} 