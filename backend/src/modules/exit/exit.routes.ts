import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";
import { computeSettlement } from "../../lib/settlement.js";
import { resolveEmploymentStatus } from "../../lib/employment-status.js";
import { getOutstandingLoanTotal, closeOutstandingLoansOnExit } from "../adjustments/adjustments.routes.js";
import { createCancellationTaskForExit } from "../pro/pro.routes.js";
import { resolveLeaveL1Approver as resolveExitApprover, employeeName, startOfDay } from "../../lib/leave-delegation.js";
import {
  CLEARANCE_DEPARTMENTS,
  CLEARANCE_DEPARTMENT_LABELS,
  DEPARTMENT_CHECKLISTS,
  checklistItemResolved,
  departmentHasChecklist,
  getChecklistItemFinancialConfig,
  isFinancialChecklistItem,
} from "../../lib/clearance-checklist.js";
import {
  clearPayAdjustmentForChecklistItem,
  createPayAdjustmentForClearanceItem,
} from "../../lib/clearance-pay-adjustment.js";

export const exitRouter = Router();
exitRouter.use(authMiddleware);

const HR_ROLES = ["SUPER_ADMIN", "HR", "HR_OFFICER"];

/** Maps clearance checklist dept → org departments whose MANAGER receives the task */
const CLEARANCE_DEPT_MANAGER_LOOKUP: Record<string, string[]> = {
  IT: ["IT", "Engineering", "Technology"],
  FINANCE: ["Finance", "FINANCE"],
  TRANSPORTATION: ["Transportation", "Transport", "Logistics", "TRANSPORTATION"],
};

const HR_CLEARANCE_DEPARTMENTS = new Set(["ADMIN", "HR", "PRO"]);
const HR_CLEARANCE_ROLES = ["SUPER_ADMIN", "HR", "HR_OFFICER"] as const;

async function resolveClearanceDepartmentManager(clearanceDepartment: string, exitRecordId?: string) {
  if (clearanceDepartment === "HOD" && exitRecordId) {
    const exit = await prisma.exitRecord.findUnique({
      where: { id: exitRecordId },
      select: {
        assignedApproverId: true,
        employee: { select: { managerId: true } },
      },
    });
    return exit?.employee?.managerId ?? exit?.assignedApproverId ?? null;
  }

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
  if (task.department === "HOD") {
    return auth.role === "MANAGER" && task.assignedManagerId === auth.employeeId;
  }
  return auth.role === "MANAGER" && task.assignedManagerId === auth.employeeId;
}

async function syncClearanceTaskAssignments() {
  const pendingTasks = await prisma.clearanceTask.findMany({
    where: {
      status: "PENDING",
      exitRecord: { status: ExitStatus.CLEARANCE_IN_PROGRESS },
    },
    select: { id: true, department: true, assignedManagerId: true, exitRecordId: true },
    take: 200,
  });
  await Promise.all(
    pendingTasks.map(async (task) => {
      const managerId = await resolveClearanceDepartmentManager(task.department, task.exitRecordId);
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

const clearanceChecklistItemSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "NOT_APPLICABLE"]),
  remarks: z.string().trim().optional(),
  amount: z.number().positive().optional(),
  adjustmentType: z.enum(["DEDUCTION", "ADDITION"]).optional(),
});

const clearanceTaskInclude = {
  assignedManager: {
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
    },
  },
  checklistItems: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      payrollAdjustment: {
        select: {
          id: true,
          referenceNumber: true,
          status: true,
          amount: true,
          type: true,
          requiresDualApproval: true,
        },
      },
    },
  },
} satisfies Prisma.ClearanceTaskInclude;
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
const rejectSchema = z.object({ reason: z.string().min(3) });
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

