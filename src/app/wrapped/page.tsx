"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { EmptyNotice } from "@/components/EmptyNotice";
import { Cover } from "@/components/Cover";
import { Mascot } from "@/components/Mascot";
import { PeriodPanel } from "@/components/PeriodPanel";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useDashboard } from "@/lib/store/useDashboard";
import { DAYS_PER_MONTH, fmtDec, fmtInt, hours } from "@/lib/format";
import { dominantGenre, hatOf, moodOf, type GenreMix } from "@/lib/theme/genres";
import { GENRE_THEME, type ThemeId } from "@/lib/theme/themes";
import type { TopItem } from "@/lib/stats/core";

/** counts up from 0 once the slide appears */
function useCountUp(target: number, ms = 1300) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min((now - t0) / ms, 1);
      setV(target * (1 - Math.pow(1 - k, 4)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

const rise = (n: number): CSSProperties => ({ animationDelay: `${n * 110}ms` });
const Label = ({ n = 0, children }: { n?: number; children: ReactNode }) => (
  <div className="rise text-sm font-semibold uppercase tracking-[0.2em] text-muted" style={rise(n)}>{children}</div>
);
/** Big display text: shrinks until its longest word fits the width, so words never break in the middle. */
function Huge({ n = 1, size = "clamp(4rem, 22vw, 8rem)", children }: { n?: number; size?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = size;
      let px = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth + 1 && px > 20) {
        px *= 0.93;
        el.style.fontSize = `${px}px`;
      }
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [children, size]);
  return (
    <div ref={ref} className="display rise leading-[0.95]" style={{ fontSize: size, overflowWrap: "normal", wordBreak: "normal", hyphens: "none", ...rise(n) }}>
      {children}
    </div>
  );
}
const nameSize = (s: string) => (s.length > 22 ? "clamp(2.2rem, 11vw, 4rem)" : s.length > 12 ? "clamp(3rem, 15vw, 5.5rem)" : "clamp(4rem, 21vw, 7.5rem)");

function Ranked({ items, by, lang, cover }: { items: TopItem[]; by: "plays" | "ms"; lang: "en" | "de"; cover?: boolean }) {
  const max = items[0]?.[by] || 1;
  return (
    <ol className="w-full space-y-4">
      {items.map((it, i) => (
        <li key={it.key} className="rise flex items-center gap-3" style={rise(i + 1)}>
          <span className="display w-8 text-right text-3xl leading-none">{i + 1}</span>
          {cover && <Cover uri={it.uri} label={it.title} size={52} />}
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-bold leading-tight">{it.title}</div>
            {it.subtitle && <div className="truncate text-xs text-muted">{it.subtitle}</div>}
            <div className="mt-1.5 h-2 rounded-full" style={{ background: "var(--surface-2)" }}>
              <div className="grow h-2 rounded-full bg-accent" style={{ width: `${(it[by] / max) * 100}%`, animationDelay: `${(i + 2) * 110}ms` }} />
            </div>
          </div>
          <span className="shrink-0 text-xs font-semibold text-muted">{by === "plays" ? `${fmtInt(it.plays, lang)}×` : `${fmtInt(it.ms / 3_600_000, lang)} h`}</span>
        </li>
      ))}
    </ol>
  );
}

function HoursSlide({ h, plays, lang, t }: { h: number; plays: number; lang: "en" | "de"; t: (k: never) => string }) {
  const n = useCountUp(h);
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <Label>{(t as (k: string) => string)("wrHours")}</Label>
      <Huge size="clamp(5rem, 30vw, 10rem)">{fmtInt(n, lang)}</Huge>
      <div className="rise text-xl font-semibold" style={rise(3)}>
        ≈ {fmtInt(h / 24, lang)} {(t as (k: string) => string)("days")} · {fmtDec(h / 24 / DAYS_PER_MONTH, lang)} {(t as (k: string) => string)("months")}
      </div>
      <div className="rise text-muted" style={rise(4)}>
        {fmtInt(plays, lang)} {(t as (k: string) => string)("plays")}
      </div>
    </div>
  );
}

type Slide = { tone: "dark" | "accent"; node: ReactNode };

