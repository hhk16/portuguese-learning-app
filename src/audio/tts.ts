/**
 * PT-PT speech. Order of preference:
 *  1. pre-rendered curriculum audio (public/audio/manifest.json → text → file), built with an
 *     approved pt_PT voice (see ASSETS.md);
 *  2. the device's speech synthesis with a pt-PT voice (never pt-BR if pt-PT exists).
 * Provider-independent: curriculum data only stores text.
 */
let manifest: Record<string, string> | null = null;
let manifestLoad: Promise<void> | null = null;

export function loadAudioManifest(): Promise<void> {
  manifestLoad ??= fetch("/audio/manifest.json")
    .then((r) => (r.ok ? r.json() : {}))
    .then((m) => {
      manifest = m as Record<string, string>;
    })
    .catch(() => {
      manifest = {};
    });
  return manifestLoad;
}

export function audioKey(text: string): string {
  return text.trim().toLowerCase().normalize("NFC").replace(/\s+/g, " ");
}

let ptVoice: SpeechSynthesisVoice | null | undefined;
function pickVoice(): SpeechSynthesisVoice | null {
  if (ptVoice !== undefined && ptVoice !== null) return ptVoice;
  const voices = typeof speechSynthesis !== "undefined" ? speechSynthesis.getVoices() : [];
  ptVoice = voices.find((v) => v.lang === "pt-PT") ?? voices.find((v) => /pt[-_]PT/i.test(v.lang)) ?? voices.find((v) => v.lang.startsWith("pt")) ?? null;
  return ptVoice;
}
if (typeof speechSynthesis !== "undefined") speechSynthesis.onvoiceschanged = () => (ptVoice = undefined);

let currentAudio: HTMLAudioElement | null = null;

/** Whether this device can speak Portuguese (null = voices not loaded yet). */
export function hasPortugueseVoice(): boolean | null {
  if (manifest && Object.keys(manifest).length > 0) return true;
  if (typeof speechSynthesis === "undefined") return false;
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  return voices.some((v) => v.lang.toLowerCase().startsWith("pt"));
}

/** Name of the Portuguese voice in use (for the settings screen). */
export function voiceName(): string | null {
  return pickVoice()?.name ?? null;
}

export interface SpeakOpts {
  /** Learner mode: slower, clearer. */
  slow?: boolean;
  rate?: number;
  pitch?: number;
  /** MC voice: always device TTS, higher pitch. */
  character?: boolean;
}

export function speak(text: string, opts: SpeakOpts = {}): Promise<void> {
  const file = !opts.character ? manifest?.[audioKey(text)] : undefined;
  if (file) {
    currentAudio?.pause();
    const a = new Audio(`/audio/${file}`);
    currentAudio = a;
    return new Promise((resolve) => {
      a.onended = () => resolve();
      a.onerror = () => resolve();
      void a.play().catch(() => resolve());
    });
  }
  if (typeof speechSynthesis === "undefined") return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-PT";
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = opts.rate ?? (opts.character ? 1.1 : opts.slow ? 0.62 : 0.9);
    u.pitch = opts.pitch ?? (opts.character ? 1.6 : 1);
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    setTimeout(resolve, 6000); // never hang the game on a broken TTS engine
  });
}

/** iOS only lets speech start inside a user gesture the first time: call from a tap handler. */
let primed = false;
export function primeSpeech() {
  if (primed || typeof speechSynthesis === "undefined") return;
  primed = true;
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  speechSynthesis.speak(u);
}

export function stopSpeech() {
  currentAudio?.pause();
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}
