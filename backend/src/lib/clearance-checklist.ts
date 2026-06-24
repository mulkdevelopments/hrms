export type ClearanceDepartment =
  | "HOD"
  | "IT"
  | "FINANCE"
  | "ADMIN"
  | "TRANSPORTATION"
  | "HR"
  | "PRO";

export const CLEARANCE_DEPARTMENTS: ClearanceDepartment[] = [
  "HOD",
  "IT",
  "FINANCE",
  "ADMIN",
  "TRANSPORTATION",
  "HR",
  "PRO",
];

export const CLEARANCE_DEPARTMENT_LABELS: Record<ClearanceDepartment, string> = {
  HOD: "H.O.D / Covering Employee",
  IT: "IT Department",
  FINANCE: "Finance & Accounts",
  ADMIN: "Administration",
  TRANSPORTATION: "Transportation",
  HR: "HR Department",
  PRO: "PR Department",
};

export const DEPARTMENT_CHECKLISTS: Record<
  ClearanceDepartment,
  readonly {
    itemKey: string;
    label: string;
    sortOrder: number;
    financial?: {
      defaultType: "DEDUCTION" | "ADDITION";
      category: string;
      allowAddition?: boolean;
    };
  }[]
> = {
  HOD: [
    { itemKey: "FILES_DOCUMENTS", label: "File / Documents", sortOrder: 1 },
    { itemKey: "DRAWER_CABIN_KEYS", label: "Drawer / Cabin Keys", sortOrder: 2 },
  ],
  IT: [
    { itemKey: "SIM", label: "Sim Card", sortOrder: 1 },
    { itemKey: "PHONE", label: "Mobile Phone", sortOrder: 2 },
    { itemKey: "LAPTOP", label: "Laptop / Desktop", sortOrder: 3 },
    { itemKey: "ACCESSORIES", label: "IT Accessories", sortOrder: 4 },
    { itemKey: "EMAIL", label: "Email ID", sortOrder: 5 },
    { itemKey: "PWD_FORWARDING", label: "Pwd Changed / Forwarding", sortOrder: 6 },
    { itemKey: "ERP_ACCESS", label: "ERP Access", sortOrder: 7 },
  ],
  FINANCE: [
    { itemKey: "LOAN", label: "Loan", sortOrder: 1, financial: { defaultType: "DEDUCTION", category: "LOAN_RECOVERY" } },
    { itemKey: "ADVANCE", label: "Advance", sortOrder: 2, financial: { defaultType: "DEDUCTION", category: "SALARY_ADVANCE" } },
    { itemKey: "IOU", label: "IOU", sortOrder: 3, financial: { defaultType: "DEDUCTION", category: "OTHER_DEDUCTION", allowAddition: true } },
  ],
  ADMIN: [],
  TRANSPORTATION: [
    { itemKey: "VEHICLE", label: "Vehicle", sortOrder: 1 },
    { itemKey: "PETROL_CARD", label: "Petrol Card", sortOrder: 2 },
    { itemKey: "REGISTRATION_CARD", label: "Registration Card", sortOrder: 3 },
  ],
  HR: [
    { itemKey: "LABOUR_CARD", label: "Labour Card", sortOrder: 1 },
    { itemKey: "GATE_PASS", label: "Gate Pass", sortOrder: 2 },
    { itemKey: "INSURANCE_CARD", label: "Insurance Card", sortOrder: 3 },
    { itemKey: "PUNCHING_CARD", label: "Punching Card", sortOrder: 4 },
    { itemKey: "HANDOVER_FORM", label: "Handover Form", sortOrder: 5 },
  ],
  PRO: [],
};

export function departmentHasChecklist(department: string) {
  return (DEPARTMENT_CHECKLISTS[department as ClearanceDepartment]?.length ?? 0) > 0;
}

export function checklistItemResolved(status: string) {
  return status === "COMPLETED" || status === "NOT_APPLICABLE";
}

export function getChecklistItemFinancialConfig(itemKey: string) {
  for (const items of Object.values(DEPARTMENT_CHECKLISTS)) {
    const match = items.find((item) => item.itemKey === itemKey);
    if (match?.financial) return match.financial;
  }
  return null;
}

export function isFinancialChecklistItem(itemKey: string) {
  return getChecklistItemFinancialConfig(itemKey) != null;
}
