import { Router } from "express";
import { Prisma, type AttendanceSession } from "@prisma/client";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";

const attendanceRouter = Router();
attendanceRouter.use(authMiddleware);

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
});

const checkInSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracy: z.number().nonnegative().optional(),
  faceVerificationToken: z.string().optional(),
}).refine(
  (value) => (value.latitude === undefined && value.longitude === undefined)
    || (typeof value.latitude === "number" && typeof value.longitude === "number"),
  { message: "latitude and longitude must be provided together" },
);

const checkOutSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracy: z.number().nonnegative().optional(),
  faceVerificationToken: z.string().optional(),
}).refine(
  (value) => (value.latitude === undefined && value.longitude === undefined)
    || (typeof value.latitude === "number" && typeof value.longitude === "number"),
  { message: "latitude and longitude must be provided together" },
);

const officeSchema = z.object({
  name: z.string().min(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(50).max(5000).default(500),
  active: z.boolean().default(true),
});

const updateOfficeSchema = officeSchema.partial();
const faceDescriptorSchema = z.object({
  descriptor: z.array(z.number()).min(64).max(1024),
});
const faceConfigSchema = z.object({
  enabled: z.boolean(),
});
const calendarMonthSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  employeeId: z.string().optional(),
});
const calendarDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employeeId: z.string().optional(),
});

function haversineDistanceMeters(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const latDiff = toRadians(toLat - fromLat);
  const lngDiff = toRadians(toLng - fromLng);
  const a = Math.sin(latDiff / 2) ** 2
    + Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(lngDiff / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function geofenceState(office: { latitude: number; longitude: number; radiusMeters: number }, latitude: number, longitude: number) {
  const distance = haversineDistanceMeters(latitude, longitude, office.latitude, office.longitude);
  return {
    distanceMeters: Math.round(distance),
    inside: distance <= office.radiusMeters,
  };
}

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function parseMonthRange(month: string) {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const monthStart = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));
  return { monthStart, monthEnd };
}

function parseDayRange(date: string) {
  const [yearText, monthText, dayText] = date.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const day = Number(dayText);
  const dayStart = new Date(Date.UTC(year, monthIndex, day, 0, 0, 0, 0));
  const dayEnd = new Date(Date.UTC(year, monthIndex, day + 1, 0, 0, 0, 0));
  return { dayStart, dayEnd };
}

async function getEmployeeForAttendance(employeeId: string) {
  return prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      office: true,
      attendanceSessions: {
        where: { isActive: true },
        orderBy: { checkInAt: "desc" },
        take: 1,
      },
    },
  });
}

async function resolveTargetEmployeeId(req: AuthRequest, requestedEmployeeId?: string) {
  const auth = req.auth;
  const actorEmployeeId = auth?.employeeId;
  if (!actorEmployeeId) return null;
  const targetEmployeeId = requestedEmployeeId || actorEmployeeId;

  if (targetEmployeeId === actorEmployeeId) {
    return targetEmployeeId;
  }

  if (auth?.role === "SUPER_ADMIN" || auth?.role === "HR" || auth?.role === "HR_OFFICER") {
    return targetEmployeeId;
  }

  if (auth?.role === "MANAGER") {
    return targetEmployeeId;
  }

  return null;
}

attendanceRouter.get("/offices", async (_req, res) => {
  const offices = await prisma.office.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return res.json(offices);
});

attendanceRouter.post("/offices", requireRoles("SUPER_ADMIN", "HR"), async (req, res) => {
  const payload = officeSchema.parse(req.body);
  const created = await prisma.office.create({ data: payload });
  return res.status(201).json(created);
});

attendanceRouter.put("/offices/:id", requireRoles("SUPER_ADMIN", "HR"), async (req, res) => {
  const payload = updateOfficeSchema.parse(req.body);
  const officeId = String(req.params.id);
  const updated = await prisma.office.update({
    where: { id: officeId },
    data: payload,
  });
  return res.json(updated);
});

