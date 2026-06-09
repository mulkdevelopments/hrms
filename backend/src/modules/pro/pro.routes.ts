import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import {
  createOnboardingProTask,
  ensureOnboardingProTasks,
  generateProRef,
  NEW_VISA_ONBOARDING_FLOW,
  ONBOARDING_INITIAL_STATUS,
} from "../../lib/pro-tasks.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";

export const proRouter = Router();
proRouter.use(authMiddleware);

const PRO_ROLES: ("SUPER_ADMIN" | "HR" | "HR_OFFICER" | "PRO")[] = ["SUPER_ADMIN", "HR", "HR_OFFICER", "PRO"];
const EXPIRY_ALERT_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const DOC_TYPES = [
  "PASSPORT",
  "PHOTO",
  "RESIDENCE_VISA",
  "EMIRATES_ID",
  "LABOUR_PERMIT",
  "HEALTH_CARD",
  "MEDICAL_FITNESS",
  "LABOUR_CONTRACT",
  "ESTABLISHMENT_CARD",
  "TRADE_LICENSE",
] as const;

// Ordered workflow stages per task type.
const TASK_FLOWS: Record<string, string[]> = {
  NEW_VISA: [...NEW_VISA_ONBOARDING_FLOW],
  RENEWAL: [
    "RENEWAL_INITIATED",
    "DOCUMENTS_VALIDATED",
    "SUBMITTED",
    "MEDICAL_IN_PROGRESS",
    "COMPLETED",
  ],
  CANCELLATION: [
    "CANCELLATION_PENDING",
    "PASSPORT_COLLECTED",
    "CANCELLATION_SUBMITTED",
    "CANCELLED",
    "PASSPORT_RETURNED",
  ],
};

function canManage(role?: string) {
  return Boolean(role && (PRO_ROLES as readonly string[]).includes(role));
}

function canViewAllDocuments(role?: string) {
  return canManage(role) || role === "CEO";
}

function docStatus(expiryDate: Date | null) {
  if (!expiryDate) return "VALID";
  const now = Date.now();
  const diffDays = Math.floor((expiryDate.getTime() - now) / DAY_MS);
  if (diffDays < 0) return "EXPIRED";
  if (diffDays <= EXPIRY_ALERT_DAYS) return "EXPIRING";
  return "VALID";
}

function withDocStatus<T extends { expiryDate: Date | null }>(doc: T) {
  return { ...doc, computedStatus: docStatus(doc.expiryDate) };
}

const docInclude = {
  employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } },
} satisfies Prisma.EmployeeDocumentInclude;

const documentSchema = z.object({
  employeeId: z.string(),
  docType: z.enum(DOC_TYPES),
  documentNumber: z.string().optional(),
  issuingAuthority: z.string().optional(),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  fileUrl: z.string().min(1, "Document file is required"),
  notes: z.string().optional(),
});
const documentUpdateSchema = documentSchema.partial().omit({ employeeId: true, fileUrl: true }).extend({
  fileUrl: z.string().min(1).optional(),
});

const taskSchema = z.object({
  employeeId: z.string(),
  taskType: z.enum(["NEW_VISA", "RENEWAL", "CANCELLATION"]),
  documentType: z.enum(DOC_TYPES).optional(),
  notes: z.string().optional(),
});
const advanceSchema = z.object({
  governmentRef: z.string().optional(),
  feeAmount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});
