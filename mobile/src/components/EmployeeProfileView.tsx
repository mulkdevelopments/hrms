import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { fmtDate, fmtMoney, employeeName } from "../lib/format";
import type { EmployeeProfile } from "../types";
import { Card, Row, SectionTitle } from "./ui";

function money(value: number | null | undefined, currency?: string | null) {
  return fmtMoney(value ?? undefined, currency);
}

export function EmployeeProfileView({ employee }: { employee: EmployeeProfile }) {
  const name = employeeName(employee.firstName, employee.lastName);
  const managerName = employee.manager
    ? employeeName(employee.manager.firstName, employee.manager.lastName)
    : "—";

  return (
    <>
      <Card>
        <SectionTitle>Identity</SectionTitle>
        <Row label="Name" value={name} />
        <Row label="Employee Code" value={employee.employeeCode ?? "—"} />
        {employee.legacyEmpId ? <Row label="Legacy ID" value={employee.legacyEmpId} /> : null}
        <Row label="Email" value={employee.loginEmail ?? employee.email ?? "—"} />
        <Row label="Phone" value={employee.phone ?? "—"} />
        <Row label="Nationality" value={employee.nationality ?? "—"} />
        <Row label="Gender" value={employee.gender ?? "—"} />
        <Row label="Marital Status" value={employee.maritalStatus ?? "—"} />
        <Row label="Date of Birth" value={fmtDate(employee.dateOfBirth)} />
        <Row label="Emirates ID" value={employee.emiratesId ?? "—"} />
        <Row label="Passport" value={employee.passportNumber ?? "—"} />
      </Card>

      <Card>
        <SectionTitle>Employment</SectionTitle>
        <Row label="Designation" value={employee.designation ?? "—"} />
        <Row label="Department" value={employee.department ?? "—"} />
        <Row label="Status" value={employee.status ?? "—"} />
        <Row label="Work Mode" value={employee.workMode ?? "—"} />
        <Row label="Employment Type" value={employee.employmentType ?? "—"} />
        <Row label="Date of Joining" value={fmtDate(employee.dateOfJoining)} />
        <Row label="Joining Month" value={employee.joiningMonth ?? "—"} />
        <Row label="Probation Status" value={employee.probationStatus ?? "—"} />
        <Row label="Probation Completion" value={fmtDate(employee.probationCompletionDate)} />
        <Row label="Manager" value={managerName} />
        <Row label="HOD" value={employee.hodName ?? "—"} />
        <Row label="Office" value={employee.office?.name ?? "—"} />
        <Row label="Category" value={employee.category ?? "—"} />
        <Row label="Sub Category" value={employee.subCategory ?? "—"} />
        <Row label="Grade" value={employee.grade ?? "—"} />
        <Row label="Employee Type" value={employee.employeeType ?? "—"} />
        <Row label="Business Unit" value={employee.businessUnit ?? "—"} />
        <Row label="Division" value={employee.division ?? "—"} />
        <Row label="Work Location" value={employee.workLocation ?? "—"} />
        <Row label="Work Country" value={employee.workCountry ?? "—"} />
      </Card>

      <Card>
        <SectionTitle>Payroll & Compensation</SectionTitle>
        <Row label="Payroll Type" value={employee.payrollType ?? "—"} />
        <Row label="Payroll Status" value={employee.payrollStatus ?? "—"} />
        <Row label="Payroll Division" value={employee.payrollDivision ?? "—"} />
        <Row label="Basic Salary" value={money(employee.basicSalary, employee.netPayCurrency)} />
        <Row label="Housing Allowance" value={money(employee.housingAllowance, employee.netPayCurrency)} />
        <Row label="Transport Allowance" value={money(employee.transportAllowance, employee.netPayCurrency)} />
        <Row label="Gross Salary" value={money(employee.grossSalary, employee.netPayCurrency)} />
        <Row label="CTC (Month)" value={money(employee.ctcMonth, employee.netPayCurrency)} />
        <Row label="CTC (Year)" value={money(employee.ctcYear, employee.netPayCurrency)} />
        <Row label="Conveyance" value={money(employee.conveyanceAllowance, employee.netPayCurrency)} />
        <Row label="Fixed OT" value={money(employee.fixedOtAllowance, employee.netPayCurrency)} />
        <Row label="Food" value={money(employee.foodAllowance, employee.netPayCurrency)} />
        <Row label="Other" value={money(employee.otherAllowance, employee.netPayCurrency)} />
        <Row label="Overseas" value={money(employee.overseasAllowance, employee.netPayCurrency)} />
        <Row label="Performance" value={money(employee.performanceAllowance, employee.netPayCurrency)} />
        <Row label="Petrol" value={money(employee.petrolAllowance, employee.netPayCurrency)} />
        <Row label="Risk" value={money(employee.riskAllowance, employee.netPayCurrency)} />
        <Row label="Social Insurance" value={money(employee.socialInsurance, employee.netPayCurrency)} />
        <Row label="Telephone" value={money(employee.telephoneAllowance, employee.netPayCurrency)} />
        <Row label="Vehicle" value={money(employee.vehicleAllowance, employee.netPayCurrency)} />
        <Row label="Kids Education" value={money(employee.kidsEducationAllowance, employee.netPayCurrency)} />
        <Row label="OT Eligible" value={employee.otEligible ?? "—"} />
        <Row label="OT Rule (Normal)" value={employee.otRuleNormal != null ? String(employee.otRuleNormal) : "—"} />
        <Row label="Currency" value={employee.netPayCurrency?.trim() || "—"} />
        <Row label="WPS Enabled" value={employee.wpsEnabled ? "Yes" : "No"} />
        <Row label="Labour Card" value={employee.labourCardNumber ?? "—"} />
        <Row label="Notice Period" value={employee.noticePeriodDays != null ? `${employee.noticePeriodDays} days` : "—"} />
      </Card>

      <Card>
        <SectionTitle>Bank & Visa</SectionTitle>
        <Row label="Bank Name" value={employee.bankName ?? "—"} />
        <Row label="IBAN" value={employee.iban ?? "—"} />
        <Row label="Visa Type" value={employee.visaType ?? "—"} />
        <Row label="Visa Sponsor" value={employee.visaSponsor ?? "—"} />
      </Card>

      {(employee.cancellationType || employee.lastWorkingDate || employee.comments) ? (
        <Card>
          <SectionTitle>Exit & Notes</SectionTitle>
          {employee.cancellationType ? <Row label="Cancellation Type" value={employee.cancellationType} /> : null}
          {employee.lastWorkingDate ? <Row label="Last Working Date" value={fmtDate(employee.lastWorkingDate)} /> : null}
          {employee.comments ? (
            <View style={styles.commentWrap}>
              <Text style={styles.commentLabel}>Comments</Text>
              <Text style={styles.commentText}>{employee.comments}</Text>
            </View>
          ) : null}
        </Card>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  commentWrap: { paddingVertical: 8 },
  commentLabel: { color: "#94a3b8", fontSize: 14, marginBottom: 4 },
  commentText: { color: "#e2e8f0", fontSize: 14, lineHeight: 20 },
});
