import { z } from "zod";

export const extendedEmployeeSchema = z.object({
  legacyEmpId: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  grade: z.string().optional(),
  employeeType: z.string().optional(),
  businessUnit: z.string().optional(),
  division: z.string().optional(),
  workLocation: z.string().optional(),
  workCountry: z.string().optional(),
  payrollType: z.string().optional(),
  payrollStatus: z.string().optional(),
  payrollDivision: z.string().optional(),
  conveyanceAllowance: z.number().nonnegative().optional(),
  fixedOtAllowance: z.number().nonnegative().optional(),
  foodAllowance: z.number().nonnegative().optional(),
  otherAllowance: z.number().nonnegative().optional(),
  overseasAllowance: z.number().nonnegative().optional(),
  performanceAllowance: z.number().nonnegative().optional(),
  petrolAllowance: z.number().nonnegative().optional(),
  riskAllowance: z.number().nonnegative().optional(),
  socialInsurance: z.number().nonnegative().optional(),
  telephoneAllowance: z.number().nonnegative().optional(),
  vehicleAllowance: z.number().nonnegative().optional(),
  kidsEducationAllowance: z.number().nonnegative().optional(),
  grossSalary: z.number().nonnegative().optional(),
  otEligible: z.string().optional(),
  otRuleNormal: z.number().nonnegative().optional(),
  netPayCurrency: z.string().optional(),
  visaType: z.string().optional(),
  visaSponsor: z.string().optional(),
  hodName: z.string().optional(),
  hodEmail: z.string().optional(),
  comments: z.string().optional(),
  probationStatus: z.string().optional(),
  joiningMonth: z.string().optional(),
  probationCompletionDate: z.string().datetime().optional(),
  ctcMonth: z.number().nonnegative().optional(),
  ctcYear: z.number().nonnegative().optional(),
  cancellationType: z.string().optional(),
  lastWorkingDate: z.string().datetime().optional(),
});

export type ExtendedEmployeeInput = z.infer<typeof extendedEmployeeSchema>;

const PAY_CURRENCY_ALIASES: Record<string, string> = {
  aed: "AED",
  inr: "INR",
  "indian rupees": "INR",
  dollars: "USD",
  usd: "USD",
  euro: "EUR",
  eur: "EUR",
  egp: "EGP",
  "ghana cedi": "GHS",
  "irani riyal": "IRR",
};

const INVALID_PAY_CURRENCY = new Set([
  "not eligible",
  "eligible",
  "not applicable",
  "fixed ot",
  "net pay currency",
]);

export function normalizePayCurrency(raw?: string | null, workCountry?: string | null) {
  const trimmed = String(raw ?? "").trim();
  if (trimmed) {
    const key = trimmed.toLowerCase();
    if (INVALID_PAY_CURRENCY.has(key) || /^\d+([.,]\d+)?$/.test(key)) {
      return inferPayCurrencyFromCountry(workCountry);
    }
    if (PAY_CURRENCY_ALIASES[key]) return PAY_CURRENCY_ALIASES[key];
    if (/^[a-z]{3}$/i.test(trimmed)) return trimmed.toUpperCase();
    return trimmed;
  }
  return inferPayCurrencyFromCountry(workCountry);
}

function inferPayCurrencyFromCountry(workCountry?: string | null) {
  const country = String(workCountry ?? "").trim().toLowerCase();
  if (!country) return "";
  if (country.includes("india")) return "INR";
  if (country.includes("u.a.e") || country.includes("uae") || country.includes("emirates")) return "AED";
  if (country.includes("saudi")) return "SAR";
  if (country.includes("ghana")) return "GHS";
  if (country.includes("egypt")) return "EGP";
  if (country.includes("serbia") || country.includes("europe")) return "EUR";
  return "";
}

