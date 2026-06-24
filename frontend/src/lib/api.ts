import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export type UserRole =
  | "SUPER_ADMIN"
  | "CEO"
  | "HR"
  | "HR_OFFICER"
  | "PRO"
  | "MANAGER"
  | "EMPLOYEE"
  | "LABOUR"
  | "STAFF";

export type Employee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  department: string;
  status: string;
  manager?: {
    employeeCode: string;
    firstName: string;
    lastName: string;
  } | null;
};

export type LeaveType = {
  id: string;
  name: string;
  code: string;
  yearlyAllocation: number;
  maxCarryForward: number;
  paidLeave?: boolean;
  balanceMode?: string;
  payRate?: string;
  requiresAttachment?: boolean;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  reason: string;
  days: number;
  status: string;
  startDate: string;
  endDate: string;
  employee?: Employee;
  leaveType?: LeaveType;
};

export type DashboardOverview = {
  headcount: number;
  onLeave: number;
  pendingLeaveApprovals: number;
  monthlyPayroll: number;
  employeesByDept: Array<{ department: string; count: number }>;
};
