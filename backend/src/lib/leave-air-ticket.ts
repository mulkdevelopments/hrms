import { prisma } from "./prisma.js";
import { getPayrollDualApprovalThreshold } from "./master-data.js";

export type AirTicketRoleBand = "MANAGER" | "STAFF" | "LABOUR";

export type AirTicketFareRow = {
  country: string;
  manager: number;
  staff: number;
  labour: number;
};

export type AirTicketSettings = {
  enabled: boolean;
  minDays: number;
  eligibleLeaveCodes: string[];
  fares: AirTicketFareRow[];
};

export const DEFAULT_AIR_TICKET_FARES: AirTicketFareRow[] = [
  { country: "India", manager: 1800, staff: 1600, labour: 1600 },
  { country: "Pakistan", manager: 1700, staff: 1500, labour: 1400 },
  { country: "Bangladesh", manager: 1400, staff: 1200, labour: 1200 },
  { country: "Egypt", manager: 2000, staff: 1600, labour: 1600 },
  { country: "Iran", manager: 1800, staff: 1600, labour: 1600 },
  { country: "Italy", manager: 1800, staff: 1600, labour: 1600 },
  { country: "Nepal", manager: 1800, staff: 1600, labour: 1600 },
  { country: "Philippines", manager: 1800, staff: 1600, labour: 1600 },
  { country: "Srilanka", manager: 1800, staff: 1600, labour: 1600 },
  { country: "Syria", manager: 1800, staff: 1600, labour: 1600 },
  { country: "Ukraine", manager: 1800, staff: 1600, labour: 1600 },
];

export const DEFAULT_AIR_TICKET_SETTINGS: AirTicketSettings = {
  enabled: true,
  minDays: 30,
  eligibleLeaveCodes: ["AL"],
  fares: DEFAULT_AIR_TICKET_FARES,
};

const NATIONALITY_ALIASES: Record<string, string> = {
  indian: "India",
  india: "India",
  pakistani: "Pakistan",
  pakistan: "Pakistan",
  bangladeshi: "Bangladesh",
  bangladesh: "Bangladesh",
  egyptian: "Egypt",
  egypt: "Egypt",
  iranian: "Iran",
  iran: "Iran",
  italian: "Italy",
  italy: "Italy",
  nepali: "Nepal",
  nepal: "Nepal",
  nepalese: "Nepal",
  filipino: "Philippines",
  philippines: "Philippines",
  philippine: "Philippines",
  srilankan: "Srilanka",
  "sri lanka": "Srilanka",
  srilanka: "Srilanka",
  syrian: "Syria",
  syria: "Syria",
  ukrainian: "Ukraine",
  ukraine: "Ukraine",
};

export function normalizeNationalityToCountry(nationality?: string | null) {
  if (!nationality?.trim()) return null;
  const normalized = nationality.trim().toLowerCase();
  if (NATIONALITY_ALIASES[normalized]) {
    return NATIONALITY_ALIASES[normalized];
  }
  const title = nationality.trim().replace(/\s+/g, " ");
  const match = DEFAULT_AIR_TICKET_FARES.find(
    (row) => row.country.toLowerCase() === title.toLowerCase(),
  );
  return match?.country ?? title;
}

export function resolveAirTicketRoleBand(role?: string | null): AirTicketRoleBand {
  if (role === "MANAGER") return "MANAGER";
  if (role === "LABOUR") return "LABOUR";
  return "STAFF";
}

export function getAirTicketFare(
  fares: AirTicketFareRow[],
  country: string,
  band: AirTicketRoleBand,
) {
  const row = fares.find((item) => item.country.toLowerCase() === country.toLowerCase());
  if (!row) return null;
  if (band === "MANAGER") return row.manager;
  if (band === "LABOUR") return row.labour;
  return row.staff;
}

export function evaluateAirTicketEligibility(input: {
  settings: AirTicketSettings;
  nationality?: string | null;
  role?: string | null;
  leaveTypeCode?: string | null;
  days: number;
}) {
  const { settings, nationality, role, leaveTypeCode, days } = input;
  if (!settings.enabled) {
    return { eligible: false, fare: null, country: null, roleBand: null, reason: "Air ticket allowance is disabled." };
  }

  const codes = settings.eligibleLeaveCodes.map((code) => code.toUpperCase());
  if (!leaveTypeCode || !codes.includes(leaveTypeCode.toUpperCase())) {
    return { eligible: false, fare: null, country: null, roleBand: null, reason: "Leave type is not eligible for air ticket." };
  }

  if (days < settings.minDays) {
    return {
      eligible: false,
      fare: null,
      country: null,
      roleBand: null,
      reason: `Minimum ${settings.minDays} leave day(s) required for air ticket eligibility.`,
    };
  }

  const country = normalizeNationalityToCountry(nationality);
  if (!country) {
    return { eligible: false, fare: null, country: null, roleBand: null, reason: "Employee nationality is not set." };
  }

  const roleBand = resolveAirTicketRoleBand(role);
  const fare = getAirTicketFare(settings.fares, country, roleBand);
  if (fare == null) {
    return {
      eligible: false,
      fare: null,
      country,
      roleBand,
      reason: `No air ticket fare configured for ${country}.`,
    };
  }

  return { eligible: true, fare, country, roleBand, reason: null };
}

async function generateAdjustmentReference() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.payrollAdjustment.count();
  return `ADJ-${stamp}-${String(count + 1).padStart(5, "0")}`;
}

export async function createAirTicketAdjustment(input: {
  employeeId: string;
  amount: number;
  country: string;
  roleBand: AirTicketRoleBand;
  leaveRequestId: string;
  leaveStartDate: Date;
  leaveEndDate: Date;
  createdById?: string | null;
}) {
  const now = new Date();
  const dualThreshold = await getPayrollDualApprovalThreshold();
  const requiresDualApproval = input.amount >= dualThreshold;
  const reason = `Air ticket allowance (${input.country}, ${input.roleBand.toLowerCase()}) for approved annual leave ${input.leaveStartDate.toISOString().slice(0, 10)} to ${input.leaveEndDate.toISOString().slice(0, 10)} [${input.leaveRequestId}]`;

  return prisma.payrollAdjustment.create({
    data: {
      referenceNumber: await generateAdjustmentReference(),
      employeeId: input.employeeId,
      type: "ADDITION",
      category: "AIR_TICKET",
      glCode: "GL-4005",
      amount: input.amount,
      effectiveMonth: now.getMonth() + 1,
      effectiveYear: now.getFullYear(),
      reason,
      status: "DRAFT",
      requiresDualApproval,
      createdById: input.createdById ?? null,
    },
  });
}
