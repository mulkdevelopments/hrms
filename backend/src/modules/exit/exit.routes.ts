import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";
import { computeSettlement } from "../../lib/settlement.js";
import { resolveEmploymentStatus } from "../../lib/employment-status.js";
import { getOutstandingLoanTotal, closeOutstandingLoansOnExit } from "../adjustments/adjustments.routes.js";
import { createCancellationTaskForExit } from "../pro/pro.routes.js";

export const exitRouter = Router();
exitRouter.use(authMiddleware);

const HR_ROLES = ["SUPER_ADMIN", "HR", "HR_OFFICER"];
const CLEARANCE_DEPARTMENTS = ["IT", "FINANCE", "ADMIN", "PRO"];

/** Maps clearance checklist dept → org departments whose MANAGER receives the task */
const CLEARANCE_DEPT_MANAGER_LOOKUP: Record<string, string[]> = {
  IT: ["IT", "Engineering", "Technology"],
  FINANCE: ["Finance", "FINANCE"],
};

const HR_CLEARANCE_DEPARTMENTS = new Set(["ADMIN", "PRO"]);
const HR_CLEARANCE_ROLES = ["SUPER_ADMIN", "HR", "HR_OFFICER"] as const;

async function resolveClearanceDepartmentManager(clearanceDepartment: string): Promise<string | null> {
  if (HR_CLEARANCE_DEPARTMENTS.has(clearanceDepartment)) {
    for (const role of HR_CLEARANCE_ROLES) {
      const assignee = await prisma.employee.findFirst({
        where: {
          role,
          accessEnabled: true,
          status: { in: ["ACTIVE", "PROBATION"] },
        },
        orderBy: { dateOfJoining: "asc" },
        select: { id: true },
      });
      if (assignee) return assignee.id;
    }
    return null;
  }

  const deptNames = CLEARANCE_DEPT_MANAGER_LOOKUP[clearanceDepartment] ?? [clearanceDepartment];
  const manager = await prisma.employee.findFirst({
    where: {
      role: "MANAGER",
      accessEnabled: true,
      status: { in: ["ACTIVE", "PROBATION"] },
      OR: deptNames.map((name) => ({
        department: { equals: name, mode: "insensitive" },
      })),
    },
    orderBy: { dateOfJoining: "asc" },
    select: { id: true },
  });
  return manager?.id ?? null;
}

function canCompleteClearanceTask(
  task: { department: string; assignedManagerId: string | null },
  auth: { role?: string; employeeId?: string | null },
): boolean {
  if (HR_CLEARANCE_DEPARTMENTS.has(task.department)) {
    return Boolean(auth.role && (HR_CLEARANCE_ROLES as readonly string[]).includes(auth.role));
  }
  return auth.role === "MANAGER" && task.assignedManagerId === auth.employeeId;
}

async function syncClearanceTaskAssignments() {
  const pendingTasks = await prisma.clearanceTask.findMany({
    where: {
      status: "PENDING",
      exitRecord: { status: ExitStatus.CLEARANCE_IN_PROGRESS },
    },
    select: { id: true, department: true, assignedManagerId: true },
    take: 200,
  });
  await Promise.all(
    pendingTasks.map(async (task) => {
      const managerId = await resolveClearanceDepartmentManager(task.department);
      if (managerId && managerId !== task.assignedManagerId) {
        await prisma.clearanceTask.update({
          where: { id: task.id },
          data: { assignedManagerId: managerId },
        });
      }
    }),
  );
}

