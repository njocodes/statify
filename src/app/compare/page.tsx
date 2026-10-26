"use client";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStatify } from "@/lib/store/StatifyProvider";
import type { PeriodSummary } from "@/lib/stats/extras";
import { yearStart, fmtDec, fmtInt } from "@/lib/format";
import { GENRE_COLOR, GENRES } from "@/lib/theme/themes";
import { EmptyNotice } from "@/components/EmptyNotice";
import { ChartTooltip } from "@/components/ChartTooltip";

const field = "w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-fg";

type Metric = { id: string; label: string; get: (s: PeriodSummary) => number; fmt: (n: number) => string; unit: string };

/** Change against the previous column, the same arrows everywhere. */
function Delta({ a, b }: { a: number | null; b: number }) {
  if (!a) return null;
  const d = ((b - a) / a) * 100;
  if (Math.abs(d) < 0.5) return <span className="text-xs text-muted">±0 %</span>;
  return (
    <span className={`whitespace-nowrap text-xs font-semibold ${d > 0 ? "text-accent" : "text-muted"}`}>
      {d > 0 ? "▲" : "▼"} {fmtInt(Math.abs(d), "en")} %
    </span>
  );
}

function GenreBar({ s }: { s: PeriodSummary }) {
  const total = s.matchedMs || 1;
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
      {GENRES.filter((g) => s.genres[g]).map((g) => (
        <div key={g} style={{ width: `${((s.genres[g] ?? 0) / total) * 100}%`, background: GENRE_COLOR[g] }} />
      ))}
    </div>
  );
}

export default function Compare() {
  const { t, settings, extent, ready, periods } = useStatify();
  const L = settings.lang;
  const years = useMemo(() => (extent?.years ?? []).map(String), [extent]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [metricId, setMetricId] = useState("hours");
  const [rows, setRows] = useState<{ year: string; s: PeriodSummary }[] | null>(null);
  // the whole history by default; the range only narrows it
  const y0 = from || years[0] || "";
  const y1 = to || years[years.length - 1] || "";
  const [lo, hi] = Number(y0) <= Number(y1) ? [y0, y1] : [y1, y0];

  useEffect(() => {
    if (!ready || !extent?.first || !lo) return;
    const list = years.filter((y) => y >= lo && y <= hi);
    let off = false;
    periods(list.map((y) => ({ from: yearStart(Number(y), settings.tz), to: yearStart(Number(y) + 1, settings.tz) }))).then((r) => !off && setRows(list.map((year, i) => ({ year, s: r[i] }))));
    return () => {
      off = true;
    };
  }, [ready, extent, years, lo, hi, settings.tz, settings.minPlayMs, periods]);

  if (ready && !extent?.first) return <EmptyNotice />;

  const metrics: Metric[] = [
    { id: "hours", label: t("hours"), get: (s) => s.ms / 3_600_000, fmt: (n) => fmtInt(n, L), unit: " h" },
    { id: "plays", label: t("plays"), get: (s) => s.plays, fmt: (n) => fmtInt(n, L), unit: "" },
    { id: "artists", label: t("artists"), get: (s) => s.artists, fmt: (n) => fmtInt(n, L), unit: "" },
    { id: "tracks", label: t("tracks"), get: (s) => s.tracks, fmt: (n) => fmtInt(n, L), unit: "" },
    { id: "days", label: t("activeDays"), get: (s) => s.activeDays, fmt: (n) => fmtInt(n, L), unit: "" },
    { id: "skip", label: t("cmpSkip"), get: (s) => s.skipRate * 100, fmt: (n) => `${fmtDec(n, L)} %`, unit: " %" },
    { id: "night", label: t("cmpNight"), get: (s) => s.nightShare * 100, fmt: (n) => `${fmtDec(n, L)} %`, unit: " %" },
  ];
  const m = metrics.find((x) => x.id === metricId) ?? metrics[0];
  const yearSel = (v: string, set: (x: string) => void, label: string) => (
    <label className="block space-y-1">
      <span className="block text-xs text-muted">{label}</span>
      <select value={v} onChange={(e) => set(e.target.value)} className={field}>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
  const chart = (rows ?? []).map((r) => ({ year: r.year, value: Math.round(m.get(r.s) * 10) / 10 }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {yearSel(y0, setFrom, t("cmpFrom"))}
        {yearSel(y1, setTo, t("cmpTo"))}
        <label className="block space-y-1">
          <span className="block text-xs text-muted">{t("cmpMetric")}</span>
          <select value={metricId} onChange={(e) => setMetricId(e.target.value)} className={field}>
            {metrics.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!rows ? (
        <p className="text-muted">{t("loading")}</p>
      ) : (
        <>
          <section className="card space-y-2 p-4">
            <h2 className="font-semibold">{m.label}</h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ left: -12, right: 4, top: 8 }}>
                  <XAxis dataKey="year" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} content={<ChartTooltip unit={m.unit} />} />
                  <Bar dataKey="value" name={m.label} fill="var(--accent)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card p-4">
            {/* phone: year, genre mix and the chosen metric; from sm up every metric gets its own column */}
            <div className="grid items-center gap-x-4 gap-y-3 text-sm" style={{ gridTemplateColumns: `2.5rem minmax(0,1fr) auto` }}>
              {rows.map(({ year, s }, i) => {
                const prev = i > 0 ? rows[i - 1].s : null;
                return (
                  <div key={year} className="contents">
                    <span className="text-xs text-muted">{year}</span>
                    <div className="min-w-0 space-y-1">
                      <GenreBar s={s} />
                      <div className="truncate text-xs text-muted">{s.topArtists[0]?.title}</div>
                    </div>
                    <span className="text-right font-medium">
                      {m.fmt(m.get(s))}
                      <span className="ml-2 inline-block w-14 text-left">
                        <Delta a={prev ? m.get(prev) : null} b={m.get(s)} />
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card hidden p-4 sm:block">
            <div className="grid items-center gap-x-4 gap-y-2.5 text-sm" style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${metrics.length}, auto)` }}>
              <span />
              {metrics.map((x) => (
                <span key={x.id} className="text-right text-xs text-muted">
                  {x.label}
                </span>
              ))}
              {rows.map(({ year, s }, i) => (
                <div key={year} className="contents">
                  <span className="font-medium">{year}</span>
                  {metrics.map((x) => (
                    <span key={x.id} className="text-right">
                      {x.fmt(x.get(s))}
                      <span className="ml-1.5 inline-block w-14 text-left">
                        <Delta a={i > 0 ? x.get(rows[i - 1].s) : null} b={x.get(s)} />
                      </span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
