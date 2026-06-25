BEGIN;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2554' OR e."legacyEmpId" = '2554' OR e."legacyEmpId" = '10EMP2554' OR e."legacyEmpId" = '10EMP2554' OR e."legacyEmpId" = '10EMP2554'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2554';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-14T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 2,
    status = 'APPROVED',
    "approvedAt" = '2025-01-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-11-14T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-11-14T18:29:50.000Z'::timestamptz,
      '2025-01-12T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-01-14T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      2,
      'APPROVED',
      '2025-01-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '232' OR e."legacyEmpId" = '232' OR e."legacyEmpId" = '10EMP232' OR e."legacyEmpId" = '10EMP232' OR e."legacyEmpId" = '10EMP0232'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 232';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-18T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = 74.5,
    "currentLeaveBalanceSnapshot" = 14.5,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-01-14T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-11-16T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-14T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-11-16T18:29:50.000Z'::timestamptz,
      '2025-01-14T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-01-18T18:29:50.000Z'::timestamptz,
      'Rejoined',
      74.5,
      14.5,
      4,
      'APPROVED',
      '2025-01-14T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2450' OR e."legacyEmpId" = '2450' OR e."legacyEmpId" = '10EMP2450' OR e."legacyEmpId" = '10EMP2450' OR e."legacyEmpId" = '10EMP2450'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2450';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-01-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-11-17T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-11-17T18:29:50.000Z'::timestamptz,
      '2025-01-15T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-01-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      4,
      'APPROVED',
      '2025-01-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1806' OR e."legacyEmpId" = '1806' OR e."legacyEmpId" = '10EMP1806' OR e."legacyEmpId" = '10EMP1806' OR e."legacyEmpId" = '10EMP1806'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1806';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-01-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-11-17T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-11-17T18:29:50.000Z'::timestamptz,
      '2025-01-15T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-01-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      4,
      'APPROVED',
      '2025-01-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2628' OR e."legacyEmpId" = '2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2628';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 39,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-02T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-01-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-11-25T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-11-25T18:29:50.000Z'::timestamptz,
      '2025-01-02T18:29:50.000Z'::timestamptz,
      39,
      '',
      NULL,
      '2025-01-02T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-01-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2615' OR e."legacyEmpId" = '2615' OR e."legacyEmpId" = '10EMP2615' OR e."legacyEmpId" = '10EMP2615' OR e."legacyEmpId" = '10EMP2615'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2615';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 46,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 7,
    status = 'APPROVED',
    "approvedAt" = '2025-01-16T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-12-02T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-16T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-12-02T18:29:50.000Z'::timestamptz,
      '2025-01-16T18:29:50.000Z'::timestamptz,
      46,
      '',
      NULL,
      '2025-01-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      7,
      'APPROVED',
      '2025-01-16T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2599' OR e."legacyEmpId" = '2599' OR e."legacyEmpId" = '10EMP2599' OR e."legacyEmpId" = '10EMP2599' OR e."legacyEmpId" = '10EMP2599'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2599';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 46,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 2,
    status = 'APPROVED',
    "approvedAt" = '2025-01-17T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-12-03T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-12-03T18:29:50.000Z'::timestamptz,
      '2025-01-17T18:29:50.000Z'::timestamptz,
      46,
      '',
      NULL,
      '2025-01-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      2,
      'APPROVED',
      '2025-01-17T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1016' OR e."legacyEmpId" = '1016' OR e."legacyEmpId" = '10EMP1016' OR e."legacyEmpId" = '10EMP1016' OR e."legacyEmpId" = '10EMP1016'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1016';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-12T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 7,
    status = 'APPROVED',
    "approvedAt" = '2025-02-05T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-12-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-05T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-12-08T18:29:50.000Z'::timestamptz,
      '2025-02-05T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-02-12T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      7,
      'APPROVED',
      '2025-02-05T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2635' OR e."legacyEmpId" = '2635' OR e."legacyEmpId" = '10EMP2635' OR e."legacyEmpId" = '10EMP2635' OR e."legacyEmpId" = '10EMP2635'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2635';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 9,
    status = 'APPROVED',
    "approvedAt" = '2025-01-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-12-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-12-08T18:29:50.000Z'::timestamptz,
      '2025-01-06T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-01-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      9,
      'APPROVED',
      '2025-01-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2538' OR e."legacyEmpId" = '2538' OR e."legacyEmpId" = '10EMP2538' OR e."legacyEmpId" = '10EMP2538' OR e."legacyEmpId" = '10EMP2538'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2538';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-20T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 8,
    status = 'APPROVED',
    "approvedAt" = '2025-02-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-12-15T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-12-15T18:29:50.000Z'::timestamptz,
      '2025-02-12T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-02-20T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      8,
      'APPROVED',
      '2025-02-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2614' OR e."legacyEmpId" = '2614' OR e."legacyEmpId" = '10EMP2614' OR e."legacyEmpId" = '10EMP2614' OR e."legacyEmpId" = '10EMP2614'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2614';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 47,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-09T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 24,
    status = 'APPROVED',
    "approvedAt" = '2025-02-13T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-12-29T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-13T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-12-29T18:29:50.000Z'::timestamptz,
      '2025-02-13T18:29:50.000Z'::timestamptz,
      47,
      '',
      NULL,
      '2025-03-09T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      24,
      'APPROVED',
      '2025-02-13T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1106' OR e."legacyEmpId" = '1106' OR e."legacyEmpId" = '10EMP1106' OR e."legacyEmpId" = '10EMP1106' OR e."legacyEmpId" = '10EMP1106'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1106';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-02-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-12-29T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-12-29T18:29:50.000Z'::timestamptz,
      '2025-02-26T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-02-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-02-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '999' OR e."legacyEmpId" = '999' OR e."legacyEmpId" = '10EMP999' OR e."legacyEmpId" = '10EMP999' OR e."legacyEmpId" = '10EMP0999'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 999';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 60,
    status = 'APPROVED',
    "approvedAt" = '2025-02-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-12-29T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-12-29T18:29:50.000Z'::timestamptz,
      '2025-02-26T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-04-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      60,
      'APPROVED',
      '2025-02-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2610' OR e."legacyEmpId" = '2610' OR e."legacyEmpId" = '10EMP2610' OR e."legacyEmpId" = '10EMP2610' OR e."legacyEmpId" = '10EMP2610'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2610';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 5,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-03T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-01-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2024-12-29T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2024-12-29T18:29:50.000Z'::timestamptz,
      '2025-01-02T18:29:50.000Z'::timestamptz,
      5,
      '',
      NULL,
      '2025-01-03T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-01-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '67' OR e."legacyEmpId" = '67' OR e."legacyEmpId" = '10EMP67' OR e."legacyEmpId" = '10EMP67' OR e."legacyEmpId" = '10EMP0067'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 67';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-02T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 3,
    status = 'APPROVED',
    "approvedAt" = '2025-01-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-01T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-01T18:29:50.000Z'::timestamptz,
      '2025-01-30T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-02-02T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      3,
      'APPROVED',
      '2025-01-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2240' OR e."legacyEmpId" = '2240' OR e."legacyEmpId" = '10EMP2240' OR e."legacyEmpId" = '10EMP2240' OR e."legacyEmpId" = '10EMP2240'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2240';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 4,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-09T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-01-08T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-05T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-05T18:29:50.000Z'::timestamptz,
      '2025-01-08T18:29:50.000Z'::timestamptz,
      4,
      '',
      NULL,
      '2025-01-09T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-01-08T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2665' OR e."legacyEmpId" = '2665' OR e."legacyEmpId" = '10EMP2665' OR e."legacyEmpId" = '10EMP2665' OR e."legacyEmpId" = '10EMP2665'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2665';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Overstay',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-01-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-08T18:29:50.000Z'::timestamptz,
      '2025-01-19T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      NULL,
      'Overstay',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-01-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '394' OR e."legacyEmpId" = '394' OR e."legacyEmpId" = '10EMP394' OR e."legacyEmpId" = '10EMP394' OR e."legacyEmpId" = '10EMP0394'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 394';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-13T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-03-13T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-11T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-13T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-11T18:29:50.000Z'::timestamptz,
      '2025-03-13T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      '2025-03-13T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-03-13T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2647' OR e."legacyEmpId" = '2647' OR e."legacyEmpId" = '10EMP2647' OR e."legacyEmpId" = '10EMP2647' OR e."legacyEmpId" = '10EMP2647'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2647';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 18,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-01-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-12T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-12T18:29:50.000Z'::timestamptz,
      '2025-01-29T18:29:50.000Z'::timestamptz,
      18,
      '',
      NULL,
      '2025-01-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-01-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1360' OR e."legacyEmpId" = '1360' OR e."legacyEmpId" = '10EMP1360' OR e."legacyEmpId" = '10EMP1360' OR e."legacyEmpId" = '10EMP1360'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1360';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-01-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-12T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-12T18:29:50.000Z'::timestamptz,
      '2025-01-26T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-01-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-01-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2247' OR e."legacyEmpId" = '2247' OR e."legacyEmpId" = '10EMP2247' OR e."legacyEmpId" = '10EMP2247' OR e."legacyEmpId" = '10EMP2247'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2247';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 6,
    status = 'APPROVED',
    "approvedAt" = '2025-03-13T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-12T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-13T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-12T18:29:50.000Z'::timestamptz,
      '2025-03-13T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      '2025-03-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      6,
      'APPROVED',
      '2025-03-13T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2315' OR e."legacyEmpId" = '2315' OR e."legacyEmpId" = '10EMP2315' OR e."legacyEmpId" = '10EMP2315' OR e."legacyEmpId" = '10EMP2315'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2315';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-21T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 9,
    status = 'APPROVED',
    "approvedAt" = '2025-03-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-12T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-12T18:29:50.000Z'::timestamptz,
      '2025-03-12T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-03-21T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      9,
      'APPROVED',
      '2025-03-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '14' OR e."legacyEmpId" = '14' OR e."legacyEmpId" = '10EMP14' OR e."legacyEmpId" = '10EMP14' OR e."legacyEmpId" = '10EMP0014'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 14';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 9,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-21T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-01-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-12T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-12T18:29:50.000Z'::timestamptz,
      '2025-01-20T18:29:50.000Z'::timestamptz,
      9,
      '',
      NULL,
      '2025-01-21T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-01-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2545' OR e."legacyEmpId" = '2545' OR e."legacyEmpId" = '10EMP2545' OR e."legacyEmpId" = '10EMP2545' OR e."legacyEmpId" = '10EMP2545'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2545';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 32,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 6,
    status = 'APPROVED',
    "approvedAt" = '2025-02-13T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-13T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-13T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-13T18:29:50.000Z'::timestamptz,
      '2025-02-13T18:29:50.000Z'::timestamptz,
      32,
      '',
      NULL,
      '2025-02-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      6,
      'APPROVED',
      '2025-02-13T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2737' OR e."legacyEmpId" = '2737' OR e."legacyEmpId" = '10EMP2737' OR e."legacyEmpId" = '10EMP2737' OR e."legacyEmpId" = '10EMP2737'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2737';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 8,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-01-21T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-01-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-13T18:29:50.000Z'::timestamptz AND "endDate" = '2025-01-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-13T18:29:50.000Z'::timestamptz,
      '2025-01-20T18:29:50.000Z'::timestamptz,
      8,
      '',
      NULL,
      '2025-01-21T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-01-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2550' OR e."legacyEmpId" = '2550' OR e."legacyEmpId" = '10EMP2550' OR e."legacyEmpId" = '10EMP2550' OR e."legacyEmpId" = '10EMP2550'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2550';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 22,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-02T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 21,
    status = 'APPROVED',
    "approvedAt" = '2025-02-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-19T18:29:50.000Z'::timestamptz,
      '2025-02-09T18:29:50.000Z'::timestamptz,
      22,
      '',
      NULL,
      '2025-03-02T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      21,
      'APPROVED',
      '2025-02-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '835' OR e."legacyEmpId" = '835' OR e."legacyEmpId" = '10EMP835' OR e."legacyEmpId" = '10EMP835' OR e."legacyEmpId" = '10EMP0835'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 835';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 22,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-10T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-02-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-19T18:29:50.000Z'::timestamptz,
      '2025-02-09T18:29:50.000Z'::timestamptz,
      22,
      '',
      NULL,
      '2025-02-10T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-02-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1761' OR e."legacyEmpId" = '1761' OR e."legacyEmpId" = '10EMP1761' OR e."legacyEmpId" = '10EMP1761' OR e."legacyEmpId" = '10EMP1761'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1761';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-04T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-02-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-20T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-20T18:29:50.000Z'::timestamptz,
      '2025-02-03T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-02-04T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-02-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2611' OR e."legacyEmpId" = '2611' OR e."legacyEmpId" = '10EMP2611' OR e."legacyEmpId" = '10EMP2611' OR e."legacyEmpId" = '10EMP2611'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2611';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 19,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-10T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 2,
    status = 'APPROVED',
    "approvedAt" = '2025-02-08T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-21T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-21T18:29:50.000Z'::timestamptz,
      '2025-02-08T18:29:50.000Z'::timestamptz,
      19,
      '',
      NULL,
      '2025-02-10T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      2,
      'APPROVED',
      '2025-02-08T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '333' OR e."legacyEmpId" = '333' OR e."legacyEmpId" = '10EMP333' OR e."legacyEmpId" = '10EMP333' OR e."legacyEmpId" = '10EMP0333'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 333';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-24T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-02-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-24T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-24T18:29:50.000Z'::timestamptz,
      '2025-02-23T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      '2025-02-24T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-02-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '34' OR e."legacyEmpId" = '34' OR e."legacyEmpId" = '10EMP34' OR e."legacyEmpId" = '10EMP34' OR e."legacyEmpId" = '10EMP0034'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 34';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-04T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 6,
    status = 'APPROVED',
    "approvedAt" = '2025-02-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-01-27T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-01-27T18:29:50.000Z'::timestamptz,
      '2025-02-26T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      '2025-03-04T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      6,
      'APPROVED',
      '2025-02-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2632' OR e."legacyEmpId" = '2632' OR e."legacyEmpId" = '10EMP2632' OR e."legacyEmpId" = '10EMP2632' OR e."legacyEmpId" = '10EMP2632'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2632';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-17T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-02-16T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-02T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-16T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-02T18:29:50.000Z'::timestamptz,
      '2025-02-16T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-02-17T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-02-16T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1611' OR e."legacyEmpId" = '1611' OR e."legacyEmpId" = '10EMP1611' OR e."legacyEmpId" = '10EMP1611' OR e."legacyEmpId" = '10EMP1611'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1611';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 8,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-10T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-02-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-02T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-02T18:29:50.000Z'::timestamptz,
      '2025-02-09T18:29:50.000Z'::timestamptz,
      8,
      '',
      NULL,
      '2025-02-10T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-02-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '266' OR e."legacyEmpId" = '266' OR e."legacyEmpId" = '10EMP266' OR e."legacyEmpId" = '10EMP266' OR e."legacyEmpId" = '10EMP0266'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 266';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-26T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Early Rejoin',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-03-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-02T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-02T18:29:50.000Z'::timestamptz,
      '2025-03-03T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-02-26T18:29:50.000Z'::timestamptz,
      'Early Rejoin',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-03-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1693' OR e."legacyEmpId" = '1693' OR e."legacyEmpId" = '10EMP1693' OR e."legacyEmpId" = '10EMP1693' OR e."legacyEmpId" = '10EMP1693'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1693';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 4,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-06T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-02-05T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-02T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-05T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-02T18:29:50.000Z'::timestamptz,
      '2025-02-05T18:29:50.000Z'::timestamptz,
      4,
      '',
      NULL,
      '2025-02-06T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-02-05T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '22' OR e."legacyEmpId" = '22' OR e."legacyEmpId" = '10EMP22' OR e."legacyEmpId" = '10EMP22' OR e."legacyEmpId" = '10EMP0022'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 22';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave(Medical)', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-02-18T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-04T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-18T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-04T18:29:50.000Z'::timestamptz,
      '2025-02-18T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-02-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-02-18T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1399' OR e."legacyEmpId" = '1399' OR e."legacyEmpId" = '10EMP1399' OR e."legacyEmpId" = '10EMP1399' OR e."legacyEmpId" = '10EMP1399'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1399';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-12T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 15,
    status = 'APPROVED',
    "approvedAt" = '2025-02-25T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-11T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-25T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-11T18:29:50.000Z'::timestamptz,
      '2025-02-25T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-03-12T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      15,
      'APPROVED',
      '2025-02-25T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2738' OR e."legacyEmpId" = '2738' OR e."legacyEmpId" = '10EMP2738' OR e."legacyEmpId" = '10EMP2738' OR e."legacyEmpId" = '10EMP2738'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2738';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 16,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-02T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-03-01T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-14T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-01T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-14T18:29:50.000Z'::timestamptz,
      '2025-03-01T18:29:50.000Z'::timestamptz,
      16,
      '',
      NULL,
      '2025-03-02T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-03-01T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2606' OR e."legacyEmpId" = '2606' OR e."legacyEmpId" = '10EMP2606' OR e."legacyEmpId" = '10EMP2606' OR e."legacyEmpId" = '10EMP2606'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2606';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'UMRAH' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave (Umrah)', 'UMRAH', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 14,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-02T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-03-01T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-16T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-01T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-16T18:29:50.000Z'::timestamptz,
      '2025-03-01T18:29:50.000Z'::timestamptz,
      14,
      '',
      NULL,
      '2025-03-02T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-03-01T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2580' OR e."legacyEmpId" = '2580' OR e."legacyEmpId" = '10EMP2580' OR e."legacyEmpId" = '10EMP2580' OR e."legacyEmpId" = '10EMP2580'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2580';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 36,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-31T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-31T18:29:50.000Z'::timestamptz,
      '2025-09-04T18:29:50.000Z'::timestamptz,
      36,
      '',
      NULL,
      '2025-09-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1608' OR e."legacyEmpId" = '1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1608';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-01T00:00:00.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-02-27T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-16T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-27T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-16T18:29:50.000Z'::timestamptz,
      '2025-02-27T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      '2025-03-01T00:00:00.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-02-27T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '22' OR e."legacyEmpId" = '22' OR e."legacyEmpId" = '10EMP22' OR e."legacyEmpId" = '10EMP22' OR e."legacyEmpId" = '10EMP0022'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 22';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency  Leave(Medical)', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-03-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-18T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-18T18:29:50.000Z'::timestamptz,
      '2025-03-04T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-03-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-03-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1282' OR e."legacyEmpId" = '1282' OR e."legacyEmpId" = '10EMP1282' OR e."legacyEmpId" = '10EMP1282' OR e."legacyEmpId" = '10EMP1282'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1282';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 70,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 2,
    status = 'APPROVED',
    "approvedAt" = '2025-05-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-23T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-23T18:29:50.000Z'::timestamptz,
      '2025-05-03T18:29:50.000Z'::timestamptz,
      70,
      '',
      NULL,
      '2025-05-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      2,
      'APPROVED',
      '2025-05-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '356' OR e."legacyEmpId" = '356' OR e."legacyEmpId" = '10EMP356' OR e."legacyEmpId" = '10EMP356' OR e."legacyEmpId" = '10EMP0356'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 356';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 59,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 13,
    status = 'APPROVED',
    "approvedAt" = '2025-04-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-23T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-23T18:29:50.000Z'::timestamptz,
      '2025-04-22T18:29:50.000Z'::timestamptz,
      59,
      '',
      NULL,
      '2025-05-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      13,
      'APPROVED',
      '2025-04-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1194' OR e."legacyEmpId" = '1194' OR e."legacyEmpId" = '10EMP1194' OR e."legacyEmpId" = '10EMP1194' OR e."legacyEmpId" = '10EMP1194'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1194';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 90,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-14T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 52,
    status = 'APPROVED',
    "approvedAt" = '2025-05-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-23T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-23T18:29:50.000Z'::timestamptz,
      '2025-05-23T18:29:50.000Z'::timestamptz,
      90,
      '',
      NULL,
      '2025-07-14T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      52,
      'APPROVED',
      '2025-05-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1376' OR e."legacyEmpId" = '1376' OR e."legacyEmpId" = '10EMP1376' OR e."legacyEmpId" = '10EMP1376' OR e."legacyEmpId" = '10EMP1376'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1376';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-01T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-01T18:29:50.000Z'::timestamptz,
      '2025-04-29T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-04-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2702' OR e."legacyEmpId" = '2702' OR e."legacyEmpId" = '10EMP2702' OR e."legacyEmpId" = '10EMP2702' OR e."legacyEmpId" = '10EMP2702'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2702';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 21,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-24T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-03-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-03T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-03T18:29:50.000Z'::timestamptz,
      '2025-03-23T18:29:50.000Z'::timestamptz,
      21,
      '',
      NULL,
      '2025-03-24T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-03-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '338' OR e."legacyEmpId" = '338' OR e."legacyEmpId" = '10EMP338' OR e."legacyEmpId" = '10EMP338' OR e."legacyEmpId" = '10EMP0338'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 338';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-17T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 10,
    status = 'APPROVED',
    "approvedAt" = '2025-04-07T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-09T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-07T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-09T18:29:50.000Z'::timestamptz,
      '2025-04-07T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-04-17T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      10,
      'APPROVED',
      '2025-04-07T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2317' OR e."legacyEmpId" = '2317' OR e."legacyEmpId" = '10EMP2317' OR e."legacyEmpId" = '10EMP2317' OR e."legacyEmpId" = '10EMP2317'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2317';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 76,
    status = 'APPROVED',
    "approvedAt" = '2025-03-31T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-17T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-31T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-17T18:29:50.000Z'::timestamptz,
      '2025-03-31T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-06-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      76,
      'APPROVED',
      '2025-03-31T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2624' OR e."legacyEmpId" = '2624' OR e."legacyEmpId" = '10EMP2624' OR e."legacyEmpId" = '10EMP2624' OR e."legacyEmpId" = '10EMP2624'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2624';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-24T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 87,
    status = 'APPROVED',
    "approvedAt" = '2025-03-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-18T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-18T18:29:50.000Z'::timestamptz,
      '2025-03-29T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      '2025-06-24T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      87,
      'APPROVED',
      '2025-03-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1801' OR e."legacyEmpId" = '1801' OR e."legacyEmpId" = '10EMP1801' OR e."legacyEmpId" = '10EMP1801' OR e."legacyEmpId" = '10EMP1801'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1801';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 16,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-11T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 192,
    status = 'APPROVED',
    "approvedAt" = '2025-04-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-18T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-18T18:29:50.000Z'::timestamptz,
      '2025-04-02T18:29:50.000Z'::timestamptz,
      16,
      '',
      NULL,
      '2025-10-11T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      192,
      'APPROVED',
      '2025-04-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '310' OR e."legacyEmpId" = '310' OR e."legacyEmpId" = '10EMP310' OR e."legacyEmpId" = '10EMP310' OR e."legacyEmpId" = '10EMP0310'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 310';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-28T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 9,
    status = 'APPROVED',
    "approvedAt" = '2025-05-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-19T18:29:50.000Z'::timestamptz,
      '2025-05-19T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      '2025-05-28T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      9,
      'APPROVED',
      '2025-05-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '194' OR e."legacyEmpId" = '194' OR e."legacyEmpId" = '10EMP194' OR e."legacyEmpId" = '10EMP194' OR e."legacyEmpId" = '10EMP0194'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 194';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 35,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-19T18:29:50.000Z'::timestamptz,
      '2025-04-22T18:29:50.000Z'::timestamptz,
      35,
      '',
      NULL,
      '2025-04-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1708' OR e."legacyEmpId" = '1708' OR e."legacyEmpId" = '10EMP1708' OR e."legacyEmpId" = '10EMP1708' OR e."legacyEmpId" = '10EMP1708'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1708';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-28T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 7,
    status = 'APPROVED',
    "approvedAt" = '2025-05-21T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-23T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-21T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-23T18:29:50.000Z'::timestamptz,
      '2025-05-21T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-05-28T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      7,
      'APPROVED',
      '2025-05-21T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1608' OR e."legacyEmpId" = '1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1608';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 2,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-25T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-03-24T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-23T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-24T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-23T18:29:50.000Z'::timestamptz,
      '2025-03-24T18:29:50.000Z'::timestamptz,
      2,
      '',
      NULL,
      '2025-03-25T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-03-24T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1608' OR e."legacyEmpId" = '1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1608';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 2,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-03-25T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-03-24T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-23T18:29:50.000Z'::timestamptz AND "endDate" = '2025-03-24T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-23T18:29:50.000Z'::timestamptz,
      '2025-03-24T18:29:50.000Z'::timestamptz,
      2,
      '',
      NULL,
      '2025-03-25T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-03-24T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '976' OR e."legacyEmpId" = '976' OR e."legacyEmpId" = '10EMP976' OR e."legacyEmpId" = '10EMP976' OR e."legacyEmpId" = '10EMP0976'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 976';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 39,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-11T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 7,
    status = 'APPROVED',
    "approvedAt" = '2025-05-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-27T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-27T18:29:50.000Z'::timestamptz,
      '2025-05-04T18:29:50.000Z'::timestamptz,
      39,
      '',
      NULL,
      '2025-05-11T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      7,
      'APPROVED',
      '2025-05-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2594' OR e."legacyEmpId" = '2594' OR e."legacyEmpId" = '10EMP2594' OR e."legacyEmpId" = '10EMP2594' OR e."legacyEmpId" = '10EMP2594'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2594';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 41,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-11T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 2,
    status = 'APPROVED',
    "approvedAt" = '2025-05-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-30T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-30T18:29:50.000Z'::timestamptz,
      '2025-05-09T18:29:50.000Z'::timestamptz,
      41,
      '',
      NULL,
      '2025-05-11T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      2,
      'APPROVED',
      '2025-05-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '801' OR e."legacyEmpId" = '801' OR e."legacyEmpId" = '10EMP801' OR e."legacyEmpId" = '10EMP801' OR e."legacyEmpId" = '10EMP0801'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 801';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 49,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-18T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-05-17T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-30T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-30T18:29:50.000Z'::timestamptz,
      '2025-05-17T18:29:50.000Z'::timestamptz,
      49,
      '',
      NULL,
      '2025-05-18T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-05-17T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2691' OR e."legacyEmpId" = '2691' OR e."legacyEmpId" = '10EMP2691' OR e."legacyEmpId" = '10EMP2691' OR e."legacyEmpId" = '10EMP2691'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2691';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 13,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-13T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-31T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-31T18:29:50.000Z'::timestamptz,
      '2025-04-12T18:29:50.000Z'::timestamptz,
      13,
      '',
      NULL,
      '2025-04-13T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2690' OR e."legacyEmpId" = '2690' OR e."legacyEmpId" = '10EMP2690' OR e."legacyEmpId" = '10EMP2690' OR e."legacyEmpId" = '10EMP2690'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2690';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-01T00:00:00.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-03-31T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-03-31T18:29:50.000Z'::timestamptz,
      '2025-04-29T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-05-01T00:00:00.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '266' OR e."legacyEmpId" = '266' OR e."legacyEmpId" = '10EMP266' OR e."legacyEmpId" = '10EMP266' OR e."legacyEmpId" = '10EMP0266'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 266';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 3,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-06T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 3,
    status = 'APPROVED',
    "approvedAt" = '2025-04-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-01T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-01T18:29:50.000Z'::timestamptz,
      '2025-04-03T18:29:50.000Z'::timestamptz,
      3,
      '',
      NULL,
      '2025-04-06T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      3,
      'APPROVED',
      '2025-04-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2078' OR e."legacyEmpId" = '2078' OR e."legacyEmpId" = '10EMP2078' OR e."legacyEmpId" = '10EMP2078' OR e."legacyEmpId" = '10EMP2078'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2078';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 7,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-09T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-08T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-02T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-02T18:29:50.000Z'::timestamptz,
      '2025-04-08T18:29:50.000Z'::timestamptz,
      7,
      '',
      NULL,
      '2025-04-09T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-08T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1417' OR e."legacyEmpId" = '1417' OR e."legacyEmpId" = '10EMP1417' OR e."legacyEmpId" = '10EMP1417' OR e."legacyEmpId" = '10EMP1417'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1417';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 19,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-20T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-02T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-02T18:29:50.000Z'::timestamptz,
      '2025-04-20T18:29:50.000Z'::timestamptz,
      19,
      '',
      NULL,
      '2025-04-20T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2397' OR e."legacyEmpId" = '2397' OR e."legacyEmpId" = '10EMP2397' OR e."legacyEmpId" = '10EMP2397' OR e."legacyEmpId" = '10EMP2397'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2397';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 21,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-03T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-03T18:29:50.000Z'::timestamptz,
      '2025-04-23T18:29:50.000Z'::timestamptz,
      21,
      '',
      NULL,
      '2025-04-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1399' OR e."legacyEmpId" = '1399' OR e."legacyEmpId" = '10EMP1399' OR e."legacyEmpId" = '10EMP1399' OR e."legacyEmpId" = '10EMP1399'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1399';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 7,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-25T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 42,
    status = 'APPROVED',
    "approvedAt" = '2025-04-13T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-07T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-13T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-07T18:29:50.000Z'::timestamptz,
      '2025-04-13T18:29:50.000Z'::timestamptz,
      7,
      '',
      NULL,
      '2025-05-25T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      42,
      'APPROVED',
      '2025-04-13T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1699' OR e."legacyEmpId" = '1699' OR e."legacyEmpId" = '10EMP1699' OR e."legacyEmpId" = '10EMP1699' OR e."legacyEmpId" = '10EMP1699'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1699';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-17T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 8,
    status = 'APPROVED',
    "approvedAt" = '2025-06-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-10T18:29:50.000Z'::timestamptz,
      '2025-06-09T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      '2025-06-17T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      8,
      'APPROVED',
      '2025-06-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2472' OR e."legacyEmpId" = '2472' OR e."legacyEmpId" = '10EMP2472' OR e."legacyEmpId" = '10EMP2472' OR e."legacyEmpId" = '10EMP2472'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2472';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-07T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 58,
    status = 'APPROVED',
    "approvedAt" = '2025-06-10T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-11T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-10T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-11T18:29:50.000Z'::timestamptz,
      '2025-06-10T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      '2025-08-07T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      58,
      'APPROVED',
      '2025-06-10T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '279' OR e."legacyEmpId" = '279' OR e."legacyEmpId" = '10EMP279' OR e."legacyEmpId" = '10EMP279' OR e."legacyEmpId" = '10EMP0279'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 279';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-13T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-05-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-12T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-12T18:29:50.000Z'::timestamptz,
      '2025-05-12T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      '2025-05-13T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-05-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2595' OR e."legacyEmpId" = '2595' OR e."legacyEmpId" = '10EMP2595' OR e."legacyEmpId" = '10EMP2595' OR e."legacyEmpId" = '10EMP2595'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2595';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-21T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 10,
    status = 'APPROVED',
    "approvedAt" = '2025-06-11T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-13T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-11T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-13T18:29:50.000Z'::timestamptz,
      '2025-06-11T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-06-21T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      10,
      'APPROVED',
      '2025-06-11T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2381' OR e."legacyEmpId" = '2381' OR e."legacyEmpId" = '10EMP2381' OR e."legacyEmpId" = '10EMP2381' OR e."legacyEmpId" = '10EMP2381'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2381';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-29T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Early Rejoin',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-06-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-13T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-13T18:29:50.000Z'::timestamptz,
      '2025-06-12T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      '2025-05-29T18:29:50.000Z'::timestamptz,
      'Early Rejoin',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-06-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '334' OR e."legacyEmpId" = '334' OR e."legacyEmpId" = '10EMP334' OR e."legacyEmpId" = '10EMP334' OR e."legacyEmpId" = '10EMP0334'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 334';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 2,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-14T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-13T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-14T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-13T18:29:50.000Z'::timestamptz,
      '2025-04-14T18:29:50.000Z'::timestamptz,
      2,
      '',
      NULL,
      '2025-04-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-14T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1206' OR e."legacyEmpId" = '1206' OR e."legacyEmpId" = '10EMP1206' OR e."legacyEmpId" = '10EMP1206' OR e."legacyEmpId" = '10EMP1206'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1206';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-26T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 15,
    status = 'APPROVED',
    "approvedAt" = '2025-06-11T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-13T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-11T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-13T18:29:50.000Z'::timestamptz,
      '2025-06-11T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-06-26T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      15,
      'APPROVED',
      '2025-06-11T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2777' OR e."legacyEmpId" = '2777' OR e."legacyEmpId" = '10EMP2777' OR e."legacyEmpId" = '10EMP2777' OR e."legacyEmpId" = '10EMP2777'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2777';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 10,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 8,
    status = 'APPROVED',
    "approvedAt" = '2025-04-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-13T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-13T18:29:50.000Z'::timestamptz,
      '2025-04-22T18:29:50.000Z'::timestamptz,
      10,
      '',
      NULL,
      '2025-04-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      8,
      'APPROVED',
      '2025-04-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '835' OR e."legacyEmpId" = '835' OR e."legacyEmpId" = '10EMP835' OR e."legacyEmpId" = '10EMP835' OR e."legacyEmpId" = '10EMP0835'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 835';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'PL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Paternity Leave', 'PL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 7,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-16T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-16T18:29:50.000Z'::timestamptz,
      '2025-04-22T18:29:50.000Z'::timestamptz,
      7,
      '',
      NULL,
      '2025-04-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2580' OR e."legacyEmpId" = '2580' OR e."legacyEmpId" = '10EMP2580' OR e."legacyEmpId" = '10EMP2580' OR e."legacyEmpId" = '10EMP2580'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2580';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'other, (Easter)', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 10,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-17T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-17T18:29:50.000Z'::timestamptz,
      '2025-04-26T18:29:50.000Z'::timestamptz,
      10,
      '',
      NULL,
      '2025-04-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '334' OR e."legacyEmpId" = '334' OR e."legacyEmpId" = '10EMP334' OR e."legacyEmpId" = '10EMP334' OR e."legacyEmpId" = '10EMP0334'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 334';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 5,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-18T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-18T18:29:50.000Z'::timestamptz,
      '2025-04-22T18:29:50.000Z'::timestamptz,
      5,
      '',
      NULL,
      '2025-04-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '439' OR e."legacyEmpId" = '439' OR e."legacyEmpId" = '10EMP439' OR e."legacyEmpId" = '10EMP439' OR e."legacyEmpId" = '10EMP0439'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 439';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-05-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-20T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-20T18:29:50.000Z'::timestamptz,
      '2025-05-04T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-05-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-05-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2286' OR e."legacyEmpId" = '2286' OR e."legacyEmpId" = '10EMP2286' OR e."legacyEmpId" = '10EMP2286' OR e."legacyEmpId" = '10EMP2286'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2286';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 11,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 50,
    status = 'APPROVED',
    "approvedAt" = '2025-05-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-24T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-24T18:29:50.000Z'::timestamptz,
      '2025-05-04T18:29:50.000Z'::timestamptz,
      11,
      '',
      NULL,
      '2025-06-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      50,
      'APPROVED',
      '2025-05-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1307' OR e."legacyEmpId" = '1307' OR e."legacyEmpId" = '10EMP1307' OR e."legacyEmpId" = '10EMP1307' OR e."legacyEmpId" = '10EMP1307'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1307';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-05-11T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-27T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-11T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-27T18:29:50.000Z'::timestamptz,
      '2025-05-11T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-05-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      4,
      'APPROVED',
      '2025-05-11T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '791' OR e."legacyEmpId" = '791' OR e."legacyEmpId" = '10EMP791' OR e."legacyEmpId" = '10EMP791' OR e."legacyEmpId" = '10EMP0791'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 791';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 27,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-05-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-30T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-30T18:29:50.000Z'::timestamptz,
      '2025-05-26T18:29:50.000Z'::timestamptz,
      27,
      '',
      NULL,
      '2025-05-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-05-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2481' OR e."legacyEmpId" = '2481' OR e."legacyEmpId" = '10EMP2481' OR e."legacyEmpId" = '10EMP2481' OR e."legacyEmpId" = '10EMP2481'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2481';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-26T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 8,
    status = 'APPROVED',
    "approvedAt" = '2025-05-18T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-04T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-18T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-04T18:29:50.000Z'::timestamptz,
      '2025-05-18T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-05-26T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      8,
      'APPROVED',
      '2025-05-18T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2446' OR e."legacyEmpId" = '2446' OR e."legacyEmpId" = '10EMP2446' OR e."legacyEmpId" = '10EMP2446' OR e."legacyEmpId" = '10EMP2446'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2446';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 7,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-14T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-05-13T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-07T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-13T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-07T18:29:50.000Z'::timestamptz,
      '2025-05-13T18:29:50.000Z'::timestamptz,
      7,
      '',
      NULL,
      '2025-05-14T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-05-13T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2682' OR e."legacyEmpId" = '2682' OR e."legacyEmpId" = '10EMP2682' OR e."legacyEmpId" = '10EMP2682' OR e."legacyEmpId" = '10EMP2682'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2682';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 8,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-18T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-05-14T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-07T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-14T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-07T18:29:50.000Z'::timestamptz,
      '2025-05-14T18:29:50.000Z'::timestamptz,
      8,
      '',
      NULL,
      '2025-05-18T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      4,
      'APPROVED',
      '2025-05-14T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2471' OR e."legacyEmpId" = '2471' OR e."legacyEmpId" = '10EMP2471' OR e."legacyEmpId" = '10EMP2471' OR e."legacyEmpId" = '10EMP2471'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2471';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-28T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 19,
    status = 'APPROVED',
    "approvedAt" = '2025-07-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-09T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-09T18:29:50.000Z'::timestamptz,
      '2025-07-09T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      '2025-07-28T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      19,
      'APPROVED',
      '2025-07-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '399' OR e."legacyEmpId" = '399' OR e."legacyEmpId" = '10EMP399' OR e."legacyEmpId" = '10EMP399' OR e."legacyEmpId" = '10EMP0399'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 399';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 67,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-07-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-10T18:29:50.000Z'::timestamptz,
      '2025-07-15T18:29:50.000Z'::timestamptz,
      67,
      '',
      NULL,
      '2025-07-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      4,
      'APPROVED',
      '2025-07-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2331' OR e."legacyEmpId" = '2331' OR e."legacyEmpId" = '10EMP2331' OR e."legacyEmpId" = '10EMP2331' OR e."legacyEmpId" = '10EMP2331'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2331';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 14,
    status = 'APPROVED',
    "approvedAt" = '2025-07-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-11T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-11T18:29:50.000Z'::timestamptz,
      '2025-07-09T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-07-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      14,
      'APPROVED',
      '2025-07-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2720' OR e."legacyEmpId" = '2720' OR e."legacyEmpId" = '10EMP2720' OR e."legacyEmpId" = '10EMP2720' OR e."legacyEmpId" = '10EMP2720'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2720';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 11,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-03T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 11,
    status = 'APPROVED',
    "approvedAt" = '2025-05-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-13T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-13T18:29:50.000Z'::timestamptz,
      '2025-05-23T18:29:50.000Z'::timestamptz,
      11,
      '',
      NULL,
      '2025-06-03T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      11,
      'APPROVED',
      '2025-05-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2643' OR e."legacyEmpId" = '2643' OR e."legacyEmpId" = '10EMP2643' OR e."legacyEmpId" = '10EMP2643' OR e."legacyEmpId" = '10EMP2643'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2643';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-28T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 12,
    status = 'APPROVED',
    "approvedAt" = '2025-06-16T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-18T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-16T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-18T18:29:50.000Z'::timestamptz,
      '2025-06-16T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-06-28T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      12,
      'APPROVED',
      '2025-06-16T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2628' OR e."legacyEmpId" = '2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2628';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-05-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-18T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-18T18:29:50.000Z'::timestamptz,
      '2025-05-29T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      '2025-05-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-05-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2330' OR e."legacyEmpId" = '2330' OR e."legacyEmpId" = '10EMP2330' OR e."legacyEmpId" = '10EMP2330' OR e."legacyEmpId" = '10EMP2330'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2330';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-22T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-07-18T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-18T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-18T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-18T18:29:50.000Z'::timestamptz,
      '2025-07-18T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      '2025-07-22T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      4,
      'APPROVED',
      '2025-07-18T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2430' OR e."legacyEmpId" = '2430' OR e."legacyEmpId" = '10EMP2430' OR e."legacyEmpId" = '10EMP2430' OR e."legacyEmpId" = '10EMP2430'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2430';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-17T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 31,
    status = 'APPROVED',
    "approvedAt" = '2025-07-17T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-19T18:29:50.000Z'::timestamptz,
      '2025-07-17T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-08-17T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      31,
      'APPROVED',
      '2025-07-17T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '571' OR e."legacyEmpId" = '571' OR e."legacyEmpId" = '10EMP571' OR e."legacyEmpId" = '10EMP571' OR e."legacyEmpId" = '10EMP0571'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 571';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-14T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 28,
    status = 'APPROVED',
    "approvedAt" = '2025-07-17T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-19T18:29:50.000Z'::timestamptz,
      '2025-07-17T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-08-14T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      28,
      'APPROVED',
      '2025-07-17T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2621' OR e."legacyEmpId" = '2621' OR e."legacyEmpId" = '10EMP2621' OR e."legacyEmpId" = '10EMP2621' OR e."legacyEmpId" = '10EMP2621'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2621';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-14T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Early Rejoin',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-19T18:29:50.000Z'::timestamptz,
      '2025-07-19T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      '2025-07-14T18:29:50.000Z'::timestamptz,
      'Early Rejoin',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2501' OR e."legacyEmpId" = '2501' OR e."legacyEmpId" = '10EMP2501' OR e."legacyEmpId" = '10EMP2501' OR e."legacyEmpId" = '10EMP2501'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2501';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 14,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-12T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 10,
    status = 'APPROVED',
    "approvedAt" = '2025-06-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-20T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-20T18:29:50.000Z'::timestamptz,
      '2025-06-02T18:29:50.000Z'::timestamptz,
      14,
      '',
      NULL,
      '2025-06-12T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      10,
      'APPROVED',
      '2025-06-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '924' OR e."legacyEmpId" = '924' OR e."legacyEmpId" = '10EMP924' OR e."legacyEmpId" = '10EMP924' OR e."legacyEmpId" = '10EMP0924'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 924';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 3,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-05-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-05-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-20T18:29:50.000Z'::timestamptz AND "endDate" = '2025-05-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-20T18:29:50.000Z'::timestamptz,
      '2025-05-22T18:29:50.000Z'::timestamptz,
      3,
      '',
      NULL,
      '2025-05-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-05-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2567' OR e."legacyEmpId" = '2567' OR e."legacyEmpId" = '10EMP2567' OR e."legacyEmpId" = '10EMP2567' OR e."legacyEmpId" = '10EMP2567'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2567';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 65,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-20T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Early Rejoin',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-24T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-21T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-24T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-21T18:29:50.000Z'::timestamptz,
      '2025-07-24T18:29:50.000Z'::timestamptz,
      65,
      '',
      NULL,
      '2025-07-20T18:29:50.000Z'::timestamptz,
      'Early Rejoin',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-24T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2556' OR e."legacyEmpId" = '2556' OR e."legacyEmpId" = '10EMP2556' OR e."legacyEmpId" = '10EMP2556' OR e."legacyEmpId" = '10EMP2556'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2556';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 28,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-24T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 64,
    status = 'APPROVED',
    "approvedAt" = '2025-06-21T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-25T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-21T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-25T18:29:50.000Z'::timestamptz,
      '2025-06-21T18:29:50.000Z'::timestamptz,
      28,
      '',
      NULL,
      '2025-08-24T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      64,
      'APPROVED',
      '2025-06-21T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '333' OR e."legacyEmpId" = '333' OR e."legacyEmpId" = '10EMP333' OR e."legacyEmpId" = '10EMP333' OR e."legacyEmpId" = '10EMP0333'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 333';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 32,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 21,
    status = 'APPROVED',
    "approvedAt" = '2025-06-25T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-25T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-25T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-25T18:29:50.000Z'::timestamptz,
      '2025-06-25T18:29:50.000Z'::timestamptz,
      32,
      '',
      NULL,
      '2025-07-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      21,
      'APPROVED',
      '2025-06-25T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '630' OR e."legacyEmpId" = '630' OR e."legacyEmpId" = '10EMP630' OR e."legacyEmpId" = '10EMP630' OR e."legacyEmpId" = '10EMP0630'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 630';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-25T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-25T18:29:50.000Z'::timestamptz,
      '2025-07-23T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-07-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2027' OR e."legacyEmpId" = '2027' OR e."legacyEmpId" = '10EMP2027' OR e."legacyEmpId" = '10EMP2027' OR e."legacyEmpId" = '10EMP2027'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2027';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 26,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Early Rejoin',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-06-25T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-26T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-25T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-26T18:29:50.000Z'::timestamptz,
      '2025-06-25T18:29:50.000Z'::timestamptz,
      26,
      '',
      NULL,
      '2025-06-19T18:29:50.000Z'::timestamptz,
      'Early Rejoin',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-06-25T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1186' OR e."legacyEmpId" = '1186' OR e."legacyEmpId" = '10EMP1186' OR e."legacyEmpId" = '10EMP1186' OR e."legacyEmpId" = '10EMP1186'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1186';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-02T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 2,
    status = 'APPROVED',
    "approvedAt" = '2025-07-31T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-31T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-31T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-31T18:29:50.000Z'::timestamptz,
      '2025-07-31T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      '2025-08-02T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      2,
      'APPROVED',
      '2025-07-31T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '603' OR e."legacyEmpId" = '603' OR e."legacyEmpId" = '10EMP603' OR e."legacyEmpId" = '10EMP603' OR e."legacyEmpId" = '10EMP0603'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 603';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 66,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-05-31T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-05-31T18:29:50.000Z'::timestamptz,
      '2025-08-04T18:29:50.000Z'::timestamptz,
      66,
      '',
      NULL,
      '2025-08-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2628' OR e."legacyEmpId" = '2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2628';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'MLF' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Maternity Leave', 'MLF', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-31T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-01T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-01T18:29:50.000Z'::timestamptz,
      '2025-07-30T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-07-31T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1608' OR e."legacyEmpId" = '1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1608';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 5,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-13T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-06-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-08T18:29:50.000Z'::timestamptz,
      '2025-06-12T18:29:50.000Z'::timestamptz,
      5,
      '',
      NULL,
      '2025-06-13T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-06-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '266' OR e."legacyEmpId" = '266' OR e."legacyEmpId" = '10EMP266' OR e."legacyEmpId" = '10EMP266' OR e."legacyEmpId" = '10EMP0266'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 266';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-25T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 3,
    status = 'APPROVED',
    "approvedAt" = '2025-06-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-08T18:29:50.000Z'::timestamptz,
      '2025-06-22T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-06-25T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      3,
      'APPROVED',
      '2025-06-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '68' OR e."legacyEmpId" = '68' OR e."legacyEmpId" = '10EMP68' OR e."legacyEmpId" = '10EMP68' OR e."legacyEmpId" = '10EMP0068'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 68';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-08T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-07T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-07T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-08T18:29:50.000Z'::timestamptz,
      '2025-07-07T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-07-08T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-07T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '802' OR e."legacyEmpId" = '802' OR e."legacyEmpId" = '10EMP802' OR e."legacyEmpId" = '10EMP802' OR e."legacyEmpId" = '10EMP0802'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 802';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-13T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 7,
    status = 'APPROVED',
    "approvedAt" = '2025-08-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-08T18:29:50.000Z'::timestamptz,
      '2025-08-06T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-08-13T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      7,
      'APPROVED',
      '2025-08-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2491' OR e."legacyEmpId" = '2491' OR e."legacyEmpId" = '10EMP2491' OR e."legacyEmpId" = '10EMP2491' OR e."legacyEmpId" = '10EMP2491'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2491';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 43,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-12T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 23,
    status = 'APPROVED',
    "approvedAt" = '2025-07-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-08T18:29:50.000Z'::timestamptz,
      '2025-07-20T18:29:50.000Z'::timestamptz,
      43,
      '',
      NULL,
      '2025-08-12T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      23,
      'APPROVED',
      '2025-07-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2632' OR e."legacyEmpId" = '2632' OR e."legacyEmpId" = '10EMP2632' OR e."legacyEmpId" = '10EMP2632' OR e."legacyEmpId" = '10EMP2632'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2632';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'PL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Others (Paternity)', 'PL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 4,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-13T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-06-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-09T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-09T18:29:50.000Z'::timestamptz,
      '2025-06-12T18:29:50.000Z'::timestamptz,
      4,
      '',
      NULL,
      '2025-06-13T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-06-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '14' OR e."legacyEmpId" = '14' OR e."legacyEmpId" = '10EMP14' OR e."legacyEmpId" = '10EMP14' OR e."legacyEmpId" = '10EMP0014'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 14';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 5,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-06-14T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-14T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-10T18:29:50.000Z'::timestamptz,
      '2025-06-14T18:29:50.000Z'::timestamptz,
      5,
      '',
      NULL,
      '2025-06-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-06-14T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2575' OR e."legacyEmpId" = '2575' OR e."legacyEmpId" = '10EMP2575' OR e."legacyEmpId" = '10EMP2575' OR e."legacyEmpId" = '10EMP2575'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2575';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 19,
    reason = 'Requested from thouseef to extend',
    remark = 'Requested from thouseef to extend',
    "rejoiningDate" = '2025-06-29T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-06-28T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-28T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-10T18:29:50.000Z'::timestamptz,
      '2025-06-28T18:29:50.000Z'::timestamptz,
      19,
      'Requested from thouseef to extend',
      'Requested from thouseef to extend',
      '2025-06-29T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-06-28T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '379' OR e."legacyEmpId" = '379' OR e."legacyEmpId" = '10EMP379' OR e."legacyEmpId" = '10EMP379' OR e."legacyEmpId" = '10EMP0379'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 379';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-10T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-10T18:29:50.000Z'::timestamptz,
      '2025-07-09T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-07-10T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2228' OR e."legacyEmpId" = '2228' OR e."legacyEmpId" = '10EMP2228' OR e."legacyEmpId" = '10EMP2228' OR e."legacyEmpId" = '10EMP2228'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2228';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 16,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-09T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 10,
    status = 'APPROVED',
    "approvedAt" = '2025-06-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-14T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-14T18:29:50.000Z'::timestamptz,
      '2025-06-29T18:29:50.000Z'::timestamptz,
      16,
      '',
      NULL,
      '2025-07-09T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      10,
      'APPROVED',
      '2025-06-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2502' OR e."legacyEmpId" = '2502' OR e."legacyEmpId" = '10EMP2502' OR e."legacyEmpId" = '10EMP2502' OR e."legacyEmpId" = '10EMP2502'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2502';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 70,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-08-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-15T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-15T18:29:50.000Z'::timestamptz,
      '2025-08-23T18:29:50.000Z'::timestamptz,
      70,
      '',
      NULL,
      '2025-08-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      4,
      'APPROVED',
      '2025-08-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2638' OR e."legacyEmpId" = '2638' OR e."legacyEmpId" = '10EMP2638' OR e."legacyEmpId" = '10EMP2638' OR e."legacyEmpId" = '10EMP2638'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2638';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 5,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-06-26T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-06-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-22T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-22T18:29:50.000Z'::timestamptz,
      '2025-06-26T18:29:50.000Z'::timestamptz,
      5,
      '',
      NULL,
      '2025-06-26T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-06-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '459' OR e."legacyEmpId" = '459' OR e."legacyEmpId" = '10EMP459' OR e."legacyEmpId" = '10EMP459' OR e."legacyEmpId" = '10EMP0459'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 459';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 54,
    status = 'APPROVED',
    "approvedAt" = '2025-08-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-22T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-22T18:29:50.000Z'::timestamptz,
      '2025-08-22T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      '2025-10-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      54,
      'APPROVED',
      '2025-08-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1654' OR e."legacyEmpId" = '1654' OR e."legacyEmpId" = '10EMP1654' OR e."legacyEmpId" = '10EMP1654' OR e."legacyEmpId" = '10EMP1654'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1654';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 10,
    status = 'APPROVED',
    "approvedAt" = '2025-07-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-27T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-27T18:29:50.000Z'::timestamptz,
      '2025-07-26T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-08-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      10,
      'APPROVED',
      '2025-07-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '600' OR e."legacyEmpId" = '600' OR e."legacyEmpId" = '10EMP600' OR e."legacyEmpId" = '10EMP600' OR e."legacyEmpId" = '10EMP0600'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 600';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-01T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-08-28T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-06-30T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-28T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-06-30T18:29:50.000Z'::timestamptz,
      '2025-08-28T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-09-01T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      4,
      'APPROVED',
      '2025-08-28T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '235' OR e."legacyEmpId" = '235' OR e."legacyEmpId" = '10EMP235' OR e."legacyEmpId" = '10EMP235' OR e."legacyEmpId" = '10EMP0235'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 235';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 19,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-25T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-24T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-06T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-24T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-06T18:29:50.000Z'::timestamptz,
      '2025-07-24T18:29:50.000Z'::timestamptz,
      19,
      '',
      NULL,
      '2025-07-25T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-24T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1608' OR e."legacyEmpId" = '1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1608';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 8,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-08T18:29:50.000Z'::timestamptz,
      '2025-07-15T18:29:50.000Z'::timestamptz,
      8,
      '',
      NULL,
      '2025-07-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2611' OR e."legacyEmpId" = '2611' OR e."legacyEmpId" = '10EMP2611' OR e."legacyEmpId" = '10EMP2611' OR e."legacyEmpId" = '10EMP2611'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2611';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-08T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-07T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-09T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-07T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-09T18:29:50.000Z'::timestamptz,
      '2025-08-07T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-08-08T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-07T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2520' OR e."legacyEmpId" = '2520' OR e."legacyEmpId" = '10EMP2520' OR e."legacyEmpId" = '10EMP2520' OR e."legacyEmpId" = '10EMP2520'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2520';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-11T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-10T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-11T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-10T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-11T18:29:50.000Z'::timestamptz,
      '2025-08-10T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      '2025-08-11T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-10T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1219' OR e."legacyEmpId" = '1219' OR e."legacyEmpId" = '10EMP1219' OR e."legacyEmpId" = '10EMP1219' OR e."legacyEmpId" = '10EMP1219'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1219';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-12T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-11T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-13T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-11T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-13T18:29:50.000Z'::timestamptz,
      '2025-08-11T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-08-12T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-11T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2590' OR e."legacyEmpId" = '2590' OR e."legacyEmpId" = '10EMP2590' OR e."legacyEmpId" = '10EMP2590' OR e."legacyEmpId" = '10EMP2590'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2590';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 17,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-13T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-13T18:29:50.000Z'::timestamptz,
      '2025-07-29T18:29:50.000Z'::timestamptz,
      17,
      '',
      NULL,
      '2025-07-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2558' OR e."legacyEmpId" = '2558' OR e."legacyEmpId" = '10EMP2558' OR e."legacyEmpId" = '10EMP2558' OR e."legacyEmpId" = '10EMP2558'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2558';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-22T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 6,
    status = 'APPROVED',
    "approvedAt" = '2025-09-16T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-16T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-19T18:29:50.000Z'::timestamptz,
      '2025-09-16T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-09-22T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      6,
      'APPROVED',
      '2025-09-16T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1617' OR e."legacyEmpId" = '1617' OR e."legacyEmpId" = '10EMP1617' OR e."legacyEmpId" = '10EMP1617' OR e."legacyEmpId" = '10EMP1617'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1617';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 18,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-07T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-20T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-20T18:29:50.000Z'::timestamptz,
      '2025-08-06T18:29:50.000Z'::timestamptz,
      18,
      '',
      NULL,
      '2025-08-07T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2535' OR e."legacyEmpId" = '2535' OR e."legacyEmpId" = '10EMP2535' OR e."legacyEmpId" = '10EMP2535' OR e."legacyEmpId" = '10EMP2535'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2535';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-18T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-20T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-18T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-20T18:29:50.000Z'::timestamptz,
      '2025-09-18T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      '2025-09-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-18T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2736' OR e."legacyEmpId" = '2736' OR e."legacyEmpId" = '10EMP2736' OR e."legacyEmpId" = '10EMP2736' OR e."legacyEmpId" = '10EMP2736'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2736';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'SL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Sick Levae', 'SL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 1,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-29T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-29T18:29:50.000Z'::timestamptz,
      '2025-07-29T18:29:50.000Z'::timestamptz,
      1,
      '',
      NULL,
      '2025-07-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2628' OR e."legacyEmpId" = '2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2628';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-02T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 34,
    status = 'APPROVED',
    "approvedAt" = '2025-08-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-31T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-31T18:29:50.000Z'::timestamptz,
      '2025-08-29T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-10-02T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      34,
      'APPROVED',
      '2025-08-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '142' OR e."legacyEmpId" = '142' OR e."legacyEmpId" = '10EMP142' OR e."legacyEmpId" = '10EMP142' OR e."legacyEmpId" = '10EMP0142'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 142';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-18T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-17T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-03T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-03T18:29:50.000Z'::timestamptz,
      '2025-08-17T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-08-18T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-17T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2534' OR e."legacyEmpId" = '2534' OR e."legacyEmpId" = '10EMP2534' OR e."legacyEmpId" = '10EMP2534' OR e."legacyEmpId" = '10EMP2534'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2534';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 16,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-07T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 49,
    status = 'APPROVED',
    "approvedAt" = '2025-08-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-04T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-04T18:29:50.000Z'::timestamptz,
      '2025-08-19T18:29:50.000Z'::timestamptz,
      16,
      '',
      NULL,
      '2025-10-07T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      49,
      'APPROVED',
      '2025-08-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '102' OR e."legacyEmpId" = '102' OR e."legacyEmpId" = '10EMP102' OR e."legacyEmpId" = '10EMP102' OR e."legacyEmpId" = '10EMP0102'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 102';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 29,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-08T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-07T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-07T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-10T18:29:50.000Z'::timestamptz,
      '2025-09-07T18:29:50.000Z'::timestamptz,
      29,
      '',
      NULL,
      '2025-09-08T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-07T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2565' OR e."legacyEmpId" = '2565' OR e."legacyEmpId" = '10EMP2565' OR e."legacyEmpId" = '10EMP2565' OR e."legacyEmpId" = '10EMP2565'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2565';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 22,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-01T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-31T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-31T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-10T18:29:50.000Z'::timestamptz,
      '2025-08-31T18:29:50.000Z'::timestamptz,
      22,
      '',
      NULL,
      '2025-09-01T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-31T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2682' OR e."legacyEmpId" = '2682' OR e."legacyEmpId" = '10EMP2682' OR e."legacyEmpId" = '10EMP2682' OR e."legacyEmpId" = '10EMP2682'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2682';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-11T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 3,
    status = 'APPROVED',
    "approvedAt" = '2025-09-08T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-10T18:29:50.000Z'::timestamptz,
      '2025-09-08T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-09-11T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      3,
      'APPROVED',
      '2025-09-08T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2499' OR e."legacyEmpId" = '2499' OR e."legacyEmpId" = '10EMP2499' OR e."legacyEmpId" = '10EMP2499' OR e."legacyEmpId" = '10EMP2499'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2499';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-26T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-25T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-11T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-25T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-11T18:29:50.000Z'::timestamptz,
      '2025-08-25T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-08-26T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-25T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1884' OR e."legacyEmpId" = '1884' OR e."legacyEmpId" = '10EMP1884' OR e."legacyEmpId" = '10EMP1884' OR e."legacyEmpId" = '10EMP1884'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1884';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 8,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-25T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-24T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-17T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-24T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-17T18:29:50.000Z'::timestamptz,
      '2025-08-24T18:29:50.000Z'::timestamptz,
      8,
      '',
      NULL,
      '2025-08-25T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-24T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2406' OR e."legacyEmpId" = '2406' OR e."legacyEmpId" = '10EMP2406' OR e."legacyEmpId" = '10EMP2406' OR e."legacyEmpId" = '10EMP2406'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2406';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 26,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-14T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-20T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-14T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-20T18:29:50.000Z'::timestamptz,
      '2025-09-14T18:29:50.000Z'::timestamptz,
      26,
      '',
      NULL,
      '2025-09-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-14T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '93' OR e."legacyEmpId" = '93' OR e."legacyEmpId" = '10EMP93' OR e."legacyEmpId" = '10EMP93' OR e."legacyEmpId" = '10EMP0093'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 93';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Levae', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 2,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-22T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-21T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-20T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-21T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-20T18:29:50.000Z'::timestamptz,
      '2025-07-21T18:29:50.000Z'::timestamptz,
      2,
      '',
      NULL,
      '2025-07-22T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-21T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '951' OR e."legacyEmpId" = '951' OR e."legacyEmpId" = '10EMP951' OR e."legacyEmpId" = '10EMP951' OR e."legacyEmpId" = '10EMP0951'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 951';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 7,
    status = 'APPROVED',
    "approvedAt" = '2025-10-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-22T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-22T18:29:50.000Z'::timestamptz,
      '2025-10-20T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-10-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      7,
      'APPROVED',
      '2025-10-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1539' OR e."legacyEmpId" = '1539' OR e."legacyEmpId" = '10EMP1539' OR e."legacyEmpId" = '10EMP1539' OR e."legacyEmpId" = '10EMP1539'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1539';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-28T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 5,
    status = 'APPROVED',
    "approvedAt" = '2025-09-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-24T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-24T18:29:50.000Z'::timestamptz,
      '2025-09-23T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      '2025-09-28T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      5,
      'APPROVED',
      '2025-09-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '835' OR e."legacyEmpId" = '835' OR e."legacyEmpId" = '10EMP835' OR e."legacyEmpId" = '10EMP835' OR e."legacyEmpId" = '10EMP0835'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 835';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-10T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-26T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-26T18:29:50.000Z'::timestamptz,
      '2025-09-09T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-09-10T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1417' OR e."legacyEmpId" = '1417' OR e."legacyEmpId" = '10EMP1417' OR e."legacyEmpId" = '10EMP1417' OR e."legacyEmpId" = '10EMP1417'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1417';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-31T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-31T18:29:50.000Z'::timestamptz,
      '2025-09-29T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-09-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '979' OR e."legacyEmpId" = '979' OR e."legacyEmpId" = '10EMP979' OR e."legacyEmpId" = '10EMP979' OR e."legacyEmpId" = '10EMP0979'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 979';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 16,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-18T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-09-03T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-18T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-09-03T18:29:50.000Z'::timestamptz,
      '2025-09-18T18:29:50.000Z'::timestamptz,
      16,
      '',
      NULL,
      '2025-09-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-18T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1221' OR e."legacyEmpId" = '1221' OR e."legacyEmpId" = '10EMP1221' OR e."legacyEmpId" = '10EMP1221' OR e."legacyEmpId" = '10EMP1221'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1221';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-08T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 3,
    status = 'APPROVED',
    "approvedAt" = '2025-11-05T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-09-07T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-05T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-09-07T18:29:50.000Z'::timestamptz,
      '2025-11-05T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-11-08T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      3,
      'APPROVED',
      '2025-11-05T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2656' OR e."legacyEmpId" = '2656' OR e."legacyEmpId" = '10EMP2656' OR e."legacyEmpId" = '10EMP2656' OR e."legacyEmpId" = '10EMP2656'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2656';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 33,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-10T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-09-07T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-09-07T18:29:50.000Z'::timestamptz,
      '2025-10-09T18:29:50.000Z'::timestamptz,
      33,
      '',
      NULL,
      '2025-10-10T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1093' OR e."legacyEmpId" = '1093' OR e."legacyEmpId" = '10EMP1093' OR e."legacyEmpId" = '10EMP1093' OR e."legacyEmpId" = '10EMP1093'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1093';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 8,
    status = 'APPROVED',
    "approvedAt" = '2025-11-08T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-09-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-09-10T18:29:50.000Z'::timestamptz,
      '2025-11-08T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-11-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      8,
      'APPROVED',
      '2025-11-08T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2449' OR e."legacyEmpId" = '2449' OR e."legacyEmpId" = '10EMP2449' OR e."legacyEmpId" = '10EMP2449' OR e."legacyEmpId" = '10EMP2449'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2449';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-20T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-11-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-09-21T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-09-21T18:29:50.000Z'::timestamptz,
      '2025-11-19T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-11-20T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-11-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1087' OR e."legacyEmpId" = '1087' OR e."legacyEmpId" = '10EMP1087' OR e."legacyEmpId" = '10EMP1087' OR e."legacyEmpId" = '10EMP1087'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1087';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-11-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-06T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-06T18:29:50.000Z'::timestamptz,
      '2025-11-04T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-11-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-11-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2699' OR e."legacyEmpId" = '2699' OR e."legacyEmpId" = '10EMP2699' OR e."legacyEmpId" = '10EMP2699' OR e."legacyEmpId" = '10EMP2699'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2699';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-18T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-17T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-03T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-03T18:29:50.000Z'::timestamptz,
      '2025-08-17T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-08-18T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-17T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2656' OR e."legacyEmpId" = '2656' OR e."legacyEmpId" = '10EMP2656' OR e."legacyEmpId" = '10EMP2656' OR e."legacyEmpId" = '10EMP2656'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2656';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 8,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-02-14T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-02-13T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-02-06T18:29:50.000Z'::timestamptz AND "endDate" = '2025-02-13T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-02-06T18:29:50.000Z'::timestamptz,
      '2025-02-13T18:29:50.000Z'::timestamptz,
      8,
      '',
      NULL,
      '2025-02-14T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-02-13T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '190' OR e."legacyEmpId" = '190' OR e."legacyEmpId" = '10EMP190' OR e."legacyEmpId" = '10EMP190' OR e."legacyEmpId" = '10EMP0190'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 190';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 4,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-22T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-21T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-18T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-21T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-18T18:29:50.000Z'::timestamptz,
      '2025-08-21T18:29:50.000Z'::timestamptz,
      4,
      '',
      NULL,
      '2025-08-22T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-21T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2526' OR e."legacyEmpId" = '2526' OR e."legacyEmpId" = '10EMP2526' OR e."legacyEmpId" = '10EMP2526' OR e."legacyEmpId" = '10EMP2526'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2526';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-18T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-09-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-18T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-09-19T18:29:50.000Z'::timestamptz,
      '2025-10-18T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-10-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-18T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2707' OR e."legacyEmpId" = '2707' OR e."legacyEmpId" = '10EMP2707' OR e."legacyEmpId" = '10EMP2707' OR e."legacyEmpId" = '10EMP2707'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2707';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 16,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-04T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-19T18:29:50.000Z'::timestamptz,
      '2025-09-03T18:29:50.000Z'::timestamptz,
      16,
      '',
      NULL,
      '2025-09-04T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2670' OR e."legacyEmpId" = '2670' OR e."legacyEmpId" = '10EMP2670' OR e."legacyEmpId" = '10EMP2670' OR e."legacyEmpId" = '10EMP2670'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2670';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 14,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 27,
    status = 'APPROVED',
    "approvedAt" = '2025-08-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-06T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-06T18:29:50.000Z'::timestamptz,
      '2025-08-19T18:29:50.000Z'::timestamptz,
      14,
      '',
      NULL,
      '2025-09-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      27,
      'APPROVED',
      '2025-08-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2240' OR e."legacyEmpId" = '2240' OR e."legacyEmpId" = '10EMP2240' OR e."legacyEmpId" = '10EMP2240' OR e."legacyEmpId" = '10EMP2240'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2240';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-09T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-08T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-10T18:29:50.000Z'::timestamptz,
      '2025-10-08T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-10-09T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-08T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2610' OR e."legacyEmpId" = '2610' OR e."legacyEmpId" = '10EMP2610' OR e."legacyEmpId" = '10EMP2610' OR e."legacyEmpId" = '10EMP2610'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2610';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-04T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-20T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-20T18:29:50.000Z'::timestamptz,
      '2025-08-03T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-08-04T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2231' OR e."legacyEmpId" = '2231' OR e."legacyEmpId" = '10EMP2231' OR e."legacyEmpId" = '10EMP2231' OR e."legacyEmpId" = '10EMP2231'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2231';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 19,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-29T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-28T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-28T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-10T18:29:50.000Z'::timestamptz,
      '2025-08-28T18:29:50.000Z'::timestamptz,
      19,
      '',
      NULL,
      '2025-08-29T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-28T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2429' OR e."legacyEmpId" = '2429' OR e."legacyEmpId" = '10EMP2429' OR e."legacyEmpId" = '10EMP2429' OR e."legacyEmpId" = '10EMP2429'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2429';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-11-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-09-21T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-09-21T18:29:50.000Z'::timestamptz,
      '2025-11-19T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-11-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      4,
      'APPROVED',
      '2025-11-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '659' OR e."legacyEmpId" = '659' OR e."legacyEmpId" = '10EMP659' OR e."legacyEmpId" = '10EMP659' OR e."legacyEmpId" = '10EMP0659'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 659';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-14T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-12-10T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-12T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-10T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-12T18:29:50.000Z'::timestamptz,
      '2025-12-10T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-12-14T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      4,
      'APPROVED',
      '2025-12-10T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2739' OR e."legacyEmpId" = '2739' OR e."legacyEmpId" = '10EMP2739' OR e."legacyEmpId" = '10EMP2739' OR e."legacyEmpId" = '10EMP2739'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2739';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 18,
    reason = 'change to medical leave 10 and annual leave 8',
    remark = 'change to medical leave 10 and annual leave 8',
    "rejoiningDate" = '2025-08-21T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-03T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-03T18:29:50.000Z'::timestamptz,
      '2025-08-20T18:29:50.000Z'::timestamptz,
      18,
      'change to medical leave 10 and annual leave 8',
      'change to medical leave 10 and annual leave 8',
      '2025-08-21T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2692' OR e."legacyEmpId" = '2692' OR e."legacyEmpId" = '10EMP2692' OR e."legacyEmpId" = '10EMP2692' OR e."legacyEmpId" = '10EMP2692'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2692';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-09T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-10T18:29:50.000Z'::timestamptz,
      '2025-09-09T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      '2025-09-09T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1061' OR e."legacyEmpId" = '1061' OR e."legacyEmpId" = '10EMP1061' OR e."legacyEmpId" = '10EMP1061' OR e."legacyEmpId" = '10EMP1061'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1061';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 4,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-21T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-17T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-17T18:29:50.000Z'::timestamptz,
      '2025-08-20T18:29:50.000Z'::timestamptz,
      4,
      '',
      NULL,
      '2025-08-21T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2417' OR e."legacyEmpId" = '2417' OR e."legacyEmpId" = '10EMP2417' OR e."legacyEmpId" = '10EMP2417' OR e."legacyEmpId" = '10EMP2417'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2417';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-12T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 4,
    status = 'APPROVED',
    "approvedAt" = '2025-10-08T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-10T18:29:50.000Z'::timestamptz,
      '2025-10-08T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-10-12T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      4,
      'APPROVED',
      '2025-10-08T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '276' OR e."legacyEmpId" = '276' OR e."legacyEmpId" = '10EMP276' OR e."legacyEmpId" = '10EMP276' OR e."legacyEmpId" = '10EMP0276'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 276';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-07T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-23T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-23T18:29:50.000Z'::timestamptz,
      '2025-08-06T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-08-07T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '945' OR e."legacyEmpId" = '945' OR e."legacyEmpId" = '10EMP945' OR e."legacyEmpId" = '10EMP945' OR e."legacyEmpId" = '10EMP0945'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 945';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-07-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 38,
    status = 'APPROVED',
    "approvedAt" = '2025-06-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-24T18:29:50.000Z'::timestamptz AND "endDate" = '2025-06-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-24T18:29:50.000Z'::timestamptz,
      '2025-06-22T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-07-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      38,
      'APPROVED',
      '2025-06-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '351' OR e."legacyEmpId" = '351' OR e."legacyEmpId" = '10EMP351' OR e."legacyEmpId" = '10EMP351' OR e."legacyEmpId" = '10EMP0351'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 351';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-17T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-17T18:29:50.000Z'::timestamptz,
      '2025-09-15T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-09-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '276' OR e."legacyEmpId" = '276' OR e."legacyEmpId" = '10EMP276' OR e."legacyEmpId" = '10EMP276' OR e."legacyEmpId" = '10EMP0276'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 276';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-08-07T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-08-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-23T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-23T18:29:50.000Z'::timestamptz,
      '2025-08-06T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-08-07T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-08-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '565' OR e."legacyEmpId" = '565' OR e."legacyEmpId" = '10EMP565' OR e."legacyEmpId" = '10EMP565' OR e."legacyEmpId" = '10EMP0565'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 565';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = 'Due to Wife medical condition document submitted',
    remark = 'Due to Wife medical condition document submitted',
    "rejoiningDate" = '2025-09-11T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 13,
    status = 'APPROVED',
    "approvedAt" = '2025-08-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-01T18:29:50.000Z'::timestamptz AND "endDate" = '2025-08-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-01T18:29:50.000Z'::timestamptz,
      '2025-08-29T18:29:50.000Z'::timestamptz,
      60,
      'Due to Wife medical condition document submitted',
      'Due to Wife medical condition document submitted',
      '2025-09-11T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      13,
      'APPROVED',
      '2025-08-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1856' OR e."legacyEmpId" = '1856' OR e."legacyEmpId" = '10EMP1856' OR e."legacyEmpId" = '10EMP1856' OR e."legacyEmpId" = '10EMP1856'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1856';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 10,
    reason = 'Requested from thouseef',
    remark = 'Requested from thouseef',
    "rejoiningDate" = '2025-07-20T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-07-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-07-10T18:29:50.000Z'::timestamptz AND "endDate" = '2025-07-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-07-10T18:29:50.000Z'::timestamptz,
      '2025-07-19T18:29:50.000Z'::timestamptz,
      10,
      'Requested from thouseef',
      'Requested from thouseef',
      '2025-07-20T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-07-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2724' OR e."legacyEmpId" = '2724' OR e."legacyEmpId" = '10EMP2724' OR e."legacyEmpId" = '10EMP2724' OR e."legacyEmpId" = '10EMP2724'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2724';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-07T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-11-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-08T18:29:50.000Z'::timestamptz,
      '2025-11-06T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-11-07T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-11-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1319' OR e."legacyEmpId" = '1319' OR e."legacyEmpId" = '10EMP1319' OR e."legacyEmpId" = '10EMP1319' OR e."legacyEmpId" = '10EMP1319'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1319';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 5,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-04-07T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-04-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-04-02T18:29:50.000Z'::timestamptz AND "endDate" = '2025-04-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-04-02T18:29:50.000Z'::timestamptz,
      '2025-04-06T18:29:50.000Z'::timestamptz,
      5,
      '',
      NULL,
      '2025-04-07T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-04-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1319' OR e."legacyEmpId" = '1319' OR e."legacyEmpId" = '10EMP1319' OR e."legacyEmpId" = '10EMP1319' OR e."legacyEmpId" = '10EMP1319'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1319';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 22,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-02T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-01T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-11T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-01T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-11T18:29:50.000Z'::timestamptz,
      '2025-09-01T18:29:50.000Z'::timestamptz,
      22,
      '',
      NULL,
      '2025-09-02T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-01T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '360' OR e."legacyEmpId" = '360' OR e."legacyEmpId" = '10EMP360' OR e."legacyEmpId" = '10EMP360' OR e."legacyEmpId" = '10EMP0360'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 360';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 20,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-20T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-31T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-31T18:29:50.000Z'::timestamptz,
      '2025-09-19T18:29:50.000Z'::timestamptz,
      20,
      '',
      NULL,
      '2025-09-20T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2451' OR e."legacyEmpId" = '2451' OR e."legacyEmpId" = '10EMP2451' OR e."legacyEmpId" = '10EMP2451' OR e."legacyEmpId" = '10EMP2451'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2451';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-13T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 3,
    status = 'APPROVED',
    "approvedAt" = '2025-11-10T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-12T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-10T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-12T18:29:50.000Z'::timestamptz,
      '2025-11-10T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-11-13T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      3,
      'APPROVED',
      '2025-11-10T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2687' OR e."legacyEmpId" = '2687' OR e."legacyEmpId" = '10EMP2687' OR e."legacyEmpId" = '10EMP2687' OR e."legacyEmpId" = '10EMP2687'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2687';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 33,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-21T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-11-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-19T18:29:50.000Z'::timestamptz,
      '2025-11-20T18:29:50.000Z'::timestamptz,
      33,
      '',
      NULL,
      '2025-11-21T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-11-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2589' OR e."legacyEmpId" = '2589' OR e."legacyEmpId" = '10EMP2589' OR e."legacyEmpId" = '10EMP2589' OR e."legacyEmpId" = '10EMP2589'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2589';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-18T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 32,
    status = 'APPROVED',
    "approvedAt" = '2026-01-17T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-19T18:29:50.000Z'::timestamptz,
      '2026-01-17T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2026-02-18T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      32,
      'APPROVED',
      '2026-01-17T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2436' OR e."legacyEmpId" = '2436' OR e."legacyEmpId" = '10EMP2436' OR e."legacyEmpId" = '10EMP2436' OR e."legacyEmpId" = '10EMP2436'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2436';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-25T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 3,
    status = 'APPROVED',
    "approvedAt" = '2025-12-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-24T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-24T18:29:50.000Z'::timestamptz,
      '2025-12-22T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-12-25T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      3,
      'APPROVED',
      '2025-12-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2709' OR e."legacyEmpId" = '2709' OR e."legacyEmpId" = '10EMP2709' OR e."legacyEmpId" = '10EMP2709' OR e."legacyEmpId" = '10EMP2709'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2709';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 2,
    status = 'APPROVED',
    "approvedAt" = '2025-11-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-05T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-05T18:29:50.000Z'::timestamptz,
      '2025-11-03T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-11-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      2,
      'APPROVED',
      '2025-11-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '190' OR e."legacyEmpId" = '190' OR e."legacyEmpId" = '10EMP190' OR e."legacyEmpId" = '10EMP190' OR e."legacyEmpId" = '10EMP0190'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 190';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 5,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-03T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-09-28T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-09-28T18:29:50.000Z'::timestamptz,
      '2025-10-02T18:29:50.000Z'::timestamptz,
      5,
      '',
      NULL,
      '2025-10-03T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2609' OR e."legacyEmpId" = '2609' OR e."legacyEmpId" = '10EMP2609' OR e."legacyEmpId" = '10EMP2609' OR e."legacyEmpId" = '10EMP2609'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2609';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-05T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-05T18:29:50.000Z'::timestamptz,
      '2025-12-04T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      '2025-12-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1944' OR e."legacyEmpId" = '1944' OR e."legacyEmpId" = '10EMP1944' OR e."legacyEmpId" = '10EMP1944' OR e."legacyEmpId" = '10EMP1944'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1944';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-26T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 7,
    status = 'APPROVED',
    "approvedAt" = '2025-12-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-19T18:29:50.000Z'::timestamptz,
      '2025-12-19T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      '2025-12-26T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      7,
      'APPROVED',
      '2025-12-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1867' OR e."legacyEmpId" = '1867' OR e."legacyEmpId" = '10EMP1867' OR e."legacyEmpId" = '10EMP1867' OR e."legacyEmpId" = '10EMP1867'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1867';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 50,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-29T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 20,
    status = 'APPROVED',
    "approvedAt" = '2025-11-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-09-21T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-09-21T18:29:50.000Z'::timestamptz,
      '2025-11-09T18:29:50.000Z'::timestamptz,
      50,
      '',
      NULL,
      '2025-11-29T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      20,
      'APPROVED',
      '2025-11-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1090' OR e."legacyEmpId" = '1090' OR e."legacyEmpId" = '10EMP1090' OR e."legacyEmpId" = '10EMP1090' OR e."legacyEmpId" = '10EMP1090'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1090';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-01T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 6,
    status = 'APPROVED',
    "approvedAt" = '2026-01-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-26T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-26T18:29:50.000Z'::timestamptz,
      '2026-01-26T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      '2026-02-01T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      6,
      'APPROVED',
      '2026-01-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2407' OR e."legacyEmpId" = '2407' OR e."legacyEmpId" = '10EMP2407' OR e."legacyEmpId" = '10EMP2407' OR e."legacyEmpId" = '10EMP2407'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2407';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-09-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-09-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-24T18:29:50.000Z'::timestamptz AND "endDate" = '2025-09-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-24T18:29:50.000Z'::timestamptz,
      '2025-09-22T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-09-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-09-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2696' OR e."legacyEmpId" = '2696' OR e."legacyEmpId" = '10EMP2696' OR e."legacyEmpId" = '10EMP2696' OR e."legacyEmpId" = '10EMP2696'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2696';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 3,
    status = 'APPROVED',
    "approvedAt" = '2025-11-24T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-26T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-24T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-26T18:29:50.000Z'::timestamptz,
      '2025-11-24T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-11-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      3,
      'APPROVED',
      '2025-11-24T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2027' OR e."legacyEmpId" = '2027' OR e."legacyEmpId" = '10EMP2027' OR e."legacyEmpId" = '10EMP2027' OR e."legacyEmpId" = '10EMP2027'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2027';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 11,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-05T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-05T18:29:50.000Z'::timestamptz,
      '2025-10-15T18:29:50.000Z'::timestamptz,
      11,
      '',
      NULL,
      '2025-10-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2638' OR e."legacyEmpId" = '2638' OR e."legacyEmpId" = '10EMP2638' OR e."legacyEmpId" = '10EMP2638' OR e."legacyEmpId" = '10EMP2638'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2638';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 18,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-06T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-11-05T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-05T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-19T18:29:50.000Z'::timestamptz,
      '2025-11-05T18:29:50.000Z'::timestamptz,
      18,
      '',
      NULL,
      '2025-11-06T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-11-05T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2486' OR e."legacyEmpId" = '2486' OR e."legacyEmpId" = '10EMP2486' OR e."legacyEmpId" = '10EMP2486' OR e."legacyEmpId" = '10EMP2486'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2486';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 20,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-11-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-27T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-27T18:29:50.000Z'::timestamptz,
      '2025-11-15T18:29:50.000Z'::timestamptz,
      20,
      '',
      NULL,
      '2025-11-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-11-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '41' OR e."legacyEmpId" = '41' OR e."legacyEmpId" = '10EMP41' OR e."legacyEmpId" = '10EMP41' OR e."legacyEmpId" = '10EMP0041'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 41';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-01T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 8,
    status = 'APPROVED',
    "approvedAt" = '2026-01-24T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-26T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-24T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-26T18:29:50.000Z'::timestamptz,
      '2026-01-24T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2026-02-01T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      8,
      'APPROVED',
      '2026-01-24T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1544' OR e."legacyEmpId" = '1544' OR e."legacyEmpId" = '10EMP1544' OR e."legacyEmpId" = '10EMP1544' OR e."legacyEmpId" = '10EMP1544'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1544';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-18T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 11,
    status = 'APPROVED',
    "approvedAt" = '2026-01-07T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-09T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-07T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-09T18:29:50.000Z'::timestamptz,
      '2026-01-07T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2026-01-18T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      11,
      'APPROVED',
      '2026-01-07T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2318' OR e."legacyEmpId" = '2318' OR e."legacyEmpId" = '10EMP2318' OR e."legacyEmpId" = '10EMP2318' OR e."legacyEmpId" = '10EMP2318'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2318';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-31T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 2,
    status = 'APPROVED',
    "approvedAt" = '2025-12-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-30T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-30T18:29:50.000Z'::timestamptz,
      '2025-12-29T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-12-31T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      2,
      'APPROVED',
      '2025-12-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2606' OR e."legacyEmpId" = '2606' OR e."legacyEmpId" = '10EMP2606' OR e."legacyEmpId" = '10EMP2606' OR e."legacyEmpId" = '10EMP2606'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2606';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 14,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-18T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-05T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-18T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-05T18:29:50.000Z'::timestamptz,
      '2025-10-18T18:29:50.000Z'::timestamptz,
      14,
      '',
      NULL,
      '2025-10-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-18T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2078' OR e."legacyEmpId" = '2078' OR e."legacyEmpId" = '10EMP2078' OR e."legacyEmpId" = '10EMP2078' OR e."legacyEmpId" = '10EMP2078'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2078';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Levae', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 11,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-19T18:29:50.000Z'::timestamptz,
      '2025-10-29T18:29:50.000Z'::timestamptz,
      11,
      '',
      NULL,
      '2025-10-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1605' OR e."legacyEmpId" = '1605' OR e."legacyEmpId" = '10EMP1605' OR e."legacyEmpId" = '10EMP1605' OR e."legacyEmpId" = '10EMP1605'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1605';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-04T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-05T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-05T18:29:50.000Z'::timestamptz,
      '2025-12-03T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2025-12-04T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2816' OR e."legacyEmpId" = '2816' OR e."legacyEmpId" = '10EMP2816' OR e."legacyEmpId" = '10EMP2816' OR e."legacyEmpId" = '10EMP2816'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2816';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 5,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-13T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-08T18:29:50.000Z'::timestamptz,
      '2025-10-12T18:29:50.000Z'::timestamptz,
      5,
      '',
      NULL,
      '2025-10-13T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1856' OR e."legacyEmpId" = '1856' OR e."legacyEmpId" = '10EMP1856' OR e."legacyEmpId" = '10EMP1856' OR e."legacyEmpId" = '10EMP1856'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1856';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 3,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-03T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-09-30T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-09-30T18:29:50.000Z'::timestamptz,
      '2025-10-02T18:29:50.000Z'::timestamptz,
      3,
      '',
      NULL,
      '2025-10-03T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1263' OR e."legacyEmpId" = '1263' OR e."legacyEmpId" = '10EMP1263' OR e."legacyEmpId" = '10EMP1263' OR e."legacyEmpId" = '10EMP1263'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1263';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Levae', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 11,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-19T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-19T18:29:50.000Z'::timestamptz,
      '2025-10-29T18:29:50.000Z'::timestamptz,
      11,
      '',
      NULL,
      '2025-10-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1220' OR e."legacyEmpId" = '1220' OR e."legacyEmpId" = '10EMP1220' OR e."legacyEmpId" = '10EMP1220' OR e."legacyEmpId" = '10EMP1220'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1220';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 33,
    status = 'APPROVED',
    "approvedAt" = '2026-01-14T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-16T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-14T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-16T18:29:50.000Z'::timestamptz,
      '2026-01-14T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2026-02-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      33,
      'APPROVED',
      '2026-01-14T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2120' OR e."legacyEmpId" = '2120' OR e."legacyEmpId" = '10EMP2120' OR e."legacyEmpId" = '10EMP2120' OR e."legacyEmpId" = '10EMP2120'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2120';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-03T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 3,
    status = 'APPROVED',
    "approvedAt" = '2025-11-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-01T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-01T18:29:50.000Z'::timestamptz,
      '2025-11-30T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-12-03T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      3,
      'APPROVED',
      '2025-11-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2712' OR e."legacyEmpId" = '2712' OR e."legacyEmpId" = '10EMP2712' OR e."legacyEmpId" = '10EMP2712' OR e."legacyEmpId" = '10EMP2712'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2712';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 23,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-04T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-04T18:29:50.000Z'::timestamptz,
      '2025-10-26T18:29:50.000Z'::timestamptz,
      23,
      '',
      NULL,
      '2025-10-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2635' OR e."legacyEmpId" = '2635' OR e."legacyEmpId" = '10EMP2635' OR e."legacyEmpId" = '10EMP2635' OR e."legacyEmpId" = '10EMP2635'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2635';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 26,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-09T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-08T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-14T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-14T18:29:50.000Z'::timestamptz,
      '2026-01-08T18:29:50.000Z'::timestamptz,
      26,
      '',
      NULL,
      '2026-01-09T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-08T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '602' OR e."legacyEmpId" = '602' OR e."legacyEmpId" = '10EMP602' OR e."legacyEmpId" = '10EMP602' OR e."legacyEmpId" = '10EMP0602'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 602';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 64,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-03T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-11-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-08-31T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-08-31T18:29:50.000Z'::timestamptz,
      '2025-11-02T18:29:50.000Z'::timestamptz,
      64,
      '',
      NULL,
      '2025-11-03T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-11-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '483' OR e."legacyEmpId" = '483' OR e."legacyEmpId" = '10EMP483' OR e."legacyEmpId" = '10EMP483' OR e."legacyEmpId" = '10EMP0483'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 483';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-09T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 21,
    status = 'APPROVED',
    "approvedAt" = '2025-11-18T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-04T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-18T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-04T18:29:50.000Z'::timestamptz,
      '2025-11-18T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-12-09T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      21,
      'APPROVED',
      '2025-11-18T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2636' OR e."legacyEmpId" = '2636' OR e."legacyEmpId" = '10EMP2636' OR e."legacyEmpId" = '10EMP2636' OR e."legacyEmpId" = '10EMP2636'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2636';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-07T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-11-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-08T18:29:50.000Z'::timestamptz,
      '2025-11-06T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2025-11-07T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-11-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2596' OR e."legacyEmpId" = '2596' OR e."legacyEmpId" = '10EMP2596' OR e."legacyEmpId" = '10EMP2596' OR e."legacyEmpId" = '10EMP2596'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2596';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 17,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-17T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 85,
    status = 'APPROVED',
    "approvedAt" = '2025-11-24T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-08T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-24T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-08T18:29:50.000Z'::timestamptz,
      '2025-11-24T18:29:50.000Z'::timestamptz,
      17,
      '',
      NULL,
      '2026-02-17T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      85,
      'APPROVED',
      '2025-11-24T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2692' OR e."legacyEmpId" = '2692' OR e."legacyEmpId" = '10EMP2692' OR e."legacyEmpId" = '10EMP2692' OR e."legacyEmpId" = '10EMP2692'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2692';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'PL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Paternity Leave', 'PL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 4,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-04T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-30T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-30T18:29:50.000Z'::timestamptz,
      '2025-12-03T18:29:50.000Z'::timestamptz,
      4,
      '',
      NULL,
      '2025-12-04T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '234' OR e."legacyEmpId" = '234' OR e."legacyEmpId" = '10EMP234' OR e."legacyEmpId" = '10EMP234' OR e."legacyEmpId" = '10EMP0234'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 234';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 31,
    status = 'APPROVED',
    "approvedAt" = '2026-01-05T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-06T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-05T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-06T18:29:50.000Z'::timestamptz,
      '2026-01-05T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      '2026-02-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      31,
      'APPROVED',
      '2026-01-05T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2507' OR e."legacyEmpId" = '2507' OR e."legacyEmpId" = '10EMP2507' OR e."legacyEmpId" = '10EMP2507' OR e."legacyEmpId" = '10EMP2507'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2507';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 10,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-11-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-06T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-06T18:29:50.000Z'::timestamptz,
      '2025-11-15T18:29:50.000Z'::timestamptz,
      10,
      '',
      NULL,
      '2025-11-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-11-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1315' OR e."legacyEmpId" = '1315' OR e."legacyEmpId" = '10EMP1315' OR e."legacyEmpId" = '10EMP1315' OR e."legacyEmpId" = '10EMP1315'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1315';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 26,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-09T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-09T18:29:50.000Z'::timestamptz,
      '2025-12-04T18:29:50.000Z'::timestamptz,
      26,
      '',
      NULL,
      '2025-12-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2736' OR e."legacyEmpId" = '2736' OR e."legacyEmpId" = '10EMP2736' OR e."legacyEmpId" = '10EMP2736' OR e."legacyEmpId" = '10EMP2736'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2736';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 32,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-18T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-17T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-16T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-16T18:29:50.000Z'::timestamptz,
      '2025-12-17T18:29:50.000Z'::timestamptz,
      32,
      '',
      NULL,
      '2025-12-18T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-17T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2727' OR e."legacyEmpId" = '2727' OR e."legacyEmpId" = '10EMP2727' OR e."legacyEmpId" = '10EMP2727' OR e."legacyEmpId" = '10EMP2727'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2727';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-28T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-28T18:29:50.000Z'::timestamptz,
      '2026-01-26T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2026-01-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2618' OR e."legacyEmpId" = '2618' OR e."legacyEmpId" = '10EMP2618' OR e."legacyEmpId" = '10EMP2618' OR e."legacyEmpId" = '10EMP2618'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2618';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-18T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 6,
    status = 'APPROVED',
    "approvedAt" = '2026-01-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-14T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-14T18:29:50.000Z'::timestamptz,
      '2026-01-12T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2026-01-18T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      6,
      'APPROVED',
      '2026-01-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2628' OR e."legacyEmpId" = '2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2628';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 2,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-03T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-03T18:29:50.000Z'::timestamptz,
      '2025-12-04T18:29:50.000Z'::timestamptz,
      2,
      '',
      NULL,
      '2025-12-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2538' OR e."legacyEmpId" = '2538' OR e."legacyEmpId" = '10EMP2538' OR e."legacyEmpId" = '10EMP2538' OR e."legacyEmpId" = '10EMP2538'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2538';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 11,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 49,
    status = 'APPROVED',
    "approvedAt" = '2025-11-27T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-17T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-27T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-17T18:29:50.000Z'::timestamptz,
      '2025-11-27T18:29:50.000Z'::timestamptz,
      11,
      '',
      NULL,
      '2026-01-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      49,
      'APPROVED',
      '2025-11-27T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2403' OR e."legacyEmpId" = '2403' OR e."legacyEmpId" = '10EMP2403' OR e."legacyEmpId" = '10EMP2403' OR e."legacyEmpId" = '10EMP2403'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2403';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 13,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-20T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-11-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-07T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-07T18:29:50.000Z'::timestamptz,
      '2025-11-19T18:29:50.000Z'::timestamptz,
      13,
      '',
      NULL,
      '2025-11-20T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-11-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '924' OR e."legacyEmpId" = '924' OR e."legacyEmpId" = '10EMP924' OR e."legacyEmpId" = '10EMP924' OR e."legacyEmpId" = '10EMP0924'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 924';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 8,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-03T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-25T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-25T18:29:50.000Z'::timestamptz,
      '2025-12-02T18:29:50.000Z'::timestamptz,
      8,
      '',
      NULL,
      '2025-12-03T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2231' OR e."legacyEmpId" = '2231' OR e."legacyEmpId" = '10EMP2231' OR e."legacyEmpId" = '10EMP2231' OR e."legacyEmpId" = '10EMP2231'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2231';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 26,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-02T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-01T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-07T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-01T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-07T18:29:50.000Z'::timestamptz,
      '2026-01-01T18:29:50.000Z'::timestamptz,
      26,
      '',
      NULL,
      '2026-01-02T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-01T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2760' OR e."legacyEmpId" = '2760' OR e."legacyEmpId" = '10EMP2760' OR e."legacyEmpId" = '10EMP2760' OR e."legacyEmpId" = '10EMP2760'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2760';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-21T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-02-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-21T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-21T18:29:50.000Z'::timestamptz,
      '2026-02-20T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      '2026-02-21T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-02-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2626' OR e."legacyEmpId" = '2626' OR e."legacyEmpId" = '10EMP2626' OR e."legacyEmpId" = '10EMP2626' OR e."legacyEmpId" = '10EMP2626'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2626';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-02-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-23T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-23T18:29:50.000Z'::timestamptz,
      '2026-02-20T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-02-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2565' OR e."legacyEmpId" = '2565' OR e."legacyEmpId" = '10EMP2565' OR e."legacyEmpId" = '10EMP2565' OR e."legacyEmpId" = '10EMP2565'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2565';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 19,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-23T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-04T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-04T18:29:50.000Z'::timestamptz,
      '2026-01-22T18:29:50.000Z'::timestamptz,
      19,
      '',
      NULL,
      '2026-01-23T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2630' OR e."legacyEmpId" = '2630' OR e."legacyEmpId" = '10EMP2630' OR e."legacyEmpId" = '10EMP2630' OR e."legacyEmpId" = '10EMP2630'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2630';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 33,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-09T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-02-08T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-07T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-07T18:29:50.000Z'::timestamptz,
      '2026-02-08T18:29:50.000Z'::timestamptz,
      33,
      '',
      NULL,
      '2026-02-09T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-02-08T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '67' OR e."legacyEmpId" = '67' OR e."legacyEmpId" = '10EMP67' OR e."legacyEmpId" = '10EMP67' OR e."legacyEmpId" = '10EMP0067'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 67';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 39,
    reason = 'LEAVE EXTENDEND AS PER APPROVAL FROM THOUSEEF',
    remark = 'LEAVE EXTENDEND AS PER APPROVAL FROM THOUSEEF',
    "rejoiningDate" = '2026-01-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-14T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-07T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-14T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-07T18:29:50.000Z'::timestamptz,
      '2026-01-14T18:29:50.000Z'::timestamptz,
      39,
      'LEAVE EXTENDEND AS PER APPROVAL FROM THOUSEEF',
      'LEAVE EXTENDEND AS PER APPROVAL FROM THOUSEEF',
      '2026-01-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-14T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2481' OR e."legacyEmpId" = '2481' OR e."legacyEmpId" = '10EMP2481' OR e."legacyEmpId" = '10EMP2481' OR e."legacyEmpId" = '10EMP2481'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2481';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-22T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 6,
    status = 'APPROVED',
    "approvedAt" = '2026-02-16T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-18T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-16T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-18T18:29:50.000Z'::timestamptz,
      '2026-02-16T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2026-02-22T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      6,
      'APPROVED',
      '2026-02-16T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2613' OR e."legacyEmpId" = '2613' OR e."legacyEmpId" = '10EMP2613' OR e."legacyEmpId" = '10EMP2613' OR e."legacyEmpId" = '10EMP2613'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2613';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 64,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-02-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-05T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-05T18:29:50.000Z'::timestamptz,
      '2026-02-06T18:29:50.000Z'::timestamptz,
      64,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-02-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '14' OR e."legacyEmpId" = '14' OR e."legacyEmpId" = '10EMP14' OR e."legacyEmpId" = '10EMP14' OR e."legacyEmpId" = '10EMP0014'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 14';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 16,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-22T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-21T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-06T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-21T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-06T18:29:50.000Z'::timestamptz,
      '2026-01-21T18:29:50.000Z'::timestamptz,
      16,
      '',
      NULL,
      '2026-01-22T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-21T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2632' OR e."legacyEmpId" = '2632' OR e."legacyEmpId" = '10EMP2632' OR e."legacyEmpId" = '10EMP2632' OR e."legacyEmpId" = '10EMP2632'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2632';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 19,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-02T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-01T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-14T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-01T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-14T18:29:50.000Z'::timestamptz,
      '2026-01-01T18:29:50.000Z'::timestamptz,
      19,
      '',
      NULL,
      '2026-01-02T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-01T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2632' OR e."legacyEmpId" = '2632' OR e."legacyEmpId" = '10EMP2632' OR e."legacyEmpId" = '10EMP2632' OR e."legacyEmpId" = '10EMP2632'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2632';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'SL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Sick Leave', 'SL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 7,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-11-24T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-11-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-17T18:29:50.000Z'::timestamptz AND "endDate" = '2025-11-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-17T18:29:50.000Z'::timestamptz,
      '2025-11-23T18:29:50.000Z'::timestamptz,
      7,
      '',
      NULL,
      '2025-11-24T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-11-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1399' OR e."legacyEmpId" = '1399' OR e."legacyEmpId" = '10EMP1399' OR e."legacyEmpId" = '10EMP1399' OR e."legacyEmpId" = '10EMP1399'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1399';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 40,
    status = 'APPROVED',
    "approvedAt" = '2026-03-10T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-09T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-10T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-09T18:29:50.000Z'::timestamptz,
      '2026-03-10T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      '2026-04-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      40,
      'APPROVED',
      '2026-03-10T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2778' OR e."legacyEmpId" = '2778' OR e."legacyEmpId" = '10EMP2778' OR e."legacyEmpId" = '10EMP2778' OR e."legacyEmpId" = '10EMP2778'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2778';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 32,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-02-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-15T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-15T18:29:50.000Z'::timestamptz,
      '2026-02-15T18:29:50.000Z'::timestamptz,
      32,
      '',
      NULL,
      '2026-02-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-02-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1106' OR e."legacyEmpId" = '1106' OR e."legacyEmpId" = '10EMP1106' OR e."legacyEmpId" = '10EMP1106' OR e."legacyEmpId" = '10EMP1106'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1106';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-11T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-10T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-26T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-10T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-26T18:29:50.000Z'::timestamptz,
      '2025-12-10T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2025-12-11T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-10T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2503' OR e."legacyEmpId" = '2503' OR e."legacyEmpId" = '10EMP2503' OR e."legacyEmpId" = '10EMP2503' OR e."legacyEmpId" = '10EMP2503'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2503';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 74,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-31T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 2,
    status = 'APPROVED',
    "approvedAt" = '2026-01-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-11-17T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-11-17T18:29:50.000Z'::timestamptz,
      '2026-01-29T18:29:50.000Z'::timestamptz,
      74,
      '',
      NULL,
      '2026-01-31T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      2,
      'APPROVED',
      '2026-01-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2615' OR e."legacyEmpId" = '2615' OR e."legacyEmpId" = '10EMP2615' OR e."legacyEmpId" = '10EMP2615' OR e."legacyEmpId" = '10EMP2615'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2615';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 28,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-31T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-03T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-03T18:29:50.000Z'::timestamptz,
      '2025-12-30T18:29:50.000Z'::timestamptz,
      28,
      '',
      NULL,
      '2025-12-31T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1608' OR e."legacyEmpId" = '1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608' OR e."legacyEmpId" = '10EMP1608'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1608';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 14,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-31T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-17T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-17T18:29:50.000Z'::timestamptz,
      '2025-12-30T18:29:50.000Z'::timestamptz,
      14,
      '',
      NULL,
      '2025-12-31T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2699' OR e."legacyEmpId" = '2699' OR e."legacyEmpId" = '10EMP2699' OR e."legacyEmpId" = '10EMP2699' OR e."legacyEmpId" = '10EMP2699'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2699';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 17,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-31T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-14T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-14T18:29:50.000Z'::timestamptz,
      '2025-12-30T18:29:50.000Z'::timestamptz,
      17,
      '',
      NULL,
      '2025-12-31T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2314' OR e."legacyEmpId" = '2314' OR e."legacyEmpId" = '10EMP2314' OR e."legacyEmpId" = '10EMP2314' OR e."legacyEmpId" = '10EMP2314'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2314';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-03-25T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-25T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-25T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-25T18:29:50.000Z'::timestamptz,
      '2026-03-25T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-03-25T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1402' OR e."legacyEmpId" = '1402' OR e."legacyEmpId" = '10EMP1402' OR e."legacyEmpId" = '10EMP1402' OR e."legacyEmpId" = '10EMP1402'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1402';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-13T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 19,
    status = 'APPROVED',
    "approvedAt" = '2026-03-25T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-25T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-25T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-25T18:29:50.000Z'::timestamptz,
      '2026-03-25T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2026-04-13T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      19,
      'APPROVED',
      '2026-03-25T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '235' OR e."legacyEmpId" = '235' OR e."legacyEmpId" = '10EMP235' OR e."legacyEmpId" = '10EMP235' OR e."legacyEmpId" = '10EMP0235'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 235';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-01T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-31T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-20T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-31T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-20T18:29:50.000Z'::timestamptz,
      '2026-01-31T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      '2026-02-01T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-31T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1699' OR e."legacyEmpId" = '1699' OR e."legacyEmpId" = '10EMP1699' OR e."legacyEmpId" = '10EMP1699' OR e."legacyEmpId" = '10EMP1699'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1699';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 13,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 25,
    status = 'APPROVED',
    "approvedAt" = '2026-01-11T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-30T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-11T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-30T18:29:50.000Z'::timestamptz,
      '2026-01-11T18:29:50.000Z'::timestamptz,
      13,
      '',
      NULL,
      '2026-02-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      25,
      'APPROVED',
      '2026-01-11T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2758' OR e."legacyEmpId" = '2758' OR e."legacyEmpId" = '10EMP2758' OR e."legacyEmpId" = '10EMP2758' OR e."legacyEmpId" = '10EMP2758'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2758';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-03-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 13,
    status = 'APPROVED',
    "approvedAt" = '2026-03-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-01T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-01T18:29:50.000Z'::timestamptz,
      '2026-03-02T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2026-03-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      13,
      'APPROVED',
      '2026-03-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2440' OR e."legacyEmpId" = '2440' OR e."legacyEmpId" = '10EMP2440' OR e."legacyEmpId" = '10EMP2440' OR e."legacyEmpId" = '10EMP2440'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2440';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'UMRAH' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Ummrah', 'UMRAH', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 11,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-31T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-20T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-20T18:29:50.000Z'::timestamptz,
      '2026-01-30T18:29:50.000Z'::timestamptz,
      11,
      '',
      NULL,
      '2026-01-31T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2500' OR e."legacyEmpId" = '2500' OR e."legacyEmpId" = '10EMP2500' OR e."legacyEmpId" = '10EMP2500' OR e."legacyEmpId" = '10EMP2500'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2500';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 28,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-03-09T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 9,
    status = 'APPROVED',
    "approvedAt" = '2026-02-28T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-01T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-28T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-01T18:29:50.000Z'::timestamptz,
      '2026-02-28T18:29:50.000Z'::timestamptz,
      28,
      '',
      NULL,
      '2026-03-09T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      9,
      'APPROVED',
      '2026-02-28T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2478' OR e."legacyEmpId" = '2478' OR e."legacyEmpId" = '10EMP2478' OR e."legacyEmpId" = '10EMP2478' OR e."legacyEmpId" = '10EMP2478'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2478';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 63,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-31T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 8,
    status = 'APPROVED',
    "approvedAt" = '2026-05-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-22T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-22T18:29:50.000Z'::timestamptz,
      '2026-05-23T18:29:50.000Z'::timestamptz,
      63,
      '',
      NULL,
      '2026-05-31T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      8,
      'APPROVED',
      '2026-05-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2575' OR e."legacyEmpId" = '2575' OR e."legacyEmpId" = '10EMP2575' OR e."legacyEmpId" = '10EMP2575' OR e."legacyEmpId" = '10EMP2575'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2575';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 5,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-06T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-02-05T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-01T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-05T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-01T18:29:50.000Z'::timestamptz,
      '2026-02-05T18:29:50.000Z'::timestamptz,
      5,
      '',
      NULL,
      '2026-02-06T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-02-05T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2795' OR e."legacyEmpId" = '2795' OR e."legacyEmpId" = '10EMP2795' OR e."legacyEmpId" = '10EMP2795' OR e."legacyEmpId" = '10EMP2795'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2795';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 10,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-10T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-02-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-31T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-31T18:29:50.000Z'::timestamptz,
      '2026-02-09T18:29:50.000Z'::timestamptz,
      10,
      '',
      NULL,
      '2026-02-10T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-02-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2834' OR e."legacyEmpId" = '2834' OR e."legacyEmpId" = '10EMP2834' OR e."legacyEmpId" = '10EMP2834' OR e."legacyEmpId" = '10EMP2834'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2834';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-26T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-26T18:29:50.000Z'::timestamptz,
      '2026-01-06T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2499' OR e."legacyEmpId" = '2499' OR e."legacyEmpId" = '10EMP2499' OR e."legacyEmpId" = '10EMP2499' OR e."legacyEmpId" = '10EMP2499'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2499';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-11T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-11T18:29:50.000Z'::timestamptz,
      '2026-06-09T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2516' OR e."legacyEmpId" = '2516' OR e."legacyEmpId" = '10EMP2516' OR e."legacyEmpId" = '10EMP2516' OR e."legacyEmpId" = '10EMP2516'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2516';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-17T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 28,
    status = 'APPROVED',
    "approvedAt" = '2026-04-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-19T18:29:50.000Z'::timestamptz,
      '2026-04-19T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2026-05-17T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      28,
      'APPROVED',
      '2026-04-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2545' OR e."legacyEmpId" = '2545' OR e."legacyEmpId" = '10EMP2545' OR e."legacyEmpId" = '10EMP2545' OR e."legacyEmpId" = '10EMP2545'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2545';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-20T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-02-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-21T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-21T18:29:50.000Z'::timestamptz,
      '2026-02-19T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2026-02-20T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-02-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2550' OR e."legacyEmpId" = '2550' OR e."legacyEmpId" = '10EMP2550' OR e."legacyEmpId" = '10EMP2550' OR e."legacyEmpId" = '10EMP2550'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2550';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 22,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 3,
    status = 'APPROVED',
    "approvedAt" = '2026-02-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-22T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-22T18:29:50.000Z'::timestamptz,
      '2026-02-12T18:29:50.000Z'::timestamptz,
      22,
      '',
      NULL,
      '2026-02-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      3,
      'APPROVED',
      '2026-02-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2510' OR e."legacyEmpId" = '2510' OR e."legacyEmpId" = '10EMP2510' OR e."legacyEmpId" = '10EMP2510' OR e."legacyEmpId" = '10EMP2510'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2510';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-17T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 28,
    status = 'APPROVED',
    "approvedAt" = '2026-04-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-19T18:29:50.000Z'::timestamptz,
      '2026-04-19T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2026-05-17T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      28,
      'APPROVED',
      '2026-04-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2725' OR e."legacyEmpId" = '2725' OR e."legacyEmpId" = '10EMP2725' OR e."legacyEmpId" = '10EMP2725' OR e."legacyEmpId" = '10EMP2725'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2725';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 18,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-04T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 2,
    status = 'APPROVED',
    "approvedAt" = '2026-02-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-16T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-16T18:29:50.000Z'::timestamptz,
      '2026-02-02T18:29:50.000Z'::timestamptz,
      18,
      '',
      NULL,
      '2026-02-04T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      2,
      'APPROVED',
      '2026-02-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2777' OR e."legacyEmpId" = '2777' OR e."legacyEmpId" = '10EMP2777' OR e."legacyEmpId" = '10EMP2777' OR e."legacyEmpId" = '10EMP2777'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2777';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 38,
    status = 'APPROVED',
    "approvedAt" = '2026-03-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-08T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-08T18:29:50.000Z'::timestamptz,
      '2026-03-09T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2026-04-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      38,
      'APPROVED',
      '2026-03-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2594' OR e."legacyEmpId" = '2594' OR e."legacyEmpId" = '10EMP2594' OR e."legacyEmpId" = '10EMP2594' OR e."legacyEmpId" = '10EMP2594'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2594';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 26,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-29T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 20,
    status = 'APPROVED',
    "approvedAt" = '2026-04-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-15T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-15T18:29:50.000Z'::timestamptz,
      '2026-04-09T18:29:50.000Z'::timestamptz,
      26,
      '',
      NULL,
      '2026-04-29T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      20,
      'APPROVED',
      '2026-04-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '266' OR e."legacyEmpId" = '266' OR e."legacyEmpId" = '10EMP266' OR e."legacyEmpId" = '10EMP266' OR e."legacyEmpId" = '10EMP0266'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 266';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-06T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-02-05T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-25T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-05T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-25T18:29:50.000Z'::timestamptz,
      '2026-02-05T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      '2026-02-06T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-02-05T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1539' OR e."legacyEmpId" = '1539' OR e."legacyEmpId" = '10EMP1539' OR e."legacyEmpId" = '10EMP1539' OR e."legacyEmpId" = '10EMP1539'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1539';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 10,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-11T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-02-10T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-01T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-10T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-01T18:29:50.000Z'::timestamptz,
      '2026-02-10T18:29:50.000Z'::timestamptz,
      10,
      '',
      NULL,
      '2026-02-11T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-02-10T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2627' OR e."legacyEmpId" = '2627' OR e."legacyEmpId" = '10EMP2627' OR e."legacyEmpId" = '10EMP2627' OR e."legacyEmpId" = '10EMP2627'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2627';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-14T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 22,
    status = 'APPROVED',
    "approvedAt" = '2026-04-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-22T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-22T18:29:50.000Z'::timestamptz,
      '2026-04-22T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2026-05-14T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      22,
      'APPROVED',
      '2026-04-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2606' OR e."legacyEmpId" = '2606' OR e."legacyEmpId" = '10EMP2606' OR e."legacyEmpId" = '10EMP2606' OR e."legacyEmpId" = '10EMP2606'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2606';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 2,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-01-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-25T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-25T18:29:50.000Z'::timestamptz,
      '2026-01-26T18:29:50.000Z'::timestamptz,
      2,
      '',
      NULL,
      '2026-01-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2078' OR e."legacyEmpId" = '2078' OR e."legacyEmpId" = '10EMP2078' OR e."legacyEmpId" = '10EMP2078' OR e."legacyEmpId" = '10EMP2078'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2078';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 8,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-12-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-12-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-12-22T18:29:50.000Z'::timestamptz AND "endDate" = '2025-12-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-12-22T18:29:50.000Z'::timestamptz,
      '2025-12-29T18:29:50.000Z'::timestamptz,
      8,
      '',
      NULL,
      '2025-12-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-12-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2856' OR e."legacyEmpId" = '2856' OR e."legacyEmpId" = '10EMP2856' OR e."legacyEmpId" = '10EMP2856' OR e."legacyEmpId" = '10EMP2856'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2856';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 16,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-03-07T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-20T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-07T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-20T18:29:50.000Z'::timestamptz,
      '2026-03-07T18:29:50.000Z'::timestamptz,
      16,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-03-07T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2707' OR e."legacyEmpId" = '2707' OR e."legacyEmpId" = '10EMP2707' OR e."legacyEmpId" = '10EMP2707' OR e."legacyEmpId" = '10EMP2707'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2707';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-26T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 6,
    status = 'APPROVED',
    "approvedAt" = '2026-04-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-22T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-22T18:29:50.000Z'::timestamptz,
      '2026-04-20T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2026-04-26T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      6,
      'APPROVED',
      '2026-04-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2740' OR e."legacyEmpId" = '2740' OR e."legacyEmpId" = '10EMP2740' OR e."legacyEmpId" = '10EMP2740' OR e."legacyEmpId" = '10EMP2740'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2740';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-17T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 52,
    status = 'APPROVED',
    "approvedAt" = '2026-03-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-24T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-24T18:29:50.000Z'::timestamptz,
      '2026-03-26T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      '2026-05-17T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      52,
      'APPROVED',
      '2026-03-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2504' OR e."legacyEmpId" = '2504' OR e."legacyEmpId" = '10EMP2504' OR e."legacyEmpId" = '10EMP2504' OR e."legacyEmpId" = '10EMP2504'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2504';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-05-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-22T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-22T18:29:50.000Z'::timestamptz,
      '2026-05-20T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-05-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2582' OR e."legacyEmpId" = '2582' OR e."legacyEmpId" = '10EMP2582' OR e."legacyEmpId" = '10EMP2582' OR e."legacyEmpId" = '10EMP2582'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2582';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-28T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-28T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-28T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-28T18:29:50.000Z'::timestamptz,
      '2026-07-28T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-28T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2594' OR e."legacyEmpId" = '2594' OR e."legacyEmpId" = '10EMP2594' OR e."legacyEmpId" = '10EMP2594' OR e."legacyEmpId" = '10EMP2594'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2594';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'UMRAH' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Umrah', 'UMRAH', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 10,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-03-08T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 3,
    status = 'APPROVED',
    "approvedAt" = '2026-03-05T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-24T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-05T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-24T18:29:50.000Z'::timestamptz,
      '2026-03-05T18:29:50.000Z'::timestamptz,
      10,
      '',
      NULL,
      '2026-03-08T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      3,
      'APPROVED',
      '2026-03-05T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2726' OR e."legacyEmpId" = '2726' OR e."legacyEmpId" = '10EMP2726' OR e."legacyEmpId" = '10EMP2726' OR e."legacyEmpId" = '10EMP2726'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2726';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-03-01T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-02-28T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-17T18:29:50.000Z'::timestamptz AND "endDate" = '2026-02-28T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-17T18:29:50.000Z'::timestamptz,
      '2026-02-28T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      '2026-03-01T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-02-28T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '338' OR e."legacyEmpId" = '338' OR e."legacyEmpId" = '10EMP338' OR e."legacyEmpId" = '10EMP338' OR e."legacyEmpId" = '10EMP0338'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 338';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 32,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-14T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 15,
    status = 'APPROVED',
    "approvedAt" = '2026-03-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-27T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-27T18:29:50.000Z'::timestamptz,
      '2026-03-30T18:29:50.000Z'::timestamptz,
      32,
      '',
      NULL,
      '2026-04-14T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      15,
      'APPROVED',
      '2026-03-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2641' OR e."legacyEmpId" = '2641' OR e."legacyEmpId" = '10EMP2641' OR e."legacyEmpId" = '10EMP2641' OR e."legacyEmpId" = '10EMP2641'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2641';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-05-22T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-22T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-22T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-22T18:29:50.000Z'::timestamptz,
      '2026-05-22T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-05-22T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2622' OR e."legacyEmpId" = '2622' OR e."legacyEmpId" = '10EMP2622' OR e."legacyEmpId" = '10EMP2622' OR e."legacyEmpId" = '10EMP2622'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2622';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 64,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-06-07T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 13,
    status = 'APPROVED',
    "approvedAt" = '2026-05-25T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-23T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-25T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-23T18:29:50.000Z'::timestamptz,
      '2026-05-25T18:29:50.000Z'::timestamptz,
      64,
      '',
      NULL,
      '2026-06-07T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      13,
      'APPROVED',
      '2026-05-25T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1076' OR e."legacyEmpId" = '1076' OR e."legacyEmpId" = '10EMP1076' OR e."legacyEmpId" = '10EMP1076' OR e."legacyEmpId" = '10EMP1076'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1076';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-06-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 40,
    status = 'APPROVED',
    "approvedAt" = '2026-05-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-07T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-07T18:29:50.000Z'::timestamptz,
      '2026-05-06T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      '2026-06-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      40,
      'APPROVED',
      '2026-05-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '629' OR e."legacyEmpId" = '629' OR e."legacyEmpId" = '10EMP629' OR e."legacyEmpId" = '10EMP629' OR e."legacyEmpId" = '10EMP0629'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 629';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-31T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 16,
    status = 'APPROVED',
    "approvedAt" = '2026-05-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-15T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-15T18:29:50.000Z'::timestamptz,
      '2026-05-15T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      '2026-05-31T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      16,
      'APPROVED',
      '2026-05-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2712' OR e."legacyEmpId" = '2712' OR e."legacyEmpId" = '10EMP2712' OR e."legacyEmpId" = '10EMP2712' OR e."legacyEmpId" = '10EMP2712'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2712';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 23,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2025-10-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2025-10-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2025-10-04T18:29:50.000Z'::timestamptz AND "endDate" = '2025-10-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2025-10-04T18:29:50.000Z'::timestamptz,
      '2025-10-26T18:29:50.000Z'::timestamptz,
      23,
      '',
      NULL,
      '2025-10-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2025-10-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2286' OR e."legacyEmpId" = '2286' OR e."legacyEmpId" = '10EMP2286' OR e."legacyEmpId" = '10EMP2286' OR e."legacyEmpId" = '10EMP2286'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2286';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'UMRAH' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Umrah', 'UMRAH', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-03-08T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-03-07T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-24T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-07T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-24T18:29:50.000Z'::timestamptz,
      '2026-03-07T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      '2026-03-08T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-03-07T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2537' OR e."legacyEmpId" = '2537' OR e."legacyEmpId" = '10EMP2537' OR e."legacyEmpId" = '10EMP2537' OR e."legacyEmpId" = '10EMP2537'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2537';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-17T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 21,
    status = 'APPROVED',
    "approvedAt" = '2026-04-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-26T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-26T18:29:50.000Z'::timestamptz,
      '2026-04-26T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      '2026-05-17T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      21,
      'APPROVED',
      '2026-04-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '976' OR e."legacyEmpId" = '976' OR e."legacyEmpId" = '10EMP976' OR e."legacyEmpId" = '10EMP976' OR e."legacyEmpId" = '10EMP0976'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 976';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-03T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 13,
    status = 'APPROVED',
    "approvedAt" = '2026-04-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-22T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-22T18:29:50.000Z'::timestamptz,
      '2026-04-20T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2026-05-03T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      13,
      'APPROVED',
      '2026-04-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '979' OR e."legacyEmpId" = '979' OR e."legacyEmpId" = '10EMP979' OR e."legacyEmpId" = '10EMP979' OR e."legacyEmpId" = '10EMP0979'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 979';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 11,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-04-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-05T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-05T18:29:50.000Z'::timestamptz,
      '2026-04-15T18:29:50.000Z'::timestamptz,
      11,
      '',
      NULL,
      '2026-04-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-04-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2656' OR e."legacyEmpId" = '2656' OR e."legacyEmpId" = '10EMP2656' OR e."legacyEmpId" = '10EMP2656' OR e."legacyEmpId" = '10EMP2656'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2656';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 16,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-04-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-31T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-31T18:29:50.000Z'::timestamptz,
      '2026-04-15T18:29:50.000Z'::timestamptz,
      16,
      '',
      NULL,
      '2026-04-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-04-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2787' OR e."legacyEmpId" = '2787' OR e."legacyEmpId" = '10EMP2787' OR e."legacyEmpId" = '10EMP2787' OR e."legacyEmpId" = '10EMP2787'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2787';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 10,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-05-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-14T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-14T18:29:50.000Z'::timestamptz,
      '2026-05-23T18:29:50.000Z'::timestamptz,
      10,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-05-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2014' OR e."legacyEmpId" = '2014' OR e."legacyEmpId" = '10EMP2014' OR e."legacyEmpId" = '10EMP2014' OR e."legacyEmpId" = '10EMP2014'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2014';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-10T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-12T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-10T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-12T18:29:50.000Z'::timestamptz,
      '2026-06-10T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-10T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1016' OR e."legacyEmpId" = '1016' OR e."legacyEmpId" = '10EMP1016' OR e."legacyEmpId" = '10EMP1016' OR e."legacyEmpId" = '10EMP1016'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1016';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-27T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 7,
    status = 'APPROVED',
    "approvedAt" = '2026-04-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-22T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-22T18:29:50.000Z'::timestamptz,
      '2026-04-20T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2026-04-27T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      7,
      'APPROVED',
      '2026-04-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1693' OR e."legacyEmpId" = '1693' OR e."legacyEmpId" = '10EMP1693' OR e."legacyEmpId" = '10EMP1693' OR e."legacyEmpId" = '10EMP1693'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1693';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 18,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-09T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-04-08T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-22T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-22T18:29:50.000Z'::timestamptz,
      '2026-04-08T18:29:50.000Z'::timestamptz,
      18,
      '',
      NULL,
      '2026-04-09T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-04-08T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2887' OR e."legacyEmpId" = '2887' OR e."legacyEmpId" = '10EMP2887' OR e."legacyEmpId" = '10EMP2887' OR e."legacyEmpId" = '10EMP2887'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2887';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 20,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-04-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-11T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-11T18:29:50.000Z'::timestamptz,
      '2026-04-30T18:29:50.000Z'::timestamptz,
      20,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-04-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1617' OR e."legacyEmpId" = '1617' OR e."legacyEmpId" = '10EMP1617' OR e."legacyEmpId" = '10EMP1617' OR e."legacyEmpId" = '10EMP1617'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1617';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 4,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-16T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-04-15T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-12T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-15T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-12T18:29:50.000Z'::timestamptz,
      '2026-04-15T18:29:50.000Z'::timestamptz,
      4,
      '',
      NULL,
      '2026-04-16T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-04-15T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2407' OR e."legacyEmpId" = '2407' OR e."legacyEmpId" = '10EMP2407' OR e."legacyEmpId" = '10EMP2407' OR e."legacyEmpId" = '10EMP2407'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2407';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 20,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-06-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 43,
    status = 'APPROVED',
    "approvedAt" = '2026-05-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-14T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-14T18:29:50.000Z'::timestamptz,
      '2026-05-03T18:29:50.000Z'::timestamptz,
      20,
      '',
      NULL,
      '2026-06-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      43,
      'APPROVED',
      '2026-05-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1856' OR e."legacyEmpId" = '1856' OR e."legacyEmpId" = '10EMP1856' OR e."legacyEmpId" = '10EMP1856' OR e."legacyEmpId" = '10EMP1856'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1856';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-04-26T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-12T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-26T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-12T18:29:50.000Z'::timestamptz,
      '2026-04-26T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-04-26T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2636' OR e."legacyEmpId" = '2636' OR e."legacyEmpId" = '10EMP2636' OR e."legacyEmpId" = '10EMP2636' OR e."legacyEmpId" = '10EMP2636'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2636';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 15,
    status = 'APPROVED',
    "approvedAt" = '2026-04-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-06T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-06T18:29:50.000Z'::timestamptz,
      '2026-04-20T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2026-05-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      15,
      'APPROVED',
      '2026-04-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2845' OR e."legacyEmpId" = '2845' OR e."legacyEmpId" = '10EMP2845' OR e."legacyEmpId" = '10EMP2845' OR e."legacyEmpId" = '10EMP2845'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2845';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-04-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-19T18:29:50.000Z'::timestamptz,
      '2026-04-30T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-04-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2658' OR e."legacyEmpId" = '2658' OR e."legacyEmpId" = '10EMP2658' OR e."legacyEmpId" = '10EMP2658' OR e."legacyEmpId" = '10EMP2658'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2658';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-16T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-18T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-16T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-18T18:29:50.000Z'::timestamptz,
      '2026-06-16T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-16T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1884' OR e."legacyEmpId" = '1884' OR e."legacyEmpId" = '10EMP1884' OR e."legacyEmpId" = '10EMP1884' OR e."legacyEmpId" = '10EMP1884'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1884';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-21T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 2,
    status = 'APPROVED',
    "approvedAt" = '2026-05-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-19T18:29:50.000Z'::timestamptz,
      '2026-05-19T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      '2026-05-21T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      2,
      'APPROVED',
      '2026-05-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '629' OR e."legacyEmpId" = '629' OR e."legacyEmpId" = '10EMP629' OR e."legacyEmpId" = '10EMP629' OR e."legacyEmpId" = '10EMP0629'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 629';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = NULL,
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-05-27T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-29T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-27T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-29T18:29:50.000Z'::timestamptz,
      '2026-05-27T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-05-27T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2752' OR e."legacyEmpId" = '2752' OR e."legacyEmpId" = '10EMP2752' OR e."legacyEmpId" = '10EMP2752' OR e."legacyEmpId" = '10EMP2752'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2752';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 34,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-03-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-03-14T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-09T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-14T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-09T18:29:50.000Z'::timestamptz,
      '2026-03-14T18:29:50.000Z'::timestamptz,
      34,
      '',
      NULL,
      '2026-03-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-03-14T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1376' OR e."legacyEmpId" = '1376' OR e."legacyEmpId" = '10EMP1376' OR e."legacyEmpId" = '10EMP1376' OR e."legacyEmpId" = '10EMP1376'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1376';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 40,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-05-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-21T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-21T18:29:50.000Z'::timestamptz,
      '2026-05-30T18:29:50.000Z'::timestamptz,
      40,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-05-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '434' OR e."legacyEmpId" = '434' OR e."legacyEmpId" = '10EMP434' OR e."legacyEmpId" = '10EMP434' OR e."legacyEmpId" = '10EMP0434'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 434';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-07T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-07T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-07T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-07T18:29:50.000Z'::timestamptz,
      '2026-07-07T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-07T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2743' OR e."legacyEmpId" = '2743' OR e."legacyEmpId" = '10EMP2743' OR e."legacyEmpId" = '10EMP2743' OR e."legacyEmpId" = '10EMP2743'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2743';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'UMRAH' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Umrah Leave', 'UMRAH', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-03-08T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-03-07T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-24T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-07T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-24T18:29:50.000Z'::timestamptz,
      '2026-03-07T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      '2026-03-08T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-03-07T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '147' OR e."legacyEmpId" = '147' OR e."legacyEmpId" = '10EMP147' OR e."legacyEmpId" = '10EMP147' OR e."legacyEmpId" = '10EMP0147'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 147';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-06-13T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-14T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-14T18:29:50.000Z'::timestamptz,
      '2026-06-12T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2026-06-13T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2614' OR e."legacyEmpId" = '2614' OR e."legacyEmpId" = '10EMP2614' OR e."legacyEmpId" = '10EMP2614' OR e."legacyEmpId" = '10EMP2614'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2614';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-19T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 13,
    status = 'APPROVED',
    "approvedAt" = '2026-05-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-22T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-22T18:29:50.000Z'::timestamptz,
      '2026-05-06T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      '2026-05-19T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      13,
      'APPROVED',
      '2026-05-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '227' OR e."legacyEmpId" = '227' OR e."legacyEmpId" = '10EMP227' OR e."legacyEmpId" = '10EMP227' OR e."legacyEmpId" = '10EMP0227'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 227';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-04-30T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 58,
    status = 'APPROVED',
    "approvedAt" = '2026-03-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-02-02T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-02-02T18:29:50.000Z'::timestamptz,
      '2026-03-03T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      '2026-04-30T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      58,
      'APPROVED',
      '2026-03-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2690' OR e."legacyEmpId" = '2690' OR e."legacyEmpId" = '10EMP2690' OR e."legacyEmpId" = '10EMP2690' OR e."legacyEmpId" = '10EMP2690'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2690';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 16,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-03-18T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-03-17T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-02T18:29:50.000Z'::timestamptz AND "endDate" = '2026-03-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-02T18:29:50.000Z'::timestamptz,
      '2026-03-17T18:29:50.000Z'::timestamptz,
      16,
      '',
      NULL,
      '2026-03-18T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-03-17T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '142' OR e."legacyEmpId" = '142' OR e."legacyEmpId" = '10EMP142' OR e."legacyEmpId" = '10EMP142' OR e."legacyEmpId" = '10EMP0142'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 142';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 21,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-01T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-31T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-11T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-31T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-11T18:29:50.000Z'::timestamptz,
      '2026-01-31T18:29:50.000Z'::timestamptz,
      21,
      '',
      NULL,
      '2026-02-01T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-31T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2521' OR e."legacyEmpId" = '2521' OR e."legacyEmpId" = '10EMP2521' OR e."legacyEmpId" = '10EMP2521' OR e."legacyEmpId" = '10EMP2521'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2521';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 68,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-24T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-24T18:29:50.000Z'::timestamptz,
      '2026-07-30T18:29:50.000Z'::timestamptz,
      68,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2243' OR e."legacyEmpId" = '2243' OR e."legacyEmpId" = '10EMP2243' OR e."legacyEmpId" = '10EMP2243' OR e."legacyEmpId" = '10EMP2243'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2243';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 50,
    reason = 'Communicated clearly to rejoin on time, otherwise will issue warning letter',
    remark = 'Communicated clearly to rejoin on time, otherwise will issue warning letter',
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-08-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-14T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-14T18:29:50.000Z'::timestamptz,
      '2026-08-02T18:29:50.000Z'::timestamptz,
      50,
      'Communicated clearly to rejoin on time, otherwise will issue warning letter',
      'Communicated clearly to rejoin on time, otherwise will issue warning letter',
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-08-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '14' OR e."legacyEmpId" = '14' OR e."legacyEmpId" = '10EMP14' OR e."legacyEmpId" = '10EMP14' OR e."legacyEmpId" = '10EMP0014'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 14';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 16,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-06-02T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-01T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-17T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-01T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-17T18:29:50.000Z'::timestamptz,
      '2026-06-01T18:29:50.000Z'::timestamptz,
      16,
      '',
      NULL,
      '2026-06-02T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-01T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1263' OR e."legacyEmpId" = '1263' OR e."legacyEmpId" = '10EMP1263' OR e."legacyEmpId" = '10EMP1263' OR e."legacyEmpId" = '10EMP1263'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1263';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 19,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-18T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-31T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-18T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-31T18:29:50.000Z'::timestamptz,
      '2026-06-18T18:29:50.000Z'::timestamptz,
      19,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-18T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '34' OR e."legacyEmpId" = '34' OR e."legacyEmpId" = '10EMP34' OR e."legacyEmpId" = '10EMP34' OR e."legacyEmpId" = '10EMP0034'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 34';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 33,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-09T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-07T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-07T18:29:50.000Z'::timestamptz,
      '2026-07-09T18:29:50.000Z'::timestamptz,
      33,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-09T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '142' OR e."legacyEmpId" = '142' OR e."legacyEmpId" = '10EMP142' OR e."legacyEmpId" = '10EMP142' OR e."legacyEmpId" = '10EMP0142'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 142';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 21,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-02-01T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-31T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-11T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-31T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-11T18:29:50.000Z'::timestamptz,
      '2026-01-31T18:29:50.000Z'::timestamptz,
      21,
      '',
      NULL,
      '2026-02-01T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-31T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '279' OR e."legacyEmpId" = '279' OR e."legacyEmpId" = '10EMP279' OR e."legacyEmpId" = '10EMP279' OR e."legacyEmpId" = '10EMP0279'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 279';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 40,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-14T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-14T18:29:50.000Z'::timestamptz,
      '2026-07-23T18:29:50.000Z'::timestamptz,
      40,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2575' OR e."legacyEmpId" = '2575' OR e."legacyEmpId" = '10EMP2575' OR e."legacyEmpId" = '10EMP2575' OR e."legacyEmpId" = '10EMP2575'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2575';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'UMRAH' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Hajj Leave', 'UMRAH', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-05-25T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-26T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-25T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-26T18:29:50.000Z'::timestamptz,
      '2026-05-25T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-05-25T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '279' OR e."legacyEmpId" = '279' OR e."legacyEmpId" = '10EMP279' OR e."legacyEmpId" = '10EMP279' OR e."legacyEmpId" = '10EMP0279'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 279';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 40,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-14T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-14T18:29:50.000Z'::timestamptz,
      '2026-07-23T18:29:50.000Z'::timestamptz,
      40,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2406' OR e."legacyEmpId" = '2406' OR e."legacyEmpId" = '10EMP2406' OR e."legacyEmpId" = '10EMP2406' OR e."legacyEmpId" = '10EMP2406'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2406';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 8,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-07T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-31T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-07T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-31T18:29:50.000Z'::timestamptz,
      '2026-06-07T18:29:50.000Z'::timestamptz,
      8,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-07T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '333' OR e."legacyEmpId" = '333' OR e."legacyEmpId" = '10EMP333' OR e."legacyEmpId" = '10EMP333' OR e."legacyEmpId" = '10EMP0333'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 333';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Anuual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 34,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-31T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-31T18:29:50.000Z'::timestamptz,
      '2026-07-03T18:29:50.000Z'::timestamptz,
      34,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2848' OR e."legacyEmpId" = '2848' OR e."legacyEmpId" = '10EMP2848' OR e."legacyEmpId" = '10EMP2848' OR e."legacyEmpId" = '10EMP2848'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2848';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-05-10T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-04-26T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-10T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-04-26T18:29:50.000Z'::timestamptz,
      '2026-05-10T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-05-10T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1417' OR e."legacyEmpId" = '1417' OR e."legacyEmpId" = '10EMP1417' OR e."legacyEmpId" = '10EMP1417' OR e."legacyEmpId" = '10EMP1417'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1417';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-08T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-10T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-10T18:29:50.000Z'::timestamptz,
      '2026-06-08T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-08T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2540' OR e."legacyEmpId" = '2540' OR e."legacyEmpId" = '10EMP2540' OR e."legacyEmpId" = '10EMP2540' OR e."legacyEmpId" = '10EMP2540'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2540';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-08-18T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-18T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-19T18:29:50.000Z'::timestamptz,
      '2026-08-18T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-08-18T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2542' OR e."legacyEmpId" = '2542' OR e."legacyEmpId" = '10EMP2542' OR e."legacyEmpId" = '10EMP2542' OR e."legacyEmpId" = '10EMP2542'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2542';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-08-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-19T18:29:50.000Z'::timestamptz,
      '2026-08-19T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-08-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '235' OR e."legacyEmpId" = '235' OR e."legacyEmpId" = '10EMP235' OR e."legacyEmpId" = '10EMP235' OR e."legacyEmpId" = '10EMP0235'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 235';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 8,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-31T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 7,
    status = 'APPROVED',
    "approvedAt" = '2026-05-24T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-17T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-24T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-17T18:29:50.000Z'::timestamptz,
      '2026-05-24T18:29:50.000Z'::timestamptz,
      8,
      '',
      NULL,
      '2026-05-31T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      7,
      'APPROVED',
      '2026-05-24T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2787' OR e."legacyEmpId" = '2787' OR e."legacyEmpId" = '10EMP2787' OR e."legacyEmpId" = '10EMP2787' OR e."legacyEmpId" = '10EMP2787'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2787';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 10,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-05-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-14T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-14T18:29:50.000Z'::timestamptz,
      '2026-05-23T18:29:50.000Z'::timestamptz,
      10,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-05-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2896' OR e."legacyEmpId" = '2896' OR e."legacyEmpId" = '10EMP2896' OR e."legacyEmpId" = '10EMP2896' OR e."legacyEmpId" = '10EMP2896'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2896';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 22,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-05-24T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-03T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-24T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-03T18:29:50.000Z'::timestamptz,
      '2026-05-24T18:29:50.000Z'::timestamptz,
      22,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-05-24T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2397' OR e."legacyEmpId" = '2397' OR e."legacyEmpId" = '10EMP2397' OR e."legacyEmpId" = '10EMP2397' OR e."legacyEmpId" = '10EMP2397'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2397';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-30T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-31T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-30T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-31T18:29:50.000Z'::timestamptz,
      '2026-06-30T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-30T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2340' OR e."legacyEmpId" = '2340' OR e."legacyEmpId" = '10EMP2340' OR e."legacyEmpId" = '10EMP2340' OR e."legacyEmpId" = '10EMP2340'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2340';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-08-21T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-21T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-21T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-21T18:29:50.000Z'::timestamptz,
      '2026-08-21T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-08-21T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '331' OR e."legacyEmpId" = '331' OR e."legacyEmpId" = '10EMP331' OR e."legacyEmpId" = '10EMP331' OR e."legacyEmpId" = '10EMP0331'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 331';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-08-21T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-21T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-21T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-21T18:29:50.000Z'::timestamptz,
      '2026-08-21T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-08-21T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2542' OR e."legacyEmpId" = '2542' OR e."legacyEmpId" = '10EMP2542' OR e."legacyEmpId" = '10EMP2542' OR e."legacyEmpId" = '10EMP2542'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2542';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-08-21T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-21T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-21T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-21T18:29:50.000Z'::timestamptz,
      '2026-08-21T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-08-21T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2602' OR e."legacyEmpId" = '2602' OR e."legacyEmpId" = '10EMP2602' OR e."legacyEmpId" = '10EMP2602' OR e."legacyEmpId" = '10EMP2602'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2602';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 19,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-01-29T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-01-11T18:29:50.000Z'::timestamptz AND "endDate" = '2026-01-29T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-01-11T18:29:50.000Z'::timestamptz,
      '2026-01-29T18:29:50.000Z'::timestamptz,
      19,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-01-29T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2602' OR e."legacyEmpId" = '2602' OR e."legacyEmpId" = '10EMP2602' OR e."legacyEmpId" = '10EMP2602' OR e."legacyEmpId" = '10EMP2602'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2602';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 35,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-04-16T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-03-13T18:29:50.000Z'::timestamptz AND "endDate" = '2026-04-16T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-03-13T18:29:50.000Z'::timestamptz,
      '2026-04-16T18:29:50.000Z'::timestamptz,
      35,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-04-16T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2645' OR e."legacyEmpId" = '2645' OR e."legacyEmpId" = '10EMP2645' OR e."legacyEmpId" = '10EMP2645' OR e."legacyEmpId" = '10EMP2645'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2645';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 68,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-17T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-11T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-11T18:29:50.000Z'::timestamptz,
      '2026-07-17T18:29:50.000Z'::timestamptz,
      68,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-17T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2078' OR e."legacyEmpId" = '2078' OR e."legacyEmpId" = '10EMP2078' OR e."legacyEmpId" = '10EMP2078' OR e."legacyEmpId" = '10EMP2078'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2078';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 33,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-23T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-21T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-23T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-21T18:29:50.000Z'::timestamptz,
      '2026-07-23T18:29:50.000Z'::timestamptz,
      33,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-23T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '166' OR e."legacyEmpId" = '166' OR e."legacyEmpId" = '10EMP166' OR e."legacyEmpId" = '10EMP166' OR e."legacyEmpId" = '10EMP0166'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 166';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 62,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-19T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-19T18:29:50.000Z'::timestamptz,
      '2026-07-19T18:29:50.000Z'::timestamptz,
      62,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-19T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '583' OR e."legacyEmpId" = '583' OR e."legacyEmpId" = '10EMP583' OR e."legacyEmpId" = '10EMP583' OR e."legacyEmpId" = '10EMP0583'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 583';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Applied',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'PENDING_L2',
    "approvedAt" = NULL,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-07-12T18:29:50.000Z'::timestamptz AND "endDate" = '2026-09-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-07-12T18:29:50.000Z'::timestamptz,
      '2026-09-09T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      NULL,
      'Applied',
      NULL,
      NULL,
      0,
      'PENDING_L2',
      NULL,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2568' OR e."legacyEmpId" = '2568' OR e."legacyEmpId" = '10EMP2568' OR e."legacyEmpId" = '10EMP2568' OR e."legacyEmpId" = '10EMP2568'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2568';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-08-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-21T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-21T18:29:50.000Z'::timestamptz,
      '2026-08-20T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-08-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2800' OR e."legacyEmpId" = '2800' OR e."legacyEmpId" = '10EMP2800' OR e."legacyEmpId" = '10EMP2800' OR e."legacyEmpId" = '10EMP2800'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2800';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 3,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-05-05T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-05-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-02T18:29:50.000Z'::timestamptz AND "endDate" = '2026-05-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-02T18:29:50.000Z'::timestamptz,
      '2026-05-04T18:29:50.000Z'::timestamptz,
      3,
      '',
      NULL,
      '2026-05-05T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-05-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2689' OR e."legacyEmpId" = '2689' OR e."legacyEmpId" = '10EMP2689' OR e."legacyEmpId" = '10EMP2689' OR e."legacyEmpId" = '10EMP2689'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2689';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 33,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Applied',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'PENDING_L2',
    "approvedAt" = NULL,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-07-12T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-13T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-07-12T18:29:50.000Z'::timestamptz,
      '2026-08-13T18:29:50.000Z'::timestamptz,
      33,
      '',
      NULL,
      NULL,
      'Applied',
      NULL,
      NULL,
      0,
      'PENDING_L2',
      NULL,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2790' OR e."legacyEmpId" = '2790' OR e."legacyEmpId" = '10EMP2790' OR e."legacyEmpId" = '10EMP2790' OR e."legacyEmpId" = '10EMP2790'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2790';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-20T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-21T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-20T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-21T18:29:50.000Z'::timestamptz,
      '2026-07-20T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-20T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2780' OR e."legacyEmpId" = '2780' OR e."legacyEmpId" = '10EMP2780' OR e."legacyEmpId" = '10EMP2780' OR e."legacyEmpId" = '10EMP2780'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2780';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 30,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Applied',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'PENDING_L2',
    "approvedAt" = NULL,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-07-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-07-19T18:29:50.000Z'::timestamptz,
      '2026-08-17T18:29:50.000Z'::timestamptz,
      30,
      '',
      NULL,
      NULL,
      'Applied',
      NULL,
      NULL,
      0,
      'PENDING_L2',
      NULL,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2617' OR e."legacyEmpId" = '2617' OR e."legacyEmpId" = '10EMP2617' OR e."legacyEmpId" = '10EMP2617' OR e."legacyEmpId" = '10EMP2617'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2617';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-08-06T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-07T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-06T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-07T18:29:50.000Z'::timestamptz,
      '2026-08-06T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-08-06T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '23' OR e."legacyEmpId" = '23' OR e."legacyEmpId" = '10EMP23' OR e."legacyEmpId" = '10EMP23' OR e."legacyEmpId" = '10EMP0023'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 23';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-08-05T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-07T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-05T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-07T18:29:50.000Z'::timestamptz,
      '2026-08-05T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-08-05T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '999' OR e."legacyEmpId" = '999' OR e."legacyEmpId" = '10EMP999' OR e."legacyEmpId" = '10EMP999' OR e."legacyEmpId" = '10EMP0999'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 999';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'UL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Unpaid Leave', 'UL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 10,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-06-21T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-21T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-12T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-21T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-12T18:29:50.000Z'::timestamptz,
      '2026-06-21T18:29:50.000Z'::timestamptz,
      10,
      '',
      NULL,
      '2026-06-21T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-21T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '351' OR e."legacyEmpId" = '351' OR e."legacyEmpId" = '10EMP351' OR e."legacyEmpId" = '10EMP351' OR e."legacyEmpId" = '10EMP0351'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 351';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 63,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Applied',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'PENDING_L2',
    "approvedAt" = NULL,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-07-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-09-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-07-19T18:29:50.000Z'::timestamptz,
      '2026-09-19T18:29:50.000Z'::timestamptz,
      63,
      '',
      NULL,
      NULL,
      'Applied',
      NULL,
      NULL,
      0,
      'PENDING_L2',
      NULL,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2573' OR e."legacyEmpId" = '2573' OR e."legacyEmpId" = '10EMP2573' OR e."legacyEmpId" = '10EMP2573' OR e."legacyEmpId" = '10EMP2573'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2573';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Anuual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Applied',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'PENDING_L2',
    "approvedAt" = NULL,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-07-12T18:29:50.000Z'::timestamptz AND "endDate" = '2026-09-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-07-12T18:29:50.000Z'::timestamptz,
      '2026-09-09T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      NULL,
      'Applied',
      NULL,
      NULL,
      0,
      'PENDING_L2',
      NULL,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '22' OR e."legacyEmpId" = '22' OR e."legacyEmpId" = '10EMP22' OR e."legacyEmpId" = '10EMP22' OR e."legacyEmpId" = '10EMP0022'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 22';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 61,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Applied',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'PENDING_L2',
    "approvedAt" = NULL,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-07-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-09-17T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-07-19T18:29:50.000Z'::timestamptz,
      '2026-09-17T18:29:50.000Z'::timestamptz,
      61,
      '',
      NULL,
      NULL,
      'Applied',
      NULL,
      NULL,
      0,
      'PENDING_L2',
      NULL,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2692' OR e."legacyEmpId" = '2692' OR e."legacyEmpId" = '10EMP2692' OR e."legacyEmpId" = '10EMP2692' OR e."legacyEmpId" = '10EMP2692'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2692';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-07T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-07T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-07T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-07T18:29:50.000Z'::timestamptz,
      '2026-07-07T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-07T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '459' OR e."legacyEmpId" = '459' OR e."legacyEmpId" = '10EMP459' OR e."legacyEmpId" = '10EMP459' OR e."legacyEmpId" = '10EMP0459'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 459';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'UL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Unpaid Leave', 'UL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 15,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Applied',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'PENDING_L2',
    "approvedAt" = NULL,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-07-05T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-07-05T18:29:50.000Z'::timestamptz,
      '2026-07-19T18:29:50.000Z'::timestamptz,
      15,
      '',
      NULL,
      NULL,
      'Applied',
      NULL,
      NULL,
      0,
      'PENDING_L2',
      NULL,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2866' OR e."legacyEmpId" = '2866' OR e."legacyEmpId" = '10EMP2866' OR e."legacyEmpId" = '10EMP2866' OR e."legacyEmpId" = '10EMP2866'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2866';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergancy Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 7,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-14T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-08T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-14T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-08T18:29:50.000Z'::timestamptz,
      '2026-06-14T18:29:50.000Z'::timestamptz,
      7,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-14T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2807' OR e."legacyEmpId" = '2807' OR e."legacyEmpId" = '10EMP2807' OR e."legacyEmpId" = '10EMP2807' OR e."legacyEmpId" = '10EMP2807'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2807';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 8,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-11T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-04T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-11T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-04T18:29:50.000Z'::timestamptz,
      '2026-06-11T18:29:50.000Z'::timestamptz,
      8,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-11T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2543' OR e."legacyEmpId" = '2543' OR e."legacyEmpId" = '10EMP2543' OR e."legacyEmpId" = '10EMP2543' OR e."legacyEmpId" = '10EMP2543'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2543';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 60,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Applied',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'PENDING_L2',
    "approvedAt" = NULL,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-07-12T18:29:50.000Z'::timestamptz AND "endDate" = '2026-09-09T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-07-12T18:29:50.000Z'::timestamptz,
      '2026-09-09T18:29:50.000Z'::timestamptz,
      60,
      '',
      NULL,
      NULL,
      'Applied',
      NULL,
      NULL,
      0,
      'PENDING_L2',
      NULL,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2628' OR e."legacyEmpId" = '2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628' OR e."legacyEmpId" = '10EMP2628'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2628';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 5,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-06-15T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-11T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-07T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-11T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-07T18:29:50.000Z'::timestamptz,
      '2026-06-11T18:29:50.000Z'::timestamptz,
      5,
      '',
      NULL,
      '2026-06-15T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-11T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2846' OR e."legacyEmpId" = '2846' OR e."legacyEmpId" = '10EMP2846' OR e."legacyEmpId" = '10EMP2846' OR e."legacyEmpId" = '10EMP2846'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2846';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 12,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-02T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-21T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-02T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-21T18:29:50.000Z'::timestamptz,
      '2026-07-02T18:29:50.000Z'::timestamptz,
      12,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-02T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1611' OR e."legacyEmpId" = '1611' OR e."legacyEmpId" = '10EMP1611' OR e."legacyEmpId" = '10EMP1611' OR e."legacyEmpId" = '10EMP1611'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1611';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 31,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Applied',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'PENDING_L2',
    "approvedAt" = NULL,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-07-09T18:29:50.000Z'::timestamptz AND "endDate" = '2026-08-08T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-07-09T18:29:50.000Z'::timestamptz,
      '2026-08-08T18:29:50.000Z'::timestamptz,
      31,
      '',
      NULL,
      NULL,
      'Applied',
      NULL,
      NULL,
      0,
      'PENDING_L2',
      NULL,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2534' OR e."legacyEmpId" = '2534' OR e."legacyEmpId" = '10EMP2534' OR e."legacyEmpId" = '10EMP2534' OR e."legacyEmpId" = '10EMP2534'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2534';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 63,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Applied',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'PENDING_L2',
    "approvedAt" = NULL,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-07-19T18:29:50.000Z'::timestamptz AND "endDate" = '2026-09-19T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-07-19T18:29:50.000Z'::timestamptz,
      '2026-09-19T18:29:50.000Z'::timestamptz,
      63,
      '',
      NULL,
      NULL,
      'Applied',
      NULL,
      NULL,
      0,
      'PENDING_L2',
      NULL,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '2900' OR e."legacyEmpId" = '2900' OR e."legacyEmpId" = '10EMP2900' OR e."legacyEmpId" = '10EMP2900' OR e."legacyEmpId" = '10EMP2900'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 2900';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'UL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Unpaid Leave', 'UL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 5,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'Not Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-04T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-31T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-04T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-31T18:29:50.000Z'::timestamptz,
      '2026-06-04T18:29:50.000Z'::timestamptz,
      5,
      '',
      NULL,
      NULL,
      'Not Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-04T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '1106' OR e."legacyEmpId" = '1106' OR e."legacyEmpId" = '10EMP1106' OR e."legacyEmpId" = '10EMP1106' OR e."legacyEmpId" = '10EMP1106'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 1106';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 20,
    reason = '',
    remark = NULL,
    "rejoiningDate" = NULL,
    "statusAsOn" = 'On Leave',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-07-10T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-06-21T18:29:50.000Z'::timestamptz AND "endDate" = '2026-07-10T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-06-21T18:29:50.000Z'::timestamptz,
      '2026-07-10T18:29:50.000Z'::timestamptz,
      20,
      '',
      NULL,
      NULL,
      'On Leave',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-07-10T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  UPDATE "Employee" SET status = 'ON_LEAVE', "updatedAt" = NOW() WHERE id = emp_id;
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '802' OR e."legacyEmpId" = '802' OR e."legacyEmpId" = '10EMP802' OR e."legacyEmpId" = '10EMP802' OR e."legacyEmpId" = '10EMP0802'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 802';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'EL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Emergency Leave', 'EL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 14,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-06-14T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-12T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-30T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-12T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-30T18:29:50.000Z'::timestamptz,
      '2026-06-12T18:29:50.000Z'::timestamptz,
      14,
      '',
      NULL,
      '2026-06-14T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-12T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

