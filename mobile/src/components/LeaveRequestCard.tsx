import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { fmtDate, fmtMoney, formatStatusLabel, leaveStatusTone } from "../lib/format";
import { canViewAirTicketForEmployee } from "../lib/roles";
import type { LeaveRequest } from "../types";
import { Badge } from "./ui";
import { theme } from "../theme";

function formatAirTicket(
  request: LeaveRequest,
  viewerRole: string | undefined,
  viewerEmployeeId: string | undefined,
) {
  const employeeId = request.employeeId ?? request.employee?.id ?? "";
  if (!canViewAirTicketForEmployee(viewerRole, viewerEmployeeId, employeeId)) return null;

  if (request.status === "APPROVED") {
    if (request.airTicketEligible && request.airTicketFare != null) {
      return fmtMoney(request.airTicketFare);
    }
    if (request.airTicketEligible === false) return "Not eligible";
  }

  const preview = request.airTicketPreview;
  if (!preview) return null;
  if (preview.eligible && preview.fare != null) {
    return `${fmtMoney(preview.fare)} · ${preview.country ?? ""}`;
  }
  return preview.reason ?? "Not eligible";
}

export function LeaveRequestCard({
  request,
  viewerRole,
  viewerEmployeeId,
  showEmployee = false,
  showExtended = false,
}: {
  request: LeaveRequest;
  viewerRole?: string;
  viewerEmployeeId?: string;
  showEmployee?: boolean;
  showExtended?: boolean;
}) {
  const airTicket = formatAirTicket(request, viewerRole, viewerEmployeeId);
  const employeeName = request.employee
    ? `${request.employee.firstName ?? ""} ${request.employee.lastName ?? ""}`.trim()
    : "";

  return (
    <View style={styles.item}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.type}>{request.leaveType?.name ?? "Leave"}</Text>
          {showEmployee && employeeName ? (
            <Text style={styles.meta}>{employeeName} · {request.employee?.employeeCode ?? ""}</Text>
          ) : null}
          <Text style={styles.dates}>
            {fmtDate(request.startDate)} → {fmtDate(request.endDate)} · {request.days} day(s)
          </Text>
        </View>
        <Badge text={formatStatusLabel(request.status)} tone={leaveStatusTone(request.status)} />
      </View>

      {showExtended ? (
        <View style={styles.extra}>
          {request.rejoiningDate ? <Text style={styles.line}>Rejoin: {fmtDate(request.rejoiningDate)}</Text> : null}
          {request.statusAsOn ? <Text style={styles.line}>Status as on: {request.statusAsOn}</Text> : null}
          {request.extendedDays != null && request.extendedDays > 0 ? (
            <Text style={styles.line}>Extended: {request.extendedDays} day(s)</Text>
          ) : null}
          {request.leaveBalanceSnapshot != null ? (
            <Text style={styles.line}>Balance at apply: {request.leaveBalanceSnapshot}</Text>
          ) : null}
          {request.currentLeaveBalanceSnapshot != null ? (
            <Text style={styles.line}>Current balance: {request.currentLeaveBalanceSnapshot}</Text>
          ) : null}
          {request.remark ? <Text style={styles.line}>Remark: {request.remark}</Text> : null}
          {request.reason ? <Text style={styles.line}>Reason: {request.reason}</Text> : null}
        </View>
      ) : request.reason ? (
        <Text style={styles.line}>{request.reason}</Text>
      ) : null}

      {airTicket ? <Text style={styles.airTicket}>✈ Air ticket: {airTicket}</Text> : null}

      {request.actingApprover && request.status === "PENDING_ACTING" ? (
        <Text style={styles.line}>
          Acting: {request.actingApprover.firstName} {request.actingApprover.lastName}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  type: { color: theme.colors.text, fontWeight: "700", fontSize: 14 },
  meta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  dates: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  extra: { marginTop: 8, gap: 2 },
  line: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  airTicket: { color: theme.colors.accent, fontSize: 12, marginTop: 6, fontWeight: "600" },
});
