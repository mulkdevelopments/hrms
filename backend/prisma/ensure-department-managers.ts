import { PrismaClient } from "@prisma/client";
import { CANONICAL_DEPARTMENTS, ensureDepartmentManagers } from "../src/lib/department-managers.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking department managers for:", CANONICAL_DEPARTMENTS.map((d) => d.name).join(", "));
  const result = await ensureDepartmentManagers();
  if (result.existing.length) {
    console.log("\nExisting managers:");
    result.existing.forEach((line) => console.log(`  ✓ ${line}`));
  }
  if (result.created.length) {
    console.log("\nCreated managers (password: Manager@123):");
    result.created.forEach((line) => console.log(`  + ${line}`));
  } else {
    console.log("\nAll departments already have at least one manager.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
