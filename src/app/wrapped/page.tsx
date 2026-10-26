"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { EmptyNotice } from "@/components/EmptyNotice";
import { FilterBar } from "@/components/FilterBar";
import { Cover } from "@/components/Cover";
import { Mascot } from "@/components/Mascot";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useDashboard } from "@/lib/store/useDashboard";
import { DAYS_PER_MONTH, fmtDec, fmtInt, hours } from "@/lib/format";
import { dominantGenre, hatOf, moodOf, type GenreMix } from "@/lib/theme/genres";
import { GENRE_THEME, type ThemeId } from "@/lib/theme/themes";
import type { TopItem } from "@/lib/stats/core";

const Big = ({ children }: { children: React.ReactNode }) => <div className="display text-5xl leading-none break-words">{children}</div>;
const Label = ({ children }: { children: React.ReactNode }) => <div className="text-sm uppercase tracking-wider text-muted">{children}</div>;

function Ranked({ items, by, lang }: { items: TopItem[]; by: "plays" | "ms"; lang: "en" | "de" }) {
  const max = items[0]?.[by] || 1;
  return (
    <ol className="w-full space-y-3">
      {items.map((it, i) => (
        <li key={it.key} className="flex items-center gap-3">
          <span className="display w-6 text-right text-xl">{i + 1}</span>
          <Cover uri={it.uri} label={it.title} size={44} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{it.title}</div>
            {it.subtitle && <div className="truncate text-xs text-muted">{it.subtitle}</div>}
            <div className="mt-1 h-1.5 rounded-full bg-surface2">
              <div className="h-1.5 rounded-full bg-accent" style={{ width: `${(it[by] / max) * 100}%` }} />
            </div>
          </div>
          <span className="shrink-0 text-xs text-muted">{by === "plays" ? `${fmtInt(it.plays, lang)}×` : `${fmtInt(it.ms / 3_600_000, lang)} h`}</span>
        </li>
      ))}
    </ol>
  );
}

