"use client";
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
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="shrink-0" aria-label="Statify"><Logo /></Link>
        <nav className="order-last flex w-full gap-1 overflow-x-auto pb-0.5 sm:order-none sm:w-auto sm:flex-1">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                path === i.href ? "bg-surface2 text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {i.label}
            </Link>
          ))}
        </nav>
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
