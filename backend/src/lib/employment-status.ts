const AUTO_STATUS_SCOPE = new Set(["ACTIVE", "PROBATION"]);

export function getProbationCutoffDate(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - 6);
  return cutoff;
}

export function resolveEmploymentStatus(status: string, dateOfJoining: Date, now = new Date()) {
  if (!AUTO_STATUS_SCOPE.has(status)) {
    return status;
  }
  const cutoff = getProbationCutoffDate(now);
  return dateOfJoining <= cutoff ? "ACTIVE" : "PROBATION";
}

export function applyEmploymentStatusToEmployee<T extends { status: string; dateOfJoining: Date }>(
  employee: T,
  now = new Date(),
) {
  return {
    ...employee,
    status: resolveEmploymentStatus(employee.status, employee.dateOfJoining, now),
  };
}
