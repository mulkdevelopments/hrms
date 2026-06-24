import { prisma } from "./prisma.js";
import { getPayrollDualApprovalThreshold } from "./master-data.js";

const CATEGORY_GL: Record<string, string> = {
  LOAN_RECOVERY: "GL-5004",
  SALARY_ADVANCE: "GL-5003",
  OTHER_DEDUCTION: "GL-5099",
  OTHER_ADDITION: "GL-4099",
  REIMBURSEMENT: "GL-4004",
};

async function generateAdjustmentReference(prefix = "ADJ") {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.payrollAdjustment.count();
  return `${prefix}-${stamp}-${String(count + 1).padStart(5, "0")}`;
}

export async function createPayAdjustmentForClearanceItem(input: {
  checklistItemId: string;
  employeeId: string;
  exitRecordId: string;
  itemLabel: string;
  amount: number;
  adjustmentType: "DEDUCTION" | "ADDITION";
  category: string;
  effectiveMonth: number;
  effectiveYear: number;
  createdById?: string | null;
  remarks?: string | null;
}) {
  const requiresDualApproval = input.amount >= (await getPayrollDualApprovalThreshold());
  const reasonParts = [
    `Exit clearance — ${input.itemLabel}.`,
    input.remarks?.trim(),
  ].filter(Boolean);

  const adjustment = await prisma.payrollAdjustment.create({
    data: {
      referenceNumber: await generateAdjustmentReference(),
      employeeId: input.employeeId,
      type: input.adjustmentType,
      category: input.category,
      glCode: CATEGORY_GL[input.category] ?? null,
      amount: input.amount,
      effectiveMonth: input.effectiveMonth,
      effectiveYear: input.effectiveYear,
      reason: reasonParts.join(" ").slice(0, 500),
      status: "DRAFT",
      requiresDualApproval,
      createdById: input.createdById ?? null,
    },
  });

  await prisma.clearanceChecklistItem.update({
    where: { id: input.checklistItemId },
    data: {
      amount: input.amount,
      adjustmentType: input.adjustmentType,
      adjustmentCategory: input.category,
      payrollAdjustmentId: adjustment.id,
    },
  });

  return adjustment;
}

export async function clearPayAdjustmentForChecklistItem(checklistItemId: string) {
  const item = await prisma.clearanceChecklistItem.findUnique({
    where: { id: checklistItemId },
    include: { payrollAdjustment: true },
  });
  if (!item?.payrollAdjustmentId || !item.payrollAdjustment) {
    return;
  }

  const blockedStatuses = ["APPROVED", "PROCESSED", "PENDING_L2"];
  if (blockedStatuses.includes(item.payrollAdjustment.status)) {
    throw new Error(
      `Cannot reopen this item — linked pay adjustment ${item.payrollAdjustment.referenceNumber} is already ${item.payrollAdjustment.status.toLowerCase().replace("_", " ")}.`,
    );
  }

  await prisma.payrollAdjustment.delete({ where: { id: item.payrollAdjustment.id } });
  await prisma.clearanceChecklistItem.update({
    where: { id: checklistItemId },
    data: {
      amount: null,
      adjustmentType: null,
      adjustmentCategory: null,
      payrollAdjustmentId: null,
    },
  });
}
