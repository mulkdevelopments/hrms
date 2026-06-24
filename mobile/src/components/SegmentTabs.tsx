import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { theme } from "../theme";

export function SegmentTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[styles.tab, selected && styles.tabActive]}
          >
            <Text style={[styles.tabText, selected && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  tab: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  tabActive: {
    borderColor: theme.colors.primaryBright,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  tabText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: theme.colors.primaryBright, fontWeight: "700" },
});
