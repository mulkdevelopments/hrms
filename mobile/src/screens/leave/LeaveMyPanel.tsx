import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { Card, SectionTitle } from "../../components/ui";
import { LeaveRequestCard } from "../../components/LeaveRequestCard";
import type { LeaveRequest } from "../../types";

export function LeaveMyPanel() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const rows = await api<LeaveRequest[]>("/leave/requests?mine=true").catch(() => []);
    setRequests(Array.isArray(rows) ? rows : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Card>
        <SectionTitle>My Leaves</SectionTitle>
        {requests.length === 0 ? (
          <Text style={styles.empty}>No leave requests yet.</Text>
        ) : (
          requests.map((req) => (
            <LeaveRequestCard
              key={req.id}
              request={req}
              viewerRole={user?.role}
              viewerEmployeeId={user?.employee?.id}
              showExtended
            />
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { color: "#94a3b8", fontSize: 13 },
});
