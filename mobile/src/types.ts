export interface EmployeeProfile {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  loginEmail?: string | null;
  department: string;
  designation: string;
  workMode?: string;
  status?: string;
  phone?: string | null;
  nationality?: string | null;
  dateOfBirth?: string | null;
  dateOfJoining?: string;
  employmentType?: string;
  emiratesId?: string | null;
  passportNumber?: string | null;
  labourCardNumber?: string | null;
  noticePeriodDays?: number;
  basicSalary?: number;
  housingAllowance?: number;
  transportAllowance?: number;
  bankName?: string | null;
  iban?: string | null;
  wpsEnabled?: boolean;
  legacyEmpId?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  category?: string | null;
  subCategory?: string | null;
  grade?: string | null;
  employeeType?: string | null;
  businessUnit?: string | null;
  division?: string | null;
  workLocation?: string | null;
  workCountry?: string | null;
  payrollType?: string | null;
  payrollStatus?: string | null;
  payrollDivision?: string | null;
  conveyanceAllowance?: number;
  fixedOtAllowance?: number;
  foodAllowance?: number;
  otherAllowance?: number;
  overseasAllowance?: number;
  performanceAllowance?: number;
  petrolAllowance?: number;
  riskAllowance?: number;
  socialInsurance?: number;
  telephoneAllowance?: number;
  vehicleAllowance?: number;
  kidsEducationAllowance?: number;
  grossSalary?: number;
  otEligible?: string | null;
  otRuleNormal?: number;
  netPayCurrency?: string | null;
  visaType?: string | null;
  visaSponsor?: string | null;
  hodName?: string | null;
  hodEmail?: string | null;
  comments?: string | null;
  probationStatus?: string | null;
  joiningMonth?: string | null;
  probationCompletionDate?: string | null;
  ctcMonth?: number | null;
  ctcYear?: number | null;
  cancellationType?: string | null;
  lastWorkingDate?: string | null;
  manager?: { id: string; firstName: string; lastName: string; employeeCode?: string } | null;
  office?: { id: string; name: string; radiusMeters: number; latitude: number; longitude: number } | null;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  employee: EmployeeProfile;
}

export interface LateAttendanceSummary {
  monthlyLateCount: number;
  threshold: number;
  warningActive: boolean;
  warningEmailed?: boolean;
  month: number;
  year: number;
}

export interface AttendanceStatus {
  employee?: {
    workMode?: string;
    office?: { name?: string; radiusMeters?: number; latitude?: number; longitude?: number } | null;
    faceAuthEnabled?: boolean;
    faceEnrolled?: boolean;
    faceEnrolledAt?: string | null;
  };
  activeSession?: { isActive?: boolean; checkInAt?: string; isLateCheckIn?: boolean } | null;
  latestPing?: {
    latitude: number;
    longitude: number;
    insideGeofence?: boolean | null;
    geoTag?: string | null;
    geoAddress?: string | null;
    recordedAt?: string;
  } | null;
  lateAttendance?: LateAttendanceSummary | null;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  yearlyAllocation: number;
  paidLeave: boolean;
  balanceMode?: string;
  payRate?: string;
  maxCarryForward?: number;
  requiresAttachment?: boolean;
}

export interface AirTicketPreview {
  eligible?: boolean;
  fare?: number | null;
  country?: string | null;
  roleBand?: string | null;
  reason?: string | null;
}

export interface LeaveRequest {
  id: string;
  employeeId?: string;
  leaveType?: { name?: string; code?: string };
  employee?: {
    id?: string;
    employeeCode?: string;
    firstName?: string;
    lastName?: string;
    department?: string;
  };
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason?: string;
  remark?: string | null;
  rejoiningDate?: string | null;
  statusAsOn?: string | null;
  leaveBalanceSnapshot?: number | null;
  currentLeaveBalanceSnapshot?: number | null;
  extendedDays?: number | null;
  createdAt?: string;
  airTicketEligible?: boolean | null;
  airTicketFare?: number | null;
  airTicketPreview?: AirTicketPreview | null;
  actingApprover?: { firstName?: string; lastName?: string; employeeCode?: string } | null;
  l1ApprovedBy?: { firstName?: string; lastName?: string } | null;
  l2ApprovedBy?: { firstName?: string; lastName?: string } | null;
  lineManager?: { id?: string; name?: string; employeeCode?: string } | null;
  assignedL1Approver?: { id?: string; name?: string; employeeCode?: string; isActing?: boolean } | null;
  canAcceptActing?: boolean;
  canRejectActing?: boolean;
  canApproveL1?: boolean;
}

export interface LeaveMaturity {
  daysWorked: number;
  maturedDays: number;
  usedDays: number;
  availableDays: number;
}

export type EmployeeReportSection = "profile" | "attendance" | "leave" | "payroll" | "exit" | "performance";

export const EMPLOYEE_REPORT_SECTIONS: EmployeeReportSection[] = [
  "profile",
  "attendance",
  "leave",
  "payroll",
  "exit",
  "performance",
];

export const EMPLOYEE_REPORT_SECTION_LABELS: Record<EmployeeReportSection, string> = {
  profile: "Profile",
  attendance: "Attendance",
  leave: "Leave",
  payroll: "Payroll",
  exit: "Exit",
  performance: "Performance",
};
