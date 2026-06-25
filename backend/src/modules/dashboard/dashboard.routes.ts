import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { getProbationCutoffDate } from "../../lib/employment-status.js";
import {
  countEmployeesOverLateThreshold,
  countLateJoinersToday,
  getLateAttendanceSummary,
} from "../../lib/late-attendance.js";
import { isIndividualContributor } from "../../lib/roles.js";
import { isTeamLeaveManagerEmployee, allowsDirectReportsLeaveAccess } from "../../lib/line-manager-eligibility.js";
import { authMiddleware, type AuthRequest } from "../../middleware/auth.js";

const EmployeeStatus = {
  ACTIVE: "ACTIVE",
  PROBATION: "PROBATION",
  ON_LEAVE: "ON_LEAVE",
} as const;

const LeaveStatus = {
  PENDING_L1: "PENDING_L1",
  PENDING_ACTING: "PENDING_ACTING",
  PENDING_L2: "PENDING_L2",
} as const;

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get("/overview", async (req: AuthRequest, res) => {
  const auth = req.auth;
  const probationCutoff = getProbationCutoffDate();
  const employeeWhere: Prisma.EmployeeWhereInput = {
    status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION, EmployeeStatus.ON_LEAVE] },
  };
  const onLeaveWhere: Prisma.EmployeeWhereInput = { status: EmployeeStatus.ON_LEAVE };
  const activeWhere: Prisma.EmployeeWhereInput = {
    status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION] },
    dateOfJoining: { lte: probationCutoff },
  };
  const probationWhere: Prisma.EmployeeWhereInput = {
    status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION] },
    dateOfJoining: { gt: probationCutoff },
  };
  const pendingWhere: Prisma.LeaveRequestWhereInput = {
    status: { in: [LeaveStatus.PENDING_L1, LeaveStatus.PENDING_L2] },
  };
  const payslipWhere: Prisma.PayslipWhereInput = {};
  const nationalityWhere: Prisma.EmployeeWhereInput = {
    ...employeeWhere,
    nationality: { not: null },
  };
  let departmentFilter: string | undefined;
  let isTeamLineManagerScope = false;

  async function hasActiveDirectReports(managerId: string) {
    const count = await prisma.employee.count({
      where: {
        managerId,
        status: { in: ["ACTIVE", "PROBATION", "ON_LEAVE"] },
      },
    });
    return count > 0;
  }
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentPayrollWhere: Prisma.PayslipWhereInput = {
    ...payslipWhere,
    month: currentMonth,
    year: currentYear,
  };
  const overtimePayslipWhere: Prisma.PayslipWhereInput = {
    ...currentPayrollWhere,
    overtime: { gt: 0 },
  };

  if (auth?.role === "MANAGER" && auth.employeeId) {
    const managerEmployee = await prisma.employee.findUnique({
      where: { id: auth.employeeId },
      select: { department: true },
    });
    if (!managerEmployee) {
      return res.status(404).json({ message: "Manager employee profile not found" });
    }
    departmentFilter = managerEmployee.department;
    employeeWhere.department = managerEmployee.department;
    onLeaveWhere.department = managerEmployee.department;
    activeWhere.department = managerEmployee.department;
    probationWhere.department = managerEmployee.department;
    pendingWhere.employee = { department: managerEmployee.department };
    payslipWhere.employee = { department: managerEmployee.department };
    nationalityWhere.department = managerEmployee.department;
    currentPayrollWhere.employee = { department: managerEmployee.department };
    overtimePayslipWhere.employee = { department: managerEmployee.department };
  } else if (auth?.employeeId) {
    const viewer = await prisma.employee.findUnique({
      where: { id: auth.employeeId },
      select: { role: true, designation: true, status: true },
    });
    if (viewer && (isTeamLeaveManagerEmployee(viewer) || (allowsDirectReportsLeaveAccess() && await hasActiveDirectReports(auth.employeeId)))) {
      isTeamLineManagerScope = true;
      const teamEmployeeFilter = { managerId: auth.employeeId };
      employeeWhere.managerId = auth.employeeId;
      onLeaveWhere.managerId = auth.employeeId;
      activeWhere.managerId = auth.employeeId;
      probationWhere.managerId = auth.employeeId;
      pendingWhere.OR = [
        { employee: { managerId: auth.employeeId } },
        { actingApproverId: auth.employeeId },
      ];
      payslipWhere.employee = teamEmployeeFilter;
      nationalityWhere.managerId = auth.employeeId;
      currentPayrollWhere.employee = teamEmployeeFilter;
      overtimePayslipWhere.employee = teamEmployeeFilter;
    }
  }

  if (isIndividualContributor(auth?.role) && auth?.employeeId && !isTeamLineManagerScope) {
    employeeWhere.id = auth.employeeId;
    onLeaveWhere.id = auth.employeeId;
    activeWhere.id = auth.employeeId;
    probationWhere.id = auth.employeeId;
    pendingWhere.employeeId = auth.employeeId;
    payslipWhere.employeeId = auth.employeeId;
    nationalityWhere.id = auth.employeeId;
    currentPayrollWhere.employeeId = auth.employeeId;
    overtimePayslipWhere.employeeId = auth.employeeId;
  }

  const isEmployeeScope = isIndividualContributor(auth?.role) && auth?.employeeId && !isTeamLineManagerScope;

  const [headcount, onLeave, activeCount, probationCount, pendingLeaveApprovals, employeesByDept, payroll, payrollCurrent, overtimeEmployees, nationalityMix, lateJoinersToday, employeesOverLateThreshold, lateAttendance] = await Promise.all([
    prisma.employee.count({ where: employeeWhere }),
    prisma.employee.count({ where: onLeaveWhere }),
    prisma.employee.count({ where: activeWhere }),
    prisma.employee.count({ where: probationWhere }),
    prisma.leaveRequest.count({ where: pendingWhere }),
    prisma.employee.groupBy({
      by: ["department"],
      where: employeeWhere,
      _count: { department: true },
      orderBy: { _count: { department: "desc" } },
    }),
    prisma.payslip.aggregate({ _sum: { netPay: true }, where: payslipWhere }),
    prisma.payslip.aggregate({
      _sum: {
        basic: true,
        housing: true,
        transport: true,
        overtime: true,
        deductions: true,
        netPay: true,
      },
      where: currentPayrollWhere,
    }),
    prisma.payslip.count({ where: overtimePayslipWhere }),
    prisma.employee.groupBy({
      by: ["nationality"],
      where: nationalityWhere,
      _count: { nationality: true },
      orderBy: { _count: { nationality: "desc" } },
      take: 5,
    }),
    isEmployeeScope ? Promise.resolve(0) : countLateJoinersToday(departmentFilter),
    isEmployeeScope ? Promise.resolve(0) : countEmployeesOverLateThreshold(departmentFilter),
    isEmployeeScope && auth?.employeeId
      ? getLateAttendanceSummary(auth.employeeId)
      : Promise.resolve(null),
  ]);

  const nationalityTotal = nationalityMix.reduce((sum, row) => sum + row._count.nationality, 0);

  return res.json({
    headcount,
    onLeave,
    activeCount,
    probationCount,
    pendingLeaveApprovals,
    monthlyPayroll: payroll._sum.netPay ?? 0,
    employeesByDept: employeesByDept.map((row) => ({ department: row.department, count: row._count.department })),
    nationalityMix: nationalityMix.map((row) => ({
      nationality: row.nationality ?? "Other",
      count: row._count.nationality,
      percent: nationalityTotal ? Number(((row._count.nationality / nationalityTotal) * 100).toFixed(1)) : 0,
    })),
    payrollCurrentMonth: {
      month: currentMonth,
      year: currentYear,
      basic: payrollCurrent._sum.basic ?? 0,
      housing: payrollCurrent._sum.housing ?? 0,
      transport: payrollCurrent._sum.transport ?? 0,
      overtime: payrollCurrent._sum.overtime ?? 0,
      deductions: payrollCurrent._sum.deductions ?? 0,
      netPay: payrollCurrent._sum.netPay ?? 0,
      grossTotal:
        (payrollCurrent._sum.basic ?? 0)
        + (payrollCurrent._sum.housing ?? 0)
        + (payrollCurrent._sum.transport ?? 0)
        + (payrollCurrent._sum.overtime ?? 0),
      overtimeEmployees,
    },
    lateJoinersToday,
    employeesOverLateThreshold,
    lateAttendance,
  });
});
