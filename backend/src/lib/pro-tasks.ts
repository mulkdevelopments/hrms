import { prisma } from "./prisma.js";

export const NEW_VISA_ONBOARDING_FLOW = [
  "VISA_PROCESSING",
  "EVISA",
  "NON_EXIT",
  "MEDICAL",
  "EID",
  "COMPLETED",
] as const;

export const ONBOARDING_INITIAL_STATUS = "VISA_PROCESSING";

const LEGACY_NEW_VISA_STATUSES = [
  "DOCUMENTS_REQUIRED",
  "ENTRY_PERMIT_SUBMITTED",
  "ENTRY_PERMIT_APPROVED",
  "MEDICAL_IN_PROGRESS",
  "VISA_STAMPING",
];

export async function generateProRef() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.proTask.count();
  return `PRO-${stamp}-${String(count + 1).padStart(5, "0")}`;
}

export async function createOnboardingProTask(employeeId: string, createdById?: string | null) {
  const openTask = await prisma.proTask.findFirst({
    where: {
      employeeId,
      taskType: "NEW_VISA",
      status: { notIn: ["COMPLETED", "ABORTED"] },
    },
  });
  if (openTask) return openTask;

  return prisma.proTask.create({
    data: {
      referenceNumber: await generateProRef(),
      employeeId,
      taskType: "NEW_VISA",
      status: ONBOARDING_INITIAL_STATUS,
      autoCreated: true,
      notes: "Auto-created for employee visa onboarding",
      createdById: createdById ?? null,
    },
  });
}

export async function ensureOnboardingProTasks() {
  const employees = await prisma.employee.findMany({
    where: { status: { notIn: ["RESIGNED", "TERMINATED"] } },
    select: { id: true },
  });

  let created = 0;
  let updated = 0;

  for (const employee of employees) {
    const openTask = await prisma.proTask.findFirst({
      where: {
        employeeId: employee.id,
        taskType: "NEW_VISA",
        status: { notIn: ["COMPLETED", "ABORTED"] },
      },
    });

    if (openTask) {
      if (LEGACY_NEW_VISA_STATUSES.includes(openTask.status)) {
        await prisma.proTask.update({
          where: { id: openTask.id },
          data: { status: ONBOARDING_INITIAL_STATUS },
        });
        updated += 1;
      }
      continue;
    }

    const hadCompleted = await prisma.proTask.findFirst({
      where: { employeeId: employee.id, taskType: "NEW_VISA", status: "COMPLETED" },
    });
    if (hadCompleted) continue;

    await createOnboardingProTask(employee.id);
    created += 1;
  }

  return { created, updated };
}
