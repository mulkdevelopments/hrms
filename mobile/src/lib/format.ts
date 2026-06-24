export function fmtDate(value?: string | null, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", withTime ? { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" });
}

export function fmtMoney(value?: number | null, currency?: string | null) {
  if (value == null || Number.isNaN(value)) return "—";
  const amount = Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const code = currency?.trim();
  return code ? `${code} ${amount}` : amount;
}

export function fmtNumber(value?: number | null, digits = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(digits);
}

export function employeeName(first?: string | null, last?: string | null) {
  return `${first ?? ""} ${last ?? ""}`.trim() || "—";
}

export function daysBetween(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 0;
  return Math.round((e.getTime() - s.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

export function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 3);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

export function leaveStatusTone(status: string): "green" | "amber" | "coral" | "neutral" {
  if (status === "APPROVED") return "green";
  if (status === "REJECTED") return "coral";
  if (status.startsWith("PENDING")) return "amber";
  return "neutral";
}

export function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}
