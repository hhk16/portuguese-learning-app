/**
 * The TV's game clock: monotonic like performance.now(), but it stops while the game is paused.
 * Every rule timer (deadlines, boosts, word flashes) reads this, so pausing freezes the whole game
 * without having to shift individual timers. Phones sync to this clock (see net/host.ts pong) and
 * are told to resync after a resume.
 */
let pausedAt: number | null = null;
let offset = 0;

export function gameNow(): number {
  return (pausedAt ?? performance.now()) - offset;
}

export function pauseClock(): void {
  if (pausedAt === null) pausedAt = performance.now();
}

/** Returns how long the game was paused (ms). */
export function resumeClock(): number {
  if (pausedAt === null) return 0;
  const d = performance.now() - pausedAt;
  offset += d;
  pausedAt = null;
  return d;
}

export function clockPaused(): boolean {
  return pausedAt !== null;
}
