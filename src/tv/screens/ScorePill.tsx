/** The team score and its co-op target in ONE header pill: "7 pontos" with the ★★★ bar beside it. */
import { MetaBar } from "./Menus.tsx";

export function ScorePill({ score, max, meta = true }: { score: number; max: number; meta?: boolean }) {
  return (
    <span className="pill star-pill score-meta">
      <b>{score} pontos</b>
      {meta && <MetaBar score={score} max={max} />}
    </span>
  );
}

/** "Mostrador 3/5" with the ×2 of a final round folded in (one pill instead of two). */
export function RoundPill({ label, double }: { label: string; double?: boolean }) {
  return (
    <span className="pill round-pill">
      {label}
      {double && <b className="x2">×2</b>}
    </span>
  );
}
