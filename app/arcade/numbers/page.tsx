"use client";
import { useMemo, useState } from "react";

const words: Record<number, string> = {
  21: "vinte e um", 22: "vinte e dois", 23: "vinte e três", 24: "vinte e quatro", 25: "vinte e cinco",
  30: "trinta", 40: "quarenta", 50: "cinquenta", 60: "sessenta", 70: "setenta", 80: "oitenta", 90: "noventa",
  100: "cem", 200: "duzentos", 300: "trezentos", 400: "quatrocentos", 500: "quinhentos", 600: "seiscentos", 700: "setecentos", 800: "oitocentos", 900: "novecentos",
};

function toPt(n: number): string {
  if (words[n]) return words[n];
  if (n < 30) return "vinte e " + (n-20);
  if (n < 100) {
    const d = Math.floor(n/10)*10; const r = n%10;
    return r? `${words[d]} e ${r}` : words[d];
  }
  if (n === 100) return "cem";
  if (n < 200) return `cento e ${toPt(n-100)}`;
  if (n < 1000) {
    const h = Math.floor(n/100)*100; const r = n%100;
    return r? `${words[h]} e ${toPt(r)}` : words[h];
  }
  return n.toString();
}

function randomNumber(): number {
  const pool = [21,22,23,24,25,30,40,50,60,70,80,90,100,150,210,345,480,512,679,845,999];
  return pool[Math.floor(Math.random()*pool.length)];
}

export default function NumberBuilder() {
  const n = useMemo(()=> randomNumber(), []);
  const [mode] = useState<"toDigits" | "toWords">(Math.random() < 0.5 ? "toDigits" : "toWords");
  const [value, setValue] = useState("");
  const [res, setRes] = useState<string>("");
  function check(){
    const ok = mode === "toDigits" ? value.trim() === String(n) : value.trim().toLowerCase() === toPt(n).toLowerCase();
    setRes(ok?"✅ Correto!":"❌ Tenta outra vez");
  }
  return (
    <div className="container-max grid gap-4">
      <h1 className="text-xl font-bold">Number Builder</h1>
      <div className="card p-6 grid gap-3">
        {mode === "toDigits" ? (
          <>
            <div className="text-sm text-white/70">Escreve em dígitos: {toPt(n)}</div>
            <input className="rounded-xl bg-white/5 border border-white/15 px-3 py-2" value={value} onChange={e=>setValue(e.target.value)} placeholder="Ex.: 345" />
          </>
        ) : (
          <>
            <div className="text-sm text-white/70">Escreve por extenso: {n}</div>
            <input className="rounded-xl bg-white/5 border border-white/15 px-3 py-2" value={value} onChange={e=>setValue(e.target.value)} placeholder="Ex.: trezentos e quarenta e cinco" />
          </>
        )}
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={check}>Verificar</button>
          {res && <div className="rounded-lg bg-white/10 px-2 py-1 text-sm">{res}</div>}
        </div>
      </div>
      <div className="card p-6 grid gap-3">
        <div className="text-sm text-white/70">Preço (ouvir → escrever)</div>
        <div>🔊 doze euros e cinquenta cêntimos</div>
        <input className="rounded-xl bg-white/5 border border-white/15 px-3 py-2" placeholder="Ex.: 12,50 €" />
      </div>
    </div>
  );
} 