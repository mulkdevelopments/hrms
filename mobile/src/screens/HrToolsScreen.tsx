import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Ionicons } from "@expo/vector-icons";
import { apiImportExcel } from "../api/client";
import { Button, Card, SectionTitle } from "../components/ui";
import { theme } from "../theme";
import type { RootStackParamList } from "../navigation/types";

async function readFileBase64(uri: string) {
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

export default function HrToolsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [busy, setBusy] = useState<"employees" | "leave" | null>(null);

  const pickAndImport = async (kind: "employees" | "leave") => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const dataBase64 = await readFileBase64(asset.uri);
      setBusy(kind);
      const path = kind === "employees" ? "/import/employees" : "/import/leave";
      const response = await apiImportExcel(path, asset.name, dataBase64, kind === "employees" ? { includeSeparated: false } : undefined);
      const summary = response as { message?: string; created?: number; updated?: number; skipped?: number };
      Alert.alert(
        "Import complete",
        [
          summary.message,
          summary.created != null ? `Created: ${summary.created}` : null,
          summary.updated != null ? `Updated: ${summary.updated}` : null,
          summary.skipped != null ? `Skipped: ${summary.skipped}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    } catch (err) {
      Alert.alert("Import failed", err instanceof Error ? err.message : "Could not import file");
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>HR Tools</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <SectionTitle>Employees</SectionTitle>
          <Text style={styles.hint}>Browse employee profiles and download PDF reports.</Text>
          <Button title="View Employees" onPress={() => navigation.navigate("Employees")} />
        </Card>

        <Card>
          <SectionTitle>Excel Import</SectionTitle>
          <Text style={styles.hint}>Import master employee data or leave records from .xlsx files. Re-import updates existing records.</Text>
          <View style={styles.gap}>
            <Button title="Import Employees (master.xlsx)" loading={busy === "employees"} disabled={busy !== null && busy !== "employees"} onPress={() => pickAndImport("employees")} />
            <Button title="Import Leave Records" variant="secondary" loading={busy === "leave"} disabled={busy !== null && busy !== "leave"} onPress={() => pickAndImport("leave")} />
          </View>
        </Card>
      </ScrollView>
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
  container: { padding: 16 },
  hint: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 12, lineHeight: 18 },
  gap: { gap: 10 },
});
