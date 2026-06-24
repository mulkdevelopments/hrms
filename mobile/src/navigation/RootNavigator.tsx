import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { theme } from "../theme";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
import LeaveScreen from "../screens/LeaveScreen";
import ProfileScreen from "../screens/ProfileScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import EmployeesScreen from "../screens/EmployeesScreen";
import EmployeeDetailScreen from "../screens/EmployeeDetailScreen";
import HrToolsScreen from "../screens/HrToolsScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.bg,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primaryBright,
  },
};

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function makeTabIcon(active: IoniconName, inactive: IoniconName) {
  return ({ focused, size }: { focused: boolean; color: string; size: number }) => (
    <Ionicons
      name={focused ? active : inactive}
      size={size ?? 22}
      color={focused ? theme.colors.primaryBright : theme.colors.textMuted}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarActiveTintColor: theme.colors.primaryBright,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: makeTabIcon("home", "home-outline") }} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ tabBarLabel: "Attendance", tabBarIcon: makeTabIcon("location", "location-outline") }} />
      <Tab.Screen name="Leave" component={LeaveScreen} options={{ tabBarIcon: makeTabIcon("calendar", "calendar-outline") }} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} options={{ tabBarIcon: makeTabIcon("notifications", "notifications-outline") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Me", tabBarIcon: makeTabIcon("person", "person-outline") }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.colors.primaryBright} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="HrTools" component={HrToolsScreen} />
            <Stack.Screen name="Employees" component={EmployeesScreen} />
            <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
