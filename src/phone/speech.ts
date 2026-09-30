/** Browser speech recognition (Chrome/Android, Safari). Always an enhancement, never required. */
export type SR = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function getRecognizer(): SR | null {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return C ? new C() : null;
}

/**
 * Listen once. Resolves with the alternatives heard, [] if nothing was heard, or null when
 * recognition isn't available (no API, mic denied) — callers then fall back to self-judging.
 */
export function recognizeOnce(lang: string, onInterim?: (text: string) => void): { done: Promise<string[] | null>; abort: () => void } {
  const r = getRecognizer();
  if (!r) return { done: Promise.resolve(null), abort: () => {} };
  let settle: (v: string[] | null) => void = () => {};
  const done = new Promise<string[] | null>((res) => (settle = res));
  const all: string[] = [];
  r.lang = lang;
  r.interimResults = true;
  r.maxAlternatives = 5;
  r.continuous = false;
  r.onresult = (e) => {
    const res = e.results[e.results.length - 1]!;
    const alts = Array.from({ length: res.length }, (_, i) => res[i]!.transcript.trim());
    onInterim?.(alts[0] ?? "");
    if (res.isFinal) all.push(...alts);
  };
  r.onerror = (e) => settle(e.error === "not-allowed" || e.error === "service-not-allowed" ? null : all);
  r.onend = () => settle(all);
  try {
    r.start();
  } catch {
    settle(null);
  }
  return { done, abort: () => r.abort() };
}