export default function Wrapped() {
  const { t, settings, genreMix, autoTheme, theme: activeTheme, year } = useStatify();
  const { data, ready, hasData } = useDashboard();
  const router = useRouter();
  const lang = settings.lang;
  const [i, setI] = useState(0);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState(false);
  const shot = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  // Every year gets the style of its own top genre; "all time" uses the overall one.
  const mix: GenreMix | null = (year !== null ? genreMix?.yearly?.[String(year)] : genreMix) ?? null;
  const genre = mix ? dominantGenre(mix) : null;
  const style: ThemeId = year === null ? autoTheme : genre ? GENRE_THEME[genre] : activeTheme;
  const look = { mood: mix ? moodOf(mix) : ("happy" as const), hat: hatOf(genre) };

  const scope = year === null ? t("all") : String(year);
  const heat = data?.heatmap ?? [];
  const hourMs = Array.from({ length: 24 }, (_, h) => heat.reduce((a, row) => a + (row[h] ?? 0), 0));
  const dayMs = heat.map((row) => row.reduce((a, b) => a + b, 0));
  const favDay = dayMs.indexOf(Math.max(...dayMs, 0));
  const favHour = hourMs.indexOf(Math.max(...hourMs, 0));
  const hourMax = Math.max(...hourMs, 1);
  const weekday = (d: number) => new Date(2024, 0, 1 + d).toLocaleDateString(lang, { weekday: "long" });
  const rec = data?.records[0];
  const artist = data?.top.artists.ms[0];

  const slides: Slide[] = data
    ? [
        {
          tone: "dark",
          node: (
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              <div className="pop"><Mascot size={230} look={look} /></div>
              <Label n={2}>{year === null ? t("wrIntroAll") : t("wrIntroYear")}</Label>
              <Huge n={3} size="clamp(4.5rem, 26vw, 9rem)">{scope}</Huge>
            </div>
          ),
        },
        { tone: "accent", node: <HoursSlide h={hours(data.overview.totalMs)} plays={data.overview.plays} lang={lang} t={t as never} /> },
        {
          tone: "dark",
          node: (
            <div className="flex h-full flex-col justify-center gap-6">
              <Label>{t("wrTopArtist")}</Label>
              <Huge size={nameSize(artist?.title ?? "")}>{artist?.title ?? "–"}</Huge>
              <div className="rise text-xl font-semibold text-muted" style={rise(3)}>
                {fmtInt((artist?.ms ?? 0) / 3_600_000, lang)} h · {fmtInt(artist?.plays ?? 0, lang)} {t("plays")}
              </div>
            </div>
          ),
        },
        {
          tone: "dark",
          node: (
            <div className="flex h-full flex-col justify-center gap-6">
              <Label>{t("topArtists")}</Label>
              <Ranked items={data.top.artists.ms.slice(0, 5)} by="ms" lang={lang} />
            </div>
          ),
        },
        {
          tone: "dark",
          node: (
            <div className="flex h-full flex-col justify-center gap-6">
              <Label>{t("topTracks")}</Label>
              <Ranked items={data.top.tracks.plays.slice(0, 5)} by="plays" lang={lang} cover />
            </div>
          ),
        },
        {
          tone: "accent",
          node: (
            <div className="flex h-full flex-col justify-center gap-7">
              <div className="space-y-3">
                <Label>{t("wrFavDay")}</Label>
                <Huge size="clamp(3rem, 16vw, 6rem)">{weekday(favDay)}</Huge>
              </div>
              <div className="space-y-3">
                <Label n={3}>{t("wrFavHour")}</Label>
                <Huge n={4} size="clamp(4rem, 22vw, 8rem)">{String(favHour).padStart(2, "0")}:00</Huge>
              </div>
              <div className="flex h-20 items-end gap-[3px]" aria-hidden>
                {hourMs.map((ms, h) => (
                  <div key={h} className="growY flex-1 rounded-sm" style={{ height: `${Math.max(6, (ms / hourMax) * 100)}%`, background: "var(--accent)", opacity: h === favHour ? 1 : 0.35, animationDelay: `${600 + h * 25}ms` }} />
                ))}
              </div>
            </div>
          ),
        },
        {
          tone: "dark",
          node: (
            <div className="flex h-full flex-col justify-center gap-9">
              <div className="space-y-3">
                <Label>{t("streak")}</Label>
                <Huge size="clamp(4rem, 22vw, 8rem)">{data.streak.longest}</Huge>
                <div className="rise text-xl font-semibold" style={rise(2)}>{t("days")}</div>
              </div>
              {rec && (
                <div className="space-y-2">
                  <Label n={3}>{t("wrRecord")}</Label>
                  <div className="display rise text-3xl" style={rise(4)}>{new Date(`${rec.day}T12:00:00`).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" })}</div>
                  <div className="rise text-muted" style={rise(5)}>{fmtDec(rec.ms / 3_600_000, lang)} h</div>
                </div>
              )}
            </div>
          ),
        },
        {
          tone: "accent",
          node: (
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              <div className="pop"><Mascot size={230} look={look} /></div>
              <Huge n={2} size="clamp(2.4rem, 12vw, 4.5rem)">{look.mood === "sleepy" ? t("wrMoodSleepy") : look.mood === "grumpy" ? t("wrMoodGrumpy") : t("wrMoodHappy")}</Huge>
              {genre && <Label n={4}>{t(`genre_${genre}`)}</Label>}
            </div>
          ),
        },
        {
          tone: "dark",
          node: (
            <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
              <div className="logo display pop text-6xl">Statify</div>
              <Label n={3}>{t("wrOutro")}</Label>
              <div className="display rise text-3xl" style={rise(4)}>{scope}</div>
            </div>
          ),
        },
      ]
    : [];

  const go = useCallback((d: number) => setI((n) => Math.min(Math.max(n + d, 0), Math.max(slides.length - 1, 0))), [slides.length]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") router.push("/dashboard/");
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [go, router]);
  // the story covers the whole screen, so the page behind must not scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function save() {
    if (!shot.current) return;
    setSaving(true);
    try {
      const url = await toPng(shot.current, { pixelRatio: 2, filter: (n) => !(n instanceof HTMLElement && n.dataset.nocapture !== undefined) });
      const a = document.createElement("a");
      a.href = url;
      a.download = `statify-wrapped-${scope}-${i + 1}.png`;
      a.click();
    } catch {
      // cover images without CORS headers cannot be inlined; the slide is still shown
    }
    setSaving(false);
  }

  if (ready && !hasData) return <EmptyNotice />;
  const cur = slides[i];
  const accent = cur?.tone === "accent";
  const toneVars = {
    "--t-accent": "var(--accent)",
    "--t-on": "var(--on-accent)",
  } as CSSProperties;
  const innerVars = (accent
    ? { background: "var(--t-accent)", "--fg": "var(--t-on)", "--muted": "color-mix(in srgb, var(--t-on) 62%, transparent)", "--surface-2": "color-mix(in srgb, var(--t-on) 18%, transparent)", "--accent": "var(--t-on)", "--on-accent": "var(--t-accent)" }
    : { background: "radial-gradient(120% 70% at 85% 0%, color-mix(in srgb, var(--accent) 38%, transparent), transparent 60%), var(--bg)" }) as CSSProperties;

  return (
    <div data-no-ptr data-theme={style} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" style={{ ...toneVars, fontFamily: "var(--font-body)" }}>
      {!data || !cur ? (
        <p className="text-muted">{t("loading")}</p>
      ) : (
        <div
          ref={shot}
          className="relative h-full w-full select-none overflow-hidden sm:h-[min(94dvh,900px)] sm:w-auto sm:rounded-3xl"
          style={{ ...innerVars, color: "var(--fg)", aspectRatio: undefined, transition: "background 0.4s" }}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          }}
        >
          <div className="sm:aspect-[9/16] h-full w-full">
            <div key={i} className="h-full px-7" style={{ paddingTop: "max(5.5rem, calc(env(safe-area-inset-top) + 4.5rem))", paddingBottom: "max(6rem, calc(env(safe-area-inset-bottom) + 5rem))" }}>
              {cur.node}
            </div>
          </div>
          <button aria-label="Back" className="absolute inset-y-24 left-0 w-1/3" onClick={() => go(-1)} />
          <button aria-label="Next" className="absolute inset-y-24 right-0 w-2/3" onClick={() => go(1)} />
          <div data-nocapture className="absolute inset-x-4 flex gap-1" style={{ top: "max(0.75rem, env(safe-area-inset-top))" }} aria-hidden>
            {slides.map((_, n) => (
              <span key={n} className="h-1 flex-1 rounded-full" style={{ background: "var(--fg)", opacity: n <= i ? 1 : 0.25 }} />
            ))}
          </div>
          <div data-nocapture className="absolute inset-x-4 flex items-center justify-between" style={{ top: "max(1.75rem, calc(env(safe-area-inset-top) + 1rem))" }}>
            <button onClick={() => setPanel(true)} className="rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: "var(--surface-2)", color: "var(--fg)" }}>
              {scope} ▾
            </button>
            <button onClick={() => router.push("/dashboard/")} aria-label="Close" className="rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: "var(--surface-2)", color: "var(--fg)" }}>
              ✕
            </button>
          </div>
          <div data-nocapture className="absolute inset-x-0 flex justify-center" style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
            <button onClick={save} disabled={saving} className="rounded-full px-6 py-3 text-sm font-bold shadow-lg disabled:opacity-60" style={{ background: "var(--fg)", color: accent ? "var(--t-accent)" : "var(--bg)" }}>
              {saving ? t("wrSaving") : t("wrSave")}
            </button>
          </div>
        </div>
      )}
      {panel && <PeriodPanel onClose={() => setPanel(false)} />}
    </div>
  );
}
