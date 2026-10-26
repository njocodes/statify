"use client";
import { useState } from "react";
import { useStatify } from "@/lib/store/StatifyProvider";

/**
 * Collapsed by default: a single pill shows the current period. Year, play threshold and
 * time zone only appear when the pill is opened.
 */
export function FilterBar({ year, setYear, years }: { year: number | null; setYear: (y: number | null) => void; years: number[] }) {
  const { t, settings, setSettings } = useStatify();
  const [open, setOpen] = useState(false);
  const field = "rounded-lg border border-line bg-surface px-2 py-1.5 text-fg";
  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-muted hover:text-fg"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4" />
        </svg>
        <span className="font-medium text-fg">{year === null ? t("all") : year}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="page-in card grid gap-3 p-3 text-sm sm:grid-cols-3">
          <label className="space-y-1">
            <span className="block text-xs text-muted">{t("period")}</span>
            <select value={year ?? ""} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)} className={`${field} w-full`}>
              <option value="">{t("all")}</option>
              {[...years].reverse().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-xs text-muted">
              {t("minPlay")} ({t("seconds")})
            </span>
            <input
              type="number"
              min={0}
              max={300}
              value={Math.round(settings.minPlayMs / 1000)}
              onChange={(e) => setSettings({ minPlayMs: Math.max(0, Number(e.target.value) || 0) * 1000 })}
              className={`${field} w-full`}
            />
          </label>
          <label className="space-y-1">
            <span className="block text-xs text-muted">{t("timezone")}</span>
            <select value={settings.tz} onChange={(e) => setSettings({ tz: e.target.value })} className={`${field} w-full`}>
              {Array.from(new Set([settings.tz, "UTC", ...Intl.supportedValuesOf("timeZone")])).map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
