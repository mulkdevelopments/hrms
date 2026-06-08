const DAY_MS = 24 * 60 * 60 * 1000;
const LEAVE_YEARLY_PAID = 30;
const LEAVE_MATURITY_DAILY = LEAVE_YEARLY_PAID / 365;
const LEAVE_MATURITY_MAX_CAP = 60;

export interface SettlementInput {
  dateOfJoining: Date;
  lastWorkingDate: Date;
  basicSalary: number;
  housingAllowance?: number;
  transportAllowance?: number;
  exitType: "RESIGNATION" | "TERMINATION";
  usedPaidLeaveDays?: number;
  unpaidSalaryDays?: number;
  noticeShortfallDays?: number;
  extraDeductions?: number;
  otherAdditions?: number;
}

export interface SettlementResult {
  yearsOfService: number;
  monthlyGross: number;
  dailyBasic: number;
  unpaidSalary: number;
  leaveEncashment: number;
  leaveBalanceDays: number;
  gratuity: number;
  otherAdditions: number;
  deductions: number;
  noticeShortfall: number;
  netSettlement: number;
  breakdown: Record<string, number>;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * UAE End of Service Benefit (EOSB) gratuity per Federal Decree-Law No. 33 of 2021.
 * - Less than 1 year: no gratuity.
 * - 21 days basic pay for each of the first 5 years.
 * - 30 days basic pay for each year beyond 5 years.
 * - Total capped at 2 years' total (gross) salary.
 * - Resignation reductions historically applied under the old law are no longer
 *   mandated by the 2021 unlimited-contract regime, so we pay full accrual for
 *   both resignation and termination, then apply the 2-year cap.
 */
export function computeGratuity(input: {
  yearsOfService: number;
  basicSalary: number;
  monthlyGross: number;
}) {
  const { yearsOfService, basicSalary, monthlyGross } = input;
  if (yearsOfService < 1) {
    return 0;
  }
  const dailyBasic = basicSalary / 30;
  const firstPeriodYears = Math.min(yearsOfService, 5);
  const beyondYears = Math.max(0, yearsOfService - 5);
  const firstPeriodDays = firstPeriodYears * 21;
  const beyondDays = beyondYears * 30;
  const gratuity = (firstPeriodDays + beyondDays) * dailyBasic;
  const cap = monthlyGross * 24; // 2 years total salary
  return round2(Math.min(gratuity, cap));
}

export function computeSettlement(input: SettlementInput): SettlementResult {
  const basicSalary = Number(input.basicSalary || 0);
  const housing = Number(input.housingAllowance || 0);
  const transport = Number(input.transportAllowance || 0);
  const monthlyGross = basicSalary + housing + transport;
  const dailyBasic = basicSalary / 30;
  const dailyGross = monthlyGross / 30;

  const joinTime = input.dateOfJoining.getTime();
  const lwdTime = input.lastWorkingDate.getTime();
  const totalDaysWorked = Math.max(0, Math.floor((lwdTime - joinTime) / DAY_MS) + 1);
  const yearsOfService = round2(totalDaysWorked / 365);

  // Matured (earned) paid leave to date, capped at 60, minus already used.
  const maturedLeave = Math.min(LEAVE_MATURITY_MAX_CAP, Math.floor(totalDaysWorked * LEAVE_MATURITY_DAILY));
  const usedPaidLeave = Number(input.usedPaidLeaveDays || 0);
  const leaveBalanceDays = Math.max(0, maturedLeave - usedPaidLeave);
  const leaveEncashment = round2(leaveBalanceDays * dailyGross);

  const unpaidSalaryDays = Number(input.unpaidSalaryDays || 0);
  const unpaidSalary = round2(unpaidSalaryDays * dailyGross);

  const gratuity = computeGratuity({ yearsOfService, basicSalary, monthlyGross });

  const noticeShortfallDays = Number(input.noticeShortfallDays || 0);
  const noticeShortfall = round2(noticeShortfallDays * dailyGross);

  const extraDeductions = Number(input.extraDeductions || 0);
  const otherAdditions = Number(input.otherAdditions || 0);
  const deductions = round2(extraDeductions + noticeShortfall);

  const netSettlement = round2(
    unpaidSalary + leaveEncashment + gratuity + otherAdditions - deductions,
  );

  return {
    yearsOfService,
    monthlyGross: round2(monthlyGross),
    dailyBasic: round2(dailyBasic),
    unpaidSalary,
    leaveEncashment,
    leaveBalanceDays,
    gratuity,
    otherAdditions: round2(otherAdditions),
    deductions,
    noticeShortfall,
    netSettlement,
    breakdown: {
      totalDaysWorked,
      yearsOfService,
      monthlyGross: round2(monthlyGross),
      maturedLeaveDays: maturedLeave,
      usedPaidLeaveDays: usedPaidLeave,
      leaveBalanceDays,
      leaveEncashment,
      unpaidSalary,
      gratuity,
      otherAdditions: round2(otherAdditions),
      noticeShortfall,
      extraDeductions: round2(extraDeductions),
      deductions,
      netSettlement,
    },
  };
}

export function computeNoticeShortfall(requestedLwd: Date, resignationDate: Date, noticePeriodDays: number) {
  const servedDays = Math.max(0, Math.floor((requestedLwd.getTime() - resignationDate.getTime()) / DAY_MS));
  return Math.max(0, noticePeriodDays - servedDays);
}
