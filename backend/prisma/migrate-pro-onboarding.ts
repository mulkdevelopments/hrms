import { PrismaClient } from "@prisma/client";
import { ensureOnboardingProTasks } from "../src/lib/pro-tasks.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating PRO onboarding tasks for employees without an open new-visa task…");
  const result = await ensureOnboardingProTasks();
  console.log(`Created ${result.created} task(s), updated ${result.updated} legacy task(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
