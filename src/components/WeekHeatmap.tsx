"use client";
import { useStatify } from "@/lib/store/StatifyProvider";

export function WeekHeatmap({ grid }: { grid: number[][] }) {
  const { t } = useStatify();
  const days = [t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat"), t("sun")];
  const max = Math.max(1, ...grid.flat());
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[520px] gap-[3px]" style={{ gridTemplateColumns: "2rem repeat(24, 1fr)" }}>
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="text-center text-[10px] text-muted">
            {h % 3 === 0 ? h : ""}
          </div>
        ))}
        {grid.map((row, d) => (
          <div key={d} className="contents">
            <div className="pr-1 text-right text-[10px] leading-5 text-muted">{days[d]}</div>
            {row.map((ms, h) => (
              <div
                key={h}
                title={`${days[d]} ${h}:00 – ${Math.round(ms / 3.6e6)} h`}
                className="h-5 rounded-[3px]"
                style={{ background: ms ? `color-mix(in srgb, var(--accent) ${Math.max(8, (ms / max) * 100)}%, var(--surface-2))` : "var(--surface-2)" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
