"use client";
import Link from "next/link";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useView } from "@/lib/store/useView";
import type { DiscoveryData } from "@/lib/stats/views";
import { FilterBar } from "@/components/FilterBar";
import { BumpChart } from "@/components/BumpChart";
import { TopList } from "@/components/TopList";
import { EmptyNotice } from "@/components/EmptyNotice";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtDate, fmtInt } from "@/lib/format";

export default function Discovery() {
  const { t, settings } = useStatify();
  const { year, setYear, data, ready, hasData, years } = useView<DiscoveryData>("discovery");
  if (ready && !hasData) return <EmptyNotice />;
  const L = settings.lang;
  return (
    <div className="space-y-6">
      <FilterBar year={year} setYear={setYear} years={years} />
      {!data ? (
        <p className="text-muted">{t("loading")}</p>
      ) : (
        <>
          <section className="card space-y-3 p-4">
            <h2 className="font-semibold">{t("newArtists")}</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.newArtists} margin={{ left: -20, right: 4, top: 4 }}>
                  <XAxis dataKey="month" tick={{ fill: "#93a39a", fontSize: 10 }} tickFormatter={(m: string) => (m.endsWith("-01") ? m.slice(0, 4) : "")} interval={0} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#93a39a", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ background: "#151a17", border: "1px solid #2a332e", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#1ed760" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          {data.rankByYear.length > 1 && (
            <section className="card space-y-3 p-4">
              <h2 className="font-semibold">{t("rankByYear")}</h2>
              <BumpChart data={data} />
            </section>
          )}
          <section className="card p-4">
            <h2 className="mb-3 font-semibold">{t("monthlyTop")}</h2>
            <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {[...data.monthlyTop].reverse().map((m) => (
                <li key={m.month} className="flex justify-between gap-2">
                  <span className="text-muted">{m.month}</span>
                  <Link href={`/item/?type=artist&id=${encodeURIComponent(m.artist)}`} className="truncate hover:text-accent">
                    {m.artist}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="card p-4">
              <h2 className="mb-3 font-semibold">{t("discoveries")}</h2>
              <ol className="space-y-1 text-sm">
                {data.discoveries.map((d) => (
                  <li key={d.artist} className="flex justify-between gap-2">
                    <Link href={`/item/?type=artist&id=${encodeURIComponent(d.artist)}`} className="truncate hover:text-accent">
                      {d.artist}
                    </Link>
                    <span className="shrink-0 tabular-nums text-muted">
                      {fmtDate(d.first, L, settings.tz)} · {fmtInt(d.plays, L)}×
                    </span>
                  </li>
                ))}
              </ol>
            </section>
            {data.forgotten.length > 0 && (
              <div className="space-y-1">
                <p className="px-1 text-xs text-muted">{t("forgottenSub")}</p>
                <TopList title={t("forgotten")} items={{ plays: data.forgotten, ms: [...data.forgotten].sort((a, b) => b.ms - a.ms) }} type="track" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
