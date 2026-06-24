import React, { useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { api } from "../api/client";
import { AppHeader } from "../components/AppHeader";
import { Badge, Button, Card, SectionTitle } from "../components/ui";
import { fetchFaceStatus, resolveFaceVerificationToken, type FaceStatus } from "../lib/face-auth";
import { useFaceCapture } from "../hooks/useFaceCapture";
import { getBiometricStatus, requireBiometricAuth, type BiometricStatus } from "../lib/biometrics";
import { theme } from "../theme";
import type { AttendanceStatus } from "../types";

interface Coords { latitude: number; longitude: number; accuracy?: number; geoTag?: string; geoAddress?: string }

async function getCurrentLocationWithGeoTag(): Promise<Coords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("Location permission is required for attendance");
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  const base = {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracy: pos.coords.accuracy ?? undefined,
  };
  try {
    const places = await Location.reverseGeocodeAsync({ latitude: base.latitude, longitude: base.longitude });
    const place = places[0];
    if (place) {
      const geoTag = place.city || place.district || place.subregion || place.region || place.name || undefined;
      const geoAddress = [place.name, place.street, place.city, place.region, place.country].filter(Boolean).join(", ") || undefined;
      return { ...base, geoTag, geoAddress };
    }
  } catch {
    // Server will reverse-geocode if client tag is missing.
  }
  return base;
}

