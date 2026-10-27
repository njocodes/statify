"use client";
import { Mascot } from "./Mascot";
import Link from "next/link";
import { useStatify } from "@/lib/store/StatifyProvider";

export function Footer() {
  const { t } = useStatify();
  return (
    <footer className="mt-12 border-t border-line pt-4 text-xs text-muted">
      <div className="flex items-center gap-2">
        <Mascot size={28} className="shrink-0" />
        <p>{t("footerDisclaimer")}</p>
      </div>
      <p className="mt-1">
        <a href="https://github.com/njocodes/statify" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {t("footerSource")}
        </a>{" "}
        · MIT · <Link href="/privacy/" className="underline underline-offset-2">{t("legalPrivacy")}</Link> · <Link href="/imprint/" className="underline underline-offset-2">{t("legalImprint")}</Link>
      </p>
    </footer>
  );
}
