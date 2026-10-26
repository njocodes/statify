"use client";
import { Dropzone } from "@/components/Dropzone";
import { useStatify } from "@/lib/store/StatifyProvider";

export default function Home() {
  const { t } = useStatify();
  return (
    <div className="mx-auto max-w-2xl space-y-8 pt-6">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("tagline")}</h1>
        <p className="text-muted">{t("privacy")}</p>
      </div>
      <Dropzone />
      <section className="card space-y-2 p-5">
        <h2 className="font-semibold">{t("howTitle")}</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>{t("how1")}</li>
          <li>{t("how2")}</li>
          <li>{t("how3")}</li>
        </ol>
      </section>
      <p className="text-xs text-muted">{t("disclaimer")}</p>
    </div>
  );
}
