import * as XLSX from "xlsx";
import { prisma } from "./prisma.js";
import {
  mapCategoryToRole,
  parseExcelDate,
  parseExcelNumber,
  pickString,
  splitFullName,
  normalizePayCurrency,
} from "./employee-fields.js";
import { LeaveStatus } from "./leave-delegation.js";
import { syncDefaultLeaveTypes } from "./leave-policy.js";
import { buildHeaderMap, mapRow, normalizeHeader } from "./excel-sheet-utils.js";

export type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
};

export type ImportProgress = {
  processed: number;
  total: number;
  phase?: "parsing" | "importing" | "managers";
  sheetName?: string;
};

type ImportCallbacks = {
  onProgress?: (progress: ImportProgress) => void;
};

const MASTER_HEADER_ALIASES: Record<string, string> = {
  "#": "_index",
  "emp code": "empCode",
  "emp id": "legacyEmpId",
  "employee id": "empCode",
  "new emp id": "legacyEmpId",
  "employee code": "empCode",
  name: "name",
  "employee name": "name",
  designation: "designation",
  category: "category",
  "sub category": "subCategory",
  grade: "grade",
  type: "employeeType",
  "business unit": "businessUnit",
  division: "division",
  department: "department",
  location: "workLocation",
  country: "workCountry",
  doj: "dateOfJoining",
  "date of joining": "dateOfJoining",
  "date of birth": "dateOfBirth",
  nationality: "nationality",
  payroll: "payrollType",
  "payroll status": "payrollStatus",
  "payroll division": "payrollDivision",
  "basic salary": "basicSalary",
  conveyance: "conveyanceAllowance",
  "fixed ot allow": "fixedOtAllowance",
  "food allow": "foodAllowance",
  hra: "housingAllowance",
  "other allow": "otherAllowance",
  "overseas allow": "overseasAllowance",
  "performance allow": "performanceAllowance",
  "petrol allow": "petrolAllowance",
  "risk allowance": "riskAllowance",
  "social insurance": "socialInsurance",
  "telephone allow": "telephoneAllowance",
  "transport allow": "transportAllowance",
  "vehicle allow": "vehicleAllowance",
  "kids education allowance": "kidsEducationAllowance",
  "gross salary": "grossSalary",
  "ot eligibility": "otEligible",
  "ot rule(normal)": "otRuleNormal",
  "net pay currency": "netPayCurrency",
  "email id": "email",
  "email id_1": "hodEmail",
  "probation status formulated": "probationStatus",
  gender: "gender",
  "visa type": "visaType",
  visa: "visaSponsor",
  "passport number": "passportNumber",
  "bank name": "bankName",
  "iban no:": "iban",
  "iban no": "iban",
  iban: "iban",
  wps: "wpsEnabled",
  hod: "hodName",
  "hod name": "hodName",
  "hod email": "hodEmail",
  comments: "comments",
  "joining month": "joiningMonth",
  "probation completitin date": "probationCompletionDate",
  "probation completion date": "probationCompletionDate",
  "ctc/ month": "ctcMonth",
  "ctc/ year": "ctcYear",
  "cancellation type": "cancellationType",
  "last working date": "lastWorkingDate",
};

const LEAVE_HEADER_ALIASES: Record<string, string> = {
  "employee id": "empCode",
  "emp code": "empCode",
  "emp id": "empCode",
  "employee code": "empCode",
  name: "name",
  "leave type": "leaveType",
  "start date": "startDate",
  "end date": "endDate",
  "number of days": "days",
  "rejoining date": "rejoiningDate",
  "leave status": "leaveStatus",
  "status as on": "statusAsOn",
  "leave balance": "leaveBalanceSnapshot",
  "current leave balance": "currentLeaveBalanceSnapshot",
  "extende days": "extendedDays",
  "extended days": "extendedDays",
  remanrk: "remark",
  remark: "remark",
};

function buildMasterHeaderMap(row: Record<string, unknown>) {
  return buildHeaderMap(row, MASTER_HEADER_ALIASES);
}

