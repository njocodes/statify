import type { Play } from "../parse/normalize";

const DAY = 86_400_000;
export const TREND_WINDOWS = [30, 90, 365] as const;
export type TrendWindow = (typeof TREND_WINDOWS)[number];
const SPARK_BINS = 12;
const LIST_SIZE = 8;
/** minimum listening time in the recent window before something counts as a trend (ms) */
const MIN_MS: Record<TrendWindow, number> = { 30: 20 * 60_000, 90: 45 * 60_000, 365: 3 * 3_600_000 };

export interface TrendItem {
  key: string;
  title: string;
  subtitle: string;
  /** a track uri usable for the cover lookup */
  uri: string;
  recent: number;
  prev: number;
  /** listening time over the last two windows in 12 equal bins, oldest first */
  spark: number[];
}

export interface TrendGroup {
  rising: TrendItem[];
  falling: TrendItem[];
  newcomers: TrendItem[];
  comebacks: TrendItem[];
}

export interface TrendsData {
  /** end of the data: all windows are measured back from here */
  end: number;
  windows: Record<TrendWindow, Record<"artists" | "tracks", TrendGroup>>;
}

interface Acc {
  key: string;
  title: string;
  subtitle: string;
  uri: string;
  uriMs: Map<string, number>;
  recent: number;
  prev: number;
  first: number;
}

export function trends(all: Play[]): TrendsData {
  const tracks = all.filter((p) => p.kind === "track");
  const end = tracks.reduce((m, p) => Math.max(m, p.start), 0);
  const windows = {} as TrendsData["windows"];

  for (const w of TREND_WINDOWS) {
    const span = w * DAY;
    const out = {} as Record<"artists" | "tracks", TrendGroup>;
    for (const kind of ["artists", "tracks"] as const) {
      const keyOf = (p: Play) => (kind === "artists" ? p.artist : p.uri);
      const map = new Map<string, Acc>();
      for (const p of tracks) {
        const k = keyOf(p);
        let a = map.get(k);
        if (!a) {
          a = { key: k, title: kind === "artists" ? p.artist : p.title, subtitle: kind === "artists" ? "" : p.artist, uri: p.uri, uriMs: new Map(), recent: 0, prev: 0, first: p.start };
          map.set(k, a);
        }
        if (p.start < a.first) a.first = p.start;
        const age = end - p.start;
        if (age < span) {
          a.recent += p.ms;
          a.uriMs.set(p.uri, (a.uriMs.get(p.uri) ?? 0) + p.ms);
        } else if (age < 2 * span) a.prev += p.ms;
      }
      const min = MIN_MS[w];
      const cutoff = end - span;
      const all_ = [...map.values()];
      const pick = (list: Acc[], by: (a: Acc) => number) => list.sort((x, y) => by(y) - by(x)).slice(0, LIST_SIZE);
      const rising = pick(all_.filter((a) => a.prev > 0 && a.recent >= min && a.recent >= a.prev * 1.5), (a) => a.recent - a.prev);
      const falling = pick(all_.filter((a) => a.prev >= min && a.recent < a.prev * 0.5), (a) => a.prev - a.recent);
      const newcomers = pick(all_.filter((a) => a.first >= cutoff && a.recent >= min / 2), (a) => a.recent);
      const comebacks = pick(all_.filter((a) => a.prev === 0 && a.first < cutoff - span && a.recent >= min), (a) => a.recent);

      // sparkline: only for the items that are shown
      const shown = new Set([...rising, ...falling, ...newcomers, ...comebacks].map((a) => a.key));
      const spark = new Map<string, number[]>([...shown].map((k) => [k, new Array(SPARK_BINS).fill(0)]));
      for (const p of tracks) {
        const s = spark.get(keyOf(p));
        const age = end - p.start;
        if (!s || age >= 2 * span) continue;
        s[SPARK_BINS - 1 - Math.floor((age / (2 * span)) * SPARK_BINS)] += p.ms;
      }
      const toItem = (a: Acc): TrendItem => ({
        key: a.key,
        title: a.title,
        subtitle: a.subtitle,
        uri: kind === "artists" ? ([...a.uriMs.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? a.uri) : a.uri,
        recent: a.recent,
        prev: a.prev,
        spark: spark.get(a.key) ?? [],
      });
      out[kind] = { rising: rising.map(toItem), falling: falling.map(toItem), newcomers: newcomers.map(toItem), comebacks: comebacks.map(toItem) };
    }
    windows[w] = out;
  }
  return { end, windows };
}