async function getUsedPaidLeaveDays(employeeId: string, now = new Date()) {
  const used = await prisma.leaveRequest.aggregate({
    where: {
      employeeId,
      status: "APPROVED",
      approvedAt: { gte: startOfYear(now), lte: now },
      leaveType: { balanceMode: "MATURITY" },
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
        netPayCurrency: true,
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
      include: clearanceTaskInclude,
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
  if (record.status === ExitStatus.CLEARANCE_IN_PROGRESS) {
    await ensureClearanceTasks(record.id, record.type === "TERMINATION");
    await syncClearanceTaskAssignments();
    const refreshed = await prisma.exitRecord.findUnique({
      where: { id: record.id },
      include: exitInclude(),
    });
    return res.json(refreshed ?? record);
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

async function ensureDepartmentChecklistItems(clearanceTaskId: string, department: string) {
  const template = DEPARTMENT_CHECKLISTS[department as keyof typeof DEPARTMENT_CHECKLISTS];
  if (!template?.length) return;

  const existing = await prisma.clearanceChecklistItem.findMany({
    where: { clearanceTaskId },
    select: { itemKey: true },
  });
  const existingKeys = new Set(existing.map((item) => item.itemKey));
  const missing = template.filter((item) => !existingKeys.has(item.itemKey));
  if (!missing.length) return;

  await prisma.clearanceChecklistItem.createMany({
    data: missing.map((item) => ({
      clearanceTaskId,
      itemKey: item.itemKey,
      label: item.label,
      sortOrder: item.sortOrder,
    })),
  });
}

async function syncChecklistTaskCompletion(clearanceTaskId: string, completedById?: string | null) {
  const task = await prisma.clearanceTask.findUnique({
    where: { id: clearanceTaskId },
    include: { checklistItems: { orderBy: { sortOrder: "asc" } } },
  });
  if (!task || !task.checklistItems.length || !departmentHasChecklist(task.department)) return;

  const allResolved = task.checklistItems.every((item) => checklistItemResolved(item.status));
  const deptLabel = CLEARANCE_DEPARTMENT_LABELS[task.department as keyof typeof CLEARANCE_DEPARTMENT_LABELS] ?? task.department;

  if (allResolved && task.status !== "COMPLETED") {
    const remarks =
      task.checklistItems
        .map((item) => {
          const statusLabel = item.status === "NOT_APPLICABLE" ? "N/A" : "Collected";
          return item.remarks ? `${item.label} (${statusLabel}: ${item.remarks})` : `${item.label} (${statusLabel})`;
        })
        .join(" · ") || `${deptLabel} checklist cleared`;
    await prisma.clearanceTask.update({
      where: { id: clearanceTaskId },
      data: {
        status: "COMPLETED",
        remarks,
        completedById: completedById ?? task.completedById,
        completedAt: new Date(),
      },
    });
    return;
  }

  if (!allResolved && task.status === "COMPLETED") {
    await prisma.clearanceTask.update({
      where: { id: clearanceTaskId },
      data: {
        status: "PENDING",
        remarks: null,
        completedById: null,
        completedAt: null,
      },
    });
  }
}

async function ensureClearanceTasks(exitRecordId: string, urgent: boolean) {
  const existing = await prisma.clearanceTask.findMany({
    where: { exitRecordId },
    select: { department: true },
  });
  const existingDepartments = new Set(existing.map((task) => task.department));
  const missingDepartments = CLEARANCE_DEPARTMENTS.filter((department) => !existingDepartments.has(department));

  if (missingDepartments.length) {
    const tasks = await Promise.all(
      missingDepartments.map(async (department) => ({
        exitRecordId,
        department,
        urgent,
        assignedManagerId: await resolveClearanceDepartmentManager(department, exitRecordId),
      })),
    );
    await prisma.clearanceTask.createMany({ data: tasks });
  }

  const allTasks = await prisma.clearanceTask.findMany({
    where: { exitRecordId },
    select: { id: true, department: true },
  });
  await Promise.all(allTasks.map((task) => ensureDepartmentChecklistItems(task.id, task.department)));

  const hodTasks = allTasks.filter((task) => task.department === "HOD");
  await Promise.all(
    hodTasks.map(async (task) => {
      const managerId = await resolveClearanceDepartmentManager("HOD", exitRecordId);
      if (managerId) {
        await prisma.clearanceTask.update({
          where: { id: task.id },
          data: { assignedManagerId: managerId },
        });
      }
    }),
  );
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

  const activeClearances = await prisma.exitRecord.findMany({
    where: { status: ExitStatus.CLEARANCE_IN_PROGRESS },
    select: { id: true, type: true },
  });
  await Promise.all(
    activeClearances.map((exit) => ensureClearanceTasks(exit.id, exit.type === "TERMINATION")),
  );
  await syncClearanceTaskAssignments();

  const tasks = await prisma.clearanceTask.findMany({
    where,
    include: {
      ...clearanceTaskInclude,
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
  await ensureClearanceTasks(record.id, false);
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
  await ensureClearanceTasks(record.id, true);
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

// Update IT checklist item — marks parent IT task complete when all items are done
exitRouter.patch(
  "/clearance/checklist/:itemId",
  requireRoles("MANAGER", "SUPER_ADMIN", "HR", "HR_OFFICER"),
  async (req: AuthRequest, res) => {
    const payload = clearanceChecklistItemSchema.parse(req.body);
    const item = await prisma.clearanceChecklistItem.findUnique({
      where: { id: String(req.params.itemId) },
      include: {
        payrollAdjustment: true,
        clearanceTask: {
          include: {
            exitRecord: {
              select: {
                id: true,
                status: true,
                lastWorkingDate: true,
                requestedLastWorkingDay: true,
                employeeId: true,
                employee: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    employeeCode: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!item) return res.status(404).json({ message: "Checklist item not found" });
    if (item.clearanceTask.exitRecord.status !== ExitStatus.CLEARANCE_IN_PROGRESS) {
      return res.status(400).json({ message: "Checklist can only be updated while exit is in clearance stage" });
    }
    if (!canCompleteClearanceTask(item.clearanceTask, req.auth ?? {})) {
      return res.status(403).json({ message: "You are not allowed to update this clearance checklist" });
    }

    const financialConfig = getChecklistItemFinancialConfig(item.itemKey);
    const isFinancial = isFinancialChecklistItem(item.itemKey);

    if (payload.status === "COMPLETED" && isFinancial) {
      const amount = payload.amount;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: `Enter an amount (AED) for ${item.label} before marking collected.` });
      }
      const adjustmentType = payload.adjustmentType ?? financialConfig?.defaultType ?? "DEDUCTION";
      if (adjustmentType === "ADDITION" && !financialConfig?.allowAddition && financialConfig?.defaultType === "DEDUCTION") {
        return res.status(400).json({ message: `${item.label} can only be recorded as a deduction.` });
      }
      const category = financialConfig?.category ?? (adjustmentType === "ADDITION" ? "OTHER_ADDITION" : "OTHER_DEDUCTION");
      const lwd = item.clearanceTask.exitRecord.lastWorkingDate
        ?? item.clearanceTask.exitRecord.requestedLastWorkingDay
        ?? new Date();

      if (item.payrollAdjustmentId && item.payrollAdjustment?.status === "DRAFT") {
        await prisma.payrollAdjustment.delete({ where: { id: item.payrollAdjustmentId } });
      }

      await createPayAdjustmentForClearanceItem({
        checklistItemId: item.id,
        employeeId: item.clearanceTask.exitRecord.employeeId,
        exitRecordId: item.clearanceTask.exitRecord.id,
        itemLabel: item.label,
        amount,
        adjustmentType,
        category,
        effectiveMonth: lwd.getMonth() + 1,
        effectiveYear: lwd.getFullYear(),
        createdById: req.auth?.employeeId,
        remarks: payload.remarks,
      });
    }

    if (payload.status === "PENDING" && item.payrollAdjustmentId) {
      await clearPayAdjustmentForChecklistItem(item.id);
    }

    if (payload.status === "NOT_APPLICABLE" && item.payrollAdjustmentId) {
      await clearPayAdjustmentForChecklistItem(item.id);
    }

    const isResolved = checklistItemResolved(payload.status);
    const updatedItem = await prisma.clearanceChecklistItem.update({
      where: { id: item.id },
      data: {
        status: payload.status,
        remarks: payload.remarks ?? null,
        completedById: isResolved ? req.auth?.employeeId ?? null : null,
        completedAt: isResolved ? new Date() : null,
        ...(payload.status === "NOT_APPLICABLE"
          ? { amount: null, adjustmentType: null, adjustmentCategory: null, payrollAdjustmentId: null }
          : {}),
      },
      include: {
        payrollAdjustment: {
          select: {
            id: true,
            referenceNumber: true,
            status: true,
            amount: true,
            type: true,
            requiresDualApproval: true,
          },
        },
      },
    });

    await syncChecklistTaskCompletion(item.clearanceTaskId, req.auth?.employeeId);

    const full = await prisma.exitRecord.findUnique({
      where: { id: item.clearanceTask.exitRecordId },
      include: exitInclude(),
    });
    const task = full?.clearanceTasks.find((entry) => entry.id === item.clearanceTaskId);
    return res.json({ item: updatedItem, task, exit: full });
  },
);

// Mark clearance task complete — dept manager or HR/admin for ADMIN & PRO, note required
exitRouter.patch(
  "/clearance/:taskId",
  requireRoles("MANAGER", "SUPER_ADMIN", "HR", "HR_OFFICER"),
  async (req: AuthRequest, res) => {
  const payload = clearanceSchema.parse(req.body);
  const task = await prisma.clearanceTask.findUnique({
    where: { id: String(req.params.taskId) },
    include: {
      checklistItems: true,
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
  if (departmentHasChecklist(task.department) && task.checklistItems.length) {
    const pendingItems = task.checklistItems.filter((entry) => entry.status === "PENDING");
    if (pendingItems.length) {
      return res.status(400).json({
        message: `Complete all ${CLEARANCE_DEPARTMENT_LABELS[task.department as keyof typeof CLEARANCE_DEPARTMENT_LABELS] ?? task.department} checklist items first (${pendingItems.length} remaining)`,
        pendingItems: pendingItems.map((entry) => entry.label),
      });
    }
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
