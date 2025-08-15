"use client";
export default function AudioButton({ text, label = "Play" }: { text: string; label?: string }) {
  const say = () => {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ptpt = voices.find(v => v.lang?.toLowerCase().startsWith("pt-pt")) || voices.find(v => v.lang?.toLowerCase().startsWith("pt"));
    if (ptpt) utter.voice = ptpt;
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };
  return <button className="btn btn-secondary" onClick={say}>🔊 {label}</button>;
} 