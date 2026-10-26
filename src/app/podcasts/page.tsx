"use client";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useView } from "@/lib/store/useView";
import type { PodcastData } from "@/lib/stats/views";
import { FilterBar } from "@/components/FilterBar";
import { Stat } from "@/components/Stat";
import { TopList } from "@/components/TopList";
import { EmptyNotice } from "@/components/EmptyNotice";
import { fmtDuration, fmtInt } from "@/lib/format";

export default function Podcasts() {
  const { t, settings } = useStatify();
  const { year, setYear, data, ready, hasData, years } = useView<PodcastData>("podcasts");
  if (ready && !hasData) return <EmptyNotice />;
  return (
    <div className="space-y-6">
      <FilterBar year={year} setYear={setYear} years={years} />
      {!data ? (
        <p className="text-muted">{t("loading")}</p>
      ) : data.episodes === 0 && data.video.entries === 0 ? (
        <p className="text-muted">{t("noPodcasts")}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label={t("episodes")} value={fmtInt(data.episodes, settings.lang)} sub={fmtDuration(data.ms)} />
            <Stat label={t("video")} value={fmtInt(data.video.entries, settings.lang)} sub={fmtDuration(data.video.ms)} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.shows.plays.length > 0 && <TopList title={t("shows")} items={data.shows} type="artist" />}
            {data.items.plays.length > 0 && <TopList title={t("episodeList")} items={data.items} type="track" />}
          </div>
        </>
      )}
    </div>
  );
}
