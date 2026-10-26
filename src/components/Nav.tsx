"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStatify } from "@/lib/store/StatifyProvider";
import { SearchBox } from "./SearchBox";

export function Nav() {
  const { t, settings, setSettings, extent } = useStatify();
  const path = usePathname();
  const hasData = !!extent?.first;
  const items = [
    ...(hasData ? [{ href: "/dashboard/", label: t("nav_dashboard") }, { href: "/patterns/", label: t("nav_patterns") }] : []),
    { href: "/", label: t("nav_upload") },
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Stat<span className="text-accent">ify</span>
        </Link>
        <nav className="flex flex-1 gap-1 overflow-x-auto">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
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