export function mapCategoryToRole(category?: string | null, employeeType?: string | null) {
  const value = `${category ?? ""} ${employeeType ?? ""}`.toLowerCase();
  if (value.includes("owner") || value.includes("mgmt") || value.includes("management") || value.includes("head")) {
    return "MANAGER";
  }
  if (value.includes("lbr") || value.includes("worker") || value.includes("labour")) {
    return "LABOUR";
  }
  if (value.includes("staff") || value.includes("adm") || value.includes("support")) {
    return "STAFF";
  }
  return "EMPLOYEE";
}

export function splitFullName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "Employee", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function parseExcelDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number" && value > 20000) {
    const base = new Date(Date.UTC(1899, 11, 30));
    base.setUTCDate(base.getUTCDate() + Math.floor(value));
    return base;
  }
  const text = String(value).trim();
  if (!text) return null;
  const dmy = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/.exec(text);
  if (dmy) {
    const first = Number(dmy[1]);
    const second = Number(dmy[2]);
    let year = Number(dmy[3]);
    if (year < 100) year += 2000;
    let day = first;
    let month = second;
    if (first > 12 && second <= 12) {
      day = first;
      month = second;
    } else if (second > 12 && first <= 12) {
      month = first;
      day = second;
    } else if (first <= 12 && second <= 12) {
      // Ambiguous numeric dates in HR exports are usually DD/MM.
      day = first;
      month = second;
    }
    const parsedDmy = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(parsedDmy.getTime())) return parsedDmy;
  }
  const asNum = Number(text);
  if (!Number.isNaN(asNum) && asNum > 20000) {
    const base = new Date(Date.UTC(1899, 11, 30));
    base.setUTCDate(base.getUTCDate() + Math.floor(asNum));
    return base;
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseExcelNumber(value: unknown) {
  if (value == null || value === "") return 0;
  const num = Number(String(value).replace(/,/g, "").trim());
  return Number.isNaN(num) ? 0 : num;
}

export function pickString(value: unknown) {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text || undefined;
}

export function extractExtendedEmployeeData(input: Record<string, unknown>) {
  const parsed = extendedEmployeeSchema.safeParse(input);
  if (!parsed.success) return {};
  const data = parsed.data;
  return {
    legacyEmpId: data.legacyEmpId,
    gender: data.gender,
    maritalStatus: data.maritalStatus,
    category: data.category,
    subCategory: data.subCategory,
    grade: data.grade,
    employeeType: data.employeeType,
    businessUnit: data.businessUnit,
    division: data.division,
    workLocation: data.workLocation,
    workCountry: data.workCountry,
    payrollType: data.payrollType,
    payrollStatus: data.payrollStatus,
    payrollDivision: data.payrollDivision,
    conveyanceAllowance: data.conveyanceAllowance,
    fixedOtAllowance: data.fixedOtAllowance,
    foodAllowance: data.foodAllowance,
    otherAllowance: data.otherAllowance,
    overseasAllowance: data.overseasAllowance,
    performanceAllowance: data.performanceAllowance,
    petrolAllowance: data.petrolAllowance,
    riskAllowance: data.riskAllowance,
    socialInsurance: data.socialInsurance,
    telephoneAllowance: data.telephoneAllowance,
    vehicleAllowance: data.vehicleAllowance,
    kidsEducationAllowance: data.kidsEducationAllowance,
    grossSalary: data.grossSalary,
    otEligible: data.otEligible,
    otRuleNormal: data.otRuleNormal,
    netPayCurrency: data.netPayCurrency,
    visaType: data.visaType,
    visaSponsor: data.visaSponsor,
    hodName: data.hodName,
    hodEmail: data.hodEmail,
    comments: data.comments,
    probationStatus: data.probationStatus,
    joiningMonth: data.joiningMonth,
    probationCompletionDate: data.probationCompletionDate ? new Date(data.probationCompletionDate) : undefined,
    ctcMonth: data.ctcMonth,
    ctcYear: data.ctcYear,
    cancellationType: data.cancellationType,
    lastWorkingDate: data.lastWorkingDate ? new Date(data.lastWorkingDate) : undefined,
  };
}
