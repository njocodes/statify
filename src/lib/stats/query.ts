import type { Play } from "../parse/normalize";
import {
  applyFilter,
  dayKey,
  msPerDay,
  msPerMonth,
  overview,
  sessions,
  streaks,
  top,
  weekHourHeatmap,
  type Filter,
  type Overview,
  type Sessions,
  type TopItem,
} from "./core";

export interface DashboardData {
  overview: Overview;
  top: Record<"tracks" | "artists" | "albums", Record<"plays" | "ms", TopItem[]>>;
  heatmap: number[][];
  months: { month: string; ms: number }[];
  days: [string, number][];
  streak: { longest: number; longestEnd: string | null; current: number };
  sessions: Sessions;
  records: { day: string; ms: number }[];
}

export interface Extent {
  first: number | null;
  last: number | null;
  years: number[];
  counts: Record<"track" | "episode" | "audiobook", number>;
}

export function extent(plays: Play[], tz: string): Extent {
  let first: number | null = null;
  let last: number | null = null;
  const years = new Set<number>();
  const counts = { track: 0, episode: 0, audiobook: 0 };
  for (const p of plays) {
    counts[p.kind]++;
    if (first === null || p.start < first) first = p.start;
    if (last === null || p.start > last) last = p.start;
    years.add(Number(dayKey(p.start, tz).slice(0, 4)));
  }
  return { first, last, years: [...years].sort((a, b) => a - b), counts };
}

export function dashboard(all: Play[], f: Filter): DashboardData {
  const plays = applyFilter(all, f);
  const days = msPerDay(plays, f);
  const kinds = ["tracks", "artists", "albums"] as const;
  const tops = {} as DashboardData["top"];
  for (const k of kinds) tops[k] = { plays: top(plays, f, k, "plays"), ms: top(plays, f, k, "ms") };
  return {
    overview: overview(plays, f),
    top: tops,
    heatmap: weekHourHeatmap(plays, f),
    months: msPerMonth(plays, f),
    days: [...days.entries()].sort(),
    streak: streaks(days.keys()),
    sessions: sessions(plays),
    records: [...days.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([day, ms]) => ({ day, ms })),
  };
}
