import * as XLSX from "xlsx";
import PDFKitDocument from "pdfkit";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";

type PdfDoc = InstanceType<typeof PDFKitDocument>;

export type LeaveReportQuery = {
  from: Date;
  to: Date;
  employeeId?: string;
  department?: string;
  managerEmployeeId?: string;
  managerDepartment?: string;
};

const leaveInclude = {
  employee: {
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      department: true,
      designation: true,
    },
  },
  leaveType: true,
  l1ApprovedBy: { select: { firstName: true, lastName: true } },
  l2ApprovedBy: { select: { firstName: true, lastName: true } },
} satisfies Prisma.LeaveRequestInclude;

export type LeaveReportRow = Prisma.LeaveRequestGetPayload<{ include: typeof leaveInclude }>;

function formatDate(value?: Date | null) {
  if (!value) return "";
  return value.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value?: Date | null) {
  if (!value) return "";
  return value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLabel(value?: string | null) {
  if (!value) return "";
  return value.replaceAll("_", " ");
}

function employeeName(row: LeaveReportRow) {
  return `${row.employee.firstName ?? ""} ${row.employee.lastName ?? ""}`.trim();
}

function approverName(person?: { firstName: string; lastName: string } | null) {
  if (!person) return "";
  return `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
}

export async function gatherLeaveReportRows(query: LeaveReportQuery): Promise<LeaveReportRow[]> {
  const where: Prisma.LeaveRequestWhereInput = {
    AND: [
      { startDate: { lte: query.to } },
      { endDate: { gte: query.from } },
    ],
  };

  if (query.employeeId) {
    where.employeeId = query.employeeId;
  }

  const employeeFilter: Prisma.EmployeeWhereInput = {};
  if (query.department) {
    employeeFilter.department = query.department;
  }
  if (query.managerDepartment) {
    employeeFilter.department = query.managerDepartment;
  }
  if (Object.keys(employeeFilter).length) {
    where.employee = employeeFilter;
  }

  return prisma.leaveRequest.findMany({
    where,
    include: leaveInclude,
    orderBy: [{ startDate: "desc" }, { employee: { employeeCode: "asc" } }],
  });
}

export function mapLeaveReportSummary(rows: LeaveReportRow[]) {
  const totalDays = rows.reduce((sum, row) => sum + Number(row.days ?? 0), 0);
  const approvedDays = rows
    .filter((row) => row.status === "APPROVED")
    .reduce((sum, row) => sum + Number(row.days ?? 0), 0);
  const uniqueEmployees = new Set(rows.map((row) => row.employeeId)).size;

  return {
    recordCount: rows.length,
    uniqueEmployees,
    totalDays,
    approvedDays,
  };
}

function mapLeaveReportExcelRow(row: LeaveReportRow) {
  return {
    "Employee ID": row.employee.employeeCode,
    Name: employeeName(row),
    Department: row.employee.department ?? "",
    Designation: row.employee.designation ?? "",
    "Leave Type": row.leaveType.name,
    "Start Date": formatDate(row.startDate),
    "End Date": formatDate(row.endDate),
    "Number of Days": row.days,
    "Rejoining Date": formatDate(row.rejoiningDate),
    "Leave Status": formatLabel(row.status),
    "Status As On": row.statusAsOn ?? "",
    "Leave Balance": row.leaveBalanceSnapshot ?? "",
    "Current Leave Balance": row.currentLeaveBalanceSnapshot ?? "",
    "Extended Days": row.extendedDays ?? 0,
    Remark: row.remark ?? row.reason ?? "",
    "Applied On": formatDateTime(row.createdAt),
    "L1 Approver": approverName(row.l1ApprovedBy),
    "L2 Approver": approverName(row.l2ApprovedBy),
  };
}

export function buildLeaveReportXlsx(rows: LeaveReportRow[], meta: { from: Date; to: Date }) {
  const sheetRows = rows.map(mapLeaveReportExcelRow);
  const summary = mapLeaveReportSummary(rows);
  const workbook = XLSX.utils.book_new();

  const dataSheet = XLSX.utils.json_to_sheet(sheetRows.length ? sheetRows : [{
    "Employee ID": "",
    Name: "No leave records in selected period",
  }]);
  XLSX.utils.book_append_sheet(workbook, dataSheet, "Leave Tracker");

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["Leave Report Summary"],
    ["From", formatDate(meta.from)],
    ["To", formatDate(meta.to)],
    ["Generated", formatDateTime(new Date())],
    [],
    ["Records", summary.recordCount],
    ["Employees", summary.uniqueEmployees],
    ["Total Days", summary.totalDays],
    ["Approved Days", summary.approvedDays],
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

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
  const rightEdge = doc.page.width - 50;
  doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, lineY).lineTo(rightEdge, lineY).stroke();
  doc.moveDown(0.8);
  doc.fillColor("#111827");
}

function drawTable(doc: PdfDoc, headers: string[], rows: string[][], widths: number[]) {
  if (!rows.length) {
    doc.font("Helvetica").fontSize(10).fillColor("#64748b").text("No leave records for this period.");
    doc.moveDown(0.6);
    return;
  }

  const rightEdge = doc.page.width - 50;

  const drawHeader = () => {
    ensureSpace(doc, 28);
    const headerY = doc.y;
    let x = 50;
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#334155");
    headers.forEach((header, index) => {
      doc.text(header, x, headerY, { width: widths[index], lineBreak: false });
      x += widths[index];
    });
    doc.y = headerY + 13;
    const lineY = doc.y;
    doc.strokeColor("#e2e8f0").moveTo(50, lineY).lineTo(rightEdge, lineY).stroke();
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
    let rowHeight = 12;
    row.forEach((cell, index) => {
      doc.font("Helvetica").fontSize(8);
      const height = doc.heightOfString(cell || "—", { width: widths[index] });
      rowHeight = Math.max(rowHeight, height);
    });
    row.forEach((cell, index) => {
      doc.font("Helvetica").fontSize(8).fillColor("#0f172a");
      doc.text(cell || "—", x, rowY, { width: widths[index] });
      doc.y = rowY;
      x += widths[index];
    });
    doc.y = rowY + rowHeight + 6;
  });
  doc.moveDown(0.5);
}

export async function buildLeaveReportPdf(rows: LeaveReportRow[], meta: { from: Date; to: Date }) {
  const summary = mapLeaveReportSummary(rows);

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFKitDocument({ size: "A4", margin: 50, layout: "landscape" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, doc.page.width, 88).fill("#0f172a");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text("Leave Report", 50, 24);
    doc.font("Helvetica").fontSize(11).fillColor("#bfdbfe").text(
      `${formatDate(meta.from)} to ${formatDate(meta.to)}`,
      50,
      52,
    );
    doc.fontSize(10).text(`Generated ${formatDateTime(new Date())}`, 50, 68);
    doc.fillColor("#111827");
    doc.y = 100;

    drawSectionTitle(doc, "Summary");
    doc.font("Helvetica").fontSize(10).fillColor("#475569");
    doc.text(`Records: ${summary.recordCount}   Employees: ${summary.uniqueEmployees}   Total days: ${summary.totalDays}   Approved days: ${summary.approvedDays}`);
    doc.moveDown(0.8);

    drawSectionTitle(doc, "Leave Records");
    const contentWidth = doc.page.width - 100;
    const colWidths = [48, 96, 68, 54, 54, 34, 54, 68, 38, 62, contentWidth - 576];
    drawTable(
      doc,
      ["Emp ID", "Employee", "Type", "From", "To", "Days", "Rejoin", "Status As On", "Ext.", "Status", "Remark"],
      rows.map((row) => [
        row.employee.employeeCode,
        employeeName(row),
        row.leaveType.name,
        formatDate(row.startDate),
        formatDate(row.endDate),
        String(row.days),
        formatDate(row.rejoiningDate) || "—",
        row.statusAsOn || "—",
        String(row.extendedDays ?? 0),
        formatLabel(row.status),
        (row.remark ?? row.reason ?? "—").slice(0, 100),
      ]),
      colWidths,
    );

    const pages = doc.bufferedPageRange();
    for (let i = pages.start; i < pages.start + pages.count; i += 1) {
      doc.switchToPage(i);
      const pageNum = i - pages.start + 1;
      doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text(
        `HRMS Leave Report — Page ${pageNum} of ${pages.count}`,
        50,
        doc.page.height - 36,
        { align: "center", width: doc.page.width - 100 },
      );
    }

    doc.end();
  });
}

export function buildLeaveReportFileName(from: Date, to: Date, ext: "xlsx" | "pdf") {
  const fromKey = from.toISOString().slice(0, 10);
  const toKey = to.toISOString().slice(0, 10);
  return `Leave_Report_${fromKey}_${toKey}.${ext}`;
}
