import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../components/AppHeader";
import { SegmentTabs } from "../components/SegmentTabs";
import { canExportLeaveReports } from "../lib/roles";
import { theme } from "../theme";
import { useAuth } from "../context/AuthContext";
import { LeaveApplyPanel } from "./leave/LeaveApplyPanel";
import { LeaveHistoryPanel } from "./leave/LeaveHistoryPanel";
import { LeaveMyPanel } from "./leave/LeaveMyPanel";
import { LeavePendingPanel } from "./leave/LeavePendingPanel";
import { LeaveReportsPanel } from "./leave/LeaveReportsPanel";

type LeaveTab = "apply" | "my" | "history" | "pending" | "reports";

export default function LeaveScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<LeaveTab>("apply");
  const [applyKey, setApplyKey] = useState(0);

  const tabs = useMemo(() => {
    const items: { id: LeaveTab; label: string }[] = [
      { id: "apply", label: "Apply" },
      { id: "my", label: "My Leaves" },
      { id: "history", label: "History" },
      { id: "pending", label: "Approvals" },
    ];
    if (canExportLeaveReports(user?.role)) {
      items.push({ id: "reports", label: "Reports" });
    }
    return items;
  }, [user?.role]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="Leave" subtitle="Apply, track & approve" />
      <SegmentTabs tabs={tabs} active={tab} onChange={setTab} />
      <View style={styles.panel}>
        {tab === "apply" ? (
          <ScrollView contentContainerStyle={styles.container}>
            <LeaveApplyPanel key={applyKey} onSubmitted={() => setApplyKey((k) => k + 1)} />
          </ScrollView>
        ) : null}
        {tab === "my" ? <LeaveMyPanel /> : null}
        {tab === "history" ? <LeaveHistoryPanel /> : null}
        {tab === "pending" ? <LeavePendingPanel /> : null}
        {tab === "reports" ? <LeaveReportsPanel /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  panel: { flex: 1 },
  container: { padding: 16, paddingTop: 4 },
});
