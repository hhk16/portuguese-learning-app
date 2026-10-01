/** Desenha! on the TV: the live drawing, who draws and who guesses, the timer and the reveal. */
import { useEffect, useRef } from "react";
import { ROUNDS, type Desenha } from "../../games/draw/draw.ts";
import type { Stroke } from "../../games/draw/ink.ts";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { paintStrokes } from "../../ui/Sketch.tsx";
import { GameTop } from "./Menus.tsx";
import { useTick } from "./useTick.ts";
import { gameNow } from "../clock.ts";

function LiveCanvas({ a }: { a: Desenha }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    let seen = -1;
    const loop = () => {
      const c = ref.current;
      if (c && a.ink !== seen) {
        seen = a.ink;
        const size = c.width;
        const ctx = c.getContext("2d");
        if (ctx) paintStrokes(ctx, size, a.strokes.values());
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [a]);
  return <canvas ref={ref} width={900} height={900} className="draw-canvas" />;
}

/** A drawing replayed point by point over `ms` (the gallery's Telestrations moment). */
function ReplayCanvas({ strokes, ms, size = 900, className = "draw-canvas" }: { strokes: Stroke[]; ms: number; size?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const total = strokes.reduce((n, s) => n + s.segs.reduce((m, seg) => m + (seg?.length ?? 0), 0), 0) || 1;
    const t0 = performance.now();
    let raf = 0;
    const loop = () => {
      const f = Math.min(1, (performance.now() - t0) / ms);
      let budget = Math.ceil(total * f);
      const part: Stroke[] = [];
      for (const s of strokes) {
        if (budget <= 0) break;
        const pts = s.segs.flatMap((seg) => seg ?? []);
        const take = pts.slice(0, Math.max(2, budget - (budget % 2)));
        budget -= pts.length;
        part.push({ c: s.c, w: s.w, segs: [take] });
      }
      const ctx = ref.current?.getContext("2d");
      if (ctx) paintStrokes(ctx, size, part);
      if (f < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [strokes, ms, size]);
  return <canvas ref={ref} width={size} height={size} className={className} />;
}

/** End of the game: the gallery, the vote, the best drawing. */
function Gallery({ a }: { a: Desenha }) {
  useTick(200, a.phase === "gallery" || a.phase === "vote");
  const rt = a.rt;
  const nameOf = (id?: string) => (id ? rt.players.get(id) : undefined);
  if (a.phase === "gallery") {
    const i = a.galleryIndex;
    const g = a.gallery[i]!;
    const by = nameOf(g.drawer);
    return (
      <div className="tv-overlay game-screen centered gallery-screen">
        <GameTop title="Desenha!" pic="🎨">
          <span className="pill">🖼️ Galeria {i + 1}/{a.gallery.length}</span>
        </GameTop>
        <div className="gallery-big card" key={i}>
          <ReplayCanvas strokes={g.strokes} ms={1700} />
          <div className="gallery-caption">
            <Picture glyph={g.pic} size="2.4em" />
            <b className="display">{g.pt}</b>
            <i>{g.en}</i>
            {by && <PlayerChip p={by} size="1.8em" />}
            <span className={`tag ${g.guessed ? "good" : "bad"}`}>{g.guessed ? "✓" : "✗"}</span>
          </div>
        </div>
      </div>
    );
  }
  const best = a.phase === "best" ? a.gallery[a.bestIndex] : undefined;
  return (
    <div className="tv-overlay game-screen centered gallery-screen">
      <GameTop title="Desenha!" pic="🎨">
        {a.phase === "vote" && <span className={`pill clock ${a.msLeft < 5000 ? "low" : ""}`}>⏱ {Math.ceil(a.msLeft / 1000)}</span>}
      </GameTop>
      <div className="turn-banner card">
        <span className="bi-line">
          <b className="display">{best ? "⭐ Melhor desenho!" : "Qual é o melhor desenho?"}</b>
          <i>{best ? `Best drawing — by ${nameOf(best.drawer)?.name ?? ""}` : "Which drawing is the best? Vote on your phones!"}</i>
        </span>
        {a.phase === "vote" && <span className="pill">🗳️ {a.bestVotes.size}/{a.players.length}</span>}
      </div>
      {best ? (
        <div className="gallery-big best card">
          <ReplayCanvas strokes={best.strokes} ms={1200} />
          <div className="gallery-caption">
            <span className="best-star">⭐</span>
            <b className="display">{best.pt}</b>
            {nameOf(best.drawer) && <PlayerChip p={nameOf(best.drawer)!} size="2em" />}
            <span className="pill">{best.votes ?? 0} 🗳️</span>
          </div>
        </div>
      ) : (
        <div className="gallery-grid">
          {a.gallery.map((g, i) => (
            <figure key={i} className="gallery-item card">
              <ReplayCanvas strokes={g.strokes} ms={10} size={320} className="" />
              <figcaption>
                <b>{g.pt}</b> <small>{nameOf(g.drawer)?.name}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

export function DrawScreen({ a }: { a: Desenha }) {
  useTick(250, a.phase === "draw");
  if (a.phase === "gallery" || a.phase === "vote" || a.phase === "best") return <Gallery a={a} />;
  const drawer = a.drawer;
  const guesser = a.guesser;
  if (a.players.length < 2)
    return (
      <div className="tv-overlay game-screen centered">
        <GameTop title="Desenha!" pic="🎨" />
        <div className="card stage-card center">
          <h2 className="display">Este jogo precisa de duas pessoas</h2>
          <p>This game needs two players.</p>
        </div>
      </div>
    );
  const left = a.msLeft;
  const tried = a.options.filter((o) => a.tried.has(o.id));
  return (
    <div className="tv-overlay game-screen centered">
      <GameTop title="Desenha!" pic="🎨">
        {!a.inPractice && (
          <span className="pill">
            Desenho {Math.min(a.round + 1, ROUNDS)}/{ROUNDS}
          </span>
        )}
        {a.final && <span className="pill double-pill">×2</span>}
        {a.reviewFor && a.phase === "draw" && <span className="pill review-pill">🔁 Revisão para {a.reviewFor} · Review word</span>}
        {a.twist && a.phase === "draw" && <span className="pill twist-pill">⚡ {a.twist.pt} <i>{a.twist.en}</i></span>}
        <span className="pill star-pill">{a.score} pontos</span>
      </GameTop>
      <div className="turn-banner card">
        {drawer && <PlayerChip p={drawer} size="2em" />}
        <span className="bi-line">
          <b>desenha</b>
          <i>draws</i>
        </span>
        <span className="arrow">→</span>
        {guesser && <PlayerChip p={guesser} size="2em" />}
        <span className="bi-line">
          <b>escreve ou diz a palavra</b>
          <i>types or says the word</i>
        </span>
      </div>
      <div className="draw-stage">
        <div className="card draw-board">
          <LiveCanvas a={a} />
          {a.phase === "draw" && a.hint && <div className="draw-hint-tv display">{a.hint}</div>}
          {a.phase === "draw" && a.warmth && gameNow() - a.warmth.at < 2200 && (
            <div key={a.warmth.seq} className={`warm-bubble display ${a.warmth.hot ? "hot" : "cold"}`}>
              {a.warmth.hot ? "🔥 Quente!" : "❄️ Frio!"}
              <i>{a.warmth.hot ? "Warm — you're close!" : "Cold — not that!"}</i>
            </div>
          )}
          {a.phase === "draw" && (
            <div className="guess-bubbles">
              {a.wrongGuesses.map((g) => (
                <span key={g.seq} className="guess-bubble">
                  {g.text}? ✗
                </span>
              ))}
            </div>
          )}
          {a.phase === "draw" && (
            <div className="draw-timer">
              <div style={{ width: `${(left / a.turnMs) * 100}%` }} className={left < 10_000 ? "low" : ""} />
            </div>
          )}
          {a.phase === "reveal" && (
            <div className={`draw-reveal ${a.lastGuessed ? "ok" : ""}`}>
              <Picture glyph={a.word.emoji} size="5em" />
              <b className="display">{a.word.pt}</b>
              <i>{a.word.en}</i>
              <span className="display pts">{a.lastGuessed ? (a.inPractice ? "Boa! · Ensaio" : `+${a.lastPoints}`) : "Ninguém adivinhou…"}</span>
              {a.lastGuessed && a.lastHow !== "option" && <small>{a.lastTypo ? "Quase bem escrito! · Nearly spelled right" : a.lastHow === "said" ? "Disseste bem! · Said it!" : "Escreveste bem! · Spelled it!"}</small>}
              {!a.lastGuessed && <small>Nobody got it</small>}
            </div>
          )}
        </div>
        {tried.length > 0 && a.phase === "draw" && (
          <div className="draw-tried">
            <span className="kicker">Não é… · Not…</span>
            {tried.map((o) => (
              <span key={o.id} className="word-chip tried">
                <b>{o.label}</b>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
