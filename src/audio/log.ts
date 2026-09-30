/**
 * Test-mode sound log: every clip the page starts, with a wall-clock timestamp. The e2e video
 * recorder uses it to rebuild the soundtrack (browser screen recordings have no audio).
 * A no-op unless the page created `window.__ppSoundLog`.
 */
export function logSound(src: string, vol = 1, rate = 1) {
  const log = (globalThis as { __ppSoundLog?: { t: number; src: string; vol: number; rate: number }[] }).__ppSoundLog;
  if (log) log.push({ t: performance.timeOrigin + performance.now(), src, vol, rate });
}
