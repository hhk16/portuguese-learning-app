/** Turbo Race overlay: standings + lap progress, countdown, question card, item round, finish. */
import { useEffect, useState } from "react";
import { ITEM_INFO, type TurboRace } from "../../games/race/race.ts";
import { Avatar } from "../../ui/Avatar.tsx";
import { getRuntime } from "../runtime.ts";
import { Fuse, Headline } from "./Fuse.tsx";

export function RaceHud({ a }: { a: TurboRace }) {
  const rt = getRuntime();
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((x) => x + 1), 120);
    return () => clearInterval(id);
  }, []);
  const now = performance.now();
  const order = a.order();
  const q = a.question;

  let center: React.ReactNode = null;
  if (a.phase === "countdown") {
    const left = Math.ceil((a.phaseEnd - now) / 1000);
    center = (
      <div className="center-stack">
        <div className="slam" key={left}>
          {left > 0 && left <= 3 ? left : left > 3 ? "TURBO CORRIDA" : "JÁ!"}
        </div>
        {left > 3 && <div className="slam-hint">Responde depressa = TURBO · Erras = PIÃO</div>}
      </div>
    );
  } else if (a.phase === "items") {
    center = (
      <div className="center-stack">
        <div className="slam" style={{ fontSize: "7rem" }}>
          RONDA DE ITENS!
        </div>
        <div className="items-row" style={{ marginTop: "2rem" }}>
          {(Object.keys(ITEM_INFO) as (keyof typeof ITEM_INFO)[])
            .filter((k) => k !== "ink" || rt.activePlayers.length > 1)
            .map((k) => (
              <div key={k} className="item-card">
                <div className="ie">{ITEM_INFO[k].emoji}</div>
                <div className="il">{ITEM_INFO[k].label}</div>
                <div className="id">{ITEM_INFO[k].desc}</div>
              </div>
            ))}
        </div>
      </div>
    );
  } else if (a.phase === "finish" || a.phase === "done") {
    center = (
      <div className="center-stack">
        <div className="slam">{a.photoFinish ? "FOTO-FINISH!" : "META!"}</div>
      </div>
    );
  }

  const showQ = q && (a.phase === "question" || a.phase === "reveal");
  const reveal = a.phase === "reveal";
  return (
    <div className="tv-overlay race-hud">
      {a.phase === "finish" && a.photoFinish && <div className="flash" />}
      <div className="race-top">
        <div className="standings">
          {order.map((k, i) => {
            const p = rt.players.get(k.playerId);
            if (!p) return null;
            return (
              <div key={k.playerId} className="standing" data-color={p.color}>
                <span className="pos">{i + 1}</span>
                <Avatar kind={p.avatar} color={p.color} size={40} />
                {p.name}
                {k.shield && <span title="escudo">🛡️</span>}
                {k.tailwind && <span className="tag">💨 VENTO DE CAUDA</span>}
                {k.combo > 0 && <span className="tag">{"🔥".repeat(k.combo)}</span>}
              </div>
            );
          })}
        </div>
        <div>
          <div className="chip pixel" style={{ fontSize: "1.1rem" }}>
            1 VOLTA · TURBO CORRIDA
          </div>
          <div className="progress-track">
            {order.map((k) => {
              const p = rt.players.get(k.playerId);
              return p ? <div key={k.playerId} className="progress-dot" data-color={p.color} style={{ left: `${Math.min(1, k.u) * 100}%` }} /> : null;
            })}
            <div style={{ position: "absolute", right: "-2.6rem", top: "-0.9rem", fontSize: "2.4rem" }}>🏁</div>
          </div>
        </div>
      </div>
      {showQ ? null : center}
      {showQ && (
        <div className="panel race-question" key={q.promptId}>
          {q.prompt.visual && <div style={{ fontSize: "4rem" }}>{q.prompt.visual}</div>}
          <div className="prompt-headline">
            <Headline text={q.prompt.headline} fill={reveal ? q.prompt.answerText.split(" ")[0] : undefined} />
          </div>
          {q.prompt.sub && <div className="prompt-sub">{q.prompt.sub}</div>}
          <div className="options">
            {q.prompt.options.map((o) => (
              <div key={o.id} className={`option ${reveal ? (o.id === q.prompt.correctId ? "right" : "dim") : ""}`}>
                {o.label}
              </div>
            ))}
          </div>
          <div className="status-row">
            {rt.activePlayers.map((p) => {
              const ans = q.answers.get(p.playerId);
              return (
                <div key={p.playerId} className={`status ${ans ? "done" : ""}`} data-color={p.color}>
                  <Avatar kind={p.avatar} color={p.color} size={36} />
                  {p.name} {ans ? (ans.correct ? "🔥" : "🌀") : "…"}
                </div>
              );
            })}
          </div>
          {!reveal && (
            <div style={{ marginTop: "1rem" }}>
              <Fuse start={q.startAt} end={q.endAt} />
            </div>
          )}
          {reveal && q.prompt.why && <div className="why">💡 {q.prompt.why}</div>}
        </div>
      )}
    </div>
  );
}
