import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { importLeaveFromWorkbook } from "../src/lib/excel-import.js";
import { prisma } from "../src/lib/prisma.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.resolve(__dirname, "../../Copy of Leave report May.xlsx");

async function main() {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  const sheetNameArg = process.argv.find((arg) => arg.startsWith("--sheet="));
  const sheetName = sheetNameArg?.slice("--sheet=".length);
  const filePath = args[0] ?? defaultPath;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const buffer = fs.readFileSync(filePath);
  console.log(`Importing leave data from ${filePath}`);
  if (sheetName) console.log(`Sheet: ${sheetName}`);

  const started = Date.now();
  const result = await importLeaveFromWorkbook(buffer, sheetName, {
    onProgress: ({ processed, total, sheetName: activeSheet }) => {
      if (processed === total || processed % 50 === 0) {
        console.log(`  ${processed}/${total} · ${activeSheet ?? ""}`);
      }
    },
  });

  const totalRequests = await prisma.leaveRequest.count();
  console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log(JSON.stringify({ ...result, errorCount: result.errors.length, totalLeaveRequests: totalRequests }, null, 2));

  if (result.errors.length) {
    console.log("\nSample errors:");
    result.errors.slice(0, 15).forEach((error) => {
      console.log(`  row ${error.row}: ${error.message}`);
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
