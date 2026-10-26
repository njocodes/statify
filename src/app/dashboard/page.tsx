"use client";
import { useEffect } from "react";
import { EmptyNotice } from "@/components/EmptyNotice";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useDashboard } from "@/lib/store/useDashboard";
import { FilterBar } from "@/components/FilterBar";
import { Stat } from "@/components/Stat";
import { Milestones } from "@/components/Milestones";
import { OnThisDay } from "@/components/OnThisDay";
import { TopList } from "@/components/TopList";
import { fetchCover } from "@/components/Cover";
import { blend, dominantColor, loadForPixels, type Rgb } from "@/lib/theme/coverColor";
import { DAYS_PER_MONTH, fmtDec, fmtInt, hours } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";

export default function Dashboard() {
  const { t, settings, setCoverColor } = useStatify();
  const { year, setYear, data, ready, hasData, years } = useDashboard();
  const L = settings.lang;

  // The all-time top covers decide the accent colour (only when no year filter is active).
  const topUris = year === null && data ? data.top.tracks.plays.slice(0, 6).map((x) => x.uri).join(",") : "";
  useEffect(() => {
    if (!topUris) return;
    let off = false;
    (async () => {
      const found: Rgb[] = [];
      for (const uri of topUris.split(",")) {
        const url = await fetchCover(uri);
        const img = url ? await loadForPixels(url) : null;
        const c = img && dominantColor(img);
        if (c) found.push(c);
      }
      if (!off && found.length) setCoverColor(blend(found));
    })();
    return () => {
      off = true;
    };
  }, [topUris, setCoverColor]);

  if (ready && !hasData) return <EmptyNotice />;

  return (
    <div className="space-y-6">
      <FilterBar year={year} setYear={setYear} years={years} />
      {!data ? (
        <Skeleton />
      ) : (
        <>
          <div className="stagger grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat
              label={t("hours")}
              count={hours(data.overview.totalMs)} format={(n) => fmtInt(n, L)}
              sub={`≈ ${fmtInt(hours(data.overview.totalMs) / 24, L)} ${t("days")} · ${fmtDec(hours(data.overview.totalMs) / 24 / DAYS_PER_MONTH, L)} ${t("months")}`}
            />
            <Stat label={t("plays")} count={data.overview.plays} format={(n) => fmtInt(n, L)} />
            <Stat label={t("tracks")} count={data.overview.uniqueTracks} format={(n) => fmtInt(n, L)} />
            <Stat label={t("artists")} count={data.overview.uniqueArtists} format={(n) => fmtInt(n, L)} />
            <Stat label={t("albums")} count={data.overview.uniqueAlbums} format={(n) => fmtInt(n, L)} />
            <Stat label={t("activeDays")} count={data.overview.activeDays} format={(n) => fmtInt(n, L)} />
            <Stat label={t("avgDay")} value={`${fmtInt(data.overview.avgMsPerActiveDay / 60000, L)} ${t("min")}`} />
            <Stat label={t("streak")} value={`${data.streak.longest} ${t("days")}`} />
          </div>
          <div className="stagger grid grid-cols-1 gap-4 lg:grid-cols-3">
            <TopList title={t("topTracks")} items={data.top.tracks} type="track" />
            <TopList title={t("topArtists")} items={data.top.artists} type="artist" />
            <TopList title={t("topAlbums")} items={data.top.albums} type="album" />
          </div>
          <div className="stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
            <OnThisDay />
            <Milestones />
          </div>
        </>
      )}
    </div>
  );
}
