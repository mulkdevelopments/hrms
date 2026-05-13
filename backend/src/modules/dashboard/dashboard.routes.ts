import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware, type AuthRequest } from "../../middleware/auth.js";

const EmployeeStatus = {
  ACTIVE: "ACTIVE",
  PROBATION: "PROBATION",
  ON_LEAVE: "ON_LEAVE",
} as const;

const LeaveStatus = {
  PENDING_L1: "PENDING_L1",
  PENDING_L2: "PENDING_L2",
} as const;

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get("/overview", async (req: AuthRequest, res) => {
  const auth = req.auth;
  const employeeWhere: Prisma.EmployeeWhereInput = {
    status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION, EmployeeStatus.ON_LEAVE] },
  };
  const onLeaveWhere: Prisma.EmployeeWhereInput = { status: EmployeeStatus.ON_LEAVE };
  const pendingWhere: Prisma.LeaveRequestWhereInput = {
    status: { in: [LeaveStatus.PENDING_L1, LeaveStatus.PENDING_L2] },
  };
  const payslipWhere: Prisma.PayslipWhereInput = {};

  if (auth?.role === "MANAGER" && auth.employeeId) {
    const managerEmployee = await prisma.employee.findUnique({
      where: { id: auth.employeeId },
      select: { department: true },
    });
    if (!managerEmployee) {
      return res.status(404).json({ message: "Manager employee profile not found" });
    }
    employeeWhere.department = managerEmployee.department;
    onLeaveWhere.department = managerEmployee.department;
    pendingWhere.employee = { department: managerEmployee.department };
    payslipWhere.employee = { department: managerEmployee.department };
  }

  const [headcount, onLeave, pendingLeaveApprovals, employeesByDept, payroll] = await Promise.all([
    prisma.employee.count({ where: employeeWhere }),
    prisma.employee.count({ where: onLeaveWhere }),
    prisma.leaveRequest.count({ where: pendingWhere }),
    prisma.employee.groupBy({
      by: ["department"],
      where: employeeWhere,
      _count: { department: true },
      orderBy: { _count: { department: "desc" } },
    }),
    prisma.payslip.aggregate({ _sum: { netPay: true }, where: payslipWhere }),
  ]);

  return res.json({
    headcount,
    onLeave,
    pendingLeaveApprovals,
    monthlyPayroll: payroll._sum.netPay ?? 0,
    employeesByDept: employeesByDept.map((row) => ({ department: row.department, count: row._count.department })),
  });
});
