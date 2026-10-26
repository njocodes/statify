/// <reference lib="webworker" />
import { ingest, type IngestResult } from "../parse/ingest";
import { dedupeKey, type Play } from "../parse/normalize";
import { appendPlays, clearAll, loadGenreCache, loadPlays, putGenre } from "../store/db";
import { dashboard, extent, type DashboardData, type Extent } from "../stats/query";
import type { Filter } from "../stats/core";
import { trends, type TrendsData } from "../stats/trends";
import { compare, periods, genreStats, habits, type HabitsData, milestones, onThisDay, phases, type DayYear, type GenreStats, type Milestone, type Period, type Phase, type PeriodSummary } from "../stats/extras";
import { behavior, discovery, podcasts, type BehaviorData, type DiscoveryData, type PodcastData } from "../stats/views";
import { genreFromTags, genreOf, normalize, setExtraGenre, type GenreMix } from "../theme/genres";
import { isGenre } from "../theme/themes";
import { dayKey, parts } from "../stats/core";
import { buildIndex, detail, search, type Detail, type EntityType, type SearchHit } from "../stats/detail";

export type ViewData = BehaviorData | DiscoveryData | PodcastData | TrendsData | GenreStats | Phase[] | Milestone[] | HabitsData;

export type Req =
  | { id: number; type: "load" }
  | { id: number; type: "ingest"; files: File[] }
  | { id: number; type: "clear" }
  | { id: number; type: "export" }
  | { id: number; type: "dashboard"; filter: Filter; tz: string }
  | { id: number; type: "detail"; entity: EntityType; key: string; filter: Filter }
  | { id: number; type: "search"; q: string; filter: Filter }
  | { id: number; type: "genres" }
  | { id: number; type: "lookup"; limit: number }
  | { id: number; type: "lookupCancel" }
  | { id: number; type: "view"; view: "behavior" | "discovery" | "podcasts" | "trends" | "genres" | "phases" | "milestones" | "habits"; filter: Filter }
  | { id: number; type: "onThisDay"; filter: Filter; md: string }
  | { id: number; type: "compare"; filter: Filter; a: Period; b: Period }
  | { id: number; type: "periods"; filter: Filter; list: Period[] };

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
  | { id: number; ok: true; type: "export"; blob: Blob; count: number }
  | { id: number; ok: true; type: "dashboard"; data: DashboardData }
  | { id: number; ok: true; type: "detail"; data: Detail | null }
  | { id: number; ok: true; type: "search"; hits: SearchHit[] }
  | { id: number; ok: true; type: "genres"; mix: GenreMix }
  | { id: number; ok: true; type: "lookup"; found: number; checked: number; cancelled: boolean }
  | { id: number; ok: true; type: "lookupCancel" }
  | { id: number; ok: true; type: "view"; data: ViewData }
  | { id: number; ok: true; type: "onThisDay"; days: DayYear[] }
  | { id: number; ok: true; type: "compare"; data: [PeriodSummary, PeriodSummary] }
  | { id: number; ok: true; type: "periods"; data: PeriodSummary[] }
  | { id: number; ok: false; error: string }
  | { id: -1; progress: { done: number; total: number } };

let plays: Play[] = [];
let known = new Set<string>();
let tz = "UTC";
let index: ReturnType<typeof buildIndex> | null = null;
let indexMin = -1;
let cancelLookup = false;

const BACKUP_FORMAT = "statify-backup";
type Backup = { format: string; plays: unknown[]; genres?: [string, string][] };
const isBackup = (d: unknown): d is Backup & { plays: Play[] } => !!d && typeof d === "object" && (d as Backup).format === BACKUP_FORMAT && Array.isArray((d as Backup).plays);
const isPlay = (p: unknown): p is Play => !!p && typeof p === "object" && typeof (p as Play).start === "number" && typeof (p as Play).ms === "number" && typeof (p as Play).uri === "string" && typeof (p as Play).kind === "string";
/** plain JSON or a gzipped backup */
const readText = (f: File) => (f.name.toLowerCase().endsWith(".gz") ? new Response(f.stream().pipeThrough(new DecompressionStream("gzip"))).text() : f.text());

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Asks MusicBrainz about one artist; only an exact name match with a high score counts. */
async function musicBrainzGenre(artist: string) {
  const q = encodeURIComponent(`artist:"${artist.replace(/["\\]/g, " ")}"`);
  const res = await fetch(`https://musicbrainz.org/ws/2/artist/?query=${q}&fmt=json&limit=1`);
  if (res.status === 503 || res.status === 429) throw new Error("rate-limited");
  if (!res.ok) throw new Error(`musicbrainz ${res.status}`);
  const hit = ((await res.json()) as { artists?: { name: string; score: number; tags?: { name: string; count: number }[] }[] }).artists?.[0];
  if (!hit || hit.score < 90 || normalize(hit.name) !== normalize(artist)) return null;
  return genreFromTags(hit.tags ?? []);
}

