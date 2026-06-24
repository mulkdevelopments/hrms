import React, { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../api/client";
import { AppHeader } from "../components/AppHeader";
import { Input } from "../components/ui";
import { employeeName } from "../lib/format";
import { theme } from "../theme";
import type { EmployeeProfile } from "../types";
import type { RootStackParamList } from "../navigation/types";

export default function EmployeesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const params = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
      const rows = await api<EmployeeProfile[]>(`/employees${params}`);
      setEmployees(Array.isArray(rows) ? rows : []);
    } catch (err) {
      Alert.alert("Failed", err instanceof Error ? err.message : "Could not load employees");
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>Employees</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.searchWrap}>
        <Input value={search} onChangeText={setSearch} placeholder="Search name, code, department…" onSubmitEditing={load} />
      </View>
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const name = employeeName(item.firstName, item.lastName);
          return (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate("EmployeeDetail", { employee: item })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.meta}>{item.employeeCode} · {item.department}</Text>
                <Text style={styles.meta}>{item.designation}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No employees found.</Text>}
      />
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
  title: { color: theme.colors.white, fontSize: 18, fontWeight: "800" },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 10,
  },
  name: { color: theme.colors.text, fontWeight: "700", fontSize: 15 },
  meta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  empty: { color: theme.colors.textMuted, textAlign: "center", marginTop: 24 },
});
