"use client";
import Link from "next/link";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useDashboard } from "@/lib/store/useDashboard";
import { FilterBar } from "@/components/FilterBar";
import { Stat } from "@/components/Stat";
import { TopList } from "@/components/TopList";
import { DAYS_PER_MONTH, fmtDec, fmtInt, hours } from "@/lib/format";

export default function Dashboard() {
  const { t, settings } = useStatify();
  const { year, setYear, data, ready, hasData, years } = useDashboard();
  const L = settings.lang;

  if (ready && !hasData)
    return (
      <div className="space-y-3 pt-10 text-center">
        <p className="text-muted">{t("noData")}</p>
        <Link href="/" className="inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-onaccent">
          {t("goUpload")}
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <FilterBar year={year} setYear={setYear} years={years} />
      {!data ? (
        <p className="text-muted">{t("loading")}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat
              label={t("hours")}
              value={fmtInt(hours(data.overview.totalMs), L)}
              sub={`≈ ${fmtInt(hours(data.overview.totalMs) / 24, L)} ${t("days")} · ${fmtDec(hours(data.overview.totalMs) / 24 / DAYS_PER_MONTH, L)} ${t("months")}`}
            />
            <Stat label={t("plays")} value={fmtInt(data.overview.plays, L)} />
            <Stat label={t("tracks")} value={fmtInt(data.overview.uniqueTracks, L)} />
            <Stat label={t("artists")} value={fmtInt(data.overview.uniqueArtists, L)} />
            <Stat label={t("albums")} value={fmtInt(data.overview.uniqueAlbums, L)} />
            <Stat label={t("activeDays")} value={fmtInt(data.overview.activeDays, L)} />
            <Stat label={t("avgDay")} value={`${fmtInt(data.overview.avgMsPerActiveDay / 60000, L)} ${t("min")}`} />
            <Stat label={t("streak")} value={`${data.streak.longest} ${t("days")}`} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <TopList title={t("topTracks")} items={data.top.tracks} type="track" />
            <TopList title={t("topArtists")} items={data.top.artists} type="artist" />
            <TopList title={t("topAlbums")} items={data.top.albums} type="album" />
          </div>
        </>
      )}
    </div>
  );
}
