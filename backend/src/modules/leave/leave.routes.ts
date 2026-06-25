import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import {
  LeaveStatus,
  employeeName,
  resolveLeaveL1Approver,
  validateActingApproverCandidate,
  findManagersOnLeaveWithActingApprover,
} from "../../lib/leave-delegation.js";
import {
  ensureEmployeeLeaveBalances,
  computeInclusiveLeaveDays,
  getEmployeeLeaveEntitlements,
  getLeaveTypeEntitlement,
  recordLeaveUsageOnApproval,
  validateLeaveBalance,
} from "../../lib/leave-policy.js";
import { getLeavePolicySettings, getAirTicketSettings } from "../../lib/master-data.js";
import {
  createAirTicketAdjustment,
  evaluateAirTicketEligibility,
} from "../../lib/leave-air-ticket.js";
import { ACTING_VOID_VALUE, canVoidActingColleague } from "../../lib/roles.js";
import { isTeamLeaveManagerEmployee, allowsDirectReportsLeaveAccess } from "../../lib/line-manager-eligibility.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";

const leaveTypeSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2),
  yearlyAllocation: z.number().int().min(0),
  maxCarryForward: z.number().int().min(0).max(60),
  requiresAttachment: z.boolean().default(false),
  paidLeave: z.boolean().default(true),
  balanceMode: z.enum(["MATURITY", "YEARLY", "NONE"]).default("YEARLY"),
  payRate: z.enum(["FULL", "HALF", "NONE"]).default("FULL"),
});

const listRequestsQuerySchema = z.object({
  mine: z.enum(["true", "false"]).optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  employeeId: z.string().optional(),
});

function parseQueryDateStart(value: string) {
  return new Date(`${value}T00:00:00.000`);
}

function parseQueryDateEnd(value: string) {
  return new Date(`${value}T23:59:59.999`);
}

const applySchema = z.object({
  employeeId: z.string(),
  leaveTypeId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  days: z.number().positive().max(90),
  reason: z.string().trim().optional().default(""),
  actingApproverId: z.string().optional(),
  actingVoid: z.boolean().optional(),
  rejoiningDate: z.string().datetime().optional(),
  statusAsOn: z.string().optional(),
  leaveBalanceSnapshot: z.number().optional(),
  currentLeaveBalanceSnapshot: z.number().optional(),
  extendedDays: z.number().nonnegative().optional(),
  remark: z.string().optional(),
});

const trackerUpdateSchema = z.object({
  rejoiningDate: z.string().datetime().nullable().optional(),
  statusAsOn: z.string().optional(),
  leaveBalanceSnapshot: z.number().nullable().optional(),
  currentLeaveBalanceSnapshot: z.number().nullable().optional(),
  extendedDays: z.number().nonnegative().optional(),
  remark: z.string().optional(),
});

const rejectSchema = z.object({
  reason: z.string().min(3),
});

const employeeApproverSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  department: true,
  designation: true,
  role: true,
} as const;

const leaveInclude = {
  employee: {
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      department: true,
      role: true,
      managerId: true,
      nationality: true,
    },
  },
  leaveType: true,
  l1ApprovedBy: { select: { firstName: true, lastName: true, employeeCode: true } },
  l2ApprovedBy: { select: { firstName: true, lastName: true, employeeCode: true } },
  actingApprover: { select: { firstName: true, lastName: true, employeeCode: true } },
} as const;

export const leaveRouter = Router();
leaveRouter.use(authMiddleware);

function isHrOrAdmin(role?: string) {
  return role === "SUPER_ADMIN" || role === "HR" || role === "HR_OFFICER";
}

function isDeptManager(role?: string) {
  return role === "MANAGER";
}

async function hasActiveDirectReports(managerId: string) {
  const count = await prisma.employee.count({
    where: {
      managerId,
      status: { in: ["ACTIVE", "PROBATION", "ON_LEAVE"] },
    },
  });
  return count > 0;
}

async function canAccessTeamLeave(viewer: {
  role?: string | null;
  designation?: string | null;
  status?: string | null;
}, employeeId: string) {
  if (isTeamLeaveManagerEmployee(viewer)) return true;
  if (!allowsDirectReportsLeaveAccess()) return false;
  return hasActiveDirectReports(employeeId);
}

