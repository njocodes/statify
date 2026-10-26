"use client";
import { useStatify } from "@/lib/store/StatifyProvider";

export function FilterBar({ year, setYear, years }: { year: number | null; setYear: (y: number | null) => void; years: number[] }) {
  const { t, settings, setSettings } = useStatify();
  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${active ? "bg-accent text-black font-semibold" : "bg-surface text-muted hover:text-fg"}`;
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button className={chip(year === null)} onClick={() => setYear(null)}>
          {t("all")}
        </button>
        {[...years].reverse().map((y) => (
          <button key={y} className={chip(year === y)} onClick={() => setYear(y)}>
            {y}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
        <label className="flex items-center gap-2">
          {t("minPlay")}
          <input
            type="number"
            min={0}
            max={300}
            value={Math.round(settings.minPlayMs / 1000)}
            onChange={(e) => setSettings({ minPlayMs: Math.max(0, Number(e.target.value) || 0) * 1000 })}
            className="w-16 rounded-md border border-line bg-surface px-2 py-1 text-fg"
          />
          {t("seconds")}
        </label>
        <label className="flex items-center gap-2">
          {t("timezone")}
          <select
            value={settings.tz}
            onChange={(e) => setSettings({ tz: e.target.value })}
            className="max-w-48 rounded-md border border-line bg-surface px-2 py-1 text-fg"
          >
            {Array.from(new Set([settings.tz, "UTC", ...Intl.supportedValuesOf("timeZone")])).map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
