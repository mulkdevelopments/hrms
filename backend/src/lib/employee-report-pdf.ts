import PDFKitDocument from "pdfkit";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";

type PdfDoc = InstanceType<typeof PDFKitDocument>;

export const EMPLOYEE_REPORT_SECTIONS = [
  "profile",
  "attendance",
  "leave",
  "payroll",
  "exit",
  "performance",
] as const;

export type EmployeeReportSection = (typeof EMPLOYEE_REPORT_SECTIONS)[number];

export type EmployeeReportQuery = {
  employeeId: string;
  from: Date;
  to: Date;
  sections: EmployeeReportSection[];
};

export function parseEmployeeReportSections(raw?: string): EmployeeReportSection[] {
  if (!raw?.trim()) {
    return [...EMPLOYEE_REPORT_SECTIONS];
  }

  const allowed = new Set<string>(EMPLOYEE_REPORT_SECTIONS);
  const sections = raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .filter((part): part is EmployeeReportSection => allowed.has(part));

  return [...new Set(sections)];
}

const employeeInclude = {
  manager: {
    select: { firstName: true, lastName: true, employeeCode: true },
  },
  office: {
    select: { name: true },
  },
} satisfies Prisma.EmployeeInclude;

type ReportEmployee = Prisma.EmployeeGetPayload<{ include: typeof employeeInclude }>;

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return value.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value?: Date | null) {
  if (!value) return "—";
  return value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value?: number | null, currency?: string | null) {
  if (value == null || Number.isNaN(value)) return "—";
  const code = formatCurrencyCode(currency);
  const amount = Math.round(value).toLocaleString();
  return code ? `${code} ${amount}` : amount;
}

function formatCurrencyCode(currency?: string | null) {
  if (!currency) return "";
  const key = String(currency).trim().toLowerCase();
  const aliases: Record<string, string> = {
    aed: "AED",
    inr: "INR",
    "indian rupees": "INR",
    dollars: "USD",
    usd: "USD",
    euro: "EUR",
    eur: "EUR",
    egp: "EGP",
    "ghana cedi": "GHS",
    "irani riyal": "IRR",
  };
  if (aliases[key]) return aliases[key];
  if (/^[a-z]{3}$/i.test(String(currency).trim())) return String(currency).trim().toUpperCase();
  return String(currency).trim();
}

function formatLabel(value?: string | null) {
  if (!value) return "—";
  return value.replaceAll("_", " ");
}

function sessionHours(checkInAt: Date, checkOutAt?: Date | null) {
  const end = checkOutAt ?? new Date();
  const hours = (end.getTime() - checkInAt.getTime()) / 3600000;
  return Math.max(0, hours);
}

function payslipInRange(month: number, year: number, from: Date, to: Date) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return end >= from && start <= to;
}

