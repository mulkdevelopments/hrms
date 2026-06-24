import { prisma } from "../src/lib/prisma.js";

function dubaiTime(year: number, month: number, day: number, hour: number, minute = 0) {
  return new Date(Date.UTC(year, month - 1, day, hour - 4, minute, 0, 0));
}

async function main() {
  const employee = await prisma.employee.findFirst({
    where: { loginEmail: "employee@hrms.com" },
    select: { id: true, employeeCode: true, firstName: true, lastName: true, officeId: true },
  });

  if (!employee) {
    throw new Error("employee@hrms.com not found — run npm run seed first");
  }

  await prisma.attendanceSession.deleteMany({
    where: {
      employeeId: employee.id,
      isLateCheckIn: true,
      checkInAt: { gte: new Date("2026-05-01"), lt: new Date("2026-07-01") },
    },
  });

  const sessions = [
    { checkIn: dubaiTime(2026, 6, 2, 9, 15), checkOut: dubaiTime(2026, 6, 2, 18, 0) },
    { checkIn: dubaiTime(2026, 6, 5, 9, 45), checkOut: dubaiTime(2026, 6, 5, 18, 0) },
    { checkIn: dubaiTime(2026, 6, 8, 10, 5), checkOut: dubaiTime(2026, 6, 8, 18, 0) },
    { checkIn: dubaiTime(2026, 5, 12, 9, 30), checkOut: dubaiTime(2026, 5, 12, 18, 0) },
    { checkIn: dubaiTime(2026, 5, 20, 9, 0), checkOut: dubaiTime(2026, 5, 20, 18, 0) },
  ];

  for (const session of sessions) {
    await prisma.attendanceSession.create({
      data: {
        employeeId: employee.id,
        officeId: employee.officeId,
        checkInAt: session.checkIn,
        checkOutAt: session.checkOut,
        isActive: false,
        isLateCheckIn: true,
        checkInMethod: "MANUAL",
        checkOutMethod: "MANUAL",
        lastSeenAt: session.checkOut,
      },
    });
  }

  await prisma.lateAttendanceWarning.upsert({
    where: { employeeId_year_month: { employeeId: employee.id, year: 2026, month: 6 } },
    create: {
      employeeId: employee.id,
      year: 2026,
      month: 6,
      lateCount: 3,
      emailedAt: dubaiTime(2026, 6, 8, 10, 30),
    },
    update: {
      lateCount: 3,
      emailedAt: dubaiTime(2026, 6, 8, 10, 30),
    },
  });

  await prisma.lateAttendanceWarning.upsert({
    where: { employeeId_year_month: { employeeId: employee.id, year: 2026, month: 5 } },
    create: { employeeId: employee.id, year: 2026, month: 5, lateCount: 2 },
    update: { lateCount: 2 },
  });

  console.log(`Seeded late attendance for ${employee.employeeCode} (employee@hrms.com):`);
  console.log("- June 2026: 3 late check-ins (warning active)");
  console.log("- May 2026: 2 late check-ins");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
