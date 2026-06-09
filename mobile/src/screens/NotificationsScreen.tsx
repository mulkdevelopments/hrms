import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { AppHeader } from "../components/AppHeader";
import { Card } from "../components/ui";
import { theme } from "../theme";
import type { AttendanceStatus, LeaveRequest } from "../types";

interface NotificationItem {
  title: string;
  desc: string;
  tone: "green" | "amber" | "coral" | "blue";
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const next: NotificationItem[] = [];
    next.push({ title: "Signed in", desc: `Welcome back, ${user?.employee?.firstName ?? "Employee"}`, tone: "green" });

    try {
      const att = await api<AttendanceStatus>("/attendance/status").catch(() => null);
      if (att?.activeSession?.isActive) {
        next.push({ title: "You are checked in", desc: "Your attendance session is active.", tone: "blue" });
      } else {
        next.push({ title: "Not checked in", desc: "Check in from the Attendance tab.", tone: "amber" });
      }
    } catch {
      // ignore
    }

    try {
      const reqs = await api<LeaveRequest[]>("/leave/requests?mine=true").catch(() => []);
      const pending = (reqs ?? []).filter((r) => r.status.startsWith("PENDING"));
      if (pending.length) {
        next.push({ title: `${pending.length} leave request(s) pending`, desc: "Awaiting approval.", tone: "amber" });
      }
    } catch {
      // ignore
    }

    if (!user?.employee?.bankName || !user?.employee?.iban) {
      next.push({ title: "Bank profile incomplete", desc: "Add IBAN and bank name for payroll.", tone: "coral" });
    }

    setItems(next);
  }, [user?.employee]);

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

  const dot = (tone: string) =>
    tone === "green" ? theme.colors.accent : tone === "coral" ? theme.colors.coral : tone === "blue" ? theme.colors.primaryBright : theme.colors.amber;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="Notifications" subtitle="Your alerts" showBell={false} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primaryBright} />}
      >
        {items.map((item, idx) => (
          <Card key={idx}>
            <View style={styles.itemRow}>
              <View style={[styles.dot, { backgroundColor: dot(item.tone) }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc}>{item.desc}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 16 },
  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  title: { color: theme.colors.text, fontWeight: "700", fontSize: 14 },
  desc: { color: theme.colors.textMuted, fontSize: 13, marginTop: 3 },
});
