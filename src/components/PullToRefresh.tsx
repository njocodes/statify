"use client";
import { useEffect, useRef, useState } from "react";

const THRESHOLD = 80;

/** Pull down at the top of the page to reload; installed iOS web apps have no built-in refresh. */
export function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const start = useRef<number | null>(null);
  const dist = useRef(0);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (!standalone) return;
    const down = (e: TouchEvent) => {
      // only from the very top, and never while a sheet/dialog or fullscreen story is open
      start.current = window.scrollY <= 0 && e.touches.length === 1 && !document.querySelector("[data-no-ptr]") ? e.touches[0].clientY : null;
      dist.current = 0;
    };
    const move = (e: TouchEvent) => {
      if (start.current === null) return;
      const d = e.touches[0].clientY - start.current;
      if (d <= 0 || window.scrollY > 0) {
        start.current = null;
        dist.current = 0;
        return setPull(0);
      }
      dist.current = d;
      setPull(Math.min(d * 0.5, THRESHOLD * 1.3));
    };
    const up = () => {
      if (start.current !== null && dist.current * 0.5 >= THRESHOLD) {
        setBusy(true);
        location.reload();
      } else setPull(0);
      start.current = null;
    };
    window.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);
    window.addEventListener("touchcancel", up);
    return () => {
      window.removeEventListener("touchstart", down);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchcancel", up);
    };
  }, []);

  if (!pull && !busy) return null;
  const ready = pull >= THRESHOLD;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center" style={{ paddingTop: "env(safe-area-inset-top)", transform: `translateY(${busy ? THRESHOLD * 0.6 : pull * 0.6}px)` }}>
      <div className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface shadow-lg">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={busy ? "animate-spin text-accent" : ready ? "text-accent" : "text-muted"} style={busy ? undefined : { transform: `rotate(${(pull / THRESHOLD) * 270}deg)` }}>
          <path d="M20 12a8 8 0 11-2.5-5.8M20 4v5h-5" />
        </svg>
      </div>
    </div>
  );
}