attendanceRouter.delete("/offices/:id", requireRoles("SUPER_ADMIN", "HR"), async (req, res) => {
  const officeId = String(req.params.id);
  const assignedEmployees = await prisma.employee.count({
    where: { officeId },
  });
  if (assignedEmployees > 0) {
    return res.status(400).json({
      message: `Reassign ${assignedEmployees} employee(s) before deleting this office`,
    });
  }

  await prisma.office.update({
    where: { id: officeId },
    data: { active: false },
  });
  return res.status(204).send();
});

attendanceRouter.get("/status", async (req: AuthRequest, res) => {
  const employeeId = req.auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }

  const employee = await getEmployeeForAttendance(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee profile not found" });
  }

  const activeSession = employee.attendanceSessions[0] ?? null;
  const latestPing = await prisma.locationPing.findFirst({
    where: { employeeId: employee.id },
    orderBy: { recordedAt: "desc" },
  });

  return res.json({
    employee: {
      id: employee.id,
      workMode: employee.workMode,
      officeId: employee.officeId,
      office: employee.office,
      faceAuthEnabled: employee.faceAuthEnabled,
      faceEnrolledAt: employee.faceEnrolledAt,
      faceEnrolled: Boolean(employee.faceDescriptor),
    },
    activeSession,
    latestPing,
  });
});

attendanceRouter.get("/face/status", async (req: AuthRequest, res) => {
  const employeeId = req.auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      faceAuthEnabled: true,
      faceEnrolledAt: true,
      faceDescriptor: true,
    },
  });
  if (!employee) {
    return res.status(404).json({ message: "Employee profile not found" });
  }
  return res.json({
    enabled: employee.faceAuthEnabled,
    enrolled: Boolean(employee.faceDescriptor),
    faceEnrolledAt: employee.faceEnrolledAt,
  });
});

attendanceRouter.put("/face/config", async (req: AuthRequest, res) => {
  const employeeId = req.auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }
  const payload = faceConfigSchema.parse(req.body);
  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: { faceAuthEnabled: payload.enabled },
    select: {
      faceAuthEnabled: true,
      faceEnrolledAt: true,
      faceDescriptor: true,
    },
  });
  return res.json({
    enabled: employee.faceAuthEnabled,
    enrolled: Boolean(employee.faceDescriptor),
    faceEnrolledAt: employee.faceEnrolledAt,
  });
});

attendanceRouter.post("/face/enroll", async (req: AuthRequest, res) => {
  const employeeId = req.auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }
  const payload = faceDescriptorSchema.parse(req.body);
  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      faceDescriptor: payload.descriptor,
      faceEnrolledAt: new Date(),
    },
  });
  return res.json({ message: "Face enrolled successfully" });
});

attendanceRouter.delete("/face/enroll", async (req: AuthRequest, res) => {
  const employeeId = req.auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }
  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      faceDescriptor: Prisma.JsonNull,
      faceEnrolledAt: null,
    },
  });
  return res.status(204).send();
});

attendanceRouter.post("/face/verify", async (req: AuthRequest, res) => {
  const employeeId = req.auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }
  const payload = faceDescriptorSchema.parse(req.body);
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      faceDescriptor: true,
      faceAuthEnabled: true,
    },
  });
  if (!employee) {
    return res.status(404).json({ message: "Employee profile not found" });
  }
  const savedDescriptor = Array.isArray(employee.faceDescriptor) ? employee.faceDescriptor : null;
  if (!savedDescriptor?.length) {
    return res.status(400).json({ message: "Face is not enrolled yet" });
  }

  const length = Math.min(savedDescriptor.length, payload.descriptor.length);
  if (length < 64) {
    return res.status(400).json({ message: "Face descriptor data is invalid" });
  }
  let squared = 0;
  for (let index = 0; index < length; index += 1) {
    const diff = Number(savedDescriptor[index]) - Number(payload.descriptor[index]);
    squared += diff * diff;
  }
  const distance = Math.sqrt(squared);
  const matched = distance <= 0.55;
  if (!matched) {
    return res.status(403).json({ message: "Face verification failed. Please retry.", distance });
  }

  const faceVerificationToken = jwt.sign(
    {
      employeeId: employee.id,
      purpose: "attendance_checkin",
    },
    env.JWT_SECRET,
    { expiresIn: "2m" },
  );

  return res.json({
    matched: true,
    distance,
    faceVerificationToken,
  });
});

