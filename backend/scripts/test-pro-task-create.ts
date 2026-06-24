import { createOnboardingProTask, ensureOnboardingProTasks } from "../src/lib/pro-tasks.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const emp = await prisma.employee.findFirst({ where: { employeeCode: "1019" } });
  console.log("emp", emp?.id);
  if (emp) {
    try {
      const t = await createOnboardingProTask(emp.id);
      console.log("created", t.referenceNumber, t.status);
    } catch (error) {
      console.error("create error:", error);
    }
  }

  try {
    const r = await ensureOnboardingProTasks();
    console.log("ensure result", r);
  } catch (error) {
    console.error("ensure error:", error);
  }
}

main()
  .finally(() => prisma.$disconnect());
