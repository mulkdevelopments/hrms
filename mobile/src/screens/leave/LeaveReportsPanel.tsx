import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { api, apiDownload } from "../../api/client";
import { Button, Card, Input, Label, SectionTitle } from "../../components/ui";
import { defaultDateRange } from "../../lib/format";
import { canPickLeaveHistoryEmployee, isHrOrAdmin } from "../../lib/roles";
import { theme } from "../../theme";
import type { EmployeeProfile } from "../../types";

export function LeaveReportsPanel() {
  const { user } = useAuth();
  const defaults = defaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [busy, setBusy] = useState<"xlsx" | "pdf" | null>(null);

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
    api<EmployeeProfile[]>("/employees")
      .then((rows) => setEmployees(Array.isArray(rows) ? rows : []))
      .catch(() => setEmployees([]));
  }, [canPickEmployee]);

  const download = async (format: "xlsx" | "pdf") => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate) || !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
      Alert.alert("Invalid dates", "Use YYYY-MM-DD format");
      return;
    }
    setBusy(format);
    try {
      const params = new URLSearchParams({ from: fromDate, to: toDate });
      if (employeeId) params.set("employeeId", employeeId);
      if (department) params.set("department", department);
      const fileName = await apiDownload(`/reports/leave/${format}?${params.toString()}`, `leave-report.${format}`);
      Alert.alert("Downloaded", fileName);
    } catch (err) {
      Alert.alert("Failed", err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView>
      <Card>
        <SectionTitle>Leave Reports</SectionTitle>
        <Text style={styles.hint}>Export leave records for the selected date range as Excel or PDF.</Text>
        <Label>From (YYYY-MM-DD)</Label>
        <Input value={fromDate} onChangeText={setFromDate} autoCapitalize="none" />
        <Label>To (YYYY-MM-DD)</Label>
        <Input value={toDate} onChangeText={setToDate} autoCapitalize="none" />

        {canPickEmployee ? (
          <>
            <Label>Employee (optional)</Label>
            <View style={styles.chips}>
              <Pressable onPress={() => setEmployeeId("")} style={[styles.chip, !employeeId && styles.chipActive]}>
                <Text style={[styles.chipText, !employeeId && styles.chipTextActive]}>All</Text>
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
                <Label>Department (optional)</Label>
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

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Button title="Export Excel" onPress={() => download("xlsx")} loading={busy === "xlsx"} disabled={busy !== null && busy !== "xlsx"} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Export PDF" variant="secondary" onPress={() => download("pdf")} loading={busy === "pdf"} disabled={busy !== null && busy !== "pdf"} />
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hint: { color: theme.colors.textMuted, fontSize: 12, marginBottom: 12 },
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
  row: { flexDirection: "row", gap: 10, marginTop: 4 },
});
