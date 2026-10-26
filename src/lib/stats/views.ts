import type { Play } from "../parse/normalize";
import { applyFilter, counts, dayKey, top, type Filter, type TopItem } from "./core";

export interface Dist {
  key: string;
  plays: number;
  ms: number;
}

const dist = (m: Map<string, Dist>) => [...m.values()].sort((a, b) => b.ms - a.ms);
function bump(m: Map<string, Dist>, key: string, p: Play, f: Filter) {
  let d = m.get(key);
  if (!d) m.set(key, (d = { key, plays: 0, ms: 0 }));
  d.ms += p.ms;
  if (counts(p, f)) d.plays++;
}

export interface BehaviorData {
  entries: number;
  skipRate: number;
  shuffleShare: number;
  offlineShare: number;
  incognito: number;
  startReasons: Dist[];
  endReasons: Dist[];
  platforms: Dist[];
  countries: Dist[];
  /** skip rate per year */
  skipByYear: { year: string; rate: number }[];
}

export function behavior(all: Play[], f: Filter): BehaviorData {
  const plays = applyFilter(all, f);
  const start = new Map<string, Dist>();
  const end = new Map<string, Dist>();
  const plat = new Map<string, Dist>();
  const country = new Map<string, Dist>();
  const years = new Map<string, { n: number; skipped: number }>();
  let skipped = 0;
  let shuffle = 0;
  let offline = 0;
  let incognito = 0;
  for (const p of plays) {
    if (p.skipped) skipped++;
    if (p.shuffle) shuffle++;
    if (p.offline) offline++;
    if (p.incognito) incognito++;
    bump(start, p.reasonStart, p, f);
    bump(end, p.reasonEnd, p, f);
    bump(plat, p.platform, p, f);
    bump(country, p.country || "??", p, f);
    const y = dayKey(p.start, f.tz).slice(0, 4);
    const yy = years.get(y) ?? { n: 0, skipped: 0 };
    yy.n++;
    if (p.skipped) yy.skipped++;
    years.set(y, yy);
  }
  const n = plays.length || 1;
  return {
    entries: plays.length,
    skipRate: skipped / n,
    shuffleShare: shuffle / n,
    offlineShare: offline / n,
    incognito,
    startReasons: dist(start),
    endReasons: dist(end),
    platforms: dist(plat),
    countries: dist(country),
    skipByYear: [...years.entries()].sort().map(([year, v]) => ({ year, rate: v.skipped / v.n })),
  };
}

export interface DiscoveryData {
  /** artists heard for the first time (>= 1 play entry) per month */
  newArtists: { month: string; count: number }[];
  /** month -> artist with most ms */
  monthlyTop: { month: string; artist: string; ms: number }[];
  /** top artists per year by minutes (for the bump chart) */
  rankByYear: { year: string; ranks: { artist: string; rank: number }[] }[];
  rankArtists: string[];
  forgotten: TopItem[];
  /** artists whose first play was in the current range, most played first */
  discoveries: { artist: string; first: number; plays: number }[];
  /** per month: listening time from artists first heard that month vs. artists already known */
  newShare: { month: string; newMs: number; knownMs: number }[];
  /** median days from an artist's first play to its 10th play (null when too little data) */
  adoptDays: number | null;
}

const FORGOTTEN_MIN_PLAYS = 15;
const FORGOTTEN_GAP_MS = 365 * 86_400_000;
const BUMP_TOP = 8;

