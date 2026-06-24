import { Router } from "express";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { applyEmploymentStatusToEmployee, getProbationCutoffDate } from "../../lib/employment-status.js";
import { ensureEmployeeLeaveBalances } from "../../lib/leave-policy.js";
import { getAssignableRoleCodes } from "../../lib/master-data.js";
import { createOnboardingProTask } from "../../lib/pro-tasks.js";
import { extendedEmployeeSchema, extractExtendedEmployeeData } from "../../lib/employee-fields.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";

const privilegedRoles = ["SUPER_ADMIN", "HR", "HR_OFFICER"] as const;

async function assertAssignableRole(role?: string) {
  if (!role) return;
  const assignable = await getAssignableRoleCodes();
  if (!assignable.includes(role)) {
    throw new Error(`Invalid role "${role}". Choose from: ${assignable.join(", ")}`);
  }
}

const createEmployeeSchema = z.object({
  employeeCode: z.string().min(1).optional(),
  firstName: z.string().min(1),
  lastName: z.string().trim().optional().default(""),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  dateOfJoining: z.string().datetime(),
  designation: z.string().min(1),
  department: z.string().min(1),
  nationality: z.string().optional(),
  emiratesId: z.string().optional(),
  passportNumber: z.string().optional(),
  managerId: z.string().optional(),
  employmentType: z.string().min(1),
  workMode: z.enum(["OFFICE", "ONSITE", "HYBRID"]).optional(),
  officeId: z.string().optional(),
  iban: z.string().optional(),
  bankName: z.string().optional(),
  wpsEnabled: z.boolean().optional(),
  labourCardNumber: z.string().optional(),
  noticePeriodDays: z.number().int().min(0).max(365).optional(),
  basicSalary: z.number().nonnegative().default(0),
  housingAllowance: z.number().nonnegative().default(0),
  transportAllowance: z.number().nonnegative().default(0),
  accessEnabled: z.boolean().optional(),
  userRole: z.string().optional(),
  loginEmail: z.string().email().optional(),
  loginPassword: z.string().min(1).optional(),
}).merge(extendedEmployeeSchema);

const updateEmployeeSchema = createEmployeeSchema.partial();

const updateBankSchema = z.object({
  iban: z.string().min(8),
  bankName: z.string().min(2),
  labourCardNumber: z.string().optional(),
  wpsEnabled: z.boolean(),
});

const updateCompensationSchema = z.object({
  basicSalary: z.number().nonnegative(),
  housingAllowance: z.number().nonnegative(),
  transportAllowance: z.number().nonnegative(),
});

const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "PROBATION", "ON_LEAVE", "RESIGNED", "TERMINATED"]),
});

async function generateEmployeeCode() {
  const latest = await prisma.employee.findFirst({
    orderBy: { employeeCode: "desc" },
    select: { employeeCode: true },
  });

  if (!latest) {
    return "EMP-0001";
  }

  const suffix = Number.parseInt(latest.employeeCode.split("-")[1] ?? "0", 10) + 1;
  return `EMP-${String(suffix).padStart(4, "0")}`;
}

export const employeesRouter = Router();

employeesRouter.use(authMiddleware);

employeesRouter.get("/", async (req: AuthRequest, res) => {
  const search = String(req.query.search ?? "").trim();
  const department = String(req.query.department ?? "").trim();
  const status = String(req.query.status ?? "").trim();

  const where: Prisma.EmployeeWhereInput = {};
  const auth = req.auth;

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { employeeCode: { contains: search } },
      { department: { contains: search } },
      { designation: { contains: search } },
    ];
  }

  if (auth?.role === "MANAGER") {
    if (!auth.employeeId) {
      return res.status(400).json({ message: "Manager profile is not linked to an employee record" });
    }
    const managerEmployee = await prisma.employee.findUnique({
      where: { id: auth.employeeId },
      select: { department: true },
    });
    if (!managerEmployee) {
      return res.status(404).json({ message: "Manager employee profile not found" });
    }
    where.department = managerEmployee.department;
  } else if (department && department !== "All Departments") {
    where.department = department;
  }

  if (status && status !== "All Status") {
    if (status === "ACTIVE") {
      where.status = { in: ["ACTIVE", "PROBATION"] };
      where.dateOfJoining = { lte: getProbationCutoffDate() };
    } else if (status === "PROBATION") {
      where.status = { in: ["ACTIVE", "PROBATION"] };
      where.dateOfJoining = { gt: getProbationCutoffDate() };
    } else {
      where.status = status;
    }
  }

  const employees = await prisma.employee.findMany({
    where,
    orderBy: { employeeCode: "asc" },
    include: {
      manager: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
        },
      },
      office: {
        select: {
          id: true,
          name: true,
          radiusMeters: true,
        },
      },
    },
  });

  return res.json(employees.map((employee) => applyEmploymentStatusToEmployee(employee)));
});

