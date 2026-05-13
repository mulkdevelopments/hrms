import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";

const LeaveStatus = {
  PENDING_L1: "PENDING_L1",
  PENDING_L2: "PENDING_L2",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

const leaveTypeSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2),
  yearlyAllocation: z.number().int().min(0),
  maxCarryForward: z.number().int().min(0).max(60),
  requiresAttachment: z.boolean().default(false),
  paidLeave: z.boolean().default(true),
});

const applySchema = z.object({
  employeeId: z.string(),
  leaveTypeId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  days: z.number().positive().max(60),
  reason: z.string().min(5),
});

const rejectSchema = z.object({
  reason: z.string().min(3),
});

export const leaveRouter = Router();
leaveRouter.use(authMiddleware);

function isHrOrAdmin(role?: string) {
  return role === "SUPER_ADMIN" || role === "HR" || role === "HR_OFFICER";
}

function isDeptManager(role?: string) {
  return role === "MANAGER";
}

leaveRouter.get("/types", async (_req, res) => {
  const types = await prisma.leaveType.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  return res.json(types);
});

leaveRouter.post("/types", requireRoles("SUPER_ADMIN", "HR"), async (req, res) => {
  const payload = leaveTypeSchema.parse(req.body);
  const created = await prisma.leaveType.create({ data: payload });
  return res.status(201).json(created);
});

leaveRouter.get("/requests", async (req: AuthRequest, res) => {
  const mine = req.query.mine === "true";
  const auth = req.auth;
  const where: Prisma.LeaveRequestWhereInput = {};

  if (mine && auth?.employeeId) {
    where.employeeId = auth.employeeId;
  } else if (!isHrOrAdmin(auth?.role)) {
    if (!auth?.employeeId) {
      return res.status(400).json({ message: "Employee identity missing for this account" });
    }
    if (isDeptManager(auth.role)) {
      const managerEmployee = await prisma.employee.findUnique({
        where: { id: auth.employeeId },
        select: { department: true },
      });
      if (!managerEmployee) {
        return res.status(404).json({ message: "Manager employee profile not found" });
      }
      where.employee = {
        department: managerEmployee.department,
      };
    } else {
      where.employeeId = auth.employeeId;
    }
  }

  const requests = await prisma.leaveRequest.findMany({
    where,
    include: {
      employee: true,
      leaveType: true,
      l1ApprovedBy: { select: { firstName: true, lastName: true, employeeCode: true } },
      l2ApprovedBy: { select: { firstName: true, lastName: true, employeeCode: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(requests);
});

leaveRouter.post("/requests", async (req: AuthRequest, res) => {
  const payload = applySchema.parse(req.body);
  const auth = req.auth;
  if (!auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const privileged = isHrOrAdmin(auth.role);
  if (!privileged && auth.employeeId !== payload.employeeId) {
    return res.status(403).json({ message: "You can only apply leave for your own employee profile" });
  }

  const applicant = await prisma.employee.findUnique({
    where: { id: payload.employeeId },
    select: { id: true, role: true, managerId: true },
  });
  if (!applicant) {
    return res.status(404).json({ message: "Employee profile not found for leave request" });
  }

  // Normal flow: employee -> manager (L1) -> HR/Admin (L2)
  // Manager self-leave skips L1 and directly moves to L2.
  const isManagerApplicant = applicant.role === "MANAGER";
  if (!isManagerApplicant && !applicant.managerId) {
    return res.status(400).json({ message: "Line manager is not assigned for this employee" });
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId: payload.employeeId,
      leaveTypeId: payload.leaveTypeId,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      days: payload.days,
      reason: payload.reason,
      status: isManagerApplicant ? LeaveStatus.PENDING_L2 : LeaveStatus.PENDING_L1,
      l1ApprovedById: isManagerApplicant ? applicant.id : null,
    },
  });

  return res.status(201).json(leave);
});

leaveRouter.post("/requests/:id/l1-approve", requireRoles("MANAGER"), async (req: AuthRequest, res) => {
  const requestId = String(req.params.id);
  const auth = req.auth;
  const employeeId = auth?.employeeId;
  if (!employeeId || !auth) {
    return res.status(400).json({ message: "Approval requires employee identity" });
  }

  const leave = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: {
      employee: {
        select: {
          managerId: true,
        },
      },
    },
  });

  if (!leave) {
    return res.status(404).json({ message: "Leave request not found" });
  }
  if (leave.status !== LeaveStatus.PENDING_L1) {
    return res.status(400).json({ message: "Only PENDING_L1 requests can be approved at L1" });
  }
  if (isDeptManager(auth.role) && leave.employee?.managerId !== employeeId) {
    return res.status(403).json({ message: "L1 approval allowed only for your team members" });
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: LeaveStatus.PENDING_L2,
      l1ApprovedById: employeeId,
    },
  });

  return res.json(updated);
});

