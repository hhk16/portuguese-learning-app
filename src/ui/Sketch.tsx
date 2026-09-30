/** Draws Desenha! strokes (0..1000 square coordinates) onto a canvas. Shared by TV and phone. */
import { INK, type Stroke } from "../games/draw/ink.ts";

export function paintStrokes(ctx: CanvasRenderingContext2D, size: number, strokes: Iterable<Stroke>) {
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  const k = size / 1000;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of strokes) {
    const pts = s.segs.flatMap((seg) => seg ?? []);
    if (pts.length < 2) continue;
    ctx.strokeStyle = INK[s.c] ?? INK[0]!;
    ctx.lineWidth = s.w * 7 * k;
    ctx.beginPath();
    ctx.moveTo(pts[0]! * k, pts[1]! * k);
    if (pts.length === 2) ctx.lineTo(pts[0]! * k + 0.1, pts[1]! * k);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i]! * k, pts[i + 1]! * k);
    ctx.stroke();
  }
}
