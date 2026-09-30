/** Em Sintonia on the phone: write one word that links the two. */
import { useState } from "react";
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";

type V = Extract<ControllerView, { mode: "sync" }>;

export function Sync({ v, send }: { v: V; send: Send }) {
  const [word, setWord] = useState("");
  const [sent, setSent] = useState(v.submitted);
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
        <div className="p-big">“{word}”</div>
        <div className="p-sub">Segredo guardado! À espera do teu par…</div>
      </div>
    );
  return (
    <div className="p-col">
      <div className="kicker center">Tentativa {v.attempt} de 3</div>
      <div className="sync-pair">
        {v.words.map((w, i) => (
          <div key={i} className="card sync-word">
            {w.pic && <Picture glyph={w.pic} size="56px" />}
            <b className="display">{w.pt}</b>
            {w.en && <small>{w.en}</small>}
          </div>
        ))}
      </div>
      <div className="p-callout soft">Uma palavra que ligue as duas. A mesma que o teu par vai pensar!</div>
      <form
        className="sync-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit(word);
        }}
      >
        <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Escreve em português…" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={40} />
        <button className="btn player" type="submit" disabled={!word.trim()}>
          OK
        </button>
      </form>
      <div className="kicker">Ou escolhe:</div>
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
          </button>
        ))}
      </div>
    </div>
  );
}
