/// <reference lib="webworker" />
import { ingest, type IngestResult } from "../parse/ingest";
import { dedupeKey, type Play } from "../parse/normalize";
import { appendPlays, clearAll, loadPlays } from "../store/db";
import { dashboard, extent, type DashboardData, type Extent } from "../stats/query";
import type { Filter } from "../stats/core";

export type Req =
  | { id: number; type: "load" }
  | { id: number; type: "ingest"; files: File[] }
  | { id: number; type: "clear" }
  | { id: number; type: "dashboard"; filter: Filter; tz: string };

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
  | { id: number; ok: false; error: string }
  | { id: -1; progress: { done: number; total: number } };

let plays: Play[] = [];
let known = new Set<string>();
let tz = "UTC";

const post = (m: Res) => (self as unknown as Worker).postMessage(m);

self.onmessage = async (ev: MessageEvent<Req>) => {
  const r = ev.data;
  try {
    switch (r.type) {
      case "load": {
        plays = await loadPlays();
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
        known = new Set();
        post({ id: r.id, ok: true, type: "clear" });
        break;
      }
      case "dashboard": {
        tz = r.tz;
        post({ id: r.id, ok: true, type: "dashboard", data: dashboard(plays, r.filter) });
        break;
      }
    }
  } catch (e) {
    post({ id: r.id, ok: false, error: e instanceof Error ? e.message : String(e) });
  }
};
