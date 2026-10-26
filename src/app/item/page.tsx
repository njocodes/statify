"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStatify } from "@/lib/store/StatifyProvider";
import type { Detail, EntityType } from "@/lib/stats/detail";
import { Cover } from "@/components/Cover";
import { Stat } from "@/components/Stat";
import { MonthChart } from "@/components/MonthChart";
import { TopList } from "@/components/TopList";
import { fmtDate, fmtDuration, fmtInt } from "@/lib/format";

function Item() {
  const params = useSearchParams();
  const router = useRouter();
  const type = params.get("type") as EntityType | null;
  const id = params.get("id");
  const { t, settings, ready, extent, detail } = useStatify();
  const [d, setD] = useState<Detail | null | undefined>(undefined);
  const L = settings.lang;

  useEffect(() => {
    if (!ready || !type || !id || !extent?.first) return;
    let off = false;
    detail(type, id).then((r) => !off && setD(r));
    return () => {
      off = true;
    };
  }, [ready, type, id, extent, settings.minPlayMs, settings.tz, detail]);

  if (!ready || (extent?.first && d === undefined)) return <p className="text-muted">{t("loading")}</p>;
  if (!d)
    return (
      <div className="space-y-3 pt-10 text-center">
        <p className="text-muted">{extent?.first ? t("notFound") : t("noData")}</p>
        <Link href="/" className="text-accent">
          {t("goUpload")}
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="text-sm text-muted hover:text-fg">
        ← {t("back")}
      </button>
      <div className="flex items-center gap-4">
        <Cover uri={d.uri} label={d.title} size={96} />
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-accent">{t(`type_${d.type}`)}</div>
          <h1 className="break-words text-2xl font-bold sm:text-4xl">{d.title}</h1>
          {d.subtitle && <div className="text-muted">{d.subtitle}</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={t("plays")} value={fmtInt(d.plays, L)} />
        <Stat label={t("listened")} value={fmtDuration(d.ms)} />
        <Stat label={t("rank")} value={d.rank ? `#${fmtInt(d.rank, L)}` : "–"} />
        <Stat label={t("skipRate")} value={`${Math.round(d.skipRate * 100)} %`} />
        <Stat label={t("firstPlayed")} value={fmtDate(d.first, L, settings.tz)} />
        <Stat label={t("lastPlayed")} value={fmtDate(d.last, L, settings.tz)} />
        <Stat label={t("activeDays")} value={fmtInt(d.activeDays, L)} />
      </div>
      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">{t("perMonth")}</h2>
        <MonthChart months={d.months} />
      </section>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {d.topTracks.length > 0 && <TopList title={t("topTracks")} items={{ plays: d.topTracks, ms: [...d.topTracks].sort((a, b) => b.ms - a.ms) }} type="track" />}
        {d.topAlbums.length > 0 && <TopList title={t("topAlbums")} items={{ plays: d.topAlbums, ms: [...d.topAlbums].sort((a, b) => b.ms - a.ms) }} type="album" />}
      </div>
    </div>
  );
}

export default function ItemPage() {
  return (
    <Suspense fallback={null}>
      <Item />
    </Suspense>
  );
}
