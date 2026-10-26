"use client";
import { EmptyNotice } from "@/components/EmptyNotice";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useDashboard } from "@/lib/store/useDashboard";
import { FilterBar } from "@/components/FilterBar";
import { Stat } from "@/components/Stat";
import { WeekHeatmap } from "@/components/WeekHeatmap";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { MonthChart } from "@/components/MonthChart";
import { fmtDate, fmtDuration, fmtInt } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";

export default function Patterns() {
  const { t, settings } = useStatify();
  const { year, setYear, data, ready, hasData, years } = useDashboard();
  const L = settings.lang;

  if (ready && !hasData) return <EmptyNotice />;

  return (
    <div className="space-y-6">
      <FilterBar year={year} setYear={setYear} years={years} />
      {!data ? (
        <Skeleton />
      ) : (
        <>
          <section className="card space-y-3 p-4">
            <h2 className="font-semibold">{t("weekHour")}</h2>
            <WeekHeatmap grid={data.heatmap} />
          </section>
          <section className="card space-y-3 p-4">
            <h2 className="font-semibold">{t("perMonth")}</h2>
            <MonthChart months={data.months} />
          </section>
          <section className="card space-y-3 p-4">
            <h2 className="font-semibold">{t("calendar")}</h2>
            <CalendarHeatmap days={data.days} />
          </section>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label={t("sessions")} value={fmtInt(data.sessions.count, L)} />
            <Stat
              label={t("longestSession")}
              value={fmtDuration(data.sessions.longestMs)}
              sub={data.sessions.longestStart ? fmtDate(data.sessions.longestStart, L, settings.tz) : undefined}
            />
            <Stat label={t("avgSession")} value={fmtDuration(data.sessions.avgMs)} />
          </div>
          <section className="card p-4">
            <h2 className="mb-3 font-semibold">{t("records")}</h2>
            <ol className="space-y-1 text-sm">
              {data.records.map((r) => (
                <li key={r.day} className="flex justify-between">
                  <span className="text-muted">{fmtDate(r.day, L, settings.tz)}</span>
                  <span className="tabular-nums">{fmtDuration(r.ms)}</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
