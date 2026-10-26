"use client";
import { useStatify } from "@/lib/store/StatifyProvider";

/** Placeholder cards while a page computes its numbers. */
export function Skeleton({ rows = 3 }: { rows?: number }) {
  const { t } = useStatify();
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">{t("loading")}</span>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-24 animate-pulse" style={{ background: "var(--surface-2)" }} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="card h-40 animate-pulse" style={{ background: "var(--surface-2)" }} />
      ))}
    </div>
  );
}
