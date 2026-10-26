"use client";
import { useEffect, useRef, useState } from "react";
import type { TopItem } from "@/lib/stats/core";
import { useStatify } from "@/lib/store/StatifyProvider";
import { fmtInt } from "@/lib/format";
import Link from "next/link";
import { Cover } from "./Cover";
import { Segmented } from "./Segmented";
import type { EntityType } from "@/lib/stats/detail";

export function TopList({ title, items, type }: { title: string; items: Record<"plays" | "ms", TopItem[]>; type: EntityType }) {
  const { t, settings } = useStatify();
  const [by, setBy] = useState<"plays" | "ms">("plays");
  const [n, setN] = useState(10);
  const box = useRef<HTMLOListElement>(null);
  const shown = useRef(10);
  // After "+20" the list keeps its height and scrolls a few rows, so the new entries are visibly there.
  useEffect(() => {
    const old = shown.current;
    shown.current = n;
    if (n <= old) return;
    const li = box.current?.children[Math.max(0, old - 3)] as HTMLElement | undefined;
    if (li) box.current?.scrollTo({ top: li.offsetTop, behavior: "smooth" });
  }, [n]);
  const list = items[by].slice(0, n);
  const max = list[0]?.[by] || 1;
  return (
    <section className="card min-w-0 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        <Segmented size="sm" value={by} onChange={setBy} options={[["plays", t("byPlays")], ["ms", t("byMinutes")]]} />
      </div>
      <ol ref={box} className={`relative space-y-2 ${n > 10 ? "-mr-2 max-h-[38.5rem] overflow-y-auto overscroll-contain pr-2" : ""}`}>
        {list.map((it, i) => (
          <li key={it.key}>
            {/* the whole row is the tap target, so it works comfortably on phones */}
            <Link
              href={`/item/?type=${type}&id=${encodeURIComponent(it.key)}`}
              className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-1 transition-transform duration-150 hover:bg-surface2 active:scale-[0.985] active:bg-surface2"
            >
              <span className="w-5 text-right text-xs text-muted">{i + 1}</span>
              <Cover uri={it.uri} label={it.title} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium group-hover:text-accent">{it.title || "–"}</div>
                {it.subtitle && <div className="truncate text-xs text-muted">{it.subtitle}</div>}
                <div className="mt-1 h-1 rounded-full bg-surface2 group-hover:bg-surface">
                  <div className="grow h-1 rounded-full bg-accent" style={{ animationDelay: `${Math.min(i, 12) * 35}ms`, width: `${(it[by] / max) * 100}%`, backgroundImage: "linear-gradient(90deg, var(--accent), var(--accent-2, var(--accent)))" }} />
                </div>
              </div>
              <div className="shrink-0 text-right text-xs text-muted">
                {by === "plays" ? `${fmtInt(it.plays, settings.lang)}×` : `${fmtInt(it.ms / 60000, settings.lang)} ${t("min")}`}
              </div>
            </Link>
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
