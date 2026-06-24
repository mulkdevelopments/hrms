import * as XLSX from "xlsx";

export function sheetReadRange(sheet: XLSX.WorkSheet, maxDataRows = 5000) {
  const decoded = XLSX.utils.decode_range(sheet["!ref"] ?? "A1:A1");
  return XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: {
      r: Math.min(decoded.e.r, maxDataRows),
      c: Math.min(decoded.e.c, 63),
    },
  });
}

export function sheetRowsFromWorksheet(sheet: XLSX.WorkSheet, maxRows?: number) {
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    range: sheetReadRange(sheet, maxRows ?? 5000),
  });
}

export function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function mapRow(headers: Record<string, string>, row: Record<string, unknown>) {
  const mapped: Record<string, unknown> = {};
  Object.entries(row).forEach(([key, value]) => {
    const alias = headers[key];
    if (!alias) return;
    const next = String(value ?? "").trim();
    const current = String(mapped[alias] ?? "").trim();
    if (!current || next) mapped[alias] = value;
  });
  return mapped;
}

export function buildHeaderMap(row: Record<string, unknown>, aliases: Record<string, string>) {
  const headers: Record<string, string> = {};
  Object.keys(row).forEach((key) => {
    const norm = normalizeHeader(key);
    if (norm === "email id_1" || /^email id_\d+$/.test(norm.replace(/\s+/g, " "))) {
      headers[key] = "hodEmail";
      return;
    }
    if (norm === "email id") {
      headers[key] = "email";
      return;
    }
    const alias = aliases[norm];
    if (alias) headers[key] = alias;
  });
  return headers;
}
