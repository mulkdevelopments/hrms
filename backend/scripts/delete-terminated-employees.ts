import { prisma } from "../src/lib/prisma.js";

async function deleteTerminatedEmployees() {
  const terminated = await prisma.employee.findMany({
    where: { status: "TERMINATED" },
    select: { id: true, employeeCode: true, firstName: true, lastName: true },
    orderBy: { employeeCode: "asc" },
  });

  if (!terminated.length) {
    console.log("No terminated employees found.");
    return { deleted: 0 };
  }

  const ids = terminated.map((employee) => employee.id);
  console.log(`Found ${ids.length} terminated employee(s). Removing related records…`);

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

    console.log(`Deleted ${result.count} terminated employee record(s).`);
    console.log(
      terminated
        .slice(0, 20)
        .map((employee) => `${employee.employeeCode} — ${employee.firstName} ${employee.lastName}`)
        .join("\n"),
    );
    if (terminated.length > 20) {
      console.log(`…and ${terminated.length - 20} more`);
    }

    return result.count;
  });

  return { deleted: terminated.length };
}

deleteTerminatedEmployees()
  .catch((error) => {
    console.error("Failed to delete terminated employees:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
