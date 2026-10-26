"use client";
import { Dropzone } from "@/components/Dropzone";
import { HeroArt } from "@/components/Stickers";
import { useStatify } from "@/lib/store/StatifyProvider";

export default function Home() {
  const { t } = useStatify();
  return (
    <div className="mx-auto max-w-2xl space-y-8 pt-6">
      <HeroArt />
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("tagline")}</h1>
        <p className="text-muted">{t("privacy")}</p>
      </div>
      <Dropzone />
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">{t("needTitle")}</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {(["need1", "need2", "need3", "need4"] as const).map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ul>
      </section>
      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">{t("howTitle")}</h2>
        <ol className="space-y-4">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <li key={n} className="flex gap-3">
              <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-onaccent">{n}</span>
              <div className="min-w-0 space-y-1">
                <h3 className="font-medium">{t(`how${n}t` as const)}</h3>
                <p className="text-sm text-muted">{t(`how${n}` as const)}</p>
                {n === 1 && (
                  <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-line px-3 py-1 text-sm underline underline-offset-2">
                    {t("how1link")} ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p className="border-t border-line pt-3 text-sm text-muted">{t("howNote")}</p>
      </section>
    </div>
  );
}
