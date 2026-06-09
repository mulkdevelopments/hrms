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
  basicSalary?: number;
  bankName?: string | null;
  iban?: string | null;
  office?: { id: string; name: string; radiusMeters: number; latitude: number; longitude: number } | null;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  employee: EmployeeProfile;
}

export interface AttendanceStatus {
  employee?: {
    workMode?: string;
    office?: { name?: string; radiusMeters?: number; latitude?: number; longitude?: number } | null;
  };
  activeSession?: { isActive?: boolean; checkInAt?: string } | null;
  latestPing?: { latitude: number; longitude: number; insideGeofence?: boolean | null; recordedAt?: string } | null;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  yearlyAllocation: number;
  paidLeave: boolean;
}

export interface LeaveRequest {
  id: string;
  leaveType?: { name?: string };
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason?: string;
}

export interface LeaveMaturity {
  daysWorked: number;
  maturedDays: number;
  usedDays: number;
  availableDays: number;
}
