"use client";
import { useStatify } from "@/lib/store/StatifyProvider";

/** Period, play threshold and time zone: one sheet, opened from the "more" menu (phone) or the header icon (desktop). */
export function PeriodPanel({ onClose }: { onClose: () => void }) {
  const { t, settings, setSettings, year, setYear, extent } = useStatify();
  const years = extent?.years ?? [];
  const field = "w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-fg";
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-start sm:justify-end sm:p-4 sm:pt-16" role="dialog" aria-modal="true" aria-label={t("filterTitle")}>
      <button aria-label="Close" className="absolute inset-0 cursor-default bg-black/40" onClick={onClose} />
      <div className="page-in card relative w-full max-w-sm space-y-3 p-4 text-sm sm:w-80" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{t("filterTitle")}</h2>
          <button onClick={onClose} aria-label="Close" className="px-2 text-muted">✕</button>
        </div>
        <label className="block space-y-1">
          <span className="block text-xs text-muted">{t("period")}</span>
          <select value={year ?? ""} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)} className={field}>
            <option value="">{t("all")}</option>
            {[...years].reverse().map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="block text-xs text-muted">{t("minPlay")} ({t("seconds")})</span>
          <input type="number" min={0} max={300} value={Math.round(settings.minPlayMs / 1000)} onChange={(e) => setSettings({ minPlayMs: Math.max(0, Number(e.target.value) || 0) * 1000 })} className={field} />
        </label>
        <label className="block space-y-1">
          <span className="block text-xs text-muted">{t("timezone")}</span>
          <select value={settings.tz} onChange={(e) => setSettings({ tz: e.target.value })} className={field}>
            {Array.from(new Set([settings.tz, "UTC", ...Intl.supportedValuesOf("timeZone")])).map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