const setStatusSchema = z.object({
  status: z.string().min(1),
  governmentRef: z.string().optional(),
  feeAmount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

function scopeDocWhere(auth: AuthRequest["auth"]): Prisma.EmployeeDocumentWhereInput {
  if (canViewAllDocuments(auth?.role)) return {};
  if (auth?.role === "MANAGER") return { employee: { managerId: auth.employeeId } };
  return { employeeId: auth?.employeeId ?? "__none__" };
}

// ───────── Documents ─────────

proRouter.get("/doc-types", (_req, res) => res.json({ docTypes: DOC_TYPES, alertDays: EXPIRY_ALERT_DAYS }));

proRouter.get("/documents", async (req: AuthRequest, res) => {
  const where = scopeDocWhere(req.auth);
  if (req.query.employeeId) {
    const employeeId = String(req.query.employeeId);
    if (canViewAllDocuments(req.auth?.role)) {
      where.employeeId = employeeId;
    } else if (employeeId === req.auth?.employeeId) {
      where.employeeId = employeeId;
    }
  }
  const docs = await prisma.employeeDocument.findMany({ where, include: docInclude, orderBy: { expiryDate: "asc" } });
  return res.json(docs.map(withDocStatus));
});

proRouter.get("/documents/expiring", async (req: AuthRequest, res) => {
  const days = Number(req.query.days ?? EXPIRY_ALERT_DAYS);
  const cutoff = new Date(Date.now() + days * DAY_MS);
  const where = scopeDocWhere(req.auth);
  where.expiryDate = { lte: cutoff };
  const docs = await prisma.employeeDocument.findMany({ where, include: docInclude, orderBy: { expiryDate: "asc" } });
  return res.json(docs.map(withDocStatus));
});

proRouter.post("/documents", requireRoles(...PRO_ROLES), async (req, res) => {
  const payload = documentSchema.parse(req.body);
  const doc = await prisma.employeeDocument.create({
    data: {
      employeeId: payload.employeeId,
      docType: payload.docType,
      documentNumber: payload.documentNumber,
      issuingAuthority: payload.issuingAuthority,
      issueDate: payload.issueDate ? new Date(payload.issueDate) : null,
      expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : null,
      fileUrl: payload.fileUrl,
      notes: payload.notes,
    },
    include: docInclude,
  });
  return res.status(201).json(withDocStatus(doc));
});

proRouter.put("/documents/:id", requireRoles(...PRO_ROLES), async (req, res) => {
  const payload = documentUpdateSchema.parse(req.body);
  const existing = await prisma.employeeDocument.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) return res.status(404).json({ message: "Document not found" });
  const doc = await prisma.employeeDocument.update({
    where: { id: existing.id },
    data: {
      docType: payload.docType,
      documentNumber: payload.documentNumber,
      issuingAuthority: payload.issuingAuthority,
      issueDate: payload.issueDate ? new Date(payload.issueDate) : undefined,
      expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : undefined,
      fileUrl: payload.fileUrl,
      notes: payload.notes,
    },
    include: docInclude,
  });
  return res.json(withDocStatus(doc));
});

proRouter.delete("/documents/:id", requireRoles(...PRO_ROLES), async (req, res) => {
  const existing = await prisma.employeeDocument.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) return res.status(404).json({ message: "Document not found" });
  await prisma.employeeDocument.delete({ where: { id: existing.id } });
  return res.status(204).send();
});

// ───────── PRO Tasks ─────────

function scopeTaskWhere(auth: AuthRequest["auth"]): Prisma.ProTaskWhereInput {
  if (canManage(auth?.role)) return {};
  if (auth?.role === "MANAGER") return { employee: { managerId: auth.employeeId } };
  return { employeeId: auth?.employeeId ?? "__none__" };
}

const taskInclude = {
  employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } },
} satisfies Prisma.ProTaskInclude;

proRouter.get("/tasks", async (req: AuthRequest, res) => {
  await ensureOnboardingProTasks();
  const where = scopeTaskWhere(req.auth);
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.taskType) where.taskType = String(req.query.taskType);
  const tasks = await prisma.proTask.findMany({ where, include: taskInclude, orderBy: { createdAt: "desc" } });
  return res.json(tasks.map((task) => ({ ...task, flow: TASK_FLOWS[task.taskType] ?? [] })));
});

proRouter.post("/tasks", requireRoles(...PRO_ROLES), async (req: AuthRequest, res) => {
  const payload = taskSchema.parse(req.body);
  const employee = await prisma.employee.findUnique({ where: { id: payload.employeeId }, select: { id: true } });
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  const flow = TASK_FLOWS[payload.taskType];
  const initialStatus = payload.taskType === "NEW_VISA" ? ONBOARDING_INITIAL_STATUS : flow[0];
  const task = await prisma.proTask.create({
    data: {
      referenceNumber: await generateProRef(),
      employeeId: payload.employeeId,
      taskType: payload.taskType,
      documentType: payload.documentType,
      status: initialStatus,
      notes: payload.notes,
      createdById: req.auth?.employeeId,
    },
    include: taskInclude,
  });
  return res.status(201).json({ ...task, flow });
});

proRouter.patch("/tasks/:id/status", requireRoles(...PRO_ROLES), async (req, res) => {
  const payload = setStatusSchema.parse(req.body);
  const task = await prisma.proTask.findUnique({ where: { id: String(req.params.id) } });
  if (!task) return res.status(404).json({ message: "Task not found" });
  if (task.status === "ABORTED") {
    return res.status(400).json({ message: "Aborted tasks cannot be updated" });
  }

  const flow = TASK_FLOWS[task.taskType] ?? [];
  if (!flow.includes(payload.status)) {
    return res.status(400).json({ message: "Invalid stage for this task type" });
  }

  const finalStage = flow[flow.length - 1];
  const isFinal = payload.status === finalStage;

  const updated = await prisma.proTask.update({
    where: { id: task.id },
    data: {
      status: payload.status,
      governmentRef: payload.governmentRef ?? task.governmentRef,
      feeAmount: payload.feeAmount ?? task.feeAmount,
      notes: payload.notes ?? task.notes,
      submittedAt: payload.status.includes("SUBMITTED")
        ? (task.submittedAt ?? new Date())
        : task.submittedAt,
      completedAt: isFinal ? new Date() : null,
    },
    include: taskInclude,
  });
  return res.json({ ...updated, flow });
});

