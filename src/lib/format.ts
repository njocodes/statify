export const fmtInt = (n: number, lang = "de") => new Intl.NumberFormat(lang).format(Math.round(n));
export const hours = (ms: number) => ms / 3.6e6;
export function fmtDuration(ms: number): string {
  const m = Math.round(ms / 60000);
  const h = Math.floor(m / 60);
  return h ? `${h} h ${m % 60} min` : `${m} min`;
}
export function fmtDate(ts: number | string, lang: string, tz: string): string {
  const d = typeof ts === "string" ? Date.parse(ts + "T12:00:00Z") : ts;
  return new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeZone: typeof ts === "string" ? "UTC" : tz }).format(d);
}

/** Epoch ms of Jan 1st 00:00 of `year` in the given time zone. */
export function yearStart(year: number, tz: string): number {
  const guess = Date.UTC(year, 0, 1);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(guess);
  const g = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return guess - (asUtc - guess);
}
