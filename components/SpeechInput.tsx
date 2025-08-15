"use client";

interface SpeechInputProps {
  label?: string;
  lang?: string;
  onResult: (text: string) => void;
}

export default function SpeechInput({ label = "🎙️ Speak", lang = "pt-PT", onResult }: SpeechInputProps) {
  function handleClick() {
    if (typeof window === "undefined") return;
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const text = e?.results?.[0]?.[0]?.transcript as string | undefined;
      if (text) onResult(text);
    };
    rec.onerror = () => {};
    rec.start();
  }
  return (
    <button type="button" className="btn btn-secondary" onClick={handleClick}>{label}</button>
  );
} 