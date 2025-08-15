"use client";
import { useMemo, useState } from "react";

const items = [
  { q: "__ lado da farmácia", opts: ["ao","à","do","da","no","na"], a: "ao" },
  { q: "O banco fica __ direita __ supermercado", opts: ["à","ao","do","da"], a: ["à","do"] },
  { q: "Vive __ centro da cidade", opts: ["no","na","ao"], a: "no" },
];

export default function DirectionsArcade() {
  const it = useMemo(()=> items[Math.floor(Math.random()*items.length)], []);
  const [choice, setChoice] = useState<string[]>([]);
  const [res, setRes] = useState<string>("");
  function pick(opt:string){ setChoice((c)=> c.includes(opt)? c.filter(x=>x!==opt): [...c,opt]); }
  function check(){
    const ans = Array.isArray(it.a)? it.a: [it.a];
    const ok = ans.length===choice.length && ans.every(a=> choice.includes(a));
    setRes(ok?"✅ Correto!":"❌ Tenta outra vez");
  }
  return (
    <div className="container-max grid gap-4">
      <h1 className="text-xl font-bold">Direction Contractions</h1>
      <div className="card p-6 grid gap-3">
        <div className="text-sm text-white/70">{it.q}</div>
        <div className="flex flex-wrap gap-2">
          {it.opts.map((o)=> (
            <button key={o} className={`rounded-xl border px-3 py-2 ${choice.includes(o)?'bg-white/20':'bg-white/5'} border-white/15`} onClick={()=>pick(o)}>{o}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={check}>Verificar</button>
          {res && <div className="rounded-lg bg-white/10 px-2 py-1 text-sm">{res}</div>}
        </div>
      </div>
    </div>
  );
} 