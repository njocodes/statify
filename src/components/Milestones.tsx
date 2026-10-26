"use client";
import { useStatify } from "@/lib/store/StatifyProvider";
import { useView } from "@/lib/store/useView";
import type { Milestone } from "@/lib/stats/extras";
import { Cover } from "./Cover";
import { fmtInt } from "@/lib/format";

export function Milestones() {
  const { t, settings } = useStatify();
  const { data } = useView<Milestone[]>("milestones");
  const L = settings.lang;
  if (!data?.length) return null;
  const date = (at: number) => new Date(at).toLocaleDateString(L, { day: "numeric", month: "short", year: "numeric", timeZone: settings.tz });
  return (
    <section className="card min-w-0 p-4">
      <h2 className="mb-3 font-semibold">{t("msTitle")}</h2>
      <ul className="space-y-2">
        {data.slice(0, 8).map((m, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            {m.kind === "track" ? <Cover uri={m.uri ?? ""} label={m.title ?? ""} size={36} /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-bold text-onaccent">★</span>}
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">
                {fmtInt(m.value, L)} {m.kind === "hours" ? t("msHoursLbl") : m.kind === "plays" ? t("msPlaysLbl") : t("msTrackLbl")}
              </div>
              <div className="truncate text-xs text-muted">{m.kind === "track" ? `${m.title} · ${m.subtitle}` : ""}</div>
            </div>
            <span className="shrink-0 text-xs text-muted">{date(m.at)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
