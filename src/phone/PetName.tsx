/** Ana names the puppy (once; she can rename it later from the TV's settings). */
import { useState } from "react";
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import type { Send } from "./Controller.tsx";

type V = Extract<ControllerView, { mode: "petName" }>;

export function PetName({ v, send }: { v: V; send: Send }) {
  const [name, setName] = useState(v.current ?? "");
  const done = (n: string) => {
    if (!n.trim()) return;
    play("select");
    navigator.vibrate?.(20);
    send({ mode: "petName", name: n.trim() });
  };
  return (
    <div className="p-col pet-name">
      <div className="p-center">
        <img className="pet-name-pic" src="/art/pet/pup-wave.webp" alt="" />
        <div className="p-big">Dá um nome ao cachorrinho!</div>
        <div className="p-sub">Name the puppy — it lives on the TV next to you and reacts to everything you do.</div>
      </div>
      <form
        className="sync-form"
        onSubmit={(e) => {
          e.preventDefault();
          done(name);
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="O nome… · Its name" maxLength={16} autoCapitalize="words" />
        <button className="btn player" type="submit" disabled={!name.trim()}>
          OK
        </button>
      </form>
      <div className="kicker">Ideias · Ideas</div>
      <div className="pet-ideas">
        {v.suggestions.map((s) => (
          <button key={s} className="btn white mini" onClick={() => done(s)}>
            {s}
          </button>
        ))}
      </div>
      <button className="btn white block" onClick={() => send({ mode: "petName", skip: true })}>
        <span className="bi">
          Agora não<small>Not now — you can do it later in Definições</small>
        </span>
      </button>
    </div>
  );
}
