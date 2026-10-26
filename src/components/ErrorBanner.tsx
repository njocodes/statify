"use client";
import { useStatify } from "@/lib/store/StatifyProvider";

/** Shown when the background worker fails, instead of leaving the page on "calculating". */
export function ErrorBanner() {
  const { fatal, t } = useStatify();
  if (!fatal) return null;
  const reload = async () => {
    // also drop the offline copies, in case outdated files are the reason
    try {
      for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
      for (const k of await caches.keys()) await caches.delete(k);
    } catch {}
    location.reload();
  };
  return (
    <div role="alert" className="fixed inset-x-3 top-3 z-[90] mx-auto max-w-md rounded-2xl border border-line bg-surface p-4 text-sm shadow-xl" style={{ marginTop: "env(safe-area-inset-top)" }}>
      <div className="font-semibold">{t("errTitle")}</div>
      <p className="mt-1 text-muted">{t("errBody")}</p>
      <p className="mt-1 break-words text-xs text-muted">{fatal}</p>
      <button onClick={reload} className="mt-3 rounded-full bg-accent px-4 py-1.5 text-onaccent">
        {t("errReload")}
      </button>
    </div>
  );
}
