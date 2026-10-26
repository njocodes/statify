"use client";
import { useEffect, useState } from "react";
import { useStatify } from "./StatifyProvider";
import type { DashboardData } from "../stats/query";
import { yearStart } from "../format";

export function useDashboard() {
  const { ready, extent, dashboard, settings, year, setYear } = useStatify();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!ready || !extent?.first) return;
    let cancelled = false;
    const from = year === null ? null : yearStart(year, settings.tz);
    const to = year === null ? null : yearStart(year + 1, settings.tz);
    dashboard({ from, to }).then((d) => !cancelled && setData(d));
    return () => {
      cancelled = true;
    };
  }, [ready, extent, year, settings.tz, settings.minPlayMs, dashboard]);

  return { year, setYear, data, ready, hasData: !!extent?.first, years: extent?.years ?? [] };
}
