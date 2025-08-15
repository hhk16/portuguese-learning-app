let audioCtx: AudioContext | null = null;
function getCtx() { if (typeof window === 'undefined') return null; if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); return audioCtx; }

export function playBeep(freq: number, durationMs = 140, type: OscillatorType = 'sine') {
  const ctx = getCtx(); if (!ctx) return;
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.type = type; osc.frequency.value = freq; gain.gain.value = 0.06;
  osc.connect(gain).connect(ctx.destination); osc.start();
  setTimeout(() => { osc.stop(); }, durationMs);
}

export function playCorrect() { playBeep(880, 120, 'triangle'); setTimeout(()=>playBeep(1320, 120, 'triangle'), 120); }
export function playWrong() { playBeep(220, 200, 'sawtooth'); }

export async function launchConfetti() {
  if (typeof window === 'undefined') return;
  const { default: confetti } = await import('canvas-confetti');
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
} 