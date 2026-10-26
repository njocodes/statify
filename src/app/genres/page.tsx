"use client";
import { useState } from "react";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useView } from "@/lib/store/useView";
import type { GenreStats } from "@/lib/stats/extras";
import { GENRE_COLOR, GENRES, type Genre } from "@/lib/theme/themes";
import { useTip } from "@/components/Tip";
import { EmptyNotice } from "@/components/EmptyNotice";
import { fmtDec, fmtInt } from "@/lib/format";

const hoursOf = (ms: number) => ms / 3_600_000;

/** Each genre keeps its colour; its sub-genres are told apart by shade and a thin divider. */
const shade = (color: string, i: number) => (i === 0 ? color : `color-mix(in srgb, ${color} ${Math.max(45, 100 - i * 14)}%, white)`);

function YearBars({ data, label }: { data: GenreStats; label: (id: string, genre: Genre) => string }) {
  const { t, settings } = useStatify();
  const { box, bind, node } = useTip();
  const [open, setOpen] = useState<string | null>(null);
  const L = settings.lang;
  return (
    <div ref={box} className="relative space-y-1.5">
      {node}
      {data.years.map((y) => {
        const row = data.yearly[y];
        const total = Object.values(row).reduce((a, b) => a + (b ?? 0), 0) || 1;
        const isOpen = open === y;
        const genres = GENRES.filter((g) => row[g]).sort((a, b) => (row[b] ?? 0) - (row[a] ?? 0));
        return (
          <div key={y}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : y)} className="flex w-full items-center gap-2 rounded-md text-left active:opacity-80">
              <span className={`w-9 shrink-0 text-xs ${isOpen ? "font-semibold text-fg" : "text-muted"}`}>{y}</span>
              <div className="flex h-5 min-w-0 flex-1 overflow-hidden rounded-md" style={{ background: "var(--surface-2)" }}>
                {GENRES.filter((g) => row[g]).map((g) => {
                  const subs = Object.entries(data.yearlySubs[y]?.[g] ?? {}).sort((a, b) => b[1] - a[1]);
                  return (
                    <div key={g} className="flex" style={{ width: `${((row[g] ?? 0) / total) * 100}%` }}>
                      {subs.map(([id, ms], i) => (
                        <div
                          key={id}
                          {...bind(`${t(`genre_${g}`)}${id === g ? "" : ` › ${label(id, g)}`} · ${fmtInt((ms / total) * 100, L)} % · ${fmtDec(hoursOf(ms), L)} h`)}
                          style={{ width: `${(ms / (row[g] || 1)) * 100}%`, background: shade(GENRE_COLOR[g], i), boxShadow: i ? "inset 1px 0 0 rgba(0,0,0,0.45)" : undefined }}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
              <span aria-hidden className={`w-3 shrink-0 text-xs text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
            </button>
            {isOpen && (
              <div className="page-in mb-2 ml-11 mr-5 mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {genres.map((g) => {
                  const subs = Object.entries(data.yearlySubs[y]?.[g] ?? {}).sort((a, b) => b[1] - a[1]);
                  return (
                    <div key={g} className="min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: GENRE_COLOR[g] }} />
                          <span className="truncate">{t(`genre_${g}`)}</span>
                        </span>
                        <span className="shrink-0 text-muted">{fmtInt(((row[g] ?? 0) / total) * 100, L)} % · {fmtInt(hoursOf(row[g] ?? 0), L)} h</span>
                      </div>
                      {subs.slice(0, 5).map(([id, ms], i) => (
                        <div key={id} className="flex items-center gap-2 text-xs">
                          <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: shade(GENRE_COLOR[g], i) }} />
                          <span className="min-w-0 flex-1 truncate text-muted">{label(id, g)}</span>
                          <span className="shrink-0 tabular-nums text-muted">{fmtDec(hoursOf(ms), L)} h</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Genres() {
  const { t, settings } = useStatify();
  const { data, ready, hasData } = useView<GenreStats>("genres");
  if (ready && !hasData) return <EmptyNotice />;
  const L = settings.lang;
  const label = (id: string, genre: Genre) => (id === genre ? `${t(`genre_${genre}`)} · ${t("gnOther")}` : t(`sub_${id}` as never));
  const shown = data?.rows.filter((r) => r.ms / (data.matchedMs || 1) >= 0.01) ?? [];
  return (
    <div className="space-y-5">
      {!data ? (
        <p className="text-muted">{t("loading")}</p>
      ) : !shown.length ? (
        <p className="text-muted">{t("gnNone")}</p>
      ) : (
        <>
          <section className="card space-y-3 p-4">
            <h2 className="font-semibold">{t("gnTitle")}</h2>
            <YearBars data={data} label={label} />
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs text-muted">
              {shown.slice(0, 8).map((r) => (
                <span key={r.genre} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: GENRE_COLOR[r.genre] }} />
                  {t(`genre_${r.genre}`)}
                </span>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {shown.map((r) => (
              <section key={r.genre} className="card min-w-0 space-y-3 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <span className="h-3 w-3 rounded-sm" style={{ background: GENRE_COLOR[r.genre] }} />
                    {t(`genre_${r.genre}`)}
                  </h2>
                  <span className="text-sm text-muted">
                    {fmtInt(hoursOf(r.ms), L)} h · {fmtInt((r.ms / data.matchedMs) * 100, L)} %
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-muted">
                  <span>
                    {t("gnSkip")}: <b className="text-fg">{fmtInt(r.skipRate * 100, L)} %</b>
                  </span>
                  <span>
                    {t("gnNight")}: <b className="text-fg">{fmtInt(r.nightShare * 100, L)} %</b>
                  </span>
                </div>
                {r.subs.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted">{t("gnSubs")}</div>
                    {r.subs.map((s) => (
                      <div key={s.id} className="space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span className="truncate">{label(s.id, r.genre)}</span>
                          <span className="shrink-0 text-muted">{fmtDec(hoursOf(s.ms), L)} h</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "var(--surface-2)" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${(s.ms / r.ms) * 100}%`, background: GENRE_COLOR[r.genre] }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted">
                  {t("gnTopArtists")}: <span className="text-fg">{r.artists.map((a) => a.name).join(", ")}</span>
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
