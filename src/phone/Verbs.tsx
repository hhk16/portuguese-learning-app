/** Quem faz o quê? on the phone: pick a card, write its verb, then read your partner's verb (who? what?). */
import { useState } from "react";
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";
import { useCountdown } from "./useCountdown.ts";

type V = Extract<ControllerView, { mode: "verbs" }>;

const ENDINGS = "eu -o · tu -as/-es · ele -a/-e · nós -amos/-emos · eles -am/-em";

export function Verbs({ v, send }: { v: V; send: Send }) {
  const [text, setText] = useState("");
  const [person, setPerson] = useState<string | null>(null);
  const [verb, setVerb] = useState<string | null>(null);
  const left = useCountdown(v.msLeft ?? 0);
  const head = (
    <div className="sync-head">
      <span className="kicker">
        {v.practice ? "🎓 Ensaio" : `Ronda ${v.round + 1}/${v.rounds}`}
        {v.final ? " · ×2!" : ""} · {"❤️".repeat(v.hearts)}
      </span>
      {v.msLeft !== undefined && <span className={`pill ${left < 6000 ? "low" : ""}`}>⏱ {Math.ceil(left / 1000)}s</span>}
    </div>
  );
  if (v.role === "pick" && v.offers)
    return (
      <div className="p-col verbs-pad">
        {head}
        <div className="p-callout">
          <b className="display">🃏 Escolhe a tua carta!</b>
          <span>Easy: a regular verb. Risky: an irregular one, double points — but a miss still costs a heart.</span>
        </div>
        <div className="verbs-offers">
          {v.offers.map((o) => (
            <button
              key={o.id}
              className={`card verbs-offer ${o.id}`}
              onClick={() => {
                play(o.id === "risky" ? "whoosh" : "tap");
                navigator.vibrate?.(o.id === "risky" ? [20, 40, 20] : 15);
                send({ mode: "verbs", choose: o.id });
              }}
            >
              <span className="vo-tag">{o.id === "risky" ? `Arriscada ×${o.mult} 🔥` : `Fácil ×${o.mult}`}</span>
              <span className="vo-pics">
                <Picture glyph={o.person.pic} size="40px" />
                <b>{o.person.pt}</b>
                <span>+</span>
                <Picture glyph={o.action.pic} size="40px" />
              </span>
              {o.action.hint && <i>{o.action.hint}</i>}
            </button>
          ))}
        </div>
      </div>
    );
  if (v.role === "write" && v.person && v.action)
    return (
      <div className="p-col verbs-pad">
        {head}
        <div className="p-callout">
          <b className="display">✍️ Escreve o verbo!{v.risky ? " 🔥 ×2" : ""}</b>
          <span>Write the verb for this person — only the verb (your partner must read who it is).</span>
        </div>
        <div className="card verbs-prompt">
          <span className="vp-person">
            <Picture glyph={v.person.pic} size="56px" />
            <b className="display">{v.person.pt}</b>
          </span>
          <span className="display vp-plus">+</span>
          <span className="vp-action">
            <Picture glyph={v.action.pic} size="56px" />
            {v.action.hint && <b>{v.action.hint}</b>}
          </span>
        </div>
        <form
          className="sync-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            play("lock");
            navigator.vibrate?.(15);
            send({ mode: "verbs", write: text.trim() });
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="comemos, falas, vai…" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={30} autoFocus />
          <button className="btn player" type="submit" disabled={!text.trim()}>
            OK
          </button>
        </form>
      </div>
    );
  if (v.role === "read" && v.persons && v.actions)
    return (
      <div className="p-col verbs-pad">
        {head}
        <div className="card verbs-written-p">
          <span className="kicker">Leram? · Read it:</span>
          <b className="display">“{v.written || "—"}”</b>
        </div>
        {v.endings && <div className="p-sub verbs-endings-p">{ENDINGS}</div>}
        <div className="kicker">Quem? · Who?</div>
        <div className="verbs-person-grid">
          {v.persons.map((p) => (
            <button key={p.id} className={`card verbs-opt ${person === p.id ? "sel" : ""}`} onClick={() => (play("tap"), setPerson(p.id))}>
              <Picture glyph={p.pic} size="32px" />
              <b>{p.pt}</b>
            </button>
          ))}
        </div>
        <div className="kicker">O quê? · Doing what?</div>
        <div className="verbs-action-grid">
          {v.actions.map((a) => (
            <button key={a.id} className={`card verbs-opt ${verb === a.id ? "sel" : ""}`} onClick={() => (play("tap"), setVerb(a.id))}>
              <Picture glyph={a.pic} size="40px" />
              {a.label && <b>{a.label}</b>}
            </button>
          ))}
        </div>
        <button className="btn player" disabled={!person || !verb} onClick={() => person && verb && (play("lock"), send({ mode: "verbs", pick: { person, verb } }))}>
          OK
        </button>
      </div>
    );
  return (
    <div className="p-col verbs-pad">
      {head}
      <div className="p-center">
        <div className="p-big">{v.written !== undefined ? "👀" : "✉️"}</div>
        <div className="p-sub">
          {v.written !== undefined
            ? `Leste “${v.written || "—"}”. ${v.other} ainda está a ler… · waiting for ${v.other}`
            : `Feito! ${v.other} ainda está a escolher ou a escrever… Depois trocam: a terminação diz quem é! · Then you swap and read each other's verb`}
        </div>
        {v.endings && !v.written && <div className="p-sub verbs-endings-p">{ENDINGS}</div>}
      </div>
    </div>
  );
}