attendanceRouter.post("/check-in", async (req: AuthRequest, res) => {
  const employeeId = req.auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }

  const payload = checkInSchema.parse(req.body ?? {});
  const location = typeof payload.latitude === "number" && typeof payload.longitude === "number"
    ? {
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
    }
    : null;

  const employee = await getEmployeeForAttendance(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee profile not found" });
  }
  const activeSession = employee.attendanceSessions[0];
  if (activeSession) {
    return res.json({ message: "Already checked in", session: activeSession });
  }

  if (employee.workMode === "OFFICE") {
    if (!employee.office) {
      return res.status(400).json({ message: "Office is required for office employees" });
    }
    if (!location) {
      return res.status(400).json({ message: "Location is required for office check-in" });
    }
    const state = geofenceState(employee.office, location.latitude, location.longitude);
    if (!state.inside) {
      await prisma.locationPing.create({
        data: {
          employeeId: employee.id,
          officeId: employee.officeId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          insideGeofence: false,
          eventType: "CHECK_IN_BLOCKED_OUTSIDE_GEOFENCE",
        },
      });
      return res.status(403).json({
        message: `Check-in allowed only within ${employee.office.radiusMeters}m office geofence`,
        distanceMeters: state.distanceMeters,
      });
    }
  }

  if (employee.faceAuthEnabled) {
    if (!employee.faceDescriptor) {
      return res.status(428).json({ message: "Face enrollment required before check-in" });
    }
    if (!payload.faceVerificationToken) {
      return res.status(401).json({ message: "Face verification is required for check-in" });
    }
    try {
      const tokenPayload = jwt.verify(payload.faceVerificationToken, env.JWT_SECRET) as {
        employeeId?: string;
        purpose?: string;
      };
      if (tokenPayload.employeeId !== employee.id || tokenPayload.purpose !== "attendance_checkin") {
        return res.status(401).json({ message: "Invalid face verification token" });
      }
    } catch {
      return res.status(401).json({ message: "Face verification expired. Verify again." });
    }
  }

  const createdSession = await prisma.attendanceSession.create({
    data: {
      employeeId: employee.id,
      officeId: employee.officeId,
      checkInMethod: "MANUAL",
    },
  });

  if (location) {
    const insideState = employee.office
      ? geofenceState(employee.office, location.latitude, location.longitude)
      : null;
    await prisma.locationPing.create({
      data: {
        employeeId: employee.id,
        sessionId: createdSession.id,
        officeId: employee.officeId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        insideGeofence: insideState ? insideState.inside : null,
        eventType: "MANUAL_CHECK_IN",
      },
    });
  }

  return res.status(201).json({ message: "Checked in successfully", session: createdSession });
});

attendanceRouter.post("/check-out", async (req: AuthRequest, res) => {
  const employeeId = req.auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }

  const payload = checkOutSchema.parse(req.body ?? {});
  const location = typeof payload.latitude === "number" && typeof payload.longitude === "number"
    ? {
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
    }
    : null;

  const employee = await getEmployeeForAttendance(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee profile not found" });
  }
  const activeSession = employee.attendanceSessions[0];
  if (!activeSession) {
    return res.json({ message: "No active session found" });
  }

  if (employee.faceAuthEnabled) {
    if (!employee.faceDescriptor) {
      return res.status(428).json({ message: "Face enrollment required before check-out" });
    }
    if (!payload.faceVerificationToken) {
      return res.status(401).json({ message: "Face verification is required for check-out" });
    }
    try {
      const tokenPayload = jwt.verify(payload.faceVerificationToken, env.JWT_SECRET) as {
        employeeId?: string;
        purpose?: string;
      };
      if (tokenPayload.employeeId !== employee.id || tokenPayload.purpose !== "attendance_checkin") {
        return res.status(401).json({ message: "Invalid face verification token" });
      }
    } catch {
      return res.status(401).json({ message: "Face verification expired. Verify again." });
    }
  }

  const updated = await prisma.attendanceSession.update({
    where: { id: activeSession.id },
    data: {
      isActive: false,
      checkOutAt: new Date(),
      checkOutMethod: "MANUAL",
      lastSeenAt: new Date(),
    },
  });

  if (location) {
    const insideState = employee.office
      ? geofenceState(employee.office, location.latitude, location.longitude)
      : null;
    await prisma.locationPing.create({
      data: {
        employeeId: employee.id,
        sessionId: updated.id,
        officeId: employee.officeId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        insideGeofence: insideState ? insideState.inside : null,
        eventType: "MANUAL_CHECK_OUT",
      },
    });
  }

  return res.json({ message: "Checked out successfully", session: updated });
});

