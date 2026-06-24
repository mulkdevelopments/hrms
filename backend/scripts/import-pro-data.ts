import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { importProDataFromWorkbook } from "../src/lib/pro-excel-import.js";
import { prisma } from "../src/lib/prisma.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.resolve(__dirname, "../../Employee Master Data and All Companies Updated Employees List.xlsx");

async function main() {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  const includeCompanySheets = process.argv.includes("--all-sheets");
  const filePath = args[0] ?? defaultPath;
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const buffer = fs.readFileSync(filePath);
  console.log(`Importing PRO data from ${filePath}`);
  console.log(`Include company sheets: ${includeCompanySheets}`);

  const started = Date.now();
  console.log("Reading workbook…");
  const result = await importProDataFromWorkbook(buffer, {
    includeCompanySheets,
    onProgress: ({ processed, total, sheetName }) => {
      if (processed === total || processed % 250 === 0) {
        console.log(`  ${processed}/${total} · ${sheetName ?? ""}`);
      }
    },
  });

  const docs = await prisma.employeeDocument.count();
  console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log(JSON.stringify({ ...result, errorCount: result.errors.length }, null, 2));
  if (result.errors.length) {
    console.log("\nSample errors:");
    result.errors.slice(0, 10).forEach((error) => {
      console.log(`  ${error.sheetName} row ${error.row}: ${error.message}`);
    });
  }
  console.log(`\nTotal PRO documents in DB: ${docs}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
