"use client";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartData } from "./ChartData";
import { ChartTooltip } from "./ChartTooltip";
import type { DiscoveryData } from "@/lib/stats/views";

const COLORS = ["var(--accent)", "#f5a524", "#4aa8ff", "#ff5c8a", "#b388ff", "#2dd4bf", "#ff8a4c", "#e0e04a", "#8ab4a0", "#ff6b6b"];
const MAX_RANK = 10;

export function BumpChart({ data }: { data: DiscoveryData }) {
  const rows = data.rankByYear.map((y) => {
    const r: Record<string, number | string | null> = { year: y.year };
    for (const a of data.rankArtists) {
      const hit = y.ranks.find((x) => x.artist === a);
      r[a] = hit && hit.rank <= MAX_RANK ? hit.rank : null;
    }
    return r;
  });
  return (
    <div className="h-80 w-full">
      <ChartData title="Top 10" rows={data.rankByYear.map((y) => [String(y.year), y.ranks.filter((x) => x.rank <= MAX_RANK).sort((a, b) => a.rank - b.rank).map((x) => `${x.rank}. ${x.artist}`).join(", ")])} />
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ left: -20, right: 12, top: 8 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis reversed domain={[1, MAX_RANK]} ticks={Array.from({ length: MAX_RANK }, (_, i) => i + 1)} tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip sort="asc" rank />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {data.rankArtists.map((a, i) => (
            <Line key={a} dataKey={a} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
