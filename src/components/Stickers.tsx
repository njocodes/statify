"use client";
import { useStatify } from "@/lib/store/StatifyProvider";
import { Mascot } from "./Mascot";

/** Theme-specific drawn flourishes for the landing hero. Classic shows nothing. */
export function HeroArt() {
  const { theme } = useStatify();
  if (theme === "classic") return null;
  return (
    <div className="relative mx-auto h-48 w-full max-w-md select-none" aria-hidden>
      <Mascot size={150} className="absolute left-1/2 top-2 -translate-x-1/2" />
      {theme === "comic" && (
        <svg viewBox="0 0 120 90" className="absolute right-0 top-0 w-28 rotate-6" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round">
          <path d="M60 4l12 20 22-10-6 24 26 6-22 14 14 20-26-2-4 24-16-18-20 16-2-24-26 4 14-22L6 36l26-2-6-24 22 12z" />
          <text x="60" y="56" textAnchor="middle" fontSize="22" fill="var(--accent)" stroke="var(--ink)" strokeWidth="1.5" style={{ fontFamily: "var(--font-display)" }}>
            POW!
          </text>
        </svg>
      )}
      {theme === "graffiti" && (
        <svg viewBox="0 0 140 90" className="absolute left-0 top-2 w-32 -rotate-6">
          <text x="4" y="46" fontSize="38" fill="#ff2e93" stroke="#000" strokeWidth="2.5" style={{ fontFamily: "var(--font-display)" }}>
            1UP
          </text>
          <path d="M16 54v18M40 54v26M64 54v12" stroke="#ff2e93" strokeWidth="5" strokeLinecap="round" />
          <circle cx="112" cy="30" r="16" fill="var(--accent)" stroke="#000" strokeWidth="3" />
          <path d="M104 30h16M112 22v16" stroke="#000" strokeWidth="3" />
        </svg>
      )}
      {theme === "doodle" && (
        <svg viewBox="0 0 120 90" className="absolute right-0 top-0 w-28" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 18l5 12 13 1-10 8 4 13-12-7-12 7 4-13-10-8 13-1z" fill="var(--surface-2)" />
          <path d="M60 60c10-14 20 14 30 0s20 14 28 0" />
          <path d="M70 20c14 4 24 14 28 30M92 44l6 8 6-10" />
        </svg>
      )}
      {theme === "punk" && (
        <svg viewBox="0 0 120 100" className="absolute left-0 top-0 w-28 -rotate-6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round">
          <path d="M60 6C32 6 16 26 20 50c2 12 10 16 14 20v16h52V70c4-4 12-8 14-20C104 26 88 6 60 6z" />
          <circle cx="44" cy="46" r="10" fill="var(--ink)" />
          <circle cx="76" cy="46" r="10" fill="var(--ink)" />
          <path d="M60 58l-6 12h12zM46 86v-12M60 86V74M74 86V74" fill="var(--ink)" />
        </svg>
      )}
    </div>
  );
}