function canViewAirTicketDetails(auth: AuthRequest["auth"], requestEmployeeId: string) {
  if (!auth) return false;
  if (isHrOrAdmin(auth.role)) return true;
  const viewerId = auth.employeeId ?? auth.userId;
  return viewerId === requestEmployeeId;
}

function stripAirTicketFields<T extends Record<string, unknown>>(request: T) {
  const { airTicketEligible, airTicketFare, payrollAdjustmentId, ...safe } = request;
  return safe;
}

async function resolveLeaveActorEmployee(req: AuthRequest, employeeId: string) {
  const auth = req.auth;
  if (!auth?.employeeId) return { error: "Employee identity missing for this account", status: 400 as const };
  if (isHrOrAdmin(auth.role)) return { employeeId };
  if (auth.employeeId === employeeId) return { employeeId };

  const target = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { department: true, managerId: true },
  });
  if (!target) {
    return { error: "Employee not found", status: 404 as const };
  }
  if (target.managerId === auth.employeeId) {
    return { employeeId };
  }

  if (isDeptManager(auth.role)) {
    const manager = await prisma.employee.findUnique({
      where: { id: auth.employeeId },
      select: { department: true },
    });
    if (manager?.department && target.department && manager.department === target.department) {
      return { employeeId };
    }
  }

  return { error: "You do not have access to this employee leave data", status: 403 as const };
}

async function enrichLeaveRequest<T extends Prisma.LeaveRequestGetPayload<{ include: typeof leaveInclude }>>(
  request: T,
  auth?: AuthRequest["auth"],
  airTicketSettings?: Awaited<ReturnType<typeof getAirTicketSettings>>,
) {
  const authEmployeeId = auth?.employeeId;
  const canViewAirTicket = canViewAirTicketDetails(auth, request.employeeId);
  const approverInfo = request.employee
    ? await resolveLeaveL1Approver({
        id: request.employeeId,
        managerId: request.employee.managerId,
        department: request.employee.department,
      })
    : null;

  const airTicketStatuses = [
    LeaveStatus.PENDING_L1,
    LeaveStatus.PENDING_ACTING,
    LeaveStatus.PENDING_L2,
    LeaveStatus.APPROVED,
  ] as string[];
  const airTicketPreview =
    canViewAirTicket
    && airTicketSettings
    && airTicketStatuses.includes(request.status)
      ? evaluateAirTicketEligibility({
          settings: airTicketSettings,
          nationality: request.employee?.nationality,
          role: request.employee?.role,
          leaveTypeCode: request.leaveType?.code,
          days: request.days,
        })
      : null;

  const base = canViewAirTicket ? request : stripAirTicketFields(request);

  return {
    ...base,
    lineManager: approverInfo?.lineManager
      ? {
          id: approverInfo.lineManager.id,
          name: employeeName(approverInfo.lineManager),
          employeeCode: approverInfo.lineManager.employeeCode,
        }
      : null,
    assignedL1Approver: approverInfo?.assignedApprover
      ? {
          id: approverInfo.assignedApprover.id,
          name: employeeName(approverInfo.assignedApprover),
          employeeCode: approverInfo.assignedApprover.employeeCode,
          isActing: approverInfo.isActing,
        }
      : null,
    managerOnLeave: approverInfo?.managerOnLeave ?? false,
    canAcceptActing:
      request.status === LeaveStatus.PENDING_ACTING && request.actingApproverId === authEmployeeId,
    canRejectActing:
      request.status === LeaveStatus.PENDING_ACTING && request.actingApproverId === authEmployeeId,
    canApproveL1:
      request.status === LeaveStatus.PENDING_L1 && approverInfo?.approverId === authEmployeeId,
    ...(canViewAirTicket && airTicketPreview ? { airTicketPreview } : {}),
  };
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

leaveRouter.get("/acting-candidates/:employeeId", async (req: AuthRequest, res) => {
  const access = await resolveLeaveActorEmployee(req, String(req.params.employeeId));
  if ("error" in access && access.error) {
    return res.status(access.status ?? 403).json({ message: access.error });
  }

  const applicant = await prisma.employee.findUnique({
    where: { id: access.employeeId },
    select: { id: true, department: true, role: true },
  });
  if (!applicant) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const candidates = await prisma.employee.findMany({
    where: {
      id: { not: applicant.id },
      department: applicant.department,
      accessEnabled: true,
      status: { in: ["ACTIVE", "PROBATION"] },
    },
    select: employeeApproverSelect,
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return res.json(
    candidates.map((candidate) => ({
      id: candidate.id,
      name: employeeName(candidate),
      employeeCode: candidate.employeeCode,
      designation: candidate.designation,
      role: candidate.role,
    })),
  );
});

leaveRouter.get("/air-ticket-preview", async (req: AuthRequest, res) => {
  const query = z.object({
    employeeId: z.string(),
    leaveTypeId: z.string(),
    days: z.coerce.number().positive(),
  }).parse(req.query);

  const auth = req.auth;
  if (!auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!canViewAirTicketDetails(auth, query.employeeId)) {
    return res.status(403).json({ message: "You do not have access to air ticket details for this employee" });
  }

  const [employee, leaveType, settings] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: query.employeeId },
      select: { nationality: true, role: true },
    }),
    prisma.leaveType.findUnique({
      where: { id: query.leaveTypeId },
      select: { code: true, name: true },
    }),
    getAirTicketSettings(),
  ]);

  if (!employee) return res.status(404).json({ message: "Employee not found" });
  if (!leaveType) return res.status(404).json({ message: "Leave type not found" });

  const evaluation = evaluateAirTicketEligibility({
    settings,
    nationality: employee.nationality,
    role: employee.role,
    leaveTypeCode: leaveType.code,
    days: query.days,
  });

  return res.json({
    ...evaluation,
    leaveType: leaveType.name,
    settings: { minDays: settings.minDays, enabled: settings.enabled },
  });
});

