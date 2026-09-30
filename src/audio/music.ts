/**
 * Background music (TV only). One track per mood, generated for this game (see ASSETS.md):
 * menu · learn · secret · wave · sync · draw · versus · rush · final. Tracks loop without their fade-in/out, crossfade
 * when the scene changes, duck under the Portuguese voice, and can speed up for "hurry up!".
 */
import { logSound } from "./log.ts";
import { audio } from "./sfx.ts";

export type Track = "menu" | "learn" | "secret" | "wave" | "sync" | "draw" | "versus" | "rush" | "final";

const LEVEL = 0.55;
const DUCKED = 0.18;
const FADE = 1.2;

const buffers = new Map<Track, Promise<AudioBuffer | null>>();
let current: { track: Track; src: AudioBufferSourceNode; gain: GainNode } | null = null;
let wanted: Track | null = null;
let enabled = true;
let duckCount = 0;
let hurry = false;

function load(track: Track): Promise<AudioBuffer | null> {
  let p = buffers.get(track);
  if (!p) {
    const a = audio();
    p = a
      ? fetch(`/music/${track}.mp3`)
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
          .then((b) => a.ctx.decodeAudioData(b))
          .catch(() => null)
      : Promise.resolve(null);
    buffers.set(track, p);
  }
  return p;
}

function level() {
  return !enabled ? 0 : duckCount > 0 ? DUCKED : LEVEL;
}

/** Switch to a track (crossfade). Same track = keep playing. null = fade out. */
export function playMusic(track: Track | null) {
  wanted = track;
  if (current?.track === track) return;
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  if (current) {
    const old = current;
    old.gain.gain.cancelScheduledValues(t);
    old.gain.gain.setValueAtTime(old.gain.gain.value, t);
    old.gain.gain.linearRampToValueAtTime(0, t + FADE);
    old.src.stop(t + FADE + 0.05);
    current = null;
  }
  if (!track) return;
  logSound(`/music/${track}.mp3`, LEVEL);
  void load(track).then((buf) => {
    if (!buf || wanted !== track || current?.track === track) return;
    const now = a.ctx.currentTime;
    const src = a.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    // Skip the generated intro/outro fades so the loop is seamless.
    src.loopStart = Math.min(2, buf.duration / 4);
    src.loopEnd = Math.max(src.loopStart + 5, buf.duration - 4);
    src.playbackRate.value = hurry ? 1.12 : 1;
    const gain = a.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(level(), now + FADE);
    src.connect(gain).connect(a.out);
    src.start(now, 0.5);
    current = { track, src, gain };
  });
}

function applyLevel(seconds = 0.25) {
  const a = audio();
  if (!a || !current) return;
  const t = a.ctx.currentTime;
  current.gain.gain.cancelScheduledValues(t);
  current.gain.gain.setValueAtTime(current.gain.gain.value, t);
  current.gain.gain.linearRampToValueAtTime(level(), t + seconds);
}

/** Lower the music while the TV speaks Portuguese. */
export function duck(on: boolean) {
  duckCount = Math.max(0, duckCount + (on ? 1 : -1));
  applyLevel(on ? 0.15 : 0.6);
}

/** Last seconds of a timer: the music speeds up (and back). */
export function setHurry(on: boolean) {
  if (hurry === on) return;
  hurry = on;
  const a = audio();
  if (a && current) current.src.playbackRate.setTargetAtTime(on ? 1.12 : 1, a.ctx.currentTime, 0.3);
  if (on) logSound("hurry", 1);
}

export function setMusicEnabled(on: boolean) {
  enabled = on;
  applyLevel(0.4);
}

/** Start loading a track early (e.g. in the lobby). */
export function preloadMusic(track: Track) {
  void load(track);
}
