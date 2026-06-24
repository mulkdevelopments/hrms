import { prisma } from "./prisma.js";
import { syncDefaultLeaveTypes } from "./leave-policy.js";
import { DEFAULT_AIR_TICKET_SETTINGS, type AirTicketSettings } from "./leave-air-ticket.js";
import { refreshRoleRuntimeCache } from "./roles.js";

export type AttendancePolicy = {
  checkInStart: string;
  checkInEnd: string;
  autoCheckOut: string;
  timezone: string;
  checkInStartMinutes: number;
  checkInEndMinutes: number;
  autoCheckOutMinutes: number;
};

export type LeavePolicySettings = {
  annualYearlyDays: number;
  maturityMaxCap: number;
  maturityDailyRate: number;
};

export type RoleDefinitionDto = {
  id: string;
  code: string;
  label: string;
  description: string | null;
  assignable: boolean;
  isIndividualContributor: boolean;
  canVoidActingColleague: boolean;
  allowedViews: string[];
  sortOrder: number;
  active: boolean;
};

const DEFAULT_ATTENDANCE: AttendancePolicy = {
  checkInStart: "07:00",
  checkInEnd: "08:30",
  autoCheckOut: "18:00",
  timezone: "Asia/Dubai",
  checkInStartMinutes: 7 * 60,
  checkInEndMinutes: 8 * 60 + 30,
  autoCheckOutMinutes: 18 * 60,
};

const DEFAULT_LEAVE_POLICY: LeavePolicySettings = {
  annualYearlyDays: 30,
  maturityMaxCap: 60,
  maturityDailyRate: 30 / 365,
};

const ALL_VIEWS = [
  "dashboard", "employees", "leave", "exits", "clearance", "payadjust",
  "pro", "documents", "attendance", "calendar", "offices", "profile", "settings", "masterdata",
];

const INDIVIDUAL_VIEWS = [
  "dashboard", "leave", "exits", "pro", "documents", "profile", "settings",
];

const RESTRICTED_SELF_SERVICE_VIEWS = ["payadjust", "attendance", "calendar"] as const;

const HR_ADMIN_ROLE_CODES = new Set(["SUPER_ADMIN", "HR", "HR_OFFICER", "CEO"]);

const DEFAULT_ROLES: Omit<RoleDefinitionDto, "id">[] = [
  { code: "SUPER_ADMIN", label: "Super Admin", description: "Full system access", assignable: true, isIndividualContributor: false, canVoidActingColleague: false, allowedViews: ALL_VIEWS, sortOrder: 1, active: true },
  { code: "CEO", label: "CEO", description: "Executive oversight", assignable: true, isIndividualContributor: false, canVoidActingColleague: false, allowedViews: ALL_VIEWS.filter((v) => v !== "masterdata"), sortOrder: 2, active: true },
  { code: "HR", label: "HR", description: "Human resources administration", assignable: true, isIndividualContributor: false, canVoidActingColleague: false, allowedViews: ALL_VIEWS, sortOrder: 3, active: true },
  { code: "HR_OFFICER", label: "HR Officer", description: "HR operations", assignable: true, isIndividualContributor: false, canVoidActingColleague: false, allowedViews: ALL_VIEWS.filter((v) => v !== "masterdata"), sortOrder: 4, active: true },
  { code: "PRO", label: "PRO", description: "Public relations & documents", assignable: true, isIndividualContributor: false, canVoidActingColleague: false, allowedViews: ["dashboard", "employees", "pro", "documents", "profile", "settings"], sortOrder: 5, active: true },
  { code: "MANAGER", label: "Manager", description: "Department manager", assignable: true, isIndividualContributor: false, canVoidActingColleague: false, allowedViews: ["dashboard", "employees", "leave", "exits", "clearance", "pro", "documents", "profile"], sortOrder: 6, active: true },
  { code: "EMPLOYEE", label: "Employee", description: "Standard employee self-service", assignable: true, isIndividualContributor: true, canVoidActingColleague: false, allowedViews: INDIVIDUAL_VIEWS, sortOrder: 7, active: true },
  { code: "LABOUR", label: "Labour", description: "Labour workforce self-service", assignable: true, isIndividualContributor: true, canVoidActingColleague: true, allowedViews: INDIVIDUAL_VIEWS, sortOrder: 8, active: true },
  { code: "STAFF", label: "Staff", description: "Staff self-service", assignable: true, isIndividualContributor: true, canVoidActingColleague: true, allowedViews: INDIVIDUAL_VIEWS, sortOrder: 9, active: true },
];

