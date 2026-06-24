import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { LeaveBalanceMode, LeavePayRate } from "../../lib/leave-policy.js";
import {
  ALL_VIEWS,
  getMasterDataBundle,
  invalidateMasterDataCache,
  parseTimeToMinutes,
  seedMasterData,
  updateSystemSetting,
} from "../../lib/master-data.js";
import { DEFAULT_AIR_TICKET_FARES } from "../../lib/leave-air-ticket.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";

export const masterRouter = Router();
masterRouter.use(authMiddleware);

const MASTER_ROLES = ["SUPER_ADMIN", "HR"] as const;

const attendanceSchema = z.object({
  checkInStart: z.string().regex(/^\d{2}:\d{2}$/),
  checkInEnd: z.string().regex(/^\d{2}:\d{2}$/),
  autoCheckOut: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().min(3).max(64),
});

const leavePolicySchema = z.object({
  annualYearlyDays: z.number().int().min(1).max(365),
  maturityMaxCap: z.number().int().min(1).max(365),
});

const airTicketFareSchema = z.object({
  country: z.string().min(2),
  manager: z.number().nonnegative(),
  staff: z.number().nonnegative(),
  labour: z.number().nonnegative(),
});

const airTicketSchema = z.object({
  enabled: z.boolean(),
  minDays: z.number().int().min(1).max(90),
  eligibleLeaveCodes: z.array(z.string().min(1)).min(1),
  fares: z.array(airTicketFareSchema).min(1),
});

const leaveTypeSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(8).regex(/^[A-Z0-9_]+$/),
  yearlyAllocation: z.number().nonnegative(),
  maxCarryForward: z.number().nonnegative(),
  requiresAttachment: z.boolean(),
  paidLeave: z.boolean(),
  balanceMode: z.enum([LeaveBalanceMode.MATURITY, LeaveBalanceMode.YEARLY, LeaveBalanceMode.NONE]),
  payRate: z.enum([LeavePayRate.FULL, LeavePayRate.HALF, LeavePayRate.NONE]),
  active: z.boolean().optional(),
});

const roleSchema = z.object({
  code: z.string().min(2).max(32).regex(/^[A-Z][A-Z0-9_]*$/),
  label: z.string().min(2),
  description: z.string().optional(),
  assignable: z.boolean().default(true),
  isIndividualContributor: z.boolean().default(false),
  canVoidActingColleague: z.boolean().default(false),
  allowedViews: z.array(z.string()).min(1).refine(
    (views) => views.every((view) => ALL_VIEWS.includes(view)),
    { message: "One or more views are invalid." },
  ),
  sortOrder: z.number().int().min(0).max(999).optional(),
  active: z.boolean().default(true),
});

const roleUpdateSchema = roleSchema.partial().omit({ code: true });

masterRouter.get("/", requireRoles(...MASTER_ROLES), async (_req, res) => {
  const data = await getMasterDataBundle();
  return res.json(data);
});

masterRouter.get("/public-config", async (_req, res) => {
  const roles = await prisma.roleDefinition.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: {
      code: true,
      label: true,
      assignable: true,
      allowedViews: true,
    },
  });
  return res.json({
    roles: roles.map((role) => ({
      code: role.code,
      label: role.label,
      assignable: role.assignable,
      allowedViews: role.allowedViews,
    })),
    views: ALL_VIEWS,
  });
});

masterRouter.patch("/attendance", requireRoles(...MASTER_ROLES), async (req, res) => {
  const payload = attendanceSchema.parse(req.body);
  parseTimeToMinutes(payload.checkInStart);
  parseTimeToMinutes(payload.checkInEnd);
  parseTimeToMinutes(payload.autoCheckOut);
  if (parseTimeToMinutes(payload.checkInStart) > parseTimeToMinutes(payload.checkInEnd)) {
    return res.status(400).json({ message: "Check-in start must be before check-in end." });
  }

  await Promise.all([
    updateSystemSetting("attendance.checkInStart", payload.checkInStart),
    updateSystemSetting("attendance.checkInEnd", payload.checkInEnd),
    updateSystemSetting("attendance.autoCheckOut", payload.autoCheckOut),
    updateSystemSetting("attendance.timezone", payload.timezone),
  ]);

  const data = await getMasterDataBundle();
  return res.json({ message: "Attendance policy updated.", attendance: data.attendance });
});

masterRouter.patch("/leave-policy", requireRoles(...MASTER_ROLES), async (req, res) => {
  const payload = leavePolicySchema.parse(req.body);
  await Promise.all([
    updateSystemSetting("leave.annualYearlyDays", payload.annualYearlyDays),
    updateSystemSetting("leave.maturityMaxCap", payload.maturityMaxCap),
  ]);
  const data = await getMasterDataBundle();
  return res.json({ message: "Leave policy updated.", leave: data.leave });
});

