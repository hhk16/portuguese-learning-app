/** Pares Secretos on the phone: pick a clue word + number while giving clues; tap cards while guessing. */
import { useState } from "react";
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";
import { useCountdown } from "./useCountdown.ts";

type V = Extract<ControllerView, { mode: "secret" }>;

export function Secret({ v, send }: { v: V; send: Send }) {
  const [word, setWord] = useState<string | null>(null);
  const [showBoard, setShowBoard] = useState(false);
  const left = useCountdown(v.msLeft ?? 0);
  const act = (a: Extract<Parameters<Send>[0], { mode: "secret" }>["action"]) => {
    navigator.vibrate?.(12);
    send({ mode: "secret", action: a });
  };
  const mine = v.cards.filter((c) => c.key === "target" && c.state === "hidden").length;
  const head = (
    <div className="secret-head">
      <span className="pill">
        {v.found}/{v.goal} · found
      </span>
      <span className="pill">
        Turno {v.turnsUsed + 1}/{v.turns}
      </span>
      <span className="pill">{"❤️".repeat(Math.max(0, v.lives))}</span>
      {v.msLeft !== undefined && v.role === "clue" && <span className={`pill ${left < 10_000 ? "low" : ""}`}>⏱ {Math.ceil(left / 1000)}</span>}
    </div>
  );
  const board = (
    <div className="secret-grid">
      {v.cards.map((c) => (
        <button
          key={c.id}
          className={`scard card s-${c.state} ${c.key && (v.role === "clue" || v.sudden || showBoard) ? `k-${c.key}` : ""}`}
          disabled={v.role !== "guess" || c.state !== "hidden"}
          onClick={() => {
            play("tap");
            act({ a: "tap", cardId: c.id });
          }}
        >
          <Picture glyph={c.word.pic} size="40px" />
          <span className="w">{c.word.pt}</span>
          {c.word.en && <span className="e">{c.word.en}</span>}
        </button>
      ))}
    </div>
  );

  if (v.role === "clue") {
    const words = v.clueWords ?? [];
    return (
      <div className="p-col">
        {head}
        <div className="p-callout">
          <b className="display">Dá uma pista a {v.partner}!</b>
          <span>
            Choose ONE clue word that fits your <i className="dot-target" /> pictures ({mine} left) — avoid the <i className="dot-bomb" /> bombs. The TV will say it.
          </span>
        </div>
        <button className="btn white block" onClick={() => setShowBoard(!showBoard)}>
          {showBoard ? "Esconder o tabuleiro · Hide board" : "Ver o meu tabuleiro · Show my board"}
        </button>
        {showBoard && board}
        <div className="kicker">1. Pista · Clue word</div>
        <div className="clue-words">
          {words.map((w) => (
            <button
              key={w.pt}
              className={`bank-word card ${word === w.pt ? "sel" : ""}`}
              onClick={() => {
                setWord(w.pt);
                play("tap");
              }}
            >
              <Picture glyph={w.pic} size="26px" />
              {w.pt}
              <small>{w.en}</small>
            </button>
          ))}
        </div>
        <div className="kicker">2. Quantas imagens? · How many pictures?</div>
        <div className="row3">
          {[1, 2, 3].map((n) => (
            <button key={n} className="btn player" disabled={!word || n > Math.max(1, mine)} onClick={() => word && act({ a: "clue", count: n, word })}>
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="p-col">
      {head}
      {v.sudden && (
        <div className="p-callout clue-callout sudden">
          <b className="display">💓 Morte súbita!</b>
          <span>Sudden death: no clues. Tap {v.partner}'s pictures — one wrong card and it's over. Your own key is shown.</span>
        </div>
      )}
      {v.role === "guess" && v.clue && (
        <div className="p-callout clue-callout">
          <span className="kicker">Pista · Clue</span>
          <b className="display">
            {v.clue.word?.pic && <Picture glyph={v.clue.word.pic} size="30px" />} {v.clue.word?.pt} · {v.clue.count}
          </b>
          <span>
            Toca nas imagens! Tap up to {v.guessesLeft} {v.guessesLeft === 1 ? "picture" : "pictures"} that match “{v.clue.word?.pt}”.
          </span>
        </div>
      )}
      {v.role === "watch" && (
        <div className="p-callout soft">
          {v.clue ? `${v.partner} está a adivinhar… · ${v.partner} is guessing` : `${v.partner} está a escolher uma pista… · ${v.partner} is choosing a clue`}
        </div>
      )}
      {v.role === "watch" && v.clue && (
        <div className="side-bet">
          <span className="kicker">Aposta · Bet: how many will {v.partner} find? (+5 if exact)</span>
          <div className="row3">
            {Array.from({ length: Math.min(4, v.clue.count + 2) }, (_, n) => (
              <button key={n} className={`btn ${v.bet === n ? "mint" : "white"}`} disabled={v.bet !== undefined} onClick={() => act({ a: "bet", n })}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
      {board}
      <div className="p-grow" />
      {v.role === "guess" && !v.sudden && (
        <button className="btn block white" onClick={() => act({ a: "stop" })}>
          <span className="bi">
            Parar e passar a vez<small>Stop and pass the turn</small>
          </span>
        </button>
      )}
    </div>
  );
}
