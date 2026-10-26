import type { Play } from "../parse/normalize";
import { counts, dayKey, parts, top, type Filter, type TopItem } from "./core";
import { genreOf, subGenreOf } from "../theme/genres";
import type { Genre } from "../theme/themes";

const tracksOf = (all: Play[]) => all.filter((p) => p.kind === "track");
const HOUR = 3_600_000;

// ---------- genres over time ----------
export interface GenreRow {
  genre: Genre;
  ms: number;
  plays: number;
  skipRate: number;
  /** share of its listening time between 00:00 and 05:00 */
  nightShare: number;
  subs: { id: string; ms: number }[];
  artists: { name: string; ms: number }[];
}

export interface GenreStats {
  years: string[];
  /** ms per genre for every calendar year */
  yearly: Record<string, Partial<Record<Genre, number>>>;
  rows: GenreRow[];
  totalMs: number;
  matchedMs: number;
}

export function genreStats(all: Play[], f: Filter): GenreStats {
  const yearly: GenreStats["yearly"] = {};
  const rows = new Map<Genre, { ms: number; plays: number; skipped: number; n: number; night: number; subs: Map<string, number>; artists: Map<string, number> }>();
  let totalMs = 0;
  let matchedMs = 0;
  const cache = new Map<string, ReturnType<typeof subGenreOf>>();
  for (const p of tracksOf(all)) {
    totalMs += p.ms;
    let g = cache.get(p.artist);
    if (g === undefined) cache.set(p.artist, (g = subGenreOf(p.artist)));
    if (!g) continue;
    matchedMs += p.ms;
    const y = dayKey(p.start, f.tz).slice(0, 4);
    (yearly[y] ??= {})[g.genre] = (yearly[y][g.genre] ?? 0) + p.ms;
    let r = rows.get(g.genre);
    if (!r) rows.set(g.genre, (r = { ms: 0, plays: 0, skipped: 0, n: 0, night: 0, subs: new Map(), artists: new Map() }));
    r.ms += p.ms;
    r.n++;
    if (counts(p, f)) r.plays++;
    if (p.skipped) r.skipped++;
    if (parts(p.start, f.tz).h < 5) r.night += p.ms;
    r.subs.set(g.sub, (r.subs.get(g.sub) ?? 0) + p.ms);
    r.artists.set(p.artist, (r.artists.get(p.artist) ?? 0) + p.ms);
  }
  const sorted = <T extends [string, number]>(m: Map<string, number>, n: number) => ([...m.entries()] as T[]).sort((a, b) => b[1] - a[1]).slice(0, n);
  return {
    years: Object.keys(yearly).sort(),
    yearly,
    totalMs,
    matchedMs,
    rows: [...rows.entries()]
      .map(([genre, r]) => ({
        genre,
        ms: r.ms,
        plays: r.plays,
        skipRate: r.n ? r.skipped / r.n : 0,
        nightShare: r.ms ? r.night / r.ms : 0,
        subs: sorted(r.subs, 12).map(([id, ms]) => ({ id, ms })),
        artists: sorted(r.artists, 3).map(([name, ms]) => ({ name, ms })),
      }))
      .sort((a, b) => b.ms - a.ms),
  };
}

// ---------- phases ("obsessions") ----------
export interface Phase {
  artist: string;
  from: string;
  to: string;
  ms: number;
  /** share of the artist in its strongest month */
  peakShare: number;
  uri: string;
  topTrack: string;
}

const MIN_PHASE_MS = 90 * 60_000;
const MIN_PHASE_SHARE = 0.12;
const monthIndex = (m: string) => Number(m.slice(0, 4)) * 12 + Number(m.slice(5, 7));

