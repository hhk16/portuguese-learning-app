/** Desenha! on the TV: the live drawing, who draws and who guesses, the timer and the reveal. */
import { useEffect, useRef } from "react";
import { ROUNDS, TURN_MS, type Desenha } from "../../games/draw/draw.ts";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { paintStrokes } from "../../ui/Sketch.tsx";
import { GameTop } from "./Menus.tsx";
import { useTick } from "./useTick.ts";

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

export function DrawScreen({ a }: { a: Desenha }) {
  useTick(250, a.phase === "draw");
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
        <span className="pill">
          Desenho {Math.min(a.round + 1, ROUNDS)}/{ROUNDS}
        </span>
        {a.final && <span className="pill double-pill">×2</span>}
        {a.reviewFor && a.phase === "draw" && <span className="pill review-pill">🔁 Revisão para {a.reviewFor} · Review word</span>}
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
              <div style={{ width: `${(left / TURN_MS) * 100}%` }} className={left < 10_000 ? "low" : ""} />
            </div>
          )}
          {a.phase === "reveal" && (
            <div className={`draw-reveal ${a.lastGuessed ? "ok" : ""}`}>
              <Picture glyph={a.word.emoji} size="5em" />
              <b className="display">{a.word.pt}</b>
              <i>{a.word.en}</i>
              <span className="display pts">{a.lastGuessed ? `+${a.lastPoints}` : "Ninguém adivinhou…"}</span>
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