export default function AttendanceScreen() {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [faceStatus, setFaceStatus] = useState<FaceStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [biometric, setBiometric] = useState<BiometricStatus | null>(null);
  const { requestEnroll, requestVerify, modal: faceModal } = useFaceCapture();

  useEffect(() => {
    getBiometricStatus().then(setBiometric).catch(() => setBiometric(null));
  }, []);

  const load = useCallback(async () => {
    try {
      const [attendance, face] = await Promise.all([
        api<AttendanceStatus>("/attendance/status"),
        fetchFaceStatus().catch(() => null),
      ]);
      setStatus(attendance);
      setFaceStatus(face);
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
  const faceEnabled = Boolean(faceStatus?.enabled ?? status?.employee?.faceAuthEnabled);
  const faceEnrolled = Boolean(faceStatus?.enrolled ?? status?.employee?.faceEnrolled);

  const enrollFace = async () => {
    setBusy(true);
    try {
      await requestEnroll();
      Alert.alert("Success", "Face enrolled successfully");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Face enrollment failed";
      if (message !== "Face capture cancelled") Alert.alert("Failed", message);
    } finally {
      setBusy(false);
    }
  };

  const startAttendance = async (action: "check-in" | "check-out") => {
    setBusy(true);
    try {
      if (action === "check-in") {
        await requireBiometricAuth("Verify your identity to check in");
      }

      let faceVerificationToken: string | undefined;
      if (faceEnabled) {
        faceVerificationToken = await resolveFaceVerificationToken(requestEnroll, requestVerify);
      }

      const location = action === "check-in"
        ? await getCurrentLocationWithGeoTag()
        : await getCurrentLocationWithGeoTag().catch(() => null);

      const result = await api<{ message?: string; lateCheckIn?: boolean; lateAttendance?: { monthlyLateCount?: number } }>(
        `/attendance/${action}`,
        {
          method: "POST",
          body: JSON.stringify({ ...(location ?? {}), faceVerificationToken }),
        },
      );
      if (action === "check-in" && result?.lateCheckIn) {
        Alert.alert(
          "Checked in (late)",
          result.message ?? `Late check-in recorded (${result.lateAttendance?.monthlyLateCount ?? 1} this month).`,
        );
      } else {
        Alert.alert("Success", result?.message ?? (action === "check-in" ? "Checked in successfully" : "Checked out successfully"));
      }
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Attendance failed";
      if (message === "Authentication cancelled" || message === "Face capture cancelled") return;
      Alert.alert("Failed", message);
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
      {faceModal}
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

        {status?.lateAttendance?.warningActive ? (
          <View style={styles.lateWarning}>
            <Ionicons name="alarm-outline" size={18} color={theme.colors.coral} />
            <Text style={styles.lateWarningText}>
              Late check-in warning: {status.lateAttendance.monthlyLateCount} late check-in(s) this month (limit: {status.lateAttendance.threshold}).
            </Text>
          </View>
        ) : status?.lateAttendance?.monthlyLateCount ? (
          <View style={[styles.lateWarning, { borderColor: theme.colors.amber, backgroundColor: "rgba(245,158,11,0.12)" }]}>
            <Ionicons name="time-outline" size={18} color={theme.colors.amber} />
            <Text style={styles.lateWarningText}>
              {status.lateAttendance.monthlyLateCount} late check-in(s) this month.
            </Text>
          </View>
        ) : null}

        {faceEnabled ? (
          <Card>
            <SectionTitle>Face Recognition</SectionTitle>
            <View style={styles.faceRow}>
              <Ionicons name="scan-outline" size={18} color={theme.colors.primaryBright} />
              <Text style={styles.faceLabel}>Status</Text>
              <Badge text={faceEnrolled ? "Enrolled" : "Not enrolled"} tone={faceEnrolled ? "green" : "amber"} />
            </View>
            <Text style={styles.faceNote}>
              {faceEnrolled
                ? "Face verification runs automatically when you check in or out."
                : "Enroll your face once, then verify on each check-in/out."}
            </Text>
            <Button
              title={faceEnrolled ? "Update Face Enrollment" : "Enroll Face"}
              variant="secondary"
              loading={busy}
              onPress={enrollFace}
            />
          </Card>
        ) : null}

        <Card>
          <SectionTitle>Details</SectionTitle>
          <Line icon="briefcase-outline" label="Work Mode" value={status?.employee?.workMode ?? "—"} />
          <Line icon="business-outline" label="Office" value={status?.employee?.office?.name ?? "Not assigned"} />
          <Line icon="pin-outline" label="Geo Tag" value={status?.latestPing?.geoTag ?? "—"} />
          <Line
            icon="navigate-outline"
            label="Last Location"
            value={status?.latestPing?.geoTag
              ? `${status.latestPing.geoTag} (${Number(status.latestPing.latitude).toFixed(4)}, ${Number(status.latestPing.longitude).toFixed(4)})`
              : status?.latestPing
                ? `${Number(status.latestPing.latitude).toFixed(4)}, ${Number(status.latestPing.longitude).toFixed(4)}`
                : "No ping"}
          />
        </Card>

        {online ? (
          <Button title="Check Out" variant="secondary" loading={busy} onPress={() => startAttendance("check-out")} />
        ) : (
          <View style={styles.checkInBlock}>
            {biometric?.deviceLockEnabled ? (
              <View style={styles.biometricHint}>
                <Ionicons
                  name={
                    biometric.enrolled && biometric.kind === "facial"
                      ? "scan-outline"
                      : biometric.enrolled
                        ? "finger-print-outline"
                        : "lock-closed-outline"
                  }
                  size={18}
                  color={theme.colors.primaryBright}
                />
                <Text style={styles.biometricHintText}>
                  {biometric.enrolled
                    ? `${biometric.label} required to check in`
                    : "Device passcode required to check in"}
                </Text>
              </View>
            ) : null}
            {faceEnabled ? (
              <View style={styles.biometricHint}>
                <Ionicons name="scan-outline" size={18} color={theme.colors.primaryBright} />
                <Text style={styles.biometricHintText}>Face verification required for attendance</Text>
              </View>
            ) : null}
            <Button title="Check In" loading={busy} onPress={() => startAttendance("check-in")} />
          </View>
        )}

        <Text style={styles.note}>
          Check-in is allowed after the configured start time. Late check-ins after the end time are recorded and tracked monthly.
          {faceEnabled ? " Face verification uses the native camera; photos are verified on the server." : ""}
          {biometric?.deviceLockEnabled
            ? biometric.enrolled
              ? ` Check-in also uses ${biometric.label.toLowerCase()}, or your lock screen passcode.`
              : " Check-in also uses your lock screen passcode."
            : ""}
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
  lateWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(244,81,30,0.12)",
    borderColor: theme.colors.coral,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 14,
  },
  lateWarningText: { flex: 1, color: theme.colors.text, fontSize: 13, lineHeight: 18 },
  faceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  faceLabel: { color: theme.colors.textMuted, fontSize: 14, flex: 1 },
  faceNote: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  line: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
  lineLabel: { color: theme.colors.textMuted, fontSize: 14, flex: 1 },
  lineValue: { color: theme.colors.text, fontSize: 14, fontWeight: "600", flexShrink: 1, textAlign: "right" },
  checkInBlock: { gap: 10 },
  biometricHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 4,
  },
  biometricHintText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: "600" },
  note: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 14 },
});
