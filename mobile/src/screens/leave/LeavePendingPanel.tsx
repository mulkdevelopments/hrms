import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { Button, Card, Input, Label, SectionTitle } from "../../components/ui";
import { LeaveRequestCard } from "../../components/LeaveRequestCard";
import { employeeName } from "../../lib/format";
import { isHrOrAdmin } from "../../lib/roles";
import type { LeaveRequest } from "../../types";

const PENDING = new Set(["PENDING_ACTING", "PENDING_L1", "PENDING_L2"]);

export function LeavePendingPanel() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    const rows = await api<LeaveRequest[]>("/leave/requests").catch(() => []);
    const pending = (Array.isArray(rows) ? rows : []).filter((r) => PENDING.has(r.status));
    setRequests(pending);
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

  const runAction = async (id: string, path: string, success: string) => {
    setBusyId(id);
    try {
      await api(path, { method: "POST", body: JSON.stringify({}) });
      Alert.alert("Done", success);
      await load();
    } catch (err) {
      Alert.alert("Failed", err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const onReject = async (id: string) => {
    setBusyId(id);
    try {
      await api(`/leave/requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason.trim() || "Rejected" }),
      });
      setRejectId(null);
      setRejectReason("");
      Alert.alert("Rejected", "Leave request rejected");
      await load();
    } catch (err) {
      Alert.alert("Failed", err instanceof Error ? err.message : "Could not reject");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Card>
        <SectionTitle>Pending Approvals</SectionTitle>
        {requests.length === 0 ? (
          <Text style={styles.empty}>No pending leave requests.</Text>
        ) : (
          requests.map((req) => {
            const name = req.employee ? employeeName(req.employee.firstName, req.employee.lastName) : "Employee";
            const busy = busyId === req.id;
            return (
              <View key={req.id} style={styles.block}>
                <LeaveRequestCard
                  request={req}
                  viewerRole={user?.role}
                  viewerEmployeeId={user?.employee?.id}
                  showEmployee
                  showExtended
                />
                <Text style={styles.applicant}>{name} · {req.employee?.employeeCode ?? ""}</Text>

                {req.canAcceptActing ? (
                  <View style={styles.actions}>
                    <Button
                      title="Accept Acting"
                      loading={busy}
                      onPress={() => runAction(req.id, `/leave/requests/${req.id}/acting-accept`, "Acting assignment accepted")}
                    />
                    {rejectId === req.id ? (
                      <>
                        <Label>Reject reason</Label>
                        <Input value={rejectReason} onChangeText={setRejectReason} placeholder="Reason" />
                        <Button title="Confirm Reject" variant="danger" loading={busy} onPress={() => onReject(req.id)} />
                      </>
                    ) : (
                      <Button title="Reject Acting" variant="danger" onPress={() => setRejectId(req.id)} />
                    )}
                  </View>
                ) : null}

                {req.canApproveL1 ? (
                  <View style={styles.actions}>
                    <Button
                      title="Approve L1"
                      loading={busy}
                      onPress={() => runAction(req.id, `/leave/requests/${req.id}/l1-approve`, "Approved at L1")}
                    />
                    {rejectId === req.id ? (
                      <>
                        <Label>Reject reason</Label>
                        <Input value={rejectReason} onChangeText={setRejectReason} placeholder="Reason" />
                        <Button title="Confirm Reject" variant="danger" loading={busy} onPress={() => onReject(req.id)} />
                      </>
                    ) : (
                      <Button title="Reject" variant="danger" onPress={() => setRejectId(req.id)} />
                    )}
                  </View>
                ) : null}

                {req.status === "PENDING_L2" && isHrOrAdmin(user?.role) ? (
                  <View style={styles.actions}>
                    <Button
                      title="Approve L2 (HR)"
                      loading={busy}
                      onPress={() => runAction(req.id, `/leave/requests/${req.id}/l2-approve`, "Leave approved")}
                    />
                    {rejectId === req.id ? (
                      <>
                        <Label>Reject reason</Label>
                        <Input value={rejectReason} onChangeText={setRejectReason} placeholder="Reason" />
                        <Button title="Confirm Reject" variant="danger" loading={busy} onPress={() => onReject(req.id)} />
                      </>
                    ) : (
                      <Button title="Reject" variant="danger" onPress={() => setRejectId(req.id)} />
                    )}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { color: "#94a3b8", fontSize: 13 },
  block: { marginBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#334155", paddingBottom: 12 },
  applicant: { color: "#94a3b8", fontSize: 12, marginBottom: 8 },
  actions: { gap: 8, marginTop: 4 },
});