async function findExistingEmployeeForMasterImport(empCode: string, legacyEmpId?: string) {
  const byCode = await prisma.employee.findUnique({ where: { employeeCode: empCode } });
  if (byCode) return byCode;
  if (legacyEmpId) {
    const byLegacy = await prisma.employee.findFirst({ where: { legacyEmpId } });
    if (byLegacy) return byLegacy;
  }
  return null;
}

async function resolveImportEmail(
  mappedEmail: string | undefined,
  existing?: { id: string; email: string | null; accessEnabled: boolean; loginEmail?: string | null },
) {
  const imported = mappedEmail?.trim().toLowerCase();
  const validImported = imported && imported.includes("@") ? imported : undefined;
  const isPlaceholder = (value: string | null | undefined) =>
    Boolean(value?.includes("@hrms-import.local"));

  if (!existing) {
    if (!validImported) return null;
    const conflict = await prisma.employee.findFirst({ where: { email: validImported } });
    if (conflict) return null;
    return validImported;
  }

  if (existing.accessEnabled && existing.email) {
    return existing.email;
  }

  if (!validImported) {
    if (isPlaceholder(existing.email)) return null;
    return existing.email;
  }

  if (existing.email && validImported === existing.email.toLowerCase()) {
    return existing.email;
  }

  const conflict = await prisma.employee.findFirst({
    where: { email: validImported, NOT: { id: existing.id } },
  });
  if (conflict) {
    return isPlaceholder(existing.email) ? null : existing.email;
  }

  return validImported;
}

function buildLeaveHeaderMap(row: Record<string, unknown>) {
  return buildHeaderMap(row, LEAVE_HEADER_ALIASES);
}

function parseWps(value: unknown) {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return true;
  if (["no", "false", "0", "n"].includes(text)) return false;
  return true;
}

