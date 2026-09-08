// Formatierung & Datumslogik — 1:1 aus finca-stundenzettel-v3.jsx übernommen.
// Dezimalkomma, Europe/Berlin, Montag als Wochenstart.

export const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;

export function today(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

export function hoursBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const s = sh * 60 + sm;
  let e = eh * 60 + em;
  if (e <= s) e += 1440;
  return Math.round(((e - s) / 60) * 100) / 100;
}

export function de(n: number, digits = 2): string {
  return Number(n).toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
export const eur = (n: number) => de(n) + " €";
export const hrs = (n: number) => de(n, n % 1 === 0 ? 0 : 2);

const asDate = (iso: string) => new Date(iso + "T12:00:00");

export const dLabel = (iso: string) =>
  asDate(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
export const dShort = (iso: string) =>
  asDate(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
export const monthKey = (iso: string) => iso.slice(0, 7);
export const monthLabel = (mk: string) =>
  new Date(mk + "-01T12:00:00").toLocaleDateString("de-DE", { month: "long", year: "numeric" });

export function mondayOf(iso: string): string {
  const dt = asDate(iso);
  dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
  return dt.toISOString().slice(0, 10);
}
export function addDays(iso: string, n: number): string {
  const dt = asDate(iso);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
}
export function isoWeek(iso: string): number {
  const dt = asDate(iso);
  dt.setDate(dt.getDate() + 4 - ((dt.getDay() + 6) % 7 || 7) + 3);
  const first = new Date(dt.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(((dt.getTime() - first.getTime()) / 86400000 - 3 + ((first.getDay() + 6) % 7)) / 7)
  );
}
export function weeksOfMonth(mk: string): string[] {
  const first = mk + "-01";
  const last = new Date(asDate(first).getFullYear(), asDate(first).getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
  const out: string[] = [];
  let m = mondayOf(first);
  while (m <= last) {
    out.push(m);
    m = addDays(m, 7);
  }
  return out;
}
