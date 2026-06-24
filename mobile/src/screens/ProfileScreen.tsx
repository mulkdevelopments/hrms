import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { AppHeader } from "../components/AppHeader";
import { EmployeeProfileView } from "../components/EmployeeProfileView";
import { Button } from "../components/ui";
import { canAccessHrTools } from "../lib/roles";
import { employeeName } from "../lib/format";
import { theme } from "../theme";
import type { RootStackParamList } from "../navigation/types";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const emp = user?.employee;
  const name = employeeName(emp?.firstName, emp?.lastName);
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

        {emp ? <EmployeeProfileView employee={emp} /> : null}

        {canAccessHrTools(user?.role) ? (
          <Button title="HR Tools" variant="accent" onPress={() => navigation.navigate("HrTools")} />
        ) : null}

        <View style={{ height: 10 }} />
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
