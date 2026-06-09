import bcrypt from "bcryptjs";
import { prisma } from "./prisma.js";

export const CANONICAL_DEPARTMENTS = [
  { name: "Engineering", designation: "Engineering Manager" },
  { name: "Finance", designation: "Finance Manager" },
  { name: "Operations", designation: "Operations Manager" },
  { name: "Sales", designation: "Sales Manager" },
  { name: "HR & Admin", designation: "HR & Admin Manager" },
  { name: "IT", designation: "IT Manager" },
] as const;

export const FINANCE_DEPT_NAMES = ["Finance", "FINANCE"];

export async function resolveFinanceDepartmentManager(): Promise<string | null> {
  const manager = await prisma.employee.findFirst({
    where: {
      role: "MANAGER",
      accessEnabled: true,
      status: { in: ["ACTIVE", "PROBATION"] },
      OR: FINANCE_DEPT_NAMES.map((name) => ({
        department: { equals: name, mode: "insensitive" },
      })),
    },
    orderBy: { dateOfJoining: "asc" },
    select: { id: true },
  });
  return manager?.id ?? null;
}

export async function isFinanceDepartmentManager(employeeId: string): Promise<boolean> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { role: true, department: true, accessEnabled: true, status: true },
  });
  if (!employee || employee.role !== "MANAGER" || !employee.accessEnabled) return false;
  if (!["ACTIVE", "PROBATION"].includes(employee.status)) return false;
  return FINANCE_DEPT_NAMES.some(
    (name) => name.toLowerCase() === employee.department.toLowerCase(),
  );
}

async function nextEmployeeCode() {
  const employees = await prisma.employee.findMany({ select: { employeeCode: true } });
  let max = 0;
  for (const row of employees) {
    const match = row.employeeCode?.match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `EMP-${String(max + 1).padStart(4, "0")}`;
}

function slugifyDepartment(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function ensureDepartmentManagers() {
  const hqOffice = await prisma.office.findFirst({ where: { active: true }, select: { id: true } });
  const superAdmin = await prisma.employee.findFirst({
    where: { role: "SUPER_ADMIN", accessEnabled: true },
    select: { id: true },
    orderBy: { dateOfJoining: "asc" },
  });

  const created: string[] = [];
  const existing: string[] = [];

  for (const dept of CANONICAL_DEPARTMENTS) {
    const manager = await prisma.employee.findFirst({
      where: {
        role: "MANAGER",
        accessEnabled: true,
        status: { in: ["ACTIVE", "PROBATION"] },
        department: { equals: dept.name, mode: "insensitive" },
      },
      select: { id: true, employeeCode: true, firstName: true, lastName: true },
    });

    if (manager) {
      existing.push(`${dept.name}: ${manager.employeeCode} (${manager.firstName} ${manager.lastName})`);
      continue;
    }

    const slug = slugifyDepartment(dept.name);
    const employeeCode = await nextEmployeeCode();
    const email = `${slug}.manager@hrms.com`;
    const loginEmail = email;

    const duplicateEmail = await prisma.employee.findFirst({ where: { OR: [{ email }, { loginEmail }] } });
    const finalEmail = duplicateEmail ? `${slug}.manager.${employeeCode.toLowerCase()}@hrms.com` : email;

    await prisma.employee.create({
      data: {
        employeeCode,
        firstName: dept.name.split(" ")[0],
        lastName: "Manager",
        email: finalEmail,
        loginEmail: finalEmail,
        passwordHash: await bcrypt.hash("Manager@123", 10),
        role: "MANAGER",
        accessEnabled: true,
        dateOfJoining: new Date(),
        designation: dept.designation,
        department: dept.name,
        employmentType: "Full-Time",
        workMode: "OFFICE",
        officeId: hqOffice?.id,
        managerId: superAdmin?.id,
        status: "ACTIVE",
        basicSalary: 18000,
        housingAllowance: 5000,
        transportAllowance: 2000,
        wpsEnabled: true,
      },
    });
    created.push(`${dept.name}: ${employeeCode} (${finalEmail})`);
  }

  return { created, existing };
}
