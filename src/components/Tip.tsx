"use client";
import { useRef, useState, type PointerEvent, type RefObject } from "react";

/** Short hover/tap label for grid cells. `box` goes on the positioned wrapper, `bind(text)` on each cell. */
export function useTip(): { box: RefObject<HTMLDivElement | null>; bind: (text: string) => object; node: React.ReactNode } {
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const show = (e: PointerEvent<HTMLElement>, text: string) => {
    const b = box.current?.getBoundingClientRect();
    if (!b) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ text, x: Math.min(Math.max(r.left - b.left + r.width / 2, 44), b.width - 44), y: r.top - b.top });
  };
  const bind = (text: string) => ({
    onPointerEnter: (e: PointerEvent<HTMLElement>) => show(e, text),
    onPointerDown: (e: PointerEvent<HTMLElement>) => show(e, text),
    // on touch the label stays until another cell is tapped
    onPointerLeave: (e: PointerEvent<HTMLElement>) => e.pointerType === "mouse" && setTip(null),
  });
  const node = tip && (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-fg px-2 py-1 text-xs text-bg shadow-lg"
      style={{ left: tip.x, top: tip.y - 6 }}
    >
      {tip.text}
    </div>
  );
  return { box, bind, node };
}
