"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Req, Res, ViewData } from "../worker/stats.worker";
import type { Extent, DashboardData } from "../stats/query";
import { DEFAULT_MIN_PLAY_MS, type Filter } from "../stats/core";
import type { DayYear, Period, PeriodSummary } from "../stats/extras";
import type { Detail, EntityType, SearchHit } from "../stats/detail";
import { dominantGenre, hatOf, moodOf, secondaryGenre, type GenreMix, type Hat, type Mood } from "../theme/genres";
import { GENRE_COLOR, GENRE_THEME, isThemeId, type ThemeId, type ThemeSetting } from "../theme/themes";
import { accentTokens, type Rgb } from "../theme/coverColor";
import { dicts, type Key, type Lang } from "../i18n/dict";

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;
type IngestRes = Extract<Res, { type: "ingest" }>;

interface Settings {
  lang: Lang;
  tz: string;
  minPlayMs: number;
  theme: ThemeSetting;
  coverAccent: boolean;
}

interface Ctx {
  ready: boolean;
  extent: Extent | null;
  settings: Settings;
  /** the theme actually applied (resolved from "auto") */
  theme: ThemeId;
  autoTheme: ThemeId;
  genreMix: GenreMix | null;
  /** how Statty looks, derived from the listening history */
  mascot: { mood: Mood; hat: Hat };
  setSettings: (s: Partial<Settings>) => void;
  /** selected calendar year for all views, null = all time (changed in the period panel) */
  year: number | null;
  setYear: (y: number | null) => void;
  /** colour taken from the top album covers, applied as accent while the setting is on */
  setCoverColor: (c: Rgb | null) => void;
  t: (k: Key) => string;
  ingest: (files: File[], onProgress?: (done: number, total: number) => void) => Promise<IngestRes>;
  clear: () => Promise<void>;
  /** opt-in: asks MusicBrainz about the most-played artists the built-in lists do not know */
  lookupGenres: (limit: number, onProgress?: (done: number, total: number) => void) => Promise<{ found: number; checked: number; cancelled: boolean }>;
  cancelLookup: () => void;
  dashboard: (f: Pick<Filter, "from" | "to">) => Promise<DashboardData>;
  detail: (entity: EntityType, key: string) => Promise<Detail | null>;
  search: (q: string) => Promise<SearchHit[]>;
  onThisDay: (md: string) => Promise<DayYear[]>;
  compare: (a: Period, b: Period) => Promise<[PeriodSummary, PeriodSummary]>;
  periods: (list: Period[]) => Promise<PeriodSummary[]>;
  view: <T extends ViewData>(view: "behavior" | "discovery" | "podcasts" | "trends" | "genres" | "phases" | "milestones" | "habits", f: Pick<Filter, "from" | "to">) => Promise<T>;
}

const C = createContext<Ctx | null>(null);
export const useStatify = () => {
  const c = useContext(C);
  if (!c) throw new Error("StatifyProvider missing");
  return c;
};

const defaultTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const initialSettings = (): Settings => ({ lang: "en", tz: "UTC", minPlayMs: DEFAULT_MIN_PLAY_MS, theme: "auto", coverAccent: true });

