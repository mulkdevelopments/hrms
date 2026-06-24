import { Router } from "express";
import { z } from "zod";
import {
  buildEmployeeReportFileName,
  buildEmployeeReportPdf,
  gatherEmployeeReportData,
  parseEmployeeReportSections,
} from "../../lib/employee-report-pdf.js";
import {
  buildLeaveReportFileName,
  buildLeaveReportPdf,
  buildLeaveReportXlsx,
  gatherLeaveReportRows,
} from "../../lib/leave-report.js";
import { authMiddleware, requireRoles, type AuthRequest } from "../../middleware/auth.js";
import { prisma } from "../../lib/prisma.js";

export const reportsRouter = Router();
reportsRouter.use(authMiddleware);

function parseQueryDateStart(value: string) {
  return new Date(`${value}T00:00:00.000`);
}

function parseQueryDateEnd(value: string) {
  return new Date(`${value}T23:59:59.999`);
}

const employeeReportSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sections: z.string().optional(),
});

const leaveReportSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employeeId: z.string().optional(),
  department: z.string().optional(),
});

function isHrOrAdmin(role?: string) {
  return role === "SUPER_ADMIN" || role === "HR" || role === "HR_OFFICER";
}

async function resolveLeaveReportScope(req: AuthRequest, query: z.infer<typeof leaveReportSchema>) {
  const auth = req.auth;
  if (!auth) {
    return { error: "Unauthorized", status: 401 as const };
  }

  if (isHrOrAdmin(auth.role)) {
    return {
      employeeId: query.employeeId,
      department: query.department,
    };
  }

  if (auth.role === "MANAGER" && auth.employeeId) {
    const manager = await prisma.employee.findUnique({
      where: { id: auth.employeeId },
      select: { department: true },
    });
    if (!manager?.department) {
      return { error: "Manager department not found", status: 404 as const };
    }
    if (query.department && query.department !== manager.department) {
      return { error: "Managers can only export leave reports for their own department", status: 403 as const };
    }
    if (query.employeeId) {
      const target = await prisma.employee.findUnique({
        where: { id: query.employeeId },
        select: { department: true },
      });
      if (!target || target.department !== manager.department) {
        return { error: "You can only export leave reports for employees in your department", status: 403 as const };
      }
    }
    return {
      employeeId: query.employeeId,
      managerDepartment: manager.department,
    };
  }

  return { error: "You do not have access to leave reports", status: 403 as const };
}

reportsRouter.get("/leave/xlsx", async (req: AuthRequest, res) => {
  const payload = leaveReportSchema.parse(req.query);
  const from = parseQueryDateStart(payload.from);
  const to = parseQueryDateEnd(payload.to);
  if (from > to) {
    return res.status(400).json({ message: "From date must be on or before to date" });
  }

  const scope = await resolveLeaveReportScope(req, payload);
  if ("error" in scope && scope.error) {
    return res.status(scope.status ?? 403).json({ message: scope.error });
  }

  const rows = await gatherLeaveReportRows({ from, to, ...scope });
  const buffer = buildLeaveReportXlsx(rows, { from, to });
  const fileName = buildLeaveReportFileName(from, to, "xlsx");

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Length", String(buffer.length));
  return res.send(buffer);
});

reportsRouter.get("/leave/pdf", async (req: AuthRequest, res) => {
  const payload = leaveReportSchema.parse(req.query);
  const from = parseQueryDateStart(payload.from);
  const to = parseQueryDateEnd(payload.to);
  if (from > to) {
    return res.status(400).json({ message: "From date must be on or before to date" });
  }

  const scope = await resolveLeaveReportScope(req, payload);
  if ("error" in scope && scope.error) {
    return res.status(scope.status ?? 403).json({ message: scope.error });
  }

  const rows = await gatherLeaveReportRows({ from, to, ...scope });
  const pdf = await buildLeaveReportPdf(rows, { from, to });
  const fileName = buildLeaveReportFileName(from, to, "pdf");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Length", String(pdf.length));
  return res.send(pdf);
});

reportsRouter.get("/employee/:id/pdf", requireRoles("SUPER_ADMIN", "HR", "HR_OFFICER"), async (req: AuthRequest, res) => {
  const payload = employeeReportSchema.parse(req.query);
  const from = parseQueryDateStart(payload.from);
  const to = parseQueryDateEnd(payload.to);
  const sections = parseEmployeeReportSections(payload.sections);

  if (from > to) {
    return res.status(400).json({ message: "From date must be on or before to date" });
  }
  if (!sections.length) {
    return res.status(400).json({ message: "Select at least one report section" });
  }

  const data = await gatherEmployeeReportData({
    employeeId: String(req.params.id),
    from,
    to,
    sections,
  });

  if (!data) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const pdf = await buildEmployeeReportPdf(data);
  const fileName = buildEmployeeReportFileName(data.employee.employeeCode, from, to);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Length", String(pdf.length));
  return res.send(pdf);
});
