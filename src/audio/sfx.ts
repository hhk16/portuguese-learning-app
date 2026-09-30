/**
 * Procedural chiptune sound effects (Web Audio). No sample files: consistent retro voice,
 * zero licensing, instant load. Everything routes through one master gain.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;

export function audio(): { ctx: AudioContext; sfx: GainNode; music: GainNode } | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    master.connect(comp).connect(ctx.destination);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.55;
    sfxGain.connect(master);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.22;
    musicGain.connect(master);
  }
  return { ctx, sfx: sfxGain!, music: musicGain! };
}

/** Must be called from a user gesture on browsers (TV WebView allows autoplay). */
export function unlockAudio() {
  const a = audio();
  if (a && a.ctx.state !== "running") void a.ctx.resume();
}

export function setVolumes(v: { sfx?: number; music?: number }) {
  const a = audio();
  if (!a) return;
  if (v.sfx !== undefined) a.sfx.gain.value = v.sfx;
  if (v.music !== undefined) a.music.gain.value = v.music;
}

type Wave = OscillatorType;

function tone(freq: number, dur: number, opts: { type?: Wave; at?: number; vol?: number; slideTo?: number; dest?: AudioNode } = {}) {
  const a = audio();
  if (!a || a.ctx.state !== "running") return;
  const t = a.ctx.currentTime + (opts.at ?? 0);
  const o = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  o.type = opts.type ?? "square";
  o.frequency.setValueAtTime(freq, t);
  if (opts.slideTo) o.frequency.exponentialRampToValueAtTime(opts.slideTo, t + dur);
  const v = opts.vol ?? 0.3;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(opts.dest ?? a.sfx);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, opts: { at?: number; vol?: number; from?: number; to?: number } = {}) {
  const a = audio();
  if (!a || a.ctx.state !== "running") return;
  const t = a.ctx.currentTime + (opts.at ?? 0);
  const len = Math.max(1, Math.floor(a.ctx.sampleRate * dur));
  const buf = a.ctx.createBuffer(1, len, a.ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = a.ctx.createBufferSource();
  src.buffer = buf;
  const f = a.ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(opts.from ?? 800, t);
  f.frequency.exponentialRampToValueAtTime(opts.to ?? 3000, t + dur);
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(opts.vol ?? 0.4, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.sfx);
  src.start(t);
}

const N = (semi: number) => 440 * 2 ** ((semi - 9) / 12); // semitones from C4-ish

export const sfx = {
  blip: () => tone(880, 0.06, { vol: 0.15 }),
  nav: () => tone(660, 0.05, { type: "triangle", vol: 0.2 }),
  select: () => {
    tone(N(12), 0.07, { vol: 0.2 });
    tone(N(19), 0.1, { vol: 0.2, at: 0.06 });
  },
  join: () => [0, 4, 7, 12].forEach((s, i) => tone(N(s + 12), 0.1, { at: i * 0.07, vol: 0.2 })),
  correct: () => {
    tone(N(19), 0.08, { vol: 0.25 });
    tone(N(24), 0.16, { vol: 0.25, at: 0.08 });
  },
  wrong: () => {
    tone(180, 0.18, { type: "sawtooth", vol: 0.22, slideTo: 90 });
  },
  tick: () => tone(1200, 0.03, { type: "triangle", vol: 0.12 }),
  countdown: (final = false) => tone(final ? N(24) : N(12), final ? 0.35 : 0.12, { vol: 0.25 }),
  slam: () => {
    noise(0.25, { vol: 0.5, from: 200, to: 60 });
    tone(110, 0.25, { type: "square", vol: 0.25, slideTo: 55 });
  },
  whoosh: () => noise(0.5, { vol: 0.35, from: 400, to: 4000 }),
  boost: () => {
    noise(0.6, { vol: 0.3, from: 300, to: 5000 });
    tone(220, 0.5, { type: "sawtooth", vol: 0.15, slideTo: 880 });
  },
  spin: () => [0, 1, 2, 3, 4, 5].forEach((i) => tone(700 - i * 90, 0.08, { at: i * 0.07, vol: 0.18, type: "triangle" })),
  coin: () => {
    tone(N(23), 0.06, { vol: 0.2 });
    tone(N(28), 0.2, { vol: 0.2, at: 0.06 });
  },
  fanfare: () => [0, 4, 7, 12, 7, 12, 16].forEach((s, i) => tone(N(s + 12), i === 6 ? 0.5 : 0.12, { at: i * 0.11, vol: 0.22 })),
  sad: () => [7, 6, 5, 4].forEach((s, i) => tone(N(s), 0.22, { at: i * 0.2, vol: 0.2, type: "triangle" })),
  pop: () => tone(520, 0.08, { type: "sine", vol: 0.3, slideTo: 1200 }),
  splat: () => noise(0.3, { vol: 0.5, from: 1500, to: 200 }),
  blipTalk: () => tone(600 + Math.random() * 500, 0.04, { type: "square", vol: 0.07 }),
};
