"use client";
import { useMemo, useState } from "react";

const persons = ["eu","tu","ele/ela","nós","vocês","eles/elas"];
interface Verb { infinitive: string; correct: string[] }

const verbs: Verb[] = [
  { infinitive: "falar", correct: ["falo","falas","fala","falamos","falam","falam"] },
  { infinitive: "comer", correct: ["como","comes","come","comemos","comem","comem"] },
  { infinitive: "abrir", correct: ["abro","abres","abre","abrimos","abrem","abrem"] },
];

export default function ConjArcade() {
  const v = useMemo(()=> verbs[Math.floor(Math.random()*verbs.length)], []);
  const [answers, setAnswers] = useState<string[]>(Array(6).fill(""));
  const [result, setResult] = useState<string>("");
  function setValue(i:number, v:string){ const a=[...answers]; a[i]=v; setAnswers(a); }
  function check(){ const ok = v.correct.every((c,i)=> (answers[i]||"").trim().toLowerCase()===c.toLowerCase()); setResult(ok?"✅ Correto!":"❌ Tenta outra vez"); }
  function reset(){ setAnswers(Array(6).fill("")); setResult(""); }
  return (
    <div className="container-max grid gap-4">
      <h1 className="text-xl font-bold">Conjugation Grid</h1>
      <div className="card p-6 grid gap-3">
        <div className="text-sm text-white/70">Completa o verbo: {v.infinitive}</div>
        <div className="grid grid-cols-2 gap-2">
          {persons.map((p,i)=> (
            <div key={p} className="grid grid-cols-[80px_1fr] items-center gap-2">
              <div className="text-sm text-white/70">{p}</div>
              <input className="rounded-xl bg-white/5 border border-white/15 px-3 py-2" value={answers[i]} onChange={e=>setValue(i,e.target.value)} />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={reset}>Repor</button>
          <button className="btn btn-primary" onClick={check}>Verificar</button>
          {result && <div className="rounded-lg bg-white/10 px-2 py-1 text-sm">{result}</div>}
        </div>
      </div>
    </div>
  );
} 