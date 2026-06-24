#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

MODE="${1:-lan}"

detect_ip() {
  ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true
}

if [[ "$MODE" == "usb" ]]; then
  if ! command -v adb >/dev/null 2>&1; then
    echo "adb not found. Install Android platform-tools, enable USB debugging, then retry."
    exit 1
  fi
  adb reverse tcp:8081 tcp:8081
  echo ""
  echo "USB bridge ready."
  echo "In Expo Go, connect to: exp://127.0.0.1:8081"
  echo "(Or scan QR after Metro starts — it should show localhost)"
  echo ""
  exec npx expo start --localhost --clear
fi

if [[ "$MODE" == "tunnel" ]]; then
  if [[ -z "${NGROK_AUTHTOKEN:-}" ]]; then
    echo "Tunnel often fails without a free ngrok token."
    echo "1. Create account at https://ngrok.com"
    echo "2. Run: export NGROK_AUTHTOKEN=your_token"
    echo "3. Retry: npm run start:tunnel"
    echo ""
  fi
  exec npx expo start --tunnel --clear
fi

HOST="${REACT_NATIVE_PACKAGER_HOSTNAME:-$(detect_ip)}"
if [[ -n "$HOST" ]]; then
  export REACT_NATIVE_PACKAGER_HOSTNAME="$HOST"
  echo "LAN packager: $HOST"
  echo "Expo Go URL:  exp://$HOST:8081"
  echo ""
  echo "If the phone still fails:"
  echo "  • Same Wi‑Fi as this Mac (not guest network), VPN off"
  echo "  • macOS Firewall: allow Node / Terminal incoming connections"
  echo "  • USB Android: npm run start:usb"
  echo "  • Browser test: npm run web"
  echo ""
fi

exec npx expo start --lan --clear
