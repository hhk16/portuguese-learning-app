/**
 * The phone controller: one screen per game mode. Big, calm, one thumb; private information
 * (your secret key, the dial target) lives here, the shared show lives on the TV.
 */
import { useState } from "react";
import type { PhoneConnection } from "../net/phone.ts";
import { REACTIONS, type ControllerView, type InputValue } from "../shared/protocol.ts";
import { unlockAudio, play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import { Dial } from "./Dial.tsx";
import { Learn } from "./Learn.tsx";
import { Secret } from "./Secret.tsx";
import { Sync } from "./Sync.tsx";
import { Draw } from "./Draw.tsx";
import { StopPad } from "./Stop.tsx";
import { Kitchen } from "./Kitchen.tsx";

export type ViewOf<M extends ControllerView["mode"]> = Extract<ControllerView, { mode: M }>;
export type Send = (value: InputValue) => void;

export function Controller({ view, conn }: { view: ControllerView; conn: PhoneConnection }) {
  const send: Send = (value) => {
    if ("roundId" in view && "promptId" in view) conn.input(view.roundId, view.promptId, value);
  };
  // Remount per prompt so local state (selections etc.) resets.
  const key = "promptId" in view ? `${view.mode}:${view.promptId}` : `${view.mode}:${"title" in view ? view.title : ""}`;
  // While you wait (or watch your partner), you can throw reactions onto the TV.
  const idle = view.mode === "wait" || view.mode === "lobby" || ("role" in view && view.role === "watch");
  return (
    <div key={key} className="p-screen" onPointerDown={unlockAudio}>
      <Body view={view} conn={conn} send={send} />
      {idle && <ReactBar conn={conn} />}
    </div>
  );
}

function Body({ view, conn, send }: { view: ControllerView; conn: PhoneConnection; send: Send }) {
  switch (view.mode) {
    case "wait":
      return <Wait v={view} />;
    case "lobby":
      return <Lobby v={view} conn={conn} />;
    case "paused":
      return <Paused conn={conn} />;
    case "remote":
      return <Remote v={view} conn={conn} />;
    case "pick":
      return <Pick v={view} send={send} />;
    case "learn":
      return <Learn v={view} conn={conn} send={send} />;
    case "secret":
      return <Secret v={view} send={send} />;
    case "dial":
      return <Dial v={view} send={send} />;
    case "sync":
      return <Sync v={view} send={send} />;
    case "draw":
      return <Draw v={view} send={send} />;
    case "stop":
      return <StopPad v={view} send={send} />;
    case "kitchen":
      return <Kitchen v={view} send={send} />;
  }
}

function Wait({ v }: { v: ViewOf<"wait"> }) {
  return (
    <div className="p-center">
      {v.pic && (
        <div className="p-bob">
          <Picture glyph={v.pic} size="112px" />
        </div>
      )}
      <div className="p-big">{v.title}</div>
      {v.subtitle && <div className="p-sub">{v.subtitle}</div>}
    </div>
  );
}

function Lobby({ v, conn }: { v: ViewOf<"lobby">; conn: PhoneConnection }) {
  return (
    <div className="p-center">
      <div className="kicker">A seguir · Up next</div>
      <div className="p-big">{v.hint}</div>
      <div className="p-sub">{v.ready ? "Estás pronto! À espera dos outros… · Ready! Waiting for the others…" : "Carrega quando estiveres pronto. · Tap when you're ready."}</div>
      {v.level !== undefined && (
        <div className="level-picker">
          <button className="btn white" disabled={v.level <= 1} onClick={() => conn.nav("left")} aria-label="Mais fácil">
            ◀
          </button>
          <span className="bi">
            <b>{["Fácil", "Médio", "Difícil"][v.level - 1]}</b>
            <small>
              {["Easy", "Medium", "Hard"][v.level - 1]} {"★".repeat(v.level)}
            </small>
          </span>
          <button className="btn white" disabled={v.level >= 3} onClick={() => conn.nav("right")} aria-label="Mais difícil">
            ▶
          </button>
        </div>
      )}
      <div className="p-grow" />
      <button
        className={`btn block ${v.ready ? "mint" : "player"} p-hero-btn`}
        onClick={() => {
          conn.ready(!v.ready);
          navigator.vibrate?.(20);
        }}
      >
        <span className="bi">
          {v.ready ? "Pronto! ✓" : "Estou pronto"}
          <small>{v.ready ? "Ready!" : "I'm ready"}</small>
        </span>
      </button>
      <button className="btn block white" onClick={() => conn.nav("back")}>
        <span className="bi">
          Voltar ao menu<small>Back to menu</small>
        </span>
      </button>
    </div>
  );
}

function Paused({ conn }: { conn: PhoneConnection }) {
  return (
    <div className="p-center">
      <div className="p-big">Pausa</div>
      <div className="p-sub">Paused</div>
      <div className="p-grow" />
      <button className="btn block mint p-hero-btn" onClick={() => conn.menu("resume")}>
        <span className="bi">
          Continuar<small>Resume</small>
        </span>
      </button>
      <button className="btn block white" onClick={() => conn.menu("restart")}>
        <span className="bi">
          Recomeçar<small>Restart</small>
        </span>
      </button>
      <button className="btn block white" onClick={() => conn.menu("quit")}>
        <span className="bi">
          Sair para o menu<small>Quit to menu</small>
        </span>
      </button>
    </div>
  );
}

function Remote({ v, conn }: { v: ViewOf<"remote">; conn: PhoneConnection }) {
  const b = (dir: Parameters<PhoneConnection["nav"]>[0], label: string, cls = "") => (
    <button
      className={`pad ${cls}`}
      aria-label={dir}
      onClick={() => {
        conn.nav(dir);
        play("tap");
        navigator.vibrate?.(8);
      }}
    >
      {label}
    </button>
  );
  return (
    <div className="p-center">
      <div className="p-sub">{v.hint}</div>
      <div className="dpad">
        <span />
        {b("up", "▲")}
        <span />
        {b("left", "◀")}
        {b("ok", "OK", "ok")}
        {b("right", "▶")}
        <span />
        {b("down", "▼")}
        <span />
      </div>
      <button className="btn block white" onClick={() => conn.nav("back")}>
        <span className="bi">
          Voltar<small>Back</small>
        </span>
      </button>
    </div>
  );
}

function Pick({ v, send }: { v: ViewOf<"pick">; send: Send }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="p-col">
      <div className="p-big center">{v.title}</div>
      {v.subtitle && <div className="p-sub center">{v.subtitle}</div>}
      <div className="p-grow" />
      <div className="pick-list">
        {v.options.map((o, i) => (
          <button
            key={o.id}
            className={`pick-item card ${i === 0 ? "first" : ""}`}
            disabled={sent}
            onClick={() => {
              setSent(true);
              navigator.vibrate?.(15);
              send({ mode: "pick", id: o.id });
            }}
          >
            {o.emoji && <Picture glyph={o.emoji} size="44px" />}
            <span>
              <b>{o.label}</b>
              {o.sub && <small>{o.sub}</small>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReactBar({ conn }: { conn: PhoneConnection }) {
  return (
    <div className="react-bar" aria-label="Reações · Reactions">
      {REACTIONS.map((e) => (
        <button
          key={e}
          onClick={() => {
            conn.react(e);
            navigator.vibrate?.(8);
          }}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