attendanceRouter.post("/ping", async (req: AuthRequest, res) => {
  const employeeId = req.auth?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }
  const payload = locationSchema.parse(req.body);

  const employee = await getEmployeeForAttendance(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee profile not found" });
  }

  let activeSession: AttendanceSession | null = employee.attendanceSessions[0] ?? null;
  const now = new Date();
  let eventType = "PING";
  let insideGeofence: boolean | null = null;
  let distanceMeters: number | null = null;

  if (employee.workMode === "OFFICE") {
    if (!employee.office) {
      return res.status(400).json({ message: "Office is required for office employees" });
    }
    const state = geofenceState(employee.office, payload.latitude, payload.longitude);
    insideGeofence = state.inside;
    distanceMeters = state.distanceMeters;

    if (state.inside && !activeSession) {
      const manualLogoutToday = await prisma.attendanceSession.findFirst({
        where: {
          employeeId: employee.id,
          checkOutMethod: "MANUAL",
          checkOutAt: { gte: startOfDay(now) },
        },
        orderBy: { checkOutAt: "desc" },
      });
      if (manualLogoutToday) {
        eventType = "MANUAL_LOGOUT_LOCK";
      } else {
      activeSession = await prisma.attendanceSession.create({
        data: {
          employeeId: employee.id,
          officeId: employee.officeId,
          checkInMethod: "AUTO_GEOFENCE",
          lastSeenAt: now,
        },
      });
      eventType = "AUTO_CHECK_IN";
      }
    } else if (!state.inside && activeSession) {
      await prisma.attendanceSession.update({
        where: { id: activeSession.id },
        data: {
          isActive: false,
          checkOutAt: now,
          checkOutMethod: "AUTO_GEOFENCE",
          lastSeenAt: now,
        },
      });
      eventType = "AUTO_CHECK_OUT";
      activeSession = null;
    }
  }

  if (activeSession) {
    await prisma.attendanceSession.update({
      where: { id: activeSession.id },
      data: { lastSeenAt: now },
    });
  }

  await prisma.locationPing.create({
    data: {
      employeeId: employee.id,
      sessionId: activeSession?.id ?? null,
      officeId: employee.officeId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      insideGeofence,
      eventType,
      recordedAt: now,
    },
  });

  return res.json({
    activeSession,
    eventType,
    insideGeofence,
    distanceMeters,
  });
});

attendanceRouter.get("/online", async (req: AuthRequest, res) => {
  const auth = req.auth;
  const where: Prisma.AttendanceSessionWhereInput = { isActive: true };

  if (auth?.role === "EMPLOYEE" && auth.employeeId) {
    where.employeeId = auth.employeeId;
  }

  const sessions = await prisma.attendanceSession.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          department: true,
          workMode: true,
        },
      },
      office: {
        select: {
          id: true,
          name: true,
          radiusMeters: true,
        },
      },
      locationPings: {
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { checkInAt: "desc" },
  });

  return res.json(
    sessions.map((session) => ({
      id: session.id,
      checkInAt: session.checkInAt,
      employee: session.employee,
      office: session.office,
      latestPing: session.locationPings[0] ?? null,
    })),
  );
});

