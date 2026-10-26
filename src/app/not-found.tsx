"use client";
import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { useStatify } from "@/lib/store/StatifyProvider";

export default function NotFound() {
  const { t } = useStatify();
  return (
    <div className="mx-auto max-w-md space-y-4 pt-10 text-center">
      <Mascot size={120} className="mx-auto" />
      <h1 className="text-3xl">404 – {t("notFoundTitle")}</h1>
      <p className="text-muted">{t("notFoundText")}</p>
      <Link href="/" className="inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-onaccent">
        {t("backHome")}
      </Link>
    </div>
  );
}
