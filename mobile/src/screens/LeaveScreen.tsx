import React, { useCallback, useState } from "react";
import { Alert, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { AppHeader } from "../components/AppHeader";
import { Badge, Button, Card, Input, Label, Row, SectionTitle } from "../components/ui";
import { theme } from "../theme";
import type { LeaveMaturity, LeaveRequest, LeaveType } from "../types";

function leaveStatusTone(status: string): "green" | "amber" | "coral" | "neutral" {
  if (status === "APPROVED") return "green";
  if (status === "REJECTED") return "coral";
  if (status.startsWith("PENDING")) return "amber";
  return "neutral";
}

function fmt(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function daysBetween(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 0;
  return Math.round((e.getTime() - s.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

export default function LeaveScreen() {
  const { user } = useAuth();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [maturity, setMaturity] = useState<LeaveMaturity | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  // form state
  const [typeId, setTypeId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    if (!user?.employee?.id) return;
    try {
      const [t, r, m] = await Promise.all([
        api<LeaveType[]>("/leave/types").catch(() => []),
        api<LeaveRequest[]>("/leave/requests?mine=true").catch(() => []),
        api<LeaveMaturity>(`/leave/maturity/${user.employee.id}`).catch(() => null),
      ]);
      setTypes(Array.isArray(t) ? t : []);
      setRequests(Array.isArray(r) ? r : []);
      setMaturity(m);
      if (!typeId && Array.isArray(t) && t.length) setTypeId(t[0].id);
    } catch {
      // ignore
    }
  }, [user?.employee?.id, typeId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const selectedDays = daysBetween(startDate, endDate);
  const available = maturity?.availableDays ?? 0;
  const overBalance = selectedDays > 0 && selectedDays > available;

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
        }),
      });
      Alert.alert("Submitted", "Leave request submitted");
      setStartDate("");
      setEndDate("");
      setReason("");
      await load();
    } catch (err) {
      Alert.alert("Failed", err instanceof Error ? err.message : "Could not submit leave");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="Leave" subtitle="Balance & requests" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primaryBright} />}
      >
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
              <Pressable
                key={t.id}
                onPress={() => setTypeId(t.id)}
                style={[styles.chip, typeId === t.id && styles.chipActive]}
              >
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

          {selectedDays > 0 ? (
            <Text style={[styles.daysNote, overBalance && { color: theme.colors.coral }]}>
              Selected: {selectedDays} day(s){overBalance ? " — exceeds available balance" : ` · Remaining: ${(available - selectedDays).toFixed(2)}`}
            </Text>
          ) : null}

          <View style={{ height: 8 }} />
          <Button title="Submit Request" onPress={onApply} loading={busy} disabled={overBalance} />
        </Card>

        <Card>
          <SectionTitle>My Leaves</SectionTitle>
          {requests.length === 0 ? (
            <Text style={styles.empty}>No leave requests yet.</Text>
          ) : (
            requests.map((req) => (
              <View key={req.id} style={styles.leaveItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leaveType}>{req.leaveType?.name ?? "Leave"}</Text>
                  <Text style={styles.leaveDates}>
                    {fmt(req.startDate)} → {fmt(req.endDate)} · {req.days} day(s)
                  </Text>
                </View>
                <Badge text={req.status.replace(/_/g, " ")} tone={leaveStatusTone(req.status)} />
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 16, paddingTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { borderColor: theme.colors.primaryBright, backgroundColor: "rgba(59,130,246,0.18)" },
  chipText: { color: theme.colors.textMuted, fontSize: 13 },
  chipTextActive: { color: theme.colors.primaryBright, fontWeight: "700" },
  daysNote: { color: theme.colors.textMuted, fontSize: 12, marginBottom: 4 },
  empty: { color: theme.colors.textMuted, fontSize: 13 },
  leaveItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  leaveType: { color: theme.colors.text, fontWeight: "600", fontSize: 14 },
  leaveDates: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
});
