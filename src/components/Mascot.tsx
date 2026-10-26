/**
 * "Statty": a headphone-wearing blob. One drawing, restyled per theme via CSS variables
 * (outline = --ink, body = --accent, cheeks = --surface-2) so every theme gets its own look.
 */
export function Mascot({ size = 140, className = "" }: { size?: number; className?: string }) {
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
        <ellipse cx="62" cy="82" rx="9" ry="12" fill="var(--surface)" />
        <ellipse cx="98" cy="82" rx="9" ry="12" fill="var(--surface)" />
        <circle cx="65" cy="85" r="3.5" fill="var(--ink)" stroke="none" />
        <circle cx="101" cy="85" r="3.5" fill="var(--ink)" stroke="none" />
        {/* brows + mouth */}
        <path d="M50 64l20 5M110 64l-20 5" />
        <path d="M64 108c8 9 24 9 32 0" fill="var(--surface)" />
        {/* sound waves */}
        <path d="M8 90c-4 8-4 16 0 24M152 90c4 8 4 16 0 24" strokeWidth="4" />
      </g>
    </svg>
  );
}
