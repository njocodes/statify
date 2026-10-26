import { CountUp } from "./CountUp";

/** `count` + `format` animate the number; plain `value` is shown as is. */
export function Stat({ label, value, sub, count, format }: { label: string; value?: string; sub?: string; count?: number; format?: (n: number) => string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 display text-2xl tabular-nums">{count !== undefined && format ? <CountUp to={count} format={format} /> : value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}
