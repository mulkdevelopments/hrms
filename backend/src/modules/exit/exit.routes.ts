import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";
import { computeSettlement } from "../../lib/settlement.js";
import { getOutstandingLoanTotal, closeOutstandingLoansOnExit } from "../adjustments/adjustments.routes.js";
import { createCancellationTaskForExit } from "../pro/pro.routes.js";

export const exitRouter = Router();
exitRouter.use(authMiddleware);

const HR_ROLES = ["SUPER_ADMIN", "HR", "HR_OFFICER"];
const CLEARANCE_DEPARTMENTS = ["IT", "FINANCE", "ADMIN", "PRO"];

const ExitStatus = {
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
  noticeAccepted: z.boolean().default(true),
  supportingDocUrl: z.string().optional(),
  employeeConfirmed: z.literal(true),
});

const terminationSchema = z.object({
  employeeId: z.string(),
  reasonCategory: z.enum(["MISCONDUCT", "REDUNDANCY", "CONTRACT_END", "PROBATION_FAIL"]),
  reason: z.string().trim().optional().default(""),
  lastWorkingDate: z.string().datetime(),
  incidentNotes: z.string().optional(),
  supportingDocUrl: z.string().optional(),
});

const hrApproveSchema = z.object({
  lastWorkingDate: z.string().datetime(),
  noticeShortfallDays: z.number().int().min(0).optional().default(0),
  noticeAccepted: z.boolean().optional(),
});

const documentSchema = z.object({
  incidentNotes: z.string().optional(),
  supportingDocUrl: z.string().optional(),
});

const rejectSchema = z.object({ reason: z.string().min(3) });
const clearanceSchema = z.object({ status: z.enum(["PENDING", "COMPLETED"]), remarks: z.string().optional() });
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
      },
    },
    clearanceTasks: { orderBy: { department: "asc" } },
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
      const manager = await prisma.employee.findUnique({
        where: { id: auth.employeeId },
        select: { department: true },
      });
      where.OR = [
        { employeeId: auth.employeeId },
        { employee: { department: manager?.department ?? "__none__" } },
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

exitRouter.get("/:id", async (req: AuthRequest, res) => {
  const record = await prisma.exitRecord.findUnique({
    where: { id: String(req.params.id) },
    include: exitInclude(),
  });
  if (!record) {
    return res.status(404).json({ message: "Exit record not found" });
  }
  const auth = req.auth;
  if (!canSeeAllExits(auth?.role) && auth?.role !== "MANAGER" && record.employeeId !== auth?.employeeId) {
    return res.status(403).json({ message: "You cannot view this exit record" });
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
    select: { id: true, managerId: true, noticePeriodDays: true, status: true },
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

  const resignationDate = new Date(payload.resignationDate);
  const requestedLwd = new Date(payload.requestedLastWorkingDay);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (resignationDate < todayStart) {
    return res.status(400).json({ message: "Resignation date cannot be backdated" });
  }
  if (requestedLwd < resignationDate) {
    return res.status(400).json({ message: "Last working day cannot be before the resignation date" });
  }
  const noticePeriodDays = employee.noticePeriodDays ?? 30;
  const servedDays = Math.max(0, Math.floor((requestedLwd.getTime() - resignationDate.getTime()) / (24 * 60 * 60 * 1000)));
  const shortfall = payload.noticeAccepted ? 0 : Math.max(0, noticePeriodDays - servedDays);

  const created = await prisma.exitRecord.create({
    data: {
      employeeId,
      type: "RESIGNATION",
      status: ExitStatus.PENDING,
      reasonCategory: payload.reasonCategory,
      reason: payload.reason,
      resignationDate,
      requestedLastWorkingDay: requestedLwd,
      noticePeriodDays,
      noticeAccepted: payload.noticeAccepted,
      noticeShortfallDays: shortfall,
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
    select: { id: true, noticePeriodDays: true, status: true },
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

  const created = await prisma.exitRecord.create({
    data: {
      employeeId: payload.employeeId,
      type: "TERMINATION",
      status: ExitStatus.INITIATED,
      reasonCategory: payload.reasonCategory,
      reason: payload.reason,
      lastWorkingDate: new Date(payload.lastWorkingDate),
      noticePeriodDays: employee.noticePeriodDays ?? 30,
      incidentNotes: payload.incidentNotes,
      supportingDocUrl: payload.supportingDocUrl,
    },
    include: exitInclude(),
  });
  return res.status(201).json(created);
});

// Line Manager L1 approval (resignation)
exitRouter.post("/:id/lm-approve", requireRoles("MANAGER", "SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const record = await prisma.exitRecord.findUnique({
    where: { id: String(req.params.id) },
    include: { employee: { select: { managerId: true } } },
  });
  if (!record) return res.status(404).json({ message: "Exit record not found" });
  if (record.status !== ExitStatus.PENDING) {
    return res.status(400).json({ message: "Only pending resignations can be approved at line-manager stage" });
  }
  if (req.auth?.role === "MANAGER" && record.employee?.managerId !== req.auth.employeeId) {
    return res.status(403).json({ message: "You can approve only your team's resignations" });
  }
  const updated = await prisma.exitRecord.update({
    where: { id: record.id },
    data: { status: ExitStatus.LM_APPROVED, lmApprovedById: req.auth?.employeeId, lmApprovedAt: new Date() },
    include: exitInclude(),
  });
  return res.json(updated);
});

// Termination documentation stage
exitRouter.post("/:id/document", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = documentSchema.parse(req.body);
  const record = await prisma.exitRecord.findUnique({ where: { id: String(req.params.id) } });
  if (!record) return res.status(404).json({ message: "Exit record not found" });
  if (record.type !== "TERMINATION" || record.status !== ExitStatus.INITIATED) {
    return res.status(400).json({ message: "Only initiated terminations can be documented" });
  }
  const updated = await prisma.exitRecord.update({
    where: { id: record.id },
    data: {
      status: ExitStatus.DOCUMENTED,
      incidentNotes: payload.incidentNotes ?? record.incidentNotes,
      supportingDocUrl: payload.supportingDocUrl ?? record.supportingDocUrl,
    },
    include: exitInclude(),
  });
  return res.json(updated);
});

async function createClearanceTasks(exitRecordId: string, urgent: boolean) {
  const existing = await prisma.clearanceTask.count({ where: { exitRecordId } });
  if (existing > 0) return;
  await prisma.clearanceTask.createMany({
    data: CLEARANCE_DEPARTMENTS.map((department) => ({ exitRecordId, department, urgent })),
  });
}

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
      noticeAccepted: payload.noticeAccepted ?? record.noticeAccepted,
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

// Mark clearance task complete
exitRouter.patch("/clearance/:taskId", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER", "MANAGER"), async (req: AuthRequest, res) => {
  const payload = clearanceSchema.parse(req.body);
  const task = await prisma.clearanceTask.findUnique({ where: { id: String(req.params.taskId) } });
  if (!task) return res.status(404).json({ message: "Clearance task not found" });
  const updated = await prisma.clearanceTask.update({
    where: { id: task.id },
    data: {
      status: payload.status,
      remarks: payload.remarks ?? task.remarks,
      completedById: payload.status === "COMPLETED" ? req.auth?.employeeId : null,
      completedAt: payload.status === "COMPLETED" ? new Date() : null,
    },
  });
  const full = await prisma.exitRecord.findUnique({ where: { id: task.exitRecordId }, include: exitInclude() });
  return res.json({ task: updated, exit: full });
});

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
