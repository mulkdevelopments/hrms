import { prisma } from "./prisma.js";
import { getAttendancePolicy } from "./master-data.js";
import { sendLateCheckInWarningEmail } from "./email.js";

export const LATE_WARNING_THRESHOLD = 2;

export function getMinutesOfDayInTz(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

export function getZonedYearMonth(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return {
    year: Number(parts.find((part) => part.type === "year")?.value ?? "0"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "0"),
  };
}

export function getMonthUtcRange(year: number, month: number) {
  const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  return { monthStart, monthEnd };
}

export async function isLateCheckIn(date = new Date()) {
  const policy = await getAttendancePolicy();
  const minutes = getMinutesOfDayInTz(date, policy.timezone);
  return minutes > policy.checkInEndMinutes;
}

export async function countLateCheckInsForMonth(employeeId: string, year: number, month: number) {
  const { monthStart, monthEnd } = getMonthUtcRange(year, month);
  return prisma.attendanceSession.count({
    where: {
      employeeId,
      isLateCheckIn: true,
      checkInAt: { gte: monthStart, lt: monthEnd },
    },
  });
}

export async function getLateAttendanceSummary(employeeId: string) {
  const policy = await getAttendancePolicy();
  const now = new Date();
  const { year, month } = getZonedYearMonth(now, policy.timezone);
  const monthlyLateCount = await countLateCheckInsForMonth(employeeId, year, month);
  const warning = await prisma.lateAttendanceWarning.findUnique({
    where: { employeeId_year_month: { employeeId, year, month } },
  });

  return {
    monthlyLateCount,
    threshold: LATE_WARNING_THRESHOLD,
    warningActive: monthlyLateCount > LATE_WARNING_THRESHOLD,
    warningEmailed: Boolean(warning?.emailedAt),
    month,
    year,
  };
}

export async function recordLateCheckInSideEffects(employee: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  loginEmail: string | null;
}) {
  const policy = await getAttendancePolicy();
  const now = new Date();
  const { year, month } = getZonedYearMonth(now, policy.timezone);
  const monthlyLateCount = await countLateCheckInsForMonth(employee.id, year, month);

  await prisma.lateAttendanceWarning.upsert({
    where: { employeeId_year_month: { employeeId: employee.id, year, month } },
    create: {
      employeeId: employee.id,
      year,
      month,
      lateCount: monthlyLateCount,
    },
    update: {
      lateCount: monthlyLateCount,
    },
  });

  if (monthlyLateCount <= LATE_WARNING_THRESHOLD) {
    return { monthlyLateCount, warningEmailed: false };
  }

  const warning = await prisma.lateAttendanceWarning.findUnique({
    where: { employeeId_year_month: { employeeId: employee.id, year, month } },
  });

  if (warning?.emailedAt) {
    return { monthlyLateCount, warningEmailed: true };
  }

  const destination = employee.loginEmail ?? employee.email;
  try {
    await sendLateCheckInWarningEmail({
      to: destination,
      name: `${employee.firstName} ${employee.lastName}`.trim(),
      lateCount: monthlyLateCount,
      threshold: LATE_WARNING_THRESHOLD,
      month,
      year,
    });
    await prisma.lateAttendanceWarning.update({
      where: { employeeId_year_month: { employeeId: employee.id, year, month } },
      data: { emailedAt: new Date(), lateCount: monthlyLateCount },
    });
    return { monthlyLateCount, warningEmailed: true };
  } catch (error) {
    console.error("Late check-in warning email failed:", error);
    return { monthlyLateCount, warningEmailed: false };
  }
}

export async function listLateJoinersForMonth(year: number, month: number, department?: string) {
  const { monthStart, monthEnd } = getMonthUtcRange(year, month);
  const sessions = await prisma.attendanceSession.findMany({
    where: {
      isLateCheckIn: true,
      checkInAt: { gte: monthStart, lt: monthEnd },
      ...(department ? { employee: { department } } : {}),
    },
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          department: true,
          designation: true,
          email: true,
          loginEmail: true,
        },
      },
      office: { select: { id: true, name: true } },
    },
    orderBy: { checkInAt: "desc" },
  });

  const grouped = new Map<string, {
    employee: (typeof sessions)[number]["employee"];
    lateCount: number;
    latestCheckInAt: Date;
    sessions: Array<{ id: string; checkInAt: Date; checkOutAt: Date | null; checkInMethod: string; officeName: string | null }>;
  }>();

  for (const session of sessions) {
    const existing = grouped.get(session.employeeId);
    const entry = {
      id: session.id,
      checkInAt: session.checkInAt,
      checkOutAt: session.checkOutAt,
      checkInMethod: session.checkInMethod,
      officeName: session.office?.name ?? null,
    };
    if (!existing) {
      grouped.set(session.employeeId, {
        employee: session.employee,
        lateCount: 1,
        latestCheckInAt: session.checkInAt,
        sessions: [entry],
      });
      continue;
    }
    existing.lateCount += 1;
    existing.sessions.push(entry);
    if (session.checkInAt > existing.latestCheckInAt) {
      existing.latestCheckInAt = session.checkInAt;
    }
  }

  return Array.from(grouped.values())
    .map((row) => ({
      employeeId: row.employee.id,
      employeeCode: row.employee.employeeCode,
      name: `${row.employee.firstName} ${row.employee.lastName}`.trim(),
      department: row.employee.department,
      designation: row.employee.designation,
      lateCount: row.lateCount,
      latestCheckInAt: row.latestCheckInAt,
      warningActive: row.lateCount > LATE_WARNING_THRESHOLD,
      sessions: row.sessions,
    }))
    .sort((a, b) => b.lateCount - a.lateCount || b.latestCheckInAt.getTime() - a.latestCheckInAt.getTime());
}

export async function countLateJoinersToday(department?: string) {
  const policy = await getAttendancePolicy();
  const now = new Date();
  const { year, month } = getZonedYearMonth(now, policy.timezone);
  const dayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: policy.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const day = Number(dayParts.find((part) => part.type === "day")?.value ?? "1");
  const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const dayEnd = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));

  return prisma.attendanceSession.count({
    where: {
      isLateCheckIn: true,
      checkInAt: { gte: dayStart, lt: dayEnd },
      ...(department ? { employee: { department } } : {}),
    },
  });
}

export async function countEmployeesOverLateThreshold(department?: string) {
  const policy = await getAttendancePolicy();
  const { year, month } = getZonedYearMonth(new Date(), policy.timezone);
  const rows = await listLateJoinersForMonth(year, month, department);
  return rows.filter((row) => row.lateCount > LATE_WARNING_THRESHOLD).length;
}
