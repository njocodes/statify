"use client";
import type { ReactNode } from "react";
import { Mascot } from "./Mascot";

/** Friendly "nothing here" line with the mascot, used where a section has no data. */
export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Mascot size={48} className="shrink-0" />
      <p className="text-sm text-muted">{children}</p>
    </div>
  );
}
