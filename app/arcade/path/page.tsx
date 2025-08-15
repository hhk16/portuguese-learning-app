"use client";
import { useState } from "react";

interface Node { id:number; x:number; y:number; label?:string }
interface Edge { from:number; to:number; label:string }

export default function PathGame() {
  const nodes: Node[] = [
    { id: 1, x: 0, y: 0, label: "Início" },
    { id: 2, x: 1, y: 0, label: "Rua" },
    { id: 3, x: 2, y: 0, label: "Banco" },
    { id: 4, x: 1, y: 1, label: "Superm." },
  ];
  const edges: Edge[] = [
    { from: 1, to: 2, label: "em" },
    { from: 2, to: 3, label: "ao" },
    { from: 2, to: 4, label: "ao" },
  ];
  const correctPath = [1,2,3];
  const [path, setPath] = useState<number[]>([]);
  const [result, setResult] = useState<string>("");
  function addNode(id:number){ setPath(p => (p.length===0 || edges.some(e=> e.from===p[p.length-1] && e.to===id)) ? [...p,id] : p); }
  function reset(){ setPath([]); setResult(""); }
  function check(){ const ok = correctPath.length===path.length && correctPath.every((v,i)=>v===path[i]); setResult(ok?"✅ Correto!":"❌ Tenta outra vez"); }
  return (
    <div className="container-max grid gap-3">
      <h1 className="text-xl font-bold">Path Builder (Contractions)</h1>
      <div className="card p-4 grid gap-3">
        <div className="text-sm text-white/70">Objetivo: do Início ao Banco</div>
        <div className="relative h-64 w-full rounded-xl border border-white/15 bg-white/5">
          {edges.map((e,i)=>{
            const a = nodes.find(n=>n.id===e.from)!; const b = nodes.find(n=>n.id===e.to)!;
            const x1 = 30 + a.x*90, y1 = 30 + a.y*90, x2 = 30 + b.x*90, y2 = 30 + b.y*90;
            const style = { left: Math.min(x1,x2), top: Math.min(y1,y2), width: Math.abs(x2-x1), height: 2 } as any;
            return <div key={i} className="absolute bg-white/20" style={style} />;
          })}
          {nodes.map((n)=> (
            <button key={n.id} className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 text-[10px] hover:bg-white/20" style={{ left: 30 + n.x*90, top: 30 + n.y*90 }} onClick={()=>addNode(n.id)}>{n.label||n.id}</button>
          ))}
        </div>
        <div className="text-xs text-white/60">Caminho: {path.join(" → ")}</div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={reset}>Repor</button>
          <button className="btn btn-primary" onClick={check}>Verificar</button>
          {result && <div className="rounded-lg bg-white/10 px-2 py-1 text-sm">{result}</div>}
        </div>
      </div>
    </div>
  );
} 