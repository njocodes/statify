"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Req, Res } from "../worker/stats.worker";
import type { Extent, DashboardData } from "../stats/query";
import { DEFAULT_MIN_PLAY_MS, type Filter } from "../stats/core";
import { dicts, type Key, type Lang } from "../i18n/dict";

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;
type IngestRes = Extract<Res, { type: "ingest" }>;

interface Settings {
  lang: Lang;
  tz: string;
  minPlayMs: number;
}

interface Ctx {
  ready: boolean;
  extent: Extent | null;
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
  t: (k: Key) => string;
  ingest: (files: File[], onProgress?: (done: number, total: number) => void) => Promise<IngestRes>;
  clear: () => Promise<void>;
  dashboard: (f: Pick<Filter, "from" | "to">) => Promise<DashboardData>;
}

const C = createContext<Ctx | null>(null);
export const useStatify = () => {
  const c = useContext(C);
  if (!c) throw new Error("StatifyProvider missing");
  return c;
};

const defaultTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const initialSettings = (): Settings => ({ lang: "en", tz: "UTC", minPlayMs: DEFAULT_MIN_PLAY_MS });

export function StatifyProvider({ children }: { children: ReactNode }) {
  const worker = useRef<Worker | null>(null);
  const pending = useRef(new Map<number, { resolve: (r: Res) => void; reject: (e: Error) => void }>());
  const progress = useRef<((d: number, t: number) => void) | undefined>(undefined);
  const seq = useRef(0);
  const [ready, setReady] = useState(false);
  const [extent, setExtent] = useState<Extent | null>(null);
  const [settings, setS] = useState<Settings>(initialSettings);

  const call = useCallback(<T extends Res>(req: DistributiveOmit<Req, "id">): Promise<T> => {
    return new Promise((resolve, reject) => {
      const id = ++seq.current;
      pending.current.set(id, { resolve: resolve as (r: Res) => void, reject });
      worker.current!.postMessage({ ...req, id });
    });
  }, []);

  useEffect(() => {
    let stored: Partial<Settings> = {};
    try {
      stored = JSON.parse(localStorage.getItem("statify.settings") ?? "{}");
    } catch {}
    const lang: Lang = stored.lang ?? (navigator.language.startsWith("de") ? "de" : "en");
    // Settings live in localStorage, so they can only be read after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setS({ lang, tz: stored.tz ?? defaultTz(), minPlayMs: stored.minPlayMs ?? DEFAULT_MIN_PLAY_MS });

    const w = new Worker(new URL("../worker/stats.worker.ts", import.meta.url));
    worker.current = w;
    w.onmessage = (ev: MessageEvent<Res>) => {
      const m = ev.data;
      if ("progress" in m) return progress.current?.(m.progress.done, m.progress.total);
      const p = pending.current.get(m.id);
      if (!p) return;
      pending.current.delete(m.id);
      if (m.ok) p.resolve(m);
      else p.reject(new Error(m.error));
    };
    call<Extract<Res, { type: "load" }>>({ type: "load" })
      .then((r) => setExtent(r.extent))
      .finally(() => setReady(true));
    return () => w.terminate();
  }, [call]);

  const setSettings = useCallback((s: Partial<Settings>) => {
    setS((cur) => {
      const next = { ...cur, ...s };
      try {
        localStorage.setItem("statify.settings", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = settings.lang;
  }, [settings.lang]);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      extent,
      settings,
      setSettings,
      t: (k) => dicts[settings.lang][k],
      ingest: async (files, onProgress) => {
        progress.current = onProgress;
        const r = await call<IngestRes>({ type: "ingest", files });
        progress.current = undefined;
        setExtent(r.extent);
        return r;
      },
      clear: async () => {
        await call({ type: "clear" });
        setExtent({ first: null, last: null, years: [], counts: { track: 0, episode: 0, audiobook: 0 } });
      },
      dashboard: async (f) => {
        const r = await call<Extract<Res, { type: "dashboard" }>>({
          type: "dashboard",
          tz: settings.tz,
          filter: { ...f, minPlayMs: settings.minPlayMs, tz: settings.tz },
        });
        return r.data;
      },
    }),
    [ready, extent, settings, setSettings, call],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}
