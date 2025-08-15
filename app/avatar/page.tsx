"use client";
import { useAppStore } from "@/lib/store";

const COLORS = ["#00a884", "#415aff", "#b16cff", "#f59e0b", "#ef4444"];

export default function AvatarPage() {
  const { avatar, setAvatarColor, setAvatarHat, inventory } = useAppStore();
  const hats = inventory.filter((i) => i.startsWith("hat-"));
  return (
    <div className="container-max grid gap-4">
      <h1 className="text-xl font-bold">Avatar</h1>
      <div className="card p-6 grid gap-4">
        <div className="relative mx-auto h-32 w-32 rounded-full" style={{ background: avatar.color }}>
          <div className="absolute inset-0 grid place-items-center text-4xl">🙂</div>
          {avatar.hat === "hat-crown" && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl">👑</div>
          )}
          {avatar.hat === "hat-cap" && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-3xl">🧢</div>
          )}
        </div>
        <div className="grid gap-2">
          <div className="text-sm text-white/70">Color</div>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button key={c} className="h-8 w-8 rounded-full border border-white/20" style={{ background: c }} onClick={() => setAvatarColor(c)} />
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm text-white/70">Hats</div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-secondary" onClick={() => setAvatarHat(null)}>None</button>
            {hats.map((h) => (
              <button key={h} className="btn btn-primary" onClick={() => setAvatarHat(h)}>{h.replace("hat-", "")}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 