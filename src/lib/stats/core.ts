import type { Play } from "../parse/normalize";

export interface Filter {
  /** epoch ms, inclusive */
  from: number | null;
  /** epoch ms, exclusive */
  to: number | null;
  /** plays shorter than this don't count as a "play" (minutes still count) */
  minPlayMs: number;
  tz: string;
}

export const DEFAULT_MIN_PLAY_MS = 30_000;

export function applyFilter(plays: Play[], f: Filter, kind: Play["kind"] = "track"): Play[] {
  return plays.filter(
    (p) => p.kind === kind && (f.from === null || p.start >= f.from) && (f.to === null || p.start < f.to),
  );
}

export const counts = (p: Play, f: Filter) => p.ms >= f.minPlayMs;

export interface Overview {
  totalMs: number;
  plays: number;
  rawEntries: number;
  uniqueTracks: number;
  uniqueArtists: number;
  uniqueAlbums: number;
  activeDays: number;
  avgMsPerActiveDay: number;
  first: number | null;
  last: number | null;
}

const dayFmt = new Map<string, Intl.DateTimeFormat>();
const partsFmt = new Map<string, Intl.DateTimeFormat>();

export function dayKey(ts: number, tz: string): string {
  let fmt = dayFmt.get(tz);
  if (!fmt) dayFmt.set(tz, (fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz })));
  return fmt.format(ts); // YYYY-MM-DD
}

export function overview(plays: Play[], f: Filter): Overview {
  const tracks = new Set<string>();
  const artists = new Set<string>();
  const albums = new Set<string>();
  const days = new Set<string>();
  let totalMs = 0;
  let n = 0;
  let first: number | null = null;
  let last: number | null = null;
  for (const p of plays) {
    totalMs += p.ms;
    days.add(dayKey(p.start, f.tz));
    if (first === null || p.start < first) first = p.start;
    if (last === null || p.start > last) last = p.start;
    if (!counts(p, f)) continue;
    n++;
    tracks.add(p.uri);
    artists.add(p.artist);
    albums.add(`${p.artist}|${p.album}`);
  }
  return {
    totalMs,
    plays: n,
    rawEntries: plays.length,
    uniqueTracks: tracks.size,
    uniqueArtists: artists.size,
    uniqueAlbums: albums.size,
    activeDays: days.size,
    avgMsPerActiveDay: days.size ? totalMs / days.size : 0,
    first,
    last,
  };
}

export interface TopItem {
  key: string;
  title: string;
  subtitle: string;
  /** a track uri usable for oEmbed cover lookup */
  uri: string;
  plays: number;
  ms: number;
}

export type TopKind = "tracks" | "artists" | "albums";

export function top(plays: Play[], f: Filter, kind: TopKind, by: "plays" | "ms", limit = 50): TopItem[] {
  const m = new Map<string, TopItem>();
  for (const p of plays) {
    const key = kind === "tracks" ? p.uri : kind === "artists" ? p.artist : `${p.artist}|${p.album}`;
    let it = m.get(key);
    if (!it) {
      it = {
        key,
        title: kind === "tracks" ? p.title : kind === "artists" ? p.artist : p.album,
        subtitle: kind === "artists" ? "" : p.artist,
        uri: p.uri,
        plays: 0,
        ms: 0,
      };
      m.set(key, it);
    }
    it.ms += p.ms;
    if (counts(p, f)) it.plays++;
  }
  return [...m.values()].sort((a, b) => b[by] - a[by] || b.ms - a.ms).slice(0, limit);
}

const parts = (ts: number, tz: string) => {
  let fmt = partsFmt.get(tz);
  if (!fmt)
    partsFmt.set(
      tz,
      (fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", hour: "numeric", hour12: false })),
    );
  const d = fmt.formatToParts(ts);
  const wd = d.find((x) => x.type === "weekday")!.value;
  const h = Number(d.find((x) => x.type === "hour")!.value) % 24;
  return { wd: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(wd), h };
};

/** [weekday Mon=0..Sun=6][hour 0..23] -> ms */
export function weekHourHeatmap(plays: Play[], f: Filter): number[][] {
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const p of plays) {
    const { wd, h } = parts(p.start, f.tz);
    grid[wd][h] += p.ms;
  }
  return grid;
}

export function msPerDay(plays: Play[], f: Filter): Map<string, number> {
  const m = new Map<string, number>();
  for (const p of plays) {
    const k = dayKey(p.start, f.tz);
    m.set(k, (m.get(k) ?? 0) + p.ms);
  }
  return m;
}

export function msPerMonth(plays: Play[], f: Filter): { month: string; ms: number }[] {
  const m = new Map<string, number>();
  for (const [day, ms] of msPerDay(plays, f)) {
    const k = day.slice(0, 7);
    m.set(k, (m.get(k) ?? 0) + ms);
  }
  return [...m.entries()].sort().map(([month, ms]) => ({ month, ms }));
}

export function streaks(days: Iterable<string>): { longest: number; longestEnd: string | null; current: number } {
  const sorted = [...new Set(days)].sort();
  const toN = (d: string) => Math.round(Date.parse(d + "T00:00:00Z") / 86_400_000);
  let longest = 0;
  let longestEnd: string | null = null;
  let run = 0;
  let prev = -Infinity;
  for (const d of sorted) {
    const n = toN(d);
    run = n === prev + 1 ? run + 1 : 1;
    if (run > longest) {
      longest = run;
      longestEnd = d;
    }
    prev = n;
  }
  return { longest, longestEnd, current: run };
}

const SESSION_GAP_MS = 30 * 60_000;

export interface Sessions {
  count: number;
  longestMs: number;
  longestStart: number | null;
  avgMs: number;
}

export function sessions(plays: Play[]): Sessions {
  const s = [...plays].sort((a, b) => a.start - b.start);
  let count = 0;
  let longestMs = 0;
  let longestStart: number | null = null;
  let total = 0;
  let curStart = 0;
  let curEnd = -Infinity;
  const close = () => {
    if (count === 0) return;
    const len = curEnd - curStart;
    total += len;
    if (len > longestMs) {
      longestMs = len;
      longestStart = curStart;
    }
  };
  for (const p of s) {
    if (p.start - curEnd > SESSION_GAP_MS) {
      close();
      count++;
      curStart = p.start;
    }
    curEnd = Math.max(curEnd, p.start + p.ms);
  }
  close();
  return { count, longestMs, longestStart, avgMs: count ? total / count : 0 };
}
