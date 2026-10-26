"use client";
import { useStatify } from "@/lib/store/StatifyProvider";
import { maybeKey } from "@/lib/i18n/dict";
import { fmtInt } from "@/lib/format";
import type { Dist } from "@/lib/stats/views";

export function DistList({ title, items, reasons = false, limit = 8 }: { title: string; items: Dist[]; reasons?: boolean; limit?: number }) {
  const { settings } = useStatify();
  const list = items.slice(0, limit);
  const total = items.reduce((a, d) => a + d.ms, 0) || 1;
  return (
    <section className="card p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <ul className="space-y-2">
        {list.map((d) => (
          <li key={d.key}>
            <div className="flex justify-between text-sm">
              <span className="truncate">{reasons ? maybeKey(settings.lang, `reason_${d.key}`) : d.key}</span>
              <span className="tabular-nums text-muted">
                {Math.round((d.ms / total) * 100)} % · {fmtInt(d.plays, settings.lang)}×
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-surface2">
              <div className="grow h-1.5 rounded-full bg-accent" style={{ width: `${(d.ms / (items[0]?.ms || 1)) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
