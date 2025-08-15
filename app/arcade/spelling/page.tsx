"use client";
import { useEffect, useMemo, useState } from "react";

const words = ["coração","pão","mãe","ação","lição","cinco","maçã","avião","português","informação"];
const tiles = ["a","á","à","â","ã","e","é","ê","i","í","o","ó","ô","õ","u","ú","ç","ç","m","n","r","s","t","l","p","g"];

function mask(w:string){
  // replace 2 letters with underscores
  const idxs = [Math.floor(Math.random()*w.length), Math.floor(Math.random()*w.length)];
  return w.split("").map((ch,i)=> idxs.includes(i)? "_" : ch).join("");
}

export default function SpellingTiles() {
  const target = useMemo(()=> words[Math.floor(Math.random()*words.length)], []);
  const [masked, setMasked] = useState(mask(target));
  const [value, setValue] = useState("");
  const [res, setRes] = useState<string>("");
  function add(ch:string){ setValue(v=> v+ch); }
  function back(){ setValue(v=> v.slice(0,-1)); }
  function reset(){ setValue(""); setRes(""); }
  function check(){ setRes(value.trim().toLowerCase() === target.toLowerCase()? "✅ Correto!" : `❌ Resposta: ${target}`); }
  useEffect(()=>{ setMasked(mask(target)); }, [target]);
  return (
    <div className="container-max grid gap-4">
      <h1 className="text-xl font-bold">Spelling Tiles (Accents)</h1>
      <div className="card p-6 grid gap-3">
        <div className="text-sm text-white/70">Palavra: {masked}</div>
        <div className="min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3 py-2">{value}</div>
        <div className="flex flex-wrap gap-2">
          {tiles.map((t,i)=> (
            <button key={i} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2" onClick={()=>add(t)}>{t}</button>
          ))}
          <button className="btn btn-secondary" onClick={back}>⌫</button>
          <button className="btn btn-secondary" onClick={reset}>Repor</button>
          <button className="btn btn-primary" onClick={check}>Verificar</button>
        </div>
        {res && <div className="rounded-lg bg-white/10 px-2 py-1 text-sm">{res}</div>}
      </div>
    </div>
  );
} 