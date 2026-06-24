#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# shellcheck source=android-env.sh
source scripts/android-env.sh

AVDS=$(emulator -list-avds 2>/dev/null || true)
if [[ -z "$AVDS" ]]; then
  if [[ ! -d "$ANDROID_HOME/system-images" ]]; then
    echo "No emulator system image installed."
    echo "Android Studio → SDK Manager → SDK Platforms → Android 16 →"
    echo "  check 'Google APIs ARM 64 v8a System Image' → Apply"
  fi
  echo "No Android Virtual Device (AVD) found."
  echo "Android Studio → Device Manager → Create Device (e.g. Pixel 8) → Finish"
  exit 1
fi

FIRST_AVD=$(echo "$AVDS" | head -1)
RUNNING=$(adb devices 2>/dev/null | grep -cE "emulator-|device$" || true)

if [[ "$RUNNING" -eq 0 ]]; then
  echo "No emulator running — starting: $FIRST_AVD"
  nohup emulator -avd "$FIRST_AVD" -no-snapshot-load >/tmp/hrms-emulator.log 2>&1 &
  echo "Waiting for emulator (this can take 1–2 minutes)..."
  adb wait-for-device
  until adb shell getprop sys.boot_completed 2>/dev/null | grep -q 1; do
    sleep 2
  done
  # Package manager needs a moment after boot before installs/launches work.
  sleep 5
  echo "Emulator ready."
fi

adb reverse tcp:8081 tcp:8081 2>/dev/null || true
adb reverse tcp:4000 tcp:4000 2>/dev/null || true

install_expo_go() {
  echo "Installing Expo Go 54.0.8 for SDK 54..."
  APK="/tmp/expo-go.apk"
  URL=$(curl -sf "https://exp.host/--/api/v2/versions" | python3 -c "import sys,json; print(json.load(sys.stdin)['sdkVersions']['54.0.0']['androidClientUrl'])" 2>/dev/null || true)
  if [[ -z "$URL" ]]; then
    URL="https://github.com/expo/expo-go-releases/releases/download/Expo-Go-54.0.8/Expo-Go-54.0.8.apk"
  fi
  curl -sfL "$URL" -o "$APK" || { echo "Download failed: $URL"; exit 1; }
  adb install -r "$APK" || { echo "Install failed — open Play Store on the emulator and install Expo Go 54.x manually."; exit 1; }
  adb shell pm enable host.exp.exponent >/dev/null 2>&1 || true
  sleep 2
  echo "Expo Go installed."
}

expo_go_installed() {
  adb shell pm path host.exp.exponent 2>/dev/null | grep -q "base.apk"
}

expo_go_launchable() {
  adb shell monkey -p host.exp.exponent -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
}

NEED_INSTALL=0
if ! expo_go_installed; then
  NEED_INSTALL=1
elif ! expo_go_launchable; then
  echo "Expo Go is installed but not launchable — reinstalling..."
  NEED_INSTALL=1
else
  INSTALLED=$(adb shell dumpsys package host.exp.exponent 2>/dev/null | grep versionName | head -1 | tr -d ' ' || true)
  if [[ "$INSTALLED" != *"54."* ]]; then
    echo "Updating Expo Go to SDK 54..."
    NEED_INSTALL=1
  fi
fi

if [[ "$NEED_INSTALL" == "1" ]]; then
  install_expo_go
  if ! expo_go_launchable; then
    echo "Expo Go still cannot launch. Open Play Store on the emulator and install Expo Go 54.x."
    exit 1
  fi
fi

rm -rf .expo 2>/dev/null || true
exec npx expo start --android --localhost --clear