leaveRouter.post("/requests/:id/l2-approve", requireRoles("HR", "SUPER_ADMIN", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const requestId = String(req.params.id);
  const approverEmployeeId = req.auth?.employeeId;
  if (!approverEmployeeId) {
    return res.status(400).json({ message: "Approval requires employee identity" });
  }

  const leaveRecord = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
  });
  if (!leaveRecord) {
    return res.status(404).json({ message: "Leave request not found" });
  }
  if (leaveRecord.status !== LeaveStatus.PENDING_L2) {
    return res.status(400).json({ message: "Only PENDING_L2 requests can be approved at L2" });
  }

  const leave = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: LeaveStatus.APPROVED,
      approvedAt: new Date(),
      l2ApprovedById: approverEmployeeId,
    },
    include: { leaveType: true },
  });

  const year = new Date().getFullYear();
  const balance = await prisma.leaveBalance.findUnique({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId: leave.employeeId,
        leaveTypeId: leave.leaveTypeId,
        year,
      },
    },
  });

  if (balance) {
    const used = balance.used + leave.days;
    const carryForward = Math.min(60, Math.max(0, balance.openingBalance + balance.accrued - used));

    await prisma.leaveBalance.update({
      where: { id: balance.id },
      data: {
        used,
        carryForward,
      },
    });
  }

  return res.json(leave);
});

leaveRouter.post("/requests/:id/reject", requireRoles("MANAGER", "HR", "SUPER_ADMIN", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const requestId = String(req.params.id);
  const payload = rejectSchema.parse(req.body);
  const auth = req.auth;

  const leave = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: {
      employee: {
        select: {
          managerId: true,
        },
      },
    },
  });

  if (!leave) {
    return res.status(404).json({ message: "Leave request not found" });
  }
  if (leave.status !== LeaveStatus.PENDING_L1 && leave.status !== LeaveStatus.PENDING_L2) {
    return res.status(400).json({ message: "Only pending leave requests can be rejected" });
  }

  if (auth && isDeptManager(auth.role) && leave.employee?.managerId !== auth.employeeId) {
    return res.status(403).json({ message: "You can reject only your team leave requests" });
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: LeaveStatus.REJECTED,
      rejectedAt: new Date(),
      rejectReason: payload.reason,
    },
  });

  return res.json(updated);
});

leaveRouter.get("/balances/:employeeId", async (req, res) => {
  const year = Number.parseInt(String(req.query.year ?? new Date().getFullYear()), 10);
  const balances = await prisma.leaveBalance.findMany({
    where: {
      employeeId: req.params.employeeId,
      year,
    },
    include: { leaveType: true },
  });

  return res.json(balances);
});

leaveRouter.get("/reports/summary", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (_req, res) => {
  const [totalRequests, approvedRequests, pendingRequests, rejectedRequests] = await Promise.all([
    prisma.leaveRequest.count(),
    prisma.leaveRequest.count({ where: { status: LeaveStatus.APPROVED } }),
    prisma.leaveRequest.count({ where: { status: { in: [LeaveStatus.PENDING_L1, LeaveStatus.PENDING_L2] } } }),
    prisma.leaveRequest.count({ where: { status: LeaveStatus.REJECTED } }),
  ]);

  return res.json({ totalRequests, approvedRequests, pendingRequests, rejectedRequests });
});
