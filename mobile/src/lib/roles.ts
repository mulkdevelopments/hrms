export const ELEVATED_ROLES = new Set(["SUPER_ADMIN", "HR", "HR_OFFICER"]);
export const INDIVIDUAL_CONTRIBUTOR_ROLES = new Set(["EMPLOYEE", "LABOUR", "STAFF"]);

export function isHrOrAdmin(role?: string | null) {
  return ELEVATED_ROLES.has(role ?? "");
}

export function isIndividualContributor(role?: string | null) {
  return INDIVIDUAL_CONTRIBUTOR_ROLES.has(role ?? "");
}

export function isManager(role?: string | null) {
  return role === "MANAGER";
}

export function canVoidActingColleague(role?: string | null) {
  return role === "LABOUR" || role === "STAFF";
}

export function canViewAirTicketForEmployee(role: string | undefined, viewerEmployeeId: string | undefined, targetEmployeeId: string) {
  if (isHrOrAdmin(role)) return true;
  return Boolean(viewerEmployeeId && viewerEmployeeId === targetEmployeeId);
}

export function canExportLeaveReports(role?: string | null) {
  return isHrOrAdmin(role) || isManager(role);
}

export function canPickLeaveHistoryEmployee(role?: string | null) {
  return isHrOrAdmin(role) || isManager(role);
}

export function canAccessHrTools(role?: string | null) {
  return isHrOrAdmin(role);
}
