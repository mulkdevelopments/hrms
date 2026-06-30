import { prisma } from "./prisma.js";
import type { Prisma } from "@prisma/client";
import { LeaveStatus } from "./leave-delegation.js";

export const LeaveBalanceMode = {
  MATURITY: "MATURITY",
  YEARLY: "YEARLY",
  NONE: "NONE",
} as const;

export const LeavePayRate = {
  FULL: "FULL",
  HALF: "HALF",
  NONE: "NONE",
} as const;

export type LeaveBalanceModeValue = (typeof LeaveBalanceMode)[keyof typeof LeaveBalanceMode];
export type LeavePayRateValue = (typeof LeavePayRate)[keyof typeof LeavePayRate];

export const LEAVE_YEARLY_PAID = 30;
export const LEAVE_MATURITY_MAX_CAP = 60;
export const LEAVE_MATURITY_DAILY = LEAVE_YEARLY_PAID / 365;

const ACTIVE_LEAVE_STATUSES = [
  LeaveStatus.PENDING_L1,
  LeaveStatus.PENDING_ACTING,
  LeaveStatus.PENDING_L2,
  LeaveStatus.APPROVED,
] as const;

export const DEFAULT_LEAVE_TYPES = [
  {
    name: "Annual Leave",
    code: "AL",
    yearlyAllocation: 30,
    maxCarryForward: 60,
    requiresAttachment: false,
    paidLeave: true,
    balanceMode: LeaveBalanceMode.MATURITY,
    payRate: LeavePayRate.FULL,
  },
  {
    name: "Casual Leave",
    code: "CL",
    yearlyAllocation: 5,
    maxCarryForward: 0,
    requiresAttachment: false,
    paidLeave: true,
    balanceMode: LeaveBalanceMode.YEARLY,
    payRate: LeavePayRate.FULL,
  },
  {
    name: "Sick Leave",
    code: "SL",
    yearlyAllocation: 10,
    maxCarryForward: 0,
    requiresAttachment: true,
    paidLeave: true,
    balanceMode: LeaveBalanceMode.YEARLY,
    payRate: LeavePayRate.FULL,
  },
  {
    name: "Maternity Leave (Full Pay)",
    code: "MLF",
    yearlyAllocation: 45,
    maxCarryForward: 0,
    requiresAttachment: true,
    paidLeave: true,
    balanceMode: LeaveBalanceMode.YEARLY,
    payRate: LeavePayRate.FULL,
  },
  {
    name: "Maternity Leave (Half Pay)",
    code: "MLH",
    yearlyAllocation: 15,
    maxCarryForward: 0,
    requiresAttachment: true,
    paidLeave: true,
    balanceMode: LeaveBalanceMode.YEARLY,
    payRate: LeavePayRate.HALF,
  },
  {
    name: "Emergency Leave",
    code: "EL",
    yearlyAllocation: 15,
    maxCarryForward: 0,
    requiresAttachment: false,
    paidLeave: false,
    balanceMode: LeaveBalanceMode.YEARLY,
    payRate: LeavePayRate.NONE,
  },
  {
    name: "Unpaid Leave",
    code: "UL",
    yearlyAllocation: 0,
    maxCarryForward: 0,
    requiresAttachment: false,
    paidLeave: false,
    balanceMode: LeaveBalanceMode.NONE,
    payRate: LeavePayRate.NONE,
  },
  {
    name: "Paternity Leave",
    code: "PL",
    yearlyAllocation: 5,
    maxCarryForward: 0,
    requiresAttachment: true,
    paidLeave: true,
    balanceMode: LeaveBalanceMode.YEARLY,
    payRate: LeavePayRate.FULL,
  },
  {
    name: "Umrah Leave",
    code: "UMRAH",
    yearlyAllocation: 0,
    maxCarryForward: 0,
    requiresAttachment: false,
    paidLeave: true,
    balanceMode: LeaveBalanceMode.NONE,
    payRate: LeavePayRate.FULL,
  },
] as const;

export function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function computeInclusiveLeaveDays(startDate: Date, endDate: Date) {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  if (end < start) return 0;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / dayMs) + 1;
}

export function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

