import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { AppHeader } from "../components/AppHeader";
import { Button, Card, Row, SectionTitle } from "../components/ui";
import { theme } from "../theme";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const emp = user?.employee;
  const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "--";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="My Profile" subtitle="Account & details" showBell={false} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{name || "Employee"}</Text>
          <Text style={styles.sub}>{emp?.designation} · {emp?.department}</Text>
          <Text style={styles.role}>{user?.role}</Text>
        </View>

        <Card>
          <SectionTitle>Employee Details</SectionTitle>
          <Row label="Employee ID" value={emp?.employeeCode ?? "—"} />
          <Row label="Email" value={emp?.loginEmail ?? emp?.email ?? "—"} />
          <Row label="Phone" value={emp?.phone ?? "—"} />
          <Row label="Nationality" value={emp?.nationality ?? "—"} />
          <Row label="Work Mode" value={emp?.workMode ?? "—"} />
          <Row label="Status" value={emp?.status ?? "—"} />
        </Card>

        <Card>
          <SectionTitle>Bank & Payroll</SectionTitle>
          <Row label="Bank Name" value={emp?.bankName ?? "Not set"} />
          <Row label="IBAN" value={emp?.iban ?? "Not set"} />
        </Card>

        <Button title="Sign Out" variant="danger" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 16 },
  header: { alignItems: "center", marginVertical: 16 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "800" },
  name: { color: theme.colors.white, fontSize: 22, fontWeight: "800" },
  sub: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  role: { color: theme.colors.primaryBright, fontSize: 12, marginTop: 6, fontWeight: "700" },
});
