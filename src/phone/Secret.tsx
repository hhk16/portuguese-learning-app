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
  const [typed, setTyped] = useState("");
  const listLeft = useCountdown(v.listInMs ?? 0);
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
        {v.turnsUsed >= v.turns ? "Morte súbita!" : `Turno ${v.turnsUsed + 1}/${v.turns}`}
      </span>
      <span className="pill">{v.lives > 0 ? "❤️".repeat(v.lives) : "💔 0"}</span>
      {v.msLeft !== undefined && v.role === "clue" && <span className={`pill ${left < 10_000 ? "low" : ""}`}>⏱ {Math.ceil(left / 1000)}</span>}
    </div>
  );
  const board = (
    <div className={`secret-grid ${v.cards.length > 12 ? "cols4" : ""}`}>
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
    // The key, always on screen: the pictures your partner must find, and the ones to avoid.
    const keyOf = (k: "target" | "bomb") => v.cards.filter((c) => c.key === k && c.state === "hidden");
    const chip = (c: V["cards"][number]) => (
      <span key={c.id} className={`key-chip k-${c.key}`}>
        <Picture glyph={c.word.pic} size="28px" />
        <span>
          <b>{c.word.pt}</b>
          {c.word.en && <small>{c.word.en}</small>}
        </span>
      </span>
    );
    return (
      <div className="p-col">
        {head}
        <div className="p-callout">
          <b className="display">Dá uma pista a {v.partner}!</b>
          <span>
            Pick 1 word for your <i className="dot-target" /> pictures. Avoid <i className="dot-bomb" />.
          </span>
        </div>
        <div className="secret-key card">
          <div className="key-label">
            <i className="dot-target" /> Para {v.partner} encontrar · {mine} to find
          </div>
          <div className="key-chips">{keyOf("target").map(chip)}</div>
          <div className="key-label">
            <i className="dot-bomb" /> Evita · Avoid
          </div>
          <div className="key-chips">{keyOf("bomb").map(chip)}</div>
        </div>
        <button className="btn white block mini" onClick={() => setShowBoard(!showBoard)}>
          {showBoard ? "Esconder o tabuleiro · Hide the board" : "Ver o tabuleiro todo · Show the whole board"}
        </button>
        {showBoard && board}
        {v.typeClue && (
          <>
            <div className="kicker">1. Escreve a pista · Write a clue</div>
            <input
              className="clue-input"
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value);
                setWord(null);
              }}
              placeholder="frio, fruta, grande…"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={30}
            />
            {v.clueError && <div className="p-warn">“{v.clueError}”? Pipo não conhece essa pista — tenta outra. · Not a clue we know — try another.</div>}
            {listLeft > 0 ? <div className="p-sub">🆘 A lista abre em {Math.ceil(listLeft / 1000)} s · The clue list opens as a lifeline</div> : <div className="kicker">🆘 Ou escolhe da lista · Or pick from the list</div>}
          </>
        )}
        {!v.typeClue && <div className="kicker">1. Escolhe a pista · Pick a clue</div>}
        <div className="clue-words" style={v.typeClue && listLeft > 0 ? { display: "none" } : undefined}>
          {words.map((w) => (
            <button
              key={w.pt}
              className={`bank-word card ${word === w.pt ? "sel" : ""}`}
              onClick={() => {
                setWord(w.pt);
                setTyped("");
                play("tap");
              }}
            >
              <Picture glyph={w.pic} size="26px" />
              {w.pt}
              <small>{w.en}</small>
            </button>
          ))}
        </div>
        <div className="kicker">2. Quantas imagens? · How many?</div>
        <div className="row3">
          {[1, 2, 3].map((n) => (
            <button key={n} className="btn player" disabled={(!word && !typed.trim()) || n > Math.max(1, mine)} onClick={() => (word ? act({ a: "clue", count: n, word }) : typed.trim() && act({ a: "clue", count: n, word: typed.trim(), typed: true }))}>
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
          <span>No clues: tap {v.partner}'s pictures. One wrong card ends it.</span>
        </div>
      )}
      {v.role === "guess" && v.clue && (
        <div className="p-callout">
          <b className="display">Toca nas imagens!</b>
          <span className="clue-chip">
            {v.clue.word?.pic && <Picture glyph={v.clue.word.pic} size="30px" />}
            <b className="display">{v.clue.word?.pt}</b>
            <span className="clue-n">× {v.clue.count}</span>
          </span>
          <span>
            Tap up to {v.guessesLeft} {v.guessesLeft === 1 ? "picture" : "pictures"} for “{v.clue.word?.pt}”.
          </span>
        </div>
      )}
      {v.role === "watch" && (
        <div className="p-status">
          <b>{v.clue ? `${v.partner} está a adivinhar…` : `${v.partner} está a escolher uma pista…`}</b>
          <span>{v.clue ? `${v.partner} is guessing — next, ${v.partner} gives you a clue` : `${v.partner} is picking a clue — then you guess`}</span>
        </div>
      )}
      {v.role === "watch" && v.clue && (
        <div className="side-bet">
          <span className="p-label">Aposta: quantas vai encontrar? · Bet: how many? (+5)</span>
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