export function phases(all: Play[], f: Filter): Phase[] {
  const perMonth = new Map<string, Map<string, number>>();
  const monthTotal = new Map<string, number>();
  const tracks = tracksOf(all);
  for (const p of tracks) {
    const m = dayKey(p.start, f.tz).slice(0, 7);
    monthTotal.set(m, (monthTotal.get(m) ?? 0) + p.ms);
    const a = perMonth.get(m) ?? new Map<string, number>();
    a.set(p.artist, (a.get(p.artist) ?? 0) + p.ms);
    perMonth.set(m, a);
  }
  // an artist "owns" a month when it is a large part of it
  const hot = new Map<string, { month: string; ms: number; share: number }[]>();
  for (const [m, a] of perMonth)
    for (const [artist, ms] of a) {
      const share = ms / (monthTotal.get(m) || 1);
      if (ms >= MIN_PHASE_MS && share >= MIN_PHASE_SHARE) hot.set(artist, [...(hot.get(artist) ?? []), { month: m, ms, share }]);
    }
  const runs: Phase[] = [];
  for (const [artist, list] of hot) {
    list.sort((a, b) => monthIndex(a.month) - monthIndex(b.month));
    let cur: typeof list = [];
    const flush = () => {
      if (!cur.length) return;
      runs.push({ artist, from: cur[0].month, to: cur[cur.length - 1].month, ms: cur.reduce((s, x) => s + x.ms, 0), peakShare: Math.max(...cur.map((x) => x.share)), uri: "", topTrack: "" });
      cur = [];
    };
    for (const x of list) {
      if (cur.length && monthIndex(x.month) - monthIndex(cur[cur.length - 1].month) > 1) flush();
      cur.push(x);
    }
    flush();
  }
  const best = runs.sort((a, b) => b.ms - a.ms).slice(0, 20);
  // favourite track inside each phase
  const byArtist = new Map<string, Phase[]>();
  for (const r of best) byArtist.set(r.artist, [...(byArtist.get(r.artist) ?? []), r]);
  const uriMs = new Map<Phase, Map<string, { ms: number; title: string }>>();
  for (const p of tracks) {
    const rs = byArtist.get(p.artist);
    if (!rs) continue;
    const m = dayKey(p.start, f.tz).slice(0, 7);
    for (const r of rs) {
      if (m < r.from || m > r.to) continue;
      const t = uriMs.get(r) ?? new Map<string, { ms: number; title: string }>();
      const e = t.get(p.uri) ?? { ms: 0, title: p.title };
      e.ms += p.ms;
      t.set(p.uri, e);
      uriMs.set(r, t);
    }
  }
  for (const [r, t] of uriMs) {
    const [uri, e] = [...t.entries()].sort((a, b) => b[1].ms - a[1].ms)[0];
    r.uri = uri;
    r.topTrack = e.title;
  }
  return best;
}

// ---------- milestones ----------
export interface Milestone {
  kind: "hours" | "plays" | "track";
  value: number;
  at: number;
  title?: string;
  subtitle?: string;
  uri?: string;
}

const HOUR_STEPS = [100, 250, 500, 1000, 2500, 5000, 10000];
const PLAY_STEPS = [1000, 5000, 10000, 25000, 50000, 100000, 250000];
const TRACK_STEPS = [100, 250, 500, 1000];

export function milestones(all: Play[], f: Filter): Milestone[] {
  const tracks = tracksOf(all).sort((a, b) => a.start - b.start);
  const out: Milestone[] = [];
  let ms = 0;
  let plays = 0;
  let hi = 0;
  let pi = 0;
  const perTrack = new Map<string, { n: number; step: number; at: number; title: string; artist: string }>();
  for (const p of tracks) {
    ms += p.ms;
    while (hi < HOUR_STEPS.length && ms >= HOUR_STEPS[hi] * HOUR) out.push({ kind: "hours", value: HOUR_STEPS[hi++], at: p.start });
    if (!counts(p, f)) continue;
    plays++;
    while (pi < PLAY_STEPS.length && plays >= PLAY_STEPS[pi]) out.push({ kind: "plays", value: PLAY_STEPS[pi++], at: p.start });
    const t = perTrack.get(p.uri) ?? { n: 0, step: -1, at: 0, title: p.title, artist: p.artist };
    t.n++;
    const s = TRACK_STEPS.findLastIndex((x) => t.n >= x);
    if (s > t.step) {
      t.step = s;
      t.at = p.start;
    }
    perTrack.set(p.uri, t);
  }
  const favs = [...perTrack.entries()]
    .filter(([, t]) => t.step >= 0)
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 8);
  for (const [uri, t] of favs) out.push({ kind: "track", value: TRACK_STEPS[t.step], at: t.at, title: t.title, subtitle: t.artist, uri });
  return out.sort((a, b) => b.at - a.at);
}

