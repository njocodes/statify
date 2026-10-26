"use client";
import { useStatify } from "@/lib/store/StatifyProvider";
import { fmtDec } from "@/lib/format";
import { useTip } from "./Tip";

export function WeekHeatmap({ grid }: { grid: number[][] }) {
  const { t, settings } = useStatify();
  const { box, bind, node } = useTip();
  const days = [t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat"), t("sun")];
  const max = Math.max(1, ...grid.flat());
  return (
    <div ref={box} className="relative">
      {node}
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: "1.5rem repeat(24, minmax(0, 1fr))" }}>
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="text-center text-[9px] leading-none text-muted">
            {h % 6 === 0 ? h : ""}
          </div>
        ))}
        {grid.map((row, d) => (
          <div key={d} className="contents">
            <div className="pr-1 text-right text-[10px] leading-4 text-muted">{days[d]}</div>
            {row.map((ms, h) => (
              <div
                key={h}
                {...bind(`${days[d]} ${h}:00 · ${fmtDec(ms / 3.6e6, settings.lang)} h`)}
                className="aspect-square rounded-[3px]"
                style={{ background: ms ? `color-mix(in srgb, var(--accent) ${Math.max(8, (ms / max) * 100)}%, var(--surface-2))` : "var(--surface-2)" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
