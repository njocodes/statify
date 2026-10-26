"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStatify } from "@/lib/store/StatifyProvider";
import type { SearchHit } from "@/lib/stats/detail";
import { Cover } from "./Cover";

export function SearchBox() {
  const { search, t } = useStatify();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let off = false;
    const id = setTimeout(() => {
      if (q.trim().length < 2) return setHits([]);
      search(q).then((h) => !off && setHits(h));
    }, 150);
    return () => {
      off = true;
      clearTimeout(id);
    };
  }, [q, search]);

  useEffect(() => {
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={box} className="relative w-36 sm:w-64">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t("search")}
        className="w-full rounded-full border border-line bg-surface px-3 py-1.5 text-sm placeholder:text-muted focus:border-accentdim focus:outline-none"
      />
      {open && hits.length > 0 && (
        <ul className="card absolute right-0 top-full z-30 mt-2 max-h-[70dvh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto p-1">
          {hits.map((h) => (
            <li key={h.type + h.id}>
              <Link
                href={`/item/?type=${h.type}&id=${encodeURIComponent(h.id)}`}
                onClick={() => {
                  setOpen(false);
                  setQ("");
                }}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface2"
              >
                <Cover uri={h.uri} label={h.title} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{h.title}</span>
                  <span className="block truncate text-xs text-muted">
                    {t(`type_${h.type}`)}
                    {h.subtitle ? ` · ${h.subtitle}` : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