export async function gatherEmployeeReportData(query: EmployeeReportQuery) {
  const employee = await prisma.employee.findUnique({
    where: { id: query.employeeId },
    include: employeeInclude,
  });
  if (!employee) {
    return null;
  }

  const { from, to, sections } = query;
  const include = new Set(sections);

  const [
    attendanceSessions,
    leaveRequests,
    leaveBalances,
    payslips,
    adjustments,
    exitRecords,
    salaryLoans,
  ] = await Promise.all([
    include.has("attendance")
      ? prisma.attendanceSession.findMany({
          where: {
            employeeId: query.employeeId,
            checkInAt: { gte: from, lte: to },
          },
          include: { office: { select: { name: true } } },
          orderBy: { checkInAt: "desc" },
          take: 200,
        })
      : Promise.resolve([]),
    include.has("leave")
      ? prisma.leaveRequest.findMany({
          where: {
            employeeId: query.employeeId,
            startDate: { lte: to },
            endDate: { gte: from },
          },
          include: { leaveType: true },
          orderBy: { startDate: "desc" },
          take: 100,
        })
      : Promise.resolve([]),
    include.has("leave")
      ? prisma.leaveBalance.findMany({
          where: {
            employeeId: query.employeeId,
            year: { gte: from.getFullYear(), lte: to.getFullYear() },
          },
          include: { leaveType: true },
          orderBy: [{ year: "desc" }, { leaveType: { name: "asc" } }],
        })
      : Promise.resolve([]),
    include.has("payroll")
      ? prisma.payslip.findMany({
          where: { employeeId: query.employeeId },
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 36,
        })
      : Promise.resolve([]),
    include.has("payroll")
      ? prisma.payrollAdjustment.findMany({
          where: {
            employeeId: query.employeeId,
            createdAt: { gte: from, lte: to },
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        })
      : Promise.resolve([]),
    include.has("exit")
      ? prisma.exitRecord.findMany({
          where: { employeeId: query.employeeId },
          include: {
            clearanceTasks: {
              include: { checklistItems: true },
              orderBy: { department: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    include.has("payroll")
      ? prisma.salaryAdvanceLoan.findMany({
          where: { employeeId: query.employeeId },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : Promise.resolve([]),
  ]);

  const filteredPayslips = payslips.filter((row) => payslipInRange(row.month, row.year, from, to));

  const attendanceHours = attendanceSessions.reduce(
    (sum, session) => sum + sessionHours(session.checkInAt, session.checkOutAt),
    0,
  );
  const completedSessions = attendanceSessions.filter((session) => session.checkOutAt).length;

  return {
    employee,
    period: { from, to },
    sections,
    attendance: {
      sessions: attendanceSessions,
      totalSessions: attendanceSessions.length,
      completedSessions,
      totalHours: attendanceHours,
    },
    leave: {
      requests: leaveRequests,
      balances: leaveBalances,
    },
    payroll: {
      payslips: filteredPayslips,
      adjustments,
      loans: salaryLoans,
    },
    exit: exitRecords,
  };
}

type ReportData = NonNullable<Awaited<ReturnType<typeof gatherEmployeeReportData>>>;

function ensureSpace(doc: PdfDoc, height = 60) {
  if (doc.y + height > doc.page.height - 60) {
    doc.addPage();
  }
}

function drawSectionTitle(doc: PdfDoc, title: string) {
  ensureSpace(doc, 50);
  doc.moveDown(0.4);
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#1e40af").text(title);
  const lineY = doc.y + 4;
  doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, lineY).lineTo(545, lineY).stroke();
  doc.moveDown(0.8);
  doc.fillColor("#111827");
}

function drawKeyValueGrid(
  doc: PdfDoc,
  rows: { label: string; value: string }[],
  columns = 2,
) {
  const colWidth = (495 / columns);
  let column = 0;
  let rowStartY = doc.y;

  rows.forEach((row, index) => {
    if (column === 0) {
      ensureSpace(doc, 34);
      rowStartY = doc.y;
    }

    const x = 50 + column * colWidth;
    doc.font("Helvetica").fontSize(9).fillColor("#64748b").text(row.label, x, rowStartY, { width: colWidth - 12 });
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a").text(row.value, x, rowStartY + 12, { width: colWidth - 12 });

    column += 1;
    if (column >= columns) {
      column = 0;
      doc.y = rowStartY + 34;
    } else if (index === rows.length - 1) {
      doc.y = rowStartY + 34;
    }
  });
  doc.moveDown(0.4);
}

function drawTable(
  doc: PdfDoc,
  headers: string[],
  rows: string[][],
  widths: number[],
) {
  if (!rows.length) {
    doc.font("Helvetica").fontSize(10).fillColor("#64748b").text("No records for this period.");
    doc.moveDown(0.6);
    return;
  }

  const drawHeader = () => {
    ensureSpace(doc, 28);
    const headerY = doc.y;
    let x = 50;
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#334155");
    headers.forEach((header, index) => {
      doc.text(header, x, headerY, { width: widths[index], lineBreak: false });
      x += widths[index];
    });
    doc.y = headerY + 13;
    const lineY = doc.y;
    doc.strokeColor("#e2e8f0").moveTo(50, lineY).lineTo(545, lineY).stroke();
    doc.y = lineY + 8;
  };

  drawHeader();

  rows.forEach((row) => {
    ensureSpace(doc, 22);
    if (doc.y > doc.page.height - 80) {
      doc.addPage();
      drawHeader();
    }
    let x = 50;
    const rowY = doc.y;
    let rowHeight = 14;
    row.forEach((cell, index) => {
      doc.font("Helvetica").fontSize(8.5);
      const height = doc.heightOfString(cell || "—", { width: widths[index] });
      rowHeight = Math.max(rowHeight, height);
    });
    row.forEach((cell, index) => {
      doc.font("Helvetica").fontSize(8.5).fillColor("#0f172a");
      doc.text(cell || "—", x, rowY, { width: widths[index] });
      doc.y = rowY;
      x += widths[index];
    });
    doc.y = rowY + rowHeight + 6;
  });
  doc.moveDown(0.5);
}

function buildProfileRows(employee: ReportEmployee) {
  const manager = employee.manager
    ? `${employee.manager.firstName} ${employee.manager.lastName} (${employee.manager.employeeCode})`
    : "Not assigned";

  return [
    { label: "Employee Code", value: employee.employeeCode },
    { label: "Legacy ID", value: employee.legacyEmpId ?? "—" },
    { label: "Full Name", value: `${employee.firstName} ${employee.lastName}`.trim() },
    { label: "Department", value: employee.department },
    { label: "Designation", value: employee.designation },
    { label: "Employment Type", value: employee.employmentType },
    { label: "Status", value: formatLabel(employee.status) },
    { label: "Role", value: formatLabel(employee.role) },
    { label: "Work Mode", value: formatLabel(employee.workMode) },
    { label: "Office", value: employee.office?.name ?? "—" },
    { label: "Date of Joining", value: formatDate(employee.dateOfJoining) },
    { label: "Nationality", value: employee.nationality ?? "—" },
    { label: "Email", value: employee.email ?? "—" },
    { label: "Mobile", value: employee.phone ?? "—" },
    { label: "Line Manager", value: manager },
    { label: "Category", value: employee.category ?? "—" },
    { label: "Division", value: employee.division ?? "—" },
    { label: "Work Location", value: employee.workLocation ?? "—" },
    { label: "Basic Salary", value: formatMoney(employee.basicSalary, employee.netPayCurrency) },
    { label: "Gross Salary", value: formatMoney(employee.grossSalary, employee.netPayCurrency) },
    { label: "Bank", value: employee.bankName ?? "—" },
    { label: "IBAN", value: employee.iban ?? "—" },
    { label: "Emirates ID", value: employee.emiratesId ?? "—" },
    { label: "Passport", value: employee.passportNumber ?? "—" },
    { label: "Visa Type", value: employee.visaType ?? "—" },
    { label: "HOD", value: employee.hodName ?? "—" },
  ];
}

const SECTION_LABELS: Record<EmployeeReportSection, string> = {
  profile: "Profile & Master Data",
  attendance: "Attendance & Tracking",
  leave: "Leave History & Balances",
  payroll: "Payroll",
  exit: "Exit & Clearance",
  performance: "Performance",
};

export async function buildEmployeeReportPdf(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFKitDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    const included = new Set(data.sections);
    let sectionIndex = 0;

    const nextSectionTitle = (key: EmployeeReportSection) => {
      sectionIndex += 1;
      drawSectionTitle(doc, `${sectionIndex}. ${SECTION_LABELS[key]}`);
    };

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const employee = data.employee;
    const fullName = `${employee.firstName} ${employee.lastName}`.trim();
    const generatedAt = new Date().toLocaleString("en-GB");
    const includedLabels = data.sections.map((key) => SECTION_LABELS[key]).join(", ");

    doc.rect(0, 0, doc.page.width, 92).fill("#0f172a");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text("Employee Report", 50, 28);
    doc.font("Helvetica").fontSize(11).fillColor("#bfdbfe").text(fullName, 50, 54);
    doc.fontSize(10).text(
      `${employee.employeeCode} • ${employee.department} • ${employee.designation}`,
      50,
      70,
    );
    doc.fillColor("#111827");
    doc.y = 110;

    doc.font("Helvetica").fontSize(10).fillColor("#475569").text(
      `Report period: ${formatDate(data.period.from)} to ${formatDate(data.period.to)}`,
    );
    doc.text(`Generated: ${generatedAt}`);
    doc.text(`Sections: ${includedLabels}`);
    doc.moveDown(0.8);

    if (included.has("profile")) {
      nextSectionTitle("profile");
      drawKeyValueGrid(doc, buildProfileRows(employee), 2);
    }

    if (included.has("attendance")) {
      nextSectionTitle("attendance");
      drawKeyValueGrid(doc, [
        { label: "Sessions in Period", value: String(data.attendance.totalSessions) },
        { label: "Completed Check-outs", value: String(data.attendance.completedSessions) },
        { label: "Total Hours (est.)", value: data.attendance.totalHours.toFixed(1) },
        { label: "Active Session", value: data.attendance.sessions.some((s) => s.isActive) ? "Yes" : "No" },
      ], 2);
      drawTable(
        doc,
        ["Check In", "Check Out", "Hours", "Office", "Method"],
        data.attendance.sessions.slice(0, 40).map((session) => [
          formatDateTime(session.checkInAt),
          session.checkOutAt ? formatDateTime(session.checkOutAt) : "Active",
          sessionHours(session.checkInAt, session.checkOutAt).toFixed(1),
          session.office?.name ?? "—",
          session.checkInMethod ?? "—",
        ]),
        [105, 105, 45, 95, 95],
      );
      if (data.attendance.sessions.length > 40) {
        doc.font("Helvetica").fontSize(9).fillColor("#64748b").text(`Showing latest 40 of ${data.attendance.sessions.length} sessions.`);
        doc.moveDown(0.4);
      }
    }

    if (included.has("leave")) {
      nextSectionTitle("leave");
      drawTable(
        doc,
        ["Leave Type", "Year", "Opening", "Accrued", "Used", "Carry Fwd"],
        data.leave.balances.map((balance) => [
          balance.leaveType.name,
          String(balance.year),
          balance.openingBalance.toFixed(1),
          balance.accrued.toFixed(1),
          balance.used.toFixed(1),
          balance.carryForward.toFixed(1),
        ]),
        [95, 40, 55, 55, 55, 55],
      );
      drawTable(
        doc,
        ["Type", "From", "To", "Days", "Status", "Rejoin", "Status As On"],
        data.leave.requests.map((request) => [
          request.leaveType.name,
          formatDate(request.startDate),
          formatDate(request.endDate),
          String(request.days),
          formatLabel(request.status),
          formatDate(request.rejoiningDate),
          request.statusAsOn ?? "—",
        ]),
        [70, 62, 62, 35, 72, 62, 82],
      );
    }

    if (included.has("payroll")) {
      nextSectionTitle("payroll");
      const payCurrency = employee.netPayCurrency;
      drawTable(
        doc,
        ["Month", "Basic", "Housing", "Transport", "OT", "Deductions", "Net Pay"],
        data.payroll.payslips.map((payslip) => [
          `${String(payslip.month).padStart(2, "0")}/${payslip.year}`,
          formatMoney(payslip.basic, payCurrency),
          formatMoney(payslip.housing, payCurrency),
          formatMoney(payslip.transport, payCurrency),
          formatMoney(payslip.overtime, payCurrency),
          formatMoney(payslip.deductions, payCurrency),
          formatMoney(payslip.netPay, payCurrency),
        ]),
        [45, 62, 62, 62, 50, 68, 66],
      );
      drawTable(
        doc,
        ["Ref", "Type", "Category", "Amount", "Effective", "Status"],
        data.payroll.adjustments.map((row) => [
          row.referenceNumber,
          row.type,
          row.category,
          formatMoney(row.amount, payCurrency),
          `${String(row.effectiveMonth).padStart(2, "0")}/${row.effectiveYear}`,
          formatLabel(row.status),
        ]),
        [72, 48, 88, 68, 58, 61],
      );
      if (data.payroll.loans.length) {
        drawTable(
          doc,
          ["Type", "Total", "Installment", "Recovered", "Status"],
          data.payroll.loans.map((loan) => [
            loan.type,
            formatMoney(loan.totalAmount, payCurrency),
            formatMoney(loan.installmentAmount, payCurrency),
            formatMoney(loan.recoveredAmount, payCurrency),
            formatLabel(loan.status),
          ]),
          [70, 85, 85, 85, 90],
        );
      }
    }

    if (included.has("exit")) {
      nextSectionTitle("exit");
      if (!data.exit.length) {
        doc.font("Helvetica").fontSize(10).fillColor("#64748b").text("No exit or resignation records on file.");
        doc.moveDown(0.6);
      } else {
        data.exit.forEach((record) => {
          ensureSpace(doc, 80);
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a").text(
            `${formatLabel(record.type)} — ${formatLabel(record.status)}`,
          );
          doc.font("Helvetica").fontSize(9).fillColor("#475569").text(
            `Resignation: ${formatDate(record.resignationDate)} • Last working day: ${formatDate(record.lastWorkingDate)}`,
          );
          if (record.reason) {
            doc.text(`Reason: ${record.reason}`);
          }
          const tasks = record.clearanceTasks ?? [];
          if (tasks.length) {
            drawTable(
              doc,
              ["Department", "Status", "Completed", "Items Done"],
              tasks.map((task) => [
                task.department,
                formatLabel(task.status),
                formatDate(task.completedAt),
                `${task.checklistItems.filter((item) => item.status === "COMPLETED").length}/${task.checklistItems.length}`,
              ]),
              [95, 80, 95, 75],
            );
          }
          doc.moveDown(0.4);
        });
      }
    }

    if (included.has("performance")) {
      nextSectionTitle("performance");
      doc.font("Helvetica").fontSize(10).fillColor("#64748b").text(
        "Performance appraisal module is not yet configured. This section will include ratings, goals, and review history when available.",
      );
    }

    const pages = doc.bufferedPageRange();
    for (let i = pages.start; i < pages.start + pages.count; i += 1) {
      doc.switchToPage(i);
      const pageNum = i - pages.start + 1;
      doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text(
        `HRMS Confidential — ${employee.employeeCode} — Page ${pageNum} of ${pages.count}`,
        50,
        doc.page.height - 40,
        { align: "center", width: 495 },
      );
    }

    doc.end();
  });
}

export function buildEmployeeReportFileName(employeeCode: string, from: Date, to: Date) {
  const fromKey = from.toISOString().slice(0, 10);
  const toKey = to.toISOString().slice(0, 10);
  return `Employee_Report_${employeeCode}_${fromKey}_${toKey}.pdf`;
}
