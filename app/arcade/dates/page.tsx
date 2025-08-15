"use client";
import { useMemo, useState } from "react";

const months = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

function randomDate() {
  const d = Math.floor(Math.random()*28)+1;
  const m = Math.floor(Math.random()*12);
  const y = 2020 + Math.floor(Math.random()*6);
  return { d, m, y };
}

export default function DateComposer() {
  const { d, m, y } = useMemo(()=> randomDate(), []);
  const [chips, setChips] = useState<string[]>([]);
  function addChip(c:string){ setChips((p)=> p.includes(c)? p : [...p, c]); }
  function reset(){ setChips([]); }
  function toStr(){ return `${d} de ${months[m]} de ${y}`; }
  const correct = toStr().toLowerCase();
  function check(){ const s = chips.join(" ").toLowerCase(); alert(s === correct ? "✅ Correto!" : `❌ Resposta: ${toStr()}`); }
  const pool = [`${d}`,"de", months[m], "de", `${y}`];
  const floors = ["1.º","2.º","3.º","4.º","5.º"]; // short ordinal drill
  const [floor, setFloor] = useState<string>("");
  return (
    <div className="container-max grid gap-4">
      <h1 className="text-xl font-bold">Date Composer</h1>
      <div className="card p-6 grid gap-3">
        <div className="text-sm text-white/70">Arrasta/toca as peças para compor a data</div>
        <div className="flex flex-wrap gap-2">
          {pool.map((c,i)=> (
            <button key={i} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2" onClick={()=>addChip(c)}>{c}</button>
          ))}
        </div>
        <div className="min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3 py-2">{chips.join(" ")}</div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={reset}>Repor</button>
          <button className="btn btn-primary" onClick={check}>Verificar</button>
        </div>
      </div>
      <div className="card p-6 grid gap-3">
        <div className="text-sm text-white/70">Ordinal (andar)</div>
        <div className="flex flex-wrap gap-2">
          {floors.map(f=> (
            <button key={f} className={`rounded-xl border border-white/15 px-3 py-2 ${floor===f?'bg-white/20':'bg-white/5'}`} onClick={()=>setFloor(f)}>{f}</button>
          ))}
        </div>
        {floor && <div className="text-sm">Ex.: Moro no {floor} andar.</div>}
      </div>
    </div>
  );
} 