/**
 * Sound effects: soft, toy-like recorded sounds (Kenney UI packs, CC0) in /sfx/<name>.mp3, played
 * through Web Audio for instant, overlapping playback. Until a file has loaded (or if it's
 * missing), a gentle synthesised fallback plays instead so nothing is ever silent.
 */
export type SfxName =
  | "tap"
  | "select"
  | "back"
  | "correct"
  | "wrong"
  | "pop"
  | "whoosh"
  | "reveal"
  | "star"
  | "tick"
  | "countdown-go"
  | "success-jingle"
  | "fail-jingle"
  | "match"
  | "lock";

const NAMES: SfxName[] = ["tap", "select", "back", "correct", "wrong", "pop", "whoosh", "reveal", "star", "tick", "countdown-go", "success-jingle", "fail-jingle", "match", "lock"];

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
const buffers = new Map<SfxName, AudioBuffer | null>();

export function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = 0.7;
    out.connect(ctx.destination);
  }
  return { ctx, out: out! };
}

/** Must be called from a user gesture on browsers (the TV WebView allows autoplay). */
export function unlockAudio() {
  const a = audio();
  if (a && a.ctx.state !== "running") void a.ctx.resume();
  preload();
}

let preloading = false;
function preload() {
  const a = audio();
  if (!a || preloading) return;
  preloading = true;
  for (const n of NAMES) {
    fetch(`/sfx/${n}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((b) => a.ctx.decodeAudioData(b))
      .then((buf) => buffers.set(n, buf))
      .catch(() => buffers.set(n, null));
  }
}

export function setVolume(v: number) {
  const a = audio();
  if (a) a.out.gain.value = v;
}

export function play(name: SfxName, volume = 1) {
  const a = audio();
  if (!a || a.ctx.state !== "running") return;
  const buf = buffers.get(name);
  if (buf) {
    const src = a.ctx.createBufferSource();
    const g = a.ctx.createGain();
    g.gain.value = volume;
    src.buffer = buf;
    src.connect(g).connect(a.out);
    src.start();
    return;
  }
  fallback(name, a.ctx, a.out);
}

/* Soft sine "marimba" fallback. */
function note(c: AudioContext, dest: AudioNode, freq: number, at: number, dur = 0.18, vol = 0.25) {
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function fallback(name: SfxName, c: AudioContext, dest: AudioNode) {
  const seq: Record<SfxName, [number, number][]> = {
    tap: [[660, 0]],
    select: [[784, 0]],
    back: [[523, 0]],
    pop: [[880, 0]],
    tick: [[1046, 0]],
    lock: [[392, 0]],
    whoosh: [[440, 0], [660, 0.05]],
    reveal: [[523, 0], [784, 0.08]],
    correct: [[659, 0], [988, 0.09]],
    wrong: [[330, 0], [262, 0.12]],
    star: [[1046, 0], [1318, 0.07], [1568, 0.14]],
    match: [[784, 0], [1046, 0.1]],
    "countdown-go": [[1046, 0]],
    "success-jingle": [[523, 0], [659, 0.1], [784, 0.2], [1046, 0.3]],
    "fail-jingle": [[392, 0], [330, 0.14], [262, 0.28]],
  };
  for (const [f, at] of seq[name]) note(c, dest, f, at);
}
