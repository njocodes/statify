"use client";
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
  const { t, settings, setSettings, autoTheme, theme, genreMix, extent } = useStatify();
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
