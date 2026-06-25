BEGIN;

CREATE TEMP TABLE seed_employees_to_delete ON COMMIT DROP AS
SELECT e.id
FROM "Employee" e
WHERE e.id <> (
  SELECT id
  FROM "Employee"
  WHERE "loginEmail" = 'admin@hrms.com'
    AND role = 'SUPER_ADMIN'
  LIMIT 1
)
AND e."legacyEmpId" IS NULL
AND (
  e."employeeCode" ~ '^EMP-000[2-9]'
  OR e."employeeCode" ~ '^EMP-900'
  OR e."employeeCode" ~ '^EMP-CEO'
  OR e."loginEmail" LIKE '%@hrms.com'
  OR e.email LIKE '%@hrms.com'
);

UPDATE "Employee"
SET "managerId" = NULL
WHERE "managerId" IN (SELECT id FROM seed_employees_to_delete);

UPDATE "LeaveRequest"
SET "l1ApprovedById" = NULL
WHERE "l1ApprovedById" IN (SELECT id FROM seed_employees_to_delete);

UPDATE "LeaveRequest"
SET "l2ApprovedById" = NULL
WHERE "l2ApprovedById" IN (SELECT id FROM seed_employees_to_delete);

UPDATE "LeaveRequest"
SET "actingApproverId" = NULL
WHERE "actingApproverId" IN (SELECT id FROM seed_employees_to_delete);

UPDATE "ExitRecord"
SET "assignedApproverId" = NULL
WHERE "assignedApproverId" IN (SELECT id FROM seed_employees_to_delete);

UPDATE "ClearanceTask"
SET "assignedManagerId" = NULL
WHERE "assignedManagerId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "ClearanceChecklistItem"
WHERE "clearanceTaskId" IN (
  SELECT ct.id
  FROM "ClearanceTask" ct
  JOIN "ExitRecord" er ON er.id = ct."exitRecordId"
  WHERE er."employeeId" IN (SELECT id FROM seed_employees_to_delete)
);

DELETE FROM "ClearanceTask"
WHERE "exitRecordId" IN (
  SELECT id FROM "ExitRecord" WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete)
);

DELETE FROM "FinalSettlement"
WHERE "exitRecordId" IN (
  SELECT id FROM "ExitRecord" WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete)
);

DELETE FROM "ExitRecord"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

UPDATE "LeaveRequest"
SET "payrollAdjustmentId" = NULL
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "LocationPing"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "AttendanceSession"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "LeaveRequest"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "LeaveBalance"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "Payslip"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "PayrollAdjustment"
WHERE "loanId" IN (
  SELECT id FROM "SalaryAdvanceLoan" WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete)
);

DELETE FROM "SalaryAdvanceLoan"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "PayrollAdjustment"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "EmployeeDocument"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "ProTask"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "Attachment"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "LateAttendanceWarning"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "PasswordResetToken"
WHERE "employeeId" IN (SELECT id FROM seed_employees_to_delete);

DELETE FROM "Employee"
WHERE id IN (SELECT id FROM seed_employees_to_delete);

COMMIT;