const SETTING_SEEDS = [
  { key: "attendance.checkInStart", category: "attendance", label: "Check-in window start", description: "Earliest manual/auto check-in time (HH:mm)", value: "07:00" },
  { key: "attendance.checkInEnd", category: "attendance", label: "Check-in window end", description: "Latest check-in time (HH:mm)", value: "08:30" },
  { key: "attendance.autoCheckOut", category: "attendance", label: "Auto check-out time", description: "Automatic end-of-day check-out (HH:mm)", value: "18:00" },
  { key: "attendance.timezone", category: "attendance", label: "Attendance timezone", description: "IANA timezone for attendance windows", value: "Asia/Dubai" },
  { key: "leave.annualYearlyDays", category: "leave", label: "Annual leave days per year", description: "Used for maturity accrual calculation", value: 30 },
  { key: "leave.maturityMaxCap", category: "leave", label: "Annual leave max accrual cap", description: "Maximum matured annual leave balance", value: 60 },
  { key: "payroll.dualApprovalThreshold", category: "payroll", label: "Dual approval threshold (AED)", description: "Pay adjustments at or above this amount need HR approval plus CEO/Super Admin final approval", value: 5000 },
  { key: "leave.airTicket", category: "leave", label: "Air ticket allowance", description: "Eligibility rules and nationality-based fare table for annual leave", value: DEFAULT_AIR_TICKET_SETTINGS },
] as const;

let cache: {
  attendance: AttendancePolicy;
  leave: LeavePolicySettings;
  roles: RoleDefinitionDto[];
  loadedAt: number;
} | null = null;

const CACHE_MS = 30_000;

export function invalidateMasterDataCache() {
  cache = null;
}