export function computeMaturedLeaveDays(
  dateOfJoining: Date,
  asOf = new Date(),
  settings?: { maturityMaxCap?: number; maturityDailyRate?: number },
) {
  const cap = settings?.maturityMaxCap ?? LEAVE_MATURITY_MAX_CAP;
  const daily = settings?.maturityDailyRate ?? LEAVE_MATURITY_DAILY;
  const dayMs = 24 * 60 * 60 * 1000;
  const join = startOfDay(dateOfJoining);
  const today = startOfDay(asOf);
  if (join > today) {
    return { daysWorked: 0, maturedDays: 0, uncappedMaturedDays: 0 };
  }
  const daysWorked = Math.floor((today.getTime() - join.getTime()) / dayMs) + 1;
  const uncappedMaturedDays = Math.floor(daysWorked * daily);
  const maturedDays = Math.min(cap, uncappedMaturedDays);
  return { daysWorked, maturedDays, uncappedMaturedDays };
}

export async function computeMaturedLeaveDaysAsync(dateOfJoining: Date, asOf = new Date()) {
  const { getLeavePolicySettings } = await import("./master-data.js");
  const settings = await getLeavePolicySettings();
  return computeMaturedLeaveDays(dateOfJoining, asOf, settings);
}

export async function syncDefaultLeaveTypes(forceUpdate = false) {
  for (const type of DEFAULT_LEAVE_TYPES) {
    await prisma.leaveType.upsert({
      where: { code: type.code },
      create: { ...type },
      update: forceUpdate
        ? {
            name: type.name,
            yearlyAllocation: type.yearlyAllocation,
            maxCarryForward: type.maxCarryForward,
            requiresAttachment: type.requiresAttachment,
            paidLeave: type.paidLeave,
            balanceMode: type.balanceMode,
            payRate: type.payRate,
            active: true,
          }
        : {},
    });
  }
}

async function sumLeaveDays(
  employeeId: string,
  leaveTypeId: string,
  year: number,
  statuses: string[],
  approvedInYearOnly = false,
) {
  const where: Prisma.LeaveRequestWhereInput = {
    employeeId,
    leaveTypeId,
    status: { in: statuses },
  };

  if (approvedInYearOnly) {
    const now = new Date();
    where.approvedAt = {
      gte: startOfYear(new Date(year, 0, 1)),
      lte: now,
    };
  }

  const result = await prisma.leaveRequest.aggregate({
    where,
    _sum: { days: true },
  });
  return Number(result._sum?.days ?? 0);
}

export async function ensureEmployeeLeaveBalances(employeeId: string, year = new Date().getFullYear()) {
  const yearlyTypes = await prisma.leaveType.findMany({
    where: { active: true, balanceMode: LeaveBalanceMode.YEARLY },
    select: { id: true, yearlyAllocation: true },
  });

  for (const type of yearlyTypes) {
    await prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId: type.id,
          year,
        },
      },
      create: {
        employeeId,
        leaveTypeId: type.id,
        year,
        openingBalance: 0,
        accrued: type.yearlyAllocation,
        used: 0,
        carryForward: 0,
      },
      update: {},
    });
  }
}

type LeaveTypeForValidation = {
  id: string;
  code: string;
  name: string;
  balanceMode: string;
  payRate: string;
  yearlyAllocation: number;
  maxCarryForward: number;
};

