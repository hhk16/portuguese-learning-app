/** Re-render every `ms` while `on` (for timers and patience bars). */
import { useEffect, useState } from "react";

export function useTick(ms = 200, on = true) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => force((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [ms, on]);
}
