"use client";
import { useEffect, useState } from "react";
import { useStatify } from "@/lib/store/StatifyProvider";
import type { PeriodSummary } from "@/lib/stats/extras";
import { yearStart, fmtDec, fmtInt } from "@/lib/format";
import { GENRE_COLOR, GENRES } from "@/lib/theme/themes";
import { EmptyNotice } from "@/components/EmptyNotice";

const ALL = "all";
const field = "w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-fg";

function Delta({ a, b }: { a: number; b: number }) {
  if (!a) return null;
  const d = ((b - a) / a) * 100;
  if (Math.abs(d) < 0.5) return <span className="text-xs text-muted">±0 %</span>;
  return <span className={`text-xs font-semibold ${d > 0 ? "text-accent" : "text-muted"}`}>{d > 0 ? "▲" : "▼"} {fmtInt(Math.abs(d), "en")} %</span>;
}

function GenreBar({ s }: { s: PeriodSummary }) {
  const total = s.matchedMs || 1;
  return (
    <div className="flex h-3 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
      {GENRES.filter((g) => s.genres[g]).map((g) => (
        <div key={g} style={{ width: `${((s.genres[g] ?? 0) / total) * 100}%`, background: GENRE_COLOR[g] }} />
      ))}
    </div>
  );
}

export default function Compare() {
  const { t, settings, extent, ready, compare } = useStatify();
  const years = [...(extent?.years ?? [])].reverse();
  // by default the latest year against the one before it
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  const [res, setRes] = useState<[PeriodSummary, PeriodSummary] | null>(null);
  const L = settings.lang;
  const ya = a || String(years[1] ?? ALL);
  const yb = b || String(years[0] ?? ALL);

  useEffect(() => {
    if (!ready || !extent?.first) return;
    const per = (v: string) => (v === ALL ? { from: null, to: null } : { from: yearStart(Number(v), settings.tz), to: yearStart(Number(v) + 1, settings.tz) });
    let off = false;
    compare(per(ya), per(yb)).then((r) => !off && setRes(r));
    return () => {
      off = true;
    };
  }, [ready, extent, ya, yb, settings.tz, settings.minPlayMs, compare]);

  if (ready && !extent?.first) return <EmptyNotice />;
  const sel = (v: string, set: (x: string) => void, label: string) => (
    <label className="block space-y-1">
      <span className="block text-xs text-muted">{label}</span>
      <select value={v} onChange={(e) => set(e.target.value)} className={field}>
        <option value={ALL}>{t("all")}</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
  const rows: [string, (s: PeriodSummary) => number, (n: number) => string][] = [
    [t("hours"), (s) => s.ms / 3_600_000, (n) => fmtInt(n, L)],
    [t("plays"), (s) => s.plays, (n) => fmtInt(n, L)],
    [t("artists"), (s) => s.artists, (n) => fmtInt(n, L)],
    [t("tracks"), (s) => s.tracks, (n) => fmtInt(n, L)],
    [t("activeDays"), (s) => s.activeDays, (n) => fmtInt(n, L)],
    [t("cmpSkip"), (s) => s.skipRate * 100, (n) => `${fmtDec(n, L)} %`],
    [t("cmpNight"), (s) => s.nightShare * 100, (n) => `${fmtDec(n, L)} %`],
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {sel(ya, setA, t("cmpA"))}
        {sel(yb, setB, t("cmpB"))}
      </div>
      {!res ? (
        <p className="text-muted">{t("loading")}</p>
      ) : (
        <>
          <section className="card p-4">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-2.5 text-sm">
              <span />
              <span className="text-right text-xs text-muted">{ya === ALL ? t("all") : ya}</span>
              <span className="text-right text-xs text-muted">{yb === ALL ? t("all") : yb}</span>
              {rows.map(([label, get, fmt]) => (
                <div key={label} className="contents">
                  <span className="text-muted">{label}</span>
                  <span className="text-right font-medium">{fmt(get(res[0]))}</span>
                  <span className="text-right font-medium">
                    {fmt(get(res[1]))} <Delta a={get(res[0])} b={get(res[1])} />
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="card space-y-3 p-4">
            <h2 className="font-semibold">{t("cmpGenres")}</h2>
            {res.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-xs text-muted">{i === 0 ? (ya === ALL ? t("all") : ya) : yb === ALL ? t("all") : yb}</span>
                <div className="min-w-0 flex-1">
                  <GenreBar s={s} />
                </div>
              </div>
            ))}
          </section>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {res.map((s, i) => (
              <section key={i} className="card min-w-0 space-y-2 p-4">
                <h2 className="font-semibold">
                  {t("topArtists")} · {i === 0 ? (ya === ALL ? t("all") : ya) : yb === ALL ? t("all") : yb}
                </h2>
                <ol className="space-y-1 text-sm">
                  {s.topArtists.map((x, n) => (
                    <li key={x.key} className="flex gap-2">
                      <span className="w-4 text-right text-muted">{n + 1}</span>
                      <span className="min-w-0 flex-1 truncate">{x.title}</span>
                      <span className="shrink-0 text-xs text-muted">{fmtInt(x.ms / 3_600_000, L)} h</span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
