/**
 * Tiny chiptune sequencer. Scheduled on the AudioContext clock (never setTimeout for timing),
 * with a look-ahead scheduler loop. Patterns are original.
 */
import { audio } from "./sfx.ts";

type Track = { bpm: number; bass: (number | null)[]; lead: (number | null)[]; drums: string };

const TRACKS: Record<string, Track> = {
  title: {
    bpm: 112,
    bass: [0, null, 0, null, 5, null, 5, null, 3, null, 3, null, 7, null, 7, 5],
    lead: [12, null, 16, 19, null, 16, 17, null, 15, null, 19, null, 22, 19, 17, null],
    drums: "k-h-s-h-k-h-s-hh",
  },
  party: {
    bpm: 140,
    bass: [0, 0, 12, 0, 3, 3, 15, 3, 5, 5, 17, 5, 7, 7, 19, 10],
    lead: [24, null, 22, 24, null, 19, null, 22, 20, null, 19, 17, null, 19, 22, null],
    drums: "k-hsk-hsk-hsk-sh",
  },
  race: {
    bpm: 160,
    bass: [0, 12, 0, 12, 3, 15, 3, 15, 5, 17, 5, 17, 7, 19, 10, 22],
    lead: [19, 22, 24, null, 22, 19, null, 17, 19, null, 15, 17, 19, 22, 24, 27],
    drums: "k-hsk-hskkhsk-ss",
  },
  aula: {
    bpm: 96,
    bass: [0, null, null, null, 5, null, null, null, 3, null, null, null, 7, null, null, null],
    lead: [12, null, 15, null, 17, null, 15, null, 12, null, 10, null, 12, null, null, null],
    drums: "k---h---s---h---",
  },
};

let current: string | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let nextTime = 0;
let tempoMul = 1;

const freq = (semi: number) => 130.81 * 2 ** (semi / 12); // C3 base

function note(f: number, t: number, dur: number, type: OscillatorType, vol: number) {
  const a = audio()!;
  const o = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.music);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function drum(kind: string, t: number) {
  const a = audio()!;
  if (kind === "k") {
    const o = a.ctx.createOscillator();
    const g = a.ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    o.connect(g).connect(a.music);
    o.start(t);
    o.stop(t + 0.2);
    return;
  }
  const len = Math.floor(a.ctx.sampleRate * (kind === "s" ? 0.12 : 0.04));
  const buf = a.ctx.createBuffer(1, len, a.ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.ctx.createBufferSource();
  src.buffer = buf;
  const f = a.ctx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = kind === "s" ? 1500 : 6000;
  const g = a.ctx.createGain();
  g.gain.value = kind === "s" ? 0.5 : 0.25;
  src.connect(f).connect(g).connect(a.music);
  src.start(t);
}

export function playMusic(name: keyof typeof TRACKS | null) {
  if (name === current) return;
  stopMusic();
  current = name;
  const a = audio();
  if (!name || !a) return;
  const tr = TRACKS[name]!;
  step = 0;
  nextTime = a.ctx.currentTime + 0.1;
  timer = setInterval(() => {
    if (a.ctx.state !== "running") return;
    const spb = 60 / (tr.bpm * tempoMul) / 4; // 16th notes
    while (nextTime < a.ctx.currentTime + 0.15) {
      const i = step % 16;
      const b = tr.bass[i];
      const l = tr.lead[i];
      if (b !== null && b !== undefined) note(freq(b) / 2, nextTime, spb * 1.8, "triangle", 0.5);
      if (l !== null && l !== undefined) note(freq(l), nextTime, spb * 1.6, "square", 0.12);
      const dch = tr.drums[i];
      if (dch && dch !== "-") drum(dch, nextTime);
      nextTime += spb;
      step++;
    }
  }, 40);
}

export function setTempo(mul: number) {
  tempoMul = mul;
}

export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
  current = null;
  tempoMul = 1;
}