const ExitStatus = {
  NEGOTIATION: "NEGOTIATION",
  PENDING: "PENDING",
  LM_APPROVED: "LM_APPROVED",
  HR_APPROVED: "HR_APPROVED",
  INITIATED: "INITIATED",
  DOCUMENTED: "DOCUMENTED",
  APPROVED: "APPROVED",
  CLEARANCE_IN_PROGRESS: "CLEARANCE_IN_PROGRESS",
  SETTLEMENT_READY: "SETTLEMENT_READY",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

const resignationSchema = z.object({
  employeeId: z.string().optional(),
  resignationDate: z.string().datetime(),
  requestedLastWorkingDay: z.string().datetime(),
  reasonCategory: z.enum(["PERSONAL", "CAREER_GROWTH", "RELOCATION", "OTHER"]),
  reason: z.string().trim().optional().default(""),
  supportingDocUrl: z.string().optional(),
  employeeConfirmed: z.literal(true),
});

const terminationSchema = z.object({
  employeeId: z.string(),
  reasonCategory: z.enum(["MISCONDUCT", "REDUNDANCY", "CONTRACT_END", "PROBATION_FAIL"]),
  reason: z.string().trim().optional().default(""),
  noticeStartDate: z.string().datetime(),
  lastWorkingDate: z.string().datetime(),
  incidentNotes: z.string().optional(),
  supportingDocUrl: z.string().optional(),
});

const hrApproveSchema = z.object({
  lastWorkingDate: z.string().datetime(),
  noticeShortfallDays: z.number().int().min(0).optional().default(0),
});

const lmApproveSchema = z.object({
  noticePeriodStartDate: z.string().datetime(),
  negotiationNotes: z.string().trim().optional(),
});

const documentSchema = z.object({
  noticePeriodStartDate: z.string().datetime(),
  incidentNotes: z.string().optional(),
  negotiationNotes: z.string().trim().optional(),
  supportingDocUrl: z.string().optional(),
});

const rejectSchema = z.object({ reason: z.string().min(3) });
const clearanceSchema = z
  .object({
    status: z.enum(["PENDING", "COMPLETED"]),
    remarks: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "COMPLETED" && (!data.remarks || data.remarks.length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A clearance note of at least 3 characters is required",
        path: ["remarks"],
      });
    }
  });
const settlementSchema = z.object({
  unpaidSalaryDays: z.number().min(0).optional().default(0),
  extraDeductions: z.number().min(0).optional().default(0),
  otherAdditions: z.number().min(0).optional().default(0),
});

function isHr(role?: string) {
  return Boolean(role && HR_ROLES.includes(role));
}

function canSeeAllExits(role?: string) {
  return isHr(role) || role === "CEO";
}

function startOfYear(date = new Date()) {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateInput(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return startOfDay(new Date(value));
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(from: Date, to: Date) {
  return Math.max(0, Math.floor((startOfDay(to).getTime() - startOfDay(from).getTime()) / (24 * 60 * 60 * 1000)));
}

function applyNoticePeriodStart(
  record: {
    noticePeriodDays: number;
    requestedLastWorkingDay: Date | null;
    lastWorkingDate: Date | null;
  },
  noticePeriodStartDate: Date,
) {
  const noticeDays = record.noticePeriodDays ?? 30;
  const computedLwd = addDays(noticePeriodStartDate, noticeDays);
  const proposedLwd = record.requestedLastWorkingDay ?? record.lastWorkingDate;
  const requestedLwd = proposedLwd ? startOfDay(proposedLwd) : computedLwd;
  const lastWorkingDate = requestedLwd > computedLwd ? requestedLwd : computedLwd;
  const noticeShortfallDays = Math.max(0, noticeDays - daysBetween(noticePeriodStartDate, lastWorkingDate));
  return { noticePeriodStartDate, lastWorkingDate, noticeShortfallDays };
}

async function isEmployeeOnApprovedLeave(employeeId: string, date = new Date()) {
  const day = startOfDay(date);
  const leave = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status: "APPROVED",
      startDate: { lte: day },
      endDate: { gte: day },
    },
  });
  return Boolean(leave);
}

