/** The Na Mesma Onda dial (shared by TV and phone). */
import { useRef } from "react";

/** Semicircle dial: value 0..100 maps to angle 180°..0°. */
export function DialFace({ value, target, bands = true, widths = [4, 9, 14], onDrag }: { value: number; target?: number; bands?: boolean; widths?: [number, number, number]; onDrag?: (v: number) => void }) {
  const ref = useRef<SVGSVGElement>(null);
  const toXY = (v: number, r: number) => {
    const a = Math.PI * (1 - v / 100);
    return [100 + r * Math.cos(a), 100 - r * Math.sin(a)] as const;
  };
  const wedge = (from: number, to: number, r = 92) => {
    const [x0, y0] = toXY(Math.max(0, from), r);
    const [x1, y1] = toXY(Math.min(100, to), r);
    return `M100 100 L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`;
  };
  const drag = (e: React.PointerEvent) => {
    if (!onDrag || !ref.current) return;
    const b = ref.current.getBoundingClientRect();
    const x = ((e.clientX - b.left) / b.width) * 200 - 100;
    const y = 100 - ((e.clientY - b.top) / b.height) * 110;
    const a = Math.atan2(Math.max(0, y), x);
    onDrag(Math.round(Math.max(0, Math.min(100, 100 * (1 - a / Math.PI)))));
  };
  const [nx, ny] = toXY(value, 80);
  return (
    <svg
      ref={ref}
      className={`dial ${onDrag ? "live" : ""}`}
      viewBox="0 0 200 110"
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        drag(e);
      }}
      onPointerMove={(e) => e.buttons && drag(e)}
    >
      <path d={wedge(0, 100, 96)} fill="#fff" />
      <path d={wedge(0, 100, 96)} fill="url(#dialgrad)" opacity="0.35" />
      <defs>
        <linearGradient id="dialgrad" x1="0" x2="1">
          <stop offset="0" stopColor="#4ba3f5" />
          <stop offset="1" stopColor="#ff6b6b" />
        </linearGradient>
      </defs>
      {target !== undefined && bands && (
        <g>
          <path d={wedge(target - widths[2], target + widths[2])} fill="#ffc23d" />
          <path d={wedge(target - widths[1], target + widths[1])} fill="#ff9f43" />
          <path d={wedge(target - widths[0], target + widths[0])} fill="#3ecf95" />
          <text x={toXY(target, 70)[0]} y={toXY(target, 70)[1] + 3} textAnchor="middle" className="dial-pts">
            4
          </text>
        </g>
      )}
      <line x1="100" y1="100" x2={nx} y2={ny} stroke="#1f2a44" strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="9" fill="#1f2a44" />
      {onDrag && <circle cx={nx} cy={ny} r="9" fill="var(--pc, #ff6b6b)" stroke="#fff" strokeWidth="3" />}
    </svg>
  );
}

