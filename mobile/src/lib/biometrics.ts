import * as LocalAuthentication from "expo-local-authentication";

export type BiometricKind = "fingerprint" | "facial" | "iris" | "passcode";

export interface BiometricStatus {
  /** Device has fingerprint / Face ID hardware. */
  available: boolean;
  /** User has fingerprint or Face ID enrolled. */
  enrolled: boolean;
  /** Device has a lock screen (PIN, pattern, password, or biometrics). */
  deviceLockEnabled: boolean;
  kind: BiometricKind;
  label: string;
}

function resolveKind(types: LocalAuthentication.AuthenticationType[]): BiometricKind {
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return "fingerprint";
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return "facial";
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return "iris";
  return "passcode";
}

function labelForKind(kind: BiometricKind): string {
  switch (kind) {
    case "fingerprint":
      return "Fingerprint";
    case "facial":
      return "Face ID";
    case "iris":
      return "Iris scan";
    default:
      return "Device passcode";
  }
}

export async function getBiometricStatus(): Promise<BiometricStatus> {
  const [hasHardware, biometricEnrolled, types, level] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
    LocalAuthentication.getEnrolledLevelAsync(),
  ]);

  const deviceLockEnabled = level !== LocalAuthentication.SecurityLevel.NONE;
  const usesBiometric = biometricEnrolled && hasHardware;
  const kind = usesBiometric ? resolveKind(types) : "passcode";

  return {
    available: hasHardware,
    enrolled: biometricEnrolled,
    deviceLockEnabled,
    kind,
    label: usesBiometric ? labelForKind(kind) : "Device passcode",
  };
}

/** Prompts for fingerprint / Face ID, or device passcode when biometrics are not set up. */
export async function requireBiometricAuth(purpose: string): Promise<void> {
  const [level, biometricEnrolled] = await Promise.all([
    LocalAuthentication.getEnrolledLevelAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);

  if (level === LocalAuthentication.SecurityLevel.NONE) {
    throw new Error("Set up a device passcode, PIN, or fingerprint in your phone settings to check in securely.");
  }

  const passcodeOnly = !biometricEnrolled;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: purpose,
    promptSubtitle: passcodeOnly ? "Enter your lock screen passcode" : undefined,
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
    fallbackLabel: "Use passcode",
  });

  if (result.success) return;

  if (result.error === "user_cancel" || result.error === "system_cancel" || result.error === "app_cancel") {
    throw new Error("Authentication cancelled");
  }

  if (result.error === "passcode_not_set") {
    throw new Error("Set up a device passcode in your phone settings to check in securely.");
  }

  throw new Error("Authentication failed. Try again.");
}