export async function importEmployeesFromWorkbook(
  buffer: Buffer,
  options?: { sheetNames?: string[]; separated?: boolean } & ImportCallbacks,
): Promise<ImportResult> {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetNames = options?.sheetNames?.length
    ? options.sheetNames
    : options?.separated
      ? workbook.SheetNames
      : [workbook.SheetNames[0]];

  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };
  const hodEmailByName = new Map<string, string>();
  const sheetsData: Array<{ sheetName: string; headerMap: Record<string, string>; rows: Record<string, unknown>[]; isSeparated: boolean }> = [];
  let totalRows = 0;

  for (const sheetName of sheetNames) {
    if (!workbook.SheetNames.includes(sheetName)) continue;
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    if (!rawRows.length) continue;
    const headerMap = buildMasterHeaderMap(rawRows[0] ?? {});
    const isSeparated = sheetName.toLowerCase().includes("separat");
    sheetsData.push({ sheetName, headerMap, rows: rawRows, isSeparated });
    totalRows += rawRows.length;
  }

  options?.onProgress?.({ processed: 0, total: totalRows, phase: "importing" });
  let processedRows = 0;

  for (const sheet of sheetsData) {
    const { sheetName, headerMap, rows: rawRows, isSeparated } = sheet;

    for (let i = 0; i < rawRows.length; i += 1) {
      const rowNum = i + 2;
      const mapped = mapRow(headerMap, rawRows[i]);
      processedRows += 1;
      options?.onProgress?.({
        processed: processedRows,
        total: totalRows,
        phase: "importing",
        sheetName,
      });
      const empCode = pickString(mapped.empCode);
      const name = pickString(mapped.name);
      if (!empCode || !name) {
        result.skipped += 1;
        continue;
      }

      try {
        const { firstName, lastName } = splitFullName(name);

        const legacyEmpId = pickString(mapped.legacyEmpId);
        const existing = await findExistingEmployeeForMasterImport(empCode, legacyEmpId);
        const email = await resolveImportEmail(pickString(mapped.email), existing ?? undefined);
        const hodName = pickString(mapped.hodName);
        const hodEmail = pickString(mapped.hodEmail);
        if (hodName && hodEmail) hodEmailByName.set(hodName.toLowerCase(), hodEmail);

        const dateOfJoining = parseExcelDate(mapped.dateOfJoining) ?? existing?.dateOfJoining ?? new Date();
        const payload = {
          employeeCode: existing?.employeeCode ?? empCode,
          legacyEmpId,
          firstName,
          lastName,
          email,
          dateOfBirth: parseExcelDate(mapped.dateOfBirth) ?? undefined,
          dateOfJoining,
          designation: pickString(mapped.designation) ?? "Staff",
          department: pickString(mapped.department) ?? "General",
          nationality: pickString(mapped.nationality),
          passportNumber: pickString(mapped.passportNumber),
          employmentType: "Full-Time",
          workMode: "OFFICE",
          basicSalary: parseExcelNumber(mapped.basicSalary),
          housingAllowance: parseExcelNumber(mapped.housingAllowance),
          transportAllowance: parseExcelNumber(mapped.transportAllowance),
          conveyanceAllowance: parseExcelNumber(mapped.conveyanceAllowance),
          fixedOtAllowance: parseExcelNumber(mapped.fixedOtAllowance),
          foodAllowance: parseExcelNumber(mapped.foodAllowance),
          otherAllowance: parseExcelNumber(mapped.otherAllowance),
          overseasAllowance: parseExcelNumber(mapped.overseasAllowance),
          performanceAllowance: parseExcelNumber(mapped.performanceAllowance),
          petrolAllowance: parseExcelNumber(mapped.petrolAllowance),
          riskAllowance: parseExcelNumber(mapped.riskAllowance),
          socialInsurance: parseExcelNumber(mapped.socialInsurance),
          telephoneAllowance: parseExcelNumber(mapped.telephoneAllowance),
          vehicleAllowance: parseExcelNumber(mapped.vehicleAllowance),
          kidsEducationAllowance: parseExcelNumber(mapped.kidsEducationAllowance),
          grossSalary: parseExcelNumber(mapped.grossSalary),
          otEligible: pickString(mapped.otEligible),
          otRuleNormal: parseExcelNumber(mapped.otRuleNormal),
          netPayCurrency: normalizePayCurrency(pickString(mapped.netPayCurrency), pickString(mapped.workCountry)),
          iban: pickString(mapped.iban),
          bankName: pickString(mapped.bankName),
          wpsEnabled: parseWps(mapped.wpsEnabled),
          gender: pickString(mapped.gender),
          category: pickString(mapped.category),
          subCategory: pickString(mapped.subCategory),
          grade: pickString(mapped.grade),
          employeeType: pickString(mapped.employeeType),
          businessUnit: pickString(mapped.businessUnit),
          division: pickString(mapped.division),
          workLocation: pickString(mapped.workLocation),
          workCountry: pickString(mapped.workCountry),
          payrollType: pickString(mapped.payrollType),
          payrollStatus: pickString(mapped.payrollStatus),
          payrollDivision: pickString(mapped.payrollDivision),
          visaType: pickString(mapped.visaType),
          visaSponsor: pickString(mapped.visaSponsor),
          hodName,
          hodEmail,
          comments: pickString(mapped.comments),
          probationStatus: pickString(mapped.probationStatus),
          joiningMonth: pickString(mapped.joiningMonth),
          probationCompletionDate: parseExcelDate(mapped.probationCompletionDate) ?? undefined,
          ctcMonth: parseExcelNumber(mapped.ctcMonth) || undefined,
          ctcYear: parseExcelNumber(mapped.ctcYear) || undefined,
          cancellationType: pickString(mapped.cancellationType),
          lastWorkingDate: parseExcelDate(mapped.lastWorkingDate) ?? undefined,
          role: mapCategoryToRole(pickString(mapped.category), pickString(mapped.employeeType)),
          status: isSeparated || pickString(mapped.payrollStatus)?.toUpperCase() === "CANCELLED"
            ? "TERMINATED"
            : (existing?.status ?? "ACTIVE"),
          accessEnabled: existing?.accessEnabled ?? false,
        };

        if (existing) {
          await prisma.employee.update({ where: { id: existing.id }, data: payload });
          result.updated += 1;
        } else {
          await prisma.employee.create({ data: payload });
          result.created += 1;
        }
      } catch (error) {
        result.errors.push({
          row: rowNum,
          message: error instanceof Error ? error.message : "Import failed",
        });
      }
    }
  }

  options?.onProgress?.({ processed: totalRows, total: totalRows, phase: "managers" });
  for (const [hodName, hodEmail] of hodEmailByName.entries()) {
    const manager = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: hodEmail },
          { loginEmail: hodEmail },
        ],
      },
    });
    if (!manager) continue;
    await prisma.employee.updateMany({
      where: { hodName: { equals: hodName, mode: "insensitive" } },
      data: { managerId: manager.id },
    });
  }

  return result;
}

