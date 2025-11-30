export function toRelative(ts: string | Date): string {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  const diff = (Date.now() - d.getTime()) / 1000; // seconds
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (abs < 60) return rtf.format(-Math.round(diff), "second");
  const m = abs / 60;
  if (m < 60) return rtf.format(-Math.round(diff / 60), "minute");
  const h = m / 60;
  if (h < 24) return rtf.format(-Math.round(diff / 3600), "hour");
  const dys = h / 24;
  return rtf.format(-Math.round(diff / 86400), "day");
}
