"use client";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthChart({ months }: { months: { month: string; ms: number }[] }) {
  const data = months.map((m) => ({ month: m.month, h: Math.round(m.ms / 3.6e5) / 10 }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 4, top: 4 }}>
          <XAxis dataKey="month" tick={{ fill: "#93a39a", fontSize: 10 }} tickFormatter={(m: string) => (m.endsWith("-01") ? m.slice(0, 4) : "")} interval={0} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#93a39a", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{ background: "#151a17", border: "1px solid #2a332e", borderRadius: 8, fontSize: 12 }}
            formatter={(v) => [`${v} h`, ""]}
            labelStyle={{ color: "#93a39a" }}
          />
          <Bar dataKey="h" fill="#1ed760" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