const LEAVE_TYPE_ALIASES: Record<string, string> = {
  "annual leave": "AL",
  "annual levae": "AL",
  "anuual leave": "AL",
  "annual leave(medical)": "AL",
  "annual leave (umrah)": "UMRAH",
  "annual leave (medical)": "AL",
  "emergency leave": "EL",
  "emergency leave(medical)": "EL",
  "emergency  leave(medical)": "EL",
  "emergancy leave": "EL",
  "sick leave": "SL",
  "sick levae": "SL",
  "maternity leave": "MLF",
  "paternity leave": "PL",
  "others (paternity)": "PL",
  umrah: "UMRAH",
  "umrah leave": "UMRAH",
  ummrah: "UMRAH",
  "hajj leave": "UMRAH",
  "other, (easter)": "EL",
  "casual leave": "CL",
  "unpaid leave": "UL",
};

function normalizeLeaveTypeName(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

async function resolveLeaveTypeId(rawType: string) {
  const normalized = normalizeLeaveTypeName(rawType);
  const code = LEAVE_TYPE_ALIASES[normalized];
  if (code) {
    const byCode = await prisma.leaveType.findUnique({ where: { code } });
    if (byCode) return byCode.id;
  }
  const byName = await prisma.leaveType.findFirst({
    where: { name: { equals: rawType.trim(), mode: "insensitive" } },
  });
  if (byName) return byName.id;

  const created = await prisma.leaveType.create({
    data: {
      name: rawType.trim(),
      code: `IMP_${normalized.replace(/[^a-z0-9]/g, "_").toUpperCase().slice(0, 8)}_${Date.now().toString(36).slice(-4)}`,
      yearlyAllocation: 0,
      maxCarryForward: 0,
      balanceMode: "NONE",
      payRate: "FULL",
      paidLeave: true,
      active: true,
    },
  });
  return created.id;
}

function mapImportedLeaveStatus(statusAsOn?: string, leaveStatus?: string) {
  const value = (statusAsOn || leaveStatus || "").toLowerCase();
  if (value.includes("reject")) return LeaveStatus.REJECTED;
  if (value.includes("applied") || value.includes("pending")) return LeaveStatus.PENDING_L2;
  return LeaveStatus.APPROVED;
}

function mapEmployeeStatusFromLeave(statusAsOn?: string) {
  const value = (statusAsOn || "").toLowerCase();
  if (value.includes("on leave") || value.includes("not rejoined") || value.includes("overstay")) {
    return "ON_LEAVE";
  }
  return undefined;
}

async function findEmployeeForLeaveImport(empCode: string) {
  const direct = await prisma.employee.findUnique({ where: { employeeCode: empCode } });
  if (direct) return direct;

  const legacy = await prisma.employee.findFirst({ where: { legacyEmpId: empCode } });
  if (legacy) return legacy;

  if (/^\d+$/.test(empCode)) {
    const numeric = Number(empCode);
    const legacyCandidates = [
      `10EMP${empCode}`,
      `10EMP${String(numeric)}`,
      `10EMP${String(numeric).padStart(4, "0")}`,
    ];
    for (const candidate of legacyCandidates) {
      const match = await prisma.employee.findFirst({ where: { legacyEmpId: candidate } });
      if (match) return match;
    }
  }

  return null;
}

function pickLeaveImportSheet(workbook: XLSX.WorkBook, sheetName?: string) {
  if (sheetName && workbook.SheetNames.includes(sheetName)) return sheetName;
  const preferred = workbook.SheetNames.find((name) => /leave tracker|leave history|leave report/i.test(name));
  return preferred ?? workbook.SheetNames[0];
}

export async function importLeaveFromWorkbook(
  buffer: Buffer,
  sheetName?: string,
  callbacks?: ImportCallbacks,
): Promise<ImportResult> {
  await syncDefaultLeaveTypes();
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const targetSheet = pickLeaveImportSheet(workbook, sheetName);
  const sheet = workbook.Sheets[targetSheet];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: true, dateNF: "yyyy-mm-dd" });
  if (!rows.length) {
    return { created: 0, updated: 0, skipped: 0, errors: [{ row: 0, message: "No rows found" }] };
  }

  const headerMap = buildLeaveHeaderMap(rows[0] as Record<string, unknown>);
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };
  const totalRows = rows.length;

  callbacks?.onProgress?.({ processed: 0, total: totalRows, phase: "importing", sheetName: targetSheet });

  for (let i = 0; i < rows.length; i += 1) {
    const rowNum = i + 2;
    const mapped = mapRow(headerMap, rows[i] as Record<string, unknown>);
    callbacks?.onProgress?.({
      processed: i + 1,
      total: totalRows,
      phase: "importing",
      sheetName: targetSheet,
    });
    const empCode = pickString(mapped.empCode);
    if (!empCode) {
      result.skipped += 1;
      continue;
    }

    try {
      const employee = await findEmployeeForLeaveImport(empCode);
      if (!employee) {
        result.errors.push({ row: rowNum, message: `Employee ${empCode} not found. Import employee master first or check the Employee ID column.` });
        continue;
      }

      const leaveTypeRaw = pickString(mapped.leaveType);
      if (!leaveTypeRaw) {
        result.skipped += 1;
        continue;
      }

      const startDate = parseExcelDate(mapped.startDate);
      const endDate = parseExcelDate(mapped.endDate);
      if (!startDate || !endDate) {
        result.errors.push({ row: rowNum, message: "Invalid start or end date" });
        continue;
      }

      const days = parseExcelNumber(mapped.days) || Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
      const leaveTypeId = await resolveLeaveTypeId(leaveTypeRaw);
      const statusAsOn = pickString(mapped.statusAsOn) ?? pickString(mapped.leaveStatus);
      const status = mapImportedLeaveStatus(statusAsOn, pickString(mapped.leaveStatus));

      const data = {
        employeeId: employee.id,
        leaveTypeId,
        startDate,
        endDate,
        days,
        reason: pickString(mapped.remark) ?? "",
        remark: pickString(mapped.remark),
        rejoiningDate: parseExcelDate(mapped.rejoiningDate) ?? undefined,
        statusAsOn,
        leaveBalanceSnapshot: parseExcelNumber(mapped.leaveBalanceSnapshot) || undefined,
        currentLeaveBalanceSnapshot: parseExcelNumber(mapped.currentLeaveBalanceSnapshot) || undefined,
        extendedDays: parseExcelNumber(mapped.extendedDays),
        status,
        approvedAt: status === LeaveStatus.APPROVED ? endDate : undefined,
      };

      const existing = await prisma.leaveRequest.findFirst({
        where: { employeeId: employee.id, leaveTypeId, startDate, endDate },
      });

      if (existing) {
        await prisma.leaveRequest.update({ where: { id: existing.id }, data });
        result.updated += 1;
      } else {
        await prisma.leaveRequest.create({ data: data });
        result.created += 1;
      }

      const employeeStatus = mapEmployeeStatusFromLeave(statusAsOn);
      if (employeeStatus) {
        await prisma.employee.update({ where: { id: employee.id }, data: { status: employeeStatus } });
      }
    } catch (error) {
      result.errors.push({
        row: rowNum,
        message: error instanceof Error ? error.message : "Import failed",
      });
    }
  }

  return result;
}
