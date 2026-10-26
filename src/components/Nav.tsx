"use client";
import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStatify } from "@/lib/store/StatifyProvider";
import { SearchBox } from "./SearchBox";
import { Logo } from "./Logo";

export function Nav() {
  const { t, settings, setSettings, extent } = useStatify();
  const path = usePathname();
  const hasData = !!extent?.first;
  const items = [
    ...(hasData ? [{ href: "/dashboard/", label: t("nav_dashboard") }, { href: "/patterns/", label: t("nav_patterns") }, { href: "/behavior/", label: t("nav_behavior") }, { href: "/discovery/", label: t("nav_discovery") }, { href: "/podcasts/", label: t("nav_podcasts") }] : []),
    { href: "/", label: t("nav_upload") },
    { href: "/settings/", label: t("nav_settings") },
  ];
  const rail = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const activeHref = items.find((i) => i.href === path)?.href;
  // The sliding indicator follows the active link; measured, so it works for any label width.
  useLayoutEffect(() => {
    const el = rail.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`);
    setPill(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeHref, settings.lang, hasData]);
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href={hasData ? "/dashboard/" : "/"} className="shrink-0" aria-label="Statify"><Logo /></Link>
        <nav
          ref={rail}
          className="no-scrollbar relative order-last flex w-full gap-0.5 overflow-x-auto rounded-full border border-line bg-surface2 p-1 sm:order-none sm:w-auto"
        >
          {pill && (
            <span
              aria-hidden
              className="absolute bottom-1 top-1 rounded-full bg-accent shadow-sm transition-[transform,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ width: pill.w, transform: `translateX(${pill.x}px)` }}
            />
          )}
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              data-href={i.href}
              className={`relative z-10 shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-[color,transform] duration-150 active:scale-95 ${
                path === i.href ? "text-onaccent" : "text-muted hover:text-fg"
              }`}
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="hidden flex-1 sm:block" />
        {hasData && <SearchBox />}
        <button
          onClick={() => setSettings({ lang: settings.lang === "de" ? "en" : "de" })}
          className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-fg"
          aria-label="Language"
        >
          {settings.lang === "de" ? "EN" : "DE"}
        </button>
      </div>
    </header>
  );
}
