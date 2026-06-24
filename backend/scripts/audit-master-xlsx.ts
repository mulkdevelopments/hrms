import * as fs from "node:fs";
import * as XLSX from "xlsx";
import { prisma } from "../src/lib/prisma.js";
import { buildHeaderMap, mapRow, normalizeHeader, sheetRowsFromWorksheet } from "../src/lib/excel-sheet-utils.js";

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

const path = process.argv[2] ?? "../Copy MASTER EMPLOYEE LIST 23 06 2026.xlsx";

async function main() {
  const buffer = fs.readFileSync(path);
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = sheetRowsFromWorksheet(sheet, 5000);
  const rawHeaders = Object.keys(rows[0] ?? {});

  console.log("File:", path);
  console.log("Sheet:", wb.SheetNames[0]);
  console.log("Raw columns:", rawHeaders.length);

  const headers = buildHeaderMap(rows[0], MASTER_HEADER_ALIASES);
  const mappedKeys = new Set(Object.values(headers));
  const unmapped = rawHeaders.filter((h) => !headers[h]);

  console.log("\n--- Unmapped Excel columns ---");
  unmapped.forEach((h) => console.log(`  ${JSON.stringify(h)} (${normalizeHeader(h)})`));

  console.log("\n--- Email-related columns ---");
  rawHeaders
    .filter((h) => normalizeHeader(h).includes("email"))
    .forEach((h) => console.log(`  ${JSON.stringify(h)} -> ${headers[h] ?? "UNMAPPED"}`));

  let withEmail = 0;
  let withRealEmail = 0;
  let withHodEmail = 0;
  let total = 0;
  for (const row of rows) {
    const mapped = mapRow(headers, row);
    const empCode = String(mapped.empCode ?? "").trim();
    if (!empCode) continue;
    total += 1;
    const email = String(mapped.email ?? "").trim();
    const hod = String(mapped.hodEmail ?? "").trim();
    if (email) withEmail += 1;
    if (email.includes("@") && !email.includes("hrms-import")) withRealEmail += 1;
    if (hod) withHodEmail += 1;
  }

  console.log("\n--- Excel email coverage ---");
  console.log(`Rows with emp code: ${total}`);
  console.log(`Employee email column filled: ${withEmail} (${((100 * withEmail) / total).toFixed(1)}%)`);
  console.log(`Real-looking employee emails: ${withRealEmail} (${((100 * withRealEmail) / total).toFixed(1)}%)`);
  console.log(`HOD email column filled: ${withHodEmail}`);

  const dbTotal = await prisma.employee.count();
  const dbPlaceholder = await prisma.employee.count({ where: { email: { contains: "@hrms-import.local" } } });
  const dbReal = dbTotal - dbPlaceholder;
  console.log("\n--- Database email state ---");
  console.log(`Total employees: ${dbTotal}`);
  console.log(`Placeholder emails: ${dbPlaceholder}`);
  console.log(`Real emails: ${dbReal}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
