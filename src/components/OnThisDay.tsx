"use client";
import { useEffect, useState } from "react";
import { useStatify } from "@/lib/store/StatifyProvider";
import type { DayYear } from "@/lib/stats/extras";
import { Cover } from "./Cover";
import { fmtDec } from "@/lib/format";

export function OnThisDay() {
  const { t, settings, onThisDay, extent } = useStatify();
  const [days, setDays] = useState<DayYear[]>([]);
  useEffect(() => {
    if (!extent?.first) return;
    // today in the selected time zone, as MM-DD
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: settings.tz }).format(Date.now());
    let off = false;
    onThisDay(today.slice(5)).then((d) => !off && setDays(d.filter((x) => x.year !== today.slice(0, 4)).slice(0, 5)));
    return () => {
      off = true;
    };
  }, [extent, settings.tz, settings.minPlayMs, onThisDay]);
  if (!days.length) return null;
  return (
    <section className="card min-w-0 p-4">
      <h2 className="mb-3 font-semibold">{t("otdTitle")}</h2>
      <ul className="space-y-2">
        {days.map((d) => (
          <li key={d.year} className="flex items-center gap-3 text-sm">
            <span className="display w-12 shrink-0 text-lg">{d.year}</span>
            <Cover uri={d.uri} label={d.track} size={36} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{d.track}</div>
              <div className="truncate text-xs text-muted">{d.subtitle}</div>
            </div>
            <span className="shrink-0 text-xs text-muted">{fmtDec(d.ms / 3_600_000, settings.lang)} h</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
