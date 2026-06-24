import { Platform } from "react-native";

/** Change to true only for production/EAS builds. */
export const USE_PRODUCTION_API = false;

const PRODUCTION_API = "https://api.mulkinternational.co/api";
const LOCAL_PORT = 4000;

export function resolveApiBaseUrl(): string {
  if (USE_PRODUCTION_API) {
    return PRODUCTION_API;
  }

  if (Platform.OS === "android") {
    // adb reverse tcp:4000 tcp:4000 (set in scripts/run-android.sh)
    return `http://127.0.0.1:${LOCAL_PORT}/api`;
  }

  if (Platform.OS === "ios") {
    return `http://localhost:${LOCAL_PORT}/api`;
  }

  return `http://localhost:${LOCAL_PORT}/api`;
}

export function isLocalApi(): boolean {
  return !USE_PRODUCTION_API;
}