export function discovery(all: Play[], f: Filter): DiscoveryData {
  const tracksAll = all.filter((p) => p.kind === "track");
  const dataEnd = tracksAll.reduce((m, p) => Math.max(m, p.start), 0);

  // First appearance over the complete history (not only the filtered range).
  const firstSeen = new Map<string, number>();
  for (const p of tracksAll) {
    const cur = firstSeen.get(p.artist);
    if (cur === undefined || p.start < cur) firstSeen.set(p.artist, p.start);
  }
  const plays = applyFilter(all, f);
  const inRange = (t: number) => (f.from === null || t >= f.from) && (f.to === null || t < f.to);

  const newByMonth = new Map<string, number>();
  for (const [, t] of firstSeen) {
    if (!inRange(t)) continue;
    const m = dayKey(t, f.tz).slice(0, 7);
    newByMonth.set(m, (newByMonth.get(m) ?? 0) + 1);
  }

  const perMonth = new Map<string, Map<string, number>>();
  const perYear = new Map<string, Map<string, number>>();
  const artistPlays = new Map<string, number>();
  for (const p of plays) {
    const d = dayKey(p.start, f.tz);
    for (const [m, key] of [
      [perMonth, d.slice(0, 7)],
      [perYear, d.slice(0, 4)],
    ] as const) {
      const a = m.get(key) ?? new Map<string, number>();
      a.set(p.artist, (a.get(p.artist) ?? 0) + p.ms);
      m.set(key, a);
    }
    if (counts(p, f)) artistPlays.set(p.artist, (artistPlays.get(p.artist) ?? 0) + 1);
  }

  const monthlyTop = [...perMonth.entries()].sort().map(([month, a]) => {
    const [artist, ms] = [...a.entries()].sort((x, y) => y[1] - x[1])[0];
    return { month, artist, ms };
  });

  const rankByYear = [...perYear.entries()].sort().map(([year, a]) => ({
    year,
    ranks: [...a.entries()]
      .sort((x, y) => y[1] - x[1])
      .map(([artist], i) => ({ artist, rank: i + 1 })),
  }));
  const rankArtists = [
    ...new Set(rankByYear.flatMap((y) => y.ranks.filter((r) => r.rank <= BUMP_TOP).map((r) => r.artist))),
  ];

  // Tracks played a lot overall but not for more than a year.
  const lastPlay = new Map<string, number>();
  for (const p of tracksAll) lastPlay.set(p.uri, Math.max(lastPlay.get(p.uri) ?? 0, p.start));
  const forgotten = top(tracksAll, f, "tracks", "plays", Infinity)
    .filter((t) => t.plays >= FORGOTTEN_MIN_PLAYS && dataEnd - (lastPlay.get(t.key) ?? 0) > FORGOTTEN_GAP_MS)
    .slice(0, 20);

  const discoveries = [...firstSeen.entries()]
    .filter(([, t]) => inRange(t))
    .map(([artist, first]) => ({ artist, first, plays: artistPlays.get(artist) ?? 0 }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 20);

  const newShareMap = new Map<string, { newMs: number; knownMs: number }>();
  for (const p of plays) {
    const m = dayKey(p.start, f.tz).slice(0, 7);
    const isNew = dayKey(firstSeen.get(p.artist) ?? p.start, f.tz).slice(0, 7) === m;
    const e = newShareMap.get(m) ?? { newMs: 0, knownMs: 0 };
    if (isNew) e.newMs += p.ms;
    else e.knownMs += p.ms;
    newShareMap.set(m, e);
  }
  // adoption speed: days until an artist reaches 10 counted plays (skip the first month, where everything is "new")
  const dataStart = tracksAll.reduce((m, p) => Math.min(m, p.start), Infinity);
  const counted = new Map<string, number>();
  const gaps: number[] = [];
  for (const p of [...tracksAll].sort((a, b) => a.start - b.start)) {
    if (!counts(p, f)) continue;
    const n = (counted.get(p.artist) ?? 0) + 1;
    counted.set(p.artist, n);
    const first = firstSeen.get(p.artist) ?? p.start;
    if (n === 10 && first > dataStart + 30 * 86_400_000) gaps.push((p.start - first) / 86_400_000);
  }
  gaps.sort((a, b) => a - b);

  return {
    newShare: [...newShareMap.entries()].sort().map(([month, v]) => ({ month, ...v })),
    adoptDays: gaps.length >= 5 ? Math.round(gaps[Math.floor(gaps.length / 2)]) : null,
    newArtists: [...newByMonth.entries()].sort().map(([month, count]) => ({ month, count })),
    monthlyTop,
    rankByYear,
    rankArtists,
    forgotten,
    discoveries,
  };
}

export interface PodcastData {
  episodes: number;
  ms: number;
  shows: Record<"plays" | "ms", TopItem[]>;
  items: Record<"plays" | "ms", TopItem[]>;
  audiobooks: Record<"plays" | "ms", TopItem[]>;
  video: { entries: number; ms: number };
}

export function podcasts(all: Play[], f: Filter): PodcastData {
  const eps = applyFilter(all, f, "episode");
  const books = applyFilter(all, f, "audiobook");
  const t = (list: Play[], kind: "tracks" | "artists") => ({
    plays: top(list, f, kind, "plays"),
    ms: top(list, f, kind, "ms"),
  });
  const vids = all.filter((p) => p.video && (f.from === null || p.start >= f.from) && (f.to === null || p.start < f.to));
  return {
    episodes: eps.length,
    ms: eps.reduce((a, p) => a + p.ms, 0),
    shows: t(eps, "artists"),
    items: t(eps, "tracks"),
    audiobooks: t(books, "artists"),
    video: { entries: vids.length, ms: vids.reduce((a, p) => a + p.ms, 0) },
  };
}
