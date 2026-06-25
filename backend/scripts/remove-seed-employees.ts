import { prisma } from "../src/lib/prisma.js";

const KEEP_LOGIN_EMAIL = "admin@hrms.com";

function isSeedEmployee(employee: {
  id: string;
  employeeCode: string;
  legacyEmpId: string | null;
  loginEmail: string | null;
  email: string;
}) {
  if (employee.legacyEmpId) return false;
  if (employee.loginEmail?.toLowerCase() === KEEP_LOGIN_EMAIL) return false;
  if (employee.employeeCode === "EMP-0001" && employee.loginEmail?.toLowerCase() === KEEP_LOGIN_EMAIL) {
    return false;
  }

  if (/^EMP-000[2-9]\d*$/.test(employee.employeeCode)) return true;
  if (/^EMP-900/.test(employee.employeeCode)) return true;
  if (/^EMP-CEO/.test(employee.employeeCode)) return true;
  if (employee.loginEmail?.endsWith("@hrms.com")) return true;
  if (employee.email.endsWith("@hrms.com")) return true;

  return false;
}

async function deleteEmployeesSafely(ids: string[]) {
  if (!ids.length) return 0;

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

    await tx.employee.deleteMany({ where: { id: { in: ids } } });
  });

  return ids.length;
}

async function removeSeedEmployees() {
  const keeper = await prisma.employee.findFirst({
    where: {
      role: "SUPER_ADMIN",
      loginEmail: KEEP_LOGIN_EMAIL,
    },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      loginEmail: true,
    },
  });

  if (!keeper) {
    throw new Error(`Could not find super admin login ${KEEP_LOGIN_EMAIL}. Aborting.`);
  }

  const candidates = await prisma.employee.findMany({
    where: { NOT: { id: keeper.id } },
    select: {
      id: true,
      employeeCode: true,
      legacyEmpId: true,
      firstName: true,
      lastName: true,
      email: true,
      loginEmail: true,
      role: true,
    },
    orderBy: { employeeCode: "asc" },
  });

  const toDelete = candidates.filter(isSeedEmployee);
  if (!toDelete.length) {
    console.log(`Keeping ${keeper.employeeCode} — ${keeper.firstName} ${keeper.lastName} (${keeper.loginEmail}).`);
    console.log("No seed/demo employees found to remove.");
    return { kept: keeper, deleted: 0 };
  }

  console.log(`Keeping super admin: ${keeper.employeeCode} — ${keeper.firstName} ${keeper.lastName} (${keeper.loginEmail})`);
  console.log(`Removing ${toDelete.length} seed/demo employee(s):`);
  toDelete.forEach((employee) => {
    console.log(`  - ${employee.employeeCode} ${employee.firstName} ${employee.lastName} [${employee.role}]`);
  });

  const deleted = await deleteEmployeesSafely(toDelete.map((employee) => employee.id));
  console.log(`Deleted ${deleted} employee record(s).`);

  const remainingSuperAdmins = await prisma.employee.count({ where: { role: "SUPER_ADMIN" } });
  console.log(`Remaining SUPER_ADMIN accounts: ${remainingSuperAdmins}`);

  return { kept: keeper, deleted };
}

removeSeedEmployees()
  .catch((error) => {
    console.error("Failed to remove seed employees:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
