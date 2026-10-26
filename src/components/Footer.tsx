"use client";
import { useStatify } from "@/lib/store/StatifyProvider";

export function Footer() {
  const { t } = useStatify();
  return (
    <footer className="mt-12 border-t border-line pt-4 text-xs text-muted">
      <p>{t("footerDisclaimer")}</p>
      <p className="mt-1">
        <a href="https://github.com/njocodes/statify" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {t("footerSource")}
        </a>{" "}
        · MIT
      </p>
    </footer>
  );
}
