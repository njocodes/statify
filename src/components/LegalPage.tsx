"use client";
import type { ReactNode } from "react";
import { useStatify } from "@/lib/store/StatifyProvider";
import type { Lang } from "@/lib/i18n/dict";

export type LegalText = { title: string; blocks: { h: string; p: ReactNode }[] };

/** Shows the German text for German, the English text for every other language. */
export function LegalPage({ texts }: { texts: Record<"en" | "de", LegalText> }) {
  const { settings } = useStatify();
  const lang: Lang = settings.lang;
  const text = lang === "de" ? texts.de : texts.en;
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl">{text.title}</h1>
      {text.blocks.map((b) => (
        <section key={b.h} className="space-y-2">
          <h2 className="font-semibold">{b.h}</h2>
          <div className="space-y-2 text-sm leading-relaxed text-muted">{b.p}</div>
        </section>
      ))}
    </article>
  );
}

export const GH_PROFILE = "https://github.com/njocodes";
export const GH_ISSUES = "https://github.com/njocodes/statify/issues";

export const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-fg">
    {children}
  </a>
);