masterRouter.patch("/air-ticket", requireRoles(...MASTER_ROLES), async (req, res) => {
  const payload = airTicketSchema.parse(req.body);
  await updateSystemSetting("leave.airTicket", payload);
  const data = await getMasterDataBundle();
  return res.json({ message: "Air ticket settings updated.", airTicket: data.airTicket });
});

masterRouter.post("/air-ticket/reset-fares", requireRoles(...MASTER_ROLES), async (_req, res) => {
  const current = await getMasterDataBundle();
  const next = {
    ...(current.airTicket ?? {}),
    fares: DEFAULT_AIR_TICKET_FARES,
  };
  await updateSystemSetting("leave.airTicket", next);
  const data = await getMasterDataBundle();
  return res.json({ message: "Air ticket fare table restored to defaults.", airTicket: data.airTicket });
});

masterRouter.patch("/payroll", requireRoles(...MASTER_ROLES), async (req, res) => {
  const payload = z.object({ dualApprovalThreshold: z.number().positive() }).parse(req.body);
  await updateSystemSetting("payroll.dualApprovalThreshold", payload.dualApprovalThreshold);
  return res.json({ message: "Payroll settings updated.", dualApprovalThreshold: payload.dualApprovalThreshold });
});

masterRouter.post("/leave-types", requireRoles(...MASTER_ROLES), async (req, res) => {
  const payload = leaveTypeSchema.parse(req.body);
  const created = await prisma.leaveType.create({ data: { ...payload, active: payload.active ?? true } });
  invalidateMasterDataCache();
  return res.status(201).json(created);
});

masterRouter.patch("/leave-types/:id", requireRoles(...MASTER_ROLES), async (req, res) => {
  const payload = leaveTypeSchema.partial().parse(req.body);
  const existing = await prisma.leaveType.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) {
    return res.status(404).json({ message: "Leave type not found." });
  }

  const updated = await prisma.leaveType.update({
    where: { id: existing.id },
    data: payload,
  });

  if (payload.yearlyAllocation !== undefined && updated.balanceMode === LeaveBalanceMode.YEARLY) {
    const year = new Date().getFullYear();
    await prisma.leaveBalance.updateMany({
      where: { leaveTypeId: updated.id, year },
      data: { accrued: payload.yearlyAllocation },
    });
  }

  invalidateMasterDataCache();
  return res.json(updated);
});

masterRouter.delete("/leave-types/:id", requireRoles(...MASTER_ROLES), async (req, res) => {
  const existing = await prisma.leaveType.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) {
    return res.status(404).json({ message: "Leave type not found." });
  }
  const inUse = await prisma.leaveRequest.count({ where: { leaveTypeId: existing.id } });
  if (inUse > 0) {
    const updated = await prisma.leaveType.update({
      where: { id: existing.id },
      data: { active: false },
    });
    invalidateMasterDataCache();
    return res.json({ message: "Leave type deactivated (has existing requests).", leaveType: updated });
  }
  await prisma.leaveType.delete({ where: { id: existing.id } });
  invalidateMasterDataCache();
  return res.json({ message: "Leave type deleted." });
});

masterRouter.post("/roles", requireRoles(...MASTER_ROLES), async (req, res) => {
  const payload = roleSchema.parse(req.body);
  const created = await prisma.roleDefinition.create({
    data: {
      ...payload,
      sortOrder: payload.sortOrder ?? 50,
    },
  });
  invalidateMasterDataCache();
  return res.status(201).json(created);
});

masterRouter.patch("/roles/:id", requireRoles(...MASTER_ROLES), async (req: AuthRequest, res) => {
  const payload = roleUpdateSchema.parse(req.body);
  const existing = await prisma.roleDefinition.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) {
    return res.status(404).json({ message: "Role not found." });
  }

  const updated = await prisma.roleDefinition.update({
    where: { id: existing.id },
    data: payload,
  });
  invalidateMasterDataCache();
  return res.json(updated);
});

masterRouter.post("/reset-defaults", requireRoles("SUPER_ADMIN"), async (req, res) => {
  const scope = z.object({
    leaveTypes: z.boolean().optional(),
  }).parse(req.body ?? {});
  await seedMasterData({ resetLeaveTypes: Boolean(scope.leaveTypes) });
  const data = await getMasterDataBundle();
  return res.json({ message: "Defaults restored where applicable.", data });
});