export function parseTimeToMinutes(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid time format "${value}". Use HH:mm (e.g. 07:00).`);
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    throw new Error(`Invalid time "${value}". Hours must be 0-23 and minutes 0-59.`);
  }
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildAttendancePolicy(raw: {
  checkInStart: string;
  checkInEnd: string;
  autoCheckOut: string;
  timezone: string;
}): AttendancePolicy {
  return {
    ...raw,
    checkInStartMinutes: parseTimeToMinutes(raw.checkInStart),
    checkInEndMinutes: parseTimeToMinutes(raw.checkInEnd),
    autoCheckOutMinutes: parseTimeToMinutes(raw.autoCheckOut),
  };
}

async function readSetting(key: string, fallback: unknown) {
  const row = await prisma.systemSetting.findUnique({ where: { key } });
  if (!row) return fallback;
  return row.value as unknown;
}

async function migrateRestrictedViewsForNonHrRoles() {
  const migrated = await readSetting("roles.restrictedViewsMigrated.v1", false);
  if (migrated) return;

  const roles = await prisma.roleDefinition.findMany();
  for (const role of roles) {
    if (HR_ADMIN_ROLE_CODES.has(role.code)) continue;
    const views = Array.isArray(role.allowedViews) ? (role.allowedViews as string[]) : [];
    const filtered = views.filter((view) => !RESTRICTED_SELF_SERVICE_VIEWS.includes(view as typeof RESTRICTED_SELF_SERVICE_VIEWS[number]));
    if (filtered.length === views.length || filtered.length === 0) continue;
    await prisma.roleDefinition.update({
      where: { id: role.id },
      data: { allowedViews: filtered },
    });
  }

  await prisma.systemSetting.upsert({
    where: { key: "roles.restrictedViewsMigrated.v1" },
    create: {
      key: "roles.restrictedViewsMigrated.v1",
      category: "roles",
      label: "Restricted views migrated",
      description: "One-time migration removing payadjust/attendance/calendar from non-HR roles",
      value: true,
    },
    update: { value: true },
  });
}

export async function seedMasterData(options?: { resetLeaveTypes?: boolean }) {
  for (const seed of SETTING_SEEDS) {
    await prisma.systemSetting.upsert({
      where: { key: seed.key },
      create: {
        key: seed.key,
        category: seed.category,
        label: seed.label,
        description: seed.description,
        value: seed.value,
      },
      update: {
        category: seed.category,
        label: seed.label,
        description: seed.description,
      },
    });
  }

  for (const role of DEFAULT_ROLES) {
    await prisma.roleDefinition.upsert({
      where: { code: role.code },
      create: {
        code: role.code,
        label: role.label,
        description: role.description,
        assignable: role.assignable,
        isIndividualContributor: role.isIndividualContributor,
        canVoidActingColleague: role.canVoidActingColleague,
        allowedViews: role.allowedViews,
        sortOrder: role.sortOrder,
        active: role.active,
      },
      update: {
        label: role.label,
        description: role.description,
        sortOrder: role.sortOrder,
      },
    });
  }

  await syncDefaultLeaveTypes(Boolean(options?.resetLeaveTypes));
  await migrateRestrictedViewsForNonHrRoles();
  invalidateMasterDataCache();
}

async function loadMasterDataCache() {
  if (cache && Date.now() - cache.loadedAt < CACHE_MS) {
    return cache;
  }

  await seedMasterData();

  const [
    checkInStart,
    checkInEnd,
    autoCheckOut,
    timezone,
    annualYearlyDays,
    maturityMaxCap,
  ] = await Promise.all([
    readSetting("attendance.checkInStart", DEFAULT_ATTENDANCE.checkInStart),
    readSetting("attendance.checkInEnd", DEFAULT_ATTENDANCE.checkInEnd),
    readSetting("attendance.autoCheckOut", DEFAULT_ATTENDANCE.autoCheckOut),
    readSetting("attendance.timezone", DEFAULT_ATTENDANCE.timezone),
    readSetting("leave.annualYearlyDays", DEFAULT_LEAVE_POLICY.annualYearlyDays),
    readSetting("leave.maturityMaxCap", DEFAULT_LEAVE_POLICY.maturityMaxCap),
  ]);

  const annualDays = Number(annualYearlyDays);
  const maxCap = Number(maturityMaxCap);
  const roles = await prisma.roleDefinition.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });

  cache = {
    attendance: buildAttendancePolicy({
      checkInStart: String(checkInStart),
      checkInEnd: String(checkInEnd),
      autoCheckOut: String(autoCheckOut),
      timezone: String(timezone),
    }),
    leave: {
      annualYearlyDays: annualDays,
      maturityMaxCap: maxCap,
      maturityDailyRate: annualDays / 365,
    },
    roles: roles.map((role) => ({
      id: role.id,
      code: role.code,
      label: role.label,
      description: role.description,
      assignable: role.assignable,
      isIndividualContributor: role.isIndividualContributor,
      canVoidActingColleague: role.canVoidActingColleague,
      allowedViews: Array.isArray(role.allowedViews) ? (role.allowedViews as string[]) : [],
      sortOrder: role.sortOrder,
      active: role.active,
    })),
    loadedAt: Date.now(),
  };

  refreshRoleRuntimeCache(cache.roles);
  return cache;
}

export async function getAttendancePolicy() {
  const data = await loadMasterDataCache();
  return data.attendance;
}

export async function getLeavePolicySettings() {
  const data = await loadMasterDataCache();
  return data.leave;
}

export async function getRoleDefinitions(includeInactive = false) {
  if (includeInactive) {
    const roles = await prisma.roleDefinition.findMany({ orderBy: [{ sortOrder: "asc" }, { label: "asc" }] });
    return roles.map((role) => ({
      id: role.id,
      code: role.code,
      label: role.label,
      description: role.description,
      assignable: role.assignable,
      isIndividualContributor: role.isIndividualContributor,
      canVoidActingColleague: role.canVoidActingColleague,
      allowedViews: Array.isArray(role.allowedViews) ? (role.allowedViews as string[]) : [],
      sortOrder: role.sortOrder,
      active: role.active,
    }));
  }
  const data = await loadMasterDataCache();
  return data.roles;
}

export async function getAssignableRoleCodes() {
  const roles = await getRoleDefinitions();
  return roles.filter((role) => role.assignable).map((role) => role.code);
}

export async function isIndividualContributorRole(role?: string | null) {
  if (!role) return false;
  const roles = await getRoleDefinitions(true);
  const match = roles.find((item) => item.code === role);
  return match?.isIndividualContributor ?? false;
}

export async function canVoidActingForRole(role?: string | null) {
  if (!role) return false;
  const roles = await getRoleDefinitions(true);
  const match = roles.find((item) => item.code === role);
  return match?.canVoidActingColleague ?? false;
}

export async function getAllowedViewsForRole(role?: string | null) {
  if (!role) return INDIVIDUAL_VIEWS;
  const roles = await getRoleDefinitions(true);
  const match = roles.find((item) => item.code === role);
  if (!match) return INDIVIDUAL_VIEWS;
  return match.allowedViews;
}

export async function updateSystemSetting(key: string, value: unknown) {
  const updated = await prisma.systemSetting.update({
    where: { key },
    data: { value: value as object },
  });
  invalidateMasterDataCache();
  return updated;
}

export async function getMasterDataBundle() {
  const [attendance, leave, roles, leaveTypes, settings, airTicket] = await Promise.all([
    getAttendancePolicy(),
    getLeavePolicySettings(),
    getRoleDefinitions(true),
    prisma.leaveType.findMany({ orderBy: { name: "asc" } }),
    prisma.systemSetting.findMany({ orderBy: [{ category: "asc" }, { key: "asc" }] }),
    getAirTicketSettings(),
  ]);

  return { attendance, leave, roles, leaveTypes, settings, airTicket };
}

export async function getPayrollDualApprovalThreshold() {
  const value = await readSetting("payroll.dualApprovalThreshold", 5000);
  return Number(value);
}

function parseAirTicketSettings(raw: unknown): AirTicketSettings {
  const fallback = DEFAULT_AIR_TICKET_SETTINGS;
  if (!raw || typeof raw !== "object") return fallback;
  const value = raw as Partial<AirTicketSettings>;
  return {
    enabled: value.enabled ?? fallback.enabled,
    minDays: Number(value.minDays ?? fallback.minDays),
    eligibleLeaveCodes: Array.isArray(value.eligibleLeaveCodes)
      ? value.eligibleLeaveCodes.map((code) => String(code).toUpperCase())
      : fallback.eligibleLeaveCodes,
    fares: Array.isArray(value.fares) && value.fares.length
      ? value.fares.map((row) => ({
          country: String((row as AirTicketSettings["fares"][number]).country ?? ""),
          manager: Number((row as AirTicketSettings["fares"][number]).manager ?? 0),
          staff: Number((row as AirTicketSettings["fares"][number]).staff ?? 0),
          labour: Number((row as AirTicketSettings["fares"][number]).labour ?? 0),
        }))
      : fallback.fares,
  };
}

export async function getAirTicketSettings() {
  const value = await readSetting("leave.airTicket", DEFAULT_AIR_TICKET_SETTINGS);
  return parseAirTicketSettings(value);
}

export { ALL_VIEWS, SETTING_SEEDS };
