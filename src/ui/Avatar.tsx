/** Chunky arcade creature avatars (SVG, procedural). Shared by TV and phone. */
import type { Avatar as AvatarKind, PlayerColor } from "../shared/protocol.ts";

export const COLOR_HEX: Record<PlayerColor, string> = { cyan: "#2de2ff", pink: "#ff3fa4", yellow: "#ffd23f", lime: "#8dff4a" };
export const COLOR_DARK: Record<PlayerColor, string> = { cyan: "#0a6e85", pink: "#8a1455", yellow: "#8a6a00", lime: "#3f7d12" };
export const COLOR_NAME: Record<PlayerColor, string> = { cyan: "Ciano", pink: "Rosa", yellow: "Amarelo", lime: "Lima" };
export const AVATAR_NAME: Record<AvatarKind, string> = { blob: "Bolinha", bot: "Robô", cat: "Gato", ghost: "Fantasma", alien: "Alien", robo: "Visor" };

const STROKE = "#12052e";

export function Avatar({ kind, color, size = 64, mood = "happy" }: { kind: AvatarKind; color: PlayerColor; size?: number; mood?: "happy" | "sad" | "shock" }) {
  const c = COLOR_HEX[color];
  const d = COLOR_DARK[color];
  const eyes = (cx1: number, cx2: number, cy: number, r = 7) => (
    <g>
      <circle cx={cx1} cy={cy} r={r + 3} fill="#fff" stroke={STROKE} strokeWidth={3} />
      <circle cx={cx2} cy={cy} r={r + 3} fill="#fff" stroke={STROKE} strokeWidth={3} />
      <circle cx={cx1 + 1.5} cy={cy + (mood === "sad" ? 2 : 0)} r={mood === "shock" ? 2.5 : r * 0.55} fill={STROKE} />
      <circle cx={cx2 + 1.5} cy={cy + (mood === "sad" ? 2 : 0)} r={mood === "shock" ? 2.5 : r * 0.55} fill={STROKE} />
    </g>
  );
  const mouth =
    mood === "sad" ? <path d="M42 76 q8 -7 16 0" fill="none" stroke={STROKE} strokeWidth={4} strokeLinecap="round" /> : mood === "shock" ? <ellipse cx={50} cy={75} rx={5} ry={7} fill={STROKE} /> : <path d="M40 72 q10 10 20 0" fill="none" stroke={STROKE} strokeWidth={4} strokeLinecap="round" />;

  let body: React.ReactNode;
  switch (kind) {
    case "blob":
      body = (
        <>
          <path d="M14 70 C8 34 30 14 50 14 C72 14 92 34 86 70 C82 90 18 90 14 70Z" fill={c} stroke={STROKE} strokeWidth={4} />
          <ellipse cx={36} cy={32} rx={8} ry={5} fill="#fff" opacity={0.5} />
          {eyes(38, 62, 52)}
          {mouth}
        </>
      );
      break;
    case "bot":
      body = (
        <>
          <line x1={50} y1={16} x2={50} y2={6} stroke={STROKE} strokeWidth={4} />
          <circle cx={50} cy={6} r={5} fill="#ffd23f" stroke={STROKE} strokeWidth={3} />
          <rect x={16} y={18} width={68} height={66} rx={16} fill={c} stroke={STROKE} strokeWidth={4} />
          <rect x={24} y={36} width={52} height={30} rx={10} fill={d} stroke={STROKE} strokeWidth={3} />
          <circle cx={38} cy={50} r={6} fill="#fff" />
          <circle cx={62} cy={50} r={6} fill="#fff" />
          <rect x={40} y={72} width={20} height={5} rx={2} fill={STROKE} />
        </>
      );
      break;
    case "cat":
      body = (
        <>
          <path d="M20 40 L24 10 L42 26 Z" fill={c} stroke={STROKE} strokeWidth={4} strokeLinejoin="round" />
          <path d="M80 40 L76 10 L58 26 Z" fill={c} stroke={STROKE} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={50} cy={54} r={34} fill={c} stroke={STROKE} strokeWidth={4} />
          {eyes(38, 62, 50, 6)}
          <path d="M46 62 L54 62 L50 67 Z" fill={STROKE} />
          <path d="M26 64 h-12 M26 70 h-10 M74 64 h12 M74 70 h10" stroke={STROKE} strokeWidth={3} strokeLinecap="round" />
          {mouth}
        </>
      );
      break;
    case "ghost":
      body = (
        <>
          <path d="M18 88 V46 C18 24 32 12 50 12 C68 12 82 24 82 46 V88 L71 80 L60 88 L50 80 L40 88 L29 80 Z" fill={c} stroke={STROKE} strokeWidth={4} strokeLinejoin="round" />
          {eyes(38, 62, 44)}
          <ellipse cx={50} cy={64} rx={6} ry={8} fill={STROKE} />
        </>
      );
      break;
    case "alien":
      body = (
        <>
          <path d="M34 20 L28 6 M66 20 L72 6" stroke={STROKE} strokeWidth={4} strokeLinecap="round" />
          <circle cx={28} cy={6} r={4} fill={c} stroke={STROKE} strokeWidth={3} />
          <circle cx={72} cy={6} r={4} fill={c} stroke={STROKE} strokeWidth={3} />
          <ellipse cx={50} cy={50} rx={38} ry={36} fill={c} stroke={STROKE} strokeWidth={4} />
          <ellipse cx={36} cy={46} rx={11} ry={15} fill={STROKE} transform="rotate(-20 36 46)" />
          <ellipse cx={64} cy={46} rx={11} ry={15} fill={STROKE} transform="rotate(20 64 46)" />
          <circle cx={33} cy={40} r={3.5} fill="#fff" />
          <circle cx={61} cy={40} r={3.5} fill="#fff" />
          {mouth}
        </>
      );
      break;
    case "robo":
      body = (
        <>
          <rect x={12} y={30} width={10} height={24} rx={4} fill={d} stroke={STROKE} strokeWidth={3} />
          <rect x={78} y={30} width={10} height={24} rx={4} fill={d} stroke={STROKE} strokeWidth={3} />
          <path d="M20 84 V38 C20 20 34 12 50 12 C66 12 80 20 80 38 V84 Z" fill={c} stroke={STROKE} strokeWidth={4} strokeLinejoin="round" />
          <rect x={26} y={34} width={48} height={20} rx={10} fill={STROKE} />
          <rect x={32} y={40} width={36} height={8} rx={4} fill="#ff3fa4" opacity={0.9} />
          {mouth}
        </>
      );
      break;
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden style={{ overflow: "visible", display: "block" }}>
      <ellipse cx={50} cy={94} rx={30} ry={5} fill="#000" opacity={0.25} />
      {body}
    </svg>
  );
}