proRouter.post("/tasks/:id/advance", requireRoles(...PRO_ROLES), async (req, res) => {
  const payload = advanceSchema.parse(req.body);
  const task = await prisma.proTask.findUnique({ where: { id: String(req.params.id) } });
  if (!task) return res.status(404).json({ message: "Task not found" });
  const flow = TASK_FLOWS[task.taskType] ?? [];
  const currentIndex = flow.indexOf(task.status);
  if (currentIndex < 0 || currentIndex >= flow.length - 1) {
    return res.status(400).json({ message: "Task is already at its final stage" });
  }
  const nextStatus = flow[currentIndex + 1];
  const isFinal = currentIndex + 1 === flow.length - 1;
  const updated = await prisma.proTask.update({
    where: { id: task.id },
    data: {
      status: nextStatus,
      governmentRef: payload.governmentRef ?? task.governmentRef,
      feeAmount: payload.feeAmount ?? task.feeAmount,
      notes: payload.notes ?? task.notes,
      submittedAt: task.submittedAt ?? (nextStatus.includes("SUBMITTED") ? new Date() : task.submittedAt),
      completedAt: isFinal ? new Date() : task.completedAt,
    },
    include: taskInclude,
  });
  return res.json({ ...updated, flow });
});

proRouter.post("/tasks/:id/cancel", requireRoles(...PRO_ROLES), async (req, res) => {
  const task = await prisma.proTask.findUnique({ where: { id: String(req.params.id) } });
  if (!task) return res.status(404).json({ message: "Task not found" });
  const updated = await prisma.proTask.update({
    where: { id: task.id },
    data: { status: "ABORTED", completedAt: new Date() },
    include: taskInclude,
  });
  return res.json({ ...updated, flow: TASK_FLOWS[task.taskType] ?? [] });
});

export { createOnboardingProTask, ensureOnboardingProTasks } from "../../lib/pro-tasks.js";

export async function autoCreateRenewalTasks() {
  const cutoff = new Date(Date.now() + EXPIRY_ALERT_DAYS * DAY_MS);
  const renewableTypes = ["RESIDENCE_VISA", "LABOUR_PERMIT", "EMIRATES_ID", "HEALTH_CARD"];
  const expiringDocs = await prisma.employeeDocument.findMany({
    where: { docType: { in: renewableTypes }, expiryDate: { not: null, lte: cutoff, gte: new Date() } },
    include: { employee: { select: { status: true } } },
  });
  let created = 0;
  for (const doc of expiringDocs) {
    if (doc.employee?.status === "RESIGNED" || doc.employee?.status === "TERMINATED") continue;
    const openTask = await prisma.proTask.findFirst({
      where: {
        employeeId: doc.employeeId,
        taskType: "RENEWAL",
        documentType: doc.docType,
        status: { notIn: ["COMPLETED", "ABORTED"] },
      },
    });
    if (openTask) continue;
    await prisma.proTask.create({
      data: {
        referenceNumber: await generateProRef(),
        employeeId: doc.employeeId,
        taskType: "RENEWAL",
        documentType: doc.docType,
        status: TASK_FLOWS.RENEWAL[0],
        documentId: doc.id,
        autoCreated: true,
        notes: `Auto-created: ${doc.docType} expiring on ${doc.expiryDate?.toISOString().slice(0, 10)}`,
      },
    });
    created += 1;
  }
  return created;
}

// Auto-create a visa cancellation task when an employee exits.
export async function createCancellationTaskForExit(employeeId: string, exitRecordId: string) {
  const openTask = await prisma.proTask.findFirst({
    where: { employeeId, taskType: "CANCELLATION", status: { notIn: ["CANCELLED", "PASSPORT_RETURNED", "ABORTED"] } },
  });
  if (openTask) return openTask;
  return prisma.proTask.create({
    data: {
      referenceNumber: await generateProRef(),
      employeeId,
      taskType: "CANCELLATION",
      documentType: "RESIDENCE_VISA",
      status: TASK_FLOWS.CANCELLATION[0],
      exitRecordId,
      autoCreated: true,
      notes: "Auto-created on employee exit approval",
    },
  });
}
