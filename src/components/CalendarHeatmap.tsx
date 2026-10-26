"use client";
import { useMemo } from "react";

/** GitHub-style: columns = weeks, rows = Mon..Sun. `days` = [YYYY-MM-DD, ms][] */
export function CalendarHeatmap({ days }: { days: [string, number][] }) {
  const { weeks, max } = useMemo(() => {
    if (!days.length) return { weeks: [] as ([string, number] | null)[][], max: 1 };
    const map = new Map(days);
    const toDate = (s: string) => new Date(s + "T00:00:00Z");
    const start = toDate(days[0][0]);
    start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7)); // back to Monday
    const end = toDate(days[days.length - 1][0]);
    const weeks: ([string, number] | null)[][] = [];
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 7)) {
      const week: ([string, number] | null)[] = [];
      for (let i = 0; i < 7; i++) {
        const x = new Date(d);
        x.setUTCDate(x.getUTCDate() + i);
        const k = x.toISOString().slice(0, 10);
        week.push(x > end ? null : [k, map.get(k) ?? 0]);
      }
      weeks.push(week);
    }
    return { weeks, max: Math.max(1, ...days.map((d) => d[1])) };
  }, [days]);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-[3px]" style={{ width: "max-content" }}>
        {weeks.map((w, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {w.map((c, j) => (
              <div
                key={j}
                title={c ? `${c[0]} – ${Math.round(c[1] / 60000)} min` : ""}
                className="h-3 w-3 rounded-[2px]"
                style={{
                  background: !c
                    ? "transparent"
                    : c[1]
                      ? `color-mix(in srgb, var(--accent) ${Math.max(15, (c[1] / max) * 100)}%, var(--surface-2))`
                      : "var(--surface-2)",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
