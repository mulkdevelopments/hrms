import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Label } from "../components/ui";
import { theme } from "../theme";
import { API_BASE_URL } from "../api/client";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Text style={styles.logo}>HRMS</Text>
            <Text style={styles.tagline}>Employee Self-Service</Text>
          </View>

          <Label>Email</Label>
          <Input
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@company.com"
          />
          <Label>Password</Label>
          <Input value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ height: 8 }} />
          <Button title="Sign In" onPress={onSubmit} loading={loading} />

          <Text style={styles.api}>API: {API_BASE_URL}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 24, flexGrow: 1, justifyContent: "center" },
  brand: { alignItems: "center", marginBottom: 36 },
  logo: { color: theme.colors.white, fontSize: 38, fontWeight: "800", letterSpacing: 2 },
  tagline: { color: theme.colors.textMuted, marginTop: 6, fontSize: 14 },
  error: { color: theme.colors.coral, marginBottom: 8, fontSize: 13 },
  api: { color: theme.colors.textMuted, fontSize: 11, textAlign: "center", marginTop: 20 },
});
