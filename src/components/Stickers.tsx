"use client";
import { useStatify } from "@/lib/store/StatifyProvider";
import { Mascot } from "./Mascot";

/** Theme-specific drawn flourishes for the landing hero. Classic shows nothing. */
export function HeroArt() {
  const { theme } = useStatify();
  if (theme === "classic" || theme === "clean") return null;
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
      {theme === "cassette" && (
        <svg viewBox="0 0 140 90" className="absolute right-0 top-2 w-32 rotate-6" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round">
          <rect x="6" y="10" width="128" height="72" rx="8" fill="#f1e6c8" />
          <rect x="22" y="20" width="96" height="26" rx="4" fill="var(--accent)" />
          <circle cx="46" cy="64" r="10" fill="#2b2622" />
          <circle cx="94" cy="64" r="10" fill="#2b2622" />
          <path d="M56 64h28" />
          <path d="M30 33h40" stroke="#f1e6c8" />
        </svg>
      )}
      {theme === "vaporwave" && (
        <svg viewBox="0 0 140 90" className="absolute right-0 top-0 w-32">
          <defs>
            <linearGradient id="vw-sun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff36b" />
              <stop offset="1" stopColor="#ff5fa8" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="40" r="32" fill="url(#vw-sun)" />
          <g stroke="#1a0b3d" strokeWidth="3">
            <path d="M34 50h72M38 58h64M44 66h52" />
          </g>
          <path d="M10 80h120M30 72l-18 18M70 72v18M110 72l18 18" stroke="#01cdfe" strokeWidth="2" />
        </svg>
      )}
      {theme === "riso" && (
        <svg viewBox="0 0 140 90" className="absolute left-0 top-2 w-32" style={{ mixBlendMode: "multiply" }}>
          <circle cx="44" cy="44" r="30" fill="#ff48b0" opacity="0.85" />
          <circle cx="76" cy="44" r="30" fill="#0078bf" opacity="0.75" />
          <circle cx="60" cy="62" r="24" fill="#ffe800" opacity="0.8" />
        </svg>
      )}
      {theme === "jazz" && (
        <svg viewBox="0 0 140 90" className="absolute right-0 top-0 w-32">
          <circle cx="52" cy="46" r="34" fill="#f28c28" />
          <rect x="64" y="14" width="46" height="64" fill="#0b2a5b" />
          <path d="M20 72L70 20l30 52z" fill="#f2e9d8" stroke="#0b2a5b" strokeWidth="4" />
        </svg>
      )}
      {theme === "metal" && (
        <svg viewBox="0 0 120 100" className="absolute left-0 top-0 w-28" strokeLinejoin="round" stroke="#e8e0d0" strokeWidth="3">
          <path d="M60 6C32 6 16 26 20 50c2 12 10 16 14 20v16h52V70c4-4 12-8 14-20C104 26 88 6 60 6z" fill="#131313" />
          <circle cx="44" cy="46" r="10" fill="#c0171b" />
          <circle cx="76" cy="46" r="10" fill="#c0171b" />
          <path d="M60 58l-6 12h12zM46 86v-12M60 86V74M74 86V74" fill="#e8e0d0" />
          <path d="M8 14l24 24M112 14L88 38" strokeWidth="5" />
        </svg>
      )}
      {theme === "western" && (
        <svg viewBox="0 0 140 90" className="absolute right-0 top-0 w-32 -rotate-6" fill="#a4331a" stroke="#3b2412" strokeWidth="3" strokeLinejoin="round">
          <path d="M70 6l10 24 26 2-20 17 7 25-23-14-23 14 7-25-20-17 26-2z" />
          <circle cx="70" cy="40" r="7" fill="#f4e6bf" />
          <text x="70" y="86" textAnchor="middle" fontSize="16" fill="#3b2412" stroke="none" style={{ fontFamily: "var(--font-display)" }}>WANTED</text>
        </svg>
      )}
      {theme === "y2k" && (
        <svg viewBox="0 0 140 90" className="absolute right-0 top-0 w-32">
          <defs>
            <radialGradient id="y2k-b" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.45" stopColor="#7fd0ff" />
              <stop offset="1" stopColor="#1c9be6" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="48" r="32" fill="url(#y2k-b)" />
          <circle cx="104" cy="30" r="18" fill="url(#y2k-b)" />
          <ellipse cx="40" cy="34" rx="12" ry="7" fill="#ffffff" opacity="0.7" />
          <path d="M120 66l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#ffffff" stroke="#3b6a99" strokeWidth="1.5" />
        </svg>
      )}
      {theme === "rave" && (
        <svg viewBox="0 0 120 100" className="absolute right-0 top-0 w-28 rotate-6" stroke="#000" strokeWidth="5">
          <circle cx="60" cy="50" r="40" fill="#e8ff1a" />
          <circle cx="44" cy="40" r="5" fill="#000" />
          <circle cx="76" cy="40" r="5" fill="#000" />
          <path d="M34 60c10 18 42 18 52 0" fill="none" strokeLinecap="round" />
        </svg>
      )}
      {theme === "blueprint" && (
        <svg viewBox="0 0 140 90" className="absolute right-0 top-2 w-32" fill="none" stroke="#cfe3ff" strokeWidth="1.5">
          <circle cx="70" cy="45" r="30" />
          <circle cx="70" cy="45" r="2" fill="#ffd54a" stroke="none" />
          <path d="M70 45l26-15" stroke="#ffd54a" />
          <path d="M20 80h100M20 76v8M120 76v8" />
          <text x="70" y="74" textAnchor="middle" fontSize="8" fill="#cfe3ff" stroke="none">R 30</text>
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
