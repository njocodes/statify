/** tiny bar sparkline; the second half (the recent window) is drawn in full colour */
export function Spark({ data, className = "" }: { data: number[]; className?: string }) {
  const max = Math.max(...data, 1);
  const half = data.length / 2;
  return (
    <svg viewBox={`0 0 ${data.length * 4} 20`} className={className} aria-hidden>
      {data.map((v, i) => {
        const h = Math.max(1, (v / max) * 20);
        return <rect key={i} x={i * 4} y={20 - h} width="3" height={h} rx="1" fill="var(--accent)" opacity={i >= half ? 1 : 0.35} />;
      })}
    </svg>
  );
}