leaveRouter.get("/requests", async (req: AuthRequest, res) => {
  const parsedQuery = listRequestsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ message: "Invalid query parameters", issues: parsedQuery.error.issues });
  }

  const { mine, fromDate, toDate, employeeId } = parsedQuery.data;
  const auth = req.auth;
  const where: Prisma.LeaveRequestWhereInput = {};
  const isHistoryQuery = Boolean(fromDate || toDate || employeeId);

  if (employeeId) {
    const access = await resolveLeaveActorEmployee(req, employeeId);
    if ("error" in access && access.error) {
      return res.status(access.status ?? 403).json({ message: access.error });
    }
    where.employeeId = employeeId;
  } else if (mine && auth?.employeeId) {
    where.employeeId = auth.employeeId;
  } else if (isHistoryQuery && auth?.employeeId && !isHrOrAdmin(auth?.role)) {
    where.employeeId = auth.employeeId;
  } else if (!isHrOrAdmin(auth?.role)) {
    if (!auth?.employeeId) {
      return res.status(400).json({ message: "Employee identity missing for this account" });
    }

    const viewer = await prisma.employee.findUnique({
      where: { id: auth.employeeId },
      select: { role: true, designation: true, status: true, department: true },
    });
    if (!viewer) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    if (isDeptManager(auth.role)) {
      where.OR = [
        { employee: { department: viewer.department } },
        { actingApproverId: auth.employeeId },
      ];
    } else if (await canAccessTeamLeave(viewer, auth.employeeId)) {
      where.OR = [
        { employee: { managerId: auth.employeeId } },
        { actingApproverId: auth.employeeId },
        { employeeId: auth.employeeId },
      ];
    } else {
      const onLeaveManagerIds = await findManagersOnLeaveWithActingApprover(auth.employeeId);
      where.OR = [
        { employeeId: auth.employeeId },
        { actingApproverId: auth.employeeId },
        ...(onLeaveManagerIds.length
          ? [{ status: LeaveStatus.PENDING_L1, employee: { managerId: { in: onLeaveManagerIds } } }]
          : []),
      ];
    }
  }

  if (fromDate || toDate) {
    const overlap: Prisma.LeaveRequestWhereInput[] = [];
    if (toDate) overlap.push({ startDate: { lte: parseQueryDateEnd(toDate) } });
    if (fromDate) overlap.push({ endDate: { gte: parseQueryDateStart(fromDate) } });
    where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), ...overlap];
  }

  const requests = await prisma.leaveRequest.findMany({
    where,
    include: leaveInclude,
    orderBy: { createdAt: "desc" },
  });

  const airTicketSettings = await getAirTicketSettings();
  const enriched = await Promise.all(
    requests.map((request) => enrichLeaveRequest(request, auth, airTicketSettings)),
  );
  return res.json(enriched);
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

  const [applicant, leaveType] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: payload.employeeId },
      select: { id: true, role: true, managerId: true, dateOfJoining: true },
    }),
    prisma.leaveType.findUnique({
      where: { id: payload.leaveTypeId },
    }),
  ]);
  if (!applicant) {
    return res.status(404).json({ message: "Employee profile not found for leave request" });
  }
  if (!leaveType || !leaveType.active) {
    return res.status(404).json({ message: "Leave type not found" });
  }

  const requestedStart = new Date(payload.startDate);
  const requestedEnd = new Date(payload.endDate);
  if (requestedEnd < requestedStart) {
    return res.status(400).json({ message: "End date cannot be before start date" });
  }

  const requestedDays = computeInclusiveLeaveDays(requestedStart, requestedEnd);
  if (requestedDays <= 0) {
    return res.status(400).json({ message: "Invalid leave date range" });
  }
  if (requestedDays > 90) {
    return res.status(400).json({ message: "Leave cannot exceed 90 days per request" });
  }

  const overlappingLeave = await prisma.leaveRequest.findFirst({
    where: {
      employeeId: applicant.id,
      status: {
        in: [LeaveStatus.PENDING_L1, LeaveStatus.PENDING_ACTING, LeaveStatus.PENDING_L2, LeaveStatus.APPROVED],
      },
      startDate: { lte: requestedEnd },
      endDate: { gte: requestedStart },
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });
  if (overlappingLeave) {
    return res.status(400).json({
      message: "A leave request already exists for this time period",
      overlap: {
        id: overlappingLeave.id,
        status: overlappingLeave.status,
        startDate: overlappingLeave.startDate,
        endDate: overlappingLeave.endDate,
      },
    });
  }

  const balanceCheck = await validateLeaveBalance(
    applicant.id,
    leaveType,
    requestedDays,
    applicant.dateOfJoining,
  );
  if (!balanceCheck.ok) {
    return res.status(400).json({
      message: balanceCheck.message,
      entitlement: balanceCheck.entitlement,
    });
  }

  const wantsVoid =
    payload.actingVoid === true
    || payload.actingApproverId === ACTING_VOID_VALUE;

  if (wantsVoid && !canVoidActingColleague(applicant.role)) {
    return res.status(400).json({
      message: "Only Labour and Staff can skip acting colleague assignment",
    });
  }

  if (!wantsVoid && !applicant.managerId && applicant.role !== "MANAGER") {
    return res.status(400).json({ message: "Line manager is not assigned for this employee" });
  }

  let actingApproverId: string | null = null;
  let initialStatus: (typeof LeaveStatus)[keyof typeof LeaveStatus] = LeaveStatus.PENDING_L1;

  if (wantsVoid) {
    initialStatus = LeaveStatus.PENDING_L1;
  } else {
    if (!payload.actingApproverId?.trim()) {
      return res.status(400).json({
        message: "You must assign an acting colleague before applying for leave",
      });
    }
    const validation = await validateActingApproverCandidate(applicant.id, payload.actingApproverId);
    if ("error" in validation && validation.error) {
      return res.status(400).json({ message: validation.error });
    }
    actingApproverId = payload.actingApproverId;
    initialStatus = LeaveStatus.PENDING_ACTING;
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId: payload.employeeId,
      leaveTypeId: payload.leaveTypeId,
      startDate: requestedStart,
      endDate: requestedEnd,
      days: requestedDays,
      reason: payload.reason || "",
      status: initialStatus,
      actingApproverId,
      rejoiningDate: payload.rejoiningDate ? new Date(payload.rejoiningDate) : undefined,
      statusAsOn: payload.statusAsOn,
      leaveBalanceSnapshot: payload.leaveBalanceSnapshot,
      currentLeaveBalanceSnapshot: payload.currentLeaveBalanceSnapshot,
      extendedDays: payload.extendedDays ?? 0,
      remark: payload.remark,
    },
    include: leaveInclude,
  });

  const enriched = await enrichLeaveRequest(leave, auth);
  return res.status(201).json(enriched);
});

