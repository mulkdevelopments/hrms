import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";
import { buildHeaderMap, mapRow } from "../src/lib/excel-sheet-utils.js";
import { parseExcelDate, parseExcelNumber, pickString } from "../src/lib/employee-fields.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.resolve(__dirname, "../../Copy of Leave report May.xlsx");

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

function resolveLeaveCode(rawType: string) {
  const normalized = normalizeLeaveTypeName(rawType);
  return LEAVE_TYPE_ALIASES[normalized] ?? normalized.replace(/[^a-z0-9]/g, "_").toUpperCase().slice(0, 8);
}

function mapImportedLeaveStatus(statusAsOn?: string, leaveStatus?: string) {
  const value = (statusAsOn || leaveStatus || "").toLowerCase();
  if (value.includes("reject")) return "REJECTED";
  if (value.includes("applied") || value.includes("pending")) return "PENDING_L2";
  return "APPROVED";
}

function mapEmployeeStatusFromLeave(statusAsOn?: string) {
  const value = (statusAsOn || "").toLowerCase();
  if (value.includes("on leave") || value.includes("not rejoined") || value.includes("overstay")) {
    return "ON_LEAVE";
  }
  return null;
}

function sqlString(value: string | null | undefined, allowEmpty = false) {
  if (value == null || value === "") return allowEmpty ? "''" : "NULL";
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlDate(value: Date | null | undefined) {
  if (!value) return "NULL";
  return `'${value.toISOString()}'::timestamptz`;
}

function sqlNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "NULL";
  return String(value);
}

function employeeMatchSql(empCode: string) {
  const numeric = /^\d+$/.test(empCode);
  const legacyCandidates = numeric
    ? [`10EMP${empCode}`, `10EMP${String(Number(empCode))}`, `10EMP${String(Number(empCode)).padStart(4, "0")}`]
    : [];
  const parts = [
    `e."employeeCode" = ${sqlString(empCode)}`,
    `e."legacyEmpId" = ${sqlString(empCode)}`,
    ...legacyCandidates.map((candidate) => `e."legacyEmpId" = ${sqlString(candidate)}`),
  ];
  return parts.join(" OR ");
}

async function main() {
  const filePath = process.argv[2] ?? defaultPath;
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const workbook = XLSX.read(fs.readFileSync(filePath), { type: "buffer", cellDates: true });
  const preferred = workbook.SheetNames.find((name) => /leave tracker|leave history|leave report/i.test(name));
  const sheet = workbook.Sheets[preferred ?? workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: true, dateNF: "yyyy-mm-dd" });
  const headerMap = buildHeaderMap(rows[0] as Record<string, unknown>, LEAVE_HEADER_ALIASES);

  const statements: string[] = ["BEGIN;"];
  let generated = 0;
  let skipped = 0;

  for (let i = 1; i < rows.length; i += 1) {
    const mapped = mapRow(headerMap, rows[i] as Record<string, unknown>);
    const empCode = pickString(mapped.empCode);
    const leaveTypeRaw = pickString(mapped.leaveType);
    if (!empCode || !leaveTypeRaw) {
      skipped += 1;
      continue;
    }

    const startDate = parseExcelDate(mapped.startDate);
    const endDate = parseExcelDate(mapped.endDate);
    if (!startDate || !endDate) {
      skipped += 1;
      continue;
    }

    const days = parseExcelNumber(mapped.days) || Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
    const leaveCode = resolveLeaveCode(leaveTypeRaw);
    const statusAsOn = pickString(mapped.statusAsOn) ?? pickString(mapped.leaveStatus);
    const status = mapImportedLeaveStatus(statusAsOn, pickString(mapped.leaveStatus));
    const employeeStatus = mapEmployeeStatusFromLeave(statusAsOn);
    const reason = pickString(mapped.remark) ?? "";
    const approvedAt = status === "APPROVED" ? sqlDate(endDate) : "NULL";

    statements.push(`
DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE ${employeeMatchSql(empCode)}
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: ${empCode.replace(/'/g, "''")}';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = ${sqlString(leaveCode)} LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), ${sqlString(leaveTypeRaw.trim())}, ${sqlString(leaveCode)}, 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = ${days},
    reason = ${sqlString(reason, true)},
    remark = ${sqlString(pickString(mapped.remark))},
    "rejoiningDate" = ${sqlDate(parseExcelDate(mapped.rejoiningDate))},
    "statusAsOn" = ${sqlString(statusAsOn)},
    "leaveBalanceSnapshot" = ${sqlNumber(parseExcelNumber(mapped.leaveBalanceSnapshot) || undefined)},
    "currentLeaveBalanceSnapshot" = ${sqlNumber(parseExcelNumber(mapped.currentLeaveBalanceSnapshot) || undefined)},
    "extendedDays" = ${parseExcelNumber(mapped.extendedDays) || 0},
    status = ${sqlString(status)},
    "approvedAt" = ${approvedAt},
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = ${sqlDate(startDate)} AND "endDate" = ${sqlDate(endDate)};

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      ${sqlDate(startDate)},
      ${sqlDate(endDate)},
      ${days},
      ${sqlString(reason, true)},
      ${sqlString(pickString(mapped.remark))},
      ${sqlDate(parseExcelDate(mapped.rejoiningDate))},
      ${sqlString(statusAsOn)},
      ${sqlNumber(parseExcelNumber(mapped.leaveBalanceSnapshot) || undefined)},
      ${sqlNumber(parseExcelNumber(mapped.currentLeaveBalanceSnapshot) || undefined)},
      ${parseExcelNumber(mapped.extendedDays) || 0},
      ${sqlString(status)},
      ${approvedAt},
      NOW(),
      NOW()
    );
  END IF;

  ${employeeStatus ? `UPDATE "Employee" SET status = '${employeeStatus}', "updatedAt" = NOW() WHERE id = emp_id;` : ""}
END $$;`.trim());
    generated += 1;
  }

  statements.push("COMMIT;");
  const outPath = path.resolve(__dirname, "leave-report-may.import.sql");
  fs.writeFileSync(outPath, `${statements.join("\n\n")}\n`);
  console.error(`Generated ${generated} statements (${skipped} skipped) -> ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
