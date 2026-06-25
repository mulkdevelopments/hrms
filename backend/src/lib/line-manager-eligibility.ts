export type LineManagerSettings = {
  enableDesignationForDropdown: boolean;
  enableDesignationForLeaveAccess: boolean;
  allowDirectReportsForLeaveAccess: boolean;
  excludeDriverDesignation: boolean;
  eligibleRoles: string[];
  designationKeywords: string[];
  exclusionKeywords: string[];
  exceptionPhrases: string[];
  leadershipOverrideKeywords: string[];
};

export const DEFAULT_LINE_MANAGER_SETTINGS: LineManagerSettings = {
  enableDesignationForDropdown: true,
  enableDesignationForLeaveAccess: true,
  allowDirectReportsForLeaveAccess: true,
  excludeDriverDesignation: true,
  eligibleRoles: ["MANAGER", "CEO"],
  designationKeywords: [
    "manager",
    "director",
    "chairman",
    "president",
    "ceo",
    "chief executive",
    "managing director",
    "general manager",
    "regional manager",
    "group ceo",
    "executive manager",
    "head of",
    "hod",
    "h.o.d",
  ],
  exclusionKeywords: [
    "driver",
    "operator",
    "helper",
    "labour",
    "labor",
    "cutter",
    "fabricator",
    "mason",
    "carpenter",
    "cashier",
    "foreman",
  ],
  exceptionPhrases: [
    "assistant manager",
    "deputy manager",
    "general manager",
    "regional manager",
    "group manager",
    "senior manager",
    "executive manager",
    "project manager",
    "sales manager",
    "operations manager",
    "commercial manager",
    "construction manager",
    "logistics manager",
    "maintenance manager",
    "production manager",
    "it manager",
    "hr manager",
    "mep manager",
    "managing director",
    "assistant director",
    "deputy director",
  ],
  leadershipOverrideKeywords: [
    "chairman",
    "director",
    "ceo",
    "president",
    "managing director",
    "general manager",
    "regional manager",
  ],
};

const SEPARATED_STATUSES = new Set(["TERMINATED", "RESIGNED"]);

type RuntimeRules = {
  settings: LineManagerSettings;
  eligibleRoles: Set<string>;
};

let runtimeRules: RuntimeRules | null = null;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasPhrase(text: string, phrase: string) {
  const normalized = phrase.trim();
  if (!normalized) return false;
  return new RegExp(`\\b${escapeRegex(normalized)}\\b`, "i").test(text);
}

function hasAnyPhrase(text: string, phrases: string[]) {
  return phrases.some((phrase) => hasPhrase(text, phrase));
}

function getRules(): RuntimeRules {
  if (!runtimeRules) {
    refreshLineManagerSettingsCache(DEFAULT_LINE_MANAGER_SETTINGS);
  }
  return runtimeRules!;
}

export function refreshLineManagerSettingsCache(settings: LineManagerSettings) {
  runtimeRules = {
    settings,
    eligibleRoles: new Set(settings.eligibleRoles.map((role) => role.trim().toUpperCase()).filter(Boolean)),
  };
}

export function getLineManagerSettingsSnapshot() {
  return getRules().settings;
}

function isRoleEligible(role?: string | null) {
  if (!role) return false;
  return getRules().eligibleRoles.has(role.trim().toUpperCase());
}

export function isLineManagerDesignation(designation?: string | null, options?: { forLeaveAccess?: boolean }) {
  const { settings } = getRules();
  const enabled = options?.forLeaveAccess
    ? settings.enableDesignationForLeaveAccess
    : settings.enableDesignationForDropdown;
  if (!enabled) return false;

  const value = designation?.trim() ?? "";
  if (!value) return false;
  if (settings.excludeDriverDesignation && hasPhrase(value, "driver")) return false;
  if (!hasAnyPhrase(value, settings.designationKeywords)) return false;
  if (
    hasAnyPhrase(value, settings.exclusionKeywords)
    && !hasAnyPhrase(value, settings.exceptionPhrases)
    && !hasAnyPhrase(value, settings.leadershipOverrideKeywords)
  ) {
    return false;
  }
  return true;
}

export function isEligibleLineManagerEmployee(employee?: {
  status?: string | null;
  role?: string | null;
  designation?: string | null;
} | null) {
  if (!employee?.status || SEPARATED_STATUSES.has(employee.status)) return false;
  if (isRoleEligible(employee.role)) return true;
  return isLineManagerDesignation(employee.designation, { forLeaveAccess: false });
}

export function isTeamLeaveManagerEmployee(employee?: {
  status?: string | null;
  role?: string | null;
  designation?: string | null;
} | null) {
  if (!employee?.status || SEPARATED_STATUSES.has(employee.status)) return false;
  if (isRoleEligible(employee.role)) return true;
  return isLineManagerDesignation(employee.designation, { forLeaveAccess: true });
}

export function allowsDirectReportsLeaveAccess() {
  return getRules().settings.allowDirectReportsForLeaveAccess;
}

export function pickEligibleLineManager<T extends {
  status?: string | null;
  role?: string | null;
  designation?: string | null;
}>(candidates: T[]) {
  return candidates.find((candidate) => isEligibleLineManagerEmployee(candidate)) ?? null;
}

export function parseLineManagerSettings(raw: unknown): LineManagerSettings {
  const fallback = DEFAULT_LINE_MANAGER_SETTINGS;
  if (!raw || typeof raw !== "object") return fallback;
  const value = raw as Partial<LineManagerSettings>;

  const readList = (input: unknown, defaultValue: string[]) =>
    Array.isArray(input)
      ? input.map((item) => String(item).trim()).filter(Boolean)
      : defaultValue;

  return {
    enableDesignationForDropdown: value.enableDesignationForDropdown ?? fallback.enableDesignationForDropdown,
    enableDesignationForLeaveAccess: value.enableDesignationForLeaveAccess ?? fallback.enableDesignationForLeaveAccess,
    allowDirectReportsForLeaveAccess: value.allowDirectReportsForLeaveAccess ?? fallback.allowDirectReportsForLeaveAccess,
    excludeDriverDesignation: value.excludeDriverDesignation ?? fallback.excludeDriverDesignation,
    eligibleRoles: readList(value.eligibleRoles, fallback.eligibleRoles).map((role) => role.toUpperCase()),
    designationKeywords: readList(value.designationKeywords, fallback.designationKeywords),
    exclusionKeywords: readList(value.exclusionKeywords, fallback.exclusionKeywords),
    exceptionPhrases: readList(value.exceptionPhrases, fallback.exceptionPhrases),
    leadershipOverrideKeywords: readList(value.leadershipOverrideKeywords, fallback.leadershipOverrideKeywords),
  };
}