employeesRouter.post("/", requireRoles(...privilegedRoles), async (req, res) => {
  const payload = createEmployeeSchema.parse(req.body);
  const shouldProvisionAccess = payload.accessEnabled === true;
  const workMode = payload.workMode ?? "OFFICE";

  if (shouldProvisionAccess && !payload.userRole) {
    return res.status(400).json({ message: "Role is required when login access is enabled" });
  }
  if (workMode === "OFFICE" && !payload.officeId) {
    return res.status(400).json({ message: "Office is required for office employees" });
  }

  try {
    await assertAssignableRole(payload.userRole);
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Invalid role" });
  }

  const employeeCode = payload.employeeCode?.trim() || await generateEmployeeCode();
  const employee = await prisma.employee.create({
    data: {
      employeeCode,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email.toLowerCase(),
      loginEmail: shouldProvisionAccess ? (payload.loginEmail ?? payload.email).toLowerCase() : null,
      passwordHash: shouldProvisionAccess ? await bcrypt.hash(payload.loginPassword ?? "Welcome@123", 10) : null,
      role: payload.userRole ?? "EMPLOYEE",
      accessEnabled: shouldProvisionAccess,
      phone: payload.phone,
      dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
      dateOfJoining: new Date(payload.dateOfJoining),
      designation: payload.designation,
      department: payload.department,
      nationality: payload.nationality,
      emiratesId: payload.emiratesId,
      passportNumber: payload.passportNumber,
      managerId: payload.managerId,
      employmentType: payload.employmentType,
      workMode,
      officeId: payload.officeId,
      iban: payload.iban,
      bankName: payload.bankName,
      wpsEnabled: payload.wpsEnabled,
      labourCardNumber: payload.labourCardNumber,
      noticePeriodDays: payload.noticePeriodDays,
      basicSalary: payload.basicSalary,
      housingAllowance: payload.housingAllowance,
      transportAllowance: payload.transportAllowance,
      ...extractExtendedEmployeeData(payload),
    },
    include: {
      manager: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
        },
      },
      office: {
        select: {
          id: true,
          name: true,
          radiusMeters: true,
        },
      },
    },
  });

  await createOnboardingProTask(employee.id);
  await ensureEmployeeLeaveBalances(employee.id);

  return res.status(201).json(applyEmploymentStatusToEmployee(employee));
});

employeesRouter.put("/:id", requireRoles(...privilegedRoles), async (req, res) => {
  const payload = updateEmployeeSchema.parse(req.body);
  const employeeId = String(req.params.id);
  const shouldProvisionAccess = payload.accessEnabled === true;
  const existing = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { workMode: true, officeId: true },
  });
  if (!existing) {
    return res.status(404).json({ message: "Employee not found" });
  }

  if (shouldProvisionAccess && !payload.userRole) {
    return res.status(400).json({ message: "Role is required when login access is enabled" });
  }
  const resolvedWorkMode = payload.workMode ?? existing.workMode;
  const resolvedOfficeId = payload.officeId ?? existing.officeId;
  if (resolvedWorkMode === "OFFICE" && !resolvedOfficeId) {
    return res.status(400).json({ message: "Office is required for office employees" });
  }

  try {
    await assertAssignableRole(payload.userRole);
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Invalid role" });
  }

  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email?.toLowerCase(),
      loginEmail: shouldProvisionAccess
        ? (payload.loginEmail ?? payload.email)?.toLowerCase()
        : payload.accessEnabled === false
          ? null
          : undefined,
      passwordHash: shouldProvisionAccess
        ? payload.loginPassword
          ? await bcrypt.hash(payload.loginPassword, 10)
          : undefined
        : payload.accessEnabled === false
          ? null
          : undefined,
      role: payload.userRole ?? undefined,
      accessEnabled: payload.accessEnabled,
      phone: payload.phone,
      dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : undefined,
      dateOfJoining: payload.dateOfJoining ? new Date(payload.dateOfJoining) : undefined,
      designation: payload.designation,
      department: payload.department,
      nationality: payload.nationality,
      emiratesId: payload.emiratesId,
      passportNumber: payload.passportNumber,
      managerId: payload.managerId,
      employmentType: payload.employmentType,
      workMode: payload.workMode,
      officeId: payload.officeId,
      iban: payload.iban,
      bankName: payload.bankName,
      wpsEnabled: payload.wpsEnabled,
      labourCardNumber: payload.labourCardNumber,
      noticePeriodDays: payload.noticePeriodDays,
      basicSalary: payload.basicSalary,
      housingAllowance: payload.housingAllowance,
      transportAllowance: payload.transportAllowance,
      employeeCode: payload.employeeCode?.trim() || undefined,
      ...extractExtendedEmployeeData(payload),
    },
    include: {
      manager: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
        },
      },
      office: {
        select: {
          id: true,
          name: true,
          radiusMeters: true,
        },
      },
    },
  });

  return res.json(applyEmploymentStatusToEmployee(employee));
});

employeesRouter.patch("/:id/bank", requireRoles("SUPER_ADMIN", "HR"), async (req, res) => {
  const employeeId = String(req.params.id);
  const payload = updateBankSchema.parse(req.body);

  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: payload,
  });

  return res.json(employee);
});

employeesRouter.patch("/:id/compensation", requireRoles("SUPER_ADMIN", "HR"), async (req, res) => {
  const employeeId = String(req.params.id);
  const payload = updateCompensationSchema.parse(req.body);

  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: payload,
  });

  return res.json(employee);
});

employeesRouter.patch("/:id/status", requireRoles(...privilegedRoles), async (req, res) => {
  const employeeId = String(req.params.id);
  const payload = updateStatusSchema.parse(req.body);
  const existing = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { dateOfJoining: true },
  });
  if (!existing) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const autoManagedStatus = payload.status === "ACTIVE" || payload.status === "PROBATION"
    ? (existing.dateOfJoining <= getProbationCutoffDate() ? "ACTIVE" : "PROBATION")
    : payload.status;

  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: { status: autoManagedStatus },
  });

  return res.json(applyEmploymentStatusToEmployee(employee));
});

employeesRouter.delete("/:id", requireRoles("SUPER_ADMIN"), async (req, res) => {
  const employeeId = String(req.params.id);
  await prisma.employee.delete({ where: { id: employeeId } });
  return res.status(204).send();
});
