import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { apiDownload } from "../api/client";
import { EmployeeProfileView } from "../components/EmployeeProfileView";
import { Button, Input, Label, SectionTitle } from "../components/ui";
import { defaultDateRange, employeeName } from "../lib/format";
import { theme } from "../theme";
import {
  EMPLOYEE_REPORT_SECTIONS,
  EMPLOYEE_REPORT_SECTION_LABELS,
  type EmployeeReportSection,
} from "../types";
import type { RootStackParamList } from "../navigation/types";

export default function EmployeeDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "EmployeeDetail">>();
  const employee = route.params.employee;
  const defaults = defaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [sections, setSections] = useState<EmployeeReportSection[]>([...EMPLOYEE_REPORT_SECTIONS]);
  const [busy, setBusy] = useState(false);

  const name = employeeName(employee.firstName, employee.lastName);

  const toggleSection = (section: EmployeeReportSection) => {
    setSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  };

  const downloadPdf = async () => {
    if (!sections.length) {
      Alert.alert("Select sections", "Choose at least one report section");
      return;
    }
    setBusy(true);
    try {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        sections: sections.join(","),
      });
      const fileName = await apiDownload(
        `/reports/employee/${employee.id}/pdf?${params.toString()}`,
        `employee-${employee.employeeCode}.pdf`,
      );
      Alert.alert("Downloaded", fileName);
    } catch (err) {
      Alert.alert("Failed", err instanceof Error ? err.message : "Could not generate report");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>{name}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <EmployeeProfileView employee={employee} />

        <View style={styles.reportCard}>
          <SectionTitle>Employee PDF Report</SectionTitle>
          <Label>From (YYYY-MM-DD)</Label>
          <Input value={fromDate} onChangeText={setFromDate} autoCapitalize="none" />
          <Label>To (YYYY-MM-DD)</Label>
          <Input value={toDate} onChangeText={setToDate} autoCapitalize="none" />
          <Label>Sections</Label>
          <View style={styles.chips}>
            {EMPLOYEE_REPORT_SECTIONS.map((section) => {
              const selected = sections.includes(section);
              return (
                <Pressable
                  key={section}
                  onPress={() => toggleSection(section)}
                  style={[styles.chip, selected && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {EMPLOYEE_REPORT_SECTION_LABELS[section]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Button title="Download PDF Report" onPress={downloadPdf} loading={busy} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: { color: theme.colors.white, fontSize: 18, fontWeight: "800", flex: 1, textAlign: "center" },
  container: { padding: 16, paddingTop: 0 },
  reportCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 24,
  },
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
});
