/** Mini Aula overlay: animated lesson cards (teach) and the quick check (recognise). */
import { Fragment } from "react";
import type { MiniAula } from "../../games/aula/aula.ts";
import { Avatar } from "../../ui/Avatar.tsx";
import { getRuntime } from "../runtime.ts";
import { Fuse, Headline } from "./Fuse.tsx";

export function AulaScreen({ a }: { a: MiniAula }) {
  const rt = getRuntime();
  const s = a.step;
  const c = a.check;
  let body: React.ReactNode = null;
  if (s?.kind === "title")
    body = (
      <>
        <div className="aula-kicker">MINI AULA · {a.lesson.unit === "u00" ? "UNIDADE 0" : "UNIDADE 1"}</div>
        <div className="slam" style={{ fontSize: "8rem" }}>
          {s.big}
        </div>
        <div className="aula-note">{s.small}</div>
      </>
    );
  else if (s?.kind === "example")
    body = (
      <>
        <div className="aula-kicker">{s.kicker ?? "EXEMPLO"}</div>
        {s.emoji && <div style={{ fontSize: "7rem" }}>{s.emoji}</div>}
        <div className="aula-big">{s.big}</div>
        <div className="aula-note">{s.note}</div>
      </>
    );
  else if (s?.kind === "merge")
    body = (
      <>
        <div className="aula-kicker">JUNTA!</div>
        <div className="merge-row">
          <span className="tile a">{s.a}</span>+<span className="tile b">{s.b}</span>=<span className="tile r">{s.result}</span>
        </div>
        <div className="aula-big" style={{ fontSize: "4.6rem", marginTop: "2.4rem" }}>
          {s.emoji} {s.example}
        </div>
      </>
    );
  else if (s?.kind === "rule")
    body = (
      <>
        <div className="aula-kicker">{s.kicker ?? "ATENÇÃO"}</div>
        <div className="aula-big">{s.big}</div>
        <div className="aula-note">{s.note}</div>
      </>
    );
  else if (s?.kind === "table")
    body = (
      <>
        <div className="aula-kicker">{s.kicker}</div>
        <div className="aula-table">
          {s.rows.map(([l, r], i) => (
            <div key={l} className="aula-row" style={{ animationDelay: `${0.15 + i * 0.35}s` }}>
              <span className="l">{l}</span>
              <span className="r">{r}</span>
            </div>
          ))}
        </div>
        {s.note && <div className="aula-note">{s.note}</div>}
      </>
    );
  else if (s?.kind === "summary")
    body = (
      <>
        <div className="aula-kicker">RESUMO</div>
        <div className="summary-grid">
          {s.rows.map(([l, r]) => (
            <Fragment key={l}>
              <span>{l}</span>
              <span className="r">= {r}</span>
            </Fragment>
          ))}
        </div>
        {s.note && <div className="aula-note">{s.note}</div>}
      </>
    );
  else if (s?.kind === "check" && c)
    body = (
      <>
        <div className="aula-kicker">TESTE RÁPIDO · RESPONDE NO TELEMÓVEL</div>
        {c.prompt.visual && <div style={{ fontSize: "6rem" }}>{c.prompt.visual}</div>}
        <div className="aula-big">
          <Headline text={c.prompt.headline} fill={c.revealed ? c.prompt.answerText.split(" ")[0] : undefined} />
        </div>
        <div className="options">
          {c.prompt.options.map((o) => (
            <div key={o.id} className={`option ${c.revealed ? (o.id === c.prompt.correctId ? "right" : "dim") : ""}`}>
              {o.label}
            </div>
          ))}
        </div>
        <div className="status-row">
          {rt.activePlayers.map((p) => {
            const ans = c.answers.get(p.playerId);
            return (
              <div key={p.playerId} className={`status ${ans !== undefined ? "done" : ""}`} data-color={p.color}>
                <Avatar kind={p.avatar} color={p.color} size={36} />
                {p.name} {c.revealed ? (ans ? "✅" : "❌") : ans !== undefined ? "✓" : "…"}
              </div>
            );
          })}
        </div>
        {c.revealed && c.prompt.why && <div className="why">💡 {c.prompt.why}</div>}
      </>
    );
  return (
    <div className="tv-overlay aula-screen">
      {body && (
        <div className="panel aula-card" key={a.stepIndex}>
          {body}
          {s && s.kind !== "check" && (
            <div className="hint-bar" style={{ marginTop: "2rem", fontSize: "1.5rem" }}>
              👍 “Percebi!” no telemóvel para avançar
            </div>
          )}
          {s?.kind === "check" && c && !c.revealed && (
            <div style={{ marginTop: "1.4rem" }}>
              <Fuse start={a.stepStart} end={a.stepEnd} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
