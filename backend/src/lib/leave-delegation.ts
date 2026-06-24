import { prisma } from "./prisma.js";

const LeaveStatus = {
  PENDING_L1: "PENDING_L1",
  PENDING_ACTING: "PENDING_ACTING",
  PENDING_L2: "PENDING_L2",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

const managerSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  department: true,
  role: true,
} as const;

export function startOfDay(date: Date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function employeeName(emp?: { firstName?: string; lastName?: string | null } | null) {
  if (!emp) return "—";
  return `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "—";
}

export async function isEmployeeOnApprovedLeave(employeeId: string, date = new Date()) {
  const day = startOfDay(date);
  const leave = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status: LeaveStatus.APPROVED,
      startDate: { lte: day },
      endDate: { gte: day },
    },
  });
  return Boolean(leave);
}

export async function findAcceptedActingDelegation(managerId: string, date = new Date()) {
  const day = startOfDay(date);
  return prisma.leaveRequest.findFirst({
    where: {
      employeeId: managerId,
      status: LeaveStatus.APPROVED,
      actingAcceptedAt: { not: null },
      actingApproverId: { not: null },
      startDate: { lte: day },
      endDate: { gte: day },
    },
    select: {
      id: true,
      actingApproverId: true,
      actingApprover: { select: managerSelect },
    },
    orderBy: { startDate: "desc" },
  });
}

export async function resolveLeaveL1Approver(
  employee: { id: string; managerId: string | null; department: string },
  date = new Date(),
) {
  if (!employee.managerId) {
    const fallback = await prisma.employee.findFirst({
      where: {
        role: "MANAGER",
        department: employee.department,
        id: { not: employee.id },
        accessEnabled: true,
        status: { in: ["ACTIVE", "PROBATION"] },
      },
      select: managerSelect,
      orderBy: { firstName: "asc" },
    });
    return {
      approverId: fallback?.id ?? null,
      lineManager: null,
      assignedApprover: fallback,
      isActing: false,
      managerOnLeave: false,
    };
  }

  const lineManager = await prisma.employee.findUnique({
    where: { id: employee.managerId },
    select: managerSelect,
  });
  if (!lineManager) {
    return { approverId: null, lineManager: null, assignedApprover: null, isActing: false, managerOnLeave: false };
  }

  const managerOnLeave = await isEmployeeOnApprovedLeave(lineManager.id, date);
  if (!managerOnLeave) {
    return {
      approverId: lineManager.id,
      lineManager,
      assignedApprover: lineManager,
      isActing: false,
      managerOnLeave: false,
    };
  }

  const delegation = await findAcceptedActingDelegation(lineManager.id, date);
  if (delegation?.actingApprover) {
    return {
      approverId: delegation.actingApprover.id,
      lineManager,
      assignedApprover: delegation.actingApprover,
      isActing: true,
      managerOnLeave: true,
    };
  }

  const actingManager = await prisma.employee.findFirst({
    where: {
      role: "MANAGER",
      department: employee.department,
      id: { notIn: [employee.id, lineManager.id] },
      accessEnabled: true,
      status: { in: ["ACTIVE", "PROBATION"] },
    },
    select: managerSelect,
    orderBy: { firstName: "asc" },
  });

  return {
    approverId: actingManager?.id ?? lineManager.id,
    lineManager,
    assignedApprover: actingManager ?? lineManager,
    isActing: Boolean(actingManager),
    managerOnLeave: true,
  };
}

export async function validateActingApproverCandidate(applicantId: string, actingApproverId: string) {
  if (applicantId === actingApproverId) {
    return { error: "You cannot assign yourself as acting manager" };
  }

  const [applicant, candidate] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: applicantId },
      select: { id: true, department: true, role: true },
    }),
    prisma.employee.findUnique({
      where: { id: actingApproverId },
      select: { id: true, department: true, role: true, accessEnabled: true, status: true },
    }),
  ]);

  if (!applicant) return { error: "Applicant not found" };
  if (!candidate) return { error: "Acting manager not found" };
  if (!candidate.accessEnabled || !["ACTIVE", "PROBATION"].includes(candidate.status)) {
    return { error: "Selected colleague is not active" };
  }
  if (candidate.department !== applicant.department) {
    return { error: "Acting cover must be someone from the same department" };
  }

  return { applicant, candidate };
}

export async function findManagersOnLeaveWithActingApprover(actingApproverId: string, date = new Date()) {
  const day = startOfDay(date);
  const delegations = await prisma.leaveRequest.findMany({
    where: {
      actingApproverId,
      actingAcceptedAt: { not: null },
      status: LeaveStatus.APPROVED,
      startDate: { lte: day },
      endDate: { gte: day },
    },
    select: { employeeId: true },
  });
  return delegations.map((item) => item.employeeId);
}

export { LeaveStatus };