export function StatifyProvider({ children }: { children: ReactNode }) {
  const worker = useRef<Worker | null>(null);
  const pending = useRef(new Map<number, { resolve: (r: Res) => void; reject: (e: Error) => void }>());
  const progress = useRef<((d: number, t: number) => void) | undefined>(undefined);
  const seq = useRef(0);
  const [ready, setReady] = useState(false);
  const [extent, setExtent] = useState<Extent | null>(null);
  const [settings, setS] = useState<Settings>(initialSettings);
  const [autoTheme, setAutoTheme] = useState<ThemeId>("classic");
  const [year, setYear] = useState<number | null>(null);
  const [coverColor, setCoverColorState] = useState<Rgb | null>(null);
  const [genreMix, setGenreMix] = useState<GenreMix | null>(null);
  const [genreRev, setGenreRev] = useState(0);

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
    const theme: ThemeSetting = stored.theme === "auto" || isThemeId(stored.theme) ? stored.theme : "auto";
    // Settings live in localStorage, so they can only be read after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setS({ lang, tz: stored.tz ?? defaultTz(), minPlayMs: stored.minPlayMs ?? DEFAULT_MIN_PLAY_MS, theme, coverAccent: stored.coverAccent ?? true });
    try {
      const c = JSON.parse(localStorage.getItem("statify.coverColor") ?? "null");
      if (c && typeof c.r === "number") setCoverColorState(c);
    } catch {}
    try {
      const cached = localStorage.getItem("statify.autoTheme");
      if (isThemeId(cached)) setAutoTheme(cached);
    } catch {}

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

  const setCoverColor = useCallback((c: Rgb | null) => {
    setCoverColorState(c);
    try {
      if (c) localStorage.setItem("statify.coverColor", JSON.stringify(c));
      else localStorage.removeItem("statify.coverColor");
    } catch {}
  }, []);

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

  // Work out the "auto" theme from the listening history whenever the data changes.
  useEffect(() => {
    if (!ready || !extent) return;
    if (!extent.first) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGenreMix(null);
      setAutoTheme("classic");
      try {
        localStorage.removeItem("statify.autoTheme");
      } catch {}
      return;
    }
    let off = false;
    call<Extract<Res, { type: "genres" }>>({ type: "genres" }).then((r) => {
      if (off) return;
      const g = dominantGenre(r.mix);
      const next = g ? GENRE_THEME[g] : "classic";
      setGenreMix(r.mix);
      setAutoTheme(next);
      try {
        localStorage.setItem("statify.autoTheme", next);
      } catch {}
    });
    return () => {
      off = true;
    };
  }, [ready, extent, call, genreRev]);

  const mascot = useMemo(
    () => ({ mood: genreMix ? moodOf(genreMix) : ("happy" as Mood), hat: hatOf(genreMix ? dominantGenre(genreMix) : null) }),
    [genreMix],
  );
  // The second genre tints secondary highlights (bars, chips) via --accent-2.
  useEffect(() => {
    const g = genreMix ? secondaryGenre(genreMix) : null;
    const root = document.documentElement.style;
    if (g) root.setProperty("--accent-2", GENRE_COLOR[g]);
    else root.removeProperty("--accent-2");
  }, [genreMix]);

  const theme: ThemeId = settings.theme === "auto" ? autoTheme : settings.theme;
  // accent from album covers; the clean theme stays strictly black/white
  useEffect(() => {
    const root = document.documentElement.style;
    const names = ["--accent", "--accent-dim", "--on-accent"];
    if (!coverColor || !settings.coverAccent || theme === "clean") return names.forEach((n) => root.removeProperty(n));
    const k = accentTokens(coverColor);
    root.setProperty("--accent", k.accent);
    root.setProperty("--accent-dim", k.dim);
    root.setProperty("--on-accent", k.on);
  }, [coverColor, settings.coverAccent, theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const baseFilter: Filter = { from: null, to: null, minPlayMs: settings.minPlayMs, tz: settings.tz };

  const value = useMemo<Ctx>(
    () => ({
      ready,
      extent,
      settings,
      theme,
      autoTheme,
      genreMix,
      mascot,
      year,
      setYear,
      setSettings,
      setCoverColor,
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
      lookupGenres: async (limit, onProgress) => {
        progress.current = onProgress;
        try {
          const r = await call<Extract<Res, { type: "lookup" }>>({ type: "lookup", limit });
          if (r.found) setGenreRev((n) => n + 1);
          return { found: r.found, checked: r.checked, cancelled: r.cancelled };
        } finally {
          progress.current = undefined;
        }
      },
      cancelLookup: () => void call({ type: "lookupCancel" }),
      dashboard: async (f) => {
        const r = await call<Extract<Res, { type: "dashboard" }>>({
          type: "dashboard",
          tz: settings.tz,
          filter: { ...f, minPlayMs: settings.minPlayMs, tz: settings.tz },
        });
        return r.data;
      },
      detail: async (entity, key) => {
        const r = await call<Extract<Res, { type: "detail" }>>({ type: "detail", entity, key, filter: baseFilter });
        return r.data;
      },
      view: async <T extends ViewData>(view: "behavior" | "discovery" | "podcasts" | "trends" | "genres" | "phases" | "milestones" | "habits", f: Pick<Filter, "from" | "to">) => {
        const r = await call<Extract<Res, { type: "view" }>>({
          type: "view",
          view,
          filter: { ...f, minPlayMs: settings.minPlayMs, tz: settings.tz },
        });
        return r.data as T;
      },
      onThisDay: async (md) => {
        const r = await call<Extract<Res, { type: "onThisDay" }>>({ type: "onThisDay", md, filter: baseFilter });
        return r.days;
      },
      compare: async (a, b) => {
        const r = await call<Extract<Res, { type: "compare" }>>({ type: "compare", a, b, filter: baseFilter });
        return r.data;
      },
      periods: async (list) => {
        const r = await call<Extract<Res, { type: "periods" }>>({ type: "periods", list, filter: baseFilter });
        return r.data;
      },
      search: async (q) => {
        const r = await call<Extract<Res, { type: "search" }>>({ type: "search", q, filter: baseFilter });
        return r.hits;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, extent, settings, theme, autoTheme, genreMix, mascot, year, setSettings, setCoverColor, call],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}
