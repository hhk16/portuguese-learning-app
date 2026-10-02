/** Em Sintonia on the phone: pick or write one word that links the two — the same as your partner. */
import { useState } from "react";
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";
import { useCountdown } from "./useCountdown.ts";

type V = Extract<ControllerView, { mode: "sync" }>;

export function Sync({ v, send }: { v: V; send: Send }) {
  const [word, setWord] = useState("");
  const [sent, setSent] = useState(v.submitted);
  const left = useCountdown(v.msLeft ?? 0);

  if (v.sense) {
    return (
      <div className="p-col">
        <div className="p-callout">
          <b className="display">Faz sentido? 🤔</b>
          <span>
            You both wrote “{v.sense.word}”. Does it link {v.words[0].pt} and {v.words[1].pt}?
          </span>
        </div>
        <div className="p-grow" />
        {v.sense.voted ? (
          <div className="p-sub center">✓ À espera do teu par… · Waiting for your partner…</div>
        ) : (
          <div className="row2">
            <button className="btn mint" onClick={() => send({ mode: "sync", sense: true })}>
              <span className="bi">
                👍 Sim<small>Yes</small>
              </span>
            </button>
            <button className="btn white" onClick={() => send({ mode: "sync", sense: false })}>
              <span className="bi">
                👎 Não<small>No</small>
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }

  const submit = (w: string) => {
    if (!w.trim() || sent) return;
    setSent(true);
    play("lock");
    navigator.vibrate?.(15);
    send({ mode: "sync", word: w.trim() });
  };
  if (sent)
    return (
      <div className="p-center">
        <div className="p-bob">
          <Picture glyph="🔒" size="72px" />
        </div>
        <div className="p-big">“{v.mine ?? word}”</div>
        <div className="p-sub">Segredo guardado! O teu par ainda está a escrever… · Locked in — your partner is still writing, then the reveal</div>
        <div className="side-bet">
          <span className="p-label">Vão coincidir? · Will you match? (+1)</span>
          <div className="row2">
            <button className={`btn ${v.predicted === true ? "mint" : "white"}`} disabled={v.predicted !== undefined} onClick={() => send({ mode: "sync", predict: true })}>
              <span className="bi">
                🤞 Sim<small>Yes</small>
              </span>
            </button>
            <button className={`btn ${v.predicted === false ? "mint" : "white"}`} disabled={v.predicted !== undefined} onClick={() => send({ mode: "sync", predict: false })}>
              <span className="bi">
                🙃 Não<small>No</small>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  const typeOnly = v.bank.length === 0;
  const listIn = v.listInMs !== undefined ? Math.max(0, v.listInMs - (v.msLeft !== undefined ? (v.msLeft ?? 0) - left : 0)) : undefined;
  return (
    <div className="p-col">
      <div className="sync-head">
        <span className="kicker">
          Tentativa {v.attempt}/{v.tries ?? 3} · Try {v.attempt} of {v.tries ?? 3}{v.final ? " · ×2!" : ""}
        </span>
        {v.lives !== undefined && <span className="pill">{"❤️".repeat(v.lives)}</span>}
        {v.msLeft !== undefined && <span className={`pill ${left < 8000 ? "low" : ""}`}>⏱ {Math.ceil(left / 1000)}s</span>}
      </div>
      <div className="p-callout">
        <b className="display">Escreve UMA palavra que as ligue</b>
        <span>One word that links both — the same as your partner!</span>
      </div>
      <div className="sync-pair">
        {v.words.map((w, i) => (
          <div key={i} className="card sync-word">
            {w.pic && <Picture glyph={w.pic} size="56px" />}
            <b className="display">{w.pt}</b>
            {w.en && <small>{w.en}</small>}
          </div>
        ))}
      </div>
      {v.previous && (
        <div className="sync-prev">
          {v.previous.map((p) => (
            <span key={p.name} className="pill">
              {p.name}: “{p.word}”
            </span>
          ))}
          <small>Your last words are the new pair — meet in the middle!</small>
        </div>
      )}
      <form
        className="sync-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit(word);
        }}
      >
        <input value={word} onChange={(e) => setWord(e.target.value)} placeholder={typeOnly ? "Escreve em português… · Type in Portuguese" : "Escreve ou escolhe… · Type or pick"} autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={40} />
        <button className="btn player" type="submit" disabled={!word.trim()}>
          OK
        </button>
      </form>
      {listIn !== undefined && (
        <div className="p-sub sync-list-in">
          ✍️ Escreve primeiro! A lista chega em {Math.ceil(listIn / 1000)}s · Type first — the word list comes in {Math.ceil(listIn / 1000)}s
        </div>
      )}
      {!typeOnly && (
        <>
          <div className="kicker">Ou escolhe · Or pick</div>
          <div className="bank">
            {v.bank.map((w) => (
              <button
                key={w.pt}
                className={`bank-word card ${word === w.pt ? "sel" : ""}`}
                onClick={() => {
                  setWord(w.pt);
                  play("tap");
                }}
              >
                <Picture glyph={w.pic} size="28px" />
                {w.pt}
                {w.en && <small>{w.en}</small>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
