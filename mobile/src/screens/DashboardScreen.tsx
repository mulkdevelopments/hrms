import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { AppHeader } from "../components/AppHeader";
import { Badge, Card, SectionTitle } from "../components/ui";
import { theme } from "../theme";
import type { AttendanceStatus, LeaveMaturity } from "../types";

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [maturity, setMaturity] = useState<LeaveMaturity | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.employee?.id) return;
    const [att, mat] = await Promise.all([
      api<AttendanceStatus>("/attendance/status").catch(() => null),
      api<LeaveMaturity>(`/leave/maturity/${user.employee.id}`).catch(() => null),
    ]);
    setStatus(att);
    setMaturity(mat);
  }, [user?.employee?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const online = Boolean(status?.activeSession?.isActive);
  const name = `${user?.employee?.firstName ?? ""} ${user?.employee?.lastName ?? ""}`.trim();
  const initials =
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "--";

  const stat = (icon: keyof typeof Ionicons.glyphMap, label: string, value: string, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="Dashboard" subtitle="Overview" badgeCount={online ? 0 : 1} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primaryBright} />}
      >
        <View style={styles.hero}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Welcome back</Text>
            <Text style={styles.name}>{name || "Employee"}</Text>
            <Text style={styles.role}>{user?.employee?.designation} · {user?.employee?.department}</Text>
          </View>
          <Badge text={online ? "Checked In" : "Offline"} tone={online ? "green" : "amber"} />
        </View>

        <View style={styles.statsRow}>
          {stat("walk-outline", "Days Worked", String(maturity?.daysWorked ?? 0), theme.colors.primaryBright)}
          {stat("sunny-outline", "Leave Avail.", `${(maturity?.availableDays ?? 0).toFixed(1)}`, theme.colors.accent)}
          {stat("time-outline", "Leave Used", `${(maturity?.usedDays ?? 0).toFixed(1)}`, theme.colors.amber)}
        </View>

        <Card>
          <View style={styles.cardHead}>
            <Ionicons name="location-outline" size={18} color={theme.colors.primaryBright} />
            <SectionTitle>Attendance</SectionTitle>
          </View>
          <DetailLine icon="briefcase-outline" label="Work Mode" value={status?.employee?.workMode ?? "—"} />
          <DetailLine icon="business-outline" label="Office" value={status?.employee?.office?.name ?? "Not assigned"} />
          <DetailLine
            icon="navigate-outline"
            label="Last Location"
            value={
              status?.latestPing
                ? `${Number(status.latestPing.latitude).toFixed(4)}, ${Number(status.latestPing.longitude).toFixed(4)}`
                : "No ping"
            }
          />
        </Card>

        <Card>
          <View style={styles.cardHead}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.accent} />
            <SectionTitle>Leave Snapshot</SectionTitle>
          </View>
          <DetailLine icon="leaf-outline" label="Earned (matured)" value={`${(maturity?.maturedDays ?? 0).toFixed(2)} days`} />
          <DetailLine icon="checkmark-done-outline" label="Available" value={`${(maturity?.availableDays ?? 0).toFixed(2)} days`} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailLine({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={16} color={theme.colors.textMuted} style={{ width: 24 }} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 16, paddingTop: 4 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 14,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  hello: { color: theme.colors.textMuted, fontSize: 12 },
  name: { color: theme.colors.white, fontSize: 18, fontWeight: "800" },
  role: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    alignItems: "flex-start",
  },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { color: theme.colors.white, fontSize: 18, fontWeight: "800" },
  statLabel: { color: theme.colors.textMuted, fontSize: 11, marginTop: 2 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  detail: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
  detailLabel: { color: theme.colors.textMuted, fontSize: 14, flex: 1 },
  detailValue: { color: theme.colors.text, fontSize: 14, fontWeight: "600", flexShrink: 1, textAlign: "right" },
});
