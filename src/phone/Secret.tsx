/** Pares Secretos on the phone: your secret key while giving clues; the board to tap while guessing. */
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";

type V = Extract<ControllerView, { mode: "secret" }>;

export function Secret({ v, send }: { v: V; send: Send }) {
  const act = (a: Extract<Parameters<Send>[0], { mode: "secret" }>["action"]) => {
    navigator.vibrate?.(12);
    send({ mode: "secret", action: a });
  };
  const mine = v.cards.filter((c) => c.key === "target" && c.state === "hidden").length;
  return (
    <div className="p-col">
      <div className="secret-head">
        <span className="pill">
          {v.found}/{v.goal} encontrados
        </span>
        <span className="pill">{v.turnsLeft} jogadas</span>
      </div>
      {v.role === "clue" && (
        <div className="p-callout">
          <b className="display">Dá uma pista a {v.partner}!</b>
          <span>
            Diz palavras em português para as imagens com <i className="dot-target" /> ({mine}). Evita as <i className="dot-bomb" /> bombas.
          </span>
        </div>
      )}
      {v.role === "guess" && (
        <div className="p-callout">
          <b className="display">Ouve a pista e toca!</b>
          <span>
            Pista para {v.clue?.count} {v.clue?.count === 1 ? "imagem" : "imagens"} · ainda podes tocar {v.guessesLeft}
          </span>
        </div>
      )}
      {v.role === "watch" && <div className="p-callout soft">{v.clue ? `${v.partner} está a adivinhar…` : `${v.partner} está a pensar numa pista…`}</div>}
      <div className="secret-grid">
        {v.cards.map((c) => (
          <button
            key={c.id}
            className={`scard card s-${c.state} ${c.key ? `k-${c.key}` : ""}`}
            disabled={v.role !== "guess" || c.state !== "hidden"}
            onClick={() => {
              play("tap");
              act({ a: "tap", cardId: c.id });
            }}
          >
            <Picture glyph={c.word.pic} size="44px" />
            <span className="w">{c.word.pt}</span>
            {c.word.en && <span className="e">{c.word.en}</span>}
          </button>
        ))}
      </div>
      <div className="p-grow" />
      {v.role === "clue" && (
        <div className="clue-count">
          <span className="kicker">Quantas imagens?</span>
          <div className="row3">
            {[1, 2, 3].map((n) => (
              <button key={n} className="btn player" disabled={n > Math.max(1, mine)} onClick={() => act({ a: "clue", count: n })}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
      {v.role === "guess" && (
        <button className="btn block white" onClick={() => act({ a: "stop" })}>
          Parar e passar a vez
        </button>
      )}
    </div>
  );
}
