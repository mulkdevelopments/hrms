import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { Button, Card, Input, Label, Row, SectionTitle } from "../../components/ui";
import { canViewAirTicketForEmployee, canVoidActingColleague } from "../../lib/roles";
import { daysBetween } from "../../lib/format";
import { theme } from "../../theme";
import type { LeaveMaturity, LeaveType } from "../../types";

const ACTING_VOID_VALUE = "__VOID__";

interface ActingCandidate {
  id: string;
  name: string;
  employeeCode?: string;
}

interface AirTicketPreview {
  eligible?: boolean;
  fare?: number | null;
  country?: string | null;
  roleBand?: string | null;
  reason?: string | null;
}

export function LeaveApplyPanel({ onSubmitted }: { onSubmitted: () => void }) {
  const { user } = useAuth();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [maturity, setMaturity] = useState<LeaveMaturity | null>(null);
  const [actingCandidates, setActingCandidates] = useState<ActingCandidate[]>([]);
  const [busy, setBusy] = useState(false);
  const [typeId, setTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [actingSelection, setActingSelection] = useState("");
  const [airTicketPreview, setAirTicketPreview] = useState<AirTicketPreview | null>(null);

  const load = useCallback(async () => {
    if (!user?.employee?.id) return;
    const [t, m, candidates] = await Promise.all([
      api<LeaveType[]>("/leave/types").catch(() => []),
      api<LeaveMaturity>(`/leave/maturity/${user.employee.id}`).catch(() => null),
      api<ActingCandidate[]>(`/leave/acting-candidates/${user.employee.id}`).catch(() => []),
    ]);
    setTypes(Array.isArray(t) ? t : []);
    setMaturity(m);
    setActingCandidates(Array.isArray(candidates) ? candidates : []);
    if (!typeId && Array.isArray(t) && t.length) setTypeId(t[0].id);
  }, [user?.employee?.id, typeId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedDays = daysBetween(startDate, endDate);
  const available = maturity?.availableDays ?? 0;
  const overBalance = selectedDays > 0 && selectedDays > available;

  useEffect(() => {
    if (!user?.employee?.id || !typeId || selectedDays <= 0) {
      setAirTicketPreview(null);
      return;
    }
    if (!canViewAirTicketForEmployee(user.role, user.employee.id, user.employee.id)) {
      setAirTicketPreview(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const preview = await api<AirTicketPreview>(
          `/leave/air-ticket-preview?employeeId=${encodeURIComponent(user.employee.id)}&leaveTypeId=${encodeURIComponent(typeId)}&days=${encodeURIComponent(String(selectedDays))}`,
        );
        if (!cancelled) setAirTicketPreview(preview);
      } catch {
        if (!cancelled) setAirTicketPreview(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.employee?.id, user?.role, typeId, selectedDays]);

  const onApply = async () => {
    if (!user?.employee?.id) return;
    if (!typeId || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      Alert.alert("Missing info", "Pick a leave type and enter valid dates (YYYY-MM-DD)");
      return;
    }
    if (selectedDays <= 0) {
      Alert.alert("Invalid dates", "End date must be on or after the start date");
      return;
    }
    if (overBalance) {
      Alert.alert("Insufficient balance", `Available matured leave is ${available.toFixed(2)} day(s)`);
      return;
    }
    const actingVoid = actingSelection === ACTING_VOID_VALUE;
    if (!actingSelection) {
      Alert.alert("Acting colleague required", "Select a department colleague to cover your duties, or Void if you are Labour/Staff.");
      return;
    }
    if (actingVoid && !canVoidActingColleague(user.role)) {
      Alert.alert("Not allowed", "Only Labour and Staff can skip acting colleague assignment");
      return;
    }
    setBusy(true);
    try {
      await api("/leave/requests", {
        method: "POST",
        body: JSON.stringify({
          employeeId: user.employee.id,
          leaveTypeId: typeId,
          startDate: new Date(`${startDate}T00:00:00`).toISOString(),
          endDate: new Date(`${endDate}T00:00:00`).toISOString(),
          days: selectedDays,
          reason,
          actingVoid: actingVoid || undefined,
          actingApproverId: actingVoid ? undefined : actingSelection,
        }),
      });
      Alert.alert("Submitted", actingVoid ? "Leave submitted — awaiting line manager approval" : "Leave submitted — awaiting acting colleague acceptance");
      setStartDate("");
      setEndDate("");
      setReason("");
      setActingSelection("");
      onSubmitted();
      await load();
    } catch (err) {
      Alert.alert("Failed", err instanceof Error ? err.message : "Could not submit leave");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card>
        <SectionTitle>Leave Balance</SectionTitle>
        <Row label="Available" value={`${available.toFixed(2)} days`} />
        <Row label="Earned" value={`${(maturity?.maturedDays ?? 0).toFixed(2)} days`} />
        <Row label="Used" value={`${(maturity?.usedDays ?? 0).toFixed(2)} days`} />
      </Card>

      <Card>
        <SectionTitle>Apply for Leave</SectionTitle>
        <Label>Leave Type</Label>
        <View style={styles.chips}>
          {types.map((t) => (
            <Pressable key={t.id} onPress={() => setTypeId(t.id)} style={[styles.chip, typeId === t.id && styles.chipActive]}>
              <Text style={[styles.chipText, typeId === t.id && styles.chipTextActive]}>{t.name}</Text>
            </Pressable>
          ))}
        </View>
        <Label>From Date (YYYY-MM-DD)</Label>
        <Input value={startDate} onChangeText={setStartDate} placeholder="2026-06-10" autoCapitalize="none" />
        <Label>To Date (YYYY-MM-DD)</Label>
        <Input value={endDate} onChangeText={setEndDate} placeholder="2026-06-12" autoCapitalize="none" />
        <Label>Reason (optional)</Label>
        <Input value={reason} onChangeText={setReason} placeholder="Reason for leave" multiline />

        <Label>Acting Colleague *</Label>
        <View style={styles.chips}>
          {canVoidActingColleague(user?.role) ? (
            <Pressable
              onPress={() => setActingSelection(ACTING_VOID_VALUE)}
              style={[styles.chip, actingSelection === ACTING_VOID_VALUE && styles.chipActive]}
            >
              <Text style={[styles.chipText, actingSelection === ACTING_VOID_VALUE && styles.chipTextActive]}>Void</Text>
            </Pressable>
          ) : null}
          {actingCandidates.map((candidate) => (
            <Pressable
              key={candidate.id}
              onPress={() => setActingSelection(candidate.id)}
              style={[styles.chip, actingSelection === candidate.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, actingSelection === candidate.id && styles.chipTextActive]}>{candidate.name}</Text>
            </Pressable>
          ))}
        </View>

        {selectedDays > 0 ? (
          <Text style={[styles.daysNote, overBalance && { color: theme.colors.coral }]}>
            Selected: {selectedDays} day(s)
            {overBalance ? " — exceeds available balance" : ` · Remaining: ${(available - selectedDays).toFixed(2)}`}
          </Text>
        ) : null}

        {airTicketPreview ? (
          <Text style={styles.airTicket}>
            {airTicketPreview.eligible && airTicketPreview.fare != null
              ? `✈ Estimated air ticket on approval: AED ${Number(airTicketPreview.fare).toLocaleString()}`
              : airTicketPreview.reason ?? "Air ticket not applicable for this leave"}
          </Text>
        ) : null}

        <View style={{ height: 8 }} />
        <Button title="Submit Request" onPress={onApply} loading={busy} disabled={overBalance} />
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { borderColor: theme.colors.primaryBright, backgroundColor: "rgba(255,255,255,0.12)" },
  chipText: { color: theme.colors.textMuted, fontSize: 13 },
  chipTextActive: { color: theme.colors.primaryBright, fontWeight: "700" },
  daysNote: { color: theme.colors.textMuted, fontSize: 12, marginBottom: 4 },
  airTicket: { color: theme.colors.accent, fontSize: 12, marginBottom: 8, fontWeight: "600" },
});
