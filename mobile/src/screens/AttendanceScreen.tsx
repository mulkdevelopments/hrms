import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { api } from "../api/client";
import { AppHeader } from "../components/AppHeader";
import { Badge, Button, Card, SectionTitle } from "../components/ui";
import { theme } from "../theme";
import type { AttendanceStatus } from "../types";

interface Coords { latitude: number; longitude: number; accuracy?: number }

async function getCurrentLocation(): Promise<Coords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("Location permission is required for attendance");
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy ?? undefined };
}

export default function AttendanceScreen() {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus(await api<AttendanceStatus>("/attendance/status"));
    } catch {
      // ignore
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const online = Boolean(status?.activeSession?.isActive);

  const startAttendance = async (action: "check-in" | "check-out") => {
    setBusy(true);
    try {
      const location = action === "check-in" ? await getCurrentLocation() : await getCurrentLocation().catch(() => null);
      await api(`/attendance/${action}`, { method: "POST", body: JSON.stringify(location ?? {}) });
      Alert.alert("Success", action === "check-in" ? "Checked in successfully" : "Checked out successfully");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Attendance failed";
      if (message.toLowerCase().includes("face")) {
        Alert.alert(
          "Face Verification Required",
          "This account has face verification enabled. Face check-in on mobile is coming soon — for now, use the web app or ask HR to adjust the setting.",
        );
      } else {
        Alert.alert("Failed", message);
      }
    } finally {
      setBusy(false);
    }
  };

  const geofenceText =
    status?.latestPing?.insideGeofence === true ? "Inside office geofence"
      : status?.latestPing?.insideGeofence === false ? "Outside office geofence"
        : "Not applicable";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="Attendance" subtitle="Check-in & tracking" badgeCount={online ? 0 : 1} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primaryBright} />}
      >
        <View style={[styles.statusHero, { borderColor: online ? theme.colors.accent : theme.colors.border }]}>
          <View style={[styles.statusIcon, { backgroundColor: online ? "rgba(16,185,129,0.18)" : "rgba(245,158,11,0.18)" }]}>
            <Ionicons name={online ? "checkmark-circle" : "time-outline"} size={30} color={online ? theme.colors.accent : theme.colors.amber} />
          </View>
          <Text style={styles.statusText}>{online ? "You are Checked In" : "You are Offline"}</Text>
          <Badge text={geofenceText} tone={status?.latestPing?.insideGeofence ? "green" : "neutral"} />
        </View>

        <Card>
          <SectionTitle>Details</SectionTitle>
          <Line icon="briefcase-outline" label="Work Mode" value={status?.employee?.workMode ?? "—"} />
          <Line icon="business-outline" label="Office" value={status?.employee?.office?.name ?? "Not assigned"} />
          <Line
            icon="navigate-outline"
            label="Last Location"
            value={status?.latestPing ? `${Number(status.latestPing.latitude).toFixed(4)}, ${Number(status.latestPing.longitude).toFixed(4)}` : "No ping"}
          />
        </Card>

        {online ? (
          <Button title="Check Out" variant="secondary" loading={busy} onPress={() => startAttendance("check-out")} />
        ) : (
          <Button title="Check In" loading={busy} onPress={() => startAttendance("check-in")} />
        )}

        <Text style={styles.note}>
          Office employees can check in only within the assigned office geofence and during the allowed window. Native face
          verification will be added in a later update.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Line({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.line}>
      <Ionicons name={icon} size={16} color={theme.colors.textMuted} style={{ width: 24 }} />
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 16, paddingTop: 4 },
  statusHero: {
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: 22,
    marginBottom: 14,
  },
  statusIcon: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  statusText: { color: theme.colors.white, fontSize: 18, fontWeight: "800" },
  line: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
  lineLabel: { color: theme.colors.textMuted, fontSize: 14, flex: 1 },
  lineValue: { color: theme.colors.text, fontSize: 14, fontWeight: "600", flexShrink: 1, textAlign: "right" },
  note: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 14 },
});