const post = (m: Res) => (self as unknown as Worker).postMessage(m);

self.onmessage = async (ev: MessageEvent<Req>) => {
  const r = ev.data;
  try {
    switch (r.type) {
      case "load": {
        plays = await loadPlays();
        index = null;
        known = new Set(plays.map(dedupeKey));
        for (const [k, g] of await loadGenreCache()) if (g && isGenre(g)) setExtraGenre(k, g);
        post({ id: r.id, ok: true, type: "load", extent: extent(plays, tz) });
        break;
      }
      case "ingest": {
        // one file at a time, so only one parsed export is in memory at once
        let added = 0;
        let duplicates = 0;
        let invalid = 0;
        let done = 0;
        const skipped: Extract<Res, { type: "ingest" }>["skipped"] = [];
        for (const f of r.files) {
          try {
            const data = JSON.parse(await readText(f));
            const fresh: Play[] = [];
            if (isBackup(data)) {
              for (const p of data.plays) {
                if (!isPlay(p)) invalid++;
                else if (known.has(dedupeKey(p))) duplicates++;
                else {
                  known.add(dedupeKey(p));
                  fresh.push(p);
                }
              }
              for (const [key, g] of data.genres ?? []) {
                if (typeof key === "string" && isGenre(g)) {
                  setExtraGenre(key, g);
                  await putGenre(key, g);
                }
              }
            } else {
              const res = ingest([{ name: f.name, data }], known);
              fresh.push(...res.added);
              duplicates += res.duplicates;
              invalid += res.invalid;
              skipped.push(...res.skipped);
            }
            await appendPlays(fresh);
            for (const p of fresh) plays.push(p);
            added += fresh.length;
          } catch {
            skipped.push({ name: f.name, reason: "not-json" });
          }
          post({ id: -1, progress: { done: ++done, total: r.files.length } });
        }
        index = null;
        post({ id: r.id, ok: true, type: "ingest", extent: extent(plays, tz), added, duplicates, invalid, skipped });
        break;
      }
      case "export": {
        const genres = [...(await loadGenreCache())].filter(([, g]) => g);
        const json = JSON.stringify({ format: BACKUP_FORMAT, version: 1, exportedAt: new Date().toISOString(), plays, genres });
        const blob = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
        post({ id: r.id, ok: true, type: "export", blob, count: plays.length });
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
        const data =
          r.view === "trends" ? trends(plays)
          : r.view === "genres" ? genreStats(plays, r.filter)
          : r.view === "phases" ? phases(plays, r.filter)
          : r.view === "milestones" ? milestones(plays, r.filter)
          : r.view === "habits" ? habits(plays, r.filter)
          : { behavior, discovery, podcasts }[r.view](plays, r.filter);
        post({ id: r.id, ok: true, type: "view", data });
        break;
      }
      case "onThisDay": {
        post({ id: r.id, ok: true, type: "onThisDay", days: onThisDay(plays, r.filter, r.md) });
        break;
      }
      case "periods": {
        post({ id: r.id, ok: true, type: "periods", data: periods(plays, r.filter, r.list) });
        break;
      }
      case "compare": {
        post({ id: r.id, ok: true, type: "compare", data: compare(plays, r.filter, r.a, r.b) });
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
      case "lookupCancel": {
        cancelLookup = true;
        post({ id: r.id, ok: true, type: "lookupCancel" });
        break;
      }
      case "lookup": {
        cancelLookup = false;
        // the most-listened artists the curated lists do not know yet, skipping ones already asked about
        const cached = await loadGenreCache();
        const ms = new Map<string, { name: string; ms: number }>();
        for (const p of plays) {
          if (p.kind !== "track" || !p.artist) continue;
          const key = normalize(p.artist);
          if (!key || cached.has(key) || genreOf(p.artist)) continue;
          const cur = ms.get(key);
          if (cur) cur.ms += p.ms;
          else ms.set(key, { name: p.artist, ms: p.ms });
        }
        const todo = [...ms].sort((a, b) => b[1].ms - a[1].ms).slice(0, r.limit);
        let found = 0;
        let checked = 0;
        for (const [key, a] of todo) {
          if (cancelLookup) break;
          try {
            const g = await musicBrainzGenre(a.name);
            await putGenre(key, g);
            if (g) {
              setExtraGenre(key, g);
              found++;
            }
          } catch (e) {
            if (e instanceof Error && e.message === "rate-limited") await sleep(5000);
            else if (!(e instanceof Error) || !/musicbrainz/.test(e.message)) break; // offline: stop, keep what we have
          }
          post({ id: -1, progress: { done: ++checked, total: todo.length } });
          await sleep(1100); // MusicBrainz allows about one request per second
        }
        post({ id: r.id, ok: true, type: "lookup", found, checked, cancelled: cancelLookup });
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
