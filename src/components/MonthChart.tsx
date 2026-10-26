"use client";
import { ChartTooltip } from "./ChartTooltip";
import { useStatify } from "@/lib/store/StatifyProvider";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthChart({ months }: { months: { month: string; ms: number }[] }) {
  const { t } = useStatify();
  const data = months.map((m) => ({ month: m.month, h: Math.round(m.ms / 3.6e5) / 10 }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 4, top: 4 }}>
          <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 10 }} tickFormatter={(m: string) => (m.endsWith("-01") ? m.slice(0, 4) : "")} interval={0} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} content={<ChartTooltip unit=" h" />} />
          <Bar dataKey="h" name={t("hours")} fill="var(--accent)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