leaveRouter.patch("/requests/:id/tracker", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = trackerUpdateSchema.parse(req.body);
  const requestId = String(req.params.id);
  const existing = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
  if (!existing) {
    return res.status(404).json({ message: "Leave request not found" });
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      rejoiningDate: payload.rejoiningDate === null
        ? null
        : payload.rejoiningDate
          ? new Date(payload.rejoiningDate)
          : undefined,
      statusAsOn: payload.statusAsOn,
      leaveBalanceSnapshot: payload.leaveBalanceSnapshot === null ? null : payload.leaveBalanceSnapshot,
      currentLeaveBalanceSnapshot: payload.currentLeaveBalanceSnapshot === null
        ? null
        : payload.currentLeaveBalanceSnapshot,
      extendedDays: payload.extendedDays,
      remark: payload.remark,
    },
    include: leaveInclude,
  });

  const auth = req.auth;
  const enriched = await enrichLeaveRequest(updated, auth);
  return res.json(enriched);
});

leaveRouter.get("/entitlements/:employeeId", async (req: AuthRequest, res) => {
  const targetEmployeeId = String(req.params.employeeId);
  const access = await resolveLeaveActorEmployee(req, targetEmployeeId);
  if ("error" in access && access.error) {
    return res.status(access.status ?? 403).json({ message: access.error });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: access.employeeId },
    select: { id: true, dateOfJoining: true },
  });
  if (!employee) {
    return res.status(404).json({ message: "Employee profile not found" });
  }

  const entitlements = await getEmployeeLeaveEntitlements(employee.id, employee.dateOfJoining);
  return res.json(entitlements);
});