// ---------- on this day ----------
export interface DayYear {
  year: string;
  ms: number;
  plays: number;
  artist: string;
  track: string;
  subtitle: string;
  uri: string;
}

/** `md` is "MM-DD" in the viewer's time zone */
export function onThisDay(all: Play[], f: Filter, md: string): DayYear[] {
  const byYear = new Map<string, Play[]>();
  for (const p of tracksOf(all)) {
    const d = dayKey(p.start, f.tz);
    if (d.slice(5) === md) byYear.set(d.slice(0, 4), [...(byYear.get(d.slice(0, 4)) ?? []), p]);
  }
  return [...byYear.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, list]) => {
      const t = top(list, f, "tracks", "ms", 1)[0];
      const a = top(list, f, "artists", "ms", 1)[0];
      return { year, ms: list.reduce((s, p) => s + p.ms, 0), plays: list.filter((p) => counts(p, f)).length, artist: a?.title ?? "", track: t?.title ?? "", subtitle: t?.subtitle ?? "", uri: t?.uri ?? "" };
    });
}

// ---------- compare two periods ----------
export interface Period {
  from: number | null;
  to: number | null;
}

export interface PeriodSummary {
  ms: number;
  plays: number;
  artists: number;
  tracks: number;
  activeDays: number;
  skipRate: number;
  nightShare: number;
  topArtists: TopItem[];
  topTracks: TopItem[];
  genres: Partial<Record<Genre, number>>;
  matchedMs: number;
}

function summarize(all: Play[], f: Filter, per: Period): PeriodSummary {
  const g: Filter = { ...f, from: per.from, to: per.to };
  const list = tracksOf(all).filter((p) => (g.from === null || p.start >= g.from) && (g.to === null || p.start < g.to));
  const artists = new Set<string>();
  const tracks = new Set<string>();
  const days = new Set<string>();
  const genres: PeriodSummary["genres"] = {};
  let ms = 0;
  let plays = 0;
  let skipped = 0;
  let night = 0;
  let matched = 0;
  const cache = new Map<string, Genre | null>();
  for (const p of list) {
    ms += p.ms;
    artists.add(p.artist);
    tracks.add(p.uri);
    days.add(dayKey(p.start, g.tz));
    if (counts(p, g)) plays++;
    if (p.skipped) skipped++;
    if (parts(p.start, g.tz).h < 5) night += p.ms;
    let ge = cache.get(p.artist);
    if (ge === undefined) cache.set(p.artist, (ge = genreOf(p.artist)));
    if (ge) {
      genres[ge] = (genres[ge] ?? 0) + p.ms;
      matched += p.ms;
    }
  }
  return {
    ms,
    plays,
    artists: artists.size,
    tracks: tracks.size,
    activeDays: days.size,
    skipRate: list.length ? skipped / list.length : 0,
    nightShare: ms ? night / ms : 0,
    topArtists: top(list, g, "artists", "ms", 5),
    topTracks: top(list, g, "tracks", "plays", 5),
    genres,
    matchedMs: matched,
  };
}

export const compare = (all: Play[], f: Filter, a: Period, b: Period): [PeriodSummary, PeriodSummary] => [summarize(all, f, a), summarize(all, f, b)];

// ---------- skip & repeat habits ----------
export interface HabitItem {
  key: string;
  title: string;
  subtitle: string;
  uri: string;
  /** skip rate (0..1) for skip lists, number of times for repeats / album runs */
  value: number;
  total: number;
}

export interface HabitsData {
  skipRateShuffle: number;
  skipRateDirect: number;
  skippedTracks: HabitItem[];
  skippedArtists: HabitItem[];
  repeats: HabitItem[];
  albumRuns: HabitItem[];
}

const MIN_TRACK_ENTRIES = 10;
const MIN_ARTIST_ENTRIES = 40;
/** a replay counts when the same track starts again within this gap */
const REPEAT_GAP_MS = 60_000;
/** plays closer together than this belong to one listening run */
const RUN_GAP_MS = 5 * 60_000;
const MIN_ALBUM_RUN = 5;

