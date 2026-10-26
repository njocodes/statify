"use client";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStatify } from "@/lib/store/StatifyProvider";
import type { Key } from "@/lib/i18n/dict";
import { SearchBox } from "./SearchBox";
import { Logo } from "./Logo";
import { PeriodPanel } from "./PeriodPanel";

type Item = { href: string; key: Key; icon: ReactNode };

const svg = (d: string) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

const DASH: Item = { href: "/dashboard/", key: "nav_dashboard", icon: svg("M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z") };
const PATTERNS: Item = { href: "/patterns/", key: "nav_patterns", icon: svg("M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2") };
const BEHAVIOR: Item = { href: "/behavior/", key: "nav_behavior", icon: svg("M5 5l9 7-9 7zM18 5v14") };
const DISCOVERY: Item = { href: "/discovery/", key: "nav_discovery", icon: svg("M12 3a9 9 0 100 18 9 9 0 000-18zM15.5 8.5l-2 5-5 2 2-5z") };
const TRENDS: Item = { href: "/trends/", key: "nav_trends", icon: svg("M3 17l6-6 4 4 8-8M15 7h6v6") };
const GENRES_ITEM: Item = { href: "/genres/", key: "nav_genres", icon: svg("M4 19V9M9 19V5M14 19v-8M19 19V7") };
const COMPARE: Item = { href: "/compare/", key: "nav_compare", icon: svg("M4 7h7M4 12h5M4 17h7M15 6v12M20 6v12") };
const WRAPPED: Item = { href: "/wrapped/", key: "nav_wrapped", icon: svg("M12 3l2.5 6 6.5.5-5 4.3 1.6 6.4L12 16.8 6.4 20.2 8 13.8 3 9.5 9.5 9z") };
const PODCASTS: Item = { href: "/podcasts/", key: "nav_podcasts", icon: svg("M9 4a3 3 0 016 0v7a3 3 0 01-6 0zM5 11a7 7 0 0014 0M12 18v3") };
const UPLOAD: Item = { href: "/", key: "nav_upload", icon: svg("M12 16V4M7 9l5-5 5 5M5 20h14") };
const SETTINGS: Item = { href: "/settings/", key: "nav_settings", icon: svg("M12 3a9 9 0 100 18c1.5 0 2-1 1.4-2-.6-1 0-2.2 1.2-2.2H17a4 4 0 004-4c0-5-4-9.8-9-9.8zM7.5 11h.01M10 7.5h.01M14.5 7.5h.01") };

const FILTER_ICON = svg("M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4");

const slide = "transition-[transform,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";

export function Nav() {
  const { t, settings, setSettings, extent } = useStatify();
  const path = usePathname();
  const hasData = !!extent?.first;
  const all = hasData ? [DASH, PATTERNS, BEHAVIOR, DISCOVERY, TRENDS, GENRES_ITEM, COMPARE, PODCASTS, WRAPPED, UPLOAD, SETTINGS] : [UPLOAD, SETTINGS];
  // Phone: four main tabs plus a "more" sheet, like a native tab bar.
  const tabs = hasData ? [DASH, PATTERNS, BEHAVIOR, DISCOVERY] : [UPLOAD, SETTINGS];
  const more = hasData ? [TRENDS, GENRES_ITEM, COMPARE, PODCASTS, WRAPPED, UPLOAD, SETTINGS] : [];
  const moreActive = more.some((i) => i.href === path);
  const [sheet, setSheet] = useState(false);
  const [panel, setPanel] = useState(false);

  // Desktop: the sliding indicator follows the active link, measured so any label width works.
  const rail = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const activeHref = all.find((i) => i.href === path)?.href;
  useLayoutEffect(() => {
    const el = rail.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`);
    setPill(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
  }, [activeHref, settings.lang, hasData]);

  const slots = tabs.length + (more.length ? 1 : 0);
  const active = moreActive ? tabs.length : tabs.findIndex((i) => i.href === path);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href={hasData ? "/dashboard/" : "/"} className="shrink-0" aria-label="Statify"><Logo /></Link>
          <nav ref={rail} className="relative hidden rounded-full border border-line bg-surface2 p-1 sm:flex">
            {pill && <span aria-hidden className={`absolute bottom-1 top-1 rounded-full bg-accent shadow-sm ${slide}`} style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} />}
            {all.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                data-href={i.href}
                className={`relative z-10 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-[color,transform] duration-150 active:scale-95 ${path === i.href ? "text-onaccent" : "text-muted hover:text-fg"}`}
              >
                {t(i.key)}
              </Link>
            ))}
          </nav>
          <div className="hidden flex-1 sm:block" />
          {hasData && <SearchBox />}
          {hasData && (
            <button onClick={() => setPanel(true)} aria-label={t("filterTitle")} className="hidden shrink-0 rounded-full border border-line p-1.5 text-muted hover:text-fg sm:block">
              {FILTER_ICON}
            </button>
          )}
          <button
            onClick={() => setSettings({ lang: settings.lang === "de" ? "en" : "de" })}
            className="ml-auto shrink-0 rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-fg sm:ml-0"
            aria-label="Language"
          >
            {settings.lang === "de" ? "EN" : "DE"}
          </button>
        </div>
      </header>

      {/* phone tab bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2 px-4 sm:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {sheet && (
          <>
            <button aria-label="Close" className="pointer-events-auto fixed inset-0 -z-10 cursor-default" onClick={() => setSheet(false)} />
            <div className="pointer-events-auto page-in grid w-full grid-cols-3 gap-1 self-end rounded-3xl border border-line bg-surface/95 p-1.5 shadow-xl backdrop-blur-xl sm:hidden" style={{ maxWidth: "19rem" }}>
              {more.map((i) => (
                <Link key={i.href} href={i.href} onClick={() => setSheet(false)} className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-3 text-xs active:scale-95 ${path === i.href ? "bg-accent text-onaccent" : "text-fg"}`}>
                  {i.icon}
                  {t(i.key)}
                </Link>
              ))}
              <button onClick={() => { setSheet(false); setPanel(true); }} className="flex flex-col items-center gap-1 rounded-2xl px-1 py-3 text-xs text-fg active:scale-95">
                {FILTER_ICON}
                {t("period")}
              </button>
            </div>
          </>
        )}
        <nav className="pointer-events-auto relative grid w-full max-w-sm rounded-full border border-line bg-surface/90 p-1 shadow-lg backdrop-blur-xl" style={{ gridTemplateColumns: `repeat(${slots}, 1fr)` }}>
          {active >= 0 && <span aria-hidden className={`absolute bottom-1 left-1 top-1 rounded-full bg-accent ${slide}`} style={{ width: `calc((100% - 0.5rem) / ${slots})`, transform: `translateX(${active * 100}%)` }} />}
          {tabs.map((i) => (
            <Link key={i.href} href={i.href} onClick={() => setSheet(false)} className={`relative z-10 flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium transition-[color,transform] active:scale-90 ${path === i.href ? "text-onaccent" : "text-muted"}`}>
              {i.icon}
              {t(i.key)}
            </Link>
          ))}
          {more.length > 0 && (
            <button onClick={() => setSheet((s) => !s)} aria-expanded={sheet} className={`relative z-10 flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium ${moreActive ? "text-onaccent" : "text-muted"}`}>
              {svg("M5 12h.01M12 12h.01M19 12h.01")}
              {t("nav_more")}
            </button>
          )}
        </nav>
      </div>
      {panel && <PeriodPanel onClose={() => setPanel(false)} />}
    </>
  );
}