attendanceRouter.get("/employees-presence", async (req: AuthRequest, res) => {
  const auth = req.auth;
  if (!auth?.employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }

  const where: Prisma.EmployeeWhereInput = {};
  if (auth.role === "EMPLOYEE") {
    where.id = auth.employeeId;
  }

  const rows = await prisma.employee.findMany({
    where,
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      attendanceSessions: {
        where: { isActive: true },
        orderBy: { checkInAt: "desc" },
        take: 1,
      },
      locationPings: {
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
  });

  return res.json(rows.map((item) => ({
    employeeId: item.id,
    employeeCode: item.employeeCode,
    employeeName: `${item.firstName} ${item.lastName}`.trim(),
    isOnline: Boolean(item.attendanceSessions[0]),
    activeSession: item.attendanceSessions[0] ?? null,
    latestPing: item.locationPings[0] ?? null,
  })));
});

attendanceRouter.get("/calendar/month", async (req: AuthRequest, res) => {
  if (!req.auth?.employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }
  const query = calendarMonthSchema.parse(req.query);
  const employeeId = await resolveTargetEmployeeId(req, query.employeeId);
  if (!employeeId) {
    return res.status(403).json({ message: "You do not have access to this employee calendar" });
  }
  const { monthStart, monthEnd } = parseMonthRange(query.month);

  const sessions = await prisma.attendanceSession.findMany({
    where: {
      employeeId,
      checkInAt: { lt: monthEnd },
      OR: [
        { checkOutAt: { gte: monthStart } },
        { isActive: true },
      ],
    },
    select: {
      id: true,
      checkInAt: true,
      checkOutAt: true,
      isActive: true,
    },
    orderBy: { checkInAt: "asc" },
  });

  const now = new Date();
  const totalsByDay = new Map<string, number>();
  sessions.forEach((session) => {
    const sessionStart = session.checkInAt > monthStart ? session.checkInAt : monthStart;
    const rawSessionEnd = session.checkOutAt ?? now;
    const sessionEnd = rawSessionEnd < monthEnd ? rawSessionEnd : monthEnd;
    if (sessionEnd <= sessionStart) return;

    let cursor = new Date(sessionStart);
    while (cursor < sessionEnd) {
      const dayStart = new Date(Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate(),
        0,
        0,
        0,
        0,
      ));
      const dayEnd = new Date(Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate() + 1,
        0,
        0,
        0,
        0,
      ));
      const segmentStart = cursor > dayStart ? cursor : dayStart;
      const segmentEnd = sessionEnd < dayEnd ? sessionEnd : dayEnd;
      if (segmentEnd > segmentStart) {
        const dayKey = dayStart.toISOString().slice(0, 10);
        const minutes = Math.round((segmentEnd.getTime() - segmentStart.getTime()) / 60000);
        totalsByDay.set(dayKey, (totalsByDay.get(dayKey) ?? 0) + minutes);
      }
      cursor = dayEnd;
    }
  });

  return res.json({
    month: query.month,
    totals: Array.from(totalsByDay.entries()).map(([date, totalMinutes]) => ({ date, totalMinutes })),
  });
});

attendanceRouter.get("/calendar/day-route", async (req: AuthRequest, res) => {
  if (!req.auth?.employeeId) {
    return res.status(400).json({ message: "Employee identity missing for this account" });
  }
  const query = calendarDaySchema.parse(req.query);
  const employeeId = await resolveTargetEmployeeId(req, query.employeeId);
  if (!employeeId) {
    return res.status(403).json({ message: "You do not have access to this employee route" });
  }
  const { dayStart, dayEnd } = parseDayRange(query.date);

  const [pings, sessions] = await Promise.all([
    prisma.locationPing.findMany({
      where: {
        employeeId,
        recordedAt: { gte: dayStart, lt: dayEnd },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        accuracy: true,
        eventType: true,
        insideGeofence: true,
        recordedAt: true,
      },
      orderBy: { recordedAt: "asc" },
    }),
    prisma.attendanceSession.findMany({
      where: {
        employeeId,
        checkInAt: { lt: dayEnd },
        OR: [
          { checkOutAt: { gte: dayStart } },
          { isActive: true },
        ],
      },
      select: {
        id: true,
        checkInAt: true,
        checkOutAt: true,
        checkInMethod: true,
        checkOutMethod: true,
      },
      orderBy: { checkInAt: "asc" },
    }),
  ]);

  return res.json({
    date: query.date,
    pings,
    sessions,
  });
});

export { attendanceRouter };
