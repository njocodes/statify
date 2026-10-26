"use client";
import { useStatify } from "@/lib/store/StatifyProvider";

/** Hidden by default. Only when a single year is selected a small chip says so and lets you clear it. */
export function FilterBar({ year, setYear }: { year: number | null; setYear: (y: number | null) => void; years?: number[] }) {
  const { t } = useStatify();
  if (year === null) return null;
  return (
    <button
      onClick={() => setYear(null)}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted hover:text-fg"
    >
      <span className="font-medium text-fg">{year}</span>
      <span aria-label={t("all")}>✕</span>
    </button>
  );
}
