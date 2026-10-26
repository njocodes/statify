"use client";
import type { TooltipContentProps } from "recharts";
import { fmtMonth } from "@/lib/format-month";
import { useStatify } from "@/lib/store/StatifyProvider";

type Opts = {
  /** order rows by value ascending (rank charts) or descending (default) */
  sort?: "asc" | "desc" | "none";
  /** "#3" instead of "3" */
  rank?: boolean;
  /** appended to values, e.g. " h" */
  unit?: string;
  /** show the total of all rows (stacked bars) */
  total?: boolean;
};

/** One tooltip for every chart: themed card, month labels spelled out, a coloured dot and a name on every row. */
export function ChartTooltip({ active, payload, label, sort = "desc", rank, unit = "", total }: Partial<TooltipContentProps<number, string>> & Opts) {
  const { settings } = useStatify();
  if (!active || !payload?.length) return null;
  const head = typeof label === "string" && /^\d{4}-\d{2}$/.test(label) ? fmtMonth(label, settings.lang) : String(label ?? "");
  const rows = payload.filter((p) => p.value !== null && p.value !== undefined && p.name !== undefined);
  if (sort !== "none") rows.sort((a, b) => (sort === "asc" ? Number(a.value) - Number(b.value) : Number(b.value) - Number(a.value)));
  const sum = rows.reduce((a, p) => a + Number(p.value), 0);
  const fmt = (v: number) => (rank ? `#${v}` : `${(Math.round(v * 10) / 10).toLocaleString(settings.lang)}${unit}`);
  return (
    <div className="max-w-[16rem] rounded-xl border border-line bg-surface px-3 py-2 text-xs text-fg shadow-xl">
      <div className="mb-1 font-semibold">{head}</div>
      <ul className="space-y-0.5">
        {rows.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center gap-2">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color ?? p.fill ?? "var(--accent)" }} />
            <span className="min-w-0 flex-1 truncate">{p.name}</span>
            <span className="tabular-nums text-muted">{fmt(Number(p.value))}</span>
          </li>
        ))}
      </ul>
      {total && rows.length > 1 && (
        <div className="mt-1 flex justify-between border-t border-line pt-1 font-medium">
          <span>Σ</span>
          <span className="tabular-nums">{fmt(sum)}</span>
        </div>
      )}
    </div>
  );
}