async function resolveExitApprover(employee: { id: string; managerId: string | null; department: string }) {
  const managerSelect = {
    id: true,
    employeeCode: true,
    firstName: true,
    lastName: true,
    department: true,
    role: true,
  } as const;

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

  const managerOnLeave = await isEmployeeOnApprovedLeave(lineManager.id);
  if (!managerOnLeave) {
    return {
      approverId: lineManager.id,
      lineManager,
      assignedApprover: lineManager,
      isActing: false,
      managerOnLeave: false,
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

function employeeName(emp?: { firstName?: string; lastName?: string | null } | null) {
  if (!emp) return "—";
  return `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "—";
}

async function getUsedPaidLeaveDays(employeeId: string, now = new Date()) {
  const used = await prisma.leaveRequest.aggregate({
    where: {
      employeeId,
      status: "APPROVED",
      approvedAt: { gte: startOfYear(now), lte: now },
      leaveType: { paidLeave: true },
    },
    _sum: { days: true },
  });
  return Number(used._sum.days ?? 0);
}

function exitInclude() {
  return {
    employee: {
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        designation: true,
        managerId: true,
        dateOfJoining: true,
        noticePeriodDays: true,
        basicSalary: true,
        housingAllowance: true,
        transportAllowance: true,
        manager: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    },
    assignedApprover: {
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        department: true,
      },
    },
    clearanceTasks: {
      orderBy: { department: "asc" },
      include: {
        assignedManager: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    },
    finalSettlement: true,
  } satisfies Prisma.ExitRecordInclude;
}

// List exit records (role-scoped)
exitRouter.get("/", async (req: AuthRequest, res) => {
  const auth = req.auth;
  if (!auth?.employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }
  const where: Prisma.ExitRecordWhereInput = {};
  if (!canSeeAllExits(auth.role)) {
    if (auth.role === "MANAGER") {
      where.OR = [
        { employeeId: auth.employeeId },
        { assignedApproverId: auth.employeeId },
        { employee: { managerId: auth.employeeId } },
      ];
    } else {
      where.employeeId = auth.employeeId;
    }
  }
  const records = await prisma.exitRecord.findMany({
    where,
    include: exitInclude(),
    orderBy: { createdAt: "desc" },
  });
  return res.json(records);
});

// Resignation context: notice period, manager, acting approver (must be before /:id)
exitRouter.get("/context/:employeeId", async (req: AuthRequest, res) => {
  const auth = req.auth;
  const employeeId = String(req.params.employeeId);
  const canViewContext = isHr(auth?.role)
    || auth?.role === "MANAGER"
    || auth?.role === "CEO"
    || auth?.role === "SUPER_ADMIN"
    || employeeId === auth?.employeeId;
  if (!canViewContext) {
    return res.status(403).json({ message: "You cannot view exit context for this employee" });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      department: true,
      noticePeriodDays: true,
      managerId: true,
      manager: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          department: true,
        },
      },
    },
  });
  if (!employee) {
    return res.status(404).json({ message: "Employee profile not found" });
  }

  const approverInfo = await resolveExitApprover(employee);
  const noticePeriodDays = employee.noticePeriodDays ?? 30;
  const startDateParam = typeof req.query.startDate === "string"
    ? req.query.startDate
    : typeof req.query.resignationDate === "string"
      ? req.query.resignationDate
      : null;
  const noticeStart = startDateParam ? parseDateInput(startDateParam) : startOfDay();
  const noticeEnd = addDays(noticeStart, noticePeriodDays);

  return res.json({
    noticePeriodDays,
    noticePeriodStart: noticeStart.toISOString(),
    noticePeriodEnd: noticeEnd.toISOString(),
    lineManager: approverInfo.lineManager
      ? {
          id: approverInfo.lineManager.id,
          name: employeeName(approverInfo.lineManager),
          employeeCode: approverInfo.lineManager.employeeCode,
        }
      : null,
    assignedApprover: approverInfo.assignedApprover
      ? {
          id: approverInfo.assignedApprover.id,
          name: employeeName(approverInfo.assignedApprover),
          employeeCode: approverInfo.assignedApprover.employeeCode,
          isActing: approverInfo.isActing,
        }
      : null,
    managerOnLeave: approverInfo.managerOnLeave,
  });
});

exitRouter.get("/:id", async (req: AuthRequest, res) => {
  const record = await prisma.exitRecord.findUnique({
    where: { id: String(req.params.id) },
    include: exitInclude(),
  });
  if (!record) {
    return res.status(404).json({ message: "Exit record not found" });
  }
  const auth = req.auth;
  if (!canSeeAllExits(auth?.role)) {
    if (auth?.role === "MANAGER") {
      const allowed = record.employeeId === auth?.employeeId
        || record.assignedApproverId === auth?.employeeId
        || record.employee?.managerId === auth?.employeeId;
      if (!allowed) {
        return res.status(403).json({ message: "You cannot view this exit record" });
      }
    } else if (record.employeeId !== auth?.employeeId) {
      return res.status(403).json({ message: "You cannot view this exit record" });
    }
  }
  return res.json(record);
});

// Employee (or HR on behalf) submits resignation
exitRouter.post("/resignation", async (req: AuthRequest, res) => {
  const payload = resignationSchema.parse(req.body);
  const auth = req.auth;
  const employeeId = isHr(auth?.role) && payload.employeeId ? payload.employeeId : auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }
  if (!isHr(auth?.role) && payload.employeeId && payload.employeeId !== auth?.employeeId) {
    return res.status(403).json({ message: "You can only resign for your own profile" });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, managerId: true, department: true, noticePeriodDays: true, status: true },
  });
  if (!employee) {
    return res.status(404).json({ message: "Employee profile not found" });
  }
  if (["RESIGNED", "TERMINATED"].includes(employee.status)) {
    return res.status(400).json({ message: "This employee has already exited the organization" });
  }
  const openExit = await prisma.exitRecord.findFirst({
    where: { employeeId, status: { notIn: [ExitStatus.COMPLETED, ExitStatus.REJECTED, ExitStatus.CANCELLED] } },
  });
  if (openExit) {
    return res.status(400).json({ message: "An active exit process already exists for this employee" });
  }

  const resignationDate = startOfDay(new Date(payload.resignationDate));
  const requestedLwd = startOfDay(new Date(payload.requestedLastWorkingDay));
  const todayStart = startOfDay();
  if (resignationDate < todayStart) {
    return res.status(400).json({ message: "Resignation date cannot be backdated" });
  }
  if (requestedLwd < resignationDate) {
    return res.status(400).json({ message: "Last working day cannot be before the resignation date" });
  }
  const noticePeriodDays = employee.noticePeriodDays ?? 30;
  const expectedLwd = addDays(resignationDate, noticePeriodDays);
  const servedDays = daysBetween(resignationDate, requestedLwd);
  const shortfall = Math.max(0, noticePeriodDays - servedDays);
  const approverInfo = await resolveExitApprover(employee);

  const created = await prisma.exitRecord.create({
    data: {
      employeeId,
      type: "RESIGNATION",
      status: ExitStatus.NEGOTIATION,
      reasonCategory: payload.reasonCategory,
      reason: payload.reason,
      resignationDate,
      requestedLastWorkingDay: requestedLwd,
      noticePeriodDays,
      noticeAccepted: true,
      noticeShortfallDays: shortfall,
      assignedApproverId: approverInfo.approverId,
      supportingDocUrl: payload.supportingDocUrl,
      employeeConfirmed: true,
      employeeConfirmedAt: new Date(),
    },
    include: exitInclude(),
  });
  return res.status(201).json(created);
});

// HR/Manager initiates termination
exitRouter.post("/termination", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER", "MANAGER"), async (req: AuthRequest, res) => {
  const payload = terminationSchema.parse(req.body);
  if (payload.employeeId === req.auth?.employeeId) {
    return res.status(400).json({ message: "You cannot initiate a termination for yourself" });
  }
  const employee = await prisma.employee.findUnique({
    where: { id: payload.employeeId },
    select: { id: true, managerId: true, department: true, noticePeriodDays: true, status: true },
  });
  if (!employee) {
    return res.status(404).json({ message: "Employee profile not found" });
  }
  if (["RESIGNED", "TERMINATED"].includes(employee.status)) {
    return res.status(400).json({ message: "This employee has already exited the organization" });
  }
  const openExit = await prisma.exitRecord.findFirst({
    where: { employeeId: payload.employeeId, status: { notIn: [ExitStatus.COMPLETED, ExitStatus.REJECTED, ExitStatus.CANCELLED] } },
  });
  if (openExit) {
    return res.status(400).json({ message: "An active exit process already exists for this employee" });
  }

  const lastWorkingDate = startOfDay(new Date(payload.lastWorkingDate));
  const noticeStartDate = startOfDay(new Date(payload.noticeStartDate));
  if (lastWorkingDate < noticeStartDate) {
    return res.status(400).json({ message: "Last working day cannot be before the notice start date" });
  }
  const noticePeriodDays = employee.noticePeriodDays ?? 30;
  const shortfall = Math.max(0, noticePeriodDays - daysBetween(noticeStartDate, lastWorkingDate));
  const approverInfo = await resolveExitApprover(employee);

  const created = await prisma.exitRecord.create({
    data: {
      employeeId: payload.employeeId,
      type: "TERMINATION",
      status: ExitStatus.NEGOTIATION,
      reasonCategory: payload.reasonCategory,
      reason: payload.reason,
      noticePeriodStartDate: noticeStartDate,
      lastWorkingDate,
      noticePeriodDays,
      noticeAccepted: true,
      noticeShortfallDays: shortfall,
      assignedApproverId: approverInfo.approverId,
      incidentNotes: payload.incidentNotes,
      supportingDocUrl: payload.supportingDocUrl,
    },
    include: exitInclude(),
  });
  return res.status(201).json(created);
});

// Line Manager L1 approval (resignation) — sets notice start date after negotiation
exitRouter.post("/:id/lm-approve", requireRoles("MANAGER", "SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = lmApproveSchema.parse(req.body);
  const record = await prisma.exitRecord.findUnique({
    where: { id: String(req.params.id) },
    include: { employee: { select: { managerId: true } } },
  });
  if (!record) return res.status(404).json({ message: "Exit record not found" });
  if (
    record.type !== "RESIGNATION"
    || ![ExitStatus.NEGOTIATION, ExitStatus.PENDING].includes(record.status as typeof ExitStatus.NEGOTIATION)
  ) {
    return res.status(400).json({ message: "Only resignations in negotiation can be approved at line-manager stage" });
  }
  if (
    req.auth?.role === "MANAGER" &&
    record.assignedApproverId !== req.auth.employeeId &&
    record.employee?.managerId !== req.auth.employeeId
  ) {
    return res.status(403).json({ message: "You are not the assigned approver for this resignation" });
  }

  const noticePeriodStartDate = startOfDay(new Date(payload.noticePeriodStartDate));
  const resignationDate = record.resignationDate ? startOfDay(record.resignationDate) : startOfDay();
  if (noticePeriodStartDate < resignationDate) {
    return res.status(400).json({ message: "Notice period cannot start before the resignation date" });
  }

  const noticeResult = applyNoticePeriodStart(record, noticePeriodStartDate);

  const updated = await prisma.exitRecord.update({
    where: { id: record.id },
    data: {
      status: ExitStatus.LM_APPROVED,
      noticePeriodStartDate: noticeResult.noticePeriodStartDate,
      lastWorkingDate: noticeResult.lastWorkingDate,
      noticeShortfallDays: noticeResult.noticeShortfallDays,
      noticeAccepted: true,
      negotiationNotes: payload.negotiationNotes ?? record.negotiationNotes,
      lmApprovedById: req.auth?.employeeId,
      lmApprovedAt: new Date(),
    },
    include: exitInclude(),
  });
  return res.json(updated);
});

// Termination: manager or HR ends negotiation and documents
exitRouter.post("/:id/document", requireRoles("MANAGER", "SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = documentSchema.parse(req.body);
  const record = await prisma.exitRecord.findUnique({
    where: { id: String(req.params.id) },
    include: { employee: { select: { managerId: true } } },
  });
  if (!record) return res.status(404).json({ message: "Exit record not found" });
  if (
    record.type !== "TERMINATION"
    || ![ExitStatus.NEGOTIATION, ExitStatus.INITIATED].includes(record.status as typeof ExitStatus.NEGOTIATION)
  ) {
    return res.status(400).json({ message: "Only terminations in negotiation can be documented" });
  }
  if (
    req.auth?.role === "MANAGER" &&
    record.assignedApproverId !== req.auth.employeeId &&
    record.employee?.managerId !== req.auth.employeeId
  ) {
    return res.status(403).json({ message: "You are not the assigned approver for this termination" });
  }

  const noticePeriodStartDate = startOfDay(new Date(payload.noticePeriodStartDate));
  const earliestStart = record.noticePeriodStartDate
    ? startOfDay(record.noticePeriodStartDate)
    : startOfDay(record.createdAt);
  if (noticePeriodStartDate < earliestStart) {
    return res.status(400).json({ message: "Notice period cannot start before the initiated notice start date" });
  }

  const noticeResult = applyNoticePeriodStart(record, noticePeriodStartDate);

  const updated = await prisma.exitRecord.update({
    where: { id: record.id },
    data: {
      status: ExitStatus.DOCUMENTED,
      noticePeriodStartDate: noticeResult.noticePeriodStartDate,
      lastWorkingDate: noticeResult.lastWorkingDate,
      noticeShortfallDays: noticeResult.noticeShortfallDays,
      incidentNotes: payload.incidentNotes ?? record.incidentNotes,
      negotiationNotes: payload.negotiationNotes ?? record.negotiationNotes,
      supportingDocUrl: payload.supportingDocUrl ?? record.supportingDocUrl,
      lmApprovedById: req.auth?.employeeId,
      lmApprovedAt: new Date(),
    },
    include: exitInclude(),
  });
  return res.json(updated);
});

async function createClearanceTasks(exitRecordId: string, urgent: boolean) {
  const existing = await prisma.clearanceTask.count({ where: { exitRecordId } });
  if (existing > 0) return;
  const tasks = await Promise.all(
    CLEARANCE_DEPARTMENTS.map(async (department) => ({
      exitRecordId,
      department,
      urgent,
      assignedManagerId: await resolveClearanceDepartmentManager(department),
    })),
  );
  await prisma.clearanceTask.createMany({ data: tasks });
}

// List clearance tasks (managers see assigned; HR/admin see all)
exitRouter.get("/clearance/tasks", async (req: AuthRequest, res) => {
  const auth = req.auth;
  if (!auth?.employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }

  const where: Prisma.ClearanceTaskWhereInput = {
    exitRecord: { status: ExitStatus.CLEARANCE_IN_PROGRESS },
  };

  if (auth.role === "MANAGER") {
    where.assignedManagerId = auth.employeeId;
  } else if (!canSeeAllExits(auth.role)) {
    return res.status(403).json({ message: "You cannot view clearance tasks" });
  }

  await syncClearanceTaskAssignments();

  const tasks = await prisma.clearanceTask.findMany({
    where,
    include: {
      assignedManager: {
        select: { id: true, employeeCode: true, firstName: true, lastName: true },
      },
      exitRecord: {
        select: {
          id: true,
          type: true,
          status: true,
          lastWorkingDate: true,
          requestedLastWorkingDay: true,
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              department: true,
              designation: true,
            },
          },
        },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return res.json(tasks);
});

// HR confirms LWD / notice & moves to clearance (resignation)
exitRouter.post("/:id/hr-approve", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = hrApproveSchema.parse(req.body);
  const record = await prisma.exitRecord.findUnique({ where: { id: String(req.params.id) } });
  if (!record) return res.status(404).json({ message: "Exit record not found" });
  if (record.type !== "RESIGNATION" || record.status !== ExitStatus.LM_APPROVED) {
    return res.status(400).json({ message: "Only line-manager approved resignations can be HR approved" });
  }
  const updated = await prisma.exitRecord.update({
    where: { id: record.id },
    data: {
      status: ExitStatus.CLEARANCE_IN_PROGRESS,
      lastWorkingDate: new Date(payload.lastWorkingDate),
      noticeShortfallDays: payload.noticeShortfallDays ?? record.noticeShortfallDays,
      noticeAccepted: true,
      hrApprovedById: req.auth?.employeeId,
      hrApprovedAt: new Date(),
    },
  });
  await createClearanceTasks(record.id, false);
  const full = await prisma.exitRecord.findUnique({ where: { id: record.id }, include: exitInclude() });
  return res.json(full);
});

// CEO/Director approval (termination) -> clearance
exitRouter.post("/:id/ceo-approve", requireRoles("SUPER_ADMIN", "CEO"), async (req: AuthRequest, res) => {
  const record = await prisma.exitRecord.findUnique({ where: { id: String(req.params.id) } });
  if (!record) return res.status(404).json({ message: "Exit record not found" });
  if (record.type !== "TERMINATION" || record.status !== ExitStatus.DOCUMENTED) {
    return res.status(400).json({ message: "Only documented terminations can receive final approval" });
  }
  await prisma.exitRecord.update({
    where: { id: record.id },
    data: {
      status: ExitStatus.CLEARANCE_IN_PROGRESS,
      ceoApprovedById: req.auth?.employeeId,
      ceoApprovedAt: new Date(),
    },
  });
  await createClearanceTasks(record.id, true);
  const full = await prisma.exitRecord.findUnique({ where: { id: record.id }, include: exitInclude() });
  return res.json(full);
});

exitRouter.post("/:id/reject", requireRoles("MANAGER", "SUPER_ADMIN", "CEO", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = rejectSchema.parse(req.body);
  const record = await prisma.exitRecord.findUnique({ where: { id: String(req.params.id) } });
  if (!record) return res.status(404).json({ message: "Exit record not found" });
  if ([ExitStatus.COMPLETED, ExitStatus.REJECTED, ExitStatus.CANCELLED].includes(record.status as never)) {
    return res.status(400).json({ message: "This exit record can no longer be rejected" });
  }
  const status = record.type === "TERMINATION" ? ExitStatus.CANCELLED : ExitStatus.REJECTED;
  const updated = await prisma.exitRecord.update({
    where: { id: record.id },
    data: { status, rejectedById: req.auth?.employeeId, rejectedAt: new Date(), rejectReason: payload.reason },
    include: exitInclude(),
  });
  return res.json(updated);
});

// Admin delete exit record (clears in-progress or reverts completed employee status)
exitRouter.delete("/:id", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const record = await prisma.exitRecord.findUnique({
    where: { id: String(req.params.id) },
    include: { employee: { select: { id: true, dateOfJoining: true, status: true } } },
  });
  if (!record) return res.status(404).json({ message: "Exit record not found" });

  await prisma.$transaction(async (tx) => {
    if (record.status === ExitStatus.COMPLETED && record.employee) {
      const restoredStatus = resolveEmploymentStatus("ACTIVE", record.employee.dateOfJoining);
      await tx.employee.update({
        where: { id: record.employeeId },
        data: { status: restoredStatus, accessEnabled: true },
      });
    }
    await tx.exitRecord.delete({ where: { id: record.id } });
  });

  return res.json({ message: "Exit record deleted" });
});

// Mark clearance task complete — dept manager or HR/admin for ADMIN & PRO, note required
exitRouter.patch(
  "/clearance/:taskId",
  requireRoles("MANAGER", "SUPER_ADMIN", "HR", "HR_OFFICER"),
  async (req: AuthRequest, res) => {
  const payload = clearanceSchema.parse(req.body);
  const task = await prisma.clearanceTask.findUnique({
    where: { id: String(req.params.taskId) },
    include: {
      exitRecord: {
        select: { status: true },
      },
    },
  });
  if (!task) return res.status(404).json({ message: "Clearance task not found" });
  if (task.exitRecord.status !== ExitStatus.CLEARANCE_IN_PROGRESS) {
    return res.status(400).json({ message: "Clearance can only be updated while exit is in clearance stage" });
  }
  if (!canCompleteClearanceTask(task, req.auth ?? {})) {
    return res.status(403).json({ message: "You are not allowed to complete this clearance task" });
  }
  if (payload.status !== "COMPLETED") {
    return res.status(400).json({ message: "Clearance can only be marked as completed" });
  }
  const updated = await prisma.clearanceTask.update({
    where: { id: task.id },
    data: {
      status: "COMPLETED",
      remarks: payload.remarks,
      completedById: req.auth?.employeeId,
      completedAt: new Date(),
    },
  });
  const full = await prisma.exitRecord.findUnique({ where: { id: task.exitRecordId }, include: exitInclude() });
  return res.json({ task: updated, exit: full });
  },
);

// Compute & save final settlement
exitRouter.post("/:id/settlement", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = settlementSchema.parse(req.body);
  const record = await prisma.exitRecord.findUnique({
    where: { id: String(req.params.id) },
    include: { employee: true, clearanceTasks: true },
  });
  if (!record) return res.status(404).json({ message: "Exit record not found" });
  if (![ExitStatus.CLEARANCE_IN_PROGRESS, ExitStatus.SETTLEMENT_READY].includes(record.status as never)) {
    return res.status(400).json({ message: "Settlement can be computed only after approvals/clearance start" });
  }
  const pendingClearance = record.clearanceTasks.filter((task) => task.status !== "COMPLETED");
  if (pendingClearance.length) {
    return res.status(400).json({ message: `Clearance incomplete: ${pendingClearance.map((t) => t.department).join(", ")}` });
  }

  const lastWorkingDate = record.lastWorkingDate ?? record.requestedLastWorkingDay ?? new Date();
  const usedPaidLeaveDays = await getUsedPaidLeaveDays(record.employeeId);
  const outstandingLoans = await getOutstandingLoanTotal(record.employeeId);
  const result = computeSettlement({
    dateOfJoining: record.employee.dateOfJoining,
    lastWorkingDate,
    basicSalary: record.employee.basicSalary,
    housingAllowance: record.employee.housingAllowance,
    transportAllowance: record.employee.transportAllowance,
    exitType: record.type as "RESIGNATION" | "TERMINATION",
    usedPaidLeaveDays,
    unpaidSalaryDays: payload.unpaidSalaryDays,
    noticeShortfallDays: record.noticeShortfallDays,
    extraDeductions: payload.extraDeductions + outstandingLoans,
    otherAdditions: payload.otherAdditions,
  });
  result.breakdown.outstandingLoanRecovery = outstandingLoans;

  const settlement = await prisma.finalSettlement.upsert({
    where: { exitRecordId: record.id },
    create: {
      exitRecordId: record.id,
      yearsOfService: result.yearsOfService,
      unpaidSalary: result.unpaidSalary,
      leaveEncashment: result.leaveEncashment,
      gratuity: result.gratuity,
      otherAdditions: result.otherAdditions,
      deductions: result.deductions,
      netSettlement: result.netSettlement,
      breakdown: result.breakdown,
      status: "FINALIZED",
    },
    update: {
      yearsOfService: result.yearsOfService,
      unpaidSalary: result.unpaidSalary,
      leaveEncashment: result.leaveEncashment,
      gratuity: result.gratuity,
      otherAdditions: result.otherAdditions,
      deductions: result.deductions,
      netSettlement: result.netSettlement,
      breakdown: result.breakdown,
      status: "FINALIZED",
    },
  });
  await prisma.exitRecord.update({ where: { id: record.id }, data: { status: ExitStatus.SETTLEMENT_READY } });
  const full = await prisma.exitRecord.findUnique({ where: { id: record.id }, include: exitInclude() });
  return res.json({ settlement, exit: full });
});

// Complete: issue experience letter, finalize, disable login, archive
exitRouter.post("/:id/complete", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const record = await prisma.exitRecord.findUnique({
    where: { id: String(req.params.id) },
    include: { finalSettlement: true },
  });
  if (!record) return res.status(404).json({ message: "Exit record not found" });
  if (record.status !== ExitStatus.SETTLEMENT_READY) {
    return res.status(400).json({ message: "Finalize the settlement before completing the exit" });
  }
  const employeeStatus = record.type === "TERMINATION" ? "TERMINATED" : "RESIGNED";
  await prisma.$transaction([
    prisma.exitRecord.update({
      where: { id: record.id },
      data: { status: ExitStatus.COMPLETED, completedAt: new Date(), experienceLetterIssuedAt: new Date() },
    }),
    prisma.employee.update({
      where: { id: record.employeeId },
      data: { status: employeeStatus, accessEnabled: false },
    }),
  ]);
  await closeOutstandingLoansOnExit(record.employeeId);
  await createCancellationTaskForExit(record.employeeId, record.id);
  const full = await prisma.exitRecord.findUnique({ where: { id: record.id }, include: exitInclude() });
  return res.json(full);
});

// Experience / service letter content
exitRouter.get("/:id/experience-letter", async (req: AuthRequest, res) => {
  const record = await prisma.exitRecord.findUnique({
    where: { id: String(req.params.id) },
    include: { employee: true },
  });
  if (!record) return res.status(404).json({ message: "Exit record not found" });
  const auth = req.auth;
  if (!isHr(auth?.role) && record.employeeId !== auth?.employeeId) {
    return res.status(403).json({ message: "You cannot access this letter" });
  }
  const emp = record.employee;
  const name = `${emp.firstName} ${emp.lastName}`.trim();
  const lwd = record.lastWorkingDate ?? record.requestedLastWorkingDay;
  const letter = [
    "TO WHOM IT MAY CONCERN",
    "",
    `This is to certify that ${name} (Employee ID: ${emp.employeeCode}) was employed with our organization as ${emp.designation} in the ${emp.department} department.`,
    `Date of Joining: ${emp.dateOfJoining.toISOString().slice(0, 10)}`,
    `Last Working Day: ${lwd ? new Date(lwd).toISOString().slice(0, 10) : "—"}`,
    "",
    "During the tenure of employment, conduct and performance were found to be satisfactory.",
    "We wish them success in all future endeavours.",
    "",
    "For and on behalf of the Company,",
    "Human Resources Department",
  ].join("\n");
  return res.json({
    employeeName: name,
    employeeCode: emp.employeeCode,
    issuedAt: record.experienceLetterIssuedAt,
    letter,
  });
});
