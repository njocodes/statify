"use client";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useView } from "@/lib/store/useView";
import type { BehaviorData } from "@/lib/stats/views";
import { FilterBar } from "@/components/FilterBar";
import { Stat } from "@/components/Stat";
import { DistList } from "@/components/DistList";
import { EmptyNotice } from "@/components/EmptyNotice";
import { fmtInt } from "@/lib/format";
import { Cover } from "@/components/Cover";
import Link from "next/link";
import type { HabitItem, HabitsData } from "@/lib/stats/extras";
import { Skeleton } from "@/components/Skeleton";

function HabitList({ title, items, kind, entity }: { title: string; items: HabitItem[]; kind: "skip" | "times" | "runs"; entity: "track" | "artist" | "album" }) {
  const { t, settings } = useStatify();
  if (!items.length) return null;
  return (
    <section className="card min-w-0 p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <ol className="space-y-1">
        {items.map((it, i) => (
          <li key={it.key}>
            <Link href={`/item/?type=${entity}&id=${encodeURIComponent(it.key)}`} className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-transform duration-150 hover:bg-surface2 active:scale-[0.985]">
              <span className="w-4 shrink-0 text-right text-xs text-muted">{i + 1}</span>
              <Cover uri={it.uri} label={it.title} size={36} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium group-hover:text-accent">{it.title}</div>
                {it.subtitle && <div className="truncate text-xs text-muted">{it.subtitle}</div>}
              </div>
              <div className="shrink-0 text-right text-xs">
                <div className="font-semibold text-accent">{kind === "skip" ? `${Math.round(it.value * 100)} %` : kind === "times" ? `${fmtInt(it.value, settings.lang)} ${t("hbTimes")}` : `${fmtInt(it.value, settings.lang)} ${t("hbRuns")}`}</div>
                {kind === "skip" && <div className="text-muted">{fmtInt(it.total, settings.lang)} {t("hbEntries")}</div>}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Habits() {
  const { t } = useStatify();
  const { data } = useView<HabitsData>("habits");
  if (!data) return null;
  const pct = (x: number) => `${Math.round(x * 100)} %`;
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Stat label={t("hbSkipShuffle")} value={pct(data.skipRateShuffle)} />
        <Stat label={t("hbSkipDirect")} value={pct(data.skipRateDirect)} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HabitList title={t("hbMostSkipped")} items={data.skippedTracks} kind="skip" entity="track" />
        <HabitList title={t("hbMostSkippedArtists")} items={data.skippedArtists} kind="skip" entity="artist" />
        <HabitList title={t("hbRepeats")} items={data.repeats} kind="times" entity="track" />
        <HabitList title={t("hbAlbums")} items={data.albumRuns} kind="runs" entity="album" />
      </div>
    </>
  );
}

export default function Behavior() {
  const { t, settings } = useStatify();
  const { year, setYear, data, ready, hasData, years } = useView<BehaviorData>("behavior");
  const pct = (x: number) => `${Math.round(x * 100)} %`;
  if (ready && !hasData) return <EmptyNotice />;
  return (
    <div className="space-y-6">
      <FilterBar year={year} setYear={setYear} years={years} />
      {!data ? (
        <Skeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label={t("skipped")} value={pct(data.skipRate)} />
            <Stat label={t("shuffleShare")} value={pct(data.shuffleShare)} />
            <Stat label={t("offlineShare")} value={pct(data.offlineShare)} />
            <Stat label={t("incognito")} value={fmtInt(data.incognito, settings.lang)} />
          </div>
          <section className="card p-4">
            <h2 className="mb-3 font-semibold">{t("skipByYear")}</h2>
            <div className="flex items-end gap-3">
              {data.skipByYear.map((y) => (
                <div key={y.year} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs tabular-nums text-muted">{pct(y.rate)}</span>
                  <div className="w-full rounded-t bg-accent" style={{ height: `${Math.max(4, y.rate * 160)}px` }} />
                  <span className="text-xs text-muted">{y.year}</span>
                </div>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DistList title={t("startReasons")} items={data.startReasons} reasons />
            <DistList title={t("endReasons")} items={data.endReasons} reasons />
            <DistList title={t("platforms")} items={data.platforms} />
            <DistList title={t("countries")} items={data.countries} />
          </div>
          <Habits />
        </>
      )}
    </div>
  );
}