leaveRouter.get("/maturity/:employeeId", async (req: AuthRequest, res) => {
  const targetEmployeeId = String(req.params.employeeId);
  const access = await resolveLeaveActorEmployee(req, targetEmployeeId);
  if ("error" in access && access.error) {
    return res.status(access.status ?? 403).json({ message: access.error });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: access.employeeId },
    select: { id: true, dateOfJoining: true },
  });
  if (!employee) {
    return res.status(404).json({ message: "Employee profile not found" });
  }

  const annualType = await prisma.leaveType.findFirst({
    where: { code: "AL", active: true },
  });
  if (!annualType) {
    return res.status(404).json({ message: "Annual leave type is not configured" });
  }

  const entitlement = await getLeaveTypeEntitlement(employee.id, annualType, employee.dateOfJoining);
  const policySettings = await getLeavePolicySettings();
  const now = new Date();

  return res.json({
    employeeId: employee.id,
    asOf: now.toISOString(),
    daysWorked: entitlement.daysWorked ?? 0,
    maturedDays: entitlement.entitledDays ?? 0,
    usedDays: entitlement.usedDays,
    availableDays: entitlement.availableDays ?? 0,
    dailyRate: policySettings.maturityDailyRate,
    yearlyCap: policySettings.maturityMaxCap,
    yearlyPaidLeave: policySettings.annualYearlyDays,
  });
});

leaveRouter.post("/requests/:id/acting-accept", async (req: AuthRequest, res) => {
  const requestId = String(req.params.id);
  const employeeId = req.auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Acting acceptance requires employee identity" });
  }

  const leave = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: leaveInclude,
  });
  if (!leave) {
    return res.status(404).json({ message: "Leave request not found" });
  }
  if (leave.status !== LeaveStatus.PENDING_ACTING) {
    return res.status(400).json({ message: "Only requests awaiting acting acceptance can be accepted" });
  }
  if (leave.actingApproverId !== employeeId) {
    return res.status(403).json({ message: "Only the assigned acting manager can accept this delegation" });
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: leave.employee?.role === "MANAGER" ? LeaveStatus.PENDING_L2 : LeaveStatus.PENDING_L1,
      actingAcceptedAt: new Date(),
    },
    include: leaveInclude,
  });

  const enriched = await enrichLeaveRequest(updated, req.auth);
  return res.json(enriched);
});

