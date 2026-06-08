import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";

export const adjustmentsRouter = Router();
adjustmentsRouter.use(authMiddleware);

const HR_ROLES = ["SUPER_ADMIN", "HR", "HR_OFFICER"];
const CREATOR_ROLES: ("SUPER_ADMIN" | "HR" | "HR_OFFICER" | "MANAGER")[] = ["SUPER_ADMIN", "HR", "HR_OFFICER", "MANAGER"];

const CATEGORY_DEFS = [
  { code: "ABSENCE_LATE", label: "Absence / Late", type: "DEDUCTION", glCode: "GL-5001" },
  { code: "DISCIPLINARY_FINE", label: "Disciplinary Fine", type: "DEDUCTION", glCode: "GL-5002" },
  { code: "SALARY_ADVANCE", label: "Salary Advance", type: "DEDUCTION", glCode: "GL-5003" },
  { code: "LOAN_RECOVERY", label: "Loan Recovery", type: "DEDUCTION", glCode: "GL-5004" },
  { code: "UNIFORM_EQUIPMENT", label: "Uniform / Equipment", type: "DEDUCTION", glCode: "GL-5005" },
  { code: "OTHER_DEDUCTION", label: "Other Deduction", type: "DEDUCTION", glCode: "GL-5099" },
  { code: "BONUS", label: "Bonus", type: "ADDITION", glCode: "GL-4001" },
  { code: "INCENTIVE", label: "Incentive / Commission", type: "ADDITION", glCode: "GL-4002" },
  { code: "ALLOWANCE", label: "Special Allowance", type: "ADDITION", glCode: "GL-4003" },
  { code: "REIMBURSEMENT", label: "Reimbursement", type: "ADDITION", glCode: "GL-4004" },
  { code: "OTHER_ADDITION", label: "Other Addition", type: "ADDITION", glCode: "GL-4099" },
];
const CATEGORY_MAP = new Map(CATEGORY_DEFS.map((c) => [c.code, c]));

function isHr(role?: string) {
  return Boolean(role && HR_ROLES.includes(role));
}

function monthIndex(year: number, month: number) {
  return year * 12 + (month - 1);
}

function currentMonthIndex(now = new Date()) {
  return monthIndex(now.getFullYear(), now.getMonth() + 1);
}

async function generateReference(prefix: string) {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.payrollAdjustment.count();
  return `${prefix}-${stamp}-${String(count + 1).padStart(5, "0")}`;
}

const createSchema = z.object({
  employeeId: z.string(),
  type: z.enum(["ADDITION", "DEDUCTION"]),
  category: z.string(),
  amount: z.number().positive(),
  effectiveMonth: z.number().int().min(1).max(12),
  effectiveYear: z.number().int().min(2020).max(2100),
  reason: z.string().trim().min(20),
  supportingDocUrl: z.string().optional(),
  recurring: z.boolean().optional().default(false),
  recurrenceEndMonth: z.number().int().min(1).max(12).optional(),
  recurrenceEndYear: z.number().int().min(2020).max(2100).optional(),
});

const rejectSchema = z.object({ reason: z.string().min(3) });
const processMonthSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

const loanSchema = z.object({
  employeeId: z.string(),
  type: z.enum(["ADVANCE", "LOAN"]),
  totalAmount: z.number().positive(),
  installmentAmount: z.number().positive(),
  startMonth: z.number().int().min(1).max(12),
  startYear: z.number().int().min(2020).max(2100),
  reason: z.string().trim().min(10),
});

adjustmentsRouter.get("/categories", (_req, res) => {
  res.json({ categories: CATEGORY_DEFS, dualApprovalThreshold: env.ADJUSTMENT_DUAL_APPROVAL_THRESHOLD });
});

function scopeWhere(auth: AuthRequest["auth"]): Prisma.PayrollAdjustmentWhereInput {
  if (isHr(auth?.role)) return {};
  if (auth?.role === "MANAGER") {
    return { employee: { managerId: auth.employeeId } };
  }
  return { employeeId: auth?.employeeId ?? "__none__" };
}