DO $$
DECLARE emp_id text;
DECLARE lt_id text;
BEGIN
  SELECT e.id INTO emp_id FROM "Employee" e
  WHERE e."employeeCode" = '334' OR e."legacyEmpId" = '334' OR e."legacyEmpId" = '10EMP334' OR e."legacyEmpId" = '10EMP334' OR e."legacyEmpId" = '10EMP0334'
  LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: 334';
    RETURN;
  END IF;

  SELECT lt.id INTO lt_id FROM "LeaveType" lt WHERE lt.code = 'AL' LIMIT 1;
  IF lt_id IS NULL THEN
    INSERT INTO "LeaveType" (id, name, code, "yearlyAllocation", "maxCarryForward", "requiresAttachment", "paidLeave", active, "balanceMode", "payRate", "createdAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Annual Leave', 'AL', 0, 0, false, true, true, 'NONE', 'FULL', NOW())
    RETURNING id INTO lt_id;
  END IF;

  UPDATE "LeaveRequest"
  SET
    days = 11,
    reason = '',
    remark = NULL,
    "rejoiningDate" = '2026-06-03T18:29:50.000Z'::timestamptz,
    "statusAsOn" = 'Rejoined',
    "leaveBalanceSnapshot" = NULL,
    "currentLeaveBalanceSnapshot" = NULL,
    "extendedDays" = 0,
    status = 'APPROVED',
    "approvedAt" = '2026-06-03T18:29:50.000Z'::timestamptz,
    "updatedAt" = NOW()
  WHERE "employeeId" = emp_id AND "leaveTypeId" = lt_id AND "startDate" = '2026-05-24T18:29:50.000Z'::timestamptz AND "endDate" = '2026-06-03T18:29:50.000Z'::timestamptz;

  IF NOT FOUND THEN
    INSERT INTO "LeaveRequest" (
      id, "employeeId", "leaveTypeId", "startDate", "endDate", days, reason, remark,
      "rejoiningDate", "statusAsOn", "leaveBalanceSnapshot", "currentLeaveBalanceSnapshot",
      "extendedDays", status, "approvedAt", "createdAt", "updatedAt"
    ) VALUES (
      md5(random()::text || clock_timestamp()::text),
      emp_id,
      lt_id,
      '2026-05-24T18:29:50.000Z'::timestamptz,
      '2026-06-03T18:29:50.000Z'::timestamptz,
      11,
      '',
      NULL,
      '2026-06-03T18:29:50.000Z'::timestamptz,
      'Rejoined',
      NULL,
      NULL,
      0,
      'APPROVED',
      '2026-06-03T18:29:50.000Z'::timestamptz,
      NOW(),
      NOW()
    );
  END IF;

  
END $$;

COMMIT;