leaveRouter.post("/requests/:id/acting-reject", async (req: AuthRequest, res) => {
  const requestId = String(req.params.id);
  const payload = rejectSchema.parse(req.body);
  const employeeId = req.auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Acting rejection requires employee identity" });
  }

  const leave = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: leaveInclude,
  });
  if (!leave) {
    return res.status(404).json({ message: "Leave request not found" });
  }
  if (leave.status !== LeaveStatus.PENDING_ACTING) {
    return res.status(400).json({ message: "Only requests awaiting acting acceptance can be rejected" });
  }
  if (leave.actingApproverId !== employeeId) {
    return res.status(403).json({ message: "Only the assigned acting manager can reject this delegation" });
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: LeaveStatus.REJECTED,
      actingRejectedAt: new Date(),
      actingRejectReason: payload.reason,
      rejectReason: payload.reason,
      rejectedAt: new Date(),
    },
    include: leaveInclude,
  });

  const enriched = await enrichLeaveRequest(updated, req.auth);
  return res.json(enriched);
});

leaveRouter.post("/requests/:id/l1-approve", async (req: AuthRequest, res) => {
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
          id: true,
          managerId: true,
          department: true,
          dateOfJoining: true,
        },
      },
      leaveType: true,
    },
  });

  if (!leave) {
    return res.status(404).json({ message: "Leave request not found" });
  }
  if (leave.status !== LeaveStatus.PENDING_L1) {
    return res.status(400).json({ message: "Only PENDING_L1 requests can be approved at L1" });
  }
  if (!leave.employee) {
    return res.status(400).json({ message: "Employee profile missing for leave request" });
  }

  const approverInfo = await resolveLeaveL1Approver(leave.employee);
  if (approverInfo.approverId !== employeeId && !isHrOrAdmin(auth.role)) {
    return res.status(403).json({
      message: approverInfo.isActing
        ? "L1 approval is assigned to the acting manager while the primary manager is on leave"
        : "L1 approval allowed only for the assigned line manager",
    });
  }

  const balanceCheck = await validateLeaveBalance(
    leave.employeeId,
    leave.leaveType,
    leave.days,
    leave.employee.dateOfJoining,
  );
  if (!balanceCheck.ok) {
    return res.status(400).json({
      message: balanceCheck.message,
      entitlement: balanceCheck.entitlement,
    });
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: LeaveStatus.PENDING_L2,
      l1ApprovedById: employeeId,
    },
    include: leaveInclude,
  });

  const enriched = await enrichLeaveRequest(updated, auth);
  return res.json(enriched);
});

