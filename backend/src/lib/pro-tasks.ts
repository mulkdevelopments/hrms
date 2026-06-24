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
  const prefix = `PRO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-`;
  const latest = await prisma.proTask.findFirst({
    where: { referenceNumber: { startsWith: prefix } },
    orderBy: { referenceNumber: "desc" },
    select: { referenceNumber: true },
  });
  const lastSeq = latest
    ? Number(latest.referenceNumber.slice(prefix.length)) || 0
    : 0;
  return `${prefix}${String(lastSeq + 1).padStart(5, "0")}`;
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

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.proTask.create({
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
    } catch (error) {
      const isDuplicateRef = error instanceof Error
        && "code" in error
        && (error as { code?: string }).code === "P2002";
      if (!isDuplicateRef || attempt === 2) throw error;
    }
  }

  throw new Error("Unable to create PRO onboarding task");
}

export async function ensureOnboardingProTasks(options?: { recentDays?: number }) {
  const recentDays = options?.recentDays ?? 14;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - recentDays);

  const employees = await prisma.employee.findMany({
    where: {
      status: { notIn: ["RESIGNED", "TERMINATED"] },
      createdAt: { gte: cutoff },
    },
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
