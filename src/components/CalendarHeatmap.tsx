"use client";
import { useMemo } from "react";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useTip } from "./Tip";

type Cell = [string, number] | null;

/** One row block per year (53 week columns x 7 weekday rows), so it always fits the width. `days` = [YYYY-MM-DD, ms][] */
export function CalendarHeatmap({ days }: { days: [string, number][] }) {
  const { settings } = useStatify();
  const { box, bind, node } = useTip();
  const { years, max } = useMemo(() => {
    const map = new Map(days);
    const byYear = new Map<string, Cell[]>();
    for (const y of new Set(days.map((d) => d[0].slice(0, 4)))) {
      const cells: Cell[] = [];
      const first = new Date(`${y}-01-01T00:00:00Z`);
      for (let i = 0; i < (first.getUTCDay() + 6) % 7; i++) cells.push(null); // pad to Monday
      for (let d = new Date(first); d.getUTCFullYear() === Number(y); d.setUTCDate(d.getUTCDate() + 1)) {
        const k = d.toISOString().slice(0, 10);
        cells.push([k, map.get(k) ?? 0]);
      }
      byYear.set(y, cells);
    }
    return { years: [...byYear.entries()].sort(), max: Math.max(1, ...days.map((d) => d[1])) };
  }, [days]);

  return (
    <div ref={box} className="relative space-y-2">
      {node}
      {years.map(([y, cells]) => (
        <div key={y} className="flex items-start gap-2">
          <span className="w-8 shrink-0 pt-px text-[10px] leading-none text-muted">{y}</span>
          <div className="grid min-w-0 flex-1 gap-[1.5px]" style={{ gridTemplateRows: "repeat(7, auto)", gridAutoFlow: "column", gridAutoColumns: "minmax(0, 1fr)" }}>
            {cells.map((c, i) => (
              <div
                key={i}
                {...(c ? bind(`${new Date(`${c[0]}T12:00:00`).toLocaleDateString(settings.lang, { day: "numeric", month: "short", year: "numeric" })} · ${Math.round(c[1] / 60000)} min`) : {})}
                className="aspect-square rounded-[1.5px]"
                style={{ background: !c ? "transparent" : c[1] ? `color-mix(in srgb, var(--accent) ${Math.max(15, (c[1] / max) * 100)}%, var(--surface-2))` : "var(--surface-2)" }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
