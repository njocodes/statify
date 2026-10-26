"use client";
import { useEffect, useState } from "react";
import { useStatify } from "./StatifyProvider";
import type { ViewData } from "../worker/stats.worker";
import { yearStart } from "../format";

export function useView<T extends ViewData>(name: "behavior" | "discovery" | "podcasts") {
  const { ready, extent, view, settings, year, setYear } = useStatify();
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (!ready || !extent?.first) return;
    let cancelled = false;
    const from = year === null ? null : yearStart(year, settings.tz);
    const to = year === null ? null : yearStart(year + 1, settings.tz);
    view<T>(name, { from, to }).then((d) => !cancelled && setData(d));
    return () => {
      cancelled = true;
    };
  }, [ready, extent, year, settings.tz, settings.minPlayMs, view, name]);

  return { year, setYear, data, ready, hasData: !!extent?.first, years: extent?.years ?? [] };
}
