/// <reference lib="webworker" />
import { ingest, type IngestResult } from "../parse/ingest";
import { dedupeKey, type Play } from "../parse/normalize";
import { appendPlays, clearAll, loadPlays } from "../store/db";
import { dashboard, extent, type DashboardData, type Extent } from "../stats/query";
import type { Filter } from "../stats/core";
import { behavior, discovery, podcasts, type BehaviorData, type DiscoveryData, type PodcastData } from "../stats/views";
import { genreOf, type GenreMix } from "../theme/genres";
import { dayKey, parts } from "../stats/core";
import { buildIndex, detail, search, type Detail, type EntityType, type SearchHit } from "../stats/detail";

export type ViewData = BehaviorData | DiscoveryData | PodcastData;

export type Req =
  | { id: number; type: "load" }
  | { id: number; type: "ingest"; files: File[] }
  | { id: number; type: "clear" }
  | { id: number; type: "dashboard"; filter: Filter; tz: string }
  | { id: number; type: "detail"; entity: EntityType; key: string; filter: Filter }
  | { id: number; type: "search"; q: string; filter: Filter }
  | { id: number; type: "genres" }
  | { id: number; type: "view"; view: "behavior" | "discovery" | "podcasts"; filter: Filter };

export type Res =
  | { id: number; ok: true; type: "load"; extent: Extent }
  | {
      id: number;
      ok: true;
      type: "ingest";
      extent: Extent;
      added: number;
      duplicates: number;
      invalid: number;
      skipped: IngestResult["skipped"];
    }
  | { id: number; ok: true; type: "clear" }
  | { id: number; ok: true; type: "dashboard"; data: DashboardData }
  | { id: number; ok: true; type: "detail"; data: Detail | null }
  | { id: number; ok: true; type: "search"; hits: SearchHit[] }
  | { id: number; ok: true; type: "genres"; mix: GenreMix }
  | { id: number; ok: true; type: "view"; data: ViewData }
  | { id: number; ok: false; error: string }
  | { id: -1; progress: { done: number; total: number } };

let plays: Play[] = [];
let known = new Set<string>();
let tz = "UTC";
let index: ReturnType<typeof buildIndex> | null = null;
let indexMin = -1;

const post = (m: Res) => (self as unknown as Worker).postMessage(m);

self.onmessage = async (ev: MessageEvent<Req>) => {
  const r = ev.data;
  try {
    switch (r.type) {
      case "load": {
        plays = await loadPlays();
        index = null;
        known = new Set(plays.map(dedupeKey));
        post({ id: r.id, ok: true, type: "load", extent: extent(plays, tz) });
        break;
      }
      case "ingest": {
        const parsed: { name: string; data: unknown }[] = [];
        let done = 0;
        for (const f of r.files) {
          try {
            parsed.push({ name: f.name, data: JSON.parse(await f.text()) });
          } catch {
            parsed.push({ name: f.name, data: null });
          }
          post({ id: -1, progress: { done: ++done, total: r.files.length } });
        }
        const res = ingest(parsed, known);
        await appendPlays(res.added);
        plays = plays.concat(res.added);
        index = null;
        const skipped = [...res.skipped];
        parsed.forEach((p) => {
          if (p.data === null) skipped.push({ name: p.name, reason: "not-json" });
        });
        post({
          id: r.id,
          ok: true,
          type: "ingest",
          extent: extent(plays, tz),
          added: res.added.length,
          duplicates: res.duplicates,
          invalid: res.invalid,
          skipped,
        });
        break;
      }
      case "clear": {
        await clearAll();
        plays = [];
        index = null;
        known = new Set();
        post({ id: r.id, ok: true, type: "clear" });
        break;
      }
      case "dashboard": {
        tz = r.tz;
        post({ id: r.id, ok: true, type: "dashboard", data: dashboard(plays, r.filter) });
        break;
      }
      case "detail": {
        post({ id: r.id, ok: true, type: "detail", data: detail(plays, r.entity, r.key, r.filter) });
        break;
      }
      case "view": {
        const fn = { behavior, discovery, podcasts }[r.view];
        post({ id: r.id, ok: true, type: "view", data: fn(plays, r.filter) });
        break;
      }
      case "genres": {
        type Acc = { mix: GenreMix; night: number; skipped: number; tracks: number };
        const fresh = (): Acc => ({ mix: { byGenre: {}, matchedMs: 0, totalMs: 0, skipRate: 0, nightShare: 0 }, night: 0, skipped: 0, tracks: 0 });
        const total = fresh();
        const years = new Map<string, Acc>();
        const cache = new Map<string, ReturnType<typeof genreOf>>();
        for (const p of plays) {
          if (p.kind !== "track") continue;
          const y = dayKey(p.start, tz).slice(0, 4);
          const yearAcc = years.get(y) ?? years.set(y, fresh()).get(y)!;
          const night = parts(p.start, tz).h < 5;
          let g = cache.get(p.artist);
          if (g === undefined) cache.set(p.artist, (g = genreOf(p.artist)));
          for (const acc of [total, yearAcc]) {
            acc.mix.totalMs += p.ms;
            acc.tracks++;
            if (p.skipped) acc.skipped++;
            if (night) acc.night += p.ms;
            if (g) {
              acc.mix.byGenre[g] = (acc.mix.byGenre[g] ?? 0) + p.ms;
              acc.mix.matchedMs += p.ms;
            }
          }
        }
        const done = (acc: Acc): GenreMix => ({
          ...acc.mix,
          skipRate: acc.tracks ? acc.skipped / acc.tracks : 0,
          nightShare: acc.mix.totalMs ? acc.night / acc.mix.totalMs : 0,
        });
        const mix = done(total);
        mix.yearly = Object.fromEntries([...years].map(([y, acc]) => [y, done(acc)]));
        post({ id: r.id, ok: true, type: "genres", mix });
        break;
      }
      case "search": {
        if (!index || indexMin !== r.filter.minPlayMs) {
          index = buildIndex(plays, r.filter);
          indexMin = r.filter.minPlayMs;
        }
        post({ id: r.id, ok: true, type: "search", hits: search(index, r.q) });
        break;
      }
    }
  } catch (e) {
    post({ id: r.id, ok: false, error: e instanceof Error ? e.message : String(e) });
  }
};