leaveRouter.post("/requests/:id/l2-approve", requireRoles("HR", "SUPER_ADMIN", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const requestId = String(req.params.id);
  const approverEmployeeId = req.auth?.employeeId;
  if (!approverEmployeeId) {
    return res.status(400).json({ message: "Approval requires employee identity" });
  }

  const leaveRecord = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: {
      employee: {
        select: {
          id: true,
          nationality: true,
          role: true,
          dateOfJoining: true,
        },
      },
      leaveType: true,
    },
  });
  if (!leaveRecord) {
    return res.status(404).json({ message: "Leave request not found" });
  }
  if (leaveRecord.status !== LeaveStatus.PENDING_L2) {
    return res.status(400).json({ message: "Only PENDING_L2 requests can be approved at L2" });
  }
  if (!leaveRecord.employee) {
    return res.status(400).json({ message: "Employee profile missing for leave request" });
  }

  const balanceCheck = await validateLeaveBalance(
    leaveRecord.employeeId,
    leaveRecord.leaveType,
    leaveRecord.days,
    leaveRecord.employee.dateOfJoining,
  );
  if (!balanceCheck.ok) {
    return res.status(400).json({
      message: balanceCheck.message,
      entitlement: balanceCheck.entitlement,
    });
  }

  const airTicketSettings = await getAirTicketSettings();
  const airTicketEvaluation = evaluateAirTicketEligibility({
    settings: airTicketSettings,
    nationality: leaveRecord.employee.nationality,
    role: leaveRecord.employee.role,
    leaveTypeCode: leaveRecord.leaveType.code,
    days: leaveRecord.days,
  });

  const leave = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: LeaveStatus.APPROVED,
      approvedAt: new Date(),
      l2ApprovedById: approverEmployeeId,
      airTicketEligible: airTicketEvaluation.eligible,
      airTicketFare: airTicketEvaluation.eligible ? airTicketEvaluation.fare : null,
    },
    include: { leaveType: true, employee: { select: { firstName: true, lastName: true, nationality: true, role: true } } },
  });

  await recordLeaveUsageOnApproval(leave);

  let payrollAdjustment = null;
  if (airTicketEvaluation.eligible && airTicketEvaluation.fare != null && airTicketEvaluation.country && airTicketEvaluation.roleBand) {
    payrollAdjustment = await createAirTicketAdjustment({
      employeeId: leaveRecord.employeeId,
      amount: airTicketEvaluation.fare,
      country: airTicketEvaluation.country,
      roleBand: airTicketEvaluation.roleBand,
      leaveRequestId: leave.id,
      leaveStartDate: leaveRecord.startDate,
      leaveEndDate: leaveRecord.endDate,
      createdById: approverEmployeeId,
    });
    await prisma.leaveRequest.update({
      where: { id: leave.id },
      data: { payrollAdjustmentId: payrollAdjustment.id },
    });
  }

  return res.json({
    ...leave,
    payrollAdjustmentId: payrollAdjustment?.id ?? null,
    airTicket: {
      eligible: airTicketEvaluation.eligible,
      fare: airTicketEvaluation.fare,
      country: airTicketEvaluation.country,
      roleBand: airTicketEvaluation.roleBand,
      reason: airTicketEvaluation.reason,
      adjustmentReference: payrollAdjustment?.referenceNumber ?? null,
    },
  });
});

leaveRouter.post("/requests/:id/reject", async (req: AuthRequest, res) => {
  const requestId = String(req.params.id);
  const payload = rejectSchema.parse(req.body);
  const auth = req.auth;

  const leave = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: {
      employee: {
        select: {
          id: true,
          managerId: true,
          department: true,
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

  if (leave.status === LeaveStatus.PENDING_L2) {
    if (!isHrOrAdmin(auth?.role)) {
      return res.status(403).json({ message: "Only HR can reject requests at L2" });
    }
  } else if (leave.status === LeaveStatus.PENDING_L1 && leave.employee && auth?.employeeId) {
    const approverInfo = await resolveLeaveL1Approver({
      id: leave.employeeId,
      managerId: leave.employee.managerId,
      department: leave.employee.department,
    });
    if (approverInfo.approverId !== auth.employeeId && !isHrOrAdmin(auth.role)) {
      return res.status(403).json({ message: "You can reject only leave requests assigned to you at L1" });
    }
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

leaveRouter.get("/balances/:employeeId", async (req: AuthRequest, res) => {
  const employeeId = String(req.params.employeeId);
  const access = await resolveLeaveActorEmployee(req, employeeId);
  if ("error" in access && access.error) {
    return res.status(access.status ?? 403).json({ message: access.error });
  }

  const year = Number.parseInt(String(req.query.year ?? new Date().getFullYear()), 10);
  const targetId = access.employeeId ?? employeeId;
  await ensureEmployeeLeaveBalances(targetId, year);
  const balances = await prisma.leaveBalance.findMany({
    where: {
      employeeId: targetId,
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
    prisma.leaveRequest.count({
      where: { status: { in: [LeaveStatus.PENDING_L1, LeaveStatus.PENDING_ACTING, LeaveStatus.PENDING_L2] } },
    }),
    prisma.leaveRequest.count({ where: { status: LeaveStatus.REJECTED } }),
  ]);

  return res.json({ totalRequests, approvedRequests, pendingRequests, rejectedRequests });
});
