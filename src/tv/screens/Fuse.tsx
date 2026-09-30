/** Burning-fuse timer. Animated with rAF + a CSS variable (no React re-render per frame). */
import { useEffect, useRef } from "react";

export function Fuse({ start, end }: { start: number; end: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = Math.max(0, Math.min(1, (end - performance.now()) / Math.max(1, end - start)));
      if (ref.current) {
        ref.current.style.setProperty("--p", String(p));
        ref.current.classList.toggle("hot", p < 0.3);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [start, end]);
  return (
    <div className="fuse" ref={ref}>
      <div className="fuse-fill" />
      <div className="fuse-spark">✨</div>
    </div>
  );
}

/** Render "Nós ___ portugueses." with a highlighted gap (or the filled answer). */
export function Headline({ text, fill }: { text: string; fill?: string }) {
  const parts = text.split("___");
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts[0]}
      <span className="gap">{fill ?? " "}</span>
      {parts.slice(1).join("___")}
    </>
  );
}
