import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { Button, Input, Label } from "../components/ui";
import { theme } from "../theme";
import { resolveApiBaseUrl } from "../lib/api-config";

type Step = "email" | "password" | "setup" | "reset";
type AccountStatus = "password_required" | "setup_required" | "not_found" | "disabled";

export default function LoginScreen() {
  const { signIn, completePasswordReset } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setMessage(null);
  };

  const continueWithEmail = async () => {
    if (!email.trim()) {
      setError("Enter your email address");
      return;
    }
    resetMessages();
    setLoading(true);
    try {
      const status = await api<{ status: AccountStatus }>("/auth/account-status", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      if (status.status === "not_found") {
        setError("No account found for this email.");
        return;
      }
      if (status.status === "disabled") {
        setError("This account is disabled. Contact HR.");
        return;
      }
      if (status.status === "setup_required") {
        setStep("setup");
        setMessage("No password is set yet. We'll email you a verification code to create one.");
        return;
      }
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to check account");
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (targetStep: "setup" | "reset") => {
    resetMessages();
    setLoading(true);
    try {
      const result = await api<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setStep(targetStep);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async () => {
    if (!password) {
      setError("Enter your password");
      return;
    }
    resetMessages();
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg.toLowerCase().includes("password setup")) {
        setStep("setup");
        setMessage("Create a password using the verification code sent to your email.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit verification code from your email");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    resetMessages();
    setLoading(true);
    try {
      await completePasswordReset(email.trim(), code.trim(), newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password");
    } finally {
      setLoading(false);
    }
  };

  const goBackToEmail = () => {
    resetMessages();
    setStep("email");
    setPassword("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Image source={require("../../assets/logo-light.png")} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.tagline}>Employee Self-Service</Text>
          </View>

          {step === "email" ? (
            <>
              <Label>Email</Label>
              <Input
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@company.com"
              />
              <View style={{ height: 12 }} />
              <Button title="Continue" onPress={continueWithEmail} loading={loading} />
            </>
          ) : null}

          {step === "password" ? (
            <>
              <Text style={styles.stepHint}>Signing in as {email}</Text>
              <Label>Password</Label>
              <Input value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
              <Pressable onPress={() => sendVerificationCode("reset")} style={styles.linkWrap}>
                <Text style={styles.link}>Forgot password?</Text>
              </Pressable>
              <View style={{ height: 8 }} />
              <Button title="Sign In" onPress={submitPassword} loading={loading} />
              <Pressable onPress={goBackToEmail} style={styles.linkWrap}>
                <Text style={styles.linkMuted}>Use a different email</Text>
              </Pressable>
            </>
          ) : null}

          {step === "setup" || step === "reset" ? (
            <>
              <Text style={styles.stepHint}>
                {step === "setup" ? "Create password for" : "Reset password for"} {email}
              </Text>
              {step === "setup" ? (
                <Button title="Send Verification Code" variant="secondary" loading={loading} onPress={() => sendVerificationCode("setup")} />
              ) : null}
              <Label>Verification Code</Label>
              <Input value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="6-digit code" maxLength={6} />
              <Label>New Password</Label>
              <Input value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Minimum 8 characters" />
              <Label>Confirm Password</Label>
              <Input value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Re-enter password" />
              <View style={{ height: 8 }} />
              <Button
                title={step === "setup" ? "Create Password & Sign In" : "Reset Password & Sign In"}
                onPress={submitNewPassword}
                loading={loading}
              />
              {step === "reset" ? (
                <Pressable onPress={() => sendVerificationCode("reset")} style={styles.linkWrap}>
                  <Text style={styles.link}>Resend code</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={goBackToEmail} style={styles.linkWrap}>
                <Text style={styles.linkMuted}>Back to email</Text>
              </Pressable>
            </>
          ) : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.api}>API: {resolveApiBaseUrl()} (local)</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 24, flexGrow: 1, justifyContent: "center" },
  brand: { alignItems: "center", marginBottom: 36 },
  logoImage: { width: 220, height: 72, marginBottom: 8 },
  tagline: { color: theme.colors.textMuted, marginTop: 6, fontSize: 14 },
  stepHint: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 14, textAlign: "center" },
  linkWrap: { alignSelf: "flex-end", marginTop: 8, marginBottom: 4 },
  link: { color: theme.colors.primaryBright, fontSize: 13, fontWeight: "700" },
  linkMuted: { color: theme.colors.textMuted, fontSize: 13, textAlign: "center" },
  message: { color: theme.colors.accent, marginTop: 12, fontSize: 13, lineHeight: 18 },
  error: { color: theme.colors.coral, marginTop: 12, fontSize: 13 },
  api: { color: theme.colors.textMuted, fontSize: 11, textAlign: "center", marginTop: 20 },
});