adjustmentsRouter.get("/", async (req: AuthRequest, res) => {
  const where = scopeWhere(req.auth);
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.employeeId && isHr(req.auth?.role)) where.employeeId = String(req.query.employeeId);
  if (req.query.month) where.effectiveMonth = Number(req.query.month);
  if (req.query.year) where.effectiveYear = Number(req.query.year);

  const adjustments = await prisma.payrollAdjustment.findMany({
    where,
    include: {
      employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(adjustments);
});

adjustmentsRouter.post("/", requireRoles(...CREATOR_ROLES), async (req: AuthRequest, res) => {
  const payload = createSchema.parse(req.body);
  const category = CATEGORY_MAP.get(payload.category);
  if (!category) {
    return res.status(400).json({ message: "Invalid category" });
  }
  if (category.type !== payload.type) {
    return res.status(400).json({ message: `Category "${category.label}" is not valid for ${payload.type.toLowerCase()}s` });
  }
  if (monthIndex(payload.effectiveYear, payload.effectiveMonth) < currentMonthIndex()) {
    return res.status(400).json({ message: "Cannot create an adjustment for a closed (past) payroll month" });
  }

  const employee = await prisma.employee.findUnique({ where: { id: payload.employeeId }, select: { id: true, status: true } });
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  if (["RESIGNED", "TERMINATED"].includes(employee.status)) {
    return res.status(400).json({ message: "Cannot raise adjustments for an exited employee" });
  }

  const created = await prisma.payrollAdjustment.create({
    data: {
      referenceNumber: await generateReference("ADJ"),
      employeeId: payload.employeeId,
      type: payload.type,
      category: payload.category,
      glCode: category.glCode,
      amount: payload.amount,
      effectiveMonth: payload.effectiveMonth,
      effectiveYear: payload.effectiveYear,
      reason: payload.reason,
      supportingDocUrl: payload.supportingDocUrl,
      recurring: payload.recurring,
      frequency: payload.recurring ? "MONTHLY" : null,
      recurrenceEndMonth: payload.recurring ? payload.recurrenceEndMonth : null,
      recurrenceEndYear: payload.recurring ? payload.recurrenceEndYear : null,
      status: "DRAFT",
      createdById: req.auth?.employeeId,
    },
    include: { employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } } },
  });
  return res.status(201).json(created);
});

adjustmentsRouter.post("/:id/approve", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const record = await prisma.payrollAdjustment.findUnique({ where: { id: String(req.params.id) } });
  if (!record) return res.status(404).json({ message: "Adjustment not found" });
  if (record.status !== "DRAFT") {
    return res.status(400).json({ message: "Only draft adjustments can be approved" });
  }
  const updated = await prisma.payrollAdjustment.update({
    where: { id: record.id },
    data: { status: "APPROVED", approvedById: req.auth?.employeeId, approvedAt: new Date() },
    include: { employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } } },
  });
  return res.json(updated);
});

adjustmentsRouter.post("/:id/reject", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = rejectSchema.parse(req.body);
  const record = await prisma.payrollAdjustment.findUnique({ where: { id: String(req.params.id) } });
  if (!record) return res.status(404).json({ message: "Adjustment not found" });
  if (!["DRAFT", "APPROVED"].includes(record.status)) {
    return res.status(400).json({ message: "Only draft or approved adjustments can be rejected" });
  }
  const updated = await prisma.payrollAdjustment.update({
    where: { id: record.id },
    data: { status: "REJECTED", rejectedById: req.auth?.employeeId, rejectedAt: new Date(), rejectReason: payload.reason },
    include: { employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } } },
  });
  return res.json(updated);
});

// Finance confirms payroll batch for a month: APPROVED -> PROCESSED, recover loans.
adjustmentsRouter.post("/process-month", requireRoles("SUPER_ADMIN", "HR"), async (req: AuthRequest, res) => {
  const payload = processMonthSchema.parse(req.body);
  const approved = await prisma.payrollAdjustment.findMany({
    where: { status: "APPROVED", effectiveMonth: payload.month, effectiveYear: payload.year },
  });
  if (!approved.length) {
    return res.json({ processed: 0, message: "No approved adjustments for this month" });
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    for (const adj of approved) {
      await tx.payrollAdjustment.update({
        where: { id: adj.id },
        data: { status: "PROCESSED", processedAt: now },
      });
      if (adj.loanId) {
        const loan = await tx.salaryAdvanceLoan.findUnique({ where: { id: adj.loanId } });
        if (loan && loan.status === "ACTIVE") {
          const recovered = loan.recoveredAmount + adj.amount;
          const fullyRecovered = recovered >= loan.totalAmount;
          await tx.salaryAdvanceLoan.update({
            where: { id: loan.id },
            data: {
              recoveredAmount: recovered,
              status: fullyRecovered ? "CLOSED" : "ACTIVE",
              closedAt: fullyRecovered ? now : null,
            },
          });
        }
      }
    }
  });
  return res.json({ processed: approved.length });
});

// ───────── Loans / Advances ─────────

adjustmentsRouter.get("/loans", async (req: AuthRequest, res) => {
  const auth = req.auth;
  const where: Prisma.SalaryAdvanceLoanWhereInput = {};
  if (!isHr(auth?.role)) {
    if (auth?.role === "MANAGER") {
      where.employee = { managerId: auth.employeeId };
    } else {
      where.employeeId = auth?.employeeId ?? "__none__";
    }
  }
  const loans = await prisma.salaryAdvanceLoan.findMany({
    where,
    include: {
      employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } },
      installments: { orderBy: { installmentNo: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(loans.map((loan) => ({
    ...loan,
    outstandingAmount: Math.max(0, loan.totalAmount - loan.recoveredAmount),
  })));
});

adjustmentsRouter.post("/loans", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = loanSchema.parse(req.body);
  if (payload.installmentAmount > payload.totalAmount) {
    return res.status(400).json({ message: "Installment amount cannot exceed the total amount" });
  }
  const employee = await prisma.employee.findUnique({ where: { id: payload.employeeId }, select: { id: true, status: true } });
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  if (["RESIGNED", "TERMINATED"].includes(employee.status)) {
    return res.status(400).json({ message: "Cannot raise a loan/advance for an exited employee" });
  }
  const requiresDualApproval = payload.totalAmount > env.ADJUSTMENT_DUAL_APPROVAL_THRESHOLD;
  const loan = await prisma.salaryAdvanceLoan.create({
    data: {
      employeeId: payload.employeeId,
      type: payload.type,
      totalAmount: payload.totalAmount,
      installmentAmount: payload.installmentAmount,
      startMonth: payload.startMonth,
      startYear: payload.startYear,
      reason: payload.reason,
      requiresDualApproval,
      createdById: req.auth?.employeeId,
      status: "PENDING_APPROVAL",
    },
    include: { employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } } },
  });
  return res.status(201).json(loan);
});

