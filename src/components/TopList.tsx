"use client";
import { useState } from "react";
import type { TopItem } from "@/lib/stats/core";
import { useStatify } from "@/lib/store/StatifyProvider";
import { fmtInt } from "@/lib/format";
import Link from "next/link";
import { Cover } from "./Cover";
import type { EntityType } from "@/lib/stats/detail";

export function TopList({ title, items, type }: { title: string; items: Record<"plays" | "ms", TopItem[]>; type: EntityType }) {
  const { t, settings } = useStatify();
  const [by, setBy] = useState<"plays" | "ms">("plays");
  const [n, setN] = useState(10);
  const list = items[by].slice(0, n);
  const max = list[0]?.[by] || 1;
  return (
    <section className="card min-w-0 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        <div className="flex rounded-full bg-surface2 p-0.5 text-xs">
          {(["plays", "ms"] as const).map((k) => (
            <button key={k} onClick={() => setBy(k)} className={`rounded-full px-3 py-1 ${by === k ? "bg-accent text-onaccent" : "text-muted"}`}>
              {k === "plays" ? t("byPlays") : t("byMinutes")}
            </button>
          ))}
        </div>
      </div>
      <ol className="space-y-2">
        {list.map((it, i) => (
          <li key={it.key} className="flex items-center gap-3">
            <span className="w-5 text-right text-xs text-muted">{i + 1}</span>
            <Cover uri={it.uri} label={it.title} />
            <div className="min-w-0 flex-1">
              <Link href={`/item/?type=${type}&id=${encodeURIComponent(it.key)}`} className="block truncate text-sm font-medium hover:text-accent">{it.title || "–"}</Link>
              {it.subtitle && <div className="truncate text-xs text-muted">{it.subtitle}</div>}
              <div className="mt-1 h-1 rounded-full bg-surface2">
                <div className="h-1 rounded-full bg-accent" style={{ width: `${(it[by] / max) * 100}%` }} />
              </div>
            </div>
            <div className="shrink-0 text-right text-xs text-muted">
              {by === "plays" ? `${fmtInt(it.plays, settings.lang)}×` : `${fmtInt(it.ms / 60000, settings.lang)} ${t("min")}`}
            </div>
          </li>
        ))}
      </ol>
      {n < items[by].length && (
        <button onClick={() => setN(n + 20)} className="mt-3 text-xs text-muted hover:text-fg">
          +20
        </button>
      )}
    </section>
  );
}
