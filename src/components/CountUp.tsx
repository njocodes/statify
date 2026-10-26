"use client";
import { useEffect, useRef, useState } from "react";

const calm = () => {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced";
  } catch {
    return true;
  }
};

/** Counts from the previous value to `to` with an ease-out; shows the final number immediately when motion is reduced. */
export function CountUp({ to, format, ms = 900 }: { to: number; format: (n: number) => string; ms?: number }) {
  const [shown, setShown] = useState(() => (calm() ? to : 0));
  const from = useRef<number | null>(null);
  const live = useRef(to);

  useEffect(() => {
    const start = from.current ?? 0;
    from.current = to;
    if (calm() || start === to) {
      live.current = to;
      setShown(to);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      live.current = start + (to - start) * eased;
      setShown(live.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);

  return <>{format(shown)}</>;
}
