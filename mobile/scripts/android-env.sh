#!/usr/bin/env bash
# Source or run: exports ANDROID_HOME when the SDK exists.

SDK="${ANDROID_HOME:-$HOME/Library/Android/sdk}"

if [[ -d "$SDK/platform-tools" ]]; then
  export ANDROID_HOME="$SDK"
  export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin"
  return 0 2>/dev/null || exit 0
fi

echo "Android SDK not found at: $SDK"
echo ""
echo "Finish Android Studio setup:"
echo "  1. Open Android Studio (Applications)"
echo "  2. Complete the setup wizard (Standard install → downloads SDK)"
echo "  3. More Actions → SDK Manager → ensure installed:"
echo "       • Android SDK Platform (API 34 or 35)"
echo "       • Android SDK Platform-Tools"
echo "       • Android Emulator"
echo "  4. More Actions → Virtual Device Manager → Create Device (e.g. Pixel 8)"
echo "  5. Run this again: npm run android"
echo ""
return 1 2>/dev/null || exit 1
