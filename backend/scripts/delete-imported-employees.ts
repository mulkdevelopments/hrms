import { prisma } from "../src/lib/prisma.js";

/** Employees created before the first master Excel import (24 Jun 2026). */
const IMPORT_CUTOFF = new Date("2026-06-24T00:00:00.000Z");

async function deleteImportedEmployees() {
  const imported = await prisma.employee.findMany({
    where: { createdAt: { gte: IMPORT_CUTOFF } },
    select: { id: true, employeeCode: true, firstName: true, lastName: true, email: true, createdAt: true },
    orderBy: { employeeCode: "asc" },
  });

  if (!imported.length) {
    console.log("No post-import employees found.");
    return { deleted: 0, kept: await prisma.employee.count() };
  }

  const kept = await prisma.employee.findMany({
    where: { createdAt: { lt: IMPORT_CUTOFF } },
    select: { employeeCode: true, email: true },
    orderBy: { employeeCode: "asc" },
  });

  console.log(`Keeping ${kept.length} pre-import account(s):`);
  kept.forEach((employee) => console.log(`  ${employee.employeeCode}  ${employee.email ?? "(no email)"}`));

  const ids = imported.map((employee) => employee.id);
  console.log(`\nRemoving ${ids.length} imported employee(s) and related records…`);

  await prisma.$transaction(async (tx) => {
    await tx.employee.updateMany({
      where: { managerId: { in: ids } },
      data: { managerId: null },
    });

    await tx.leaveRequest.updateMany({
      where: { l1ApprovedById: { in: ids } },
      data: { l1ApprovedById: null },
    });
    await tx.leaveRequest.updateMany({
      where: { l2ApprovedById: { in: ids } },
      data: { l2ApprovedById: null },
    });
    await tx.leaveRequest.updateMany({
      where: { actingApproverId: { in: ids } },
      data: { actingApproverId: null },
    });

    await tx.exitRecord.updateMany({
      where: { assignedApproverId: { in: ids } },
      data: { assignedApproverId: null },
    });
    await tx.clearanceTask.updateMany({
      where: { assignedManagerId: { in: ids } },
      data: { assignedManagerId: null },
    });

    const exitRecords = await tx.exitRecord.findMany({
      where: { employeeId: { in: ids } },
      select: { id: true },
    });
    const exitRecordIds = exitRecords.map((record) => record.id);

    if (exitRecordIds.length) {
      const clearanceTasks = await tx.clearanceTask.findMany({
        where: { exitRecordId: { in: exitRecordIds } },
        select: { id: true },
      });
      const clearanceTaskIds = clearanceTasks.map((task) => task.id);

      if (clearanceTaskIds.length) {
        await tx.clearanceChecklistItem.deleteMany({
          where: { clearanceTaskId: { in: clearanceTaskIds } },
        });
        await tx.clearanceTask.deleteMany({
          where: { id: { in: clearanceTaskIds } },
        });
      }

      await tx.finalSettlement.deleteMany({
        where: { exitRecordId: { in: exitRecordIds } },
      });
      await tx.exitRecord.deleteMany({
        where: { id: { in: exitRecordIds } },
      });
    }

    await tx.leaveRequest.updateMany({
      where: { employeeId: { in: ids } },
      data: { payrollAdjustmentId: null },
    });

    await tx.locationPing.deleteMany({ where: { employeeId: { in: ids } } });
    await tx.attendanceSession.deleteMany({ where: { employeeId: { in: ids } } });
    await tx.leaveRequest.deleteMany({ where: { employeeId: { in: ids } } });
    await tx.leaveBalance.deleteMany({ where: { employeeId: { in: ids } } });
    await tx.payslip.deleteMany({ where: { employeeId: { in: ids } } });

    const loans = await tx.salaryAdvanceLoan.findMany({
      where: { employeeId: { in: ids } },
      select: { id: true },
    });
    const loanIds = loans.map((loan) => loan.id);
    if (loanIds.length) {
      await tx.payrollAdjustment.deleteMany({ where: { loanId: { in: loanIds } } });
      await tx.salaryAdvanceLoan.deleteMany({ where: { id: { in: loanIds } } });
    }

    await tx.payrollAdjustment.deleteMany({ where: { employeeId: { in: ids } } });
    await tx.employeeDocument.deleteMany({ where: { employeeId: { in: ids } } });
    await tx.proTask.deleteMany({ where: { employeeId: { in: ids } } });
    await tx.attachment.deleteMany({ where: { employeeId: { in: ids } } });
    await tx.lateAttendanceWarning.deleteMany({ where: { employeeId: { in: ids } } });
    await tx.passwordResetToken.deleteMany({ where: { employeeId: { in: ids } } });

    const result = await tx.employee.deleteMany({
      where: { id: { in: ids } },
    });

    console.log(`Deleted ${result.count} imported employee record(s).`);
  });

  const remaining = await prisma.employee.count();
  const remainingDocs = await prisma.employeeDocument.count();
  const remainingTasks = await prisma.proTask.count();
  console.log(`Remaining employees: ${remaining}`);
  console.log(`Remaining PRO documents: ${remainingDocs}`);
  console.log(`Remaining PRO tasks: ${remainingTasks}`);

  return { deleted: imported.length, kept: remaining };
}

deleteImportedEmployees()
  .catch((error) => {
    console.error("Failed to delete imported employees:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