export function habits(all: Play[], f: Filter): HabitsData {
  const list = tracksOf(all)
    .filter((p) => (f.from === null || p.start >= f.from) && (f.to === null || p.start < f.to))
    .sort((a, b) => a.start - b.start);

  let shuffle = 0;
  let shuffleSkipped = 0;
  let direct = 0;
  let directSkipped = 0;
  const byTrack = new Map<string, { title: string; artist: string; n: number; skipped: number }>();
  const byArtist = new Map<string, { n: number; skipped: number; uri: string }>();
  const repeats = new Map<string, { title: string; artist: string; n: number }>();
  const runs = new Map<string, { album: string; artist: string; uri: string; n: number }>();

  let prev: Play | null = null;
  let run: Play[] = [];
  const flush = () => {
    // a run counts as "album listened through" when most of it is one album and hardly skipped
    if (run.length >= MIN_ALBUM_RUN) {
      const first = run[0];
      const same = run.filter((p) => p.album === first.album && p.artist === first.artist);
      if (first.album && same.length >= MIN_ALBUM_RUN && same.length / run.length >= 0.8 && same.filter((p) => p.skipped).length / same.length < 0.3) {
        const k = `${first.artist}|${first.album}`;
        const e = runs.get(k) ?? { album: first.album, artist: first.artist, uri: first.uri, n: 0 };
        e.n++;
        runs.set(k, e);
      }
    }
    run = [];
  };

  for (const p of list) {
    if (p.shuffle) {
      shuffle++;
      if (p.skipped) shuffleSkipped++;
    } else {
      direct++;
      if (p.skipped) directSkipped++;
    }
    const t = byTrack.get(p.uri) ?? { title: p.title, artist: p.artist, n: 0, skipped: 0 };
    t.n++;
    if (p.skipped) t.skipped++;
    byTrack.set(p.uri, t);
    const a = byArtist.get(p.artist) ?? { n: 0, skipped: 0, uri: p.uri };
    a.n++;
    if (p.skipped) a.skipped++;
    byArtist.set(p.artist, a);

    if (prev && prev.uri === p.uri && p.start - (prev.start + prev.ms) < REPEAT_GAP_MS) {
      const r = repeats.get(p.uri) ?? { title: p.title, artist: p.artist, n: 0 };
      r.n++;
      repeats.set(p.uri, r);
    }
    if (prev && p.start - (prev.start + prev.ms) > RUN_GAP_MS) flush();
    run.push(p);
    prev = p;
  }
  flush();

  const item = (key: string, title: string, subtitle: string, uri: string, value: number, total: number): HabitItem => ({ key, title, subtitle, uri, value, total });
  return {
    skipRateShuffle: shuffle ? shuffleSkipped / shuffle : 0,
    skipRateDirect: direct ? directSkipped / direct : 0,
    skippedTracks: [...byTrack.entries()]
      .filter(([, t]) => t.n >= MIN_TRACK_ENTRIES)
      .sort((a, b) => b[1].skipped / b[1].n - a[1].skipped / a[1].n || b[1].n - a[1].n)
      .slice(0, 10)
      .map(([uri, t]) => item(uri, t.title, t.artist, uri, t.skipped / t.n, t.n)),
    skippedArtists: [...byArtist.entries()]
      .filter(([, a]) => a.n >= MIN_ARTIST_ENTRIES)
      .sort((a, b) => b[1].skipped / b[1].n - a[1].skipped / a[1].n)
      .slice(0, 10)
      .map(([name, a]) => item(name, name, "", a.uri, a.skipped / a.n, a.n)),
    repeats: [...repeats.entries()]
      .sort((a, b) => b[1].n - a[1].n)
      .slice(0, 10)
      .map(([uri, r]) => item(uri, r.title, r.artist, uri, r.n, r.n)),
    albumRuns: [...runs.entries()]
      .sort((a, b) => b[1].n - a[1].n)
      .slice(0, 10)
      .map(([k, r]) => item(k, r.album, r.artist, r.uri, r.n, r.n)),
  };
}
