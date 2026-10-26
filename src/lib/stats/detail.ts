import type { Play } from "../parse/normalize";
import { counts, dayKey, top, type Filter, type TopItem } from "./core";

export type EntityType = "artist" | "track" | "album";

const albumKey = (p: Play) => `${p.artist}|${p.album}`;

export function matches(p: Play, type: EntityType, id: string): boolean {
  if (p.kind !== "track") return false;
  return type === "artist" ? p.artist === id : type === "track" ? p.uri === id : albumKey(p) === id;
}

export interface Detail {
  type: EntityType;
  id: string;
  title: string;
  subtitle: string;
  /** a track uri for the cover */
  uri: string;
  plays: number;
  entries: number;
  ms: number;
  skipRate: number;
  first: number;
  last: number;
  /** [year-month, ms] */
  months: { month: string; ms: number }[];
  /** rank by plays among all items of the same type, 1-based */
  rank: number;
  topTracks: TopItem[];
  topAlbums: TopItem[];
  activeDays: number;
}

export function detail(all: Play[], type: EntityType, id: string, f: Filter): Detail | null {
  const own = all.filter((p) => matches(p, type, id));
  if (!own.length) return null;

  let ms = 0;
  let plays = 0;
  let skipped = 0;
  let first = Infinity;
  let last = -Infinity;
  const months = new Map<string, number>();
  const days = new Set<string>();
  for (const p of own) {
    ms += p.ms;
    if (counts(p, f)) plays++;
    if (p.skipped) skipped++;
    first = Math.min(first, p.start);
    last = Math.max(last, p.start);
    const d = dayKey(p.start, f.tz);
    days.add(d);
    months.set(d.slice(0, 7), (months.get(d.slice(0, 7)) ?? 0) + p.ms);
  }

  const tracks = all.filter((p) => p.kind === "track");
  const kind = type === "artist" ? "artists" : type === "track" ? "tracks" : "albums";
  const ranking = top(tracks, f, kind, "plays", Infinity);
  const rank = ranking.findIndex((r) => r.key === id) + 1;

  const sample = own[0];
  return {
    type,
    id,
    title: type === "artist" ? sample.artist : type === "track" ? sample.title : sample.album,
    subtitle: type === "artist" ? "" : type === "track" ? `${sample.artist} · ${sample.album}` : sample.artist,
    uri: sample.uri,
    plays,
    entries: own.length,
    ms,
    skipRate: own.length ? skipped / own.length : 0,
    first,
    last,
    months: [...months.entries()].sort().map(([month, v]) => ({ month, ms: v })),
    rank,
    topTracks: type === "track" ? [] : top(own, f, "tracks", "plays", 10),
    topAlbums: type === "artist" ? top(own, f, "albums", "plays", 10) : [],
    activeDays: days.size,
  };
}

export interface SearchHit {
  type: EntityType;
  id: string;
  title: string;
  subtitle: string;
  uri: string;
  plays: number;
}

/** Name index built once per data change. */
export function buildIndex(all: Play[], f: Filter): { hit: SearchHit; hay: string }[] {
  const tracks = all.filter((p) => p.kind === "track");
  const mk = (type: EntityType, kind: "tracks" | "artists" | "albums") =>
    top(tracks, f, kind, "plays", Infinity).map((t) => ({
      hit: { type, id: t.key, title: t.title, subtitle: t.subtitle, uri: t.uri, plays: t.plays } as SearchHit,
      hay: `${t.title} ${t.subtitle}`.toLowerCase(),
    }));
  return [...mk("artist", "artists"), ...mk("album", "albums"), ...mk("track", "tracks")];
}

export function search(index: ReturnType<typeof buildIndex>, q: string, perType = 5): SearchHit[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  const out: SearchHit[] = [];
  const n = { artist: 0, album: 0, track: 0 };
  for (const e of index) {
    if (n[e.hit.type] >= perType || !e.hay.includes(needle)) continue;
    n[e.hit.type]++;
    out.push(e.hit);
  }
  return out;
}
