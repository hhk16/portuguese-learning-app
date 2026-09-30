/** Desenha! on the phone: a sketch pad with the secret word, or the six words to guess from. */
import { useEffect, useRef, useState } from "react";
import type { ControllerView } from "../shared/protocol.ts";
import { INK } from "../games/draw/ink.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";
import { useCountdown } from "./useCountdown.ts";

type V = Extract<ControllerView, { mode: "draw" }>;
const TURN_MS = 60_000;

export function Draw({ v, send }: { v: V; send: Send }) {
  const left = useCountdown(v.msLeft);
  const timer = (
    <div className="p-timer">
      <div style={{ width: `${(left / TURN_MS) * 100}%` }} className={left < 10_000 ? "low" : ""} />
    </div>
  );
  if (v.role === "guess") {
    const tried = new Set(v.tried ?? []);
    return (
      <div className="p-col">
        {timer}
        <div className="p-callout">
          <b className="display">O que é que {v.partner} está a desenhar?</b>
          <span>Olha para a TV e toca na palavra certa.</span>
        </div>
        <div className="draw-options">
          {(v.options ?? []).map((o) => (
            <button
              key={o.id}
              className={`lopt card ${tried.has(o.id) ? "tried" : ""}`}
              disabled={tried.has(o.id)}
              onClick={() => {
                play("lock");
                navigator.vibrate?.(15);
                send({ mode: "draw", action: { a: "guess", id: o.id } });
              }}
            >
              <span>{o.label}</span>
              {tried.has(o.id) && <i>✗</i>}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return <Pad v={v} send={send} timer={timer} />;
}

function Pad({ v, send, timer }: { v: V; send: Send; timer: React.ReactNode }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(0);
  const stroke = useRef<{ id: number; seg: number; buf: number[]; last: number[] | null; c: number; w: number } | null>(null);
  const nextId = useRef(0);
  const flushTimer = useRef<number | null>(null);

  const ctx = () => canvas.current?.getContext("2d") ?? null;
  const reset = () => {
    const c = canvas.current;
    const g = ctx();
    if (c && g) {
      g.fillStyle = "#fff";
      g.fillRect(0, 0, c.width, c.height);
    }
  };
  useEffect(reset, []);

  const flush = () => {
    const s = stroke.current;
    if (!s || s.buf.length < 2) return;
    // Each piece starts where the last one ended, so pieces join up on the TV.
    const pts = s.last ? [...s.last, ...s.buf] : s.buf;
    send({ mode: "draw", action: { a: "stroke", s: s.id, seg: s.seg, c: s.c, w: s.w, pts } });
    s.last = s.buf.slice(-2);
    s.buf = [];
    s.seg++;
  };

  const point = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return [Math.round(Math.max(0, Math.min(1000, ((e.clientX - r.left) / r.width) * 1000))), Math.round(Math.max(0, Math.min(1000, ((e.clientY - r.top) / r.height) * 1000)))] as const;
  };
  const drawTo = (x: number, y: number) => {
    const c = canvas.current;
    const g = ctx();
    const s = stroke.current;
    if (!c || !g || !s) return;
    const k = c.width / 1000;
    const prev = s.buf.length >= 2 ? s.buf.slice(-2) : s.last;
    g.strokeStyle = INK[s.c]!;
    g.lineWidth = s.w * 7 * k;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo((prev?.[0] ?? x) * k, (prev?.[1] ?? y) * k);
    g.lineTo(x * k + (prev ? 0 : 0.1), y * k);
    g.stroke();
  };

  return (
    <div className="p-col draw-pad">
      {timer}
      <div className="draw-word card">
        <Picture glyph={v.word?.pic} size="48px" />
        <span>
          <small className="kicker">Desenha (sem falar!)</small>
          <b className="display">{v.word?.pt}</b>
          {v.word?.en && <i>{v.word.en}</i>}
        </span>
      </div>
      <canvas
        ref={canvas}
        width={720}
        height={720}
        className="pad-canvas"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          const [x, y] = point(e);
          stroke.current = { id: nextId.current++, seg: 0, buf: [x, y], last: null, c: color, w: color === 5 ? 4 : 2 };
          drawTo(x, y);
          flushTimer.current = window.setInterval(flush, 80);
        }}
        onPointerMove={(e) => {
          if (!stroke.current || !e.buttons) return;
          const [x, y] = point(e);
          const b = stroke.current.buf;
          if (b.length >= 2 && Math.abs(b[b.length - 2]! - x) + Math.abs(b[b.length - 1]! - y) < 4) return;
          drawTo(x, y);
          b.push(x, y);
        }}
        onPointerUp={() => {
          flush();
          if (flushTimer.current) clearInterval(flushTimer.current);
          stroke.current = null;
        }}
        onPointerCancel={() => {
          flush();
          if (flushTimer.current) clearInterval(flushTimer.current);
          stroke.current = null;
        }}
      />
      <div className="palette">
        {INK.map((c, i) => (
          <button key={c} className={`ink ${i === color ? "sel" : ""} ${i === 5 ? "eraser" : ""}`} style={{ background: c }} aria-label={i === 5 ? "Borracha" : `Cor ${i + 1}`} onClick={() => setColor(i)}>
            {i === 5 ? "🧽" : ""}
          </button>
        ))}
      </div>
      <div className="row2">
        <button
          className="btn white"
          onClick={() => {
            reset();
            send({ mode: "draw", action: { a: "clear" } });
          }}
        >
          Apagar tudo
        </button>
        <button className="btn sun" disabled={!v.canPass} onClick={() => send({ mode: "draw", action: { a: "pass" } })}>
          Outra palavra
        </button>
      </div>
    </div>
  );
}
