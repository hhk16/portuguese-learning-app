/** Counts down locally from the `msLeft` the TV sent with the view (re-synced on every view). */
import { useEffect, useState } from "react";

export function useCountdown(msLeft: number): number {
  const [end, setEnd] = useState(() => performance.now() + msLeft);
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => setEnd(performance.now() + msLeft), [msLeft]);
  useEffect(() => {
    const id = setInterval(() => setNow(performance.now()), 250);
    return () => clearInterval(id);
  }, []);
  return Math.max(0, end - now);
}