async function generateLoanInstallments(loanId: string) {
  const loan = await prisma.salaryAdvanceLoan.findUnique({ where: { id: loanId } });
  if (!loan) return;
  const existing = await prisma.payrollAdjustment.count({ where: { loanId } });
  if (existing > 0) return;

  const category = loan.type === "ADVANCE" ? "SALARY_ADVANCE" : "LOAN_RECOVERY";
  const glCode = CATEGORY_MAP.get(category)?.glCode ?? null;
  const count = Math.ceil(loan.totalAmount / loan.installmentAmount);
  let remaining = loan.totalAmount;
  const baseIndex = monthIndex(loan.startYear, loan.startMonth);

  for (let i = 0; i < count; i += 1) {
    const amount = Math.min(loan.installmentAmount, remaining);
    remaining -= amount;
    const idx = baseIndex + i;
    const year = Math.floor(idx / 12);
    const month = (idx % 12) + 1;
    await prisma.payrollAdjustment.create({
      data: {
        referenceNumber: await generateReference("LN"),
        employeeId: loan.employeeId,
        type: "DEDUCTION",
        category,
        glCode,
        amount,
        effectiveMonth: month,
        effectiveYear: year,
        reason: `${loan.type === "ADVANCE" ? "Salary advance" : "Loan"} recovery instalment ${i + 1}/${count}`,
        status: "APPROVED",
        loanId: loan.id,
        installmentNo: i + 1,
        approvedAt: new Date(),
      },
    });
  }
}

adjustmentsRouter.post("/loans/:id/approve", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const loan = await prisma.salaryAdvanceLoan.findUnique({ where: { id: String(req.params.id) } });
  if (!loan) return res.status(404).json({ message: "Loan/advance not found" });
  if (loan.status !== "PENDING_APPROVAL") {
    return res.status(400).json({ message: "Only pending loans/advances can be approved" });
  }
  const approverId = req.auth?.employeeId ?? null;

  if (!loan.requiresDualApproval) {
    await prisma.salaryAdvanceLoan.update({
      where: { id: loan.id },
      data: { status: "ACTIVE", approver1Id: approverId, approver1At: new Date() },
    });
    await generateLoanInstallments(loan.id);
  } else if (!loan.approver1Id) {
    await prisma.salaryAdvanceLoan.update({
      where: { id: loan.id },
      data: { approver1Id: approverId, approver1At: new Date() },
    });
  } else {
    if (loan.approver1Id === approverId) {
      return res.status(400).json({ message: "A second, different approver is required for this amount" });
    }
    await prisma.salaryAdvanceLoan.update({
      where: { id: loan.id },
      data: { status: "ACTIVE", approver2Id: approverId, approver2At: new Date() },
    });
    await generateLoanInstallments(loan.id);
  }

  const full = await prisma.salaryAdvanceLoan.findUnique({
    where: { id: loan.id },
    include: {
      employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } },
      installments: { orderBy: { installmentNo: "asc" } },
    },
  });
  return res.json({ ...full, outstandingAmount: Math.max(0, (full?.totalAmount ?? 0) - (full?.recoveredAmount ?? 0)) });
});

adjustmentsRouter.post("/loans/:id/reject", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = rejectSchema.parse(req.body);
  const loan = await prisma.salaryAdvanceLoan.findUnique({ where: { id: String(req.params.id) } });
  if (!loan) return res.status(404).json({ message: "Loan/advance not found" });
  if (loan.status !== "PENDING_APPROVAL") {
    return res.status(400).json({ message: "Only pending loans/advances can be rejected" });
  }
  const updated = await prisma.salaryAdvanceLoan.update({
    where: { id: loan.id },
    data: { status: "REJECTED", rejectedById: req.auth?.employeeId, rejectedAt: new Date(), rejectReason: payload.reason },
    include: { employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } } },
  });
  return res.json(updated);
});

export async function getOutstandingLoanTotal(employeeId: string) {
  const loans = await prisma.salaryAdvanceLoan.findMany({
    where: { employeeId, status: "ACTIVE" },
  });
  return loans.reduce((sum, loan) => sum + Math.max(0, loan.totalAmount - loan.recoveredAmount), 0);
}

export async function closeOutstandingLoansOnExit(employeeId: string) {
  await prisma.salaryAdvanceLoan.updateMany({
    where: { employeeId, status: "ACTIVE" },
    data: { status: "CLOSED", closedAt: new Date() },
  });
}
