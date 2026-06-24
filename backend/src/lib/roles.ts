export const INDIVIDUAL_CONTRIBUTOR_ROLES = ["EMPLOYEE", "LABOUR", "STAFF"] as const;

export const USER_ROLES = [
  "SUPER_ADMIN",
  "CEO",
  "HR",
  "HR_OFFICER",
  "PRO",
  "MANAGER",
  "EMPLOYEE",
  "LABOUR",
  "STAFF",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type IndividualContributorRole = (typeof INDIVIDUAL_CONTRIBUTOR_ROLES)[number];

let individualContributorCache: Set<string> | null = null;
let voidActingCache: Set<string> | null = null;

export function refreshRoleRuntimeCache(roles: {
  code: string;
  isIndividualContributor: boolean;
  canVoidActingColleague: boolean;
}[]) {
  individualContributorCache = new Set(
    roles.filter((role) => role.isIndividualContributor).map((role) => role.code),
  );
  voidActingCache = new Set(
    roles.filter((role) => role.canVoidActingColleague).map((role) => role.code),
  );
}

export function isIndividualContributor(role?: string | null): role is IndividualContributorRole {
  if (individualContributorCache) {
    return individualContributorCache.has(String(role));
  }
  return INDIVIDUAL_CONTRIBUTOR_ROLES.includes(role as IndividualContributorRole);
}

/** Sentinel value when Labour/Staff skip acting colleague assignment */
export const ACTING_VOID_VALUE = "__VOID__";

export function canVoidActingColleague(role?: string | null): boolean {
  if (voidActingCache) {
    return voidActingCache.has(String(role));
  }
  return role === "LABOUR" || role === "STAFF";
}
