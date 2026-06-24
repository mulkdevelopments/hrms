import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { Button, Card, Input, Label, SectionTitle } from "../../components/ui";
import { LeaveRequestCard } from "../../components/LeaveRequestCard";
import { defaultDateRange } from "../../lib/format";
import { canPickLeaveHistoryEmployee, isHrOrAdmin } from "../../lib/roles";
import { theme } from "../../theme";
import type { EmployeeProfile, LeaveRequest } from "../../types";

export function LeaveHistoryPanel() {
  const { user } = useAuth();
  const defaults = defaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const canPickEmployee = canPickLeaveHistoryEmployee(user?.role);
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  useEffect(() => {
    if (!canPickEmployee) return;
    api<EmployeeProfile[]>("/employees").then((rows) => setEmployees(Array.isArray(rows) ? rows : [])).catch(() => setEmployees([]));
  }, [canPickEmployee]);

  const load = useCallback(async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate) || !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
      Alert.alert("Invalid dates", "Use YYYY-MM-DD format");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ fromDate, toDate });
      if (employeeId) params.set("employeeId", employeeId);
      const rows = await api<LeaveRequest[]>(`/leave/requests?${params.toString()}`);
      let filtered = Array.isArray(rows) ? rows : [];
      if (department) {
        filtered = filtered.filter((r) => r.employee?.department === department);
      }
      setRequests(filtered);
    } catch (err) {
      Alert.alert("Failed", err instanceof Error ? err.message : "Could not load leave history");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, employeeId, department]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const totalDays = requests.reduce((sum, r) => sum + Number(r.days ?? 0), 0);
  const approvedDays = requests.filter((r) => r.status === "APPROVED").reduce((sum, r) => sum + Number(r.days ?? 0), 0);

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Card>
        <SectionTitle>Leave History</SectionTitle>
        <Label>From (YYYY-MM-DD)</Label>
        <Input value={fromDate} onChangeText={setFromDate} autoCapitalize="none" />
        <Label>To (YYYY-MM-DD)</Label>
        <Input value={toDate} onChangeText={setToDate} autoCapitalize="none" />

        {canPickEmployee ? (
          <>
            <Label>Employee</Label>
            <View style={styles.chips}>
              <Pressable onPress={() => setEmployeeId("")} style={[styles.chip, !employeeId && styles.chipActive]}>
                <Text style={[styles.chipText, !employeeId && styles.chipTextActive]}>
                  {isHrOrAdmin(user?.role) ? "All employees" : "My department"}
                </Text>
              </Pressable>
              {employees.map((emp) => (
                <Pressable
                  key={emp.id}
                  onPress={() => setEmployeeId(emp.id)}
                  style={[styles.chip, employeeId === emp.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, employeeId === emp.id && styles.chipTextActive]}>
                    {emp.firstName} {emp.lastName}
                  </Text>
                </Pressable>
              ))}
            </View>

            {isHrOrAdmin(user?.role) && departments.length ? (
              <>
                <Label>Department</Label>
                <View style={styles.chips}>
                  <Pressable onPress={() => setDepartment("")} style={[styles.chip, !department && styles.chipActive]}>
                    <Text style={[styles.chipText, !department && styles.chipTextActive]}>All</Text>
                  </Pressable>
                  {departments.map((dept) => (
                    <Pressable
                      key={dept}
                      onPress={() => setDepartment(dept)}
                      style={[styles.chip, department === dept && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, department === dept && styles.chipTextActive]}>{dept}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : null}

        <Button title="Load History" onPress={load} loading={loading} />
      </Card>

      {requests.length ? (
        <Card>
          <Text style={styles.summary}>
            {requests.length} record{requests.length === 1 ? "" : "s"} · {totalDays} day(s) · {approvedDays} approved
          </Text>
          {requests.map((req) => (
            <LeaveRequestCard
              key={req.id}
              request={req}
              viewerRole={user?.role}
              viewerEmployeeId={user?.employee?.id}
              showEmployee={canPickEmployee}
              showExtended
            />
          ))}
        </Card>
      ) : null}
    </ScrollView>
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
  summary: { color: theme.colors.textMuted, fontSize: 12, marginBottom: 8 },
});