export default function Wrapped() {
  const { t, settings, genreMix, autoTheme, theme: activeTheme } = useStatify();
  const { year, setYear, data, ready, hasData, years } = useDashboard();
  const lang = settings.lang;
  const [i, setI] = useState(0);
  const [saving, setSaving] = useState(false);
  const slide = useRef<HTMLDivElement>(null);

  // Every year gets the style of its own top genre; "all time" uses the overall one.
  const mix: GenreMix | null = (year !== null ? genreMix?.yearly?.[String(year)] : genreMix) ?? null;
  const genre = mix ? dominantGenre(mix) : null;
  const style: ThemeId = year === null ? autoTheme : genre ? GENRE_THEME[genre] : activeTheme;
  const look = { mood: mix ? moodOf(mix) : ("happy" as const), hat: hatOf(genre) };

  const scope = year === null ? t("all") : String(year);
  const heat = data?.heatmap ?? [];
  const dayMs = heat.map((row) => row.reduce((a, b) => a + b, 0));
  const hourMs = Array.from({ length: 24 }, (_, h) => heat.reduce((a, row) => a + (row[h] ?? 0), 0));
  const favDay = dayMs.indexOf(Math.max(...dayMs, 0));
  const favHour = hourMs.indexOf(Math.max(...hourMs, 0));
  const weekday = (d: number) => new Date(2024, 0, 1 + d).toLocaleDateString(lang, { weekday: "long" });
  const rec = data?.records[0];
  const h = data ? hours(data.overview.totalMs) : 0;

  const slides: React.ReactNode[] = data
    ? [
        <div key="intro" className="flex h-full flex-col items-center justify-center gap-5 text-center">
          <Mascot size={170} look={look} />
          <Label>{year === null ? t("wrIntroAll") : t("wrIntroYear")}</Label>
          <Big>{scope}</Big>
        </div>,
        <div key="hours" className="flex h-full flex-col justify-center gap-4">
          <Label>{scope}</Label>
          <Big>{fmtInt(h, lang)}</Big>
          <div className="text-xl">{t("wrHours")}</div>
          <div className="text-muted">
            ≈ {fmtInt(h / 24, lang)} {t("days")} · {fmtDec(h / 24 / DAYS_PER_MONTH, lang)} {t("months")}
          </div>
          <div className="text-muted">
            {fmtInt(data.overview.plays, lang)} {t("plays")}
          </div>
        </div>,
        <div key="artist" className="flex h-full flex-col justify-center gap-4">
          <Label>{t("wrTopArtist")}</Label>
          <Big>{data.top.artists.ms[0]?.title ?? "–"}</Big>
          <div className="text-muted">
            {fmtInt((data.top.artists.ms[0]?.ms ?? 0) / 3_600_000, lang)} h · {fmtInt(data.top.artists.ms[0]?.plays ?? 0, lang)} {t("plays")}
          </div>
        </div>,
        <div key="artists" className="flex h-full flex-col justify-center gap-5">
          <h2 className="display text-3xl">{t("topArtists")}</h2>
          <Ranked items={data.top.artists.ms.slice(0, 5)} by="ms" lang={lang} />
        </div>,
        <div key="tracks" className="flex h-full flex-col justify-center gap-5">
          <h2 className="display text-3xl">{t("topTracks")}</h2>
          <Ranked items={data.top.tracks.plays.slice(0, 5)} by="plays" lang={lang} />
        </div>,
        <div key="when" className="flex h-full flex-col justify-center gap-8">
          <div className="space-y-2">
            <Label>{t("wrFavDay")}</Label>
            <Big>{weekday(favDay)}</Big>
          </div>
          <div className="space-y-2">
            <Label>{t("wrFavHour")}</Label>
            <Big>{String(favHour).padStart(2, "0")}:00</Big>
          </div>
        </div>,
        <div key="streak" className="flex h-full flex-col justify-center gap-8">
          <div className="space-y-2">
            <Label>{t("streak")}</Label>
            <Big>
              {data.streak.longest} {t("days")}
            </Big>
          </div>
          {rec && (
            <div className="space-y-2">
              <Label>{t("wrRecord")}</Label>
              <div className="display text-3xl">{new Date(`${rec.day}T12:00:00`).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" })}</div>
              <div className="text-muted">{fmtDec(rec.ms / 3_600_000, lang)} h</div>
            </div>
          )}
        </div>,
        <div key="mood" className="flex h-full flex-col items-center justify-center gap-5 text-center">
          <Mascot size={170} look={look} />
          <Big>{look.mood === "sleepy" ? t("wrMoodSleepy") : look.mood === "grumpy" ? t("wrMoodGrumpy") : t("wrMoodHappy")}</Big>
          {genre && <div className="text-muted">{t(`genre_${genre}`)}</div>}
        </div>,
        <div key="outro" className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <div className="logo display text-4xl">Statify</div>
          <div className="text-muted">{t("wrOutro")} · {scope}</div>
        </div>,
      ]
    : [];

  const go = useCallback(
    (d: number) => setI((n) => Math.min(Math.max(n + d, 0), Math.max(slides.length - 1, 0))),
    [slides.length],
  );
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [go]);

  async function save() {
    if (!slide.current) return;
    setSaving(true);
    try {
      const url = await toPng(slide.current, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = url;
      a.download = `statify-wrapped-${scope}-${i + 1}.png`;
      a.click();
    } catch {
      // cover images without CORS headers cannot be inlined; the slide is still shown
    }
    setSaving(false);
  }

  if (ready && !hasData) return <EmptyNotice />;
  return (
    <div className="space-y-4">
      <FilterBar year={year} setYear={(y) => { setYear(y); setI(0); }} years={years} />
      {!data ? (
        <p className="text-muted">{t("loading")}</p>
      ) : (
        <div className="mx-auto w-fit max-w-full space-y-3">
          <div
            ref={slide}
            data-theme={style}
            className="relative max-w-full select-none overflow-hidden rounded-3xl"
            style={{ height: "min(calc(100dvh - 15rem), 640px)", aspectRatio: "9 / 16", background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-body)", border: "var(--bw) solid var(--border)" }}
          >
            <div className="absolute inset-x-4 top-4 z-10 flex gap-1" aria-hidden>
              {slides.map((_, n) => (
                <span key={n} className="h-1 flex-1 rounded-full" style={{ background: n <= i ? "var(--accent)" : "var(--surface-2)" }} />
              ))}
            </div>
            <div key={i} className="page-in h-full px-6 pb-10 pt-12">
              {slides[i]}
            </div>
            <button aria-label="Back" className="absolute inset-y-0 left-0 w-1/3" onClick={() => go(-1)} />
            <button aria-label="Next" className="absolute inset-y-0 right-0 w-2/3" onClick={() => go(1)} />
          </div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{t("wrNext")}</span>
            <button onClick={save} disabled={saving} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-onaccent disabled:opacity-60">
              {saving ? t("wrSaving") : t("wrSave")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
