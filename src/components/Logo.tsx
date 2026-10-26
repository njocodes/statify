export function Logo({ className = "text-xl" }: { className?: string }) {
  return (
    <span className={`logo display ${className}`} aria-label="Statify">
      {"Statify".split("").map((c, i) => (
        <span key={i} aria-hidden>
          {c}
        </span>
      ))}
    </span>
  );
}
