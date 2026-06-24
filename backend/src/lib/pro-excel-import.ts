import * as XLSX from "xlsx";
import { prisma } from "./prisma.js";
import { parseExcelDate, pickString } from "./employee-fields.js";
import {
  buildHeaderMap,
  mapRow,
  normalizeHeader,
  sheetRowsFromWorksheet,
} from "./excel-sheet-utils.js";
import { syncProDocumentsFromImport, buildProDocumentIndex, type ProDocumentIndex } from "./import-pro-documents.js";

export type ProImportResult = {
  updated: number;
  skipped: number;
  proDocsCreated: number;
  proDocsUpdated: number;
  errors: { row: number; sheetName: string; message: string }[];
};

export type ProImportProgress = {
  processed: number;
  total: number;
  sheetName?: string;
};

const PRO_MASTER_ALIASES: Record<string, string> = {
  "e.code": "empCode",
  "new employee codes": "legacyEmpId",
  "name of employee": "name",
  nationality: "nationality",
  department: "department",
  "visa & emirates id expiry date": "visaEmiratesExpiry",
  "emirates id number": "emiratesId",
  "labor card number": "labourCardNumber",
  "labour card number": "labourCardNumber",
  "person code": "personCode",
  "labor card expiry date": "labourCardExpiry",
  "labour card expiry date": "labourCardExpiry",
  "visa type": "visaType",
  visa: "visaSponsor",
  "visa status": "visaStatus",
  emirate: "workLocation",
};

const PRO_COMPANY_ALIASES: Record<string, string> = {
  "s no": "_index",
  "s.number": "_index",
  name: "name",
  employename: "name",
  "id card": "labourCardNumber",
  passport: "passportNumber",
  "passport number": "passportNumber",
  "visa expiry": "visaEmiratesExpiry",
  "visa expiry date": "visaEmiratesExpiry",
  "unified id": "emiratesId",
  "visa file number": "visaFileNumber",
  "labour card expiry": "labourCardExpiry",
  type: "visaType",
};

function buildProHeaderMap(row: Record<string, unknown>, companySheet: boolean) {
  const aliases = companySheet ? { ...PRO_MASTER_ALIASES, ...PRO_COMPANY_ALIASES } : PRO_MASTER_ALIASES;
  const headers = buildHeaderMap(row, aliases);
  if (companySheet) {
    Object.keys(headers).forEach((key) => {
      if (headers[key] === "visaType" && normalizeHeader(key) === "type") return;
      if (normalizeHeader(key) === "type" && !headers[key]) headers[key] = "visaType";
    });
  }
  return headers;
}

function headerValues(headerMap: Record<string, string>) {
  return new Set(Object.values(headerMap));
}

function isProCompanySheet(headerMap: Record<string, string>) {
  const aliases = headerValues(headerMap);
  return aliases.has("name")
    && (aliases.has("visaEmiratesExpiry") || aliases.has("passportNumber") || aliases.has("emiratesId"))
    && !aliases.has("empCode");
}

function pickProMasterSheet(workbook: XLSX.WorkBook) {
  const named = workbook.SheetNames.find((name) => /employee master data/i.test(name));
  return named ?? workbook.SheetNames[0];
}

function pickProImportSheets(workbook: XLSX.WorkBook, includeCompanySheets: boolean) {
  const master = pickProMasterSheet(workbook);
  if (!includeCompanySheets) return [master];
  return workbook.SheetNames.filter((name) => {
    if (name === master) return true;
    const headerRow = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[name], { defval: "", range: 0 })[0];
    if (!headerRow) return false;
    return isProCompanySheet(buildProHeaderMap(headerRow, true));
  });
}

type ProEmployeeMatch = {
  id: string;
  employeeCode: string;
  legacyEmpId: string | null;
  passportNumber: string | null;
  emiratesId: string | null;
};

type ProEmployeeIndex = {
  byCode: Map<string, ProEmployeeMatch>;
  byLegacy: Map<string, ProEmployeeMatch>;
  byPassport: Map<string, ProEmployeeMatch>;
  byEid: Map<string, ProEmployeeMatch>;
};

async function buildProEmployeeIndex(): Promise<ProEmployeeIndex> {
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      employeeCode: true,
      legacyEmpId: true,
      passportNumber: true,
      emiratesId: true,
    },
  });

  const byCode = new Map<string, ProEmployeeMatch>();
  const byLegacy = new Map<string, ProEmployeeMatch>();
  const byPassport = new Map<string, ProEmployeeMatch>();
  const byEid = new Map<string, ProEmployeeMatch>();

  for (const employee of employees) {
    byCode.set(employee.employeeCode, employee);
    if (employee.legacyEmpId) byLegacy.set(employee.legacyEmpId, employee);
    if (employee.passportNumber) byPassport.set(employee.passportNumber, employee);
    if (employee.emiratesId) byEid.set(employee.emiratesId, employee);
  }

  return { byCode, byLegacy, byPassport, byEid };
}

