"use client";
import { useStatify } from "@/lib/store/StatifyProvider";
import type { Hat, Mood } from "@/lib/theme/genres";

/**
 * "Statty": a headphone-wearing blob. One drawing, restyled per theme via CSS variables
 * (outline = --ink, body = --accent, cheeks = --surface-2) so every theme gets its own look.
 * Mood and hat come from the listening history (skip rate, night owl share, top genre).
 */
export function Mascot({ size = 140, className = "", look }: { size?: number; className?: string; look?: { mood: Mood; hat: Hat } }) {
  const { mascot } = useStatify();
  const { mood, hat } = look ?? mascot;
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className} role="img" aria-label="Statty">
      <g fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        {/* body */}
        <path d="M34 118c-8-36 6-78 46-78s54 42 46 78c-3 14-22 20-46 20s-43-6-46-20z" fill="var(--accent)" />
        {/* headband + ear cups */}
        <path d="M30 86C26 44 52 22 80 22s54 22 50 64" />
        <rect x="18" y="78" width="22" height="38" rx="9" fill="var(--surface-2)" />
        <rect x="120" y="78" width="22" height="38" rx="9" fill="var(--surface-2)" />
        {/* eyes */}
        {mood === "sleepy" ? (
          <path d="M52 84q10 8 20 0M88 84q10 8 20 0" />
        ) : (
          <>
            <ellipse cx="62" cy="82" rx="9" ry="12" fill="var(--surface)" />
            <ellipse cx="98" cy="82" rx="9" ry="12" fill="var(--surface)" />
            <circle cx="65" cy="85" r="3.5" fill="var(--ink)" stroke="none" />
            <circle cx="101" cy="85" r="3.5" fill="var(--ink)" stroke="none" />
          </>
        )}
        {/* brows + mouth */}
        {mood === "grumpy" ? (
          <>
            <path d="M48 70l22-8M112 70l-22-8" />
            <path d="M66 114c8-8 20-8 28 0" />
          </>
        ) : mood === "sleepy" ? (
          <>
            <path d="M50 70l20 2M110 70l-20 2" />
            <ellipse cx="80" cy="110" rx="6" ry="5" fill="var(--surface)" />
            <path d="M118 44h12l-12 12h12" strokeWidth="3.5" />
          </>
        ) : (
          <>
            <path d="M50 64l20 5M110 64l-20 5" />
            <path d="M64 108c8 9 24 9 32 0" fill="var(--surface)" />
          </>
        )}
        {/* hats */}
        {hat === "cap" && <path d="M44 38c4-16 20-22 36-22s32 6 36 22zM112 38h30" fill="var(--ink)" strokeWidth="4" />}
        {hat === "cowboy" && <path d="M22 36c20 8 96 8 116 0-6-6-14-6-20-8-2-14-10-20-38-20S44 14 42 28c-6 2-14 2-20 8z" fill="var(--surface-2)" />}
        {hat === "beret" && <path d="M40 34c0-14 20-22 44-20s42 12 34 22c-14 6-60 8-78-2z" fill="var(--ink)" />}
        {hat === "spikes" && <path d="M44 34l-6-20 18 12 8-20 14 18 14-18 8 20 18-12-6 20" fill="var(--ink)" strokeWidth="4" />}
        {/* sound waves */}
        <path d="M8 90c-4 8-4 16 0 24M152 90c4 8 4 16 0 24" strokeWidth="4" />
      </g>
    </svg>
  );
}