export async function getLeaveTypeEntitlement(
  employeeId: string,
  leaveType: LeaveTypeForValidation,
  dateOfJoining: Date,
  year = new Date().getFullYear(),
) {
  if (leaveType.balanceMode === LeaveBalanceMode.NONE) {
    return {
      leaveTypeId: leaveType.id,
      name: leaveType.name,
      code: leaveType.code,
      balanceMode: leaveType.balanceMode,
      payRate: leaveType.payRate,
      yearlyAllocation: leaveType.yearlyAllocation,
      entitledDays: null,
      usedDays: 0,
      pendingDays: 0,
      availableDays: null,
    };
  }

  if (leaveType.balanceMode === LeaveBalanceMode.MATURITY) {
    const { getLeavePolicySettings } = await import("./master-data.js");
    const policySettings = await getLeavePolicySettings();
    const { daysWorked, maturedDays, uncappedMaturedDays } = computeMaturedLeaveDays(dateOfJoining, new Date(), policySettings);
    const usedDays = await sumLeaveDays(
      employeeId,
      leaveType.id,
      year,
      [LeaveStatus.APPROVED],
      true,
    );
    const pendingDays = await sumLeaveDays(employeeId, leaveType.id, year, [
      LeaveStatus.PENDING_L1,
      LeaveStatus.PENDING_ACTING,
      LeaveStatus.PENDING_L2,
    ]);
    const availableDays = Math.max(0, maturedDays - usedDays - pendingDays);
    return {
      leaveTypeId: leaveType.id,
      name: leaveType.name,
      code: leaveType.code,
      balanceMode: leaveType.balanceMode,
      payRate: leaveType.payRate,
      yearlyAllocation: leaveType.yearlyAllocation,
      entitledDays: maturedDays,
      usedDays,
      pendingDays,
      availableDays,
      daysWorked,
      maturedDays,
      uncappedMaturedDays,
      dailyRate: policySettings.maturityDailyRate,
      yearlyCap: policySettings.maturityMaxCap,
    };
  }

  await ensureEmployeeLeaveBalances(employeeId, year);
  const balance = await prisma.leaveBalance.findUnique({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId,
        leaveTypeId: leaveType.id,
        year,
      },
    },
  });
  const entitledDays = leaveType.yearlyAllocation;
  const usedDays = Number(balance?.used ?? 0);
  const pendingDays = await sumLeaveDays(employeeId, leaveType.id, year, [
    LeaveStatus.PENDING_L1,
    LeaveStatus.PENDING_ACTING,
    LeaveStatus.PENDING_L2,
  ]);
  const availableDays = Math.max(0, entitledDays - usedDays - pendingDays);

  return {
    leaveTypeId: leaveType.id,
    name: leaveType.name,
    code: leaveType.code,
    balanceMode: leaveType.balanceMode,
    payRate: leaveType.payRate,
    yearlyAllocation: leaveType.yearlyAllocation,
    entitledDays,
    usedDays,
    pendingDays,
    availableDays,
  };
}

export async function getEmployeeLeaveEntitlements(employeeId: string, dateOfJoining: Date) {
  const year = new Date().getFullYear();
  await ensureEmployeeLeaveBalances(employeeId, year);
  const types = await prisma.leaveType.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const entitlements = await Promise.all(
    types.map((type) => getLeaveTypeEntitlement(employeeId, type, dateOfJoining, year)),
  );

  return {
    employeeId,
    year,
    asOf: new Date().toISOString(),
    entitlements,
  };
}

export async function validateLeaveBalance(
  employeeId: string,
  leaveType: LeaveTypeForValidation,
  requestedDays: number,
  dateOfJoining: Date,
) {
  if (leaveType.balanceMode === LeaveBalanceMode.NONE) {
    return { ok: true as const };
  }

  const entitlement = await getLeaveTypeEntitlement(employeeId, leaveType, dateOfJoining);
  const availableDays = Number(entitlement.availableDays ?? 0);

  if (requestedDays > availableDays) {
    const label =
      leaveType.balanceMode === LeaveBalanceMode.MATURITY
        ? "matured annual leave"
        : `${leaveType.name} balance`;
    return {
      ok: false as const,
      message: `Insufficient ${label}. Available: ${availableDays.toFixed(2)} day(s). Requested: ${requestedDays.toFixed(2)} day(s).`,
      entitlement,
    };
  }

  return { ok: true as const, entitlement };
}

export async function recordLeaveUsageOnApproval(leave: {
  employeeId: string;
  leaveTypeId: string;
  days: number;
  leaveType: { balanceMode: string; maxCarryForward: number };
}) {
  if (leave.leaveType.balanceMode !== LeaveBalanceMode.YEARLY) {
    return;
  }

  const year = new Date().getFullYear();
  await ensureEmployeeLeaveBalances(leave.employeeId, year);

  const balance = await prisma.leaveBalance.findUnique({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId: leave.employeeId,
        leaveTypeId: leave.leaveTypeId,
        year,
      },
    },
  });
  if (!balance) return;

  const used = balance.used + leave.days;
  const carryForward = Math.min(
    leave.leaveType.maxCarryForward,
    Math.max(0, balance.openingBalance + balance.accrued - used),
  );

  await prisma.leaveBalance.update({
    where: { id: balance.id },
    data: { used, carryForward },
  });
}
