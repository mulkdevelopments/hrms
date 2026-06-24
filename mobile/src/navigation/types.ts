import type { EmployeeProfile } from "../types";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Employees: undefined;
  EmployeeDetail: { employee: EmployeeProfile };
  HrTools: undefined;
};
