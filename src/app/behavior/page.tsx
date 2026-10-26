"use client";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useView } from "@/lib/store/useView";
import type { BehaviorData } from "@/lib/stats/views";
import { FilterBar } from "@/components/FilterBar";
import { Stat } from "@/components/Stat";
import { DistList } from "@/components/DistList";
import { EmptyNotice } from "@/components/EmptyNotice";
import { fmtInt } from "@/lib/format";

export default function Behavior() {
  const { t, settings } = useStatify();
  const { year, setYear, data, ready, hasData, years } = useView<BehaviorData>("behavior");
  const pct = (x: number) => `${Math.round(x * 100)} %`;
  if (ready && !hasData) return <EmptyNotice />;
  return (
    <div className="space-y-6">
      <FilterBar year={year} setYear={setYear} years={years} />
      {!data ? (
        <p className="text-muted">{t("loading")}</p>
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
        </>
      )}
    </div>
  );
}