function findEmployeeForProImport(mapped: Record<string, unknown>, index: ProEmployeeIndex) {
  const empCode = pickString(mapped.empCode);
  if (empCode) {
    const direct = index.byCode.get(empCode);
    if (direct) return direct;
    if (/^\d+$/.test(empCode)) {
      const legacyCandidates = [
        `10EMP${empCode}`,
        `10EMP${String(Number(empCode)).padStart(4, "0")}`,
      ];
      for (const legacyEmpId of legacyCandidates) {
        const match = index.byLegacy.get(legacyEmpId);
        if (match) return match;
      }
    }
  }

  const legacyEmpId = pickString(mapped.legacyEmpId);
  if (legacyEmpId) {
    const byLegacy = index.byLegacy.get(legacyEmpId);
    if (byLegacy) return byLegacy;
  }

  const passport = pickString(mapped.passportNumber);
  if (passport) {
    const byPassport = index.byPassport.get(passport);
    if (byPassport) return byPassport;
  }

  const emiratesId = pickString(mapped.emiratesId);
  if (emiratesId) {
    const byEid = index.byEid.get(emiratesId);
    if (byEid) return byEid;
  }

  return null;
}

function buildProEmployeeUpdate(mapped: Record<string, unknown>) {
  return {
    emiratesId: pickString(mapped.emiratesId),
    passportNumber: pickString(mapped.passportNumber),
    labourCardNumber: pickString(mapped.labourCardNumber) ?? pickString(mapped.visaFileNumber),
    visaType: pickString(mapped.visaType),
    visaSponsor: pickString(mapped.visaSponsor),
    workLocation: pickString(mapped.workLocation),
    nationality: pickString(mapped.nationality),
    department: pickString(mapped.department),
  };
}

export async function importProDataFromWorkbook(
  buffer: Buffer,
  options?: { includeCompanySheets?: boolean; onProgress?: (progress: ProImportProgress) => void },
): Promise<ProImportResult> {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: false,
    sheetRows: 5000,
  });
  const sheetNames = pickProImportSheets(workbook, options?.includeCompanySheets ?? false);
  const result: ProImportResult = {
    updated: 0,
    skipped: 0,
    proDocsCreated: 0,
    proDocsUpdated: 0,
    errors: [],
  };

  const sheets: Array<{ sheetName: string; headerMap: Record<string, string>; rows: Record<string, unknown>[] }> = [];
  let totalRows = 0;
  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const headerRow = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", range: 0 })[0];
    if (!headerRow) continue;
    const companySheet = sheetName !== pickProMasterSheet(workbook)
      && isProCompanySheet(buildProHeaderMap(headerRow, true));
    const headerMap = buildProHeaderMap(headerRow, companySheet);
    const rows = sheetRowsFromWorksheet(sheet);
    if (!rows.length) continue;
    sheets.push({ sheetName, headerMap, rows });
    totalRows += rows.length;
  }

  let processed = 0;
  const employeeIndex = await buildProEmployeeIndex();
  const documentIndex = await buildProDocumentIndex();

  for (const { sheetName, headerMap, rows } of sheets) {
    for (let i = 0; i < rows.length; i += 1) {
      processed += 1;
      options?.onProgress?.({ processed, total: totalRows, sheetName });
      const mapped = mapRow(headerMap, rows[i]);
      const hasProData = Object.values(mapped).some((value) => pickString(value));
      if (!hasProData) {
        result.skipped += 1;
        continue;
      }

      try {
        const employee = findEmployeeForProImport(mapped, employeeIndex);
        if (!employee) {
          const label = pickString(mapped.empCode) ?? pickString(mapped.legacyEmpId) ?? pickString(mapped.name) ?? "row";
          result.errors.push({
            row: i + 2,
            sheetName,
            message: `Employee ${label} not found. Import master.xlsx first.`,
          });
          continue;
        }

        const update = buildProEmployeeUpdate(mapped);
        const hasEmployeeFieldUpdate = Object.values(update).some((value) => value != null && value !== "");
        if (hasEmployeeFieldUpdate) {
          await prisma.employee.update({
            where: { id: employee.id },
            data: Object.fromEntries(Object.entries(update).filter(([, value]) => value != null && value !== "")),
          });
        }

        const proDocs = await syncProDocumentsFromImport(employee.id, mapped, documentIndex);
        result.proDocsCreated += proDocs.created;
        result.proDocsUpdated += proDocs.updated;
        result.updated += 1;
      } catch (error) {
        result.errors.push({
          row: i + 2,
          sheetName,
          message: error instanceof Error ? error.message : "PRO import failed",
        });
      }
    }
  }

  return result;
}
