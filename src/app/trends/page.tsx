"use client";
import { EmptyHint } from "@/components/EmptyHint";
import { useState } from "react";
import Link from "next/link";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useView } from "@/lib/store/useView";
import { TREND_WINDOWS, type TrendGroup, type TrendItem, type TrendsData, type TrendWindow } from "@/lib/stats/trends";
import { Cover } from "@/components/Cover";
import { Spark } from "@/components/Spark";
import { EmptyNotice } from "@/components/EmptyNotice";
import { fmtDec, fmtInt } from "@/lib/format";
import { Segmented } from "@/components/Segmented";
import type { Key, Lang } from "@/lib/i18n/dict";
import type { Phase } from "@/lib/stats/extras";
import { fmtMonth } from "@/lib/format-month";
import { Skeleton } from "@/components/Skeleton";

const fmtMs = (ms: number, lang: Lang) => (ms >= 3_600_000 ? `${fmtDec(ms / 3_600_000, lang)} h` : `${fmtInt(ms / 60_000, lang)} min`);

function Row({ it, type, mode, lang }: { it: TrendItem; type: "artist" | "track"; mode: "up" | "down" | "new"; lang: Lang }) {
  const { t } = useStatify();
  const ratio = it.prev > 0 ? it.recent / it.prev : 0;
  const badge = mode === "up" ? `▲ ${fmtDec(ratio, lang)}×` : mode === "down" ? `▼ ${fmtInt((1 - ratio) * 100, lang)} %` : "★";
  return (
    <li>
      <Link href={`/item/?type=${type}&id=${encodeURIComponent(it.key)}`} className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-transform duration-150 hover:bg-surface2 active:scale-[0.985]">
        <Cover uri={it.uri} label={it.title} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium group-hover:text-accent">{it.title}</div>
          <div className="truncate text-xs text-muted">
            {it.subtitle && `${it.subtitle} · `}
            {fmtMs(it.recent, lang)}
            {it.prev > 0 && ` (${t("trVsBefore")} ${fmtMs(it.prev, lang)})`}
          </div>
        </div>
        <Spark data={it.spark} className="h-5 w-14 shrink-0" />
        <span className={`w-14 shrink-0 text-right text-xs font-semibold ${mode === "down" ? "text-muted" : "text-accent"}`}>{badge}</span>
      </Link>
    </li>
  );
}

function Section({ title, items, type, mode, lang }: { title: string; items: TrendItem[]; type: "artist" | "track"; mode: "up" | "down" | "new"; lang: Lang }) {
  const { t } = useStatify();
  return (
    <section className="card min-w-0 p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      {items.length ? (
        <ul className="space-y-1">
          {items.map((it) => (
            <Row key={it.key} it={it} type={type} mode={mode} lang={lang} />
          ))}
        </ul>
      ) : (
        <EmptyHint>{t("trNone")}</EmptyHint>
      )}
    </section>
  );
}

function Phases() {
  const { t, settings } = useStatify();
  const { data } = useView<Phase[]>("phases");
  const L = settings.lang;
  if (!data?.length) return null;
  return (
    <section className="card min-w-0 p-4">
      <h2 className="font-semibold">{t("phTitle")}</h2>
      <p className="mb-3 text-xs text-muted">{t("phSub")}</p>
      <ul className="space-y-1">
        {data.slice(0, 10).map((p) => (
          <li key={`${p.artist}-${p.from}`}>
            <Link href={`/item/?type=artist&id=${encodeURIComponent(p.artist)}`} className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-transform duration-150 hover:bg-surface2 active:scale-[0.985]">
              <Cover uri={p.uri} label={p.artist} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium group-hover:text-accent">{p.artist}</div>
                <div className="truncate text-xs text-muted">
                  {p.from === p.to ? fmtMonth(p.from, L) : `${fmtMonth(p.from, L)} – ${fmtMonth(p.to, L)}`} · {p.topTrack}
                </div>
              </div>
              <div className="shrink-0 text-right text-xs text-muted">
                <div className="font-semibold text-fg">{fmtDec(p.ms / 3_600_000, L)} h</div>
                <div>
                  {fmtInt(p.peakShare * 100, L)} % {t("phPeak")}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Trends() {
  const { t, settings } = useStatify();
  const { data, ready, hasData } = useView<TrendsData>("trends");
  const [w, setW] = useState<TrendWindow>(90);
  const [kind, setKind] = useState<"artists" | "tracks">("artists");
  if (ready && !hasData) return <EmptyNotice />;
  const g: TrendGroup | undefined = data?.windows[w][kind];
  const type = kind === "artists" ? "artist" : "track";
  const lang = settings.lang;
  return (
    <div className="stagger space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={w} onChange={setW} options={TREND_WINDOWS.map((x) => [x, t(`trWindow${x}` as Key)] as [TrendWindow, string])} />
        <Segmented value={kind} onChange={setKind} options={[["artists", t("trArtists")], ["tracks", t("trTracks")]]} />
      </div>
      <p className="text-xs text-muted">{t("trSince")}</p>
      {!g ? (
        <Skeleton />
      ) : (
        <div className="stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Section title={t("trRising")} items={g.rising} type={type} mode="up" lang={lang} />
          <Section title={t("trFalling")} items={g.falling} type={type} mode="down" lang={lang} />
          <Section title={t("trNew")} items={g.newcomers} type={type} mode="new" lang={lang} />
          <Section title={t("trComeback")} items={g.comebacks} type={type} mode="new" lang={lang} />
        </div>
      )}
      <Phases />
    </div>
  );
}
