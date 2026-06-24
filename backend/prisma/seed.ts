import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  DEFAULT_LEAVE_TYPES,
  ensureEmployeeLeaveBalances,
} from "../src/lib/leave-policy.js";
import { seedMasterData } from "../src/lib/master-data.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.locationPing.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.office.deleteMany();
  await prisma.leaveType.deleteMany();

  const hqOffice = await prisma.office.create({
    data: {
      name: "Dubai HQ",
      latitude: 25.2048,
      longitude: 55.2708,
      radiusMeters: 500,
      active: true,
    },
  });

  await seedMasterData({ resetLeaveTypes: true });
  const leaveTypes = await prisma.leaveType.findMany({ where: { active: true } });
  const annual = leaveTypes.find((type) => type.code === "AL");
  const sick = leaveTypes.find((type) => type.code === "SL");
  if (!annual || !sick) {
    throw new Error("Default leave types were not seeded");
  }

  const superAdminEmployee = await prisma.employee.create({
    data: {
      employeeCode: "EMP-0001",
      firstName: "Super",
      lastName: "Admin",
      email: "admin@hrms.com",
      loginEmail: "admin@hrms.com",
      passwordHash: await bcrypt.hash("Admin@123", 10),
      role: "SUPER_ADMIN",
      accessEnabled: true,
      dateOfJoining: new Date("2022-01-01"),
      designation: "HR Director",
      department: "HR",
      employmentType: "Full-Time",
      workMode: "OFFICE",
      officeId: hqOffice.id,
      status: "ACTIVE",
      basicSalary: 25000,
      housingAllowance: 9000,
      transportAllowance: 3000,
      wpsEnabled: true,
      bankName: "Emirates NBD",
      iban: "AE070331000123456789123",
    },
  });

  const managerEmployee = await prisma.employee.create({
    data: {
      employeeCode: "EMP-0002",
      firstName: "Aisha",
      lastName: "Khan",
      email: "manager@hrms.com",
      loginEmail: "manager@hrms.com",
      passwordHash: await bcrypt.hash("Manager@123", 10),
      role: "MANAGER",
      accessEnabled: true,
      dateOfJoining: new Date("2022-08-15"),
      designation: "Engineering Manager",
      department: "Engineering",
      employmentType: "Full-Time",
      workMode: "HYBRID",
      officeId: hqOffice.id,
      managerId: superAdminEmployee.id,
      status: "ACTIVE",
      basicSalary: 22000,
      housingAllowance: 7000,
      transportAllowance: 2500,
      wpsEnabled: true,
    },
  });

  const employee = await prisma.employee.create({
    data: {
      employeeCode: "EMP-0003",
      firstName: "Ahmed",
      lastName: "Rashid",
      email: "employee@hrms.com",
      loginEmail: "employee@hrms.com",
      passwordHash: await bcrypt.hash("Employee@123", 10),
      role: "EMPLOYEE",
      accessEnabled: true,
      dateOfJoining: new Date("2024-02-10"),
      designation: "Software Engineer",
      department: "Engineering",
      employmentType: "Full-Time",
      workMode: "ONSITE",
      managerId: managerEmployee.id,
      status: "ACTIVE",
      basicSalary: 12000,
      housingAllowance: 3500,
      transportAllowance: 1500,
      wpsEnabled: true,
    },
  });

  await ensureEmployeeLeaveBalances(superAdminEmployee.id);
  await ensureEmployeeLeaveBalances(managerEmployee.id);
  await ensureEmployeeLeaveBalances(employee.id);

  const year = new Date().getFullYear();
  await prisma.leaveBalance.updateMany({
    where: { employeeId: employee.id, leaveTypeId: sick.id, year },
    data: { used: 1 },
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: employee.id,
      leaveTypeId: annual.id,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      days: 3,
      reason: "Family function",
      status: "PENDING_L1",
    },
  });

  await prisma.payslip.createMany({
    data: [
      {
        employeeId: employee.id,
        month: 4,
        year,
        basic: 12000,
        housing: 3500,
        transport: 1500,
        overtime: 850,
        deductions: 300,
        netPay: 17550,
      },
      {
        employeeId: managerEmployee.id,
        month: 4,
        year,
        basic: 22000,
        housing: 7000,
        transport: 2500,
        overtime: 0,
        deductions: 1200,
        netPay: 30300,
      },
    ],
  });

  console.log("Seed completed.");
  console.log(`Leave types configured: ${DEFAULT_LEAVE_TYPES.length}`);
  console.log("Credentials:");
  console.log("- admin@hrms.com / Admin@123");
  console.log("- manager@hrms.com / Manager@123");
  console.log("- employee@hrms.com / Employee@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
