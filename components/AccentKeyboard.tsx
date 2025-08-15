"use client";
export default function AccentKeyboard({ onInsert }: { onInsert: (char: string) => void }) {
  const chars = ["á","à","â","ã","é","ê","í","ó","ô","õ","ú","ç"];
  return (
    <div className="flex flex-wrap gap-1">
      {chars.map((c)=> (
        <button key={c} className="px-2 py-1 rounded-md border border-white/15 bg-white/5" onClick={()=>onInsert(c)}>
          {c}
        </button>
      ))}
    </div>
  );
} 