import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./ui";
import { theme } from "../theme";

export type FaceCaptureMode = "enroll" | "verify";

const ENROLL_STEPS = ["Front", "Left", "Right"] as const;

interface FaceCameraModalProps {
  visible: boolean;
  mode: FaceCaptureMode;
  onSuccess: (images: string[]) => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

export function FaceCameraModal({ visible, mode, onSuccess, onCancel, onError }: FaceCameraModalProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState(0);
  const [captured, setCaptured] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const steps = mode === "enroll" ? ENROLL_STEPS : (["Front"] as const);
  const currentStep = steps[step] ?? "Front";

  useEffect(() => {
    if (!visible) return;
    setStep(0);
    setCaptured([]);
    setBusy(false);
  }, [visible, mode]);

  useEffect(() => {
    if (!visible || permission?.granted) return;
    requestPermission().catch(() => onError("Camera permission is required for face verification"));
  }, [visible, permission?.granted, requestPermission, onError]);

  const capturePhoto = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.55,
        imageType: "jpg",
        skipProcessing: true,
      });
      if (!photo?.base64) {
        throw new Error("Failed to capture photo");
      }

      const image = `data:image/jpeg;base64,${photo.base64}`;
      if (mode === "verify") {
        onSuccess([image]);
        return;
      }

      const nextCaptured = [...captured, image];
      if (nextCaptured.length >= steps.length) {
        onSuccess(nextCaptured);
        return;
      }

      setCaptured(nextCaptured);
      setStep(nextCaptured.length);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to capture photo");
    } finally {
      setBusy(false);
    }
  };

  const guideText = mode === "enroll"
    ? `Capture ${currentStep} — look ${currentStep === "Front" ? "straight at the camera" : currentStep === "Left" ? "slightly left" : "slightly right"}`
    : "Look straight at the camera and capture";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onCancel}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} hitSlop={12} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>{mode === "enroll" ? "Enroll Face" : "Verify Face"}</Text>
          <View style={{ width: 24 }} />
        </View>

        {!permission?.granted ? (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.colors.primaryBright} size="large" />
            <Text style={styles.hint}>Requesting camera permission…</Text>
          </View>
        ) : (
          <>
            <View style={styles.cameraWrap}>
              <CameraView ref={cameraRef} facing="front" style={styles.camera} mirror />
              <View style={styles.faceGuide} />
            </View>

            <View style={styles.footer}>
              {mode === "enroll" ? (
                <View style={styles.chips}>
                  {steps.map((label, index) => {
                    const done = index < captured.length;
                    const active = index === step;
                    return (
                      <View key={label} style={[styles.chip, done && styles.chipDone, active && styles.chipActive]}>
                        <Text style={styles.chipText}>{done ? `✓ ${label}` : label}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}
              <Text style={styles.guide}>{guideText}</Text>
              <Button
                title={busy ? "Capturing…" : mode === "enroll" ? `Capture ${currentStep}` : "Capture & Verify"}
                loading={busy}
                onPress={capturePhoto}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeBtn: { padding: 4 },
  title: { color: theme.colors.white, fontSize: 18, fontWeight: "800" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  hint: { color: theme.colors.textMuted, fontSize: 14 },
  cameraWrap: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#000",
  },
  camera: { flex: 1 },
  faceGuide: {
    position: "absolute",
    alignSelf: "center",
    top: "18%",
    width: "62%",
    aspectRatio: 0.78,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(34,197,94,0.85)",
    borderStyle: "dashed",
  },
  footer: { padding: 16, gap: 12 },
  guide: { color: theme.colors.textMuted, fontSize: 14, textAlign: "center", lineHeight: 20 },
  chips: { flexDirection: "row", justifyContent: "center", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.15)",
  },
  chipActive: { backgroundColor: "rgba(255,255,255,0.14)" },
  chipDone: { backgroundColor: "rgba(16,185,129,0.18)" },
  chipText: { color: theme.colors.text, fontSize: 12, fontWeight: "700" },
});
