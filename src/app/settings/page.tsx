"use client";
import { useState } from "react";
import { useStatify } from "@/lib/store/StatifyProvider";
import { GENRES, THEME_IDS, THEME_LABEL, type ThemeId } from "@/lib/theme/themes";
import { Mascot } from "@/components/Mascot";

/** Each swatch previews its theme regardless of the active one by scoping the tokens. */
function Preview({ id }: { id: ThemeId }) {
  return (
    <div data-theme={id} className="rounded-lg p-3" style={{ background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-body)" }}>
      <div className="card flex items-center gap-3 p-3" style={{ transform: "none" }}>
        <Mascot size={44} />
        <div>
          <div className="display text-lg leading-none">Statify</div>
          <div className="mt-1 h-2 w-20 rounded-full" style={{ background: "var(--accent)" }} />
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { t, settings, setSettings, autoTheme, theme, genreMix, extent, lookupGenres, cancelLookup, exportBackup } = useStatify();
  const [bk, setBk] = useState<{ busy: boolean; msg?: string }>({ busy: false });
  const [mb, setMb] = useState<{ running: boolean; done: number; total: number; result?: string }>({ running: false, done: 0, total: 0 });
  const lang = settings.lang;
  const hasData = !!extent?.first;
  const coverage = genreMix?.totalMs ? Math.round((genreMix.matchedMs / genreMix.totalMs) * 100) : 0;
  const top = genreMix ? GENRES.map((g) => [g, genreMix.byGenre[g] ?? 0] as const).sort((a, b) => b[1] - a[1]).filter((x) => x[1] > 0) : [];
  const topMs = top[0]?.[1] || 1;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">{t("designTitle")}</h1>

      <section className="card space-y-3 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="radio" name="theme" checked={settings.theme === "auto"} onChange={() => setSettings({ theme: "auto" })} className="mt-1.5 accent-[var(--accent)]" />
          <span>
            <span className="display text-xl">{t("designAuto")}</span>
            <span className="block text-sm text-muted">{hasData ? `${t("designAutoSub")} → ${THEME_LABEL[autoTheme][lang]}` : t("designNoData")}</span>
          </span>
        </label>
        {hasData && top.length > 0 && (
          <div className="space-y-1.5 border-t border-line pt-3">
            <div className="text-xs text-muted">
              {t("designDetected")} · {coverage} % {t("designCoverage")}
            </div>
            {top.map(([g, ms]) => (
              <div key={g} className="flex items-center gap-2 text-sm">
                <span className="w-44 shrink-0 truncate">{t(`genre_${g}`)}</span>
                <div className="h-2 flex-1 rounded-full bg-surface2">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${(ms / topMs) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {hasData && (
        <section className="card space-y-3 p-4">
          <div>
            <h2 className="display text-xl">{t("bkTitle")}</h2>
            <p className="text-sm text-muted">{t("bkSub")}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled={bk.busy}
              onClick={async () => {
                setBk({ busy: true });
                try {
                  const { blob, count } = await exportBackup();
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `statify-backup-${new Date().toISOString().slice(0, 10)}.json.gz`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
                  setBk({ busy: false, msg: t("bkDone").replace("{n}", String(count)) });
                } catch {
                  setBk({ busy: false });
                }
              }}
              className="rounded-full bg-accent px-4 py-1.5 text-sm text-onaccent disabled:opacity-60"
            >
              {bk.busy ? t("bkBusy") : t("bkExport")}
            </button>
            {bk.msg && <span className="text-sm text-muted" role="status">{bk.msg}</span>}
          </div>
        </section>
      )}

      {hasData && (
        <section className="card space-y-3 p-4">
          <div>
            <h2 className="display text-xl">{t("mbTitle")}</h2>
            <p className="text-sm text-muted">{t("mbSub")}</p>
          </div>
          <div className="flex items-center gap-3">
            {mb.running ? (
              <button onClick={cancelLookup} className="rounded-full border border-line px-4 py-1.5 text-sm">{t("mbStop")}</button>
            ) : (
              <button
                onClick={async () => {
                  setMb({ running: true, done: 0, total: 0 });
                  const r = await lookupGenres(300, (done, total) => setMb({ running: true, done, total })).catch(() => ({ found: 0, checked: 0, cancelled: false }));
                  setMb({ running: false, done: 0, total: 0, result: t("mbDone").replace("{n}", String(r.found)).replace("{m}", String(r.checked)) });
                }}
                className="rounded-full bg-accent px-4 py-1.5 text-sm text-onaccent"
              >
                {t("mbStart")}
              </button>
            )}
            {mb.running && (
              <span className="text-sm text-muted" role="status">
                {t("mbRunning")} {mb.done}/{mb.total || "…"}
              </span>
            )}
            {!mb.running && mb.result && <span className="text-sm text-muted" role="status">{mb.result}</span>}
          </div>
        </section>
      )}

      <section className="card p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={settings.coverAccent} onChange={(e) => setSettings({ coverAccent: e.target.checked })} className="mt-1.5 accent-[var(--accent)]" />
          <span>
            <span className="display text-xl">{t("coverAccent")}</span>
            <span className="block text-sm text-muted">{t("coverAccentSub")}</span>
          </span>
        </label>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl">{t("designManual")}</h2>
          <p className="text-sm text-muted">{t("designManualSub")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_IDS.map((id) => {
            const selected = settings.theme === id;
            return (
              <button
                key={id}
                onClick={() => setSettings({ theme: id })}
                className="card space-y-2 p-3 text-left transition hover:brightness-105"
                style={selected ? { outline: "3px solid var(--accent)", outlineOffset: 3 } : undefined}
                aria-pressed={selected}
              >
                <Preview id={id} />
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="display text-lg leading-tight">{THEME_LABEL[id][lang]}</div>
                    <div className="text-xs text-muted">{THEME_LABEL[id].blurb[lang]}</div>
                  </div>
                  {theme === id && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-onaccent">{t("designActive")}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
