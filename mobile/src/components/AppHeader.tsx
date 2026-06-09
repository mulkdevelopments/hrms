import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../theme";

export function AppHeader({
  title,
  subtitle,
  showBell = true,
  badgeCount = 0,
}: {
  title: string;
  subtitle?: string;
  showBell?: boolean;
  badgeCount?: number;
}) {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.wrap}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {showBell ? (
        <Pressable
          onPress={() => navigation.navigate("Alerts")}
          style={({ pressed }) => [styles.bellBtn, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          {badgeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount > 9 ? "9+" : badgeCount}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  title: { color: theme.colors.white, fontSize: 22, fontWeight: "800" },
  subtitle: { color: theme.colors.textMuted, fontSize: 13, marginTop: 2 },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.coral,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.colors.bg,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
});
