"use client";
import Link from "next/link";
import { useStatify } from "@/lib/store/StatifyProvider";

export function EmptyNotice() {
  const { t } = useStatify();
  return (
    <div className="space-y-3 pt-10 text-center">
      <p className="text-muted">{t("noData")}</p>
      <Link href="/" className="inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-onaccent">
        {t("goUpload")}
      </Link>
    </div>
  );
}
